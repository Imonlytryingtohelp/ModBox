// ════════════════════════════════════════════════════════════════════════════════════════════════
// Update Popup Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Displays update notification popup with version, changelog, and download link.
// Dependencies: constants.js, utilities.js, features/update-checker.js

let updatePopupState = null;

function ensureUpdatePopupRoot() {
  let root = document.getElementById("rrw-update-popup-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "rrw-update-popup-root";
    document.documentElement.appendChild(root);
  }
  return root;
}

function closeUpdatePopup() {
  updatePopupState = null;
  const root = document.getElementById("rrw-update-popup-root");
  if (root instanceof HTMLElement) {
    root.replaceChildren();
    root.remove();
  }
}

function bindUpdatePopupEvents() {
  const root = document.getElementById("rrw-update-popup-root");
  if (!root) return;

  // Close button
  root.querySelectorAll('[data-update-popup-close="1"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      closeUpdatePopup();
    });
  });

  // Download button
  root.querySelectorAll('[data-update-download="1"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!updatePopupState?.downloadUrl) return;
      
      const openInNewTab = shouldOpenQueueBarLinkInNewTab(e, true);
      navigateToQueueBarLink(updatePopupState.downloadUrl, openInNewTab);
      
      // Mark update as seen
      void markUpdateAsSeen();
      closeUpdatePopup();
    });
  });

  // Backdrop close
  root.querySelectorAll('[data-update-popup-backdrop="1"]').forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        closeUpdatePopup();
      }
    });
  });
}

function renderUpdatePopup() {
  const state = updatePopupState;
  if (!state || !state.updateInfo || !state.updateInfo.latestEntry) {
    closeUpdatePopup();
    return;
  }

  const root = ensureUpdatePopupRoot();
  const entry = state.updateInfo.latestEntry;
  const installed = state.updateInfo.installed || "Unknown";
  const latest = state.updateInfo.latest || "Unknown";

  // Format changelog - truncate long lines and clean up markdown
  let changelog = String(entry.changelog || "No changelog available").trim();
  // Remove markdown headers and formatting
  changelog = changelog
    .replace(/^#+\s*/gm, "") // Remove headers
    .replace(/\*\*/g, "")     // Remove bold
    .replace(/\*/g, "")       // Remove italics
    .replace(/`/g, "")        // Remove code markers
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .slice(0, 10) // Limit to 10 lines
    .join("\n");

  root.innerHTML = `
    <div class="rrw-update-popup-backdrop" data-update-popup-backdrop="1"></div>
    <div class="rrw-update-popup-container">
      <div class="rrw-update-popup">
        <header class="rrw-update-popup-header">
          <h2 class="rrw-update-popup-title">ModBox Update Available!</h2>
          <button type="button" class="rrw-update-popup-close" data-update-popup-close="1" aria-label="Close">
            X
          </button>
        </header>

        <div class="rrw-update-popup-body">
          <div class="rrw-update-popup-versions">
            <div class="rrw-update-popup-version">
              <span class="rrw-update-popup-version-label">Current:</span>
              <span class="rrw-update-popup-version-number">${escapeHtml(installed)}</span>
            </div>
            <div class="rrw-update-popup-version">
              <span class="rrw-update-popup-version-label">Available:</span>
              <span class="rrw-update-popup-version-number rrw-update-popup-version-new">${escapeHtml(latest)}</span>
            </div>
          </div>

          <div class="rrw-update-popup-changelog">
            <h3 class="rrw-update-popup-changelog-title">What's New</h3>
            <pre class="rrw-update-popup-changelog-text">${escapeHtml(changelog)}</pre>
          </div>
        </div>

        <footer class="rrw-update-popup-footer">
          <button 
            type="button" 
            class="rrw-update-popup-download-btn" 
            data-update-download="1"
          >
            Download Update
          </button>
          <button 
            type="button" 
            class="rrw-update-popup-later-btn" 
            data-update-popup-close="1"
          >
            Later
          </button>
        </footer>
      </div>
    </div>
  `;

  // Update popup state with download URL
  updatePopupState.downloadUrl = entry.downloadUrl || "";

  bindUpdatePopupEvents();
}

async function openUpdatePopup(updateInfo) {
  if (!updateInfo || !updateInfo.latestEntry) {
    return;
  }

  // Check if user has already seen this update today
  const hasSeenThis = await hasSeenUpdate(updateInfo.latest);
  if (hasSeenThis) {
    return;
  }

  updatePopupState = {
    updateInfo,
    downloadUrl: "",
  };

  renderUpdatePopup();
}
