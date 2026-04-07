// ════════════════════════════════════════════════════════════════════════════════════════════════
// Feature Function Stubs Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Minimal placeholder implementations for features not yet extracted.
// Dependencies: constants.js, state.js, utilities.js

// ──── Removal Config Caching (In-Memory) ────
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

// ──── Stub Helper Functions (used by multiple modules) ----

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
