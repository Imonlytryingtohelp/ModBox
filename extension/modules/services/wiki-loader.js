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
  const cleanSubreddit = normalizeSubreddit(subreddit);
  if (!cleanSubreddit) {
    throw new Error("Subreddit is required to load canned replies");
  }

  const cached = getInMemoryCannedReplies(cleanSubreddit);
  if (cached) {
    return cached;
  }

  let wikiPayload;
  let wikiPath = `/r/${encodeURIComponent(cleanSubreddit)}/wiki/${CANNED_REPLIES_WIKI_PAGE}.json?raw_json=1`;
  
  // Try to get wikiUrl from chrome storage
  try {
    const data = await new Promise(resolve => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get([CANNED_REPLIES_WIKI_URL_KEY, 'wikiUrl'], resolve);
      } else {
        resolve({});
      }
    });
    
    // Check both ModBox and original CannedReplys storage keys
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
      
      // Remove trailing slash
      path = path.replace(/\/$/, '');
      
      wikiPath = path + '.json?raw_json=1';
      console.log("[ModBox] Using configured canned replies URL:", wikiPath);
    }
  } catch (err) {
    console.log("[ModBox] Could not read canned replies URL from storage:", err);
  }
  
  console.log("[ModBox] Loading canned replies from:", wikiPath);
  
  try {
    wikiPayload = await requestJsonViaBackground(wikiPath, { oauth: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/PAGE_NOT_CREATED|WIKI_DISABLED|404|NOT_FOUND|NO_WIKI_PAGE/i.test(message)) {
      return buildDefaultCannedRepliesConfig(cleanSubreddit);
    }
    throw error;
  }

  const raw = String(wikiPayload?.data?.content_md || "").trim();
  if (!raw) {
    return buildDefaultCannedRepliesConfig(cleanSubreddit);
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
          subreddit: cleanSubreddit,
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

  const normalized = normalizeCannedRepliesDoc(doc, cleanSubreddit);
  setInMemoryCannedReplies(cleanSubreddit, normalized);
  return normalized;
}

async function saveCannedRepliesToWiki(subreddit, config, reason) {
  const cleanSubreddit = normalizeSubreddit(subreddit);
  if (!cleanSubreddit) {
    throw new Error("Subreddit is required to save canned replies");
  }

  const normalized = normalizeCannedRepliesDoc(config, cleanSubreddit);
  const payload = JSON.stringify(normalized, null, 2);
  const params = new URLSearchParams();
  params.set("content", payload);
  params.set("page", CANNED_REPLIES_WIKI_PAGE);
  params.set("reason", String(reason || "updated canned replies via ModBox"));
  await redditFormRequest(`/r/${encodeURIComponent(cleanSubreddit)}/api/wiki/edit`, params);
  setInMemoryCannedReplies(cleanSubreddit, normalized);
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
