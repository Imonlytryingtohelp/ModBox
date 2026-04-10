// ════════════════════════════════════════════════════════════════════════════════════════════════
// Profile View Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// User profile view with comment/post history and metadata.
// Dependencies: constants.js, state.js, utilities.js, services/reddit-api.js, features/overlay.js

function ensureProfileRoot() {
  let root = document.getElementById(PROFILE_ROOT_ID);
  if (root instanceof HTMLElement) {
    return root;
  }
  root = document.createElement("div");
  root.id = PROFILE_ROOT_ID;
  document.documentElement.appendChild(root);
  return root;
}

function closeProfileView() {
  profileViewSearchToken += 1;
  profileViewState = null;
  const root = document.getElementById(PROFILE_ROOT_ID);
  if (root instanceof HTMLElement) {
    root.remove();
  }
}

function clampProfileSort(value) {
  const sort = String(value || "new").toLowerCase();
  return ["new", "top", "controversial", "hot"].includes(sort) ? sort : "new";
}

function clampProfileListing(value) {
  const listing = String(value || "overview").toLowerCase();
  return ["overview", "submitted", "comments"].includes(listing) ? listing : "overview";
}

function formatProfileTimestamp(createdUtc) {
  const timestamp = Number(createdUtc || 0) * 1000;
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return "Unknown time";
  }
  const date = new Date(timestamp);
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  let relative;
  if (diffMins < 60) {
    relative = diffMins <= 1 ? "just now" : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    relative = `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  } else {
    relative = `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }
  return `${date.toLocaleString()} (${relative})`;
}

function buildProfileApiUrl(username, listing, query = {}) {
  const safeUser = encodeURIComponent(String(username || "").trim());
  const safeListing = clampProfileListing(listing);
  const url = new URL(`https://old.reddit.com/user/${safeUser}/${safeListing}.json`);
  url.searchParams.set("raw_json", "1");
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    url.searchParams.set(String(key), String(value));
  });
  return url.toString();
}

function buildProfileAboutUrl(username) {
  const safeUser = encodeURIComponent(String(username || "").trim());
  return `https://old.reddit.com/user/${safeUser}/about.json?raw_json=1`;
}

function buildProfileModeratedSubsUrl(username) {
  const safeUser = encodeURIComponent(String(username || "").trim());
  return `https://old.reddit.com/user/${safeUser}/moderated_subreddits.json?raw_json=1`;
}

function buildProfileTrophiesUrl(username) {
  const safeUser = encodeURIComponent(String(username || "").trim());
  return `https://old.reddit.com/user/${safeUser}/trophies.json?raw_json=1`;
}

function buildMyModeratedSubsUrl(after = "") {
  const url = new URL("https://old.reddit.com/subreddits/mine/moderator.json?raw_json=1&limit=100");
  if (after) {
    url.searchParams.set("after", after);
  }
  return url.toString();
}

function getProfileEntryText(entry) {
  if (!entry || typeof entry !== "object") {
    return "";
  }
  if (entry.kind === "t1") {
    return String(entry.data?.body || "");
  }
  if (entry.kind === "t3") {
    return `${String(entry.data?.title || "")} ${String(entry.data?.selftext || "")}`;
  }
  return "";
}

function decodeHtmlEntities(value) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = String(value || "");
  return textarea.value;
}

function sanitizeProfileRenderedHtml(html) {
  const allowedTags = new Set([
    "A", "P", "BR", "HR", "EM", "STRONG", "DEL", "S", "U", "SUP", "SUB",
    "BLOCKQUOTE", "CODE", "PRE", "UL", "OL", "LI",
    "H1", "H2", "H3", "H4", "H5", "H6",
    "TABLE", "THEAD", "TBODY", "TR", "TH", "TD",
    "SPAN", "DIV",
  ]);

  const wrapper = document.createElement("div");
  wrapper.innerHTML = String(html || "");

  const nodes = [];
  const walker = document.createTreeWalker(wrapper, NodeFilter.SHOW_ELEMENT);
  let current = walker.nextNode();
  while (current) {
    nodes.push(current);
    current = walker.nextNode();
  }

  for (const node of nodes) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }

    if (!allowedTags.has(node.tagName)) {
      const parent = node.parentNode;
      if (!parent) {
        continue;
      }
      while (node.firstChild) {
        parent.insertBefore(node.firstChild, node);
      }
      parent.removeChild(node);
      continue;
    }

    const attrs = Array.from(node.attributes);
    attrs.forEach((attr) => {
      const name = String(attr.name || "").toLowerCase();
      if (name.startsWith("on") || name === "style" || name === "src" || name === "srcset") {
        node.removeAttribute(attr.name);
        return;
      }

      if (node.tagName === "A") {
        if (!["href", "title", "target", "rel"].includes(name)) {
          node.removeAttribute(attr.name);
          return;
        }

        if (name === "href") {
          const href = String(node.getAttribute("href") || "").trim();
          const safeHref = href.startsWith("/") || /^https?:\/\//i.test(href);
          if (!safeHref) {
            node.removeAttribute("href");
          }
        }
        if (name === "target") {
          node.setAttribute("target", "_blank");
        }
        if (name === "rel") {
          node.setAttribute("rel", "noreferrer noopener");
        }
      } else {
        if (name !== "class") {
          node.removeAttribute(attr.name);
        }
      }
    });

    if (node.tagName === "A") {
      if (!node.hasAttribute("target")) {
        node.setAttribute("target", "_blank");
      }
      node.setAttribute("rel", "noreferrer noopener");
    }
  }

  return wrapper.innerHTML;
}

function getProfileBodyHtmlFromEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return "";
  }

  if (entry.kind === "t1") {
    const rendered = String(entry.data?.body_html || "").trim();
    if (rendered) {
      return sanitizeProfileRenderedHtml(decodeHtmlEntities(rendered));
    }
    return renderProfileMarkdown(String(entry.data?.body || "[deleted]"));
  }

  if (entry.kind === "t3") {
    const rendered = String(entry.data?.selftext_html || "").trim();
    if (rendered) {
      return sanitizeProfileRenderedHtml(decodeHtmlEntities(rendered));
    }
    return renderProfileMarkdown(String(entry.data?.selftext || ""));
  }

  return "";
}

function renderProfileMarkdown(value) {
  const input = String(value || "").replace(/\r\n?/g, "\n").trim();
  if (!input) {
    return "";
  }

  let html = escapeHtml(input);
  const codeBlockTokens = [];

  html = html.replace(/```([\s\S]*?)```/g, (_match, codeText) => {
    const token = `@@RRW_CODE_BLOCK_${codeBlockTokens.length}@@`;
    const normalizedCode = String(codeText || "").replace(/^\n+|\n+$/g, "");
    codeBlockTokens.push(`<pre class="rrw-profile-codeblock"><code>${normalizedCode}</code></pre>`);
    return token;
  });

  html = html
    .replace(/^######\s+(.+)$/gm, "<h6>$1</h6>")
    .replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>")
    .replace(/^####\s+(.+)$/gm, "<h4>$1</h4>")
    .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#\s+(.+)$/gm, "<h1>$1</h1>")
    .replace(/^&gt;\s?(.*)$/gm, "<blockquote>$1</blockquote>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/`([^`\n]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");

  html = html.replace(/(?:^|\n)(?:[-*]\s+.+(?:\n[-*]\s+.+)*)/g, (block) => {
    const body = block.replace(/^\n/, "");
    const items = body.split("\n").map((line) => line.replace(/^[-*]\s+/, "").trim()).filter(Boolean);
    if (!items.length) {
      return block;
    }
    return `\n<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  });

  html = html.replace(/(?:^|\n)(?:\d+\.\s+.+(?:\n\d+\.\s+.+)*)/g, (block) => {
    const body = block.replace(/^\n/, "");
    const items = body.split("\n").map((line) => line.replace(/^\d+\.\s+/, "").trim()).filter(Boolean);
    if (!items.length) {
      return block;
    }
    return `\n<ol>${items.map((item) => `<li>${item}</li>`).join("")}</ol>`;
  });

  const fragments = html
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      if (/^<(h[1-6]|blockquote|pre|ul|ol)\b/i.test(chunk)) {
        return chunk;
      }
      return `<p>${chunk.replace(/\n/g, "<br>")}</p>`;
    });

  let rendered = fragments.join("");
  codeBlockTokens.forEach((tokenHtml, index) => {
    const token = `@@RRW_CODE_BLOCK_${index}@@`;
    rendered = rendered.split(token).join(tokenHtml);
  });

  return rendered;
}

function isProfileModAction(entry) {
  const distinguished = String(entry?.data?.distinguished || "").toLowerCase();
  return distinguished === "moderator";
}

function getProfileEntrySubreddit(entry) {
  return normalizeSubreddit(entry?.data?.subreddit || "").toLowerCase();
}

function isPostRemoved(entry) {
  if (!entry || typeof entry !== "object") {
    return false;
  }
  
  const data = entry.data;
  if (!data) {
    return false;
  }
  
  // Check if removed flag is set
  if (data.removed === true) {
    return true;
  }
  
  // Check if removed_by_category indicates removal
  if (data.removed_by_category) {
    return true;
  }
  
  // Post/comment is removed if author is null
  if (data.author === null) {
    return true;
  }
  
  // Also check if body/selftext is "[removed]"
  const body = entry.kind === "t1" ? data.body : data.selftext;
  return String(body || "").trim() === "[removed]";
}

function shouldHighlightRemovedPost(entry) {
  if (!profileViewState) {
    return false;
  }
  if (!isPostRemoved(entry)) {
    return false;
  }
  const entrySubreddit = getProfileEntrySubreddit(entry);
  const myModSubs = profileViewState.currentUserModSubs instanceof Set ? profileViewState.currentUserModSubs : null;
  return myModSubs instanceof Set && myModSubs.has(entrySubreddit);
}

function applyProfileFilters(items) {
  if (!profileViewState) {
    return [];
  }

  const source = Array.isArray(items) ? items : [];
  const filters = profileViewState.filters || {};
  const subredditFilter = normalizeSubreddit(filters.subreddit || "").toLowerCase();
  const textFilter = String(filters.text || "").trim().toLowerCase();
  const hideModActions = Boolean(profileViewState.hideModActions);
  const hideUnmoddable = Boolean(profileViewState.hideUnmoddable);
  const myModSubs = profileViewState.currentUserModSubs instanceof Set ? profileViewState.currentUserModSubs : null;

  return source.filter((entry) => {
    if (!entry || typeof entry !== "object") {
      return false;
    }

    const entrySubreddit = getProfileEntrySubreddit(entry);
    if (subredditFilter && entrySubreddit !== subredditFilter) {
      return false;
    }

    if (hideModActions && isProfileModAction(entry)) {
      return false;
    }

    if (hideUnmoddable && myModSubs instanceof Set && myModSubs.size > 0 && !myModSubs.has(entrySubreddit)) {
      return false;
    }

    if (textFilter) {
      const combined = getProfileEntryText(entry).toLowerCase();
      if (!combined.includes(textFilter)) {
        return false;
      }
    }

    return true;
  });
}

function renderProfileEntries(items) {
  const filtered = applyProfileFilters(items);

  if (filtered.length === 0) {
    return '<div class="rrw-profile-empty">No matching items.</div>';
  }

  return filtered
    .map((entry) => {
      if (entry?.kind === "t1") {
        const permalinkPath = entry.data?.permalink ? entry.data.permalink : "";
        const permalink = permalinkPath ? buildRedditUrl(permalinkPath, preferredRedditLinkHost) : "";
        const bodyHtml = getProfileBodyHtmlFromEntry(entry);
        const removedClass = shouldHighlightRemovedPost(entry) ? " rrw-profile-item--removed" : "";
        return `
          <article class="rrw-profile-item rrw-profile-item--comment${removedClass}">
            <header class="rrw-profile-item-header">
              <span class="rrw-profile-item-kind">Comment</span>
              <span class="rrw-profile-item-sub">r/${escapeHtml(String(entry.data?.subreddit || "unknown"))}</span>
              ${isProfileModAction(entry) ? '<span class="rrw-profile-item-mod">mod</span>' : ""}
            </header>
            <div class="rrw-profile-item-body">${bodyHtml}</div>
            <footer class="rrw-profile-item-footer">
              <span>${escapeHtml(formatProfileTimestamp(entry.data?.created_utc))}</span>
              ${permalink ? `<a href="${escapeHtml(permalink)}" target="_blank" rel="noreferrer">Open</a>` : ""}
            </footer>
          </article>
        `;
      }

      if (entry?.kind === "t3") {
        const permalinkPath = entry.data?.permalink ? entry.data.permalink : "";
        const permalink = permalinkPath ? buildRedditUrl(permalinkPath, preferredRedditLinkHost) : "";
        const selftextHtml = getProfileBodyHtmlFromEntry(entry);
        const removedClass = shouldHighlightRemovedPost(entry) ? " rrw-profile-item--removed" : "";
        return `
          <article class="rrw-profile-item rrw-profile-item--post${removedClass}">
            <header class="rrw-profile-item-header">
              <span class="rrw-profile-item-kind">Post</span>
              <span class="rrw-profile-item-sub">r/${escapeHtml(String(entry.data?.subreddit || "unknown"))}</span>
              ${isProfileModAction(entry) ? '<span class="rrw-profile-item-mod">mod</span>' : ""}
            </header>
            <h4 class="rrw-profile-item-title">${escapeHtml(String(entry.data?.title || "[deleted]"))}</h4>
            ${entry.data?.selftext ? `<div class="rrw-profile-item-body">${selftextHtml}</div>` : ""}
            <footer class="rrw-profile-item-footer">
              <span>${escapeHtml(formatProfileTimestamp(entry.data?.created_utc))}</span>
              ${permalink ? `<a href="${escapeHtml(permalink)}" target="_blank" rel="noreferrer">Open</a>` : ""}
            </footer>
          </article>
        `;
      }

      return "";
    })
    .join("");
}

function renderProfileSidebar() {
  const sidebar = profileViewState?.sidebar;
  if (!sidebar) {
    return '<div class="rrw-profile-sidebar-panel">No profile details loaded.</div>';
  }

  if (sidebar.loading) {
    return '<div class="rrw-profile-sidebar-panel">Loading profile details...</div>';
  }

  if (sidebar.error) {
    return `<div class="rrw-profile-sidebar-panel rrw-error">${escapeHtml(sidebar.error)}</div>`;
  }

  const about = sidebar.about || {};
  const modSubs = Array.isArray(sidebar.modSubs) ? sidebar.modSubs : [];
  const trophies = Array.isArray(sidebar.trophies) ? sidebar.trophies : [];
  const userNotesCount = sidebar.userNotesCount !== null ? sidebar.userNotesCount : null;
  const banStatus = sidebar.banStatus;
  const icon = String(about.icon_img || "").trim();
  const publicDescription = String(about.subreddit?.public_description || "").trim();
  const displayName = String(about.subreddit?.title || "").trim();

  const visibleSubs = modSubs.slice(0, 10);
  const remainingSubs = Math.max(0, modSubs.length - visibleSubs.length);

  return `
    <div class="rrw-profile-sidebar-panel">
      ${icon ? `<img class="rrw-profile-avatar" src="${escapeHtml(icon)}" alt="u/${escapeHtml(profileViewState.username)}">` : ""}
      <div class="rrw-profile-sidebar-row"><a href="https://www.reddit.com/user/${encodeURIComponent(profileViewState.username)}/" target="_blank" rel="noreferrer">u/${escapeHtml(profileViewState.username)}</a></div>
      ${displayName ? `<div class="rrw-profile-sidebar-row">Display name: ${escapeHtml(displayName)}</div>` : ""}
      <div class="rrw-profile-sidebar-row">Link karma: ${escapeHtml(String(about.link_karma ?? 0))}</div>
      <div class="rrw-profile-sidebar-row">Comment karma: ${escapeHtml(String(about.comment_karma ?? 0))}</div>
      <div class="rrw-profile-sidebar-row">Joined: ${escapeHtml(formatProfileTimestamp(about.created_utc))}</div>
      <div class="rrw-profile-sidebar-row">Verified email: ${about.has_verified_email ? "Yes" : "No"}</div>
      ${userNotesCount !== null ? `<div class="rrw-profile-sidebar-row">User notes: ${userNotesCount}</div>` : ""}
      ${banStatus ? `<div class="rrw-profile-sidebar-row rrw-warning">Ban status: ${escapeHtml(banStatus)}</div>` : ""}
      ${publicDescription ? `<p class="rrw-profile-sidebar-description">${escapeHtml(publicDescription)}</p>` : ""}
    </div>
    <div class="rrw-profile-sidebar-panel">
      <h4>Moderated subreddits (${modSubs.length})</h4>
      ${visibleSubs.length ? `<ul class="rrw-profile-sidebar-list">${visibleSubs
        .map((sr) => `<li><a href="https://www.reddit.com/r/${encodeURIComponent(sr)}/" target="_blank" rel="noreferrer">r/${escapeHtml(sr)}</a></li>`)
        .join("")}</ul>` : '<p class="rrw-muted">No moderated subreddits visible.</p>'}
      ${remainingSubs > 0 ? `<p class="rrw-muted">+${remainingSubs} more</p>` : ""}
    </div>
    <div class="rrw-profile-sidebar-panel">
      <h4>Trophies (${trophies.length})</h4>
      ${trophies.length
        ? `<ul class="rrw-profile-sidebar-list">${trophies
            .slice(0, 8)
            .map((trophy) => `<li>${escapeHtml(String(trophy?.data?.name || "Trophy"))}</li>`)
            .join("")}</ul>`
        : '<p class="rrw-muted">No trophies found.</p>'}
    </div>
  `;
}

function renderProfileSubredditFilterOptions() {
  const selected = normalizeSubreddit(profileViewState?.filters?.subreddit || "").toLowerCase();
  const subreddits = profileViewState?.currentUserModSubs instanceof Set
    ? Array.from(profileViewState.currentUserModSubs).filter(Boolean).sort((a, b) => a.localeCompare(b))
    : [];

  const options = [
    '<option value="">All</option>',
    ...subreddits.map((subreddit) => {
      const selectedAttr = selected === subreddit ? ' selected' : '';
      return `<option value="${escapeHtml(subreddit)}"${selectedAttr}>r/${escapeHtml(subreddit)}</option>`;
    }),
  ];

  return options.join("");
}

function renderProfileView() {
  if (!profileViewState) {
    closeProfileView();
    return;
  }

  const root = ensureProfileRoot();
  const listing = clampProfileListing(profileViewState.activeTab);
  const tabState = profileViewState.tabs[listing] || {
    items: [],
    loading: false,
    error: "",
    after: "",
    loaded: false,
  };

  const isSearchActive = Boolean(profileViewState.searchActive);
  const filteredCount = applyProfileFilters(tabState.items).length;

  root.innerHTML = `
    <div class="rrw-profile-backdrop" data-profile-close="1"></div>
    <section class="rrw-profile-modal" role="dialog" aria-modal="true" aria-label="ModBox profile view">
      <header class="rrw-profile-header">
        <h2>Profile View: u/${escapeHtml(profileViewState.username)}</h2>
        <div class="rrw-header-actions">
          <button type="button" class="rrw-close" data-profile-close="1">Close</button>
        </div>
      </header>
      <div class="rrw-profile-layout">
        <aside class="rrw-profile-sidebar">${renderProfileSidebar()}</aside>
        <main class="rrw-profile-main">
          <div class="rrw-tabs" role="tablist" aria-label="Profile listings">
            ${["overview", "submitted", "comments"]
              .map(
                (tab) =>
                  `<button type="button" class="rrw-tab-btn ${listing === tab ? "rrw-tab-btn--active" : ""}" data-profile-tab="${tab}">${tab}</button>`
              )
              .join("")}
          </div>

          <div class="rrw-profile-toolbar">
            <label class="rrw-field rrw-profile-toolbar-field">
              <span>Sort</span>
              <select id="rrw-profile-sort">
                <option value="new" ${profileViewState.sort === "new" ? "selected" : ""}>new</option>
                <option value="top" ${profileViewState.sort === "top" ? "selected" : ""}>top</option>
                <option value="controversial" ${profileViewState.sort === "controversial" ? "selected" : ""}>controversial</option>
                <option value="hot" ${profileViewState.sort === "hot" ? "selected" : ""}>hot</option>
              </select>
            </label>
            <label class="rrw-field--checkbox"><input type="checkbox" id="rrw-profile-hide-mod" ${profileViewState.hideModActions ? "checked" : ""}> Hide mod actions</label>
            <label class="rrw-field--checkbox"><input type="checkbox" id="rrw-profile-hide-unmod" ${profileViewState.hideUnmoddable ? "checked" : ""}> Hide unmoddable</label>
          </div>

          <form class="rrw-profile-search" id="rrw-profile-search-form">
            <select id="rrw-profile-search-subreddit" class="rrw-input">${renderProfileSubredditFilterOptions()}</select>
            <input type="text" id="rrw-profile-search-text" class="rrw-input" placeholder="content text" value="${escapeHtml(String(profileViewState.filters?.text || ""))}">
            <label class="rrw-field--checkbox"><input type="checkbox" id="rrw-profile-search-use-sort" ${profileViewState.searchUseSort ? "checked" : ""}> Use selected sort</label>
            <button type="submit" class="rrw-btn rrw-btn-secondary" ${profileViewState.searchLoading ? "disabled" : ""}>Search</button>
            <button type="button" class="rrw-btn rrw-btn-secondary" id="rrw-profile-clear-search" ${!isSearchActive ? "disabled" : ""}>Clear</button>
            <button type="button" class="rrw-btn rrw-btn-secondary" id="rrw-profile-cancel-search" ${profileViewState.searchLoading ? "" : "disabled"}>Cancel</button>
          </form>

          <p class="rrw-muted">Showing ${escapeHtml(String(filteredCount))} item(s)${isSearchActive ? " (search mode)" : ""}.</p>
          ${profileViewState.searchMessage ? `<p class="rrw-muted">${escapeHtml(profileViewState.searchMessage)}</p>` : ""}
          ${tabState.error ? `<div class="rrw-error">${escapeHtml(tabState.error)}</div>` : ""}
          ${tabState.loading ? '<div class="rrw-muted">Loading listing...</div>' : ""}

          <div class="rrw-profile-items">${renderProfileEntries(tabState.items)}</div>

          <div class="rrw-actions rrw-actions--inline">
            <button type="button" class="rrw-btn rrw-btn-secondary" id="rrw-profile-refresh" ${tabState.loading ? "disabled" : ""}>Refresh</button>
            <button type="button" class="rrw-btn rrw-btn-secondary" id="rrw-profile-load-more" ${tabState.loading || !tabState.after || isSearchActive ? "disabled" : ""}>Load more</button>
          </div>
        </main>
      </div>
    </section>
  `;

  root.querySelectorAll("[data-profile-close='1']").forEach((el) => {
    el.addEventListener("click", (event) => {
      if (event.currentTarget !== event.target && event.currentTarget instanceof HTMLElement && event.currentTarget.classList.contains("rrw-profile-backdrop")) {
        return;
      }
      closeProfileView();
    });
  });

  root.querySelectorAll("[data-profile-tab]").forEach((tabButton) => {
    tabButton.addEventListener("click", (event) => {
      const tab = clampProfileListing(event.currentTarget?.getAttribute("data-profile-tab") || "overview");
      if (!profileViewState || profileViewState.activeTab === tab) {
        return;
      }
      profileViewState.activeTab = tab;
      profileViewState.searchMessage = "";
      renderProfileView();
      void ensureProfileTabLoaded(tab, { reset: false });
    });
  });

  const sortSelect = root.querySelector("#rrw-profile-sort");
  if (sortSelect instanceof HTMLSelectElement) {
    sortSelect.addEventListener("change", () => {
      if (!profileViewState) {
        return;
      }
      profileViewState.sort = clampProfileSort(sortSelect.value);
      void ensureProfileTabLoaded(profileViewState.activeTab, { reset: true });
    });
  }

  const hideMod = root.querySelector("#rrw-profile-hide-mod");
  if (hideMod instanceof HTMLInputElement) {
    hideMod.addEventListener("change", () => {
      if (!profileViewState) {
        return;
      }
      profileViewState.hideModActions = Boolean(hideMod.checked);
      renderProfileView();
    });
  }

  const hideUnmod = root.querySelector("#rrw-profile-hide-unmod");
  if (hideUnmod instanceof HTMLInputElement) {
    hideUnmod.addEventListener("change", () => {
      if (!profileViewState) {
        return;
      }
      profileViewState.hideUnmoddable = Boolean(hideUnmod.checked);
      renderProfileView();
    });
  }

  const refreshBtn = root.querySelector("#rrw-profile-refresh");
  if (refreshBtn instanceof HTMLButtonElement) {
    refreshBtn.addEventListener("click", () => {
      if (!profileViewState) {
        return;
      }
      void ensureProfileTabLoaded(profileViewState.activeTab, { reset: true });
    });
  }

  const loadMoreBtn = root.querySelector("#rrw-profile-load-more");
  if (loadMoreBtn instanceof HTMLButtonElement) {
    loadMoreBtn.addEventListener("click", () => {
      if (!profileViewState) {
        return;
      }
      void ensureProfileTabLoaded(profileViewState.activeTab, { append: true });
    });
  }

  const clearBtn = root.querySelector("#rrw-profile-clear-search");
  if (clearBtn instanceof HTMLButtonElement) {
    clearBtn.addEventListener("click", () => {
      if (!profileViewState) {
        return;
      }
      profileViewState.searchActive = false;
      profileViewState.searchMessage = "";
      profileViewState.filters = { subreddit: "", text: "" };
      void ensureProfileTabLoaded(profileViewState.activeTab, { reset: true });
    });
  }

  const cancelBtn = root.querySelector("#rrw-profile-cancel-search");
  if (cancelBtn instanceof HTMLButtonElement) {
    cancelBtn.addEventListener("click", () => {
      profileViewSearchToken += 1;
      if (profileViewState) {
        profileViewState.searchLoading = false;
        profileViewState.searchMessage = "Search canceled.";
        renderProfileView();
      }
    });
  }

  const searchForm = root.querySelector("#rrw-profile-search-form");
  const subredditSelect = root.querySelector("#rrw-profile-search-subreddit");
  if (subredditSelect instanceof HTMLSelectElement) {
    subredditSelect.addEventListener("change", () => {
      if (!profileViewState) {
        return;
      }
      const textInput = root.querySelector("#rrw-profile-search-text");
      const useSortInput = root.querySelector("#rrw-profile-search-use-sort");
      profileViewState.filters = {
        subreddit: subredditSelect.value,
        text: textInput instanceof HTMLInputElement ? textInput.value : "",
      };
      profileViewState.searchUseSort = useSortInput instanceof HTMLInputElement ? Boolean(useSortInput.checked) : false;
      void runProfileSearch(profileViewState.activeTab);
    });
  }

  if (searchForm instanceof HTMLFormElement) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!profileViewState) {
        return;
      }
      const subInput = root.querySelector("#rrw-profile-search-subreddit");
      const textInput = root.querySelector("#rrw-profile-search-text");
      const useSortInput = root.querySelector("#rrw-profile-search-use-sort");
      profileViewState.filters = {
        subreddit: subInput instanceof HTMLSelectElement ? subInput.value : "",
        text: textInput instanceof HTMLInputElement ? textInput.value : "",
      };
      profileViewState.searchUseSort = useSortInput instanceof HTMLInputElement ? Boolean(useSortInput.checked) : false;
      void runProfileSearch(profileViewState.activeTab);
    });
  }
}

async function fetchProfileListingPage(username, listing, sort, after = "", limit = 25) {
  const url = buildProfileApiUrl(username, listing, {
    sort: clampProfileSort(sort),
    t: "all",
    limit,
    after,
  });
  const payload = await requestJsonViaBackground(url);
  const children = Array.isArray(payload?.data?.children) ? payload.data.children : [];
  const nextAfter = String(payload?.data?.after || "");
  return {
    children,
    after: nextAfter,
  };
}

async function ensureProfileTabLoaded(listing, options = {}) {
  if (!profileViewState) {
    return;
  }

  const tab = clampProfileListing(listing);
  const append = Boolean(options.append);
  const reset = Boolean(options.reset);
  const tabState = profileViewState.tabs[tab];
  if (!tabState) {
    return;
  }

  if (tabState.loading) {
    return;
  }

  if (!append && !reset && tabState.loaded) {
    return;
  }

  tabState.loading = true;
  tabState.error = "";
  renderProfileView();

  try {
    const page = await fetchProfileListingPage(
      profileViewState.username,
      tab,
      profileViewState.sort,
      append ? tabState.after : "",
      25,
    );

    tabState.items = append ? tabState.items.concat(page.children) : page.children;
    tabState.after = page.after;
    tabState.loaded = true;
    tabState.error = "";
  } catch (error) {
    tabState.error = error instanceof Error ? error.message : String(error);
  } finally {
    tabState.loading = false;
    renderProfileView();
  }
}

async function fetchMyModeratedSubs() {
  const modSubs = new Set();
  let after = "";

  for (let page = 0; page < 10; page += 1) {
    const payload = await requestJsonViaBackground(buildMyModeratedSubsUrl(after));
    const children = Array.isArray(payload?.data?.children) ? payload.data.children : [];
    children.forEach((item) => {
      const name = normalizeSubreddit(item?.data?.display_name || "").toLowerCase();
      if (name) {
        modSubs.add(name);
      }
    });
    after = String(payload?.data?.after || "");
    if (!after) {
      break;
    }
  }

  return modSubs;
}

async function loadProfileSidebar() {
  if (!profileViewState) {
    return;
  }

  profileViewState.sidebar.loading = true;
  profileViewState.sidebar.error = "";
  renderProfileView();

  try {
    const username = profileViewState.username;
    const subreddit = profileViewState.subreddit;
    const requests = [
      requestJsonViaBackground(buildProfileAboutUrl(username)),
      requestJsonViaBackground(buildProfileModeratedSubsUrl(username)),
      requestJsonViaBackground(buildProfileTrophiesUrl(username)),
      fetchMyModeratedSubs(),
    ];

    // Add usernotes fetch if we have a subreddit context
    if (subreddit && typeof fetchUsernotesViaReddit === "function") {
      requests.push(
        fetchUsernotesViaReddit(subreddit, username).catch(() => null)
      );
    } else {
      requests.push(Promise.resolve(null));
    }

    // Add ban list fetch if we have a subreddit context
    if (subreddit) {
      requests.push(
        requestJsonViaBackground(`/r/${encodeURIComponent(subreddit)}/about/banned.json?limit=100`, { oauth: true }).catch(() => null)
      );
    } else {
      requests.push(Promise.resolve(null));
    }

    const results = await Promise.allSettled(requests);
    const [aboutResult, modSubsResult, trophiesResult, myModSubsResult, userNotesResult, banListResult] = results;

    if (aboutResult.status === "fulfilled") {
      profileViewState.sidebar.about = aboutResult.value?.data || null;
    }

    if (modSubsResult.status === "fulfilled") {
      const list = Array.isArray(modSubsResult.value?.data)
        ? modSubsResult.value.data
            .map((item) => normalizeSubreddit(item?.sr || item?.name || ""))
            .filter(Boolean)
        : [];
      profileViewState.sidebar.modSubs = list;
    }

    if (trophiesResult.status === "fulfilled") {
      profileViewState.sidebar.trophies = Array.isArray(trophiesResult.value?.data?.trophies)
        ? trophiesResult.value.data.trophies
        : [];
    }

    if (myModSubsResult.status === "fulfilled") {
      profileViewState.currentUserModSubs = myModSubsResult.value;
    }

    // Handle usernotes result
    if (userNotesResult.status === "fulfilled") {
      const userNotesPayload = userNotesResult.value;
      if (userNotesPayload && typeof userNotesPayload.note_count === "number") {
        profileViewState.sidebar.userNotesCount = userNotesPayload.note_count;
      }
    }

    // Handle ban list result
    if (banListResult.status === "fulfilled") {
      const banListData = banListResult.value;
      if (banListData && Array.isArray(banListData.data?.children)) {
        const banEntry = banListData.data.children.find(
          (child) => String(child?.data?.name || "").toLowerCase() === username.toLowerCase()
        );
        if (banEntry && banEntry.data) {
          const banReason = String(banEntry.data.ban_reason || "").trim();
          const banNote = String(banEntry.data.note || "").trim();
          const banDaysLeft = Number(banEntry.data.ban_days || 0);
          let statusStr = "Banned";
          if (banReason) {
            statusStr += ` (${banReason})`;
          }
          if (banDaysLeft > 0) {
            statusStr += ` - ${banDaysLeft} day${banDaysLeft === 1 ? "" : "s"} remaining`;
          }
          profileViewState.sidebar.banStatus = statusStr;
        }
      }
    }

    profileViewState.sidebar.loading = false;
    profileViewState.sidebar.error = "";
  } catch (error) {
    profileViewState.sidebar.loading = false;
    profileViewState.sidebar.error = error instanceof Error ? error.message : String(error);
  }

  renderProfileView();
}

async function runProfileSearch(listing) {
  if (!profileViewState) {
    return;
  }

  const tab = clampProfileListing(listing);
  const tabState = profileViewState.tabs[tab];
  if (!tabState) {
    return;
  }

  const subredditPattern = normalizeSubreddit(profileViewState.filters?.subreddit || "").toLowerCase();
  const textPattern = String(profileViewState.filters?.text || "").trim().toLowerCase();

  if (!subredditPattern && !textPattern) {
    profileViewState.searchActive = false;
    profileViewState.searchMessage = "Showing full listing.";
    await ensureProfileTabLoaded(tab, { reset: true });
    return;
  }

  profileViewSearchToken += 1;
  const token = profileViewSearchToken;
  profileViewState.searchLoading = true;
  profileViewState.searchActive = true;
  profileViewState.searchMessage = "Searching profile history...";
  tabState.loading = true;
  tabState.error = "";
  renderProfileView();

  try {
    let after = "";
    let pageCount = 0;
    const results = [];
    const sort = profileViewState.searchUseSort ? profileViewState.sort : "new";

    while (pageCount < 30) {
      if (!profileViewState || token !== profileViewSearchToken) {
        return;
      }

      const page = await fetchProfileListingPage(profileViewState.username, tab, sort, after, 100);
      pageCount += 1;

      page.children.forEach((entry) => {
        const entrySub = getProfileEntrySubreddit(entry);
        const entryText = getProfileEntryText(entry).toLowerCase();

        const subredditMatch = subredditPattern ? entrySub === subredditPattern : true;
        const textMatch = textPattern ? entryText.includes(textPattern) : true;

        if (subredditMatch && textMatch) {
          results.push(entry);
        }
      });

      after = page.after;
      profileViewState.searchMessage = `Searching page ${pageCount} (${results.length} matches)`;
      renderProfileView();

      if (!after) {
        break;
      }
    }

    if (!profileViewState || token !== profileViewSearchToken) {
      return;
    }

    tabState.items = results;
    tabState.after = "";
    tabState.loaded = true;
    tabState.error = "";
    profileViewState.searchMessage = `Search complete: ${results.length} match(es).`;
  } catch (error) {
    if (!profileViewState || token !== profileViewSearchToken) {
      return;
    }
    tabState.error = error instanceof Error ? error.message : String(error);
    profileViewState.searchMessage = "Search failed.";
  } finally {
    if (!profileViewState || token !== profileViewSearchToken) {
      return;
    }
    tabState.loading = false;
    profileViewState.searchLoading = false;
    renderProfileView();
  }
}

function openProfileView(username, options = {}) {
  const user = String(username || "").trim();
  if (!user || user === "[deleted]") {
    return;
  }

  profileViewSearchToken += 1;
  const initialTab = clampProfileListing(options.listing || "overview");
  profileViewState = {
    username: user,
    subreddit: normalizeSubreddit(options.subreddit || ""),
    activeTab: initialTab,
    sort: "new",
    hideModActions: false,
    hideUnmoddable: false,
    filters: {
      subreddit: "",
      text: "",
    },
    searchUseSort: false,
    searchLoading: false,
    searchActive: false,
    searchMessage: "",
    currentUserModSubs: null,
    sidebar: {
      loading: true,
      error: "",
      about: null,
      modSubs: [],
      trophies: [],
      userNotesCount: null,
      banStatus: null,
    },
    tabs: {
      overview: { items: [], after: "", loading: false, error: "", loaded: false },
      submitted: { items: [], after: "", loading: false, error: "", loaded: false },
      comments: { items: [], after: "", loading: false, error: "", loaded: false },
    },
  };

  renderProfileView();
  void loadProfileSidebar();
  void ensureProfileTabLoaded(initialTab, { reset: true });
}

async function fetchUserProfile(username) {
  // Stub: Fetch user profile data from Reddit API
  // Returns account creation date, karma, etc.
}

async function switchProfileTab(tabName) {
  if (!profileViewState) return;
  profileViewState.activeTab = tabName;
  profileViewState.currentPage = 0;
  renderProfileView();
}
