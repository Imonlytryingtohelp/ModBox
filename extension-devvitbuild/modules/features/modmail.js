// ════════════════════════════════════════════════════════════════════════════════════════════════
// Modmail Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Modmail conversation viewing and reply functionality.
// Dependencies: constants.js, state.js, utilities.js, services/reddit-api.js, features/overlay.js

const MODMAIL_VIEW_DEFAULTS = {
  conversationId: "",
  conversationSubreddit: "",
  messages: [],
  participants: [],
  status: "all",          // all, archived, highlighted
  isLoading: false,
  error: "",
  replyDraft: "",
  isReplying: false,
};

// ──── Helper Functions ────

function formatModmailMessage(message) {
  if (!message) return "";
  const author = message.author?.name || "Unknown";
  const timestamp = new Date(Number(message.created_at || 0) * 1000).toLocaleDateString();
  const bodyPreview = message.body?.substring(0, 100) || "No content";
  return `From: ${author} [${timestamp}]\n${bodyPreview}`;
}

function parseModmailParticipants(conversation) {
  if (!conversation || !conversation.participants) return [];
  return Array.isArray(conversation.participants) ? conversation.participants.map((p) => ({
    name: p.name || "Unknown",
    isAuthor: p.is_author === true,
    isAdmin: p.is_admin === true,
    isMod: p.is_mod === true,
  })) : [];
}

function buildModmailReplyText(conversation, replyText) {
  // Stub: Format reply text for modmail
  return String(replyText || "").trim();
}

// ──── Main Functions (STUBS - Rendering Phase 2) ────

async function openModmailView(conversationId, subreddit) {
  // Stub: Initialize modmail view state, fetch conversation messages
  // Render modmail overlay with message thread and reply box
}

function renderModmailView() {
  // Stub: Render modmail conversation thread with messages
  // Include reply box, archive/highlight buttons
}

function closeModmailView() {
  modmailViewState = null;
  const root = document.getElementById(OVERLAY_ROOT_ID);
  if (!root) return;
  root.querySelectorAll(".rrw-modmail-view-backdrop, .rrw-modmail-view-container").forEach((el) => el.remove());
  if (!overlayState && !usernotesEditorState && !removalConfigEditorState && !inlineHistoryPopupState && !inlineModlogPopupState && !commentNukeState && !contextPopupState && !profileViewState && !root.children.length) {
    root.remove();
  }
}

async function fetchModmailConversation(subreddit, conversationId) {
  // Stub: Fetch modmail conversation thread from API
  // Returns array of messages with metadata
}

async function sendModmailReply(subreddit, conversationId, replyText) {
  // Stub: Send reply to modmail conversation
  // Returns result { success, error, messageId }
}

async function archiveModmailConversation(subreddit, conversationId) {
  // Stub: Archive modmail conversation
  // Removes from unread/active conversations
}

async function highlightModmailConversation(subreddit, conversationId, highlighted = true) {
  // Stub: Toggle modmail conversation highlight/star status
}
