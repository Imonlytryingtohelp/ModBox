// ════════════════════════════════════════════════════════════════════════════════════════════════
// Usernotes Feature Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Handles subreddit usernotes: fetching, caching, editing, and inline rendering.
// Supports both Toolbox usernotes (wiki-based) and native Reddit modnotes with deduplication.
// Dependencies: reddit-api.js (requestJsonViaBackground, native modnotes functions),
// wiki-loader.js (load/save functions), utilities.js (normalizeSubreddit, escapeHtml),
// constants.js (OVERLAY_ROOT_ID, storage keys)

// ──── Usernote Type Metadata Caching ────

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

// ──── Native Modnotes Integration & Deduplication ────

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

// ──── Usernote Document Merging ────

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

// ──── Toolbox Usernote Type Fetching ────

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

// ──── Current User Detection ────

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

// ──── Usernote Fetching and CRUD ────

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

// ──── Dual-System Write Operations (Toolbox + Native) ────

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

// ──── Usernote Editor UI ────

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

      // Show delete confirmation with system selection
      const shouldDelete = await showUsernotesDeleteConfirmation(noteSource);
      console.log("[ModBox] Delete confirmation result:", shouldDelete);
      if (shouldDelete === null) {
        console.log("[ModBox] Delete cancelled by user");
        return; // User cancelled
      }

      try {
        usernotesEditorState.saving = true;
        usernotesEditorState.error = "";
        usernotesEditorState.status = "";
        renderUsernotesEditor();

        console.log("[ModBox] Calling deleteUsernoteViaBothSystems with noteId:", noteId, "source:", shouldDelete);
        // Use dual-delete function for merged notes, pass source parameter
        const deleteResults = await deleteUsernoteViaBothSystems(
          usernotesEditorState.subreddit,
          usernotesEditorState.username,
          noteId,
          shouldDelete, // null for both, "Modbox" for Toolbox only, "reddit" for native only
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

        // Show status about what was deleted
        const deletedFrom = [];
        if (deleteResults.toolbox.success) deletedFrom.push("Toolbox");
        if (deleteResults.native.success) deletedFrom.push("native");
        usernotesEditorState.status = deletedFrom.length > 0 
          ? `Note deleted from: ${deletedFrom.join(", ")}.`
          : "Note deleted.";
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

// ──── Inline Usernote Chips ────

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

// ──── Color and Rendering ────

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

// ──── Usernote Cache ────

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
