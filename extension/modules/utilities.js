// ============================================================================
// UTILITY FUNCTIONS - URL & PARSING
// ============================================================================

function parseUrl(href) {
  try {
    return new URL(href, window.location.origin);
  } catch {
    return null;
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRedditCommentPath(pathname) {
  return /\/comments\//i.test(pathname);
}

function collectCandidateTargets(root) {
  const links = Array.from(root.querySelectorAll("a[href*='/comments/']"));
  return links
    .map((link) => parseUrl(link.getAttribute("href") || ""))
    .filter((url) => Boolean(url) && isRedditCommentPath(url.pathname));
}

function parsePostIdFromPath(pathname) {
  const match = String(pathname || "").match(/\/comments\/([a-z0-9]{5,10})/i);
  return match ? match[1].toLowerCase() : null;
}

function parseTargetToFullname(target) {
  const value = String(target || "").trim();
  if (!value) {
    throw new Error("target is required");
  }

  const fullnameMatch = value.match(/^t([13])_[a-z0-9]{5,10}$/i);
  if (fullnameMatch) {
    return value.toLowerCase();
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("target must be a fullname or Reddit URL");
  }

  const host = String(parsed.hostname || "").toLowerCase();
  if (!(host === "reddit.com" || host.endsWith(".reddit.com"))) {
    throw new Error("target URL must be on reddit.com");
  }

  const segments = String(parsed.pathname || "")
    .split("/")
    .map((part) => String(part || "").trim())
    .filter(Boolean);

  const commentsIndex = segments.indexOf("comments");
  if (commentsIndex < 0 || commentsIndex + 1 >= segments.length) {
    throw new Error("unsupported Reddit URL format");
  }

  const postId = String(segments[commentsIndex + 1] || "").toLowerCase();
  if (!/^[a-z0-9]{5,10}$/.test(postId)) {
    throw new Error("invalid Reddit post id in target URL");
  }

  const trailing = segments.slice(commentsIndex + 2).map((part) => String(part || "").toLowerCase());
  let commentId = "";
  if (trailing.length >= 3 && trailing[1] === "-" && /^[a-z0-9]{5,10}$/.test(trailing[2])) {
    commentId = trailing[2];
  } else if (trailing.length >= 2 && /^[a-z0-9]{5,10}$/.test(trailing[1])) {
    commentId = trailing[1];
  } else if (trailing.length >= 1 && /^[a-z0-9]{5,10}$/.test(trailing[0])) {
    commentId = trailing[0];
  }

  return commentId ? `t1_${commentId}` : `t3_${postId}`;
}

function getThingTypeFromFullname(fullname) {
  return String(fullname || "").toLowerCase().startsWith("t3_") ? "submission" : "comment";
}

function formatRedditByIdUrl(fullname, linkHostPreference = preferredRedditLinkHost, useOldReddit = String(window.location.hostname || "").toLowerCase() === "old.reddit.com") {
  if (!fullname) {
    return null;
  }
  const host = resolveRedditLinkHost(linkHostPreference, useOldReddit);
  return `https://${host}/by_id/${String(fullname).toLowerCase()}`;
}

function resolveRedditLinkHost(linkHostPreference, useOldReddit) {
  if (linkHostPreference === "old_reddit") {
    return "old.reddit.com";
  }
  if (linkHostPreference === "new_reddit") {
    return "www.reddit.com";
  }
  return useOldReddit ? "old.reddit.com" : "www.reddit.com";
}

function extractFullnameFromAttributes(container) {
  const attrCandidates = [
    "id",
    "data-fullname",
    "fullname",
    "thingid",
    "post-id",
    "data-post-id",
    "comment-id",
    "data-comment-id",
  ];

  for (const attr of attrCandidates) {
    const raw = (container.getAttribute(attr) || "").trim().toLowerCase();
    if (!raw) {
      continue;
    }
    if (/^t[13]_[a-z0-9]{5,10}$/i.test(raw)) {
      return raw;
    }
    if (/^[a-z0-9]{5,10}$/i.test(raw)) {
      if (attr.includes("comment")) {
        return `t1_${raw}`;
      }
      return `t3_${raw}`;
    }
  }

  return null;
}

// ============================================================================
// UTILITY FUNCTIONS - STRING MANIPULATION
// ============================================================================

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeSubreddit(value) {
  const raw = String(value || "").trim().replace(/^\/+|\/+$/g, "");
  if (!raw) {
    return "";
  }
  if (/^r\//i.test(raw)) {
    return raw.slice(2);
  }
  return raw;
}

function parseSubredditFromPath(pathname) {
  const match = String(pathname || "").match(/^\/r\/([^/]+)/i);
  return match ? normalizeSubreddit(match[1]) : "";
}

function parseSubredditFromCommentPath(pathname) {
  const match = String(pathname || "").match(/^\/r\/([^/]+)\/comments\//i);
  return match ? normalizeSubreddit(match[1]) : "";
}

function slugifyReasonKey(value, fallback = "new-reason") {
  const slug = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || fallback;
}

function normalizeQueueBarLinkHost(value, fallback = "extension_preference") {
  const clean = String(value || fallback).trim();
  if (clean === "backend_preference") {
    return "extension_preference";
  }
  return ["extension_preference", "old_reddit", "new_reddit"].includes(clean)
    ? clean
    : fallback;
}

function normalizeQueueBarScope(value, fallback = "current_subreddit") {
  const clean = String(value || "").trim();
  if (clean === "configured_subreddit") {
    return "current_subreddit";
  }
  return ["current_subreddit", "fixed_subreddit", "mod_global"].includes(clean)
    ? clean
    : fallback;
}

function decodeToolboxText(value) {
  const raw = String(value || "");
  if (!raw) {
    return "";
  }
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}

function normalizeRemovalSendMode(value, fallback = "reply") {
  const lowered = String(value || fallback).trim().toLowerCase();
  if (["reply", "pm", "both", "none"].includes(lowered)) {
    return lowered;
  }
  return fallback;
}

function decodeHtmlEntities(value) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = String(value || "");
  return textarea.value;
}

// ============================================================================
// UTILITY FUNCTIONS - HTML RENDERING & SANITIZATION
// ============================================================================

function sanitizeProfileRenderedHtml(html) {
  const allowedTags = new Set([
    "A", "P", "BR", "HR", "EM", "STRONG", "DEL", "S", "U", "SUP", "SUB",
    "BLOCKQUOTE", "CODE", "PRE", "UL", "OL", "LI",
    "H1", "H2", "H3", "H4", "H5", "H6",
    "TABLE", "THEAD", "TBODY", "TR", "TH", "TD",
    "SPAN", "DIV",
  ]);

  const wrapper = document.createElement("div");
  wrapper.innerHTML = String(html || "");

  const nodes = [];
  const walker = document.createTreeWalker(wrapper, NodeFilter.SHOW_ELEMENT);
  let current = walker.nextNode();
  while (current) {
    nodes.push(current);
    current = walker.nextNode();
  }

  for (const node of nodes) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }

    if (!allowedTags.has(node.tagName)) {
      const parent = node.parentNode;
      if (!parent) {
        continue;
      }
      while (node.firstChild) {
        parent.insertBefore(node.firstChild, node);
      }
      parent.removeChild(node);
      continue;
    }

    const attrs = Array.from(node.attributes);
    attrs.forEach((attr) => {
      const name = String(attr.name || "").toLowerCase();
      if (name.startsWith("on") || name === "style" || name === "src" || name === "srcset") {
        node.removeAttribute(attr.name);
        return;
      }

      if (node.tagName === "A") {
        if (!["href", "title", "target", "rel"].includes(name)) {
          node.removeAttribute(attr.name);
          return;
        }

        if (name === "href") {
          const href = String(node.getAttribute("href") || "").trim();
          const safeHref = href.startsWith("/") || /^https?:\/\//i.test(href);
          if (!safeHref) {
            node.removeAttribute("href");
          }
        }
        if (name === "target") {
          node.setAttribute("target", "_blank");
        }
        if (name === "rel") {
          node.setAttribute("rel", "noreferrer noopener");
        }
      } else {
        if (name !== "class") {
          node.removeAttribute(attr.name);
        }
      }
    });

    if (node.tagName === "A") {
      if (!node.hasAttribute("target")) {
        node.setAttribute("target", "_blank");
      }
      node.setAttribute("rel", "noreferrer noopener");
    }
  }

  return wrapper.innerHTML;
}

function renderProfileMarkdown(value) {
  const input = String(value || "").replace(/\r\n?/g, "\n").trim();
  if (!input) {
    return "";
  }

  let html = escapeHtml(input);
  const codeBlockTokens = [];

  html = html.replace(/```([\s\S]*?)```/g, (_match, codeText) => {
    const token = `@@RRW_CODE_BLOCK_${codeBlockTokens.length}@@`;
    const normalizedCode = String(codeText || "").replace(/^\n+|\n+$/g, "");
    codeBlockTokens.push(`<pre class="rrw-profile-codeblock"><code>${normalizedCode}</code></pre>`);
    return token;
  });

  html = html
    .replace(/^######\s+(.+)$/gm, "<h6>$1</h6>")
    .replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>")
    .replace(/^####\s+(.+)$/gm, "<h4>$1</h4>")
    .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#\s+(.+)$/gm, "<h1>$1</h1>")
    .replace(/^&gt;\s?(.*)$/gm, "<blockquote>$1</blockquote>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/`([^`\n]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");

  html = html.replace(/(?:^|\n)(?:[-*]\s+.+(?:\n[-*]\s+.+)*)/g, (block) => {
    const body = block.replace(/^\n/, "");
    const items = body.split("\n").map((line) => line.replace(/^[-*]\s+/, "").trim()).filter(Boolean);
    if (!items.length) {
      return block;
    }
    return `\n<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  });

  html = html.replace(/(?:^|\n)(?:\d+\.\s+.+(?:\n\d+\.\s+.+)*)/g, (block) => {
    const body = block.replace(/^\n/, "");
    const items = body.split("\n").map((line) => line.replace(/^\d+\.\s+/, "").trim()).filter(Boolean);
    if (!items.length) {
      return block;
    }
    return `\n<ol>${items.map((item) => `<li>${item}</li>`).join("")}</ol>`;
  });

  const fragments = html
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      if (/^<(h[1-6]|blockquote|pre|ul|ol)\b/i.test(chunk)) {
        return chunk;
      }
      return `<p>${chunk.replace(/\n/g, "<br>")}</p>`;
    });

  let rendered = fragments.join("");
  codeBlockTokens.forEach((tokenHtml, index) => {
    const token = `@@RRW_CODE_BLOCK_${index}@@`;
    rendered = rendered.split(token).join(tokenHtml);
  });

  return rendered;
}

function getProfileBodyHtmlFromEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return "";
  }

  if (entry.kind === "t1") {
    const rendered = String(entry.data?.body_html || "").trim();
    if (rendered) {
      return sanitizeProfileRenderedHtml(decodeHtmlEntities(rendered));
    }
    return renderProfileMarkdown(String(entry.data?.body || "[deleted]"));
  }

  if (entry.kind === "t3") {
    const rendered = String(entry.data?.selftext_html || "").trim();
    if (rendered) {
      return sanitizeProfileRenderedHtml(decodeHtmlEntities(rendered));
    }
    return renderProfileMarkdown(String(entry.data?.selftext || ""));
  }

  return "";
}

// ============================================================================
// URL & LINK FORMATTING
// ============================================================================

function resolveRedditLinkHost(linkHostPreference, useOldReddit) {
  if (linkHostPreference === "old_reddit") {
    return "old.reddit.com";
  }
  if (linkHostPreference === "new_reddit") {
    return "www.reddit.com";
  }
  return useOldReddit ? "old.reddit.com" : "www.reddit.com";
}

function formatRedditUrl(subreddit, postId, linkHostPreference = preferredRedditLinkHost, useOldReddit = String(window.location.hostname || "").toLowerCase() === "old.reddit.com") {
  if (!subreddit || !postId) {
    return null;
  }
  const host = resolveRedditLinkHost(linkHostPreference, useOldReddit);
  return `https://${host}/r/${subreddit}/comments/${postId}/`;
}

// ============================================================================
// VALIDATION & NORMALIZATION
// ============================================================================

function isQueueBarScope(value) {
  return value === "current_subreddit" || value === "configured_subreddit" || value === "fixed_subreddit" || value === "mod_global";
}

function isFullname(target) {
  return /^t[13]_[a-z0-9]{5,10}$/i.test((target || "").trim());
}

function isReasonForThing(reason, thingType) {
  if (!reason || !reason.is_enabled) {
    return false;
  }
  if (reason.applies_to === "both") {
    return true;
  }
  if (thingType === "submission") {
    return reason.applies_to === "posts";
  }
  return reason.applies_to === "comments";
}

function blockOptions(block) {
  const options = block?.payload?.options;
  if (!Array.isArray(options)) {
    return [];
  }
  return options.map((opt) => {
    if (typeof opt === "string") {
      return { label: opt, value: opt };
    }
    if (opt && typeof opt === "object") {
      return {
        label: String(opt.label ?? opt.value ?? "option"),
        value: String(opt.value ?? opt.label ?? "option"),
      };
    }
    return { label: "option", value: "option" };
  });
}

function setFieldValue(key, value) {
  if (!overlayState || !key) {
    return;
  }
  overlayState.inputValues[key] = value;
  if (overlayState.validationErrors?.[key]) {
    delete overlayState.validationErrors[key];
  }
}

function validateSelectedFields() {
  if (!overlayState) {
    return true;
  }

  const errors = {};
  for (const block of overlayState.dynamicBlocks || []) {
    if (!block?.required || !block.key) {
      continue;
    }
    if (!String(overlayState.inputValues?.[block.key] || "").trim()) {
      errors[block.key] = `${block.label || block.key} is required.`;
    }
  }

  overlayState.validationErrors = errors;
  if (Object.keys(errors).length > 0) {
    overlayState.error = "Please complete the highlighted fields.";
    return false;
  }
  return true;
}

function clearPreviewTimer() {
  if (overlayState?.previewTimer) {
    clearTimeout(overlayState.previewTimer);
    overlayState.previewTimer = null;
  }
}

function schedulePreview() {
  if (!overlayState || !overlayState.fullname) {
    return;
  }

  clearPreviewTimer();

  const reasonKeys = overlayState.selectedReasonKeys || [];
  if (reasonKeys.length === 0) {
    overlayState.previewMessage = "";
    overlayState.previewSubject = "";
    overlayState.previewError = "";
    overlayState.previewLoading = false;
    renderOverlay();
    return;
  }

  overlayState.previewLoading = true;
  overlayState.previewError = "";
  const requestId = (overlayState.previewRequestId || 0) + 1;
  overlayState.previewRequestId = requestId;

  overlayState.previewTimer = setTimeout(async () => {
    try {
      const reasonLookup = new Map((overlayState.reasons || []).map((reason) => [reason.external_key, reason]));
      const selectedReasons = (overlayState.selectedReasonKeys || [])
        .map((key) => reasonLookup.get(key))
        .filter(Boolean);
      const currentThingType = overlayState?.resolved?.thingType || (String(overlayState.fullname || "").startsWith("t3_") ? "submission" : "comment");
      const filteredReasons = selectedReasons.filter((reason) => isReasonForThing(reason, currentThingType));
      const author = String(overlayState?.resolved?.author || "");
      const subreddit = normalizeSubreddit(overlayState?.resolved?.subreddit || parseSubredditFromPath(window.location.pathname));
      const kind = currentThingType === "submission" ? "post" : "comment";
      const previewMessage = buildRemovalPreviewMessage(
        overlayState.removalConfig,
        filteredReasons,
        author,
        kind,
        subreddit,
        overlayState.inputValues || {},
      );
      const previewSubject = buildRemovalPreviewSubject(
        overlayState.removalConfig,
        author,
        kind,
        subreddit,
      );
      if (!overlayState || overlayState.previewRequestId !== requestId) {
        return;
      }
      overlayState.previewMessage = previewMessage;
      overlayState.previewSubject = previewSubject;
      overlayState.previewError = "";
    } catch (error) {
      if (!overlayState || overlayState.previewRequestId !== requestId) {
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      overlayState.previewError = message;
      overlayState.previewMessage = "";
      overlayState.previewSubject = "";
    } finally {
      if (overlayState && overlayState.previewRequestId === requestId) {
        overlayState.previewLoading = false;
        renderOverlay();
      }
    }
  }, 200);
}

// ============================================================================
// MODLOG UTILITIES
// ============================================================================

function extractModlogEntriesFromPayload(payload) {
  const rows = Array.isArray(payload?.data?.children) ? payload.data.children : [];
  const byTarget = new Map();
  rows.forEach((row) => {
    const data = row?.data || {};
    const target = String(data?.target_fullname || "").trim().toLowerCase();
    if (!/^t[13]_[a-z0-9]{5,10}$/i.test(target)) {
      return;
    }
    const entry = {
      action: String(data?.action || "").trim() || "unknown",
      mod: String(data?.mod || "").trim() || "unknown",
      createdUtc: Number(data?.created_utc || 0),
      details: String(data?.details || "").trim(),
    };
    const list = byTarget.get(target) || [];
    list.push(entry);
    byTarget.set(target, list);
  });

  byTarget.forEach((list) => {
    list.sort((a, b) => (b.createdUtc || 0) - (a.createdUtc || 0));
  });

  return byTarget;
}

// ============================================================================
// QUEUE LISTING UTILITIES
// ============================================================================

function isQueueListingPage(pathname = window.location.pathname) {
  const path = String(pathname || "");
  const result = /\/about\/(modqueue|unmoderated|reports)(?:\/|$)/i.test(path) ||
         /\/mod\/\w+\/queue(?:\/|$)/i.test(path);
  console.log("[ModBox] isQueueListingPage: pathname=", path, "result=", result);
  return result;
}

function getThingTypeLabelFromFullname(fullname) {
  return String(fullname || "").toLowerCase().startsWith("t3_") ? "post" : "comment";
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

  const postId = parsePostIdFromPath(window.location.pathname);
  if (postId) {
    return `t3_${postId}`;
  }

  if (isRedditCommentPath(window.location.pathname)) {
    return window.location.href;
  }

  return null;
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
