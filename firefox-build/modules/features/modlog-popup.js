// ════════════════════════════════════════════════════════════════════════════════════════════════
// Modlog Popup Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Displays subreddit moderation log (removed posts, comments, bans, etc.) in popup.
// Dependencies: constants.js, state.js, utilities.js, services/reddit-api.js, features/overlay.js

const INLINE_MODLOG_POPUP_DEFAULTS = {
  subreddit: "",
  filterType: "all",     // all, removal, ban, approve, etc.
  searchQuery: "",
  pageSize: 30,
  currentPage: 0,
  allLogs: [],
  filteredLogs: [],
  loading: false,
  error: "",
};

// ──── Filtering & Formatting ────

function applyModlogFilters(logs, filterType, searchQuery) {
  const results = Array.isArray(logs) ? logs.filter((log) => {
    if (filterType !== "all" && log.action !== filterType) return false;
    const searchTerm = String(searchQuery || "").toLowerCase();
    if (searchTerm) {
      const text = `${log.author || ""} ${log.target_author || ""} ${log.details || ""}`.toLowerCase();
      if (!text.includes(searchTerm)) return false;
    }
    return true;
  }) : [];
  return results;
}

function formatModlogAction(log) {
  const action = String(log.action || "").toUpperCase();
  const author = log.author ? `by /u/${log.author}` : "";
  const target = log.target_author ? `to /u/${log.target_author}` : `${log.target_fullname || ""}`;
  return `${action} ${author} ${target}`;
}

// ──── Main Functions (STUBS - Rendering Phase 2) ────

async function openModlogPopup(subreddit) {
  // Stub: Initialize modlog popup state, fetch modlog, render popup
}

function renderModlogPopup() {
  // Stub: Render modlog list with filter/search controls and pagination
}

function closeModlogPopup() {
  inlineModlogPopupState = null;
  const root = document.getElementById(OVERLAY_ROOT_ID);
  if (!root) return;
  root.querySelectorAll(".rrw-modlog-popup-backdrop, .rrw-modlog-popup-container").forEach((el) => el.remove());
  if (!overlayState && !usernotesEditorState && !removalConfigEditorState && !inlineHistoryPopupState && !root.children.length) {
    root.remove();
  }
}

// ──── Inline Modlog Popup Functions ────

async function openInlineModlogPopup(triggerEl, context = {}) {
  if (!(triggerEl instanceof HTMLElement)) {
    return;
  }

  const target = String(context.target || "").trim().toLowerCase();
  const subreddit = normalizeSubreddit(context.subreddit || "").toLowerCase();
  if (!/^t[13]_[a-z0-9]{5,10}$/i.test(target) || !subreddit) {
    return;
  }

  if (
    inlineModlogPopupState
    && inlineModlogPopupState.triggerEl === triggerEl
    && inlineModlogPopupState.target === target
  ) {
    closeInlineModlogPopup();
    return;
  }

  inlineModlogPopupState = {
    triggerEl,
    target,
    subreddit,
    loading: true,
    error: "",
    entries: [],
  };
  bindInlineModlogPopupEvents();
  renderInlineModlogPopup();

  try {
    const index = await loadSubredditModlogIndex(subreddit);
    const entries = Array.isArray(index.get(target)) ? index.get(target).slice(0, 10) : [];
    if (!inlineModlogPopupState || inlineModlogPopupState.triggerEl !== triggerEl) {
      return;
    }
    inlineModlogPopupState.loading = false;
    inlineModlogPopupState.error = "";
    inlineModlogPopupState.entries = entries;
    renderInlineModlogPopup();
  } catch (error) {
    if (!inlineModlogPopupState || inlineModlogPopupState.triggerEl !== triggerEl) {
      return;
    }
    inlineModlogPopupState.loading = false;
    inlineModlogPopupState.entries = [];
    inlineModlogPopupState.error = error instanceof Error ? error.message : String(error);
    renderInlineModlogPopup();
  }
}

function closeInlineModlogPopup() {
  inlineModlogPopupState = null;
  const root = document.getElementById(INLINE_MODLOG_ROOT_ID);
  if (root instanceof HTMLElement) {
    root.remove();
  }
}

function renderInlineModlogPopup() {
  const state = inlineModlogPopupState;
  if (!state) {
    closeInlineModlogPopup();
    return;
  }

  const root = ensureInlineModlogPopupRoot();
  positionInlineHistoryPopup(root, state.triggerEl);

  const entryRows = Array.isArray(state.entries)
    ? state.entries.map((entry) => {
      const details = entry.details ? ` - ${escapeHtml(entry.details)}` : "";
      return `
        <li>
          <strong>${escapeHtml(entry.action || "unknown")}</strong>
          by u/${escapeHtml(entry.mod || "unknown")}
          - ${escapeHtml(formatRelativeTime(entry.createdUtc))}${details}
        </li>
      `;
    }).join("")
    : "";

  // eslint-disable-next-line no-unsanitized/property
  root.innerHTML = `
    <section class="rrw-inline-modlog-popup" role="dialog" aria-label="Item modlog entries">
      <header class="rrw-inline-modlog-header">
        <h4>Modlog - ${escapeHtml(state.target)}</h4>
        <button type="button" class="rrw-close" data-inline-modlog-close="1">Close</button>
      </header>
      <div class="rrw-inline-modlog-body">
        ${state.loading ? '<p class="rrw-muted">Loading modlog...</p>' : ""}
        ${state.error ? `<div class="rrw-error">${escapeHtml(state.error)}</div>` : ""}
        ${!state.loading && !state.error && !entryRows ? '<p class="rrw-muted">No recent modlog entries for this item.</p>' : ""}
        ${!state.loading && !state.error && entryRows ? `<ol class="rrw-inline-modlog-list">${entryRows}</ol>` : ""}
      </div>
    </section>
  `;

  const closeButton = root.querySelector("[data-inline-modlog-close='1']");
  if (closeButton instanceof HTMLButtonElement) {
    closeButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeInlineModlogPopup();
    });
  }
}

function bindInlineModlogPopupEvents() {
  if (inlineModlogPopupEventsBound) {
    return;
  }

  document.addEventListener("mousedown", (event) => {
    if (!inlineModlogPopupState) {
      return;
    }
    const root = document.getElementById(INLINE_MODLOG_ROOT_ID);
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }
    if (root?.contains(target)) {
      return;
    }
    if (inlineModlogPopupState.triggerEl?.contains(target)) {
      return;
    }
    closeInlineModlogPopup();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && inlineModlogPopupState) {
      closeInlineModlogPopup();
    }
  });

  window.addEventListener("resize", () => {
    if (!inlineModlogPopupState) {
      return;
    }
    const root = document.getElementById(INLINE_MODLOG_ROOT_ID);
    if (root instanceof HTMLElement) {
      positionInlineHistoryPopup(root, inlineModlogPopupState.triggerEl);
    }
  });

  inlineModlogPopupEventsBound = true;
}

function ensureInlineModlogPopupRoot() {
  let root = document.getElementById(INLINE_MODLOG_ROOT_ID);
  if (root instanceof HTMLElement) {
    return root;
  }
  root = document.createElement("div");
  root.id = INLINE_MODLOG_ROOT_ID;
  document.documentElement.appendChild(root);
  return root;
}

async function loadSubredditModlogIndex(subreddit) {
  const cleanSubreddit = normalizeSubreddit(subreddit).toLowerCase();
  if (!cleanSubreddit) {
    return new Map();
  }

  console.log("[ModBox QueueModlog] loadSubredditModlogIndex called with subreddit:", subreddit, "cleaned:", cleanSubreddit);

  const cached = modlogCacheBySubreddit.get(cleanSubreddit);
  console.log("[ModBox QueueModlog] Cache lookup - exists:", !!cached, "has index:", !!cached?.index, "index size:", cached?.index?.size || 0, "has loadingPromise:", !!cached?.loadingPromise);
  
  const now = Date.now();
  
  // IMPORTANT: Check for pending loadingPromise FIRST, before checking for stale cache!
  if (cached?.loadingPromise) {
    console.log("[ModBox QueueModlog] Returning pending loadingPromise (waiting for data)");
    return cached.loadingPromise;
  }
  
  // Only return cached index if it's valid and not expired
  if (cached && cached.index instanceof Map && now - cached.fetchedAt < MODLOG_CACHE_TTL_MS) {
    console.log("[ModBox QueueModlog] Returning cached index with size:", cached.index.size);
    return cached.index;
  }

  const loadingPromise = (async () => {
    const payload = await requestJsonViaBackground(
      `/r/${encodeURIComponent(cleanSubreddit)}/about/log.json?limit=200`,
      { oauth: true },
    );
    console.log("[ModBox QueueModlog] Raw payload from modlog API:", payload);
    console.log("[ModBox QueueModlog] Payload type:", typeof payload, "has data?", !!payload?.data, "children count:", payload?.data?.children?.length || 0);
    const index = extractModlogEntriesFromPayload(payload);
    console.log("[ModBox QueueModlog] Index after extraction - size:", index.size);
    modlogCacheBySubreddit.set(cleanSubreddit, {
      fetchedAt: Date.now(),
      index,
      loadingPromise: null,
    });
    console.log("[ModBox QueueModlog] Cache updated with index size:", index.size);
    return index;
  })().catch((error) => {
    console.error("[ModBox QueueModlog] Error loading modlog index:", error);
    modlogCacheBySubreddit.delete(cleanSubreddit);
    throw error;
  });

  modlogCacheBySubreddit.set(cleanSubreddit, {
    fetchedAt: now,
    index: cached?.index instanceof Map ? cached.index : new Map(),
    loadingPromise,
  });
  console.log("[ModBox QueueModlog] Starting new load - returning promise");

  return loadingPromise;
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return "unknown";
  const date = new Date(Number(timestamp) * 1000 || timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

async function updateModlogFilters(filterType, searchQuery) {
  if (!inlineModlogPopupState) return;
  inlineModlogPopupState.filterType = filterType;
  inlineModlogPopupState.searchQuery = searchQuery;
  inlineModlogPopupState.currentPage = 0;
  inlineModlogPopupState.filteredLogs = applyModlogFilters(
    inlineModlogPopupState.allLogs,
    filterType,
    searchQuery
  );
  renderModlogPopup();
}

async function fetchSubredditModlog(subreddit, options = {}) {
  // Stub: Fetch subreddit moderation log entries via API
  // Returns array of log entry objects with action, author, timestamp, details
}
