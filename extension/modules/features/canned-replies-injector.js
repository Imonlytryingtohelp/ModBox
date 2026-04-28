// ════════════════════════════════════════════════════════════════════════════════════════════════
// Canned Replies Injector Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Provides canned reply functionality accessible from the ModBox Queue Bar.
// Copies selected replies to the clipboard for easy pasting.
// Dependencies: constants.js, state.js, utilities.js, wiki-loader.js

let cannedRepliesConfig = null;
let cannedRepliesLoadPromise = null;

function initCannedRepliesInjector() {
  console.log("[ModBox] Initializing canned replies injector");
  // Injector is now accessed via queue bar button only
}

async function loadCannedRepliesIfNeeded() {
  // If already loaded or loading, return the promise
  if (cannedRepliesConfig) {
    console.log("[ModBox] Using cached canned replies:", cannedRepliesConfig);
    return cannedRepliesConfig;
  }
  
  if (cannedRepliesLoadPromise) {
    return cannedRepliesLoadPromise;
  }
  
  // Load from wiki
  cannedRepliesLoadPromise = (async () => {
    try {
      const subreddit = parseSubredditFromPath(window.location.pathname);
      console.log("[ModBox] Canned replies: parsed subreddit =", subreddit);
      
      if (!subreddit) {
        console.warn("[ModBox] No subreddit found on page");
        cannedRepliesConfig = buildDefaultCannedRepliesConfig("");
        return cannedRepliesConfig;
      }
      
      console.log("[ModBox] Loading canned replies from wiki for subreddit:", subreddit);
      const config = await loadCannedRepliesFromWiki(subreddit);
      console.log("[ModBox] Wiki returned config:", config);
      
      cannedRepliesConfig = normalizeCannedRepliesDoc(config, subreddit);
      console.log("[ModBox] Normalized canned replies config:", cannedRepliesConfig);
      
      return cannedRepliesConfig;
    } catch (err) {
      console.error("[ModBox] Error loading canned replies:", err);
      const subreddit = parseSubredditFromPath(window.location.pathname);
      cannedRepliesConfig = buildDefaultCannedRepliesConfig(subreddit || "");
      return cannedRepliesConfig;
    }
  })();
  
  return cannedRepliesLoadPromise;
}

// Open GUI as modal popup from queue bar
async function openCannedRepliesModal() {
  console.log("[ModBox] openCannedRepliesModal called");
  const config = await loadCannedRepliesIfNeeded();
  const responses = config?.replies || [];
  
  console.log("[ModBox] Got responses:", responses.length);
  
  if (!responses.length) {
    alert('No canned replies found. Check your wiki config.');
    return;
  }
  
  closeCannedRepliesModal();
  
  console.log("[ModBox] Creating canned replies modal overlay");
  // Ensure overlay root exists
  const overlayRoot = ensureOverlayRoot();
  
  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'rrw-overlay-backdrop';
  backdrop.id = 'cannedRepliesBackdrop';
  backdrop.onclick = (e) => {
    if (e.target === backdrop) closeCannedRepliesModal();
  };
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'rrw-overlay-modal';
  modal.id = 'cannedRepliesModal';
  
  // Create header
  const header = document.createElement('div');
  header.className = 'rrw-overlay-header';
  const title = document.createElement('h2');
  title.textContent = 'Canned Replies';
  header.appendChild(title);
  
  // Create header actions container
  const headerActions = document.createElement('div');
  headerActions.className = 'rrw-header-actions';
  
  // Add Edit button
  const editBtn = document.createElement('button');
  editBtn.className = 'rrw-btn rrw-btn-secondary';
  editBtn.type = 'button';
  editBtn.textContent = 'Edit';
  editBtn.title = 'Edit canned replies';
  editBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeCannedRepliesModal();
    openCannedRepliesEditor();
  };
  headerActions.appendChild(editBtn);
  header.appendChild(headerActions);
  
  modal.appendChild(header);
  
  // Create grid container for buttons
  const grid = document.createElement('div');
  grid.className = 'rrw-quick-actions-grid';
  grid.style.padding = '12px';
  grid.style.overflowY = 'auto';
  grid.style.maxHeight = 'calc(100vh - 120px)';
  
  // Add reply buttons to grid
  responses.forEach(resp => {
    const btn = document.createElement('button');
    btn.className = 'rrw-quick-action-btn rrw-btn rrw-btn-secondary';
    btn.type = 'button';
    btn.textContent = resp.name;
    btn.title = resp.content;
    
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onSelectCannedReply(resp);
    };
    
    grid.appendChild(btn);
  });
  
  modal.appendChild(grid);
  
  // Add to overlay root
  overlayRoot.appendChild(backdrop);
  overlayRoot.appendChild(modal);
  
  console.log("[ModBox] Opened canned replies modal with", responses.length, "replies");
  
  // Close on click outside modal
  setTimeout(() => {
    document.addEventListener('mousedown', (e) => {
      if (!modal.contains(e.target)) {
        closeCannedRepliesModal();
      }
    }, { once: true });
  }, 0);
}

function closeCannedRepliesModal() {
  const modal = document.getElementById('cannedRepliesModal');
  const backdrop = document.getElementById('cannedRepliesBackdrop');
  if (modal) modal.remove();
  if (backdrop) backdrop.remove();
}

// Show brief notification that text was copied
function showCopyNotification() {
  // Add animation keyframes if not already present
  if (!document.getElementById('cannedRepliesCopyAnimation')) {
    const style = document.createElement('style');
    style.id = 'cannedRepliesCopyAnimation';
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-20px); }
        10% { opacity: 1; transform: translateY(0); }
        90% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
      }
    `;
    document.head.appendChild(style);
  }
  
  const notification = document.createElement('div');
  notification.textContent = 'Copied to clipboard!';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    margin-left: -100px;
    width: 200px;
    text-align: center;
    background-color: #2e7d32;
    color: white;
    padding: 14px 24px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: bold;
    z-index: 999999;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    animation: fadeInOut 2s ease-in-out;
    pointer-events: none;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  `;
  
  console.log("[ModBox] Showing copy notification");
  document.documentElement.appendChild(notification);
  
  setTimeout(() => {
    console.log("[ModBox] Removing copy notification");
    notification.remove();
  }, 2000);
}

// On reply select - copy to clipboard
function onSelectCannedReply(resp) {
  navigator.clipboard.writeText(resp.content)
    .then(() => {
      console.log("[ModBox] Canned reply copied to clipboard:", resp.name);
      showCopyNotification();
      closeCannedRepliesModal();
    })
    .catch((err) => {
      console.error("[ModBox] Failed to copy to clipboard:", err);
      alert("Failed to copy to clipboard. Please try again.");
      closeCannedRepliesModal();
    });
}

// ════════════════════════════════════════════════════════════════════════════════════════════════
// CANNED REPLIES EDITOR
// ════════════════════════════════════════════════════════════════════════════════════════════════

async function openCannedRepliesEditor() {
  console.log("[ModBox] Opening canned replies editor");
  const config = await loadCannedRepliesIfNeeded();
  const replies = JSON.parse(JSON.stringify(config?.replies || [])); // Deep copy
  
  // Get current subreddit from page
  const currentSubreddit = parseSubredditFromPath(window.location.pathname);
  const subreddit = currentSubreddit || config?.subreddit || "";
  console.log("[ModBox] Editor using subreddit:", subreddit);
  
  if (!subreddit) {
    alert('Could not determine subreddit. Make sure you are on a subreddit page.');
    return;
  }
  
  closeCannedRepliesEditorModal();
  
  const overlayRoot = ensureOverlayRoot();
  
  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'rrw-overlay-backdrop';
  backdrop.id = 'cannedRepliesEditorBackdrop';
  backdrop.onclick = (e) => {
    if (e.target === backdrop) closeCannedRepliesEditorModal();
  };
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'rrw-overlay-modal';
  modal.id = 'cannedRepliesEditorModal';
  modal.style.width = 'min(800px, calc(100vw - 32px))';
  
  // Create header
  const header = document.createElement('div');
  header.className = 'rrw-overlay-header';
  const title = document.createElement('h2');
  title.textContent = 'Edit Canned Replies';
  header.appendChild(title);
  modal.appendChild(header);
  
  // Create content area
  const contentArea = document.createElement('div');
  contentArea.style.padding = '12px 16px';
  contentArea.style.overflowY = 'auto';
  contentArea.style.maxHeight = 'calc(100vh - 180px)';
  contentArea.style.borderBottom = '1px solid var(--rrw-soft-border)';
  
  // Create list of replies
  const repliesList = document.createElement('div');
  repliesList.id = 'cannedRepliesEditorList';
  repliesList.style.marginBottom = '12px';
  
  replies.forEach((reply, idx) => {
    const replyItem = createReplyEditorItem(reply, idx, replies, repliesList);
    repliesList.appendChild(replyItem);
  });
  
  contentArea.appendChild(repliesList);
  
  // Add new reply button
  const addNewBtn = document.createElement('button');
  addNewBtn.className = 'rrw-btn rrw-btn-secondary';
  addNewBtn.style.marginBottom = '12px';
  addNewBtn.textContent = '+ Add New Reply';
  addNewBtn.onclick = () => {
    replies.push({ name: '', content: '' });
    const replyItem = createReplyEditorItem(replies[replies.length - 1], replies.length - 1, replies, repliesList);
    repliesList.appendChild(replyItem);
    // Focus the new item's name field
    const nameInput = replyItem.querySelector('.reply-name-input');
    if (nameInput) nameInput.focus();
  };
  contentArea.appendChild(addNewBtn);
  
  modal.appendChild(contentArea);
  
  // Create footer with buttons
  const footer = document.createElement('div');
  footer.style.display = 'flex';
  footer.style.gap = '8px';
  footer.style.justifyContent = 'flex-end';
  footer.style.padding = '12px 16px';
  
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'rrw-btn rrw-btn-secondary';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = closeCannedRepliesEditorModal;
  footer.appendChild(cancelBtn);
  
  const saveBtn = document.createElement('button');
  saveBtn.className = 'rrw-btn rrw-btn-primary';
  saveBtn.textContent = 'Save';
  saveBtn.onclick = async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    try {
      console.log("[ModBox] Save button clicked");
      console.log("[ModBox] Subreddit:", subreddit);
      console.log("[ModBox] Replies to save:", replies);
      
      // Filter out empty replies
      const nonEmptyReplies = replies.filter(r => {
        const hasName = r.name && r.name.trim();
        const hasContent = r.content && r.content.trim();
        console.log(`[ModBox] Checking reply: name="${r.name}" (${hasName ? 'valid' : 'empty'}), content="${r.content ? r.content.substring(0, 20) + '...' : ''}" (${hasContent ? 'valid' : 'empty'})`);
        return hasName && hasContent;
      });
      
      console.log("[ModBox] Non-empty replies count:", nonEmptyReplies.length);
      
      // Update the config with modified replies
      const newConfig = {
        schema: config.schema,
        version: config.version,
        subreddit: subreddit,
        replies: nonEmptyReplies
      };
      
      console.log("[ModBox] Calling saveCannedRepliesToWiki with config:", JSON.stringify(newConfig, null, 2));
      
      await saveCannedRepliesToWiki(subreddit, newConfig, "Updated canned replies via ModBox Editor");
      
      // Clear caches so fresh data is loaded
      cannedRepliesConfig = null;
      cannedRepliesLoadPromise = null;
      
      console.log("[ModBox] Canned replies saved successfully");
      showSaveNotification();
      closeCannedRepliesEditorModal();
    } catch (err) {
      console.error("[ModBox] Failed to save canned replies:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("[ModBox] Error details:", errorMsg);
      alert("Failed to save canned replies: " + errorMsg);
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save';
    }
  };
  footer.appendChild(saveBtn);
  
  modal.appendChild(footer);
  
  overlayRoot.appendChild(backdrop);
  overlayRoot.appendChild(modal);
  
  console.log("[ModBox] Opened canned replies editor");
}

function createReplyEditorItem(reply, idx, repliesArray, container) {
  const item = document.createElement('div');
  item.className = 'reply-editor-item';
  item.style.cssText = `
    border: 1px solid var(--rrw-soft-border);
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 12px;
    background: var(--rrw-subtle-bg);
  `;
  item.dataset.index = idx;
  
  // Name field
  const nameLabel = document.createElement('label');
  nameLabel.style.cssText = `
    display: block;
    margin-bottom: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--rrw-text);
  `;
  nameLabel.textContent = 'Reply Name:';
  item.appendChild(nameLabel);
  
  const nameInput = document.createElement('input');
  nameInput.className = 'reply-name-input';
  nameInput.type = 'text';
  nameInput.value = reply.name;
  nameInput.placeholder = 'e.g., "You\'re Welcome"';
  nameInput.style.cssText = `
    width: 100%;
    padding: 8px;
    margin-bottom: 12px;
    border: 1px solid var(--rrw-soft-border);
    border-radius: 4px;
    background: var(--rrw-modal-bg);
    color: var(--rrw-text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    box-sizing: border-box;
  `;
  nameInput.onchange = () => {
    reply.name = nameInput.value;
  };
  nameInput.oninput = () => {
    reply.name = nameInput.value;
  };
  item.appendChild(nameInput);
  
  // Content field
  const contentLabel = document.createElement('label');
  contentLabel.style.cssText = `
    display: block;
    margin-bottom: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--rrw-text);
  `;
  contentLabel.textContent = 'Reply Content:';
  item.appendChild(contentLabel);
  
  const contentInput = document.createElement('textarea');
  contentInput.className = 'reply-content-input';
  contentInput.value = reply.content;
  contentInput.placeholder = 'Enter the canned reply text';
  contentInput.style.cssText = `
    width: 100%;
    padding: 8px;
    margin-bottom: 12px;
    border: 1px solid var(--rrw-soft-border);
    border-radius: 4px;
    background: var(--rrw-modal-bg);
    color: var(--rrw-text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    resize: vertical;
    min-height: 80px;
    box-sizing: border-box;
  `;
  contentInput.onchange = () => {
    reply.content = contentInput.value;
  };
  contentInput.oninput = () => {
    reply.content = contentInput.value;
  };
  item.appendChild(contentInput);
  
  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'rrw-btn rrw-btn-secondary';
  deleteBtn.style.cssText = `
    background-color: #d32f2f;
    color: white;
  `;
  deleteBtn.textContent = 'Delete';
  deleteBtn.onclick = () => {
    repliesArray.splice(idx, 1);
    item.remove();
  };
  item.appendChild(deleteBtn);
  
  return item;
}

function closeCannedRepliesEditorModal() {
  const modal = document.getElementById('cannedRepliesEditorModal');
  const backdrop = document.getElementById('cannedRepliesEditorBackdrop');
  if (modal) modal.remove();
  if (backdrop) backdrop.remove();
}

function showSaveNotification() {
  const notification = document.createElement('div');
  notification.textContent = 'Canned replies saved!';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    margin-left: -100px;
    width: 200px;
    text-align: center;
    background-color: #2e7d32;
    color: white;
    padding: 14px 24px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: bold;
    z-index: 999999;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    animation: fadeInOut 2s ease-in-out;
    pointer-events: none;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  `;
  document.documentElement.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 2000);
}
