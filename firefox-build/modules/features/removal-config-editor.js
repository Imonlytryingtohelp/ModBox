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

  // eslint-disable-next-line no-unsanitized/property
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
                          <span>Mod note (optional, visible only to mods in ban list — supports {author}, {subreddit}, {kind}, {permalink})</span>
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
      if (["auto_close_on_remove", "intercept_native_remove", "context_popup_enabled", "queue_bar_open_in_new_tab", "queue_bar_use_old_reddit", "comment_nuke_ignore_distinguished"].includes(key)) {
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
        const themeMode = normalizeThemeMode(s.theme_mode, "auto");
        const ignoreDistinguished = typeof s.comment_nuke_ignore_distinguished === "boolean" ? s.comment_nuke_ignore_distinguished : false;
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
          [THEME_MODE_KEY]: themeMode,
          [COMMENT_NUKE_IGNORE_DISTINGUISHED_KEY]: ignoreDistinguished,
          [CANNED_REPLIES_WIKI_URL_KEY]: cannedRepliesWikiUrl,
        });

        // Clear the cache so getPanelSettingsCached will fetch fresh settings
        panelSettingsPromise = null;
        clearQueueBarContextCache();

        await applyExtensionSettingsToRuntime({
          intercept_native_remove: interceptNative,
          context_popup_enabled: contextPopup,
          theme_mode: themeMode,
          comment_nuke_ignore_distinguished: ignoreDistinguished,
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
