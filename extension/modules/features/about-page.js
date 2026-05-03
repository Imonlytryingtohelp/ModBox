// ════════════════════════════════════════════════════════════════════════════════════════════════
// About Page Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Displays about page with current version, changelog, and update checker.
// Dependencies: constants.js, utilities.js, features/update-checker.js

let aboutPageState = null;
let checkingForUpdates = false;

function ensureAboutPageRoot() {
  let root = document.getElementById("rrw-about-page-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "rrw-about-page-root";
    document.documentElement.appendChild(root);
  }
  return root;
}

function closeAboutPage() {
  aboutPageState = null;
  const root = document.getElementById("rrw-about-page-root");
  if (root instanceof HTMLElement) {
    root.replaceChildren();
    root.remove();
  }
}

async function performUpdateCheckFromAboutPage() {
  if (checkingForUpdates) {
    return;
  }

  checkingForUpdates = true;
  
  // Update button state
  const checkBtn = document.querySelector('[data-about-check-update="1"]');
  if (checkBtn) {
    checkBtn.disabled = true;
    checkBtn.textContent = "Checking...";
  }

  try {
    // Force update check without using cache
    const result = await checkForUpdates(true);
    
    if (result) {
      // Update the UI with new information
      await openAboutPage();
    } else {
      // Show error message
      const statusEl = document.querySelector('[data-about-check-status]');
      if (statusEl) {
        statusEl.textContent = "Failed to check for updates. Please try again.";
        statusEl.className = "rrw-about-page-check-status rrw-about-page-check-status--error";
      }
    }
  } catch (error) {
    console.warn("[ModBox] Error checking for updates:", error);
    const statusEl = document.querySelector('[data-about-check-status]');
    if (statusEl) {
      statusEl.textContent = "Error checking for updates";
      statusEl.className = "rrw-about-page-check-status rrw-about-page-check-status--error";
    }
  } finally {
    checkingForUpdates = false;
    
    // Reset button state
    const checkBtn = document.querySelector('[data-about-check-update="1"]');
    if (checkBtn) {
      checkBtn.disabled = false;
      checkBtn.textContent = "Check for Update";
    }
  }
}

function bindAboutPageEvents() {
  const root = document.getElementById("rrw-about-page-root");
  if (!root) return;

  // Close button
  root.querySelectorAll('[data-about-page-close="1"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      closeAboutPage();
    });
  });

  // Check for Update button
  root.querySelectorAll('[data-about-check-update="1"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      void performUpdateCheckFromAboutPage();
    });
  });

  // Backdrop close
  root.querySelectorAll('[data-about-page-backdrop="1"]').forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        closeAboutPage();
      }
    });
  });
}

function renderAboutPage() {
  const state = aboutPageState;
  if (!state) {
    closeAboutPage();
    return;
  }

  const root = ensureAboutPageRoot();
  const installed = state.installedVersion || "Unknown";
  const latest = state.latestVersion || "Unknown";
  const changelog = state.changelog || "No changelog available";
  const isUpdateAvailable = state.isUpdateAvailable || false;

  // Format changelog - clean markdown and limit lines
  let formattedChangelog = String(changelog).trim();
  formattedChangelog = formattedChangelog
    .replace(/^#+\s*/gm, "") // Remove headers
    .replace(/\*\*/g, "")     // Remove bold
    .replace(/\*/g, "")       // Remove italics
    .replace(/`/g, "")        // Remove code markers
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .slice(0, 20) // Limit to 20 lines
    .join("\n");

  const updateStatusHtml = isUpdateAvailable
    ? '<div class="rrw-about-page-update-available">Update available!</div>'
    : '<div class="rrw-about-page-up-to-date">You\'re up to date</div>';

  root.innerHTML = `
    <div class="rrw-about-page-backdrop" data-about-page-backdrop="1"></div>
    <div class="rrw-about-page-container">
      <div class="rrw-about-page">
        <header class="rrw-about-page-header">
          <h2 class="rrw-about-page-title">About ModBox</h2>
          <button type="button" class="rrw-about-page-close" data-about-page-close="1" aria-label="Close">
            X
          </button>
        </header>

        <div class="rrw-about-page-body">
          <div class="rrw-about-page-version-section">
            <div class="rrw-about-page-version-card">
              <span class="rrw-about-page-version-label">Current Version</span>
              <span class="rrw-about-page-version-number">${escapeHtml(installed)}</span>
            </div>

            <div class="rrw-about-page-version-card">
              <span class="rrw-about-page-version-label">Latest Version</span>
              <span class="rrw-about-page-version-number${isUpdateAvailable ? ' rrw-about-page-version-new' : ''}">${escapeHtml(latest)}</span>
            </div>
          </div>

          <div class="rrw-about-page-status">
            ${updateStatusHtml}
            <div class="rrw-about-page-check-status" data-about-check-status></div>
          </div>

          <div class="rrw-about-page-changelog">
            <h3 class="rrw-about-page-changelog-title">Latest Changelog</h3>
            <pre class="rrw-about-page-changelog-text">${escapeHtml(formattedChangelog)}</pre>
          </div>
        </div>

        <footer class="rrw-about-page-footer">
          <button 
            type="button" 
            class="rrw-about-page-check-btn" 
            data-about-check-update="1"
          >
            Check for Update
          </button>
          <button 
            type="button" 
            class="rrw-about-page-close-btn" 
            data-about-page-close="1"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  `;

  bindAboutPageEvents();
}

async function openAboutPage() {
  try {
    const installedVersion = await getInstalledVersion();
    const updateStatus = await getUpdateStatus();

    aboutPageState = {
      installedVersion,
      latestVersion: updateStatus?.latest || "Unknown",
      isUpdateAvailable: updateStatus?.isUpdateAvailable || false,
      changelog: updateStatus?.latestEntry?.changelog || "No changelog available",
    };

    renderAboutPage();
  } catch (error) {
    console.warn("[ModBox] Failed to open about page:", error);
  }
}
