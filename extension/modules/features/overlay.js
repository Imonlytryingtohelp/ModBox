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
          ${!quickActionsOnlyMode ? `<button type="button" class="rrw-refresh-btn" id="rrw-edit-config" title="Open ModBox settings editor" ${resolved?.subreddit ? "" : "disabled"}>Edit</button>
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


