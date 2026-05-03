// ════════════════════════════════════════════════════════════════════════════════════════════════
// Update Checker Feature Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Checks for extension updates from the ModBox wiki page and manages update notifications.
// Dependencies: constants.js, state.js, utilities.js, services/reddit-api.js

// ──── Update Info Caching ────

let updateCheckCache = null;
let updateCheckFetchedAt = 0;
let currentInstalledVersion = null;

// ──── Version Parsing & Comparison ────

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

// ──── Wiki Page Parsing ────

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

// ──── Update Check & Storage ────

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

// ──── Update Notification Management ────

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

// ──── Public Interface ────

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
