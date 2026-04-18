// ════════════════════════════════════════════════════════════════════════════════════════════════
// Canned Replies Injector Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Injects canned reply buttons next to Reddit reply forms and manages the dropdown UI.
// Replicates the exact behavior of the original CannedReplys extension.
// Dependencies: constants.js, state.js, utilities.js, wiki-loader.js

let cannedRepliesDropdown = null;
let cannedRepliesConfig = null;
let cannedRepliesLoadPromise = null;

function initCannedRepliesInjector() {
  console.log("[ModBox] Initializing canned replies injector");
  
  // Initial injection  
  injectButtons();
  
  // Watch for new reply boxes (exactly like original extension)
  const observer = new MutationObserver(injectButtons);
  observer.observe(document.body, { childList: true, subtree: true });
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

// Inject button next to all reply boxes (exactly like original extension)
function injectButtons() {
  document.querySelectorAll('form.usertext').forEach(form => {
    if (form.querySelector('.rrw-canned-reply-btn')) return;
    
    const btn = document.createElement('button');
    // Use Unicode escape sequence for emoji to avoid encoding issues
    btn.textContent = '\uD83D\uDCAC'; // 💬
    btn.className = 'rrw-canned-reply-btn';
    btn.style.marginLeft = '6px';
    btn.type = 'button'; // Prevent form submission
    
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      openGui(form, btn);
    };
    
    const footer = form.querySelector('.usertext-buttons');
    if (footer) footer.appendChild(btn);
  });
}

// Open GUI as modal popup (matching ModBox overlay style)
async function openGui(form, anchorBtn) {
  const config = await loadCannedRepliesIfNeeded();
  const responses = config?.replies || [];
  
  if (!responses.length) {
    alert('No canned replies found. Check your wiki config.');
    return;
  }
  
  closeGui();
  
  // Ensure overlay root exists
  const overlayRoot = ensureOverlayRoot();
  
  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'rrw-overlay-backdrop';
  backdrop.id = 'cannedRepliesBackdrop';
  backdrop.onclick = (e) => {
    if (e.target === backdrop) closeGui();
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
  
  // Create grid container for buttons (same as rrw-quick-actions-grid)
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
      onSelectReply(form, resp);
    };
    
    grid.appendChild(btn);
  });
  
  modal.appendChild(grid);
  
  // Add to overlay root
  overlayRoot.appendChild(backdrop);
  overlayRoot.appendChild(modal);
  
  console.log("[ModBox] Opened canned replies modal with", responses.length, "replies in 3-column grid");
  
  // Close on click outside modal
  setTimeout(() => {
    document.addEventListener('mousedown', (e) => {
      if (!modal.contains(e.target) && !anchorBtn.contains(e.target)) {
        closeGui();
      }
    }, { once: true });
  }, 0);
}

function closeGui() {
  const modal = document.getElementById('cannedRepliesModal');
  const backdrop = document.getElementById('cannedRepliesBackdrop');
  if (modal) modal.remove();
  if (backdrop) backdrop.remove();
}

function clickAway(e) {
  const modal = document.getElementById('cannedRepliesModal');
  if (modal && !modal.contains(e.target)) closeGui();
}

// On reply select
function onSelectReply(form, resp) {
  const textarea = form.querySelector('textarea');
  if (!textarea) return;
  
  // Always just fill the text - no auto-submit by default
  textarea.value = resp.content;
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.dispatchEvent(new Event('change', { bubbles: true }));
  textarea.focus();
  closeGui();
}
