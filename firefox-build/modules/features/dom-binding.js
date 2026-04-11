// ════════════════════════════════════════════════════════════════════════════════════════════════
// DOM Binding & Container Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Handles DOM scanning for posts/comments and attaching ModBox UI elements (usernote pills, buttons, etc).
// Dependencies: constants.js, state.js, utilities.js, features/usernotes.js, features/core-ui.js
// State variables (visibleContainerBindScheduled, visibleContainerBindNeedsFullScan, visibleContainerBindPendingRoots) defined in state.js

// ──── Container Collection & Detection ────

function collectBindableContainersFromRoot(root, collector) {
  if (!(root instanceof Element)) {
    return;
  }

  if (!root.isConnected) {
    return;
  }

  if (root === document.documentElement || root === document.body) {
    collectBindableContainersFromDocument(collector);
    return;
  }

  if (root.matches(BINDABLE_CONTAINER_SELECTOR)) {
    collector.add(root);
  }
  root.querySelectorAll(BINDABLE_CONTAINER_SELECTOR).forEach((el) => collector.add(el));
}

function collectBindableContainersFromDocument(collector) {
  document.querySelectorAll(BINDABLE_CONTAINER_SELECTOR).forEach((el) => collector.add(el));
}

function isQueueListingPage(pathname = window.location.pathname) {
  return /\/about\/(modqueue|unmoderated|reports)(?:\/|$)/i.test(String(pathname || ""));
}

function isModmailConversationPage() {
  const host = String(window.location.hostname || "").toLowerCase();
  const path = String(window.location.pathname || "").toLowerCase();
  if (host !== "www.reddit.com") return false;
  // Match /mail/{category}/{conversationId} – e.g. /mail/all/3acg45
  return /^\/mail\/[^/]+\/\w/.test(path);
}

function getThingTypeLabelFromFullname(fullname) {
  return String(fullname || "").toLowerCase().startsWith("t3_") ? "post" : "comment";
}

// ──── Author & Username Extraction ────

function extractUsernameFromAuthorAnchor(anchor) {
  if (!(anchor instanceof HTMLElement)) {
    return "";
  }

  const href = anchor.getAttribute("href") || "";
  const match = href.match(/\/u(?:ser)?\/([^/?#]+)/i);
  if (match) {
    return decodeURIComponent(match[1]);
  }

  const text = String(anchor.textContent || "").trim();
  if (text && !text.toLowerCase().startsWith("[") && !text.includes("/")) {
    return text;
  }

  return "";
}

function findAuthorAnchor(container) {
  if (!(container instanceof HTMLElement)) {
    return null;
  }

  const selectors = [
    ".tagline a.author",
    "a.author",
    "a[data-testid='post_author_link']",
    "a[data-testid='comment_author_link']",
    "a[data-testid*='author']",
    "faceplate-tracker a[href*='/user/']",
    "faceplate-tracker a[href*='/u/']",
  ];

  for (const selector of selectors) {
    const link = container.querySelector(selector);
    if (link instanceof HTMLAnchorElement) {
      return link;
    }
  }

  const metaHosts = [
    container.querySelector(".tagline"),
    container.querySelector("header"),
    container.querySelector("[slot='commentMeta']"),
    container.querySelector("[slot='postMeta']"),
    container.querySelector("[data-testid='comment'] header"),
  ].filter(Boolean);

  for (const host of metaHosts) {
    const link = host.querySelector("a[href*='/user/'], a[href*='/u/']");
    if (link instanceof HTMLAnchorElement) {
      return link;
    }
  }

  return null;
}

function findClosestActionContainer(element) {
  if (!(element instanceof Element)) {
    return null;
  }

  const selector = [
    "shreddit-post",
    "shreddit-comment",
    "article",
    ".Comment",
    ".thing.link",
    ".thing.comment",
    "[data-testid='post-container']",
    "[data-testid='comment']",
  ].join(",");

  return element.closest(selector);
}

function pickTargetForContainer(container) {
  const fullname = extractFullnameFromAttributes(container);
  if (fullname) {
    return fullname;
  }

  const candidates = collectCandidateTargets(container);
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.pathname.length - a.pathname.length);
    return candidates[0].toString();
  }

  if (isLikelyPostContainer(container)) {
    const postId = parsePostIdFromPath(window.location.pathname);
    if (postId) {
      return `t3_${postId}`;
    }
    if (isRedditCommentPath(window.location.pathname)) {
      return window.location.href;
    }
  }

  return null;
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

function resolveContainerSubreddit(container) {
  if (!(container instanceof HTMLElement)) {
    return parseSubredditFromPath(window.location.pathname);
  }

  const attrSubreddit =
    normalizeSubreddit(container.getAttribute("data-subreddit") || "") ||
    normalizeSubreddit(container.dataset.subreddit || "");
  if (attrSubreddit) {
    return attrSubreddit;
  }

  const candidates = collectCandidateTargets(container);
  for (const url of candidates) {
    const fromLink = parseSubredditFromCommentPath(url.pathname);
    if (fromLink) {
      return fromLink;
    }
  }

  return parseSubredditFromPath(window.location.pathname);
}

function isLikelyPostContainer(container) {
  if (!container) {
    return false;
  }
  const tag = String(container.tagName || "").toLowerCase();
  if (tag === "shreddit-post") {
    return true;
  }
  if (container.classList?.contains("thing") && container.classList?.contains("link")) {
    return true;
  }
  return false;
}

// ──── Context Popup Payload ────

function buildContextPopupPayloadForContainer(container, target = "") {
  if (!target) {
    return null;
  }

  const commentIdMatch = String(target).match(/^t1_([a-z0-9]{5,10})$/i);
  if (!commentIdMatch) {
    return null;
  }

  const commentId = commentIdMatch[1].toLowerCase();
  const permalink = container.querySelector("a[href*='permalink'], a[data-permalink]");
  if (!permalink) {
    return null;
  }

  const href = String(permalink.getAttribute("href") || "").trim();
  if (!href) {
    return null;
  }

  const contextJsonUrl = `${href}?context=1000&raw_json=1`;
  return {
    commentId,
    contextJsonUrl,
  };
}

// ──── Helper to prevent comment collapse on button clicks ────

function attachButtonClickHandlers(button, onClickFn) {
  // Prevent native Reddit comment collapse from triggering on clicks
  const stopEvent = (event) => {
    event.preventDefault?.();
    event.stopPropagation?.();
    event.stopImmediatePropagation?.();
  };
  
  button.addEventListener("mousedown", stopEvent, true);
  button.addEventListener("click", (event) => {
    stopEvent(event);
    onClickFn(event);
  }, false);
}

// ──── Core Container Binding ────

function bindContainer(container) {
  if (!(container instanceof HTMLElement)) {
    return;
  }
  if (container.dataset.rrwBound === "1") {
    return;
  }

  // Skip elements inside ModBox editor modals.
  if (container.closest(".rrw-usernotes-modal, .rrw-removal-config-modal")) {
    return;
  }

  console.log("[ModBox] bindContainer: starting bind for", container.tagName, "with id=" + container.id, "data-fullname=" + container.getAttribute("data-fullname"));

  const containerSubreddit = resolveContainerSubreddit(container);
  if (!isAllowedLaunchSubreddit(containerSubreddit)) {
    console.log("[ModBox] bindContainer: subreddit '" + containerSubreddit + "' not in allowedLaunchSubreddits (loaded=" + allowedLaunchSubredditsLoaded + ", set=" + (allowedLaunchSubreddits instanceof Set ? "yes size=" + allowedLaunchSubreddits.size : "no") + ")");
    return;
  }

  const target = pickTargetForContainer(container);
  if (!target) {
    console.log("[ModBox] bindContainer: no target found for", container.tagName);
    return;
  }
  
  console.log("[ModBox] bindContainer: successfully extracted target =", target, "for element", container.tagName);

  tagNativeRemoveControls(container, target);

  const button = document.createElement("button");
  button.type = "button";
  button.className = BUTTON_CLASS;
  button.textContent = "Mod Actions";
  button.dataset.rrwButtonTarget = target;
  attachButtonClickHandlers(button, () => {
    const btnTarget = button.dataset.rrwButtonTarget || target;
    console.log("[ModBox] MOD ACTIONS button clicked! container=", container.tagName, "target from closure=", target, "target from button attribute=", btnTarget);
    void openOverlay(btnTarget);
  });

  const itemSubreddit =
    normalizeSubreddit(container.getAttribute("data-subreddit") || "") ||
    parseSubredditFromPath(window.location.pathname);
  const isQueueCommentContainer =
    container.matches("shreddit-comment")
    || container.matches(".thing.comment")
    || container.matches("[data-testid='comment']")
    || Boolean(container.querySelector(".entry .flat-list.buttons a.bylink[data-event-action='context']"));
  const isQueueComment =
    isQueueListingPage()
    && (isQueueCommentContainer || /^t1_[a-z0-9]{5,10}$/i.test(target));
  const contextPayload = isQueueComment ? buildContextPopupPayloadForContainer(container, target) : null;

  const isOldRedditHost = String(window.location.hostname || "").toLowerCase() === "old.reddit.com";
  let contextInlineLinkInjected = false;
  if (contextPayload && isQueueComment && isOldRedditHost) {
    const oldRedditButtons = container.querySelector(".entry .flat-list.buttons, .entry ul.buttons");
    if (oldRedditButtons instanceof HTMLUListElement) {
      const existing = oldRedditButtons.querySelector(".rrw-comment-context-popup");
      if (existing) {
        contextInlineLinkInjected = true;
      } else {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = "javascript:;";
        link.className = "bylink rrw-comment-context-popup rrw-queue-context-popup";
        link.textContent = "context-popup";
        link.setAttribute("data-event-action", "context-popup");
        link.dataset.contextJsonUrl = contextPayload.contextJsonUrl;
        link.dataset.commentId = contextPayload.commentId;
        li.appendChild(link);

        const contextAnchor = oldRedditButtons.querySelector("a.bylink[data-event-action='context']");
        const contextItem = contextAnchor?.closest("li");
        if (contextItem instanceof HTMLLIElement) {
          contextItem.insertAdjacentElement("afterend", li);
        } else {
          oldRedditButtons.appendChild(li);
        }

        contextInlineLinkInjected = true;
      }

      // Add lock button for comments on queue pages
      if (!oldRedditButtons.querySelector(".rrw-comment-lock-btn")) {
        const fullname = extractFullnameFromAttributes(container);
        if (fullname) {
          const commentIsLocked = isCommentLockedInDOM(container);
          const lockLi = document.createElement("li");
          const lockLink = document.createElement("a");
          lockLink.href = "javascript:;";
          lockLink.className = "bylink rrw-comment-lock-btn rrw-oldreddit-lock-btn";
          lockLink.textContent = commentIsLocked ? "unlock" : "lock";
          lockLink.setAttribute("data-event-action", "comment-lock");
          lockLink.dataset.commentFullname = fullname;
          lockLink.dataset.isLocked = commentIsLocked ? "true" : "false";
          lockLi.appendChild(lockLink);
          oldRedditButtons.appendChild(lockLi);
        }
      }
    }
  }

  const contextButton = contextPayload && !contextInlineLinkInjected
    ? (() => {
      const buttonEl = document.createElement("button");
      buttonEl.type = "button";
      buttonEl.className = "rrw-history-btn rrw-comment-context-popup";
      buttonEl.textContent = "C";
      buttonEl.title = "Open comment context popup";
      buttonEl.dataset.contextJsonUrl = contextPayload.contextJsonUrl;
      buttonEl.dataset.commentId = contextPayload.commentId;
      attachButtonClickHandlers(buttonEl, (event) => {
        const contextJsonUrl = String(buttonEl.dataset.contextJsonUrl || "").trim();
        const commentId = String(buttonEl.dataset.commentId || "").trim().toLowerCase();
        if (contextJsonUrl) {
          void openContextPopup(contextJsonUrl, commentId, { x: event.clientX, y: event.clientY });
        }
      });
      return buttonEl;
    })()
    : null;

  const commentNukeButton = /^t1_[a-z0-9]{5,10}$/i.test(target)
    ? (() => {
      const buttonEl = document.createElement("button");
      buttonEl.type = "button";
      buttonEl.className = "rrw-comment-nuke-btn";
      buttonEl.textContent = "R";
      buttonEl.title = "Remove this comment and its replies";
      buttonEl.dataset.commentNukeTarget = String(target).toLowerCase();
      buttonEl.dataset.commentNukeState = "idle";
      attachButtonClickHandlers(buttonEl, () => {
        void runCommentNukeWorkflow(target).catch((error) => {
          console.warn("[ModBox] Comment nuke failed:", error instanceof Error ? error.message : String(error));
        });
      });
      return buttonEl;
    })()
    : null;

  const modlogButton = document.createElement("button");
  modlogButton.type = "button";
  modlogButton.className = "rrw-modlog-btn";
  modlogButton.textContent = "ML";
  modlogButton.title = "Show latest modlog for this item";
  attachButtonClickHandlers(modlogButton, () => {
    void openInlineModlogPopup(modlogButton, { target, subreddit: itemSubreddit });
  });

  const authorAnchor = findAuthorAnchor(container);
  if (!authorAnchor) {
    console.log("[ModBox] bindContainer: no author anchor found");
  } else {
    console.log("[ModBox] bindContainer: found author anchor, binding container with target", target);
  }
  if (authorAnchor?.parentElement) {
    if (authorAnchor.dataset.rrwInlineBound === "1") {
      container.dataset.rrwBound = "1";
      return;
    }

    const usernotesChip = document.createElement("button");
    usernotesChip.type = "button";
    usernotesChip.className = "rrw-usernote-chip";
    usernotesChip.textContent = "Loading note...";

    const username = extractUsernameFromAuthorAnchor(authorAnchor);
    const subreddit =
      normalizeSubreddit(container.getAttribute("data-subreddit") || "") ||
      parseSubredditFromPath(window.location.pathname);
    const postId = parsePostIdFromPath(window.location.pathname);
    const linkTarget = postId && subreddit
      ? formatRedditUrl(subreddit, postId)
      : formatRedditByIdUrl(extractFullnameFromAttributes(container)) || window.location.href;

    const inlineGroup = document.createElement("span");
    inlineGroup.className = "rrw-inline-group";
    button.classList.add("rrw-launch-btn-inline");
    const historyButton = document.createElement("button");
    historyButton.type = "button";
    historyButton.className = "rrw-history-btn";
    historyButton.textContent = "H";
    historyButton.title = "Open brief user history";
    attachButtonClickHandlers(historyButton, () => {
      if (username) {
        void openInlineHistoryPopup(historyButton, { username, subreddit });
      }
    });
    const profileButton = document.createElement("button");
    profileButton.type = "button";
    profileButton.className = PROFILE_BUTTON_CLASS;
    profileButton.textContent = "P";
    profileButton.title = "Open ModBox profile view";
    attachButtonClickHandlers(profileButton, () => {
      if (username) {
        openProfileView(username, { listing: "overview", subreddit });
      }
    });

    inlineGroup.appendChild(usernotesChip);
    if (commentNukeButton) {
      inlineGroup.appendChild(commentNukeButton);
    }
    if (username) {
      inlineGroup.appendChild(historyButton);
    }
    if (contextButton) {
      inlineGroup.appendChild(contextButton);
    }
    if (username) {
      inlineGroup.appendChild(profileButton);
    }
    inlineGroup.appendChild(modlogButton);

    const quickActionsButton = document.createElement("button");
    quickActionsButton.type = "button";
    quickActionsButton.className = "rrw-quick-actions-pill";
    quickActionsButton.textContent = "Q";
    quickActionsButton.title = "Open quick actions panel";
    quickActionsButton.dataset.rrwButtonTarget = target;
    attachButtonClickHandlers(quickActionsButton, () => {
      const btnTarget = quickActionsButton.dataset.rrwButtonTarget || target;
      void openOverlay(btnTarget, { quickActionsOnlyMode: true, subreddit: itemSubreddit });
    });
    inlineGroup.appendChild(quickActionsButton);

    inlineGroup.appendChild(button);

    // Find the last flair/badge element after the author anchor to position pills after them
    let insertAfterEl = authorAnchor;
    let currentSibling = authorAnchor.nextElementSibling;
    while (currentSibling) {
      const isFlairLike = 
        currentSibling.classList.contains("flair") ||
        currentSibling.classList.contains("user-flair") ||
        currentSibling.classList.contains("moderator") ||
        currentSibling.classList.contains("op") ||
        currentSibling.classList.contains("verified") ||
        currentSibling.textContent === "[M]" ||
        currentSibling.tagName.toLowerCase() === "flair-rich-text" ||
        (currentSibling.tagName.toLowerCase().includes("flair") || 
         currentSibling.getAttribute("class")?.includes("flair") ||
         false);
      
      if (isFlairLike || currentSibling.classList.contains("rrw-inline-group")) {
        if (currentSibling.classList.contains("rrw-inline-group")) {
          break;
        }
        insertAfterEl = currentSibling;
        currentSibling = currentSibling.nextElementSibling;
      } else {
        break;
      }
    }

    const existingInlineGroup = insertAfterEl.nextElementSibling;
    if (existingInlineGroup instanceof HTMLElement && existingInlineGroup.classList.contains("rrw-inline-group")) {
      authorAnchor.dataset.rrwInlineBound = "1";
      container.dataset.rrwBound = "1";
      return;
    }
    insertAfterEl.insertAdjacentElement("afterend", inlineGroup);
    authorAnchor.dataset.rrwInlineBound = "1";

    void setupInlineUsernoteChip(usernotesChip, {
      subreddit,
      username,
      link: linkTarget,
    });

    container.dataset.rrwBound = "1";
    return;
  }

  const toolbarHost =
    container.querySelector('[data-testid="comment"]') ||
    container.querySelector('[slot="actions"]') ||
    container.querySelector("header") ||
    container;

  const taglineHost = container.querySelector(".entry .tagline");
  if (taglineHost) {
    modlogButton.classList.add("rrw-launch-btn-inline");
    button.classList.add("rrw-launch-btn-inline", "rrw-launch-btn-inline--solo");
    if (commentNukeButton) {
      commentNukeButton.classList.add("rrw-launch-btn-inline");
      taglineHost.insertAdjacentElement("beforeend", commentNukeButton);
    }
    if (contextButton) {
      contextButton.classList.add("rrw-launch-btn-inline");
      taglineHost.insertAdjacentElement("beforeend", contextButton);
    }
    taglineHost.insertAdjacentElement("beforeend", modlogButton);
    taglineHost.insertAdjacentElement("beforeend", button);
    container.dataset.rrwBound = "1";
    return;
  }

  modlogButton.classList.add("rrw-launch-btn-inline");
  if (commentNukeButton) {
    commentNukeButton.classList.add("rrw-launch-btn-inline");
    toolbarHost.appendChild(commentNukeButton);
  }
  if (contextButton) {
    contextButton.classList.add("rrw-launch-btn-inline");
    toolbarHost.appendChild(contextButton);
  }
  toolbarHost.appendChild(modlogButton);
  toolbarHost.appendChild(button);
  container.dataset.rrwBound = "1";
}

// ──── Visible Container Binding ────

function bindVisibleContainers() {
  const candidates = new Set();
  document.querySelectorAll(BINDABLE_CONTAINER_SELECTOR).forEach((el) => candidates.add(el));
  console.log("[ModBox] bindVisibleContainers: found " + candidates.size + " containers");
  candidates.forEach((container) => bindContainer(container));
  scheduleQueueToolsBind();
  bindModmailParticipantPills();
}

function bindVisibleContainersFromRoots(roots) {
  const candidates = new Set();
  roots.forEach((root) => collectBindableContainersFromRoot(root, candidates));
  candidates.forEach((container) => bindContainer(container));
  scheduleQueueToolsBind();
  bindModmailParticipantPills();
}

function flushScheduledVisibleContainerBind() {
  visibleContainerBindScheduled = false;

  if (visibleContainerBindNeedsFullScan) {
    visibleContainerBindNeedsFullScan = false;
    visibleContainerBindPendingRoots.clear();
    bindVisibleContainers();
    bindOldRedditContextPopupLinks();
    bindOldRedditReplyFormPills();
    return;
  }

  const roots = Array.from(visibleContainerBindPendingRoots);
  visibleContainerBindPendingRoots.clear();
  if (roots.length > 0) {
    bindVisibleContainersFromRoots(roots);
  }
  bindOldRedditContextPopupLinks();
  bindOldRedditReplyFormPills();
}

function scheduleVisibleContainerBind(options = {}) {
  const fullScan = Boolean(options.fullScan);
  const mutationRecords = Array.isArray(options.mutationRecords) ? options.mutationRecords : [];

  if (fullScan) {
    visibleContainerBindNeedsFullScan = true;
  } else {
    let addedNodeCount = 0;
    mutationRecords.forEach((record) => {
      if (record?.addedNodes) {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            addedNodeCount += 1;
            if (node === document.documentElement || node === document.body) {
              visibleContainerBindNeedsFullScan = true;
              return;
            }
            visibleContainerBindPendingRoots.add(node);
            const nearestContainer = node.closest(BINDABLE_CONTAINER_SELECTOR);
            if (nearestContainer instanceof Element) {
              visibleContainerBindPendingRoots.add(nearestContainer);
            }
          }
        });
      }
    });

    if (addedNodeCount > MAX_MUTATION_ADDED_NODES_BEFORE_FULL_SCAN) {
      visibleContainerBindNeedsFullScan = true;
      visibleContainerBindPendingRoots.clear();
    } else if (visibleContainerBindPendingRoots.size > MAX_PENDING_BIND_ROOTS) {
      visibleContainerBindNeedsFullScan = true;
      visibleContainerBindPendingRoots.clear();
    }
  }

  if (visibleContainerBindScheduled) {
    return;
  }
  visibleContainerBindScheduled = true;
  requestAnimationFrame(() => {
    flushScheduledVisibleContainerBind();
  });
}

// ──── Queue Tools Binding (Stub - no UI yet) ────

function bindModmailParticipantPills() {
  if (!isModmailConversationPage()) return;

  // Guard: if allowed subreddits haven't loaded yet the MutationObserver will
  // re-trigger this function once they have – don't mark cards as bound yet.
  if (!allowedLaunchSubredditsLoaded) return;
  if (!(allowedLaunchSubreddits instanceof Set) || !allowedLaunchSubreddits.size) return;

  // Detect the conversation subreddit via multiple strategies so we don't
  // depend on the subreddit appearing as an explicit <a href="/r/..."> link.
  let subreddit = null;

  // Strategy 1: Page title – Reddit often includes "r/SubName" in the title.
  const titleMatch = String(document.title || "").match(/\br\/([A-Za-z0-9_]+)/i);
  if (titleMatch) {
    const candidate = normalizeSubreddit(titleMatch[1]);
    if (candidate && candidate.toLowerCase() !== "mod" && allowedLaunchSubreddits.has(candidate.toLowerCase())) {
      subreddit = candidate;
    }
  }

  // Strategy 2: Any visible text on the page that looks like "r/SubName"
  // matching a moderated subreddit – catches breadcrumbs rendered as plain text.
  if (!subreddit) {
    const bodyText = String(document.body?.textContent || "");
    for (const sub of allowedLaunchSubreddits) {
      const pattern = new RegExp(`(?:^|[^A-Za-z0-9_])r\\/${sub}(?:[^A-Za-z0-9_]|$)`, "i");
      if (pattern.test(bodyText)) {
        subreddit = normalizeSubreddit(sub);
        break;
      }
    }
  }

  // Strategy 3: Scan r/ links on the page (original approach, last resort).
  if (!subreddit) {
    for (const link of document.querySelectorAll("a[href*='/r/']")) {
      const m = (link.getAttribute("href") || "").match(/\/r\/([^/?#]+)/i);
      if (!m) continue;
      const candidate = normalizeSubreddit(m[1]);
      if (!candidate || candidate.toLowerCase() === "mod") continue;
      if (allowedLaunchSubreddits.has(candidate.toLowerCase())) {
        subreddit = candidate;
        break;
      }
    }
  }

  if (!subreddit) return;

  // Prefer links in the right sidebar, with a ModIdCard fallback.
  const profileLinks = new Set();
  document
    .querySelectorAll("aside a[href*='/user/'], aside a[href*='/u/'], .ModIdCard a[href*='/user/'], .ModIdCard a[href*='/u/']")
    .forEach((link) => {
      if (link instanceof HTMLAnchorElement) {
        profileLinks.add(link);
      }
    });

  profileLinks.forEach((profileLink) => {
    if (profileLink.dataset.rrwMmBound === "1") return;

    const href = profileLink.getAttribute("href") || "";
    const usernameMatch = href.match(/\/(?:u|user)\/([^/?#]+)/i);
    if (!usernameMatch) return;
    const username = decodeURIComponent(usernameMatch[1]);
    if (!username || username === "[deleted]") return;

    const insertAfter =
      profileLink.closest(".ModIdCard__UserNameContainer") ||
      profileLink.closest(".ModIdCard__UserNameMetaData") ||
      profileLink.parentElement;
    if (!insertAfter) return;

    if (insertAfter.parentElement?.querySelector(":scope > .rrw-mm-pills")) {
      profileLink.dataset.rrwMmBound = "1";
      return;
    }

    const pillGroup = document.createElement("div");
    pillGroup.className = "rrw-inline-group rrw-mm-pills";

    const usernotesChip = document.createElement("button");
    usernotesChip.type = "button";
    usernotesChip.className = "rrw-usernote-chip";
    usernotesChip.textContent = subreddit ? "Loading note..." : "N";

    const historyButton = document.createElement("button");
    historyButton.type = "button";
    historyButton.className = "rrw-history-btn";
    historyButton.textContent = "H";
    historyButton.title = "Open brief user history";
    historyButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      void openInlineHistoryPopup(historyButton, { username, subreddit: subreddit || "" });
    });

    const profileButton = document.createElement("button");
    profileButton.type = "button";
    profileButton.className = PROFILE_BUTTON_CLASS;
    profileButton.textContent = "P";
    profileButton.title = "Open ModBox profile view";
    profileButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openProfileView(username, { listing: "overview", subreddit: subreddit || "" });
    });

    pillGroup.appendChild(usernotesChip);
    pillGroup.appendChild(historyButton);
    pillGroup.appendChild(profileButton);

    insertAfter.insertAdjacentElement("afterend", pillGroup);
    profileLink.dataset.rrwMmBound = "1";

    if (subreddit) {
      void setupInlineUsernoteChip(usernotesChip, {
        subreddit,
        username,
        link: window.location.href,
      });
    } else {
      usernotesChip.title = "Usernotes unavailable: subreddit could not be resolved";
      usernotesChip.disabled = true;
    }
  });
}

function bindOldRedditContextPopupLinks() {
  // Stub: Real implementation for old.reddit.com context links
}

function bindOldRedditReplyFormPills() {
  if (String(window.location.hostname || "").toLowerCase() !== "old.reddit.com") return;
  if (!allowedLaunchSubredditsLoaded) return;

  // Old QA reply pill button removed - now using the better Q pill on comments


}
