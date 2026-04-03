// ════════════════════════════════════════════════════════════════════════════════════════════════
// Usernotes Feature Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Handles subreddit usernotes: fetching, caching, editing, and inline rendering.
// Dependencies: reddit-api.js (requestJsonViaBackground), wiki-loader.js (load/save functions),
// utilities.js (normalizeSubreddit, escapeHtml), constants.js (OVERLAY_ROOT_ID, storage keys)

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
      const modName = String(note.mod || "unknown");
      const dateText = Number(note.time) ? new Date(Number(note.time)).toLocaleString() : "unknown date";
      return `
        <article class="rrw-usernote-row">
          <div class="rrw-usernote-meta">${escapeHtml(dateText)} &middot; by u/${escapeHtml(modName)}</div>
          <div class="rrw-usernote-type-wrap">${renderNoteTypeBadge(noteType, "rrw-note-type-pill", typeMeta)}</div>
          ${noteLink ? `<a class="rrw-usernote-link" href="${escapeHtml(noteLink)}" target="_blank" rel="noreferrer">Source: ${escapeHtml(noteLink)}</a>` : ""}
          <textarea data-un-note-id="${escapeHtml(noteId)}" rows="3">${escapeHtml(noteText)}</textarea>
          <label class="rrw-field">
            <span>Type</span>
            <select data-un-note-type-id="${escapeHtml(noteId)}">
              ${noteTypes
                .map((value) => {
                  const label = String(typeMeta.labels[String(value).toLowerCase()] || value);
                  return `<option value="${escapeHtml(value)}" ${value === noteType ? "selected" : ""}>${escapeHtml(label)}</option>`;
                })
                .join("")}
            </select>
          </label>
          <div class="rrw-usernote-row-actions">
            <button type="button" class="rrw-btn rrw-btn-secondary" data-un-save-id="${escapeHtml(noteId)}" ${state.saving ? "disabled" : ""}>Save note</button>
            <button type="button" class="rrw-btn rrw-btn-danger" data-un-delete-id="${escapeHtml(noteId)}" ${state.saving ? "disabled" : ""}>Delete note</button>
          </div>
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

  modal.querySelectorAll("[data-un-save-id]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      if (!usernotesEditorState) {
        return;
      }
      const noteId = event.currentTarget.getAttribute("data-un-save-id");
      if (!noteId) {
        return;
      }
      const textarea = modal.querySelector(`[data-un-note-id="${CSS.escape(noteId)}"]`);
      const typeSelect = modal.querySelector(`[data-un-note-type-id="${CSS.escape(noteId)}"]`);
      const nextText = String(textarea?.value || "").trim();
      const selectedType = String(typeSelect?.value || "none").trim() || "none";
      if (!nextText) {
        usernotesEditorState.error = "Note text cannot be empty.";
        renderUsernotesEditor();
        return;
      }

      try {
        usernotesEditorState.saving = true;
        usernotesEditorState.error = "";
        usernotesEditorState.status = "";
        renderUsernotesEditor();

        const updated = await updateUsernoteViaReddit(
          usernotesEditorState.subreddit,
          usernotesEditorState.username,
          noteId,
          nextText,
          selectedType,
        );
        clearUsernotesCache(usernotesEditorState.subreddit, usernotesEditorState.username);
        usernotesEditorState.notes = Array.isArray(updated?.notes) ? updated.notes : [];
        usernotesEditorState.noteTypes = Array.isArray(updated?.note_types) ? updated.note_types : ["none"];
        usernotesEditorState.noteTypeColors = updated?.note_type_colors && typeof updated.note_type_colors === "object" ? updated.note_type_colors : {};
        usernotesEditorState.noteTypeLabels = updated?.note_type_labels && typeof updated.note_type_labels === "object" ? updated.note_type_labels : {};
        usernotesEditorState.status = "Note updated.";
        if (typeof usernotesEditorState.onUpdated === "function") {
          usernotesEditorState.onUpdated(updated);
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
  });

  modal.querySelectorAll("[data-un-delete-id]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      if (!usernotesEditorState) {
        return;
      }

      const noteId = event.currentTarget.getAttribute("data-un-delete-id");
      if (!noteId) {
        return;
      }

      const confirmed = window.confirm("Delete this usernote? This cannot be undone.");
      if (!confirmed) {
        return;
      }

      try {
        usernotesEditorState.saving = true;
        usernotesEditorState.error = "";
        usernotesEditorState.status = "";
        renderUsernotesEditor();

        const updated = await deleteUsernoteViaReddit(
          usernotesEditorState.subreddit,
          usernotesEditorState.username,
          noteId,
        );

        clearUsernotesCache(usernotesEditorState.subreddit, usernotesEditorState.username);
        usernotesEditorState.notes = Array.isArray(updated?.notes) ? updated.notes : [];
        usernotesEditorState.noteTypes = Array.isArray(updated?.note_types) ? updated.note_types : ["none"];
        usernotesEditorState.noteTypeColors = updated?.note_type_colors && typeof updated.note_type_colors === "object" ? updated.note_type_colors : {};
        usernotesEditorState.noteTypeLabels = updated?.note_type_labels && typeof updated.note_type_labels === "object" ? updated.note_type_labels : {};
        usernotesEditorState.status = "Note deleted.";
        if (typeof usernotesEditorState.onUpdated === "function") {
          usernotesEditorState.onUpdated(updated);
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

        const updated = await addUsernoteViaReddit(
          usernotesEditorState.subreddit,
          usernotesEditorState.username,
          noteText,
          selectedType,
          includeSourceLink ? usernotesEditorState.link || "" : "",
        );
        clearUsernotesCache(usernotesEditorState.subreddit, usernotesEditorState.username);
        usernotesEditorState.notes = Array.isArray(updated?.notes) ? updated.notes : [];
        usernotesEditorState.noteTypes = Array.isArray(updated?.note_types) ? updated.note_types : ["none"];
        usernotesEditorState.noteTypeColors = updated?.note_type_colors && typeof updated.note_type_colors === "object" ? updated.note_type_colors : {};
        usernotesEditorState.noteTypeLabels = updated?.note_type_labels && typeof updated.note_type_labels === "object" ? updated.note_type_labels : {};
        usernotesEditorState.status = "Note added.";
        if (typeof usernotesEditorState.onUpdated === "function") {
          usernotesEditorState.onUpdated(updated);
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
    const data = await fetchUsernotes(stateRef.subreddit, stateRef.username, true);
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
      latestPayload = await fetchUsernotes(cleanSubreddit, cleanUser, true);
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
    const payload = await fetchUsernotes(subreddit, username, false);
    renderInlineUsernoteChip(chip, payload);
    chip.removeEventListener("click", handleChipClick);
    chip.addEventListener("click", handleChipClick, false);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    // Suppress permission errors (MAY_NOT_VIEW, Forbidden) - these are expected when user isn't a mod
    const isPermissionError = errorMsg.includes("Forbidden") || errorMsg.includes("MAY_NOT_VIEW");
    if (!isPermissionError) {
      console.error("[ModBox] Failed to load usernotes:", error);
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
