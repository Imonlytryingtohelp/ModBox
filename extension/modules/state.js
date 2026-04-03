// ============================================================================
// RUNTIME STATE & GLOBAL VARIABLES
// ============================================================================
// Overlay state management
let overlayState = null;

// In-memory config cache for reasons/config (session only)
let inMemoryConfigCache = null;
let inMemoryConfigCacheTimestamps = null; // Track cache timestamps for TTL
let inMemoryQuickActionsCache = null;
let inMemoryPlaybooksCache = null;

// Native remove interceptor state
let nativeRemoveInterceptorBound = false;
let interceptNativeRemoveEnabled = true;
let lastInteractedTarget = "";
let lastInteractedAt = 0;

// Editor state
let panelSettingsPromise = null;
let usernotesEditorState = null;
let removalConfigEditorState = null;
const usernotesCache = new Map();
const usernoteTypeMetaCache = new Map();

// Allowed launch subreddits caching
let allowedLaunchSubredditsPromise = null;
let allowedLaunchSubreddits = null;
let allowedLaunchSubredditsLoaded = false;

// Button visibility & preferences
let buttonVisibilityScope = "configured_plus_mod";
let preferredRedditLinkHost = "extension_preference";

// Queue bar state
let queueBarRoot = null;
let queueBarPollTimer = null;
let queueBarPollingListenersBound = false;
let queueBarCollapsed = false;
let queueBarContextCache = null;
let queueBarContextFetchedAt = 0;
let queueBarRefreshInFlight = false;
let queueBarFreshFlash = false;
let queueBarLastState = null;

// Extension settings
let currentExtensionSettingsWikiPage = DEFAULT_EXTENSION_SETTINGS_WIKI_PAGE;

// Queue tools state
const queueToolsSelectedTargets = new Set();
const queueToolsExpandedModlogTargets = new Set();
const modlogCacheBySubreddit = new Map();
let queueToolsStatusMessage = "";
let queueToolsErrorMessage = "";
let queueToolsBusy = false;
let queueToolsFilterType = "all";
let queueToolsFilterText = "";
let queueToolsBindRaf = 0;

// DOM container binding state
let visibleContainerBindScheduled = false;
let visibleContainerBindNeedsFullScan = false;
const visibleContainerBindPendingRoots = new Set();

// Background request scheduling
let backgroundRequestSchedulerActive = 0;
let backgroundRequestSchedulerSeq = 0;
const backgroundRequestSchedulerQueue = [];
const backgroundRequestInflight = new Map();
const backgroundRequestCache = new Map();

// Pointer state guard
// Prevents full DOM replacements (innerHTML / replaceChildren)
// from destroying a button node between mousedown and mouseup, which silently
// drops the click.  Event order is pointerdown → pointerup → click, so renders
// triggered by a click handler always fire after pointerup and are unaffected.
let isPointerDown = false;
const deferredRenders = new Set(); // values: "overlay" | "config_editor" | "queue_bar"

// Profile view state
let profileViewState = null;
let profileViewSearchToken = 0;

// Context popup state
let contextPopupState = null;
let contextPopupEventsBound = false;
let oldRedditReplyPillEventsBound = false;
let contextPopupFeatureEnabled = true;
let contextPopupStoredPosition = null;

// Theme state
let currentThemeMode = "auto";
let themeMediaQueryList = null;
let themeObserverBound = false;

// Inline popups state
let inlineHistoryPopupState = null;
let inlineHistoryPopupEventsBound = false;
let inlineModlogPopupState = null;
let inlineModlogPopupEventsBound = false;

// Comment nuke state
const commentNukeBusyTargets = new Set();
let commentNukeIgnoreDistinguished = false;

// ============================================================================
// REMOVAL CONFIG CACHE MANAGEMENT
// ============================================================================

function removalConfigCacheKey(subreddit) {
  return normalizeSubreddit(subreddit).toLowerCase();
}

function getInMemoryRemovalConfig(subreddit) {
  const key = removalConfigCacheKey(subreddit);
  if (!key || !(inMemoryConfigCache instanceof Map)) {
    return null;
  }

  // Check if cache entry exists and is still valid (not expired)
  const now = Date.now();
  const timestamps = inMemoryConfigCacheTimestamps || new Map();
  const cacheTime = timestamps.get(key);
  
  if (cacheTime && (now - cacheTime) > REMOVAL_CONFIG_CACHE_TTL_MS) {
    // Cache expired, remove it
    inMemoryConfigCache.delete(key);
    timestamps.delete(key);
    return null;
  }

  return inMemoryConfigCache.get(key) || null;
}

function setInMemoryRemovalConfig(subreddit, config) {
  const key = removalConfigCacheKey(subreddit);
  if (!key) {
    return;
  }
  if (!(inMemoryConfigCache instanceof Map)) {
    inMemoryConfigCache = new Map();
  }
  if (!(inMemoryConfigCacheTimestamps instanceof Map)) {
    inMemoryConfigCacheTimestamps = new Map();
  }
  inMemoryConfigCache.set(key, normalizeRemovalConfigDoc(config, subreddit));
  inMemoryConfigCacheTimestamps.set(key, Date.now());
}

function clearInMemoryRemovalConfig(subreddit) {
  const key = removalConfigCacheKey(subreddit);
  if (!key) {
    return;
  }
  if (inMemoryConfigCache instanceof Map) {
    inMemoryConfigCache.delete(key);
  }
  if (inMemoryConfigCacheTimestamps instanceof Map) {
    inMemoryConfigCacheTimestamps.delete(key);
  }
}

function configCacheMatchesSubreddit(cachedEntry, subreddit) {
  const cachedSubreddit = normalizeSubreddit(cachedEntry?.config?.subreddit || cachedEntry?.subreddit || "");
  return Boolean(cachedSubreddit) && cachedSubreddit.toLowerCase() === removalConfigCacheKey(subreddit);
}

// ============================================================================
// CONFIG CACHE MESSAGE HANDLERS
// ============================================================================

async function getConfigCache() {
  try {
    const response = await sendMessage({ type: "GET_CONFIG_CACHE" });
    return response?.data || null;
  } catch {
    return null;
  }
}

async function setConfigCache(config) {
  try {
    await sendMessage({ type: "SET_CONFIG_CACHE", config });
  } catch {
    // Silently ignore caching failures
  }
}

async function clearConfigCache() {
  try {
    await sendMessage({ type: "CLEAR_CONFIG_CACHE" });
  } catch {
    // Silently ignore
  }
}

async function clearCachedRemovalConfig(subreddit) {
  clearInMemoryRemovalConfig(subreddit);
  const cachedEntry = await getConfigCache();
  if (configCacheMatchesSubreddit(cachedEntry, subreddit)) {
    await clearConfigCache();
  }
}

// ============================================================================
// EXTENSION SETTINGS LOADING
// ============================================================================

async function getApiBaseUrl() {
  const stored = await ext.storage.sync.get([
    AUTO_CLOSE_KEY,
    INTERCEPT_NATIVE_REMOVE_KEY,
    LAST_SEND_MODE_KEY,
    "buttonVisibilityScope",
    QUEUE_BAR_ENABLED_KEY,
    QUEUE_BAR_SCOPE_KEY,
    QUEUE_BAR_LINK_HOST_KEY,
    QUEUE_BAR_USE_OLD_REDDIT_KEY,
    QUEUE_BAR_OPEN_IN_NEW_TAB_KEY,
    QUEUE_BAR_FIXED_SUBREDDIT_KEY,
    CONTEXT_POPUP_ENABLED_KEY,
    THEME_MODE_KEY,
  ]);

  const scope = String(stored?.buttonVisibilityScope || "configured_plus_mod");
  const queueScope = String(stored?.[QUEUE_BAR_SCOPE_KEY] || "current_subreddit");
  const queueLinkHost = normalizeQueueBarLinkHost(stored?.[QUEUE_BAR_LINK_HOST_KEY], "extension_preference");
  const queueFixedSubreddit = normalizeSubreddit(String(stored?.[QUEUE_BAR_FIXED_SUBREDDIT_KEY] || ""));
  return {
    autoCloseOnRemove: Boolean(stored?.[AUTO_CLOSE_KEY]),
    interceptNativeRemove:
      typeof stored?.[INTERCEPT_NATIVE_REMOVE_KEY] === "boolean" ? stored[INTERCEPT_NATIVE_REMOVE_KEY] : true,
    lastSendMode: typeof stored?.[LAST_SEND_MODE_KEY] === "string" ? stored[LAST_SEND_MODE_KEY] : null,
    buttonVisibilityScope: ["configured_plus_mod", "configured_only", "all"].includes(scope)
      ? scope
      : "configured_plus_mod",
    queueBarEnabled: typeof stored?.[QUEUE_BAR_ENABLED_KEY] === "boolean" ? stored[QUEUE_BAR_ENABLED_KEY] : true,
    queueBarScope: normalizeQueueBarScope(queueScope, "current_subreddit"),
    queueBarLinkHost: queueLinkHost,
    queueBarUseOldReddit:
      typeof stored?.[QUEUE_BAR_USE_OLD_REDDIT_KEY] === "boolean"
        ? stored[QUEUE_BAR_USE_OLD_REDDIT_KEY]
        : String(window.location.hostname || "").toLowerCase() === "old.reddit.com",
    queueBarFixedSubreddit: queueFixedSubreddit || null,
    queueBarOpenInNewTab:
      typeof stored?.[QUEUE_BAR_OPEN_IN_NEW_TAB_KEY] === "boolean" ? stored[QUEUE_BAR_OPEN_IN_NEW_TAB_KEY] : false,
    contextPopupEnabled:
      typeof stored?.[CONTEXT_POPUP_ENABLED_KEY] === "boolean" ? stored[CONTEXT_POPUP_ENABLED_KEY] : true,
    themeMode: normalizeThemeMode(stored?.[THEME_MODE_KEY], "auto"),
  };
}
