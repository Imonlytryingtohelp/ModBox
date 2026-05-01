// ════════════════════════════════════════════════════════════════════════════════════════════════
// ModBox Link Handler Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Handles specially formatted modbox:// protocol links for executing moderation actions.
// Supports: modbox://ban?user=username&reason=message&note=usernote&durationDays=30&notetype=BAN
// Parameters:
//   - user (required): Username to ban
//   - reason (optional): Ban message/reason
//   - note (optional): User note to add (added to toolbox usernotes)
//   - notetype (optional): Type of note to add (e.g., BAN, WARNING, etc. - toolbox note type)
//   - durationDays (optional): Ban duration in days. Omit for permanent ban
//   - subreddit (optional): Subreddit to ban from (auto-detected if not provided)
// Dependencies: constants.js, utilities.js, services/reddit-api.js, features/usernotes.js

// ────────────────────────────────────────────────────────────────────────────────────────────────
// URL Parsing & Validation
// ────────────────────────────────────────────────────────────────────────────────────────────────

function parseModboxLink(href) {
  try {
    const url = new URL(href);
    if (url.protocol !== "modbox:") {
      return null;
    }

    const action = url.hostname.toLowerCase();
    const params = Object.fromEntries(url.searchParams);

    if (action === "ban") {
      const username = String(params.user || "").trim();
      const reason = String(params.reason || "").trim();
      const note = String(params.note || "").trim();
      const subreddit = String(params.subreddit || "").trim();
      const durationDays = params.durationDays ? parseInt(params.durationDays, 10) : undefined;
      const notetype = String(params.notetype || "").trim();

      if (!username) {
        return { error: "Missing 'user' parameter in modbox://ban link" };
      }

      // Validate durationDays if provided
      if (params.durationDays && (isNaN(durationDays) || durationDays < 0)) {
        return { error: "Invalid 'durationDays' parameter - must be a non-negative number" };
      }

      return {
        action: "ban",
        username,
        banMessage: reason || "",
        note: note || "",
        subreddit: subreddit || null,
        durationDays: durationDays,
        notetype: notetype || null,
      };
    }

    return { error: `Unknown modbox:// action: ${action}` };
  } catch (err) {
    return { error: `Failed to parse modbox link: ${getSafeErrorMessage(err)}` };
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Subreddit Detection
// ────────────────────────────────────────────────────────────────────────────────────────────────

function detectSubredditFromURL() {
  const subreddit = parseSubredditFromPath(window.location.pathname);
  return subreddit ? normalizeSubreddit(subreddit) : null;
}

function detectSubredditFromModmail() {
  // Look for the "to" field in modmail which shows the subreddit
  // Common selectors for modmail "to" field
  const toSelectors = [
    "[data-test-id='modmail-to-field']",
    ".mc-modmail-to",
    "[class*='to'][class*='modmail']",
    ".modmail-recipient",
  ];

  for (const selector of toSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent || "";
      const match = text.match(/r\/([a-zA-Z0-9_-]+)/i);
      if (match) {
        return normalizeSubreddit(match[1]);
      }
    }
  }

  // Fallback: search for "to:" text in the modmail body
  const bodyText = document.body.textContent || "";
  const match = bodyText.match(/To:\s*r\/([a-zA-Z0-9_-]+)/i);
  if (match) {
    return normalizeSubreddit(match[1]);
  }

  return null;
}

function getSubredditForBanAction() {
  // Try URL first
  let subreddit = detectSubredditFromURL();
  if (subreddit) {
    return subreddit;
  }

  // Try modmail "to" field
  subreddit = detectSubredditFromModmail();
  if (subreddit) {
    return subreddit;
  }

  return null;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Action Execution
// ────────────────────────────────────────────────────────────────────────────────────────────────

async function executeModboxBanAction(params, subreddit) {
  const cleanSubreddit = normalizeSubreddit(subreddit);
  if (!cleanSubreddit) {
    throw new Error("Could not determine subreddit for ban action");
  }

  const banOptions = {
    subreddit: cleanSubreddit,
    username: params.username,
    banMessage: params.banMessage,
    note: params.note,
  };

  // Add optional duration (if undefined, results in permanent ban)
  if (params.durationDays !== undefined) {
    banOptions.durationDays = params.durationDays;
  }

  // Add optional notetype
  if (params.notetype) {
    banOptions.notetype = params.notetype;
  }

  await banUserViaNativeSession(banOptions);

  // Add toolbox usernote if note text is provided
  if (params.note) {
    try {
      await addUsernoteViaReddit(
        cleanSubreddit,
        params.username,
        params.note,
        params.notetype || "none"
      );
      console.log("[ModBox Link Handler] Usernote added for", params.username);
    } catch (err) {
      const errorMsg = getSafeErrorMessage(err);
      console.warn("[ModBox Link Handler] Failed to add usernote:", errorMsg);
      // Don't throw - ban succeeded even if usernote failed
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────
// User Feedback Toast
// ────────────────────────────────────────────────────────────────────────────────────────────────

function showModboxLinkToast(message, isError = false, duration = 3000) {
  const toast = document.createElement("div");
  toast.className = `rrw-modbox-link-toast ${isError ? "error" : "success"}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${isError ? "#d32f2f" : "#388e3c"};
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    animation: fadeInOut ${duration}ms ease-in-out;
  `;

  // Add animation styles if not already present
  if (!document.getElementById("rrw-modbox-link-toast-styles")) {
    const style = document.createElement("style");
    style.id = "rrw-modbox-link-toast-styles";
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(10px); }
        10% { opacity: 1; transform: translateY(0); }
        90% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(10px); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Link Display Text Generation
// ────────────────────────────────────────────────────────────────────────────────────────────────

function generateModboxLinkDisplayText(href) {
  try {
    const parsed = parseModboxLink(href);
    if (parsed.error) {
      return "[ModBox Link]";
    }

    if (parsed.action === "ban") {
      let text = `[Ban] u/${parsed.username}`;
      if (parsed.durationDays !== undefined) {
        text += ` (${parsed.durationDays}d)`;
      }
      return text;
    }

    return "[ModBox Link]";
  } catch (err) {
    return "[ModBox Link]";
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Event Binding
// ────────────────────────────────────────────────────────────────────────────────────────────────

function bindModboxLinkHandler() {
  document.addEventListener("click", async (event) => {
    // Find the closest link element
    const link = event.target.closest("a");
    if (!link) {
      return;
    }

    const href = link.getAttribute("href") || "";
    if (!href.startsWith("modbox://")) {
      return;
    }

    // Prevent default link behavior
    event.preventDefault();
    event.stopPropagation();

    // Parse the link
    const parsed = parseModboxLink(href);
    if (parsed.error) {
      console.error("[ModBox Link Handler]", parsed.error);
      showModboxLinkToast(parsed.error, true);
      return;
    }

    try {
      // Use subreddit from link if provided, otherwise detect it from page
      let subreddit = parsed.subreddit || getSubredditForBanAction();
      if (!subreddit) {
        throw new Error("Could not determine subreddit (not on a moderated subreddit page or valid modmail)");
      }

      // Show immediate toast that ban process has started
      showModboxLinkToast(">>> Ban process started...", false, 2000);

      // Execute the action
      if (parsed.action === "ban") {
        await executeModboxBanAction(parsed, subreddit);
        
        // Build user feedback message
        let toastMessage = `[SUCCESS] Banned u/${parsed.username} in r/${subreddit}`;
        if (parsed.durationDays !== undefined) {
          toastMessage += ` for ${parsed.durationDays} day${parsed.durationDays !== 1 ? 's' : ''}`;
        } else {
          toastMessage += " permanently";
        }
        if (parsed.notetype) {
          toastMessage += ` (${parsed.notetype})`;
        }
        if (parsed.note) {
          toastMessage += " + note";
        }
        
        showModboxLinkToast(toastMessage);
        console.log("[ModBox Link Handler] Ban action completed for", parsed.username);
      }
    } catch (err) {
      const errorMsg = getSafeErrorMessage(err);
      console.error("[ModBox Link Handler] Action failed:", errorMsg);
      showModboxLinkToast(`[ERROR] Ban failed: ${errorMsg}`, true);
    }
  }, true); // Use capture phase for early interception
}

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Raw URL Linkification
// ────────────────────────────────────────────────────────────────────────────────────────────────

const MODBOX_URL_REGEX = /modbox:\/\/[a-z]+\?[^\s<>"']+/gi;

function linkifyModboxURLsInNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    if (!MODBOX_URL_REGEX.test(text)) {
      return;
    }

    // Reset regex position
    MODBOX_URL_REGEX.lastIndex = 0;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match;

    while ((match = MODBOX_URL_REGEX.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        fragment.appendChild(
          document.createTextNode(text.substring(lastIndex, match.index))
        );
      }

      // Create link for match
      const link = document.createElement("a");
      link.href = match[0];
      link.title = match[0]; // Show full URL in tooltip
      link.textContent = generateModboxLinkDisplayText(match[0]);
      link.style.cssText = `
        color: #0079d3;
        text-decoration: underline;
        cursor: pointer;
        font-weight: 500;
      `;
      fragment.appendChild(link);

      lastIndex = MODBOX_URL_REGEX.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
    }

    // Replace node with fragment
    node.parentNode.replaceChild(fragment, node);
  } else if (
    node.nodeType === Node.ELEMENT_NODE &&
    !["SCRIPT", "STYLE", "CODE", "PRE", "A"].includes(node.tagName)
  ) {
    // Recursively process child nodes, but skip certain elements
    for (let i = 0; i < node.childNodes.length; i++) {
      linkifyModboxURLsInNode(node.childNodes[i]);
    }
  }
}

function linkifyModboxURLsInPage() {
  // Skip if already processing
  if (document.documentElement.hasAttribute("data-rrw-linkifying")) {
    return;
  }

  document.documentElement.setAttribute("data-rrw-linkifying", "1");

  try {
    // Focus on content areas where modmail/messages appear
    const contentAreas = [
      document.querySelector("[role='main']"),
      document.querySelector(".md-container"),
      document.querySelector(".md"),
      document.querySelector(".message-body"),
      document.body,
    ].filter(Boolean);

    for (const area of contentAreas) {
      if (area) {
        linkifyModboxURLsInNode(area);
      }
    }
  } catch (err) {
    console.error("[ModBox Link Handler] Linkification error:", err);
  } finally {
    document.documentElement.removeAttribute("data-rrw-linkifying");
  }
}

function initModboxURLLinkifier() {
  // Do an initial pass on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", linkifyModboxURLsInPage);
  } else {
    linkifyModboxURLsInPage();
  }

  // Watch for new content
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
            linkifyModboxURLsInNode(node);
          }
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log("[ModBox] Raw URL linkifier initialized");
}

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Initialization
// ────────────────────────────────────────────────────────────────────────────────────────────────

function initModboxLinkHandler() {
  bindModboxLinkHandler();
  initModboxURLLinkifier();
  console.log("[ModBox] Modbox link handler initialized");
}
