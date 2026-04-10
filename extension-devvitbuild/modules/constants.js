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
const QUEUE_BAR_ENABLED_KEY = "queueBarEnabled";
const QUEUE_BAR_SCOPE_KEY = "queueBarScope";
const QUEUE_BAR_LINK_HOST_KEY = "queueBarLinkHost";
const QUEUE_BAR_USE_OLD_REDDIT_KEY = "queueBarUseOldReddit";
const QUEUE_BAR_OPEN_IN_NEW_TAB_KEY = "queueBarOpenInNewTab";
const QUEUE_BAR_FIXED_SUBREDDIT_KEY = "queueBarFixedSubreddit";
const QUEUE_BAR_COLLAPSED_KEY = "queueBarCollapsed";
const CONTEXT_POPUP_POSITION_KEY = "contextPopupPosition";
const THEME_MODE_KEY = "themeMode";
const LAST_SEND_MODE_KEY = "lastSendMode";
const COMMENT_NUKE_IGNORE_DISTINGUISHED_KEY = "commentNukeIgnoreDistinguished";
const EXTENSION_SETTINGS_WIKI_PAGE_KEY = "extensionSettingsWikiPage";

// ============================================================================
// WIKI PAGE REFERENCES & SCHEMAS
// ============================================================================
const REMOVAL_REASONS_WIKI_PAGE = "modbox/removalreasons";
const REMOVAL_REASONS_WIKI_SCHEMA = "ModBox/removal-reasons/v1";
const QUICK_ACTIONS_WIKI_PAGE = "modbox/quickactions";
const QUICK_ACTIONS_WIKI_SCHEMA = "ModBox/quick-actions/v1";
const PLAYBOOKS_WIKI_PAGE = "modbox/playbooks";
const PLAYBOOKS_WIKI_SCHEMA = "ModBox/playbooks/v1";
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
