// ════════════════════════════════════════════════════════════════════════════════════════════════
// Core UI Initialization Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Provides core initialization functions needed by main.js.
// Dependencies: constants.js, state.js, utilities.js

// ──── Site Detection ────

function markRrwSiteHost() {
  const host = String(window.location.hostname || "").toLowerCase();
  const site = host === "old.reddit.com" ? "old" : host === "sh.reddit.com" ? "sh" : "www";
  document.documentElement.setAttribute("data-rrw-site", site);
}

// ──── Page Target Detection ────

function parsePostIdFromPath(pathname) {
  const match = String(pathname || "").match(/\/r\/[^/]+\/comments\/([a-z0-9]{6})/i);
  return match ? match[1] : null;
}

function refreshPageTargetHints() {
  const postId = parsePostIdFromPath(window.location.pathname);
  if (postId) {
    lastInteractedTarget = `t3_${postId}`;
    lastInteractedAt = Date.now();
  }
}

// ──── Helper Utilities ────

function findClosestActionContainer(element) {
  if (!(element instanceof HTMLElement)) {
    return null;
  }
  // Try to find shreddit-post first, then shreddit-comment
  let closest = element.closest("shreddit-post");
  if (closest) return closest;
  
  closest = element.closest("shreddit-comment");
  if (closest) return closest;
  
  return element.closest("article, .thing.link, .thing.comment, [data-testid='post-container']");
}

function pickTargetForContainer(container) {
  if (!(container instanceof HTMLElement)) {
    return null;
  }

  const isPost = 
    container.tagName === "SHREDDIT-POST" || 
    container.classList.contains("link") ||
    container.getAttribute("data-testid") === "post-container";
  
  const isComment = 
    container.tagName === "SHREDDIT-COMMENT" ||
    container.classList.contains("comment");

  // **PRIORITY 1**: Use the element's own attributes as-is if they look valid
  const directId = container.getAttribute("id");
  if (directId && directId.includes("_") && (directId.startsWith("t1_") || directId.startsWith("t3_"))) {
    return directId;
  }

  const dataFullname = container.getAttribute("data-fullname");
  if (dataFullname && dataFullname.includes("_") && (dataFullname.startsWith("t1_") || dataFullname.startsWith("t3_"))) {
    return dataFullname;
  }

  // **PRIORITY 2**: Check other direct attributes
  const otherDirectAttrs = [
    container.getAttribute("data-post-id"),
    container.getAttribute("data-id"),
    container.getAttribute("data-thing-id")
  ];

  for (const attr of otherDirectAttrs) {
    if (attr && attr.includes("_") && (attr.startsWith("t1_") || attr.startsWith("t3_"))) {
      return attr;
    }
  }

  // **PRIORITY 3**: Extract from links (fallback only)
  const extractPostIdFromUrl = (url) => {
    if (!url) return null;
    const match = url.match(/\/comments\/([a-z0-9]{5,10})/i);
    return match ? match[1] : null;
  };

  const permalinkSelectors = [
    "a[data-testid='post_title']",
    "a[data-click-id='body']",
    "a[href*='/comments/']",
    "[slot='title'] a",
    ".post-title a",
    "h3 a, h2 a"
  ];

  for (const selector of permalinkSelectors) {
    const permalinkEl = container.querySelector(selector);
    if (permalinkEl instanceof HTMLElement) {
      const href = permalinkEl.getAttribute("href") || "";
      const postId = extractPostIdFromUrl(href);
      if (postId) {
        const result = isComment ? `t1_${postId}` : `t3_${postId}`;
        return result;
      }
    }
  }

  const anyLink = container.querySelector("a[href*='/comments/']");
  if (anyLink instanceof HTMLElement) {
    const href = anyLink.getAttribute("href") || "";
    const postId = extractPostIdFromUrl(href);
    if (postId) {
      const result = isComment ? `t1_${postId}` : `t3_${postId}`;
      return result;
    }
  }

  return null;
}

function resolveContainerSubreddit(container) {
  if (!(container instanceof HTMLElement)) {
    return null;
  }
  const subredditAttr = container.getAttribute("data-subreddit");
  if (subredditAttr) {
    return subredditAttr;
  }
  const subredditLink = container.querySelector("a[href*='/r/'], [data-testid*='subreddit']");
  if (subredditLink instanceof HTMLElement) {
    const href = subredditLink.getAttribute("href") || "";
    const match = href.match(/\/r\/([a-zA-Z0-9_-]+)/);
    if (match) {
      return match[1];
    }
  }
  return null;
}

function resolveTargetFromNativeControl(control) {
  if (!(control instanceof HTMLElement)) {
    return null;
  }
  const stored = control.getAttribute("data-rrw-target");
  if (stored) {
    return stored;
  }
  const container = control.closest("shreddit-post, shreddit-comment, article, .thing.link, .thing.comment, [data-testid='post-container']");
  if (container instanceof HTMLElement) {
    return pickTargetForContainer(container);
  }
  return null;
}

function isAllowedLaunchSubreddit(subreddit) {
  if (!subreddit) {
    return false;
  }
  const clean = normalizeSubreddit(subreddit);
  if (!clean) {
    return false;
  }
  if (allowedLaunchSubreddits instanceof Set) {
    // If the set is empty (subreddit list not loaded yet), allow it
    if (allowedLaunchSubreddits.size === 0) {
      return true;
    }
    return allowedLaunchSubreddits.has(clean.toLowerCase());
  }
  return true;
}

// ──── Native Remove Control Detection ────

function isNativeRemoveControl(control) {
  if (!(control instanceof HTMLElement)) {
    return false;
  }

  if (control.closest(`#${OVERLAY_ROOT_ID}`)) {
    return false;
  }

  if (control.classList.contains(BUTTON_CLASS) || control.closest(`.${BUTTON_CLASS}`)) {
    return false;
  }

  const tag = String(control.tagName || "").toLowerCase();
  if (tag !== "button" && tag !== "a") {
    return false;
  }

  const textContent = (control.textContent || "").trim().toLowerCase();
  const ariaLabel = (control.getAttribute("aria-label") || "").toLowerCase();
  const title = (control.getAttribute("title") || "").toLowerCase();
  const combined = `${textContent} ${ariaLabel} ${title}`;

  return combined.includes("remove") && !combined.includes("remove reason");
}

// ──── Native Remove Interceptor ────

function bindNativeRemoveInterceptor() {
  if (nativeRemoveInterceptorBound) {
    return;
  }
  nativeRemoveInterceptorBound = true;

  document.addEventListener(
    "pointerdown",
    (event) => {
      const targetEl = event.target instanceof Element ? event.target : null;
      if (!targetEl) {
        return;
      }

      const container = findClosestActionContainer(targetEl);
      if (container) {
        const resolved = pickTargetForContainer(container);
        if (resolved) {
          lastInteractedTarget = resolved;
          lastInteractedAt = Date.now();
          return;
        }
      }

      let closestPost = targetEl.closest("shreddit-post");
      if (!closestPost) closestPost = targetEl.closest("shreddit-comment");
      if (!closestPost) closestPost = targetEl.closest("article, .thing.link, .thing.comment, [data-testid='post-container']");
      if (closestPost instanceof HTMLElement) {
        const resolved = pickTargetForContainer(closestPost);
        if (resolved) {
          lastInteractedTarget = resolved;
          lastInteractedAt = Date.now();
          return;
        }
      }

      const closestModButton = targetEl.closest("[data-testid*='menu'], [data-testid*='action'], button[aria-label*='more'], [role='button'][aria-label*='more']");
      if (closestModButton instanceof HTMLElement) {
      let closestPostFromButton = closestModButton.closest("shreddit-post");
      if (!closestPostFromButton) closestPostFromButton = closestModButton.closest("shreddit-comment");
      if (!closestPostFromButton) closestPostFromButton = closestModButton.closest("article, .thing.link, .thing.comment, [data-testid='post-container']");
        if (closestPostFromButton instanceof HTMLElement) {
          const resolved = pickTargetForContainer(closestPostFromButton);
          if (resolved) {
            lastInteractedTarget = resolved;
            lastInteractedAt = Date.now();
          }
        }
      }
    },
    true
  );

  document.addEventListener(
    "click",
    (event) => {
      const targetEl = event.target instanceof Element ? event.target : null;
      if (!targetEl) {
        return;
      }

      if (targetEl.closest(`#${OVERLAY_ROOT_ID}, #${PROFILE_ROOT_ID}, #${CONTEXT_POPUP_ROOT_ID}, #${INLINE_MODLOG_ROOT_ID}`)) {
        return;
      }

      if (!interceptNativeRemoveEnabled) {
        return;
      }

      const control = targetEl.closest("button, a, [role='menuitem'], [role='button']");
      if (!(control instanceof HTMLElement)) {
        return;
      }

      if (control.classList.contains("rrw-comment-nuke-btn")) {
        return;
      }

      const textContent = (control.textContent || "").trim().toLowerCase();
      const ariaLabel = (control.getAttribute("aria-label") || "").toLowerCase();
      const title = (control.getAttribute("title") || "").toLowerCase();
      const combined = `${textContent} ${ariaLabel} ${title}`;

      const isRemoveAction = combined.includes("remove") && !combined.includes("remove reason");
      if (!isRemoveAction) {
        return;
      }

      const actionContainer = findClosestActionContainer(control);
      const actionSubreddit = resolveContainerSubreddit(actionContainer);
      if (!isAllowedLaunchSubreddit(actionSubreddit)) {
        return;
      }

      const target = resolveTargetFromNativeControl(control);
      if (!target) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation();
      }

      setTimeout(() => {
        void openOverlay(target);
      }, 0);
    },
    true
  );

  // Handle native approve button clicks to apply green border
  document.addEventListener(
    "click",
    (event) => {
      const targetEl = event.target instanceof Element ? event.target : null;
      if (!targetEl) {
        return;
      }

      if (targetEl.closest(`#${OVERLAY_ROOT_ID}, #${PROFILE_ROOT_ID}, #${CONTEXT_POPUP_ROOT_ID}, #${INLINE_MODLOG_ROOT_ID}`)) {
        return;
      }

      const control = targetEl.closest("button, a, [role='menuitem'], [role='button']");
      if (!(control instanceof HTMLElement)) {
        return;
      }

      const textContent = (control.textContent || "").trim().toLowerCase();
      const ariaLabel = (control.getAttribute("aria-label") || "").toLowerCase();
      const title = (control.getAttribute("title") || "").toLowerCase();
      const combined = `${textContent} ${ariaLabel} ${title}`;

      const isApproveAction = combined.includes("approve");
      if (!isApproveAction) {
        return;
      }

      const actionContainer = findClosestActionContainer(control);
      const target = resolveTargetFromNativeControl(control);
      if (target) {
        // Apply green border immediately when approve is clicked
        setTimeout(() => {
          applyActionBorderToElement(target, "approve");
        }, 50);
      }
    },
    true
  );
}

function tagNativeRemoveControls(container, target) {
  if (!(container instanceof HTMLElement) || !target) {
    return;
  }

  const selectors = [
    "button[data-testid*='remove' i]",
    "a[data-testid*='remove' i]",
    "[data-event-action='remove']",
    ".remove-button a",
    "button[aria-label*='remove' i]",
    "a[aria-label*='remove' i]",
    "button[title*='remove' i]",
    "a[title*='remove' i]",
    "[role='menuitem'][aria-label*='remove' i]",
  ];

  container.querySelectorAll(selectors.join(",")).forEach((node) => {
    if (!(node instanceof HTMLElement)) {
      return;
    }
    if (node.classList.contains("rrw-comment-nuke-btn")) {
      return;
    }
    node.dataset.rrwTarget = target;
  });
}

// ──── Preference Loading Stubs ────
// These are called by main.js but are defined in other feature modules.
// Stub versions provided to prevent errors; real implementations are in respective modules.

async function loadNativeInterceptPreference() {
  try {
    const stored = await ext.storage.sync.get([INTERCEPT_NATIVE_REMOVE_KEY]);
    interceptNativeRemoveEnabled = typeof stored?.[INTERCEPT_NATIVE_REMOVE_KEY] === "boolean"
      ? stored[INTERCEPT_NATIVE_REMOVE_KEY]
      : true;
  } catch {
    interceptNativeRemoveEnabled = true;
  }
}
