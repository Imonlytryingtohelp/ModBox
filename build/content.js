
// ------------------------------------------------------------------------------
// constants.js
// ------------------------------------------------------------------------------

// ============================================================================

// EXTENSION API

// ============================================================================

const ext = globalThis.browser ?? chrome;



// ============================================================================

// CSS CLASSES & DOM IDs

// ============================================================================

const BUTTON_CLASS = "rrw-launch-btn";

const PROFILE_BUTTON_CLASS = "rrw-profile-btn";

const OVERLAY_ROOT_ID = "rrw-overlay-root";

const PROFILE_ROOT_ID = "rrw-profile-root";

const CONTEXT_POPUP_ROOT_ID = "rrw-context-popup-root";

const INLINE_MODLOG_ROOT_ID = "rrw-inline-modlog-root";



// ============================================================================

// STORAGE KEYS (for chrome.storage.local and chrome.storage.sync)

// ============================================================================

const AUTO_CLOSE_KEY = "autoCloseOnRemove";

const INTERCEPT_NATIVE_REMOVE_KEY = "interceptNativeRemove";

const CONTEXT_POPUP_ENABLED_KEY = "contextPopupEnabled";

const HISTORY_BUTTON_ENABLED_KEY = "historyButtonEnabled";

const COMMENT_NUKE_BUTTON_ENABLED_KEY = "commentNukeButtonEnabled";

const QUEUE_BAR_ENABLED_KEY = "queueBarEnabled";

const QUEUE_BAR_SCOPE_KEY = "queueBarScope";

const QUEUE_BAR_LINK_HOST_KEY = "queueBarLinkHost";

const QUEUE_BAR_USE_OLD_REDDIT_KEY = "queueBarUseOldReddit";

const QUEUE_BAR_OPEN_IN_NEW_TAB_KEY = "queueBarOpenInNewTab";

const QUEUE_BAR_FIXED_SUBREDDIT_KEY = "queueBarFixedSubreddit";

const QUEUE_BAR_COLLAPSED_KEY = "queueBarCollapsed";

const QUEUE_BAR_POSITION_KEY = "queueBarPosition";

const CONTEXT_POPUP_POSITION_KEY = "contextPopupPosition";

const THEME_MODE_KEY = "themeMode";

const LAST_SEND_MODE_KEY = "lastSendMode";

const COMMENT_NUKE_IGNORE_DISTINGUISHED_KEY = "commentNukeIgnoreDistinguished";

const EXTENSION_SETTINGS_WIKI_PAGE_KEY = "extensionSettingsWikiPage";

const CANNED_REPLIES_WIKI_URL_KEY = "cannedRepliesWikiUrl";

const UPDATE_CHECK_RESULT_KEY = "updateCheckResult";

const UPDATE_SEEN_KEY = "updateSeen";



// ============================================================================

// WIKI PAGE REFERENCES & SCHEMAS

// ============================================================================

const REMOVAL_REASONS_WIKI_PAGE = "modbox/removalreasons";

const REMOVAL_REASONS_WIKI_SCHEMA = "ModBox/removal-reasons/v1";

const QUICK_ACTIONS_WIKI_PAGE = "modbox/quickactions";

const QUICK_ACTIONS_WIKI_SCHEMA = "ModBox/quick-actions/v1";

const PLAYBOOKS_WIKI_PAGE = "modbox/playbooks";

const PLAYBOOKS_WIKI_SCHEMA = "ModBox/playbooks/v1";

const CANNED_REPLIES_WIKI_PAGE = "modbox/cannedreplies";

const CANNED_REPLIES_WIKI_SCHEMA = "ModBox/canned-replies/v1";

const TOOLBOX_WIKI_PAGE = "toolbox";

const EXTENSION_SETTINGS_WIKI_SCHEMA = "ModBox/extension-settings/v1";

const DEFAULT_EXTENSION_SETTINGS_WIKI_PAGE = "modbox/extensionsettings";



// ============================================================================

// DEFAULTS & MESSAGES

// ============================================================================

const DEFAULT_REMOVAL_PM_SUBJECT = "Your {kind} was removed by the r/{subreddit} mod team.";

const DEFAULT_TOOLBOX_USERNOTE_TYPES = [

  { key: "gooduser", color: "green", text: "Good Contributor" },

  { key: "spamwatch", color: "fuchsia", text: "Spam Watch" },

  { key: "spamwarn", color: "purple", text: "Spam Warning" },

  { key: "abusewarn", color: "orange", text: "Abuse Warning" },

  { key: "ban", color: "red", text: "Ban" },

  { key: "permban", color: "darkred", text: "Permanent Ban" },

  { key: "botban", color: "black", text: "Bot Ban" },

];



// ============================================================================

// CACHE TIMEOUTS (milliseconds)

// ============================================================================

const USERNOTES_PREVIEW_LENGTH = 15;

const USERNOTES_CACHE_TTL_MS = 60000;

const USERNOTE_TYPE_META_CACHE_TTL_MS = 60000;

const MODLOG_CACHE_TTL_MS = 60000;

const QUEUE_BAR_ACTIVE_POLL_INTERVAL_MS = 30000;

const QUEUE_BAR_BACKGROUND_POLL_INTERVAL_MS = 180000;

const QUEUE_BAR_CONTEXT_TTL_MS = 120000;

const BACKGROUND_REQUEST_TIMEOUT_MS = 30000;

const BACKGROUND_REQUEST_SCHEDULER_MAX_CONCURRENCY = 2;

const QUEUE_REQUEST_CACHE_TTL_MS = 10000;

const QUEUE_COUNTS_CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

const REMOVAL_CONFIG_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const ALLOWED_LAUNCH_SUBREDDITS_CACHE_KEY = "allowedLaunchSubredditsCache";

const ALLOWED_LAUNCH_SUBREDDITS_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const UPDATE_CHECK_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours



// ============================================================================

// DOM SELECTORS & CONSTRAINTS

// ============================================================================

const BINDABLE_CONTAINER_SELECTORS = [

  "article",

  "shreddit-post",

  "shreddit-comment",

  ".Comment",

  ".thing.link",

  ".thing.comment",

  "mod-queue-list-item",

];

const BINDABLE_CONTAINER_SELECTOR = BINDABLE_CONTAINER_SELECTORS.join(", ");

const MAX_PENDING_BIND_ROOTS = 200;

const MAX_MUTATION_ADDED_NODES_BEFORE_FULL_SCAN = 500;

// ------------------------------------------------------------------------------
// state.js
// ------------------------------------------------------------------------------

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

let historyButtonEnabled = false;

let commentNukeButtonEnabled = false;



// Queue bar state

let queueBarRoot = null;

let queueBarPollTimer = null;

let queueBarPollingListenersBound = false;

let queueBarCollapsed = false;

let queueBarPosition = "bottom_right";

let queueBarContextCache = null;

let queueBarContextFetchedAt = 0;

let queueBarRefreshInFlight = false;

let queueBarFreshFlash = false;

let queueBarLastState = null;

let queueBarUpdateStatus = null; // Current update status

let queueBarHasUpdateBadge = false; // Whether update badge is shown



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

// drops the click.  Event order is pointerdown â†’ pointerup â†’ click, so renders

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



// Queue modlog display state

let queueModlogDisplayRafScheduled = false;



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

    QUEUE_BAR_POSITION_KEY,

    CONTEXT_POPUP_ENABLED_KEY,

    THEME_MODE_KEY,

    CANNED_REPLIES_WIKI_URL_KEY,

  ]);



  const scope = String(stored?.buttonVisibilityScope || "configured_plus_mod");

  const queueScope = String(stored?.[QUEUE_BAR_SCOPE_KEY] || "current_subreddit");

  const queueLinkHost = normalizeQueueBarLinkHost(stored?.[QUEUE_BAR_LINK_HOST_KEY], "extension_preference");

  const queueFixedSubreddit = normalizeSubreddit(String(stored?.[QUEUE_BAR_FIXED_SUBREDDIT_KEY] || ""));

  const queuePosition = ["bottom_left", "bottom_right"].includes(String(stored?.[QUEUE_BAR_POSITION_KEY] || "")) ? stored[QUEUE_BAR_POSITION_KEY] : "bottom_right";

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

    queueBarPosition: queuePosition,

    contextPopupEnabled:

      typeof stored?.[CONTEXT_POPUP_ENABLED_KEY] === "boolean" ? stored[CONTEXT_POPUP_ENABLED_KEY] : true,

    themeMode: normalizeThemeMode(stored?.[THEME_MODE_KEY], "auto"),

    cannedRepliesWikiUrl: String(stored?.[CANNED_REPLIES_WIKI_URL_KEY] || "").trim(),

  };

}

// ------------------------------------------------------------------------------
// utilities.js
// ------------------------------------------------------------------------------

// ============================================================================

// UTILITY FUNCTIONS - URL & PARSING

// ============================================================================



function parseUrl(href) {

  try {

    return new URL(href, window.location.origin);

  } catch {

    return null;

  }

}



function wait(ms) {

  return new Promise((resolve) => setTimeout(resolve, ms));

}



function isRedditCommentPath(pathname) {

  return /\/comments\//i.test(pathname);

}



function collectCandidateTargets(root) {

  const links = Array.from(root.querySelectorAll("a[href*='/comments/']"));

  return links

    .map((link) => parseUrl(link.getAttribute("href") || ""))

    .filter((url) => Boolean(url) && isRedditCommentPath(url.pathname));

}



function parsePostIdFromPath(pathname) {

  const match = String(pathname || "").match(/\/comments\/([a-z0-9]{5,10})/i);

  return match ? match[1].toLowerCase() : null;

}



function parseTargetToFullname(target) {

  const value = String(target || "").trim();

  if (!value) {

    throw new Error("target is required");

  }



  const fullnameMatch = value.match(/^t([13])_[a-z0-9]{5,10}$/i);

  if (fullnameMatch) {

    return value.toLowerCase();

  }



  let parsed;

  try {

    parsed = new URL(value);

  } catch {

    throw new Error("target must be a fullname or Reddit URL");

  }



  const host = String(parsed.hostname || "").toLowerCase();

  if (!(host === "reddit.com" || host.endsWith(".reddit.com"))) {

    throw new Error("target URL must be on reddit.com");

  }



  const segments = String(parsed.pathname || "")

    .split("/")

    .map((part) => String(part || "").trim())

    .filter(Boolean);



  const commentsIndex = segments.indexOf("comments");

  if (commentsIndex < 0 || commentsIndex + 1 >= segments.length) {

    throw new Error("unsupported Reddit URL format");

  }



  const postId = String(segments[commentsIndex + 1] || "").toLowerCase();

  if (!/^[a-z0-9]{5,10}$/.test(postId)) {

    throw new Error("invalid Reddit post id in target URL");

  }



  const trailing = segments.slice(commentsIndex + 2).map((part) => String(part || "").toLowerCase());

  let commentId = "";

  if (trailing.length >= 3 && trailing[1] === "-" && /^[a-z0-9]{5,10}$/.test(trailing[2])) {

    commentId = trailing[2];

  } else if (trailing.length >= 2 && /^[a-z0-9]{5,10}$/.test(trailing[1])) {

    commentId = trailing[1];

  } else if (trailing.length >= 1 && /^[a-z0-9]{5,10}$/.test(trailing[0])) {

    commentId = trailing[0];

  }



  return commentId ? `t1_${commentId}` : `t3_${postId}`;

}



function getThingTypeFromFullname(fullname) {

  return String(fullname || "").toLowerCase().startsWith("t3_") ? "submission" : "comment";

}



function formatRedditByIdUrl(fullname, linkHostPreference = preferredRedditLinkHost, useOldReddit = String(window.location.hostname || "").toLowerCase() === "old.reddit.com") {

  if (!fullname) {

    return null;

  }

  const host = resolveRedditLinkHost(linkHostPreference, useOldReddit);

  return `https://${host}/by_id/${String(fullname).toLowerCase()}`;

}



function resolveRedditLinkHost(linkHostPreference, useOldReddit) {

  if (linkHostPreference === "old_reddit") {

    return "old.reddit.com";

  }

  if (linkHostPreference === "new_reddit") {

    return "www.reddit.com";

  }

  return useOldReddit ? "old.reddit.com" : "www.reddit.com";

}



function extractFullnameFromAttributes(container) {

  const attrCandidates = [

    "id",

    "data-fullname",

    "fullname",

    "thingid",

    "post-id",

    "data-post-id",

    "comment-id",

    "data-comment-id",

  ];



  for (const attr of attrCandidates) {

    const raw = (container.getAttribute(attr) || "").trim().toLowerCase();

    if (!raw) {

      continue;

    }

    if (/^t[13]_[a-z0-9]{5,10}$/i.test(raw)) {

      return raw;

    }

    if (/^[a-z0-9]{5,10}$/i.test(raw)) {

      if (attr.includes("comment")) {

        return `t1_${raw}`;

      }

      return `t3_${raw}`;

    }

  }



  return null;

}



// ============================================================================

// UTILITY FUNCTIONS - STRING MANIPULATION

// ============================================================================



function escapeHtml(value) {

  return String(value ?? "")

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/\"/g, "&quot;")

    .replace(/'/g, "&#39;");

}



function normalizeSubreddit(value) {

  const raw = String(value || "").trim().replace(/^\/+|\/+$/g, "");

  if (!raw) {

    return "";

  }

  if (/^r\//i.test(raw)) {

    return raw.slice(2);

  }

  return raw;

}



function parseSubredditFromPath(pathname) {

  const match = String(pathname || "").match(/^\/r\/([^/]+)/i);

  return match ? normalizeSubreddit(match[1]) : "";

}



function parseSubredditFromCommentPath(pathname) {

  const match = String(pathname || "").match(/^\/r\/([^/]+)\/comments\//i);

  return match ? normalizeSubreddit(match[1]) : "";

}



function slugifyReasonKey(value, fallback = "new-reason") {

  const slug = String(value || "")

    .toLowerCase()

    .trim()

    .replace(/[^a-z0-9]+/g, "-")

    .replace(/(^-|-$)/g, "");

  return slug || fallback;

}



function normalizeQueueBarLinkHost(value, fallback = "extension_preference") {

  const clean = String(value || fallback).trim();

  if (clean === "backend_preference") {

    return "extension_preference";

  }

  return ["extension_preference", "old_reddit", "new_reddit"].includes(clean)

    ? clean

    : fallback;

}



function getRedditHostForLinkHost(linkHostSetting = "extension_preference") {

  switch (String(linkHostSetting).trim()) {

    case "old_reddit":

      return "old.reddit.com";

    case "new_reddit":

      return "www.reddit.com";

    case "extension_preference":

    default:

      return "reddit.com";

  }

}



function buildRedditUrl(permalink, linkHostSetting = "extension_preference") {

  const host = getRedditHostForLinkHost(linkHostSetting);

  const path = String(permalink || "").trim();

  return `https://${host}${path}`;

}



function normalizeQueueBarScope(value, fallback = "current_subreddit") {

  const clean = String(value || "").trim();

  if (clean === "configured_subreddit") {

    return "current_subreddit";

  }

  return ["current_subreddit", "fixed_subreddit", "mod_global"].includes(clean)

    ? clean

    : fallback;

}



function decodeToolboxText(value) {

  const raw = String(value || "");

  if (!raw) {

    return "";

  }

  try {

    return decodeURIComponent(raw).trim();

  } catch {

    return raw.trim();

  }

}



function normalizeRemovalSendMode(value, fallback = "reply") {

  const lowered = String(value || fallback).trim().toLowerCase();

  if (["reply", "pm", "both", "none"].includes(lowered)) {

    return lowered;

  }

  return fallback;

}



function decodeHtmlEntities(value) {

  const textarea = document.createElement("textarea");

  textarea.innerHTML = String(value || "");

  return textarea.value;

}



// ============================================================================

// UTILITY FUNCTIONS - HTML RENDERING & SANITIZATION

// ============================================================================



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



// ============================================================================

// URL & LINK FORMATTING

// ============================================================================



function resolveRedditLinkHost(linkHostPreference, useOldReddit) {

  if (linkHostPreference === "old_reddit") {

    return "old.reddit.com";

  }

  if (linkHostPreference === "new_reddit") {

    return "www.reddit.com";

  }

  return useOldReddit ? "old.reddit.com" : "www.reddit.com";

}



function formatRedditUrl(subreddit, postId, linkHostPreference = preferredRedditLinkHost, useOldReddit = String(window.location.hostname || "").toLowerCase() === "old.reddit.com") {

  if (!subreddit || !postId) {

    return null;

  }

  const host = resolveRedditLinkHost(linkHostPreference, useOldReddit);

  return `https://${host}/r/${subreddit}/comments/${postId}/`;

}



// ============================================================================

// VALIDATION & NORMALIZATION

// ============================================================================



function isQueueBarScope(value) {

  return value === "current_subreddit" || value === "configured_subreddit" || value === "fixed_subreddit" || value === "mod_global";

}



function isFullname(target) {

  return /^t[13]_[a-z0-9]{5,10}$/i.test((target || "").trim());

}



function isReasonForThing(reason, thingType) {

  if (!reason || !reason.is_enabled) {

    return false;

  }

  if (reason.applies_to === "both") {

    return true;

  }

  if (thingType === "submission") {

    return reason.applies_to === "posts";

  }

  return reason.applies_to === "comments";

}



function blockOptions(block) {

  const options = block?.payload?.options;

  if (!Array.isArray(options)) {

    return [];

  }

  return options.map((opt) => {

    if (typeof opt === "string") {

      return { label: opt, value: opt };

    }

    if (opt && typeof opt === "object") {

      return {

        label: String(opt.label ?? opt.value ?? "option"),

        value: String(opt.value ?? opt.label ?? "option"),

      };

    }

    return { label: "option", value: "option" };

  });

}



function setFieldValue(key, value) {

  if (!overlayState || !key) {

    return;

  }

  overlayState.inputValues[key] = value;

  if (overlayState.validationErrors?.[key]) {

    delete overlayState.validationErrors[key];

  }

}



function validateSelectedFields() {

  if (!overlayState) {

    return true;

  }



  const errors = {};

  for (const block of overlayState.dynamicBlocks || []) {

    if (!block?.required || !block.key) {

      continue;

    }

    if (!String(overlayState.inputValues?.[block.key] || "").trim()) {

      errors[block.key] = `${block.label || block.key} is required.`;

    }

  }



  overlayState.validationErrors = errors;

  if (Object.keys(errors).length > 0) {

    overlayState.error = "Please complete the highlighted fields.";

    return false;

  }

  return true;

}



function clearPreviewTimer() {

  if (overlayState?.previewTimer) {

    clearTimeout(overlayState.previewTimer);

    overlayState.previewTimer = null;

  }

}



function schedulePreview() {

  if (!overlayState || !overlayState.fullname) {

    return;

  }



  clearPreviewTimer();



  const reasonKeys = overlayState.selectedReasonKeys || [];

  if (reasonKeys.length === 0) {

    overlayState.previewMessage = "";

    overlayState.previewSubject = "";

    overlayState.previewError = "";

    overlayState.previewLoading = false;

    renderOverlay();

    return;

  }



  overlayState.previewLoading = true;

  overlayState.previewError = "";

  const requestId = (overlayState.previewRequestId || 0) + 1;

  overlayState.previewRequestId = requestId;



  overlayState.previewTimer = setTimeout(async () => {

    try {

      const reasonLookup = new Map((overlayState.reasons || []).map((reason) => [reason.external_key, reason]));

      const selectedReasons = (overlayState.selectedReasonKeys || [])

        .map((key) => reasonLookup.get(key))

        .filter(Boolean);

      const currentThingType = overlayState?.resolved?.thingType || (String(overlayState.fullname || "").startsWith("t3_") ? "submission" : "comment");

      const filteredReasons = selectedReasons.filter((reason) => isReasonForThing(reason, currentThingType));

      const author = String(overlayState?.resolved?.author || "");

      const subreddit = normalizeSubreddit(overlayState?.resolved?.subreddit || parseSubredditFromPath(window.location.pathname));

      const kind = currentThingType === "submission" ? "post" : "comment";

      const previewMessage = buildRemovalPreviewMessage(

        overlayState.removalConfig,

        filteredReasons,

        author,

        kind,

        subreddit,

        overlayState.inputValues || {},

      );

      const previewSubject = buildRemovalPreviewSubject(

        overlayState.removalConfig,

        author,

        kind,

        subreddit,

      );

      if (!overlayState || overlayState.previewRequestId !== requestId) {

        return;

      }

      overlayState.previewMessage = previewMessage;

      overlayState.previewSubject = previewSubject;

      overlayState.previewError = "";

    } catch (error) {

      if (!overlayState || overlayState.previewRequestId !== requestId) {

        return;

      }

      const message = error instanceof Error ? error.message : String(error);

      overlayState.previewError = message;

      overlayState.previewMessage = "";

      overlayState.previewSubject = "";

    } finally {

      if (overlayState && overlayState.previewRequestId === requestId) {

        overlayState.previewLoading = false;

        renderOverlay();

      }

    }

  }, 200);

}



// ============================================================================

// MODLOG UTILITIES

// ============================================================================



function extractModlogEntriesFromPayload(payload) {

  const rows = Array.isArray(payload?.data?.children) ? payload.data.children : [];

  const byTarget = new Map();

  rows.forEach((row) => {

    const data = row?.data || {};

    const target = String(data?.target_fullname || "").trim().toLowerCase();

    if (!/^t[13]_[a-z0-9]{5,10}$/i.test(target)) {

      return;

    }

    const entry = {

      action: String(data?.action || "").trim() || "unknown",

      mod: String(data?.mod || "").trim() || "unknown",

      createdUtc: Number(data?.created_utc || 0),

      details: String(data?.details || "").trim(),

    };

    const list = byTarget.get(target) || [];

    list.push(entry);

    byTarget.set(target, list);

  });



  byTarget.forEach((list) => {

    list.sort((a, b) => (b.createdUtc || 0) - (a.createdUtc || 0));

  });



  return byTarget;

}



// ============================================================================

// QUEUE LISTING UTILITIES

// ============================================================================



function isQueueListingPage(pathname = window.location.pathname) {

  const path = String(pathname || "");

  const result = /\/about\/(modqueue|unmoderated|reports)(?:\/|$)/i.test(path) ||

         /\/mod\/\w+\/queue(?:\/|$)/i.test(path);

  console.log("[ModBox] isQueueListingPage: pathname=", path, "result=", result);

  return result;

}



function getThingTypeLabelFromFullname(fullname) {

  return String(fullname || "").toLowerCase().startsWith("t3_") ? "post" : "comment";

}



function pickTargetForContainer(container) {

  const fullname = extractFullnameFromAttributes(container);

  if (fullname) {

    return fullname;

  }



  const candidates = collectCandidateTargets(container);

  if (candidates.length > 0) {

    candidates.sort((a, b) => b.pathname.length - a.pathname.length);

    return candidates[0].toString();

  }



  const postId = parsePostIdFromPath(window.location.pathname);

  if (postId) {

    return `t3_${postId}`;

  }



  if (isRedditCommentPath(window.location.pathname)) {

    return window.location.href;

  }



  return null;

}



function resolveContainerSubreddit(container) {

  if (!(container instanceof HTMLElement)) {

    return parseSubredditFromPath(window.location.pathname);

  }



  const attrSubreddit =

    normalizeSubreddit(container.getAttribute("data-subreddit") || "") ||

    normalizeSubreddit(container.dataset.subreddit || "");

  if (attrSubreddit) {

    return attrSubreddit;

  }



  const candidates = collectCandidateTargets(container);

  for (const url of candidates) {

    const fromLink = parseSubredditFromCommentPath(url.pathname);

    if (fromLink) {

      return fromLink;

    }

  }



  return parseSubredditFromPath(window.location.pathname);

}

// ------------------------------------------------------------------------------
// reddit-api.js
// ------------------------------------------------------------------------------

// ============================================================================

// REDDIT API SERVICE LAYER

// ============================================================================

// Core API request functions and Reddit moderation actions.

// Handles both direct (native session) and OAuth-based API calls.



// ============================================================================

// MESSAGE & COMMUNICATION

// ============================================================================



function sendMessage(message) {

  return new Promise((resolve, reject) => {

    ext.runtime.sendMessage(message, (response) => {

      const runtimeError = ext.runtime?.lastError;

      if (runtimeError) {

        reject(new Error(runtimeError.message || "Extension runtime error"));

        return;

      }

      resolve(response);

    });

  });

}



// ============================================================================

// SESSION ERROR TRACKING

// ============================================================================

const sessionErrorsLogged = new Set();



function shouldLogError(errorKey) {

  if (sessionErrorsLogged.has(errorKey)) {

    return false;

  }

  sessionErrorsLogged.add(errorKey);

  return true;

}



// ============================================================================

// TIMEOUT UTILITIES

// ============================================================================



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



// ============================================================================

// REDDIT MODHASH & SESSION UTILITIES

// ============================================================================



function getRedditModhash() {

  const globalReaders = [

    () => globalThis?.reddit?.uh,

    () => globalThis?.r?.config?.modhash,

    () => globalThis?.__r?.config?.modhash,

    () => globalThis?.__INITIAL_STATE__?.user?.modhash,

  ];



  for (const readCandidate of globalReaders) {

    let candidate = "";

    try {

      candidate = readCandidate();

    } catch {

      candidate = "";

    }

    const value = String(candidate || "").trim();

    if (value) {

      return value;

    }

  }



  const domCandidates = [

    document.querySelector("input[name='uh']")?.value,

    document.querySelector("input[name='modhash']")?.value,

    document.querySelector("meta[name='csrf-token']")?.getAttribute("content"),

  ];



  for (const candidate of domCandidates) {

    const value = String(candidate || "").trim();

    if (value) {

      return value;

    }

  }



  return "";

}



function getSafeErrorMessage(errorLike) {

  try {

    if (errorLike && typeof errorLike === "object" && "message" in errorLike) {

      const message = errorLike.message;

      if (typeof message === "string" && message.trim()) {

        return message;

      }

    }

  } catch {

    // Some Firefox cross-compartment objects can throw on property access.

  }



  try {

    const fallback = String(errorLike);

    return fallback && fallback.trim() ? fallback : "Unknown error";

  } catch {

    return "Unknown error";

  }

}



function summarizeRedditFailureMessage(message) {

  const text = String(message || "").trim();

  if (!text) {

    return "Unknown error";

  }

  if (/<\s*!doctype\s+html|<\s*html/i.test(text)) {

    return "Received HTML response instead of Reddit API JSON";

  }

  return text.length > 400 ? `${text.slice(0, 400)}...` : text;

}



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



// ============================================================================

// BACKGROUND REQUEST SCHEDULING & CACHING

// ============================================================================



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



// ============================================================================

// CORE API REQUEST FUNCTIONS

// ============================================================================



async function redditFormRequest(path, params, options = null) {

  const payload = params instanceof URLSearchParams ? new URLSearchParams(params) : new URLSearchParams();

  if (!payload.has("api_type")) {

    payload.set("api_type", "json");

  }

  const isFirefox = /firefox\//i.test(String(globalThis?.navigator?.userAgent || ""));

  const forceBackground = Boolean(options?.forceBackground);

  const preferredOrigins = Array.isArray(options?.preferredOrigins) && options.preferredOrigins.length > 0

    ? options.preferredOrigins

    : [

      window.location.origin,

      "https://www.reddit.com",

      "https://old.reddit.com",

    ];



  console.log("[ModBox] redditFormRequest calling:", path);

  let firstFailureMessage = "";

  if (forceBackground) {

    firstFailureMessage = "Direct form request skipped; using background request";

    console.log("[ModBox] Direct form request skipped for:", path);

  } else if (isFirefox) {

    firstFailureMessage = "Direct form request disabled on Firefox; using background request";

    console.log("[ModBox] Firefox detected, skipping direct form request path");

  } else {

    const pageModhash = getRedditModhash();

    console.log("[ModBox] pageModhash available:", !!pageModhash);

    if (pageModhash) {

      const directPayload = new URLSearchParams(payload);

      directPayload.set("uh", pageModhash);



      try {

        console.log("[ModBox] Attempting direct fetch to:", `${window.location.origin}${path}`);

        const response = await fetch(`${window.location.origin}${path}`, {

          method: "POST",

          credentials: "include",

          headers: {

            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",

            "X-Modhash": pageModhash,

          },

          body: directPayload.toString(),

        });



        console.log("[ModBox] Fetch response status:", response.status);

        const text = await response.text();

        let parsed = null;

        try {

          parsed = text ? JSON.parse(text) : null;

        } catch {

          parsed = null;

        }



        if (!response.ok) {

          throw new Error((parsed && (parsed.message || parsed.error)) || text || `HTTP ${response.status}`);

        }



        const errors = parsed?.json?.errors;

        if (Array.isArray(errors) && errors.length > 0) {

          const first = errors[0];

          const detail = Array.isArray(first) ? first.join(": ") : String(first);

          throw new Error(detail || "Reddit API returned errors");

        }



        console.log("[ModBox] Direct fetch successful, returning:", parsed);

        return parsed;

      } catch (error) {

        firstFailureMessage = summarizeRedditFailureMessage(getSafeErrorMessage(error));

        console.debug("[ModBox] Direct fetch failed (fallback will run):", firstFailureMessage);

      }

    } else {

      firstFailureMessage = "Reddit modhash unavailable in this page context";

      console.warn("[ModBox] No modhash available");

    }

  }



  console.log("[ModBox] Falling back to background message for:", path);

  const fallbackResult = await sendMessage({

    type: "REDDIT_FORM_REQUEST",

    path,

    params: Object.fromEntries(

      (payload instanceof URLSearchParams ? payload : new URLSearchParams(payload)).entries()

    ),

    preferredOrigins,

  });



  console.log("[ModBox] Background message result:", fallbackResult);

  if (!fallbackResult?.ok) {

    throw new Error(fallbackResult?.error || firstFailureMessage || "Native Reddit form request failed");

  }



  if (fallbackResult?.json && typeof fallbackResult.json === "object") {

    return fallbackResult.json;

  }



  const text = String(fallbackResult?.text || "");

  if (!text) {

    return null;

  }

  try {

    return JSON.parse(text);

  } catch {

    return null;

  }

}



async function redditFormRequestBackgroundOnly(path, params, preferredOrigins = null) {

  const payload = params instanceof URLSearchParams ? new URLSearchParams(params) : new URLSearchParams();

  if (!payload.has("api_type")) {

    payload.set("api_type", "json");

  }



  const fallbackResult = await sendMessage({

    type: "REDDIT_FORM_REQUEST",

    path,

    params: Object.fromEntries(

      (payload instanceof URLSearchParams ? payload : new URLSearchParams(payload)).entries()

    ),

    preferredOrigins: Array.isArray(preferredOrigins) && preferredOrigins.length

      ? preferredOrigins

      : [

        "https://old.reddit.com",

        "https://www.reddit.com",

        "https://sh.reddit.com",

      ],

  });



  if (!fallbackResult?.ok) {

    throw new Error(summarizeRedditFailureMessage(fallbackResult?.error || "Native Reddit form request failed"));

  }



  if (fallbackResult?.json && typeof fallbackResult.json === "object") {

    return fallbackResult.json;

  }



  const text = String(fallbackResult?.text || "");

  if (!text) {

    return null;

  }

  try {

    return JSON.parse(text);

  } catch {

    throw new Error("Received non-JSON response");

  }

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



// ============================================================================

// MOD ACTIONS - APPROVALS, REMOVALS, LOCKS, POSTS

// ============================================================================



async function approveThingViaNativeSession(fullname) {

  const cleanFullname = String(fullname || "").trim().toLowerCase();

  if (!cleanFullname) {

    throw new Error("Missing target fullname for native approval");

  }



  const params = new URLSearchParams();

  params.set("id", cleanFullname);

  await redditFormRequest("/api/approve", params);

  return true;

}



async function removeThingViaNativeSession(fullname, spam = false) {

  const cleanFullname = String(fullname || "").trim().toLowerCase();

  if (!cleanFullname) {

    throw new Error("Missing target fullname for native removal");

  }



  console.log("[ModBox] removeThingViaNativeSession called for:", cleanFullname, "spam:", spam);

  const params = new URLSearchParams();

  params.set("id", cleanFullname);

  params.set("spam", spam ? "true" : "false");

  const result = await redditFormRequest("/api/remove", params);

  console.log("[ModBox] removeThingViaNativeSession result:", result);

  return true;

}



async function isThingRemovedViaReddit(fullname) {

  const cleanFullname = String(fullname || "").trim().toLowerCase();

  if (!/^t[13]_[a-z0-9]{5,10}$/i.test(cleanFullname)) {

    return false;

  }



  try {

    const info = await requestJsonViaBackground(`/api/info.json?id=${encodeURIComponent(cleanFullname)}`, { oauth: true });

    const data = info?.data?.children?.[0]?.data;

    if (!data || typeof data !== "object") {

      return false;

    }

    const removedByCategory = String(data?.removed_by_category || "").trim();

    return Boolean(data?.removed === true || data?.spam === true || removedByCategory || data?.banned_by);

  } catch {

    return false;

  }

}



async function confirmThingRemovedViaReddit(fullname) {

  for (let attempt = 0; attempt < 2; attempt += 1) {

    if (await isThingRemovedViaReddit(fullname)) {

      return true;

    }

    await new Promise((resolve) => setTimeout(resolve, 250));

  }

  return false;

}



async function lockThingViaNativeSession(fullname) {

  const cleanFullname = String(fullname || "").trim().toLowerCase();

  if (!cleanFullname) {

    throw new Error("Missing target fullname for native lock");

  }



  const params = new URLSearchParams();

  params.set("id", cleanFullname);

  await redditFormRequest("/api/lock", params);

  return true;

}



async function unlockThingViaNativeSession(fullname) {

  const cleanFullname = String(fullname || "").trim().toLowerCase();

  if (!cleanFullname) {

    throw new Error("Missing target fullname for native unlock");

  }



  const params = new URLSearchParams();

  params.set("id", cleanFullname);

  await redditFormRequest("/api/unlock", params);

  return true;

}



async function distinguishThingViaNativeSession(fullname, sticky = false) {

  const cleanFullname = String(fullname || "").trim().toLowerCase();

  if (!cleanFullname) {

    throw new Error("Missing target fullname for native distinguish");

  }



  const params = new URLSearchParams();

  params.set("id", cleanFullname);

  params.set("how", "yes");

  if (sticky) {

    params.set("sticky", "true");

  }

  await redditFormRequest("/api/distinguish", params);

  return true;

}



async function postCommentViaNativeSession(parentFullname, text) {

  const rawParent = String(parentFullname || "").trim();

  const body = String(text || "").trim();

  if (!rawParent || !body) {

    throw new Error("Missing parent fullname or comment text");

  }



  let cleanParent = "";

  try {

    cleanParent = /^t[13]_[a-z0-9]{5,10}$/i.test(rawParent)

      ? rawParent.toLowerCase()

      : parseTargetToFullname(rawParent);

  } catch {

    throw new Error("Comment step target is not a valid Reddit post/comment target");

  }



  // Prefer Reddit's canonical fullname whenever possible.

  try {

    const info = await requestJsonViaBackground(`/api/info.json?id=${encodeURIComponent(cleanParent)}`, { oauth: true });

    const canonical = String(info?.data?.children?.[0]?.data?.name || "").trim().toLowerCase();

    if (/^t[13]_[a-z0-9]{5,10}$/i.test(canonical)) {

      cleanParent = canonical;

    }

  } catch {

    // Non-fatal: continue with derived target.

  }



  const params = new URLSearchParams();

  params.set("thing_id", cleanParent);

  params.set("text", body);

  const attemptedTargets = [cleanParent];

  try {

    return await redditFormRequest("/api/comment", params);

  } catch (error) {

    const message = getSafeErrorMessage(error);

    const hasInvalidId = /INVALID_ID|specified id is invalid/i.test(message);

    if (!hasInvalidId) {

      throw error;

    }



    const retryTargets = new Set();



    // If a stale/invalid comment target is provided, retry against its parent post.

    if (cleanParent.startsWith("t1_")) {

      try {

        const info = await requestJsonViaBackground(`/api/info.json?id=${encodeURIComponent(cleanParent)}`, { oauth: true });

        const parentPostFullname = String(info?.data?.children?.[0]?.data?.link_id || "").trim().toLowerCase();

        if (/^t3_[a-z0-9]{5,10}$/i.test(parentPostFullname)) {

          retryTargets.add(parentPostFullname);

        }

      } catch {

        // Keep trying other fallbacks below.

      }

    }



    // If the original target was a Reddit URL, retry with that URL's post id.

    try {

      const parsedTargetUrl = new URL(rawParent, window.location.origin);

      const postIdFromTarget = parsePostIdFromPath(parsedTargetUrl.pathname);

      if (postIdFromTarget) {

        retryTargets.add(`t3_${postIdFromTarget}`);

      }

    } catch {

      // Ignore invalid URL fallback.

    }



    // Final fallback: current page post id when available.

    const postIdFromPage = parsePostIdFromPath(window.location.pathname);

    if (postIdFromPage) {

      retryTargets.add(`t3_${postIdFromPage}`);

    }



    for (const retryTarget of retryTargets) {

      if (!retryTarget || retryTarget === cleanParent) {

        continue;

      }

      try {

        attemptedTargets.push(retryTarget);

        const retryParams = new URLSearchParams();

        retryParams.set("thing_id", retryTarget);

        retryParams.set("text", body);

        return await redditFormRequest("/api/comment", retryParams);

      } catch {

        // Try next fallback target.

      }

    }



    throw new Error(`${message} [thing_id attempted: ${attemptedTargets.join(", ")}]`);

  }

}



async function postPlaybookCommentStepViaNativeSession(step, parentFullname, text) {

  // Support comment_as_subreddit workaround for playbook comment steps (remove, post as subreddit, re-approve)

  if (step?.comment_as_subreddit === true) {

    await removeThingViaNativeSession(parentFullname);

    await sendRemovalCommentAsSubreddit(parentFullname, text, false);

    await approveThingViaNativeSession(parentFullname);

    return;

  }

  // Otherwise, post as normal user

  return postCommentViaNativeSession(parentFullname, text);

}



async function sendRemovalCommentAsSubreddit(fullname, message, lockComment = false) {

  const cleanFullname = String(fullname || "").trim().toLowerCase();

  const cleanMessage = String(message || "").trim();

  if (!cleanFullname || !cleanMessage) {

    throw new Error("Missing removal target or message");

  }



  const endpoint = cleanFullname.startsWith("t1_")

    ? "/api/v1/modactions/removal_comment_message"

    : "/api/v1/modactions/removal_link_message";



  return requestJsonViaBackground(endpoint, {

    method: "POST",

    oauth: true,

    body: {

      item_id: [cleanFullname],

      message: cleanMessage,

      title: "removal reason through ModBox",

      type: "public_as_subreddit",

      lock_comment: Boolean(lockComment),

    },

  });

}



async function sendModmailViaReddit({ subreddit, to, subject, body, isAuthorHidden = true }) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  const cleanTo = to == null ? null : String(to || "").trim().replace(/^u\//i, "");

  const cleanSubject = String(subject || "").trim();

  const cleanBody = String(body || "").trim();

  if (!cleanSubreddit || !cleanSubject || !cleanBody) {

    throw new Error("Missing subreddit, subject, or body for modmail");

  }



  return requestJsonViaBackground("/api/mod/conversations", {

    method: "POST",

    oauth: true,

    formData: true,

    body: {

      srName: cleanSubreddit,

      to: cleanTo || undefined,

      subject: cleanSubject,

      body: cleanBody,

      isAuthorHidden: String(Boolean(isAuthorHidden)),

    },

  });

}



async function archiveModmailConversationViaReddit(conversationId) {

  const cleanConversationId = String(conversationId || "").trim();

  if (!cleanConversationId) {

    return null;

  }

  return requestJsonViaBackground(`/api/mod/conversations/${encodeURIComponent(cleanConversationId)}/archive`, {

    method: "POST",

    oauth: true,

  });

}



// ============================================================================

// MOD ACTIONS - FLAIR, BANS

// ============================================================================



async function applyFlairViaNativeSession({ subreddit, flairTemplateId, username, linkFullname }) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  const cleanTemplateId = String(flairTemplateId || "").trim();

  const cleanUsername = String(username || "").trim();

  const cleanLinkFullname = String(linkFullname || "").trim().toLowerCase();

  if (!cleanSubreddit) {

    throw new Error("Missing subreddit for native flair change");

  }

  if (!cleanUsername && !cleanLinkFullname) {

    throw new Error("Missing flair target for native flair change");

  }



  const baseParams = new URLSearchParams();

  const baseBody = {

    flair_template_id: cleanTemplateId,

    return_rtjson: "none",

    api_type: "json",

    r: cleanSubreddit,

  };

  baseParams.set("flair_template_id", cleanTemplateId);

  baseParams.set("return_rtjson", "none");

  baseParams.set("api_type", "json");

  baseParams.set("r", cleanSubreddit);

  if (cleanUsername) {

    baseBody.name = cleanUsername;

    baseParams.set("name", cleanUsername);

  }

  if (cleanLinkFullname) {

    baseBody.link = cleanLinkFullname;

    baseParams.set("link", cleanLinkFullname);

  }



  const flairPaths = [

    `/r/${encodeURIComponent(cleanSubreddit)}/api/selectflair`,

    "/api/selectflair",

    `/r/${encodeURIComponent(cleanSubreddit)}/api/flair`,

    "/api/flair",

  ];



  const nativeFailures = [];

  for (const path of flairPaths) {

    try {

      const params = new URLSearchParams(baseParams);

      await redditFormRequestBackgroundOnly(path, params, [

        "https://old.reddit.com",

        "https://www.reddit.com",

        "https://sh.reddit.com",

      ]);

      return true;

    } catch (error) {

      nativeFailures.push(`${path}: ${summarizeRedditFailureMessage(getSafeErrorMessage(error))}`);

    }

  }



  const oauthFailures = [];

  for (const path of flairPaths) {

    try {

      await requestJsonViaBackground(path, {

        method: "POST",

        oauth: true,

        formData: true,

        body: { ...baseBody },

      });

      return true;

    } catch (error) {

      oauthFailures.push(`${path}: ${summarizeRedditFailureMessage(getSafeErrorMessage(error))}`);

    }

  }



  throw new Error(

    `Flair application failed. Native: ${nativeFailures.join(" | ") || "unknown error"}. OAuth: ${oauthFailures.join(" | ") || "unknown error"}`,

  );

}



async function banUserViaNativeSession({ subreddit, username, durationDays, banMessage, note }) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  const cleanUser = String(username || "").trim();

  if (!cleanSubreddit || !cleanUser) {

    throw new Error("Missing subreddit or username for native ban");

  }



  const cleanNote = String(note || "").trim().slice(0, 300);

  const params = new URLSearchParams();

  params.set("name", cleanUser);

  params.set("type", "banned");

  params.set("r", cleanSubreddit);

  if (cleanNote) params.set("note", cleanNote);

  params.set("ban_message", String(banMessage || ""));

  if (Number.isFinite(durationDays) && durationDays > 0) {

    params.set("duration", String(durationDays));

  }



  await redditFormRequest("/api/friend", params);

  return true;

}



async function unbanUserViaNativeSession({ subreddit, username }) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  const cleanUser = String(username || "").trim();

  if (!cleanSubreddit || !cleanUser) {

    throw new Error("Missing subreddit or username for native unban");

  }



  const params = new URLSearchParams();

  params.set("name", cleanUser);

  params.set("type", "banned");

  params.set("r", cleanSubreddit);



  await redditFormRequest("/api/unfriend", params);

  return true;

}



// ============================================================================

// FETCH UTILITIES

// ============================================================================



async function fetchModmailUnreadCount() {

  const payload = await requestJsonViaBackgroundScheduled(

    "/api/mod/conversations/unread/count",

    { oauth: true },

    { cacheTtlMs: QUEUE_REQUEST_CACHE_TTL_MS, priority: 2 },

  );

  return parseModmailUnreadCount(payload);

}



async function fetchUserFlairTemplatesViaReddit(subreddit) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  if (!cleanSubreddit) {

    return [];

  }



  try {

    console.log("[ModBox] Fetching user flair for subreddit:", cleanSubreddit);

    const payload = await requestJsonViaBackground(`/r/${encodeURIComponent(cleanSubreddit)}/api/user_flair_v2`, {

      oauth: true,

    });

    console.log("[ModBox] Raw user_flair_v2 response:", payload);

    

    // API can return either an array directly or an object with user_flair property

    const rows = Array.isArray(payload)

      ? payload

      : (Array.isArray(payload?.user_flair) ? payload.user_flair : (Array.isArray(payload?.choices) ? payload.choices : []));

    

    console.log("[ModBox] Extracted rows:", rows, "count:", rows.length);

    

    const templates = [];

    const seen = new Set();

    rows.forEach((row) => {

      if (!row || typeof row !== "object") {

        return;

      }

      const id = String(row.id || "").trim();

      if (!id || seen.has(id)) {

        return;

      }

      seen.add(id);

      templates.push({

        id,

        text: row.text == null ? null : String(row.text),

        css_class: row.css_class == null ? null : String(row.css_class),

        mod_only: typeof row.mod_only === "boolean" ? row.mod_only : null,

        user_selectable: typeof row.user_selectable === "boolean" ? row.user_selectable : null,

      });

    });



    // Sort by text label, then ID

    templates.sort((a, b) => {

      const aLabel = String(a.text || "").toLowerCase();

      const bLabel = String(b.text || "").toLowerCase();

      if (aLabel !== bLabel) {

        return aLabel.localeCompare(bLabel);

      }

      return String(a.id || "").toLowerCase().localeCompare(String(b.id || "").toLowerCase());

    });

    

    console.log("[ModBox] Final user flair templates:", templates);

    return templates;

  } catch (err) {

    console.error("[ModBox] Error fetching user flair templates:", err);

    return [];

  }

}



// ============================================================================

// TARGET RESOLUTION & VALIDATION

// ============================================================================



async function resolveTargetViaReddit(target) {

  const fullname = parseTargetToFullname(target);

  const info = await requestJsonViaBackground(`/api/info.json?id=${encodeURIComponent(fullname)}`, { oauth: true });

  const children = Array.isArray(info?.data?.children) ? info.data.children : [];

  const item = children.find((row) => String(row?.kind || "").toLowerCase().startsWith("t"));

  if (!item?.data) {

    throw new Error("Unable to resolve Reddit target metadata");

  }



  const data = item.data;

  const subreddit = normalizeSubreddit(data.subreddit || "");

  const normalizedSubreddit = subreddit.toLowerCase();

  let actionableReason = null;

  let isActionable = true;



  try {

    await ensureAllowedLaunchSubredditsLoaded();

    if (allowedLaunchSubreddits instanceof Set && allowedLaunchSubreddits.size) {

      isActionable = allowedLaunchSubreddits.has(normalizedSubreddit);

      if (!isActionable) {

        actionableReason = `Target belongs to r/${subreddit}, and this account is not a moderator there.`;

      }

    }

  } catch {

    // Fail open here: permission is still enforced by Reddit/native APIs.

    isActionable = true;

  }



  console.log("[ModBox] Subreddit check - target:", subreddit, "isActionable:", isActionable);

  const thingType = getThingTypeFromFullname(fullname);

  const permalink = String(data.permalink || "").trim();

  const bodyRaw = String(data.selftext || data.body || "");

  const renderedBody = thingType === "submission"

    ? String(data.selftext_html || "").trim()

    : String(data.body_html || "").trim();

  const bodyHtml = renderedBody

    ? sanitizeProfileRenderedHtml(decodeHtmlEntities(renderedBody))

    : renderProfileMarkdown(bodyRaw);



  return {

    fullname,

    thingType,

    subreddit,

    author: data.author || null,

    title: thingType === "submission" ? String(data.title || "") : null,

    bodyPreview: bodyRaw.slice(0, 500),

    bodyHtml,

    permalink: permalink ? `https://reddit.com${permalink}` : formatRedditByIdUrl(fullname),

    isActionable,

    reason: actionableReason,

  };

}



async function fetchPostFlairTemplatesViaReddit(subreddit) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  if (!cleanSubreddit) {

    return [];

  }



  const payload = await requestJsonViaBackground(`/r/${encodeURIComponent(cleanSubreddit)}/api/link_flair_v2`, {

    oauth: true,

  });

  const rows = Array.isArray(payload) ? payload : [];

  return rows

    .map((row) => {

      // Extract flair label: prefer text, then flair_text, then plain from richtext, then fallback

      let label = row?.text;

      if (!label && row?.flair_text) label = row.flair_text;

      if (!label && Array.isArray(row?.richtext) && row.richtext.length > 0) {

        // Try to join all plain text segments from richtext

        label = row.richtext.map(rt => typeof rt.t === 'string' ? rt.t : '').join('').trim();

      }

      if (!label) label = null;

      return {

        id: String(row?.id || "").trim(),

        text: label,

        css_class: row?.css_class ?? null,

        mod_only: row?.mod_only ?? null,

        user_selectable: row?.allowable_content ?? null,

      };

    })

    .filter((row) => row.id);

}



async function fetchBanStatusViaReddit(subreddit, username) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  const cleanUser = String(username || "").trim();

  if (!cleanSubreddit || !cleanUser) {

    return { is_banned: false };

  }



  const payload = await requestJsonViaBackground(

    `/r/${encodeURIComponent(cleanSubreddit)}/about/banned/.json?user=${encodeURIComponent(cleanUser)}`,

    { oauth: true },

  );

  const rows = Array.isArray(payload?.data?.children) ? payload.data.children : [];

  const matched = rows.find((row) => String(row?.name || "").toLowerCase() === cleanUser.toLowerCase());

  return {

    fullname: "",

    author: cleanUser,

    subreddit: cleanSubreddit,

    is_banned: Boolean(matched),

  };

}



// ============================================================================

// NATIVE REDDIT MODNOTES API

// ============================================================================





// ============================================================================

// NATIVE MODNOTES CACHE

// ============================================================================

// Cache for native modnotes to prevent rate limiting from repeated API calls

// Cache entries expire after 15 minutes (increased to reduce rate limit hits)

const nativeModnotesCache = new Map();

const NATIVE_MODNOTES_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes



// Fallback cache for stale data when rate limited (persists for 1 hour)

const nativeModnotesFallbackCache = new Map();

const NATIVE_MODNOTES_FALLBACK_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour



// Track in-flight requests to deduplicate concurrent requests for the same user

const nativeModnotesInFlightRequests = new Map();



// Track failed attempts per key for exponential backoff

const nativeModnotesRetryTracking = new Map();



// Throttle requests to prevent rate limiting: only 1 request per 500ms globally

let lastNativeModnotesRequestTime = 0;

const NATIVE_MODNOTES_REQUEST_THROTTLE_MS = 500;



// Global rate limit cooldown: when hit, stop trying for N seconds

let nativeModnotesRateLimitCooldownUntil = 0;

const NATIVE_MODNOTES_COOLDOWN_MS = 20 * 1000; // 20 second cooldown after rate limit



function buildNativeModnotesCacheKey(subreddit, username) {

  const cleanSub = normalizeSubreddit(subreddit);

  const cleanUser = String(username || "").trim();

  return `${cleanSub}|${cleanUser}`;

}



function getNativeModnotesFromCache(subreddit, username) {

  const key = buildNativeModnotesCacheKey(subreddit, username);

  const cached = nativeModnotesCache.get(key);

  if (cached && cached.expiresAt > Date.now()) {

    console.log("[ModBox] Returning native modnotes from cache for:", key);

    return cached.value;

  }

  return null;

}



function setNativeModnotesCache(subreddit, username, notes) {

  const key = buildNativeModnotesCacheKey(subreddit, username);

  nativeModnotesCache.set(key, {

    value: notes,

    expiresAt: Date.now() + NATIVE_MODNOTES_CACHE_TTL_MS,

  });

  

  // Also update fallback cache so we can use stale data if rate limited

  nativeModnotesFallbackCache.set(key, {

    value: notes,

    expiresAt: Date.now() + NATIVE_MODNOTES_FALLBACK_CACHE_TTL_MS,

  });

  

  // Reset retry tracking on successful fetch

  nativeModnotesRetryTracking.delete(key);

  

  // Prune old entries if cache gets too large

  if (nativeModnotesCache.size > 100) {

    const now = Date.now();

    for (const [cacheKey, cacheValue] of nativeModnotesCache) {

      if (!cacheValue || cacheValue.expiresAt <= now) {

        nativeModnotesCache.delete(cacheKey);

      }

    }

  }

}



function isRateLimitError(error) {

  const message = getSafeErrorMessage(error);

  return message.includes("429") || message.includes("too many requests") || message.includes("rate limit");

}



function calculateBackoffDelay(retryCount) {

  // Exponential backoff: 1s, 2s, 4s, 8s base, plus random jitter

  const baseDelay = Math.min(1000 * Math.pow(2, Math.max(0, retryCount - 1)), 30000);

  const jitter = Math.random() * 1000; // Up to 1s random jitter

  return baseDelay + jitter;

}



async function fetchNativeModnotesViaReddit(subreddit, username, retryCount = 0) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  const cleanUser = String(username || "").trim();

  if (!cleanSubreddit || !cleanUser) {

    console.log("[ModBox] Skipping native modnotes fetch: missing subreddit or username");

    return [];

  }



  // Check cache first

  const cachedNotes = getNativeModnotesFromCache(cleanSubreddit, cleanUser);

  if (cachedNotes !== null) {

    return cachedNotes;

  }



  // Check if we're in a rate limit cooldown - if so, only return fallback cache

  const now = Date.now();

  if (nativeModnotesRateLimitCooldownUntil > now) {

    const cooldownRemaining = Math.round((nativeModnotesRateLimitCooldownUntil - now) / 1000);

    console.log(`[ModBox] In rate limit cooldown (${cooldownRemaining}s remaining), returning fallback cache only`);

    const cacheKey = buildNativeModnotesCacheKey(cleanSubreddit, cleanUser);

    const fallback = nativeModnotesFallbackCache.get(cacheKey);

    if (fallback) {

      return fallback.value;

    }

    return [];

  }



  // Check if a request is already in-flight for this user

  const cacheKey = buildNativeModnotesCacheKey(cleanSubreddit, cleanUser);

  if (nativeModnotesInFlightRequests.has(cacheKey)) {

    console.log("[ModBox] Returning in-flight request for:", cacheKey);

    return nativeModnotesInFlightRequests.get(cacheKey);

  }



  // Apply global throttling to prevent rate limiting

  const timeSinceLastRequest = now - lastNativeModnotesRequestTime;

  if (timeSinceLastRequest < NATIVE_MODNOTES_REQUEST_THROTTLE_MS) {

    const waitTime = NATIVE_MODNOTES_REQUEST_THROTTLE_MS - timeSinceLastRequest;

    console.log("[ModBox] Throttling native modnotes request, waiting", Math.round(waitTime), "ms");

    await new Promise(resolve => setTimeout(resolve, waitTime));

  }

  lastNativeModnotesRequestTime = Date.now();



  // Create the fetch promise

  const fetchPromise = (async () => {

    try {

      const url = `/api/mod/notes?subreddit=${encodeURIComponent(cleanSubreddit)}&user=${encodeURIComponent(cleanUser)}&limit=100`;

      console.log("[ModBox] Fetching native modnotes from:", url);

      

      // Use scheduled request with longer cache TTL to reduce hits

      const payload = await requestJsonViaBackgroundScheduled(

        url,

        { oauth: true },

        {

          cacheTtlMs: 30 * 60 * 1000, // 30 minute cache (very long to reduce requests)

          priority: 1,

          dedupe: true,

        }

      );

      console.log("[ModBox] Native modnotes response:", payload);

      

      // Reddit API returns mod_notes, not notes

      let notes = Array.isArray(payload?.mod_notes) ? payload.mod_notes : [];

      console.log("[ModBox] Extracted native modnotes count before filtering:", notes.length);

      

      // Filter out REMOVAL, APPROVAL, and SPAM notes (action notes, not user notes)

      const excludedTypes = ["REMOVAL", "APPROVAL", "SPAM", "CONTENT_CHANGE"];

      notes = notes.filter((note) => !excludedTypes.includes(String(note?.type || "").toUpperCase()));

      console.log("[ModBox] Extracted native modnotes count after filtering:", notes.length);

      

      if (notes.length > 0) {

        console.log("[ModBox] First note structure:", notes[0]);

        console.log("[ModBox] First note keys:", Object.keys(notes[0] || {}));

        console.log("[ModBox] user_note_data:", notes[0]?.user_note_data);

        

        // Log all unique types in the filtered response

        const uniqueTypes = new Set(notes.map(n => String(n?.type || "")).filter(Boolean));

        console.log("[ModBox] Unique note types after filtering:", Array.from(uniqueTypes));

      }

      

      const transformedNotes = notes.map((note) => ({

        id: String(note?.id || "").trim(),

        user: String(note?.user || "").trim(),

        subreddit: String(note?.subreddit || "").trim(),

        note: String(note?.user_note_data?.note || "").trim(),

        label: String(note?.type || "").trim(),

        created_at: Number(note?.created_at || 0),

        created_by: String(note?.operator || "unknown").trim(),

        reddit_id: String(note?.mod_action_data?.action_id || "").trim(),

      })).filter((note) => note.id);

      

      // Cache the result before returning

      setNativeModnotesCache(cleanSubreddit, cleanUser, transformedNotes);

      return transformedNotes;

    } catch (error) {

      const errorMsg = getSafeErrorMessage(error);

      const isRateLimit = isRateLimitError(error);

      const errorKey = `native-modnotes-${isRateLimit ? 'ratelimit' : 'fetch'}`;

      

      if (shouldLogError(errorKey)) {

        console.error("[ModBox] Native modnotes fetch failed, falling back to Toolbox only. Error:", errorMsg, isRateLimit ? "(RATE LIMITED)" : "");

      }

      

      if (isRateLimit) {

        // Set global cooldown to back off completely

        console.warn("[ModBox] Rate limit hit! Setting cooldown for 20 seconds to respect Reddit's rate limits");

        nativeModnotesRateLimitCooldownUntil = Date.now() + NATIVE_MODNOTES_COOLDOWN_MS;

      }

      

      // On failure, try to return fallback cached data if available

      const fallbackKey = cacheKey;

      const fallback = nativeModnotesFallbackCache.get(fallbackKey);

      if (fallback && fallback.value.length > 0) {

        console.warn("[ModBox] Using stale cached native modnotes due to fetch failure");

        return fallback.value;

      }

      

      return [];

    } finally {

      // Clean up the in-flight request tracker

      nativeModnotesInFlightRequests.delete(cacheKey);

    }

  })();



  // Store the in-flight request promise

  nativeModnotesInFlightRequests.set(cacheKey, fetchPromise);

  return fetchPromise;

}



async function createNativeModNoteViaReddit(subreddit, username, noteText, redditId = null) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  const cleanUser = String(username || "").trim();

  const cleanNote = String(noteText || "").trim();

  

  if (!cleanSubreddit || !cleanUser || !cleanNote) {

    throw new Error("Missing subreddit, username, or note text for native moderation note");

  }



  if (cleanNote.length > 250) {

    throw new Error("Native note text exceeds 250 character limit");

  }



  const body = {

    subreddit: cleanSubreddit.toLowerCase(),

    user: cleanUser,

    note: cleanNote,

  };



  if (redditId) {

    const cleanRedditId = String(redditId || "").trim();

    if (cleanRedditId) {

      body.reddit_id = cleanRedditId;

    }

  }



  try {

    console.log("[ModBox] Creating native modnote with body:", JSON.stringify(body));

    const response = await requestJsonViaBackground(

      "/api/mod/notes",

      {

        method: "POST",

        oauth: true,

        body,

      },

    );

    

    console.log("[ModBox] Native modnote created successfully:", JSON.stringify(response));

    return {

      id: String(response?.id || "").trim(),

      user: cleanUser,

      subreddit: cleanSubreddit,

      note: cleanNote,

      label: String(response?.label || "").trim(),

      created_at: Number(response?.created_at || Date.now() / 1000),

      created_by: String(response?.created_by || "").trim(),

      reddit_id: String(response?.reddit_id || "").trim(),

    };

  } catch (error) {

    console.log("[ModBox] Create native modnote error response:", error);

    const message = getSafeErrorMessage(error);

    throw new Error(`Failed to create native moderation note: ${message}`);

  }

}



async function deleteNativeModNoteViaReddit(subreddit, username, noteId) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  const cleanUser = String(username || "").trim();

  const cleanNoteId = String(noteId || "").trim();

  

  if (!cleanSubreddit || !cleanUser || !cleanNoteId) {

    throw new Error("Missing subreddit, username, or note ID for native moderation note deletion");

  }



  try {

    await requestJsonViaBackground(

      `/api/mod/notes?subreddit=${encodeURIComponent(cleanSubreddit)}&user=${encodeURIComponent(cleanUser)}&note_id=${encodeURIComponent(cleanNoteId)}`,

      {

        method: "DELETE",

        oauth: true,

      },

    );

    return true;

  } catch (error) {

    const message = getSafeErrorMessage(error);

    throw new Error(`Failed to delete native moderation note: ${message}`);

  }

}

// ------------------------------------------------------------------------------
// wiki-loader.js
// ------------------------------------------------------------------------------

// ============================================================================

// WIKI LOADER SERVICE

// ============================================================================

// Handles loading/saving configs from Reddit wiki pages (removal reasons,

// quick actions, playbooks, usernotes, extension settings) with compression,

// caching, and normalization.



// ============================================================================

// BASE64 & COMPRESSION UTILITIES

// ============================================================================



function bytesToBase64(bytes) {

  let binary = "";

  const chunk = 0x8000;

  for (let i = 0; i < bytes.length; i += chunk) {

    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));

  }

  return btoa(binary);

}



function base64ToBytes(encoded) {

  const binary = atob(String(encoded || ""));

  const out = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {

    out[i] = binary.charCodeAt(i);

  }

  return out;

}



async function zlibInflateBase64(encoded) {

  if (!("DecompressionStream" in globalThis)) {

    throw new Error("Browser does not support DecompressionStream");

  }

  const bytes = base64ToBytes(encoded);

  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate"));

  const buffer = await new Response(stream).arrayBuffer();

  return new TextDecoder().decode(new Uint8Array(buffer));

}



async function zlibDeflateBase64(inputText) {

  if (!("CompressionStream" in globalThis)) {

    throw new Error("Browser does not support CompressionStream");

  }

  const text = String(inputText || "");

  const bytes = new TextEncoder().encode(text);

  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate"));

  const buffer = await new Response(stream).arrayBuffer();

  return bytesToBase64(new Uint8Array(buffer));

}



// ============================================================================

// USERNOTE TIME & PERMALINK HELPERS

// ============================================================================



function inflateUsernoteTime(version, value) {

  const raw = Number.parseInt(String(value ?? ""), 10);

  if (!Number.isFinite(raw)) {

    return 0;

  }

  if (version >= 5 && String(Math.abs(raw)).length <= 10) {

    return raw * 1000;

  }

  return raw;

}



function deflateUsernoteTime(version, value) {

  const raw = Number.parseInt(String(value ?? ""), 10);

  if (!Number.isFinite(raw) || raw <= 0) {

    return 0;

  }

  if (version >= 5 && String(Math.abs(raw)).length > 10) {

    return Math.trunc(raw / 1000);

  }

  return raw;

}



function squashUsernotePermalink(permalink) {

  const value = String(permalink || "").trim();

  if (!value) {

    return "";

  }



  const commentsMatch = value.match(/\/comments\/(\w+)\/(?:[^/]+\/(?:(\w+))?)?/i);

  const modmailMatch = value.match(/\/messages\/(\w+)/i);



  if (commentsMatch?.[1]) {

    const postId = commentsMatch[1];

    const commentId = commentsMatch[2] || "";

    return commentId ? `l,${postId},${commentId}` : `l,${postId}`;

  }



  if (modmailMatch?.[1]) {

    return `m,${modmailMatch[1]}`;

  }



  if (value.startsWith("https://mod.reddit.com")) {

    return value;

  }



  return "";

}



function unsquashUsernotePermalink(subreddit, squashed) {

  const value = String(squashed || "").trim();

  if (!value) {

    return "";

  }

  if (value.startsWith("https://mod.reddit.com")) {

    return value;

  }



  const parts = value.split(",");

  if (parts.length < 2) {

    return "";

  }

  if (parts[0] === "l") {

    if (parts.length > 2) {

      return `/r/${subreddit}/comments/${parts[1]}/-/${parts[2]}/`;

    }

    return `/r/${subreddit}/comments/${parts[1]}/`;

  }

  if (parts[0] === "m") {

    return `/r/${subreddit}/message/messages/${parts[1]}`;

  }

  return "";

}



function mgrGet(pool, index, fallback = "") {

  const parsed = Number.parseInt(String(index ?? ""), 10);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed >= pool.length) {

    return fallback;

  }

  const value = pool[parsed];

  return value == null ? fallback : String(value);

}



function mgrCreate(pool, value) {

  const item = String(value || "");

  const current = pool.indexOf(item);

  if (current >= 0) {

    return current;

  }

  pool.push(item);

  return pool.length - 1;

}



// ============================================================================

// USERNOTE DOCUMENT OPERATIONS

// ============================================================================



function buildUsernoteSkeleton() {

  return {

    ver: 6,

    users: {},

  };

}



function inflateUsernotesDoc(deflatedDoc, subreddit) {

  const version = Number.parseInt(String(deflatedDoc?.ver ?? "6"), 10) || 6;

  const constants = deflatedDoc?.constants && typeof deflatedDoc.constants === "object" ? deflatedDoc.constants : {};

  const usersPool = Array.isArray(constants?.users) ? constants.users : [];

  const warningsPool = Array.isArray(constants?.warnings) ? constants.warnings : [];

  const users = deflatedDoc?.users && typeof deflatedDoc.users === "object" ? deflatedDoc.users : {};



  const inflated = {

    ver: version,

    users: {},

  };



  Object.entries(users).forEach(([username, userData]) => {

    if (!userData || typeof userData !== "object") {

      return;

    }

    const ns = Array.isArray(userData.ns) ? userData.ns : [];

    const notes = ns

      .filter((note) => note && typeof note === "object")

      .map((note) => {

        const noteTime = inflateUsernoteTime(version, note.t);

        return {

          id: String(noteTime),

          note: decodeHtmlEntities(String(note.n || "")),

          time: noteTime,

          mod: mgrGet(usersPool, note.m, ""),

          link: unsquashUsernotePermalink(subreddit, String(note.l || "")),

          type: mgrGet(warningsPool, note.w, "none") || "none",

        };

      })

      .sort((a, b) => Number(b.time || 0) - Number(a.time || 0));



    inflated.users[String(username)] = {

      name: String(username),

      notes,

    };

  });



  return inflated;

}



function deflateUsernotesDoc(notes, version = 6) {

  const usersPool = [];

  const warningsPool = [];

  const users = {};

  const sourceUsers = notes?.users && typeof notes.users === "object" ? notes.users : {};



  Object.entries(sourceUsers).forEach(([username, userData]) => {

    if (!userData || typeof userData !== "object") {

      return;

    }

    const sourceNotes = Array.isArray(userData.notes) ? userData.notes : [];

    users[String(username)] = {

      ns: sourceNotes

        .filter((note) => note && typeof note === "object" && String(note.note || "").trim())

        .map((note) => {

          const squashedLink = squashUsernotePermalink(String(note.link || ""));

          return {

            n: String(note.note || "").trim(),

            t: deflateUsernoteTime(version, note.time || Date.now()),

            m: mgrCreate(usersPool, String(note.mod || "")),

            ...(squashedLink ? { l: squashedLink } : {}),

            w: mgrCreate(warningsPool, String(note.type || "none") || "none"),

          };

        }),

    };

  });



  return {

    ver: version,

    constants: {

      users: usersPool,

      warnings: warningsPool,

    },

    users,

  };

}



// ============================================================================

// USERNOTE LOADING/SAVING

// ============================================================================



async function loadSubredditUsernotesFromWiki(subreddit) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  if (!cleanSubreddit) {

    throw new Error("Subreddit is required");

  }



  let wikiPayload;

  try {

    wikiPayload = await requestJsonViaBackground(`/r/${cleanSubreddit}/wiki/usernotes.json?raw_json=1`, { oauth: true });

  } catch (error) {

    const message = error instanceof Error ? error.message : String(error);

    if (/PAGE_NOT_CREATED|WIKI_DISABLED|404|NOT_FOUND|NO_WIKI_PAGE/i.test(message)) {

      return buildUsernoteSkeleton();

    }

    throw error;

  }



  const raw = String(wikiPayload?.data?.content_md || "").trim();

  if (!raw) {

    return buildUsernoteSkeleton();

  }



  let doc;

  try {

    doc = JSON.parse(raw);

  } catch {

    throw new Error("Usernotes wiki page content is not valid JSON");

  }



  if (!doc || typeof doc !== "object") {

    throw new Error("Usernotes wiki content must be a JSON object");

  }



  const version = Number.parseInt(String(doc.ver ?? "0"), 10);

  if (!Number.isFinite(version) || version <= 0) {

    throw new Error("Invalid usernotes schema version");

  }



  if (version <= 5) {

    return inflateUsernotesDoc(doc, cleanSubreddit);

  }



  if (version <= 6) {

    const blob = String(doc.blob || "");

    if (!blob) {

      throw new Error("Missing usernotes blob");

    }

    const decompressedUsers = await zlibInflateBase64(blob);

    let users;

    try {

      users = JSON.parse(decompressedUsers);

    } catch {

      throw new Error("Invalid usernotes blob payload");

    }

    return inflateUsernotesDoc({ ...doc, users }, cleanSubreddit);

  }



  throw new Error(`Unsupported usernotes schema version: ${version}`);

}



async function saveSubredditUsernotesToWiki(subreddit, notes, reason) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  const deflated = deflateUsernotesDoc(notes, 6);

  const usersJson = JSON.stringify(deflated.users || {});

  const blob = await zlibDeflateBase64(usersJson);

  const payload = JSON.stringify({

    ver: Number(deflated.ver || 6),

    constants: deflated.constants || { users: [], warnings: [] },

    blob,

  });



  await requestJsonViaBackground(`/r/${encodeURIComponent(cleanSubreddit)}/api/wiki/edit`, {

    method: "POST",

    oauth: true,

    formData: true,

    body: {

      api_type: "json",

      content: payload,

      page: "usernotes",

      reason: String(reason || "updated via ModBox"),

    },

  });

}



// ============================================================================

// REMOVAL CONFIG LOADING/SAVING

// ============================================================================



async function loadRemovalConfigFromWiki(subreddit) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  if (!cleanSubreddit) {

    throw new Error("Subreddit is required to load removal reasons");

  }



  let wikiPayload;

  try {

    wikiPayload = await requestJsonViaBackground(

      `/r/${encodeURIComponent(cleanSubreddit)}/wiki/${REMOVAL_REASONS_WIKI_PAGE}.json?raw_json=1`,

      { oauth: true },

    );

  } catch (error) {

    const message = error instanceof Error ? error.message : String(error);

    if (/PAGE_NOT_CREATED|WIKI_DISABLED|404|NOT_FOUND|NO_WIKI_PAGE/i.test(message)) {

      return buildDefaultRemovalConfig(cleanSubreddit);

    }

    throw error;

  }



  const raw = String(wikiPayload?.data?.content_md || "").trim();

  if (!raw) {

    return buildDefaultRemovalConfig(cleanSubreddit);

  }



  let doc;

  try {

    doc = JSON.parse(raw);

  } catch {

    throw new Error("Removal reasons wiki page content is not valid JSON");

  }



  return normalizeRemovalConfigDoc(doc, cleanSubreddit);

}



async function saveRemovalConfigToWiki(subreddit, config, reason) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  if (!cleanSubreddit) {

    throw new Error("Subreddit is required to save removal reasons");

  }



  const payload = JSON.stringify(serializeRemovalConfigForWiki(config, cleanSubreddit), null, 2);

  const params = new URLSearchParams();

  params.set("content", payload);

  params.set("page", REMOVAL_REASONS_WIKI_PAGE);

  params.set("reason", String(reason || "updated removal reasons via ModBox"));

  await redditFormRequest(`/r/${encodeURIComponent(cleanSubreddit)}/api/wiki/edit`, params);

}



// ============================================================================

// QUICK ACTIONS LOADING/SAVING

// ============================================================================



function normalizeQuickAction(action, index) {

  const title = String(action?.title || action?.name || `Action ${index + 1}`).trim() || `Action ${index + 1}`;

  const body = String(action?.body || action?.text || action?.message || "").trim();

  const appliesTo = (() => {

    const v = String(action?.applies_to || action?.appliesTo || "both").toLowerCase();

    return ["posts", "comments", "both"].includes(v) ? v : "both";

  })();

  return {

    key: String(action?.key || action?.id || "").trim() || slugifyReasonKey(title, `action-${index + 1}`),

    title,

    body,

    applies_to: appliesTo,

    sticky: Boolean(action?.sticky ?? action?.stickyComment ?? false),

    mod_only: Boolean(action?.mod_only ?? action?.modOnly ?? false),

    comment_as_subreddit: Boolean(action?.comment_as_subreddit ?? action?.commentAsSubreddit ?? false),

    lock_post: Boolean(action?.lock_post ?? action?.lockPost ?? action?.lockThread ?? action?.lock ?? false),

    position: Number.isFinite(Number(action?.position)) ? Number(action.position) : (index + 1) * 10,

  };

}



function normalizeQuickActionsDoc(doc, subreddit) {

  const fallback = buildDefaultQuickActionsConfig(subreddit);

  if (!doc || typeof doc !== "object") {

    return fallback;

  }

  const actions = Array.isArray(doc.actions) ? doc.actions : [];

  const result = {

    schema: QUICK_ACTIONS_WIKI_SCHEMA,

    version: Number.isFinite(Number(doc.version)) ? Number(doc.version) : 1,

    subreddit: normalizeSubreddit(subreddit || doc.subreddit || ""),

    actions: actions

      .map((a, i) => normalizeQuickAction(a, i))

      .sort((a, b) => (a.position || 0) - (b.position || 0)),

  };

  return result;

}



function interpolateQuickActionTemplate(template, context) {

  const text = String(template || "");

  return text

    .replace(/\{author\}/gi, String(context?.author || "[deleted]"))

    .replace(/\{subreddit\}/gi, String(context?.subreddit || "unknown"))

    .replace(/\{kind\}/gi, String(context?.kind || "item"));

}



function buildDefaultQuickActionsConfig(subreddit) {

  return {

    schema: QUICK_ACTIONS_WIKI_SCHEMA,

    version: 1,

    subreddit: normalizeSubreddit(subreddit),

    actions: [],

  };

}



function getInMemoryQuickActions(subreddit) {

  const key = normalizeSubreddit(subreddit).toLowerCase();

  if (!key || !inMemoryQuickActionsCache) {

    return null;

  }

  return inMemoryQuickActionsCache.get(key) || null;

}



function setInMemoryQuickActions(subreddit, config) {

  const key = normalizeSubreddit(subreddit).toLowerCase();

  if (!key) {

    return;

  }

  if (!inMemoryQuickActionsCache) {

    inMemoryQuickActionsCache = new Map();

  }

  inMemoryQuickActionsCache.set(key, normalizeQuickActionsDoc(config, subreddit));

}



function clearInMemoryQuickActions(subreddit) {

  const key = normalizeSubreddit(subreddit).toLowerCase();

  if (!key || !inMemoryQuickActionsCache) {

    return;

  }

  inMemoryQuickActionsCache.delete(key);

}



async function loadQuickActionsFromWiki(subreddit) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  if (!cleanSubreddit) {

    throw new Error("Subreddit is required to load quick actions");

  }

  const cached = getInMemoryQuickActions(cleanSubreddit);

  if (cached) {

    return cached;

  }

  let wikiPayload;

  const wikiPath = `/r/${encodeURIComponent(cleanSubreddit)}/wiki/${QUICK_ACTIONS_WIKI_PAGE}.json?raw_json=1`;

  try {

    wikiPayload = await requestJsonViaBackground(wikiPath, { oauth: true });

  } catch (error) {

    const message = error instanceof Error ? error.message : String(error);

    if (/PAGE_NOT_CREATED|WIKI_DISABLED|404|NOT_FOUND|NO_WIKI_PAGE/i.test(message)) {

      return buildDefaultQuickActionsConfig(cleanSubreddit);

    }

    throw error;

  }

  const raw = String(wikiPayload?.data?.content_md || "").trim();

  if (!raw) {

    return buildDefaultQuickActionsConfig(cleanSubreddit);

  }

  let doc;

  try {

    doc = JSON.parse(raw);

  } catch (e) {

    throw new Error("Quick actions wiki page is not valid JSON");

  }

  const normalized = normalizeQuickActionsDoc(doc, cleanSubreddit);

  setInMemoryQuickActions(cleanSubreddit, normalized);

  return normalized;

}



async function saveQuickActionsToWiki(subreddit, config, reason) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  if (!cleanSubreddit) {

    throw new Error("Subreddit is required to save quick actions");

  }

  const normalized = normalizeQuickActionsDoc(config, cleanSubreddit);

  const payload = JSON.stringify(normalized, null, 2);

  const params = new URLSearchParams();

  params.set("content", payload);

  params.set("page", QUICK_ACTIONS_WIKI_PAGE);

  params.set("reason", String(reason || "updated quick actions via ModBox"));

  await redditFormRequest(`/r/${encodeURIComponent(cleanSubreddit)}/api/wiki/edit`, params);

  setInMemoryQuickActions(cleanSubreddit, normalized);

  return normalized;

}



// ============================================================================

// CANNED REPLIES CACHING & HELPERS

// ============================================================================



let inMemoryCannedRepliesCache = null;



function getInMemoryCannedReplies(subreddit) {

  const key = normalizeSubreddit(subreddit).toLowerCase();

  if (!key || !inMemoryCannedRepliesCache) {

    return null;

  }

  return inMemoryCannedRepliesCache.get(key) || null;

}



function setInMemoryCannedReplies(subreddit, config) {

  const key = normalizeSubreddit(subreddit).toLowerCase();

  if (!key) {

    return;

  }

  if (!inMemoryCannedRepliesCache) {

    inMemoryCannedRepliesCache = new Map();

  }

  inMemoryCannedRepliesCache.set(key, normalizeCannedRepliesDoc(config, subreddit));

}



function clearInMemoryCannedReplies(subreddit) {

  const key = normalizeSubreddit(subreddit).toLowerCase();

  if (!key || !inMemoryCannedRepliesCache) {

    return;

  }

  inMemoryCannedRepliesCache.delete(key);

}



function normalizeCannedRepliesDoc(doc, subreddit) {

  if (!doc || typeof doc !== "object") {

    return buildDefaultCannedRepliesConfig(subreddit);

  }



  const replies = Array.isArray(doc.replies) ? doc.replies : [];

  const normalized = Array.isArray(doc) ? doc : replies;



  return {

    schema: CANNED_REPLIES_WIKI_SCHEMA,

    version: 1,

    subreddit: normalizeSubreddit(subreddit),

    replies: normalized

      .filter((item) => item && typeof item === "object")

      .map((item) => ({

        name: String(item.name || item.Name || "").trim(),

        content: String(item.content || item.Content || "").trim(),

      }))

      .filter((item) => item.name && item.content),

  };

}



function buildDefaultCannedRepliesConfig(subreddit) {

  return {

    schema: CANNED_REPLIES_WIKI_SCHEMA,

    version: 1,

    subreddit: normalizeSubreddit(subreddit),

    replies: [],

  };

}



// Simple YAML parser for canned replies array format

// Handles: - Name: string

//          Content: multiline string

function parseSimpleYaml(yamlText) {

  const lines = String(yamlText || "").split(/\r?\n/);

  const items = [];

  let currentItem = null;

  let contentLines = [];

  let inContent = false;

  let baseIndent = null;



  for (let i = 0; i < lines.length; i++) {

    const line = lines[i];

    const trimmed = line.trim();



    // Start of new item

    if (trimmed.startsWith("- ")) {

      // Save previous item

      if (currentItem) {

        currentItem.Content = contentLines.join("\n").trim();

        items.push(currentItem);

      }

      

      // Parse "- Name: value"

      const match = trimmed.match(/^-\s*Name:\s*(.+)$/i);

      if (match) {

        currentItem = { Name: match[1].trim() };

        contentLines = [];

        inContent = false;

        baseIndent = null;

      }

    } else if (trimmed.startsWith("Name:") && !inContent) {

      // Alternative format without dash on same line

      const match = trimmed.match(/^Name:\s*(.+)$/i);

      if (match) {

        if (currentItem) {

          currentItem.Content = contentLines.join("\n").trim();

          items.push(currentItem);

        }

        currentItem = { Name: match[1].trim() };

        contentLines = [];

        inContent = false;

        baseIndent = null;

      }

    } else if ((trimmed.startsWith("Content:") || trimmed.startsWith("Content: |")) && currentItem) {

      // Start of content section

      inContent = true;

      const match = trimmed.match(/^Content:\s*(?:\|\s*)?(.*)$/i);

      if (match && match[1]) {

        contentLines = [match[1]];

      } else {

        contentLines = [];

      }

      baseIndent = null;

    } else if (inContent && currentItem && (trimmed === "" || !trimmed.startsWith("-"))) {

      // Content line (indented or empty)

      if (trimmed) {

        // If this is the first content line, detect base indentation

        if (baseIndent === null && line.length > trimmed.length) {

          baseIndent = line.length - trimmed.length;

        }

        

        // Remove base indentation from the line

        if (baseIndent && line.startsWith(" ".repeat(baseIndent))) {

          contentLines.push(line.slice(baseIndent));

        } else {

          contentLines.push(trimmed);

        }

      } else if (contentLines.length > 0) {

        // Preserve empty lines within content

        contentLines.push("");

      }

    } else if (!trimmed && contentLines.length === 0 && currentItem) {

      // Empty line before content - might be separator

      continue;

    }

  }



  // Save last item

  if (currentItem) {

    currentItem.Content = contentLines.join("\n").trim();

    items.push(currentItem);

  }



  return items;

}



async function loadCannedRepliesFromWiki(subreddit) {

  // Try to get configured wikiUrl from storage first

  let configuredUrl = null;

  let wikiPath = null;

  

  try {

    const data = await new Promise(resolve => {

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {

        chrome.storage.sync.get([CANNED_REPLIES_WIKI_URL_KEY, 'wikiUrl'], resolve);

      } else {

        resolve({});

      }

    });

    

    // Check both ModBox and original CannedReplys storage keys

    configuredUrl = data[CANNED_REPLIES_WIKI_URL_KEY] || data.wikiUrl;

  } catch (err) {

    console.log("[ModBox] Could not read canned replies URL from storage:", err);

  }

  

  // If configured URL exists, use it (subreddit parameter is optional in this case)

  if (configuredUrl) {

    let path = String(configuredUrl).trim();

    

    // Handle full URLs

    if (path.startsWith('http')) {

      path = path.replace(/^https?:\/\/(old\.|www\.)?reddit\.com/, '');

    }

    

    // Ensure leading slash

    if (!path.startsWith('/')) {

      path = '/' + path;

    }

    

    // Remove trailing slash

    path = path.replace(/\/$/, '');

    

    wikiPath = path + '.json?raw_json=1';

    console.log("[ModBox] Using configured canned replies URL:", wikiPath);

  } else {

    // Otherwise, build from subreddit parameter

    const cleanSubreddit = normalizeSubreddit(subreddit);

    if (!cleanSubreddit) {

      throw new Error("Subreddit is required to load canned replies");

    }



    const cached = getInMemoryCannedReplies(cleanSubreddit);

    if (cached) {

      return cached;

    }



    wikiPath = `/r/${encodeURIComponent(cleanSubreddit)}/wiki/${CANNED_REPLIES_WIKI_PAGE}.json?raw_json=1`;

    subreddit = cleanSubreddit;

  }

  

  console.log("[ModBox] Loading canned replies from:", wikiPath);

  

  // Try loading without OAuth first (allows public wiki pages on any subreddit)

  // Then fall back to OAuth if needed (for private wikis on moderated subreddits)

  let wikiPayload;

  try {

    try {

      console.log("[ModBox] Attempting to load canned replies without OAuth");

      wikiPayload = await requestJsonViaBackground(wikiPath, { oauth: false });

    } catch (noAuthError) {

      console.log("[ModBox] Non-authenticated request failed, attempting with OAuth:", noAuthError);

      // Try with OAuth if non-authenticated request fails

      wikiPayload = await requestJsonViaBackground(wikiPath, { oauth: true });

    }

  } catch (error) {

    const message = error instanceof Error ? error.message : String(error);

    if (/PAGE_NOT_CREATED|WIKI_DISABLED|404|NOT_FOUND|NO_WIKI_PAGE/i.test(message)) {

      return buildDefaultCannedRepliesConfig(String(subreddit || ""));

    }

    throw error;

  }



  const raw = String(wikiPayload?.data?.content_md || "").trim();

  if (!raw) {

    return buildDefaultCannedRepliesConfig(String(subreddit || ""));

  }



  let doc;

  try {

    // Try JSON first

    doc = JSON.parse(raw);

  } catch (jsonError) {

    // If JSON parse fails, try YAML format

    try {

      const yamlArray = parseSimpleYaml(raw);

      if (yamlArray && yamlArray.length > 0) {

        // Convert YAML array to our schema

        doc = {

          schema: CANNED_REPLIES_WIKI_SCHEMA,

          version: 1,

          subreddit: String(subreddit || ""),

          replies: yamlArray.map(item => ({

            name: item.Name || "",

            content: item.Content || ""

          }))

        };

      } else {

        throw new Error("No canned replies found in YAML format");

      }

    } catch (yamlError) {

      throw new Error("Canned replies wiki page is neither valid JSON nor YAML");

    }

  }



  const normalized = normalizeCannedRepliesDoc(doc, String(subreddit || ""));

  if (subreddit) {

    setInMemoryCannedReplies(subreddit, normalized);

  }

  return normalized;

}



async function saveCannedRepliesToWiki(subreddit, config, reason) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  console.log("[ModBox] saveCannedRepliesToWiki called with subreddit:", cleanSubreddit);

  

  if (!cleanSubreddit) {

    throw new Error("Subreddit is required to save canned replies");

  }



  const normalized = normalizeCannedRepliesDoc(config, cleanSubreddit);

  console.log("[ModBox] Normalized config:", normalized);

  

  const payload = JSON.stringify(normalized, null, 2);

  console.log("[ModBox] Payload to save:", payload);

  

  // Try to get configured wiki URL

  let wikiPath = `/r/${encodeURIComponent(cleanSubreddit)}/api/wiki/edit`;

  let wikiPageName = CANNED_REPLIES_WIKI_PAGE;

  

  try {

    const data = await new Promise(resolve => {

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {

        chrome.storage.sync.get([CANNED_REPLIES_WIKI_URL_KEY, 'wikiUrl'], resolve);

      } else {

        resolve({});

      }

    });

    

    const configuredUrl = data[CANNED_REPLIES_WIKI_URL_KEY] || data.wikiUrl;

    if (configuredUrl) {

      let path = String(configuredUrl).trim();

      

      // Handle full URLs

      if (path.startsWith('http')) {

        path = path.replace(/^https?:\/\/(old\.|www\.)?reddit\.com/, '');

      }

      

      // Ensure leading slash

      if (!path.startsWith('/')) {

        path = '/' + path;

      }

      

      // Remove trailing .json and query strings

      path = path.replace(/\.json(\?.*)?$/, '').replace(/\/$/, '');

      

      // Extract subreddit and page name from path

      const match = path.match(/^\/r\/([^/]+)\/wiki\/(.+)$/i);

      if (match) {

        const configuredSubreddit = match[1];

        wikiPageName = match[2];

        wikiPath = `/r/${encodeURIComponent(configuredSubreddit)}/api/wiki/edit`;

        console.log("[ModBox] Using configured wiki location:", wikiPath, "page:", wikiPageName);

      }

    }

  } catch (err) {

    console.log("[ModBox] Could not read configured wiki URL, using default:", err);

  }

  

  const params = new URLSearchParams();

  params.set("content", payload);

  params.set("page", wikiPageName);

  params.set("reason", String(reason || "updated canned replies via ModBox"));

  

  console.log("[ModBox] Wiki edit path:", wikiPath);

  console.log("[ModBox] Wiki page name:", wikiPageName);

  

  try {

    const result = await redditFormRequest(wikiPath, params);

    console.log("[ModBox] Wiki edit result:", result);

  } catch (err) {

    console.error("[ModBox] Wiki edit failed:", err);

    throw err;

  }

  

  setInMemoryCannedReplies(cleanSubreddit, normalized);

  console.log("[ModBox] Updated in-memory cache for canned replies");

  return normalized;

}



// ============================================================================

// PLAYBOOKS NORMALIZATION & HELPERS

// ============================================================================



function normalizeRemovalSendMode(value, fallback = "reply") {

  const lowered = String(value || fallback).trim().toLowerCase();

  if (["reply", "pm", "both", "none"].includes(lowered)) {

    return lowered;

  }

  if (["comment"].includes(lowered)) {

    return "reply";

  }

  if (["message", "modmail"].includes(lowered)) {

    return "pm";

  }

  if (["all"].includes(lowered)) {

    return "both";

  }

  if (["silent"].includes(lowered)) {

    return "none";

  }

  return fallback;

}



function slugifyReasonKey(value, fallback = "new-reason") {

  const slug = String(value || "")

    .toLowerCase()

    .trim()

    .replace(/[^a-z0-9]+/g, "-")

    .replace(/(^-|-$)/g, "");

  return slug || fallback;

}



function normalizePlaybookStep(step) {

  const rawType = String(step?.type || "").trim().toLowerCase();

  const type = rawType === "lock_post" ? "lock_item" : rawType;

  if (!["remove", "comment", "usernote", "lock_item", "unlock_item", "approve_item", "remove_item", "ban_user", "unban_user", "set_post_flair", "set_user_flair", "send_modmail", "distinguish_comment"].includes(type)) {

    return null;

  }

  if (type === "remove") {

    return {

      type: "remove",

      reason_keys: Array.isArray(step?.reason_keys) ? step.reason_keys.map((value) => String(value || "").trim()).filter(Boolean) : [],

      send_mode: normalizeRemovalSendMode(step?.send_mode, "reply"),

      inputs: step?.inputs && typeof step.inputs === "object" && !Array.isArray(step.inputs) ? step.inputs : {},

      skip_reddit_remove: Boolean(step?.skip_reddit_remove),

      no_reason: Boolean(step?.no_reason),

      comment_as_subreddit: typeof step?.comment_as_subreddit === "boolean" ? step.comment_as_subreddit : null,

    };

  }

  if (type === "comment") {

    const source = String(step?.source || "custom").trim().toLowerCase();

    return {

      type: "comment",

      source: source === "removal_reasons" ? "removal_reasons" : "custom",

      text_template: String(step?.text_template || "").trim(),

      reason_keys: Array.isArray(step?.reason_keys) ? step.reason_keys.map((value) => String(value || "").trim()).filter(Boolean) : [],

      inputs: step?.inputs && typeof step.inputs === "object" && !Array.isArray(step.inputs) ? step.inputs : {},

      comment_as_subreddit: typeof step?.comment_as_subreddit === "boolean" ? step.comment_as_subreddit : null,

      sticky: Boolean(step?.sticky),

      lock_comment: Boolean(step?.lock_comment),

    };

  }

  if (type === "usernote") {

    return {

      type: "usernote",

      note_type: String(step?.note_type || "none").trim() || "none",

      text_template: String(step?.text_template || "").trim(),

    };

  }

  if (type === "approve_item") {

    return { type: "approve_item" };

  }

  if (type === "remove_item") {

    return {

      type: "remove_item",

      spam: Boolean(step?.spam),

    };

  }

  if (type === "unlock_item") {

    return { type: "unlock_item" };

  }

  if (type === "ban_user") {

    return {

      type: "ban_user",

      duration_days: Number.isFinite(Number(step?.duration_days)) ? Number(step.duration_days) : 7,

      ban_message_template: String(step?.ban_message_template || step?.ban_message || "").trim(),

      ban_note_template: String(step?.ban_note_template || "").trim(),

    };

  }

  if (type === "unban_user") {

    return {

      type: "unban_user",

    };

  }

  if (type === "set_post_flair") {

    return {

      type: "set_post_flair",

      flair_template_id: String(step?.flair_template_id || step?.flair_id || "").trim(),

    };

  }

  if (type === "set_user_flair") {

    return {

      type: "set_user_flair",

      flair_template_id: String(step?.flair_template_id || step?.flair_id || "").trim(),

    };

  }

  if (type === "send_modmail") {

    return {

      type: "send_modmail",

      to_mode: (["custom", "subreddit"].includes(String(step?.to_mode || "").trim().toLowerCase()) ? String(step.to_mode).trim().toLowerCase() : "author"),

      to_username: String(step?.to_username || "").trim(),

      subject_template: String(step?.subject_template || "").trim(),

      body_template: String(step?.body_template || "").trim(),

      include_permalink: step?.include_permalink !== false,

      auto_archive: step?.auto_archive !== false,

    };

  }

  if (type === "distinguish_comment") {

    return {

      type: "distinguish_comment",

      sticky: Boolean(step?.sticky),

    };

  }

  return {

    type: "lock_item",

  };

}



function normalizePlaybook(playbook, index) {

  const title = String(playbook?.title || `Playbook ${index + 1}`).trim() || `Playbook ${index + 1}`;

  const appliesTo = (() => {

    const v = String(playbook?.applies_to || "both").toLowerCase();

    return ["posts", "comments", "both"].includes(v) ? v : "both";

  })();

  const rawSteps = Array.isArray(playbook?.steps) ? playbook.steps : [];

  return {

    key: String(playbook?.key || "").trim() || slugifyReasonKey(title, `playbook-${index + 1}`),

    title,

    is_enabled: playbook?.is_enabled !== false,

    applies_to: appliesTo,

    confirm: playbook?.confirm !== false,

    stop_on_error: playbook?.stop_on_error !== false,

    position: Number.isFinite(Number(playbook?.position)) ? Number(playbook.position) : (index + 1) * 10,

    steps: rawSteps.map((step) => normalizePlaybookStep(step)).filter(Boolean),

  };

}



function normalizePlaybooksDoc(doc, subreddit) {

  const fallback = buildDefaultPlaybooksConfig(subreddit);

  if (!doc || typeof doc !== "object") {

    return fallback;

  }

  const playbooks = Array.isArray(doc.playbooks) ? doc.playbooks : [];

  return {

    schema: PLAYBOOKS_WIKI_SCHEMA,

    version: Number.isFinite(Number(doc.version)) ? Number(doc.version) : 1,

    subreddit: normalizeSubreddit(subreddit || doc.subreddit || ""),

    playbooks: playbooks

      .map((playbook, index) => normalizePlaybook(playbook, index))

      .sort((a, b) => Number(a.position) - Number(b.position)),

  };

}



function interpolatePlaybookTemplate(template, context) {

  const text = String(template || "");

  return text

    .replace(/\{author\}/gi, String(context?.author || "[deleted]"))

    .replace(/\{subreddit\}/gi, String(context?.subreddit || "unknown"))

    .replace(/\{kind\}/gi, String(context?.kind || "item"))

    .replace(/\{permalink\}/gi, String(context?.permalink || ""));

}



function buildDefaultPlaybooksConfig(subreddit) {

  return {

    schema: PLAYBOOKS_WIKI_SCHEMA,

    version: 1,

    subreddit: normalizeSubreddit(subreddit),

    playbooks: [],

  };

}



// ============================================================================

// PLAYBOOKS LOADING/SAVING

// ============================================================================



function getInMemoryPlaybooks(subreddit) {

  const key = normalizeSubreddit(subreddit).toLowerCase();

  if (!key || !inMemoryPlaybooksCache) {

    return null;

  }

  return inMemoryPlaybooksCache.get(key) || null;

}



function setInMemoryPlaybooks(subreddit, config) {

  const key = normalizeSubreddit(subreddit).toLowerCase();

  if (!key) {

    return;

  }

  if (!inMemoryPlaybooksCache) {

    inMemoryPlaybooksCache = new Map();

  }

  inMemoryPlaybooksCache.set(key, normalizePlaybooksDoc(config, subreddit));

}



async function loadPlaybooksFromWiki(subreddit) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  if (!cleanSubreddit) {

    throw new Error("Subreddit is required to load playbooks");

  }

  const cached = getInMemoryPlaybooks(cleanSubreddit);

  if (cached) {

    return cached;

  }

  let wikiPayload;

  try {

    wikiPayload = await requestJsonViaBackground(

      `/r/${encodeURIComponent(cleanSubreddit)}/wiki/${PLAYBOOKS_WIKI_PAGE}.json?raw_json=1`,

      { oauth: true },

    );

  } catch (error) {

    const message = error instanceof Error ? error.message : String(error);

    if (/PAGE_NOT_CREATED|WIKI_DISABLED|404|NOT_FOUND|NO_WIKI_PAGE/i.test(message)) {

      return buildDefaultPlaybooksConfig(cleanSubreddit);

    }

    throw error;

  }

  const raw = String(wikiPayload?.data?.content_md || "").trim();

  if (!raw) {

    return buildDefaultPlaybooksConfig(cleanSubreddit);

  }

  let doc;

  try {

    doc = JSON.parse(raw);

  } catch {

    throw new Error("Playbooks wiki page is not valid JSON");

  }

  const normalized = normalizePlaybooksDoc(doc, cleanSubreddit);

  setInMemoryPlaybooks(cleanSubreddit, normalized);

  return normalized;

}



async function savePlaybooksToWiki(subreddit, config, reason) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  if (!cleanSubreddit) {

    throw new Error("Subreddit is required to save playbooks");

  }

  const normalized = normalizePlaybooksDoc(config, cleanSubreddit);

  const payload = JSON.stringify(normalized, null, 2);

  const params = new URLSearchParams();

  params.set("content", payload);

  params.set("page", PLAYBOOKS_WIKI_PAGE);

  params.set("reason", String(reason || "updated playbooks via ModBox"));

  await redditFormRequest(`/r/${encodeURIComponent(cleanSubreddit)}/api/wiki/edit`, params);

  setInMemoryPlaybooks(cleanSubreddit, normalized);

  return normalized;

}



// ============================================================================

// TOOLBOX IMPORT

// ============================================================================



async function importToolboxQuickActions(subreddit) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  if (!cleanSubreddit) {

    throw new Error("Subreddit is required to import Toolbox quick actions");

  }

  let wikiPayload;

  try {

    wikiPayload = await requestJsonViaBackground(

      `/r/${encodeURIComponent(cleanSubreddit)}/wiki/${TOOLBOX_WIKI_PAGE}.json?raw_json=1`,

      { oauth: true },

    );

  } catch (error) {

    const message = error instanceof Error ? error.message : String(error);

    if (/PAGE_NOT_CREATED|WIKI_DISABLED|404|NOT_FOUND|NO_WIKI_PAGE/i.test(message)) {

      throw new Error("No Toolbox wiki page found for this subreddit");

    }

    throw error;

  }

  const raw = String(wikiPayload?.data?.content_md || "").trim();

  if (!raw) {

    throw new Error("Toolbox wiki page is empty");

  }

  let doc;

  try {

    doc = JSON.parse(raw);

  } catch {

    throw new Error("Toolbox wiki page is not valid JSON");

  }



  // Toolbox installs vary: quickActions may be top-level or in mod macros

  const candidates = [

    doc?.quickActions || doc?.quick_actions || [],

    doc?.modMacros || doc?.mod_macros || [],

  ];



  let importedActions = [];

  for (const candidate of candidates) {

    if (Array.isArray(candidate) && candidate.length > 0) {

      importedActions = candidate;

      break;

    }

  }



  if (!importedActions.length) {

    throw new Error("No quick actions or mod macros found in Toolbox config");

  }



  return importedActions;

}



// ============================================================================

// EXTENSION SETTINGS LOADING/SAVING

// ============================================================================



async function getExtensionSettingsWikiPagePreference() {

  const stored = await ext.storage.sync.get([EXTENSION_SETTINGS_WIKI_PAGE_KEY]);

  const value = String(stored?.[EXTENSION_SETTINGS_WIKI_PAGE_KEY] || "").trim();

  return value || DEFAULT_EXTENSION_SETTINGS_WIKI_PAGE;

}



async function setExtensionSettingsWikiPagePreference(page) {

  const cleanPage = String(page || "").trim() || DEFAULT_EXTENSION_SETTINGS_WIKI_PAGE;

  await ext.storage.sync.set({

    [EXTENSION_SETTINGS_WIKI_PAGE_KEY]: cleanPage,

  });

  return cleanPage;

}



async function loadExtensionSettingsFromWiki(subreddit, wikiPage) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  if (!cleanSubreddit) {

    throw new Error("Subreddit is required to load extension settings");

  }

  const cleanWikiPage = String(wikiPage || DEFAULT_EXTENSION_SETTINGS_WIKI_PAGE).trim() || DEFAULT_EXTENSION_SETTINGS_WIKI_PAGE;

  const wikiPath = cleanWikiPage

    .split("/")

    .map((segment) => encodeURIComponent(String(segment || "").trim()))

    .filter(Boolean)

    .join("/");



  let wikiPayload;

  try {

    wikiPayload = await requestJsonViaBackground(

      `/r/${encodeURIComponent(cleanSubreddit)}/wiki/${wikiPath}.json?raw_json=1`,

      { oauth: true },

    );

  } catch (error) {

    const message = error instanceof Error ? error.message : String(error);

    if (/PAGE_NOT_CREATED|WIKI_DISABLED|404|NOT_FOUND|NO_WIKI_PAGE/i.test(message)) {

      return buildDefaultExtensionWikiSettings(cleanSubreddit, cleanWikiPage);

    }

    throw error;

  }



  const raw = String(wikiPayload?.data?.content_md || "").trim();

  if (!raw) {

    return buildDefaultExtensionWikiSettings(cleanSubreddit, cleanWikiPage);

  }



  let doc;

  try {

    doc = JSON.parse(raw);

  } catch {

    throw new Error("Extension settings wiki page content is not valid JSON");

  }



  return normalizeExtensionWikiSettingsDoc(doc, cleanSubreddit, cleanWikiPage);

}



async function saveExtensionSettingsToWiki(subreddit, wikiPage, doc, reason) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  if (!cleanSubreddit) {

    throw new Error("Subreddit is required to save extension settings");

  }

  const cleanWikiPage = String(wikiPage || DEFAULT_EXTENSION_SETTINGS_WIKI_PAGE).trim() || DEFAULT_EXTENSION_SETTINGS_WIKI_PAGE;

  const normalized = normalizeExtensionWikiSettingsDoc(doc, cleanSubreddit, cleanWikiPage);

  const payload = JSON.stringify(normalized, null, 2);

  const params = new URLSearchParams();

  params.set("content", payload);

  params.set("page", cleanWikiPage);

  params.set("reason", String(reason || "updated extension settings via ModBox"));

  await redditFormRequest(`/r/${encodeURIComponent(cleanSubreddit)}/api/wiki/edit`, params);

  return normalized;

}



async function syncWikiExtensionSettingsToStorage(subreddit, wikiPage) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  if (!cleanSubreddit || cleanSubreddit.toLowerCase() === "mod") {

    return null;

  }



  const cleanWikiPage = String(wikiPage || await getExtensionSettingsWikiPagePreference()).trim()

    || DEFAULT_EXTENSION_SETTINGS_WIKI_PAGE;

  const doc = await loadExtensionSettingsFromWiki(cleanSubreddit, cleanWikiPage);

  const settings = doc.settings || {};



  await ext.storage.sync.set({

    [AUTO_CLOSE_KEY]: Boolean(settings.auto_close_on_remove),

    [INTERCEPT_NATIVE_REMOVE_KEY]: Boolean(settings.intercept_native_remove),

    [QUEUE_BAR_SCOPE_KEY]: normalizeQueueBarScope(settings.queue_bar_scope, "current_subreddit"),

    [QUEUE_BAR_FIXED_SUBREDDIT_KEY]: normalizeSubreddit(settings.queue_bar_fixed_subreddit || "") || null,

    [QUEUE_BAR_LINK_HOST_KEY]: normalizeQueueBarLinkHost(settings.queue_bar_link_host, "extension_preference"),

    [QUEUE_BAR_USE_OLD_REDDIT_KEY]: normalizeRemovalBoolean(settings.queue_bar_use_old_reddit, false),

    [QUEUE_BAR_OPEN_IN_NEW_TAB_KEY]: normalizeRemovalBoolean(settings.queue_bar_open_in_new_tab, false),

    [QUEUE_BAR_POSITION_KEY]: ["bottom_left", "bottom_right"].includes(String(settings.queue_bar_position || "")) ? settings.queue_bar_position : "bottom_right",

    [CONTEXT_POPUP_ENABLED_KEY]: Boolean(settings.context_popup_enabled),

    [THEME_MODE_KEY]: normalizeThemeMode(settings.theme_mode, "auto"),

    [COMMENT_NUKE_IGNORE_DISTINGUISHED_KEY]: Boolean(settings.comment_nuke_ignore_distinguished),

    [EXTENSION_SETTINGS_WIKI_PAGE_KEY]: cleanWikiPage,

  });



  interceptNativeRemoveEnabled = Boolean(settings.intercept_native_remove);

  contextPopupFeatureEnabled = Boolean(settings.context_popup_enabled);

  commentNukeIgnoreDistinguished = Boolean(settings.comment_nuke_ignore_distinguished);

  currentThemeMode = normalizeThemeMode(settings.theme_mode, "auto");

  applyThemeToDocument();

  if (!contextPopupFeatureEnabled) {

    clearOldRedditContextPopupLinks();

    closeContextPopup();

  } else {

    bindOldRedditContextPopupLinks();

  }



  panelSettingsPromise = null;

  clearQueueBarContextCache();

  return doc;

}

// ------------------------------------------------------------------------------
// stubs.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Feature Function Stubs Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Minimal placeholder implementations for features not yet extracted.

// Dependencies: constants.js, state.js, utilities.js



// â”€â”€â”€â”€ Removal Config Caching (In-Memory) â”€â”€â”€â”€

// Note: inMemoryConfigCache variable is defined in state.js



function removalConfigCacheKey(subreddit) {

  return normalizeSubreddit(subreddit).toLowerCase();

}



function getInMemoryRemovalConfig(subreddit) {

  const key = removalConfigCacheKey(subreddit);

  if (!key || !(inMemoryConfigCache instanceof Map)) {

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

  inMemoryConfigCache.set(key, normalizeRemovalConfigDoc(config, subreddit));

}



function clearInMemoryRemovalConfig(subreddit) {

  const key = removalConfigCacheKey(subreddit);

  if (!key || !(inMemoryConfigCache instanceof Map)) {

    return;

  }

  inMemoryConfigCache.delete(key);

}



function configCacheMatchesSubreddit(cachedEntry, subreddit) {

  const cachedSubreddit = normalizeSubreddit(cachedEntry?.config?.subreddit || cachedEntry?.subreddit || "");

  return Boolean(cachedSubreddit) && cachedSubreddit.toLowerCase() === removalConfigCacheKey(subreddit);

}



async function getCachedRemovalConfig(subreddit) {

  const memoryConfig = getInMemoryRemovalConfig(subreddit);

  if (memoryConfig) {

    return memoryConfig;

  }



  const cachedEntry = await getConfigCache();

  if (configCacheMatchesSubreddit(cachedEntry, subreddit) && cachedEntry?.config) {

    const config = normalizeRemovalConfigDoc(cachedEntry.config, subreddit);

    setInMemoryRemovalConfig(subreddit, config);

    return config;

  }

  return null;

}



async function setCachedRemovalConfig(subreddit, config) {

  const normalized = normalizeRemovalConfigDoc(config, subreddit);

  setInMemoryRemovalConfig(subreddit, normalized);

  await setConfigCache({ ...normalized, subreddit: normalizeSubreddit(subreddit) });

}



async function clearCachedRemovalConfig(subreddit) {

  clearInMemoryRemovalConfig(subreddit);

  const cachedEntry = await getConfigCache();

  if (configCacheMatchesSubreddit(cachedEntry, subreddit)) {

    await clearConfigCache();

  }

}



// â”€â”€â”€â”€ Stub Helper Functions (used by multiple modules) ----



async function getPanelSettingsCached() {

  if (!panelSettingsPromise) {

    panelSettingsPromise = getApiBaseUrl().catch((error) => {

      panelSettingsPromise = null;

      throw error;

    });

  }

  return panelSettingsPromise;

}



async function loadContextPopupPreference() {

  try {

    const stored = await ext.storage.sync.get([CONTEXT_POPUP_ENABLED_KEY, CONTEXT_POPUP_POSITION_KEY]);

    contextPopupFeatureEnabled = typeof stored?.[CONTEXT_POPUP_ENABLED_KEY] === "boolean" ? stored[CONTEXT_POPUP_ENABLED_KEY] : true;

    contextPopupStoredPosition = normalizeContextPopupPosition(stored?.[CONTEXT_POPUP_POSITION_KEY]);

  } catch {

    contextPopupFeatureEnabled = true;

    contextPopupStoredPosition = null;

  }

}



async function loadContextPopupPosition() {

  await loadContextPopupPreference();

}



function normalizeContextPopupPosition(value) {

  if (!value || typeof value !== "object") {

    return null;

  }

  return {

    custom: Boolean(value.custom),

    x: Number(value.x) || 0,

    y: Number(value.y) || 0,

  };

}



async function loadCommentNukeIgnoreDistinguishedPreference() {

  try {

    const stored = await ext.storage.sync.get([COMMENT_NUKE_IGNORE_DISTINGUISHED_KEY]);

    commentNukeIgnoreDistinguished = typeof stored?.[COMMENT_NUKE_IGNORE_DISTINGUISHED_KEY] === "boolean"

      ? stored[COMMENT_NUKE_IGNORE_DISTINGUISHED_KEY]

      : false;

  } catch {

    commentNukeIgnoreDistinguished = false;

  }

}



async function loadHistoryButtonPreference() {

  try {

    const stored = await ext.storage.sync.get([HISTORY_BUTTON_ENABLED_KEY]);

    historyButtonEnabled = typeof stored?.[HISTORY_BUTTON_ENABLED_KEY] === "boolean"

      ? stored[HISTORY_BUTTON_ENABLED_KEY]

      : false;

  } catch {

    historyButtonEnabled = false;

  }

}



async function loadCommentNukeButtonPreference() {

  try {

    const stored = await ext.storage.sync.get([COMMENT_NUKE_BUTTON_ENABLED_KEY]);

    commentNukeButtonEnabled = typeof stored?.[COMMENT_NUKE_BUTTON_ENABLED_KEY] === "boolean"

      ? stored[COMMENT_NUKE_BUTTON_ENABLED_KEY]

      : false;

  } catch {

    commentNukeButtonEnabled = false;

  }

}



async function ensureAllowedLaunchSubredditsLoaded() {

  if (allowedLaunchSubredditsLoaded) {

    return;

  }

  try {

    allowedLaunchSubredditsPromise = allowedLaunchSubredditsPromise || new Promise(async (resolve) => {

      try {

        const config = await loadModeratedSubredditsList();

        allowedLaunchSubreddits = new Set(

          (config || []).map(sub => normalizeSubreddit(sub)).filter(Boolean).map(s => s.toLowerCase())

        );

      } catch {

        allowedLaunchSubreddits = new Set();

      }

      allowedLaunchSubredditsLoaded = true;

      resolve();

    });

    return allowedLaunchSubredditsPromise;

  } catch {

    allowedLaunchSubredditsLoaded = true;

    throw new Error("Failed to load allowed subreddits");

  }

}



async function loadModeratedSubredditsList() {

  // Fetch the list of subreddits the current user moderates

  try {

    const modSubs = new Set();

    let after = "";



    for (let page = 0; page < 10; page += 1) {

      const url = new URL("https://old.reddit.com/subreddits/mine/moderator.json?raw_json=1&limit=100");

      if (after) {

        url.searchParams.set("after", after);

      }

      const payload = await requestJsonViaBackground(url.toString());

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



    return Array.from(modSubs);

  } catch (error) {

    console.error("[ModBox] Failed to load moderated subreddits:", error);

    return [];

  }

}

// ------------------------------------------------------------------------------
// usernotes.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Usernotes Feature Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Handles subreddit usernotes: fetching, caching, editing, and inline rendering.

// Supports both Toolbox usernotes (wiki-based) and native Reddit modnotes with deduplication.

// Dependencies: reddit-api.js (requestJsonViaBackground, native modnotes functions),

// wiki-loader.js (load/save functions), utilities.js (normalizeSubreddit, escapeHtml),

// constants.js (OVERLAY_ROOT_ID, storage keys)



// â”€â”€â”€â”€ Usernote Type Metadata Caching â”€â”€â”€â”€



function usernoteTypeMetaCacheKey(subreddit) {

  return normalizeSubreddit(subreddit).toLowerCase();

}



function setUsernoteTypeMetaCache(subreddit, payload) {

  usernoteTypeMetaCache.set(usernoteTypeMetaCacheKey(subreddit), {

    expiresAt: Date.now() + USERNOTE_TYPE_META_CACHE_TTL_MS,

    payload,

  });

}



function buildDefaultUsernoteTypeMeta() {

  const colors = {};

  const labels = {};

  DEFAULT_TOOLBOX_USERNOTE_TYPES.forEach((row) => {

    const key = String(row?.key || "").trim().toLowerCase();

    if (!key) {

      return;

    }

    labels[key] = String(row?.text || key).trim() || key;

    const color = String(row?.color || "").trim();

    if (color) {

      colors[key] = color;

    }

  });

  return { colors, labels };

}



function getUsernoteTypeMetaCache(subreddit) {

  const key = usernoteTypeMetaCacheKey(subreddit);

  const item = usernoteTypeMetaCache.get(key);

  if (!item) {

    return null;

  }

  if (item.expiresAt < Date.now()) {

    usernoteTypeMetaCache.delete(key);

    return null;

  }

  return item.payload;

}



function normalizeUsernoteUsername(value) {

  const cleaned = String(value || "").trim().replace(/^\/+/, "");

  if (cleaned.toLowerCase().startsWith("u/")) {

    return cleaned.slice(2).trim();

  }

  return cleaned;

}



// â”€â”€â”€â”€ Native Modnotes Integration & Deduplication â”€â”€â”€â”€



function isNoteTextSimilar(text1, text2, minSimilarity = 0.85) {

  const clean1 = String(text1 || "").trim().toLowerCase();

  const clean2 = String(text2 || "").trim().toLowerCase();

  

  if (clean1 === clean2) {

    return true;

  }

  

  // Simple substring check for case-insensitive match

  if (clean1.includes(clean2) || clean2.includes(clean1)) {

    return true;

  }

  

  return false;

}



function deduplicateToolboxAndNativeNotes(toolboxNotes, nativeNotes, dedupeWindowMs = 60000) {

  const allNotes = [];

  const seenSignatures = new Set();

  const dedupeWindow = Number(dedupeWindowMs || 60000);

  

  console.log(`[ModBox] Deduplication starting: toolbox=${Array.isArray(toolboxNotes) ? toolboxNotes.length : 0}, native=${Array.isArray(nativeNotes) ? nativeNotes.length : 0}`);

  

  // Process Toolbox notes first (preferred in duplicates)

  (Array.isArray(toolboxNotes) ? toolboxNotes : []).forEach((note) => {

    if (!note || typeof note !== "object") {

      return;

    }

    

    const toolboxTime = Number(note.time || Date.now());

    const signature = `${String(note.note || "").trim().toLowerCase()}|${toolboxTime}`;

    seenSignatures.add(signature);

    

    allNotes.push({

      id: String(note.id || note.time || ""),

      note: String(note.note || ""),

      time: toolboxTime,

      mod: String(note.mod || "unknown"),

      link: String(note.link || ""),

      type: String(note.type || "none"),

      source: "Modbox",

      original: note,

    });

  });

  

  console.log(`[ModBox] After adding Toolbox notes: allNotes=${allNotes.length}`);

  

  // Process native notes, filtering out duplicates

  (Array.isArray(nativeNotes) ? nativeNotes : []).forEach((note) => {

    if (!note || typeof note !== "object") {

      return;

    }

    

    const nativeTime = Number(note.created_at || 0) * 1000; // Convert from seconds to ms

    const nativeText = String(note.note || "").trim();

    const nativeCreatedBy = String(note.created_by || "unknown").toLowerCase();

    const isToolboxTransferBot = nativeCreatedBy === "toolboxnotesxfer";

    

    // For toolboxnotesxfer bot, strip the ", added by {author}" suffix to get the original text

    let textToCompare = nativeText;

    if (isToolboxTransferBot) {

      const addedByMatch = nativeText.match(/^(.+?),\s*added by\s+\S+$/);

      if (addedByMatch) {

        textToCompare = addedByMatch[1].trim();

      }

    }

    

    // Check for duplicates in Toolbox notes within the window

    let isDuplicate = false;

    for (const toolboxNote of (Array.isArray(toolboxNotes) ? toolboxNotes : [])) {

      const toolboxTime = Number(toolboxNote.time || Date.now());

      const timeDiff = Math.abs(nativeTime - toolboxTime);

      

      // For notes from toolboxnotesxfer bot, compare the stripped text exactly

      // For regular native notes, use the normal similar text check

      const textMatches = isToolboxTransferBot 

        ? String(toolboxNote.note || "").trim() === textToCompare

        : isNoteTextSimilar(nativeText, toolboxNote.note || "");

      

      // Use a larger time window for toolboxnotesxfer since the bot takes time to transfer

      const effectiveDedupeWindow = isToolboxTransferBot ? 300000 : dedupeWindow; // 5 minutes for bot, 1 minute for others

      

      if (timeDiff <= effectiveDedupeWindow && textMatches) {

        isDuplicate = true;

        break;

      }

    }

    

    if (isDuplicate) {

      console.log(`[ModBox] Filtered duplicate native note from ${nativeCreatedBy}: "${nativeText.slice(0, 50)}..."`);

      return; // Skip this native note (duplicate)

    }

    

    allNotes.push({

      id: String(note.id || ""),

      note: nativeText,

      time: nativeTime,

      mod: String(note.created_by || "unknown"),

      link: String(note.reddit_id || ""),

      type: String(note.label || ""), // Native label maps directly

      source: "reddit",

      original: note,

    });

  });

  

  console.log(`[ModBox] After adding native notes: allNotes=${allNotes.length}`);

  

  // Sort by time descending (most recent first)

  allNotes.sort((a, b) => Number(b.time || 0) - Number(a.time || 0));

  

  console.log(`[ModBox] After sorting: allNotes=${allNotes.length}`);



  return allNotes;

}



// â”€â”€â”€â”€ Usernote Document Merging â”€â”€â”€â”€



function resolveMergedUserEntry(notes, username) {

  const users = notes?.users && typeof notes.users === "object" ? notes.users : {};

  const requested = normalizeUsernoteUsername(username);

  const lowered = requested.toLowerCase();



  const merged = [];

  const seenNotes = new Set();

  let chosenName = requested;



  const mergeUserKey = (key, preferName = false) => {

    if (!key || !users[key] || typeof users[key] !== "object") {

      return;

    }

    const keyNotes = Array.isArray(users[key].notes) ? users[key].notes : [];

    keyNotes.forEach((note) => {

      if (!note || typeof note !== "object") {

        return;

      }

      const noteId = String(note.id || note.time || "");

      const signature = `${noteId}|${String(note.note || "")}|${String(note.mod || "")}|${String(note.link || "")}|${String(note.type || "")}`;

      if (seenNotes.has(signature)) {

        return;

      }

      seenNotes.add(signature);

      merged.push(note);

    });

    if (preferName) {

      chosenName = key;

    }

  };



  mergeUserKey(lowered, true);

  if (requested !== lowered) {

    mergeUserKey(requested, true);

  }



  if (!merged.length) {

    return { canonical: chosenName, entry: null };

  }



  const notesCopy = merged

    .map((note) => ({ ...note }))

    .sort((a, b) => Number(b.time || 0) - Number(a.time || 0));



  return {

    canonical: chosenName,

    entry: {

      name: chosenName,

      notes: notesCopy,

    },

  };

}



// â”€â”€â”€â”€ Toolbox Usernote Type Fetching â”€â”€â”€â”€



async function fetchToolboxUsernoteTypeMetaViaReddit(subreddit) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  const cached = getUsernoteTypeMetaCache(cleanSubreddit);

  if (cached) {

    return cached;

  }



  let payload = null;

  try {

    payload = await requestJsonViaBackground(`/r/${cleanSubreddit}/wiki/toolbox.json?raw_json=1`, { oauth: true });

  } catch {

    const defaults = buildDefaultUsernoteTypeMeta();

    setUsernoteTypeMetaCache(cleanSubreddit, defaults);

    return defaults;

  }



  const raw = String(payload?.data?.content_md || "").trim();

  if (!raw) {

    const defaults = buildDefaultUsernoteTypeMeta();

    setUsernoteTypeMetaCache(cleanSubreddit, defaults);

    return defaults;

  }



  let doc;

  try {

    doc = JSON.parse(raw);

  } catch {

    const defaults = buildDefaultUsernoteTypeMeta();

    setUsernoteTypeMetaCache(cleanSubreddit, defaults);

    return defaults;

  }



  const rows = Array.isArray(doc?.usernoteColors) ? doc.usernoteColors : [];

  if (!rows.length) {

    const defaults = buildDefaultUsernoteTypeMeta();

    setUsernoteTypeMetaCache(cleanSubreddit, defaults);

    return defaults;

  }



  const colors = {};

  const labels = {};

  rows.forEach((row) => {

    if (!row || typeof row !== "object") {

      return;

    }

    const key = String(row.key || "").trim().toLowerCase();

    if (!key) {

      return;

    }

    labels[key] = String(row.text || key).trim() || key;

    const color = String(row.color || "").trim();

    if (color) {

      colors[key] = color;

    }

  });



  const meta = { colors, labels };

  setUsernoteTypeMetaCache(cleanSubreddit, meta);

  return meta;

}



function collectUsernoteTypes(notes, typeMeta) {

  const seen = new Set();

  const out = [];

  const push = (value) => {

    const key = String(value || "").trim().toLowerCase();

    if (!key || seen.has(key)) {

      return;

    }

    seen.add(key);

    out.push(key);

  };



  push("none");

  // Match Toolbox behavior: source note types from toolbox config usernoteColors.

  Object.keys(typeMeta?.labels || {}).forEach(push);

  Object.keys(typeMeta?.colors || {}).forEach(push);

  return out;

}



function buildUsernotesPayloadFromDoc(doc, subreddit, username, typeMeta) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  const cleanUsername = normalizeUsernoteUsername(username);

  const resolved = resolveMergedUserEntry(doc, cleanUsername);

  const userNotes = resolved.entry?.notes || [];

  const latest = userNotes.length ? userNotes[0] : null;

  const noteTypes = collectUsernoteTypes(doc, typeMeta);



  return {

    subreddit: cleanSubreddit,

    username: resolved.canonical || cleanUsername,

    note_count: userNotes.length,

    latest_note: latest,

    notes: userNotes,

    note_types: noteTypes,

    note_type_colors: typeMeta?.colors && typeof typeMeta.colors === "object" ? typeMeta.colors : {},

    note_type_labels: typeMeta?.labels && typeof typeMeta.labels === "object" ? typeMeta.labels : {},

  };

}



// â”€â”€â”€â”€ Current User Detection â”€â”€â”€â”€



let currentRedditUsernameCache = "";

let currentRedditUsernamePromise = null;



function getCurrentRedditUsernameFromPage() {

  // In Firefox content scripts, reading some page globals can throw cross-compartment

  // security errors. Probe each source independently so one failure does not abort lookup.

  const readers = [

    () => globalThis?.reddit?.user?.name,

    () => globalThis?.__INITIAL_STATE__?.session?.user?.account?.displayText,

    () => globalThis?.__INITIAL_STATE__?.session?.user?.account?.name,

    () => globalThis?.r?.config?.logged,

    () => document.querySelector("span.user a")?.textContent,

    () => document.querySelector("#header-bottom-right .user a")?.textContent,

  ];



  for (const readCandidate of readers) {

    let candidate = "";

    try {

      candidate = readCandidate();

    } catch {

      candidate = "";

    }



    const value = String(candidate || "").trim().replace(/^u\//i, "");

    if (value) {

      return value;

    }

  }

  return "";

}



async function getCurrentRedditUsername() {

  if (currentRedditUsernameCache) {

    return currentRedditUsernameCache;

  }



  const local = getCurrentRedditUsernameFromPage();

  if (local) {

    currentRedditUsernameCache = local;

    return local;

  }



  if (!currentRedditUsernamePromise) {

    currentRedditUsernamePromise = (async () => {

      try {

        const me = await requestJsonViaBackground("/api/v1/me", { oauth: true });

        const value = String(me?.name || "").trim().replace(/^u\//i, "");

        return value || "";

      } catch {

        return "";

      }

    })();

  }



  const resolved = await currentRedditUsernamePromise;

  currentRedditUsernamePromise = null;

  currentRedditUsernameCache = resolved || "";

  return currentRedditUsernameCache;

}



// â”€â”€â”€â”€ Usernote Fetching and CRUD â”€â”€â”€â”€



async function fetchUsernotesViaReddit(subreddit, username, forceRefresh = false) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  const cleanUser = normalizeUsernoteUsername(username);

  if (!cleanSubreddit || !cleanUser) {

    throw new Error("Missing subreddit or username for usernotes");

  }



  if (!forceRefresh) {

    const cached = getUsernotesCache(cleanSubreddit, cleanUser);

    if (cached) {

      return cached;

    }

  }



  const [notesDoc, typeMeta] = await Promise.all([

    loadSubredditUsernotesFromWiki(cleanSubreddit),

    fetchToolboxUsernoteTypeMetaViaReddit(cleanSubreddit),

  ]);

  const payload = buildUsernotesPayloadFromDoc(notesDoc, cleanSubreddit, cleanUser, typeMeta);

  setUsernotesCache(cleanSubreddit, cleanUser, payload);

  return payload;

}



async function fetchUsernotesWithNativeViaReddit(subreddit, username, forceRefresh = false) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  const cleanUser = normalizeUsernoteUsername(username);

  if (!cleanSubreddit || !cleanUser) {

    throw new Error("Missing subreddit or username for usernotes");

  }



  if (!forceRefresh) {

    const cached = getUsernotesCache(cleanSubreddit, cleanUser);

    if (cached) {

      return cached;

    }

  }



  try {

    // Fetch both Toolbox and native notes in parallel

    // NOTE: Native notes are currently disabled by default due to Reddit rate limits

    // Only fetch them if explicitly requested (forceRefresh = true indicates explicit request)

    const nativeNotesPromise = forceRefresh 

      ? fetchNativeModnotesViaReddit(cleanSubreddit, cleanUser)

      : Promise.resolve([]);



    const [notesDoc, typeMeta, nativeNotes] = await Promise.all([

      loadSubredditUsernotesFromWiki(cleanSubreddit),

      fetchToolboxUsernoteTypeMetaViaReddit(cleanSubreddit),

      nativeNotesPromise,

    ]);



    // Extract Toolbox notes for the user

    const resolved = resolveMergedUserEntry(notesDoc, cleanUser);

    const toolboxNotes = resolved.entry?.notes || [];

    

    console.log(`[ModBox] Merged notes fetch for ${cleanUser}: toolbox count=${toolboxNotes.length}, native count=${nativeNotes.length || 0}`);

    if (toolboxNotes.length > 0) {

      console.log(`[ModBox] First toolbox note:`, JSON.stringify(toolboxNotes[0]));

    }

    if (nativeNotes && nativeNotes.length > 0) {

      console.log(`[ModBox] First native note:`, JSON.stringify(nativeNotes[0]));

    }



    // Deduplicate and merge

    const mergedNotes = deduplicateToolboxAndNativeNotes(toolboxNotes, nativeNotes);

    

    console.log(`[ModBox] After deduplication: merged count=${mergedNotes.length}`);



    // Build payload with merged notes

    const payload = {

      subreddit: cleanSubreddit,

      username: resolved.canonical || cleanUser,

      note_count: mergedNotes.length,

      latest_note: mergedNotes.length > 0 ? mergedNotes[0] : null,

      notes: mergedNotes,

      note_types: collectUsernoteTypes(notesDoc, typeMeta),

      note_type_colors: typeMeta?.colors && typeof typeMeta.colors === "object" ? typeMeta.colors : {},

      note_type_labels: typeMeta?.labels && typeof typeMeta.labels === "object" ? typeMeta.labels : {},

    };



    setUsernotesCache(cleanSubreddit, cleanUser, payload);

    return payload;

  } catch (error) {

    // Fallback to Toolbox-only notes if native fetch fails

    console.warn("[ModBox] Native modnotes fetch failed, falling back to Toolbox only:", error);

    return fetchUsernotesViaReddit(cleanSubreddit, cleanUser, forceRefresh);

  }

}



async function addUsernoteViaReddit(subreddit, username, noteText, noteType = "none", link = "") {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  const cleanUser = normalizeUsernoteUsername(username);

  const text = String(noteText || "").trim();

  if (!cleanSubreddit || !cleanUser || !text) {

    throw new Error("Subreddit, username, and note text are required");

  }



  const notesDoc = await loadSubredditUsernotesFromWiki(cleanSubreddit);

  const resolved = resolveMergedUserEntry(notesDoc, cleanUser);

  const existingNotes = resolved.entry?.notes ? resolved.entry.notes.map((row) => ({ ...row })) : [];

  const modUsername = await getCurrentRedditUsername();

  const now = Date.now();

  existingNotes.unshift({

    id: String(now),

    note: text,

    time: now,

    mod: modUsername,

    link: String(link || ""),

    type: String(noteType || "none") || "none",

  });



  notesDoc.users = notesDoc.users && typeof notesDoc.users === "object" ? notesDoc.users : {};

  delete notesDoc.users[cleanUser.toLowerCase()];

  delete notesDoc.users[cleanUser];

  notesDoc.users[cleanUser] = {

    name: cleanUser,

    notes: existingNotes.sort((a, b) => Number(b.time || 0) - Number(a.time || 0)),

  };



  await saveSubredditUsernotesToWiki(cleanSubreddit, notesDoc, `create note on user ${cleanUser}`);

  const typeMeta = await fetchToolboxUsernoteTypeMetaViaReddit(cleanSubreddit);

  const payload = buildUsernotesPayloadFromDoc(notesDoc, cleanSubreddit, cleanUser, typeMeta);

  setUsernotesCache(cleanSubreddit, cleanUser, payload);

  return payload;

}



async function updateUsernoteViaReddit(subreddit, username, noteId, noteText, noteType = null) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  const cleanUser = normalizeUsernoteUsername(username);

  const targetId = String(noteId || "").trim();

  const text = String(noteText || "").trim();

  if (!cleanSubreddit || !cleanUser || !targetId || !text) {

    throw new Error("Subreddit, username, note id, and note text are required");

  }



  const notesDoc = await loadSubredditUsernotesFromWiki(cleanSubreddit);

  const resolved = resolveMergedUserEntry(notesDoc, cleanUser);

  if (!resolved.entry) {

    throw new Error("No notes found for user");

  }

  const modUsername = await getCurrentRedditUsername();



  let found = false;

  const nextNotes = resolved.entry.notes.map((row) => {

    const rowId = String(row?.id || row?.time || "");

    if (rowId !== targetId) {

      return { ...row };

    }

    found = true;

    return {

      ...row,

      note: text,

      mod: modUsername || String(row.mod || ""),

      type: noteType == null ? String(row.type || "none") : (String(noteType || "none") || "none"),

    };

  });



  if (!found) {

    throw new Error("Note not found");

  }



  notesDoc.users = notesDoc.users && typeof notesDoc.users === "object" ? notesDoc.users : {};

  delete notesDoc.users[cleanUser.toLowerCase()];

  delete notesDoc.users[cleanUser];

  notesDoc.users[cleanUser] = {

    name: cleanUser,

    notes: nextNotes.sort((a, b) => Number(b.time || 0) - Number(a.time || 0)),

  };



  await saveSubredditUsernotesToWiki(cleanSubreddit, notesDoc, `edit note on user ${cleanUser}`);

  const typeMeta = await fetchToolboxUsernoteTypeMetaViaReddit(cleanSubreddit);

  const payload = buildUsernotesPayloadFromDoc(notesDoc, cleanSubreddit, cleanUser, typeMeta);

  setUsernotesCache(cleanSubreddit, cleanUser, payload);

  return payload;

}



async function deleteUsernoteViaReddit(subreddit, username, noteId) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  const cleanUser = normalizeUsernoteUsername(username);

  const targetId = String(noteId || "").trim();

  if (!cleanSubreddit || !cleanUser || !targetId) {

    throw new Error("Subreddit, username, and note id are required");

  }



  const notesDoc = await loadSubredditUsernotesFromWiki(cleanSubreddit);

  const resolved = resolveMergedUserEntry(notesDoc, cleanUser);

  if (!resolved.entry) {

    throw new Error("No notes found for user");

  }



  const priorCount = resolved.entry.notes.length;

  const nextNotes = resolved.entry.notes

    .map((row) => ({ ...row }))

    .filter((row) => String(row?.id || row?.time || "") !== targetId);



  if (nextNotes.length === priorCount) {

    throw new Error("Note not found");

  }



  notesDoc.users = notesDoc.users && typeof notesDoc.users === "object" ? notesDoc.users : {};

  delete notesDoc.users[cleanUser.toLowerCase()];

  delete notesDoc.users[cleanUser];

  notesDoc.users[cleanUser] = {

    name: cleanUser,

    notes: nextNotes.sort((a, b) => Number(b.time || 0) - Number(a.time || 0)),

  };



  await saveSubredditUsernotesToWiki(cleanSubreddit, notesDoc, `delete note on user ${cleanUser}`);

  const typeMeta = await fetchToolboxUsernoteTypeMetaViaReddit(cleanSubreddit);

  const payload = buildUsernotesPayloadFromDoc(notesDoc, cleanSubreddit, cleanUser, typeMeta);

  setUsernotesCache(cleanSubreddit, cleanUser, payload);

  return payload;

}



// â”€â”€â”€â”€ Dual-System Write Operations (Toolbox + Native) â”€â”€â”€â”€



async function addUsernoteViaBothSystems(subreddit, username, noteText, noteType = "none", link = "", redditId = null) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  const cleanUser = normalizeUsernoteUsername(username);

  const text = String(noteText || "").trim();

  if (!cleanSubreddit || !cleanUser || !text) {

    throw new Error("Subreddit, username, and note text are required");

  }



  const results = {

    toolbox: { success: false, error: null },

    native: { success: false, error: null },

    payload: null,

  };



  // Write to Toolbox (Modbox)

  try {

    const notesDoc = await loadSubredditUsernotesFromWiki(cleanSubreddit);

    const resolved = resolveMergedUserEntry(notesDoc, cleanUser);

    const existingNotes = resolved.entry?.notes ? resolved.entry.notes.map((row) => ({ ...row })) : [];

    const modUsername = await getCurrentRedditUsername();

    const now = Date.now();

    existingNotes.unshift({

      id: String(now),

      note: text,

      time: now,

      mod: modUsername,

      link: String(link || ""),

      type: String(noteType || "none") || "none",

    });



    notesDoc.users = notesDoc.users && typeof notesDoc.users === "object" ? notesDoc.users : {};

    delete notesDoc.users[cleanUser.toLowerCase()];

    delete notesDoc.users[cleanUser];

    notesDoc.users[cleanUser] = {

      name: cleanUser,

      notes: existingNotes.sort((a, b) => Number(b.time || 0) - Number(a.time || 0)),

    };



    await saveSubredditUsernotesToWiki(cleanSubreddit, notesDoc, `create note on user ${cleanUser}`);

    results.toolbox.success = true;

  } catch (error) {

    results.toolbox.error = getSafeErrorMessage(error);

    console.error("[ModBox] Failed to write Toolbox note:", results.toolbox.error);

  }



  // Native Reddit Modnotes: read-only mode

  // Native note creation disabled - use Toolbox to create notes

  results.native.success = false;

  results.native.error = "Native note creation is disabled (read-only mode)";



  // Fetch updated notes to return

  try {

    const typeMeta = await fetchToolboxUsernoteTypeMetaViaReddit(cleanSubreddit);

    const notesDoc = await loadSubredditUsernotesFromWiki(cleanSubreddit);

    const resolved = resolveMergedUserEntry(notesDoc, cleanUser);

    const toolboxNotes = resolved.entry?.notes || [];

    

    let nativeNotes = [];

    if (results.native.success) {

      try {

        nativeNotes = await fetchNativeModnotesViaReddit(cleanSubreddit, cleanUser);

      } catch {

        // Non-critical: we already wrote the note

      }

    }



    const mergedNotes = deduplicateToolboxAndNativeNotes(toolboxNotes, nativeNotes);

    results.payload = {

      subreddit: cleanSubreddit,

      username: resolved.canonical || cleanUser,

      note_count: mergedNotes.length,

      latest_note: mergedNotes.length > 0 ? mergedNotes[0] : null,

      notes: mergedNotes,

      note_types: collectUsernoteTypes(notesDoc, typeMeta),

      note_type_colors: typeMeta?.colors && typeof typeMeta.colors === "object" ? typeMeta.colors : {},

      note_type_labels: typeMeta?.labels && typeof typeMeta.labels === "object" ? typeMeta.labels : {},

    };

    setUsernotesCache(cleanSubreddit, cleanUser, results.payload);

  } catch (error) {

    console.error("[ModBox] Failed to fetch updated notes:", error);

  }



  // If both failed, throw error

  if (!results.toolbox.success && !results.native.success) {

    throw new Error(`Failed to create note in both systems: Toolbox: ${results.toolbox.error}, Native: ${results.native.error}`);

  }



  return results;

}



async function deleteUsernoteViaBothSystems(subreddit, username, noteId, noteSource = null) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  const cleanUser = normalizeUsernoteUsername(username);

  const targetId = String(noteId || "").trim();

  if (!cleanSubreddit || !cleanUser || !targetId) {

    throw new Error("Subreddit, username, and note id are required");

  }



  const results = {

    toolbox: { success: false, error: null },

    native: { success: false, error: null },

    payload: null,

  };



  // Determine which systems to delete from

  const deleteFromToolbox = noteSource === null || noteSource === "Modbox";

  const deleteFromNative = noteSource === null || noteSource === "reddit";



  // Delete from Toolbox if applicable

  if (deleteFromToolbox) {

    try {

      const notesDoc = await loadSubredditUsernotesFromWiki(cleanSubreddit);

      const resolved = resolveMergedUserEntry(notesDoc, cleanUser);

      if (!resolved.entry) {

        throw new Error("No notes found for user");

      }



      const priorCount = resolved.entry.notes.length;

      const nextNotes = resolved.entry.notes

        .map((row) => ({ ...row }))

        .filter((row) => String(row?.id || row?.time || "") !== targetId);



      if (nextNotes.length === priorCount) {

        throw new Error("Note not found in Toolbox");

      }



      notesDoc.users = notesDoc.users && typeof notesDoc.users === "object" ? notesDoc.users : {};

      delete notesDoc.users[cleanUser.toLowerCase()];

      delete notesDoc.users[cleanUser];

      notesDoc.users[cleanUser] = {

        name: cleanUser,

        notes: nextNotes.sort((a, b) => Number(b.time || 0) - Number(a.time || 0)),

      };



      await saveSubredditUsernotesToWiki(cleanSubreddit, notesDoc, `delete note on user ${cleanUser}`);

      results.toolbox.success = true;

    } catch (error) {

      results.toolbox.error = getSafeErrorMessage(error);

      console.error("[ModBox] Failed to delete Toolbox note:", results.toolbox.error);

    }

  }



  // Delete from Native if applicable

  if (deleteFromNative) {

    // Native note deletion disabled - treat as success since native is read-only

    results.native.success = true;

  }



  // Fetch updated notes to return

  try {

    const typeMeta = await fetchToolboxUsernoteTypeMetaViaReddit(cleanSubreddit);

    const notesDoc = await loadSubredditUsernotesFromWiki(cleanSubreddit);

    const resolved = resolveMergedUserEntry(notesDoc, cleanUser);

    const toolboxNotes = resolved.entry?.notes || [];

    

    let nativeNotes = [];

    try {

      nativeNotes = await fetchNativeModnotesViaReddit(cleanSubreddit, cleanUser);

    } catch {

      // Non-critical: continue with Toolbox only

    }



    const mergedNotes = deduplicateToolboxAndNativeNotes(toolboxNotes, nativeNotes);

    results.payload = {

      subreddit: cleanSubreddit,

      username: resolved.canonical || cleanUser,

      note_count: mergedNotes.length,

      latest_note: mergedNotes.length > 0 ? mergedNotes[0] : null,

      notes: mergedNotes,

      note_types: collectUsernoteTypes(notesDoc, typeMeta),

      note_type_colors: typeMeta?.colors && typeof typeMeta.colors === "object" ? typeMeta.colors : {},

      note_type_labels: typeMeta?.labels && typeof typeMeta.labels === "object" ? typeMeta.labels : {},

    };

    setUsernotesCache(cleanSubreddit, cleanUser, results.payload);

  } catch (error) {

    console.error("[ModBox] Failed to fetch updated notes:", error);

  }



  // Check if deletion succeeded from systems we tried

  if (deleteFromToolbox && !results.toolbox.success) {

    throw new Error(`Failed to delete from Toolbox: ${results.toolbox.error}`);

  }

  if (deleteFromNative && !results.native.success) {

    throw new Error(`Failed to delete from Native: ${results.native.error}`);

  }



  return results;

}



async function fetchUsernotes(subreddit, username, forceRefresh = false) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  const cleanUser = String(username || "").trim();

  if (!cleanSubreddit || !cleanUser) {

    throw new Error("Missing subreddit or username for usernotes");

  }



  if (!forceRefresh) {

    const cached = getUsernotesCache(cleanSubreddit, cleanUser);

    if (cached) {

      return cached;

    }

  }



  return fetchUsernotesViaReddit(cleanSubreddit, cleanUser, forceRefresh);

}



// â”€â”€â”€â”€ Usernote Editor UI â”€â”€â”€â”€



function showUsernotesDeleteConfirmation(noteSource) {

  console.log("[ModBox] showUsernotesDeleteConfirmation called with noteSource:", noteSource);

  return new Promise((resolve) => {

    const root = ensureOverlayRoot();

    let backdrop = root.querySelector(".rrw-usernotes-delete-backdrop");

    let modal = root.querySelector(".rrw-usernotes-delete-modal");

    

    if (!(backdrop instanceof HTMLElement)) {

      backdrop = document.createElement("div");

      backdrop.className = "rrw-usernotes-delete-backdrop";

      root.appendChild(backdrop);

    }

    if (!(modal instanceof HTMLElement)) {

      modal = document.createElement("div");

      modal.className = "rrw-usernotes-delete-modal";

      root.appendChild(modal);

    }



    const isSystemNote = noteSource === "reddit";

    const isToolboxNote = noteSource === "Modbox";

    

    let modalContent = `

      <div class="rrw-delete-modal-content">

        <h4>Delete Usernote</h4>

        <p>This note exists in: <strong>${isSystemNote ? "Reddit's native system" : isToolboxNote ? "Toolbox" : "both systems"}</strong></p>

        <p>Where would you like to delete it from?</p>

        <div class="rrw-delete-modal-buttons">

    `;

    

    // Show appropriate delete options based on note source

    if (isToolboxNote) {

      // Toolbox-only note

      modalContent += `

        <button type="button" class="rrw-btn rrw-btn-primary" data-delete-choice="Modbox">Delete from Toolbox</button>

      `;

    } else if (isSystemNote) {

      // Reddit-only note

      modalContent += `

        <button type="button" class="rrw-btn rrw-btn-primary" data-delete-choice="reddit">Delete from Reddit</button>

      `;

    } else {

      // Both systems (shouldn't happen with current dedup logic, but support it)

      modalContent += `

        <button type="button" class="rrw-btn rrw-btn-primary" data-delete-choice="null">Delete from both</button>

        <button type="button" class="rrw-btn rrw-btn-secondary" data-delete-choice="Modbox">Delete from Toolbox only</button>

        <button type="button" class="rrw-btn rrw-btn-secondary" data-delete-choice="reddit">Delete from Reddit only</button>

      `;

    }

    

    modalContent += `

        <button type="button" class="rrw-btn rrw-btn-tertiary" data-delete-choice="cancel">Cancel</button>

        </div>

      </div>

    `;

    

    modal.innerHTML = modalContent;

    console.log("[ModBox] Delete modal created with buttons");

    console.log("[ModBox] Modal element:", modal);

    console.log("[ModBox] Modal display:", window.getComputedStyle(modal).display);

    console.log("[ModBox] Modal pointer-events:", window.getComputedStyle(modal).pointerEvents);

    console.log("[ModBox] Modal z-index:", window.getComputedStyle(modal).zIndex);

    console.log("[ModBox] Modal position:", window.getComputedStyle(modal).position);

    console.log("[ModBox] Modal visibility:", window.getComputedStyle(modal).visibility);

    console.log("[ModBox] Modal opacity:", window.getComputedStyle(modal).opacity);

    console.log("[ModBox] Modal offsetHeight:", modal.offsetHeight);

    console.log("[ModBox] Modal offsetWidth:", modal.offsetWidth);

    console.log("[ModBox] Modal getBoundingClientRect:", modal.getBoundingClientRect());

    console.log("[ModBox] Backdrop element:", backdrop);

    console.log("[ModBox] Backdrop display:", window.getComputedStyle(backdrop).display);

    console.log("[ModBox] Backdrop pointer-events:", window.getComputedStyle(backdrop).pointerEvents);

    console.log("[ModBox] Backdrop z-index:", window.getComputedStyle(backdrop).zIndex);

    console.log("[ModBox] Root element:", root);

    console.log("[ModBox] Root in DOM:", document.body.contains(root));

    console.log("[ModBox] Root z-index:", window.getComputedStyle(root).zIndex);

    console.log("[ModBox] Root display:", window.getComputedStyle(root).display);

    console.log("[ModBox] Root position:", window.getComputedStyle(root).position);

    

    // Add event listeners

    const buttons = modal.querySelectorAll("[data-delete-choice]");

    console.log("[ModBox] Found", buttons.length, "delete buttons");

    

    // Debug: log button details

    buttons.forEach((btn, idx) => {

      console.log(`[ModBox] Button ${idx}:`, btn);

      console.log(`[ModBox] Button ${idx} display:`, window.getComputedStyle(btn).display);

      console.log(`[ModBox] Button ${idx} pointer-events:`, window.getComputedStyle(btn).pointerEvents);

      console.log(`[ModBox] Button ${idx} data-delete-choice:`, btn.getAttribute("data-delete-choice"));

      console.log(`[ModBox] Button ${idx} parent:`, btn.parentElement);

    });

    

    // Add click listener to modal itself to see if ANY clicks reach it

    modal.addEventListener("click", (e) => {

      console.log("[ModBox] Modal received click event, target:", e.target);

    });

    

    // Add click listener to backdrop to see if clicks are blocked by it

    backdrop.addEventListener("click", (e) => {

      console.log("[ModBox] Backdrop received click event, target:", e.target);

    });

    

    buttons.forEach((btn) => {

      // Try both bubble and capture phases

      btn.addEventListener("click", (e) => {

        const choice = btn.getAttribute("data-delete-choice");

        console.log("[ModBox] Delete button clicked (bubble) with choice:", choice);

        backdrop.remove();

        modal.remove();

        

        if (choice === "cancel") {

          resolve(null);

        } else if (choice === "null") {

          resolve(null); // null means delete from both

        } else {

          resolve(choice); // "Modbox", "reddit", or null

        }

      }, false);

      

      btn.addEventListener("click", (e) => {

        console.log("[ModBox] Delete button clicked (capture) with choice:", btn.getAttribute("data-delete-choice"));

      }, true);

    });

  });

}



function closeUsernotesEditor() {

  usernotesEditorState = null;

  const root = document.getElementById(OVERLAY_ROOT_ID);

  if (!root) {

    return;

  }

  root.querySelectorAll(".rrw-usernotes-backdrop, .rrw-usernotes-modal").forEach((el) => el.remove());

  if (!overlayState && !root.children.length) {

    root.remove();

  }

}



function renderUsernotesEditor() {

  if (!usernotesEditorState) {

    closeUsernotesEditor();

    return;

  }



  const root = ensureOverlayRoot();

  let backdrop = root.querySelector(".rrw-usernotes-backdrop");

  let modal = root.querySelector(".rrw-usernotes-modal");

  if (!(backdrop instanceof HTMLElement)) {

    backdrop = document.createElement("div");

    backdrop.className = "rrw-usernotes-backdrop";

    root.appendChild(backdrop);

  }

  if (!(modal instanceof HTMLElement)) {

    modal = document.createElement("section");

    modal.className = "rrw-usernotes-modal";

    root.appendChild(modal);

  }



  const state = usernotesEditorState;

  const typeMeta = {

    colors: state.noteTypeColors || {},

    labels: state.noteTypeLabels || {},

  };

  const noteTypes = Array.from(new Set(["none", ...(Array.isArray(state.noteTypes) ? state.noteTypes : [])]));

  const noteTypeOptions = noteTypes

    .map((value) => {

      const label = String(typeMeta.labels[String(value).toLowerCase()] || value);

      return `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;

    })

    .join("");

  const notesRows = (state.notes || [])

    .map((note) => {

      const noteId = String(note.id || note.time || "");

      const noteText = String(note.note || "");

      const noteType = String(note.type || "none");

      const noteLink = String(note.link || "").trim();

      const noteMod = String(note.mod || "");

      const noteSource = String(note.source || "Modbox");

      const sourceBadgeHtml = `<span class="rrw-note-source-badge">${escapeHtml(noteSource)}</span>`;

      const dateText = Number(note.time) ? new Date(Number(note.time)).toLocaleString() : "unknown date";

      const deleteButtonHtml = noteSource === "reddit" ? "" : `<button type="button" class="rrw-btn-trash" data-un-delete-id="${escapeHtml(noteId)}" title="Delete note" ${state.saving ? "disabled" : ""}>

              &times;

            </button>`;

      return `

        <article class="rrw-usernote-row">

          <div class="rrw-usernote-header-row">

            <div class="rrw-usernote-meta-and-types">

              <div class="rrw-usernote-meta">${noteMod ? `u/${escapeHtml(noteMod)} &middot; ` : ""}${escapeHtml(dateText)}</div>

              <div class="rrw-usernote-type-wrap">${renderNoteTypeBadge(noteType, "rrw-note-type-pill", typeMeta)}${sourceBadgeHtml}</div>

            </div>

            ${deleteButtonHtml}

          </div>

          ${noteLink ? `<a class="rrw-usernote-link" href="${escapeHtml(noteLink)}" target="_blank" rel="noreferrer">Source: ${escapeHtml(noteLink)}</a>` : ""}

          <div class="rrw-usernote-text-display">${escapeHtml(noteText)}</div>

        </article>

      `;

    })

    .join("");



  const emptyState = !state.loading && (state.notes || []).length === 0;

  modal.innerHTML = `

    <header class="rrw-usernotes-header">

      <h3>Usernotes &middot; u/${escapeHtml(state.username)} &middot; r/${escapeHtml(state.subreddit)}</h3>

      <button type="button" class="rrw-close" data-un-close="1">Close</button>

    </header>

    <div class="rrw-usernotes-body">

      ${state.error ? `<div class="rrw-error">${escapeHtml(state.error)}</div>` : ""}

      ${state.status ? `<div class="rrw-success">${escapeHtml(state.status)}</div>` : ""}

      ${state.loading ? `<p class="rrw-muted">Loading usernotes...</p>` : ""}

      ${emptyState ? `<p class="rrw-muted">No notes yet for this user.</p>` : ""}

      <div class="rrw-usernote-list">${notesRows}</div>



      <section class="rrw-usernote-add-box">

        <h4>Add note</h4>

        <textarea id="rrw-un-new-note" rows="3" placeholder="Write a moderator note..."></textarea>

        ${state.link ? `

          <label class="rrw-usernote-include-link">

            <input id="rrw-un-include-link" type="checkbox" ${state.includeSourceLink ? "checked" : ""} />

            <span>Include source link</span>

          </label>

          <a class="rrw-usernote-link" href="${escapeHtml(state.link)}" target="_blank" rel="noreferrer">Source: ${escapeHtml(state.link)}</a>

        ` : ""}

        <label class="rrw-field">

          <span>Type</span>

          <select id="rrw-un-new-type">

            ${noteTypeOptions}

          </select>

        </label>

        <div class="rrw-usernote-row-actions">

          <button type="button" class="rrw-btn rrw-btn-primary" id="rrw-un-add" ${state.saving ? "disabled" : ""}>Add note</button>

        </div>

      </section>

    </div>

  `;



  const closeTargets = [backdrop, modal.querySelector("[data-un-close='1']")];

  closeTargets.forEach((targetEl) => {

    if (!targetEl) {

      return;

    }

    targetEl.addEventListener("click", (event) => {

      if (targetEl === modal && event.target !== targetEl) {

        return;

      }

      closeUsernotesEditor();

    });

  });



  modal.querySelectorAll("[data-un-delete-id]").forEach((button) => {

    button.addEventListener("click", async (event) => {

      if (!usernotesEditorState) {

        console.log("[ModBox] Delete: No editor state");

        return;

      }



      const noteId = event.currentTarget.getAttribute("data-un-delete-id");

      console.log("[ModBox] Delete button clicked, noteId:", noteId);

      if (!noteId) {

        console.log("[ModBox] Delete: No noteId found");

        return;

      }



      // Find the note to determine its source

      const targetNote = (usernotesEditorState.notes || []).find((note) => String(note.id || note.time || "") === noteId);

      const noteSource = targetNote?.source || "Modbox";

      console.log("[ModBox] Target note:", targetNote, "source:", noteSource);



      // Delete immediately without confirmation

      // Determine which system(s) to delete from based on note source

      let deleteFromSystem = noteSource === "reddit" ? "reddit" : noteSource === "Modbox" ? "Modbox" : null;



      try {

        usernotesEditorState.saving = true;

        usernotesEditorState.error = "";

        usernotesEditorState.status = "";

        renderUsernotesEditor();



        console.log("[ModBox] Calling deleteUsernoteViaBothSystems with noteId:", noteId, "source:", deleteFromSystem);

        // Delete from appropriate system(s)

        const deleteResults = await deleteUsernoteViaBothSystems(

          usernotesEditorState.subreddit,

          usernotesEditorState.username,

          noteId,

          deleteFromSystem,

        );

        console.log("[ModBox] Delete results:", deleteResults);



        // Check if deletion succeeded from at least one system

        const deleteSuccessful = deleteResults.toolbox.success || deleteResults.native.success;

        if (!deleteSuccessful) {

          throw new Error("Failed to delete note from all systems");

        }



        clearUsernotesCache(usernotesEditorState.subreddit, usernotesEditorState.username);

        

        // Update UI with results

        if (deleteResults.payload) {

          usernotesEditorState.notes = Array.isArray(deleteResults.payload?.notes) ? deleteResults.payload.notes : [];

          usernotesEditorState.noteTypes = Array.isArray(deleteResults.payload?.note_types) ? deleteResults.payload.note_types : ["none"];

          usernotesEditorState.noteTypeColors = deleteResults.payload?.note_type_colors && typeof deleteResults.payload.note_type_colors === "object" ? deleteResults.payload.note_type_colors : {};

          usernotesEditorState.noteTypeLabels = deleteResults.payload?.note_type_labels && typeof deleteResults.payload.note_type_labels === "object" ? deleteResults.payload.note_type_labels : {};

        }



        usernotesEditorState.status = "Note deleted.";

        console.log("[ModBox] Delete complete. Status:", usernotesEditorState.status);



        if (typeof usernotesEditorState.onUpdated === "function") {

          usernotesEditorState.onUpdated(deleteResults.payload);

        }

      } catch (error) {

        console.error("[ModBox] Delete error:", error);

        usernotesEditorState.error = error instanceof Error ? error.message : String(error);

      } finally {

        if (usernotesEditorState) {

          usernotesEditorState.saving = false;

          renderUsernotesEditor();

        }

      }

    });

  });



  const addButton = modal.querySelector("#rrw-un-add");

  if (addButton) {

    addButton.addEventListener("click", async () => {

      if (!usernotesEditorState) {

        return;

      }

      const input = modal.querySelector("#rrw-un-new-note");

      const typeSelect = modal.querySelector("#rrw-un-new-type");

      const includeLinkCheckbox = modal.querySelector("#rrw-un-include-link");

      const noteText = String(input?.value || "").trim();

      const selectedType = String(typeSelect?.value || "none").trim() || "none";

      const includeSourceLink = includeLinkCheckbox ? Boolean(includeLinkCheckbox.checked) : false;

      if (!noteText) {

        usernotesEditorState.error = "Note text cannot be empty.";

        renderUsernotesEditor();

        return;

      }



      try {

        usernotesEditorState.saving = true;

        usernotesEditorState.error = "";

        usernotesEditorState.status = "";

        renderUsernotesEditor();



        const writeResults = await addUsernoteViaBothSystems(

          usernotesEditorState.subreddit,

          usernotesEditorState.username,

          noteText,

          selectedType,

          includeSourceLink ? usernotesEditorState.link || "" : "",

        );

        clearUsernotesCache(usernotesEditorState.subreddit, usernotesEditorState.username);

        

        // Show status about which systems succeeded

        const addedTo = [];

        if (writeResults.toolbox.success) addedTo.push("Toolbox");

        if (writeResults.native.success) addedTo.push("native");

        

        if (writeResults.payload) {

          usernotesEditorState.notes = Array.isArray(writeResults.payload?.notes) ? writeResults.payload.notes : [];

          usernotesEditorState.noteTypes = Array.isArray(writeResults.payload?.note_types) ? writeResults.payload.note_types : ["none"];

          usernotesEditorState.noteTypeColors = writeResults.payload?.note_type_colors && typeof writeResults.payload.note_type_colors === "object" ? writeResults.payload.note_type_colors : {};

          usernotesEditorState.noteTypeLabels = writeResults.payload?.note_type_labels && typeof writeResults.payload.note_type_labels === "object" ? writeResults.payload.note_type_labels : {};

        }

        usernotesEditorState.status = addedTo.length > 0 ? `Note added to: ${addedTo.join(", ")}.` : "Note added.";

        if (typeof usernotesEditorState.onUpdated === "function") {

          usernotesEditorState.onUpdated(writeResults.payload);

        }

      } catch (error) {

        usernotesEditorState.error = error instanceof Error ? error.message : String(error);

      } finally {

        if (usernotesEditorState) {

          usernotesEditorState.saving = false;

          renderUsernotesEditor();

        }

      }

    });

  }

}



async function openUsernotesEditor(context) {

  usernotesEditorState = {

    subreddit: normalizeSubreddit(context.subreddit),

    username: String(context.username || ""),

    link: String(context.link || ""),

    includeSourceLink: Boolean(context.link),

    onUpdated: typeof context.onUpdated === "function" ? context.onUpdated : null,

    loading: true,

    saving: false,

    error: "",

    status: "",

    notes: [],

    noteTypes: ["none"],

    noteTypeColors: {},

    noteTypeLabels: {},

  };

  renderUsernotesEditor();



  try {

    const stateRef = usernotesEditorState;

    const data = await fetchUsernotesWithNativeViaReddit(stateRef.subreddit, stateRef.username, true);

    if (!usernotesEditorState || usernotesEditorState !== stateRef) {

      return;

    }

    usernotesEditorState.notes = Array.isArray(data?.notes) ? data.notes : [];

    usernotesEditorState.noteTypes = Array.isArray(data?.note_types) ? data.note_types : ["none"];

    usernotesEditorState.noteTypeColors = data?.note_type_colors && typeof data.note_type_colors === "object" ? data.note_type_colors : {};

    usernotesEditorState.noteTypeLabels = data?.note_type_labels && typeof data.note_type_labels === "object" ? data.note_type_labels : {};

  } catch (error) {

    if (usernotesEditorState) {

      usernotesEditorState.error = error instanceof Error ? error.message : String(error);

    }

  } finally {

    if (usernotesEditorState) {

      usernotesEditorState.loading = false;

      renderUsernotesEditor();

    }

  }

}



// â”€â”€â”€â”€ Inline Usernote Chips â”€â”€â”€â”€



function renderInlineUsernoteChip(chip, payload) {

  if (!(chip instanceof HTMLElement)) {

    return;

  }



  const notes = Array.isArray(payload?.notes) ? payload.notes : [];

  if (!notes.length) {

    chip.textContent = "N";

    chip.title = "No usernotes found. Click to add one.";

    chip.dataset.hasNotes = "0";

    return;

  }



  const latest = notes[0] || {};

  const latestType = String(latest?.type || "none");

  const latestText = truncateUsernote(latest?.note || "", USERNOTES_PREVIEW_LENGTH);

  const additionalCount = Math.max(0, notes.length - 1);

  const typeMeta = {

    colors: payload?.note_type_colors && typeof payload.note_type_colors === "object" ? payload.note_type_colors : {},

    labels: payload?.note_type_labels && typeof payload.note_type_labels === "object" ? payload.note_type_labels : {},

  };

  const countMarkup = additionalCount > 0

    ? `<span class="rrw-usernote-count">(+${additionalCount})</span>`

    : "";

  chip.innerHTML = `${renderNoteTypeBadge(latestType, "rrw-note-type-pill rrw-note-type-pill--compact", typeMeta)}<span class="rrw-usernote-inline-text">${escapeHtml(latestText || "View note")}</span>${countMarkup}`;

  chip.title = `[${latestType}] ${latest?.note || "View usernotes"}`;

  chip.dataset.hasNotes = "1";

}



async function refreshUsernoteChipsForUser(subreddit, username, payload = null) {

  const cleanSubreddit = normalizeSubreddit(subreddit).toLowerCase();

  const cleanUser = String(username || "").trim().toLowerCase();

  if (!cleanSubreddit || !cleanUser) {

    return;

  }



  const chips = Array.from(document.querySelectorAll(".rrw-usernote-chip")).filter((node) => {

    if (!(node instanceof HTMLElement)) {

      return false;

    }

    const chipSubreddit = String(node.dataset.subreddit || "").trim().toLowerCase();

    const chipUser = String(node.dataset.username || "").trim().toLowerCase();

    return chipSubreddit === cleanSubreddit && chipUser === cleanUser;

  });



  if (!chips.length) {

    return;

  }



  let latestPayload = payload;

  if (!latestPayload) {

    try {

      clearUsernotesCache(cleanSubreddit, cleanUser);

      latestPayload = await fetchUsernotesWithNativeViaReddit(cleanSubreddit, cleanUser, true);

    } catch {

      return;

    }

  }



  chips.forEach((chip) => {

    if (chip instanceof HTMLElement) {

      renderInlineUsernoteChip(chip, latestPayload);

    }

  });

}



async function setupInlineUsernoteChip(chip, context) {

  if (!(chip instanceof HTMLElement)) {

    return;

  }



  const subreddit = normalizeSubreddit(context.subreddit || parseSubredditFromPath(window.location.pathname));

  const username = String(context.username || "").trim();

  if (!subreddit || !username) {

    chip.remove();

    return;

  }



  chip.dataset.subreddit = subreddit;

  chip.dataset.username = username;

  chip.setAttribute("type", "button");

  chip.textContent = "N";

  chip.title = "Loading usernotes...";



  const handleChipClick = async (event) => {

    event.preventDefault();

    event.stopPropagation();

    try {

      await openUsernotesEditor({

        subreddit,

        username,

        link: context.link || "",

        onUpdated: (updated) => {

          void refreshUsernoteChipsForUser(subreddit, username, updated);

        },

      });

    } catch (err) {

      console.error("[ModBox] Error opening usernotes editor:", err);

    }

  };



  try {

    const payload = await fetchUsernotesWithNativeViaReddit(subreddit, username, false);

    renderInlineUsernoteChip(chip, payload);

    chip.removeEventListener("click", handleChipClick);

    chip.addEventListener("click", handleChipClick, false);

  } catch (error) {

    const errorMsg = error instanceof Error ? error.message : String(error);

    // Suppress permission errors (MAY_NOT_VIEW, Forbidden) - these are expected when user isn't a mod

    const isPermissionError = errorMsg.includes("Forbidden") || errorMsg.includes("MAY_NOT_VIEW");

    // Only log error once per session (handled by shouldLogError which is imported)

    if (!isPermissionError && typeof shouldLogError === "function" && shouldLogError("usernotes-load-failed")) {

      console.error("[ModBox] Failed to load usernotes:", error);

    } else if (!isPermissionError && typeof shouldLogError !== "function") {

      // Fallback if shouldLogError isn't available yet - suppress the error to reduce noise

      console.debug("[ModBox] Error loading usernotes (suppressed after first occurrence):", errorMsg);

    }

    chip.textContent = "N";

    chip.title = isPermissionError 

      ? "You don't have permission to view usernotes in this subreddit."

      : "Failed to load usernotes. Click to try via editor.";

    chip.dataset.hasNotes = "0";

    chip.classList.add("rrw-usernote-chip--error");

    chip.removeEventListener("click", handleChipClick);

    chip.addEventListener("click", handleChipClick, false);

  }

}



// â”€â”€â”€â”€ Color and Rendering â”€â”€â”€â”€



function hashTypeToHue(noteType) {

  const text = String(noteType || "none").toLowerCase();

  let hash = 0;

  for (let i = 0; i < text.length; i += 1) {

    hash = (hash << 5) - hash + text.charCodeAt(i);

    hash |= 0;

  }

  return Math.abs(hash) % 360;

}



function hexToRgb(value) {

  const input = String(value || "").trim().replace(/^#/, "");

  if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(input)) {

    return null;

  }

  const expanded = input.length === 3

    ? input.split("").map((part) => `${part}${part}`).join("")

    : input;

  const parsed = Number.parseInt(expanded, 16);

  return {

    r: (parsed >> 16) & 255,

    g: (parsed >> 8) & 255,

    b: parsed & 255,

  };

}



function rgbToRgbaString(rgb, alpha) {

  if (!rgb) {

    return "rgba(148, 163, 184, 0.25)";

  }

  const clamped = Math.min(1, Math.max(0, Number(alpha) || 0));

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamped})`;

}



function toLinearSrgb(channel) {

  const n = channel / 255;

  return n <= 0.04045 ? (n / 12.92) : (((n + 0.055) / 1.055) ** 2.4);

}



function relativeLuminance(rgb) {

  if (!rgb) {

    return 0;

  }

  const r = toLinearSrgb(rgb.r);

  const g = toLinearSrgb(rgb.g);

  const b = toLinearSrgb(rgb.b);

  return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);

}



function getNoteTypePalette(noteType, typeColors = null, theme = resolveActiveTheme()) {

  const normalized = String(noteType || "none").trim().toLowerCase();

  const isLightTheme = theme === "light";

  const colorFromMap = typeColors && typeof typeColors === "object" ? String(typeColors[normalized] || "").trim() : "";

  const mappedRgb = hexToRgb(colorFromMap);

  if (mappedRgb) {

    const luminance = relativeLuminance(mappedRgb);

    return {

      bg: rgbToRgbaString(mappedRgb, isLightTheme ? 0.18 : 0.30),

      border: rgbToRgbaString(mappedRgb, isLightTheme ? 0.62 : 0.78),

      text: isLightTheme

        ? (luminance > 0.45 ? "#1d3553" : "#13304d")

        : (luminance > 0.62 ? "#0b1628" : "#eef5ff"),

    };

  }



  const presets = isLightTheme ? {

    none: { bg: "rgba(148, 163, 184, 0.12)", border: "rgba(148, 163, 184, 0.38)", text: "#3d526d" },

    good: { bg: "rgba(34, 197, 94, 0.14)", border: "rgba(74, 222, 128, 0.46)", text: "#215c34" },

    spam: { bg: "rgba(239, 68, 68, 0.14)", border: "rgba(252, 116, 116, 0.48)", text: "#7a2430" },

    ban: { bg: "rgba(236, 72, 153, 0.14)", border: "rgba(244, 114, 182, 0.46)", text: "#7c224f" },

    warning: { bg: "rgba(245, 158, 11, 0.16)", border: "rgba(251, 191, 36, 0.5)", text: "#7a5311" },

  } : {

    none: { bg: "rgba(148, 163, 184, 0.18)", border: "rgba(148, 163, 184, 0.44)", text: "#dbe8ff" },

    good: { bg: "rgba(34, 197, 94, 0.23)", border: "rgba(74, 222, 128, 0.58)", text: "#d5ffe5" },

    spam: { bg: "rgba(239, 68, 68, 0.25)", border: "rgba(252, 116, 116, 0.62)", text: "#ffe3e5" },

    ban: { bg: "rgba(236, 72, 153, 0.25)", border: "rgba(244, 114, 182, 0.62)", text: "#ffe2f2" },

    warning: { bg: "rgba(245, 158, 11, 0.26)", border: "rgba(251, 191, 36, 0.64)", text: "#ffe9b8" },

  };



  if (presets[normalized]) {

    return presets[normalized];

  }



  const hue = hashTypeToHue(normalized || "none");

  return {

    bg: isLightTheme ? `hsla(${hue}, 68%, 52%, 0.14)` : `hsla(${hue}, 78%, 48%, 0.24)`,

    border: isLightTheme ? `hsla(${hue}, 72%, 44%, 0.36)` : `hsla(${hue}, 88%, 70%, 0.58)`,

    text: isLightTheme ? `hsl(${hue}, 52%, 26%)` : `hsl(${hue}, 100%, 94%)`,

  };

}



function renderNoteTypeBadge(noteType, className = "rrw-note-type-pill", typeMeta = null) {

  const key = String(noteType || "none").trim() || "none";

  const labels = typeMeta && typeof typeMeta === "object" && typeMeta.labels ? typeMeta.labels : null;

  const displayLabel = labels && typeof labels === "object" ? String(labels[key.toLowerCase()] || key) : key;

  const colors = typeMeta && typeof typeMeta === "object" && typeMeta.colors ? typeMeta.colors : null;

  const palette = getNoteTypePalette(key, colors);

  return `<span class="${escapeHtml(className)}" style="--rrw-pill-bg:${escapeHtml(palette.bg)};--rrw-pill-border:${escapeHtml(palette.border)};--rrw-pill-text:${escapeHtml(palette.text)};">${escapeHtml(displayLabel)}</span>`;

}



function truncateUsernote(value, maxLength = USERNOTES_PREVIEW_LENGTH) {

  const text = String(value || "").trim();

  if (!text) {

    return "";

  }

  if (text.length <= maxLength) {

    return text;

  }

  return `${text.slice(0, maxLength)}...`;

}



function extractUsernameFromAuthorAnchor(anchor) {

  if (!(anchor instanceof HTMLAnchorElement)) {

    return "";

  }



  const text = String(anchor.textContent || "").trim().replace(/^u\//i, "").replace(/^\//, "");

  if (text && text !== "[deleted]") {

    return text;

  }



  const href = String(anchor.getAttribute("href") || "");

  const fromHref = href.match(/\/(?:u|user)\/([^/?#]+)/i);

  if (fromHref?.[1]) {

    return decodeURIComponent(fromHref[1]);

  }

  return "";

}



// â”€â”€â”€â”€ Usernote Cache â”€â”€â”€â”€



function usernotesCacheKey(subreddit, username) {

  return `${normalizeSubreddit(subreddit).toLowerCase()}|${String(username || "").toLowerCase()}`;

}



function setUsernotesCache(subreddit, username, payload) {

  usernotesCache.set(usernotesCacheKey(subreddit, username), {

    expiresAt: Date.now() + USERNOTES_CACHE_TTL_MS,

    payload,

  });

}



function getUsernotesCache(subreddit, username) {

  const item = usernotesCache.get(usernotesCacheKey(subreddit, username));

  if (!item) {

    return null;

  }

  if (item.expiresAt < Date.now()) {

    usernotesCache.delete(usernotesCacheKey(subreddit, username));

    return null;

  }

  return item.payload;

}



function clearUsernotesCache(subreddit, username) {

  usernotesCache.delete(usernotesCacheKey(subreddit, username));

}

// ------------------------------------------------------------------------------
// theme.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Theme Feature Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Handles theme detection, application, and preference management.

// Dependencies: constants.js (THEME_MODE_KEY, OVERLAY_ROOT_ID), state.js (currentThemeMode, etc)



// â”€â”€â”€â”€ Theme Mode Normalization â”€â”€â”€â”€



function normalizeThemeMode(value, fallback = "auto") {

  const clean = String(value || "").trim().toLowerCase();

  return ["auto", "light", "dark"].includes(clean) ? clean : fallback;

}



// â”€â”€â”€â”€ Color Detection â”€â”€â”€â”€



function isDarkColor(colorValue) {

  const match = String(colorValue || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);

  if (!match) {

    return false;

  }

  const r = Number(match[1]) / 255;

  const g = Number(match[2]) / 255;

  const b = Number(match[3]) / 255;

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance < 0.45;

}



function pageUsesDarkTheme() {

  const html = document.documentElement;

  const body = document.body;

  const classText = `${html.className || ""} ${body?.className || ""}`.toLowerCase();

  if (/(^|\s)(dark|theme-dark|nightmode|theme--dark)(\s|$)/.test(classText)) {

    return true;

  }



  const themeText = `${html.getAttribute("data-theme") || ""} ${body?.getAttribute("data-theme") || ""} ${html.getAttribute("theme") || ""} ${body?.getAttribute("theme") || ""}`.toLowerCase();

  if (themeText.includes("dark")) {

    return true;

  }

  if (themeText.includes("light")) {

    return false;

  }



  const bodyBg = getComputedStyle(body || html).backgroundColor;

  const htmlBg = getComputedStyle(html).backgroundColor;

  if (isDarkColor(bodyBg) || isDarkColor(htmlBg)) {

    return true;

  }



  return globalThis.matchMedia?.("(prefers-color-scheme: dark)")?.matches === true;

}



// â”€â”€â”€â”€ Theme Resolution â”€â”€â”€â”€



function resolveActiveTheme(mode = currentThemeMode) {

  const normalizedMode = normalizeThemeMode(mode, "auto");

  if (normalizedMode === "light" || normalizedMode === "dark") {

    return normalizedMode;

  }



  const host = String(window.location.hostname || "").toLowerCase();

  if (host === "old.reddit.com") {

    return "light";

  }

  return pageUsesDarkTheme() ? "dark" : "light";

}



// â”€â”€â”€â”€ Theme Application â”€â”€â”€â”€



function applyThemeToDocument() {

  const activeTheme = resolveActiveTheme(currentThemeMode);

  document.documentElement.setAttribute("data-rrw-theme", activeTheme);

  const root = document.getElementById(OVERLAY_ROOT_ID);

  if (root instanceof HTMLElement) {

    root.setAttribute("data-rrw-theme", activeTheme);

  }

}



// â”€â”€â”€â”€ Theme Preference Management â”€â”€â”€â”€



async function loadThemePreference() {

  try {

    const stored = await ext.storage.sync.get([THEME_MODE_KEY]);

    currentThemeMode = normalizeThemeMode(stored?.[THEME_MODE_KEY], "auto");

  } catch {

    currentThemeMode = "auto";

  }

  applyThemeToDocument();

}



function bindThemeObservers() {

  if (themeObserverBound) {

    return;

  }

  themeObserverBound = true;



  if (typeof globalThis.matchMedia === "function") {

    themeMediaQueryList = globalThis.matchMedia("(prefers-color-scheme: dark)");

    const onThemeSignal = () => {

      if (currentThemeMode === "auto") {

        applyThemeToDocument();

      }

    };

    if (typeof themeMediaQueryList.addEventListener === "function") {

      themeMediaQueryList.addEventListener("change", onThemeSignal);

    } else if (typeof themeMediaQueryList.addListener === "function") {

      themeMediaQueryList.addListener(onThemeSignal);

    }

  }



  const observer = new MutationObserver(() => {

    if (currentThemeMode === "auto") {

      applyThemeToDocument();

    }

  });



  observer.observe(document.documentElement, {

    attributes: true,

    attributeFilter: ["class", "data-theme", "theme"],

  });

}

// ------------------------------------------------------------------------------
// css-injection.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// CSS Injection Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Injects all extension styling including queue bar, overlays, and theme-specific colors.

// Dependencies: constants.js



function injectStyles() {

  if (document.getElementById("rrw-style")) {

    console.log("[ModBox] CSS already injected, skipping");

    return;

  }

  console.log("[ModBox] Injecting ModBox CSS styles...");

  const style = document.createElement("style");

  style.id = "rrw-style";

  

  // Detect if we're on old.reddit - the z-index fix only applies here

  const isOldReddit = String(window.location.hostname || "").toLowerCase() === "old.reddit.com";

  const pillButtonZIndex = isOldReddit ? "auto" : "100";

  

  style.textContent = `

    #rrw-overlay-root {

      --rrw-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif;

      --rrw-modal-bg: rgba(248, 251, 255, 0.98);

      --rrw-text: #21324a;

      --rrw-border: rgba(152, 175, 208, 0.68);

      --rrw-soft-border: rgba(168, 187, 214, 0.56);

      --rrw-muted: #5f7797;

      --rrw-link: #245eb8;

      --rrw-field-bg: rgba(238, 245, 255, 0.92);

      --rrw-card-bg: rgba(245, 250, 255, 0.95);

      --rrw-chip-bg: rgba(218, 233, 255, 0.95);

      --rrw-chip-text: #1f4d8f;

      --rrw-footer-bg-top: rgba(245, 250, 255, 0.98);

      --rrw-footer-bg-bottom: rgba(239, 247, 255, 0.93);

      --rrw-close-bg: rgba(233, 242, 255, 0.95);

      --rrw-close-border: rgba(145, 170, 208, 0.68);

      --rrw-preview-bg: rgba(239, 247, 255, 0.96);

      --rrw-preview-text: #223856;

      --rrw-success-bg: rgba(228, 248, 235, 0.95);

      --rrw-success-border: rgba(118, 180, 139, 0.9);

      --rrw-success-text: #24633e;

      --rrw-error-bg: rgba(255, 236, 239, 0.96);

      --rrw-error-border: rgba(214, 136, 148, 0.9);

      --rrw-error-text: #8a2f3f;

      --rrw-warning-bg: rgba(255, 245, 225, 0.96);

      --rrw-warning-border: rgba(220, 180, 103, 0.9);

      --rrw-warning-text: #7f5d18;

      color-scheme: light;

      font-family: var(--rrw-font-family);

    }



    #rrw-overlay-root[data-rrw-theme="dark"] {

      --rrw-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif;

      --rrw-modal-bg: rgba(12, 20, 34, 0.98);

      --rrw-text: #e7f0ff;

      --rrw-border: rgba(98, 133, 192, 0.52);

      --rrw-soft-border: rgba(98, 133, 192, 0.4);

      --rrw-muted: #9eb6df;

      --rrw-link: #9bc2ff;

      --rrw-field-bg: rgba(15, 28, 45, 0.86);

      --rrw-card-bg: rgba(21, 38, 62, 0.88);

      --rrw-chip-bg: rgba(31, 65, 114, 0.92);

      --rrw-chip-text: #cfe2ff;

      --rrw-footer-bg-top: rgba(12, 20, 34, 0.98);

      --rrw-footer-bg-bottom: rgba(12, 20, 34, 0.92);

      --rrw-close-bg: rgba(28, 49, 78, 0.92);

      --rrw-close-border: rgba(98, 133, 192, 0.55);

      --rrw-preview-bg: rgba(14, 24, 39, 0.95);

      --rrw-preview-text: #dce9ff;

      --rrw-success-bg: rgba(16, 40, 26, 0.92);

      --rrw-success-border: rgba(41, 101, 66, 0.9);

      --rrw-success-text: #9cddb1;

      --rrw-error-bg: rgba(42, 20, 24, 0.92);

      --rrw-error-border: rgba(139, 59, 70, 0.9);

      --rrw-error-text: #ffb6bf;

      --rrw-warning-bg: rgba(58, 44, 15, 0.92);

      --rrw-warning-border: rgba(164, 127, 45, 0.88);

      --rrw-warning-text: #ffd88a;

      color-scheme: dark;

      font-family: var(--rrw-font-family);

    }



    #rrw-queuebar-root {

      pointer-events: auto;

      position: fixed;

      bottom: 10px;

      right: var(--rrw-queuebar-right, 10px);

      left: var(--rrw-queuebar-left, auto);

      z-index: 2147483647;

      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif;

    }



    #rrw-queuebar-root[data-position="bottom_right"] {

      --rrw-queuebar-right: 10px;

      --rrw-queuebar-left: auto;

    }



    #rrw-queuebar-root[data-position="bottom_left"] {

      --rrw-queuebar-right: auto;

      --rrw-queuebar-left: 10px;

    }



    .rrw-queuebar {

      pointer-events: auto;

      min-width: 252px;

      max-width: min(92vw, 340px);

      border: 1px solid rgba(58, 84, 129, 0.5);

      border-radius: 12px;

      background: linear-gradient(160deg, rgba(12, 20, 34, 0.97), rgba(16, 27, 44, 0.98));

      box-shadow: 0 10px 26px rgba(5, 9, 14, 0.45);

      color: #dbe9ff;

      display: grid;

      gap: 5px;

      padding: 6px;

      backdrop-filter: blur(2px);

    }



    .rrw-queuebar[data-collapsed="1"] {

      min-width: auto;

      max-width: none;

      display: flex;

      gap: 4px;

      align-items: center;

      padding: 4px;

    }



    .rrw-queuebar[data-collapsed="1"][data-reddit-version="new"] {

      padding: 4px 2px !important;

      gap: 2px !important;

    }



    .rrw-queuebar-header {

      display: flex;

      align-items: flex-start;

      justify-content: space-between;

      gap: 6px;

      padding: 0;

    }



    .rrw-queuebar[data-collapsed="1"] .rrw-queuebar-header {

      align-items: center;

      justify-content: flex-start;

      gap: 2px;

      width: fit-content;

    }



    .rrw-queuebar-title-wrap {

      display: grid;

      gap: 1px;

      min-width: 0;

    }



    .rrw-queuebar-title {

      font-size: 0.8rem;

      letter-spacing: 0.05em;

      text-transform: uppercase;

      color: #a3c2fb;

    }



    .rrw-queuebar-subtitle {

      font-size: 0.75rem;

      color: #d4e2ff;

      white-space: nowrap;

      overflow: hidden;

      text-overflow: ellipsis;

    }



    .rrw-queuebar-header-actions {

      display: inline-flex;

      align-items: center;

      gap: 6px;

    }



    .rrw-queuebar-icon-btn {

      appearance: none;

      -webkit-appearance: none;

      border: 1px solid rgba(84, 118, 173, 0.45);

      background: rgba(30, 50, 77, 0.86);

      color: #e6efff;

      border-radius: 7px;

      font-size: 0.78rem;

      line-height: 1;

      padding: 4px 7px;

      cursor: pointer;

      min-width: 28px;

      transition: background-color 0.2s, border-color 0.2s;

    }



    .rrw-queuebar-icon-btn:hover {

      background: rgba(44, 73, 112, 0.92);

      border-color: rgba(110, 151, 221, 0.62);

    }



    .rrw-queuebar-badges {

      display: grid;

      grid-template-columns: repeat(2, minmax(0, 1fr));

      gap: 5px;

    }



    .rrw-queuebar-secondary-links {

      display: grid;

      grid-template-columns: repeat(3, minmax(0, 1fr));

      gap: 4px;

    }



    .rrw-queuebar-secondary-link {

      appearance: none;

      -webkit-appearance: none;

      border: 1px solid rgba(98, 133, 192, 0.5);

      background: rgba(24, 42, 68, 0.88);

      border-radius: 8px;

      padding: 4px 5px;

      color: #d8e8ff;

      font-size: 0.74rem;

      font-weight: 600;

      letter-spacing: 0.01em;

      cursor: pointer;

      white-space: nowrap;

      overflow: hidden;

      text-overflow: ellipsis;

      text-align: center;

      transition: background-color 0.2s, border-color 0.2s;

    }



    .rrw-queuebar-secondary-link:hover {

      border-color: rgba(131, 176, 255, 0.78);

      background: rgba(31, 54, 85, 0.93);

    }



    .rrw-queuebar-compact-list {

      display: inline-flex;

      align-items: center;

      flex-wrap: nowrap;

      gap: 5px;

      min-width: 0;

    }



    .rrw-queuebar-compact-item {

      appearance: none;

      -webkit-appearance: none;

      border: 1px solid rgba(98, 133, 192, 0.4);

      background: rgba(24, 42, 68, 0.9);

      border-radius: 8px;

      padding: 4px 6px;

      color: #eef4ff;

      cursor: pointer;

      display: flex;

      align-items: center;

      justify-content: space-between;

      gap: 5px;

      font-size: 0.72rem;

      min-width: 38px;

      transition: background-color 0.2s, border-color 0.2s;

    }



    .rrw-queuebar-compact-item:hover {

      border-color: rgba(131, 176, 255, 0.72);

      background: rgba(31, 54, 85, 0.94);

    }



    .rrw-queuebar-compact-icon {

      width: 13px;

      height: 13px;

      display: inline-flex;

      align-items: center;

      justify-content: center;

      flex: 0 0 auto;

    }



    .rrw-queuebar-compact-icon svg {

      display: block;

      width: 13px;

      height: 13px;

      fill: none;

      stroke: #c8dbff;

      stroke-width: 1.35;

      stroke-linecap: round;

      stroke-linejoin: round;

    }



    .rrw-queuebar-compact-count {

      font-variant-numeric: tabular-nums;

      font-weight: 700;

      color: #ffffff;

      min-width: 10px;

      text-align: right;

      flex: 0 0 auto;

    }



    .rrw-queuebar-badge {

      appearance: none;

      -webkit-appearance: none;

      border: 1px solid rgba(98, 133, 192, 0.55);

      background: rgba(28, 49, 78, 0.92);

      border-radius: 10px;

      padding: 4px 5px;

      color: #eef4ff;

      cursor: pointer;

      display: flex;

      align-items: center;

      justify-content: space-between;

      gap: 5px;

      font-size: 0.84rem;

      transition: background-color 0.2s, border-color 0.2s;

    }



    .rrw-queuebar-badge:hover {

      border-color: rgba(131, 176, 255, 0.8);

      background: rgba(35, 62, 98, 0.95);

    }



    .rrw-queuebar-badge-main {

      display: inline-flex;

      align-items: center;

      gap: 3px;

      min-width: 0;

    }



    .rrw-queuebar-badge-icon {

      width: 16px;

      height: 16px;

      text-align: center;

      opacity: 0.95;

      flex: 0 0 auto;

    }



    .rrw-queuebar-badge-icon svg {

      display: block;

      width: 16px;

      height: 16px;

      fill: none;

      stroke: #bed5ff;

      stroke-width: 1.35;

      stroke-linecap: round;

      stroke-linejoin: round;

    }



    .rrw-queuebar-badge-label {

      font-weight: 600;

      color: #bed5ff;

      letter-spacing: 0.01em;

      white-space: nowrap;

      overflow: hidden;

      text-overflow: ellipsis;

    }



    .rrw-queuebar-badge-count {

      font-variant-numeric: tabular-nums;

      font-weight: 700;

      color: #fff;

      min-width: 26px;

      text-align: right;

    }



    .rrw-queuebar-footer {

      font-size: 0.72rem;

      color: #9eb6df;

      line-height: 1.25;

      border-top: 1px solid rgba(98, 133, 192, 0.26);

      padding-top: 7px;

      min-height: 1.2em;

    }



    .rrw-queuebar-footer[data-error="1"] {

      color: #ffb7bb;

    }



    .rrw-queuebar-footer[data-rrw-fresh="1"] {

      animation: rrw-queuebar-fresh 2s ease forwards;

    }



    @keyframes rrw-queuebar-fresh {

      0%, 60% { color: #4ade80; }

      100% { color: #9eb6df; }

    }



    /* Light Theme Overrides */

    html[data-rrw-theme="light"] #rrw-queuebar-root {

      color-scheme: light;

    }



    html[data-rrw-theme="light"] .rrw-queuebar {

      border-color: rgba(162, 184, 214, 0.78);

      background: linear-gradient(160deg, rgba(246, 250, 255, 0.98), rgba(234, 243, 255, 0.99));

      box-shadow: 0 10px 26px rgba(78, 108, 143, 0.22);

      color: #27486e;

    }



    html[data-rrw-theme="light"] .rrw-queuebar-title {

      color: #4f75a5;

    }



    html[data-rrw-theme="light"] .rrw-queuebar-subtitle {

      color: #33587f;

    }



    html[data-rrw-theme="light"] .rrw-queuebar-icon-btn {

      border-color: rgba(158, 182, 212, 0.78);

      background: rgba(231, 241, 255, 0.98);

      color: #2f4f78;

    }



    html[data-rrw-theme="light"] .rrw-queuebar-icon-btn:hover {

      background: rgba(220, 233, 255, 0.99);

      border-color: rgba(127, 162, 204, 0.85);

    }



    html[data-rrw-theme="light"] .rrw-queuebar-icon-btn svg,

    html[data-rrw-theme="light"] .rrw-queuebar-badge-icon svg,

    html[data-rrw-theme="light"] .rrw-queuebar-compact-icon svg {

      stroke: #355a86;

    }



    html[data-rrw-theme="light"] .rrw-queuebar-icon-btn:hover svg,

    html[data-rrw-theme="light"] .rrw-queuebar-badge:hover .rrw-queuebar-badge-icon svg,

    html[data-rrw-theme="light"] .rrw-queuebar-compact-item:hover .rrw-queuebar-compact-icon svg {

      stroke: #214a7b;

    }



    html[data-rrw-theme="light"] .rrw-queuebar-badge,

    html[data-rrw-theme="light"] .rrw-queuebar-compact-item {

      border-color: rgba(157, 183, 214, 0.75);

      background: rgba(234, 243, 255, 0.98);

      color: #2a4a72;

    }



    html[data-rrw-theme="light"] .rrw-queuebar-badge:hover,

    html[data-rrw-theme="light"] .rrw-queuebar-compact-item:hover {

      border-color: rgba(127, 162, 204, 0.85);

      background: rgba(225, 237, 253, 0.99);

    }



    html[data-rrw-theme="light"] .rrw-queuebar-secondary-link {

      border-color: rgba(157, 183, 214, 0.75);

      background: rgba(237, 245, 255, 0.98);

      color: #2a4a72;

    }



    html[data-rrw-theme="light"] .rrw-queuebar-secondary-link:hover {

      border-color: rgba(127, 162, 204, 0.85);

      background: rgba(228, 238, 252, 0.99);

    }



    html[data-rrw-theme="light"] .rrw-queuebar-compact-icon svg {

      stroke: #5a7f9f;

    }



    html[data-rrw-theme="light"] .rrw-queuebar-badge-label {

      color: #4d6f98;

    }



    html[data-rrw-theme="light"] .rrw-queuebar-badge-count,

    html[data-rrw-theme="light"] .rrw-queuebar-compact-count {

      color: #1f3958;

    }



    html[data-rrw-theme="light"] .rrw-queuebar-footer {

      color: #617f9f;

      border-top-color: rgba(158, 182, 212, 0.55);

    }



    html[data-rrw-theme="light"] .rrw-queuebar-footer[data-rrw-fresh="1"] {

      animation: rrw-queuebar-fresh-light 2s ease forwards;

    }



    @keyframes rrw-queuebar-fresh-light {

      0%, 60% { color: #0a8a2b; }

      100% { color: #617f9f; }

    }



    /* Update Badge & Orange Background */

    .rrw-queuebar[data-has-update="1"] {

      background: linear-gradient(160deg, rgba(255, 140, 56, 0.95), rgba(255, 110, 20, 0.92)) !important;

      border-color: rgba(255, 100, 0, 0.6) !important;

    }



    html[data-rrw-theme="light"] .rrw-queuebar[data-has-update="1"] {

      background: linear-gradient(160deg, rgba(255, 140, 56, 0.95), rgba(255, 110, 20, 0.92)) !important;

      border-color: rgba(255, 100, 0, 0.6) !important;

      color: #fff !important;

    }



    .rrw-queuebar-update-badge {

      display: inline-flex;

      align-items: center;

      justify-content: center;

      padding: 6px 12px;

      margin: 0;

      border: none;

      border-radius: 4px;

      background: rgba(255, 255, 255, 0.9);

      color: #ff6600;

      font-weight: 600;

      font-size: 0.75rem;

      letter-spacing: 0.02em;

      cursor: pointer;

      transition: all 0.2s ease;

      white-space: nowrap;

      box-shadow: 0 2px 6px rgba(255, 100, 0, 0.3);

    }



    .rrw-queuebar-update-badge:hover {

      background: #fff;

      color: #ff5500;

      box-shadow: 0 3px 8px rgba(255, 100, 0, 0.4);

      transform: translateY(-1px);

    }



    .rrw-queuebar-update-badge:active {

      transform: translateY(0);

      box-shadow: 0 1px 4px rgba(255, 100, 0, 0.3);

    }



    /* Update Popup Modal */

    #rrw-update-popup-root {

      position: fixed;

      inset: 0;

      z-index: 2147483646;

      display: flex;

      align-items: center;

      justify-content: center;

      pointer-events: auto;

      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif;

    }



    .rrw-update-popup-backdrop {

      position: fixed;

      inset: 0;

      background: rgba(0, 0, 0, 0.5);

      backdrop-filter: blur(2px);

      cursor: pointer;

    }



    .rrw-update-popup-container {

      position: relative;

      z-index: 1;

      max-width: 500px;

      width: 90%;

      max-height: 85vh;

      overflow-y: auto;

    }



    .rrw-update-popup {

      background: var(--rrw-modal-bg, rgba(248, 251, 255, 0.98));

      border: 1px solid var(--rrw-border, rgba(152, 175, 208, 0.68));

      border-radius: 8px;

      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);

      font-family: var(--rrw-font-family);

      color: var(--rrw-text);

      overflow: hidden;

      display: flex;

      flex-direction: column;

    }



    .rrw-update-popup-header {

      display: flex;

      align-items: center;

      justify-content: space-between;

      padding: 20px 24px;

      background: linear-gradient(135deg, rgba(23, 58, 99, 0.15), rgba(16, 42, 74, 0.1));

      border-bottom: 1px solid var(--rrw-soft-border, rgba(168, 187, 214, 0.56));

    }



    .rrw-update-popup-title {

      margin: 0;

      font-size: 1.25rem;

      font-weight: 700;

      color: var(--rrw-link, #245eb8);

      letter-spacing: -0.01em;

      font-family: var(--rrw-font-family);

    }



    .rrw-update-popup-close {

      display: flex;

      align-items: center;

      justify-content: center;

      width: 32px;

      height: 32px;

      padding: 0;

      margin: -4px;

      border: none;

      background: transparent;

      color: var(--rrw-text);

      font-size: 1.4rem;

      font-family: var(--rrw-font-family);

      cursor: pointer;

      border-radius: 4px;

      transition: all 0.2s ease;

      flex-shrink: 0;

    }



    .rrw-update-popup-close:hover {

      background: var(--rrw-close-bg, rgba(233, 242, 255, 0.95));

      color: var(--rrw-link, #245eb8);

    }



    .rrw-update-popup-body {

      padding: 24px;

      overflow-y: auto;

      flex: 1;

      font-family: var(--rrw-font-family);

    }



    .rrw-update-popup-versions {

      display: flex;

      gap: 16px;

      margin-bottom: 24px;

      padding: 16px;

      background: var(--rrw-card-bg, rgba(245, 250, 255, 0.95));

      border-radius: 8px;

      border: 1px solid var(--rrw-soft-border, rgba(168, 187, 214, 0.56));

    }



    .rrw-update-popup-version {

      display: flex;

      flex-direction: column;

      gap: 6px;

      flex: 1;

      text-align: center;

    }



    .rrw-update-popup-version-label {

      font-size: 0.7rem;

      font-weight: 600;

      color: var(--rrw-muted, #5f7797);

      text-transform: uppercase;

      letter-spacing: 0.06em;

      font-family: var(--rrw-font-family);

    }



    .rrw-update-popup-version-number {

      font-size: 1.3rem;

      font-weight: 700;

      font-variant-numeric: tabular-nums;

      color: var(--rrw-text);

      font-family: var(--rrw-font-family);

    }



    .rrw-update-popup-version-new {

      color: var(--rrw-link, #245eb8);

    }



    .rrw-update-popup-changelog {

      margin-bottom: 20px;

    }



    .rrw-update-popup-changelog-title {

      margin: 0 0 10px 0;

      font-size: 0.85rem;

      font-weight: 700;

      color: var(--rrw-text);

      text-transform: uppercase;

      letter-spacing: 0.04em;

      font-family: var(--rrw-font-family);

    }



    .rrw-update-popup-changelog-text {

      margin: 0;

      padding: 14px;

      background: var(--rrw-field-bg, rgba(238, 245, 255, 0.92));

      border: 1px solid var(--rrw-soft-border, rgba(168, 187, 214, 0.56));

      border-radius: 6px;

      font-size: 0.8rem;

      line-height: 1.6;

      color: var(--rrw-text);

      font-family: var(--rrw-font-family);

      white-space: pre-wrap;

      word-break: break-word;

      max-height: 220px;

      overflow-y: auto;

    }



    .rrw-update-popup-footer {

      display: flex;

      gap: 12px;

      padding: 18px 24px;

      background: var(--rrw-footer-bg-top, rgba(245, 250, 255, 0.98));

      border-top: 1px solid var(--rrw-soft-border, rgba(168, 187, 214, 0.56));

      justify-content: flex-end;

    }



    .rrw-update-popup-download-btn,

    .rrw-update-popup-later-btn {

      padding: 10px 18px;

      border: 1px solid #355a91;

      border-radius: 5px;

      font-size: 0.8rem;

      font-weight: 700;

      cursor: pointer;

      transition: all 0.2s ease;

      white-space: nowrap;

      font-family: var(--rrw-font-family);

      letter-spacing: 0.01em;

    }



    .rrw-update-popup-download-btn {

      background: linear-gradient(180deg, #245eb8 0%, #1f4a94 100%);

      color: #fff;

      border-color: #1f4a94;

    }



    .rrw-update-popup-download-btn:hover {

      background: linear-gradient(180deg, #2d70d1 0%, #2457ab 100%);

      border-color: #1f4a94;

      box-shadow: 0 4px 12px rgba(36, 94, 184, 0.25);

    }



    .rrw-update-popup-download-btn:active {

      transform: translateY(1px);

      box-shadow: 0 2px 6px rgba(36, 94, 184, 0.15);

    }



    .rrw-update-popup-later-btn {

      background: var(--rrw-card-bg, rgba(245, 250, 255, 0.95));

      color: var(--rrw-text);

      border-color: var(--rrw-soft-border, rgba(168, 187, 214, 0.56));

    }



    .rrw-update-popup-later-btn:hover {

      background: var(--rrw-field-bg, rgba(238, 245, 255, 0.92));

      border-color: var(--rrw-link, #245eb8);

      color: var(--rrw-link, #245eb8);

    }



    /* Inline UI Buttons & Pills */

    .rrw-launch-btn,

    .rrw-usernote-chip,

    .rrw-history-btn,

    .rrw-modlog-btn,

    .rrw-comment-nuke-btn,

    .rrw-profile-btn,

    .rrw-quick-actions-pill {

      display: inline-flex;

      align-items: center;

      padding: 1px 5px;

      min-height: 0;

      height: auto;

      border: 1px solid #355a91;

      border-radius: 4px;

      background: linear-gradient(180deg, #173a63 0%, #102a4a 100%);

      color: #d8e9ff;

      font-size: 9px;

      font-weight: 600;

      line-height: 1;

      cursor: pointer;

      align-self: auto;

      text-decoration: none;

      font-family: "Segoe UI Variable Text", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;

      position: relative;

      z-index: ${pillButtonZIndex};

      pointer-events: auto;

    }



    .rrw-launch-btn-inline {

      margin: 0;

      position: relative;

      z-index: ${pillButtonZIndex};

      pointer-events: auto;

    }



    .rrw-usernote-chip--error {

      border-color: #7a2a2a !important;

      background: linear-gradient(180deg, #4a1414 0%, #3a0e0e 100%) !important;

      color: #ffb3b3 !important;

    }



    .rrw-profile-btn {

      margin: 0;

      min-width: 18px;

      justify-content: center;

      font-weight: 700;

      letter-spacing: 0.01em;

    }



    .rrw-history-btn {

      margin: 0;

      min-width: 18px;

      justify-content: center;

      font-weight: 700;

      letter-spacing: 0.01em;

    }



    .rrw-modlog-btn {

      margin: 0;

      min-width: 18px;

      justify-content: center;

      font-weight: 700;

      letter-spacing: 0.01em;

    }



    .rrw-quick-actions-pill {

      margin: 0;

      min-width: 18px;

      justify-content: center;

      font-weight: 700;

      letter-spacing: 0.01em;

    }



    .rrw-comment-nuke-btn {

      margin: 0;

      min-width: 18px;

      justify-content: center;

      font-weight: 700;

      letter-spacing: 0.01em;

      border-color: #8c3a3a;

      background: linear-gradient(180deg, #6b1f1f 0%, #4f1515 100%);

      color: #ffe0e0;

    }



    .rrw-comment-nuke-btn[data-comment-nuke-state="idle"] {

      border-color: #355a91;

      background: linear-gradient(180deg, #173a63 0%, #102a4a 100%);

      color: #d8e9ff;

    }



    .rrw-comment-nuke-btn[data-comment-nuke-state="busy"] {

      border-color: #916d2c;

      background: linear-gradient(180deg, #7b5a1f 0%, #5f4316 100%);

      color: #fff1cf;

    }



    .rrw-comment-nuke-btn[data-comment-nuke-state="success"] {

      border-color: #2f7a54;

      background: linear-gradient(180deg, #1d5d3d 0%, #154630 100%);

      color: #d8ffec;

    }



    .rrw-comment-nuke-btn[data-comment-nuke-state="error"] {

      border-color: #8c3a3a;

      background: linear-gradient(180deg, #7b2323 0%, #5f1717 100%);

      color: #ffd6d6;

    }



    .rrw-launch-btn-inline--solo {

      margin-left: 3px !important;

    }



    .rrw-launch-btn-inline:hover {

      filter: none;

      opacity: 1;

    }



    .rrw-usernote-chip {

      margin: 0;

      max-width: none;

      display: inline-flex;

      align-items: center;

      gap: 1px;

    }



    .rrw-usernote-inline-text {

      min-width: 0;

      max-width: none;

      font-weight: 600;

      white-space: nowrap;

      overflow: visible;

      text-overflow: clip;

    }



    .rrw-usernote-count {

      font-weight: 700;

      color: inherit;

      white-space: nowrap;

      margin-left: 1px;

    }



    .rrw-usernote-chip[data-has-notes="0"] {

      opacity: 1;

    }



    .rrw-launch-btn:hover,

    .rrw-launch-btn-inline:hover,

    .rrw-usernote-chip:hover,

    .rrw-history-btn:hover,

    .rrw-modlog-btn:hover,

    .rrw-comment-nuke-btn:hover,

    .rrw-profile-btn:hover,

    .rrw-quick-actions-pill:hover {

      background: linear-gradient(180deg, #204a7d 0%, #153861 100%);

      border-color: #4f79b6;

      color: #eaf3ff;

      opacity: 1;

    }



    .rrw-launch-btn:focus-visible,

    .rrw-launch-btn-inline:focus-visible,

    .rrw-usernote-chip:focus-visible,

    .rrw-history-btn:focus-visible,

    .rrw-modlog-btn:focus-visible,

    .rrw-comment-nuke-btn:focus-visible,

    .rrw-profile-btn:focus-visible,

    .rrw-quick-actions-pill:focus-visible {

      outline: 2px solid #79a9ef;

      outline-offset: 1px;

    }



    .rrw-inline-group {

      display: inline-flex;

      gap: 2px;

      align-items: center;

      position: relative;

      z-index: ${pillButtonZIndex};

      pointer-events: auto;

    }



    /* Light Theme Pill/Button Overrides */

    html[data-rrw-theme="light"] .rrw-launch-btn,

    html[data-rrw-theme="light"] .rrw-usernote-chip,

    html[data-rrw-theme="light"] .rrw-history-btn,

    html[data-rrw-theme="light"] .rrw-modlog-btn,

    html[data-rrw-theme="light"] .rrw-comment-nuke-btn,

    html[data-rrw-theme="light"] .rrw-profile-btn,

    html[data-rrw-theme="light"] .rrw-quick-actions-pill {

      border: 1px solid #c5d9f1;

      background: linear-gradient(180deg, #e8f1ff 0%, #d8e8ff 100%);

      color: #2c4a70;

    }



    html[data-rrw-theme="light"] .rrw-launch-btn:hover,

    html[data-rrw-theme="light"] .rrw-usernote-chip:hover,

    html[data-rrw-theme="light"] .rrw-history-btn:hover,

    html[data-rrw-theme="light"] .rrw-modlog-btn:hover,

    html[data-rrw-theme="light"] .rrw-profile-btn:hover,

    html[data-rrw-theme="light"] .rrw-quick-actions-pill:hover {

      background: linear-gradient(180deg, #d8e8ff 0%, #c8dcff 100%);

      border-color: #8fb3d9;

      color: #1a3a5c;

    }



    html[data-rrw-theme="light"] .rrw-comment-nuke-btn {

      border-color: #e5c5c5;

      background: linear-gradient(180deg, #fff0f0 0%, #ffe8e8 100%);

      color: #8b3a3a;

    }



    html[data-rrw-theme="light"] .rrw-comment-nuke-btn[data-comment-nuke-state="idle"] {

      border-color: #a4b8d8;

      background: linear-gradient(180deg, #e8f0fb 0%, #dce8f7 100%);

      color: #2f5178;

    }



    html[data-rrw-theme="light"] .rrw-comment-nuke-btn:hover {

      background: linear-gradient(180deg, #d8e8ff 0%, #c8dcff 100%);

      border-color: #8fb3d9;

      color: #1a3a5c;

    }



    html[data-rrw-theme="light"] .rrw-usernote-chip--error {

      border-color: #e5a5a5 !important;

      background: linear-gradient(180deg, #ffe8e8 0%, #ffd8d8 100%) !important;

      color: #9a4a4a !important;

    }



    .rrw-inline-group.rrw-mm-pills {

      display: flex !important;

      gap: 4px;

      align-items: center;

      justify-content: flex-start !important;

      margin: 8px 0 0 0 !important;

      padding: 0 !important;

      flex-wrap: wrap;

      text-align: left !important;

      width: 100%;

    }



    .rrw-mm-pills {

      display: flex !important;

      gap: 4px;

      align-items: center;

      justify-content: flex-start !important;

      margin: 8px 0 0 0 !important;

      padding: 0 !important;

      flex-wrap: wrap;

      text-align: left !important;

      width: 100%;

    }



    .rrw-note-type-pill {

      --rrw-pill-bg: #f3f4f6;

      --rrw-pill-border: #d1d5db;

      --rrw-pill-text: #374151;

      display: inline-flex;

      align-items: center;

      border: 1px solid var(--rrw-pill-border);

      background: var(--rrw-pill-bg);

      color: var(--rrw-pill-text);

      border-radius: 4px;

      padding: 0 5px;

      font-size: 0.72rem;

      font-weight: 600;

      line-height: 1.05;

      max-width: 180px;

      white-space: nowrap;

      overflow: hidden;

      text-overflow: ellipsis;

    }



    .rrw-note-type-pill--compact {

      font-size: 0.62rem;

      padding: 1px 4px;

      border-radius: 4px;

      line-height: 1;

      max-width: 88px;

      flex: 0 0 auto;

      text-transform: uppercase;

      letter-spacing: 0.02em;

    }



    .rrw-usernotes-backdrop {

      position: fixed;

      inset: 0;

      background: rgba(15, 23, 42, 0.62);

      z-index: 2147483646;

    }



    .rrw-usernotes-modal {

      position: fixed;

      top: 50%;

      left: 50%;

      transform: translate(-50%, -50%);

      width: min(760px, calc(100vw - 24px));

      max-height: calc(100vh - 24px);

      overflow: auto;

      border-radius: 12px;

      border: 1px solid var(--rrw-border);

      background: var(--rrw-modal-bg);

      color: var(--rrw-text);

      box-shadow: 0 20px 55px rgba(0, 0, 0, 0.35);

      z-index: 2147483647;

      padding: 0;

    }



    .rrw-usernotes-header {

      display: flex;

      align-items: center;

      justify-content: space-between;

      gap: 8px;

      padding: 12px 14px;

      border-bottom: 1px solid var(--rrw-soft-border);

      position: sticky;

      top: 0;

      background: var(--rrw-modal-bg);

      z-index: 2;

    }



    .rrw-usernotes-header h3 {

      margin: 0;

      font-size: 0.94rem;

      line-height: 1.3;

    }



    .rrw-usernotes-body {

      display: grid;

      gap: 10px;

      padding: 12px 14px 14px;

    }



    .rrw-usernote-list {

      display: grid;

      gap: 8px;

    }



    .rrw-usernote-row {

      display: grid;

      gap: 6px;

      border: 1px solid var(--rrw-soft-border);

      border-radius: 8px;

      padding: 8px;

      background: var(--rrw-card-bg);

    }



    .rrw-usernote-header-row {

      display: flex;

      align-items: center;

      justify-content: space-between;

      gap: 6px;

    }



    .rrw-usernote-meta-and-types {

      display: flex;

      align-items: center;

      gap: 4px;

    }



    .rrw-usernote-type-wrap {

      display: flex;

      align-items: center;

    }



    .rrw-usernote-meta {

      color: var(--rrw-muted);

      font-size: 0.79rem;

      line-height: 1.3;

    }



    .rrw-usernote-text-display {

      font-size: 0.95rem;

      line-height: 1.4;

      color: var(--rrw-text);

      word-wrap: break-word;

      white-space: pre-wrap;

    }



    .rrw-usernote-link {

      color: var(--rrw-link);

      font-size: 0.78rem;

      line-height: 1.25;

      text-decoration: underline;

      word-break: break-all;

    }



    .rrw-usernote-row-actions {

      display: flex;

      justify-content: flex-end;

    }



    .rrw-btn-trash {

      appearance: none;

      -webkit-appearance: none;

      background: none;

      border: none;

      color: var(--rrw-muted);

      cursor: pointer;

      font-size: 1.2rem;

      line-height: 1;

      padding: 4px 6px;

      min-width: 28px;

      min-height: 28px;

      display: inline-flex;

      align-items: center;

      justify-content: center;

      border-radius: 4px;

      transition: color 0.15s, background-color 0.15s;

    }



    .rrw-btn-trash:hover {

      color: #ff6b6b;

      background-color: rgba(255, 107, 107, 0.1);

    }



    .rrw-btn-trash:active {

      color: #ff5252;

      background-color: rgba(255, 107, 107, 0.2);

    }



    .rrw-btn-trash:disabled {

      opacity: 0.5;

      cursor: not-allowed;

    }



    .rrw-usernote-include-link {

      display: inline-flex;

      align-items: center;

      gap: 6px;

      font-size: 0.82rem;

      color: var(--rrw-text);

    }



    .rrw-usernote-add-box {

      display: grid;

      gap: 4px;

      border: 1px solid var(--rrw-border);

      border-radius: 10px;

      background: var(--rrw-field-bg);

      padding: 8px;

    }



    .rrw-usernote-add-box h4 {

      margin: 0;

      font-size: 0.8rem;

    }



    .rrw-field {

      display: grid;

      gap: 4px;

      font-size: 0.8rem;

      color: var(--rrw-text);

    }



    .rrw-field--checkbox {

      display: flex;

      align-items: center;

      gap: 8px;

      font-size: 0.8rem;

    }



    .rrw-field--checkbox input[type="checkbox"] {

      margin: 0;

      width: auto;

    }



    /* Canned Replies Button */

    .rrw-canned-reply-btn {

      font-size: 16px !important;

    }



    .rrw-canned-reply-btn::before,

    .rrw-canned-reply-btn::after {

      content: "" !important;

      display: none !important;

      visibility: hidden !important;

    }



    .rrw-canned-reply-btn span::before,

    .rrw-canned-reply-btn span::after {

      content: "" !important;

      display: none !important;

      visibility: hidden !important;

    }



    /* Canned Replies Dropdown */

    .rrw-canned-replies-dropdown {

      position: fixed !important;

      background: white;

      border: 1px solid #999;

      border-radius: 4px;

      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

      font-family: sans-serif;

      min-width: 180px;

      z-index: 10001 !important;

      overflow: visible !important;

    }



    .rrw-canned-header {

      display: block;

      padding: 8px 10px;

      background: #0079d3;

      color: white;

      border-radius: 3px 3px 0 0;

      font-size: 12px;

      font-weight: bold;

      margin: 0;

    }



    .rrw-canned-list {

      list-style: none !important;

      padding: 0 !important;

      margin: 0 !important;

      max-height: 300px;

      overflow-y: auto;

      display: block !important;

    }



    .rrw-canned-item {

      display: block !important;

      width: 100% !important;

      padding: 8px 10px !important;

      margin: 0 !important;

      border: 0 !important;

      border-bottom: 1px solid #eee !important;

      background: transparent !important;

      text-align: left;

      cursor: pointer;

      font-size: 12px;

      color: #333;

      font-weight: normal !important;

      border-radius: 0 !important;

    }



    .rrw-canned-item:hover {

      background: #f0f0f0 !important;

    }



    .rrw-canned-item:last-child {

      border-bottom: 0 !important;

    }



    html[data-rrw-theme="light"] .rrw-usernotes-backdrop {

      background: rgba(215, 227, 245, 0.68);

    }



    html[data-rrw-theme="light"] .rrw-usernotes-modal {

      border-color: rgba(149, 175, 210, 0.78);

      background: linear-gradient(180deg, rgba(246, 250, 255, 0.995), rgba(236, 245, 255, 0.99));

      color: #21324a;

      box-shadow: 0 24px 70px rgba(81, 109, 145, 0.28);

    }



    html[data-rrw-theme="light"] .rrw-usernotes-header {

      background: rgba(245, 250, 255, 0.98);

      border-bottom-color: rgba(153, 179, 212, 0.48);

    }



    html[data-rrw-theme="light"] .rrw-usernote-row {

      background: rgba(241, 248, 255, 0.95);

    }



    html[data-rrw-theme="light"] .rrw-usernote-add-box {

      background: rgba(236, 245, 255, 0.96);

    }



    html[data-rrw-theme="light"] .rrw-usernotes-modal textarea,

    html[data-rrw-theme="light"] .rrw-usernotes-modal input,

    html[data-rrw-theme="light"] .rrw-usernotes-modal select {

      background: rgba(236, 245, 255, 0.96);

      color: #21324a;

    }



    html[data-rrw-theme="light"] .rrw-usernotes-modal textarea::placeholder,

    html[data-rrw-theme="light"] .rrw-usernotes-modal input::placeholder {

      color: #6b84a5;

    }



    #rrw-context-popup-root {

      --rrw-font-family: "Segoe UI Variable Text", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;

      --rrw-context-bg: rgba(12, 20, 34, 0.98);

      --rrw-context-surface: rgba(21, 38, 62, 0.9);

      --rrw-context-border: rgba(98, 133, 192, 0.52);

      --rrw-context-text: #e7f0ff;

      --rrw-context-muted: #9eb6df;

      --rrw-context-link: #9bc2ff;

      color-scheme: dark;

      font-family: var(--rrw-font-family);

    }



    .rrw-comment-context-popup {

      color: #4f84d8 !important;

    }



    .rrw-comment-context-popup:hover {

      color: #2a5fb4 !important;

      text-decoration: underline;

    }



    #rrw-context-popup-root .rrw-context-backdrop {

      position: fixed;

      inset: 0;

      background: rgba(7, 12, 22, 0.72);

      z-index: 2147483642;

    }



    #rrw-context-popup-root .rrw-context-modal {

      position: fixed;

      inset: 50% auto auto 50%;

      transform: translate(-50%, -50%);

      width: min(860px, calc(100vw - 24px));

      max-height: calc(100vh - 24px);

      overflow: auto;

      border-radius: 12px;

      border: 1px solid var(--rrw-context-border);

      background: linear-gradient(160deg, rgba(12, 20, 34, 0.98), rgba(16, 27, 44, 0.99));

      color: var(--rrw-context-text);

      box-shadow: 0 18px 44px rgba(5, 9, 14, 0.56);

      z-index: 2147483643;

      font-family: var(--rrw-font-family);

    }



    #rrw-context-popup-root .rrw-context-header {

      display: flex;

      align-items: center;

      justify-content: space-between;

      gap: 10px;

      padding: 10px 12px;

      border-bottom: 1px solid var(--rrw-context-border);

      position: sticky;

      top: 0;

      background: linear-gradient(180deg, rgba(17, 29, 47, 0.98), rgba(17, 29, 47, 0.88));

      backdrop-filter: blur(2px);

      z-index: 1;

      cursor: move;

      user-select: none;

    }



    #rrw-context-popup-root .rrw-context-header h2 {

      margin: 0;

      font-size: 0.98rem;

      line-height: 1.25;

      color: #dce9ff;

    }



    #rrw-context-popup-root .rrw-context-body {

      display: grid;

      gap: 8px;

      padding: 10px 12px 12px;

    }



    #rrw-context-popup-root .rrw-context-empty {

      border: 1px dashed var(--rrw-context-border);

      border-radius: 10px;

      background: var(--rrw-context-surface);

      color: var(--rrw-context-muted);

      padding: 12px;

      text-align: center;

      font-size: 0.84rem;

    }



    #rrw-context-popup-root .rrw-context-item {

      margin-left: var(--rrw-context-indent, 0px);

      border: 1px solid var(--rrw-context-border);

      border-radius: 10px;

      background: var(--rrw-context-surface);

      padding: 8px 9px;

      display: grid;

      gap: 5px;

    }



    #rrw-context-popup-root .rrw-context-item--target {

      border-color: rgba(153, 194, 255, 0.86);

      box-shadow: 0 0 0 1px rgba(153, 194, 255, 0.28);

      background: rgba(35, 62, 98, 0.72);

    }



    #rrw-context-popup-root .rrw-context-item-header {

      display: inline-flex;

      align-items: center;

      gap: 8px;

      flex-wrap: wrap;

      font-size: 0.75rem;

      color: var(--rrw-context-muted);

      text-transform: uppercase;

      letter-spacing: 0.03em;

    }



    #rrw-context-popup-root .rrw-context-item-target-tag {

      border: 1px solid rgba(153, 194, 255, 0.8);

      border-radius: 999px;

      padding: 1px 7px;

      background: rgba(31, 65, 114, 0.92);

      color: #cfe2ff;

      font-size: 0.68rem;

      font-weight: 600;

    }



    #rrw-context-popup-root .rrw-context-item-body {

      color: var(--rrw-context-text);

      font-size: 0.84rem;

      line-height: 1.35;

      word-break: break-word;

    }



    #rrw-context-popup-root .rrw-context-item-body .md,

    #rrw-context-popup-root .rrw-context-item-body .md p,

    #rrw-context-popup-root .rrw-context-item-body .md li,

    #rrw-context-popup-root .rrw-context-item-body .md strong,

    #rrw-context-popup-root .rrw-context-item-body .md em,

    #rrw-context-popup-root .rrw-context-item-body .md code {

      color: var(--rrw-context-text) !important;

    }



    #rrw-context-popup-root .rrw-context-item-body .md a {

      color: var(--rrw-context-link) !important;

      text-decoration: underline;

    }



    #rrw-context-popup-root .rrw-context-item-footer a {

      color: var(--rrw-context-link);

      text-decoration: underline;

      font-size: 0.76rem;

    }



    @media (max-width: 900px) {

      #rrw-context-popup-root .rrw-context-modal {

        width: calc(100vw - 12px);

        max-height: calc(100vh - 12px);

      }



      #rrw-context-popup-root .rrw-context-item {

        margin-left: 0;

      }

    }



    /* â”€â”€â”€â”€ Removal Overlay Styles â”€â”€â”€â”€ */



    .rrw-overlay-backdrop {

      position: fixed;

      inset: 0;

      background: rgba(15, 23, 42, 0.62);

      z-index: 2147483645;

    }



    .rrw-overlay-modal {

      position: fixed;

      top: 50%;

      left: 50%;

      width: min(680px, calc(100vw - 32px));

      max-height: calc(100vh - 32px);

      overflow: auto;

      transform: translate(-50%, -50%);

      background: var(--rrw-modal-bg);

      color: var(--rrw-text);

      border-radius: 12px;

      box-shadow: 0 20px 55px rgba(0, 0, 0, 0.35);

      z-index: 2147483646;

      font-family: var(--rrw-font-family);

    }



    .rrw-overlay-modal--compact {

      width: min(620px, calc(100vw - 20px));

      max-height: calc(100vh - 20px);

    }



    .rrw-overlay-header {

      display: flex;

      align-items: center;

      justify-content: space-between;

      border-bottom: 1px solid var(--rrw-soft-border);

      padding: 12px 16px;

    }



    .rrw-header-actions {

      display: flex;

      align-items: center;

      gap: 2px;

    }



    .rrw-overlay-header h2 {

      margin: 0;

      font-size: 1.05rem;

      color: var(--rrw-text);

    }



    .rrw-refresh-btn {

      appearance: none;

      -webkit-appearance: none;

      border: 1px solid var(--rrw-soft-border);

      border-radius: 6px;

      background: transparent;

      color: var(--rrw-muted);

      padding: 2px 6px;

      font-size: 0.95rem;

      line-height: 1.2;

      cursor: pointer;

      transition: color 0.15s, border-color 0.15s;

      margin: 0 !important;

    }



    .rrw-refresh-btn:hover {

      color: var(--rrw-text);

      border-color: var(--rrw-text);

    }



    .rrw-refresh-btn--spinning {

      animation: rrw-spin 0.8s linear infinite;

    }



    @keyframes rrw-spin {

      from { transform: rotate(0deg); }

      to { transform: rotate(360deg); }

    }



    @keyframes rrw-toast-slide-in {

      from {

        transform: translateX(400px);

        opacity: 0;

      }

      to {

        transform: translateX(0);

        opacity: 1;

      }

    }



    @keyframes rrw-toast-slide-out {

      from {

        transform: translateX(0);

        opacity: 1;

      }

      to {

        transform: translateX(400px);

        opacity: 0;

      }

    }



    .rrw-toast {

      pointer-events: auto;

    }



    .rrw-toast:hover {

      box-shadow: 0 6px 16px rgba(0,0,0,0.2);

    }



    .rrw-close {

      appearance: none;

      -webkit-appearance: none;

      border: 1px solid var(--rrw-close-border);

      border-radius: 8px;

      background: var(--rrw-close-bg);

      color: var(--rrw-text);

      padding: 4px 9px;

      line-height: 1.2;

      font-size: 0.84rem;

      cursor: pointer;

      margin: 0 !important;

    }



    .rrw-overlay-body {

      padding: 14px 16px 16px;

      display: grid;

      gap: 12px;

    }



    .rrw-tabs {

      display: flex;

      gap: 2px;

      border-bottom: 1px solid var(--rrw-soft-border);

      padding-bottom: 8px;

    }



    .rrw-tab-btn {

      appearance: none;

      -webkit-appearance: none;

      border: 1px solid var(--rrw-soft-border);

      border-radius: 8px;

      background: var(--rrw-card-bg);

      color: var(--rrw-muted);

      font-size: 0.75rem;

      font-weight: 600;

      padding: 4px 8px;

      cursor: pointer;

      white-space: nowrap;

      min-height: 26px;

      display: inline-flex;

      align-items: center;

      justify-content: center;

      margin: 0 !important;

    }



    .rrw-tab-btn--active {

      border-color: var(--rrw-link);

      color: var(--rrw-link);

      background: var(--rrw-field-bg);

    }



    .rrw-sticky-footer {

      position: sticky;

      bottom: 0;

      display: grid;

      gap: 6px;

      background: linear-gradient(to top, var(--rrw-footer-bg-top), var(--rrw-footer-bg-bottom));

      border-top: 1px solid var(--rrw-soft-border);

      margin: 4px -16px -16px;

      padding: 12px 16px 16px;

    }



    .rrw-target-card {

      border: 1px solid var(--rrw-soft-border);

      border-radius: 10px;

      padding: 10px 12px;

      background: var(--rrw-card-bg);

    }



    .rrw-target-card h3 {

      margin: 0 0 4px;

      font-size: 0.98rem;

      line-height: 1.3;

    }



    .rrw-target-card a {

      color: var(--rrw-link);

      text-decoration: none;

      font-size: 0.88rem;

    }



    .rrw-target-body {

      margin: 8px 0;

      font-size: 0.84rem;

      line-height: 1.35;

      color: var(--rrw-text);

      word-break: break-word;

    }



    .rrw-target-body--collapsed {

      max-height: calc(1.35em * 8);

      overflow: hidden;

    }



    .rrw-target-expand-btn {

      background: none;

      border: none;

      padding: 0;

      font-size: 0.7rem;

      color: var(--rrw-link);

      cursor: pointer;

      display: inline;

      margin-top: 0;

    }



    .rrw-target-expand-btn:hover {

      text-decoration: underline;

    }



    .rrw-target-body > *:first-child {

      margin-top: 0;

    }



    .rrw-target-body > *:last-child {

      margin-bottom: 0;

    }



    .rrw-target-body p {

      margin: 0 0 0.45em;

    }



    .rrw-target-body a {

      text-decoration: underline;

    }



    .rrw-target-body ul,

    .rrw-target-body ol {

      margin: 0 0 0.45em;

      padding-left: 18px;

    }



    .rrw-target-body blockquote {

      margin: 0 0 0.45em;

      border-left: 3px solid var(--rrw-soft-border);

      padding-left: 9px;

      color: var(--rrw-muted);

    }



    .rrw-target-body code {

      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

      font-size: 0.78rem;

      border: 1px solid var(--rrw-soft-border);

      background: var(--rrw-field-bg);

      border-radius: 4px;

      padding: 1px 4px;

    }



    .rrw-target-body .rrw-profile-codeblock {

      margin: 0 0 0.45em;

      border: 1px solid var(--rrw-soft-border);

      background: var(--rrw-field-bg);

      border-radius: 8px;

      padding: 8px;

      overflow: auto;

      white-space: pre;

    }



    .rrw-field {

      display: grid;

      gap: 6px;

      font-size: 0.86rem;

      color: var(--rrw-text);

    }



    .rrw-field--checkbox {

      display: flex;

      align-items: center;

      gap: 8px;

      font-size: 0.85rem;

    }



    .rrw-field--checkbox input[type="checkbox"] {

      margin: 0;

      width: auto;

    }



    .rrw-field--disabled {

      opacity: 0.45;

      pointer-events: none;

    }



    .rrw-field--search {

      margin-bottom: 6px;

    }



    .rrw-field--invalid input,

    .rrw-field--invalid textarea,

    .rrw-field--invalid select {

      border-color: #d13a46;

      box-shadow: 0 0 0 1px rgba(209, 58, 70, 0.12);

    }



    .rrw-field-error {

      color: #a61b26;

      font-size: 0.8rem;

    }



    .rrw-reason-summary {

      margin: 0 0 6px;

    }



    .rrw-chip-list {

      display: flex;

      flex-wrap: wrap;

      gap: 6px;

      margin: 0 0 8px;

    }



    .rrw-chip {

      display: inline-flex;

      align-items: center;

      gap: 6px;

      border: 1px solid var(--rrw-border);

      border-radius: 999px;

      background: var(--rrw-chip-bg);

      color: var(--rrw-chip-text);

      padding: 4px 10px;

      font-size: 0.8rem;

      cursor: pointer;

    }



    .rrw-fieldset {

      border: 1px solid var(--rrw-border);

      border-radius: 8px;

      padding: 8px 10px;

      margin: 0;

      background: var(--rrw-field-bg);

    }



    .rrw-fieldset legend {

      padding: 0 4px;

      font-size: 0.84rem;

      color: var(--rrw-muted);

      line-height: 1.2;

    }



    .rrw-checklist {

      display: grid;

      gap: 6px;

      max-height: 160px;

      overflow: auto;

      padding-right: 2px;

    }



    .rrw-preview-panel {

      display: grid;

      gap: 8px;

      border: 1px solid var(--rrw-border);

      border-radius: 10px;

      background: var(--rrw-card-bg);

      padding: 10px 12px;

    }



    .rrw-inline-usernote-panel {

      display: grid;

      gap: 8px;

      border: 1px solid var(--rrw-border);

      border-radius: 10px;

      background: var(--rrw-card-bg);

      padding: 10px 12px;

    }



    .rrw-user-actions-panel {

      display: grid;

      gap: 8px;

      border: 1px solid var(--rrw-border);

      border-radius: 10px;

      background: var(--rrw-card-bg);

      padding: 10px 12px;

    }



    .rrw-inline-usernote-panel h3 {

      margin: 0;

      font-size: 0.92rem;

      color: var(--rrw-text);

    }



    .rrw-user-actions-panel h3 {

      margin: 0;

      font-size: 0.92rem;

      color: var(--rrw-text);

    }



    .rrw-preview-panel__header {

      display: flex;

      align-items: center;

      justify-content: space-between;

      gap: 8px;

    }



    .rrw-preview-panel__header h3 {

      margin: 0;

      font-size: 0.92rem;

      color: var(--rrw-text);

    }



    .rrw-preview-subject {

      margin: 0;

      font-size: 0.84rem;

      color: var(--rrw-text);

    }



    .rrw-preview-body {

      margin: 0;

      padding: 10px;

      border-radius: 8px;

      background: var(--rrw-preview-bg);

      border: 1px solid var(--rrw-border);

      color: var(--rrw-preview-text);

      font-family: monospace;

      font-size: 0.8rem;

      line-height: 1.4;

      white-space: pre-wrap;

      word-break: break-word;

      overflow-y: auto;

      max-height: none;

    }



    .rrw-check-item {

      display: grid;

      grid-template-columns: 16px minmax(0, 1fr);

      gap: 10px;

      align-items: start;

      font-size: 0.85rem;

      color: var(--rrw-text);

      text-align: left;

      width: 100%;

      margin: 0;

    }



    .rrw-check-item input[type="checkbox"] {

      margin: 2px 0 0;

      justify-self: center;

    }



    .rrw-check-item span {

      display: block;

      text-align: left;

      line-height: 1.25;

      word-break: break-word;

    }



    .rrw-field input,

    .rrw-field textarea,

    .rrw-field select {

      border: 1px solid var(--rrw-border);

      border-radius: 8px;

      padding: 8px 10px;

      font-size: 0.9rem;

      width: 100%;

      box-sizing: border-box;

      background: var(--rrw-field-bg);

      color: var(--rrw-text);

    }



    .rrw-actions {

      display: flex !important;

      gap: 2px !important;

      flex-wrap: wrap !important;

    }



    .rrw-actions--inline {

      justify-content: flex-start;

    }



    .rrw-quick-actions-grid {

      display: grid !important;

      grid-template-columns: repeat(3, 1fr);

      gap: 6px;

      width: 100%;

    }



    .rrw-btn {

      appearance: none !important;

      -webkit-appearance: none !important;

      display: inline-flex !important;

      align-items: center !important;

      justify-content: center !important;

      border: 0 !important;

      border-radius: 8px !important;

      color: #fff !important;

      font-weight: 600 !important;

      font-size: 0.85rem !important;

      line-height: 1.3 !important;

      padding: 5px 9px !important;

      min-height: 28px !important;

      cursor: pointer !important;

      margin: 0 !important;

    }



    .rrw-btn:disabled {

      opacity: 0.55;

      cursor: not-allowed;

    }



    .rrw-btn-primary {

      background: #cb2431;

    }



    .rrw-btn-secondary {

      background: #1e5bd6;

    }



    .rrw-btn-danger {

      background: #7f1d1d;

    }



    .rrw-quick-action-btn {

      display: flex !important;

      width: 100% !important;

      justify-content: center !important;

      align-items: center !important;

      text-align: center !important;

      min-height: 50px !important;

      padding: 6px 4px !important;

      white-space: normal !important;

      line-height: 1.2 !important;

      flex-wrap: wrap !important;

      font-size: 0.7rem !important;

      margin: 0 !important;

    }



    .rrw-error {

      border: 1px solid var(--rrw-error-border);

      background: var(--rrw-error-bg);

      color: var(--rrw-error-text);

      border-radius: 8px;

      padding: 10px;

      font-size: 0.86rem;

    }



    .rrw-success {

      border: 1px solid var(--rrw-success-border);

      background: var(--rrw-success-bg);

      color: var(--rrw-success-text);

      border-radius: 8px;

      padding: 10px;

      font-size: 0.86rem;

    }



    .rrw-warning {

      border: 1px solid var(--rrw-warning-border);

      background: var(--rrw-warning-bg);

      color: var(--rrw-warning-text);

      border-radius: 8px;

      padding: 10px;

      font-size: 0.86rem;

    }



    .rrw-muted {

      color: var(--rrw-muted);

      margin: 0;

      font-size: 0.84rem;

    }



    .rrw-footer-links {

      display: flex;

      align-items: center;

      justify-content: space-between;

      gap: 10px;

      flex-wrap: wrap;

    }



    .rrw-footer-links--solo {

      border-top: 1px solid var(--rrw-soft-border);

      padding-top: 10px;

    }



    .rrw-link-btn {

      border: 0;

      background: transparent;

      color: var(--rrw-link);

      cursor: pointer;

      padding: 0;

      font-size: 0.85rem;

      text-decoration: underline;

    }



    .rrw-removal-config-backdrop {

      position: fixed;

      inset: 0;

      background: rgba(8, 14, 26, 0.7);

      z-index: 2147483646;

    }



    .rrw-removal-config-modal {

      position: fixed;

      top: 50%;

      left: 50%;

      transform: translate(-50%, -50%);

      width: min(1080px, calc(100vw - 24px));

      max-height: calc(100vh - 24px);

      overflow: hidden;

      border-radius: 14px;

      border: 1px solid rgba(61, 92, 143, 0.72);

      background: linear-gradient(180deg, rgba(10, 18, 31, 0.99), rgba(12, 21, 36, 0.99));

      color: var(--rrw-text);

      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.48);

      z-index: 2147483647;

      display: grid;

      grid-template-rows: auto auto minmax(0, 1fr) auto;

    }



    .rrw-removal-config-header,

    .rrw-removal-config-footer {

      display: flex;

      align-items: center;

      justify-content: space-between;

      gap: 2px;

      padding: 14px 16px;

      background: rgba(10, 18, 31, 0.98);

      position: sticky;

      z-index: 2;

    }



    .rrw-removal-config-header {

      top: 0;

      border-bottom: 1px solid rgba(54, 83, 130, 0.38);

    }



    .rrw-removal-config-header h2 {

      margin: 0 0 2px;

      font-size: 1rem;

      line-height: 1.2;

    }



    .rrw-removal-config-title {

      display: flex;

      align-items: center;

      gap: 10px;

      min-width: 0;

    }



    .rrw-removal-config-logo {

      width: 34px;

      height: 34px;

      object-fit: contain;

      border-radius: 6px;

      flex: 0 0 auto;

    }



    .rrw-removal-config-tabs {

      display: flex;

      gap: 1px;

      padding: 10px 16px 0;

      background: rgba(10, 18, 31, 0.98);

      position: sticky;

      top: 58px;

      z-index: 2;

      border-bottom: 1px solid rgba(54, 83, 130, 0.24);

    }



    .rrw-removal-config-tab {

      border: 1px solid rgba(57, 86, 130, 0.5);

      border-bottom: 0;

      border-radius: 10px 10px 0 0;

      padding: 6px 10px;

      background: rgba(17, 29, 49, 0.9);

      color: #cfe1ff;

      cursor: pointer;

      font-size: 0.86rem;

      font-weight: 600;

      display: flex !important;

      align-items: center !important;

      justify-content: center !important;

      white-space: nowrap;

      margin: 0 !important;

    }



    .rrw-removal-config-tab.is-active {

      background: rgba(28, 49, 82, 0.96);

      color: #ffffff;

      border-color: rgba(106, 153, 224, 0.72);

      box-shadow: inset 0 -2px 0 rgba(120, 173, 255, 0.7);

    }



    .rrw-ext-wiki-actions {

      justify-content: flex-start;

    }



    .rrw-removal-config-footer {

      border-top: 1px solid rgba(54, 83, 130, 0.38);

      align-items: end;

      position: relative;

    }



    .rrw-removal-config-body {

      display: grid;

      gap: 14px;

      padding: 14px 16px 18px;

      min-height: 0;

      overflow: auto;

    }



    .rrw-removal-config-note {

      min-width: min(420px, 52vw);

      flex: 1 1 auto;

    }



    .rrw-config-section {

      display: grid;

      gap: 12px;

    }



    .rrw-config-grid {

      display: grid;

      gap: 12px;

      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));

    }



    .rrw-config-grid--queue-bar {

      align-items: start;

    }



    .rrw-config-grid--queue-bar .rrw-field {

      align-content: start;

    }



    .rrw-config-help {

      margin-top: 2px;

      font-size: 0.78rem;

      line-height: 1.25;

    }



    .rrw-config-toolbar {

      display: flex;

      align-items: center;

      justify-content: space-between;

      gap: 12px;

      flex-wrap: wrap;

    }



    .rrw-config-toolbar--sticky {

      position: sticky;

      top: -14px;

      z-index: 4;

      align-self: start;

      background: var(--rrw-modal-bg);

      margin: -14px -16px 0;

      padding: 14px 16px 12px;

      border-bottom: 1px solid var(--rrw-soft-border);

    }



    .rrw-config-section--playbooks {

      position: relative;

    }



    .rrw-config-toolbar h3 {

      margin: 0;

      font-size: 0.94rem;

    }



    .rrw-config-reason-list {

      display: grid;

      gap: 12px;

    }



    .rrw-config-reason-card {

      display: grid;

      gap: 12px;

      border: 1px solid rgba(71, 104, 160, 0.42);

      border-radius: 12px;

      background: rgba(18, 30, 49, 0.88);

      padding: 12px;

    }



    .rrw-config-reason-head {

      display: grid;

      gap: 8px;

    }



    .rrw-config-reason-title-row {

      display: grid;

      gap: 8px;

      grid-template-columns: minmax(0, 1fr) auto auto auto auto;

      align-items: center;

    }



    .rrw-config-inline-toggle {

      white-space: normal;

      align-self: stretch;

      min-width: 0;

    }



    .rrw-config-inline-toggle span {

      min-width: 0;

      line-height: 1.3;

      overflow-wrap: anywhere;

    }



    .rrw-config-flag-row {

      display: flex;

      flex-wrap: wrap;

      gap: 12px;

    }



    .rrw-config-preview-panel {

      background: rgba(11, 19, 31, 0.72);

    }



    .rrw-config-preview-list {

      margin: 0;

      padding-left: 18px;

      display: grid;

      gap: 6px;

      color: #d4e4ff;

      font-size: 0.83rem;

    }



    .rrw-config-preview-list li {

      margin: 0;

      line-height: 1.35;

    }



    .rrw-removal-config-modal textarea,

    .rrw-removal-config-modal input,

    .rrw-removal-config-modal select {

      background: rgba(11, 19, 31, 0.94);

    }



    @media (max-width: 900px) {

      .rrw-config-reason-title-row {

        grid-template-columns: 1fr 1fr;

      }



      .rrw-removal-config-footer {

        flex-direction: column;

        align-items: stretch;

      }



      .rrw-removal-config-note {

        min-width: 0;

        width: 100%;

      }

    }



    html[data-rrw-theme="light"] .rrw-removal-config-modal {

      border-color: rgba(149, 175, 210, 0.78);

      background: linear-gradient(180deg, rgba(246, 250, 255, 0.995), rgba(236, 245, 255, 0.99));

      color: #21324a;

      box-shadow: 0 24px 70px rgba(81, 109, 145, 0.28);

    }



    html[data-rrw-theme="light"] .rrw-removal-config-header,

    html[data-rrw-theme="light"] .rrw-removal-config-footer,

    html[data-rrw-theme="light"] .rrw-removal-config-tabs {

      background: rgba(245, 250, 255, 0.98);

    }



    html[data-rrw-theme="light"] .rrw-removal-config-header {

      border-bottom-color: rgba(153, 179, 212, 0.48);

    }



    html[data-rrw-theme="light"] .rrw-removal-config-tabs {

      border-bottom-color: rgba(153, 179, 212, 0.38);

    }



    html[data-rrw-theme="light"] .rrw-removal-config-tab {

      border-color: rgba(153, 179, 212, 0.66);

      background: rgba(232, 242, 255, 0.92);

      color: #355982;

    }



    html[data-rrw-theme="light"] .rrw-removal-config-tab.is-active {

      background: rgba(222, 235, 254, 0.98);

      color: #1e3a5a;

      border-color: rgba(120, 159, 220, 0.78);

      box-shadow: inset 0 -2px 0 rgba(94, 144, 214, 0.7);

    }



    html[data-rrw-theme="light"] .rrw-removal-config-footer {

      border-top-color: rgba(153, 179, 212, 0.48);

    }



    html[data-rrw-theme="light"] .rrw-config-reason-card {

      border-color: rgba(153, 179, 212, 0.68);

      background: rgba(241, 248, 255, 0.95);

    }



    html[data-rrw-theme="light"] .rrw-config-preview-panel {

      background: rgba(232, 242, 255, 0.9);

    }



    html[data-rrw-theme="light"] .rrw-config-preview-list {

      color: #29496f;

    }



    html[data-rrw-theme="light"] .rrw-removal-config-modal textarea,

    html[data-rrw-theme="light"] .rrw-removal-config-modal input,

    html[data-rrw-theme="light"] .rrw-removal-config-modal select {

      background: rgba(236, 245, 255, 0.96);

    }



    html[data-rrw-theme="light"] #rrw-context-popup-root .rrw-context-backdrop {

      background: rgba(176, 190, 212, 0.32);

    }



    html[data-rrw-theme="light"] #rrw-context-popup-root .rrw-context-modal {

      background: linear-gradient(160deg, rgba(246, 250, 255, 0.995), rgba(236, 245, 255, 0.99));

      border-color: rgba(149, 175, 210, 0.78);

      box-shadow: 0 18px 44px rgba(81, 109, 145, 0.24);

    }



    html[data-rrw-theme="light"] #rrw-context-popup-root .rrw-context-header {

      background: linear-gradient(180deg, rgba(245, 250, 255, 0.98), rgba(240, 247, 255, 0.95));

      border-bottom-color: rgba(153, 179, 212, 0.48);

    }



    html[data-rrw-theme="light"] #rrw-context-popup-root .rrw-context-header h2 {

      color: #21324a;

    }



    html[data-rrw-theme="light"] #rrw-context-popup-root .rrw-context-item--target {

      border-color: rgba(120, 159, 220, 0.78);

      box-shadow: 0 0 0 1px rgba(120, 159, 220, 0.42);

      background: rgba(214, 229, 252, 0.68);

    }



    html[data-rrw-theme="light"] #rrw-context-popup-root .rrw-context-item-target-tag {

      border-color: rgba(120, 159, 220, 0.78);

      background: rgba(222, 235, 254, 0.92);

      color: #3a5f8f;

    }



    html[data-rrw-theme="light"] #rrw-context-popup-root {

      --rrw-context-bg: rgba(248, 251, 255, 0.98);

      --rrw-context-surface: rgba(239, 247, 255, 0.96);

      --rrw-context-border: rgba(156, 181, 213, 0.72);

      --rrw-context-text: #213854;

      --rrw-context-muted: #607c9d;

      --rrw-context-link: #2a63be;

      color-scheme: light;

    }



    html[data-rrw-theme="light"] #rrw-profile-root {

      --rrw-profile-bg: rgba(248, 251, 255, 0.98);

      --rrw-profile-surface: rgba(232, 242, 255, 0.75);

      --rrw-profile-surface-strong: rgba(240, 247, 255, 0.95);

      --rrw-profile-border: rgba(156, 181, 213, 0.72);

      --rrw-profile-text: #223a58;

      --rrw-profile-muted: #627d9d;

      --rrw-profile-link: #2a63be;

      color-scheme: light;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-backdrop {

      background: rgba(215, 227, 245, 0.68);

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-modal {

      background: linear-gradient(180deg, rgba(246, 250, 255, 0.995), rgba(236, 245, 255, 0.99));

      border-color: rgba(149, 175, 210, 0.78);

      box-shadow: 0 18px 44px rgba(81, 109, 145, 0.28);

      color: #223a58;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-header {

      background: linear-gradient(180deg, rgba(245, 250, 255, 0.98), rgba(240, 247, 255, 0.95));

      border-bottom-color: rgba(153, 179, 212, 0.48);

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-header h2 {

      color: #23405f;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-avatar {

      background: rgba(236, 245, 255, 0.96);

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-sidebar-panel {

      border-color: rgba(153, 179, 212, 0.56);

      background: rgba(236, 245, 255, 0.92);

      color: #27486e;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-sidebar-panel h4 {

      color: #4f75a5;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-sidebar-row {

      color: #27486e;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-sidebar-row a {

      color: #2a63be;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-toolbar,

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-search {

      border-color: rgba(156, 181, 213, 0.60);

      background: rgba(236, 245, 255, 0.96);

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-input,

    html[data-rrw-theme="light"] #rrw-profile-root select,

    html[data-rrw-theme="light"] #rrw-profile-root input[type="text"],

    html[data-rrw-theme="light"] #rrw-profile-root input[type="search"] {

      border-color: rgba(156, 181, 213, 0.60);

      background: rgba(240, 247, 255, 0.96);

      color: #223a58;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-field--checkbox {

      color: #627d9d;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-tab-btn {

      border-color: rgba(156, 181, 213, 0.56);

      background: rgba(232, 242, 255, 0.92);

      color: #355982;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-tab-btn:hover {

      border-color: rgba(120, 159, 220, 0.76);

      background: rgba(222, 235, 254, 0.98);

      color: #223a58;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-tab-btn--active {

      border-color: rgba(120, 159, 220, 0.82);

      background: rgba(214, 229, 252, 0.99);

      color: #1e3a5a;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-btn,

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-close {

      border-color: rgba(153, 179, 212, 0.68);

      background: rgba(231, 241, 255, 0.98);

      color: #2f4f78;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-btn:hover,

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-close:hover {

      border-color: rgba(120, 159, 220, 0.78);

      background: rgba(222, 235, 254, 0.98);

      color: #1e3a5a;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item {

      border-color: rgba(153, 179, 212, 0.52);

      background: rgba(236, 245, 255, 0.92);

      color: #27486e;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item-header {

      color: #4f75a5;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item-title {

      color: #1e3a5a;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item-mod {

      border-color: rgba(120, 159, 220, 0.62);

      background: rgba(214, 229, 252, 0.98);

      color: #2a63be;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item-body a {

      color: #2a63be;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item-body code {

      border-color: rgba(153, 179, 212, 0.36);

      background: rgba(236, 245, 255, 0.96);

      color: #27486e;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item-body .rrw-profile-codeblock {

      border-color: rgba(153, 179, 212, 0.36);

      background: rgba(236, 245, 255, 0.96);

      color: #27486e;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item-body .rrw-profile-codeblock code {

      color: #27486e;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item-body blockquote {

      border-left-color: rgba(153, 179, 212, 0.52);

      color: #627d9d;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item-footer {

      color: #627d9d;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item-footer a {

      color: #2a63be;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item--removed {

      border-color: rgba(200, 60, 60, 0.7);

      background: rgba(255, 200, 200, 0.92);

      color: #731919;

    }



    html[data-rrw-theme="dark"] #rrw-profile-root .rrw-profile-item--removed {

      border-color: rgba(220, 80, 80, 0.7);

      background: rgba(60, 15, 15, 0.85);

      color: #ff9999;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-empty {

      border-color: rgba(153, 179, 212, 0.36);

      background: rgba(236, 245, 255, 0.92);

      color: #627d9d;

    }



    #rrw-inline-history-root {

      position: fixed;

      z-index: 2147483644;

      --rrw-font-family: "Segoe UI Variable Text", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;

      font-family: var(--rrw-font-family);

    }



    #rrw-inline-history-root .rrw-inline-history-popup {

      width: min(760px, calc(100vw - 20px));

      max-height: min(78vh, 560px);

      overflow: hidden;

      border: 1px solid rgba(98, 133, 192, 0.58);

      border-radius: 10px;

      background: rgba(12, 20, 34, 0.98);

      color: #e7f0ff;

      font-family: "Segoe UI Variable Text", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;

      text-rendering: optimizeLegibility;

      -webkit-font-smoothing: antialiased;

      -moz-osx-font-smoothing: grayscale;

      box-shadow: 0 14px 36px rgba(0, 0, 0, 0.42);

      display: grid;

      grid-template-rows: auto minmax(0, 1fr);

    }



    #rrw-inline-history-root .rrw-inline-history-header {

      display: flex;

      align-items: center;

      justify-content: space-between;

      gap: 10px;

      padding: 10px 12px;

      border-bottom: 1px solid rgba(98, 133, 192, 0.4);

      background: rgba(21, 38, 62, 0.9);

    }



    #rrw-inline-history-root .rrw-inline-history-header h4 {

      margin: 0;

      font-size: 0.95rem;

      line-height: 1.2;

      color: #dbe8ff;

    }



    #rrw-inline-history-root .rrw-inline-history-body {

      display: grid;

      gap: 10px;

      padding: 10px 12px 12px;

      overflow-y: auto;

    }



    #rrw-inline-history-root .rrw-inline-history-summary {

      display: grid;

      gap: 4px;

      padding: 8px;

      border: 1px solid rgba(98, 133, 192, 0.36);

      border-radius: 8px;

      background: rgba(21, 38, 62, 0.62);

      color: #dce9ff;

      font-size: 0.9rem;

    }



    #rrw-inline-history-root .rrw-inline-history-summary a {

      color: #9bc2ff;

      text-decoration: none;

    }



    #rrw-inline-history-root .rrw-inline-history-summary a:hover {

      text-decoration: underline;

    }



    #rrw-inline-history-root .rrw-inline-history-disclaimer {

      margin: 0;

      font-size: 0.84rem;

      line-height: 1.35;

      color: #9eb6df;

    }



    #rrw-inline-history-root .rrw-inline-history-available {

      margin: 0;

      font-size: 0.86rem;

      line-height: 1.4;

      color: #dce9ff;

    }



    #rrw-inline-history-root .rrw-inline-history-grid {

      display: grid;

      grid-template-columns: repeat(2, minmax(0, 1fr));

      gap: 10px;

    }



    #rrw-inline-history-root .rrw-inline-history-panel {

      border: 1px solid rgba(98, 133, 192, 0.36);

      border-radius: 8px;

      background: rgba(21, 38, 62, 0.62);

      overflow: hidden;

    }



    #rrw-inline-history-root .rrw-inline-history-panel h5 {

      margin: 0;

      padding: 8px 10px;

      font-size: 0.82rem;

      line-height: 1.2;

      text-transform: uppercase;

      letter-spacing: 0.03em;

      color: #b7cef1;

      border-bottom: 1px solid rgba(98, 133, 192, 0.32);

      background: rgba(19, 35, 58, 0.74);

    }



    #rrw-inline-history-root .rrw-inline-history-panel table {

      width: 100%;

      border-collapse: collapse;

      table-layout: fixed;

      font-size: 0.81rem;

      color: #dce9ff;

    }



    #rrw-inline-history-root .rrw-inline-history-panel th,

    #rrw-inline-history-root .rrw-inline-history-panel td {

      padding: 6px 8px;

      border-bottom: 1px solid rgba(98, 133, 192, 0.2);

      text-align: left;

      vertical-align: top;

      white-space: nowrap;

      overflow: hidden;

      text-overflow: ellipsis;

    }



    #rrw-inline-history-root .rrw-inline-history-panel th {

      font-size: 0.74rem;

      text-transform: uppercase;

      letter-spacing: 0.03em;

      color: #9eb6df;

      background: rgba(18, 32, 53, 0.8);

    }



    #rrw-inline-history-root .rrw-inline-history-panel td a {

      color: #9bc2ff;

      text-decoration: none;

    }



    #rrw-inline-history-root .rrw-inline-history-panel td a:hover {

      text-decoration: underline;

    }



    #rrw-inline-history-root .rrw-inline-history-row--warning {

      background: rgba(168, 118, 21, 0.18);

    }



    #rrw-inline-history-root .rrw-inline-history-row--danger {

      background: rgba(147, 44, 58, 0.2);

    }



    #rrw-inline-history-root .rrw-inline-history-row--current {

      box-shadow: inset 2px 0 0 rgba(121, 169, 239, 0.95);

    }



    #rrw-inline-history-root .rrw-inline-history-empty-cell {

      color: #9eb6df;

      font-style: italic;

    }



    html[data-rrw-theme="light"] #rrw-inline-history-root {

      color-scheme: light;

    }



    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-popup {

      border-color: rgba(149, 175, 210, 0.78);

      background: linear-gradient(180deg, rgba(246, 250, 255, 0.995), rgba(236, 245, 255, 0.99));

      color: #21324a;

      box-shadow: 0 14px 36px rgba(81, 109, 145, 0.24);

    }



    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-header {

      border-bottom-color: rgba(153, 179, 212, 0.42);

      background: rgba(245, 250, 255, 0.98);

    }



    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-header h4 {

      color: #23405f;

    }



    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-summary,

    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-panel {

      border-color: rgba(153, 179, 212, 0.42);

      background: rgba(236, 245, 255, 0.92);

      color: #27486e;

    }



    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-summary a,

    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-panel td a {

      color: #2a63be;

    }



    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-disclaimer,

    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-empty-cell {

      color: #627d9d;

    }



    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-available,

    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-panel table {

      color: #27486e;

    }



    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-panel h5 {

      color: #4f75a5;

      border-bottom-color: rgba(153, 179, 212, 0.36);

      background: rgba(227, 239, 255, 0.96);

    }



    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-panel th,

    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-panel td {

      border-bottom-color: rgba(153, 179, 212, 0.24);

    }



    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-panel th {

      color: #627d9d;

      background: rgba(232, 242, 255, 0.96);

    }



    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-row--warning {

      background: rgba(230, 193, 118, 0.22);

    }



    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-row--danger {

      background: rgba(223, 154, 165, 0.22);

    }



    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-row--current {

      box-shadow: inset 2px 0 0 rgba(42, 99, 190, 0.64);

    }



    /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

    /* Inline Modlog Popup */

    /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */



    #rrw-inline-modlog-root {

      position: fixed;

      z-index: 2147483644;

      --rrw-font-family: "Segoe UI Variable Text", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;

      font-family: var(--rrw-font-family);

    }



    #rrw-inline-modlog-root .rrw-inline-modlog-popup {

      width: min(560px, calc(100vw - 20px));

      max-height: min(72vh, 440px);

      overflow: hidden;

      border: 1px solid rgba(98, 133, 192, 0.58);

      border-radius: 10px;

      background: rgba(12, 20, 34, 0.98);

      color: #e7f0ff;

      font-family: "Segoe UI Variable Text", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;

      text-rendering: optimizeLegibility;

      -webkit-font-smoothing: antialiased;

      -moz-osx-font-smoothing: grayscale;

      box-shadow: 0 14px 36px rgba(0, 0, 0, 0.42);

      display: grid;

      grid-template-rows: auto minmax(0, 1fr);

    }



    #rrw-inline-modlog-root .rrw-inline-modlog-header {

      display: flex;

      align-items: center;

      justify-content: space-between;

      gap: 10px;

      padding: 10px 12px;

      border-bottom: 1px solid rgba(98, 133, 192, 0.4);

      background: rgba(21, 38, 62, 0.9);

    }



    #rrw-inline-modlog-root .rrw-inline-modlog-header h4 {

      margin: 0;

      font-size: 0.95rem;

      line-height: 1.2;

      color: #dbe8ff;

    }



    #rrw-inline-modlog-root .rrw-inline-modlog-body {

      display: grid;

      gap: 10px;

      padding: 10px 12px 12px;

      overflow-y: auto;

    }



    #rrw-inline-modlog-root .rrw-inline-modlog-list {

      list-style: none;

      margin: 0;

      padding: 0;

      display: grid;

      gap: 8px;

    }



    #rrw-inline-modlog-root .rrw-inline-modlog-list li {

      padding: 8px 10px;

      border: 1px solid rgba(98, 133, 192, 0.36);

      border-radius: 6px;

      background: rgba(21, 38, 62, 0.62);

      color: #dce9ff;

      font-size: 0.9rem;

      line-height: 1.4;

    }



    #rrw-inline-modlog-root .rrw-inline-modlog-list strong {

      color: #cfe2ff;

      font-weight: 600;

    }



    #rrw-inline-modlog-root .rrw-muted {

      color: #9eb6df;

    }



    html[data-rrw-theme="light"] #rrw-inline-modlog-root {

      color-scheme: light;

    }



    html[data-rrw-theme="light"] #rrw-inline-modlog-root .rrw-inline-modlog-popup {

      border-color: rgba(149, 175, 210, 0.78);

      background: linear-gradient(180deg, rgba(246, 250, 255, 0.995), rgba(236, 245, 255, 0.99));

      color: #21324a;

      box-shadow: 0 14px 36px rgba(81, 109, 145, 0.24);

    }



    html[data-rrw-theme="light"] #rrw-inline-modlog-root .rrw-inline-modlog-header {

      border-bottom-color: rgba(153, 179, 212, 0.48);

      background: linear-gradient(180deg, rgba(245, 250, 255, 0.98), rgba(240, 247, 255, 0.95));

    }



    html[data-rrw-theme="light"] #rrw-inline-modlog-root .rrw-inline-modlog-header h4 {

      color: #223856;

    }



    html[data-rrw-theme="light"] #rrw-inline-modlog-root .rrw-inline-modlog-list li {

      border-color: rgba(149, 175, 210, 0.52);

      background: rgba(236, 245, 255, 0.88);

      color: #223856;

    }



    html[data-rrw-theme="light"] #rrw-inline-modlog-root .rrw-inline-modlog-list strong {

      color: #0f3a7d;

    }



    html[data-rrw-theme="light"] #rrw-inline-modlog-root .rrw-muted {

      color: #627d9d;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-modal {

      border-color: rgba(149, 175, 210, 0.78);

      background: linear-gradient(180deg, rgba(246, 250, 255, 0.995), rgba(236, 245, 255, 0.99));

      color: #223a58;

      box-shadow: 0 24px 70px rgba(81, 109, 145, 0.28);

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-header {

      border-bottom-color: rgba(153, 179, 212, 0.48);

      background: linear-gradient(180deg, rgba(245, 250, 255, 0.98), rgba(240, 247, 255, 0.95));

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-toolbar {

      border-color: rgba(156, 181, 213, 0.48);

      background: rgba(236, 245, 255, 0.96);

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-search {

      border-color: rgba(156, 181, 213, 0.48);

      background: rgba(236, 245, 255, 0.96);

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-input {

      border-color: rgba(156, 181, 213, 0.72);

      background: rgba(240, 247, 255, 0.95);

      color: #223a58;

    }



    html[data-rrw-theme="light"] #rrw-profile-root .rrw-btn {

      border-color: rgba(156, 181, 213, 0.48);

      background: rgba(236, 245, 255, 0.96);

      color: #223a58;

    }



    #rrw-profile-root {

      --rrw-font-family: "Segoe UI Variable Text", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;

      --rrw-profile-bg: rgba(12, 20, 34, 0.97);

      --rrw-profile-surface: rgba(27, 46, 74, 0.55);

      --rrw-profile-surface-strong: rgba(21, 38, 62, 0.88);

      --rrw-profile-border: rgba(98, 133, 192, 0.52);

      --rrw-profile-text: #e7f0ff;

      --rrw-profile-muted: #9eb6df;

      --rrw-profile-link: #9bc2ff;

      color-scheme: dark;

      font-family: var(--rrw-font-family);

    }



    #rrw-profile-root .rrw-profile-backdrop {

      position: fixed;

      inset: 0;

      background: rgba(7, 12, 22, 0.72);

      z-index: 2147483644;

    }



    #rrw-profile-root .rrw-profile-modal {

      position: fixed;

      inset: 50% auto auto 50%;

      transform: translate(-50%, -50%);

      width: min(1080px, calc(100vw - 28px));

      max-height: calc(100vh - 28px);

      overflow: auto;

      border: 1px solid var(--rrw-profile-border);

      border-radius: 14px;

      background: linear-gradient(160deg, rgba(12, 20, 34, 0.98), rgba(16, 27, 44, 0.99));

      color: var(--rrw-profile-text);

      box-shadow: 0 18px 44px rgba(5, 9, 14, 0.56);

      z-index: 2147483645;

      scrollbar-color: rgba(120, 159, 225, 0.5) transparent;

    }



    #rrw-profile-root .rrw-profile-header {

      display: flex;

      align-items: center;

      justify-content: space-between;

      gap: 10px;

      border-bottom: 1px solid var(--rrw-profile-border);

      padding: 12px 16px;

      position: sticky;

      top: 0;

      background: linear-gradient(180deg, rgba(17, 29, 47, 0.98), rgba(17, 29, 47, 0.88));

      backdrop-filter: blur(2px);

      z-index: 1;

    }



    #rrw-profile-root .rrw-profile-header h2 {

      margin: 0;

      font-size: 1.04rem;

      line-height: 1.25;

      color: #dce9ff;

    }



    #rrw-profile-root .rrw-profile-layout {

      display: grid;

      grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);

      gap: 12px;

      padding: 12px 14px 14px;

    }



    #rrw-profile-root .rrw-profile-sidebar {

      display: grid;

      align-content: start;

      gap: 10px;

    }



    #rrw-profile-root .rrw-profile-sidebar-panel {

      border: 1px solid var(--rrw-profile-border);

      border-radius: 10px;

      background: var(--rrw-profile-surface-strong);

      padding: 10px;

      display: grid;

      gap: 6px;

    }



    #rrw-profile-root .rrw-profile-sidebar-panel h4 {

      margin: 0;

      font-size: 0.86rem;

      color: var(--rrw-profile-muted);

      line-height: 1.25;

      text-transform: uppercase;

      letter-spacing: 0.04em;

    }



    #rrw-profile-root .rrw-profile-avatar {

      width: 56px;

      height: 56px;

      border-radius: 999px;

      object-fit: cover;

      border: 1px solid var(--rrw-profile-border);

      background: rgba(14, 24, 39, 0.95);

    }



    #rrw-profile-root .rrw-profile-sidebar-row {

      font-size: 0.82rem;

      color: var(--rrw-profile-text);

      line-height: 1.3;

      word-break: break-word;

    }



    #rrw-profile-root .rrw-profile-sidebar-row a,

    #rrw-profile-root .rrw-profile-item-footer a,

    #rrw-profile-root .rrw-profile-item a {

      color: var(--rrw-profile-link);

      text-decoration: underline;

    }



    #rrw-profile-root .rrw-profile-sidebar-description {

      margin: 0;

      font-size: 0.8rem;

      color: var(--rrw-profile-muted);

      line-height: 1.35;

    }



    #rrw-profile-root .rrw-profile-sidebar-list {

      margin: 0;

      padding-left: 16px;

      display: grid;

      gap: 4px;

      font-size: 0.8rem;

    }



    #rrw-profile-root .rrw-profile-main {

      display: grid;

      align-content: start;

      gap: 10px;

      min-width: 0;

    }



    #rrw-profile-root .rrw-profile-toolbar {

      display: grid;

      grid-template-columns: minmax(150px, 190px) max-content max-content;

      gap: 8px;

      align-items: end;

      padding: 8px 10px;

      border: 1px solid var(--rrw-profile-border);

      border-radius: 10px;

      background: var(--rrw-profile-surface);

    }



    #rrw-profile-root .rrw-profile-toolbar-field {

      min-width: 0;

      max-width: none;

    }



    #rrw-profile-root .rrw-profile-search {

      display: grid;

      grid-template-columns: minmax(130px, 180px) minmax(180px, 1fr) auto auto auto auto;

      gap: 8px;

      align-items: center;

      padding: 8px 10px;

      border: 1px solid var(--rrw-profile-border);

      border-radius: 10px;

      background: var(--rrw-profile-surface);

    }



    #rrw-profile-root .rrw-input {

      border: 1px solid var(--rrw-profile-border);

      border-radius: 8px;

      background: rgba(15, 28, 45, 0.86);

      color: var(--rrw-profile-text);

      padding: 7px 9px;

      font-size: 0.85rem;

      min-width: 0;

    }



    #rrw-profile-root select,

    #rrw-profile-root input[type="text"],

    #rrw-profile-root input[type="search"] {

      border: 1px solid var(--rrw-profile-border);

      border-radius: 8px;

      background: rgba(15, 28, 45, 0.86);

      color: var(--rrw-profile-text);

      height: 30px;

      line-height: 1.2;

      padding: 5px 9px;

      box-sizing: border-box;

    }



    #rrw-profile-root .rrw-field--checkbox {

      display: inline-flex;

      align-items: center;

      gap: 6px;

      color: var(--rrw-profile-muted);

      font-size: 0.82rem;

      margin: 0;

      white-space: nowrap;

    }



    #rrw-profile-root .rrw-field--checkbox input[type="checkbox"] {

      margin: 0;

      width: 14px;

      height: 14px;

    }



    #rrw-profile-root .rrw-profile-search .rrw-field--checkbox {

      justify-self: start;

    }



    #rrw-profile-root .rrw-tabs {

      display: flex;

      gap: 8px;

      border-bottom: 0;

      padding-bottom: 0;

      margin-bottom: 2px;

    }



    #rrw-profile-root .rrw-tab-btn {

      border: 1px solid var(--rrw-profile-border);

      border-radius: 8px;

      background: rgba(24, 42, 68, 0.9);

      color: #bed5ff;

      padding: 6px 10px;

      font-size: 0.82rem;

      line-height: 1;

      text-transform: lowercase;

      cursor: pointer;

    }



    #rrw-profile-root .rrw-tab-btn:hover {

      border-color: rgba(131, 176, 255, 0.8);

      background: rgba(35, 62, 98, 0.95);

    }



    #rrw-profile-root .rrw-tab-btn--active {

      border-color: rgba(131, 176, 255, 0.9);

      background: rgba(44, 73, 112, 0.95);

      color: #ffffff;

    }



    #rrw-profile-root .rrw-btn {

      appearance: none;

      -webkit-appearance: none;

      border: 1px solid rgba(98, 133, 192, 0.55);

      background: rgba(28, 49, 78, 0.92);

      color: #eef4ff;

      border-radius: 8px;

      padding: 0 11px;

      min-height: 30px;

      line-height: 1;

      font-size: 0.82rem;

      font-weight: 600;

      cursor: pointer;

    }



    #rrw-profile-root .rrw-btn:hover {

      border-color: rgba(131, 176, 255, 0.8);

      background: rgba(35, 62, 98, 0.95);

    }



    #rrw-profile-root .rrw-btn:disabled {

      opacity: 0.52;

      cursor: not-allowed;

    }



    #rrw-profile-root .rrw-close {

      border: 1px solid rgba(98, 133, 192, 0.55);

      background: rgba(28, 49, 78, 0.92);

      color: #eef4ff;

      border-radius: 8px;

    }



    #rrw-profile-root .rrw-close:hover {

      border-color: rgba(131, 176, 255, 0.8);

      background: rgba(35, 62, 98, 0.95);

    }



    #rrw-profile-root .rrw-profile-items {

      display: grid;

      gap: 8px;

      max-height: 62vh;

      overflow: auto;

      padding-right: 2px;

    }



    #rrw-profile-root .rrw-profile-item {

      border: 1px solid var(--rrw-profile-border);

      border-radius: 10px;

      background: var(--rrw-profile-surface-strong);

      padding: 9px 10px;

      display: grid;

      gap: 6px;

    }



    #rrw-profile-root .rrw-profile-item-header {

      display: inline-flex;

      align-items: center;

      gap: 8px;

      flex-wrap: wrap;

      font-size: 0.77rem;

      color: var(--rrw-profile-muted);

      text-transform: uppercase;

      letter-spacing: 0.03em;

    }



    #rrw-profile-root .rrw-profile-item-mod {

      border: 1px solid rgba(131, 176, 255, 0.62);

      border-radius: 999px;

      background: rgba(31, 65, 114, 0.92);

      color: #cfe2ff;

      padding: 1px 7px;

      font-size: 0.7rem;

      font-weight: 600;

    }



    #rrw-profile-root .rrw-profile-item-title {

      margin: 0;

      font-size: 0.95rem;

      line-height: 1.3;

      color: var(--rrw-profile-text);

      word-break: break-word;

    }



    #rrw-profile-root .rrw-profile-item-body {

      margin: 0;

      font-size: 0.84rem;

      color: var(--rrw-profile-text);

      line-height: 1.35;

      white-space: normal;

      word-break: break-word;

    }



    #rrw-profile-root .rrw-profile-item-body > *:first-child {

      margin-top: 0;

    }



    #rrw-profile-root .rrw-profile-item-body > *:last-child {

      margin-bottom: 0;

    }



    #rrw-profile-root .rrw-profile-item-body p {

      margin: 0 0 0.45em;

    }



    #rrw-profile-root .rrw-profile-item-body .md {

      margin: 0;

      color: var(--rrw-profile-text) !important;

    }



    #rrw-profile-root .rrw-profile-item-body .md > *:first-child {

      margin-top: 0;

    }



    #rrw-profile-root .rrw-profile-item-body .md > *:last-child {

      margin-bottom: 0;

    }



    #rrw-profile-root .rrw-profile-item-body h1,

    #rrw-profile-root .rrw-profile-item-body h2,

    #rrw-profile-root .rrw-profile-item-body h3,

    #rrw-profile-root .rrw-profile-item-body h4,

    #rrw-profile-root .rrw-profile-item-body h5,

    #rrw-profile-root .rrw-profile-item-body h6 {

      margin: 0 0 0.42em;

      line-height: 1.28;

      color: var(--rrw-profile-text);

    }



    #rrw-profile-root .rrw-profile-item-body h1 { font-size: 1.06rem; }

    #rrw-profile-root .rrw-profile-item-body h2 { font-size: 1.01rem; }

    #rrw-profile-root .rrw-profile-item-body h3 { font-size: 0.96rem; }

    #rrw-profile-root .rrw-profile-item-body h4,

    #rrw-profile-root .rrw-profile-item-body h5,

    #rrw-profile-root .rrw-profile-item-body h6 { font-size: 0.9rem; }



    #rrw-profile-root .rrw-profile-item-body a {

      color: var(--rrw-profile-link);

      text-decoration: underline;

    }



    #rrw-profile-root .rrw-profile-item-body .md p,

    #rrw-profile-root .rrw-profile-item-body .md li,

    #rrw-profile-root .rrw-profile-item-body .md td,

    #rrw-profile-root .rrw-profile-item-body .md th,

    #rrw-profile-root .rrw-profile-item-body .md h1,

    #rrw-profile-root .rrw-profile-item-body .md h2,

    #rrw-profile-root .rrw-profile-item-body .md h3,

    #rrw-profile-root .rrw-profile-item-body .md h4,

    #rrw-profile-root .rrw-profile-item-body .md h5,

    #rrw-profile-root .rrw-profile-item-body .md h6,

    #rrw-profile-root .rrw-profile-item-body .md strong,

    #rrw-profile-root .rrw-profile-item-body .md em,

    #rrw-profile-root .rrw-profile-item-body .md code {

      color: var(--rrw-profile-text) !important;

    }



    #rrw-profile-root .rrw-profile-item-body .md a {

      color: var(--rrw-profile-link) !important;

    }



    #rrw-profile-root .rrw-profile-item-body ul,

    #rrw-profile-root .rrw-profile-item-body ol {

      margin: 0 0 0.45em;

      padding-left: 18px;

    }



    #rrw-profile-root .rrw-profile-item-body blockquote {

      margin: 0 0 0.45em;

      border-left: 3px solid var(--rrw-profile-border);

      padding-left: 9px;

      color: var(--rrw-profile-muted);

    }



    #rrw-profile-root .rrw-profile-item-body code {

      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

      font-size: 0.78rem;

      border: 1px solid var(--rrw-profile-border);

      background: var(--rrw-profile-surface);

      border-radius: 4px;

      padding: 1px 4px;

    }



    #rrw-profile-root .rrw-profile-item-body .rrw-profile-codeblock {

      margin: 0 0 0.45em;

      border: 1px solid var(--rrw-profile-border);

      background: rgba(14, 24, 39, 0.95);

      border-radius: 8px;

      padding: 8px;

      overflow: auto;

      white-space: pre;

    }



    #rrw-profile-root .rrw-profile-item-body .rrw-profile-codeblock code {

      border: 0;

      background: transparent;

      padding: 0;

      border-radius: 0;

      font-size: 0.76rem;

      line-height: 1.35;

      display: block;

    }



    #rrw-profile-root .rrw-profile-item-body table {

      width: 100%;

      border-collapse: collapse;

      margin: 0 0 0.45em;

      font-size: 0.8rem;

    }



    #rrw-profile-root .rrw-profile-item-body th,

    #rrw-profile-root .rrw-profile-item-body td {

      border: 1px solid var(--rrw-profile-border);

      padding: 4px 6px;

      text-align: left;

      vertical-align: top;

    }



    #rrw-profile-root .rrw-profile-item-footer {

      display: flex;

      align-items: center;

      justify-content: space-between;

      gap: 8px;

      flex-wrap: wrap;

      font-size: 0.75rem;

      color: var(--rrw-profile-muted);

    }



    #rrw-profile-root .rrw-profile-empty {

      border: 1px dashed var(--rrw-profile-border);

      border-radius: 10px;

      padding: 16px;

      text-align: center;

      color: var(--rrw-profile-muted);

      font-size: 0.84rem;

      background: var(--rrw-profile-surface-strong);

    }



    @media (max-width: 900px) {

      #rrw-profile-root .rrw-profile-modal {

        width: calc(100vw - 16px);

        max-height: calc(100vh - 16px);

      }



      #rrw-profile-root .rrw-profile-layout {

        grid-template-columns: minmax(0, 1fr);

      }



      #rrw-profile-root .rrw-profile-toolbar {

        grid-template-columns: minmax(0, 1fr);

      }



      #rrw-profile-root .rrw-profile-search {

        grid-template-columns: minmax(0, 1fr);

      }

    }



    #rrw-inline-history-root .rrw-inline-history-popup {

      width: min(760px, calc(100vw - 20px));

      max-height: min(78vh, 560px);

      overflow: hidden;

      border: 1px solid rgba(98, 133, 192, 0.58);

      border-radius: 10px;

      background: rgba(12, 20, 34, 0.98);

      color: #e7f0ff;

      font-family: "Segoe UI Variable Text", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;

      text-rendering: optimizeLegibility;

      -webkit-font-smoothing: antialiased;

      -moz-osx-font-smoothing: grayscale;

      box-shadow: 0 14px 36px rgba(0, 0, 0, 0.42);

      display: grid;

      grid-template-rows: auto minmax(0, 1fr);

    }



    #rrw-inline-history-root .rrw-inline-history-header {

      display: flex;

      align-items: center;

      justify-content: space-between;

      gap: 10px;

      padding: 10px 12px;

      border-bottom: 1px solid rgba(98, 133, 192, 0.4);

      background: rgba(21, 38, 62, 0.9);

    }



    #rrw-inline-history-root .rrw-inline-history-header h4 {

      margin: 0;

      font-size: 0.95rem;

      line-height: 1.2;

      color: #dbe8ff;

    }



    #rrw-inline-history-root .rrw-inline-history-body {

      display: grid;

      gap: 10px;

      padding: 10px 12px 12px;

      overflow-y: auto;

    }



    #rrw-inline-history-root .rrw-inline-history-summary {

      display: grid;

      gap: 4px;

      padding: 8px;

      border: 1px solid rgba(98, 133, 192, 0.36);

      border-radius: 8px;

      background: rgba(21, 38, 62, 0.62);

      color: #dce9ff;

      font-size: 0.9rem;

    }



    #rrw-inline-history-root .rrw-inline-history-summary a {

      color: #9bc2ff;

      text-decoration: none;

    }



    #rrw-inline-history-root .rrw-inline-history-summary a:hover {

      text-decoration: underline;

    }



    #rrw-inline-history-root .rrw-inline-history-disclaimer {

      margin: 0;

      font-size: 0.84rem;

      line-height: 1.35;

      color: #9eb6df;

    }



    #rrw-inline-history-root .rrw-inline-history-available {

      margin: 0;

      font-size: 0.86rem;

      line-height: 1.4;

      color: #dce9ff;

    }



    #rrw-inline-history-root .rrw-inline-history-grid {

      display: grid;

      grid-template-columns: repeat(2, minmax(0, 1fr));

      gap: 10px;

    }



    #rrw-inline-history-root .rrw-inline-history-panel {

      border: 1px solid rgba(98, 133, 192, 0.36);

      border-radius: 8px;

      background: rgba(21, 38, 62, 0.62);

      overflow: hidden;

    }



    #rrw-inline-history-root .rrw-inline-history-panel h5 {

      margin: 0;

      padding: 8px 10px;

      font-size: 0.82rem;

      line-height: 1.2;

      text-transform: uppercase;

      letter-spacing: 0.03em;

      color: #b7cef1;

      border-bottom: 1px solid rgba(98, 133, 192, 0.32);

      background: rgba(19, 35, 58, 0.74);

    }



    #rrw-inline-history-root .rrw-inline-history-panel table {

      width: 100%;

      border-collapse: collapse;

      table-layout: fixed;

      font-size: 0.81rem;

      color: #dce9ff;

    }



    #rrw-inline-history-root .rrw-inline-history-panel th,

    #rrw-inline-history-root .rrw-inline-history-panel td {

      padding: 6px 8px;

      border-bottom: 1px solid rgba(98, 133, 192, 0.2);

      text-align: left;

      vertical-align: top;

      white-space: nowrap;

      overflow: hidden;

      text-overflow: ellipsis;

    }



    #rrw-inline-history-root .rrw-inline-history-panel th {

      font-size: 0.74rem;

      text-transform: uppercase;

      letter-spacing: 0.03em;

      color: #9eb6df;

      background: rgba(18, 32, 53, 0.8);

    }



    #rrw-inline-history-root .rrw-inline-history-panel td a {

      color: #9bc2ff;

      text-decoration: none;

    }



    #rrw-inline-history-root .rrw-inline-history-panel td a:hover {

      text-decoration: underline;

    }



    #rrw-inline-history-root .rrw-inline-history-row--warning {

      background: rgba(168, 118, 21, 0.18);

    }



    #rrw-inline-history-root .rrw-inline-history-row--danger {

      background: rgba(147, 44, 58, 0.2);

    }



    #rrw-inline-history-root .rrw-inline-history-row--current {

      box-shadow: inset 2px 0 0 rgba(121, 169, 239, 0.95);

    }



    #rrw-inline-history-root .rrw-inline-history-empty-cell {

      color: #9eb6df;

      font-style: italic;

    }



    @media (max-width: 860px) {

      #rrw-inline-history-root .rrw-inline-history-grid {

        grid-template-columns: minmax(0, 1fr);

      }



      #rrw-profile-root .rrw-profile-layout {

        grid-template-columns: minmax(0, 1fr);

      }

    }



    /* Queue Tools Toolbar Styling */

    .rrw-queue-tools {

      position: sticky;

      top: 10px;

      z-index: 2147482998;

      margin: 8px 14px;

      padding: 7px 8px;

      border: 1px solid rgba(98, 133, 192, 0.55);

      border-radius: 8px;

      background: rgba(12, 20, 34, 0.95);

      color: #d9e9ff;

      font-family: var(--rrw-font-family);

      box-shadow: 0 8px 18px rgba(3, 8, 16, 0.32);

    }



    .rrw-queue-tools-row {

      display: flex;

      align-items: center;

      gap: 6px;

      flex-wrap: wrap;

      margin-bottom: 5px;

    }



    .rrw-queue-tools-row:last-child {

      margin-bottom: 0;

    }



    .rrw-queue-tools-meta {

      color: #9eb6df;

      font-size: 0.72rem;

      line-height: 1.2;

    }



    .rrw-queue-tools-controls button,

    .rrw-queue-tools-controls select,

    .rrw-queue-tools-controls input {

      appearance: none;

      -webkit-appearance: none;

      text-transform: none !important;

      letter-spacing: normal !important;

      text-shadow: none !important;

      font-weight: 600;

      line-height: 1.1;

      height: 26px;

      box-sizing: border-box;

      font-family: var(--rrw-font-family);

      font-size: 0.72rem;

      border-radius: 5px;

      border: 1px solid rgba(98, 133, 192, 0.55);

      background: rgba(22, 39, 62, 0.94);

      color: #e7f1ff;

      padding: 2px 7px;

    }



    .rrw-queue-tools-controls button {

      display: inline-flex;

      align-items: center;

      justify-content: center;

      cursor: pointer;

    }



    .rrw-queue-tools-controls input {

      min-width: 170px;

    }



    .rrw-queue-tools-controls button:disabled,

    .rrw-queue-tools-controls select:disabled,

    .rrw-queue-tools-controls input:disabled {

      opacity: 0.5;

      cursor: not-allowed;

    }



    .rrw-queue-tools-controls label {

      display: inline-flex;

      align-items: center;

      gap: 4px;

      color: #a9c3ee;

      font-size: 0.7rem;

      line-height: 1.1;

    }



    .rrw-queue-tools-empty {

      color: #9eb6df;

      font-size: 0.72rem;

    }



    .rrw-queue-tools-status {

      color: #9cddb1;

      font-size: 0.72rem;

    }



    .rrw-queue-tools-error {

      color: #ffb6bf;

      font-size: 0.72rem;

    }



    .rrw-queue-select {

      display: inline-flex;

      align-items: center;

      gap: 4px;

      margin-left: 6px;

      font-size: 0.72rem;

      color: #9eb6df;

      user-select: none;

    }



    .rrw-queue-select-li {

      display: inline-flex;

      align-items: center;

      list-style: none;

      margin-left: 6px;

    }



    .rrw-queue-select-input {

      width: 14px;

      height: 14px;

      accent-color: #6ea2f7;

    }



    .rrw-queue-filter-hidden {

      display: none !important;

    }



    /* Light theme queue tools */

    html[data-rrw-theme="light"] .rrw-queue-tools {

      border-color: rgba(166, 189, 217, 0.8);

      background: rgba(244, 249, 255, 0.98);

      color: #28415f;

      box-shadow: 0 8px 18px rgba(72, 102, 136, 0.18);

    }



    html[data-rrw-theme="light"] .rrw-queue-tools-meta,

    html[data-rrw-theme="light"] .rrw-queue-tools-empty {

      color: #637f9f;

    }



    html[data-rrw-theme="light"] .rrw-queue-tools-controls button,

    html[data-rrw-theme="light"] .rrw-queue-tools-controls select,

    html[data-rrw-theme="light"] .rrw-queue-tools-controls input {

      border-color: rgba(156, 183, 214, 0.75);

      background: rgba(233, 243, 255, 0.98);

      color: #24466f;

    }



    html[data-rrw-theme="light"] .rrw-queue-tools-controls label {

      color: #607694;

    }



    html[data-rrw-theme="light"] .rrw-queue-tools-status {

      color: #47a85f;

    }



    html[data-rrw-theme="light"] .rrw-queue-tools-error {

      color: #d93f5f;

    }



    /* Queue Modlog Display */

    .rrw-queue-modlog-display {

      display: grid;

      gap: 4px;

      margin-top: 8px;

      padding: 8px;

      border: 1px solid rgba(98, 133, 192, 0.4);

      border-radius: 6px;

      background: rgba(19, 35, 58, 0.8);

      font-size: 0.85rem;

      font-family: "Segoe UI Variable Text", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;

    }



    .rrw-queue-modlog-header {

      font-size: 0.75rem;

      font-weight: 600;

      text-transform: uppercase;

      letter-spacing: 0.02em;

      color: #a3c2fb;

      margin-bottom: 2px;

    }



    .rrw-queue-modlog-entries {

      display: grid;

      gap: 6px;

    }



    .rrw-queue-modlog-entry {

      display: grid;

      gap: 2px;

      padding: 6px 8px;

      border: 1px solid rgba(98, 133, 192, 0.32);

      border-radius: 4px;

      background: rgba(21, 38, 62, 0.95);

      color: #d8e9ff;

      line-height: 1.3;

    }



    .rrw-queue-modlog-action {

      font-weight: 600;

      color: #9bc2ff;

    }



    .rrw-queue-modlog-mod,

    .rrw-queue-modlog-time {

      font-size: 0.8rem;

      color: #b0c4e0;

    }



    .rrw-queue-modlog-details {

      font-size: 0.78rem;

      color: #8fa8c9;

      margin-top: 2px;

    }



    /* Light theme queue modlog display */

    html[data-rrw-theme="light"] .rrw-queue-modlog-display {

      border-color: rgba(156, 183, 214, 0.6);

      background: rgba(245, 250, 255, 0.96);

      color: #224d9b;

    }



    html[data-rrw-theme="light"] .rrw-queue-modlog-header {

      color: #2d5da1;

    }



    html[data-rrw-theme="light"] .rrw-queue-modlog-entry {

      border-color: rgba(156, 183, 214, 0.5);

      background: rgba(233, 243, 255, 0.98);

      color: #1f3a5f;

    }



    html[data-rrw-theme="light"] .rrw-queue-modlog-action {

      color: #1253d6;

    }



    html[data-rrw-theme="light"] .rrw-queue-modlog-mod,

    html[data-rrw-theme="light"] .rrw-queue-modlog-time {

      color: #36579c;

    }



    html[data-rrw-theme="light"] .rrw-queue-modlog-details {

      color: #5a7fa5;

    }



    /* About Page Modal */

    #rrw-about-page-root {

      position: fixed;

      inset: 0;

      z-index: 2147483646;

      display: flex;

      align-items: center;

      justify-content: center;

      pointer-events: auto;

      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif;

    }



    .rrw-about-page-backdrop {

      position: fixed;

      inset: 0;

      background: rgba(0, 0, 0, 0.5);

      backdrop-filter: blur(2px);

      cursor: pointer;

    }



    .rrw-about-page-container {

      position: relative;

      z-index: 1;

      max-width: 580px;

      width: 90%;

      max-height: 85vh;

      overflow-y: auto;

    }



    .rrw-about-page {

      background: var(--rrw-modal-bg, rgba(248, 251, 255, 0.98));

      border: 1px solid var(--rrw-border, rgba(152, 175, 208, 0.68));

      border-radius: 10px;

      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);

      font-family: var(--rrw-font-family);

      color: var(--rrw-text);

      overflow: hidden;

      display: flex;

      flex-direction: column;

    }



    .rrw-about-page-header {

      display: flex;

      align-items: center;

      justify-content: space-between;

      padding: 22px 26px;

      background: linear-gradient(135deg, rgba(36, 94, 184, 0.08), rgba(30, 70, 150, 0.05));

      border-bottom: 1px solid var(--rrw-soft-border, rgba(168, 187, 214, 0.56));

    }



    .rrw-about-page-title {

      margin: 0;

      font-size: 1.28rem;

      font-weight: 700;

      color: var(--rrw-link, #245eb8);

      letter-spacing: -0.01em;

      font-family: var(--rrw-font-family);

    }



    .rrw-about-page-close {

      display: flex;

      align-items: center;

      justify-content: center;

      width: 32px;

      height: 32px;

      padding: 0;

      margin: -4px;

      border: none;

      background: transparent;

      color: var(--rrw-text);

      font-size: 1.4rem;

      font-family: var(--rrw-font-family);

      cursor: pointer;

      border-radius: 4px;

      transition: all 0.2s ease;

      flex-shrink: 0;

    }



    .rrw-about-page-close:hover {

      background: var(--rrw-close-bg, rgba(233, 242, 255, 0.95));

      color: var(--rrw-link, #245eb8);

    }



    .rrw-about-page-body {

      padding: 26px;

      overflow-y: auto;

      flex: 1;

      font-family: var(--rrw-font-family);

    }



    .rrw-about-page-version-section {

      display: grid;

      grid-template-columns: 1fr 1fr;

      gap: 14px;

      margin-bottom: 22px;

    }



    .rrw-about-page-version-card {

      display: flex;

      flex-direction: column;

      gap: 8px;

      padding: 18px;

      background: var(--rrw-card-bg, rgba(245, 250, 255, 0.95));

      border: 1px solid var(--rrw-soft-border, rgba(168, 187, 214, 0.56));

      border-radius: 8px;

      text-align: center;

    }



    .rrw-about-page-version-label {

      font-size: 0.7rem;

      font-weight: 700;

      color: var(--rrw-muted, #5f7797);

      text-transform: uppercase;

      letter-spacing: 0.06em;

      font-family: var(--rrw-font-family);

    }



    .rrw-about-page-version-number {

      font-size: 1.35rem;

      font-weight: 700;

      font-variant-numeric: tabular-nums;

      color: var(--rrw-text);

      font-family: var(--rrw-font-family);

    }



    .rrw-about-page-version-new {

      color: var(--rrw-link, #245eb8);

    }



    .rrw-about-page-status {

      display: flex;

      flex-direction: column;

      gap: 8px;

      margin-bottom: 22px;

      padding: 14px 16px;

      background: var(--rrw-field-bg, rgba(238, 245, 255, 0.92));

      border: 1px solid var(--rrw-soft-border, rgba(168, 187, 214, 0.56));

      border-radius: 8px;

      text-align: center;

      font-family: var(--rrw-font-family);

    }



    .rrw-about-page-update-available {

      font-weight: 700;

      color: var(--rrw-link, #245eb8);

      font-size: 0.9rem;

      letter-spacing: 0.01em;

      font-family: var(--rrw-font-family);

    }



    .rrw-about-page-up-to-date {

      font-weight: 700;

      color: #1a7f3f;

      font-size: 0.9rem;

      letter-spacing: 0.01em;

      font-family: var(--rrw-font-family);

    }



    .rrw-about-page-check-status {

      font-size: 0.8rem;

      min-height: 1.2em;

      display: block;

      color: var(--rrw-text);

      font-family: var(--rrw-font-family);

    }



    .rrw-about-page-check-status--error {

      color: #8a2f3f;

    }



    .rrw-about-page-changelog {

      margin-bottom: 20px;

    }



    .rrw-about-page-changelog-title {

      margin: 0 0 10px 0;

      font-size: 0.85rem;

      font-weight: 700;

      color: var(--rrw-text);

      text-transform: uppercase;

      letter-spacing: 0.04em;

      font-family: var(--rrw-font-family);

    }



    .rrw-about-page-changelog-text {

      margin: 0;

      padding: 16px;

      background: var(--rrw-field-bg, rgba(238, 245, 255, 0.92));

      border: 1px solid var(--rrw-soft-border, rgba(168, 187, 214, 0.56));

      border-radius: 6px;

      font-size: 0.8rem;

      line-height: 1.6;

      color: var(--rrw-text);

      font-family: var(--rrw-font-family);

      white-space: pre-wrap;

      word-break: break-word;

      max-height: 280px;

      overflow-y: auto;

    }



    .rrw-about-page-footer {

      display: flex;

      gap: 12px;

      padding: 20px 26px;

      background: var(--rrw-footer-bg-top, rgba(245, 250, 255, 0.98));

      border-top: 1px solid var(--rrw-soft-border, rgba(168, 187, 214, 0.56));

      justify-content: flex-end;

    }



    .rrw-about-page-check-btn,

    .rrw-about-page-close-btn {

      padding: 10px 18px;

      border: 1px solid #355a91;

      border-radius: 5px;

      font-size: 0.8rem;

      font-weight: 700;

      cursor: pointer;

      transition: all 0.2s ease;

      white-space: nowrap;

      background: var(--rrw-card-bg, rgba(245, 250, 255, 0.95));

      color: var(--rrw-text);

      font-family: var(--rrw-font-family);

      letter-spacing: 0.01em;

    }



    .rrw-about-page-check-btn {

      background: linear-gradient(180deg, #245eb8 0%, #1f4a94 100%);

      color: #fff;

      border-color: #1f4a94;

    }



    .rrw-about-page-check-btn:hover:not(:disabled) {

      background: linear-gradient(180deg, #2d70d1 0%, #2457ab 100%);

      border-color: #1f4a94;

      box-shadow: 0 4px 12px rgba(36, 94, 184, 0.25);

    }



    .rrw-about-page-check-btn:active:not(:disabled) {

      transform: translateY(1px);

      box-shadow: 0 2px 6px rgba(36, 94, 184, 0.15);

    }



    .rrw-about-page-check-btn:disabled {

      opacity: 0.6;

      cursor: not-allowed;

    }



    .rrw-about-page-close-btn {

      background: var(--rrw-card-bg, rgba(245, 250, 255, 0.95));

      color: var(--rrw-text);

      border-color: var(--rrw-soft-border, rgba(168, 187, 214, 0.56));

    }



    .rrw-about-page-close-btn:hover {

      background: var(--rrw-field-bg, rgba(238, 245, 255, 0.92));

      border-color: var(--rrw-link, #245eb8);

      color: var(--rrw-link, #245eb8);

    }

  `;

  document.documentElement.appendChild(style);

}

// ------------------------------------------------------------------------------
// core-ui.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Core UI Initialization Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Provides core initialization functions needed by main.js.

// Dependencies: constants.js, state.js, utilities.js



// â”€â”€â”€â”€ Site Detection â”€â”€â”€â”€



function markRrwSiteHost() {

  const host = String(window.location.hostname || "").toLowerCase();

  const site = host === "old.reddit.com" ? "old" : host === "sh.reddit.com" ? "sh" : "www";

  document.documentElement.setAttribute("data-rrw-site", site);

}



// â”€â”€â”€â”€ Page Target Detection â”€â”€â”€â”€



function parsePostIdFromPath(pathname) {

  const match = String(pathname || "").match(/\/r\/[^/]+\/comments\/([a-z0-9]{6})/i);

  return match ? match[1] : null;

}



function refreshPageTargetHints() {

  const postId = parsePostIdFromPath(window.location.pathname);

  if (postId) {

    lastInteractedTarget = `t3_${postId}`;

    lastInteractedAt = Date.now();

  }

}



// â”€â”€â”€â”€ Helper Utilities â”€â”€â”€â”€



function findClosestActionContainer(element) {

  if (!(element instanceof HTMLElement)) {

    return null;

  }

  // Try to find shreddit-post first, then shreddit-comment

  let closest = element.closest("shreddit-post");

  if (closest) return closest;

  

  closest = element.closest("shreddit-comment");

  if (closest) return closest;

  

  return element.closest("article, .thing.link, .thing.comment, [data-testid='post-container']");

}



function pickTargetForContainer(container) {

  if (!(container instanceof HTMLElement)) {

    return null;

  }



  const isPost = 

    container.tagName === "SHREDDIT-POST" || 

    container.classList.contains("link") ||

    container.getAttribute("data-testid") === "post-container";

  

  const isComment = 

    container.tagName === "SHREDDIT-COMMENT" ||

    container.classList.contains("comment");



  // **PRIORITY 1**: Use the element's own attributes as-is if they look valid

  const directId = container.getAttribute("id");

  if (directId && directId.includes("_") && (directId.startsWith("t1_") || directId.startsWith("t3_"))) {

    return directId;

  }



  const dataFullname = container.getAttribute("data-fullname");

  if (dataFullname && dataFullname.includes("_") && (dataFullname.startsWith("t1_") || dataFullname.startsWith("t3_"))) {

    return dataFullname;

  }



  // **PRIORITY 2**: Check other direct attributes

  const otherDirectAttrs = [

    container.getAttribute("data-post-id"),

    container.getAttribute("data-id"),

    container.getAttribute("data-thing-id")

  ];



  for (const attr of otherDirectAttrs) {

    if (attr && attr.includes("_") && (attr.startsWith("t1_") || attr.startsWith("t3_"))) {

      return attr;

    }

  }



  // **PRIORITY 3**: Extract from links (fallback only)

  const extractPostIdFromUrl = (url) => {

    if (!url) return null;

    const match = url.match(/\/comments\/([a-z0-9]{5,10})/i);

    return match ? match[1] : null;

  };



  const permalinkSelectors = [

    "a[data-testid='post_title']",

    "a[data-click-id='body']",

    "a[href*='/comments/']",

    "[slot='title'] a",

    ".post-title a",

    "h3 a, h2 a"

  ];



  for (const selector of permalinkSelectors) {

    const permalinkEl = container.querySelector(selector);

    if (permalinkEl instanceof HTMLElement) {

      const href = permalinkEl.getAttribute("href") || "";

      const postId = extractPostIdFromUrl(href);

      if (postId) {

        const result = isComment ? `t1_${postId}` : `t3_${postId}`;

        return result;

      }

    }

  }



  const anyLink = container.querySelector("a[href*='/comments/']");

  if (anyLink instanceof HTMLElement) {

    const href = anyLink.getAttribute("href") || "";

    const postId = extractPostIdFromUrl(href);

    if (postId) {

      const result = isComment ? `t1_${postId}` : `t3_${postId}`;

      return result;

    }

  }



  return null;

}



function resolveContainerSubreddit(container) {

  if (!(container instanceof HTMLElement)) {

    return null;

  }

  const subredditAttr = container.getAttribute("data-subreddit");

  if (subredditAttr) {

    return subredditAttr;

  }

  const subredditLink = container.querySelector("a[href*='/r/'], [data-testid*='subreddit']");

  if (subredditLink instanceof HTMLElement) {

    const href = subredditLink.getAttribute("href") || "";

    const match = href.match(/\/r\/([a-zA-Z0-9_-]+)/);

    if (match) {

      return match[1];

    }

  }

  return null;

}



function resolveTargetFromNativeControl(control) {

  if (!(control instanceof HTMLElement)) {

    return null;

  }

  const stored = control.getAttribute("data-rrw-target");

  if (stored) {

    return stored;

  }

  const container = control.closest("shreddit-post, shreddit-comment, article, .thing.link, .thing.comment, [data-testid='post-container']");

  if (container instanceof HTMLElement) {

    return pickTargetForContainer(container);

  }

  return null;

}



function isAllowedLaunchSubreddit(subreddit) {

  if (!subreddit) {

    return false;

  }

  const clean = normalizeSubreddit(subreddit);

  if (!clean) {

    return false;

  }

  // If the subreddit list hasn't loaded yet, don't allow access (fail closed)

  if (!allowedLaunchSubredditsLoaded) {

    return false;

  }

  // Check if the subreddit is in the moderated list

  if (allowedLaunchSubreddits instanceof Set) {

    return allowedLaunchSubreddits.has(clean.toLowerCase());

  }

  // If something went wrong loading the list, fail closed

  return false;

}



// â”€â”€â”€â”€ Native Remove Control Detection â”€â”€â”€â”€



function isNativeRemoveControl(control) {

  if (!(control instanceof HTMLElement)) {

    return false;

  }



  if (control.closest(`#${OVERLAY_ROOT_ID}`)) {

    return false;

  }



  if (control.classList.contains(BUTTON_CLASS) || control.closest(`.${BUTTON_CLASS}`)) {

    return false;

  }



  const tag = String(control.tagName || "").toLowerCase();

  if (tag !== "button" && tag !== "a") {

    return false;

  }



  const textContent = (control.textContent || "").trim().toLowerCase();

  const ariaLabel = (control.getAttribute("aria-label") || "").toLowerCase();

  const title = (control.getAttribute("title") || "").toLowerCase();

  const combined = `${textContent} ${ariaLabel} ${title}`;



  return combined.includes("remove") && !combined.includes("remove reason");

}



// â”€â”€â”€â”€ Native Remove Interceptor â”€â”€â”€â”€



function bindNativeRemoveInterceptor() {

  if (nativeRemoveInterceptorBound) {

    return;

  }

  nativeRemoveInterceptorBound = true;



  document.addEventListener(

    "pointerdown",

    (event) => {

      const targetEl = event.target instanceof Element ? event.target : null;

      if (!targetEl) {

        return;

      }



      const container = findClosestActionContainer(targetEl);

      if (container) {

        const resolved = pickTargetForContainer(container);

        if (resolved) {

          lastInteractedTarget = resolved;

          lastInteractedAt = Date.now();

          return;

        }

      }



      let closestPost = targetEl.closest("shreddit-post");

      if (!closestPost) closestPost = targetEl.closest("shreddit-comment");

      if (!closestPost) closestPost = targetEl.closest("article, .thing.link, .thing.comment, [data-testid='post-container']");

      if (closestPost instanceof HTMLElement) {

        const resolved = pickTargetForContainer(closestPost);

        if (resolved) {

          lastInteractedTarget = resolved;

          lastInteractedAt = Date.now();

          return;

        }

      }



      const closestModButton = targetEl.closest("[data-testid*='menu'], [data-testid*='action'], button[aria-label*='more'], [role='button'][aria-label*='more']");

      if (closestModButton instanceof HTMLElement) {

      let closestPostFromButton = closestModButton.closest("shreddit-post");

      if (!closestPostFromButton) closestPostFromButton = closestModButton.closest("shreddit-comment");

      if (!closestPostFromButton) closestPostFromButton = closestModButton.closest("article, .thing.link, .thing.comment, [data-testid='post-container']");

        if (closestPostFromButton instanceof HTMLElement) {

          const resolved = pickTargetForContainer(closestPostFromButton);

          if (resolved) {

            lastInteractedTarget = resolved;

            lastInteractedAt = Date.now();

          }

        }

      }

    },

    true

  );



  document.addEventListener(

    "click",

    (event) => {

      const targetEl = event.target instanceof Element ? event.target : null;

      if (!targetEl) {

        return;

      }



      if (targetEl.closest(`#${OVERLAY_ROOT_ID}, #${PROFILE_ROOT_ID}, #${CONTEXT_POPUP_ROOT_ID}, #${INLINE_MODLOG_ROOT_ID}`)) {

        return;

      }



      if (!interceptNativeRemoveEnabled) {

        return;

      }



      const control = targetEl.closest("button, a, [role='menuitem'], [role='button']");

      if (!(control instanceof HTMLElement)) {

        return;

      }



      if (control.classList.contains("rrw-comment-nuke-btn")) {

        return;

      }



      const textContent = (control.textContent || "").trim().toLowerCase();

      const ariaLabel = (control.getAttribute("aria-label") || "").toLowerCase();

      const title = (control.getAttribute("title") || "").toLowerCase();

      const combined = `${textContent} ${ariaLabel} ${title}`;



      const isRemoveAction = combined.includes("remove") && !combined.includes("remove reason");

      if (!isRemoveAction) {

        return;

      }



      const actionContainer = findClosestActionContainer(control);

      const actionSubreddit = resolveContainerSubreddit(actionContainer);

      if (!isAllowedLaunchSubreddit(actionSubreddit)) {

        return;

      }



      const target = resolveTargetFromNativeControl(control);

      if (!target) {

        return;

      }



      event.preventDefault();

      event.stopPropagation();

      if (typeof event.stopImmediatePropagation === "function") {

        event.stopImmediatePropagation();

      }



      setTimeout(() => {

        void openOverlay(target);

      }, 0);

    },

    true

  );



  // Handle native approve button clicks to apply green border

  document.addEventListener(

    "click",

    (event) => {

      const targetEl = event.target instanceof Element ? event.target : null;

      if (!targetEl) {

        return;

      }



      if (targetEl.closest(`#${OVERLAY_ROOT_ID}, #${PROFILE_ROOT_ID}, #${CONTEXT_POPUP_ROOT_ID}, #${INLINE_MODLOG_ROOT_ID}`)) {

        return;

      }



      const control = targetEl.closest("button, a, [role='menuitem'], [role='button']");

      if (!(control instanceof HTMLElement)) {

        return;

      }



      const textContent = (control.textContent || "").trim().toLowerCase();

      const ariaLabel = (control.getAttribute("aria-label") || "").toLowerCase();

      const title = (control.getAttribute("title") || "").toLowerCase();

      const combined = `${textContent} ${ariaLabel} ${title}`;



      const isApproveAction = combined.includes("approve");

      if (!isApproveAction) {

        return;

      }



      const actionContainer = findClosestActionContainer(control);

      const target = resolveTargetFromNativeControl(control);

      if (target) {

        // Apply green border immediately when approve is clicked

        setTimeout(() => {

          applyActionBorderToElement(target, "approve");

        }, 50);

      }

    },

    true

  );

}



function tagNativeRemoveControls(container, target) {

  if (!(container instanceof HTMLElement) || !target) {

    return;

  }



  const selectors = [

    "button[data-testid*='remove' i]",

    "a[data-testid*='remove' i]",

    "[data-event-action='remove']",

    ".remove-button a",

    "button[aria-label*='remove' i]",

    "a[aria-label*='remove' i]",

    "button[title*='remove' i]",

    "a[title*='remove' i]",

    "[role='menuitem'][aria-label*='remove' i]",

  ];



  container.querySelectorAll(selectors.join(",")).forEach((node) => {

    if (!(node instanceof HTMLElement)) {

      return;

    }

    if (node.classList.contains("rrw-comment-nuke-btn")) {

      return;

    }

    node.dataset.rrwTarget = target;

  });

}



// â”€â”€â”€â”€ Preference Loading Stubs â”€â”€â”€â”€

// These are called by main.js but are defined in other feature modules.

// Stub versions provided to prevent errors; real implementations are in respective modules.



async function loadNativeInterceptPreference() {

  try {

    const stored = await ext.storage.sync.get([INTERCEPT_NATIVE_REMOVE_KEY]);

    interceptNativeRemoveEnabled = typeof stored?.[INTERCEPT_NATIVE_REMOVE_KEY] === "boolean"

      ? stored[INTERCEPT_NATIVE_REMOVE_KEY]

      : true;

  } catch {

    interceptNativeRemoveEnabled = true;

  }

}

// ------------------------------------------------------------------------------
// removal-config.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Removal Config Editor Module - COMPREHENSIVE IMPLEMENTATION

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Full removal reason configuration editor with wiki I/O, quick actions, playbooks.

// Dependencies: constants.js, state.js, utilities.js, services/reddit-api.js, 

//               services/wiki-loader.js, features/overlay.js, features/usernotes.js



// â”€â”€â”€â”€ Normalization & Utility Functions â”€â”€â”€â”€



function normalizeRemovalSendMode(value, fallback = "reply") {

  const lowered = String(value || fallback).trim().toLowerCase();

  if (["reply", "pm", "both", "none"].includes(lowered)) {

    return lowered;

  }

  if (["comment"].includes(lowered)) {

    return "reply";

  }

  if (["message", "modmail"].includes(lowered)) {

    return "pm";

  }

  if (["all"].includes(lowered)) {

    return "both";

  }

  if (["silent"].includes(lowered)) {

    return "none";

  }

  return fallback;

}



function normalizeRemovalAppliesTo(value, fallback = "both") {

  const lowered = String(value || fallback).trim().toLowerCase();

  if (["posts", "comments", "both"].includes(lowered)) {

    return lowered;

  }

  if (lowered === "post" || lowered === "submission") {

    return "posts";

  }

  if (lowered === "comment") {

    return "comments";

  }

  return fallback;

}



function normalizeRemovalBoolean(value, fallback = false) {

  if (typeof value === "boolean") {

    return value;

  }

  if (typeof value === "number") {

    return value !== 0;

  }

  const lowered = String(value || "").trim().toLowerCase();

  if (["true", "1", "yes", "on"].includes(lowered)) {

    return true;

  }

  if (["false", "0", "no", "off"].includes(lowered)) {

    return false;

  }

  return fallback;

}



function extractRemovalAttr(raw, name) {

  const regex = new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i");

  const match = String(raw || "").match(regex);

  return match?.[1]?.trim() ?? null;

}



function humanizeRemovalKey(key) {

  return String(key || "")

    .replace(/[_-]+/g, " ")

    .replace(/\b\w/g, (char) => char.toUpperCase());

}



function normalizeRemovalBlockPayload(type, payload) {

  const source = payload && typeof payload === "object" ? payload : {};

  if (type === "markdown") {

    return { content: String(source.content ?? "") };

  }

  if (type === "select") {

    const options = Array.isArray(source.options)

      ? source.options.map((option) => String(option ?? "")).filter((option) => option.trim())

      : [];

    return { options };

  }

  return { placeholder: String(source.placeholder ?? "") };

}



function normalizeRemovalReasonBlock(block, index) {

  const rawType = String(block?.type || block?.block_type || "markdown").trim().toLowerCase();

  const type = ["markdown", "select", "input", "textarea"].includes(rawType) ? rawType : "markdown";

  return {

    id: Number.isFinite(Number(block?.id)) ? Number(block.id) : undefined,

    type,

    key: type === "markdown" ? null : (String(block?.key ?? block?.block_key ?? "").trim() || null),

    label: type === "markdown" ? null : (String(block?.label ?? "").trim() || null),

    required: normalizeRemovalBoolean(block?.required ?? block?.is_required, false),

    remember_last_value: normalizeRemovalBoolean(block?.remember_last_value, false),

    position: Number.isFinite(Number(block?.position)) ? Number(block.position) : (index + 1) * 10,

    payload: normalizeRemovalBlockPayload(type, block?.payload ?? block?.payload_json),

    help_text: String(block?.help_text ?? "").trim() || null,

  };

}



// â”€â”€â”€â”€ State Management Functions â”€â”€â”€â”€



function cloneRemovalConfig(config, subreddit) {

  return normalizeRemovalConfigDoc(serializeRemovalConfigForWiki(config, subreddit), subreddit);

}



function nextRemovalReasonKey(existingKeys, title) {

  const currentKeys = Array.isArray(existingKeys) ? existingKeys.map((key) => String(key || "")) : [];

  const base = slugifyReasonKey(title, "new-reason");

  if (!currentKeys.includes(base)) {

    return base;

  }

  let counter = 2;

  while (currentKeys.includes(`${base}-${counter}`)) {

    counter += 1;

  }

  return `${base}-${counter}`;

}



function formatRemovalFlairTemplateLabel(template) {

  const base = String(template?.text || template?.css_class || template?.id || "Untitled flair").trim();

  if (template?.mod_only) {

    return `${base} [mod]`;

  }

  return base;

}



function closeRemovalConfigEditor() {

  removalConfigEditorState = null;

  const root = document.getElementById(OVERLAY_ROOT_ID);

  if (!root) {

    return;

  }

  root.querySelectorAll(".rrw-removal-config-backdrop, .rrw-removal-config-modal").forEach((element) => element.remove());

  if (!overlayState && !usernotesEditorState && !root.children.length) {

    root.remove();

  }

}



function syncOverlayRemovalConfig(config) {

  const cleanSubreddit = normalizeSubreddit(config?.subreddit || "");

  if (!overlayState || !cleanSubreddit) {

    return;

  }



  const overlaySubreddit = normalizeSubreddit(overlayState?.resolved?.subreddit || "");

  if (!overlaySubreddit || overlaySubreddit.toLowerCase() !== cleanSubreddit.toLowerCase()) {

    return;

  }



  const nextConfig = normalizeRemovalConfigDoc(config, cleanSubreddit);

  overlayState.removalConfig = nextConfig;

  overlayState.reasons = Array.isArray(nextConfig.reasons) ? nextConfig.reasons : [];

  const availableKeys = new Set(overlayState.reasons.map((reason) => reason.external_key));

  overlayState.selectedReasonKeys = (overlayState.selectedReasonKeys || []).filter((key) => availableKeys.has(key));

  if (!overlayState.previewLoading) {

    schedulePreview();

  }

  renderOverlay();

}



function updateRemovalConfigEditor(updater) {

  if (!removalConfigEditorState) {

    return;

  }

  // Sync all in-progress [data-reason-field] input values into state before cloning

  const modal = document.querySelector('.rrw-removal-config-modal');

  if (modal) {

    modal.querySelectorAll('[data-reason-field]').forEach((element) => {

      const index = Number.parseInt(element.getAttribute('data-reason-index') || '', 10);

      const field = String(element.getAttribute('data-reason-field') || '');

      if (!Number.isFinite(index) || !field) return;

      const reason = removalConfigEditorState.config?.reasons?.[index];

      if (!reason) return;

      if (["is_enabled", "sticky_comment", "lock_post"].includes(field)) {

        reason[field] = Boolean(element.checked);

        return;

      }

      if (field === "applies_to") {

        reason.applies_to = normalizeRemovalAppliesTo(element.value, "both");

        return;

      }

      if (field === "default_send_mode") {

        reason.default_send_mode = normalizeRemovalSendMode(element.value, removalConfigEditorState.config.global_settings.default_send_mode || "reply");

        return;

      }

      if (field === "flair_id_picker") {

        reason.flair_id = String(element.value || '').trim() || null;

        return;

      }

      const value = String(element.value || '');

      reason[field] = value.trim() ? value : (field === "flair_id" ? null : value);

    });

  }

  const nextConfig = cloneRemovalConfig(removalConfigEditorState.config, removalConfigEditorState.subreddit);

  updater(nextConfig);

  removalConfigEditorState.config = normalizeRemovalConfigDoc(nextConfig, removalConfigEditorState.subreddit);

  removalConfigEditorState.status = "";

}



function addRemovalConfigReason() {

  if (!removalConfigEditorState) {

    return;

  }

  updateRemovalConfigEditor((config) => {

    const existingKeys = config.reasons.map((reason) => reason.external_key);

    const nextPosition = config.reasons.length > 0

      ? Math.max(...config.reasons.map((reason) => Number(reason.position || 0))) + 10

      : 10;

    config.reasons.push({

      external_key: nextRemovalReasonKey(existingKeys, "New reason"),

      title: "New reason",

      is_enabled: true,

      applies_to: "both",

      default_send_mode: config.global_settings.default_send_mode || "reply",

      lock_post: false,

      sticky_comment: false,

      flair_id: null,

      flair_text: null,

      flair_css: null,

      position: nextPosition,

      suggestedNoteText: "",

      suggestedNoteType: "none",

      blocks: [

        {

          type: "markdown",

          key: null,

          label: null,

          required: false,

          remember_last_value: false,

          position: 10,

          payload: { content: "Write reason text here." },

          help_text: null,

        },

      ],

    });

  });

}



function moveRemovalConfigReason(index, direction) {

  if (!removalConfigEditorState) {

    return;

  }

  updateRemovalConfigEditor((config) => {

    const reasons = [...config.reasons];

    const nextIndex = direction === "up" ? index - 1 : index + 1;

    if (nextIndex < 0 || nextIndex >= reasons.length) {

      return;

    }

    const [moved] = reasons.splice(index, 1);

    reasons.splice(nextIndex, 0, moved);

    config.reasons = reasons.map((reason, reasonIndex) => ({

      ...reason,

      position: (reasonIndex + 1) * 10,

    }));

  });

}



async function loadRemovalConfigEditorFlairTemplates(forceRefresh = false) {

  if (!removalConfigEditorState || removalConfigEditorState.flairLoading) {

    return;

  }

  const stateRef = removalConfigEditorState;

  const targetSubreddit = normalizeSubreddit(stateRef.subreddit);

  const cachedTemplateSubreddit = normalizeSubreddit(stateRef.flairTemplatesSubreddit || "");

  if (

    !forceRefresh

    && Array.isArray(stateRef.flairTemplates)

    && stateRef.flairTemplates.length > 0

    && cachedTemplateSubreddit

    && cachedTemplateSubreddit.toLowerCase() === targetSubreddit.toLowerCase()

  ) {

    return;

  }



  removalConfigEditorState.flairLoading = true;

  removalConfigEditorState.flairError = "";



  try {

    const templates = await fetchPostFlairTemplatesViaReddit(targetSubreddit);

    if (!removalConfigEditorState) {

      return;

    }

    removalConfigEditorState.flairTemplates = templates;

    removalConfigEditorState.flairTemplatesSubreddit = targetSubreddit;

  } catch (error) {

    if (!removalConfigEditorState) {

      return;

    }

    removalConfigEditorState.flairError = error instanceof Error ? error.message : String(error);

  } finally {

    if (!removalConfigEditorState) {

      return;

    }

    removalConfigEditorState.flairLoading = false;

    renderRemovalConfigEditor();

  }

}



// â”€â”€â”€â”€ Quick Actions Helper Functions (for removal config editor) â”€â”€â”€â”€



function buildDefaultQuickActionsConfig(subreddit) {

  return {

    schema: QUICK_ACTIONS_WIKI_SCHEMA,

    version: 1,

    subreddit: normalizeSubreddit(subreddit),

    actions: [],

  };

}



function normalizeQuickAction(action, index) {

  const title = String(action?.title || action?.name || `Action ${index + 1}`).trim() || `Action ${index + 1}`;

  const body = String(action?.body || action?.text || action?.message || "").trim();

  const appliesTo = (() => {

    const v = String(action?.applies_to || action?.appliesTo || "both").toLowerCase();

    return ["posts", "comments", "both"].includes(v) ? v : "both";

  })();

  return {

    key: String(action?.key || action?.id || "").trim() || slugifyReasonKey(title, `action-${index + 1}`),

    title,

    body,

    applies_to: appliesTo,

    sticky: Boolean(action?.sticky ?? action?.stickyComment ?? false),

    mod_only: Boolean(action?.mod_only ?? action?.modOnly ?? false),

    comment_as_subreddit: Boolean(action?.comment_as_subreddit ?? action?.commentAsSubreddit ?? false),

    lock_post: Boolean(action?.lock_post ?? action?.lockPost ?? action?.lockThread ?? action?.lock ?? false),

    position: Number.isFinite(Number(action?.position)) ? Number(action.position) : (index + 1) * 10,

  };

}



// â”€â”€â”€â”€ Playbooks Helper Functions (for removal config editor) â”€â”€â”€â”€



function buildDefaultPlaybooksConfig(subreddit) {

  return {

    schema: PLAYBOOKS_WIKI_SCHEMA,

    version: 1,

    subreddit: normalizeSubreddit(subreddit),

    playbooks: [],

  };

}



function normalizePlaybookStep(step) {

  const rawType = String(step?.type || "").trim().toLowerCase();

  const type = rawType === "lock_post" ? "lock_item" : rawType;

  if (!["remove", "comment", "usernote", "lock_item", "unlock_item", "approve_item", "remove_item", "ban_user", "unban_user", "set_post_flair", "set_user_flair", "send_modmail", "distinguish_comment"].includes(type)) {

    return null;

  }

  if (type === "remove") {

    return {

      type: "remove",

      reason_keys: Array.isArray(step?.reason_keys) ? step.reason_keys.map((value) => String(value || "").trim()).filter(Boolean) : [],

      send_mode: normalizeRemovalSendMode(step?.send_mode, "reply"),

      inputs: step?.inputs && typeof step.inputs === "object" && !Array.isArray(step.inputs) ? step.inputs : {},

      skip_reddit_remove: Boolean(step?.skip_reddit_remove),

      no_reason: Boolean(step?.no_reason),

      comment_as_subreddit: typeof step?.comment_as_subreddit === "boolean" ? step.comment_as_subreddit : null,

    };

  }

  if (type === "comment") {

    const source = String(step?.source || "custom").trim().toLowerCase();

    return {

      type: "comment",

      source: source === "removal_reasons" ? "removal_reasons" : "custom",

      text_template: String(step?.text_template || "").trim(),

      reason_keys: Array.isArray(step?.reason_keys) ? step.reason_keys.map((value) => String(value || "").trim()).filter(Boolean) : [],

      inputs: step?.inputs && typeof step.inputs === "object" && !Array.isArray(step.inputs) ? step.inputs : {},

      comment_as_subreddit: typeof step?.comment_as_subreddit === "boolean" ? step.comment_as_subreddit : null,

      sticky: Boolean(step?.sticky),

      lock_comment: Boolean(step?.lock_comment),

    };

  }

  if (type === "usernote") {

    return {

      type: "usernote",

      note_type: String(step?.note_type || "none").trim() || "none",

      text_template: String(step?.text_template || "").trim(),

    };

  }

  if (type === "approve_item") {

    return { type: "approve_item" };

  }

  if (type === "remove_item") {

    return {

      type: "remove_item",

      spam: Boolean(step?.spam),

    };

  }

  if (type === "unlock_item") {

    return { type: "unlock_item" };

  }

  if (type === "ban_user") {

    return {

      type: "ban_user",

      duration_days: Number.isFinite(Number(step?.duration_days)) ? Number(step.duration_days) : 7,

      ban_message_template: String(step?.ban_message_template || step?.ban_message || "").trim(),

      ban_note_template: String(step?.ban_note_template || "").trim(),

    };

  }

  if (type === "unban_user") {

    return {

      type: "unban_user",

    };

  }

  if (type === "set_post_flair") {

    return {

      type: "set_post_flair",

      flair_template_id: String(step?.flair_template_id || step?.flair_id || "").trim(),

    };

  }

  if (type === "set_user_flair") {

    return {

      type: "set_user_flair",

      flair_template_id: String(step?.flair_template_id || step?.flair_id || "").trim(),

    };

  }

  if (type === "send_modmail") {

    return {

      type: "send_modmail",

      to_mode: (["custom", "subreddit"].includes(String(step?.to_mode || "").trim().toLowerCase()) ? String(step.to_mode).trim().toLowerCase() : "author"),

      to_username: String(step?.to_username || "").trim(),

      subject_template: String(step?.subject_template || "").trim(),

      body_template: String(step?.body_template || "").trim(),

      include_permalink: step?.include_permalink !== false,

      auto_archive: step?.auto_archive !== false,

    };

  }

  if (type === "distinguish_comment") {

    return {

      type: "distinguish_comment",

      sticky: Boolean(step?.sticky),

    };

  }

  return {

    type: "lock_item",

  };

}



function normalizePlaybook(playbook, index) {

  const title = String(playbook?.title || `Playbook ${index + 1}`).trim() || `Playbook ${index + 1}`;

  const appliesTo = (() => {

    const v = String(playbook?.applies_to || "both").toLowerCase();

    return ["posts", "comments", "both"].includes(v) ? v : "both";

  })();

  const rawSteps = Array.isArray(playbook?.steps) ? playbook.steps : [];

  return {

    key: String(playbook?.key || "").trim() || slugifyReasonKey(title, `playbook-${index + 1}`),

    title,

    is_enabled: playbook?.is_enabled !== false,

    applies_to: appliesTo,

    confirm: playbook?.confirm !== false,

    stop_on_error: playbook?.stop_on_error !== false,

    position: Number.isFinite(Number(playbook?.position)) ? Number(playbook.position) : (index + 1) * 10,

    steps: rawSteps.map((step) => normalizePlaybookStep(step)).filter(Boolean),

  };

}



// â”€â”€â”€â”€ Wiki Loading Functions â”€â”€â”€â”€



async function loadRemovalConfigFromWiki(subreddit) {

  try {

    const cleanSubreddit = normalizeSubreddit(subreddit);

    if (!cleanSubreddit) {

      return buildDefaultRemovalConfig("");

    }



    // Check cache first

    const cachedConfig = getInMemoryRemovalConfig(cleanSubreddit);

    if (cachedConfig) {

      console.log("[ModBox] Using cached removal config for", cleanSubreddit);

      return cachedConfig;

    }



    let wikiPayload;

    try {

      // Request via background script for CORS

      wikiPayload = await requestJsonViaBackground(

        `/r/${encodeURIComponent(cleanSubreddit)}/wiki/${REMOVAL_REASONS_WIKI_PAGE}.json?raw_json=1`,

        { oauth: true },

      );

    } catch (error) {

      const message = error instanceof Error ? error.message : String(error);

      // If wiki page doesn't exist, return default config

      if (/PAGE_NOT_CREATED|WIKI_DISABLED|404|NOT_FOUND|NO_WIKI_PAGE/i.test(message)) {

        return buildDefaultRemovalConfig(cleanSubreddit);

      }

      throw error;

    }



    const raw = String(wikiPayload?.data?.content_md || "").trim();

    if (!raw) {

      return buildDefaultRemovalConfig(cleanSubreddit);

    }



    let doc;

    try {

      doc = JSON.parse(raw);

    } catch (parseError) {

      console.error("[ModBox] Error parsing removal config from wiki:", parseError);

      return buildDefaultRemovalConfig(cleanSubreddit);

    }



    const normalizedConfig = normalizeRemovalConfigDoc(doc, cleanSubreddit);

    // Save to cache for next time

    setInMemoryRemovalConfig(cleanSubreddit, normalizedConfig);

    return normalizedConfig;

  } catch (error) {

    console.error("[ModBox] Error loading removal config from wiki:", error);

    return buildDefaultRemovalConfig(subreddit);

  }

}



function buildDefaultRemovalConfig(subreddit) {

  return {

    subreddit: normalizeSubreddit(subreddit),

    version: 1,

    reasons: [],

    global_settings: {

      default_send_mode: "reply",

    },

  };

}



function normalizeRemovalConfigDoc(doc, subreddit) {

  if (!doc || typeof doc !== "object") {

    return buildDefaultRemovalConfig(subreddit);

  }

  return {

    subreddit: normalizeSubreddit(subreddit || doc.subreddit || ""),

    version: doc.version || 1,

    reasons: Array.isArray(doc.reasons) ? doc.reasons : [],

    global_settings: doc.global_settings || { default_send_mode: "reply" },

  };

}



function serializeRemovalConfigForWiki(config, subreddit) {

  if (!config || typeof config !== "object") {

    return buildDefaultRemovalConfig(subreddit);

  }

  return config;

}



async function applyExtensionSettingsToRuntime(settings) {

  interceptNativeRemoveEnabled = Boolean(settings.intercept_native_remove);

  contextPopupFeatureEnabled = Boolean(settings.context_popup_enabled);

  commentNukeIgnoreDistinguished = Boolean(settings.comment_nuke_ignore_distinguished);

  historyButtonEnabled = typeof settings.history_button_enabled === "boolean" ? settings.history_button_enabled : false;

  commentNukeButtonEnabled = typeof settings.comment_nuke_button_enabled === "boolean" ? settings.comment_nuke_button_enabled : false;

  currentThemeMode = normalizeThemeMode(settings.theme_mode, currentThemeMode);

  applyThemeToDocument();

  if (!contextPopupFeatureEnabled) {

    clearOldRedditContextPopupLinks();

    closeContextPopup();

  } else {

    bindOldRedditContextPopupLinks();

  }

  panelSettingsPromise = null;

  clearQueueBarContextCache();

}



// â”€â”€â”€â”€ Main Editor Initialization & Rendering â”€â”€â”€â”€



// Note: openOverlay is now in overlay-removal.js module

// This is the editor for editing the removal config itself



async function openRemovalConfigEditor(context) {

  const editorSubreddit = normalizeSubreddit(context.subreddit);

  const initialFlairTemplates = Array.isArray(context.flairTemplates) ? context.flairTemplates : [];

  const defaultPlaybookUsernoteMeta = buildDefaultUsernoteTypeMeta?.() || {};



  const [stored, wikiPage] = await Promise.all([

    ext.storage.sync.get([

      AUTO_CLOSE_KEY, INTERCEPT_NATIVE_REMOVE_KEY, CONTEXT_POPUP_ENABLED_KEY,

      QUEUE_BAR_SCOPE_KEY, QUEUE_BAR_FIXED_SUBREDDIT_KEY, QUEUE_BAR_LINK_HOST_KEY,

      QUEUE_BAR_USE_OLD_REDDIT_KEY, QUEUE_BAR_OPEN_IN_NEW_TAB_KEY, THEME_MODE_KEY,

      COMMENT_NUKE_IGNORE_DISTINGUISHED_KEY, HISTORY_BUTTON_ENABLED_KEY, COMMENT_NUKE_BUTTON_ENABLED_KEY, CANNED_REPLIES_WIKI_URL_KEY,

    ]).catch(() => ({})),

    Promise.resolve(null), // getExtensionSettingsWikiPagePreference stub

  ]);



  removalConfigEditorState = {

    subreddit: editorSubreddit,

    config: cloneRemovalConfig(context.config || {}, context.subreddit),

    flairTemplates: initialFlairTemplates,

    flairTemplatesSubreddit: initialFlairTemplates.length ? editorSubreddit : "",

    flairLoading: false,

    flairError: "",

    activeTab: "reasons",

    saving: false,

    error: "",

    status: "",

    saveNote: "",

    reasonsUserEdited: false,

    extensionSettings: {

      auto_close_on_remove: typeof stored[AUTO_CLOSE_KEY] === "boolean" ? stored[AUTO_CLOSE_KEY] : false,

      intercept_native_remove: typeof stored[INTERCEPT_NATIVE_REMOVE_KEY] === "boolean" ? stored[INTERCEPT_NATIVE_REMOVE_KEY] : true,

      context_popup_enabled: typeof stored[CONTEXT_POPUP_ENABLED_KEY] === "boolean" ? stored[CONTEXT_POPUP_ENABLED_KEY] : true,

      theme_mode: normalizeThemeMode(stored[THEME_MODE_KEY], "auto"),

      queue_bar_scope: normalizeQueueBarScope(stored[QUEUE_BAR_SCOPE_KEY], "current_subreddit"),

      queue_bar_fixed_subreddit: normalizeSubreddit(stored[QUEUE_BAR_FIXED_SUBREDDIT_KEY] || "") || null,

      queue_bar_link_host: normalizeQueueBarLinkHost(stored[QUEUE_BAR_LINK_HOST_KEY], "extension_preference"),

      queue_bar_use_old_reddit: typeof stored[QUEUE_BAR_USE_OLD_REDDIT_KEY] === "boolean" ? stored[QUEUE_BAR_USE_OLD_REDDIT_KEY] : false,

      queue_bar_open_in_new_tab: typeof stored[QUEUE_BAR_OPEN_IN_NEW_TAB_KEY] === "boolean" ? stored[QUEUE_BAR_OPEN_IN_NEW_TAB_KEY] : false,

      comment_nuke_ignore_distinguished: typeof stored[COMMENT_NUKE_IGNORE_DISTINGUISHED_KEY] === "boolean" ? stored[COMMENT_NUKE_IGNORE_DISTINGUISHED_KEY] : false,

      history_button_enabled: typeof stored[HISTORY_BUTTON_ENABLED_KEY] === "boolean" ? stored[HISTORY_BUTTON_ENABLED_KEY] : false,

      comment_nuke_button_enabled: typeof stored[COMMENT_NUKE_BUTTON_ENABLED_KEY] === "boolean" ? stored[COMMENT_NUKE_BUTTON_ENABLED_KEY] : false,

      canned_replies_wiki_url: String(stored[CANNED_REPLIES_WIKI_URL_KEY] || "").trim(),

    },

    queueBarModeratedSubreddits: [],

    queueBarModeratedSubredditsLoading: true,

    extensionSettingsSaving: false,

    extensionSettingsError: "",

    extensionSettingsStatus: "",

    wikiBackupPage: wikiPage,

    wikiBackupLoading: false,

    wikiBackupError: "",

    wikiBackupStatus: "",

    quickActionsConfig: buildDefaultQuickActionsConfig(context.subreddit),

    quickActionsLoading: true,

    quickActionsSaving: false,

    quickActionsError: "",

    quickActionsStatus: "",

    quickActionsSaveNote: "",

    quickActionsImporting: false,

    playbooksConfig: buildDefaultPlaybooksConfig(context.subreddit),

    playbooksLoading: true,

    playbooksUserEdited: false,

    playbooksSaving: false,

    playbooksError: "",

    playbooksStatus: "",

    playbooksSaveNote: "",

    playbooksNoteTypes: collectUsernoteTypes ? collectUsernoteTypes(null, defaultPlaybookUsernoteMeta) : {},

    playbooksNoteTypeLabels: defaultPlaybookUsernoteMeta?.labels && typeof defaultPlaybookUsernoteMeta.labels === "object" ? defaultPlaybookUsernoteMeta.labels : {},

    playbooksCollapsed: {},

    playbookStepCollapsed: {},

    toolboxDrafts: {},

  };



  renderRemovalConfigEditor();



  // Load moderated subreddits in background for queue bar dropdown

  void ensureAllowedLaunchSubredditsLoaded()

    .then(() => {

      if (!removalConfigEditorState) return;

      const rows = allowedLaunchSubreddits instanceof Set ? Array.from(allowedLaunchSubreddits) : [];

      rows.sort((a, b) => a.localeCompare(b));

      removalConfigEditorState.queueBarModeratedSubreddits = rows;

      if (!removalConfigEditorState.extensionSettings.queue_bar_fixed_subreddit && rows.length > 0) {

        removalConfigEditorState.extensionSettings.queue_bar_fixed_subreddit = rows[0];

      }

    })

    .finally(() => {

      if (!removalConfigEditorState) return;

      removalConfigEditorState.queueBarModeratedSubredditsLoading = false;

      renderRemovalConfigEditor();

    });



  // Load quick actions in background

  void loadQuickActionsFromWiki(removalConfigEditorState.subreddit)

    .then((config) => {

      if (!removalConfigEditorState) return;

      removalConfigEditorState.quickActionsConfig = config;

    })

    .catch((error) => {

      if (!removalConfigEditorState) return;

      removalConfigEditorState.quickActionsError = error instanceof Error ? error.message : String(error);

    })

    .finally(() => {

      if (!removalConfigEditorState) return;

      removalConfigEditorState.quickActionsLoading = false;

      renderRemovalConfigEditor();

    });



  // Load playbooks in background

  void loadPlaybooksFromWiki(removalConfigEditorState.subreddit)

    .then((config) => {

      if (!removalConfigEditorState) return;

      if (!removalConfigEditorState.playbooksUserEdited) {

        removalConfigEditorState.playbooksConfig = config;

      }

    })

    .catch((error) => {

      if (!removalConfigEditorState) return;

      removalConfigEditorState.playbooksError = error instanceof Error ? error.message : String(error);

    })

    .finally(() => {

      if (!removalConfigEditorState) return;

      removalConfigEditorState.playbooksLoading = false;

      renderRemovalConfigEditor();

    });



  // Load usernote types in background

  void fetchToolboxUsernoteTypeMetaViaReddit(removalConfigEditorState.subreddit)

    .then((typeMeta) => {

      if (!removalConfigEditorState) return;

      const noteTypes = collectUsernoteTypes(null, typeMeta);

      removalConfigEditorState.playbooksNoteTypes = noteTypes;

      removalConfigEditorState.playbooksNoteTypeLabels = typeMeta?.labels || {};

      renderRemovalConfigEditor();

    })

    .catch(() => {

      // silently fail, keep defaults

    });



  if (!removalConfigEditorState.flairTemplates.length) {

    void loadRemovalConfigEditorFlairTemplates(false);

  }

}



// â”€â”€â”€â”€ Toolbox Body Parser & Serializer (for removal-config-editor) â”€â”€â”€â”€



function parseToolboxBodyToBlocks(text) {

  const pattern = /(<select\b[^>]*>[\s\S]*?<\/select>|<textarea\b[^>]*>[\s\S]*?<\/textarea>|<input\b[^>]*\/?>)/gi;

  const blocks = [];

  let position = 10;

  let lastIndex = 0;

  const usedKeys = new Set();



  function uniqueKey(base) {

    const safeBase = slugifyReasonKey(base, "field").replace(/-/g, "_");

    if (!usedKeys.has(safeBase)) {

      usedKeys.add(safeBase);

      return safeBase;

    }

    let counter = 2;

    while (usedKeys.has(`${safeBase}_${counter}`)) {

      counter += 1;

    }

    const key = `${safeBase}_${counter}`;

    usedKeys.add(key);

    return key;

  }



  function pushMarkdown(segment) {

    if (!String(segment || "").trim()) {

      return;

    }

    blocks.push({

      type: "markdown",

      key: null,

      label: null,

      required: false,

      remember_last_value: false,

      position,

      payload: { content: String(segment) },

      help_text: null,

    });

    position += 10;

  }



  let match = pattern.exec(String(text || ""));

  while (match) {

    pushMarkdown(String(text || "").slice(lastIndex, match.index));

    const raw = match[1];

    const lowered = raw.toLowerCase();



    if (lowered.startsWith("<select")) {

      const key = uniqueKey(extractRemovalAttr(raw, "id") || "select");

      const options = [];

      const optionPattern = /<option[^>]*>([\s\S]*?)<\/option>/gi;

      let optionMatch = optionPattern.exec(raw);

      while (optionMatch) {

        const option = String(optionMatch[1] || "").trim();

        if (option) {

          options.push(option);

        }

        optionMatch = optionPattern.exec(raw);

      }

      blocks.push({

        type: "select",

        key,

        label: humanizeRemovalKey(key),

        required: false,

        remember_last_value: false,

        position,

        payload: { options },

        help_text: null,

      });

      position += 10;

    } else if (lowered.startsWith("<textarea")) {

      const key = uniqueKey(extractRemovalAttr(raw, "id") || "textarea");

      blocks.push({

        type: "textarea",

        key,

        label: humanizeRemovalKey(key),

        required: false,

        remember_last_value: false,

        position,

        payload: { placeholder: extractRemovalAttr(raw, "placeholder") || "" },

        help_text: null,

      });

      position += 10;

    } else {

      const key = uniqueKey(extractRemovalAttr(raw, "id") || "input");

      blocks.push({

        type: "input",

        key,

        label: humanizeRemovalKey(key),

        required: false,

        remember_last_value: false,

        position,

        payload: { placeholder: extractRemovalAttr(raw, "placeholder") || "" },

        help_text: null,

      });

      position += 10;

    }



    lastIndex = pattern.lastIndex;

    match = pattern.exec(String(text || ""));

  }



  pushMarkdown(String(text || "").slice(lastIndex));

  return blocks;

}



function blocksToToolboxBody(blocks) {

  function isControl(block) {

    return block?.type === "select" || block?.type === "input" || block?.type === "textarea";

  }



  function renderBlock(block, index) {

    if (!block || typeof block !== "object") {

      return "";

    }

    if (block.type === "markdown") {

      return String(block?.payload?.content ?? "");

    }



    const key = String(block?.key || `${block.type}_${index + 1}`).trim();

    if (block.type === "select") {

      const options = Array.isArray(block?.payload?.options)

        ? block.payload.options.map((option) => `<option>${escapeHtml(String(option || ""))}</option>`).join("\n")

        : "";

      return `<select id="${escapeHtml(key)}">\n${options}\n</select>`;

    }



    const placeholder = escapeHtml(String(block?.payload?.placeholder ?? ""));

    if (block.type === "input") {

      return `<input id="${escapeHtml(key)}" placeholder="${placeholder}"/>`;

    }

    return `<textarea id="${escapeHtml(key)}" placeholder="${placeholder}"></textarea>`;

  }



  return (Array.isArray(blocks) ? blocks : []).reduce((output, block, index, allBlocks) => {

    const current = renderBlock(block, index);

    if (!current) {

      return output;

    }

    if (!output) {

      return current;

    }

    const previous = allBlocks[index - 1];

    if (isControl(previous) || isControl(block)) {

      return `${output}${current}`;

    }

    return `${output}\n\n${current}`;

  }, "");

}



// Full renderRemovalConfigEditor() implementation is in removal-config-editor.js module



// â”€â”€â”€â”€ Removal Message Building & Preview Functions â”€â”€â”€â”€



function interpolateRemovalTemplate(text, author, kind, subreddit, inputs) {

  let output = String(text || "");

  output = output.replaceAll("{author}", String(author || ""));

  output = output.replaceAll("{kind}", String(kind || ""));

  output = output.replaceAll("{subreddit}", String(subreddit || ""));

  Object.entries(inputs && typeof inputs === "object" ? inputs : {}).forEach(([key, value]) => {

    output = output.replaceAll(`{inputs.${key}}`, String(value || ""));

  });

  return output;

}



function collapseWrappedInlineValues(text) {

  return String(text || "")

    .replace(/(__[^\n]*?:)\s*\n+\s*([^\n]+?)\s*\n+\s*(__)/g, "$1 $2$3")

    .replace(/(__)\s*\n+\s*([^\n_][^\n]*?)\s*\n+\s*(__)/g, "__$2__");

}



function buildRemovalReasonBody(reason, author, kind, subreddit, inputs) {

  const parts = [];

  for (const block of Array.isArray(reason?.blocks) ? reason.blocks : []) {

    if (block?.type === "markdown") {

      const content = String(block?.payload?.content ?? "");

      if (content) {

        parts.push(interpolateRemovalTemplate(content, author, kind, subreddit, inputs));

      }

      continue;

    }

    const key = String(block?.key || "").trim();

    const value = key ? String(inputs?.[key] || "").trim() : "";

    if (value) {

      parts.push(interpolateRemovalTemplate(value, author, kind, subreddit, inputs));

    }

  }

  return collapseWrappedInlineValues(parts.join(""));

}



function buildRemovalPreviewMessage(config, reasons, author, kind, subreddit, inputs) {

  const parts = [];

  const globalSettings = config?.global_settings && typeof config.global_settings === "object"

    ? config.global_settings

    : {};



  if (globalSettings.header_markdown) {

    parts.push(interpolateRemovalTemplate(globalSettings.header_markdown, author, kind, subreddit, inputs));

  }



  for (const reason of Array.isArray(reasons) ? reasons : []) {

    const body = buildRemovalReasonBody(reason, author, kind, subreddit, inputs);

    if (body.trim()) {

      parts.push(body);

    }

  }



  if (globalSettings.footer_markdown) {

    parts.push(interpolateRemovalTemplate(globalSettings.footer_markdown, author, kind, subreddit, inputs));

  }



  return parts.filter((part) => String(part || "").trim()).join("\n\n");

}



function buildRemovalPreviewSubject(config, author, kind, subreddit) {

  const template = String(config?.global_settings?.pm_subject_template || DEFAULT_REMOVAL_PM_SUBJECT).trim()

    || DEFAULT_REMOVAL_PM_SUBJECT;

  return interpolateRemovalTemplate(template, author, kind, subreddit, {});

}

// ------------------------------------------------------------------------------
// removal-config-editor.js
// ------------------------------------------------------------------------------

function renderRemovalConfigEditor() {

  if (!removalConfigEditorState) {

    closeRemovalConfigEditor();

    return;

  }

    if (isPointerDown) {

      deferredRenders.add("config_editor");

      return;

    }



  const root = ensureOverlayRoot();

  let backdrop = root.querySelector(".rrw-removal-config-backdrop");

  let modal = root.querySelector(".rrw-removal-config-modal");

  if (!(backdrop instanceof HTMLElement)) {

    backdrop = document.createElement("div");

    backdrop.className = "rrw-removal-config-backdrop";

    root.appendChild(backdrop);

  }

  if (!(modal instanceof HTMLElement)) {

    modal = document.createElement("section");

    modal.className = "rrw-removal-config-modal";

    root.appendChild(modal);

  }



  const previousBody = modal.querySelector(".rrw-removal-config-body");

  const previousBodyScrollTop = previousBody instanceof HTMLElement ? previousBody.scrollTop : 0;

  const previousQuickActionList = modal.querySelector("#rrw-qa-action-list");

  const previousQuickActionListScrollTop = previousQuickActionList instanceof HTMLElement ? previousQuickActionList.scrollTop : 0;

  const previousPlaybookReasonChecklistScroll = new Map();

  modal.querySelectorAll("[data-pb-reason-list]").forEach((element) => {

    if (!(element instanceof HTMLElement)) {

      return;

    }

    const key = String(element.getAttribute("data-pb-reason-list") || "");

    if (!key) {

      return;

    }

    previousPlaybookReasonChecklistScroll.set(key, element.scrollTop);

  });



  const state = removalConfigEditorState;

  const modboxLogoUrl = chrome.runtime.getURL("assets/modbox-logo.svg");

  const activeTab = ["extension_settings", "quick_actions", "playbooks"].includes(state.activeTab)

    ? state.activeTab

    : "reasons";

  const config = state.config;

  const extensionSettings = state.extensionSettings || {};

  const flairOptions = (Array.isArray(state.flairTemplates) ? state.flairTemplates : [])

    .map((template) => `<option value="${escapeHtml(template.id)}">${escapeHtml(formatRemovalFlairTemplateLabel(template))}</option>`)

    .join("");



  const reasonsHtml = config.reasons.map((reason, index) => {

    const draft = state.toolboxDrafts?.[index];

    const previewBlocks = draft === undefined ? reason.blocks : parseToolboxBodyToBlocks(draft);

    const previewItems = previewBlocks.map((block, blockIndex) => {

      if (block.type === "markdown") {

        const content = String(block?.payload?.content ?? "").trim();

        return `<li><strong>Markdown:</strong> ${escapeHtml(content || "(empty markdown block)")}</li>`;

      }

      if (block.type === "select") {

        const options = Array.isArray(block?.payload?.options) ? block.payload.options.length : 0;

        return `<li><strong>Select:</strong> ${escapeHtml(block.key || "unnamed")} (${options} option${options === 1 ? "" : "s"})</li>`;

      }

      return `<li><strong>${block.type === "input" ? "Input" : "Textarea"}:</strong> ${escapeHtml(block.key || "unnamed")}</li>`;

    }).join("");





    return `

      <article class="rrw-config-reason-card" data-reason-index="${index}">

        <div class="rrw-config-reason-head">

          <div class="rrw-config-reason-title-row">

            <input type="text" data-reason-index="${index}" data-reason-field="title" value="${escapeHtml(reason.title)}" placeholder="Reason title" />

            <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

              <input type="checkbox" data-reason-index="${index}" data-reason-field="is_enabled" ${reason.is_enabled ? "checked" : ""} />

              <span>Enabled</span>

            </label>

            <button type="button" class="rrw-btn rrw-btn-secondary" data-reason-move="up" data-reason-index="${index}" ${index === 0 ? "disabled" : ""}>Up</button>

            <button type="button" class="rrw-btn rrw-btn-secondary" data-reason-move="down" data-reason-index="${index}" ${index === config.reasons.length - 1 ? "disabled" : ""}>Down</button>

            <button type="button" class="rrw-btn rrw-btn-danger" data-reason-delete="${index}">Delete</button>

          </div>

          <input type="text" data-reason-index="${index}" data-reason-field="external_key" value="${escapeHtml(reason.external_key)}" placeholder="Reason key" />

        </div>



        <div class="rrw-config-grid">

          <label class="rrw-field">

            <span>Applies to</span>

            <select data-reason-index="${index}" data-reason-field="applies_to">

              <option value="both" ${reason.applies_to === "both" ? "selected" : ""}>posts and comments</option>

              <option value="posts" ${reason.applies_to === "posts" ? "selected" : ""}>posts only</option>

              <option value="comments" ${reason.applies_to === "comments" ? "selected" : ""}>comments only</option>

            </select>

          </label>

          <label class="rrw-field">

            <span>Default send mode</span>

            <select data-reason-index="${index}" data-reason-field="default_send_mode">

              <option value="reply" ${reason.default_send_mode === "reply" ? "selected" : ""}>reply</option>

              <option value="pm" ${reason.default_send_mode === "pm" ? "selected" : ""}>pm</option>

              <option value="both" ${reason.default_send_mode === "both" ? "selected" : ""}>both</option>

              <option value="none" ${reason.default_send_mode === "none" ? "selected" : ""}>none</option>

            </select>

          </label>

          <label class="rrw-field">

            <span>Post flair template ID</span>

            <select data-reason-index="${index}" data-reason-field="flair_id_picker">

              <option value="">No post flair</option>

              ${flairOptions}

            </select>

            <input type="text" data-reason-index="${index}" data-reason-field="flair_id" value="${escapeHtml(reason.flair_id || "")}" placeholder="Optional flair template ID" />

          </label>

        </div>



        <div class="rrw-config-grid">

          <label class="rrw-field">

            <span>Suggested usernote text</span>

            <input type="text" data-reason-index="${index}" data-reason-field="suggestedNoteText" value="${escapeHtml(reason.suggestedNoteText || "")}" placeholder="Optional suggested usernote text" />

          </label>

          <label class="rrw-field">

            <span>Suggested note type</span>

            <select data-reason-index="${index}" data-reason-field="suggestedNoteType">

              ${(removalConfigEditorState.playbooksNoteTypes || ["none"]).map(key => {

                const label = (removalConfigEditorState.playbooksNoteTypeLabels && removalConfigEditorState.playbooksNoteTypeLabels[key]) || key;

                return `<option value="${escapeHtml(key)}" ${reason.suggestedNoteType === key ? "selected" : ""}>${escapeHtml(label)}</option>`;

              }).join("")}

            </select>

          </label>

        </div>



        <div class="rrw-config-flag-row">

          <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

            <input type="checkbox" data-reason-index="${index}" data-reason-field="sticky_comment" ${reason.sticky_comment ? "checked" : ""} />

            <span>Sticky reply on posts</span>

          </label>

          <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

            <input type="checkbox" data-reason-index="${index}" data-reason-field="lock_post" ${reason.lock_post ? "checked" : ""} />

            <span>Lock removed item</span>

          </label>

        </div>



        <label class="rrw-field">

          <span>Toolbox-style body editor</span>

          <textarea rows="10" data-reason-index="${index}" data-reason-body="1">${draft ?? blocksToToolboxBody(reason.blocks)}</textarea>

        </label>



        <div class="rrw-preview-panel rrw-config-preview-panel">

          <div class="rrw-preview-panel__header">

            <h3>Live parsed preview</h3>

          </div>

          <ul class="rrw-config-preview-list">${previewItems || "<li>No blocks</li>"}</ul>

        </div>

      </article>

    `;

  }).join("");



  modal.innerHTML = `

    <header class="rrw-removal-config-header">

      <div class="rrw-removal-config-title">

        <img class="rrw-removal-config-logo" src="${escapeHtml(modboxLogoUrl)}" alt="ModBox" />

        <div>

          <h2>ModBox Wiki Settings</h2>

          <p class="rrw-muted">r/${escapeHtml(state.subreddit)}</p>

        </div>

      </div>

      <div class="rrw-header-actions">

        ${activeTab === "reasons" ? `<button type="button" class="rrw-refresh-btn" id="rrw-config-load-flair">${state.flairLoading ? "&hellip;" : "Flair"}</button>` : ""}

        <button type="button" class="rrw-close" id="rrw-config-close">Close</button>

      </div>

    </header>



    <div class="rrw-removal-config-tabs" role="tablist" aria-label="ModBox settings tabs">

      <button type="button" class="rrw-removal-config-tab ${activeTab === "reasons" ? "is-active" : ""}" data-config-tab="reasons" role="tab" aria-selected="${activeTab === "reasons" ? "true" : "false"}">Removal Reasons</button>

      <button type="button" class="rrw-removal-config-tab ${activeTab === "quick_actions" ? "is-active" : ""}" data-config-tab="quick_actions" role="tab" aria-selected="${activeTab === "quick_actions" ? "true" : "false"}">Quick Actions</button>

      <button type="button" class="rrw-removal-config-tab ${activeTab === "playbooks" ? "is-active" : ""}" data-config-tab="playbooks" role="tab" aria-selected="${activeTab === "playbooks" ? "true" : "false"}">Playbooks</button>

      <button type="button" class="rrw-removal-config-tab ${activeTab === "extension_settings" ? "is-active" : ""}" data-config-tab="extension_settings" role="tab" aria-selected="${activeTab === "extension_settings" ? "true" : "false"}">Extension Settings</button>

    </div>



    <div class="rrw-removal-config-body">

      ${activeTab === "reasons" ? `

        ${state.error ? `<div class="rrw-error">${escapeHtml(state.error)}</div>` : ""}

        ${state.status ? `<div class="rrw-success">${escapeHtml(state.status)}</div>` : ""}

        ${state.flairError ? `<div class="rrw-warning">${escapeHtml(state.flairError)}</div>` : ""}



        <section class="rrw-preview-panel rrw-config-section">

          <div class="rrw-preview-panel__header">

            <h3>Global settings</h3>

          </div>

          <div class="rrw-config-grid">

            <label class="rrw-field">

              <span>Header markdown</span>

              <textarea rows="3" data-global-field="header_markdown">${config.global_settings.header_markdown || ""}</textarea>

            </label>

            <label class="rrw-field">

              <span>Footer markdown</span>

              <textarea rows="3" data-global-field="footer_markdown">${config.global_settings.footer_markdown || ""}</textarea>

            </label>

          </div>

          <div class="rrw-config-grid">

            <label class="rrw-field">

              <span>PM subject template</span>

              <input type="text" data-global-field="pm_subject_template" value="${escapeHtml(config.global_settings.pm_subject_template || "")}" />

            </label>

            <label class="rrw-field">

              <span>Default send mode</span>

              <select data-global-field="default_send_mode">

                <option value="reply" ${config.global_settings.default_send_mode === "reply" ? "selected" : ""}>reply</option>

                <option value="pm" ${config.global_settings.default_send_mode === "pm" ? "selected" : ""}>pm</option>

                <option value="both" ${config.global_settings.default_send_mode === "both" ? "selected" : ""}>both</option>

                <option value="none" ${config.global_settings.default_send_mode === "none" ? "selected" : ""}>none</option>

              </select>

            </label>

          </div>

          <div class="rrw-config-flag-row">

            <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

              <input type="checkbox" data-global-field="comment_as_subreddit" ${config.global_settings.comment_as_subreddit !== false ? "checked" : ""} />

              <span>Reply as u/${escapeHtml(state.subreddit)}-ModTeam (Toolbox style)</span>

            </label>

            <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

              <input type="checkbox" data-global-field="lock_removal_comment" ${config.global_settings.lock_removal_comment ? "checked" : ""} />

              <span>Lock removal comment</span>

            </label>

            <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

              <input type="checkbox" data-global-field="auto_archive_modmail" ${config.global_settings.auto_archive_modmail !== false ? "checked" : ""} />

              <span>Auto-archive sent modmail</span>

            </label>

          </div>

        </section>



        <section class="rrw-config-section">

          <div class="rrw-config-toolbar">

            <div>

              <h3>Reasons</h3>

              <p class="rrw-muted">${config.reasons.length} configured</p>

            </div>

            <button type="button" class="rrw-btn rrw-btn-primary" id="rrw-config-add-reason">Add reason</button>

          </div>

          ${state.reasonsUserEdited && !state.saving && !state.status ? `<div class="rrw-warning">You have unsaved changes. Click <strong>Save</strong> to persist them to the wiki.</div>` : ""}

          <div class="rrw-config-reason-list">

            ${reasonsHtml || '<div class="rrw-preview-panel"><p class="rrw-muted">No removal reasons configured yet.</p></div>'}

          </div>

        </section>

      ` : activeTab === "quick_actions" ? `

        ${state.quickActionsError ? `<div class="rrw-error">${escapeHtml(state.quickActionsError)}</div>` : ""}

        ${state.quickActionsStatus ? `<div class="rrw-success">${escapeHtml(state.quickActionsStatus)}</div>` : ""}

        ${state.quickActionsLoading ? `<p class="rrw-muted">Loading quick actions from wiki...</p>` : ""}



        <section class="rrw-config-section rrw-config-section--playbooks">

          <div class="rrw-config-toolbar rrw-config-toolbar--sticky">

            <div>

              <h3>Quick Actions</h3>

              <p class="rrw-muted">${(state.quickActionsConfig?.actions || []).length} configured &middot; wiki/${QUICK_ACTIONS_WIKI_PAGE}</p>

            </div>

            <div class="rrw-actions rrw-ext-wiki-actions">

              <button type="button" class="rrw-btn rrw-btn-secondary" id="rrw-qa-import-toolbox" ${state.quickActionsLoading || state.quickActionsImporting ? "disabled" : ""}>

                ${state.quickActionsImporting ? "Importing&hellip;" : "Import from Toolbox"}

              </button>

              <button type="button" class="rrw-btn rrw-btn-primary" id="rrw-qa-add-action" ${state.quickActionsLoading ? "disabled" : ""}>Add action</button>

            </div>

            <p class="rrw-muted">Import tip: OK in the prompt overwrites existing actions, Cancel merges and skips duplicates.</p>

          </div>

          <div class="rrw-config-reason-list" id="rrw-qa-action-list">

            ${(state.quickActionsConfig?.actions || []).length === 0

              ? '<div class="rrw-preview-panel"><p class="rrw-muted">No quick actions configured. Add one or import from Toolbox.</p></div>'

              : (state.quickActionsConfig?.actions || []).map((action, index) => `

                <article class="rrw-config-reason-card" data-qa-index="${index}">

                  <div class="rrw-config-reason-head">

                    <div class="rrw-field">

                      <span>Title</span>

                      <div class="rrw-config-reason-title-row">

                        <input type="text" data-qa-index="${index}" data-qa-field="title" value="${escapeHtml(action.title)}" placeholder="Action title" />

                        <button type="button" class="rrw-btn rrw-btn-secondary" data-qa-move="up" data-qa-index="${index}" ${index === 0 ? "disabled" : ""}>Up</button>

                        <button type="button" class="rrw-btn rrw-btn-secondary" data-qa-move="down" data-qa-index="${index}" ${index === (state.quickActionsConfig?.actions || []).length - 1 ? "disabled" : ""}>Down</button>

                        <button type="button" class="rrw-btn rrw-btn-danger" data-qa-delete="${index}">Delete</button>

                      </div>

                    </div>

                    <label class="rrw-field">

                      <span>Key</span>

                      <input type="text" data-qa-index="${index}" data-qa-field="key" value="${escapeHtml(action.key)}" placeholder="Action key" />

                    </label>

                  </div>

                  <div class="rrw-config-grid">

                    <label class="rrw-field">

                      <span>Applies to</span>

                      <select data-qa-index="${index}" data-qa-field="applies_to">

                        <option value="both" ${action.applies_to === "both" ? "selected" : ""}>posts and comments</option>

                        <option value="posts" ${action.applies_to === "posts" ? "selected" : ""}>posts only</option>

                        <option value="comments" ${action.applies_to === "comments" ? "selected" : ""}>comments only</option>

                      </select>

                    </label>

                  </div>

                  <div class="rrw-config-flag-row">

                    <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

                      <input type="checkbox" data-qa-index="${index}" data-qa-field="sticky" ${action.sticky ? "checked" : ""} />

                      <span>Sticky comment</span>

                    </label>

                    <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

                      <input type="checkbox" data-qa-index="${index}" data-qa-field="mod_only" ${action.mod_only ? "checked" : ""} />

                      <span>Distinguish as moderator</span>

                    </label>

                    <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle" title="Workaround: remove item, post subreddit removal comment, then re-approve item">

                      <input type="checkbox" data-qa-index="${index}" data-qa-field="comment_as_subreddit" ${action.comment_as_subreddit ? "checked" : ""} />

                      <span>Post as u/${escapeHtml(state.subreddit)}-ModTeam (remove &amp; re-approve workaround)</span>

                    </label>

                    <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

                      <input type="checkbox" data-qa-index="${index}" data-qa-field="lock_post" ${action.lock_post ? "checked" : ""} />

                      <span>Lock item</span>

                    </label>

                  </div>

                  <label class="rrw-field">

                    <span>Comment body (supports {author}, {subreddit}, {kind})</span>

                    <textarea rows="5" data-qa-index="${index}" data-qa-field="body">${action.body}</textarea>

                  </label>

                </article>

              `).join("")

            }

          </div>

        </section>

      ` : activeTab === "playbooks" ? `

        ${state.playbooksError ? `<div class="rrw-error">${escapeHtml(state.playbooksError)}</div>` : ""}

        ${state.playbooksStatus ? `<div class="rrw-success">${escapeHtml(state.playbooksStatus)}</div>` : ""}

        ${state.playbooksUserEdited && !state.playbooksSaving && !state.playbooksStatus ? `<div class="rrw-warning">You have unsaved changes. Click <strong>Save playbooks</strong> below to persist them to the wiki.</div>` : ""}

        ${state.playbooksLoading ? `<p class="rrw-muted">Loading playbooks from wiki...</p>` : ""}



        <section class="rrw-config-section">

          <div class="rrw-config-toolbar">

            <div>

              <h3>Playbooks</h3>

              <p class="rrw-muted">${(state.playbooksConfig?.playbooks || []).length} configured &middot; wiki/${PLAYBOOKS_WIKI_PAGE}</p>

            </div>

            <div class="rrw-actions rrw-ext-wiki-actions">

              <button type="button" class="rrw-btn rrw-btn-primary" id="rrw-pb-add-playbook" ${state.playbooksLoading ? "disabled" : ""}>Add playbook</button>

            </div>

            <p class="rrw-muted">Supported step types: remove, comment, usernote, lock_item, unlock_item, approve_item, remove_item, ban_user, unban_user, set_post_flair, set_user_flair, send_modmail, distinguish_comment.</p>

          </div>

          <div class="rrw-config-reason-list" id="rrw-pb-playbook-list">

            ${(state.playbooksConfig?.playbooks || []).length === 0

              ? '<div class="rrw-preview-panel"><p class="rrw-muted">No playbooks configured yet.</p></div>'

              : (state.playbooksConfig?.playbooks || []).map((playbook, index) => {

                const playbookCollapseKey = String(playbook.key || index);

                const isPlaybookCollapsed = state.playbooksCollapsed?.[playbookCollapseKey] !== false;

                const allReasons = (state.config?.reasons || []).filter((reason) => reason?.is_enabled !== false);

                const reasonLookup = new Map(allReasons.map((reason) => [String(reason.external_key || ""), reason]));

                const stepCards = (playbook.steps || []).map((step, stepIndex) => {

                  const stepCollapseKey = `${playbookCollapseKey}:${stepIndex}`;

                  const isStepCollapsed = state.playbookStepCollapsed?.[stepCollapseKey] !== false;

                  const stepType = String(step?.type || "remove").trim().toLowerCase();

                  const isRemove = stepType === "remove";

                  const isComment = stepType === "comment";

                  const isUsernote = stepType === "usernote";

                  const isApproveItem = stepType === "approve_item";

                  const isRemoveItem = stepType === "remove_item";

                  const isBan = stepType === "ban_user";

                  const isUnban = stepType === "unban_user";

                  const isFlair = stepType === "set_post_flair";

                  const isUserFlair = stepType === "set_user_flair";

                  const isSendModmail = stepType === "send_modmail";

                  const isDistinguishComment = stepType === "distinguish_comment";

                  const isLockItem = stepType === "lock_item";

                  const isUnlockItem = stepType === "unlock_item";

                  const selectedReasonKeys = Array.isArray(step.reason_keys)

                    ? step.reason_keys.map((value) => String(value || "").trim()).filter(Boolean)

                    : [];

                  const currentUsernoteType = String(step.note_type || "none").trim().toLowerCase() || "none";

                  const configuredPlaybookNoteTypes = Array.isArray(state.playbooksNoteTypes)

                    ? state.playbooksNoteTypes.map((value) => String(value || "").trim().toLowerCase()).filter(Boolean)

                    : ["none"];

                  const availablePlaybookNoteTypes = Array.from(new Set([...configuredPlaybookNoteTypes, currentUsernoteType]));

                  const usernoteTypeOptions = availablePlaybookNoteTypes

                    .map((value) => {

                      const label = String(state.playbooksNoteTypeLabels?.[String(value).toLowerCase()] || value);

                      return `<option value="${escapeHtml(value)}" ${value === currentUsernoteType ? "selected" : ""}>${escapeHtml(label)}</option>`;

                    })

                    .join("");

                  const selectedReasonSet = new Set(selectedReasonKeys);

                  const selectedReasons = selectedReasonKeys

                    .map((key) => reasonLookup.get(key))

                    .filter(Boolean);

                  const stepWarnings = [];

                  if (isRemove && !step.no_reason && selectedReasonKeys.length === 0) {

                    stepWarnings.push("Pick at least one removal reason, or enable 'Remove without sending reason'.");

                  }

                  if (isComment && String(step.source || "custom") === "custom" && !String(step.text_template || "").trim()) {

                    stepWarnings.push("Comment text template is empty.");

                  }

                  if (isComment && String(step.source || "custom") === "removal_reasons" && selectedReasonKeys.length === 0) {

                    stepWarnings.push("Pick at least one removal reason for comment source: removal_reasons.");

                  }

                  if (isUsernote && !String(step.text_template || "").trim()) {

                    stepWarnings.push("Usernote text template is empty.");

                  }

                  if (isBan && !String(step.ban_message_template || "").trim()) {

                    stepWarnings.push("Ban message template is empty.");

                  }

                  if (isSendModmail && !String(step.subject_template || "").trim()) {

                    stepWarnings.push("Modmail subject template is empty.");

                  }

                  if (isSendModmail && !String(step.body_template || "").trim()) {

                    stepWarnings.push("Modmail body template is empty.");

                  }

                  const stepWarningsHtml = stepWarnings

                    .map((message) => `<div class="rrw-warning">${escapeHtml(message)}</div>`)

                    .join("");

                  const dynamicBlockByKey = new Map();

                  selectedReasons.forEach((reason) => {

                    (reason.blocks || []).forEach((block) => {

                      if (!block || !block.key) {

                        return;

                      }

                      if (!["input", "textarea", "select"].includes(String(block.type || ""))) {

                        return;

                      }

                      if (!dynamicBlockByKey.has(block.key)) {

                        dynamicBlockByKey.set(block.key, block);

                      }

                    });

                  });

                  const removeInputFields = Array.from(dynamicBlockByKey.values())

                    .map((block) => {

                      const fieldKey = String(block.key || "").trim();

                      if (!fieldKey) {

                        return "";

                      }

                      const value = String(step?.inputs?.[fieldKey] ?? "");

                      const label = String(block.label || fieldKey);

                      if (block.type === "textarea") {

                        return `

                          <label class="rrw-field">

                            <span>${escapeHtml(label)}</span>

                            <textarea rows="2" data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="input_value" data-pb-step-input-key="${escapeHtml(fieldKey)}">${value}</textarea>

                          </label>

                        `;

                      }

                      if (block.type === "select") {

                        const options = blockOptions(block)

                          .map((opt) => `<option value="${escapeHtml(opt.value)}" ${opt.value === value ? "selected" : ""}>${escapeHtml(opt.label)}</option>`)

                          .join("");

                        return `

                          <label class="rrw-field">

                            <span>${escapeHtml(label)}</span>

                            <select data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="input_value" data-pb-step-input-key="${escapeHtml(fieldKey)}">

                              <option value="">- pick one -</option>

                              ${options}

                            </select>

                          </label>

                        `;

                      }

                      return `

                        <label class="rrw-field">

                          <span>${escapeHtml(label)}</span>

                          <input type="text" data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="input_value" data-pb-step-input-key="${escapeHtml(fieldKey)}" value="${escapeHtml(value)}" />

                        </label>

                      `;

                    })

                    .join("");



                  return `

                    <article class="rrw-preview-panel">

                      <div class="rrw-preview-panel__header">

                        <h4>Step ${stepIndex + 1} - ${escapeHtml(stepType)}</h4>

                        <div class="rrw-actions">

                          <button type="button" class="rrw-btn rrw-btn-secondary" data-pb-step-toggle="1" data-pb-index="${index}" data-pb-step-index="${stepIndex}">${isStepCollapsed ? "Expand" : "Collapse"}</button>

                          <button type="button" class="rrw-btn rrw-btn-secondary" data-pb-step-duplicate="1" data-pb-index="${index}" data-pb-step-index="${stepIndex}">Duplicate</button>

                          <button type="button" class="rrw-btn rrw-btn-secondary" data-pb-step-move="up" data-pb-index="${index}" data-pb-step-index="${stepIndex}" ${stepIndex === 0 ? "disabled" : ""}>Up</button>

                          <button type="button" class="rrw-btn rrw-btn-secondary" data-pb-step-move="down" data-pb-index="${index}" data-pb-step-index="${stepIndex}" ${stepIndex === (playbook.steps || []).length - 1 ? "disabled" : ""}>Down</button>

                          <button type="button" class="rrw-btn rrw-btn-danger" data-pb-step-delete="1" data-pb-index="${index}" data-pb-step-index="${stepIndex}">Delete</button>

                        </div>

                      </div>

                      ${stepWarningsHtml}

                      ${isStepCollapsed ? "" : `

                      <label class="rrw-field">

                        <span>Step type</span>

                        <select data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="type">

                          <option value="remove" ${stepType === "remove" ? "selected" : ""}>remove</option>

                          <option value="comment" ${stepType === "comment" ? "selected" : ""}>comment</option>

                          <option value="usernote" ${stepType === "usernote" ? "selected" : ""}>usernote</option>

                          <option value="lock_item" ${stepType === "lock_item" ? "selected" : ""}>lock_item</option>

                          <option value="unlock_item" ${stepType === "unlock_item" ? "selected" : ""}>unlock_item</option>

                          <option value="approve_item" ${stepType === "approve_item" ? "selected" : ""}>approve_item</option>

                          <option value="remove_item" ${stepType === "remove_item" ? "selected" : ""}>remove_item</option>

                          <option value="ban_user" ${stepType === "ban_user" ? "selected" : ""}>ban_user</option>

                          <option value="unban_user" ${stepType === "unban_user" ? "selected" : ""}>unban_user</option>

                          <option value="set_post_flair" ${stepType === "set_post_flair" ? "selected" : ""}>set_post_flair</option>

                          <option value="set_user_flair" ${stepType === "set_user_flair" ? "selected" : ""}>set_user_flair</option>

                          <option value="send_modmail" ${stepType === "send_modmail" ? "selected" : ""}>send_modmail</option>

                          <option value="distinguish_comment" ${stepType === "distinguish_comment" ? "selected" : ""}>distinguish_comment</option>

                        </select>

                      </label>

                      ${isComment ? `

                        <div class="rrw-config-grid">

                          <label class="rrw-field">

                            <span>Comment source</span>

                            <select data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="comment_source">

                              <option value="custom" ${String(step.source || "custom") === "custom" ? "selected" : ""}>custom text template</option>

                              <option value="removal_reasons" ${String(step.source || "custom") === "removal_reasons" ? "selected" : ""}>from removal reasons</option>

                            </select>

                          </label>

                          <label class="rrw-field">

                            <span>Comment as subreddit</span>

                            <select data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="comment_as_subreddit_mode">

                              <option value="inherit" ${typeof step.comment_as_subreddit === "boolean" ? "" : "selected"}>inherit global setting</option>

                              <option value="true" ${step.comment_as_subreddit === true ? "selected" : ""}>Post as u/${escapeHtml(state.subreddit)}-ModTeam (remove &amp; re-approve workaround)</option>

                              <option value="false" ${step.comment_as_subreddit === false ? "selected" : ""}>Post as yourself (normal)</option>

                            </select>

                          </label>

                        </div>

                        ${String(step.source || "custom") === "removal_reasons" ? `

                          <div class="rrw-field">

                            <span>Removal reasons</span>

                            <div class="rrw-checklist" data-pb-reason-list="${index}:${stepIndex}">

                              ${allReasons.length === 0

                                ? '<div class="rrw-muted">No removal reasons configured.</div>'

                                : allReasons.map((reason) => {

                                  const key = String(reason.external_key || "");

                                  return `

                                    <label class="rrw-check-item">

                                      <input type="checkbox" data-pb-step-reason="1" data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-reason-key="${escapeHtml(key)}" ${selectedReasonSet.has(key) ? "checked" : ""} />

                                      <span>${escapeHtml(reason.title || key)}</span>

                                    </label>

                                  `;

                                }).join("")

                              }

                            </div>

                          </div>

                          <div class="rrw-config-grid">

                            ${removeInputFields || '<p class="rrw-muted">Select reasons with fields to configure prefill values.</p>'}

                          </div>

                        ` : `

                          <label class="rrw-field">

                            <span>Text template (supports {author}, {subreddit}, {kind}, {permalink})</span>

                            <textarea rows="3" data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="text_template">${String(step.text_template || "")}</textarea>

                          </label>

                        `}

                        <div class="rrw-config-flag-row">

                          <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle${step.comment_as_subreddit !== false ? " rrw-field--disabled" : ""}" title="${step.comment_as_subreddit !== false ? "Sticky is not supported when commenting as subreddit" : ""}">

                            <input type="checkbox" data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="sticky" ${step.sticky ? "checked" : ""} ${step.comment_as_subreddit !== false ? "disabled" : ""} />

                            <span>Sticky mod comment (posts only)</span>

                          </label>

                          <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

                            <input type="checkbox" data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="lock_comment" ${step.lock_comment ? "checked" : ""} />

                            <span>Lock posted comment</span>

                          </label>

                        </div>

                      ` : ""}





                      ${isRemove ? `

                        <div class="rrw-field">

                          <span>Removal reasons</span>

                          <div class="rrw-checklist" data-pb-reason-list="${index}:${stepIndex}">

                            ${allReasons.length === 0

                              ? '<div class="rrw-muted">No removal reasons configured.</div>'

                              : allReasons.map((reason) => {

                                const key = String(reason.external_key || "");

                                return `

                                  <label class="rrw-check-item">

                                    <input type="checkbox" data-pb-step-reason="1" data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-reason-key="${escapeHtml(key)}" ${selectedReasonSet.has(key) ? "checked" : ""} />

                                    <span>${escapeHtml(reason.title || key)}</span>

                                  </label>

                                `;

                              }).join("")

                            }

                          </div>

                        </div>

                        <div class="rrw-config-grid">

                          <label class="rrw-field">

                            <span>Send mode</span>

                            <select data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="send_mode">

                              <option value="reply" ${normalizeRemovalSendMode(step.send_mode, "reply") === "reply" ? "selected" : ""}>reply</option>

                              <option value="pm" ${normalizeRemovalSendMode(step.send_mode, "reply") === "pm" ? "selected" : ""}>pm</option>

                              <option value="both" ${normalizeRemovalSendMode(step.send_mode, "reply") === "both" ? "selected" : ""}>both</option>

                              <option value="none" ${normalizeRemovalSendMode(step.send_mode, "reply") === "none" ? "selected" : ""}>none</option>

                            </select>

                          </label>

                          <label class="rrw-field">

                            <span>Comment as subreddit</span>

                            <select data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="comment_as_subreddit_mode">

                              <option value="inherit" ${typeof step.comment_as_subreddit === "boolean" ? "" : "selected"}>inherit global setting</option>

                              <option value="true" ${step.comment_as_subreddit === true ? "selected" : ""}>true</option>

                              <option value="false" ${step.comment_as_subreddit === false ? "selected" : ""}>false</option>

                            </select>

                          </label>

                        </div>

                        <div class="rrw-config-flag-row">

                          <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

                            <input type="checkbox" data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="skip_reddit_remove" ${step.skip_reddit_remove ? "checked" : ""} />

                            <span>Skip native Reddit remove</span>

                          </label>

                          <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

                            <input type="checkbox" data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="no_reason" ${step.no_reason ? "checked" : ""} />

                            <span>Remove without sending reason</span>

                          </label>

                        </div>

                        <div class="rrw-config-grid">

                          ${removeInputFields || '<p class="rrw-muted">Select reasons with fields to configure prefill values.</p>'}

                        </div>

                      ` : ""}



                      ${isUsernote ? `

                        <div class="rrw-config-grid">

                          <label class="rrw-field">

                            <span>Note type</span>

                            <select data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="note_type">

                              ${usernoteTypeOptions}

                            </select>

                          </label>

                        </div>

                        <label class="rrw-field">

                          <span>Text template (supports {author}, {subreddit}, {kind}, {permalink})</span>

                          <textarea rows="3" data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="text_template">${String(step.text_template || "")}</textarea>

                        </label>

                      ` : ""}



                      ${isBan ? `

                        <div class="rrw-config-grid">

                          <label class="rrw-field">

                            <span>Duration (days)</span>

                            <input type="number" min="1" data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="duration_days" value="${escapeHtml(String(Number.isFinite(Number(step.duration_days)) ? Number(step.duration_days) : 7))}" />

                          </label>

                        </div>

                        <label class="rrw-field">

                          <span>Ban message template (supports {author}, {subreddit}, {kind}, {permalink})</span>

                          <textarea rows="3" data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="ban_message_template">${String(step.ban_message_template || "")}</textarea>

                        </label>

                        <label class="rrw-field">

                          <span>Mod note (optional, visible only to mods in ban list â€” supports {author}, {subreddit}, {kind}, {permalink})</span>

                          <input type="text" data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="ban_note_template" value="${escapeHtml(String(step.ban_note_template || ""))}" />

                        </label>

                      ` : ""}



                      ${isFlair ? `

                        <label class="rrw-field">

                          <span>Post flair template</span>

                          <select data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="flair_template_id">

                            <option value="">- pick flair -</option>

                            ${(state.flairTemplates || []).map((flair) => {

                              const flairId = String(flair.id || "").trim();

                              const flairText = String(flair.text || flairId || "[unnamed flair]");

                              return `<option value="${escapeHtml(flairId)}" ${flairId === String(step.flair_template_id || "") ? "selected" : ""}>${escapeHtml(flairText)}</option>`;

                            }).join("")}

                          </select>

                        </label>

                      ` : ""}



                      ${isUserFlair ? `

                        <label class="rrw-field">

                          <span>User flair template ID</span>

                          <input type="text" data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="flair_template_id" value="${escapeHtml(String(step.flair_template_id || ""))}" placeholder="User flair template id" />

                        </label>

                      ` : ""}



                      ${isSendModmail ? `

                        <div class="rrw-config-grid">

                          <label class="rrw-field">

                            <span>Recipient</span>

                            <select data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="to_mode">

                              <option value="author" ${String(step.to_mode || "author") === "author" ? "selected" : ""}>target author</option>

                              <option value="custom" ${String(step.to_mode || "author") === "custom" ? "selected" : ""}>custom username</option>

                              <option value="subreddit" ${String(step.to_mode || "") === "subreddit" ? "selected" : ""}>subreddit modteam (internal)</option>

                            </select>

                          </label>

                          ${String(step.to_mode || "author") === "custom" ? `<label class="rrw-field"><span>Custom username</span><input type="text" data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="to_username" value="${escapeHtml(String(step.to_username || ""))}" /></label>` : ""}

                        </div>

                        <label class="rrw-field">

                          <span>Subject template (supports {author}, {subreddit}, {kind}, {permalink})</span>

                          <input type="text" data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="subject_template" value="${escapeHtml(String(step.subject_template || ""))}" />

                        </label>

                        <label class="rrw-field">

                          <span>Body template (supports {author}, {subreddit}, {kind}, {permalink})</span>

                          <textarea rows="3" data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="body_template">${String(step.body_template || "")}</textarea>

                        </label>

                        <div class="rrw-config-flag-row">

                          <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

                            <input type="checkbox" data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="include_permalink" ${step.include_permalink !== false ? "checked" : ""} />

                            <span>Append permalink context</span>

                          </label>

                          <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

                            <input type="checkbox" data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="auto_archive" ${step.auto_archive !== false ? "checked" : ""} />

                            <span>Auto-archive sent modmail</span>

                          </label>

                        </div>

                      ` : ""}



                      ${isRemoveItem ? `

                        <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

                          <input type="checkbox" data-pb-index="${index}" data-pb-step-index="${stepIndex}" data-pb-step-field="spam" ${step.spam ? "checked" : ""} />

                          <span>Mark as spam</span>

                        </label>

                      ` : ""}



                      ${isLockItem ? '<p class="rrw-muted">This step locks the current target item (post or comment). No additional settings required.</p>' : ""}

                      ${isUnlockItem ? '<p class="rrw-muted">This step unlocks the current target item (post or comment). No additional settings required.</p>' : ""}

                      ${isApproveItem ? '<p class="rrw-muted">This step approves the current target item. No additional settings required.</p>' : ""}

                      ${isUnban ? '<p class="rrw-muted">This step unbans the target author. No additional settings required.</p>' : ""}

                      ${isDistinguishComment ? '<p class="rrw-muted">This step distinguishes the current target if it is a comment.</p>' : ""}



                      `}

                    </article>

                  `;

                }).join("");



                return `

                <article class="rrw-config-reason-card" data-pb-index="${index}">

                  <div class="rrw-config-reason-head">

                    <div class="rrw-field">

                      <span>Title</span>

                      <div class="rrw-config-reason-title-row">

                        <input type="text" data-pb-index="${index}" data-pb-field="title" value="${escapeHtml(playbook.title)}" placeholder="Playbook title" />

                        <button type="button" class="rrw-btn rrw-btn-secondary" data-pb-toggle="1" data-pb-index="${index}">${isPlaybookCollapsed ? "Expand" : "Collapse"}</button>

                        <button type="button" class="rrw-btn rrw-btn-secondary" data-pb-move="up" data-pb-index="${index}" ${index === 0 ? "disabled" : ""}>Up</button>

                        <button type="button" class="rrw-btn rrw-btn-secondary" data-pb-move="down" data-pb-index="${index}" ${index === (state.playbooksConfig?.playbooks || []).length - 1 ? "disabled" : ""}>Down</button>

                        <button type="button" class="rrw-btn rrw-btn-danger" data-pb-delete="${index}">Delete</button>

                      </div>

                    </div>

                    ${isPlaybookCollapsed ? "" : `

                      <label class="rrw-field">

                        <span>Key</span>

                        <input type="text" data-pb-index="${index}" data-pb-field="key" value="${escapeHtml(playbook.key)}" placeholder="Playbook key" />

                      </label>

                    `}

                  </div>

                  ${isPlaybookCollapsed ? "" : `

                  <div class="rrw-config-grid">

                    <label class="rrw-field">

                      <span>Applies to</span>

                      <select data-pb-index="${index}" data-pb-field="applies_to">

                        <option value="both" ${playbook.applies_to === "both" ? "selected" : ""}>posts and comments</option>

                        <option value="posts" ${playbook.applies_to === "posts" ? "selected" : ""}>posts only</option>

                        <option value="comments" ${playbook.applies_to === "comments" ? "selected" : ""}>comments only</option>

                      </select>

                    </label>

                  </div>

                  <div class="rrw-config-flag-row">

                    <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

                      <input type="checkbox" data-pb-index="${index}" data-pb-field="is_enabled" ${playbook.is_enabled ? "checked" : ""} />

                      <span>Enabled</span>

                    </label>

                    <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

                      <input type="checkbox" data-pb-index="${index}" data-pb-field="confirm" ${playbook.confirm ? "checked" : ""} />

                      <span>Require confirmation</span>

                    </label>

                    <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

                      <input type="checkbox" data-pb-index="${index}" data-pb-field="stop_on_error" ${playbook.stop_on_error ? "checked" : ""} />

                      <span>Stop on first error</span>

                    </label>

                  </div>

                  <div class="rrw-preview-panel">

                    <div class="rrw-preview-panel__header">

                      <h4>Steps</h4>

                    </div>

                    ${stepCards || '<p class="rrw-muted">No steps yet. Add your first step below.</p>'}

                    <div class="rrw-actions rrw-ext-wiki-actions">

                      <button type="button" class="rrw-btn rrw-btn-secondary" data-pb-step-add="remove" data-pb-index="${index}">Add remove</button>

                      <button type="button" class="rrw-btn rrw-btn-secondary" data-pb-step-add="comment" data-pb-index="${index}">Add comment</button>

                      <button type="button" class="rrw-btn rrw-btn-secondary" data-pb-step-add="usernote" data-pb-index="${index}">Add usernote</button>

                      <button type="button" class="rrw-btn rrw-btn-secondary" data-pb-step-add="approve_item" data-pb-index="${index}">Add approve_item</button>

                      <button type="button" class="rrw-btn rrw-btn-secondary" data-pb-step-add="remove_item" data-pb-index="${index}">Add remove_item</button>

                      <button type="button" class="rrw-btn rrw-btn-secondary" data-pb-step-add="lock_item" data-pb-index="${index}">Add lock_item</button>

                      <button type="button" class="rrw-btn rrw-btn-secondary" data-pb-step-add="unlock_item" data-pb-index="${index}">Add unlock_item</button>

                      <button type="button" class="rrw-btn rrw-btn-secondary" data-pb-step-add="ban_user" data-pb-index="${index}">Add ban_user</button>

                      <button type="button" class="rrw-btn rrw-btn-secondary" data-pb-step-add="unban_user" data-pb-index="${index}">Add unban_user</button>

                      <button type="button" class="rrw-btn rrw-btn-secondary" data-pb-step-add="set_post_flair" data-pb-index="${index}">Add set_post_flair</button>

                      <button type="button" class="rrw-btn rrw-btn-secondary" data-pb-step-add="set_user_flair" data-pb-index="${index}">Add set_user_flair</button>

                      <button type="button" class="rrw-btn rrw-btn-secondary" data-pb-step-add="send_modmail" data-pb-index="${index}">Add send_modmail</button>

                      <button type="button" class="rrw-btn rrw-btn-secondary" data-pb-step-add="distinguish_comment" data-pb-index="${index}">Add distinguish_comment</button>

                    </div>

                    <details>

                      <summary class="rrw-muted">Advanced JSON preview</summary>

                      <textarea rows="6" readonly>${escapeHtml(JSON.stringify(playbook.steps || [], null, 2))}</textarea>

                    </details>

                  </div>

                  `}

                </article>

              `;

              }).join("")

            }

          </div>

        </section>

      ` : `

        ${state.extensionSettingsError ? `<div class="rrw-error">${escapeHtml(state.extensionSettingsError)}</div>` : ""}

        ${state.extensionSettingsStatus ? `<div class="rrw-success">${escapeHtml(state.extensionSettingsStatus)}</div>` : ""}

        <section class="rrw-preview-panel rrw-config-section">

          <div class="rrw-preview-panel__header">

            <h3>Runtime options</h3>

          </div>

          <div class="rrw-config-grid">

            <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

              <input type="checkbox" data-ext-setting="auto_close_on_remove" ${extensionSettings.auto_close_on_remove ? "checked" : ""} />

              <span>Auto-close overlay after successful remove</span>

            </label>

            <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

              <input type="checkbox" data-ext-setting="intercept_native_remove" ${extensionSettings.intercept_native_remove !== false ? "checked" : ""} />

              <span>Open ModBox when clicking Reddit native Remove</span>

            </label>

            <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

              <input type="checkbox" data-ext-setting="context_popup_enabled" ${extensionSettings.context_popup_enabled !== false ? "checked" : ""} />

              <span>Enable old Reddit context-popup button</span>

            </label>

            <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

              <input type="checkbox" data-ext-setting="comment_nuke_ignore_distinguished" ${extensionSettings.comment_nuke_ignore_distinguished ? "checked" : ""} />

              <span>Comment nuke: skip distinguished (mod/admin) comments</span>

            </label>

            <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

              <input type="checkbox" data-ext-setting="history_button_enabled" ${extensionSettings.history_button_enabled !== false ? "checked" : ""} />

              <span>Show (H)istory button on comments</span>

            </label>

            <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

              <input type="checkbox" data-ext-setting="comment_nuke_button_enabled" ${extensionSettings.comment_nuke_button_enabled !== false ? "checked" : ""} />

              <span>Show (R) Comment Nuke button on comments</span>

            </label>

            <label class="rrw-field">

              <span>Theme mode</span>

              <select data-ext-setting="theme_mode">

                <option value="auto" ${normalizeThemeMode(extensionSettings.theme_mode, "auto") === "auto" ? "selected" : ""}>Auto (old Reddit defaults to light)</option>

                <option value="light" ${normalizeThemeMode(extensionSettings.theme_mode, "auto") === "light" ? "selected" : ""}>Light</option>

                <option value="dark" ${normalizeThemeMode(extensionSettings.theme_mode, "auto") === "dark" ? "selected" : ""}>Dark</option>

              </select>

            </label>

            <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

              <input type="checkbox" data-ext-setting="queue_bar_open_in_new_tab" ${extensionSettings.queue_bar_open_in_new_tab ? "checked" : ""} />

              <span>Open queue bar links in a new tab</span>

            </label>

          </div>

          <div class="rrw-config-grid rrw-config-grid--queue-bar">

            <label class="rrw-field">

              <span>Queue bar scope</span>

              <select data-ext-setting="queue_bar_scope">

                <option value="current_subreddit" ${extensionSettings.queue_bar_scope === "current_subreddit" ? "selected" : ""}>Current subreddit</option>

                <option value="fixed_subreddit" ${extensionSettings.queue_bar_scope === "fixed_subreddit" ? "selected" : ""}>Specific moderated subreddit</option>

                <option value="mod_global" ${extensionSettings.queue_bar_scope === "mod_global" ? "selected" : ""}>All (r/mod)</option>

              </select>

            </label>

            <label class="rrw-field">

              <span>Fixed queue subreddit</span>

              <select data-ext-setting="queue_bar_fixed_subreddit" ${extensionSettings.queue_bar_scope !== "fixed_subreddit" || state.queueBarModeratedSubredditsLoading ? "disabled" : ""}>

                <option value="" ${!extensionSettings.queue_bar_fixed_subreddit ? "selected" : ""}>Select a moderated subreddit</option>

                ${(Array.isArray(state.queueBarModeratedSubreddits) ? state.queueBarModeratedSubreddits : [])

                  .map((sub) => `<option value="${escapeHtml(sub)}" ${String(extensionSettings.queue_bar_fixed_subreddit || "").toLowerCase() === String(sub).toLowerCase() ? "selected" : ""}>r/${escapeHtml(sub)}</option>`)

                  .join("")}

              </select>

              <small class="rrw-muted rrw-config-help">Used only when scope is Specific moderated subreddit.</small>

            </label>

            <label class="rrw-field">

              <span>Open on Reddit link host</span>

              <select data-ext-setting="queue_bar_link_host">

                <option value="extension_preference" ${extensionSettings.queue_bar_link_host === "extension_preference" ? "selected" : ""}>Follow extension preference</option>

                <option value="old_reddit" ${extensionSettings.queue_bar_link_host === "old_reddit" ? "selected" : ""}>Always old.reddit.com</option>

                <option value="new_reddit" ${extensionSettings.queue_bar_link_host === "new_reddit" ? "selected" : ""}>Always www.reddit.com</option>

              </select>

            </label>

            <label class="rrw-field">

              <span>Queue bar position</span>

              <select data-ext-setting="queue_bar_position">

                <option value="bottom_right" ${extensionSettings.queue_bar_position === "bottom_right" ? "selected" : ""}>Bottom right</option>

                <option value="bottom_left" ${extensionSettings.queue_bar_position === "bottom_left" ? "selected" : ""}>Bottom left</option>

              </select>

            </label>

            <label class="rrw-field rrw-field--checkbox rrw-config-inline-toggle">

              <input type="checkbox" data-ext-setting="queue_bar_use_old_reddit" ${extensionSettings.queue_bar_use_old_reddit ? "checked" : ""} />

              <span>When using extension preference, open queue links on old.reddit.com</span>

            </label>

          </div>

        </section>



        <section class="rrw-preview-panel rrw-config-section">

          <div class="rrw-preview-panel__header">

            <h3>Canned Replies (optional)</h3>

          </div>

          <p class="rrw-muted">Configure a wiki page with pre-written responses. Use <code>pagepath</code> for this subreddit or <code>r/SubName/pagepath</code> for any subreddit you moderate.</p>

          <div class="rrw-config-grid">

            <label class="rrw-field">

              <span>Canned replies wiki page</span>

              <input type="text" data-ext-setting="canned_replies_wiki_url" value="${escapeHtml(extensionSettings.canned_replies_wiki_url || "")}" placeholder="modbox/canned_replies or r/SubName/pagepath" />

              <small class="rrw-muted rrw-config-help">Wiki page URL for storing canned reply templates (YAML format)</small>

            </label>

          </div>

        </section>



        <section class="rrw-preview-panel rrw-config-section">

          <div class="rrw-preview-panel__header">

            <h3>Wiki backup (optional)</h3>

          </div>

          <p class="rrw-muted">Backup or restore settings to/from a subreddit wiki. Use <code>pagepath</code> for this subreddit or <code>r/SubName/pagepath</code> for any subreddit you moderate.</p>

          ${state.wikiBackupError ? `<div class="rrw-error">${escapeHtml(state.wikiBackupError)}</div>` : ""}

          ${state.wikiBackupStatus ? `<div class="rrw-success">${escapeHtml(state.wikiBackupStatus)}</div>` : ""}

          <div class="rrw-config-grid">

            <label class="rrw-field">

              <span>Wiki target</span>

              <input type="text" id="rrw-ext-wiki-page" value="${escapeHtml(state.wikiBackupPage || DEFAULT_EXTENSION_SETTINGS_WIKI_PAGE)}" placeholder="modbox/extensionsettings or r/SubName/pagepath" />

            </label>

          </div>

          <div class="rrw-actions rrw-ext-wiki-actions">

            <button type="button" class="rrw-btn rrw-btn-secondary" id="rrw-wiki-restore" ${state.wikiBackupLoading ? "disabled" : ""}>

              ${state.wikiBackupLoading ? "Loading&hellip;" : "Restore from wiki"}

            </button>

            <button type="button" class="rrw-btn rrw-btn-secondary" id="rrw-wiki-backup" ${state.wikiBackupLoading ? "disabled" : ""}>

              ${state.wikiBackupLoading ? "Saving&hellip;" : "Backup to wiki"}

            </button>

          </div>

        </section>

      `}

    </div>



    <footer class="rrw-removal-config-footer">

      ${activeTab === "reasons" || activeTab === "quick_actions" || activeTab === "playbooks" ? `

        <label class="rrw-field rrw-removal-config-note">

          <span>Wiki revision note</span>

          <input

            type="text"

            id="rrw-config-save-note"

            value="${escapeHtml(activeTab === "quick_actions" ? (state.quickActionsSaveNote || "") : activeTab === "playbooks" ? (state.playbooksSaveNote || "") : (state.saveNote || ""))}"

            placeholder="Optional revision note"

          />

        </label>

      ` : ""}

      <div class="rrw-actions">

        <button type="button" class="rrw-btn rrw-btn-secondary" id="rrw-config-cancel">Cancel</button>

        <button

          type="button"

          class="rrw-btn rrw-btn-primary"

          id="rrw-config-save"

          ${(activeTab === "reasons" ? state.saving : activeTab === "quick_actions" ? state.quickActionsSaving : activeTab === "playbooks" ? state.playbooksSaving : state.extensionSettingsSaving) ? "disabled" : ""}

        >

          ${(activeTab === "reasons" ? state.saving : activeTab === "quick_actions" ? state.quickActionsSaving : activeTab === "playbooks" ? state.playbooksSaving : state.extensionSettingsSaving)

            ? "Saving..."

            : (activeTab === "reasons" ? "Save removal reasons" : activeTab === "quick_actions" ? "Save quick actions" : activeTab === "playbooks" ? "Save playbooks" : "Save settings")}

        </button>

      </div>

    </footer>

  `;



  const nextBody = modal.querySelector(".rrw-removal-config-body");

  const nextQuickActionList = modal.querySelector("#rrw-qa-action-list");

  requestAnimationFrame(() => {

    if (nextBody instanceof HTMLElement && previousBodyScrollTop > 0) {

      nextBody.scrollTop = previousBodyScrollTop;

    }

    if (nextQuickActionList instanceof HTMLElement && previousQuickActionListScrollTop > 0) {

      nextQuickActionList.scrollTop = previousQuickActionListScrollTop;

    }

    modal.querySelectorAll("[data-pb-reason-list]").forEach((element) => {

      if (!(element instanceof HTMLElement)) {

        return;

      }

      const key = String(element.getAttribute("data-pb-reason-list") || "");

      if (!key || !previousPlaybookReasonChecklistScroll.has(key)) {

        return;

      }

      const previousScrollTop = Number(previousPlaybookReasonChecklistScroll.get(key) || 0);

      if (previousScrollTop > 0) {

        element.scrollTop = previousScrollTop;

      }

    });

  });



  backdrop.onclick = () => closeRemovalConfigEditor();

  modal.querySelector("#rrw-config-close")?.addEventListener("click", closeRemovalConfigEditor);

  modal.querySelector("#rrw-config-cancel")?.addEventListener("click", closeRemovalConfigEditor);

  modal.querySelectorAll("[data-config-tab]").forEach((button) => {

    button.addEventListener("click", (event) => {

      if (!removalConfigEditorState) {

        return;

      }

      const nextTab = String(event.currentTarget.getAttribute("data-config-tab") || "");

      removalConfigEditorState.activeTab = ["extension_settings", "quick_actions", "playbooks"].includes(nextTab) ? nextTab : "reasons";

      removalConfigEditorState.error = "";

      removalConfigEditorState.status = "";

      renderRemovalConfigEditor();

    });

  });

  modal.querySelector("#rrw-config-add-reason")?.addEventListener("click", () => {

    if (removalConfigEditorState) {

      removalConfigEditorState.reasonsUserEdited = true;

    }

    addRemovalConfigReason();

    renderRemovalConfigEditor();

  });

  modal.querySelector("#rrw-config-load-flair")?.addEventListener("click", () => {

    void loadRemovalConfigEditorFlairTemplates(true);

  });



  const saveNoteInput = modal.querySelector("#rrw-config-save-note");

  if (saveNoteInput instanceof HTMLInputElement) {

    saveNoteInput.addEventListener("input", (event) => {

      if (!removalConfigEditorState) {

        return;

      }

      if (removalConfigEditorState.activeTab === "quick_actions") {

        removalConfigEditorState.quickActionsSaveNote = String(event.target.value || "");

      } else if (removalConfigEditorState.activeTab === "playbooks") {

        removalConfigEditorState.playbooksSaveNote = String(event.target.value || "");

      } else {

        removalConfigEditorState.saveNote = String(event.target.value || "");

      }

    });

  }



  const extWikiPageInput = modal.querySelector("#rrw-ext-wiki-page");

  if (extWikiPageInput instanceof HTMLInputElement) {

    extWikiPageInput.addEventListener("input", (event) => {

      if (!removalConfigEditorState) {

        return;

      }

      removalConfigEditorState.wikiBackupPage = String(event.target.value || "").trim() || DEFAULT_EXTENSION_SETTINGS_WIKI_PAGE;

    });

  }



  modal.querySelectorAll("[data-ext-setting]").forEach((element) => {

    const applySetting = (event) => {

      if (!removalConfigEditorState) {

        return;

      }

      const key = String(event.currentTarget.getAttribute("data-ext-setting") || "");

      if (!key) {

        return;

      }

      if (!removalConfigEditorState.extensionSettings) {

        removalConfigEditorState.extensionSettings = {};

      }

      if (["auto_close_on_remove", "intercept_native_remove", "context_popup_enabled", "queue_bar_open_in_new_tab", "queue_bar_use_old_reddit", "comment_nuke_ignore_distinguished", "history_button_enabled", "comment_nuke_button_enabled"].includes(key)) {

        removalConfigEditorState.extensionSettings[key] = Boolean(event.target.checked);

      } else if (key === "theme_mode") {

        removalConfigEditorState.extensionSettings.theme_mode = normalizeThemeMode(event.target.value, "auto");

      } else if (key === "queue_bar_scope") {

        removalConfigEditorState.extensionSettings.queue_bar_scope = normalizeQueueBarScope(event.target.value, "current_subreddit");

      } else if (key === "queue_bar_fixed_subreddit") {

        const clean = normalizeSubreddit(event.target.value);

        removalConfigEditorState.extensionSettings.queue_bar_fixed_subreddit = clean || null;

      } else if (key === "queue_bar_link_host") {

        removalConfigEditorState.extensionSettings.queue_bar_link_host = normalizeQueueBarLinkHost(event.target.value, "extension_preference");

      } else if (key === "queue_bar_position") {

        const position = String(event.target.value || "").toLowerCase();

        removalConfigEditorState.extensionSettings.queue_bar_position = ["bottom_left", "bottom_right"].includes(position) ? position : "bottom_right";

      } else if (key === "canned_replies_wiki_url") {

        removalConfigEditorState.extensionSettings.canned_replies_wiki_url = String(event.target.value || "").trim();

      }

    };

    element.addEventListener("input", applySetting);

    element.addEventListener("change", (event) => {

      applySetting(event);

      renderRemovalConfigEditor();

    });

  });



  modal.querySelector("#rrw-wiki-backup")?.addEventListener("click", async () => {

    if (!removalConfigEditorState) {

      return;

    }

    const rawPage = String(removalConfigEditorState.wikiBackupPage || "").trim() || DEFAULT_EXTENSION_SETTINGS_WIKI_PAGE;

    const { subreddit: targetSub, page: targetPage } = parseWikiBackupTarget(rawPage, removalConfigEditorState.subreddit);

    if (!targetSub) {

      removalConfigEditorState.wikiBackupError = "Cannot determine subreddit for wiki backup.";

      renderRemovalConfigEditor();

      return;

    }

    removalConfigEditorState.wikiBackupLoading = true;

    removalConfigEditorState.wikiBackupError = "";

    removalConfigEditorState.wikiBackupStatus = "";

    renderRemovalConfigEditor();

    try {

      const docToSave = normalizeExtensionWikiSettingsDoc(

        { settings: removalConfigEditorState.extensionSettings },

        targetSub,

        targetPage,

      );

      await saveExtensionSettingsToWiki(targetSub, targetPage, docToSave, "backup from ModBox extension settings");

      await setExtensionSettingsWikiPagePreference(rawPage);

      removalConfigEditorState.wikiBackupStatus = `Backed up to wiki/${targetPage} on r/${targetSub}.`;

    } catch (error) {

      removalConfigEditorState.wikiBackupError = error instanceof Error ? error.message : String(error);

    } finally {

      if (removalConfigEditorState) {

        removalConfigEditorState.wikiBackupLoading = false;

        renderRemovalConfigEditor();

      }

    }

  });



  modal.querySelector("#rrw-wiki-restore")?.addEventListener("click", async () => {

    if (!removalConfigEditorState) {

      return;

    }

    const rawPage = String(removalConfigEditorState.wikiBackupPage || "").trim() || DEFAULT_EXTENSION_SETTINGS_WIKI_PAGE;

    const { subreddit: targetSub, page: targetPage } = parseWikiBackupTarget(rawPage, removalConfigEditorState.subreddit);

    if (!targetSub) {

      removalConfigEditorState.wikiBackupError = "Cannot determine subreddit for wiki restore.";

      renderRemovalConfigEditor();

      return;

    }

    removalConfigEditorState.wikiBackupLoading = true;

    removalConfigEditorState.wikiBackupError = "";

    removalConfigEditorState.wikiBackupStatus = "";

    renderRemovalConfigEditor();

    try {

      const loadedDoc = await loadExtensionSettingsFromWiki(targetSub, targetPage);

      if (!removalConfigEditorState) {

        return;

      }

      const s = loadedDoc.settings || {};

      removalConfigEditorState.extensionSettings = {

        auto_close_on_remove: typeof s.auto_close_on_remove === "boolean" ? s.auto_close_on_remove : false,

        intercept_native_remove: typeof s.intercept_native_remove === "boolean" ? s.intercept_native_remove : true,

        context_popup_enabled: typeof s.context_popup_enabled === "boolean" ? s.context_popup_enabled : true,

        theme_mode: normalizeThemeMode(s.theme_mode, "auto"),

        queue_bar_scope: normalizeQueueBarScope(s.queue_bar_scope, "current_subreddit"),

        queue_bar_fixed_subreddit: normalizeSubreddit(s.queue_bar_fixed_subreddit || "") || null,

        queue_bar_link_host: normalizeQueueBarLinkHost(s.queue_bar_link_host, "extension_preference"),

        queue_bar_use_old_reddit: typeof s.queue_bar_use_old_reddit === "boolean" ? s.queue_bar_use_old_reddit : false,

        queue_bar_open_in_new_tab:

          typeof s.queue_bar_open_in_new_tab === "boolean" ? s.queue_bar_open_in_new_tab : false,

        comment_nuke_ignore_distinguished:

          typeof s.comment_nuke_ignore_distinguished === "boolean" ? s.comment_nuke_ignore_distinguished : false,

        history_button_enabled: typeof s.history_button_enabled === "boolean" ? s.history_button_enabled : false,

        comment_nuke_button_enabled: typeof s.comment_nuke_button_enabled === "boolean" ? s.comment_nuke_button_enabled : false,

        canned_replies_wiki_url: String(s.canned_replies_wiki_url || "").trim(),

      };

      await setExtensionSettingsWikiPagePreference(rawPage);

      removalConfigEditorState.wikiBackupStatus = `Restored from wiki/${targetPage} on r/${targetSub}. Click Save settings to apply.`;

    } catch (error) {

      if (!removalConfigEditorState) {

        return;

      }

      removalConfigEditorState.wikiBackupError = error instanceof Error ? error.message : String(error);

    } finally {

      if (removalConfigEditorState) {

        removalConfigEditorState.wikiBackupLoading = false;

        renderRemovalConfigEditor();

      }

    }

  });



    // (Removed duplicate block syncing [data-reason-field] values. Only event-driven handler remains.)



  modal.querySelectorAll("[data-reason-field]").forEach((element) => {

    const applyChange = (event) => {

      if (!removalConfigEditorState) {

        return;

      }

      const index = Number.parseInt(event.currentTarget.getAttribute("data-reason-index") || "", 10);

      const field = String(event.currentTarget.getAttribute("data-reason-field") || "");

      if (!Number.isFinite(index) || !field) {

        return;

      }

      // For suggestedNoteText, update state directly without rerender

      if (field === "suggestedNoteText") {

        const value = String(event.target.value || "");

        const reason = removalConfigEditorState.config?.reasons?.[index];

        if (reason) {

          reason.suggestedNoteText = value;

        }

        return;

      }

      // For suggestedNoteType, update state directly without rerender

      if (field === "suggestedNoteType") {

        const value = String(event.target.value || "none").trim() || "none";

        const reason = removalConfigEditorState.config?.reasons?.[index];

        if (reason) {

          reason.suggestedNoteType = value;

        }

        return;

      }

      updateRemovalConfigEditor((current) => {

        const reason = current.reasons[index];

        if (!reason) {

          return;

        }

        if (["is_enabled", "sticky_comment", "lock_post"].includes(field)) {

          reason[field] = Boolean(event.target.checked);

          return;

        }

        if (field === "applies_to") {

          reason.applies_to = normalizeRemovalAppliesTo(event.target.value, "both");

          return;

        }

        if (field === "default_send_mode") {

          reason.default_send_mode = normalizeRemovalSendMode(event.target.value, current.global_settings.default_send_mode || "reply");

          return;

        }

        if (field === "flair_id_picker") {

          reason.flair_id = String(event.target.value || "").trim() || null;

          return;

        }

        const value = String(event.target.value || "");

        reason[field] = value.trim() ? value : (field === "flair_id" ? null : value);

      });

      if (removalConfigEditorState) {

        removalConfigEditorState.reasonsUserEdited = true;

      }

    };



    element.addEventListener("input", applyChange);

    element.addEventListener("change", (event) => {

      // Only rerender for fields that are not suggestedNoteText

      const field = String(event.currentTarget.getAttribute("data-reason-field") || "");

      applyChange(event);

      if (field !== "suggestedNoteText") {

        renderRemovalConfigEditor();

      }

    });

  });



  modal.querySelectorAll("[data-reason-delete]").forEach((button) => {

    button.addEventListener("click", (event) => {

      const index = Number.parseInt(event.currentTarget.getAttribute("data-reason-delete") || "", 10);

      if (!Number.isFinite(index)) {

        return;

      }

      updateRemovalConfigEditor((current) => {

        current.reasons = current.reasons.filter((_, reasonIndex) => reasonIndex !== index)

          .map((reason, reasonIndex) => ({ ...reason, position: (reasonIndex + 1) * 10 }));

      });

      if (removalConfigEditorState) {

        removalConfigEditorState.reasonsUserEdited = true;

      }

      renderRemovalConfigEditor();

    });

  });



  modal.querySelectorAll("[data-reason-move]").forEach((button) => {

    button.addEventListener("click", (event) => {

      const index = Number.parseInt(event.currentTarget.getAttribute("data-reason-index") || "", 10);

      const direction = String(event.currentTarget.getAttribute("data-reason-move") || "");

      if (!Number.isFinite(index) || !direction) {

        return;

      }

      moveRemovalConfigReason(index, direction);

      if (removalConfigEditorState) {

        removalConfigEditorState.reasonsUserEdited = true;

      }

      renderRemovalConfigEditor();

    });

  });



  modal.querySelectorAll("[data-reason-body]").forEach((textarea) => {

    textarea.addEventListener("input", (event) => {

      const index = Number.parseInt(event.currentTarget.getAttribute("data-reason-index") || "", 10);

      if (!Number.isFinite(index) || !removalConfigEditorState) {

        return;

      }

      removalConfigEditorState.toolboxDrafts[index] = String(event.target.value || "");

    });

    textarea.addEventListener("blur", (event) => {

      const index = Number.parseInt(event.currentTarget.getAttribute("data-reason-index") || "", 10);

      if (!Number.isFinite(index) || !removalConfigEditorState) {

        return;

      }

      const draft = String(event.target.value || "");

      updateRemovalConfigEditor((current) => {

        if (!current.reasons[index]) {

          return;

        }

        current.reasons[index].blocks = parseToolboxBodyToBlocks(draft);

      });

      if (removalConfigEditorState) {

        removalConfigEditorState.reasonsUserEdited = true;

      }

      delete removalConfigEditorState.toolboxDrafts[index];

      renderRemovalConfigEditor();

    });

  });



  // Quick Actions event handlers

  modal.querySelector("#rrw-qa-add-action")?.addEventListener("click", () => {

    if (!removalConfigEditorState) {

      return;

    }

    const actions = removalConfigEditorState.quickActionsConfig?.actions;

    if (!Array.isArray(actions)) {

      return;

    }

    const newIndex = actions.length;

    actions.push(normalizeQuickAction({}, newIndex));

    renderRemovalConfigEditor();

  });



  modal.querySelector("#rrw-qa-import-toolbox")?.addEventListener("click", async () => {

    if (!removalConfigEditorState) {

      return;

    }

    removalConfigEditorState.quickActionsImporting = true;

    removalConfigEditorState.quickActionsError = "";

    removalConfigEditorState.quickActionsStatus = "";

    renderRemovalConfigEditor();

    try {

      const imported = await importToolboxQuickActions(removalConfigEditorState.subreddit);

      if (!removalConfigEditorState) {

        return;

      }

      if (imported.length === 0) {

        removalConfigEditorState.quickActionsError = "No quick actions found in Toolbox wiki page.";

      } else {

        const existingActions = Array.isArray(removalConfigEditorState.quickActionsConfig?.actions)

          ? removalConfigEditorState.quickActionsConfig.actions

          : [];



        let useOverwrite = false;

        if (existingActions.length > 0) {

          const confirmOverwriteMessage = [

            `Toolbox import found ${imported.length} action${imported.length !== 1 ? "s" : ""}.`,

            `You already have ${existingActions.length} local action${existingActions.length !== 1 ? "s" : ""}.`,

            "",

            "Click OK to overwrite existing actions.",

            "Click Cancel to merge and keep existing actions (dedupe by key/title).",

          ].join("\n");

          useOverwrite = window.confirm(confirmOverwriteMessage);

        }



        if (useOverwrite) {

          removalConfigEditorState.quickActionsConfig = normalizeQuickActionsDoc(

            { ...removalConfigEditorState.quickActionsConfig, actions: imported },

            removalConfigEditorState.subreddit,

          );

          removalConfigEditorState.quickActionsStatus = `Imported ${imported.length} action${imported.length !== 1 ? "s" : ""} from Toolbox (overwrite). Review and save to keep.`;

        } else {

          const mergeResult = mergeQuickActionsWithDedup(existingActions, imported);

          removalConfigEditorState.quickActionsConfig = normalizeQuickActionsDoc(

            { ...removalConfigEditorState.quickActionsConfig, actions: mergeResult.actions },

            removalConfigEditorState.subreddit,

          );

          removalConfigEditorState.quickActionsStatus = `Imported ${imported.length} action${imported.length !== 1 ? "s" : ""} from Toolbox: ${mergeResult.addedCount} added, ${mergeResult.skippedCount} duplicate${mergeResult.skippedCount !== 1 ? "s" : ""} skipped. Review and save to keep.`;

        }

      }

    } catch (error) {

      if (removalConfigEditorState) {

        removalConfigEditorState.quickActionsError = error instanceof Error ? error.message : String(error);

      }

    } finally {

      if (removalConfigEditorState) {

        removalConfigEditorState.quickActionsImporting = false;

        renderRemovalConfigEditor();

      }

    }

  });



  modal.querySelectorAll("[data-qa-field]").forEach((element) => {

    const applyQaChange = (event) => {

      if (!removalConfigEditorState) {

        return;

      }

      const index = Number.parseInt(String(event.currentTarget.getAttribute("data-qa-index") || ""), 10);

      const field = String(event.currentTarget.getAttribute("data-qa-field") || "");

      if (!Number.isFinite(index) || !field || !removalConfigEditorState.quickActionsConfig) {

        return;

      }

      const action = removalConfigEditorState.quickActionsConfig.actions[index];

      if (!action) {

        return;

      }

      if (["sticky", "mod_only", "comment_as_subreddit", "lock_post"].includes(field)) {

        action[field] = Boolean(event.target.checked);

      } else {

        action[field] = String(event.target.value || "");

      }

    };

    element.addEventListener("input", applyQaChange);

    element.addEventListener("change", (event) => {

      applyQaChange(event);

      if (element.tagName === "SELECT" || element.type === "checkbox") {

        renderRemovalConfigEditor();

      }

    });

  });



  modal.querySelectorAll("[data-qa-delete]").forEach((button) => {

    button.addEventListener("click", (event) => {

      const index = Number.parseInt(String(event.currentTarget.getAttribute("data-qa-delete") || ""), 10);

      if (!Number.isFinite(index) || !removalConfigEditorState?.quickActionsConfig) {

        return;

      }

      removalConfigEditorState.quickActionsConfig.actions = removalConfigEditorState.quickActionsConfig.actions

        .filter((_, i) => i !== index)

        .map((a, i) => ({ ...a, position: (i + 1) * 10 }));

      renderRemovalConfigEditor();

    });

  });



  modal.querySelectorAll("[data-qa-move]").forEach((button) => {

    button.addEventListener("click", (event) => {

      const index = Number.parseInt(String(event.currentTarget.getAttribute("data-qa-index") || ""), 10);

      const direction = String(event.currentTarget.getAttribute("data-qa-move") || "");

      if (!Number.isFinite(index) || !removalConfigEditorState?.quickActionsConfig) {

        return;

      }

      const actions = removalConfigEditorState.quickActionsConfig.actions;

      const swapIndex = direction === "up" ? index - 1 : index + 1;

      if (swapIndex < 0 || swapIndex >= actions.length) {

        return;

      }

      [actions[index], actions[swapIndex]] = [actions[swapIndex], actions[index]];

      actions.forEach((a, i) => { a.position = (i + 1) * 10; });

      renderRemovalConfigEditor();

    });

  });



  // Playbooks event handlers

  modal.querySelector("#rrw-pb-add-playbook")?.addEventListener("click", () => {

    if (!removalConfigEditorState?.playbooksConfig) {

      return;

    }

    removalConfigEditorState.playbooksUserEdited = true;

    const items = removalConfigEditorState.playbooksConfig.playbooks;

    const newIndex = items.length;

    items.push(normalizePlaybook({}, newIndex));

    renderRemovalConfigEditor();

  });



  modal.querySelectorAll("[data-pb-toggle]").forEach((button) => {

    button.addEventListener("click", (event) => {

      if (!removalConfigEditorState?.playbooksConfig) {

        return;

      }

      const index = Number.parseInt(String(event.currentTarget.getAttribute("data-pb-index") || ""), 10);

      if (!Number.isFinite(index)) {

        return;

      }

      const playbook = removalConfigEditorState.playbooksConfig.playbooks[index];

      if (!playbook) {

        return;

      }

      if (!removalConfigEditorState.playbooksCollapsed || typeof removalConfigEditorState.playbooksCollapsed !== "object") {

        removalConfigEditorState.playbooksCollapsed = {};

      }

      const collapseKey = String(playbook.key || index);

      const isCollapsed = removalConfigEditorState.playbooksCollapsed[collapseKey] !== false;

      removalConfigEditorState.playbooksCollapsed[collapseKey] = !isCollapsed;

      renderRemovalConfigEditor();

    });

  });



  modal.querySelectorAll("[data-pb-field]").forEach((element) => {

    const applyPlaybookChange = (event) => {

      if (!removalConfigEditorState?.playbooksConfig) {

        return;

      }

      const index = Number.parseInt(String(event.currentTarget.getAttribute("data-pb-index") || ""), 10);

      const field = String(event.currentTarget.getAttribute("data-pb-field") || "");

      if (!Number.isFinite(index) || !field) {

        return;

      }

      const playbook = removalConfigEditorState.playbooksConfig.playbooks[index];

      if (!playbook) {

        return;

      }



      removalConfigEditorState.playbooksUserEdited = true;

      if (["is_enabled", "confirm", "stop_on_error"].includes(field)) {

        playbook[field] = Boolean(event.target.checked);

        return;

      }

      if (field === "applies_to") {

        playbook.applies_to = normalizeRemovalAppliesTo(event.target.value, "both");

        return;

      }

      playbook[field] = String(event.target.value || "");

    };



    element.addEventListener("input", applyPlaybookChange);

    element.addEventListener("change", (event) => {

      applyPlaybookChange(event);

      if (element.tagName === "SELECT" || element.type === "checkbox") {

        renderRemovalConfigEditor();

      }

    });

  });



  modal.querySelectorAll("[data-pb-step-add]").forEach((button) => {

    button.addEventListener("click", (event) => {

      if (!removalConfigEditorState?.playbooksConfig) {

        return;

      }

      const index = Number.parseInt(String(event.currentTarget.getAttribute("data-pb-index") || ""), 10);

      const type = String(event.currentTarget.getAttribute("data-pb-step-add") || "").trim().toLowerCase();

      if (!Number.isFinite(index) || !type) {

        return;

      }

      const playbook = removalConfigEditorState.playbooksConfig.playbooks[index];

      if (!playbook) {

        return;

      }

      const nextStep = normalizePlaybookStep({ type });

      if (!nextStep) {

        return;

      }

      removalConfigEditorState.playbooksUserEdited = true;

      playbook.steps = Array.isArray(playbook.steps) ? playbook.steps : [];

      playbook.steps.push(nextStep);

      renderRemovalConfigEditor();

    });

  });



  modal.querySelectorAll("[data-pb-step-delete]").forEach((button) => {

    button.addEventListener("click", (event) => {

      if (!removalConfigEditorState?.playbooksConfig) {

        return;

      }

      const index = Number.parseInt(String(event.currentTarget.getAttribute("data-pb-index") || ""), 10);

      const stepIndex = Number.parseInt(String(event.currentTarget.getAttribute("data-pb-step-index") || ""), 10);

      if (!Number.isFinite(index) || !Number.isFinite(stepIndex)) {

        return;

      }

      const playbook = removalConfigEditorState.playbooksConfig.playbooks[index];

      if (!playbook || !Array.isArray(playbook.steps)) {

        return;

      }

      removalConfigEditorState.playbooksUserEdited = true;

      playbook.steps = playbook.steps.filter((_, i) => i !== stepIndex);

      renderRemovalConfigEditor();

    });

  });



  modal.querySelectorAll("[data-pb-step-toggle]").forEach((button) => {

    button.addEventListener("click", (event) => {

      if (!removalConfigEditorState?.playbooksConfig) {

        return;

      }

      const index = Number.parseInt(String(event.currentTarget.getAttribute("data-pb-index") || ""), 10);

      const stepIndex = Number.parseInt(String(event.currentTarget.getAttribute("data-pb-step-index") || ""), 10);

      if (!Number.isFinite(index) || !Number.isFinite(stepIndex)) {

        return;

      }

      const playbook = removalConfigEditorState.playbooksConfig.playbooks[index];

      const step = playbook?.steps?.[stepIndex];

      if (!playbook || !step) {

        return;

      }

      if (!removalConfigEditorState.playbookStepCollapsed || typeof removalConfigEditorState.playbookStepCollapsed !== "object") {

        removalConfigEditorState.playbookStepCollapsed = {};

      }

      const collapseKey = `${String(playbook.key || index)}:${stepIndex}`;

      const isCollapsed = removalConfigEditorState.playbookStepCollapsed[collapseKey] !== false;

      removalConfigEditorState.playbookStepCollapsed[collapseKey] = isCollapsed ? false : true;

      renderRemovalConfigEditor();

    });

  });



  modal.querySelectorAll("[data-pb-step-duplicate]").forEach((button) => {

    button.addEventListener("click", (event) => {

      if (!removalConfigEditorState?.playbooksConfig) {

        return;

      }

      const index = Number.parseInt(String(event.currentTarget.getAttribute("data-pb-index") || ""), 10);

      const stepIndex = Number.parseInt(String(event.currentTarget.getAttribute("data-pb-step-index") || ""), 10);

      if (!Number.isFinite(index) || !Number.isFinite(stepIndex)) {

        return;

      }

      const playbook = removalConfigEditorState.playbooksConfig.playbooks[index];

      const step = playbook?.steps?.[stepIndex];

      if (!playbook || !step || !Array.isArray(playbook.steps)) {

        return;

      }

      const clonedStep = normalizePlaybookStep(JSON.parse(JSON.stringify(step)));

      if (!clonedStep) {

        return;

      }

      removalConfigEditorState.playbooksUserEdited = true;

      playbook.steps.splice(stepIndex + 1, 0, clonedStep);

      renderRemovalConfigEditor();

    });

  });



  modal.querySelectorAll("[data-pb-step-move]").forEach((button) => {

    button.addEventListener("click", (event) => {

      if (!removalConfigEditorState?.playbooksConfig) {

        return;

      }

      const index = Number.parseInt(String(event.currentTarget.getAttribute("data-pb-index") || ""), 10);

      const stepIndex = Number.parseInt(String(event.currentTarget.getAttribute("data-pb-step-index") || ""), 10);

      const direction = String(event.currentTarget.getAttribute("data-pb-step-move") || "");

      if (!Number.isFinite(index) || !Number.isFinite(stepIndex) || !direction) {

        return;

      }

      const playbook = removalConfigEditorState.playbooksConfig.playbooks[index];

      if (!playbook || !Array.isArray(playbook.steps)) {

        return;

      }

      const swapIndex = direction === "up" ? stepIndex - 1 : stepIndex + 1;

      if (swapIndex < 0 || swapIndex >= playbook.steps.length) {

        return;

      }

      removalConfigEditorState.playbooksUserEdited = true;

      [playbook.steps[stepIndex], playbook.steps[swapIndex]] = [playbook.steps[swapIndex], playbook.steps[stepIndex]];

      renderRemovalConfigEditor();

    });

  });



  modal.querySelectorAll("[data-pb-step-reason]").forEach((element) => {

    element.addEventListener("change", (event) => {

      if (!removalConfigEditorState?.playbooksConfig) {

        return;

      }

      const index = Number.parseInt(String(event.currentTarget.getAttribute("data-pb-index") || ""), 10);

      const stepIndex = Number.parseInt(String(event.currentTarget.getAttribute("data-pb-step-index") || ""), 10);

      const reasonKey = String(event.currentTarget.getAttribute("data-reason-key") || "").trim();

      if (!Number.isFinite(index) || !Number.isFinite(stepIndex) || !reasonKey) {

        return;

      }

      const playbook = removalConfigEditorState.playbooksConfig.playbooks[index];

      const step = playbook?.steps?.[stepIndex];

      if (!playbook || !step) {

        return;

      }

      const next = new Set(Array.isArray(step.reason_keys) ? step.reason_keys.map((value) => String(value || "").trim()).filter(Boolean) : []);

      if (event.target.checked) {

        next.add(reasonKey);

      } else {

        next.delete(reasonKey);

      }

      removalConfigEditorState.playbooksUserEdited = true;

      step.reason_keys = Array.from(next);

      renderRemovalConfigEditor();

    });

  });



  modal.querySelectorAll("[data-pb-step-field]").forEach((element) => {

    const applyStepFieldChange = (event) => {

      if (!removalConfigEditorState?.playbooksConfig) {

        return;

      }

      const index = Number.parseInt(String(event.currentTarget.getAttribute("data-pb-index") || ""), 10);

      const stepIndex = Number.parseInt(String(event.currentTarget.getAttribute("data-pb-step-index") || ""), 10);

      const field = String(event.currentTarget.getAttribute("data-pb-step-field") || "");

      if (!Number.isFinite(index) || !Number.isFinite(stepIndex) || !field) {

        return;

      }

      const playbook = removalConfigEditorState.playbooksConfig.playbooks[index];

      const step = playbook?.steps?.[stepIndex];

      if (!playbook || !step) {

        return;

      }



      removalConfigEditorState.playbooksUserEdited = true;

      removalConfigEditorState.playbooksError = "";



      if (field === "type") {

        const nextType = String(event.target.value || "").trim().toLowerCase();

        const normalized = normalizePlaybookStep({ type: nextType });

        if (normalized) {

          playbook.steps[stepIndex] = normalized;

        }

        return;

      }



      if (field === "send_mode") {

        step.send_mode = normalizeRemovalSendMode(event.target.value, "reply");

        return;

      }



      if (field === "comment_source") {

        const source = String(event.target.value || "custom").trim().toLowerCase();

        step.source = source === "removal_reasons" ? "removal_reasons" : "custom";

        return;

      }



      if (field === "to_mode") {

        const mode = String(event.target.value || "author").trim().toLowerCase();

        step.to_mode = mode === "custom" ? "custom" : mode === "subreddit" ? "subreddit" : "author";

        return;

      }



      if (["skip_reddit_remove", "no_reason", "sticky", "lock_comment", "include_permalink", "auto_archive", "spam"].includes(field)) {

        step[field] = Boolean(event.target.checked);

        return;

      }



      if (field === "comment_as_subreddit_mode") {

        const mode = String(event.target.value || "inherit").trim().toLowerCase();

        if (mode === "true") {

          step.comment_as_subreddit = true;

        } else if (mode === "false") {

          step.comment_as_subreddit = false;

        } else {

          step.comment_as_subreddit = null;

        }

        return;

      }



      if (field === "input_value") {

        const inputKey = String(event.currentTarget.getAttribute("data-pb-step-input-key") || "").trim();

        if (!inputKey) {

          return;

        }

        if (!step.inputs || typeof step.inputs !== "object" || Array.isArray(step.inputs)) {

          step.inputs = {};

        }

        const value = String(event.target.value || "");

        if (!value.trim()) {

          delete step.inputs[inputKey];

        } else {

          step.inputs[inputKey] = value;

        }

        return;

      }



      if (field === "duration_days") {

        const parsed = Number.parseInt(String(event.target.value || ""), 10);

        step.duration_days = Number.isFinite(parsed) && parsed > 0 ? parsed : 7;

        return;

      }



      if (["note_type", "text_template", "ban_message_template", "ban_note_template", "flair_template_id", "to_username", "subject_template", "body_template"].includes(field)) {

        step[field] = String(event.target.value || "");

      }

    };



    element.addEventListener("input", applyStepFieldChange);

    element.addEventListener("change", (event) => {

      applyStepFieldChange(event);

      if (element.tagName === "SELECT" || element.type === "checkbox") {

        renderRemovalConfigEditor();

      }

    });

  });



  modal.querySelectorAll("[data-pb-delete]").forEach((button) => {

    button.addEventListener("click", (event) => {

      const index = Number.parseInt(String(event.currentTarget.getAttribute("data-pb-delete") || ""), 10);

      if (!Number.isFinite(index) || !removalConfigEditorState?.playbooksConfig) {

        return;

      }

      removalConfigEditorState.playbooksUserEdited = true;

      removalConfigEditorState.playbooksConfig.playbooks = removalConfigEditorState.playbooksConfig.playbooks

        .filter((_, i) => i !== index)

        .map((item, i) => ({ ...item, position: (i + 1) * 10 }));

      renderRemovalConfigEditor();

    });

  });



  modal.querySelectorAll("[data-pb-move]").forEach((button) => {

    button.addEventListener("click", (event) => {

      const index = Number.parseInt(String(event.currentTarget.getAttribute("data-pb-index") || ""), 10);

      const direction = String(event.currentTarget.getAttribute("data-pb-move") || "");

      if (!Number.isFinite(index) || !removalConfigEditorState?.playbooksConfig) {

        return;

      }

      removalConfigEditorState.playbooksUserEdited = true;

      const items = removalConfigEditorState.playbooksConfig.playbooks;

      const swapIndex = direction === "up" ? index - 1 : index + 1;

      if (swapIndex < 0 || swapIndex >= items.length) {

        return;

      }

      [items[index], items[swapIndex]] = [items[swapIndex], items[index]];

      items.forEach((item, i) => { item.position = (i + 1) * 10; });

      renderRemovalConfigEditor();

    });

  });



  // Use event delegation so the handler survives innerHTML replacement on re-renders.

  // Without this, a re-render triggered by a change/blur event between mousedown and mouseup

  // destroys the button node and the click is lost, requiring a second click.

  if (!modal.dataset.saveListenerAttached) {

    modal.dataset.saveListenerAttached = "1";

    modal.addEventListener("click", async (event) => {

      if (!event.target.closest("#rrw-config-save")) return;

      if (!removalConfigEditorState) {

        return;

      }



      if (removalConfigEditorState.activeTab === "extension_settings") {

      try {

        removalConfigEditorState.extensionSettingsSaving = true;

        removalConfigEditorState.extensionSettingsError = "";

        removalConfigEditorState.extensionSettingsStatus = "";

        renderRemovalConfigEditor();



        const s = removalConfigEditorState.extensionSettings || {};

        const autoClose = typeof s.auto_close_on_remove === "boolean" ? s.auto_close_on_remove : false;

        const interceptNative = typeof s.intercept_native_remove === "boolean" ? s.intercept_native_remove : true;

        const contextPopup = typeof s.context_popup_enabled === "boolean" ? s.context_popup_enabled : true;

        const queueScope = normalizeQueueBarScope(s.queue_bar_scope, "current_subreddit");

        const fixedSubreddit = normalizeSubreddit(s.queue_bar_fixed_subreddit || "") || null;

        const linkHost = normalizeQueueBarLinkHost(s.queue_bar_link_host, "extension_preference");

        const useOldReddit = typeof s.queue_bar_use_old_reddit === "boolean" ? s.queue_bar_use_old_reddit : false;

        const openInNewTab = typeof s.queue_bar_open_in_new_tab === "boolean" ? s.queue_bar_open_in_new_tab : false;

        const queuePosition = ["bottom_left", "bottom_right"].includes(String(s.queue_bar_position || "")) ? s.queue_bar_position : "bottom_right";

        const themeMode = normalizeThemeMode(s.theme_mode, "auto");

        const ignoreDistinguished = typeof s.comment_nuke_ignore_distinguished === "boolean" ? s.comment_nuke_ignore_distinguished : false;

        const historyButtonEnabled = typeof s.history_button_enabled === "boolean" ? s.history_button_enabled : true;

        const commentNukeButtonEnabled = typeof s.comment_nuke_button_enabled === "boolean" ? s.comment_nuke_button_enabled : true;

        const cannedRepliesWikiUrl = String(s.canned_replies_wiki_url || "").trim() || "";



        await ext.storage.sync.set({

          [AUTO_CLOSE_KEY]: autoClose,

          [INTERCEPT_NATIVE_REMOVE_KEY]: interceptNative,

          [CONTEXT_POPUP_ENABLED_KEY]: contextPopup,

          [QUEUE_BAR_SCOPE_KEY]: queueScope,

          [QUEUE_BAR_FIXED_SUBREDDIT_KEY]: fixedSubreddit,

          [QUEUE_BAR_LINK_HOST_KEY]: linkHost,

          [QUEUE_BAR_USE_OLD_REDDIT_KEY]: useOldReddit,

          [QUEUE_BAR_OPEN_IN_NEW_TAB_KEY]: openInNewTab,

          [QUEUE_BAR_POSITION_KEY]: queuePosition,

          [THEME_MODE_KEY]: themeMode,

          [COMMENT_NUKE_IGNORE_DISTINGUISHED_KEY]: ignoreDistinguished,

          [HISTORY_BUTTON_ENABLED_KEY]: historyButtonEnabled,

          [COMMENT_NUKE_BUTTON_ENABLED_KEY]: commentNukeButtonEnabled,

          [CANNED_REPLIES_WIKI_URL_KEY]: cannedRepliesWikiUrl,

        });



        // Clear the cache so getPanelSettingsCached will fetch fresh settings

        panelSettingsPromise = null;

        clearQueueBarContextCache();



        // Update runtime position variable

        queueBarPosition = queuePosition;



        await applyExtensionSettingsToRuntime({

          intercept_native_remove: interceptNative,

          context_popup_enabled: contextPopup,

          theme_mode: themeMode,

          comment_nuke_ignore_distinguished: ignoreDistinguished,

          history_button_enabled: historyButtonEnabled,

          comment_nuke_button_enabled: commentNukeButtonEnabled,

        });

        await refreshQueueBar(true);



        removalConfigEditorState.extensionSettingsStatus = "Settings saved.";

      } catch (error) {

        removalConfigEditorState.extensionSettingsError = error instanceof Error ? error.message : String(error);

      } finally {

        if (removalConfigEditorState) {

          removalConfigEditorState.extensionSettingsSaving = false;

          renderRemovalConfigEditor();

        }

      }

      return;

    }



    if (removalConfigEditorState.activeTab === "quick_actions") {

      try {

        removalConfigEditorState.quickActionsSaving = true;

        removalConfigEditorState.quickActionsError = "";

        removalConfigEditorState.quickActionsStatus = "";

        renderRemovalConfigEditor();

        const normalized = normalizeQuickActionsDoc(

          removalConfigEditorState.quickActionsConfig,

          removalConfigEditorState.subreddit,

        );

        const saved = await saveQuickActionsToWiki(

          removalConfigEditorState.subreddit,

          normalized,

          String(removalConfigEditorState.quickActionsSaveNote || "").trim(),

        );

        if (removalConfigEditorState) {

          removalConfigEditorState.quickActionsConfig = saved;

          removalConfigEditorState.quickActionsSaveNote = "";

          removalConfigEditorState.quickActionsStatus = "Quick actions saved to wiki.";

        }

      } catch (error) {

        if (removalConfigEditorState) {

          removalConfigEditorState.quickActionsError = error instanceof Error ? error.message : String(error);

        }

      } finally {

        if (removalConfigEditorState) {

          removalConfigEditorState.quickActionsSaving = false;

          renderRemovalConfigEditor();

        }

      }

      return;

    }



    if (removalConfigEditorState.activeTab === "playbooks") {

      try {

        removalConfigEditorState.playbooksSaving = true;

        removalConfigEditorState.playbooksError = "";

        removalConfigEditorState.playbooksStatus = "";

        renderRemovalConfigEditor();

        const normalized = normalizePlaybooksDoc(

          removalConfigEditorState.playbooksConfig,

          removalConfigEditorState.subreddit,

        );

        const saved = await savePlaybooksToWiki(

          removalConfigEditorState.subreddit,

          normalized,

          String(removalConfigEditorState.playbooksSaveNote || "").trim(),

        );

        if (removalConfigEditorState) {

          removalConfigEditorState.playbooksConfig = saved;

          removalConfigEditorState.playbooksSaveNote = "";

          removalConfigEditorState.playbooksStatus = "Playbooks saved to wiki.";

        }

      } catch (error) {

        if (removalConfigEditorState) {

          removalConfigEditorState.playbooksError = error instanceof Error ? error.message : String(error);

        }

      } finally {

        if (removalConfigEditorState) {

          removalConfigEditorState.playbooksSaving = false;

          renderRemovalConfigEditor();

        }

      }

      return;

    }



    try {

      removalConfigEditorState.saving = true;

      removalConfigEditorState.error = "";

      removalConfigEditorState.status = "";

      renderRemovalConfigEditor();



      const cleanConfig = cloneRemovalConfig(removalConfigEditorState.config, removalConfigEditorState.subreddit);

      await saveRemovalConfigToWiki(

        removalConfigEditorState.subreddit,

        cleanConfig,

        String(removalConfigEditorState.saveNote || "").trim(),

      );

      await setCachedRemovalConfig(removalConfigEditorState.subreddit, cleanConfig);

      removalConfigEditorState.config = cleanConfig;

      removalConfigEditorState.status = "Removal reasons saved to wiki.";

      removalConfigEditorState.reasonsUserEdited = false;

      syncOverlayRemovalConfig(cleanConfig);

    } catch (error) {

      removalConfigEditorState.error = error instanceof Error ? error.message : String(error);

    } finally {

      if (removalConfigEditorState) {

        removalConfigEditorState.saving = false;

        renderRemovalConfigEditor();

      }

    }

    });

  }

}

// ------------------------------------------------------------------------------
// queue-bar.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Queue Bar Feature Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Manages the moderation queue bar, queue counts, navigation, and polling.

// Dependencies: constants.js, state.js, utilities.js, services/reddit-api.js



// â”€â”€â”€â”€ Count Formatting & Parsing â”€â”€â”€â”€



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



// â”€â”€â”€â”€ Queue Bar Context & Cache Management â”€â”€â”€â”€



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



async function loadQueueBarPositionPreference() {

  try {

    const settings = await getApiBaseUrl();

    queueBarPosition = settings.queueBarPosition || "bottom_right";

  } catch {

    queueBarPosition = "bottom_right";

  }

}



function persistQueueBarPositionPreference() {

  try {

    void ext.storage.sync.set({ [QUEUE_BAR_POSITION_KEY]: queueBarPosition });

  } catch {

    // Ignore storage errors for position preference.

  }

}



// â”€â”€â”€â”€ Queue Bar DOM Management â”€â”€â”€â”€



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



// â”€â”€â”€â”€ Background Request Helpers â”€â”€â”€â”€



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



// â”€â”€â”€â”€ API Error Formatting â”€â”€â”€â”€



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



// â”€â”€â”€â”€ Queue Data Fetching â”€â”€â”€â”€



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



// â”€â”€â”€â”€ Queue Bar Context Resolution â”€â”€â”€â”€



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



// â”€â”€â”€â”€ Page Detection â”€â”€â”€â”€



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



// â”€â”€â”€â”€ Queue Bar Navigation â”€â”€â”€â”€



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



// â”€â”€â”€â”€ Queue Counts localStorage Cache â”€â”€â”€â”€



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



// â”€â”€â”€â”€ Queue Bar Rendering â”€â”€â”€â”€



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

  root.setAttribute("data-position", queueBarPosition || "bottom_right");

  root.replaceChildren();



  const shell = document.createElement("section");

  shell.className = "rrw-queuebar";

  shell.setAttribute("data-collapsed", queueBarCollapsed ? "1" : "0");

  

  const isOldReddit = String(window.location.hostname || "").toLowerCase() === "old.reddit.com";

  shell.setAttribute("data-reddit-version", isOldReddit ? "old" : "new");



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



  const cannedRepliesBtn = document.createElement("button");

  cannedRepliesBtn.type = "button";

  cannedRepliesBtn.className = "rrw-queuebar-icon-btn";

  cannedRepliesBtn.title = "Canned replies";

  cannedRepliesBtn.textContent = "\uD83D\uDCAC";

  cannedRepliesBtn.addEventListener("click", () => {

    void openCannedRepliesModal();

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



  const aboutBtn = document.createElement("button");

  aboutBtn.type = "button";

  aboutBtn.className = "rrw-queuebar-icon-btn";

  aboutBtn.title = "About ModBox";

  aboutBtn.textContent = "\u24D8"; // â“˜ Info symbol

  aboutBtn.addEventListener("click", () => {

    void openAboutPage();

  });



  if (!queueBarCollapsed) {

    headerActions.appendChild(cannedRepliesBtn);

    headerActions.appendChild(settingsBtn);

    headerActions.appendChild(refreshBtn);

    headerActions.appendChild(aboutBtn);

  } else {

    headerActions.appendChild(cannedRepliesBtn);

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

    

    // Add update badge if update is available

    if (state.updateStatus?.isUpdateAvailable) {

      queueBarHasUpdateBadge = true;

      const updateBadge = document.createElement("button");

      updateBadge.type = "button";

      updateBadge.className = "rrw-queuebar-update-badge";

      updateBadge.textContent = "Update available!";

      updateBadge.title = "Click to view update details";

      updateBadge.addEventListener("click", async (e) => {

        e.preventDefault();

        void openUpdatePopup(state.updateStatus);

      });

      footer.appendChild(updateBadge);

    } else {

      queueBarHasUpdateBadge = false;

      // Normal footer content

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

    }

    

    if (queueBarFreshFlash && !state.loading && !state.error) {

      queueBarFreshFlash = false;

      footer.setAttribute("data-rrw-fresh", "1");

    }

    shell.appendChild(footer);

  }



  // Update queue bar background color based on update status

  if (state.updateStatus?.isUpdateAvailable) {

    shell.setAttribute("data-has-update", "1");

  } else {

    shell.removeAttribute("data-has-update");

  }



  root.appendChild(shell);

}



// â”€â”€â”€â”€ Queue Bar Refresh & Polling â”€â”€â”€â”€



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



    // Check for updates (non-blocking)

    if (!queueBarUpdateStatus || force) {

      void (async () => {

        try {

          const updateStatus = await getUpdateStatus();

          if (updateStatus?.isUpdateAvailable && !queueBarUpdateStatus?.isUpdateAvailable) {

            queueBarUpdateStatus = updateStatus;

            // Re-render queue bar to show update badge

            if (queueBarLastState) {

              renderQueueBar({

                ...queueBarLastState,

                updateStatus,

              });

            }

          }

        } catch (error) {

          console.warn("[ModBox] Update check failed:", error);

        }

      })();

    }



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

      updateStatus: queueBarUpdateStatus,

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

        updateStatus: queueBarUpdateStatus,

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

          updateStatus: queueBarUpdateStatus,

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

            updateStatus: queueBarUpdateStatus,

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

      updateStatus: queueBarUpdateStatus,

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



// â”€â”€â”€â”€ Queue Bar Initialization â”€â”€â”€â”€



async function initQueueBar() {

  console.log("[ModBox] initQueueBar starting...");

  await loadQueueBarCollapsedPreference();

  console.log("[ModBox] queueBarCollapsed loaded:", queueBarCollapsed);

  await loadQueueBarPositionPreference();

  console.log("[ModBox] queueBarPosition loaded:", queueBarPosition);

  

  // Initialize update checker

  initializeUpdateChecker();

  

  // Load initial update status

  queueBarUpdateStatus = await getUpdateStatus();

  

  await refreshQueueBar(true);

  console.log("[ModBox] refreshQueueBar completed");

  bindQueueBarPollingListeners();

  console.log("[ModBox] bindQueueBarPollingListeners completed");

  scheduleQueueBarPolling();

  console.log("[ModBox] scheduleQueueBarPolling completed, queue bar initialized");

}

// ------------------------------------------------------------------------------
// queue-tools.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Queue Tools Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Bulk action toolbar for moderation queues (modqueue/unmoderated/reports)

// Allows filtering, selecting, and bulk approving/removing/spamming queue items

// Dependencies: constants.js, state.js, utilities.js, services/reddit-api.js



// â”€â”€â”€â”€ Queue Item Collection â”€â”€â”€â”€



function collectQueueListingItems() {

  const selectors = [

    "article",

    "shreddit-post",

    "shreddit-comment",

    "mod-queue-list-item",

    ".Comment",

    ".thing.link",

    ".thing.comment",

  ];



  const seen = new Set();

  const rows = [];

  let totalFound = 0;

  console.log("[ModBox] collectQueueListingItems: starting collection with selectors:", selectors);

  

  selectors.forEach((selector) => {

    const elements = document.querySelectorAll(selector);

    console.log("[ModBox] Selector", selector, "found", elements.length, "elements");

    

    elements.forEach((container) => {

      totalFound += 1;

      if (!(container instanceof HTMLElement)) {

        return;

      }

      

      // For mod-queue-list-item, extract target from data-ks-item attribute

      let target;

      if (container.tagName.toLowerCase() === "mod-queue-list-item") {

        target = String(container.getAttribute("data-ks-item") || "").trim();

        console.log("[ModBox] Found mod-queue-list-item with data-ks-item:", target);

      } else {

        target = pickTargetForContainer(container);

      }

      

      if (!target || !/^t[13]_[a-z0-9]{5,10}$/i.test(target)) {

        console.log("[ModBox] Skipping container: invalid or empty target:", target);

        return;

      }



      const subreddit = resolveContainerSubreddit(container);

      console.log("[ModBox] Resolved subreddit:", subreddit);

      if (!isAllowedLaunchSubreddit(subreddit)) {

        console.log("[ModBox] Skipping container: subreddit not allowed:", subreddit);

        return;

      }



      if (seen.has(target)) {

        return;

      }

      seen.add(target);



      const haystack = [

        container.textContent || "",

        container.getAttribute("data-author") || "",

        subreddit,

      ].join(" ").toLowerCase();



      rows.push({

        container,

        target,

        subreddit,

        thingType: getThingTypeLabelFromFullname(target),

        haystack,

      });

    });

  });



  console.log("[ModBox] collectQueueListingItems: found", totalFound, "containers, filtered to", rows.length, "valid items");



  // Ensure insertion anchors use actual page order rather than selector order.

  rows.sort((a, b) => {

    if (a.container === b.container) {

      return 0;

    }

    const relation = a.container.compareDocumentPosition(b.container);

    if (relation & Node.DOCUMENT_POSITION_FOLLOWING) {

      return -1;

    }

    if (relation & Node.DOCUMENT_POSITION_PRECEDING) {

      return 1;

    }

    return 0;

  });



  console.log("[ModBox] collectQueueListingItems found", rows.length, "items after filtering");

  return rows;

}



// â”€â”€â”€â”€ Queue Item Selection Controls â”€â”€â”€â”€



function ensureQueueSelectionControl(item) {

  const { container, target } = item;

  let input = container.querySelector(`.rrw-queue-select-input[data-target="${CSS.escape(target)}"]`);

  if (!(input instanceof HTMLInputElement)) {

    const wrapper = document.createElement("label");

    wrapper.className = "rrw-queue-select";

    wrapper.title = "Select for bulk actions";



    input = document.createElement("input");

    input.type = "checkbox";

    input.className = "rrw-queue-select-input";

    input.dataset.target = target;



    const text = document.createElement("span");

    text.textContent = "Select";



    wrapper.appendChild(input);

    wrapper.appendChild(text);



    const oldRedditButtons = container.querySelector(".entry .flat-list.buttons, .entry ul.buttons");

    if (oldRedditButtons instanceof HTMLUListElement) {

      const listItem = document.createElement("li");

      listItem.className = "rrw-queue-select-li";

      listItem.appendChild(wrapper);

      oldRedditButtons.appendChild(listItem);

    } else {

      const inlineGroup = container.querySelector(".rrw-inline-group");

      if (inlineGroup instanceof HTMLElement) {

        inlineGroup.insertAdjacentElement("afterend", wrapper);

      } else {

        const authorLink = findAuthorAnchor(container);

        const host = authorLink?.parentElement || container.querySelector("header") || container;

        host.appendChild(wrapper);

      }

    }



    input.addEventListener("click", (event) => event.stopPropagation());

    input.addEventListener("mousedown", (event) => event.stopPropagation());

    input.addEventListener("mouseup", (event) => event.stopPropagation());

    wrapper.addEventListener("click", (event) => event.stopPropagation());



    input.addEventListener("change", () => {

      if (input.checked) {

        queueToolsSelectedTargets.add(target);

      } else {

        queueToolsSelectedTargets.delete(target);

      }

      renderQueueToolsBar(collectQueueListingItems());

    });

  }



  input.checked = queueToolsSelectedTargets.has(target);

}



function findAuthorAnchor(container) {

  if (!(container instanceof HTMLElement)) {

    return null;

  }



  const selectors = [

    ".tagline a.author",

    "a.author",

    "a[data-testid='post_author_link']",

    "a[data-testid='comment_author_link']",

    "a[data-testid*='author']",

    "faceplate-tracker a[href*='/user/']",

    "faceplate-tracker a[href*='/u/']",

  ];



  for (const selector of selectors) {

    const link = container.querySelector(selector);

    if (link instanceof HTMLAnchorElement) {

      return link;

    }

  }



  const metaHosts = [

    container.querySelector(".tagline"),

    container.querySelector("header"),

    container.querySelector("[slot='commentMeta']"),

    container.querySelector("[slot='postMeta']"),

    container.querySelector("[data-testid='comment'] header"),

  ].filter(Boolean);



  for (const host of metaHosts) {

    const link = host.querySelector("a[href*='/user/'], a[href*='/u/']");

    if (link instanceof HTMLAnchorElement) {

      return link;

    }

  }



  return null;

}



// â”€â”€â”€â”€ Queue Item Filtering â”€â”€â”€â”€



function applyQueueToolsFilters(items) {

  const text = String(queueToolsFilterText || "").trim().toLowerCase();

  items.forEach((item) => {

    const typeMatch = queueToolsFilterType === "all" || queueToolsFilterType === item.thingType;

    const textMatch = !text || item.haystack.includes(text);

    item.container.classList.toggle("rrw-queue-filter-hidden", !(typeMatch && textMatch));

  });

}



// â”€â”€â”€â”€ Bulk Actions â”€â”€â”€â”€



async function runQueueToolsBulkAction(action, items) {

  if (queueToolsBusy) {

    return;

  }

  const visibleTargets = new Set(items.map((item) => item.target));

  const targets = Array.from(queueToolsSelectedTargets).filter((target) => visibleTargets.has(target));

  if (!targets.length) {

    queueToolsErrorMessage = "Select at least one queue item.";

    queueToolsStatusMessage = "";

    renderQueueToolsBar(items);

    return;

  }



  queueToolsBusy = true;

  queueToolsErrorMessage = "";

  queueToolsStatusMessage = `Running ${action} on ${targets.length} item${targets.length === 1 ? "" : "s"}...`;

  renderQueueToolsBar(items);



  let success = 0;

  let failed = 0;

  for (const target of targets) {

    try {

      if (action === "approve") {

        await approveThingViaNativeSession(target);

      } else if (action === "remove") {

        await removeThingViaNativeSession(target, false);

      } else if (action === "spam") {

        await removeThingViaNativeSession(target, true);

      }

      queueToolsSelectedTargets.delete(target);

      success += 1;

    } catch {

      failed += 1;

    }

  }



  queueToolsBusy = false;

  queueToolsStatusMessage = `${action} complete: ${success} succeeded${failed ? `, ${failed} failed` : ""}.`;

  queueToolsErrorMessage = failed ? "Some items failed; check subreddit permissions and page context." : "";

  scheduleQueueToolsBind();

}



// â”€â”€â”€â”€ Queue Tools Bar Rendering â”€â”€â”€â”€



function renderQueueToolsBar(items) {

  const rootId = "rrw-queue-tools";

  const existing = document.getElementById(rootId);

  if (!isQueueListingPage()) {

    existing?.remove();

    return;

  }



  const root = existing || document.createElement("section");

  root.id = rootId;

  root.className = "rrw-queue-tools";

  const firstItem = items[0]?.container;

  const siteTable = document.querySelector("#siteTable");

  const host = firstItem?.parentElement || siteTable?.parentElement || document.body || document.documentElement;

  if (firstItem && firstItem.parentElement === host) {

    if (root.parentElement !== host || root.nextElementSibling !== firstItem) {

      host.insertBefore(root, firstItem);

    }

  } else if (root.parentElement !== host || root !== host.firstElementChild) {

    host.insertAdjacentElement("afterbegin", root);

  }



  const visibleCount = items.filter((item) => !item.container.classList.contains("rrw-queue-filter-hidden")).length;

  const selectedCount = Array.from(queueToolsSelectedTargets).filter((target) => items.some((item) => item.target === target)).length;

  const hasItems = items.length > 0;

  const hasVisibleItems = visibleCount > 0;

  const hasSelection = selectedCount > 0;

  const stateKey = JSON.stringify({

    visibleCount,

    selectedCount,

    hasItems,

    hasVisibleItems,

    hasSelection,

    queueToolsBusy,

    queueToolsFilterType,

    queueToolsFilterText,

    queueToolsStatusMessage,

    queueToolsErrorMessage,

  });



  if (root.dataset.stateKey === stateKey) {

    return;

  }

  root.dataset.stateKey = stateKey;



  root.innerHTML = `

    <div class="rrw-queue-tools-row">

      <strong>Queue Tools</strong>

      <span class="rrw-queue-tools-meta">${selectedCount} selected \u00B7 ${visibleCount} visible</span>

    </div>

    <div class="rrw-queue-tools-row rrw-queue-tools-controls">

      <button type="button" data-rrw-bulk="select-visible" title="${!hasVisibleItems && hasItems ? 'No items match the current filter' : 'Select all currently visible items'}" ${queueToolsBusy || !hasVisibleItems ? "disabled" : ""}>Select visible</button>

      <button type="button" data-rrw-bulk="clear" ${queueToolsBusy || !hasSelection ? "disabled" : ""}>Clear</button>

      <button type="button" data-rrw-bulk="approve" ${queueToolsBusy || !hasSelection ? "disabled" : ""}>Approve selected</button>

      <button type="button" data-rrw-bulk="remove" ${queueToolsBusy || !hasSelection ? "disabled" : ""}>Remove selected</button>

      <button type="button" data-rrw-bulk="spam" ${queueToolsBusy || !hasSelection ? "disabled" : ""}>Spam selected</button>

      <label>

        Type

        <select data-rrw-filter-type ${queueToolsBusy ? "disabled" : ""}>

          <option value="all" ${queueToolsFilterType === "all" ? "selected" : ""}>All</option>

          <option value="post" ${queueToolsFilterType === "post" ? "selected" : ""}>Posts</option>

          <option value="comment" ${queueToolsFilterType === "comment" ? "selected" : ""}>Comments</option>

        </select>

      </label>

      <label>

        Filter

        <input type="text" data-rrw-filter-text value="${escapeHtml(queueToolsFilterText)}" placeholder="author/title/body" ${queueToolsBusy ? "disabled" : ""} />

      </label>

    </div>

    ${!hasItems ? '<div class="rrw-queue-tools-empty">No items in this queue view.</div>' : ""}

    ${hasItems && visibleCount === 0 ? '<div class="rrw-queue-tools-empty">No items match the current filter.</div>' : ""}

    ${queueToolsStatusMessage ? `<div class="rrw-queue-tools-status">${escapeHtml(queueToolsStatusMessage)}</div>` : ""}

    ${queueToolsErrorMessage ? `<div class="rrw-queue-tools-error">${escapeHtml(queueToolsErrorMessage)}</div>` : ""}

  `;



  root.querySelector('[data-rrw-bulk="select-visible"]')?.addEventListener("click", () => {

    items

      .filter((item) => !item.container.classList.contains("rrw-queue-filter-hidden"))

      .forEach((item) => queueToolsSelectedTargets.add(item.target));

    scheduleQueueToolsBind();

  });

  root.querySelector('[data-rrw-bulk="clear"]')?.addEventListener("click", () => {

    queueToolsSelectedTargets.clear();

    scheduleQueueToolsBind();

  });

  root.querySelector('[data-rrw-bulk="approve"]')?.addEventListener("click", () => {

    void runQueueToolsBulkAction("approve", items);

  });

  root.querySelector('[data-rrw-bulk="remove"]')?.addEventListener("click", () => {

    void runQueueToolsBulkAction("remove", items);

  });

  root.querySelector('[data-rrw-bulk="spam"]')?.addEventListener("click", () => {

    void runQueueToolsBulkAction("spam", items);

  });



  const typeSelect = root.querySelector("[data-rrw-filter-type]");

  if (typeSelect instanceof HTMLSelectElement) {

    typeSelect.addEventListener("change", () => {

      queueToolsFilterType = String(typeSelect.value || "all");

      scheduleQueueToolsBind();

    });

  }



  const filterInput = root.querySelector("[data-rrw-filter-text]");

  if (filterInput instanceof HTMLInputElement) {

    filterInput.addEventListener("input", () => {

      queueToolsFilterText = String(filterInput.value || "");

      scheduleQueueToolsBind();

    });

  }

}



// â”€â”€â”€â”€ Queue Tools Binding â”€â”€â”€â”€



function bindQueueToolsFeatures() {

  const pathname = String(window.location.pathname || "");

  const isQueuePage = /\/about\/(modqueue|unmoderated|reports)(?:\/|$)/i.test(pathname) ||

                      /\/mod\/\w+\/queue(?:\/|$)/i.test(pathname);

  console.log("[ModBox] bindQueueToolsFeatures: pathname=", pathname, "isQueuePage=", isQueuePage);

  

  if (!isQueuePage) {

    console.log("[ModBox] Not a queue listing page, removing queue tools");

    document.getElementById("rrw-queue-tools")?.remove();

    document.querySelectorAll(".rrw-queue-filter-hidden").forEach((node) => node.classList.remove("rrw-queue-filter-hidden"));

    return;

  }



  console.log("[ModBox] This is a queue page, proceeding with collection");

  const items = collectQueueListingItems();

  console.log("[ModBox] Queue tools: collected", items.length, "items");

  const validTargets = new Set(items.map((item) => item.target));

  Array.from(queueToolsSelectedTargets).forEach((target) => {

    if (!validTargets.has(target)) {

      queueToolsSelectedTargets.delete(target);

    }

  });



  items.forEach((item) => {

    ensureQueueSelectionControl(item);

  });

  applyQueueToolsFilters(items);

  renderQueueToolsBar(items);

}



function scheduleQueueToolsBind() {

  if (queueToolsBindRaf) {

    return;

  }

  queueToolsBindRaf = window.requestAnimationFrame(() => {

    queueToolsBindRaf = 0;

    bindQueueToolsFeatures();

  });

}



// â”€â”€---- Queue Item Stubs (Future Enhancement) â”€â”€â”€â”€



function getQueueItemActions(item) {

  // Returns available actions for a queue item based on type and state

  // Remove, approve, lock, ban, modmail, etc.

  if (!item) return [];

  

  const actions = [];

  if (!item.is_removed) actions.push({ id: "remove", label: "Remove" });

  if (item.is_removed) actions.push({ id: "approve", label: "Approve" });

  if (!item.is_locked) actions.push({ id: "lock", label: "Lock" });

  if (item.is_locked) actions.push({ id: "unlock", label: "Unlock" });

  actions.push({ id: "modmail", label: "Modmail" });

  

  return actions;

}



function formatQueueItemPreview(item) {

  if (!item) return "No item";

  const title = item.title || item.body?.substring(0, 50) || "Untitled";

  const author = item.author || "[deleted]";

  const score = Number(item.score || 0);

  return `${title}\nfrom /u/${author} (${score} pts)`;

}

// ------------------------------------------------------------------------------
// queue-modlog-display.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Queue Modlog Display Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Displays the last 2 modlog entries for posts/comments in mod queues (modqueue, unmoderated, reports).

// Dependencies: constants.js, state.js, utilities.js, features/modlog-popup.js



// â”€â”€â”€â”€ Queue Modlog Display Functions â”€â”€â”€â”€



async function renderModlogEntriesForQueueItem(container, target, subreddit) {

  if (!(container instanceof HTMLElement) || !target || !subreddit) {

    console.log("[ModBox QueueModlog] Skipping: invalid params - container:", !!container, "target:", target, "subreddit:", subreddit);

    return;

  }



  // Remove any existing queue modlog display

  const existingDisplay = container.querySelector("[data-rrw-queue-modlog]");

  if (existingDisplay instanceof HTMLElement) {

    existingDisplay.remove();

  }



  try {

    console.log("[ModBox QueueModlog] Loading modlog for target:", target, "subreddit:", subreddit);

    

    // Load modlog index for this subreddit

    const index = await loadSubredditModlogIndex(subreddit);

    console.log("[ModBox QueueModlog] Index loaded, total size:", index.size);

    console.log("[ModBox QueueModlog] First 5 keys in index:", Array.from(index.keys()).slice(0, 5));

    console.log("[ModBox QueueModlog] Looking for target:", target);

    console.log("[ModBox QueueModlog] Entries for target:", index.get(target));

    

    const entries = Array.isArray(index.get(target)) ? index.get(target).slice(0, 2) : [];



    if (entries.length === 0) {

      console.log("[ModBox QueueModlog] No modlog entries for", target);

      return; // No modlog entries for this item

    }



    console.log("[ModBox QueueModlog] Found", entries.length, 'entries for', target);



    // Create the display element

    const display = createQueueModlogDisplay(entries);

    if (display instanceof HTMLElement) {

      // Insert after the main content area

      const insertPoint = findQueueItemInsertPoint(container);

      console.log("[ModBox QueueModlog] Insert point found:", !!insertPoint);

      

      if (insertPoint instanceof HTMLElement) {

        insertPoint.parentNode?.insertBefore(display, insertPoint.nextSibling);

        console.log("[ModBox QueueModlog] Display inserted after content");

      } else {

        container.appendChild(display);

        console.log("[ModBox QueueModlog] Display appended to container");

      }

    }

  } catch (error) {

    console.log("[ModBox QueueModlog] Error rendering queue modlog display:", error);

  }

}



function createQueueModlogDisplay(entries) {

  if (!Array.isArray(entries) || entries.length === 0) {

    return null;

  }



  const container = document.createElement("div");

  container.setAttribute("data-rrw-queue-modlog", "1");

  container.className = "rrw-queue-modlog-display";



  // Format entries as a single line: "action by /u/mod 22m ago - details action by /u/mod 1h ago - details"

  const entryTexts = entries.map((entry) => {

    const details = entry.details ? ` - ${escapeHtml(entry.details)}` : "";

    return `<span class="rrw-queue-modlog-entry">${escapeHtml(entry.action || "unknown")} by /u/${escapeHtml(entry.mod || "unknown")} ${escapeHtml(formatRelativeTime(entry.createdUtc))}${details}</span>`;

  }).join('');



  container.innerHTML = entryTexts;



  return container;

}



function findQueueItemInsertPoint(container) {

  if (!(container instanceof HTMLElement)) {

    return null;

  }



  // For old.reddit queue items (.thing), insert after the content

  const thingContent = container.querySelector(".thing > .entry");

  if (thingContent instanceof HTMLElement) {

    return thingContent;

  }



  // For new.reddit mod queue items (mod-queue-list-item), insert after the main content

  const modQueueContent = container.querySelector("[data-testid='post-container'], article");

  if (modQueueContent instanceof HTMLElement) {

    return modQueueContent;

  }



  // Fallback: insert after first major content container

  const contentContainers = [

    container.querySelector("article"),

    container.querySelector(".Post"),

    container.querySelector(".Comment"),

    container.querySelector("[data-testid='post-container']"),

  ];



  for (const contentContainer of contentContainers) {

    if (contentContainer instanceof HTMLElement) {

      return contentContainer;

    }

  }



  return null;

}



function bindQueueModlogDisplay() {

  console.log("[ModBox QueueModlog] Binding queue modlog display feature");

  console.log("[ModBox QueueModlog] Current pathname:", window.location.pathname);

  

  // Track which items we've already processed to avoid duplicate rendering

  const processedItems = new Set();



  const renderQueueModlogs = async (containers = null) => {

    const itemsToProcess = containers || collectQueueListingItems();

    console.log("[ModBox QueueModlog] Found", itemsToProcess.length, 'queue items to process');



    for (const item of itemsToProcess) {

      if (!item.container || !item.target || !item.subreddit) {

        console.log("[ModBox QueueModlog] Skipping item: missing container/target/subreddit");

        continue;

      }



      // Skip if already processed

      const itemKey = `${item.target}|${item.subreddit}`;

      if (processedItems.has(itemKey)) {

        continue;

      }

      processedItems.add(itemKey);



      console.log("[ModBox QueueModlog] Processing queue item:", itemKey);

      

      // Render modlog entries

      await renderModlogEntriesForQueueItem(item.container, item.target, item.subreddit);

    }

  };



  // Preload modlog index for the current subreddit to warm up the cache

  const subreddit = parseSubredditFromPath(window.location.pathname);

  console.log("[ModBox QueueModlog] parseSubredditFromPath returned:", subreddit);

  

  if (subreddit) {

    console.log("[ModBox QueueModlog] Preloading modlog index for subreddit:", subreddit);

    loadSubredditModlogIndex(subreddit)

      .then(() => {

        console.log("[ModBox QueueModlog] Modlog index preloaded successfully");

        // Now do the initial render with the warm cache

        renderQueueModlogs().catch((error) => {

          console.log("[ModBox QueueModlog] Error in queue modlog display:", error);

        });

      })

      .catch((error) => {

        console.log("[ModBox QueueModlog] Error preloading modlog index:", error);

      });

  } else {

    console.log("[ModBox QueueModlog] No subreddit found, skipping preload");

  }



  // Observe DOM for new queue items and re-render

  const observer = new MutationObserver((records) => {

    // Debounce by batching multiple mutations

    if (queueModlogDisplayRafScheduled) {

      return;

    }

    queueModlogDisplayRafScheduled = true;



    requestAnimationFrame(() => {

      queueModlogDisplayRafScheduled = false;

      renderQueueModlogs().catch((error) => {

        console.log("[ModBox QueueModlog] Error in queue modlog display mutation:", error);

      });

    });

  });



  observer.observe(document.documentElement, {

    childList: true,

    subtree: true,

  });

}

// ------------------------------------------------------------------------------
// update-checker.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Update Checker Feature Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Checks for extension updates from the ModBox wiki page and manages update notifications.

// Dependencies: constants.js, state.js, utilities.js, services/reddit-api.js



// â”€â”€â”€â”€ Update Info Caching â”€â”€â”€â”€



let updateCheckCache = null;

let updateCheckFetchedAt = 0;

let currentInstalledVersion = null;



// â”€â”€â”€â”€ Version Parsing & Comparison â”€â”€â”€â”€



function parseVersionNumber(versionString) {

  const match = String(versionString || "").match(/^(\d+)\.(\d+)\.(\d+)/);

  if (!match) {

    return null;

  }

  const major = Number.parseInt(match[1], 10);

  const minor = Number.parseInt(match[2], 10);

  const patch = Number.parseInt(match[3], 10);

  return { major, minor, patch, full: versionString.trim() };

}



function compareVersions(v1, v2) {

  // Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal

  if (!v1 || !v2) return 0;

  

  if (v1.major !== v2.major) return v1.major > v2.major ? 1 : -1;

  if (v1.minor !== v2.minor) return v1.minor > v2.minor ? 1 : -1;

  if (v1.patch !== v2.patch) return v1.patch > v2.patch ? 1 : -1;

  return 0;

}



// â”€â”€â”€â”€ Wiki Page Parsing â”€â”€â”€â”€



function parseVersionEntry(markdown) {

  // Parse a version entry from markdown format:

  // ## 1.5.1

  // Changelog content here

  // - Bullet points

  // 

  // [Download](url)

  

  // Extract version from header

  const headerMatch = markdown.match(/^#+\s*(?:Version\s+)?([\d.a-zA-Z-]+)/m);

  const version = headerMatch ? headerMatch[1].trim() : null;

  

  if (!version) return null;

  

  // Extract everything after the header until [Download] or end of text

  const lines = markdown.split('\n');

  const contentLines = [];

  let foundHeader = false;

  

  for (let i = 0; i < lines.length; i++) {

    const line = lines[i];

    

    // Skip the header line itself

    if (!foundHeader && /^#+\s*(?:Version\s+)?([\d.a-zA-Z-]+)/i.test(line)) {

      foundHeader = true;

      continue;

    }

    

    if (foundHeader) {

      // Stop at Download link or next version header

      if (line.includes('[Download]') || /^#+\s*(?:Version\s+)?([\d.a-zA-Z-]+)/i.test(line)) {

        break;

      }

      contentLines.push(line);

    }

  }

  

  const changelog = contentLines

    .join('\n')

    .trim()

    .split('\n')

    .map(l => l.trim())

    .filter(l => l.length > 0)

    .join('\n');

  

  // Extract download URL

  let downloadUrl = null;

  const linkMatch = markdown.match(/\[([^\]]+)\]\(([^)]+)\)/);

  if (linkMatch) {

    downloadUrl = linkMatch[2];

  }

  

  return {

    version,

    changelog: changelog || "No changelog provided",

    downloadUrl: downloadUrl || "",

  };

}



async function fetchVersionsFromWiki() {

  // Fetch the versions wiki page

  // Format: https://old.reddit.com/r/ModBoxExtension/wiki/extension-admin/versions

  const wikiUrl = "https://old.reddit.com/r/ModBoxExtension/wiki/extension-admin/versions.json";

  

  try {

    const response = await requestJsonViaBackgroundScheduled(

      wikiUrl,

      null,

      { 

        cacheTtlMs: UPDATE_CHECK_CACHE_TTL_MS,

        priority: 0,

        dedupe: true,

      }

    );

    

    if (!response || typeof response !== "object") {

      throw new Error("Invalid wiki response");

    }

    

    // Extract wiki content from Reddit API response

    // Note: Reddit wiki API returns content_md for the markdown content

    const wikiContent = String(response?.data?.content_md || "").trim();

    if (!wikiContent) {

      throw new Error("No wiki content found");

    }

    

    return wikiContent;

  } catch (error) {

    console.warn("[ModBox] Failed to fetch versions wiki:", error instanceof Error ? error.message : String(error));

    return null;

  }

}



function extractLatestVersionFromWiki(wikiContent) {

  // Parse the wiki content to find the latest version

  // Assumes the latest version is listed first

  // Supports both "## 1.5.1" and "## Version 1.5.1" formats

  

  if (!wikiContent) return null;

  

  // Split by any level heading followed by version-like number pattern

  const versionBlocks = wikiContent.split(/^#+\s*(?:Version\s+)?([\d.a-zA-Z-]+)/m);

  

  // The first element is content before first version, then alternating [version, content, version, content...]

  for (let i = 1; i < versionBlocks.length; i += 2) {

    const version = versionBlocks[i];

    const blockContent = versionBlocks[i + 1];

    if (!version || !blockContent) continue;

    

    // Reconstruct the block with the version header

    const block = "## " + version + "\n" + blockContent;

    const entry = parseVersionEntry(block);

    

    if (entry && entry.version) {

      return entry;

    }

  }

  

  return null;

}



// â”€â”€â”€â”€ Update Check & Storage â”€â”€â”€â”€



async function getInstalledVersion() {

  if (!currentInstalledVersion) {

    try {

      const manifest = await ext.runtime.getManifest?.();

      currentInstalledVersion = manifest?.version || "1.4.2";

    } catch {

      currentInstalledVersion = "1.4.2";

    }

  }

  return currentInstalledVersion;

}



async function checkForUpdates(force = false) {

  const now = Date.now();

  

  // Return cached result if recent and not forced

  if (

    !force

    && updateCheckCache

    && now - updateCheckFetchedAt < UPDATE_CHECK_CACHE_TTL_MS

  ) {

    return updateCheckCache;

  }

  

  console.log("[ModBox] Checking for updates...");

  

  const wikiContent = await fetchVersionsFromWiki();

  if (!wikiContent) {

    console.warn("[ModBox] Could not fetch versions wiki");

    return null;

  }

  

  const latestEntry = extractLatestVersionFromWiki(wikiContent);

  if (!latestEntry) {

    console.warn("[ModBox] Could not parse latest version from wiki");

    return null;

  }

  

  const installedVersion = await getInstalledVersion();

  const installedParsed = parseVersionNumber(installedVersion);

  const latestParsed = parseVersionNumber(latestEntry.version);

  

  if (!installedParsed || !latestParsed) {

    console.warn("[ModBox] Could not parse versions");

    return null;

  }

  

  const isUpdateAvailable = compareVersions(latestParsed, installedParsed) > 0;

  

  const result = {

    isUpdateAvailable,

    installed: installedVersion,

    latest: latestEntry.version,

    latestEntry,

    checkedAt: now,

  };

  

  updateCheckCache = result;

  updateCheckFetchedAt = now;

  

  // Save to storage

  try {

    await ext.storage.sync.set({

      [UPDATE_CHECK_RESULT_KEY]: result,

    });

  } catch (error) {

    console.warn("[ModBox] Failed to save update check result:", error);

  }

  

  console.log("[ModBox] Update check complete:", result);

  return result;

}



async function loadUpdateCheckResult() {

  try {

    const stored = await ext.storage.sync.get([UPDATE_CHECK_RESULT_KEY]);

    const result = stored?.[UPDATE_CHECK_RESULT_KEY];

    

    if (result && typeof result === "object") {

      updateCheckCache = result;

      updateCheckFetchedAt = result.checkedAt || 0;

      return result;

    }

  } catch (error) {

    console.warn("[ModBox] Failed to load update check result:", error);

  }

  

  return null;

}



async function getUpdateStatus() {

  // First try to load cached result

  let status = await loadUpdateCheckResult();

  

  // If no cached result or cache is old, perform update check

  if (!status || (Date.now() - (status.checkedAt || 0) > UPDATE_CHECK_CACHE_TTL_MS)) {

    status = await checkForUpdates(false);

  }

  

  return status;

}



function clearUpdateCheckCache() {

  updateCheckCache = null;

  updateCheckFetchedAt = 0;

  try {

    void ext.storage.sync.set({ [UPDATE_CHECK_RESULT_KEY]: null });

  } catch {

    // Ignore storage errors

  }

}



// â”€â”€â”€â”€ Update Notification Management â”€â”€â”€â”€



async function markUpdateAsSeen() {

  try {

    await ext.storage.sync.set({

      [UPDATE_SEEN_KEY]: Date.now(),

    });

  } catch (error) {

    console.warn("[ModBox] Failed to mark update as seen:", error);

  }

}



async function hasSeenUpdate(latestVersion) {

  try {

    const stored = await ext.storage.sync.get([UPDATE_SEEN_KEY]);

    const seenAt = stored?.[UPDATE_SEEN_KEY];

    

    // If user has seen an update notification in last 24 hours, don't show again

    if (seenAt && (Date.now() - seenAt) < 24 * 60 * 60 * 1000) {

      return true;

    }

  } catch (error) {

    console.warn("[ModBox] Failed to check if update was seen:", error);

  }

  

  return false;

}



// â”€â”€â”€â”€ Public Interface â”€â”€â”€â”€



async function initializeUpdateChecker() {

  console.log("[ModBox] Initializing update checker...");

  

  // Perform initial check but don't block

  void checkForUpdates(false);

  

  // Schedule periodic checks (every 6 hours)

  const CHECK_INTERVAL = 6 * 60 * 60 * 1000;

  setInterval(() => {

    void checkForUpdates(false);

  }, CHECK_INTERVAL);

}

// ------------------------------------------------------------------------------
// update-popup.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Update Popup Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Displays update notification popup with version, changelog, and download link.

// Dependencies: constants.js, utilities.js, features/update-checker.js



let updatePopupState = null;



function ensureUpdatePopupRoot() {

  let root = document.getElementById("rrw-update-popup-root");

  if (!root) {

    root = document.createElement("div");

    root.id = "rrw-update-popup-root";

    document.documentElement.appendChild(root);

  }

  return root;

}



function closeUpdatePopup() {

  updatePopupState = null;

  const root = document.getElementById("rrw-update-popup-root");

  if (root instanceof HTMLElement) {

    root.replaceChildren();

    root.remove();

  }

}



function bindUpdatePopupEvents() {

  const root = document.getElementById("rrw-update-popup-root");

  if (!root) return;



  // Close button

  root.querySelectorAll('[data-update-popup-close="1"]').forEach((btn) => {

    btn.addEventListener("click", (e) => {

      e.preventDefault();

      closeUpdatePopup();

    });

  });



  // Download button

  root.querySelectorAll('[data-update-download="1"]').forEach((btn) => {

    btn.addEventListener("click", (e) => {

      e.preventDefault();

      if (!updatePopupState?.downloadUrl) return;

      

      const openInNewTab = shouldOpenQueueBarLinkInNewTab(e, true);

      navigateToQueueBarLink(updatePopupState.downloadUrl, openInNewTab);

      

      // Mark update as seen

      void markUpdateAsSeen();

      closeUpdatePopup();

    });

  });



  // Backdrop close

  root.querySelectorAll('[data-update-popup-backdrop="1"]').forEach((backdrop) => {

    backdrop.addEventListener("click", (e) => {

      if (e.target === backdrop) {

        closeUpdatePopup();

      }

    });

  });

}



function renderUpdatePopup() {

  const state = updatePopupState;

  if (!state || !state.updateInfo || !state.updateInfo.latestEntry) {

    closeUpdatePopup();

    return;

  }



  const root = ensureUpdatePopupRoot();

  const entry = state.updateInfo.latestEntry;

  const installed = state.updateInfo.installed || "Unknown";

  const latest = state.updateInfo.latest || "Unknown";



  // Format changelog - truncate long lines and clean up markdown

  let changelog = String(entry.changelog || "No changelog available").trim();

  // Remove markdown headers and formatting

  changelog = changelog

    .replace(/^#+\s*/gm, "") // Remove headers

    .replace(/\*\*/g, "")     // Remove bold

    .replace(/\*/g, "")       // Remove italics

    .replace(/`/g, "")        // Remove code markers

    .split("\n")

    .map(line => line.trim())

    .filter(line => line.length > 0)

    .slice(0, 10) // Limit to 10 lines

    .join("\n");



  root.innerHTML = `

    <div class="rrw-update-popup-backdrop" data-update-popup-backdrop="1"></div>

    <div class="rrw-update-popup-container">

      <div class="rrw-update-popup">

        <header class="rrw-update-popup-header">

          <h2 class="rrw-update-popup-title">ModBox Update Available!</h2>

          <button type="button" class="rrw-update-popup-close" data-update-popup-close="1" aria-label="Close">

            X

          </button>

        </header>



        <div class="rrw-update-popup-body">

          <div class="rrw-update-popup-versions">

            <div class="rrw-update-popup-version">

              <span class="rrw-update-popup-version-label">Current:</span>

              <span class="rrw-update-popup-version-number">${escapeHtml(installed)}</span>

            </div>

            <div class="rrw-update-popup-version">

              <span class="rrw-update-popup-version-label">Available:</span>

              <span class="rrw-update-popup-version-number rrw-update-popup-version-new">${escapeHtml(latest)}</span>

            </div>

          </div>



          <div class="rrw-update-popup-changelog">

            <h3 class="rrw-update-popup-changelog-title">What's New</h3>

            <pre class="rrw-update-popup-changelog-text">${escapeHtml(changelog)}</pre>

          </div>

        </div>



        <footer class="rrw-update-popup-footer">

          <button 

            type="button" 

            class="rrw-update-popup-download-btn" 

            data-update-download="1"

          >

            Download Update

          </button>

          <button 

            type="button" 

            class="rrw-update-popup-later-btn" 

            data-update-popup-close="1"

          >

            Later

          </button>

        </footer>

      </div>

    </div>

  `;



  // Update popup state with download URL

  updatePopupState.downloadUrl = entry.downloadUrl || "";



  bindUpdatePopupEvents();

}



async function openUpdatePopup(updateInfo) {

  if (!updateInfo || !updateInfo.latestEntry) {

    return;

  }



  // Check if user has already seen this update today

  const hasSeenThis = await hasSeenUpdate(updateInfo.latest);

  if (hasSeenThis) {

    return;

  }



  updatePopupState = {

    updateInfo,

    downloadUrl: "",

  };



  renderUpdatePopup();

}

// ------------------------------------------------------------------------------
// about-page.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// About Page Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Displays about page with current version, changelog, and update checker.

// Dependencies: constants.js, utilities.js, features/update-checker.js



let aboutPageState = null;

let checkingForUpdates = false;



function ensureAboutPageRoot() {

  let root = document.getElementById("rrw-about-page-root");

  if (!root) {

    root = document.createElement("div");

    root.id = "rrw-about-page-root";

    document.documentElement.appendChild(root);

  }

  return root;

}



function closeAboutPage() {

  aboutPageState = null;

  const root = document.getElementById("rrw-about-page-root");

  if (root instanceof HTMLElement) {

    root.replaceChildren();

    root.remove();

  }

}



async function performUpdateCheckFromAboutPage() {

  if (checkingForUpdates) {

    return;

  }



  checkingForUpdates = true;

  

  // Update button state

  const checkBtn = document.querySelector('[data-about-check-update="1"]');

  if (checkBtn) {

    checkBtn.disabled = true;

    checkBtn.textContent = "Checking...";

  }



  try {

    // Force update check without using cache

    const result = await checkForUpdates(true);

    

    if (result) {

      // Update the UI with new information

      await openAboutPage();

    } else {

      // Show error message

      const statusEl = document.querySelector('[data-about-check-status]');

      if (statusEl) {

        statusEl.textContent = "Failed to check for updates. Please try again.";

        statusEl.className = "rrw-about-page-check-status rrw-about-page-check-status--error";

      }

    }

  } catch (error) {

    console.warn("[ModBox] Error checking for updates:", error);

    const statusEl = document.querySelector('[data-about-check-status]');

    if (statusEl) {

      statusEl.textContent = "Error checking for updates";

      statusEl.className = "rrw-about-page-check-status rrw-about-page-check-status--error";

    }

  } finally {

    checkingForUpdates = false;

    

    // Reset button state

    const checkBtn = document.querySelector('[data-about-check-update="1"]');

    if (checkBtn) {

      checkBtn.disabled = false;

      checkBtn.textContent = "Check for Update";

    }

  }

}



function bindAboutPageEvents() {

  const root = document.getElementById("rrw-about-page-root");

  if (!root) return;



  // Close button

  root.querySelectorAll('[data-about-page-close="1"]').forEach((btn) => {

    btn.addEventListener("click", (e) => {

      e.preventDefault();

      closeAboutPage();

    });

  });



  // Check for Update button

  root.querySelectorAll('[data-about-check-update="1"]').forEach((btn) => {

    btn.addEventListener("click", (e) => {

      e.preventDefault();

      void performUpdateCheckFromAboutPage();

    });

  });



  // Backdrop close

  root.querySelectorAll('[data-about-page-backdrop="1"]').forEach((backdrop) => {

    backdrop.addEventListener("click", (e) => {

      if (e.target === backdrop) {

        closeAboutPage();

      }

    });

  });

}



function renderAboutPage() {

  const state = aboutPageState;

  if (!state) {

    closeAboutPage();

    return;

  }



  const root = ensureAboutPageRoot();

  const installed = state.installedVersion || "Unknown";

  const latest = state.latestVersion || "Unknown";

  const changelog = state.changelog || "No changelog available";

  const isUpdateAvailable = state.isUpdateAvailable || false;



  // Format changelog - clean markdown and limit lines

  let formattedChangelog = String(changelog).trim();

  formattedChangelog = formattedChangelog

    .replace(/^#+\s*/gm, "") // Remove headers

    .replace(/\*\*/g, "")     // Remove bold

    .replace(/\*/g, "")       // Remove italics

    .replace(/`/g, "")        // Remove code markers

    .split("\n")

    .map(line => line.trim())

    .filter(line => line.length > 0)

    .slice(0, 20) // Limit to 20 lines

    .join("\n");



  const updateStatusHtml = isUpdateAvailable

    ? '<div class="rrw-about-page-update-available">Update available!</div>'

    : '<div class="rrw-about-page-up-to-date">You\'re up to date</div>';



  root.innerHTML = `

    <div class="rrw-about-page-backdrop" data-about-page-backdrop="1"></div>

    <div class="rrw-about-page-container">

      <div class="rrw-about-page">

        <header class="rrw-about-page-header">

          <h2 class="rrw-about-page-title">About ModBox</h2>

          <button type="button" class="rrw-about-page-close" data-about-page-close="1" aria-label="Close">

            X

          </button>

        </header>



        <div class="rrw-about-page-body">

          <div class="rrw-about-page-version-section">

            <div class="rrw-about-page-version-card">

              <span class="rrw-about-page-version-label">Current Version</span>

              <span class="rrw-about-page-version-number">${escapeHtml(installed)}</span>

            </div>



            <div class="rrw-about-page-version-card">

              <span class="rrw-about-page-version-label">Latest Version</span>

              <span class="rrw-about-page-version-number${isUpdateAvailable ? ' rrw-about-page-version-new' : ''}">${escapeHtml(latest)}</span>

            </div>

          </div>



          <div class="rrw-about-page-status">

            ${updateStatusHtml}

            <div class="rrw-about-page-check-status" data-about-check-status></div>

          </div>



          <div class="rrw-about-page-changelog">

            <h3 class="rrw-about-page-changelog-title">Latest Changelog</h3>

            <pre class="rrw-about-page-changelog-text">${escapeHtml(formattedChangelog)}</pre>

          </div>

        </div>



        <footer class="rrw-about-page-footer">

          <button 

            type="button" 

            class="rrw-about-page-check-btn" 

            data-about-check-update="1"

          >

            Check for Update

          </button>

          <button 

            type="button" 

            class="rrw-about-page-close-btn" 

            data-about-page-close="1"

          >

            Close

          </button>

        </footer>

      </div>

    </div>

  `;



  bindAboutPageEvents();

}



async function openAboutPage() {

  try {

    const installedVersion = await getInstalledVersion();

    const updateStatus = await getUpdateStatus();



    aboutPageState = {

      installedVersion,

      latestVersion: updateStatus?.latest || "Unknown",

      isUpdateAvailable: updateStatus?.isUpdateAvailable || false,

      changelog: updateStatus?.latestEntry?.changelog || "No changelog available",

    };



    renderAboutPage();

  } catch (error) {

    console.warn("[ModBox] Failed to open about page:", error);

  }

}

// ------------------------------------------------------------------------------
// dom-binding.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// DOM Binding & Container Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Handles DOM scanning for posts/comments and attaching ModBox UI elements (usernote pills, buttons, etc).

// Dependencies: constants.js, state.js, utilities.js, features/usernotes.js, features/core-ui.js

// State variables (visibleContainerBindScheduled, visibleContainerBindNeedsFullScan, visibleContainerBindPendingRoots) defined in state.js



// â”€â”€â”€â”€ Container Collection & Detection â”€â”€â”€â”€



function collectBindableContainersFromRoot(root, collector) {

  if (!(root instanceof Element)) {

    return;

  }



  if (!root.isConnected) {

    return;

  }



  if (root === document.documentElement || root === document.body) {

    collectBindableContainersFromDocument(collector);

    return;

  }



  if (root.matches(BINDABLE_CONTAINER_SELECTOR)) {

    collector.add(root);

  }

  root.querySelectorAll(BINDABLE_CONTAINER_SELECTOR).forEach((el) => collector.add(el));

}



function collectBindableContainersFromDocument(collector) {

  document.querySelectorAll(BINDABLE_CONTAINER_SELECTOR).forEach((el) => collector.add(el));

}



function isQueueListingPage(pathname = window.location.pathname) {

  return /\/about\/(modqueue|unmoderated|reports)(?:\/|$)/i.test(String(pathname || ""));

}



function isModmailConversationPage() {

  const host = String(window.location.hostname || "").toLowerCase();

  const path = String(window.location.pathname || "").toLowerCase();

  if (host !== "www.reddit.com") return false;

  // Match /mail/{category}/{conversationId} â€“ e.g. /mail/all/3acg45

  return /^\/mail\/[^/]+\/\w/.test(path);

}



function getThingTypeLabelFromFullname(fullname) {

  return String(fullname || "").toLowerCase().startsWith("t3_") ? "post" : "comment";

}



// â”€â”€â”€â”€ Author & Username Extraction â”€â”€â”€â”€



function extractUsernameFromAuthorAnchor(anchor) {

  if (!(anchor instanceof HTMLElement)) {

    return "";

  }



  const href = anchor.getAttribute("href") || "";

  const match = href.match(/\/u(?:ser)?\/([^/?#]+)/i);

  if (match) {

    return decodeURIComponent(match[1]);

  }



  const text = String(anchor.textContent || "").trim();

  if (text && !text.toLowerCase().startsWith("[") && !text.includes("/")) {

    return text;

  }



  return "";

}



function findAuthorAnchor(container) {

  if (!(container instanceof HTMLElement)) {

    return null;

  }



  const selectors = [

    ".tagline a.author",

    "a.author",

    "a[data-testid='post_author_link']",

    "a[data-testid='comment_author_link']",

    "a[data-testid*='author']",

    "faceplate-tracker a[href*='/user/']",

    "faceplate-tracker a[href*='/u/']",

  ];



  for (const selector of selectors) {

    const link = container.querySelector(selector);

    if (link instanceof HTMLAnchorElement) {

      return link;

    }

  }



  const metaHosts = [

    container.querySelector(".tagline"),

    container.querySelector("header"),

    container.querySelector("[slot='commentMeta']"),

    container.querySelector("[slot='postMeta']"),

    container.querySelector("[data-testid='comment'] header"),

  ].filter(Boolean);



  for (const host of metaHosts) {

    const link = host.querySelector("a[href*='/user/'], a[href*='/u/']");

    if (link instanceof HTMLAnchorElement) {

      return link;

    }

  }



  return null;

}



function findClosestActionContainer(element) {

  if (!(element instanceof Element)) {

    return null;

  }



  const selector = [

    "shreddit-post",

    "shreddit-comment",

    "article",

    ".Comment",

    ".thing.link",

    ".thing.comment",

    "[data-testid='post-container']",

    "[data-testid='comment']",

  ].join(",");



  return element.closest(selector);

}



function pickTargetForContainer(container) {

  const fullname = extractFullnameFromAttributes(container);

  if (fullname) {

    return fullname;

  }



  const candidates = collectCandidateTargets(container);

  if (candidates.length > 0) {

    candidates.sort((a, b) => b.pathname.length - a.pathname.length);

    return candidates[0].toString();

  }



  if (isLikelyPostContainer(container)) {

    const postId = parsePostIdFromPath(window.location.pathname);

    if (postId) {

      return `t3_${postId}`;

    }

    if (isRedditCommentPath(window.location.pathname)) {

      return window.location.href;

    }

  }



  return null;

}



function tagNativeRemoveControls(container, target) {

  if (!(container instanceof HTMLElement) || !target) {

    return;

  }



  const selectors = [

    "button[data-testid*='remove' i]",

    "a[data-testid*='remove' i]",

    "[data-event-action='remove']",

    ".remove-button a",

    "button[aria-label*='remove' i]",

    "a[aria-label*='remove' i]",

    "button[title*='remove' i]",

    "a[title*='remove' i]",

    "[role='menuitem'][aria-label*='remove' i]",

  ];



  container.querySelectorAll(selectors.join(",")).forEach((node) => {

    if (!(node instanceof HTMLElement)) {

      return;

    }

    if (node.classList.contains("rrw-comment-nuke-btn")) {

      return;

    }

    node.dataset.rrwTarget = target;

  });

}



function resolveContainerSubreddit(container) {

  if (!(container instanceof HTMLElement)) {

    return parseSubredditFromPath(window.location.pathname);

  }



  const attrSubreddit =

    normalizeSubreddit(container.getAttribute("data-subreddit") || "") ||

    normalizeSubreddit(container.dataset.subreddit || "");

  if (attrSubreddit) {

    return attrSubreddit;

  }



  const candidates = collectCandidateTargets(container);

  for (const url of candidates) {

    const fromLink = parseSubredditFromCommentPath(url.pathname);

    if (fromLink) {

      return fromLink;

    }

  }



  return parseSubredditFromPath(window.location.pathname);

}



function isLikelyPostContainer(container) {

  if (!container) {

    return false;

  }

  const tag = String(container.tagName || "").toLowerCase();

  if (tag === "shreddit-post") {

    return true;

  }

  if (container.classList?.contains("thing") && container.classList?.contains("link")) {

    return true;

  }

  return false;

}



// â”€â”€â”€â”€ Context Popup Payload â”€â”€â”€â”€



function buildContextPopupPayloadForContainer(container, target = "") {

  if (!target) {

    return null;

  }



  const commentIdMatch = String(target).match(/^t1_([a-z0-9]{5,10})$/i);

  if (!commentIdMatch) {

    return null;

  }



  const commentId = commentIdMatch[1].toLowerCase();

  const permalink = container.querySelector("a[href*='permalink'], a[data-permalink]");

  if (!permalink) {

    return null;

  }



  const href = String(permalink.getAttribute("href") || "").trim();

  if (!href) {

    return null;

  }



  const contextJsonUrl = `${href}?context=1000&raw_json=1`;

  return {

    commentId,

    contextJsonUrl,

  };

}



// â”€â”€â”€â”€ Helper to prevent comment collapse on button clicks â”€â”€â”€â”€



function attachButtonClickHandlers(button, onClickFn) {

  // Prevent native Reddit comment collapse from triggering on clicks

  const stopEvent = (event) => {

    event.preventDefault?.();

    event.stopPropagation?.();

    event.stopImmediatePropagation?.();

  };

  

  button.addEventListener("mousedown", stopEvent, true);

  button.addEventListener("click", (event) => {

    stopEvent(event);

    onClickFn(event);

  }, false);

}



// â”€â”€â”€â”€ Core Container Binding â”€â”€â”€â”€



function bindContainer(container) {

  if (!(container instanceof HTMLElement)) {

    return;

  }

  if (container.dataset.rrwBound === "1") {

    return;

  }



  // Skip elements inside ModBox editor modals.

  if (container.closest(".rrw-usernotes-modal, .rrw-removal-config-modal")) {

    return;

  }



  console.log("[ModBox] bindContainer: starting bind for", container.tagName, "with id=" + container.id, "data-fullname=" + container.getAttribute("data-fullname"));



  const containerSubreddit = resolveContainerSubreddit(container);

  if (!isAllowedLaunchSubreddit(containerSubreddit)) {

    console.log("[ModBox] bindContainer: subreddit '" + containerSubreddit + "' not in allowedLaunchSubreddits (loaded=" + allowedLaunchSubredditsLoaded + ", set=" + (allowedLaunchSubreddits instanceof Set ? "yes size=" + allowedLaunchSubreddits.size : "no") + ")");

    return;

  }



  const target = pickTargetForContainer(container);

  if (!target) {

    console.log("[ModBox] bindContainer: no target found for", container.tagName);

    return;

  }

  

  console.log("[ModBox] bindContainer: successfully extracted target =", target, "for element", container.tagName);



  tagNativeRemoveControls(container, target);



  const button = document.createElement("button");

  button.type = "button";

  button.className = BUTTON_CLASS;

  button.textContent = "Mod Actions";

  button.dataset.rrwButtonTarget = target;

  attachButtonClickHandlers(button, () => {

    const btnTarget = button.dataset.rrwButtonTarget || target;

    console.log("[ModBox] MOD ACTIONS button clicked! container=", container.tagName, "target from closure=", target, "target from button attribute=", btnTarget);

    void openOverlay(btnTarget);

  });



  const itemSubreddit =

    normalizeSubreddit(container.getAttribute("data-subreddit") || "") ||

    parseSubredditFromPath(window.location.pathname);

  const isQueueCommentContainer =

    container.matches("shreddit-comment")

    || container.matches(".thing.comment")

    || container.matches("[data-testid='comment']")

    || Boolean(container.querySelector(".entry .flat-list.buttons a.bylink[data-event-action='context']"));

  const isQueueComment =

    isQueueListingPage()

    && (isQueueCommentContainer || /^t1_[a-z0-9]{5,10}$/i.test(target));

  const contextPayload = isQueueComment ? buildContextPopupPayloadForContainer(container, target) : null;



  const isOldRedditHost = String(window.location.hostname || "").toLowerCase() === "old.reddit.com";

  let contextInlineLinkInjected = false;

  if (contextPayload && isQueueComment && isOldRedditHost) {

    const oldRedditButtons = container.querySelector(".entry .flat-list.buttons, .entry ul.buttons");

    if (oldRedditButtons instanceof HTMLUListElement) {

      const existing = oldRedditButtons.querySelector(".rrw-comment-context-popup");

      if (existing) {

        contextInlineLinkInjected = true;

      } else {

        const li = document.createElement("li");

        const link = document.createElement("a");

        link.href = "javascript:;";

        link.className = "bylink rrw-comment-context-popup rrw-queue-context-popup";

        link.textContent = "context-popup";

        link.setAttribute("data-event-action", "context-popup");

        link.dataset.contextJsonUrl = contextPayload.contextJsonUrl;

        link.dataset.commentId = contextPayload.commentId;

        li.appendChild(link);



        const contextAnchor = oldRedditButtons.querySelector("a.bylink[data-event-action='context']");

        const contextItem = contextAnchor?.closest("li");

        if (contextItem instanceof HTMLLIElement) {

          contextItem.insertAdjacentElement("afterend", li);

        } else {

          oldRedditButtons.appendChild(li);

        }



        contextInlineLinkInjected = true;

      }



      // Add lock button for comments on queue pages

      if (!oldRedditButtons.querySelector(".rrw-comment-lock-btn")) {

        const fullname = extractFullnameFromAttributes(container);

        if (fullname) {

          const commentIsLocked = isCommentLockedInDOM(container);

          const lockLi = document.createElement("li");

          const lockLink = document.createElement("a");

          lockLink.href = "javascript:;";

          lockLink.className = "bylink rrw-comment-lock-btn rrw-oldreddit-lock-btn";

          lockLink.textContent = commentIsLocked ? "unlock" : "lock";

          lockLink.setAttribute("data-event-action", "comment-lock");

          lockLink.dataset.commentFullname = fullname;

          lockLink.dataset.isLocked = commentIsLocked ? "true" : "false";

          lockLi.appendChild(lockLink);

          oldRedditButtons.appendChild(lockLi);

        }

      }

    }

  }



  const contextButton = contextPayload && !contextInlineLinkInjected

    ? (() => {

      const buttonEl = document.createElement("button");

      buttonEl.type = "button";

      buttonEl.className = "rrw-history-btn rrw-comment-context-popup";

      buttonEl.textContent = "C";

      buttonEl.title = "Open comment context popup";

      buttonEl.dataset.contextJsonUrl = contextPayload.contextJsonUrl;

      buttonEl.dataset.commentId = contextPayload.commentId;

      attachButtonClickHandlers(buttonEl, (event) => {

        const contextJsonUrl = String(buttonEl.dataset.contextJsonUrl || "").trim();

        const commentId = String(buttonEl.dataset.commentId || "").trim().toLowerCase();

        if (contextJsonUrl) {

          void openContextPopup(contextJsonUrl, commentId, { x: event.clientX, y: event.clientY });

        }

      });

      return buttonEl;

    })()

    : null;



  const commentNukeButton = /^t1_[a-z0-9]{5,10}$/i.test(target) && commentNukeButtonEnabled

    ? (() => {

      const buttonEl = document.createElement("button");

      buttonEl.type = "button";

      buttonEl.className = "rrw-comment-nuke-btn";

      buttonEl.textContent = "R";

      buttonEl.title = "Remove this comment and its replies";

      buttonEl.dataset.commentNukeTarget = String(target).toLowerCase();

      buttonEl.dataset.commentNukeState = "idle";

      attachButtonClickHandlers(buttonEl, () => {

        void runCommentNukeWorkflow(target).catch((error) => {

          console.warn("[ModBox] Comment nuke failed:", error instanceof Error ? error.message : String(error));

        });

      });

      return buttonEl;

    })()

    : null;



  const modlogButton = document.createElement("button");

  modlogButton.type = "button";

  modlogButton.className = "rrw-modlog-btn";

  modlogButton.textContent = "ML";

  modlogButton.title = "Show latest modlog for this item";

  attachButtonClickHandlers(modlogButton, () => {

    void openInlineModlogPopup(modlogButton, { target, subreddit: itemSubreddit });

  });



  const authorAnchor = findAuthorAnchor(container);

  if (!authorAnchor) {

    console.log("[ModBox] bindContainer: no author anchor found");

  } else {

    console.log("[ModBox] bindContainer: found author anchor, binding container with target", target);

  }

  if (authorAnchor?.parentElement) {

    if (authorAnchor.dataset.rrwInlineBound === "1") {

      container.dataset.rrwBound = "1";

      return;

    }



    const usernotesChip = document.createElement("button");

    usernotesChip.type = "button";

    usernotesChip.className = "rrw-usernote-chip";

    usernotesChip.textContent = "Loading note...";



    const username = extractUsernameFromAuthorAnchor(authorAnchor);

    const subreddit =

      normalizeSubreddit(container.getAttribute("data-subreddit") || "") ||

      parseSubredditFromPath(window.location.pathname);

    const postId = parsePostIdFromPath(window.location.pathname);

    const linkTarget = postId && subreddit

      ? formatRedditUrl(subreddit, postId)

      : formatRedditByIdUrl(extractFullnameFromAttributes(container)) || window.location.href;



    const inlineGroup = document.createElement("span");

    inlineGroup.className = "rrw-inline-group";

    button.classList.add("rrw-launch-btn-inline");

    const historyButton = document.createElement("button");

    historyButton.type = "button";

    historyButton.className = "rrw-history-btn";

    historyButton.textContent = "H";

    historyButton.title = "Open brief user history";

    attachButtonClickHandlers(historyButton, () => {

      if (username) {

        void openInlineHistoryPopup(historyButton, { username, subreddit });

      }

    });

    const profileButton = document.createElement("button");

    profileButton.type = "button";

    profileButton.className = PROFILE_BUTTON_CLASS;

    profileButton.textContent = "P";

    profileButton.title = "Open ModBox profile view";

    attachButtonClickHandlers(profileButton, () => {

      if (username) {

        openProfileView(username, { listing: "overview", subreddit });

      }

    });



    inlineGroup.appendChild(usernotesChip);

    if (commentNukeButton) {

      inlineGroup.appendChild(commentNukeButton);

    }

    if (username && historyButtonEnabled) {

      inlineGroup.appendChild(historyButton);

    }

    if (contextButton) {

      inlineGroup.appendChild(contextButton);

    }

    if (username) {

      inlineGroup.appendChild(profileButton);

    }

    inlineGroup.appendChild(modlogButton);



    const quickActionsButton = document.createElement("button");

    quickActionsButton.type = "button";

    quickActionsButton.className = "rrw-quick-actions-pill";

    quickActionsButton.textContent = "Q";

    quickActionsButton.title = "Open quick actions panel";

    quickActionsButton.dataset.rrwButtonTarget = target;

    attachButtonClickHandlers(quickActionsButton, () => {

      const btnTarget = quickActionsButton.dataset.rrwButtonTarget || target;

      void openOverlay(btnTarget, { quickActionsOnlyMode: true, subreddit: itemSubreddit });

    });

    inlineGroup.appendChild(quickActionsButton);



    inlineGroup.appendChild(button);



    // Find the last flair/badge element after the author anchor to position pills after them

    let insertAfterEl = authorAnchor;

    let currentSibling = authorAnchor.nextElementSibling;

    while (currentSibling) {

      const isFlairLike = 

        currentSibling.classList.contains("flair") ||

        currentSibling.classList.contains("user-flair") ||

        currentSibling.classList.contains("moderator") ||

        currentSibling.classList.contains("op") ||

        currentSibling.classList.contains("verified") ||

        currentSibling.textContent === "[M]" ||

        currentSibling.tagName.toLowerCase() === "flair-rich-text" ||

        (currentSibling.tagName.toLowerCase().includes("flair") || 

         currentSibling.getAttribute("class")?.includes("flair") ||

         false);

      

      if (isFlairLike || currentSibling.classList.contains("rrw-inline-group")) {

        if (currentSibling.classList.contains("rrw-inline-group")) {

          break;

        }

        insertAfterEl = currentSibling;

        currentSibling = currentSibling.nextElementSibling;

      } else {

        break;

      }

    }



    const existingInlineGroup = insertAfterEl.nextElementSibling;

    if (existingInlineGroup instanceof HTMLElement && existingInlineGroup.classList.contains("rrw-inline-group")) {

      authorAnchor.dataset.rrwInlineBound = "1";

      container.dataset.rrwBound = "1";

      return;

    }

    insertAfterEl.insertAdjacentElement("afterend", inlineGroup);

    authorAnchor.dataset.rrwInlineBound = "1";



    void setupInlineUsernoteChip(usernotesChip, {

      subreddit,

      username,

      link: linkTarget,

    });



    container.dataset.rrwBound = "1";

    return;

  }



  const toolbarHost =

    container.querySelector('[data-testid="comment"]') ||

    container.querySelector('[slot="actions"]') ||

    container.querySelector("header") ||

    container;



  const taglineHost = container.querySelector(".entry .tagline");

  if (taglineHost) {

    modlogButton.classList.add("rrw-launch-btn-inline");

    button.classList.add("rrw-launch-btn-inline", "rrw-launch-btn-inline--solo");

    if (commentNukeButton) {

      commentNukeButton.classList.add("rrw-launch-btn-inline");

      taglineHost.insertAdjacentElement("beforeend", commentNukeButton);

    }

    if (contextButton) {

      contextButton.classList.add("rrw-launch-btn-inline");

      taglineHost.insertAdjacentElement("beforeend", contextButton);

    }

    taglineHost.insertAdjacentElement("beforeend", modlogButton);

    taglineHost.insertAdjacentElement("beforeend", button);

    container.dataset.rrwBound = "1";

    return;

  }



  modlogButton.classList.add("rrw-launch-btn-inline");

  if (commentNukeButton) {

    commentNukeButton.classList.add("rrw-launch-btn-inline");

    toolbarHost.appendChild(commentNukeButton);

  }

  if (contextButton) {

    contextButton.classList.add("rrw-launch-btn-inline");

    toolbarHost.appendChild(contextButton);

  }

  toolbarHost.appendChild(modlogButton);

  toolbarHost.appendChild(button);

  container.dataset.rrwBound = "1";

}



// â”€â”€â”€â”€ Visible Container Binding â”€â”€â”€â”€



function bindVisibleContainers() {

  const candidates = new Set();

  document.querySelectorAll(BINDABLE_CONTAINER_SELECTOR).forEach((el) => candidates.add(el));

  console.log("[ModBox] bindVisibleContainers: found " + candidates.size + " containers");

  candidates.forEach((container) => bindContainer(container));

  scheduleQueueToolsBind();

  bindModmailParticipantPills();

}



function bindVisibleContainersFromRoots(roots) {

  const candidates = new Set();

  roots.forEach((root) => collectBindableContainersFromRoot(root, candidates));

  candidates.forEach((container) => bindContainer(container));

  scheduleQueueToolsBind();

  bindModmailParticipantPills();

}



function flushScheduledVisibleContainerBind() {

  visibleContainerBindScheduled = false;



  if (visibleContainerBindNeedsFullScan) {

    visibleContainerBindNeedsFullScan = false;

    visibleContainerBindPendingRoots.clear();

    bindVisibleContainers();

    bindOldRedditContextPopupLinks();

    bindOldRedditReplyFormPills();

    return;

  }



  const roots = Array.from(visibleContainerBindPendingRoots);

  visibleContainerBindPendingRoots.clear();

  if (roots.length > 0) {

    bindVisibleContainersFromRoots(roots);

  }

  bindOldRedditContextPopupLinks();

  bindOldRedditReplyFormPills();

}



function scheduleVisibleContainerBind(options = {}) {

  const fullScan = Boolean(options.fullScan);

  const mutationRecords = Array.isArray(options.mutationRecords) ? options.mutationRecords : [];



  if (fullScan) {

    visibleContainerBindNeedsFullScan = true;

  } else {

    let addedNodeCount = 0;

    mutationRecords.forEach((record) => {

      if (record?.addedNodes) {

        record.addedNodes.forEach((node) => {

          if (node instanceof Element) {

            addedNodeCount += 1;

            if (node === document.documentElement || node === document.body) {

              visibleContainerBindNeedsFullScan = true;

              return;

            }

            visibleContainerBindPendingRoots.add(node);

            const nearestContainer = node.closest(BINDABLE_CONTAINER_SELECTOR);

            if (nearestContainer instanceof Element) {

              visibleContainerBindPendingRoots.add(nearestContainer);

            }

          }

        });

      }

    });



    if (addedNodeCount > MAX_MUTATION_ADDED_NODES_BEFORE_FULL_SCAN) {

      visibleContainerBindNeedsFullScan = true;

      visibleContainerBindPendingRoots.clear();

    } else if (visibleContainerBindPendingRoots.size > MAX_PENDING_BIND_ROOTS) {

      visibleContainerBindNeedsFullScan = true;

      visibleContainerBindPendingRoots.clear();

    }

  }



  if (visibleContainerBindScheduled) {

    return;

  }

  visibleContainerBindScheduled = true;

  requestAnimationFrame(() => {

    flushScheduledVisibleContainerBind();

  });

}



// â”€â”€â”€â”€ Queue Tools Binding (Stub - no UI yet) â”€â”€â”€â”€



function bindModmailParticipantPills() {

  if (!isModmailConversationPage()) return;



  // Guard: if allowed subreddits haven't loaded yet the MutationObserver will

  // re-trigger this function once they have â€“ don't mark cards as bound yet.

  if (!allowedLaunchSubredditsLoaded) return;

  if (!(allowedLaunchSubreddits instanceof Set) || !allowedLaunchSubreddits.size) return;



  // Detect the conversation subreddit via multiple strategies so we don't

  // depend on the subreddit appearing as an explicit <a href="/r/..."> link.

  let subreddit = null;



  // Strategy 1: Page title â€“ Reddit often includes "r/SubName" in the title.

  const titleMatch = String(document.title || "").match(/\br\/([A-Za-z0-9_]+)/i);

  if (titleMatch) {

    const candidate = normalizeSubreddit(titleMatch[1]);

    if (candidate && candidate.toLowerCase() !== "mod" && allowedLaunchSubreddits.has(candidate.toLowerCase())) {

      subreddit = candidate;

    }

  }



  // Strategy 2: Any visible text on the page that looks like "r/SubName"

  // matching a moderated subreddit â€“ catches breadcrumbs rendered as plain text.

  if (!subreddit) {

    const bodyText = String(document.body?.textContent || "");

    for (const sub of allowedLaunchSubreddits) {

      const pattern = new RegExp(`(?:^|[^A-Za-z0-9_])r\\/${sub}(?:[^A-Za-z0-9_]|$)`, "i");

      if (pattern.test(bodyText)) {

        subreddit = normalizeSubreddit(sub);

        break;

      }

    }

  }



  // Strategy 3: Scan r/ links on the page (original approach, last resort).

  if (!subreddit) {

    for (const link of document.querySelectorAll("a[href*='/r/']")) {

      const m = (link.getAttribute("href") || "").match(/\/r\/([^/?#]+)/i);

      if (!m) continue;

      const candidate = normalizeSubreddit(m[1]);

      if (!candidate || candidate.toLowerCase() === "mod") continue;

      if (allowedLaunchSubreddits.has(candidate.toLowerCase())) {

        subreddit = candidate;

        break;

      }

    }

  }



  if (!subreddit) return;



  // Prefer links in the right sidebar, with a ModIdCard fallback.

  const profileLinks = new Set();

  document

    .querySelectorAll("aside a[href*='/user/'], aside a[href*='/u/'], .ModIdCard a[href*='/user/'], .ModIdCard a[href*='/u/']")

    .forEach((link) => {

      if (link instanceof HTMLAnchorElement) {

        profileLinks.add(link);

      }

    });



  profileLinks.forEach((profileLink) => {

    if (profileLink.dataset.rrwMmBound === "1") return;



    const href = profileLink.getAttribute("href") || "";

    const usernameMatch = href.match(/\/(?:u|user)\/([^/?#]+)/i);

    if (!usernameMatch) return;

    const username = decodeURIComponent(usernameMatch[1]);

    if (!username || username === "[deleted]") return;



    const insertAfter =

      profileLink.closest(".ModIdCard__UserNameContainer") ||

      profileLink.closest(".ModIdCard__UserNameMetaData") ||

      profileLink.parentElement;

    if (!insertAfter) return;



    if (insertAfter.parentElement?.querySelector(":scope > .rrw-mm-pills")) {

      profileLink.dataset.rrwMmBound = "1";

      return;

    }



    const pillGroup = document.createElement("div");

    pillGroup.className = "rrw-inline-group rrw-mm-pills";



    const usernotesChip = document.createElement("button");

    usernotesChip.type = "button";

    usernotesChip.className = "rrw-usernote-chip";

    usernotesChip.textContent = subreddit ? "Loading note..." : "N";



    const historyButton = document.createElement("button");

    historyButton.type = "button";

    historyButton.className = "rrw-history-btn";

    historyButton.textContent = "H";

    historyButton.title = "Open brief user history";

    historyButton.addEventListener("click", (e) => {

      e.preventDefault();

      e.stopPropagation();

      void openInlineHistoryPopup(historyButton, { username, subreddit: subreddit || "" });

    });



    const profileButton = document.createElement("button");

    profileButton.type = "button";

    profileButton.className = PROFILE_BUTTON_CLASS;

    profileButton.textContent = "P";

    profileButton.title = "Open ModBox profile view";

    profileButton.addEventListener("click", (e) => {

      e.preventDefault();

      e.stopPropagation();

      openProfileView(username, { listing: "overview", subreddit: subreddit || "" });

    });



    pillGroup.appendChild(usernotesChip);

    if (historyButtonEnabled) {

      pillGroup.appendChild(historyButton);

    }

    pillGroup.appendChild(profileButton);



    insertAfter.insertAdjacentElement("afterend", pillGroup);

    profileLink.dataset.rrwMmBound = "1";



    if (subreddit) {

      void setupInlineUsernoteChip(usernotesChip, {

        subreddit,

        username,

        link: window.location.href,

      });

    } else {

      usernotesChip.title = "Usernotes unavailable: subreddit could not be resolved";

      usernotesChip.disabled = true;

    }

  });

}



function bindOldRedditContextPopupLinks() {

  // Stub: Real implementation for old.reddit.com context links

}



function bindOldRedditReplyFormPills() {

  if (String(window.location.hostname || "").toLowerCase() !== "old.reddit.com") return;

  if (!allowedLaunchSubredditsLoaded) return;



  // Old QA reply pill button removed - now using the better Q pill on comments





}

// ------------------------------------------------------------------------------
// overlay.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Overlay System Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Core overlay management: theme detection, DOM management, view state preservation.

// Dependencies: constants.js (OVERLAY_ROOT_ID), state.js (overlayState, removalConfigEditorState)



// â”€â”€â”€â”€ Theme Detection â”€â”€â”€â”€

// NOTE: Theme detection functions are defined in theme.js

// This module references: normalizeThemeMode(), pageUsesDarkTheme(), resolveActiveTheme()

// from the theme.js module. Overlay uses these functions via global scope.



// â”€â”€â”€â”€ Overlay Root Management â”€â”€â”€â”€



function ensureOverlayRoot() {

  let root = document.getElementById(OVERLAY_ROOT_ID);

  if (root) {

    console.log("[ModBox] ensureOverlayRoot: Found existing root");

    return root;

  }

  console.log("[ModBox] ensureOverlayRoot: Creating new root");

  root = document.createElement("div");

  root.id = OVERLAY_ROOT_ID;

  console.log("[ModBox] ensureOverlayRoot: Appending to body");

  // Append to body instead of documentElement so the element is in the visible document flow

  if (document.body) {

    document.body.appendChild(root);

  } else {

    // Fallback if body doesn't exist yet

    document.documentElement.appendChild(root);

  }

  console.log("[ModBox] ensureOverlayRoot: Root appended, checking DOM:");

  console.log("[ModBox]   - In body:", document.body ? document.body.contains(root) : "no body");

  console.log("[ModBox]   - Root parent:", root.parentElement?.id || root.parentElement?.tagName);

  

  // Apply the current theme to the newly created root

  const activeTheme = resolveActiveTheme(currentThemeMode);

  root.setAttribute("data-rrw-theme", activeTheme);

  

  return root;

}



// â”€â”€â”€â”€ View State Capture & Restore â”€â”€â”€â”€



function captureOverlayViewState(root) {

  const modal = root.querySelector(".rrw-overlay-modal");

  const checklist = root.querySelector(".rrw-checklist");

  const active = document.activeElement;

  const state = {

    modalScrollTop: modal?.scrollTop || 0,

    checklistScrollTop: checklist?.scrollTop || 0,

    activeTarget: null,

    selectionStart: null,

    selectionEnd: null,

  };



  if (active instanceof HTMLElement && root.contains(active)) {

    if (active.id) {

      state.activeTarget = { type: "id", value: active.id };

    } else if (active.hasAttribute("data-input-key")) {

      state.activeTarget = { type: "input-key", value: active.getAttribute("data-input-key") };

    } else if (active.hasAttribute("data-reason-key")) {

      state.activeTarget = { type: "reason-key", value: active.getAttribute("data-reason-key") };

    }



    if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {

      state.selectionStart = active.selectionStart;

      state.selectionEnd = active.selectionEnd;

    }

  }



  return state;

}



function restoreOverlayViewState(root, state) {

  const modal = root.querySelector(".rrw-overlay-modal");

  const checklist = root.querySelector(".rrw-checklist");

  if (modal) {

    modal.scrollTop = state.modalScrollTop || 0;

  }

  if (checklist) {

    checklist.scrollTop = state.checklistScrollTop || 0;

  }



  let active = null;

  if (state.activeTarget?.type === "id") {

    active = root.querySelector(`#${state.activeTarget.value}`);

  } else if (state.activeTarget?.type === "input-key") {

    active = root.querySelector(`[data-input-key="${state.activeTarget.value}"]`);

  } else if (state.activeTarget?.type === "reason-key") {

    active = root.querySelector(`[data-reason-key="${state.activeTarget.value}"]`);

  }



  if (active instanceof HTMLElement) {

    active.focus({ preventScroll: true });

    if (

      (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) &&

      state.selectionStart !== null &&

      state.selectionEnd !== null

    ) {

      active.setSelectionRange(state.selectionStart, state.selectionEnd);

    }

  }

}



// â”€â”€â”€â”€ Overlay Lifecycle â”€â”€â”€â”€



function clearPreviewTimer() {

  if (overlayState && overlayState.previewTimerId) {

    clearTimeout(overlayState.previewTimerId);

    overlayState.previewTimerId = null;

  }

}



function findReplyTextarea() {

  // Try to find comment reply textarea

  const commentReplyForm = document.querySelector(".usertext-edit textarea, .comment .textarea");

  if (commentReplyForm instanceof HTMLTextAreaElement) {

    return commentReplyForm;

  }



  // Try to find modmail reply textarea

  const modmailReplyForm = document.querySelector(".modmail textarea, .modmail-compose textarea, [data-testid='modmail-reply'] textarea");

  if (modmailReplyForm instanceof HTMLTextAreaElement) {

    return modmailReplyForm;

  }



  // Try generic textarea in focused or recently interacted element

  const activeElement = document.activeElement;

  if (activeElement instanceof HTMLTextAreaElement) {

    return activeElement;

  }



  // Fallback: find any visible textarea (not in the overlay)

  const allTextareas = document.querySelectorAll("textarea");

  for (const textarea of allTextareas) {

    if (textarea.offsetHeight > 0 && textarea.offsetWidth > 0) {

      // Skip if it's inside the overlay

      const overlayRoot = document.getElementById(OVERLAY_ROOT_ID);

      if (overlayRoot && overlayRoot.contains(textarea)) {

        continue;

      }

      return textarea;

    }

  }



  return null;

}



function showCannedRepliesDropdown() {

  if (!overlayState || !overlayState.cannedRepliesConfig) {

    return;

  }



  const replies = overlayState.cannedRepliesConfig?.replies || [];

  if (replies.length === 0) {

    showToast("No canned replies available", "error");

    return;

  }



  // Create dropdown container

  const dropdown = document.createElement("div");

  dropdown.className = "rrw-canned-replies-dropdown";

  dropdown.innerHTML = `

    <div class="rrw-canned-header">Canned Replies</div>

    <div class="rrw-canned-list">

      ${replies.map((reply) => `

        <button type="button" class="rrw-canned-item" data-canned-reply-name="${escapeHtml(reply.name)}" title="${escapeHtml(reply.content.slice(0, 240))}">

          ${escapeHtml(reply.name)}

        </button>

      `).join("")}

    </div>

  `;



  // Position at mouse cursor or center

  dropdown.style.position = "fixed";

  dropdown.style.top = (window.innerHeight / 2 - 100) + "px";

  dropdown.style.left = (window.innerWidth / 2 - 100) + "px";

  dropdown.style.zIndex = "10001";



  const root = ensureOverlayRoot();

  root.appendChild(dropdown);



  // Attach handlers

  dropdown.querySelectorAll("[data-canned-reply-name]").forEach((btn) => {

    btn.addEventListener("click", (e) => {

      const replyName = String(e.currentTarget.getAttribute("data-canned-reply-name") || "").trim();

      const reply = replies.find((item) => String(item.name || "").trim() === replyName);

      if (reply && reply.content) {

        const textarea = findReplyTextarea();

        if (textarea) {

          const currentValue = textarea.value || "";

          const newValue = currentValue ? `${currentValue}\n\n${reply.content}` : reply.content;

          textarea.value = newValue;

          textarea.dispatchEvent(new Event("input", { bubbles: true }));

          textarea.dispatchEvent(new Event("change", { bubbles: true }));

          textarea.focus();

          showToast(`✓ Inserted: ${replyName}`, "success");

          dropdown.remove();

        } else {

          showToast("Reply box not found", "error");

        }

      }

    });

  });



  // Close on click outside

  setTimeout(() => {

    document.addEventListener("click", (e) => {

      if (!dropdown.contains(e.target)) {

        dropdown.remove();

      }

    }, { once: true });

  }, 0);

}



function closeOverlay() {

  clearPreviewTimer();

  if (overlayState?.keydownHandler) {

    document.removeEventListener("keydown", overlayState.keydownHandler, true);

  }

  removalConfigEditorState = null;

  overlayState = null;

  const root = document.getElementById(OVERLAY_ROOT_ID);

  if (root instanceof HTMLElement) {

    root.querySelectorAll(".rrw-overlay-modal, .rrw-overlay-backdrop").forEach((el) => el.remove());

  }

}



function applyActionBorderToElement(fullname, actionType) {

  /**

   * Applies a colored background to the post/comment element to indicate moderation action.

   * @param {string} fullname - The Reddit thing fullname (e.g., t1_abc123, t3_xyz789)

   * @param {string} actionType - Type of action: "remove", "spam", "comment_nuke", or "approve"

   */

  if (!String(fullname || "").trim()) {

    return;

  }



  const cleanFullname = String(fullname).trim().toLowerCase();

  

  // Try to find the element by data-fullname attribute

  let targetElement = document.querySelector(`[data-fullname="${cleanFullname}"]`);

  

  // Fallback: search for .thing element by ID pattern (old.reddit.com uses id like "t1_xxx" or "t3_xxx")

  if (!targetElement) {

    targetElement = document.getElementById(cleanFullname);

  }

  

  // Fallback: search through all .thing elements for matching fullname in their content

  if (!targetElement) {

    const allThings = document.querySelectorAll(".thing");

    for (const thing of allThings) {

      if (thing instanceof HTMLElement && (thing.id || thing.dataset.fullname || "").toLowerCase() === cleanFullname) {

        targetElement = thing;

        break;

      }

    }

  }



  if (!targetElement || !(targetElement instanceof HTMLElement)) {

    console.log("[ModBox] Could not find element for fullname:", fullname);

    return;

  }



  // Determine background and text color based on action type

  // Check if dark theme is active

  const isDarkTheme = document.documentElement.getAttribute("data-rrw-theme") === "dark";

  

  let bgColor, textColor, borderColor;

  

  if (actionType === "approve") {

    // Green coloring for approvals

    if (isDarkTheme) {

      bgColor = "rgba(50, 120, 80, 0.85)";

      textColor = "#a0ffb8";

      borderColor = "rgba(80, 150, 110, 0.8)";

    } else {

      bgColor = "rgba(200, 255, 220, 0.92)";

      textColor = "#1a5a2a";

      borderColor = "rgba(60, 200, 80, 0.7)";

    }

  } else if (["remove", "spam", "comment_nuke", "remove_no_reason"].includes(actionType)) {

    // Red coloring for removals and spam

    if (isDarkTheme) {

      bgColor = "rgba(140, 50, 50, 0.85)";

      textColor = "#ffb3b3";

      borderColor = "rgba(220, 100, 100, 0.8)";

    } else {

      bgColor = "rgba(255, 200, 200, 0.92)";

      textColor = "#731919";

      borderColor = "rgba(200, 60, 60, 0.7)";

    }

  }



  // Apply background styling

  if (targetElement.style.border) {

    // Remove any existing border styling to avoid conflicts

    targetElement.style.border = "";

    targetElement.style.boxShadow = "";

  }

  

  targetElement.style.backgroundColor = bgColor;

  targetElement.style.borderRadius = "8px";

  targetElement.style.color = textColor;

  targetElement.style.borderColor = borderColor;

  

  console.log(`[ModBox] Applied ${actionType} background to ${cleanFullname}`);

}



// â”€â”€â”€â”€ Removal Overlay Functions â”€â”€â”€â”€







function renderOverlay() {

  if (!overlayState) {

    return;

  }

    if (isPointerDown) {

      deferredRenders.add("overlay");

      return;

    }



  const root = ensureOverlayRoot();

  root.setAttribute("data-rrw-theme", resolveActiveTheme());

  const viewState = captureOverlayViewState(root);



  // Attach Remove User Flair button handler after overlay render

  setTimeout(() => {

    const removeUserFlairButton = root.querySelector("#rrw-remove-user-flair");

    if (removeUserFlairButton) {

      removeUserFlairButton.addEventListener("click", () => {

        void callAction("remove_user_flair");

      });

    }

  }, 0);

  const {

    loading,

    target,

    resolved,

    reasons,

    selectedReasonKeys,

    sendMode,

    inputValues,

    error,

    submitting,

    status,

    reasonSearch,

    compactMode,

    validationErrors,

    previewMessage,

    previewSubject,

    previewLoading,

    previewError,

    removalNoteText,

    removalNoteType,

    removalNoteTypes,

    removalNoteTypeLabels,

    configFromCache,

    activeTab,

    userFlairTemplates,

    selectedUserFlairTemplateId,

    banDurationOption,

    banCustomDays,

    banMessage,

    isUserAlreadyBanned,

    banStatusLoading,

    addBanUsernote,

    banUsernoteText,

    banUsernoteType,

    banUsernoteAutoValue,

    quickActionsConfig,

    quickActionsLoading,

    quickActionsError,

    quickActionsStatus,

    playbooksConfig,

    playbooksLoading,

    playbooksError,

    playbooksStatus,

    cannedRepliesConfig,

    cannedRepliesLoading,

    cannedRepliesError,

    cannedRepliesStatus,

    quickActionsOnlyMode,

  } = overlayState;



  const thingType = resolved?.thingType || (target.startsWith("t3_") ? "submission" : "comment");

  const matchingReasons = reasons.filter((r) => isReasonForThing(r, thingType));

  const searchText = (reasonSearch || "").trim().toLowerCase();

  const visibleReasons = searchText

    ? matchingReasons.filter((r) => String(r.title || "").toLowerCase().includes(searchText))

    : matchingReasons;



  const selectedReasonSet = new Set(selectedReasonKeys || []);

  const reasonChecklist = visibleReasons

    .map(

      (r) => `

      <label class="rrw-check-item">

        <input type="checkbox" data-reason-key="${escapeHtml(r.external_key)}" ${selectedReasonSet.has(r.external_key) ? "checked" : ""} />

        <span>${escapeHtml(r.title)}</span>

      </label>

    `,

    )

    .join("");



  const dynamicBlockByKey = new Map();

  matchingReasons

    .filter((reason) => selectedReasonSet.has(reason.external_key))

    .forEach((reason) => {

      (reason.blocks || []).forEach((block) => {

        if (!block || !block.key) {

          return;

        }

        if (block.type !== "input" && block.type !== "textarea" && block.type !== "select") {

          return;

        }

        if (!dynamicBlockByKey.has(block.key)) {

          dynamicBlockByKey.set(block.key, block);

        }

      });

    });



  const dynamicBlocks = Array.from(dynamicBlockByKey.values());

  overlayState.dynamicBlocks = dynamicBlocks;

  overlayState.fullname = resolved?.fullname || target;



  const selectedReasonChips = matchingReasons

    .filter((reason) => selectedReasonSet.has(reason.external_key))

    .map(

      (reason) => `

        <button type="button" class="rrw-chip" data-remove-reason="${escapeHtml(reason.external_key)}">

          <span>${escapeHtml(reason.title)}</span>

          <span aria-hidden="true">x</span>

        </button>

      `,

    )

    .join("");



  const dynamicFields = dynamicBlocks

    .map((block) => {

      const key = block.key;

      const label = block.label || key;

      const value = inputValues[key] || "";

      const fieldError = validationErrors?.[key] || "";

      if (block.type === "textarea") {

        return `

          <label class="rrw-field${fieldError ? " rrw-field--invalid" : ""}">

            <span>${escapeHtml(label)}${block.required ? " *" : ""}</span>

            <textarea data-input-key="${escapeHtml(key)}" rows="3">${escapeHtml(value)}</textarea>

            ${fieldError ? `<span class="rrw-field-error">${escapeHtml(fieldError)}</span>` : ""}

          </label>

        `;

      }

      if (block.type === "select") {

        const opts = blockOptions(block)

          .map((opt) => `<option value="${escapeHtml(opt.value)}" ${opt.value === value ? "selected" : ""}>${escapeHtml(opt.label)}</option>`)

          .join("");

        return `

          <label class="rrw-field${fieldError ? " rrw-field--invalid" : ""}">

            <span>${escapeHtml(label)}${block.required ? " *" : ""}</span>

            <select data-input-key="${escapeHtml(key)}">

              <option value="">- pick one -</option>

              ${opts}

            </select>

            ${fieldError ? `<span class="rrw-field-error">${escapeHtml(fieldError)}</span>` : ""}

          </label>

        `;

      }

      return `

        <label class="rrw-field${fieldError ? " rrw-field--invalid" : ""}">

          <span>${escapeHtml(label)}${block.required ? " *" : ""}</span>

          <input data-input-key="${escapeHtml(key)}" value="${escapeHtml(value)}" />

          ${fieldError ? `<span class="rrw-field-error">${escapeHtml(fieldError)}</span>` : ""}

        </label>

      `;

    })

    .join("");



  const availableRemovalNoteTypes = Array.from(

    new Set(["none", ...(Array.isArray(removalNoteTypes) ? removalNoteTypes : [])]),

  );

  const removalNoteTypeOptions = availableRemovalNoteTypes

    .map((value) => {

      const label = String(removalNoteTypeLabels?.[String(value).toLowerCase()] || value);

      return `<option value="${escapeHtml(value)}" ${value === (removalNoteType || "none") ? "selected" : ""}>${escapeHtml(label)}</option>`;

    })

    .join("");



  const canAct = Boolean(resolved?.isActionable || isFullname(target));

  const actionsTabLabel = thingType === "submission" ? "Post Actions" : "Comment Actions";

  const overlayTab = quickActionsOnlyMode

    ? (["quick_actions", "playbooks"].includes(activeTab) ? activeTab : "quick_actions")

    : (["kind_actions", "quick_actions", "playbooks", "user_actions"].includes(activeTab) ? activeTab : "kind_actions");

  const canRunUserActions = canAct && Boolean(resolved?.author);

  const effectiveBanDays = banDurationOption === "custom"

    ? Number.parseInt(String(banCustomDays || ""), 10)

    : Number.parseInt(String(banDurationOption || ""), 10);

  const canBuildTempBanCode = Number.isFinite(effectiveBanDays) && effectiveBanDays > 0;

  const suggestedTempBanCode = canBuildTempBanCode ? `${effectiveBanDays}DTB` : "";

  const displayTitle = resolved?.title || (thingType === "comment" ? "Comment" : (resolved?.bodyPreview || target));

  const subtitle = resolved

    ? `u/${resolved.author || "[deleted]"} \u00B7 r/${resolved.subreddit || "unknown"}`

    : "Direct fullname fallback";

  const targetBodyHtml = resolved?.bodyHtml || renderProfileMarkdown(String(resolved?.bodyPreview || ""));



  const userFlairOptions = (Array.isArray(userFlairTemplates) ? userFlairTemplates : [])

    .map((template) => {

      const id = String(template?.id || "").trim();

      if (!id) {

        return "";

      }

      const labelText = String(template?.text || template?.css_class || id);

      return `<option value="${escapeHtml(id)}" ${id === (selectedUserFlairTemplateId || "") ? "selected" : ""}>${escapeHtml(labelText)}</option>`;

    })

    .join("");



  const resolvedSubreddit = normalizeSubreddit(resolved?.subreddit || "");

  const quickActions = normalizeQuickActionsDoc(

    quickActionsConfig || getInMemoryQuickActions(resolvedSubreddit) || buildDefaultQuickActionsConfig(resolvedSubreddit),

    resolvedSubreddit,

  ).actions;

  const visibleQuickActions = quickActions.filter((action) => {

    const appliesTo = String(action?.applies_to || "both").toLowerCase();

    if (appliesTo === "both") {

      return true;

    }

    if (thingType === "submission") {

      return appliesTo === "posts";

    }

    return appliesTo === "comments";

  });



  const playbooks = normalizePlaybooksDoc(

    playbooksConfig || getInMemoryPlaybooks(resolvedSubreddit) || buildDefaultPlaybooksConfig(resolvedSubreddit),

    resolvedSubreddit,

  ).playbooks;

  const visiblePlaybooks = playbooks.filter((playbook) => {

    if (playbook?.is_enabled === false) {

      return false;

    }

    const appliesTo = String(playbook?.applies_to || "both").toLowerCase();

    if (appliesTo === "both") {

      return true;

    }

    if (thingType === "submission") {

      return appliesTo === "posts";

    }

    return appliesTo === "comments";

  });



  root.innerHTML = `

    <div class="rrw-overlay-backdrop" data-overlay-close="1"></div>

    <section class="rrw-overlay-modal${compactMode ? " rrw-overlay-modal--compact" : ""}" role="dialog" aria-modal="true" aria-label="ModBox">

      <header class="rrw-overlay-header">

        <h2>${quickActionsOnlyMode ? "Quick Actions" : "ModBox"}</h2>

        <div class="rrw-header-actions">

          ${!quickActionsOnlyMode ? `<button type="button" class="rrw-refresh-btn" id="rrw-link-generator" title="Generate ModBox ban links">🔗</button>

          <button type="button" class="rrw-refresh-btn" id="rrw-edit-config" title="Open ModBox settings editor" ${resolved?.subreddit ? "" : "disabled"}>Edit</button>

          <button type="button" class="rrw-refresh-btn" id="rrw-refresh-config" title="Refresh removal reasons">\u21BB</button>` : ""}

          <button type="button" class="rrw-close" data-overlay-close="1">Close</button>

        </div>

      </header>



      <div class="rrw-overlay-body">

        ${loading ? `<p class="rrw-muted">Loading target and reasons...</p>` : ""}

        ${!loading ? `

          <div class="rrw-target-card">

            <h3>${escapeHtml(displayTitle)}</h3>

            <p class="rrw-muted">${escapeHtml(subtitle)}</p>

            ${targetBodyHtml ? `

              <div class="rrw-target-body${overlayState.targetCardExpanded ? "" : " rrw-target-body--collapsed"}">${targetBodyHtml}</div>

              <button type="button" class="rrw-target-expand-btn" id="rrw-target-card-expand">${overlayState.targetCardExpanded ? "\u25B2 Show less" : "\u25BC Show more"}</button>

            ` : ""}

            ${resolved?.permalink ? `<a href="${escapeHtml(buildRedditUrl(resolved.permalink, preferredRedditLinkHost))}" target="_blank" rel="noreferrer">Open on Reddit</a>` : ""}

          </div>

        ` : ""}



        ${error ? `<div class="rrw-error">${escapeHtml(error)}</div>` : ""}

        ${status ? `<div class="rrw-success">${escapeHtml(status)}</div>` : ""}

        ${!canAct ? `<div class="rrw-error">Target is not actionable for configured subreddit.</div>` : ""}



        ${!loading ? `

          <div class="rrw-tabs" role="tablist" aria-label="Overlay actions tabs">

            ${!quickActionsOnlyMode ? `<button

              type="button"

              class="rrw-tab-btn ${overlayTab === "kind_actions" ? "rrw-tab-btn--active" : ""}"

              data-overlay-tab="kind_actions"

            >${escapeHtml(actionsTabLabel)}</button>` : ""}

            <button

              type="button"

              class="rrw-tab-btn ${overlayTab === "quick_actions" ? "rrw-tab-btn--active" : ""}"

              data-overlay-tab="quick_actions"

            >Quick Actions</button>

            <button

              type="button"

              class="rrw-tab-btn ${overlayTab === "playbooks" ? "rrw-tab-btn--active" : ""}"

              data-overlay-tab="playbooks"

            >Playbooks</button>

            ${!quickActionsOnlyMode ? `<button

              type="button"

              class="rrw-tab-btn ${overlayTab === "user_actions" ? "rrw-tab-btn--active" : ""}"

              data-overlay-tab="user_actions"

            >User Actions</button>` : ""}

          </div>



          ${overlayTab === "kind_actions" ? `

            ${overlayState.skipRedditRemove ? `<div class="rrw-success">Native Reddit remove is preserved. This overlay will only send/log the removal reason message.</div>` : ""}



            <label class="rrw-field">

              <span>Send mode</span>

              <select id="rrw-send-mode">

                <option value="reply" ${sendMode === "reply" ? "selected" : ""}>reply</option>

                <option value="pm" ${sendMode === "pm" ? "selected" : ""}>pm</option>

                <option value="both" ${sendMode === "both" ? "selected" : ""}>both</option>

                <option value="none" ${sendMode === "none" ? "selected" : ""}>none</option>

              </select>

            </label>



            <fieldset class="rrw-field rrw-fieldset">

              <legend>Removal reasons (multi-select)</legend>

              <label class="rrw-field rrw-field--search" for="rrw-reason-search">

                <span>Search reasons</span>

                <input id="rrw-reason-search" type="text" value="${escapeHtml(reasonSearch || "")}" placeholder="Filter by title" />

              </label>

              <p class="rrw-muted rrw-reason-summary">${selectedReasonSet.size} selected \u00B7 ${visibleReasons.length} shown</p>

              ${selectedReasonChips ? `<div class="rrw-chip-list">${selectedReasonChips}</div>` : ""}

              <div class="rrw-checklist">

                ${reasonChecklist || '<p class="rrw-muted">No removal reasons found for this type. Use the <strong>Edit</strong> button above to add some.</p>'}

              </div>

            </fieldset>



            ${dynamicFields}



            <section class="rrw-preview-panel">

              <div class="rrw-preview-panel__header">

                <h3>Preview</h3>

                ${previewLoading ? `<span class="rrw-muted">Updating...</span>` : ""}

              </div>

              ${previewError ? `<div class="rrw-error">${escapeHtml(previewError)}</div>` : ""}

              ${previewSubject ? `<p class="rrw-preview-subject"><strong>PM subject:</strong> ${escapeHtml(previewSubject)}</p>` : ""}

              <pre class="rrw-preview-body">${escapeHtml(previewMessage || (matchingReasons.length === 0 ? "No removal reasons configured for this type." : "Select reasons to preview the removal message."))}</pre>

            </section>



            <section class="rrw-inline-usernote-panel">

              <h3>Add usernote (optional)</h3>

              ${resolved?.author && resolved?.subreddit

                ? `<p class="rrw-muted">Will be saved for u/${escapeHtml(resolved.author)} in r/${escapeHtml(resolved.subreddit)} when you click ${overlayState.skipRedditRemove ? "Send reason" : "Remove"}.</p>`

                : `<p class="rrw-muted">Usernote is unavailable until target author/subreddit are resolved.</p>`}

              <textarea

                id="rrw-inline-note-text"

                rows="3"

                placeholder="Write a moderator note to save with this action..."

                ${submitting || !(resolved?.author && resolved?.subreddit) ? "disabled" : ""}

              >${escapeHtml(removalNoteText || "")}</textarea>

              <label class="rrw-field">

                <span>Note type</span>

                <select id="rrw-inline-note-type" ${submitting || !(resolved?.author && resolved?.subreddit) ? "disabled" : ""}>

                  ${removalNoteTypeOptions}

                </select>

              </label>

            </section>



            <div class="rrw-sticky-footer">

              <div class="rrw-actions">

                ${thingType === "comment" ? `<button type="button" class="rrw-btn rrw-btn-danger" id="rrw-comment-nuke" ${submitting || !canAct ? "disabled" : ""}>Nuke Thread</button>` : ""}

                ${overlayState.skipRedditRemove ? "" : `<button type="button" class="rrw-btn rrw-btn-secondary" id="rrw-approve" ${submitting || !canAct ? "disabled" : ""}>Approve</button>`}

                ${overlayState.skipRedditRemove ? "" : `<button type="button" class="rrw-btn rrw-btn-danger" id="rrw-spam" ${submitting || !canAct ? "disabled" : ""}>Spam</button>`}

                ${overlayState.skipRedditRemove ? "" : `<button type="button" class="rrw-btn rrw-btn-secondary" id="rrw-remove-no-reason" ${submitting || !canAct ? "disabled" : ""}>Remove (No reason)</button>`}

                <button type="button" class="rrw-btn rrw-btn-primary" id="rrw-remove" ${submitting || !canAct ? "disabled" : ""}>${overlayState.skipRedditRemove ? "Send reason" : "Remove"}</button>

              </div>



              <div class="rrw-footer-links">

              </div>

            </div>

          ` : ""}



          ${overlayTab === "quick_actions" ? `

            <section class="rrw-user-actions-panel">

              <h3>Quick Actions</h3>

              <p class="rrw-muted">Post pre-written moderator comments without removing.</p>

              ${quickActionsLoading ? `<p class="rrw-muted">Loading quick actions...</p>` : ""}

              ${quickActionsError ? `<div class="rrw-error">${escapeHtml(quickActionsError)}</div>` : ""}

              ${quickActionsStatus ? `<div class="rrw-success">${escapeHtml(quickActionsStatus)}</div>` : ""}

              <div class="rrw-actions rrw-actions--inline rrw-quick-actions-grid">

                ${visibleQuickActions.length === 0

                  ? `<p class="rrw-muted">No quick actions available for this target type.</p>`

                  : visibleQuickActions.map((action) => {

                    const preview = interpolateQuickActionTemplate(action.body, {

                      author: resolved?.author,

                      subreddit: resolved?.subreddit,

                      kind: thingType === "submission" ? "post" : "comment",

                    });

                    return `

                      <button

                        type="button"

                        class="rrw-btn rrw-btn-secondary rrw-quick-action-btn"

                        data-quick-action-key="${escapeHtml(action.key)}"

                        title="${escapeHtml(`${preview.slice(0, 240)}${action.lock_post && thingType === "submission" ? "\n\nThis action will also lock the post." : ""}`)}"

                        ${submitting || !canAct ? "disabled" : ""}

                      >${escapeHtml(action.title)}${action.lock_post && thingType === "submission" ? ' [locks post]' : ""}</button>

                    `;

                  }).join("")}

              </div>

            </section>



            <div class="rrw-footer-links rrw-footer-links--solo">

            </div>

          ` : ""}



          ${overlayTab === "playbooks" ? `

            <section class="rrw-user-actions-panel">

              <h3>Playbooks</h3>

              <p class="rrw-muted">Run saved multi-step moderation workflows.</p>

              ${playbooksLoading ? `<p class="rrw-muted">Loading playbooks...</p>` : ""}

              ${playbooksError ? `<div class="rrw-error">${escapeHtml(playbooksError)}</div>` : ""}

              ${playbooksStatus ? `<div class="rrw-success">${escapeHtml(playbooksStatus)}</div>` : ""}

              <div class="rrw-actions rrw-actions--inline rrw-quick-actions-grid">

                ${visiblePlaybooks.length === 0

                  ? `<p class="rrw-muted">No playbooks available for this target type.</p>`

                  : visiblePlaybooks.map((playbook) => `

                    <button

                      type="button"

                      class="rrw-btn rrw-btn-secondary rrw-quick-action-btn"

                      data-playbook-key="${escapeHtml(playbook.key)}"

                      title="${escapeHtml(`${(Array.isArray(playbook.steps) ? playbook.steps.length : 0)} step${(Array.isArray(playbook.steps) ? playbook.steps.length : 0) === 1 ? "" : "s"}${playbook.confirm ? " \u00B7 confirmation required" : ""}`)}"

                      ${submitting || !canAct ? "disabled" : ""}

                    >${escapeHtml(playbook.title)}</button>

                  `).join("")}

              </div>

            </section>



            <div class="rrw-footer-links rrw-footer-links--solo">

            </div>

          ` : ""}







          ${overlayTab === "user_actions" ? `

            <section class="rrw-user-actions-panel">

              <h3>User flair</h3>

              ${resolved?.author

                ? `<p class="rrw-muted">Apply flair for u/${escapeHtml(resolved.author)} in r/${escapeHtml(resolved.subreddit || "unknown")}.</p>`

                : `<p class="rrw-muted">User actions are unavailable until target author is resolved.</p>`}

              <label class="rrw-field">

                <span>User flair template</span>

                <select id="rrw-user-flair-template" ${submitting || !canRunUserActions ? "disabled" : ""}>

                  <option value="">- choose user flair -</option>

                  ${userFlairOptions}

                </select>

              </label>

              <div class="rrw-actions rrw-actions--inline">

                <button type="button" class="rrw-btn rrw-btn-secondary" id="rrw-apply-user-flair" ${submitting || !canRunUserActions ? "disabled" : ""}>Apply User Flair</button>

                <button type="button" class="rrw-btn rrw-btn-danger" id="rrw-remove-user-flair" ${submitting || !canRunUserActions ? "disabled" : ""}>Remove User Flair</button>

              </div>

            </section>



            <section class="rrw-user-actions-panel">

              <h3>Ban user</h3>

              ${banStatusLoading

                ? `<p class="rrw-muted">Checking current ban status...</p>`

                : isUserAlreadyBanned

                  ? `<div class="rrw-warning">This user is already banned from r/${escapeHtml(resolved?.subreddit || "unknown")}. You can unban them below.</div>`

                  : ""}



              <label class="rrw-field">

                <span>Ban length</span>

                <select id="rrw-ban-duration" ${submitting || !canRunUserActions ? "disabled" : ""}>

                  <option value="1" ${banDurationOption === "1" ? "selected" : ""}>1 day</option>

                  <option value="7" ${banDurationOption === "7" ? "selected" : ""}>7 days</option>

                  <option value="30" ${banDurationOption === "30" ? "selected" : ""}>30 days</option>

                  <option value="permanent" ${banDurationOption === "permanent" ? "selected" : ""}>Permanent</option>

                  <option value="custom" ${banDurationOption === "custom" ? "selected" : ""}>Custom</option>

                </select>

              </label>



              ${banDurationOption === "custom" ? `

                <label class="rrw-field">

                  <span>Custom days</span>

                  <input id="rrw-ban-custom-days" type="number" min="1" value="${escapeHtml(banCustomDays || "")}" placeholder="e.g. 14" ${submitting || !canRunUserActions ? "disabled" : ""} />

                </label>

              ` : ""}



              <label class="rrw-field">

                <span>Ban message</span>

                <textarea id="rrw-ban-message" rows="4" placeholder="Message shown to user in the ban notice..." ${submitting || !canRunUserActions ? "disabled" : ""}>${escapeHtml(banMessage || "")}</textarea>

              </label>



              <label class="rrw-field rrw-field--checkbox">

                <input type="checkbox" id="rrw-ban-add-usernote" ${addBanUsernote ? "checked" : ""} ${submitting || !canRunUserActions ? "disabled" : ""} />

                <span>Add usernote with ban</span>

              </label>



              ${addBanUsernote ? `

                <label class="rrw-field">

                  <span>Usernote text ${suggestedTempBanCode ? `(suggested: ${escapeHtml(suggestedTempBanCode)})` : ""}</span>

                  <input id="rrw-ban-usernote-text" value="${escapeHtml(banUsernoteText || "")}" placeholder="e.g. ${escapeHtml(suggestedTempBanCode || "7DTB")}" ${submitting || !canRunUserActions ? "disabled" : ""} />

                </label>



                <label class="rrw-field">

                  <span>Usernote type</span>

                  <select id="rrw-ban-usernote-type" ${submitting || !canRunUserActions ? "disabled" : ""}>

                    ${availableRemovalNoteTypes

                      .map((value) => {

                        const label = String(removalNoteTypeLabels?.[String(value).toLowerCase()] || value);

                        return `<option value="${escapeHtml(value)}" ${value === (banUsernoteType || "none") ? "selected" : ""}>${escapeHtml(label)}</option>`;

                      })

                      .join("")}

                  </select>

                </label>

              ` : ""}



              <div class="rrw-actions rrw-actions--inline">

                <button type="button" class="rrw-btn rrw-btn-danger" id="rrw-ban-user" ${submitting || !canRunUserActions ? "disabled" : ""}>Ban User</button>

                ${isUserAlreadyBanned

                  ? `<button type="button" class="rrw-btn rrw-btn-secondary" id="rrw-unban-user" ${submitting || !canRunUserActions ? "disabled" : ""}>Unban User</button>`

                  : ""}

              </div>

            </section>



            <div class="rrw-footer-links rrw-footer-links--solo">

            </div>

          ` : ""}

        ` : ""}

      </div>

    </section>

  `;



  root.querySelectorAll("[data-overlay-close='1']").forEach((el) => {

    el.addEventListener("click", closeOverlay);

  });



  root.querySelector("#rrw-target-card-expand")?.addEventListener("click", () => {

    if (overlayState) {

      overlayState.targetCardExpanded = !overlayState.targetCardExpanded;

      renderOverlay();

    }

  });



  // Hide expand button if target body isn't actually overflowing

  const targetBody = root.querySelector(".rrw-target-body");

  const expandBtn = root.querySelector("#rrw-target-card-expand");

  if (targetBody && expandBtn) {

    // Check if collapsed content has enough height to actually overflow

    const tempClass = ".rrw-target-body--collapsed";

    const maxHeightCalc = 1.35 * 16 * 8; // 1.35em line-height * 16px base * 8 lines

    if (targetBody.scrollHeight <= maxHeightCalc) {

      expandBtn.style.display = "none";

    }

  }



  const refreshConfigBtn = root.querySelector("#rrw-refresh-config");

  if (refreshConfigBtn && overlayState) {

    refreshConfigBtn.addEventListener("click", () => {

      if (!overlayState) return;

      const subreddit = normalizeSubreddit(overlayState?.resolved?.subreddit || "");

      if (!subreddit) {

        return;

      }

      refreshConfigBtn.disabled = true;

      refreshConfigBtn.textContent = "\u21BB";

      refreshConfigBtn.classList.add("rrw-refresh-btn--spinning");

      clearCachedRemovalConfig(subreddit).then(() =>

        loadRemovalConfigFromWiki(subreddit)

      ).then((freshConfig) => {

        if (freshConfig && Array.isArray(freshConfig.reasons) && overlayState) {

          overlayState.removalConfig = freshConfig;

          overlayState.reasons = freshConfig.reasons;

          overlayState.configFromCache = false;

          if (freshConfig.global_settings?.default_send_mode && !overlayState.selectedReasonKeys.length) {

            overlayState.sendMode = freshConfig.global_settings.default_send_mode;

          }

          void setCachedRemovalConfig(subreddit, freshConfig);

          renderOverlay();

          schedulePreview();

        }

      }).catch(() => {

        if (overlayState) renderOverlay();

      }).finally(() => {

        refreshConfigBtn.disabled = false;

        refreshConfigBtn.classList.remove("rrw-refresh-btn--spinning");

      });

    });

  }



  const editConfigBtn = root.querySelector("#rrw-edit-config");

  if (editConfigBtn && overlayState) {

    editConfigBtn.addEventListener("click", () => {

      const subreddit = normalizeSubreddit(overlayState?.resolved?.subreddit || "");

      if (!subreddit) {

        return;

      }

      void openRemovalConfigEditor({

        subreddit,

        config: overlayState.removalConfig || buildDefaultRemovalConfig(subreddit),

        flairTemplates: overlayState.postFlairTemplates || [],

      });

    });

  }



  const linkGeneratorBtn = root.querySelector("#rrw-link-generator");

  if (linkGeneratorBtn) {

    linkGeneratorBtn.addEventListener("click", () => {

      openLinkGenerator();

    });

  }



  restoreOverlayViewState(root, viewState);



  if (!root.dataset.focusTrapBound) {

    root.dataset.focusTrapBound = "1";

    root.addEventListener("keydown", (event) => {

      if (event.key !== "Tab" || !overlayState) return;

      const modal = root.querySelector(".rrw-overlay-modal");

      if (!modal) return;

      const focusable = Array.from(modal.querySelectorAll(

        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

      )).filter((el) => {

        const rect = el.getBoundingClientRect();

        return rect.width > 0 || rect.height > 0;

      });

      if (focusable.length < 2) return;

      const first = focusable[0];

      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {

        if (document.activeElement === first) {

          event.preventDefault();

          last.focus();

        }

      } else {

        if (document.activeElement === last) {

          event.preventDefault();

          first.focus();

        }

      }

    });

  }



  root.querySelectorAll("[data-overlay-tab]").forEach((tabButton) => {

    tabButton.addEventListener("click", (event) => {

      const tab = event.currentTarget.getAttribute("data-overlay-tab");

      if (!["kind_actions", "quick_actions", "playbooks", "user_actions"].includes(String(tab || ""))) {

        return;

      }

      overlayState.activeTab = tab;

      renderOverlay();

    });

  });



  const inlineNoteText = root.querySelector("#rrw-inline-note-text");

  if (inlineNoteText) {

    inlineNoteText.addEventListener("input", (event) => {

      overlayState.removalNoteText = event.target.value;

    });

  }



  const inlineNoteType = root.querySelector("#rrw-inline-note-type");

  if (inlineNoteType) {

    inlineNoteType.addEventListener("change", (event) => {

      overlayState.removalNoteType = String(event.target.value || "none").trim() || "none";

    });

  }



  const userFlairSelect = root.querySelector("#rrw-user-flair-template");

  if (userFlairSelect) {

    userFlairSelect.addEventListener("change", (event) => {

      overlayState.selectedUserFlairTemplateId = String(event.target.value || "").trim();

    });

  }



  const applySuggestedBanUsernoteCode = () => {

    if (!overlayState || !overlayState.addBanUsernote) {

      return;

    }

    const option = String(overlayState.banDurationOption || "7").trim();

    const days = option === "custom"

      ? Number.parseInt(String(overlayState.banCustomDays || ""), 10)

      : Number.parseInt(option, 10);

    if (!Number.isFinite(days) || days <= 0) {

      return;

    }

    const suggested = `${days}DTB`;

    const current = String(overlayState.banUsernoteText || "").trim();

    const previousAuto = String(overlayState.banUsernoteAutoValue || "").trim();

    if (!current || (previousAuto && current === previousAuto)) {

      overlayState.banUsernoteText = suggested;

      overlayState.banUsernoteAutoValue = suggested;

    }

  };



  const banDurationSelect = root.querySelector("#rrw-ban-duration");

  if (banDurationSelect) {

    banDurationSelect.addEventListener("change", (event) => {

      overlayState.banDurationOption = String(event.target.value || "7");

      if (overlayState.banDurationOption !== "custom") {

        overlayState.banCustomDays = "";

      }

      applySuggestedBanUsernoteCode();

      renderOverlay();

    });

  }



  const banCustomDaysInput = root.querySelector("#rrw-ban-custom-days");

  if (banCustomDaysInput) {

    banCustomDaysInput.addEventListener("input", (event) => {

      overlayState.banCustomDays = String(event.target.value || "").trim();

      applySuggestedBanUsernoteCode();

    });

  }



  const banMessageInput = root.querySelector("#rrw-ban-message");

  if (banMessageInput) {

    banMessageInput.addEventListener("input", (event) => {

      overlayState.banMessage = event.target.value;

    });

  }



  const banAddUsernoteCheckbox = root.querySelector("#rrw-ban-add-usernote");

  if (banAddUsernoteCheckbox) {

    banAddUsernoteCheckbox.addEventListener("change", (event) => {

      overlayState.addBanUsernote = Boolean(event.target.checked);

      if (overlayState.addBanUsernote) {

        applySuggestedBanUsernoteCode();

      }

      renderOverlay();

    });

  }



  const banUsernoteTextInput = root.querySelector("#rrw-ban-usernote-text");

  if (banUsernoteTextInput) {

    banUsernoteTextInput.addEventListener("input", (event) => {

      overlayState.banUsernoteText = event.target.value;

    });

  }



  const banUsernoteTypeSelect = root.querySelector("#rrw-ban-usernote-type");

  if (banUsernoteTypeSelect) {

    banUsernoteTypeSelect.addEventListener("change", (event) => {

      overlayState.banUsernoteType = String(event.target.value || "none").trim() || "none";

    });

  }



  root.querySelectorAll("[data-reason-key]").forEach((checkboxEl) => {

    checkboxEl.addEventListener("change", (event) => {

      const key = event.target.getAttribute("data-reason-key");

      if (!key) {

        return;

      }

      const checked = Boolean(event.target.checked);

      const current = new Set(overlayState.selectedReasonKeys || []);

      if (checked) {

        current.add(key);

      } else {

        current.delete(key);

      }

      overlayState.selectedReasonKeys = Array.from(current);



      // Prefill usernote text and type from selected reasons if user hasn't edited

      const selectedReasons = (overlayState.reasons || []).filter(r => current.has(r.external_key));

      // Prefill text

      const suggestedTexts = selectedReasons.map(r => (r.suggestedNoteText || "").trim()).filter(Boolean);

      const autoText = suggestedTexts.join(" + ");

      const prevAutoText = overlayState._lastAutoRemovalNoteText || "";

      const currentText = String(overlayState.removalNoteText || "").trim();

      if (!currentText || currentText === prevAutoText) {

        overlayState.removalNoteText = autoText;

        overlayState._lastAutoRemovalNoteText = autoText;

      }

      // Prefill type

      const suggestedTypes = selectedReasons.map(r => (r.suggestedNoteType || "none").trim()).filter(t => t && t !== "none");

      let autoType = "none";

      if (suggestedTypes.length > 0 && suggestedTypes.every(t => t === suggestedTypes[0])) {

        autoType = suggestedTypes[0];

      }

      const prevAutoType = overlayState._lastAutoRemovalNoteType || "none";

      const currentType = String(overlayState.removalNoteType || "none").trim();

      if (!currentType || currentType === prevAutoType) {

        overlayState.removalNoteType = autoType;

        overlayState._lastAutoRemovalNoteType = autoType;

      }



      renderOverlay();

      schedulePreview();

    });

  });



  root.querySelectorAll("[data-remove-reason]").forEach((chipEl) => {

    chipEl.addEventListener("click", (event) => {

      const key = event.currentTarget.getAttribute("data-remove-reason");

      if (!key) {

        return;

      }

      const current = new Set(overlayState.selectedReasonKeys || []);

      current.delete(key);

      overlayState.selectedReasonKeys = Array.from(current);



      // Prefill usernote text and type from selected reasons if user hasn't edited

      const selectedReasons = (overlayState.reasons || []).filter(r => current.has(r.external_key));

      // Prefill text

      const suggestedTexts = selectedReasons.map(r => (r.suggestedNoteText || "").trim()).filter(Boolean);

      const autoText = suggestedTexts.join(" + ");

      const prevAutoText = overlayState._lastAutoRemovalNoteText || "";

      const currentText = String(overlayState.removalNoteText || "").trim();

      if (!currentText || currentText === prevAutoText) {

        overlayState.removalNoteText = autoText;

        overlayState._lastAutoRemovalNoteText = autoText;

      }

      // Prefill type

      const suggestedTypes = selectedReasons.map(r => (r.suggestedNoteType || "none").trim()).filter(t => t && t !== "none");

      let autoType = "none";

      if (suggestedTypes.length > 0 && suggestedTypes.every(t => t === suggestedTypes[0])) {

        autoType = suggestedTypes[0];

      }

      const prevAutoType = overlayState._lastAutoRemovalNoteType || "none";

      const currentType = String(overlayState.removalNoteType || "none").trim();

      if (!currentType || currentType === prevAutoType) {

        overlayState.removalNoteType = autoType;

        overlayState._lastAutoRemovalNoteType = autoType;

      }



      renderOverlay();

      schedulePreview();

    });

  });



  const sendModeSelect = root.querySelector("#rrw-send-mode");

  if (sendModeSelect) {

    sendModeSelect.addEventListener("change", (event) => {

      overlayState.sendMode = event.target.value;

      ext.storage.sync.set({ lastSendMode: overlayState.sendMode });

      schedulePreview();

    });

  }



  const reasonSearchInput = root.querySelector("#rrw-reason-search");

  if (reasonSearchInput) {

    reasonSearchInput.addEventListener("input", (event) => {

      overlayState.reasonSearch = event.target.value;

      renderOverlay();

    });

  }



  root.querySelectorAll("[data-quick-action-key]").forEach((buttonEl) => {

    buttonEl.addEventListener("click", async (event) => {

      console.log("[ModBox][QA] Quick Actions handler triggered");

      const overlay = overlayState;

      if (!overlay) {

        console.log("[ModBox][QA] overlayState is null");

        return;

      }

      const actionKey = String(event.currentTarget.getAttribute("data-quick-action-key") || "").trim();

      if (!actionKey) {

        return;

      }

      const subreddit = normalizeSubreddit(overlay?.resolved?.subreddit || "");

      const allActions = normalizeQuickActionsDoc(

        overlay.quickActionsConfig || getInMemoryQuickActions(subreddit) || buildDefaultQuickActionsConfig(subreddit),

        subreddit,

      ).actions;

      const action = allActions.find((item) => String(item?.key || "").trim() === actionKey);

      if (!action) {

        showToast("Quick action not found", "error");

        return;

      }



      let fullname = overlay.resolved?.fullname || overlay.target;

      try {

        // Ensure we have a valid fullname format (not a URL)

        if (!isFullname(fullname)) {

          fullname = parseTargetToFullname(fullname);

        }

      } catch {

        showToast("Unable to parse target into a valid Reddit fullname", "error");

        return;

      }



      // Close overlay immediately for better UX

      closeOverlay();



      // Run the action in the background

      (async () => {

        try {

          const thingKind = (overlay?.resolved?.thingType || (String(fullname || "").startsWith("t3_") ? "submission" : "comment")) === "submission"

            ? "post"

            : "comment";

          const renderedBody = interpolateQuickActionTemplate(action.body, {

            author: overlay?.resolved?.author,

            subreddit: overlay?.resolved?.subreddit,

            kind: thingKind,

          }).trim();



          let lockedPost = false;

          let usedSubredditCommentWorkaround = false;



          if (renderedBody) {

            if (Boolean(action.comment_as_subreddit)) {

              let removedForSubredditComment = false;

              try {

                await removeThingViaNativeSession(fullname);

                removedForSubredditComment = true;

                await sendRemovalCommentAsSubreddit(fullname, renderedBody, false);

                usedSubredditCommentWorkaround = true;

              } finally {

                if (removedForSubredditComment) {

                  try {

                    await approveThingViaNativeSession(fullname);

                  } catch {

                    // Best effort only; avoid masking the primary failure.

                  }

                }

              }

            } else {

              const commentResponse = await postCommentViaNativeSession(fullname, renderedBody);

              const replyThing = commentResponse?.json?.data?.things?.[0]?.data || null;

              const replyFullname = String(replyThing?.name || replyThing?.id || "").trim();

              if (replyFullname && (action.sticky || action.mod_only)) {

                try {

                  await distinguishThingViaNativeSession(

                    replyFullname.startsWith("t1_") ? replyFullname : `t1_${replyFullname}`,

                    Boolean(action.sticky),

                  );

                } catch {

                  // Distinguish/sticky is best effort; posting the comment is the primary action.

                }

              }

            }

          }



          if (action.lock_post && thingKind === "post") {

            try {

              await lockThingViaNativeSession(fullname);

              lockedPost = true;

            } catch {

              // Best effort only; posting comment is the primary action.

            }

          }



          const details = [];

          if (usedSubredditCommentWorkaround) details.push("subreddit comment");

          if (lockedPost) details.push("locked");

          const detailText = details.length > 0 ? ` (${details.join(", ")})` : "";

          showToast(`✓ Quick action: ${action.title}${detailText}`, "success");

        } catch (error) {

          showToast(`Error: ${error instanceof Error ? error.message : String(error)}`, "error");

        }

      })();

    });

  });



  root.querySelectorAll("[data-canned-reply-name]").forEach((buttonEl) => {

    buttonEl.addEventListener("click", (event) => {

      console.log("[ModBox][CR] Canned reply button clicked");

      const replyName = String(event.currentTarget.getAttribute("data-canned-reply-name") || "").trim();

      if (!replyName) {

        showToast("Canned reply name not found", "error");

        return;

      }



      const subreddit = normalizeSubreddit(overlayState?.resolved?.subreddit || "");

      const cannedReplies = (overlayState?.cannedRepliesConfig?.replies || []);

      const reply = cannedReplies.find((item) => String(item.name || "").trim() === replyName);

      if (!reply || !reply.content) {

        showToast("Canned reply content not found", "error");

        return;

      }



      // Find the reply textarea

      const replyTextarea = findReplyTextarea();

      if (!replyTextarea) {

        showToast("Reply box not found. Please focus on a reply form first.", "error");

        return;

      }



      // Insert the canned reply content

      const currentValue = replyTextarea.value || "";

      const newValue = currentValue ? `${currentValue}\n\n${reply.content}` : reply.content;

      replyTextarea.value = newValue;

      

      // Trigger input event to notify any listeners

      replyTextarea.dispatchEvent(new Event("input", { bubbles: true }));

      replyTextarea.dispatchEvent(new Event("change", { bubbles: true }));

      

      // Focus the textarea

      replyTextarea.focus();

      

      // Close the overlay for better UX

      closeOverlay();

      

      showToast(`✓ Canned reply inserted: ${replyName}`, "success");

    });

  });



  root.querySelectorAll("[data-input-key]").forEach((inputEl) => {

    const updateValue = (event) => {

      const key = event.currentTarget.getAttribute("data-input-key");

      if (!key) {

        return;

      }

      setFieldValue(key, event.target.value);

      schedulePreview();

    };



    inputEl.addEventListener("input", updateValue);

    inputEl.addEventListener("change", updateValue);

  });



  const saveUsernoteForResolvedUser = async (noteTextInput, noteTypeInput = "none", overlayObj = null) => {

    // Capture the overlay reference before the first await so writes to it

    // after suspension don't crash if the overlay was closed in the meantime.

    const overlay = overlayObj || overlayState;

    const noteText = String(noteTextInput || "").trim();

    const username = String(overlay?.resolved?.author || "").trim();

    const subreddit = normalizeSubreddit(overlay?.resolved?.subreddit || "");

    const permalink = overlay?.resolved?.permalink || "";

    if (!noteText || !username || !subreddit) {

      return false;

    }



    const updatedPayload = await addUsernoteViaReddit(

      subreddit,

      username,

      noteText,

      String(noteTypeInput || "none").trim() || "none",

      permalink,

    );

    if (updatedPayload && typeof updatedPayload === "object") {

      setUsernotesCache(subreddit, username, updatedPayload);

      await refreshUsernoteChipsForUser(subreddit, username, updatedPayload);

    } else {

      clearUsernotesCache(subreddit, username);

      await refreshUsernoteChipsForUser(subreddit, username, null);

    }

    return true;

  };



  // Accepts the captured overlay reference from the caller so post-await

  // writes go to the (possibly dead) captured object rather than the global.

  const saveInlineRemovalUsernote = async (overlay) => {

    const didSave = await saveUsernoteForResolvedUser(

      overlay.removalNoteText,

      overlay.removalNoteType,

      overlay,

    );

    if (didSave) {

      overlay.removalNoteText = "";

    }

    return didSave;

  };



  // Toast notification system for background action results

  const showToast = (message, type = "success") => {

    const toastId = `rrw-toast-${Date.now()}-${Math.random()}`;

    const toast = document.createElement("div");

    toast.id = toastId;

    toast.className = `rrw-toast rrw-toast-${type}`;

    toast.textContent = message;

    toast.style.cssText = `

      position: fixed;

      top: 20px;

      right: 20px;

      padding: 12px 20px;

      border-radius: 6px;

      font-size: 14px;

      font-weight: 500;

      box-shadow: 0 4px 12px rgba(0,0,0,0.15);

      z-index: 10000;

      animation: rrw-toast-slide-in 0.3s ease-out;

    `;

    

    if (type === "success") {

      toast.style.backgroundColor = "#18a058";

      toast.style.color = "white";

    } else if (type === "error") {

      toast.style.backgroundColor = "#d32f2f";

      toast.style.color = "white";

    } else {

      toast.style.backgroundColor = "#1f1f1f";

      toast.style.color = "ffffff";

    }

    

    document.body.appendChild(toast);

    

    // Auto-remove after 5 seconds

    const timeoutId = setTimeout(() => {

      if (toast.parentElement) {

        toast.style.animation = "rrw-toast-slide-out 0.3s ease-in";

        setTimeout(() => {

          toast.remove();

        }, 300);

      }

    }, 5000);

    

    // Allow click to dismiss

    toast.style.cursor = "pointer";

    toast.addEventListener("click", () => {

      clearTimeout(timeoutId);

      toast.style.animation = "rrw-toast-slide-out 0.3s ease-in";

      setTimeout(() => {

        toast.remove();

      }, 300);

    });

  };



  const callAction = async (action) => {

    // Capture a local reference before the first await. All reads/writes

    // use this local so that closing the overlay mid-action (which sets the

    // global overlayState to null) never produces a null-dereference crash.

    // renderOverlay() already guards itself with `if (!overlayState) return`.

    const overlay = overlayState;

    if (!overlay) {

      console.error("[ModBox] callAction called but overlayState is null");

      return;

    }

    console.log("[ModBox] callAction triggered for action:", action);

    

    // For simple actions (approve, remove, spam, remove_no_reason), close the overlay immediately

    // and run the action in the background with toast notifications

    const simpleActions = ["approve", "spam", "remove", "remove_no_reason"];

    const isSimpleAction = simpleActions.includes(action);

    

    if (isSimpleAction) {

      // Close the overlay immediately for better UX

      closeOverlay();

      

      // Run the action in the background without blocking UI

      (async () => {

        try {

          const fullname = overlay.resolved?.fullname || overlay.target;

          

          if (action === "approve") {

            await approveThingViaNativeSession(fullname);

            applyActionBorderToElement(fullname, "approve");

            showToast(`✓ Approved ${fullname}`, "success");

          } else if (action === "spam") {

            await removeThingViaNativeSession(fullname, true);

            applyActionBorderToElement(fullname, "spam");

            showToast(`✓ Marked as spam: ${fullname}`, "success");

          } else if (action === "remove" || action === "remove_no_reason") {

            // Handle removal with full flow (flair, lock, comment, modmail, usernote)

            const removeWithoutReason = action === "remove_no_reason";

            if (overlay.skipRedditRemove && (overlay.selectedReasonKeys || []).length === 0) {

              showToast("Error: Select at least one reason before sending", "error");

              return;

            }



            if (!validateSelectedFields()) {

              showToast("Error: Please check your inputs", "error");

              return;

            }



            const currentThingType = overlay?.resolved?.thingType || (String(fullname || "").startsWith("t3_") ? "submission" : "comment");

            const matchingReasonsForAction = (overlay.reasons || []).filter((reason) => isReasonForThing(reason, currentThingType));

            const selectedReasonSetForAction = new Set(removeWithoutReason ? [] : (overlay.selectedReasonKeys || []));

            const selectedReasonsForAction = matchingReasonsForAction.filter((reason) => selectedReasonSetForAction.has(reason.external_key));

            const resolvedSubreddit = normalizeSubreddit(overlay?.resolved?.subreddit || "");

            const author = String(overlay?.resolved?.author || "").trim();

            const kind = currentThingType === "submission" ? "post" : "comment";

            const renderedMessage = buildRemovalPreviewMessage(

              overlay.removalConfig,

              selectedReasonsForAction,

              author,

              kind,

              resolvedSubreddit,

              removeWithoutReason ? {} : (overlay.inputValues || {}),

            ).trim();

            const pmSubject = buildRemovalPreviewSubject(

              overlay.removalConfig,

              author,

              kind,

              resolvedSubreddit,

            );

            const removalPostFlairId = currentThingType === "submission"

              ? (selectedReasonsForAction.find((reason) => String(reason?.flair_id || "").trim())?.flair_id || null)

              : null;

            const shouldLockItem = selectedReasonsForAction.some((reason) => Boolean(reason?.lock_post));

            const shouldStickyReply = currentThingType === "submission"

              && selectedReasonsForAction.some((reason) => Boolean(reason?.sticky_comment));

            const commentAsSubreddit = normalizeRemovalBoolean(overlay?.removalConfig?.global_settings?.comment_as_subreddit, true);

            const lockRemovalComment = normalizeRemovalBoolean(overlay?.removalConfig?.global_settings?.lock_removal_comment, false);

            const autoArchiveModmail = normalizeRemovalBoolean(overlay?.removalConfig?.global_settings?.auto_archive_modmail, true);

            const effectiveSendMode = normalizeRemovalSendMode(

              removeWithoutReason ? "none" : (overlay.sendMode || overlay.removalConfig?.global_settings?.default_send_mode),

              "reply",

            );

            const needsOutboundMessage = effectiveSendMode !== "none";

            if (needsOutboundMessage && !renderedMessage && !removalPostFlairId) {

              showToast("Error: No message content generated", "error");

              return;

            }



            try {

              // Remove the post

              if (!overlay.skipRedditRemove) {

                await removeThingViaNativeSession(fullname);

                const removedConfirmed = await confirmThingRemovedViaReddit(fullname);

                if (!removedConfirmed) {

                  await removeThingViaNativeSession(fullname);

                  const removedConfirmedAfterRetry = await confirmThingRemovedViaReddit(fullname);

                  if (!removedConfirmedAfterRetry) {

                    throw new Error("Native removal did not stick");

                  }

                }

              }

              applyActionBorderToElement(fullname, "remove");



              // Apply post flair if configured

              if (removalPostFlairId && resolvedSubreddit && String(fullname || "").startsWith("t3_")) {

                try {

                  await applyFlairViaNativeSession({

                    subreddit: resolvedSubreddit,

                    flairTemplateId: removalPostFlairId,

                    linkFullname: fullname,

                  });

                } catch (err) {

                  console.warn("[ModBox] Flair application failed:", err);

                }

              }



              // Lock the item if configured

              if (shouldLockItem && !overlay.skipRedditRemove) {

                try {

                  await lockThingViaNativeSession(fullname);

                } catch {

                  // Continue even if lock fails

                }

              }



              // Send removal comment if configured

              if (renderedMessage && (effectiveSendMode === "reply" || effectiveSendMode === "both")) {

                try {

                  if (commentAsSubreddit) {

                    await sendRemovalCommentAsSubreddit(fullname, renderedMessage, lockRemovalComment);

                  } else {

                    const commentResponse = await postCommentViaNativeSession(fullname, renderedMessage);

                    const replyThing = commentResponse?.json?.data?.things?.[0]?.data || null;

                    const replyFullname = String(replyThing?.name || replyThing?.id || "").trim();

                    if (replyFullname) {

                      try {

                        await distinguishThingViaNativeSession(

                          replyFullname.startsWith("t1_") ? replyFullname : `t1_${replyFullname}`,

                          shouldStickyReply,

                        );

                      } catch {

                        // Best effort

                      }

                      if (lockRemovalComment) {

                        try {

                          await lockThingViaNativeSession(

                            replyFullname.startsWith("t1_") ? replyFullname : `t1_${replyFullname}`,

                          );

                        } catch {

                          // Best effort

                        }

                      }

                    }

                  }

                } catch (err) {

                  console.warn("[ModBox] Comment posting failed:", err);

                }

              }



              // Send modmail if configured

              if (renderedMessage && (effectiveSendMode === "pm" || effectiveSendMode === "both")) {

                try {

                  if (!author || !resolvedSubreddit) {

                    throw new Error("Target author or subreddit unavailable");

                  }

                  const permalink = String(overlay?.resolved?.permalink || "").trim();

                  const modmailBody = permalink

                    ? `${renderedMessage}\n\n---\n[Link to your ${kind}](${permalink})`

                    : renderedMessage;

                  if (!pmSubject || !pmSubject.trim()) {

                    throw new Error("Modmail subject is empty");

                  }

                  const modmailResult = await sendModmailViaReddit({

                    subreddit: resolvedSubreddit,

                    to: author,

                    subject: pmSubject.trim(),

                    body: modmailBody,

                    isAuthorHidden: true,

                  });

                  const conversationId = String(modmailResult?.conversation?.id || "").trim();

                  const isInternal = Boolean(modmailResult?.conversation?.isInternal);

                  if (conversationId && !isInternal && autoArchiveModmail) {

                    try {

                      await archiveModmailConversationViaReddit(conversationId);

                    } catch {

                      // Ignore archive failures

                    }

                  }

                } catch (err) {

                  console.warn("[ModBox] Modmail send failed:", err);

                }

              }



              // Save usernote if configured

              // First, sync form values from DOM into overlay object

              const noteTextElement = document.getElementById("rrw-inline-note-text");

              const noteTypeElement = document.getElementById("rrw-inline-note-type");

              if (noteTextElement) {

                overlay.removalNoteText = String(noteTextElement.value || "").trim();

              }

              if (noteTypeElement) {

                overlay.removalNoteType = String(noteTypeElement.value || "none").trim() || "none";

              }



              let usernoteSaved = false;

              if (overlay.removalNoteText || overlay.removalNoteType !== "none") {

                try {

                  usernoteSaved = await saveInlineRemovalUsernote(overlay);

                } catch (err) {

                  console.warn("[ModBox] Usernote save failed:", err);

                }

              }



              const toastMsg = usernoteSaved 

                ? `✓ Removed ${fullname} (usernote added)`

                : `✓ Removed ${fullname}`;

              showToast(toastMsg, "success");

            } catch (err) {

              showToast(`Error: ${err instanceof Error ? err.message : "Unknown error"}`, "error");

            }

          }

        } catch (err) {

          const errorMsg = err instanceof Error ? err.message : String(err);

          console.error("[ModBox] Background action failed:", errorMsg);

          showToast(`Error: ${errorMsg}`, "error");

        }

      })();

      

      return;

    }

    

    // For complex actions (comment nuke, user actions, playbooks, etc), keep the original behavior

    try {

      overlay.submitting = true;

      overlay.status = "";

      overlay.error = "";

      renderOverlay();



      const fullname = overlay.resolved?.fullname || overlay.target;

      if (action === "comment_nuke") {

        if (!/^t1_[a-z0-9]{5,10}$/i.test(String(fullname || "").trim().toLowerCase())) {

          throw new Error("Comment nuke only works on comment targets.");

        }



        const result = await runCommentNukeWorkflow(fullname, {

          onProgress: (event) => {

            if (!overlayState || overlayState !== overlay) {

              return;

            }



            if (event.phase === "planned") {

              overlay.status = `Comment nuke ready: ${event.plan.removalTargets.length} loaded comment${event.plan.removalTargets.length === 1 ? "" : "s"}.`;

            } else if (event.phase === "removing") {

              overlay.status = `Nuking comment tree... ${event.current}/${event.total}`;

            }

            renderOverlay();

          },

        });



        if (result?.cancelled) {

          overlay.status = "";

          return;

        }



        applyActionBorderToElement(fullname, "comment_nuke");

        overlay.status = `Nuked comment thread: removed ${result.successCount} loaded comment${result.successCount === 1 ? "" : "s"}.`;

        if (result?.omittedReplyCount > 0) {

          overlay.error = `Reddit reported ${result.omittedReplyCount} collapsed repl${result.omittedReplyCount === 1 ? "y" : "ies"} outside the loaded thread, so some replies may remain.`;

        } else if (result?.failureCount > 0) {

          overlay.error = `Comment nuke finished with ${result.failureCount} failure${result.failureCount === 1 ? "" : "s"}: ${result.failures[0] || "unknown error"}`;

        }

      } else if (action === "approve") {

        await approveThingViaNativeSession(fullname);

        applyActionBorderToElement(fullname, "approve");

        overlay.status = `Approved ${fullname} (native mod session)`;

      } else if (action === "spam") {

        await removeThingViaNativeSession(fullname, true);

        applyActionBorderToElement(fullname, "spam");

        overlay.status = `Marked as spam: ${fullname} (native mod session)`;

      } else if (action === "set_user_flair" || action === "remove_user_flair") {

        const author = String(overlay?.resolved?.author || "").trim();

        const subreddit = normalizeSubreddit(overlay?.resolved?.subreddit || "");

        if (!author || !subreddit) {

          throw new Error("Target author or subreddit is unavailable for user flair updates.");

        }

        let flairTemplateId = "";

        if (action === "set_user_flair") {

          flairTemplateId = String(overlay.selectedUserFlairTemplateId || "").trim();

          if (!flairTemplateId) {

            overlay.error = "Pick a user flair template first.";

            overlay.submitting = false;

            renderOverlay();

            return;

          }

        }

        await applyFlairViaNativeSession({

          subreddit,

          flairTemplateId,

          username: author,

        });

        overlay.status = action === "remove_user_flair"

          ? `Removed flair for u/${author} (native mod session)`

          : `Updated flair for u/${author} (native mod session)`;

      } else if (action === "ban_user") {

        const durationOption = String(overlay.banDurationOption || "7").trim();

        let durationDays = null;

        if (durationOption === "permanent") {

          durationDays = null; // or 0 or "" depending on what your ban API expects for permanent

        } else if (durationOption === "custom") {

          const parsedCustomDays = Number.parseInt(String(overlay.banCustomDays || ""), 10);

          if (!Number.isFinite(parsedCustomDays) || parsedCustomDays <= 0) {

            overlay.error = "Enter a valid positive number of days for a custom ban length.";

            overlay.submitting = false;

            renderOverlay();

            return;

          }

          durationDays = parsedCustomDays;

        } else {

          durationDays = Number.parseInt(durationOption, 10);

          if (!Number.isFinite(durationDays) || durationDays <= 0) {

            overlay.error = "Invalid ban duration selected.";

            overlay.submitting = false;

            renderOverlay();

            return;

          }

        }

        const author = String(overlay?.resolved?.author || "").trim();

        const subreddit = normalizeSubreddit(overlay?.resolved?.subreddit || "");

        if (!author || !subreddit) {

          throw new Error("Target author or subreddit is unavailable for banning.");

        }



        await banUserViaNativeSession({

          subreddit,

          username: author,

          durationDays,

          banMessage: String(overlay.banMessage || ""),

        });



        let banUsernoteSaved = false;

        if (overlay.addBanUsernote) {

          try {

            banUsernoteSaved = await saveUsernoteForResolvedUser(

              overlay.banUsernoteText,

              overlay.banUsernoteType,

              overlay,

            );

            if (banUsernoteSaved) {

              overlay.banUsernoteText = "";

            }

          } catch (noteErr) {

            const noteErrorMessage = getSafeErrorMessage(noteErr);

            overlay.error = `Ban completed, but saving usernote failed: ${noteErrorMessage}`;

          }

        }



        overlay.isUserAlreadyBanned = true;

        if (durationOption === "permanent" || durationDays === null) {

          overlay.status = author

            ? `Banned u/${author} permanently (native mod session)`

            : `Banned target author permanently`;

        } else {

          overlay.status = author

            ? `Banned u/${author} for ${durationDays} day${durationDays === 1 ? "" : "s"} (native mod session)`

            : `Banned target author for ${durationDays} day${durationDays === 1 ? "" : "s"}`;

        }

        if (banUsernoteSaved) {

          overlay.status += " \u00B7 Usernote added";

        }

      } else if (action === "unban_user") {

        const author = String(overlay?.resolved?.author || "").trim();

        const subreddit = normalizeSubreddit(overlay?.resolved?.subreddit || "");

        if (!author || !subreddit) {

          throw new Error("Target author or subreddit is unavailable for unbanning.");

        }



        await unbanUserViaNativeSession({ subreddit, username: author });



        overlay.isUserAlreadyBanned = false;

        overlay.status = author

          ? `Unbanned u/${author} (native mod session)`

          : `Unbanned target author`;

      } else {

        console.log("[ModBox] Starting removal action for:", fullname);

        const removeWithoutReason = action === "remove_no_reason";

        if (overlay.skipRedditRemove && (overlay.selectedReasonKeys || []).length === 0) {

          overlay.error = "Select at least one reason before sending.";

          overlay.submitting = false;

          console.warn("[ModBox] Removal blocked: skipRedditRemove=true but no reasons selected");

          renderOverlay();

          return;

        }



        if (!validateSelectedFields()) {

          overlay.submitting = false;

          console.warn("[ModBox] Removal blocked: validation failed");

          renderOverlay();

          return;

        }



        const payload = {

          reason_keys: removeWithoutReason ? [] : (overlay.selectedReasonKeys || []),

          send_mode: removeWithoutReason ? "none" : (overlay.sendMode || "reply"),

          inputs: removeWithoutReason ? {} : (overlay.inputValues || {}),

          skip_reddit_remove: Boolean(overlay.skipRedditRemove),

          skip_post_flair_apply: false,

        };

        console.log("[ModBox] Removal payload:", payload);



        const currentThingType = overlay?.resolved?.thingType || (String(fullname || "").startsWith("t3_") ? "submission" : "comment");

        const matchingReasonsForAction = (overlay.reasons || []).filter((reason) => isReasonForThing(reason, currentThingType));

        const selectedReasonSetForAction = new Set(removeWithoutReason ? [] : (overlay.selectedReasonKeys || []));

        const selectedReasonsForAction = matchingReasonsForAction.filter((reason) => selectedReasonSetForAction.has(reason.external_key));

        const resolvedSubreddit = normalizeSubreddit(overlay?.resolved?.subreddit || "");

        const author = String(overlay?.resolved?.author || "").trim();

        const kind = currentThingType === "submission" ? "post" : "comment";

        const renderedMessage = buildRemovalPreviewMessage(

          overlay.removalConfig,

          selectedReasonsForAction,

          author,

          kind,

          resolvedSubreddit,

          removeWithoutReason ? {} : (overlay.inputValues || {}),

        ).trim();

        const pmSubject = buildRemovalPreviewSubject(

          overlay.removalConfig,

          author,

          kind,

          resolvedSubreddit,

        );

        const removalPostFlairId = currentThingType === "submission"

          ? (selectedReasonsForAction.find((reason) => String(reason?.flair_id || "").trim())?.flair_id || null)

          : null;

        const shouldLockItem = selectedReasonsForAction.some((reason) => Boolean(reason?.lock_post));

        const shouldStickyReply = currentThingType === "submission"

          && selectedReasonsForAction.some((reason) => Boolean(reason?.sticky_comment));

        const commentAsSubreddit = normalizeRemovalBoolean(overlay?.removalConfig?.global_settings?.comment_as_subreddit, true);

        const lockRemovalComment = normalizeRemovalBoolean(overlay?.removalConfig?.global_settings?.lock_removal_comment, false);

        const autoArchiveModmail = normalizeRemovalBoolean(overlay?.removalConfig?.global_settings?.auto_archive_modmail, true);

        const effectiveSendMode = normalizeRemovalSendMode(

          removeWithoutReason ? "none" : (overlay.sendMode || overlay.removalConfig?.global_settings?.default_send_mode),

          "reply",

        );

        const needsOutboundMessage = effectiveSendMode !== "none";

        if (needsOutboundMessage && !renderedMessage && !removalPostFlairId) {

          overlay.error = "The selected reasons do not produce any message content.";

          overlay.submitting = false;

          renderOverlay();

          return;

        }



        let usedNativeRemoveSession = false;

        let usedNativePostFlairSession = false;

        let nativePostFlairErrorMessage = "";

        let nativeRemoveErrorMessage = "";



        if (!overlay.skipRedditRemove) {

          console.log("[ModBox] Attempting native Reddit removal for:", fullname);

          try {

            await removeThingViaNativeSession(fullname);

            const removedConfirmed = await confirmThingRemovedViaReddit(fullname);

            if (!removedConfirmed) {

              // Retry once when Reddit accepts the request but removal does not stick immediately.

              await removeThingViaNativeSession(fullname);

              const removedConfirmedAfterRetry = await confirmThingRemovedViaReddit(fullname);

              if (!removedConfirmedAfterRetry) {

                throw new Error("Native Reddit removal did not stick; target still appears unremoved.");

              }

            }

            usedNativeRemoveSession = true;

            applyActionBorderToElement(fullname, "remove");

            payload.skip_reddit_remove = true;

            console.log("[ModBox] Native removal successful");



            if (removalPostFlairId && resolvedSubreddit && String(fullname || "").startsWith("t3_")) {

              try {

                await applyFlairViaNativeSession({

                  subreddit: resolvedSubreddit,

                  flairTemplateId: removalPostFlairId,

                  linkFullname: fullname,

                });

                usedNativePostFlairSession = true;

                payload.skip_post_flair_apply = true;

              } catch (flairError) {

                nativePostFlairErrorMessage = summarizeRedditFailureMessage(getSafeErrorMessage(flairError));

                payload.skip_post_flair_apply = false;

              }

            }

          } catch (nativeRemoveError) {

            usedNativeRemoveSession = false;

            payload.skip_reddit_remove = false;

            nativeRemoveErrorMessage = nativeRemoveError instanceof Error

              ? nativeRemoveError.message

              : String(nativeRemoveError);

            throw new Error(`Native Reddit removal failed: ${nativeRemoveErrorMessage}`);

          }

        } else if (removalPostFlairId && resolvedSubreddit && String(fullname || "").startsWith("t3_")) {

          try {

            await applyFlairViaNativeSession({

              subreddit: resolvedSubreddit,

              flairTemplateId: removalPostFlairId,

              linkFullname: fullname,

            });

            usedNativePostFlairSession = true;

            payload.skip_post_flair_apply = true;

          } catch (flairError) {

            nativePostFlairErrorMessage = summarizeRedditFailureMessage(getSafeErrorMessage(flairError));

            payload.skip_post_flair_apply = false;

          }

        }

        try {

          if (!usedNativePostFlairSession && removalPostFlairId && resolvedSubreddit && String(fullname || "").startsWith("t3_")) {

            try {

              await applyFlairViaNativeSession({

                subreddit: resolvedSubreddit,

                flairTemplateId: removalPostFlairId,

                linkFullname: fullname,

              });

              usedNativePostFlairSession = true;

            } catch (flairError) {

              nativePostFlairErrorMessage = summarizeRedditFailureMessage(getSafeErrorMessage(flairError));

              // Flair application is best effort if the native route is unavailable.

            }

          }



          if (shouldLockItem && !overlay.skipRedditRemove) {

            try {

              await lockThingViaNativeSession(fullname);

            } catch {

              // Keep the removal successful even if the follow-up lock fails.

            }

          }



          if (renderedMessage && (effectiveSendMode === "reply" || effectiveSendMode === "both")) {

            try {

              const sendReplyAsSubreddit = commentAsSubreddit;

              if (sendReplyAsSubreddit) {

                await sendRemovalCommentAsSubreddit(fullname, renderedMessage, lockRemovalComment);

              } else {

                const commentResponse = await postCommentViaNativeSession(fullname, renderedMessage);

                const replyThing = commentResponse?.json?.data?.things?.[0]?.data || null;

                const replyFullname = String(replyThing?.name || replyThing?.id || "").trim();

                if (replyFullname) {

                  try {

                    await distinguishThingViaNativeSession(

                      replyFullname.startsWith("t1_") ? replyFullname : `t1_${replyFullname}`,

                      shouldStickyReply,

                    );

                  } catch {

                    // Best effort only.

                  }

                  if (lockRemovalComment) {

                    try {

                      await lockThingViaNativeSession(

                        replyFullname.startsWith("t1_") ? replyFullname : `t1_${replyFullname}`,

                      );

                    } catch {

                      // Best effort only.

                    }

                  }

                }

              }

            } catch (commentErr) {

              const commentErrorMsg = getSafeErrorMessage(commentErr);

              if (!overlay.error) {

                overlay.error = `Comment posting failed: ${commentErrorMsg}`;

              }

              console.warn("Failed to post removal comment:", commentErrorMsg);

            }

          }



          if (renderedMessage && (effectiveSendMode === "pm" || effectiveSendMode === "both")) {

            try {

              if (!author || !resolvedSubreddit) {

                throw new Error("Target author or subreddit is unavailable for modmail delivery.");

              }

              const permalink = String(overlay?.resolved?.permalink || "").trim();

              const modmailBody = permalink

                ? `${renderedMessage}\n\n---\n[Link to your ${kind}](${permalink})`

                : renderedMessage;

              if (!pmSubject || !pmSubject.trim()) {

                throw new Error("Modmail subject is empty; skipping modmail delivery.");

              }

              const modmailResult = await sendModmailViaReddit({

                subreddit: resolvedSubreddit,

                to: author,

                subject: pmSubject.trim(),

                body: modmailBody,

                isAuthorHidden: true,

              });

              const conversationId = String(modmailResult?.conversation?.id || "").trim();

              const isInternal = Boolean(modmailResult?.conversation?.isInternal);

              if (conversationId && !isInternal && autoArchiveModmail) {

                try {

                  await archiveModmailConversationViaReddit(conversationId);

                } catch {

                  // Ignore archive failures; the important part already succeeded.

                }

              }

            } catch (modmailErr) {

              const modmailErrorMsg = getSafeErrorMessage(modmailErr);

              if (!overlay.error) {

                overlay.error = `Modmail delivery failed: ${modmailErrorMsg}`;

              }

              console.warn("Failed to send modmail:", modmailErrorMsg);

            }

          }

        } catch (removeError) {

          if (usedNativeRemoveSession) {

            const removeMessage = getSafeErrorMessage(removeError);

            overlay.status = `Removed ${fullname} (native mod session)`;

            overlay.error = `Removal completed natively, but the follow-up reason flow failed: ${removeMessage}`;

            return;

          }

          throw removeError;

        }



        let usernoteSaved = false;

        try {

          usernoteSaved = await saveInlineRemovalUsernote(overlay);

        } catch (noteErr) {

          const noteErrorMessage = getSafeErrorMessage(noteErr);

          overlay.error = `Action completed, but saving usernote failed: ${noteErrorMessage}`;

        }



        if (removeWithoutReason) {

          overlay.status = `Removed ${fullname} without reason`;

        } else if (overlay.skipRedditRemove) {

          overlay.status = `Reason sent for ${fullname} (native removal preserved)`;

        } else if (usedNativeRemoveSession) {

          overlay.status = `Removed ${fullname} (native mod session${usedNativePostFlairSession ? "; flair too" : ""})`;

        } else {

          overlay.status = `Removed ${fullname}`;

        }



        if (usernoteSaved) {

          overlay.status += " \u00B7 Usernote added";

        }

        if (!usedNativePostFlairSession && removalPostFlairId && nativePostFlairErrorMessage) {

          overlay.error = overlay.error || `Removal succeeded, but setting post flair failed: ${nativePostFlairErrorMessage}`;

        }

        if (!removeWithoutReason) {

          ext.storage.sync.set({ lastSendMode: overlay.sendMode || "reply" });

        }

        if (overlay.autoCloseOnRemove) {

          setTimeout(() => {

            closeOverlay();

          }, 150);

          return;

        }

      }

    } catch (err) {

      const message = getSafeErrorMessage(err);

      console.error("[ModBox] Error in callAction:", message, err);

      overlay.error = message;

      if (String(message).includes("401")) {

        overlay.error = "Reddit authentication failed. Refresh Reddit and retry.";

      }

    } finally {

      overlay.submitting = false;

      renderOverlay();

    }

  };



  const approveButton = root.querySelector("#rrw-approve");

  if (approveButton) {

    approveButton.addEventListener("click", () => {

      void callAction("approve");

    });

  }



  const spamButton = root.querySelector("#rrw-spam");

  if (spamButton) {

    spamButton.addEventListener("click", () => {

      void callAction("spam");

    });

  }



  const applyUserFlairButton = root.querySelector("#rrw-apply-user-flair");

  if (applyUserFlairButton) {

    applyUserFlairButton.addEventListener("click", () => {

      void callAction("set_user_flair");

    });

  }



  const banUserButton = root.querySelector("#rrw-ban-user");

  if (banUserButton) {

    banUserButton.addEventListener("click", () => {

      void callAction("ban_user");

    });

  }



  const unbanUserButton = root.querySelector("#rrw-unban-user");

  if (unbanUserButton) {

    unbanUserButton.addEventListener("click", () => {

      void callAction("unban_user");

    });

  }



  const removeButton = root.querySelector("#rrw-remove");

  if (removeButton) {

    removeButton.addEventListener("click", () => {

      void callAction("remove");

    });

  }



  const removeNoReasonButton = root.querySelector("#rrw-remove-no-reason");

  if (removeNoReasonButton) {

    removeNoReasonButton.addEventListener("click", () => {

      void callAction("remove_no_reason");

    });

  }



  const commentNukeButton = root.querySelector("#rrw-comment-nuke");

  if (commentNukeButton) {

    commentNukeButton.addEventListener("click", () => {

      void callAction("comment_nuke");

    });

  }



  const runPlaybook = async (playbookKey) => {

    const overlay = overlayState;

    if (!overlay) {

      return;

    }

    const subreddit = normalizeSubreddit(overlay?.resolved?.subreddit || "");

    const allPlaybooks = normalizePlaybooksDoc(

      overlay.playbooksConfig || getInMemoryPlaybooks(subreddit) || buildDefaultPlaybooksConfig(subreddit),

      subreddit,

    ).playbooks;

    const playbook = allPlaybooks.find((item) => String(item?.key || "").trim() === String(playbookKey || "").trim());

    if (!playbook) {

      showToast("Playbook not found", "error");

      return;

    }



    if (playbook.confirm) {

      const stepCount = Array.isArray(playbook.steps) ? playbook.steps.length : 0;

      const ok = window.confirm(`Run playbook \"${playbook.title}\" with ${stepCount} step${stepCount === 1 ? "" : "s"}?`);

      if (!ok) {

        return;

      }

    }



    // For playbooks, keep overlay open during execution (steps need overlayState)

    // Run the playbook synchronously with the overlay still visible

    (async () => {

      const failures = [];

      let completed = 0;



      try {

        console.log("[ModBox] Starting playbook execution:", playbook.title, "with", playbook.steps?.length || 0, "steps");

        for (const step of Array.isArray(playbook.steps) ? playbook.steps : []) {

          try {

            const stepTypeRaw = String(step?.type || "").trim().toLowerCase();

            const stepType = stepTypeRaw === "lock_post" ? "lock_item" : stepTypeRaw;

            console.log(`[ModBox] Running playbook step ${completed + 1}: ${stepType}`);

            

            if (stepType === "remove") {

              overlay.selectedReasonKeys = Array.isArray(step.reason_keys)

                ? step.reason_keys.map((value) => String(value || "").trim()).filter(Boolean)

                : [];

              overlay.sendMode = normalizeRemovalSendMode(step.send_mode, overlay.sendMode || "reply");

              overlay.inputValues = step.inputs && typeof step.inputs === "object" && !Array.isArray(step.inputs)

                ? step.inputs

                : {};

              overlay.skipRedditRemove = Boolean(step.skip_reddit_remove);

              overlay.error = "";

              const hasCommentOverride = typeof step.comment_as_subreddit === "boolean";

              const globalSettings = overlay.removalConfig?.global_settings && typeof overlay.removalConfig.global_settings === "object"

                ? overlay.removalConfig.global_settings

                : null;

              const previousCommentAsSubreddit = globalSettings?.comment_as_subreddit;

              if (hasCommentOverride && globalSettings) {

                globalSettings.comment_as_subreddit = Boolean(step.comment_as_subreddit);

              }

              try {

                await callAction(Boolean(step.no_reason) ? "remove_no_reason" : "remove");

              } finally {

                if (hasCommentOverride && globalSettings) {

                  if (typeof previousCommentAsSubreddit === "undefined") {

                    delete globalSettings.comment_as_subreddit;

                  } else {

                    globalSettings.comment_as_subreddit = previousCommentAsSubreddit;

                  }

                }

              }

              if (overlay.error) {

                throw new Error(overlay.error);

              }

              console.log(`[ModBox] Step ${completed + 1} (remove) completed successfully`);

              completed += 1;

              continue;

            }



            if (stepType === "remove_item") {

              const fullname = overlay.resolved?.fullname || overlay.target;

              if (!/^t[13]_[a-z0-9]{5,10}$/i.test(String(fullname || ""))) {

                throw new Error("remove_item requires a valid post or comment target.");

              }

              await removeThingViaNativeSession(fullname, Boolean(step?.spam));

              completed += 1;

              continue;

            }



            if (stepType === "comment") {

              console.log(`[ModBox] Comment step - FULL STEP OBJECT:`, step);

              console.log(`[ModBox] Comment step - ALL PROPERTY KEYS:`, Object.keys(step || {}));

              console.log(`[ModBox] Comment step - sticky: ${step?.sticky}, lock_comment: ${step?.lock_comment}, comment_as_subreddit: ${step?.comment_as_subreddit}`);

              console.log(`[ModBox] Comment step - comment_as_subreddit full value:`, step?.comment_as_subreddit);

              const fullnameRaw = String(overlay?.resolved?.fullname || overlay?.target || "").trim().toLowerCase();

              const fullname = /^t[13]_[a-z0-9]{5,10}$/i.test(fullnameRaw)

                ? fullnameRaw

                : parseTargetToFullname(fullnameRaw);

              const resolvedSubreddit = normalizeSubreddit(overlay?.resolved?.subreddit || "");

              const author = String(overlay?.resolved?.author || "").trim();

              const kind = (overlay?.resolved?.thingType || "submission") === "submission" ? "post" : "comment";

              const source = String(step?.source || "custom").trim().toLowerCase();

              let body = "";

              console.log(`[ModBox] Comment step debug - fullnameRaw: ${fullnameRaw}, fullname: ${fullname}, author: ${author}, kind: ${kind}, source: ${source}, text_template: ${step?.text_template || "(empty)"}`);

              if (source === "removal_reason") {

                const matchingReasons = (overlay.reasons || []).filter(

                  (reason) => isReasonForThing(reason, kind === "post" ? "submission" : "comment")

                    && (Array.isArray(step?.reason_keys) ? step.reason_keys : []).includes(reason.external_key),

                );

                body = buildRemovalPreviewMessage(

                  overlay.removalConfig,

                  matchingReasons,

                  author,

                  kind,

                  resolvedSubreddit,

                  step?.inputs && typeof step.inputs === "object" && !Array.isArray(step.inputs)

                    ? step.inputs

                    : {},

                ).trim();

              } else {

                body = interpolatePlaybookTemplate(step?.text_template || "", {

                  author,

                  subreddit: resolvedSubreddit,

                  kind,

                  permalink: overlay?.resolved?.permalink,

                }).trim();

              }

              console.log(`[ModBox] Comment step - fullname check: ${!!fullname}, body length: ${body.length}, body preview: ${body.substring(0, 50)}`);

              if (!fullname) {

                throw new Error("comment step requires a valid post/comment target (fullname)");

              }

              if (!body) {

                const configHint = source === "removal_reason" 

                  ? "Ensure 'reason_keys' matches enabled removal reasons and the subreddit has removal reasons configured"

                  : "Ensure the playbook comment step has a 'text_template' field configured (e.g., 'text_template: \"Custom comment message\")";

                throw new Error(`comment step produced empty body. ${configHint}`);

              }

              console.log(`[ModBox] Comment step - calling postPlaybookCommentStepViaNativeSession with comment_as_subreddit: ${step?.comment_as_subreddit}`);

              const commentResponse = await postPlaybookCommentStepViaNativeSession(step, fullname, body);

              const replyThing = commentResponse?.json?.data?.things?.[0]?.data || null;

              const replyFullname = String(replyThing?.name || replyThing?.id || "").trim();

              

              if (replyFullname) {

                // Handle sticky/distinguish

                if (Boolean(step?.sticky)) {

                  try {

                    console.log(`[ModBox] Comment step - distinguishing reply: ${replyFullname}`);

                    await distinguishThingViaNativeSession(

                      replyFullname.startsWith("t1_") ? replyFullname : `t1_${replyFullname}`,

                      true,

                    );

                  } catch (err) {

                    console.log(`[ModBox] Comment step - distinguish failed: ${err}`);

                  }

                }

                

                // Handle lock_comment

                if (Boolean(step?.lock_comment)) {

                  try {

                    console.log(`[ModBox] Comment step - locking reply: ${replyFullname}`);

                    await lockThingViaNativeSession(

                      replyFullname.startsWith("t1_") ? replyFullname : `t1_${replyFullname}`

                    );

                  } catch (err) {

                    console.log(`[ModBox] Comment step - lock failed: ${err}`);

                  }

                }

              }

              

              completed += 1;

              continue;

            }



            if (stepType === "lock_item") {

              const fullname = overlay.resolved?.fullname || overlay.target;

              if (!/^t[13]_[a-z0-9]{5,10}$/i.test(String(fullname || ""))) {

                throw new Error("lock_item requires a valid post or comment target.");

              }

              await lockThingViaNativeSession(fullname);

              completed += 1;

              continue;

            }



            if (stepType === "unlock_item") {

              const fullname = overlay.resolved?.fullname || overlay.target;

              if (!/^t[13]_[a-z0-9]{5,10}$/i.test(String(fullname || ""))) {

                throw new Error("unlock_item requires a valid post or comment target.");

              }

              await unlockThingViaNativeSession(fullname);

              completed += 1;

              continue;

            }



            if (stepType === "approve_item") {

              const fullname = overlay.resolved?.fullname || overlay.target;

              if (!/^t[13]_[a-z0-9]{5,10}$/i.test(String(fullname || ""))) {

                throw new Error("approve_item requires a valid post or comment target.");

              }

              await approveThingViaNativeSession(fullname);

              completed += 1;

              continue;

            }



            if (stepType === "set_post_flair") {

              const fullname = overlay.resolved?.fullname || overlay.target;

              if (!String(fullname || "").startsWith("t3_")) {

                completed += 1;

                continue;

              }

              const cleanSubreddit = normalizeSubreddit(overlay?.resolved?.subreddit || "");

              const flairTemplateId = String(step?.flair_template_id || "").trim();

              if (!cleanSubreddit || !flairTemplateId) {

                throw new Error("set_post_flair requires subreddit and flair_template_id.");

              }

              await applyFlairViaNativeSession({

                subreddit: cleanSubreddit,

                flairTemplateId,

                linkFullname: fullname,

              });

              completed += 1;

              continue;

            }



            if (stepType === "set_user_flair") {

              const cleanSubreddit = normalizeSubreddit(overlay?.resolved?.subreddit || "");

              const author = String(overlay?.resolved?.author || "").trim();

              const flairTemplateId = String(step?.flair_template_id || "").trim();

              if (!cleanSubreddit || !author || !flairTemplateId) {

                throw new Error("set_user_flair requires resolved author, subreddit, and flair_template_id.");

              }

              await applyFlairViaNativeSession({

                subreddit: cleanSubreddit,

                flairTemplateId,

                username: author,

              });

              completed += 1;

              continue;

            }



            if (stepType === "usernote") {

              const noteText = interpolatePlaybookTemplate(step.text_template || "", {

                author: overlay?.resolved?.author,

                subreddit: overlay?.resolved?.subreddit,

                kind: (overlay?.resolved?.thingType || "submission") === "submission" ? "post" : "comment",

                permalink: overlay?.resolved?.permalink,

              }).trim();

              if (!noteText) {

                throw new Error("Usernote step produced empty text.");

              }

              const didSave = await saveUsernoteForResolvedUser(noteText, String(step.note_type || "none"), overlay);

              if (!didSave) {

                throw new Error("Usernote could not be saved.");

              }

              console.log(`[ModBox] Step ${completed + 1} (usernote) completed successfully`);

              completed += 1;

              continue;

            }



            if (stepType === "ban_user") {

              const author = String(overlay?.resolved?.author || "").trim();

              const cleanSubreddit = normalizeSubreddit(overlay?.resolved?.subreddit || "");

              if (!author || !cleanSubreddit) {

                throw new Error("ban_user requires resolved author and subreddit.");

              }



              const durationDays = (() => {

                const rawDuration = step?.duration_days;

                const parsedInt = parseInt(rawDuration, 10);

                return isNaN(parsedInt) ? 0 : Math.max(0, parsedInt);

              })();



              const banMessage = interpolatePlaybookTemplate(step?.ban_message_template || "", {

                author,

                subreddit: cleanSubreddit,

                kind: (overlay?.resolved?.thingType || "submission") === "submission" ? "post" : "comment",

                permalink: overlay?.resolved?.permalink,

              }).trim();



              const banNote = interpolatePlaybookTemplate(step?.note_template || "", {

                author,

                subreddit: cleanSubreddit,

                kind: (overlay?.resolved?.thingType || "submission") === "submission" ? "post" : "comment",

                permalink: overlay?.resolved?.permalink,

              }).trim();



              await banUserViaNativeSession({

                subreddit: cleanSubreddit,

                username: author,

                durationDays,

                banMessage,

                note: banNote,

              });

              completed += 1;

              continue;

            }



            if (stepType === "unban_user") {

              const author = String(overlay?.resolved?.author || "").trim();

              const cleanSubreddit = normalizeSubreddit(overlay?.resolved?.subreddit || "");

              if (!author || !cleanSubreddit) {

                throw new Error("unban_user requires resolved author and subreddit.");

              }

              await unbanUserViaNativeSession({ subreddit: cleanSubreddit, username: author });

              completed += 1;

              continue;

            }



            if (stepType === "send_modmail") {

              const cleanSubreddit = normalizeSubreddit(overlay?.resolved?.subreddit || "");

              const author = String(overlay?.resolved?.author || "").trim();

              const kind = (overlay?.resolved?.thingType || "submission") === "submission" ? "post" : "comment";

              const toMode = (["custom", "subreddit"].includes(String(step?.to_mode || "").trim().toLowerCase())) ? String(step.to_mode).trim().toLowerCase() : "author";

              const toUsername = toMode === "custom" ? String(step?.to_username || "").trim() : toMode === "subreddit" ? null : author;

              const subject = interpolatePlaybookTemplate(step?.subject_template || "", {

                author,

                subreddit: cleanSubreddit,

                kind,

                permalink: overlay?.resolved?.permalink,

              }).trim();

              let body = interpolatePlaybookTemplate(step?.body_template || "", {

                author,

                subreddit: cleanSubreddit,

                kind,

                permalink: overlay?.resolved?.permalink,

              }).trim();

              if (step?.include_permalink !== false && String(overlay?.resolved?.permalink || "").trim()) {

                body = `${body}\n\n---\n[Link to this ${kind}](${String(overlay.resolved.permalink).trim()})`;

              }

              if (!cleanSubreddit || (toMode !== "subreddit" && !toUsername) || !subject || !body) {

                throw new Error("send_modmail requires subreddit, subject, and body (and a recipient when not sending to modteam).");

              }

              const modmailResult = await sendModmailViaReddit({

                subreddit: cleanSubreddit,

                to: toUsername,

                subject,

                body,

                isAuthorHidden: true,

              });

              const conversationId = String(modmailResult?.conversation?.id || "").trim();

              const isInternal = Boolean(modmailResult?.conversation?.isInternal);

              if (step?.auto_archive !== false && conversationId && !isInternal) {

                try {

                  await archiveModmailConversationViaReddit(conversationId);

                } catch {

                  // Best effort only.

                }

              }

              completed += 1;

              continue;

            }



            if (stepType === "distinguish_comment") {

              const fullname = String(overlay.resolved?.fullname || overlay.target || "").trim().toLowerCase();

              if (!fullname.startsWith("t1_")) {

                completed += 1;

                continue;

              }

              await distinguishThingViaNativeSession(fullname, Boolean(step?.sticky));

              completed += 1;

              continue;

            }



            // Unknown step type - log and skip

            console.warn(`[ModBox] Unknown playbook step type: ${stepType}, skipping`);

            completed += 1;

          } catch (stepError) {

            console.error(`[ModBox] Step ${completed + 1} (${String(step?.type || "unknown")}) failed:`, stepError);

            failures.push(`step ${completed + 1} (${String(step?.type || "unknown")}): ${getSafeErrorMessage(stepError)}`);

            if (playbook.stop_on_error !== false) {

              break;

            }

          }

        }



        if (failures.length > 0) {

          console.warn(`[ModBox] Playbook "${playbook.title}" completed with ${failures.length} error(s):`, failures);

          showToast(`Playbook "${playbook.title}" completed with ${failures.length} error${failures.length === 1 ? "" : "s"}`, "error");

        } else {

          console.log(`[ModBox] Playbook "${playbook.title}" completed successfully: ${completed} step${completed === 1 ? "" : "s"}`);

          showToast(`✓ Playbook "${playbook.title}" ran ${completed} step${completed === 1 ? "" : "s"}`, "success");

          // Close overlay after successful completion

          setTimeout(closeOverlay, 500);

        }

      } catch (err) {

        console.error("[ModBox] Playbook execution error:", err);

        showToast(`Playbook error: ${err instanceof Error ? err.message : String(err)}`, "error");

      }

    })();

  };







  root.querySelectorAll("[data-playbook-key]").forEach((buttonEl) => {

    buttonEl.addEventListener("click", (event) => {

      const playbookKey = String(event.currentTarget.getAttribute("data-playbook-key") || "").trim();

      if (!playbookKey) {

        return;

      }

      void runPlaybook(playbookKey);

    });

  });

}



async function openOverlay(target, options = {}) {

  const cleanTarget = String(target || "").trim();

  if (!cleanTarget) {

    console.warn("[ModBox] openOverlay called with empty target");

    return;

  }



  console.log("[ModBox] Opening overlay for target:", cleanTarget);

  const skipRedditRemove = Boolean(options.skipRedditRemove);

  const quickActionsOnlyMode = Boolean(options.quickActionsOnlyMode);

  const overrideSubreddit = normalizeSubreddit(options.subreddit || "");



  // Fetch autoCloseOnRemove setting early

  let initialAutoCloseOnRemove = false;

  try {

    const stored = await ext.storage.sync.get([AUTO_CLOSE_KEY]);

    initialAutoCloseOnRemove = Boolean(stored?.[AUTO_CLOSE_KEY]);

    console.log("[ModBox] Read autoCloseOnRemove from storage in openOverlay:", initialAutoCloseOnRemove, stored);

  } catch (e) {

    console.log("[ModBox] Error reading autoCloseOnRemove from storage in openOverlay:", e);

  }



  overlayState = {

    loading: true,

    target: cleanTarget,

    resolved: null,

    removalConfig: buildDefaultRemovalConfig(""),

    reasons: [],

    selectedReasonKeys: [],

    sendMode: "reply",

    inputValues: {},

    validationErrors: {},

    error: "",

    status: "",

    submitting: false,

    reasonSearch: "",

    compactMode: window.location.hostname === "old.reddit.com",

    autoCloseOnRemove: initialAutoCloseOnRemove,

    skipRedditRemove,

    quickActionsOnlyMode,

    targetCardExpanded: false,

    previewMessage: "",

    previewSubject: "",

    previewLoading: false,

    previewError: "",

    previewRequestId: 0,

    previewTimer: null,

    dynamicBlocks: [],

    fullname: cleanTarget,

    removalNoteText: "",

    removalNoteType: "none",

    removalNoteTypes: ["none"],

    removalNoteTypeLabels: {},

    postFlairTemplates: [],

    activeTab: quickActionsOnlyMode ? "quick_actions" : "kind_actions",

    userFlairTemplates: [],

    selectedUserFlairTemplateId: "",

    banDurationOption: "7",

    banCustomDays: "",

    banMessage: "",

    isUserAlreadyBanned: false,

    banStatusLoading: false,

    addBanUsernote: true,

    banUsernoteText: "7DTB",

    banUsernoteType: "none",

    banUsernoteAutoValue: "7DTB",

    quickActionsConfig: buildDefaultQuickActionsConfig(""),

    quickActionsLoading: false,

    quickActionsError: "",

    quickActionsStatus: "",

    playbooksConfig: buildDefaultPlaybooksConfig(""),

    playbooksLoading: false,

    playbooksError: "",

    playbooksStatus: "",

    cannedRepliesConfig: buildDefaultCannedRepliesConfig(""),

    cannedRepliesLoading: false,

    cannedRepliesError: "",

    cannedRepliesStatus: "",

    keydownHandler: null,

  };

  const overlayRef = overlayState;



  overlayState.keydownHandler = (event) => {

    if (!overlayState) return;

    if (event.key === "Escape") {

      event.preventDefault();

      closeOverlay();

      return;

    }

    if (event.key === "Enter" && event.ctrlKey) {

      const removeButton = document.getElementById("rrw-remove");

      if (removeButton instanceof HTMLButtonElement && !removeButton.disabled) {

        event.preventDefault();

        removeButton.click();

      }

    }

  };

  document.addEventListener("keydown", overlayState.keydownHandler, true);

  renderOverlay();



  try {

    const settings = await getApiBaseUrl();

    if (overlayState !== overlayRef) return;

    overlayState.autoCloseOnRemove = settings.autoCloseOnRemove;

    interceptNativeRemoveEnabled = settings.interceptNativeRemove;

    if (settings.lastSendMode) overlayState.sendMode = settings.lastSendMode;



    const [resolveResult] = await Promise.allSettled([

      resolveTargetViaReddit(cleanTarget),

    ]);

    if (overlayState !== overlayRef) return;



    if (resolveResult.status === "fulfilled") {

      overlayState.resolved = resolveResult.value;

      // Override subreddit if provided in options

      if (overrideSubreddit) {

        overlayState.resolved.subreddit = overrideSubreddit;

      }

      console.log("[ModBox] Overlay resolved:", overlayState.resolved);

    } else if (isFullname(cleanTarget)) {

      const subreddit = overrideSubreddit || parseSubredditFromPath(window.location.pathname);

      const postId = parsePostIdFromPath(window.location.pathname);

      const formattedUrl = formatRedditUrl(subreddit, postId) || formatRedditByIdUrl(cleanTarget);

      overlayState.resolved = {

        fullname: cleanTarget.toLowerCase(),

        thingType: cleanTarget.toLowerCase().startsWith("t3_") ? "submission" : "comment",

        subreddit: subreddit || "unknown",

        author: null,

        title: null,

        bodyPreview: null,

        bodyHtml: "",

        permalink: formattedUrl,

        isActionable: true,

        reason: null,

      };

      overlayState.error = "Metadata lookup failed; using direct fullname fallback.";

    } else {

      throw resolveResult.reason;

    }



    const resolvedUser = String(overlayState?.resolved?.author || "").trim();

    const resolvedSubreddit = overrideSubreddit || normalizeSubreddit(overlayState?.resolved?.subreddit || "");

    const resolvedFullname = String(overlayState?.resolved?.fullname || cleanTarget || "").trim().toLowerCase();



    let cachedConfig = null;

    if (resolvedSubreddit) {

      cachedConfig = await getCachedRemovalConfig(resolvedSubreddit);

      if (overlayState !== overlayRef) return;

      if (cachedConfig) {

        overlayRef.removalConfig = cachedConfig;

        overlayRef.reasons = Array.isArray(cachedConfig.reasons) ? cachedConfig.reasons : [];

        overlayRef.configFromCache = true;

        if (!settings.lastSendMode && cachedConfig.global_settings?.default_send_mode) {

          overlayRef.sendMode = cachedConfig.global_settings.default_send_mode;

        }

        renderOverlay();

      }

    }



    // Parallelize usernotes and ban status fetch

    let usernotesPromise = Promise.resolve(null);

    let banStatusPromise = Promise.resolve(null);

    let userFlairTemplatesPromise = Promise.resolve([]);

    let postFlairTemplatesPromise = Promise.resolve([]);

    let quickActionsPromise = Promise.resolve(null);

    let playbooksPromise = Promise.resolve(null);

    let cannedRepliesPromise = Promise.resolve(null);

    if (resolvedSubreddit) {

      console.log("[ModBox] openOverlay: Starting quick actions and playbooks load for subreddit:", resolvedSubreddit);

      overlayState.quickActionsLoading = true;

      overlayState.quickActionsError = "";

      console.log("[ModBox] openOverlay: Calling loadQuickActionsFromWiki");

      quickActionsPromise = loadQuickActionsFromWiki(resolvedSubreddit)

        .then((quickConfig) => {

          console.log("[ModBox] openOverlay: quickConfig received:", quickConfig);

          if (overlayState !== overlayRef) return;

          overlayRef.quickActionsConfig = normalizeQuickActionsDoc(quickConfig, resolvedSubreddit);

          console.log("[ModBox] openOverlay: quickActionsConfig set:", overlayRef.quickActionsConfig);

        })

        .catch((quickError) => {

          console.log("[ModBox] openOverlay: Quick actions error:", quickError);

          if (overlayState !== overlayRef) return;

          overlayRef.quickActionsError = quickError instanceof Error ? quickError.message : String(quickError);

          overlayRef.quickActionsConfig = buildDefaultQuickActionsConfig(resolvedSubreddit);

        })

        .finally(() => {

          if (overlayState !== overlayRef) return;

          overlayRef.quickActionsLoading = false;

          renderOverlay();

        });



      overlayState.playbooksLoading = true;

      overlayState.playbooksError = "";

      console.log("[ModBox] openOverlay: Calling loadPlaybooksFromWiki");

      playbooksPromise = loadPlaybooksFromWiki(resolvedSubreddit)

        .then((playbooksConfig) => {

          console.log("[ModBox] openOverlay: playbooksConfig received:", playbooksConfig);

          if (overlayState !== overlayRef) return;

          overlayRef.playbooksConfig = normalizePlaybooksDoc(playbooksConfig, resolvedSubreddit);

          console.log("[ModBox] openOverlay: playbooksConfig set:", overlayRef.playbooksConfig);

        })

        .catch((playbooksError) => {

          console.log("[ModBox] openOverlay: Playbooks error:", playbooksError);

          if (overlayState !== overlayRef) return;

          overlayRef.playbooksError = playbooksError instanceof Error ? playbooksError.message : String(playbooksError);

          overlayRef.playbooksConfig = buildDefaultPlaybooksConfig(resolvedSubreddit);

        })

        .finally(() => {

          if (overlayState !== overlayRef) return;

          overlayRef.playbooksLoading = false;

          renderOverlay();

        });



      overlayState.cannedRepliesLoading = true;

      overlayState.cannedRepliesError = "";

      console.log("[ModBox] openOverlay: Calling loadCannedRepliesFromWiki");

      cannedRepliesPromise = loadCannedRepliesFromWiki(resolvedSubreddit)

        .then((cannedRepliesConfig) => {

          console.log("[ModBox] openOverlay: cannedRepliesConfig received:", cannedRepliesConfig);

          if (overlayState !== overlayRef) return;

          overlayRef.cannedRepliesConfig = normalizeCannedRepliesDoc(cannedRepliesConfig, resolvedSubreddit);

          console.log("[ModBox] openOverlay: cannedRepliesConfig set:", overlayRef.cannedRepliesConfig);

        })

        .catch((cannedRepliesError) => {

          console.log("[ModBox] openOverlay: Canned replies error:", cannedRepliesError);

          if (overlayState !== overlayRef) return;

          overlayRef.cannedRepliesError = cannedRepliesError instanceof Error ? cannedRepliesError.message : String(cannedRepliesError);

          overlayRef.cannedRepliesConfig = buildDefaultCannedRepliesConfig(resolvedSubreddit);

        })

        .finally(() => {

          if (overlayState !== overlayRef) return;

          overlayRef.cannedRepliesLoading = false;

          renderOverlay();

        });

    }

    if (resolvedUser && resolvedSubreddit) {

      console.log("[ModBox] Fetching user/post flairs for:", { resolvedUser, resolvedSubreddit });

      usernotesPromise = fetchUsernotes(resolvedSubreddit, resolvedUser)

        .then((usernotesPayload) => {

          if (overlayState !== overlayRef) return;

          overlayState.removalNoteTypes = Array.isArray(usernotesPayload?.note_types) ? usernotesPayload.note_types : ["none"];

          overlayState.removalNoteTypeLabels =

            usernotesPayload?.note_type_labels && typeof usernotesPayload.note_type_labels === "object"

              ? usernotesPayload.note_type_labels

              : {};

          if (!overlayState.removalNoteTypes.includes(overlayState.banUsernoteType)) {

            overlayState.banUsernoteType = "none";

          }

        })

        .catch(() => {

          overlayRef.removalNoteTypes = ["none"];

          overlayRef.removalNoteTypeLabels = {};

          overlayRef.banUsernoteType = "none";

        });



      userFlairTemplatesPromise = fetchUserFlairTemplatesViaReddit(resolvedSubreddit)

        .then((templates) => {

          console.log("[ModBox] User flair templates fetched successfully:", templates);

          if (overlayState !== overlayRef) return;

          overlayRef.userFlairTemplates = Array.isArray(templates) ? templates : [];

          renderOverlay();

        })

        .catch((err) => {

          console.error("[ModBox] User flair templates fetch failed:", err);

          overlayRef.userFlairTemplates = [];

          renderOverlay();

        });



      postFlairTemplatesPromise = fetchPostFlairTemplatesViaReddit(resolvedSubreddit)

        .then((templates) => {

          if (overlayState !== overlayRef) return;

          overlayRef.postFlairTemplates = Array.isArray(templates) ? templates : [];

        })

        .catch(() => {

          overlayRef.postFlairTemplates = [];

        });

    }

    if ((resolvedFullname.startsWith("t1_") || resolvedFullname.startsWith("t3_")) && resolvedSubreddit && resolvedUser) {

      overlayState.banStatusLoading = true;

      renderOverlay();

      banStatusPromise = fetchBanStatusViaReddit(resolvedSubreddit, resolvedUser)

        .then((banStatus) => {

          if (overlayState !== overlayRef) return;

          overlayState.isUserAlreadyBanned = Boolean(banStatus?.is_banned);

        })

        .catch(() => {

          overlayRef.isUserAlreadyBanned = false;

        })

        .finally(() => {

          overlayRef.banStatusLoading = false;

          renderOverlay();

        });

    }



    // Load wiki config after target resolution and refresh cache for future opens.

    if (resolvedSubreddit && !cachedConfig) {

      try {

        const freshConfig = await loadRemovalConfigFromWiki(resolvedSubreddit);

        if (overlayState !== overlayRef) return;

        overlayRef.removalConfig = freshConfig;

        overlayRef.reasons = Array.isArray(freshConfig.reasons) ? freshConfig.reasons : [];

        overlayRef.selectedReasonKeys = [];

        overlayRef.configFromCache = false;

        if (!settings.lastSendMode && freshConfig.global_settings?.default_send_mode) {

          overlayRef.sendMode = freshConfig.global_settings.default_send_mode;

        }

        void setCachedRemovalConfig(resolvedSubreddit, freshConfig);

        renderOverlay();

      } catch (configError) {

        const configErr = configError instanceof Error ? configError.message : String(configError);

        overlayRef.error = overlayRef.error || `Unable to load removal reasons: ${configErr}`;

        renderOverlay();

      }

    } else if (resolvedSubreddit && cachedConfig) {

      loadRemovalConfigFromWiki(resolvedSubreddit).then((freshConfig) => {

        if (overlayState !== overlayRef) {

          return;

        }

        overlayRef.removalConfig = freshConfig;

        overlayRef.reasons = Array.isArray(freshConfig.reasons) ? freshConfig.reasons : [];

        overlayRef.configFromCache = false;

        void setCachedRemovalConfig(resolvedSubreddit, freshConfig);

        renderOverlay();

        schedulePreview();

      }).catch(() => {});

    }



    // Keep these async loads non-blocking; each promise updates state independently.

    void usernotesPromise;

    void banStatusPromise;

    void userFlairTemplatesPromise;

    void postFlairTemplatesPromise;

    void quickActionsPromise;

    void playbooksPromise;

  } catch (error) {

    if (overlayState !== overlayRef) return;

    const message = error instanceof Error ? error.message : String(error);

    overlayState.error = message;

    renderOverlay();

  } finally {

    if (overlayState !== overlayRef) return;

    overlayState.loading = false;

    renderOverlay();

    schedulePreview();

  }

}

// ------------------------------------------------------------------------------
// canned-replies-injector.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Canned Replies Injector Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Provides canned reply functionality accessible from the ModBox Queue Bar.

// Copies selected replies to the clipboard for easy pasting.

// Dependencies: constants.js, state.js, utilities.js, wiki-loader.js



let cannedRepliesConfig = null;

let cannedRepliesLoadPromise = null;



function initCannedRepliesInjector() {

  console.log("[ModBox] Initializing canned replies injector");

  // Injector is now accessed via queue bar button only

}



async function loadCannedRepliesIfNeeded() {

  // If already loaded or loading, return the promise

  if (cannedRepliesConfig) {

    console.log("[ModBox] Using cached canned replies:", cannedRepliesConfig);

    return cannedRepliesConfig;

  }

  

  if (cannedRepliesLoadPromise) {

    return cannedRepliesLoadPromise;

  }

  

  // Load from wiki

  cannedRepliesLoadPromise = (async () => {

    try {

      // Try to get subreddit from current page

      let subreddit = parseSubredditFromPath(window.location.pathname);

      console.log("[ModBox] Canned replies: parsed subreddit =", subreddit);

      

      // If no subreddit on page (e.g., modmail), pass empty string

      // loadCannedRepliesFromWiki will check for configured URL first

      if (!subreddit) {

        subreddit = "";

      }

      

      console.log("[ModBox] Loading canned replies from wiki");

      const config = await loadCannedRepliesFromWiki(subreddit);

      console.log("[ModBox] Wiki returned config:", config);

      

      cannedRepliesConfig = normalizeCannedRepliesDoc(config, subreddit);

      console.log("[ModBox] Normalized canned replies config:", cannedRepliesConfig);

      

      return cannedRepliesConfig;

    } catch (err) {

      console.error("[ModBox] Error loading canned replies:", err);

      const subreddit = parseSubredditFromPath(window.location.pathname);

      cannedRepliesConfig = buildDefaultCannedRepliesConfig(subreddit || "");

      return cannedRepliesConfig;

    }

  })();

  

  return cannedRepliesLoadPromise;

}



// Open GUI as modal popup from queue bar

async function openCannedRepliesModal() {

  console.log("[ModBox] openCannedRepliesModal called");

  const config = await loadCannedRepliesIfNeeded();

  const responses = config?.replies || [];

  

  console.log("[ModBox] Got responses:", responses.length);

  

  if (!responses.length) {

    alert('No canned replies found. Check your wiki config.');

    return;

  }

  

  closeCannedRepliesModal();

  

  console.log("[ModBox] Creating canned replies modal overlay");

  // Ensure overlay root exists

  const overlayRoot = ensureOverlayRoot();

  

  // Create backdrop

  const backdrop = document.createElement('div');

  backdrop.className = 'rrw-overlay-backdrop';

  backdrop.id = 'cannedRepliesBackdrop';

  backdrop.onclick = (e) => {

    if (e.target === backdrop) closeCannedRepliesModal();

  };

  

  // Create modal

  const modal = document.createElement('div');

  modal.className = 'rrw-overlay-modal';

  modal.id = 'cannedRepliesModal';

  

  // Create header

  const header = document.createElement('div');

  header.className = 'rrw-overlay-header';

  const title = document.createElement('h2');

  title.textContent = 'Canned Replies';

  header.appendChild(title);

  

  // Create header actions container

  const headerActions = document.createElement('div');

  headerActions.className = 'rrw-header-actions';

  

  // Add Edit button

  const editBtn = document.createElement('button');

  editBtn.className = 'rrw-btn rrw-btn-secondary';

  editBtn.type = 'button';

  editBtn.textContent = 'Edit';

  editBtn.title = 'Edit canned replies';

  editBtn.onclick = (e) => {

    e.preventDefault();

    e.stopPropagation();

    closeCannedRepliesModal();

    openCannedRepliesEditor();

  };

  headerActions.appendChild(editBtn);

  header.appendChild(headerActions);

  

  modal.appendChild(header);

  

  // Create grid container for buttons

  const grid = document.createElement('div');

  grid.className = 'rrw-quick-actions-grid';

  grid.style.padding = '12px';

  grid.style.overflowY = 'auto';

  grid.style.maxHeight = 'calc(100vh - 120px)';

  

  // Add reply buttons to grid

  responses.forEach(resp => {

    const btn = document.createElement('button');

    btn.className = 'rrw-quick-action-btn rrw-btn rrw-btn-secondary';

    btn.type = 'button';

    btn.textContent = resp.name;

    btn.title = resp.content;

    

    btn.onclick = (e) => {

      e.preventDefault();

      e.stopPropagation();

      onSelectCannedReply(resp);

    };

    

    grid.appendChild(btn);

  });

  

  modal.appendChild(grid);

  

  // Add to overlay root

  overlayRoot.appendChild(backdrop);

  overlayRoot.appendChild(modal);

  

  console.log("[ModBox] Opened canned replies modal with", responses.length, "replies");

  

  // Close on click outside modal

  setTimeout(() => {

    document.addEventListener('mousedown', (e) => {

      if (!modal.contains(e.target)) {

        closeCannedRepliesModal();

      }

    }, { once: true });

  }, 0);

}



function closeCannedRepliesModal() {

  const modal = document.getElementById('cannedRepliesModal');

  const backdrop = document.getElementById('cannedRepliesBackdrop');

  if (modal) modal.remove();

  if (backdrop) backdrop.remove();

}



// Show brief notification that text was copied

function showCopyNotification() {

  // Add animation keyframes if not already present

  if (!document.getElementById('cannedRepliesCopyAnimation')) {

    const style = document.createElement('style');

    style.id = 'cannedRepliesCopyAnimation';

    style.textContent = `

      @keyframes fadeInOut {

        0% { opacity: 0; transform: translateY(-20px); }

        10% { opacity: 1; transform: translateY(0); }

        90% { opacity: 1; transform: translateY(0); }

        100% { opacity: 0; transform: translateY(-20px); }

      }

    `;

    document.head.appendChild(style);

  }

  

  const notification = document.createElement('div');

  notification.textContent = 'Copied to clipboard!';

  notification.style.cssText = `

    position: fixed;

    top: 20px;

    left: 50%;

    margin-left: -100px;

    width: 200px;

    text-align: center;

    background-color: #2e7d32;

    color: white;

    padding: 14px 24px;

    border-radius: 6px;

    font-size: 16px;

    font-weight: bold;

    z-index: 999999;

    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);

    animation: fadeInOut 2s ease-in-out;

    pointer-events: none;

    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;

  `;

  

  console.log("[ModBox] Showing copy notification");

  document.documentElement.appendChild(notification);

  

  setTimeout(() => {

    console.log("[ModBox] Removing copy notification");

    notification.remove();

  }, 2000);

}



// On reply select - copy to clipboard

function onSelectCannedReply(resp) {

  navigator.clipboard.writeText(resp.content)

    .then(() => {

      console.log("[ModBox] Canned reply copied to clipboard:", resp.name);

      showCopyNotification();

      closeCannedRepliesModal();

    })

    .catch((err) => {

      console.error("[ModBox] Failed to copy to clipboard:", err);

      alert("Failed to copy to clipboard. Please try again.");

      closeCannedRepliesModal();

    });

}



// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// CANNED REPLIES EDITOR

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•



async function openCannedRepliesEditor() {

  console.log("[ModBox] Opening canned replies editor");

  const config = await loadCannedRepliesIfNeeded();

  const replies = JSON.parse(JSON.stringify(config?.replies || [])); // Deep copy

  

  // Get current subreddit from page

  const currentSubreddit = parseSubredditFromPath(window.location.pathname);

  const subreddit = currentSubreddit || config?.subreddit || "";

  console.log("[ModBox] Editor using subreddit:", subreddit);

  

  if (!subreddit) {

    alert('Could not determine subreddit. Make sure you are on a subreddit page.');

    return;

  }

  

  closeCannedRepliesEditorModal();

  

  const overlayRoot = ensureOverlayRoot();

  

  // Create backdrop

  const backdrop = document.createElement('div');

  backdrop.className = 'rrw-overlay-backdrop';

  backdrop.id = 'cannedRepliesEditorBackdrop';

  backdrop.onclick = (e) => {

    if (e.target === backdrop) closeCannedRepliesEditorModal();

  };

  

  // Create modal

  const modal = document.createElement('div');

  modal.className = 'rrw-overlay-modal';

  modal.id = 'cannedRepliesEditorModal';

  modal.style.width = 'min(800px, calc(100vw - 32px))';

  

  // Create header

  const header = document.createElement('div');

  header.className = 'rrw-overlay-header';

  const title = document.createElement('h2');

  title.textContent = 'Edit Canned Replies';

  header.appendChild(title);

  modal.appendChild(header);

  

  // Create content area

  const contentArea = document.createElement('div');

  contentArea.style.padding = '12px 16px';

  contentArea.style.overflowY = 'auto';

  contentArea.style.maxHeight = 'calc(100vh - 180px)';

  contentArea.style.borderBottom = '1px solid var(--rrw-soft-border)';

  

  // Create list of replies

  const repliesList = document.createElement('div');

  repliesList.id = 'cannedRepliesEditorList';

  repliesList.style.marginBottom = '12px';

  

  replies.forEach((reply, idx) => {

    const replyItem = createReplyEditorItem(reply, idx, replies, repliesList);

    repliesList.appendChild(replyItem);

  });

  

  contentArea.appendChild(repliesList);

  

  // Add new reply button

  const addNewBtn = document.createElement('button');

  addNewBtn.className = 'rrw-btn rrw-btn-secondary';

  addNewBtn.style.marginBottom = '12px';

  addNewBtn.textContent = '+ Add New Reply';

  addNewBtn.onclick = () => {

    replies.push({ name: '', content: '' });

    const replyItem = createReplyEditorItem(replies[replies.length - 1], replies.length - 1, replies, repliesList);

    repliesList.appendChild(replyItem);

    // Focus the new item's name field

    const nameInput = replyItem.querySelector('.reply-name-input');

    if (nameInput) nameInput.focus();

  };

  contentArea.appendChild(addNewBtn);

  

  modal.appendChild(contentArea);

  

  // Create footer with buttons

  const footer = document.createElement('div');

  footer.style.display = 'flex';

  footer.style.gap = '8px';

  footer.style.justifyContent = 'flex-end';

  footer.style.padding = '12px 16px';

  

  const cancelBtn = document.createElement('button');

  cancelBtn.className = 'rrw-btn rrw-btn-secondary';

  cancelBtn.textContent = 'Cancel';

  cancelBtn.onclick = closeCannedRepliesEditorModal;

  footer.appendChild(cancelBtn);

  

  const saveBtn = document.createElement('button');

  saveBtn.className = 'rrw-btn rrw-btn-primary';

  saveBtn.textContent = 'Save';

  saveBtn.onclick = async () => {

    saveBtn.disabled = true;

    saveBtn.textContent = 'Saving...';

    try {

      console.log("[ModBox] Save button clicked");

      console.log("[ModBox] Subreddit:", subreddit);

      console.log("[ModBox] Replies to save:", replies);

      

      // Filter out empty replies

      const nonEmptyReplies = replies.filter(r => {

        const hasName = r.name && r.name.trim();

        const hasContent = r.content && r.content.trim();

        console.log(`[ModBox] Checking reply: name="${r.name}" (${hasName ? 'valid' : 'empty'}), content="${r.content ? r.content.substring(0, 20) + '...' : ''}" (${hasContent ? 'valid' : 'empty'})`);

        return hasName && hasContent;

      });

      

      console.log("[ModBox] Non-empty replies count:", nonEmptyReplies.length);

      

      // Update the config with modified replies

      const newConfig = {

        schema: config.schema,

        version: config.version,

        subreddit: subreddit,

        replies: nonEmptyReplies

      };

      

      console.log("[ModBox] Calling saveCannedRepliesToWiki with config:", JSON.stringify(newConfig, null, 2));

      

      await saveCannedRepliesToWiki(subreddit, newConfig, "Updated canned replies via ModBox Editor");

      

      // Clear caches so fresh data is loaded

      cannedRepliesConfig = null;

      cannedRepliesLoadPromise = null;

      

      console.log("[ModBox] Canned replies saved successfully");

      showSaveNotification();

      closeCannedRepliesEditorModal();

    } catch (err) {

      console.error("[ModBox] Failed to save canned replies:", err);

      const errorMsg = err instanceof Error ? err.message : String(err);

      console.error("[ModBox] Error details:", errorMsg);

      alert("Failed to save canned replies: " + errorMsg);

      saveBtn.disabled = false;

      saveBtn.textContent = 'Save';

    }

  };

  footer.appendChild(saveBtn);

  

  modal.appendChild(footer);

  

  overlayRoot.appendChild(backdrop);

  overlayRoot.appendChild(modal);

  

  console.log("[ModBox] Opened canned replies editor");

}



function createReplyEditorItem(reply, idx, repliesArray, container) {

  const item = document.createElement('div');

  item.className = 'reply-editor-item';

  item.style.cssText = `

    border: 1px solid var(--rrw-soft-border);

    border-radius: 6px;

    padding: 12px;

    margin-bottom: 12px;

    background: var(--rrw-subtle-bg);

  `;

  item.dataset.index = idx;

  

  // Name field

  const nameLabel = document.createElement('label');

  nameLabel.style.cssText = `

    display: block;

    margin-bottom: 6px;

    font-size: 0.9rem;

    font-weight: 500;

    color: var(--rrw-text);

  `;

  nameLabel.textContent = 'Reply Name:';

  item.appendChild(nameLabel);

  

  const nameInput = document.createElement('input');

  nameInput.className = 'reply-name-input';

  nameInput.type = 'text';

  nameInput.value = reply.name;

  nameInput.placeholder = 'e.g., "You\'re Welcome"';

  nameInput.style.cssText = `

    width: 100%;

    padding: 8px;

    margin-bottom: 12px;

    border: 1px solid var(--rrw-soft-border);

    border-radius: 4px;

    background: var(--rrw-modal-bg);

    color: var(--rrw-text);

    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;

    box-sizing: border-box;

  `;

  nameInput.onchange = () => {

    reply.name = nameInput.value;

  };

  nameInput.oninput = () => {

    reply.name = nameInput.value;

  };

  item.appendChild(nameInput);

  

  // Content field

  const contentLabel = document.createElement('label');

  contentLabel.style.cssText = `

    display: block;

    margin-bottom: 6px;

    font-size: 0.9rem;

    font-weight: 500;

    color: var(--rrw-text);

  `;

  contentLabel.textContent = 'Reply Content:';

  item.appendChild(contentLabel);

  

  const contentInput = document.createElement('textarea');

  contentInput.className = 'reply-content-input';

  contentInput.value = reply.content;

  contentInput.placeholder = 'Enter the canned reply text';

  contentInput.style.cssText = `

    width: 100%;

    padding: 8px;

    margin-bottom: 12px;

    border: 1px solid var(--rrw-soft-border);

    border-radius: 4px;

    background: var(--rrw-modal-bg);

    color: var(--rrw-text);

    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;

    resize: vertical;

    min-height: 80px;

    box-sizing: border-box;

  `;

  contentInput.onchange = () => {

    reply.content = contentInput.value;

  };

  contentInput.oninput = () => {

    reply.content = contentInput.value;

  };

  item.appendChild(contentInput);

  

  // Delete button

  const deleteBtn = document.createElement('button');

  deleteBtn.className = 'rrw-btn rrw-btn-secondary';

  deleteBtn.style.cssText = `

    background-color: #d32f2f;

    color: white;

  `;

  deleteBtn.textContent = 'Delete';

  deleteBtn.onclick = () => {

    repliesArray.splice(idx, 1);

    item.remove();

  };

  item.appendChild(deleteBtn);

  

  return item;

}



function closeCannedRepliesEditorModal() {

  const modal = document.getElementById('cannedRepliesEditorModal');

  const backdrop = document.getElementById('cannedRepliesEditorBackdrop');

  if (modal) modal.remove();

  if (backdrop) backdrop.remove();

}



function showSaveNotification() {

  const notification = document.createElement('div');

  notification.textContent = 'Canned replies saved!';

  notification.style.cssText = `

    position: fixed;

    top: 20px;

    left: 50%;

    margin-left: -100px;

    width: 200px;

    text-align: center;

    background-color: #2e7d32;

    color: white;

    padding: 14px 24px;

    border-radius: 6px;

    font-size: 16px;

    font-weight: bold;

    z-index: 999999;

    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);

    animation: fadeInOut 2s ease-in-out;

    pointer-events: none;

    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;

  `;

  document.documentElement.appendChild(notification);

  

  setTimeout(() => {

    notification.remove();

  }, 2000);

}

// ------------------------------------------------------------------------------
// history-popup.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Inline History Popup Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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

// ------------------------------------------------------------------------------
// modlog-popup.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Modlog Popup Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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



// â”€â”€â”€â”€ Filtering & Formatting â”€â”€â”€â”€



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



// â”€â”€â”€â”€ Main Functions (STUBS - Rendering Phase 2) â”€â”€â”€â”€



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



// â”€â”€â”€â”€ Inline Modlog Popup Functions â”€â”€â”€â”€



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

// ------------------------------------------------------------------------------
// comment-nuke.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Comment Nuke Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Bulk removal workflow for user comments with confirmation, removal reasons, and modmail.

// Dependencies: constants.js, state.js, services/reddit-api.js, services/wiki-loader.js,

//               features/context-popup.js, utilities.js

// Global State: commentNukeBusyTargets, commentNukeIgnoreDistinguished (defined elsewhere)



// â”€â”€â”€â”€ Helper Functions â”€â”€â”€â”€



function getCommentNukeButtonsForTarget(target) {

  const cleanTarget = String(target || "").trim().toLowerCase();

  if (!cleanTarget) {

    return [];

  }



  return Array.from(document.querySelectorAll(`.rrw-comment-nuke-btn[data-comment-nuke-target="${CSS.escape(cleanTarget)}"]`))

    .filter((button) => button instanceof HTMLButtonElement);

}



function setCommentNukeButtonsState(target, state = {}) {

  getCommentNukeButtonsForTarget(target).forEach((button) => {

    if (typeof state.text === "string") {

      button.textContent = state.text;

    }

    if (typeof state.title === "string") {

      button.title = state.title;

    }

    if (typeof state.disabled === "boolean") {

      button.disabled = state.disabled;

    }

    if (typeof state.variant === "string") {

      button.dataset.commentNukeState = state.variant;

    }

  });

}



function resetCommentNukeButtonsState(target) {

  setCommentNukeButtonsState(target, {

    text: "R",

    title: "Remove this comment and its replies",

    disabled: false,

    variant: "idle",

  });

}



function buildCommentNukeConfirmMessage(plan) {

  const total = Number(plan?.removalTargets?.length || 0);

  const descendantCount = Math.max(0, total - 1);

  const parts = [];



  if (descendantCount > 0) {

    parts.push(`Remove this comment and ${descendantCount} repl${descendantCount === 1 ? "y" : "ies"}?`);

  } else {

    parts.push("Remove this comment? No loaded replies were found.");

  }



  if (plan?.distinguishedCount > 0 && commentNukeIgnoreDistinguished) {

    parts.push(`Note: ${plan.distinguishedCount} distinguished comment${plan.distinguishedCount === 1 ? "" : "s"} will be skipped.`);

  }



  if (plan?.omittedReplyCount > 0) {

    parts.push(`Warning: ${plan.omittedReplyCount} repl${plan.omittedReplyCount === 1 ? "y" : "ies"} could not be expanded and may remain after removal.`);

  }



  return parts.join("\n\n");

}



function collectCommentNukeTargets(commentEntry, summary, targets = [], options = {}) {

  if (!commentEntry || commentEntry.kind !== "t1" || typeof commentEntry.data !== "object") {

    return targets;

  }



  const moreQueue = Array.isArray(options?.moreQueue) ? options.moreQueue : null;

  const ignoreDistinguished = Boolean(options?.ignoreDistinguished);



  const replies = Array.isArray(commentEntry.data?.replies?.data?.children)

    ? commentEntry.data.replies.data.children

    : [];



  replies.forEach((child) => {

    if (child?.kind === "t1" && typeof child.data === "object") {

      collectCommentNukeTargets(child, summary, targets, options);

      return;

    }



    if (child?.kind === "more") {

      const childIds = Array.isArray(child?.data?.children) ? child.data.children : [];

      if (moreQueue && childIds.length > 0) {

        moreQueue.push(...childIds);

      } else {

        summary.morePlaceholders += 1;

        summary.omittedReplyCount += childIds.length;

      }

    }

  });



  const fullname = String(commentEntry.data?.name || "").trim().toLowerCase();

  if (/^t1_[a-z0-9]{5,10}$/i.test(fullname)) {

    const isDistinguished = Boolean(String(commentEntry.data?.distinguished || "").trim());

    if (isDistinguished) {

      summary.distinguishedCount += 1;

      if (!ignoreDistinguished) {

        targets.push(fullname);

      }

    } else {

      targets.push(fullname);

    }

  }



  return targets;

}



async function expandMoreChildrenAndCollect(postFullname, initialChildIds, summary, targets, options) {

  const ignoreDistinguished = Boolean(options?.ignoreDistinguished);

  const seenIds = new Set(targets.map((fn) => String(fn || "").replace(/^t1_/i, "")));

  const MAX_BATCH = 100;

  const pending = initialChildIds.map((id) => String(id || "").trim().toLowerCase()).filter(Boolean);



  while (pending.length > 0) {

    const batch = pending.splice(0, MAX_BATCH);

    try {

      const response = await requestJsonViaBackground(

        `/api/morechildren?link_id=${encodeURIComponent(postFullname)}&children=${batch.join(",")}&api_type=json&raw_json=1`,

        { oauth: true, timeoutMs: 30000 },

      );

      const things = Array.isArray(response?.json?.data?.things) ? response.json.data.things : [];

      for (const thing of things) {

        if (!thing || typeof thing.data !== "object") {

          continue;

        }

        if (thing.kind === "t1") {

          const fullname = String(thing.data?.name || "").trim().toLowerCase();

          if (!/^t1_[a-z0-9]{5,10}$/i.test(fullname)) {

            continue;

          }

          const bareId = fullname.replace(/^t1_/i, "");

          if (seenIds.has(bareId)) {

            continue;

          }

          seenIds.add(bareId);

          const isDistinguished = Boolean(String(thing.data?.distinguished || "").trim());

          if (isDistinguished) {

            summary.distinguishedCount += 1;

            if (!ignoreDistinguished) {

              targets.push(fullname);

            }

          } else {

            targets.push(fullname);

          }

        } else if (thing.kind === "more") {

          const nestedChildIds = Array.isArray(thing.data?.children) ? thing.data.children : [];

          for (const id of nestedChildIds) {

            const cleanId = String(id || "").trim().toLowerCase();

            if (cleanId && !seenIds.has(cleanId)) {

              pending.push(cleanId);

            }

          }

        }

      }

    } catch {

      summary.morePlaceholders += 1;

      summary.omittedReplyCount += batch.length;

    }

  }

}



function buildCommentThreadJsonUrlFromPermalink(permalink) {

  const value = String(permalink || "").trim();

  if (!value) {

    return "";

  }



  const parsed = parseUrl(value.startsWith("http") ? value : `https://www.reddit.com${value}`);

  if (!parsed) {

    return "";

  }



  let pathname = String(parsed.pathname || "").replace(/\/+$/, "");

  if (!pathname) {

    return "";

  }

  if (!pathname.endsWith(".json")) {

    pathname = `${pathname}.json`;

  }



  const query = new URLSearchParams(parsed.search || "");

  query.set("context", "0");

  query.set("limit", query.get("limit") || "500");

  query.set("depth", query.get("depth") || "10");

  query.set("raw_json", "1");

  return `https://www.reddit.com${pathname}?${query.toString()}`;

}



function findCommentEntryById(children, targetCommentId) {

  const cleanTargetId = String(targetCommentId || "").trim().toLowerCase();

  if (!cleanTargetId) {

    return null;

  }



  const list = Array.isArray(children) ? children : [];

  for (const item of list) {

    if (!item || item.kind !== "t1" || typeof item.data !== "object") {

      continue;

    }



    const fullname = String(item.data?.name || "").trim().toLowerCase();

    if (fullname === `t1_${cleanTargetId}`) {

      return item;

    }



    const nested = findCommentEntryById(item.data?.replies?.data?.children, cleanTargetId);

    if (nested) {

      return nested;

    }

  }



  return null;

}



async function fetchCommentNukePlan(fullname) {

  const cleanFullname = String(fullname || "").trim().toLowerCase();

  if (!/^t1_[a-z0-9]{5,10}$/i.test(cleanFullname)) {

    throw new Error("Comment nuke only works on comment targets.");

  }



  const info = await requestJsonViaBackground(`/api/info.json?id=${encodeURIComponent(cleanFullname)}`, { oauth: true });

  const infoData = info?.data?.children?.[0]?.data;

  if (!infoData || typeof infoData !== "object") {

    throw new Error("Unable to load target comment metadata.");

  }



  const permalink = String(infoData?.permalink || "").trim();

  const threadJsonUrl = buildCommentThreadJsonUrlFromPermalink(permalink);

  if (!threadJsonUrl) {

    throw new Error("Unable to build comment thread URL for nuke.");

  }



  const payload = await requestJsonViaBackground(threadJsonUrl, { timeoutMs: 30000 });

  const listing = Array.isArray(payload) ? payload[1] : null;

  const children = Array.isArray(listing?.data?.children) ? listing.data.children : [];

  const commentId = extractCommentIdFromFullname(cleanFullname);

  const targetEntry = findCommentEntryById(children, commentId);

  if (!targetEntry) {

    throw new Error("Unable to locate the target comment in the loaded thread.");

  }



  const postFullname = String(infoData?.link_id || "").trim().toLowerCase();

  const summary = {

    morePlaceholders: 0,

    omittedReplyCount: 0,

    distinguishedCount: 0,

  };

  const nukeOptions = {

    moreQueue: [],

    ignoreDistinguished: commentNukeIgnoreDistinguished,

  };

  const removalTargets = collectCommentNukeTargets(targetEntry, summary, [], nukeOptions);



  if (nukeOptions.moreQueue.length > 0 && /^t3_[a-z0-9]{4,13}$/i.test(postFullname)) {

    await expandMoreChildrenAndCollect(postFullname, nukeOptions.moreQueue, summary, removalTargets, nukeOptions);

  } else if (nukeOptions.moreQueue.length > 0) {

    summary.morePlaceholders += nukeOptions.moreQueue.length;

    summary.omittedReplyCount += nukeOptions.moreQueue.length;

  }



  if (!removalTargets.length) {

    throw new Error("The loaded thread did not contain any removable comments.");

  }



  return {

    targetFullname: cleanFullname,

    author: String(infoData?.author || "[deleted]"),

    subreddit: normalizeSubreddit(infoData?.subreddit || ""),

    permalink,

    removalTargets,

    descendantCount: Math.max(0, removalTargets.length - 1),

    morePlaceholders: summary.morePlaceholders,

    omittedReplyCount: summary.omittedReplyCount,

    distinguishedCount: summary.distinguishedCount,

  };

}



// â”€â”€â”€â”€ Main Entry Point â”€â”€â”€â”€



async function runCommentNukeWorkflow(fullname, options = null) {

  const cleanFullname = String(fullname || "").trim().toLowerCase();

  if (!/^t1_[a-z0-9]{5,10}$/i.test(cleanFullname)) {

    throw new Error("Comment nuke only works on comment targets.");

  }

  if (commentNukeBusyTargets.has(cleanFullname)) {

    throw new Error("Comment nuke is already running for this comment.");

  }



  const onProgress = typeof options?.onProgress === "function" ? options.onProgress : null;

  commentNukeBusyTargets.add(cleanFullname);

  setCommentNukeButtonsState(cleanFullname, {

    text: "R...",

    title: "Loading comment tree...",

    disabled: true,

    variant: "busy",

  });



  try {

    const plan = await fetchCommentNukePlan(cleanFullname);

    onProgress?.({ phase: "planned", plan });



    if (!options?.skipConfirm) {

      const confirmed = window.confirm(buildCommentNukeConfirmMessage(plan));

      if (!confirmed) {

        return { cancelled: true, plan };

      }

    }



    const failures = [];

    for (let index = 0; index < plan.removalTargets.length; index += 1) {

      const current = plan.removalTargets[index];

      setCommentNukeButtonsState(cleanFullname, {

        text: `${index + 1}/${plan.removalTargets.length}`,

        title: `Removing ${index + 1} of ${plan.removalTargets.length} comments...`,

        disabled: true,

        variant: "busy",

      });

      onProgress?.({

        phase: "removing",

        current: index + 1,

        total: plan.removalTargets.length,

        target: current,

        plan,

      });



      try {

        await removeThingViaNativeSession(current, false);

      } catch (error) {

        failures.push(`${current}: ${summarizeRedditFailureMessage(getSafeErrorMessage(error))}`);

      }



      if (index + 1 < plan.removalTargets.length) {

        await wait(80);

      }

    }



    const result = {

      ...plan,

      successCount: plan.removalTargets.length - failures.length,

      failureCount: failures.length,

      failures,

    };

    const resultTitle = result.failureCount

      ? `${result.successCount}/${plan.removalTargets.length} comments removed. ${result.failures[0] || "Some removals failed."}`

      : `Removed ${result.successCount} comment${result.successCount === 1 ? "" : "s"}.`;

    setCommentNukeButtonsState(cleanFullname, {

      text: result.failureCount ? "!" : "OK",

      title: resultTitle,

      disabled: true,

      variant: result.failureCount ? "error" : "success",

    });

    onProgress?.({ phase: "complete", result });

    await wait(result.failureCount ? 2600 : 1200);

    return result;

  } catch (error) {

    const message = summarizeRedditFailureMessage(getSafeErrorMessage(error));

    setCommentNukeButtonsState(cleanFullname, {

      text: "!",

      title: message,

      disabled: true,

      variant: "error",

    });

    await wait(2600);

    throw error;

  } finally {

    commentNukeBusyTargets.delete(cleanFullname);

    resetCommentNukeButtonsState(cleanFullname);

  }

}

// ------------------------------------------------------------------------------
// context-popup.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Context Popup Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Right-click context menu popup with moderation actions for posts/comments.

// Dependencies: constants.js, state.js, utilities.js, services/reddit-api.js, features/overlay.js,

//               features/removal-config.js, features/usernotes.js



const CONTEXT_POPUP_DEFAULTS = {

  targetElement: null,

  targetAuthor: "",

  targetSubreddit: "",

  targetFullname: "",

  targetType: "comment",   // comment, post

  x: 0,

  y: 0,

  isDragging: false,

  dragStartX: 0,

  dragStartY: 0,

};



const CONTEXT_MENU_ACTIONS = [

  { id: "usernotes", label: "Usernotes", icon: "note" },

  { id: "history", label: "User History", icon: "history" },

  { id: "modlog", label: "Modlog", icon: "log" },

  { id: "remove", label: "Remove", icon: "trash" },

  { id: "approve", label: "Approve", icon: "check" },

  { id: "lock", label: "Lock", icon: "lock" },

  { id: "ban", label: "Ban User", icon: "ban" },

];



// â”€â”€â”€â”€ Helper Functions â”€â”€â”€â”€



function resolveContextTarget(element) {

  // Parse target element to extract author, fullname, subreddit

  const author = element?.dataset?.author || element?.querySelector("[data-author]")?.dataset?.author || "";

  const fullname = element?.dataset?.fullname || element?.querySelector("[data-fullname]")?.dataset?.fullname || "";

  const type = element?.classList?.contains("comment") ? "comment" : "post";

  return { author, fullname, type };

}



function clampPopupPosition(x, y, width = 300, height = 400) {

  const windowW = window.innerWidth;

  const windowH = window.innerHeight;

  let finalX = x;

  let finalY = y;

  

  if (finalX + width > windowW) finalX = windowW - width - 10;

  if (finalY + height > windowH) finalY = windowH - height - 10;

  if (finalX < 0) finalX = 10;

  if (finalY < 0) finalY = 10;

  

  return { x: finalX, y: finalY };

}



function normalizeContextPopupPosition(value) {

  if (!value || typeof value !== "object") {

    return null;

  }

  const left = Number(value.left);

  const top = Number(value.top);

  if (!Number.isFinite(left) || !Number.isFinite(top)) {

    return null;

  }

  return {

    left,

    top,

    custom: Boolean(value.custom),

  };

}



function getDefaultContextPopupPosition(clickPoint = null) {

  const click = clickPoint && Number.isFinite(clickPoint.x) && Number.isFinite(clickPoint.y)

    ? { left: Number(clickPoint.x) + 10, top: Number(clickPoint.y) + 10, custom: false }

    : null;



  if (contextPopupStoredPosition?.custom) {

    return { ...contextPopupStoredPosition };

  }



  if (click) {

    return click;

  }



  if (contextPopupStoredPosition) {

    return { ...contextPopupStoredPosition };

  }



  const fallbackWidth = Math.min(860, Math.max(420, window.innerWidth - 24));

  const fallbackHeight = Math.min(640, Math.max(300, window.innerHeight - 24));

  return {

    left: Math.max(8, Math.round((window.innerWidth - fallbackWidth) / 2)),

    top: Math.max(8, Math.round((window.innerHeight - fallbackHeight) / 2)),

    custom: false,

  };

}



function buildContextThreadRows(children, depth = 0, rows = []) {

  const list = Array.isArray(children) ? children : [];

  list.forEach((item) => {

    if (!item || item.kind !== "t1" || typeof item.data !== "object") {

      return;

    }

    rows.push({

      comment: item,

      depth,

    });

    const replies = item.data?.replies?.data?.children;

    if (Array.isArray(replies) && replies.length > 0) {

      buildContextThreadRows(replies, depth + 1, rows);

    }

  });

  return rows;

}



// â”€â”€â”€â”€ Main Functions â”€â”€â”€â”€



async function openContextPopup(contextJsonUrl, targetCommentId = "", clickPoint = null) {

  console.log("[ModBox] openContextPopup called with URL:", contextJsonUrl);

  

  const url = String(contextJsonUrl || "").trim();

  

  if (!url) {

    console.warn("[ModBox] openContextPopup: no URL provided");

    return;

  }



  const initialPosition = getDefaultContextPopupPosition(clickPoint);

  contextPopupState = {

    loading: true,

    error: "",

    title: "Comment context",

    rows: [],

    targetCommentId: String(targetCommentId || "").toLowerCase(),

    position: initialPosition,

    customPosition: Boolean(initialPosition?.custom),

  };

  

  console.log("[ModBox] Context popup state created, rendering...");

  renderContextPopup();



  try {

    console.log("[ModBox] Fetching from:", url);

    const payload = await requestJsonViaBackground(url);

    console.log("[ModBox] Received payload:", payload);

    

    // Check if state still exists (popup wasn't closed)

    if (!contextPopupState) {

      return;

    }

    

    const listing = Array.isArray(payload) ? payload[1] : null;

    const children = Array.isArray(listing?.data?.children) ? listing.data.children : [];

    const rows = buildContextThreadRows(children, 0, []);



    const firstRow = rows[0]?.comment?.data;

    if (firstRow) {

      const author = String(firstRow.author || "[deleted]");

      const subreddit = normalizeSubreddit(firstRow.subreddit || "");

      contextPopupState.title = `Context for u/${author}${subreddit ? ` in r/${subreddit}` : ""}`;

    }



    contextPopupState.loading = false;

    contextPopupState.rows = rows;

  } catch (error) {

    console.error("[ModBox] Error fetching context:", error);

    // Check if state still exists (popup wasn't closed)

    if (contextPopupState) {

      contextPopupState.loading = false;

      contextPopupState.error = error instanceof Error ? error.message : String(error);

    }

  }



  // Only re-render if state still exists

  if (contextPopupState) {

    console.log("[ModBox] Re-rendering popup");

    renderContextPopup();

  }

}



function renderContextPopup() {

  if (!contextPopupState) {

    closeContextPopup();

    return;

  }



  const root = ensureContextPopupRoot();

  root.innerHTML = `

    <div class="rrw-context-backdrop" data-context-close="1"></div>

    <section class="rrw-context-modal" role="dialog" aria-modal="true" aria-label="Comment context popup">

      <header class="rrw-context-header">

        <h2>${escapeHtml(contextPopupState.title || "Comment context")}</h2>

        <button type="button" class="rrw-close" data-context-close="1">Close</button>

      </header>

      <div class="rrw-context-body">

        ${contextPopupState.loading ? '<p class="rrw-muted">Loading context...</p>' : ""}

        ${contextPopupState.error ? `<div class="rrw-error">${escapeHtml(contextPopupState.error)}</div>` : ""}

        ${!contextPopupState.loading && !contextPopupState.error ? renderContextThreadRows(contextPopupState.rows, contextPopupState.targetCommentId) : ""}

      </div>

    </section>

  `;



  const modal = root.querySelector(".rrw-context-modal");

  const header = root.querySelector(".rrw-context-header");

  

  if (modal instanceof HTMLElement) {

    // Set initial position

    if (contextPopupState?.position) {

      applyContextPopupPosition(modal, contextPopupState.position);

    }

    

    // Adjust position after layout

    requestAnimationFrame(() => {

      if (!contextPopupState || !modal.isConnected) {

        return;

      }

      const clamped = clampContextPopupPosition(contextPopupState.position, modal);

      contextPopupState.position = clamped;

      applyContextPopupPosition(modal, clamped);

    });

  }



  bindContextPopupDrag(header, modal);



  root.querySelectorAll("[data-context-close='1']").forEach((element) => {

    element.addEventListener("click", (event) => {

      if (

        event.currentTarget !== event.target &&

        event.currentTarget instanceof HTMLElement &&

        event.currentTarget.classList.contains("rrw-context-backdrop")

      ) {

        return;

      }

      closeContextPopup();

    });

  });

}



function ensureContextPopupRoot() {

  let root = document.getElementById(CONTEXT_POPUP_ROOT_ID);

  if (root instanceof HTMLElement) {

    return root;

  }

  root = document.createElement("div");

  root.id = CONTEXT_POPUP_ROOT_ID;

  document.documentElement.appendChild(root);

  return root;

}



function clampContextPopupPosition(position, modal) {

  const normalized = normalizeContextPopupPosition(position) || { left: 12, top: 12, custom: false };

  const width = Number(modal?.offsetWidth || 0);

  const height = Number(modal?.offsetHeight || 0);

  const maxLeft = Math.max(8, window.innerWidth - Math.max(120, width) - 8);

  const maxTop = Math.max(8, window.innerHeight - Math.max(120, height) - 8);

  return {

    left: Math.min(maxLeft, Math.max(8, Math.round(normalized.left))),

    top: Math.min(maxTop, Math.max(8, Math.round(normalized.top))),

    custom: Boolean(normalized.custom),

  };

}



function applyContextPopupPosition(modal, position) {

  if (!(modal instanceof HTMLElement)) {

    return;

  }

  const normalized = normalizeContextPopupPosition(position);

  if (!normalized) {

    return;

  }

  modal.style.left = `${normalized.left}px`;

  modal.style.top = `${normalized.top}px`;

  modal.style.transform = "none";

}



function bindContextPopupDrag(header, modal) {

  if (!(header instanceof HTMLElement) || !(modal instanceof HTMLElement)) {

    return;

  }



  header.addEventListener("mousedown", (event) => {

    if (event.button !== 0) {

      return;

    }

    const target = event.target instanceof Element ? event.target : null;

    if (target?.closest("[data-context-close='1']")) {

      return;

    }



    event.preventDefault();



    const rect = modal.getBoundingClientRect();

    const offsetX = event.clientX - rect.left;

    const offsetY = event.clientY - rect.top;



    const onMove = (moveEvent) => {

      if (!contextPopupState) {

        return;

      }

      const rawPosition = {

        left: moveEvent.clientX - offsetX,

        top: moveEvent.clientY - offsetY,

        custom: true,

      };

      const clamped = clampContextPopupPosition(rawPosition, modal);

      contextPopupState.position = clamped;

      contextPopupState.customPosition = true;

      applyContextPopupPosition(modal, clamped);

    };



    const onUp = () => {

      window.removeEventListener("mousemove", onMove, true);

      window.removeEventListener("mouseup", onUp, true);

      if (contextPopupState?.position) {

        persistContextPopupPosition({ ...contextPopupState.position, custom: true });

      }

    };



    window.addEventListener("mousemove", onMove, true);

    window.addEventListener("mouseup", onUp, true);

  });

}



function renderContextThreadRows(rows, targetCommentId = "") {

  const list = Array.isArray(rows) ? rows : [];

  if (!list.length) {

    return '<div class="rrw-context-empty">No context comments found.</div>';

  }



  return list

    .map((row) => {

      const entry = row.comment;

      const data = entry?.data || {};

      const author = String(data.author || "[deleted]");

      const subreddit = normalizeSubreddit(data.subreddit || "");

      const commentId = extractCommentIdFromFullname(data.name);

      const isTarget = Boolean(targetCommentId) && commentId === targetCommentId;

      const bodyHtml = getProfileBodyHtmlFromEntry(entry) || "<p>[deleted]</p>";

      const permalinkPath = data.permalink ? data.permalink : "";

      const permalink = permalinkPath ? buildRedditUrl(permalinkPath, preferredRedditLinkHost) : "";

      const depth = Math.max(0, Number(row.depth || 0));

      const indent = Math.min(120, depth * 16);



      return `

        <article class="rrw-context-item${isTarget ? " rrw-context-item--target" : ""}" style="--rrw-context-indent:${indent}px;">

          <header class="rrw-context-item-header">

            <span class="rrw-context-item-author">u/${escapeHtml(author)}</span>

            ${subreddit ? `<span class="rrw-context-item-sub">r/${escapeHtml(subreddit)}</span>` : ""}

            <span class="rrw-context-item-time">${escapeHtml(formatProfileTimestamp(data.created_utc))}</span>

            ${isTarget ? '<span class="rrw-context-item-target-tag">target</span>' : ""}

          </header>

          <div class="rrw-context-item-body">${bodyHtml}</div>

          <footer class="rrw-context-item-footer">

            ${permalink ? `<a href="${escapeHtml(permalink)}" target="_blank" rel="noreferrer">Open comment</a>` : ""}

          </footer>

        </article>

      `;

    })

    .join("");

}



function extractCommentIdFromFullname(fullname) {

  const value = String(fullname || "").trim().toLowerCase();

  if (!value) {

    return "";

  }

  return value.replace(/^t1_/, "");

}



function formatProfileTimestamp(timestamp) {

  const ts = Number(timestamp);

  if (!Number.isFinite(ts)) return "unknown";

  const date = new Date(ts * 1000);

  return date.toLocaleDateString();

}



function persistContextPopupPosition(position) {

  const normalized = normalizeContextPopupPosition(position);

  if (!normalized) {

    return;

  }

  contextPopupStoredPosition = normalized;

  try {

    void ext.storage.local.set({ [CONTEXT_POPUP_POSITION_KEY]: normalized });

  } catch {

    // Ignore storage write failures for popup position.

  }

}



function closeContextPopup() {

  contextPopupState = null;

  const root = document.getElementById(CONTEXT_POPUP_ROOT_ID);

  if (!root) return;

  root.innerHTML = "";

  if (!overlayState && !usernotesEditorState && !removalConfigEditorState && !inlineHistoryPopupState && !inlineModlogPopupState && !root.children.length) {

    root.remove();

  }

}



async function handleContextAction(action, context) {

  // Stub: Route context menu actions to appropriate handlers

  // Opens removal editor, history popup, ban dialog, etc.

}



function bindOldRedditContextPopupLinks() {

  if (!contextPopupFeatureEnabled) {

    console.log("[ModBox] Context popup feature disabled");

    clearOldRedditContextPopupLinks();

    return;

  }



  if (!isOldRedditCommentsFeedPage()) {

    console.log("[ModBox] Not an old Reddit comments page");

    clearOldRedditContextPopupLinks();

    return;

  }



  const contextAnchors = document.querySelectorAll('.thing.comment .entry .flat-list.buttons a.bylink[data-event-action="context"]');

  console.log("[ModBox] Found", contextAnchors.length, "context anchors");

  

  contextAnchors.forEach((anchor) => {

    if (!(anchor instanceof HTMLAnchorElement)) {

      return;

    }



    const contextListItem = anchor.closest("li");

    if (!(contextListItem instanceof HTMLLIElement)) {

      return;

    }



    const listParent = contextListItem.parentElement;

    if (!(listParent instanceof HTMLElement)) {

      return;

    }



    if (listParent.querySelector('.rrw-comment-context-popup')) {

      return;

    }



    const contextHref = String(anchor.getAttribute("href") || "").trim();

    const contextJsonUrl = buildContextJsonUrlFromContextHref(contextHref);

    if (!contextJsonUrl) {

      return;

    }



    const commentContainer = anchor.closest('.thing.comment');

    const fullnameFromAttr = commentContainer instanceof HTMLElement

      ? extractFullnameFromAttributes(commentContainer)

      : "";

    const commentId = extractCommentIdFromFullname(fullnameFromAttr) || extractCommentIdFromContextHref(contextHref);



    const li = document.createElement("li");

    const link = document.createElement("a");

    link.href = "javascript:;";

    link.className = "bylink rrw-comment-context-popup rrw-oldreddit-context-popup";

    link.textContent = "context-popup";

    link.setAttribute("data-event-action", "context-popup");

    link.dataset.contextJsonUrl = contextJsonUrl;

    link.dataset.commentId = commentId;

    li.appendChild(link);



    contextListItem.insertAdjacentElement("afterend", li);



    // Add lock button

    const commentIsLocked = isCommentLockedInDOM(commentContainer);

    const lockLi = document.createElement("li");

    const lockLink = document.createElement("a");

    lockLink.href = "javascript:;";

    lockLink.className = "bylink rrw-comment-lock-btn rrw-oldreddit-lock-btn";

    lockLink.textContent = commentIsLocked ? "unlock" : "lock";

    lockLink.setAttribute("data-event-action", "comment-lock");

    lockLink.dataset.commentFullname = fullnameFromAttr;

    lockLink.dataset.isLocked = commentIsLocked ? "true" : "false";

    lockLi.appendChild(lockLink);

    li.insertAdjacentElement("afterend", lockLi);

  });

}



function clearOldRedditContextPopupLinks() {

  document.querySelectorAll(".rrw-oldreddit-context-popup, .rrw-oldreddit-lock-btn").forEach((link) => {

    const listItem = link.closest("li");

    if (listItem) {

      listItem.remove();

    } else {

      link.remove();

    }

  });

}



function clearCommentLockButtons() {

  // Clear standalone lock buttons (not part of context popup)

  document.querySelectorAll(".thing.comment .flat-list.buttons .rrw-comment-lock-btn:not(.rrw-oldreddit-lock-btn)").forEach((link) => {

    const listItem = link.closest("li");

    if (listItem) {

      listItem.remove();

    } else {

      link.remove();

    }

  });

}



function isOldRedditCommentsFeedPage() {

  const host = String(window.location.hostname || "").toLowerCase();

  if (host !== "old.reddit.com") {

    return false;

  }

  const path = String(window.location.pathname || "");

  // Match both comments pages and modqueue pages (modqueue, unmoderated, reports)

  return /^\/r\/[^/]+\/(comments\/?|about\/(modqueue|unmoderated|reports))(?:\/|$)/i.test(path);

}



function buildContextJsonUrlFromContextHref(href) {

  let fullHref = String(href || "").trim();

  

  // If href is relative, make it absolute

  if (fullHref.startsWith("/")) {

    fullHref = `https://old.reddit.com${fullHref}`;

  } else if (!fullHref.startsWith("http")) {

    fullHref = `https://old.reddit.com/${fullHref}`;

  }

  

  const parsed = parseUrl(fullHref);

  if (!parsed) {

    console.warn("[ModBox] Failed to parse URL:", fullHref);

    return "";

  }



  let pathname = String(parsed.pathname || "");

  if (!pathname) {

    return "";

  }



  pathname = pathname.replace(/\/+$/, "");

  if (!pathname.endsWith(".json")) {

    pathname = `${pathname}.json`;

  }



  const query = new URLSearchParams(parsed.search || "");

  query.set("context", query.get("context") || "3");

  query.set("raw_json", "1");

  

  return `${parsed.origin}${pathname}?${query.toString()}`;

}



function extractCommentIdFromContextHref(href) {

  const parsed = parseUrl(href);

  if (!parsed) {

    return "";

  }

  const match = parsed.pathname.match(/\/comments\/[^/]+\/(?:-\/)?([a-z0-9]{5,10})\/?$/i);

  return match?.[1] ? String(match[1]).toLowerCase() : "";

}



function isCommentLockedInDOM(commentContainer) {

  if (!(commentContainer instanceof HTMLElement)) {

    return false;

  }



  // Check for locked class or attribute

  if (commentContainer.classList.contains("locked") || commentContainer.getAttribute("data-locked") === "true") {

    return true;

  }



  // Check for lock icon or "locked" text in top-level comment area

  const entryDiv = commentContainer.querySelector(".entry");

  if (entryDiv) {

    const text = entryDiv.textContent || "";

    // Check for "[locked]" or similar indicators

    if (/\[locked\]/i.test(text)) {

      return true;

    }

  }



  // Check for missing/disabled action buttons (locked comments often have limited buttons)

  const actionButtons = commentContainer.querySelectorAll(".flat-list.buttons a");

  if (actionButtons.length > 0) {

    // Get the buttons text - if "reply" is missing, likely locked

    const buttonTexts = Array.from(actionButtons).map(btn => (btn.textContent || "").toLowerCase());

    // If the comment has buttons but no "reply" button, it might be locked

    // (locked comments typically don't have reply option)

    if (!buttonTexts.includes("reply") && actionButtons.length > 0) {

      // Additional check: archived comments also don't have reply, so also check if it seems recent

      // For now, we'll be conservative and just check for explicit locked indicators

      return false;

    }

  }



  return false;

}



function enableContextPopupForSubreddit() {

  // Enable context popup feature initialization for this subreddit

}



function bindContextPopupEvents() {

  if (contextPopupEventsBound) {

    console.log("[ModBox] Context popup events already bound");

    return;

  }

  contextPopupEventsBound = true;

  console.log("[ModBox] Binding context popup click events");



  document.addEventListener("click", (event) => {

    const target = event.target instanceof Element ? event.target : null;

    

    // Handle lock button clicks

    const lockTrigger = target?.closest(".rrw-comment-lock-btn");

    if (lockTrigger instanceof HTMLElement) {

      event.preventDefault();

      event.stopPropagation();

      handleCommentLockClick(lockTrigger);

      return;

    }

    

    const trigger = target?.closest(".rrw-comment-context-popup");

    

    if (!(trigger instanceof HTMLElement)) {

      return;

    }



    console.log("[ModBox] CLICKED context-popup pill:", trigger);

    event.preventDefault();

    event.stopPropagation();



    const contextJsonUrl = String(trigger.dataset.contextJsonUrl || "").trim();

    const commentId = String(trigger.dataset.commentId || "").trim().toLowerCase();

    console.log("[ModBox] Opening popup with URL:", contextJsonUrl);

    

    if (!contextJsonUrl) {

      console.warn("[ModBox] Context popup clicked but no URL in dataset");

      return;

    }



    void openContextPopup(contextJsonUrl, commentId, { x: event.clientX, y: event.clientY });

  }, true);

}



async function handleCommentLockClick(lockButton) {

  const fullname = String(lockButton.dataset.commentFullname || "").trim();

  const isLocked = lockButton.dataset.isLocked === "true";

  

  if (!fullname) {

    console.error("[ModBox] Lock button clicked but no fullname in dataset");

    return;

  }



  try {

    lockButton.style.opacity = "0.5";

    lockButton.style.pointerEvents = "none";



    if (isLocked) {

      // Unlock the comment

      console.log("[ModBox] Unlocking comment:", fullname);

      await unlockThingViaNativeSession(fullname);

      lockButton.textContent = "lock";

      lockButton.dataset.isLocked = "false";

      console.log("[ModBox] Comment unlocked successfully");

    } else {

      // Lock the comment

      console.log("[ModBox] Locking comment:", fullname);

      await lockThingViaNativeSession(fullname);

      lockButton.textContent = "unlock";

      lockButton.dataset.isLocked = "true";

      console.log("[ModBox] Comment locked successfully");

    }

  } catch (error) {

    console.error("[ModBox] Error toggling comment lock:", error);

    alert("Error toggling lock: " + (error.message || "Unknown error"));

  } finally {

    lockButton.style.opacity = "1";

    lockButton.style.pointerEvents = "auto";

  }

}



function bindCommentLockButtons() {

  // Add lock buttons to all comments on any page (old Reddit)

  const host = String(window.location.hostname || "").toLowerCase();

  if (host !== "old.reddit.com") {

    return;

  }



  // Find all comment containers

  const commentContainers = document.querySelectorAll(".thing.comment");

  console.log("[ModBox] Found", commentContainers.length, "comments for lock button binding");



  commentContainers.forEach((commentContainer) => {

    if (!(commentContainer instanceof HTMLElement)) {

      return;

    }



    // Find the button list for this comment

    const buttonList = commentContainer.querySelector(".flat-list.buttons");

    if (!(buttonList instanceof HTMLElement)) {

      return;

    }



    // Check if lock button already exists

    if (buttonList.querySelector(".rrw-comment-lock-btn")) {

      return;

    }



    // Get comment info

    const fullname = extractFullnameFromAttributes(commentContainer);

    if (!fullname) {

      return;

    }



    // Check if comment is locked

    const commentIsLocked = isCommentLockedInDOM(commentContainer);



    // Create lock button

    const lockLi = document.createElement("li");

    const lockLink = document.createElement("a");

    lockLink.href = "javascript:;";

    lockLink.className = "bylink rrw-comment-lock-btn";

    lockLink.textContent = commentIsLocked ? "unlock" : "lock";

    lockLink.setAttribute("data-event-action", "comment-lock");

    lockLink.dataset.commentFullname = fullname;

    lockLink.dataset.isLocked = commentIsLocked ? "true" : "false";

    lockLi.appendChild(lockLink);



    // Append to button list

    buttonList.appendChild(lockLi);

  });

}

// ------------------------------------------------------------------------------
// profile-view.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Profile View Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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

// ------------------------------------------------------------------------------
// modmail.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Modmail Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Modmail conversation viewing and reply functionality.

// Dependencies: constants.js, state.js, utilities.js, services/reddit-api.js, features/overlay.js



const MODMAIL_VIEW_DEFAULTS = {

  conversationId: "",

  conversationSubreddit: "",

  messages: [],

  participants: [],

  status: "all",          // all, archived, highlighted

  isLoading: false,

  error: "",

  replyDraft: "",

  isReplying: false,

};



// â”€â”€â”€â”€ Helper Functions â”€â”€â”€â”€



function formatModmailMessage(message) {

  if (!message) return "";

  const author = message.author?.name || "Unknown";

  const timestamp = new Date(Number(message.created_at || 0) * 1000).toLocaleDateString();

  const bodyPreview = message.body?.substring(0, 100) || "No content";

  return `From: ${author} [${timestamp}]\n${bodyPreview}`;

}



function parseModmailParticipants(conversation) {

  if (!conversation || !conversation.participants) return [];

  return Array.isArray(conversation.participants) ? conversation.participants.map((p) => ({

    name: p.name || "Unknown",

    isAuthor: p.is_author === true,

    isAdmin: p.is_admin === true,

    isMod: p.is_mod === true,

  })) : [];

}



function buildModmailReplyText(conversation, replyText) {

  // Stub: Format reply text for modmail

  return String(replyText || "").trim();

}



// â”€â”€â”€â”€ Main Functions (STUBS - Rendering Phase 2) â”€â”€â”€â”€



async function openModmailView(conversationId, subreddit) {

  // Stub: Initialize modmail view state, fetch conversation messages

  // Render modmail overlay with message thread and reply box

}



function renderModmailView() {

  // Stub: Render modmail conversation thread with messages

  // Include reply box, archive/highlight buttons

}



function closeModmailView() {

  modmailViewState = null;

  const root = document.getElementById(OVERLAY_ROOT_ID);

  if (!root) return;

  root.querySelectorAll(".rrw-modmail-view-backdrop, .rrw-modmail-view-container").forEach((el) => el.remove());

  if (!overlayState && !usernotesEditorState && !removalConfigEditorState && !inlineHistoryPopupState && !inlineModlogPopupState && !commentNukeState && !contextPopupState && !profileViewState && !root.children.length) {

    root.remove();

  }

}



async function fetchModmailConversation(subreddit, conversationId) {

  // Stub: Fetch modmail conversation thread from API

  // Returns array of messages with metadata

}



async function sendModmailReply(subreddit, conversationId, replyText) {

  // Stub: Send reply to modmail conversation

  // Returns result { success, error, messageId }

}



async function archiveModmailConversation(subreddit, conversationId) {

  // Stub: Archive modmail conversation

  // Removes from unread/active conversations

}



async function highlightModmailConversation(subreddit, conversationId, highlighted = true) {

  // Stub: Toggle modmail conversation highlight/star status

}

// ------------------------------------------------------------------------------
// modbox-link-handler.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// ModBox Link Handler Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Handles specially formatted modbox:// protocol links for executing moderation actions.

// Supports: modbox://ban?user=username&reason=message&note=usernote&durationDays=30&notetype=BAN

// Parameters:

//   - user (required): Username to ban

//   - reason (optional): Ban message/reason

//   - note (optional): User note to add (added to toolbox usernotes)

//   - notetype (optional): Type of note to add (e.g., BAN, WARNING, etc. - toolbox note type)

//   - durationDays (optional): Ban duration in days. Omit for permanent ban

//   - subreddit (optional): Subreddit to ban from (auto-detected if not provided)

// Dependencies: constants.js, utilities.js, services/reddit-api.js, features/usernotes.js



// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// URL Parsing & Validation

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



function parseModboxLink(href) {

  try {

    const url = new URL(href);

    if (url.protocol !== "modbox:") {

      return null;

    }



    const action = url.hostname.toLowerCase();

    const params = Object.fromEntries(url.searchParams);



    if (action === "ban") {

      const username = String(params.user || "").trim();

      const reason = String(params.reason || "").trim();

      const note = String(params.note || "").trim();

      const subreddit = String(params.subreddit || "").trim();

      const durationDays = params.durationDays ? parseInt(params.durationDays, 10) : undefined;

      const notetype = String(params.notetype || "").trim();



      if (!username) {

        return { error: "Missing 'user' parameter in modbox://ban link" };

      }



      // Validate durationDays if provided

      if (params.durationDays && (isNaN(durationDays) || durationDays < 0)) {

        return { error: "Invalid 'durationDays' parameter - must be a non-negative number" };

      }



      return {

        action: "ban",

        username,

        banMessage: reason || "",

        note: note || "",

        subreddit: subreddit || null,

        durationDays: durationDays,

        notetype: notetype || null,

      };

    }



    return { error: `Unknown modbox:// action: ${action}` };

  } catch (err) {

    return { error: `Failed to parse modbox link: ${getSafeErrorMessage(err)}` };

  }

}



// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Subreddit Detection

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



function detectSubredditFromURL() {

  const subreddit = parseSubredditFromPath(window.location.pathname);

  return subreddit ? normalizeSubreddit(subreddit) : null;

}



function detectSubredditFromModmail() {

  // Look for the "to" field in modmail which shows the subreddit

  // Common selectors for modmail "to" field

  const toSelectors = [

    "[data-test-id='modmail-to-field']",

    ".mc-modmail-to",

    "[class*='to'][class*='modmail']",

    ".modmail-recipient",

  ];



  for (const selector of toSelectors) {

    const element = document.querySelector(selector);

    if (element) {

      const text = element.textContent || "";

      const match = text.match(/r\/([a-zA-Z0-9_-]+)/i);

      if (match) {

        return normalizeSubreddit(match[1]);

      }

    }

  }



  // Fallback: search for "to:" text in the modmail body

  const bodyText = document.body.textContent || "";

  const match = bodyText.match(/To:\s*r\/([a-zA-Z0-9_-]+)/i);

  if (match) {

    return normalizeSubreddit(match[1]);

  }



  return null;

}



function getSubredditForBanAction() {

  // Try URL first

  let subreddit = detectSubredditFromURL();

  if (subreddit) {

    return subreddit;

  }



  // Try modmail "to" field

  subreddit = detectSubredditFromModmail();

  if (subreddit) {

    return subreddit;

  }



  return null;

}



// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Action Execution

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



async function executeModboxBanAction(params, subreddit) {

  const cleanSubreddit = normalizeSubreddit(subreddit);

  if (!cleanSubreddit) {

    throw new Error("Could not determine subreddit for ban action");

  }



  const banOptions = {

    subreddit: cleanSubreddit,

    username: params.username,

    banMessage: params.banMessage,

    note: params.note,

  };



  // Add optional duration (if undefined, results in permanent ban)

  if (params.durationDays !== undefined) {

    banOptions.durationDays = params.durationDays;

  }



  // Add optional notetype

  if (params.notetype) {

    banOptions.notetype = params.notetype;

  }



  await banUserViaNativeSession(banOptions);



  // Add toolbox usernote if note text is provided

  if (params.note) {

    try {

      await addUsernoteViaReddit(

        cleanSubreddit,

        params.username,

        params.note,

        params.notetype || "none"

      );

      console.log("[ModBox Link Handler] Usernote added for", params.username);

    } catch (err) {

      const errorMsg = getSafeErrorMessage(err);

      console.warn("[ModBox Link Handler] Failed to add usernote:", errorMsg);

      // Don't throw - ban succeeded even if usernote failed

    }

  }

}



// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// User Feedback Toast

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



function showModboxLinkToast(message, isError = false, duration = 3000) {

  const toast = document.createElement("div");

  toast.className = `rrw-modbox-link-toast ${isError ? "error" : "success"}`;

  toast.textContent = message;

  toast.style.cssText = `

    position: fixed;

    bottom: 20px;

    right: 20px;

    background: ${isError ? "#d32f2f" : "#388e3c"};

    color: white;

    padding: 12px 20px;

    border-radius: 4px;

    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

    font-size: 14px;

    z-index: 10000;

    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

    animation: fadeInOut ${duration}ms ease-in-out;

  `;



  // Add animation styles if not already present

  if (!document.getElementById("rrw-modbox-link-toast-styles")) {

    const style = document.createElement("style");

    style.id = "rrw-modbox-link-toast-styles";

    style.textContent = `

      @keyframes fadeInOut {

        0% { opacity: 0; transform: translateY(10px); }

        10% { opacity: 1; transform: translateY(0); }

        90% { opacity: 1; transform: translateY(0); }

        100% { opacity: 0; transform: translateY(10px); }

      }

    `;

    document.head.appendChild(style);

  }



  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), duration);

}



// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Link Display Text Generation

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



function generateModboxLinkDisplayText(href) {

  try {

    const parsed = parseModboxLink(href);

    if (parsed.error) {

      return "[ModBox Link]";

    }



    if (parsed.action === "ban") {

      let text = `[Ban] u/${parsed.username}`;

      if (parsed.durationDays !== undefined) {

        text += ` (${parsed.durationDays}d)`;

      }

      return text;

    }



    return "[ModBox Link]";

  } catch (err) {

    return "[ModBox Link]";

  }

}



// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Event Binding

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



function bindModboxLinkHandler() {

  document.addEventListener("click", async (event) => {

    // Find the closest link element

    const link = event.target.closest("a");

    if (!link) {

      return;

    }



    const href = link.getAttribute("href") || "";

    if (!href.startsWith("modbox://")) {

      return;

    }



    // Prevent default link behavior

    event.preventDefault();

    event.stopPropagation();



    // Parse the link

    const parsed = parseModboxLink(href);

    if (parsed.error) {

      console.error("[ModBox Link Handler]", parsed.error);

      showModboxLinkToast(parsed.error, true);

      return;

    }



    try {

      // Use subreddit from link if provided, otherwise detect it from page

      let subreddit = parsed.subreddit || getSubredditForBanAction();

      if (!subreddit) {

        throw new Error("Could not determine subreddit (not on a moderated subreddit page or valid modmail)");

      }



      // Show immediate toast that ban process has started

      showModboxLinkToast(">>> Ban process started...", false, 2000);



      // Execute the action

      if (parsed.action === "ban") {

        await executeModboxBanAction(parsed, subreddit);

        

        // Build user feedback message

        let toastMessage = `[SUCCESS] Banned u/${parsed.username} in r/${subreddit}`;

        if (parsed.durationDays !== undefined) {

          toastMessage += ` for ${parsed.durationDays} day${parsed.durationDays !== 1 ? 's' : ''}`;

        } else {

          toastMessage += " permanently";

        }

        if (parsed.notetype) {

          toastMessage += ` (${parsed.notetype})`;

        }

        if (parsed.note) {

          toastMessage += " + note";

        }

        

        showModboxLinkToast(toastMessage);

        console.log("[ModBox Link Handler] Ban action completed for", parsed.username);

      }

    } catch (err) {

      const errorMsg = getSafeErrorMessage(err);

      console.error("[ModBox Link Handler] Action failed:", errorMsg);

      showModboxLinkToast(`[ERROR] Ban failed: ${errorMsg}`, true);

    }

  }, true); // Use capture phase for early interception

}



// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Raw URL Linkification

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



const MODBOX_URL_REGEX = /modbox:\/\/[a-z]+\?[^\s<>"']+/gi;



function linkifyModboxURLsInNode(node) {

  if (node.nodeType === Node.TEXT_NODE) {

    const text = node.textContent;

    if (!MODBOX_URL_REGEX.test(text)) {

      return;

    }



    // Reset regex position

    MODBOX_URL_REGEX.lastIndex = 0;



    const fragment = document.createDocumentFragment();

    let lastIndex = 0;

    let match;



    while ((match = MODBOX_URL_REGEX.exec(text)) !== null) {

      // Add text before match

      if (match.index > lastIndex) {

        fragment.appendChild(

          document.createTextNode(text.substring(lastIndex, match.index))

        );

      }



      // Create link for match

      const link = document.createElement("a");

      link.href = match[0];

      link.title = match[0]; // Show full URL in tooltip

      link.textContent = generateModboxLinkDisplayText(match[0]);

      link.style.cssText = `

        color: #0079d3;

        text-decoration: underline;

        cursor: pointer;

        font-weight: 500;

      `;

      fragment.appendChild(link);



      lastIndex = MODBOX_URL_REGEX.lastIndex;

    }



    // Add remaining text

    if (lastIndex < text.length) {

      fragment.appendChild(document.createTextNode(text.substring(lastIndex)));

    }



    // Replace node with fragment

    node.parentNode.replaceChild(fragment, node);

  } else if (

    node.nodeType === Node.ELEMENT_NODE &&

    !["SCRIPT", "STYLE", "CODE", "PRE", "A"].includes(node.tagName)

  ) {

    // Recursively process child nodes, but skip certain elements

    for (let i = 0; i < node.childNodes.length; i++) {

      linkifyModboxURLsInNode(node.childNodes[i]);

    }

  }

}



function linkifyModboxURLsInPage() {

  // Skip if already processing

  if (document.documentElement.hasAttribute("data-rrw-linkifying")) {

    return;

  }



  document.documentElement.setAttribute("data-rrw-linkifying", "1");



  try {

    // Focus on content areas where modmail/messages appear

    const contentAreas = [

      document.querySelector("[role='main']"),

      document.querySelector(".md-container"),

      document.querySelector(".md"),

      document.querySelector(".message-body"),

      document.body,

    ].filter(Boolean);



    for (const area of contentAreas) {

      if (area) {

        linkifyModboxURLsInNode(area);

      }

    }

  } catch (err) {

    console.error("[ModBox Link Handler] Linkification error:", err);

  } finally {

    document.documentElement.removeAttribute("data-rrw-linkifying");

  }

}



function initModboxURLLinkifier() {

  // Do an initial pass on page load

  if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", linkifyModboxURLsInPage);

  } else {

    linkifyModboxURLsInPage();

  }



  // Watch for new content

  const observer = new MutationObserver((mutations) => {

    for (const mutation of mutations) {

      if (mutation.type === "childList") {

        for (const node of mutation.addedNodes) {

          if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {

            linkifyModboxURLsInNode(node);

          }

        }

      }

    }

  });



  observer.observe(document.body, {

    childList: true,

    subtree: true,

  });



  console.log("[ModBox] Raw URL linkifier initialized");

}



// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Initialization

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



function initModboxLinkHandler() {

  bindModboxLinkHandler();

  initModboxURLLinkifier();

  console.log("[ModBox] Modbox link handler initialized");

}

// ------------------------------------------------------------------------------
// link-generator.js
// ------------------------------------------------------------------------------

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Link Generator Module

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Generates specially formatted modbox:// links for moderation actions.

// Provides UI for creating ban action links with custom messages and notes.

// Dependencies: constants.js, utilities.js



const LINK_GENERATOR_ROOT_ID = "rrw-link-generator-root";



let linkGeneratorState = null;



// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Link Generation

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



function generateModboxBanLink(username, reason, note, subreddit) {

  const params = new URLSearchParams();

  params.set("user", String(username || "").trim());

  if (String(subreddit || "").trim()) {

    params.set("subreddit", String(subreddit).trim());

  }

  if (String(reason || "").trim()) {

    params.set("reason", String(reason).trim());

  }

  if (String(note || "").trim()) {

    params.set("note", String(note).trim());

  }

  return `modbox://ban?${params.toString()}`;

}



// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// UI State & Management

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



function initLinkGeneratorState() {

  return {

    username: "",

    reason: "",

    note: "",

    generatedLink: "",

    copied: false,

  };

}



function openLinkGenerator() {

  linkGeneratorState = initLinkGeneratorState();

  renderLinkGenerator();

}



function closeLinkGenerator() {

  linkGeneratorState = null;

  const root = document.getElementById(LINK_GENERATOR_ROOT_ID);

  if (root) {

    root.remove();

  }

}



// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Rendering

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



function renderLinkGenerator() {

  if (!linkGeneratorState) {

    return;

  }



  let root = document.getElementById(LINK_GENERATOR_ROOT_ID);

  if (!root) {

    root = document.createElement("div");

    root.id = LINK_GENERATOR_ROOT_ID;

    root.style.cssText = "position: fixed; inset: 0; z-index: 99999; pointer-events: none;";

    document.documentElement.appendChild(root);

  } else {

    root.style.pointerEvents = "none";

  }



  const { username, reason, note, generatedLink, copied } = linkGeneratorState;



  root.innerHTML = `

    <div class="rrw-link-gen-backdrop" data-link-gen-close="1" style="pointer-events: auto;"></div>

    <section class="rrw-link-gen-modal" role="dialog" aria-modal="true" aria-label="ModBox Link Generator" style="pointer-events: auto;">

      <header class="rrw-link-gen-header">

        <h2>Generate ModBox Ban Link</h2>

        <button type="button" class="rrw-close" data-link-gen-close="1">Close</button>

      </header>

      

      <div class="rrw-link-gen-body">

        <form id="rrw-link-gen-form">

          <label class="rrw-field">

            <span>Username to ban <span style="color: red;">*</span></span>

            <input

              type="text"

              id="rrw-link-gen-username"

              placeholder="e.g., spammer123"

              value="${escapeHtml(username)}"

              required

            />

          </label>



          <label class="rrw-field">

            <span>Ban message</span>

            <textarea

              id="rrw-link-gen-reason"

              rows="4"

              placeholder="Optional. The message shown to the banned user. Supports multiple lines."

            >${escapeHtml(reason)}</textarea>

            <small class="rrw-muted">Multi-line messages are supported. URL-encoded as %0A for newlines.</small>

          </label>



          <label class="rrw-field">

            <span>Usernote</span>

            <textarea

              id="rrw-link-gen-note"

              rows="3"

              placeholder="Optional. Internal note to save with the action."

            >${escapeHtml(note)}</textarea>

          </label>



          <button type="button" id="rrw-link-gen-generate" class="rrw-link-gen-btn-generate">Generate Link</button>

        </form>



        ${generatedLink ? `

          <div class="rrw-link-gen-result">

            <h3>Generated Link:</h3>

            <div class="rrw-link-gen-output">

              <code>${escapeHtml(generatedLink)}</code>

              <button type="button" id="rrw-link-gen-copy" class="rrw-link-gen-btn-copy">

                ${copied ? "Copied!" : "Copy to clipboard"}

              </button>

            </div>

            <p class="rrw-muted">Share this link in modmail or posts. When clicked in ModBox, it will execute the ban.</p>

          </div>

        ` : ""}

      </div>

    </section>

  `;



  // Bind events

  bindLinkGeneratorEvents();

}



function bindLinkGeneratorEvents() {

  const root = document.getElementById(LINK_GENERATOR_ROOT_ID);

  if (!root) return;



  // Close button

  root.querySelectorAll("[data-link-gen-close='1']").forEach((element) => {

    element.addEventListener("click", (event) => {

      if (

        event.currentTarget !== event.target &&

        event.currentTarget instanceof HTMLElement &&

        event.currentTarget.classList.contains("rrw-link-gen-backdrop")

      ) {

        return;

      }

      closeLinkGenerator();

    });

  });



  // Generate button

  const generateBtn = root.querySelector("#rrw-link-gen-generate");

  if (generateBtn) {

    generateBtn.addEventListener("click", (event) => {

      event.preventDefault();

      const usernameInput = root.querySelector("#rrw-link-gen-username");

      const reasonInput = root.querySelector("#rrw-link-gen-reason");

      const noteInput = root.querySelector("#rrw-link-gen-note");



      if (!(usernameInput instanceof HTMLInputElement)) {

        console.error("[Link Generator] Username input not found");

        return;

      }



      const username = usernameInput.value;

      if (!String(username).trim()) {

        usernameInput.focus();

        usernameInput.classList.add("rrw-input-error");

        setTimeout(() => usernameInput.classList.remove("rrw-input-error"), 2000);

        return;

      }



      const reason = reasonInput instanceof HTMLTextAreaElement ? reasonInput.value : "";

      const note = noteInput instanceof HTMLTextAreaElement ? noteInput.value : "";



      const link = generateModboxBanLink(username, reason, note);

      linkGeneratorState.generatedLink = link;

      linkGeneratorState.copied = false;

      renderLinkGenerator();

    });

  }



  // Copy button

  const copyBtn = root.querySelector("#rrw-link-gen-copy");

  if (copyBtn) {

    copyBtn.addEventListener("click", async (event) => {

      event.preventDefault();

      try {

        if (navigator.clipboard && navigator.clipboard.writeText) {

          await navigator.clipboard.writeText(linkGeneratorState.generatedLink);

        } else {

          // Fallback for older browsers

          const textarea = document.createElement("textarea");

          textarea.value = linkGeneratorState.generatedLink;

          document.body.appendChild(textarea);

          textarea.select();

          document.execCommand("copy");

          document.body.removeChild(textarea);

        }

        linkGeneratorState.copied = true;

        renderLinkGenerator();

        setTimeout(() => {

          if (linkGeneratorState) {

            linkGeneratorState.copied = false;

            renderLinkGenerator();

          }

        }, 2000);

      } catch (err) {

        console.error("[Link Generator] Copy failed:", err);

      }

    });

  }



  // Input updates

  const usernameInput = root.querySelector("#rrw-link-gen-username");

  const reasonInput = root.querySelector("#rrw-link-gen-reason");

  const noteInput = root.querySelector("#rrw-link-gen-note");



  if (usernameInput instanceof HTMLInputElement) {

    usernameInput.addEventListener("input", () => {

      if (linkGeneratorState) {

        linkGeneratorState.username = usernameInput.value;

        linkGeneratorState.generatedLink = "";

      }

    });

  }



  if (reasonInput instanceof HTMLTextAreaElement) {

    reasonInput.addEventListener("input", () => {

      if (linkGeneratorState) {

        linkGeneratorState.reason = reasonInput.value;

        linkGeneratorState.generatedLink = "";

      }

    });

  }



  if (noteInput instanceof HTMLTextAreaElement) {

    noteInput.addEventListener("input", () => {

      if (linkGeneratorState) {

        linkGeneratorState.note = noteInput.value;

        linkGeneratorState.generatedLink = "";

      }

    });

  }

}



// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Styles

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



function injectLinkGeneratorStyles() {

  if (document.getElementById("rrw-link-gen-styles")) {

    return;

  }



  const style = document.createElement("style");

  style.id = "rrw-link-gen-styles";

  style.textContent = `

    .rrw-link-gen-backdrop {

      position: fixed;

      top: 0;

      left: 0;

      right: 0;

      bottom: 0;

      background: rgba(0, 0, 0, 0.5);

      z-index: 1;

      cursor: pointer;

    }



    .rrw-link-gen-modal {

      position: fixed;

      top: 50%;

      left: 50%;

      transform: translate(-50%, -50%);

      background: var(--rrw-bg, #fff);

      color: var(--rrw-text, #000);

      border: 1px solid var(--rrw-border, #ccc);

      border-radius: 8px;

      max-width: 500px;

      width: 90%;

      max-height: 80vh;

      overflow: auto;

      z-index: 2;

      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

    }



    .rrw-link-gen-header {

      display: flex;

      align-items: center;

      justify-content: space-between;

      padding: 12px 16px;

      border-bottom: 1px solid var(--rrw-border, #eee);

      background: var(--rrw-bg-alt, #f8f9fa);

    }



    .rrw-link-gen-header h2 {

      margin: 0;

      font-size: 16px;

      font-weight: 600;

    }



    .rrw-link-gen-body {

      padding: 16px;

    }



    .rrw-link-gen-body .rrw-field {

      margin-bottom: 16px;

    }



    .rrw-link-gen-body .rrw-field span {

      display: block;

      margin-bottom: 6px;

      font-weight: 500;

      font-size: 13px;

    }



    .rrw-link-gen-body .rrw-field input,

    .rrw-link-gen-body .rrw-field textarea {

      width: 100%;

      padding: 8px 12px;

      border: 1px solid var(--rrw-border, #ccc);

      border-radius: 4px;

      font-family: inherit;

      font-size: 13px;

      background: var(--rrw-input-bg, #fff);

      color: var(--rrw-text);

      box-sizing: border-box;

    }



    .rrw-link-gen-body .rrw-field input:focus,

    .rrw-link-gen-body .rrw-field textarea:focus {

      outline: none;

      border-color: #0079d3;

      box-shadow: 0 0 0 2px rgba(0, 121, 211, 0.1);

    }



    .rrw-link-gen-body .rrw-field input.rrw-input-error {

      border-color: #d32f2f;

      background-color: rgba(211, 47, 47, 0.05);

    }



    .rrw-link-gen-body small {

      display: block;

      margin-top: 4px;

      font-size: 12px;

    }



    .rrw-link-gen-btn-generate {

      width: 100%;

      padding: 10px 16px;

      background: #0079d3;

      color: white;

      border: none;

      border-radius: 4px;

      font-weight: 600;

      cursor: pointer;

      font-size: 13px;

      transition: background 0.2s;

    }



    .rrw-link-gen-btn-generate:hover {

      background: #0066a8;

    }



    .rrw-link-gen-result {

      margin-top: 20px;

      padding-top: 20px;

      border-top: 1px solid var(--rrw-border, #eee);

    }



    .rrw-link-gen-result h3 {

      margin: 0 0 12px 0;

      font-size: 14px;

      font-weight: 600;

    }



    .rrw-link-gen-output {

      display: flex;

      gap: 8px;

      align-items: flex-start;

      margin-bottom: 12px;

    }



    .rrw-link-gen-output code {

      flex: 1;

      padding: 10px 12px;

      background: var(--rrw-bg-alt, #f0f1f2);

      border: 1px solid var(--rrw-border, #ccc);

      border-radius: 4px;

      font-family: "Courier New", monospace;

      font-size: 12px;

      word-break: break-all;

      white-space: pre-wrap;

    }



    .rrw-link-gen-btn-copy {

      padding: 10px 16px;

      background: #555;

      color: white;

      border: none;

      border-radius: 4px;

      cursor: pointer;

      font-size: 12px;

      font-weight: 600;

      white-space: nowrap;

      transition: background 0.2s;

    }



    .rrw-link-gen-btn-copy:hover {

      background: #333;

    }



    .rrw-link-gen-result .rrw-muted {

      margin: 0;

      font-size: 12px;

    }

  `;



  document.head.appendChild(style);

}



// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Initialization

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



function initLinkGenerator() {

  injectLinkGeneratorStyles();

  console.log("[ModBox] Link generator initialized");

}

// ------------------------------------------------------------------------------
// main.js
// ------------------------------------------------------------------------------

// ============================================================================

// EXTENSION INITIALIZATION

// ============================================================================

// This is the main entry point that initializes all extension functionality.

// It should be included LAST in the build, after all other modules.



function start() {

  console.log("[ModBox] ===== EXTENSION START =====");

  console.log("[ModBox] Extension loaded and initializing...");

  markRrwSiteHost();

  applyThemeToDocument();

  bindThemeObservers();

  injectStyles();

  refreshPageTargetHints();

  bindNativeRemoveInterceptor();

  void loadNativeInterceptPreference();

  initModboxLinkHandler();

  initLinkGenerator();



  // Pointer-down guard: track when the user is mid-click so that full DOM

  // replacements in renderOverlay / renderRemovalConfigEditor / renderQueueBar

  // can be deferred rather than destroying the button node being clicked.

  document.addEventListener("pointerdown", () => { isPointerDown = true; }, true);

  document.addEventListener("pointerup", () => {

    isPointerDown = false;

    if (deferredRenders.size > 0) {

      const pending = new Set(deferredRenders);

      deferredRenders.clear();

      requestAnimationFrame(() => {

        if (pending.has("overlay")) renderOverlay();

        if (pending.has("config_editor")) renderRemovalConfigEditor();

        if (pending.has("queue_bar")) renderQueueBar(queueBarLastState);

      });

    }

  }, true);



  void loadContextPopupPreference().then(() => {

    bindOldRedditContextPopupLinks();

    bindCommentLockButtons();

  });

  void loadThemePreference();

  void loadCommentNukeIgnoreDistinguishedPreference();

  void loadHistoryButtonPreference();

  void loadCommentNukeButtonPreference();

  void loadContextPopupPosition();

  // Initialize canned replies injector to add buttons to reply forms

  void initCannedRepliesInjector();

  // Prioritize queue bar on page reload: initialize immediately so counts and links

  // appear without waiting for idle time or timeout fallback.

  void initQueueBar();

  // Bind queue tools immediately on queue pages so bulk actions toolbar appears

  const isQueuePage = /\/about\/(modqueue|unmoderated|reports)(?:\/|$)/i.test(String(window.location.pathname || "")) ||

                      /\/mod\/\w+\/queue(?:\/|$)/i.test(String(window.location.pathname || ""));

  console.log("[ModBox] Checking if this is a queue page:", isQueuePage);

  if (isQueuePage) {

    console.log("[ModBox] Calling bindQueueToolsFeatures on page load");

    bindQueueToolsFeatures();

    console.log("[ModBox] Calling bindQueueModlogDisplay on page load");

    bindQueueModlogDisplay();

  }

  bindContextPopupEvents();

  const pageSubreddit = normalizeSubreddit(parseSubredditFromPath(window.location.pathname));

  const initAllowedSubreddits = ensureAllowedLaunchSubredditsLoaded();



  // Do an immediate pass so the page starts progressively rather than waiting

  // on moderated-subreddit discovery before any bind work can happen.

  scheduleVisibleContainerBind({ fullScan: true });



  if (ext.storage?.onChanged) {

    ext.storage.onChanged.addListener((changes, areaName) => {

      if (areaName === "sync") {

        if (changes?.[INTERCEPT_NATIVE_REMOVE_KEY]) {

          const nextValue = changes[INTERCEPT_NATIVE_REMOVE_KEY].newValue;

          interceptNativeRemoveEnabled = typeof nextValue === "boolean" ? nextValue : true;

        }



        if (changes?.[COMMENT_NUKE_IGNORE_DISTINGUISHED_KEY]) {

          const nextValue = changes[COMMENT_NUKE_IGNORE_DISTINGUISHED_KEY].newValue;

          commentNukeIgnoreDistinguished = typeof nextValue === "boolean" ? nextValue : false;

        }



        if (

          changes?.[QUEUE_BAR_ENABLED_KEY] ||

          changes?.[QUEUE_BAR_SCOPE_KEY] ||

          changes?.[QUEUE_BAR_FIXED_SUBREDDIT_KEY] ||

          changes?.[QUEUE_BAR_LINK_HOST_KEY] ||

          changes?.[QUEUE_BAR_USE_OLD_REDDIT_KEY] ||

          changes?.[QUEUE_BAR_OPEN_IN_NEW_TAB_KEY] ||

          changes?.[QUEUE_BAR_POSITION_KEY] ||

          changes?.[CONTEXT_POPUP_ENABLED_KEY] ||

          changes?.[THEME_MODE_KEY] ||

          changes?.buttonVisibilityScope

        ) {

          if (changes?.[QUEUE_BAR_POSITION_KEY]) {

            queueBarPosition = String(changes[QUEUE_BAR_POSITION_KEY].newValue || "bottom_right");

          }

          panelSettingsPromise = null;

          clearQueueBarContextCache();

          allowedLaunchSubredditsLoaded = false;

          allowedLaunchSubredditsPromise = null;



          if (changes?.[CONTEXT_POPUP_ENABLED_KEY]) {

            const nextValue = changes[CONTEXT_POPUP_ENABLED_KEY].newValue;

            contextPopupFeatureEnabled = typeof nextValue === "boolean" ? nextValue : true;

            if (!contextPopupFeatureEnabled) {

              clearOldRedditContextPopupLinks();

              closeContextPopup();

            } else {

              bindOldRedditContextPopupLinks();

            }

          }



          if (changes?.[THEME_MODE_KEY]) {

            currentThemeMode = normalizeThemeMode(changes[THEME_MODE_KEY].newValue, "auto");

            applyThemeToDocument();

          }



          void ensureAllowedLaunchSubredditsLoaded();

          void refreshQueueBar(true);

        }

        return;

      }



      if (areaName === "local") {

        if (changes?.[QUEUE_BAR_COLLAPSED_KEY]) {

          queueBarCollapsed = Boolean(changes[QUEUE_BAR_COLLAPSED_KEY].newValue);

          if (queueBarLastState?.enabled) {

            renderQueueBar(queueBarLastState);

          }

        }



        if (changes?.[CONTEXT_POPUP_POSITION_KEY]) {

          contextPopupStoredPosition = normalizeContextPopupPosition(changes[CONTEXT_POPUP_POSITION_KEY].newValue);

          if (contextPopupState && contextPopupStoredPosition?.custom) {

            contextPopupState.position = { ...contextPopupStoredPosition };

            contextPopupState.customPosition = true;

            renderContextPopup();

          }

        }

      }

    });

  }



  void initAllowedSubreddits.finally(() => {

    scheduleVisibleContainerBind({ fullScan: true });



    const observer = new MutationObserver((records) => {

      scheduleVisibleContainerBind({ mutationRecords: records });

    });



    observer.observe(document.documentElement, {

      childList: true,

      subtree: true

    });

  });

}



// Start the extension

start();
