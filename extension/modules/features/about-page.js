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

function getAboutPageDownloadUrl(updateStatus) {
  if (updateStatus?.latestEntry?.downloadUrl) {
    return String(updateStatus.latestEntry.downloadUrl || "").trim();
  }

  const latestVersion = String(updateStatus?.latest || "").trim();
  if (latestVersion) {
    return `https://github.com/Imonlytryingtohelp/ModBox/releases/tag/${encodeURIComponent(latestVersion)}`;
  }

  return "https://github.com/Imonlytryingtohelp/ModBox/releases";
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

  // Download button
  root.querySelectorAll('[data-about-download="1"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!aboutPageState?.downloadUrl) return;
      const openInNewTab = shouldOpenQueueBarLinkInNewTab(e, true);
      navigateToQueueBarLink(aboutPageState.downloadUrl, openInNewTab);
    });
  });

  // Link Generator button
  root.querySelectorAll('[data-about-link-gen="1"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openLinkGenerator();
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

function convertMarkdownLinksToHtml(text) {
  // Convert markdown links [text](url) to HTML <a> tags
  // First, split text by markdown links to preserve non-link content
  const parts = [];
  let lastIndex = 0;
  const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link (escaped)
    if (match.index > lastIndex) {
      parts.push(escapeHtml(text.substring(lastIndex, match.index)));
    }
    // Add the link as HTML
    const linkText = match[1];
    const url = match[2];
    parts.push(
      `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(linkText)}</a>`
    );
    lastIndex = linkRegex.lastIndex;
  }

  // Add remaining text (escaped)
  if (lastIndex < text.length) {
    parts.push(escapeHtml(text.substring(lastIndex)));
  }

  return parts.length > 0 ? parts.join("") : escapeHtml(text);
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
  const downloadUrl = state.downloadUrl || "";
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
  
  // Convert markdown links to HTML (preserves links, escapes other content)
  formattedChangelog = convertMarkdownLinksToHtml(formattedChangelog);

  const updateStatusHtml = isUpdateAvailable
    ? '<div class="rrw-about-page-update-available">Update available!</div>'
    : '<div class="rrw-about-page-up-to-date">You\'re up to date</div>';

  root.innerHTML = `
    <div class="rrw-about-page-backdrop" data-about-page-backdrop="1"></div>
    <div class="rrw-about-page-container">
      <div class="rrw-about-page">
        <header class="rrw-about-page-header">
          <h2 class="rrw-about-page-title">About ModBox</h2>
          ${aboutPageState?.linkGeneratorEnabled ? `
            <button 
              type="button" 
              class="rrw-about-page-link-gen-btn" 
              data-about-link-gen="1"
              title="Generate ModBox ban links"
            >
              ${String.fromCodePoint(0x1F517)}
            </button>
          ` : ""}
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
            <div class="rrw-about-page-changelog-text"></div>
          </div>
        </div>

        <footer class="rrw-about-page-footer">
          ${downloadUrl ? `
            <button
              type="button"
              class="rrw-about-page-download-btn"
              data-about-download="1"
            >
              Download Latest Release
            </button>
          ` : ""}
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

  // Set changelog content with HTML links
  const changelogText = root.querySelector(".rrw-about-page-changelog-text");
  if (changelogText) {
    // Convert newlines to <br> tags for proper formatting
    const formattedText = formattedChangelog.replace(/\n/g, "<br>");
    changelogText.innerHTML = formattedText;
  }
}

async function openAboutPage() {
  try {
    const installedVersion = await getInstalledVersion();
    const [updateStatus, extensionSettings] = await Promise.all([
      getUpdateStatus(),
      getApiBaseUrl(),
    ]);

    aboutPageState = {
      installedVersion,
      latestVersion: updateStatus?.latest || "Unknown",
      isUpdateAvailable: updateStatus?.isUpdateAvailable || false,
      changelog: updateStatus?.latestEntry?.changelog || "No changelog available",
      downloadUrl: getAboutPageDownloadUrl(updateStatus),
      linkGeneratorEnabled: Boolean(extensionSettings.aboutPageLinkGeneratorEnabled),
    };

    renderAboutPage();
  } catch (error) {
    // Silently handle errors
  }
}
