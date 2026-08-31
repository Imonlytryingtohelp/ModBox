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

function getAboutBrowserInfo() {
  const userAgent = String(globalThis.navigator?.userAgent || "");
  const browserMatch = userAgent.match(/Edg\/([\d.]+)/i)
    || userAgent.match(/Firefox\/([\d.]+)/i)
    || userAgent.match(/Chrome\/([\d.]+)/i)
    || userAgent.match(/Chromium\/([\d.]+)/i)
    || userAgent.match(/Version\/([\d.]+).*Safari\//i);
  let name = "Unknown";
  if (/Edg\//i.test(userAgent)) name = "Microsoft Edge";
  else if (/Firefox\//i.test(userAgent)) name = "Firefox";
  else if (/Chrome\//i.test(userAgent)) name = "Google Chrome";
  else if (/Chromium\//i.test(userAgent)) name = "Chromium";
  else if (/Safari\//i.test(userAgent)) name = "Safari";

  let operatingSystem = String(globalThis.navigator?.platform || "Unknown");
  if (/Windows/i.test(userAgent)) operatingSystem = "Windows";
  else if (/Android/i.test(userAgent)) operatingSystem = "Android";
  else if (/(iPhone|iPad|iPod)/i.test(userAgent)) operatingSystem = "iOS";
  else if (/Mac OS X/i.test(userAgent)) operatingSystem = "macOS";
  else if (/Linux/i.test(userAgent)) operatingSystem = "Linux";

  return {
    browser: browserMatch ? `${name} ${browserMatch[1]}` : name,
    operatingSystem,
  };
}

function getAboutPageContext() {
  const path = String(globalThis.location?.pathname || "");
  if (/\/about\/(modqueue|unmoderated|reports)/i.test(path)) return "moderation queue";
  if (/\/comments\//i.test(path)) return "post or comment page";
  if (/\/r\/[^/]+/i.test(path)) return "subreddit page";
  return "other Reddit page";
}

function buildAboutBugReport(installedVersion) {
  const browserInfo = getAboutBrowserInfo();
  const host = String(globalThis.location?.hostname || "Unknown");
  return [
    "ModBox Bug Report Information",
    "",
    `ModBox version: ${String(installedVersion || "Unknown")}`,
    `Browser: ${browserInfo.browser}`,
    `Operating system: ${browserInfo.operatingSystem}`,
    `Reddit host: ${host}`,
    `Page context: ${getAboutPageContext()}`,
    `Detected UI: ${/old\.reddit\.com/i.test(host) ? "old Reddit" : /sh\.reddit\.com/i.test(host) ? "Shreddit" : "Reddit"}`,
    `Generated: ${new Date().toISOString()}`,
    "",
    "What happened:",
    "",
    "Steps to reproduce:",
    "",
    "Expected behavior:",
    "",
  ].join("\n");
}

async function copyAboutBugReport() {
  const statusEl = document.querySelector("[data-about-copy-status]");
  const report = buildAboutBugReport(aboutPageState?.installedVersion);
  let copied = false;
  try {
    if (globalThis.navigator?.clipboard?.writeText) {
      await globalThis.navigator.clipboard.writeText(report);
      copied = true;
    }
  } catch {
    copied = false;
  }

  if (!copied) {
    const fallback = document.createElement("textarea");
    fallback.className = "rrw-about-page-bug-report-output";
    fallback.value = report;
    fallback.setAttribute("aria-label", "Bug report information");
    document.querySelector(".rrw-about-page-body")?.appendChild(fallback);
    fallback.focus();
    fallback.select();
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    if (copied) {
      fallback.remove();
    }
  }

  if (statusEl) {
    statusEl.textContent = copied
      ? "Bug report information copied to clipboard."
      : "Copy failed. The report is shown below; select and copy it manually.";
    statusEl.className = `rrw-about-page-copy-status${copied ? "" : " rrw-about-page-check-status--error"}`;
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

  root.querySelectorAll('[data-about-copy-bug-report="1"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      void copyAboutBugReport();
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

function convertMarkdownToHtml(text) {
  // Use a data structure to store converted HTML and keep track of indices
  const htmlParts = [];

  // Helper to create placeholders and store HTML
  function createPlaceholder(html) {
    const index = htmlParts.length;
    htmlParts.push(html);
    // Use a marker that won't conflict with markdown or HTML escaping
    return `\u0001${index}\u0001`;
  }

  let result = text;

  // Convert bold: **text** or __text__ → <strong>text</strong>
  result = result.replace(/\*\*(.+?)\*\*/g, (match, content) => {
    return createPlaceholder(`<strong>${escapeHtml(content)}</strong>`);
  });
  result = result.replace(/__(.+?)__/g, (match, content) => {
    return createPlaceholder(`<strong>${escapeHtml(content)}</strong>`);
  });

  // Convert code: `text` → <code>text</code>
  result = result.replace(/`(.+?)`/g, (match, content) => {
    return createPlaceholder(`<code>${escapeHtml(content)}</code>`);
  });

  // Convert italics: *text* or _text_ → <em>text</em>
  result = result.replace(/\*(.+?)\*/g, (match, content) => {
    return createPlaceholder(`<em>${escapeHtml(content)}</em>`);
  });
  result = result.replace(/_(.+?)_/g, (match, content) => {
    return createPlaceholder(`<em>${escapeHtml(content)}</em>`);
  });

  // Convert markdown links: [text](url) → <a href="url">text</a>
  result = result.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, (match, linkText, url) => {
    return createPlaceholder(`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(linkText)}</a>`);
  });

  // Escape any remaining plain text
  result = escapeHtml(result);

  // Restore placeholders with their HTML content
  // Use a function to avoid issues with $ in replacement strings
  result = result.replace(/\u0001(\d+)\u0001/g, (match, index) => {
    return htmlParts[parseInt(index, 10)] || match;
  });

  return result;
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

  // Format changelog - clean markdown without arbitrary truncation; keep scrollable text.
  let formattedChangelog = String(changelog).trim();
  formattedChangelog = formattedChangelog
    .replace(/^#+\s*/gm, "") // Remove headers
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join("\n");
  
  // Convert markdown formatting and links to HTML (preserves links and formatting, escapes text)
  formattedChangelog = convertMarkdownToHtml(formattedChangelog);

  const updateStatusHtml = isUpdateAvailable
    ? '<div class="rrw-about-page-update-available">Update available!</div>'
    : '<div class="rrw-about-page-up-to-date">You\'re up to date</div>';

  root.innerHTML = `
    <div class="rrw-about-page-backdrop" data-about-page-backdrop="1"></div>
    <div class="rrw-about-page-container">
      <div class="rrw-about-page">
        <header class="rrw-about-page-header">
          <h2 class="rrw-about-page-title">About ModBox</h2>
          <a
            class="rrw-about-page-website-link"
            href="https://modbox.fyi"
            target="_blank"
            rel="noopener noreferrer"
            title="Visit the ModBox website"
          >
            modbox.fyi
          </a>
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
            <p class="rrw-about-page-bug-report">
              Found a bug? <a href="https://github.com/Imonlytryingtohelp/ModBox/issues" target="_blank" rel="noopener noreferrer">Report it on GitHub.</a>
            </p>
          </div>

          <div class="rrw-about-page-changelog">
            <h3 class="rrw-about-page-changelog-title">Latest Changelog</h3>
            <div class="rrw-about-page-changelog-text"></div>
          </div>
          <div class="rrw-about-page-copy-status" data-about-copy-status></div>
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
            class="rrw-about-page-check-btn"
            data-about-copy-bug-report="1"
          >
            Copy Bug Report Info
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
