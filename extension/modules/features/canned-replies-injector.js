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
