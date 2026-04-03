// ════════════════════════════════════════════════════════════════════════════════════════════════
// Context Popup Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
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

// ──── Helper Functions ────

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

// ──── Main Functions ────

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
      const permalink = data.permalink ? `https://www.reddit.com${data.permalink}` : "";
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

