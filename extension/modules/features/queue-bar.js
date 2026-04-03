// ════════════════════════════════════════════════════════════════════════════════════════════════
// Queue Bar Feature Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Manages the moderation queue bar, queue counts, navigation, and polling.
// Dependencies: constants.js, state.js, utilities.js, services/reddit-api.js

// ──── Count Formatting & Parsing ────

function formatQueueBarCount(value) {
  if (!Number.isFinite(value) || value < 0) {
    return "?";
  }
  if (value > 999) {
    return "999+";
  }
  return String(Math.floor(value));
}

function parseQueueCount(payload) {
  const children = payload?.data?.children;
  if (Array.isArray(children)) {
    return children.length;
  }
  const dist = payload?.data?.dist;
  if (Number.isFinite(dist)) {
    return Math.max(0, Number(dist));
  }
  return 0;
}

function parseModmailUnreadCount(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  // Toolbox-compatible unread count payload categories.
  const categoryKeys = [
    "new",
    "inprogress",
    "appeals",
    "join_requests",
    "highlighted",
    "mod",
    "notifications",
  ];

  let categorySeen = false;
  const categorySum = categoryKeys.reduce((sum, key) => {
    const value = Number.parseInt(String(payload[key] ?? ""), 10);
    if (Number.isFinite(value) && value >= 0) {
      categorySeen = true;
      return sum + value;
    }
    return sum;
  }, 0);

  if (categorySeen) {
    return categorySum;
  }

  const directCountCandidates = [
    payload.conversationCount,
    payload.total,
    payload.totalCount,
    payload.count,
    payload.metadata?.totalCount,
    payload.metadata?.unreadCount,
  ];

  for (const candidate of directCountCandidates) {
    const parsed = Number.parseInt(String(candidate ?? ""), 10);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }

  return null;
}

// ──── Queue Bar Context & Cache Management ────

function clearQueueBarContextCache() {
  queueBarContextCache = null;
  queueBarContextFetchedAt = 0;
}

async function loadQueueBarCollapsedPreference() {
  try {
    const stored = await ext.storage.local.get([QUEUE_BAR_COLLAPSED_KEY]);
    queueBarCollapsed = Boolean(stored?.[QUEUE_BAR_COLLAPSED_KEY]);
  } catch {
    queueBarCollapsed = false;
  }
}

function persistQueueBarCollapsedPreference() {
  try {
    void ext.storage.local.set({ [QUEUE_BAR_COLLAPSED_KEY]: queueBarCollapsed });
  } catch {
    // Ignore storage errors for collapse preference.
  }
}

// ──── Queue Bar DOM Management ────

function ensureQueueBarRoot() {
  if (queueBarRoot && queueBarRoot.isConnected) {
    return queueBarRoot;
  }
  const root = document.createElement("div");
  root.id = "rrw-queuebar-root";
  document.documentElement.appendChild(root);
  queueBarRoot = root;
  return root;
}

function clearQueueBar() {
  if (queueBarRoot?.parentElement) {
    queueBarRoot.parentElement.removeChild(queueBarRoot);
  }
  queueBarRoot = null;
  queueBarLastState = null;
}

// ──── Background Request Helpers ────

function withTimeout(promise, timeoutMs, timeoutMessage) {
  const ms = Number(timeoutMs);
  if (!Number.isFinite(ms) || ms <= 0) {
    return promise;
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(timeoutMessage || "Request timed out"));
    }, ms);

    Promise.resolve(promise)
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

async function requestJsonViaBackground(url, options = null) {
  const method = String(options?.method || "GET").toUpperCase();
  const timeoutMs = Number.isFinite(Number(options?.timeoutMs))
    ? Number(options.timeoutMs)
    : BACKGROUND_REQUEST_TIMEOUT_MS;
  const response = await withTimeout(
    sendMessage({
      type: "API_REQUEST",
      url,
      method,
      body: method === "GET" || method === "HEAD" ? undefined : (options?.body ?? undefined),
      oauth: Boolean(options?.oauth),
      formData: Boolean(options?.formData),
    }),
    timeoutMs,
    `Request timed out (${method} ${String(url || "")})`,
  );
  const body = String(response?.text || "");
  if (!response?.ok) {
    throw new Error(formatRedditApiError(body, `HTTP ${response?.status || 0}`));
  }
  try {
    return body ? JSON.parse(body) : null;
  } catch {
    throw new Error("Received non-JSON response");
  }
}

function pumpBackgroundRequestSchedulerQueue() {
  while (
    backgroundRequestSchedulerActive < BACKGROUND_REQUEST_SCHEDULER_MAX_CONCURRENCY
    && backgroundRequestSchedulerQueue.length > 0
  ) {
    const nextTask = backgroundRequestSchedulerQueue.shift();
    backgroundRequestSchedulerActive += 1;

    Promise.resolve()
      .then(() => nextTask.run())
      .then((value) => nextTask.resolve(value))
      .catch((error) => nextTask.reject(error))
      .finally(() => {
        backgroundRequestSchedulerActive = Math.max(0, backgroundRequestSchedulerActive - 1);
        pumpBackgroundRequestSchedulerQueue();
      });
  }
}

function enqueueBackgroundRequest(taskFactory, priority = 0) {
  return new Promise((resolve, reject) => {
    backgroundRequestSchedulerQueue.push({
      id: backgroundRequestSchedulerSeq,
      priority: Number.isFinite(Number(priority)) ? Number(priority) : 0,
      run: taskFactory,
      resolve,
      reject,
    });
    backgroundRequestSchedulerSeq += 1;
    backgroundRequestSchedulerQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.id - b.id;
    });
    pumpBackgroundRequestSchedulerQueue();
  });
}

function buildBackgroundRequestCacheKey(url, options = null) {
  const method = String(options?.method || "GET").toUpperCase();
  const oauth = options?.oauth ? "oauth" : "anon";
  return `${method}:${oauth}:${String(url || "")}`;
}

async function requestJsonViaBackgroundScheduled(url, options = null, schedule = null) {
  const cacheTtlMs = Number(schedule?.cacheTtlMs || 0);
  const priority = Number(schedule?.priority || 0);
  const dedupe = schedule?.dedupe !== false;
  const key = buildBackgroundRequestCacheKey(url, options);
  const now = Date.now();

  if (cacheTtlMs > 0) {
    const cached = backgroundRequestCache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }
  }

  if (dedupe) {
    const inFlight = backgroundRequestInflight.get(key);
    if (inFlight) {
      return inFlight;
    }
  }

  const taskPromise = enqueueBackgroundRequest(
    () => requestJsonViaBackground(url, options),
    priority,
  );

  if (dedupe) {
    backgroundRequestInflight.set(key, taskPromise);
  }

  try {
    const value = await taskPromise;
    if (cacheTtlMs > 0) {
      backgroundRequestCache.set(key, {
        value,
        expiresAt: Date.now() + cacheTtlMs,
      });
      if (backgroundRequestCache.size > 200) {
        for (const [cacheKey, cacheValue] of backgroundRequestCache) {
          if (!cacheValue || cacheValue.expiresAt <= Date.now()) {
            backgroundRequestCache.delete(cacheKey);
          }
        }
      }
    }
    return value;
  } finally {
    if (dedupe) {
      backgroundRequestInflight.delete(key);
    }
  }
}

// ──── API Error Formatting ────

function formatRedditApiError(rawBody, fallbackMessage = "Request failed") {
  const text = String(rawBody || "").trim();
  if (!text) {
    return fallbackMessage;
  }

  try {
    const parsed = JSON.parse(text);
    const apiErrors = Array.isArray(parsed?.json?.errors) ? parsed.json.errors : [];
    if (apiErrors.length > 0) {
      const first = apiErrors[0];
      const detail = Array.isArray(first) ? first.filter(Boolean).join(": ") : String(first || "").trim();
      if (detail) {
        return detail;
      }
    }

    const message = String(parsed?.message || parsed?.error || "").trim();
    const reason = String(parsed?.reason || "").trim();
    const explanation = String(parsed?.explanation || parsed?.detail || "").trim();
    const fields = Array.isArray(parsed?.fields) ? parsed.fields.filter(Boolean).join(", ") : "";
    const parts = [message || fallbackMessage];
    if (reason) {
      parts.push(`(${reason})`);
    }
    if (explanation) {
      parts.push(`- ${explanation}`);
    }
    if (fields) {
      parts.push(`[fields: ${fields}]`);
    }
    const combined = parts.join(" ").trim();
    return combined || fallbackMessage;
  } catch {
    return text;
  }
}

// ──── Queue Data Fetching ────

async function fetchModmailUnreadCount() {
  const payload = await requestJsonViaBackgroundScheduled(
    "/api/mod/conversations/unread/count",
    { oauth: true },
    { cacheTtlMs: QUEUE_REQUEST_CACHE_TTL_MS, priority: 2 },
  );
  return parseModmailUnreadCount(payload);
}

async function fetchQueueBarCounts(scope, subreddit) {
  const normalizedSubreddit = normalizeSubreddit(subreddit);
  const queueTarget = scope === "mod_global" ? "mod" : normalizedSubreddit;
  const base = `https://old.reddit.com/r/${queueTarget}/about`;

  const [modqueue, unmoderated, reports, modmail] = await Promise.allSettled([
    requestJsonViaBackgroundScheduled(
      `${base}/modqueue.json?limit=100`,
      null,
      { cacheTtlMs: QUEUE_REQUEST_CACHE_TTL_MS, priority: 1 },
    ),
    requestJsonViaBackgroundScheduled(
      `${base}/unmoderated.json?limit=100`,
      null,
      { cacheTtlMs: QUEUE_REQUEST_CACHE_TTL_MS, priority: 1 },
    ),
    requestJsonViaBackgroundScheduled(
      `${base}/reports.json?limit=100`,
      null,
      { cacheTtlMs: QUEUE_REQUEST_CACHE_TTL_MS, priority: 1 },
    ),
    fetchModmailUnreadCount(),
  ]);

  const counts = {
    modqueue: modqueue.status === "fulfilled" ? parseQueueCount(modqueue.value) : null,
    unmoderated: unmoderated.status === "fulfilled" ? parseQueueCount(unmoderated.value) : null,
    reports: reports.status === "fulfilled" ? parseQueueCount(reports.value) : null,
    modmail: modmail.status === "fulfilled" ? modmail.value : null,
  };

  if (!Number.isFinite(counts.modmail) || counts.modmail < 0) {
    counts.modmail = null;
  }

  return counts;
}

// ──── Queue Bar Context Resolution ────

async function getQueueBarContext(settings, force = false) {
  const now = Date.now();
  if (!force && queueBarContextCache && now - queueBarContextFetchedAt < QUEUE_BAR_CONTEXT_TTL_MS) {
    return queueBarContextCache;
  }

  const [allowedSubsResult] = await Promise.allSettled([
    ensureAllowedLaunchSubredditsLoaded(),
  ]);

  const pageSubreddit = normalizeSubreddit(parseSubredditFromPath(window.location.pathname));
  const moderatedSubsKnown = allowedSubsResult.status === "fulfilled" && allowedLaunchSubredditsLoaded;
  const pageIsModerated =
    moderatedSubsKnown
    && pageSubreddit
    && allowedLaunchSubreddits instanceof Set
    && allowedLaunchSubreddits.has(pageSubreddit.toLowerCase());

  const useOldReddit =
    typeof settings.queueBarUseOldReddit === "boolean"
      ? settings.queueBarUseOldReddit
      : String(window.location.hostname || "").toLowerCase() === "old.reddit.com";

  preferredRedditLinkHost = ["extension_preference", "old_reddit", "new_reddit"].includes(settings.queueBarLinkHost)
    ? settings.queueBarLinkHost
    : "extension_preference";

  const result = {
    subreddit: pageSubreddit,
    pageIsModerated,
    moderatedSubsKnown,
    useOldReddit,
  };

  queueBarContextCache = result;
  queueBarContextFetchedAt = now;
  return result;
}

function buildQueueBarLinks(scope, subreddit, queueLinkHost, useOldReddit) {
  const normalizedSubreddit = normalizeSubreddit(subreddit);
  const queueTarget = scope === "mod_global" ? "mod" : normalizedSubreddit;
  const host = resolveRedditLinkHost(queueLinkHost, useOldReddit);
  const scopeLabel = scope === "mod_global" ? "r/mod" : `r/${normalizedSubreddit}`;
  const encodedEntity = encodeURIComponent(normalizedSubreddit);

  return {
    scopeLabel,
    modqueue: `https://${host}/r/${queueTarget}/about/modqueue/`,
    unmoderated: `https://${host}/r/${queueTarget}/about/unmoderated/`,
    reports: `https://${host}/r/${queueTarget}/about/reports/`,
    subreddit_new: `https://${host}/r/${queueTarget}/new/`,
    subreddit_comments: `https://old.reddit.com/r/${queueTarget}/comments/`,
    subreddit_home: `https://${host}/r/${queueTarget}/`,
    modmail:
      scope === "mod_global"
        ? "https://mod.reddit.com/mail/all"
        : `https://mod.reddit.com/mail/all?entity=${encodedEntity}`,
  };
}

// ──── Page Detection ────

function isQueueBarSuppressedPage() {
  const host = String(window.location.hostname || "").toLowerCase();
  const path = String(window.location.pathname || "").toLowerCase();
  if (!(host === "www.reddit.com" || host === "mod.reddit.com")) {
    return false;
  }
  return path === "/mail" || path.startsWith("/mail/");
}

function isModmailConversationPage() {
  const host = String(window.location.hostname || "").toLowerCase();
  const path = String(window.location.pathname || "").toLowerCase();
  if (host !== "www.reddit.com") return false;
  return /^\/mail\/[^/]+\/\w/.test(path);
}

// ──── Queue Bar Navigation ────

function navigateToQueueBarLink(url, openInNewTab = false) {
  if (!url) {
    return;
  }
  if (openInNewTab) {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return;
  }
  window.location.href = url;
}

function shouldOpenQueueBarLinkInNewTab(event, defaultOpenInNewTab = false) {
  if (!(event instanceof MouseEvent)) {
    return Boolean(defaultOpenInNewTab);
  }
  if (event.button === 1 || event.ctrlKey || event.metaKey) {
    return true;
  }
  return Boolean(defaultOpenInNewTab);
}

function bindQueueBarLinkButton(button, url, defaultOpenInNewTab = false) {
  if (!(button instanceof HTMLElement)) {
    return;
  }

  button.addEventListener("mousedown", (event) => {
    if (event.button === 1) {
      event.preventDefault();
    }
  });

  const openLink = (event) => {
    event.preventDefault();
    navigateToQueueBarLink(
      url,
      shouldOpenQueueBarLinkInNewTab(event, defaultOpenInNewTab),
    );
  };

  button.addEventListener("click", openLink);
  button.addEventListener("auxclick", (event) => {
    if (event.button !== 1) {
      return;
    }
    openLink(event);
  });
}

// ──── Queue Counts localStorage Cache ────

function getQueueCountsCacheKey(scope, subreddit) {
  const normalized = normalizeSubreddit(subreddit || "");
  return `rrw_queue_counts_${scope}_${normalized.toLowerCase()}`;
}

function saveQueueCountsCache(scope, subreddit, counts) {
  if (!counts || typeof counts !== "object") {
    return;
  }
  try {
    const key = getQueueCountsCacheKey(scope, subreddit);
    const cached = {
      counts,
      timestamp: Date.now(),
    };
    ext.storage?.local?.set({ [key]: cached });
    console.log("[ModBox] Saved queue counts cache for", scope, subreddit);
  } catch (error) {
    console.warn("[ModBox] Error saving queue counts cache:", error);
  }
}

async function loadQueueCountsCache(scope, subreddit) {
  try {
    const key = getQueueCountsCacheKey(scope, subreddit);
    return new Promise((resolve) => {
      ext.storage?.local?.get([key], (items) => {
        const cached = items?.[key];
        if (!cached || typeof cached !== "object") {
          resolve(null);
          return;
        }
        
        const now = Date.now();
        const age = now - (cached.timestamp || 0);
        
        // Check if cache is still valid (within TTL)
        if (age > QUEUE_COUNTS_CACHE_TTL_MS) {
          console.log("[ModBox] Queue counts cache expired for", scope, subreddit);
          resolve(null);
          return;
        }
        
        console.log("[ModBox] Using cached queue counts for", scope, subreddit, `(age: ${Math.round(age / 1000)}s)`);
        resolve(cached.counts || null);
      });
    });
  } catch (error) {
    console.warn("[ModBox] Error loading queue counts cache:", error);
    return null;
  }
}

// ──── Queue Bar Rendering ────

function renderQueueBar(state) {
  queueBarLastState = state;

  if (!state?.enabled) {
    clearQueueBar();
    return;
  }
  if (isPointerDown) {
    deferredRenders.add("queue_bar");
    return;
  }

  const root = ensureQueueBarRoot();
  root.replaceChildren();

  const shell = document.createElement("section");
  shell.className = "rrw-queuebar";
  shell.setAttribute("data-collapsed", queueBarCollapsed ? "1" : "0");

  const header = document.createElement("header");
  header.className = "rrw-queuebar-header";

  const titleWrap = document.createElement("div");
  titleWrap.className = "rrw-queuebar-title-wrap";

  const title = document.createElement("strong");
  title.className = "rrw-queuebar-title";
  title.textContent = "ModBox Queues";

  const subtitle = document.createElement("span");
  subtitle.className = "rrw-queuebar-subtitle";
  subtitle.textContent = state.links?.scopeLabel || "queues";

  titleWrap.appendChild(title);
  titleWrap.appendChild(subtitle);

  const headerActions = document.createElement("div");
  headerActions.className = "rrw-queuebar-header-actions";

  const refreshBtn = document.createElement("button");
  refreshBtn.type = "button";
  refreshBtn.className = "rrw-queuebar-icon-btn";
  refreshBtn.title = "Refresh queue counts";
  refreshBtn.textContent = "\u21BB";
  refreshBtn.addEventListener("click", () => {
    void refreshQueueBar(true);
  });

  const settingsBtn = document.createElement("button");
  settingsBtn.type = "button";
  settingsBtn.className = "rrw-queuebar-icon-btn";
  settingsBtn.title = "ModBox settings";
  settingsBtn.textContent = "\u2699";
  settingsBtn.addEventListener("click", () => {
    void (async () => {
      try {
        const pageSubreddit = normalizeSubreddit(parseSubredditFromPath(window.location.pathname));
        const queuedSubreddit = normalizeSubreddit(state?.subreddit || "");
        const panelSettings = await getPanelSettingsCached();
        await ensureAllowedLaunchSubredditsLoaded();

        const fixedSubreddit = normalizeSubreddit(panelSettings?.queueBarFixedSubreddit || "");
        const pageIsModerated = Boolean(
          pageSubreddit
          && allowedLaunchSubreddits instanceof Set
          && allowedLaunchSubreddits.has(pageSubreddit.toLowerCase()),
        );

        let subreddit = "";
        if (pageSubreddit) {
          subreddit = pageIsModerated ? pageSubreddit : (fixedSubreddit || "");
        } else if (queuedSubreddit && queuedSubreddit.toLowerCase() !== "mod") {
          subreddit = queuedSubreddit;
        } else {
          subreddit = fixedSubreddit || "";
        }

        if (!subreddit) {
          renderQueueBar({
            ...state,
            error: "Queue bar: subreddit unavailable for settings",
          });
          return;
        }

        const cached = await getCachedRemovalConfig(subreddit);
        const config = cached || await loadRemovalConfigFromWiki(subreddit);
        await setCachedRemovalConfig(subreddit, config);
        await openRemovalConfigEditor({
          subreddit,
          config,
          flairTemplates: [],
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        renderQueueBar({
          ...state,
          error: `Queue bar: unable to open settings (${message})`,
        });
      }
    })();
  });

  const collapseBtn = document.createElement("button");
  collapseBtn.type = "button";
  collapseBtn.className = "rrw-queuebar-icon-btn";
  collapseBtn.title = queueBarCollapsed ? "Expand queue bar" : "Collapse queue bar";
  collapseBtn.textContent = queueBarCollapsed ? "\u25B4" : "\u25BE";
  collapseBtn.addEventListener("click", () => {
    queueBarCollapsed = !queueBarCollapsed;
    persistQueueBarCollapsedPreference();
    renderQueueBar(queueBarLastState || state);
  });

  if (!queueBarCollapsed) {
    headerActions.appendChild(settingsBtn);
    headerActions.appendChild(refreshBtn);
  }
  headerActions.appendChild(collapseBtn);

  const badgeDefs = [
    {
      key: "reports",
      label: "Reports",
      iconSvg: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8 14 13H2L8 1.8Z"/><path d="M8 5.2V8.8"/><circle cx="8" cy="11.3" r="0.65"/></svg>',
      url: state.links?.reports,
    },
    {
      key: "modmail",
      label: "Modmail",
      iconSvg: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1.8" y="3" width="12.4" height="10" rx="1.8" ry="1.8"/><path d="M2.4 4 8 8.3 13.6 4"/></svg>',
      url: state.links?.modmail,
    },
    {
      key: "modqueue",
      label: "Modqueue",
      iconSvg: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="2" width="12" height="12" rx="2" ry="2"/><path d="M5 6.2h6M5 8.8h6M5 11.4h3.8"/></svg>',
      url: state.links?.modqueue,
    },
    {
      key: "unmoderated",
      label: "Unmoderated",
      iconSvg: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 8s2.2-3.7 6.5-3.7S14.5 8 14.5 8s-2.2 3.7-6.5 3.7S1.5 8 1.5 8Z"/><circle cx="8" cy="8" r="2"/></svg>',
      url: state.links?.unmoderated,
    },
  ];

  if (queueBarCollapsed) {
    const compactList = document.createElement("div");
    compactList.className = "rrw-queuebar-compact-list";

    for (const badge of badgeDefs) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "rrw-queuebar-compact-item";
      btn.title = `Open ${badge.label}`;
      const count = state.counts?.[badge.key];
      btn.innerHTML = `<span class="rrw-queuebar-compact-icon" aria-hidden="true">${badge.iconSvg}</span><span class="rrw-queuebar-compact-count">${escapeHtml(formatQueueBarCount(count))}</span>`;
      bindQueueBarLinkButton(btn, badge.url, Boolean(state.openInNewTab));
      compactList.appendChild(btn);
    }

    header.appendChild(compactList);
    header.appendChild(headerActions);
    shell.appendChild(header);
  } else {
    header.appendChild(titleWrap);
    header.appendChild(headerActions);
    shell.appendChild(header);
  }

  if (!queueBarCollapsed) {
    const badges = document.createElement("div");
    badges.className = "rrw-queuebar-badges";

    for (const badge of badgeDefs) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "rrw-queuebar-badge";
      btn.title = `Open ${badge.label}`;
      const count = state.counts?.[badge.key];
      btn.innerHTML = `<span class="rrw-queuebar-badge-main"><span class="rrw-queuebar-badge-icon" aria-hidden="true">${badge.iconSvg}</span><span class="rrw-queuebar-badge-label">${escapeHtml(badge.label)}</span></span><span class="rrw-queuebar-badge-count">${escapeHtml(formatQueueBarCount(count))}</span>`;
      bindQueueBarLinkButton(btn, badge.url, Boolean(state.openInNewTab));
      badges.appendChild(btn);
    }

    shell.appendChild(badges);

    const secondaryLinks = [
      { label: "New Posts", url: state.links?.subreddit_new },
      { label: "Comment Feed", url: state.links?.subreddit_comments },
      { label: "Subreddit", url: state.links?.subreddit_home },
    ];

    const secondaryRow = document.createElement("div");
    secondaryRow.className = "rrw-queuebar-secondary-links";
    for (const link of secondaryLinks) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "rrw-queuebar-secondary-link";
      btn.textContent = link.label;
      btn.title = `Open ${link.label}`;
      bindQueueBarLinkButton(btn, link.url, Boolean(state.openInNewTab));
      secondaryRow.appendChild(btn);
    }
    shell.appendChild(secondaryRow);

    const footer = document.createElement("div");
    footer.className = "rrw-queuebar-footer";
    if (state.loading) {
      footer.textContent = "Loading queue counts...";
    } else if (state.error) {
      footer.textContent = state.error;
      footer.setAttribute("data-error", "1");
    } else if (Number.isFinite(state.updatedAt)) {
      footer.textContent = `Updated ${new Date(state.updatedAt).toLocaleTimeString()}`;
    } else {
      footer.textContent = `Queue status for ${state.links?.scopeLabel || "configured subreddit"}`;
    }
    if (queueBarFreshFlash && !state.loading && !state.error) {
      queueBarFreshFlash = false;
      footer.setAttribute("data-rrw-fresh", "1");
    }
    shell.appendChild(footer);
  }

  root.appendChild(shell);
}

// ──── Queue Bar Refresh & Polling ────

async function refreshQueueBar(force = false) {
  console.log("[ModBox] refreshQueueBar called, force=", force);
  if (isQueueBarSuppressedPage()) {
    console.log("[ModBox] Queue bar suppressed on this page");
    clearQueueBar();
    return;
  }

  if (queueBarRefreshInFlight) {
    console.log("[ModBox] Queue bar refresh already in flight, returning");
    return;
  }

  queueBarRefreshInFlight = true;
  try {
    console.log("[ModBox] Starting queue bar refresh");
    const settings = await getPanelSettingsCached();
    const configuredScope = normalizeQueueBarScope(settings.queueBarScope, "current_subreddit");

    // Render initial state with loading indicator or previous data
    renderQueueBar({
      enabled: true,
      loading: true,
      counts: queueBarLastState?.counts || null,
      links: queueBarLastState?.links || null,
      subreddit: queueBarLastState?.subreddit || "",
      updatedAt: queueBarLastState?.updatedAt || null,
      openInNewTab:
        typeof queueBarLastState?.openInNewTab === "boolean"
          ? queueBarLastState.openInNewTab
          : Boolean(settings.queueBarOpenInNewTab),
      error: "",
    });

    const context = await getQueueBarContext(settings, force);
    const subreddit = normalizeSubreddit(context.subreddit || "");
    const fixedSubreddit = normalizeSubreddit(settings.queueBarFixedSubreddit || "");
    const fixedIsModerated =
      fixedSubreddit
      && allowedLaunchSubreddits instanceof Set
      && allowedLaunchSubreddits.has(fixedSubreddit.toLowerCase());

    let scope = "mod_global";
    let scopeSubreddit = "mod";

    if (configuredScope === "fixed_subreddit" && fixedIsModerated) {
      scope = "fixed_subreddit";
      scopeSubreddit = fixedSubreddit;
    } else if (
      configuredScope === "current_subreddit"
      && subreddit
      && (context.pageIsModerated || !context.moderatedSubsKnown)
    ) {
      scope = "current_subreddit";
      scopeSubreddit = subreddit;
    }

    const links = buildQueueBarLinks(scope, scopeSubreddit, settings.queueBarLinkHost, Boolean(context.useOldReddit));

    // Try to load cached counts first for instant display
    const cachedCounts = await loadQueueCountsCache(scope, scopeSubreddit);
    if (cachedCounts) {
      renderQueueBar({
        enabled: true,
        loading: false,
        counts: cachedCounts,
        links,
        subreddit: scopeSubreddit,
        updatedAt: queueBarLastState?.updatedAt || null,
        openInNewTab: Boolean(settings.queueBarOpenInNewTab),
        error: "",
      });
    }

    // Fetch fresh counts in background (non-blocking)
    void (async () => {
      try {
        const freshCounts = await fetchQueueBarCounts(scope, scopeSubreddit);
        queueBarFreshFlash = true;
        saveQueueCountsCache(scope, scopeSubreddit, freshCounts);
        renderQueueBar({
          enabled: true,
          loading: false,
          counts: freshCounts,
          links,
          subreddit: scopeSubreddit,
          updatedAt: Date.now(),
          openInNewTab: Boolean(settings.queueBarOpenInNewTab),
          error: "",
        });
      } catch (error) {
        console.warn("[ModBox] Background queue fetch failed:", error);
        const message = error instanceof Error ? error.message : String(error);
        // Only render error if we don't have cached data or previous state
        if (!cachedCounts && !queueBarLastState?.counts) {
          renderQueueBar({
            enabled: true,
            loading: false,
            counts: null,
            links,
            subreddit: scopeSubreddit,
            updatedAt: null,
            openInNewTab: Boolean(settings.queueBarOpenInNewTab),
            error: `Queue bar: ${message}`,
          });
        }
      }
    })();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    renderQueueBar({
      enabled: true,
      loading: false,
      counts: queueBarLastState?.counts || null,
      links: queueBarLastState?.links || null,
      subreddit: queueBarLastState?.subreddit || "",
      updatedAt: queueBarLastState?.updatedAt || null,
      openInNewTab:
        typeof queueBarLastState?.openInNewTab === "boolean"
          ? queueBarLastState.openInNewTab
          : false,
      error: `Queue bar: ${message}`,
    });
  } finally {
    queueBarRefreshInFlight = false;
  }
}

function getQueueBarPollIntervalMs() {
  const pageVisible = document.visibilityState === "visible";
  const windowFocused = typeof document.hasFocus === "function" ? document.hasFocus() : true;
  return pageVisible && windowFocused
    ? QUEUE_BAR_ACTIVE_POLL_INTERVAL_MS
    : QUEUE_BAR_BACKGROUND_POLL_INTERVAL_MS;
}

function scheduleQueueBarPolling() {
  if (queueBarPollTimer) {
    clearTimeout(queueBarPollTimer);
  }
  queueBarPollTimer = setTimeout(async () => {
    try {
      await refreshQueueBar(false);
    } finally {
      scheduleQueueBarPolling();
    }
  }, getQueueBarPollIntervalMs());
}

function bindQueueBarPollingListeners() {
  if (queueBarPollingListenersBound) {
    return;
  }
  queueBarPollingListenersBound = true;

  document.addEventListener("visibilitychange", () => {
    scheduleQueueBarPolling();
    if (document.visibilityState === "visible") {
      void refreshQueueBar(true);
    }
  });

  window.addEventListener("focus", () => {
    scheduleQueueBarPolling();
    void refreshQueueBar(true);
  });

  window.addEventListener("blur", () => {
    scheduleQueueBarPolling();
  });
}

// ──── Queue Bar Initialization ────

async function initQueueBar() {
  console.log("[ModBox] initQueueBar starting...");
  await loadQueueBarCollapsedPreference();
  console.log("[ModBox] queueBarCollapsed loaded:", queueBarCollapsed);
  await refreshQueueBar(true);
  console.log("[ModBox] refreshQueueBar completed");
  bindQueueBarPollingListeners();
  console.log("[ModBox] bindQueueBarPollingListeners completed");
  scheduleQueueBarPolling();
  console.log("[ModBox] scheduleQueueBarPolling completed, queue bar initialized");
}
