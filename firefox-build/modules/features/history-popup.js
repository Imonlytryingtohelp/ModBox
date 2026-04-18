// ════════════════════════════════════════════════════════════════════════════════════════════════
// Inline History Popup Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Displays user history with submission/comment statistics in a floating popup.
// Dependencies: constants.js, utilities.js, services/reddit-api.js

function formatInlineHistoryAccountAge(createdUtc) {
  const createdMs = Number.parseFloat(String(createdUtc || "0")) * 1000;
  if (!Number.isFinite(createdMs) || createdMs <= 0) {
    return "unknown";
  }
  const diffMs = Math.max(0, Date.now() - createdMs);
  const dayMs = 24 * 60 * 60 * 1000;
  const year = Math.floor(diffMs / (365 * dayMs));
  const month = Math.floor((diffMs % (365 * dayMs)) / (30 * dayMs));
  const day = Math.floor((diffMs % (30 * dayMs)) / dayMs);
  const parts = [];
  if (year > 0) {
    parts.push(`${year}y`);
  }
  if (month > 0) {
    parts.push(`${month}mo`);
  }
  if (day > 0 || parts.length === 0) {
    parts.push(`${day}d`);
  }
  return parts.join(" ");
}

function asHistoryPercent(ratio) {
  if (!Number.isFinite(ratio) || ratio <= 0) {
    return "0%";
  }
  return `${Math.round(ratio * 100)}%`;
}

function getHistoryRatioClass(ratio, rawCount) {
  if (!Number.isFinite(ratio) || !Number.isFinite(rawCount)) {
    return "";
  }
  if (ratio >= 0.2 && rawCount > 4) {
    return " rrw-inline-history-row--danger";
  }
  if (ratio >= 0.1 && rawCount > 4) {
    return " rrw-inline-history-row--warning";
  }
  return "";
}

function buildSubmissionDomainSearchUrl(domain, username) {
  const cleanDomain = String(domain || "").trim();
  const cleanUser = String(username || "").trim();
  const params = new URLSearchParams({
    sort: "new",
    feature: "legacy_search",
  });
  const selfDomainMatch = cleanDomain.match(/^self\.(\w+)$/i);
  if (selfDomainMatch) {
    params.set("q", `author:${cleanUser} is_self:1`);
    params.set("restrict_sr", "on");
    return `/r/${encodeURIComponent(selfDomainMatch[1])}/search?${params.toString()}`;
  }

  params.set("q", `author:${cleanUser} site:${cleanDomain} is_self:0`);
  params.set("restrict_sr", "off");
  return `/search?${params.toString()}`;
}

function buildSubmissionSubredditSearchUrl(subreddit, username) {
  const cleanSub = normalizeSubreddit(subreddit);
  const cleanUser = String(username || "").trim();
  const params = new URLSearchParams({
    q: `author:${cleanUser}`,
    restrict_sr: "on",
    sort: "new",
    feature: "legacy_search",
  });
  return `/r/${encodeURIComponent(cleanSub)}/search?${params.toString()}`;
}

async function fetchUserListing(username, listing, maxItems = 1000) {
  const cleanUser = String(username || "").trim();
  const cleanListing = String(listing || "").trim();
  if (!cleanUser || !cleanListing || maxItems <= 0) {
    return [];
  }

  const out = [];
  let after = "";
  let page = 0;
  while (out.length < maxItems && page < 30) {
    const payload = await requestJsonViaBackground(
      buildProfileApiUrl(cleanUser, cleanListing, {
        sort: "new",
        limit: "100",
        after,
      }),
    );
    const children = Array.isArray(payload?.data?.children) ? payload.data.children : [];
    if (!children.length) {
      break;
    }

    for (const child of children) {
      out.push(child);
      if (out.length >= maxItems) {
        break;
      }
    }

    after = String(payload?.data?.after || "");
    page += 1;
    if (!after) {
      break;
    }
  }

  return out;
}

async function buildInlineHistoryData(username, currentSubreddit = "") {
  const cleanUser = String(username || "").trim();
  const cleanCurrentSub = normalizeSubreddit(currentSubreddit).toLowerCase();
  const [aboutPayload, submissionEntries, commentEntries] = await Promise.all([
    requestJsonViaBackground(buildProfileAboutUrl(cleanUser)),
    fetchUserListing(cleanUser, "submitted", 1000),
    fetchUserListing(cleanUser, "comments", 1000),
  ]);

  const about = aboutPayload?.data || {};
  const domainMap = new Map();
  const submissionSubMap = new Map();
  const accountMap = new Map();
  const commentSubMap = new Map();

  submissionEntries.forEach((row) => {
    const data = row?.data || {};
    const domain = String(data.domain || "unknown").trim().toLowerCase() || "unknown";
    const subreddit = normalizeSubreddit(data.subreddit || "unknown") || "unknown";
    const score = Number.parseInt(String(data.score || "0"), 10) || 0;

    domainMap.set(domain, (domainMap.get(domain) || 0) + 1);

    const priorSub = submissionSubMap.get(subreddit) || { count: 0, karma: 0 };
    submissionSubMap.set(subreddit, {
      count: priorSub.count + 1,
      karma: priorSub.karma + score,
    });

    const media = data?.media?.oembed || data?.secure_media?.oembed;
    const authorUrl = String(media?.author_url || "").trim();
    if (authorUrl) {
      let provider = "external";
      let providerUrl = "";
      try {
        const parsed = new URL(authorUrl);
        provider = String(parsed.hostname || "external").replace(/^www\./i, "") || "external";
        providerUrl = `${parsed.protocol}//${parsed.hostname}`;
      } catch {
        provider = "external";
      }

      const key = authorUrl;
      const priorAccount = accountMap.get(key) || {
        count: 0,
        name: "",
        url: authorUrl,
        provider,
        providerUrl,
      };
      accountMap.set(key, {
        count: priorAccount.count + 1,
        name: String(media?.author_name || priorAccount.name || provider),
        url: authorUrl,
        provider,
        providerUrl,
      });
    }
  });

  let commentsOnOwnPosts = 0;
  commentEntries.forEach((row) => {
    const data = row?.data || {};
    const subreddit = normalizeSubreddit(data.subreddit || "unknown") || "unknown";
    commentSubMap.set(subreddit, (commentSubMap.get(subreddit) || 0) + 1);
    const linkAuthor = String(data.link_author || "").trim().toLowerCase();
    if (linkAuthor && linkAuthor === cleanUser.toLowerCase()) {
      commentsOnOwnPosts += 1;
    }
  });

  const submissionTotal = submissionEntries.length;
  const commentTotal = commentEntries.length;

  const domainRows = Array.from(domainMap.entries())
    .map(([domain, count]) => ({
      domain,
      count,
      ratio: submissionTotal > 0 ? count / submissionTotal : 0,
      searchUrl: buildSubmissionDomainSearchUrl(domain, cleanUser),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const submissionSubRows = Array.from(submissionSubMap.entries())
    .map(([subreddit, value]) => ({
      subreddit,
      count: value.count,
      karma: value.karma,
      ratio: submissionTotal > 0 ? value.count / submissionTotal : 0,
      isCurrent: cleanCurrentSub && subreddit.toLowerCase() === cleanCurrentSub,
      searchUrl: buildSubmissionSubredditSearchUrl(subreddit, cleanUser),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const commentSubRows = Array.from(commentSubMap.entries())
    .map(([subreddit, count]) => ({
      subreddit,
      count,
      ratio: commentTotal > 0 ? count / commentTotal : 0,
      isCurrent: cleanCurrentSub && subreddit.toLowerCase() === cleanCurrentSub,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const accountRows = Array.from(accountMap.values())
    .map((account) => ({
      ...account,
      ratio: submissionTotal > 0 ? account.count / submissionTotal : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return {
    userInfo: {
      submissionKarma: Number.parseInt(String(about.link_karma || "0"), 10) || 0,
      commentKarma: Number.parseInt(String(about.comment_karma || "0"), 10) || 0,
      createdUtc: Number.parseFloat(String(about.created_utc || "0")) || 0,
    },
    submissions: {
      total: submissionTotal,
      domains: domainRows,
      subreddits: submissionSubRows,
      accounts: accountRows,
    },
    comments: {
      total: commentTotal,
      onOwnPosts: commentsOnOwnPosts,
      subreddits: commentSubRows,
    },
  };
}

function ensureInlineHistoryPopupRoot() {
  let root = document.getElementById("rrw-inline-history-root");
  if (root instanceof HTMLElement) {
    return root;
  }
  root = document.createElement("div");
  root.id = "rrw-inline-history-root";
  document.documentElement.appendChild(root);
  return root;
}

function closeInlineHistoryPopup() {
  inlineHistoryPopupState = null;
  const root = document.getElementById("rrw-inline-history-root");
  if (root instanceof HTMLElement) {
    root.remove();
  }
}

function positionInlineHistoryPopup(root, triggerEl) {
  if (!(root instanceof HTMLElement) || !(triggerEl instanceof HTMLElement)) {
    return;
  }
  const rect = triggerEl.getBoundingClientRect();
  const margin = 8;
  const width = 760;
  const heightGuess = 520;
  let left = Math.round(rect.left);
  let top = Math.round(rect.bottom + 6);

  if (left + width > window.innerWidth - margin) {
    left = Math.max(margin, window.innerWidth - width - margin);
  }
  if (top + heightGuess > window.innerHeight - margin) {
    top = Math.max(margin, Math.round(rect.top - heightGuess - 6));
  }

  root.style.left = `${left}px`;
  root.style.top = `${top}px`;
}

function renderInlineHistoryPopup() {
  const state = inlineHistoryPopupState;
  if (!state) {
    closeInlineHistoryPopup();
    return;
  }

  const root = ensureInlineHistoryPopupRoot();
  positionInlineHistoryPopup(root, state.triggerEl);
  const history = state.history || null;

  const domainRows = Array.isArray(history?.submissions?.domains)
    ? history.submissions.domains
      .map((row) => {
        const className = `rrw-inline-history-row${getHistoryRatioClass(row.ratio, row.count)}`;
        return `
          <tr class="${className}">
            <td><a href="${escapeHtml(row.searchUrl)}" target="_blank" rel="noreferrer">${escapeHtml(row.domain)}</a></td>
            <td>${escapeHtml(String(row.count))}</td>
            <td>${escapeHtml(asHistoryPercent(row.ratio))}</td>
          </tr>
        `;
      })
      .join("")
    : "";

  const submissionSubRows = Array.isArray(history?.submissions?.subreddits)
    ? history.submissions.subreddits
      .map((row) => {
        const className = `rrw-inline-history-row${getHistoryRatioClass(row.ratio, row.count)}${row.isCurrent ? " rrw-inline-history-row--current" : ""}`;
        return `
          <tr class="${className}">
            <td><a href="${escapeHtml(row.searchUrl)}" target="_blank" rel="noreferrer">${escapeHtml(row.subreddit)}</a></td>
            <td>${escapeHtml(String(row.count))}</td>
            <td>${escapeHtml(asHistoryPercent(row.ratio))}</td>
            <td>${escapeHtml(String(row.karma))}</td>
          </tr>
        `;
      })
      .join("")
    : "";

  const commentSubRows = Array.isArray(history?.comments?.subreddits)
    ? history.comments.subreddits
      .map((row) => {
        const className = `rrw-inline-history-row${getHistoryRatioClass(row.ratio, row.count)}${row.isCurrent ? " rrw-inline-history-row--current" : ""}`;
        return `
          <tr class="${className}">
            <td>${escapeHtml(row.subreddit)}</td>
            <td>${escapeHtml(String(row.count))}</td>
            <td>${escapeHtml(asHistoryPercent(row.ratio))}</td>
          </tr>
        `;
      })
      .join("")
    : "";

  const accountRows = Array.isArray(history?.submissions?.accounts)
    ? history.submissions.accounts
      .map((row) => {
        const className = `rrw-inline-history-row${getHistoryRatioClass(row.ratio, row.count)}`;
        const providerLink = row.providerUrl
          ? `<a href="${escapeHtml(row.providerUrl)}" target="_blank" rel="noreferrer">${escapeHtml(row.provider)}</a>`
          : escapeHtml(row.provider);
        return `
          <tr class="${className}">
            <td><a href="${escapeHtml(row.url)}" target="_blank" rel="noreferrer">${escapeHtml(row.name)}</a> - ${providerLink}</td>
            <td>${escapeHtml(String(row.count))}</td>
            <td>${escapeHtml(asHistoryPercent(row.ratio))}</td>
          </tr>
        `;
      })
      .join("")
    : "";

  // eslint-disable-next-line no-unsanitized/property
  root.innerHTML = `
    <section class="rrw-inline-history-popup" role="dialog" aria-label="User history">
      <header class="rrw-inline-history-header">
        <h4>History in r/${escapeHtml(state.subreddit)} - u/${escapeHtml(state.username)}</h4>
        <button type="button" class="rrw-close" data-inline-history-close="1">Close</button>
      </header>
      <div class="rrw-inline-history-body">
        ${state.loading ? '<p class="rrw-muted">Loading history...</p>' : ""}
        ${state.error ? `<div class="rrw-error">${escapeHtml(state.error)}</div>` : ""}
        ${!state.loading && !state.error && !history ? '<p class="rrw-muted">No history data found.</p>' : ""}
        ${!state.loading && !state.error && history ? `
          <div class="rrw-inline-history-summary">
            <div>
              <a href="https://www.reddit.com/user/${encodeURIComponent(state.username)}/" target="_blank" rel="noreferrer">u/${escapeHtml(state.username)}</a>
              <span> (${escapeHtml(String(history.userInfo.submissionKarma))} | ${escapeHtml(String(history.userInfo.commentKarma))})</span>
            </div>
            <div>redditor for ${escapeHtml(formatInlineHistoryAccountAge(history.userInfo.createdUtc))}</div>
          </div>
          <p class="rrw-inline-history-disclaimer"><strong>Disclaimer:</strong> This is an indication, not a complete picture. Context still matters when reviewing profile behavior.</p>
          <div class="rrw-inline-history-available">
            <strong>Available history:</strong><br>
            ${escapeHtml(String(history.submissions.total))} submissions<br>
            ${escapeHtml(String(history.comments.total))} comments, of those ${escapeHtml(String(history.comments.onOwnPosts))} are in their own posts.
          </div>

          <div class="rrw-inline-history-grid">
            <section class="rrw-inline-history-panel">
              <h5>domain submitted from</h5>
              <table>
                <thead><tr><th>domain</th><th>count</th><th>%</th></tr></thead>
                <tbody>${domainRows || '<tr><td colspan="3" class="rrw-inline-history-empty-cell">No data</td></tr>'}</tbody>
              </table>
            </section>

            <section class="rrw-inline-history-panel">
              <h5>subreddit submitted to</h5>
              <table>
                <thead><tr><th>subreddit</th><th>count</th><th>%</th><th>karma</th></tr></thead>
                <tbody>${submissionSubRows || '<tr><td colspan="4" class="rrw-inline-history-empty-cell">No data</td></tr>'}</tbody>
              </table>
            </section>

            <section class="rrw-inline-history-panel">
              <h5>subreddit commented in</h5>
              <table>
                <thead><tr><th>subreddit</th><th>count</th><th>%</th></tr></thead>
                <tbody>${commentSubRows || '<tr><td colspan="3" class="rrw-inline-history-empty-cell">No data</td></tr>'}</tbody>
              </table>
            </section>

            <section class="rrw-inline-history-panel">
              <h5>account submitted from</h5>
              <table>
                <thead><tr><th>account</th><th>count</th><th>%</th></tr></thead>
                <tbody>${accountRows || '<tr><td colspan="3" class="rrw-inline-history-empty-cell">No data</td></tr>'}</tbody>
              </table>
            </section>
          </div>
        ` : ""}
      </div>
    </section>
  `;

  const closeButton = root.querySelector("[data-inline-history-close='1']");
  if (closeButton instanceof HTMLButtonElement) {
    closeButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeInlineHistoryPopup();
    });
  }
}

function bindInlineHistoryPopupEvents() {
  if (inlineHistoryPopupEventsBound) {
    return;
  }
  document.addEventListener("mousedown", (event) => {
    if (!inlineHistoryPopupState) {
      return;
    }
    const root = document.getElementById("rrw-inline-history-root");
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }
    if (root?.contains(target)) {
      return;
    }
    if (inlineHistoryPopupState.triggerEl?.contains(target)) {
      return;
    }
    closeInlineHistoryPopup();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && inlineHistoryPopupState) {
      closeInlineHistoryPopup();
    }
  });

  window.addEventListener("resize", () => {
    if (!inlineHistoryPopupState) {
      return;
    }
    const root = document.getElementById("rrw-inline-history-root");
    if (root instanceof HTMLElement) {
      positionInlineHistoryPopup(root, inlineHistoryPopupState.triggerEl);
    }
  });

  inlineHistoryPopupEventsBound = true;
}

async function openInlineHistoryPopup(triggerEl, context = {}) {
  if (!(triggerEl instanceof HTMLElement)) {
    return;
  }

  const username = String(context.username || "").trim();
  const subreddit = normalizeSubreddit(context.subreddit || "");
  if (!username || username === "[deleted]") {
    return;
  }

  if (
    inlineHistoryPopupState
    && inlineHistoryPopupState.username.toLowerCase() === username.toLowerCase()
    && inlineHistoryPopupState.triggerEl === triggerEl
  ) {
    closeInlineHistoryPopup();
    return;
  }

  inlineHistoryPopupState = {
    triggerEl,
    username,
    subreddit,
    loading: true,
    error: "",
    history: null,
  };
  bindInlineHistoryPopupEvents();
  renderInlineHistoryPopup();

  try {
    const history = await buildInlineHistoryData(username, subreddit);

    if (!inlineHistoryPopupState || inlineHistoryPopupState.triggerEl !== triggerEl) {
      return;
    }
    inlineHistoryPopupState.loading = false;
    inlineHistoryPopupState.history = history;
    inlineHistoryPopupState.error = "";
    renderInlineHistoryPopup();
  } catch (error) {
    if (!inlineHistoryPopupState || inlineHistoryPopupState.triggerEl !== triggerEl) {
      return;
    }
    inlineHistoryPopupState.loading = false;
    inlineHistoryPopupState.history = null;
    inlineHistoryPopupState.error = error instanceof Error ? error.message : String(error);
    renderInlineHistoryPopup();
  }
}
