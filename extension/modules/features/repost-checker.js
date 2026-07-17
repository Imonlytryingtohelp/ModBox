// Repost Checker Popup Module
// Shows a user's recent submissions in a subreddit and highlights possible reposts
// Dependencies: utilities.js (escapeHtml), history-popup.js (fetchUserListing)

let repostCheckerState = null;

function ensureRepostCheckerRoot() {
  let root = document.getElementById("rrw-repost-checker-root");
  if (root instanceof HTMLElement) return root;
  root = document.createElement("div");
  root.id = "rrw-repost-checker-root";
  document.documentElement.appendChild(root);
  return root;
}

function closeRepostCheckerPopup() {
  repostCheckerState = null;
  const root = document.getElementById("rrw-repost-checker-root");
  if (root instanceof HTMLElement) root.remove();
}

function positionRepostCheckerPopup(root, triggerEl) {
  if (!(root instanceof HTMLElement) || !(triggerEl instanceof HTMLElement)) return;
  const rect = triggerEl.getBoundingClientRect();
  const margin = 8;
  const width = 720;
  const heightGuess = 480;
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

function normalizeTitleForCompare(t) {
  return String(t || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

function formatAgeFromMs(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

function levenshteinDistance(a, b) {
  const al = String(a || "");
  const bl = String(b || "");
  if (al.length === 0) return bl.length;
  if (bl.length === 0) return al.length;
  const v0 = new Array(bl.length + 1).fill(0);
  const v1 = new Array(bl.length + 1).fill(0);
  for (let j = 0; j <= bl.length; j++) v0[j] = j;
  for (let i = 0; i < al.length; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < bl.length; j++) {
      const cost = al[i] === bl[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= bl.length; j++) v0[j] = v1[j];
  }
  return v1[bl.length];
}

function titleSimilarity(a, b) {
  // normalized Levenshtein similarity: 1 - (dist / maxLen)
  const A = String(a || "");
  const B = String(b || "");
  const maxLen = Math.max(A.length, B.length);
  if (maxLen === 0) return 1;
  const dist = levenshteinDistance(A, B);
  return 1 - dist / maxLen;
}

function renderRepostCheckerPopup() {
  const state = repostCheckerState;
  if (!state) return closeRepostCheckerPopup();
  const root = ensureRepostCheckerRoot();

  const rows = Array.isArray(state.entries) ? state.entries.map((row) => {
    const data = row?.data || {};
    const flair = escapeHtml(String(data.link_flair_text || ""));
    const title = escapeHtml(String(data.title || ""));
    const age = escapeHtml(formatAgeFromMs(Date.now() - (Number.parseFloat(String(data.created_utc || 0)) * 1000)));
    const score = escapeHtml(String(data.score || 0));
    const url = escapeHtml(String(data.url || ""));
    const isMatch = Boolean(state.possibleMatches && state.possibleMatches.has(String(data.id || "")));
    return `
      <tr class="${isMatch ? 'rrw-repost-row rrw-repost-row--match' : 'rrw-repost-row'}">
        <td>${flair || "-"}</td>
        <td><a href="${escapeHtml(buildRedditUrl(`/r/${state.subreddit}/comments/${escapeHtml(data.id)}`))}" target="_blank" rel="noreferrer">${title}</a></td>
        <td>${score}</td>
        <td>${age}</td>
      </tr>
    `;
  }).join("") : "";

  const loadMoreBtn = state.hasMore && !state.loadingMore ? `<button type=\"button\" id=\"rrw-repost-load-more\" class=\"rrw-btn rrw-btn-secondary\">Load more</button>` : "";

  root.innerHTML = `
    <div class="rrw-usernotes-backdrop" tabindex="-1"></div>
    <section class="rrw-usernotes-modal rrw-repost-checker-popup" role="dialog" aria-label="Repost checker">
      <header class="rrw-usernotes-header">
        <h3>Reposts in r/${escapeHtml(state.subreddit)} - u/${escapeHtml(state.username)}</h3>
        <button type="button" class="rrw-close" data-repost-close="1">Close</button>
      </header>
      <div class="rrw-repost-body">
        ${state.loading ? '<p class="rrw-muted">Loading submissions...</p>' : ''}
        ${state.error ? `<div class="rrw-error">${escapeHtml(state.error)}</div>` : ''}
        ${!state.loading && !state.error && rows === '' ? '<p class="rrw-muted">No submissions found.</p>' : ''}
        ${rows ? `
          <table class="rrw-repost-table">
            <thead><tr><th>flair</th><th>title</th><th>score</th><th>age</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        ` : ''}
        <div style="margin-top:8px">${loadMoreBtn}</div>
      </div>
    </section>
  `;

  // Attach events
  root.querySelector('.rrw-usernotes-backdrop')?.addEventListener('click', () => closeRepostCheckerPopup());
  root.querySelector('[data-repost-close="1"]')?.addEventListener('click', () => closeRepostCheckerPopup());
  const loadMoreEl = root.querySelector('#rrw-repost-load-more');
  if (loadMoreEl) {
    loadMoreEl.addEventListener('click', async () => {
      await loadMoreRepostEntries();
      renderRepostCheckerPopup();
    });
  }
}

async function loadMoreRepostEntries() {
  if (!repostCheckerState) return;
  repostCheckerState.loadingMore = true;
  try {
    const currentCount = Array.isArray(repostCheckerState.entries) ? repostCheckerState.entries.length : 0;
    const toFetch = Math.min(100, currentCount + 25);
    const fetched = await fetchUserListing(repostCheckerState.username, 'submitted', toFetch);
    repostCheckerState.entries = fetched.filter((c) => String((c?.data?.subreddit || '')).toLowerCase() === String(repostCheckerState.subreddit).toLowerCase());
    repostCheckerState.hasMore = fetched.length >= toFetch;
    computePossibleMatches();
  } catch (err) {
    repostCheckerState.error = getSafeErrorMessage(err);
  } finally {
    repostCheckerState.loadingMore = false;
  }
}

function computePossibleMatches() {
  if (!repostCheckerState) return;
  const set = new Set();
  const normCurrentTitle = normalizeTitleForCompare(repostCheckerState.currentTitle || '');
  const curUrl = String(repostCheckerState.currentUrl || '').toLowerCase();
  (repostCheckerState.entries || []).forEach((row) => {
    const data = row?.data || {};
    const id = String(data.id || '');
    const title = normalizeTitleForCompare(data.title || '');
    const url = String(data.url || '').toLowerCase();
    if (normCurrentTitle && title && normCurrentTitle === title) {
      set.add(id);
    }
    // fuzzy title match: allow close titles (e.g. small edits, punctuation)
    else if (normCurrentTitle && title) {
      const sim = titleSimilarity(normCurrentTitle, title);
      if (sim >= 0.78) {
        set.add(id);
      }
    }
    if (curUrl && url && curUrl === url) {
      set.add(id);
    }
  });
  repostCheckerState.possibleMatches = set;
  // toggle highlight on trigger button
  try {
    if (repostCheckerState.triggerEl instanceof HTMLElement) {
      if (set.size > 0) {
        repostCheckerState.triggerEl.classList.add('rrw-repost-pill--warning');
      } else {
        repostCheckerState.triggerEl.classList.remove('rrw-repost-pill--warning');
      }
    }
  } catch (e) {
    // ignore
  }

  // indicate presence of any previous posts on the subreddit
  try {
    if (repostCheckerState.triggerEl instanceof HTMLElement) {
      if (Array.isArray(repostCheckerState.entries) && repostCheckerState.entries.length >= 2) {
        repostCheckerState.triggerEl.classList.add('rrw-repost-pill--available');
      } else {
        repostCheckerState.triggerEl.classList.remove('rrw-repost-pill--available');
      }
    }
  } catch (e) {
    // ignore
  }
}

async function openRepostCheckerPopup(triggerEl, context = {}) {
  const username = String(context.username || '').trim();
  const subreddit = normalizeSubreddit(context.subreddit || '');
  const currentTitle = String(context.currentTitle || '').trim();
  const currentUrl = String(context.currentUrl || '').trim();
  if (!username || !subreddit) return;

  repostCheckerState = {
    triggerEl,
    username,
    subreddit,
    currentTitle,
    currentUrl,
    loading: true,
    error: null,
    entries: [],
    hasMore: false,
    possibleMatches: new Set(),
  };

  renderRepostCheckerPopup();

  try {
    const fetched = await fetchUserListing(username, 'submitted', 25);
    repostCheckerState.entries = fetched.filter((c) => String((c?.data?.subreddit || '')).toLowerCase() === subreddit.toLowerCase());
    repostCheckerState.hasMore = fetched.length >= 25;
    computePossibleMatches();
  } catch (err) {
    repostCheckerState.error = getSafeErrorMessage(err);
  } finally {
    repostCheckerState.loading = false;
    renderRepostCheckerPopup();
  }
}

// Expose for other modules
window.openRepostCheckerPopup = openRepostCheckerPopup;

// Preload repost checker data in the background for a trigger element without opening the UI.
async function preloadRepostChecker(triggerEl, context = {}) {
  const username = String(context.username || '').trim();
  const subreddit = normalizeSubreddit(context.subreddit || '');
  const currentTitle = String(context.currentTitle || '').trim();
  const currentUrl = String(context.currentUrl || '').trim();
  if (!username || !subreddit) return;

  // Use a transient state object separate from the popup state so we don't clobber UI if open
  const transientState = {
    triggerEl,
    username,
    subreddit,
    currentTitle,
    currentUrl,
    loading: true,
    error: null,
    entries: [],
    hasMore: false,
    possibleMatches: new Set(),
  };

  try {
    const fetched = await fetchUserListing(username, 'submitted', 25);
    transientState.entries = fetched.filter((c) => String((c?.data?.subreddit || '')).toLowerCase() === subreddit.toLowerCase());
    transientState.hasMore = fetched.length >= 25;
    // compute matches using same logic but apply to transient state
    const set = new Set();
    const normCurrentTitle = normalizeTitleForCompare(transientState.currentTitle || '');
    const curUrl = String(transientState.currentUrl || '').toLowerCase();
    (transientState.entries || []).forEach((row) => {
      const data = row?.data || {};
      const id = String(data.id || '');
      const title = normalizeTitleForCompare(data.title || '');
      const url = String(data.url || '').toLowerCase();
      if (normCurrentTitle && title && normCurrentTitle === title) {
        set.add(id);
      } else if (normCurrentTitle && title) {
        const sim = titleSimilarity(normCurrentTitle, title);
        if (sim >= 0.78) set.add(id);
      }
      if (curUrl && url && curUrl === url) set.add(id);
    });

    // Toggle classes on the trigger element
    try {
      if (triggerEl instanceof HTMLElement) {
        if (set.size > 0) triggerEl.classList.add('rrw-repost-pill--warning');
        else triggerEl.classList.remove('rrw-repost-pill--warning');
        if (Array.isArray(transientState.entries) && transientState.entries.length >= 2) triggerEl.classList.add('rrw-repost-pill--available');
        else triggerEl.classList.remove('rrw-repost-pill--available');
      }
    } catch (e) {
      // ignore
    }
  } catch (err) {
    // ignore errors for background preload
  }
}

window.preloadRepostChecker = preloadRepostChecker;
