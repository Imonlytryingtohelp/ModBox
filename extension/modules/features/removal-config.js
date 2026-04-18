// ════════════════════════════════════════════════════════════════════════════════════════════════
// Removal Config Editor Module - COMPREHENSIVE IMPLEMENTATION
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Full removal reason configuration editor with wiki I/O, quick actions, playbooks.
// Dependencies: constants.js, state.js, utilities.js, services/reddit-api.js, 
//               services/wiki-loader.js, features/overlay.js, features/usernotes.js

// ──── Normalization & Utility Functions ────

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

// ──── State Management Functions ────

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

// ──── Quick Actions Helper Functions (for removal config editor) ────

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

// ──── Playbooks Helper Functions (for removal config editor) ────

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

// ──── Wiki Loading Functions ────

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

// ──── Main Editor Initialization & Rendering ────

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

// ──── Toolbox Body Parser & Serializer (for removal-config-editor) ────

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

// ──── Removal Message Building & Preview Functions ────

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
