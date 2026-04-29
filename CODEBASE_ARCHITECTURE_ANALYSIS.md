# ModBox Extension Codebase Architecture Analysis

## 1. Main Architecture Pattern & Event Handling

### Architecture Overview
ModBox uses a **Content Script + Background Service Worker** architecture (Chrome MV3 manifest):
- **Content Script** (`content.js`): Runs on Reddit pages, handles DOM manipulation, user interactions, and UI rendering
- **Background Service Worker** (`background.js`): Handles OAuth tokens, API requests, and preference storage
- **Modular Feature System**: Each feature is isolated in `/modules/features/` with clear dependencies

### Event Handling Flow

**Three-tier event capture system:**
1. **Native Click Interception** → Captures Reddit's native remove/lock buttons
2. **Pointer State Guard** → Uses `pointerdown`/`pointerup` to track when user is mid-click
3. **MutationObserver** → Detects new DOM additions for progressive enhancement

```javascript
// From main.js - Core event binding pattern
document.addEventListener("pointerdown", () => { isPointerDown = true; }, true);
document.addEventListener("pointerup", () => {
  isPointerDown = false;
  if (deferredRenders.size > 0) {
    // Defers full DOM replacements until click is complete
    requestAnimationFrame(() => { renderOverlay(); });
  }
}, true);

// MutationObserver for dynamic content
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});
```

**Click Event Binding Pattern:**
- Uses event delegation with `addEventListener("click", handler, useCapture=true)`
- Target resolution: Finds closest `shreddit-post`, `shreddit-comment`, `article`, or `.thing.comment` container
- Stores last interacted target in `lastInteractedTarget` variable for reference in overlays

---

## 2. Existing Ban/Moderation Action Functionality

### Comprehensive Moderation Actions Available

ModBox implements full Reddit moderator actions through two channels:

#### A. **Native Session Actions** (via `reddit-api.js`)
Direct API calls using Reddit's session credentials:

```javascript
// Core removal/approval actions
async function removeThingViaNativeSession(fullname, spam = false)
async function approveThingViaNativeSession(fullname)
async function lockThingViaNativeSession(fullname)
async function unlockThingViaNativeSession(fullname)
async function distinguishThingViaNativeSession(fullname, sticky = false)

// User actions
async function banUserViaNativeSession({ subreddit, username, durationDays, banMessage, note })
async function unbanUserViaNativeSession({ subreddit, username })

// Flair operations
async function applyFlairViaNativeSession({ subreddit, flairTemplateId, username, linkFullname })

// Comment posting
async function postCommentViaNativeSession(parentFullname, text)
async function sendRemovalCommentAsSubreddit(fullname, message, lockComment = false)

// Modmail
async function sendModmailViaReddit({ subreddit, to, subject, body, isAuthorHidden })
async function archiveModmailConversationViaReddit(conversationId)
```

#### B. **Removal Workflow with Config**
From `overlay.js` - Complex removal with custom messages and playbooks:

```javascript
// Typical removal flow:
1. removeThingViaNativeSession(fullname) // Remove the post/comment
2. sendRemovalCommentAsSubreddit(fullname, message, lockComment) // Post removal reason
3. optionally: postPlaybookCommentStepViaNativeSession(step, parent, text)
```

#### C. **Action Invocation Points**

**From Overlay (Main ModBox UI):**
- Lines 1189-1191: Remove + send comment
- Lines 1425: Spam removal
- Lines 1725: Ban user with modal form
- Lines 1769: Unban user
- Lines 2059-2066: Approve/spam quick actions

**From Comment Nuke Feature:**
- Line 333 in `comment-nuke.js`: Bulk removes for all user's comments

**From Queue Tools (Bulk Actions):**
- Modular bulk action execution for queue pages

---

## 3. Modmail Features (`modmail.js`)

### Current Status: STUBS (Phase 2 Implementation)

**Implemented Functions (Stubs):**
```javascript
// Stub structures defined but not fully implemented:
async function openModmailView(conversationId, subreddit)
function renderModmailView()
function closeModmailView()
async function fetchModmailConversation(subreddit, conversationId)
async function sendModmailReply(subreddit, conversationId, replyText)
async function archiveModmailConversation(subreddit, conversationId)
async function highlightModmailConversation(subreddit, conversationId, highlighted = true)
```

**Existing Working Modmail API:**
From `reddit-api.js` (lines 667-703):
```javascript
async function sendModmailViaReddit({ subreddit, to, subject, body, isAuthorHidden = true })
async function archiveModmailConversationViaReddit(conversationId)
```

**Modmail Detection:**
```javascript
function isModmailConversationPage() {
  const host = String(window.location.hostname || "").toLowerCase();
  const path = String(window.location.pathname || "").toLowerCase();
  if (host !== "www.reddit.com") return false;
  // Match /mail/{category}/{conversationId} – e.g. /mail/all/3acg45
  return /^\/mail\/[^/]+\/\w/.test(path);
}
```

---

## 4. Link Click Handling & Event Listeners for Links

### Current Link Handling

**URL Parsing Pattern:**
From `utilities.js`:
```javascript
function formatRedditByIdUrl(fullname, linkHostPreference, useOldReddit) {
  const host = resolveRedditLinkHost(linkHostPreference, useOldReddit);
  return `https://${host}/by_id/${String(fullname).toLowerCase()}`;
}

// Used to generate links in queue bar and other features
```

**Link Click Interception Points:**

1. **Context Popup Links** (`context-popup.js`, line 602):
```javascript
document.addEventListener("click", (event) => {
  // Detect and handle context popup link clicks
  // Routes to openContextPopup(contextJsonUrl, targetCommentId, clickPoint)
});
```

2. **Old Reddit Context Popup Reply Links** (`context-popup.js`):
```javascript
function bindOldRedditContextPopupLinks() {
  // Binds special handling for old.reddit.com's reply pill links
}
```

3. **Native Remove Button Interception** (`core-ui.js`):
```javascript
function bindNativeRemoveInterceptor() {
  document.addEventListener("pointerdown", (event) => {
    // Tracks which container user clicked in
    const container = findClosestActionContainer(targetEl);
    lastInteractedTarget = pickTargetForContainer(container);
  });
}
```

### Link Interception Feasibility: **YES, VERY FEASIBLE**

**Key Capabilities:**
- ✅ Event delegation system already in place via `document.addEventListener`
- ✅ Target resolution system (`pickTargetForContainer`, `resolveTargetFromNativeControl`)
- ✅ URL parsing utilities (`parseTargetToFullname`, `parseUrl`)
- ✅ Already intercepts native Reddit buttons and links
- ✅ Uses capture phase (`useCapture=true`) for early event interception

**How Link Interception Works Currently:**
```javascript
// Example from context-popup.js
document.addEventListener("click", (event) => {
  const targetEl = event.target;
  if (targetEl instanceof Element) {
    // Check if it's a specific type of link
    if (targetEl.matches("a[data-context-url]")) {
      event.preventDefault(); // Prevent default navigation
      const url = targetEl.getAttribute("data-context-url");
      openContextPopup(url); // Execute custom handler
    }
  }
}, true); // true = capture phase (fires before bubbling)
```

---

## 5. DOM Manipulation & Content Script Capabilities

### Content Script Capabilities

**Permissions (manifest.json):**
```json
"permissions": ["storage", "cookies"],
"host_permissions": [
  "https://www.reddit.com/*",
  "https://old.reddit.com/*",
  "https://sh.reddit.com/*",
  "https://mod.reddit.com/*",
  "https://oauth.reddit.com/*"
],
"content_scripts": [{
  "matches": ["https://www.reddit.com/*", "https://old.reddit.com/*", "https://sh.reddit.com/*"],
  "js": ["content.js"],
  "run_at": "document_idle"
}]
```

### DOM Manipulation Patterns

**1. Container Detection System** (from `dom-binding.js` & `core-ui.js`):
```javascript
const BINDABLE_CONTAINER_SELECTORS = [
  "article",              // New Reddit posts
  "shreddit-post",        // New Reddit web component
  "shreddit-comment",     // New Reddit web component
  ".Comment",             // New Reddit old CSS class
  ".thing.link",          // Old Reddit post
  ".thing.comment",       // Old Reddit comment
  "mod-queue-list-item"   // Mod queue items
];

// Dynamically binds to all matching containers
function collectBindableContainersFromDocument(collector) {
  document.querySelectorAll(BINDABLE_CONTAINER_SELECTOR).forEach((el) => collector.add(el));
}
```

**2. Root Element Management** (from `overlay.js`):
```javascript
function ensureOverlayRoot() {
  let root = document.getElementById(OVERLAY_ROOT_ID);
  if (!root) {
    root = document.createElement("div");
    root.id = OVERLAY_ROOT_ID;
    document.body.appendChild(root); // Append to body, not documentElement
  }
  // Apply current theme to root
  const activeTheme = resolveActiveTheme(currentThemeMode);
  root.setAttribute("data-rrw-theme", activeTheme);
  return root;
}
```

**3. Target Resolution** (from `core-ui.js`):
```javascript
function pickTargetForContainer(container) {
  // Priority 1: Direct attributes (id, data-fullname, data-post-id)
  const directId = container.getAttribute("id");
  if (directId && directId.includes("_") && directId.startsWith("t1_")) {
    return directId;
  }
  
  // Priority 2: Other direct attributes
  const dataFullname = container.getAttribute("data-fullname");
  if (dataFullname && dataFullname.startsWith("t1_")) return dataFullname;
  
  // Priority 3: Extract from links (fallback)
  const permalinkSelectors = [
    "a[data-testid='post_title']",
    "a[href*='/comments/']",
    "[slot='title'] a"
  ];
  for (const selector of permalinkSelectors) {
    const link = container.querySelector(selector);
    const postId = link ? parsePostIdFromPath(link.href) : null;
    if (postId) return isComment ? `t1_${postId}` : `t3_${postId}`;
  }
}
```

**4. Safe DOM Rendering with Pointer Guard**:
```javascript
// From main.js - Prevents DOM destruction during clicks
let isPointerDown = false;
const deferredRenders = new Set();

// When rendering is needed during a click, defer it
if (isPointerDown) {
  deferredRenders.add("overlay"); // Mark for deferred render
} else {
  renderOverlay(); // Render immediately
}

// After click completes, process deferred renders
document.addEventListener("pointerup", () => {
  isPointerDown = false;
  if (deferredRenders.size > 0) {
    requestAnimationFrame(() => {
      if (deferredRenders.has("overlay")) renderOverlay();
    });
  }
}, true);
```

**5. HTML Escaping & Security**:
```javascript
// From utilities.js - Prevents XSS
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
```

### Advanced Features

**State Capture & Restore** (from `overlay.js`):
```javascript
function captureOverlayViewState(root) {
  const state = {
    modalScrollTop: modal?.scrollTop || 0,
    activeTarget: null,
    selectionStart: null,
    selectionEnd: null
  };
  // Captures focused element and text selection for restoration
  return state;
}

function restoreOverlayViewState(root, state) {
  // Restores scroll position, focus, and selection after re-renders
}
```

**Queue Page Detection**:
```javascript
function isQueueListingPage(pathname = window.location.pathname) {
  return /\/about\/(modqueue|unmoderated|reports)(?:\/|$)/i.test(String(pathname || ""));
}
```

---

## 6. Action Handler Patterns & Code Examples

### General Pattern for Executing Actions

**Example: Remove + Send Comment Workflow** (from `overlay.js` lines 1189-1191):
```javascript
async function executeRemovalWithComment() {
  try {
    const fullname = lastInteractedTarget;
    const removalReason = getSelectedRemovalReasonContent();
    
    // Step 1: Remove the content
    await removeThingViaNativeSession(fullname);
    
    // Step 2: Post removal comment as subreddit
    await sendRemovalCommentAsSubreddit(fullname, removalReason, lockComment = false);
    
    // Step 3: Show success toast
    showToast("✓ Content removed and reason posted", "success");
    
    // Step 4: Auto-close overlay if configured
    if (autoCloseOnRemove) {
      closeOverlay();
    }
  } catch (error) {
    showToast(`Error: ${error.message}`, "error");
  }
}
```

**Example: Ban User Workflow** (from `overlay.js` lines 1725):
```javascript
async function executeBanUser() {
  await banUserViaNativeSession({
    subreddit: overlayState.resolved.subreddit,
    username: overlayState.resolved.author,
    durationDays: formData.banDurationDays,
    banMessage: formData.banMessage,
    note: formData.banNote
  });
  showToast("✓ User banned", "success");
}
```

**Example: Bulk Queue Action** (from `queue-tools.js`):
```javascript
async function bulkRemoveSelectedItems() {
  const selectedTargets = Array.from(queueToolsSelectedTargets);
  
  for (const target of selectedTargets) {
    try {
      await removeThingViaNativeSession(target, spam = false);
      queueToolsSelectedTargets.delete(target);
    } catch (error) {
      queueToolsErrorMessage = error.message;
    }
  }
  
  renderQueueToolsBar(collectQueueListingItems());
}
```

---

## 7. State Management System

**Global State Variables** (from `state.js`):
```javascript
let overlayState = null;              // Main moderation overlay
let removalConfigEditorState = null;  // Config editor state
let usernotesEditorState = null;      // Usernotes editor state
let queueBarLastState = null;         // Queue bar display state
let contextPopupState = null;         // Context popup state
let profileViewState = null;          // Profile view state
let lastInteractedTarget = "";        // Last clicked post/comment target
let lastInteractedAt = 0;             // Timestamp of last interaction
```

**Cache Management**:
```javascript
const usernotesCache = new Map();     // In-memory usernotes cache
const backgroundRequestCache = new Map(); // API response cache
const backgroundRequestInflight = new Map(); // Deduplication
const queueToolsSelectedTargets = new Set(); // Selected items for bulk actions
```

---

## Summary Table

| Aspect | Status | Key Files |
|--------|--------|-----------|
| **Architecture** | ✅ Complete | main.js, core-ui.js, dom-binding.js |
| **Event Handling** | ✅ Robust | Uses capture phase, pointer guards, MutationObserver |
| **Ban/Remove Actions** | ✅ Full | reddit-api.js, overlay.js |
| **Modmail Features** | ⚠️ Partial | Stubs defined, send/archive working |
| **Link Interception** | ✅ Feasible | Pattern exists, could extend easily |
| **DOM Manipulation** | ✅ Advanced | Smart container detection, safe rendering |
| **Click Handling** | ✅ Event-based | Delegation, capture phase, deferred renders |

---

## Recommended Integration Points for New Features

1. **Link Interception**: Add listener in `main.js` during `start()` function
2. **Custom Actions**: Extend action functions in `reddit-api.js`
3. **UI Components**: Add to overlay in `overlay.js` render functions
4. **Bulk Operations**: Integrate with `queue-tools.js` selection system
5. **User Targeting**: Leverage existing target resolution in `core-ui.js`
