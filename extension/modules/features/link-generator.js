// ════════════════════════════════════════════════════════════════════════════════════════════════
// Link Generator Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Generates specially formatted modbox:// links for moderation actions.
// Provides UI for creating ban action links with custom messages and notes.
// Dependencies: constants.js, utilities.js

const LINK_GENERATOR_ROOT_ID = "rrw-link-generator-root";

let linkGeneratorState = null;

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Link Generation
// ────────────────────────────────────────────────────────────────────────────────────────────────

function generateModboxBanLink(username, reason, note, subreddit) {
  const params = new URLSearchParams();
  params.set("user", String(username || "").trim());
  if (String(subreddit || "").trim()) {
    params.set("subreddit", String(subreddit).trim());
  }
  if (String(reason || "").trim()) {
    params.set("reason", String(reason).trim());
  }
  if (String(note || "").trim()) {
    params.set("note", String(note).trim());
  }
  return `modbox://ban?${params.toString()}`;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────
// UI State & Management
// ────────────────────────────────────────────────────────────────────────────────────────────────

function initLinkGeneratorState() {
  return {
    username: "",
    reason: "",
    note: "",
    generatedLink: "",
    copied: false,
  };
}

function openLinkGenerator() {
  linkGeneratorState = initLinkGeneratorState();
  renderLinkGenerator();
}

function closeLinkGenerator() {
  linkGeneratorState = null;
  const root = document.getElementById(LINK_GENERATOR_ROOT_ID);
  if (root) {
    root.remove();
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Rendering
// ────────────────────────────────────────────────────────────────────────────────────────────────

function renderLinkGenerator() {
  if (!linkGeneratorState) {
    return;
  }

  let root = document.getElementById(LINK_GENERATOR_ROOT_ID);
  if (!root) {
    root = document.createElement("div");
    root.id = LINK_GENERATOR_ROOT_ID;
    root.style.cssText = "position: fixed; inset: 0; z-index: 99999; pointer-events: none;";
    document.documentElement.appendChild(root);
  } else {
    root.style.pointerEvents = "none";
  }

  const { username, reason, note, generatedLink, copied } = linkGeneratorState;

  root.innerHTML = `
    <div class="rrw-link-gen-backdrop" data-link-gen-close="1" style="pointer-events: auto;"></div>
    <section class="rrw-link-gen-modal" role="dialog" aria-modal="true" aria-label="ModBox Link Generator" style="pointer-events: auto;">
      <header class="rrw-link-gen-header">
        <h2>Generate ModBox Ban Link</h2>
        <button type="button" class="rrw-close" data-link-gen-close="1">Close</button>
      </header>
      
      <div class="rrw-link-gen-body">
        <form id="rrw-link-gen-form">
          <label class="rrw-field">
            <span>Username to ban <span style="color: red;">*</span></span>
            <input
              type="text"
              id="rrw-link-gen-username"
              placeholder="e.g., spammer123"
              value="${escapeHtml(username)}"
              required
            />
          </label>

          <label class="rrw-field">
            <span>Ban message</span>
            <textarea
              id="rrw-link-gen-reason"
              rows="4"
              placeholder="Optional. The message shown to the banned user. Supports multiple lines."
            >${escapeHtml(reason)}</textarea>
            <small class="rrw-muted">Multi-line messages are supported. URL-encoded as %0A for newlines.</small>
          </label>

          <label class="rrw-field">
            <span>Usernote</span>
            <textarea
              id="rrw-link-gen-note"
              rows="3"
              placeholder="Optional. Internal note to save with the action."
            >${escapeHtml(note)}</textarea>
          </label>

          <button type="button" id="rrw-link-gen-generate" class="rrw-link-gen-btn-generate">Generate Link</button>
        </form>

        ${generatedLink ? `
          <div class="rrw-link-gen-result">
            <h3>Generated Link:</h3>
            <div class="rrw-link-gen-output">
              <code>${escapeHtml(generatedLink)}</code>
              <button type="button" id="rrw-link-gen-copy" class="rrw-link-gen-btn-copy">
                ${copied ? "Copied!" : "Copy to clipboard"}
              </button>
            </div>
            <p class="rrw-muted">Share this link in modmail or posts. When clicked in ModBox, it will execute the ban.</p>
          </div>
        ` : ""}
      </div>
    </section>
  `;

  // Bind events
  bindLinkGeneratorEvents();
}

function bindLinkGeneratorEvents() {
  const root = document.getElementById(LINK_GENERATOR_ROOT_ID);
  if (!root) return;

  // Close button
  root.querySelectorAll("[data-link-gen-close='1']").forEach((element) => {
    element.addEventListener("click", (event) => {
      if (
        event.currentTarget !== event.target &&
        event.currentTarget instanceof HTMLElement &&
        event.currentTarget.classList.contains("rrw-link-gen-backdrop")
      ) {
        return;
      }
      closeLinkGenerator();
    });
  });

  // Generate button
  const generateBtn = root.querySelector("#rrw-link-gen-generate");
  if (generateBtn) {
    generateBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const usernameInput = root.querySelector("#rrw-link-gen-username");
      const reasonInput = root.querySelector("#rrw-link-gen-reason");
      const noteInput = root.querySelector("#rrw-link-gen-note");

      if (!(usernameInput instanceof HTMLInputElement)) {
        console.error("[Link Generator] Username input not found");
        return;
      }

      const username = usernameInput.value;
      if (!String(username).trim()) {
        usernameInput.focus();
        usernameInput.classList.add("rrw-input-error");
        setTimeout(() => usernameInput.classList.remove("rrw-input-error"), 2000);
        return;
      }

      const reason = reasonInput instanceof HTMLTextAreaElement ? reasonInput.value : "";
      const note = noteInput instanceof HTMLTextAreaElement ? noteInput.value : "";

      const link = generateModboxBanLink(username, reason, note);
      linkGeneratorState.generatedLink = link;
      linkGeneratorState.copied = false;
      renderLinkGenerator();
    });
  }

  // Copy button
  const copyBtn = root.querySelector("#rrw-link-gen-copy");
  if (copyBtn) {
    copyBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(linkGeneratorState.generatedLink);
        } else {
          // Fallback for older browsers
          const textarea = document.createElement("textarea");
          textarea.value = linkGeneratorState.generatedLink;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }
        linkGeneratorState.copied = true;
        renderLinkGenerator();
        setTimeout(() => {
          if (linkGeneratorState) {
            linkGeneratorState.copied = false;
            renderLinkGenerator();
          }
        }, 2000);
      } catch (err) {
        console.error("[Link Generator] Copy failed:", err);
      }
    });
  }

  // Input updates
  const usernameInput = root.querySelector("#rrw-link-gen-username");
  const reasonInput = root.querySelector("#rrw-link-gen-reason");
  const noteInput = root.querySelector("#rrw-link-gen-note");

  if (usernameInput instanceof HTMLInputElement) {
    usernameInput.addEventListener("input", () => {
      if (linkGeneratorState) {
        linkGeneratorState.username = usernameInput.value;
        linkGeneratorState.generatedLink = "";
      }
    });
  }

  if (reasonInput instanceof HTMLTextAreaElement) {
    reasonInput.addEventListener("input", () => {
      if (linkGeneratorState) {
        linkGeneratorState.reason = reasonInput.value;
        linkGeneratorState.generatedLink = "";
      }
    });
  }

  if (noteInput instanceof HTMLTextAreaElement) {
    noteInput.addEventListener("input", () => {
      if (linkGeneratorState) {
        linkGeneratorState.note = noteInput.value;
        linkGeneratorState.generatedLink = "";
      }
    });
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────────────────────────────────────────────

function injectLinkGeneratorStyles() {
  if (document.getElementById("rrw-link-gen-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "rrw-link-gen-styles";
  style.textContent = `
    .rrw-link-gen-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1;
      cursor: pointer;
    }

    .rrw-link-gen-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--rrw-bg, #fff);
      color: var(--rrw-text, #000);
      border: 1px solid var(--rrw-border, #ccc);
      border-radius: 8px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow: auto;
      z-index: 2;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .rrw-link-gen-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--rrw-border, #eee);
      background: var(--rrw-bg-alt, #f8f9fa);
    }

    .rrw-link-gen-header h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .rrw-link-gen-body {
      padding: 16px;
    }

    .rrw-link-gen-body .rrw-field {
      margin-bottom: 16px;
    }

    .rrw-link-gen-body .rrw-field span {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      font-size: 13px;
    }

    .rrw-link-gen-body .rrw-field input,
    .rrw-link-gen-body .rrw-field textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--rrw-border, #ccc);
      border-radius: 4px;
      font-family: inherit;
      font-size: 13px;
      background: var(--rrw-input-bg, #fff);
      color: var(--rrw-text);
      box-sizing: border-box;
    }

    .rrw-link-gen-body .rrw-field input:focus,
    .rrw-link-gen-body .rrw-field textarea:focus {
      outline: none;
      border-color: #0079d3;
      box-shadow: 0 0 0 2px rgba(0, 121, 211, 0.1);
    }

    .rrw-link-gen-body .rrw-field input.rrw-input-error {
      border-color: #d32f2f;
      background-color: rgba(211, 47, 47, 0.05);
    }

    .rrw-link-gen-body small {
      display: block;
      margin-top: 4px;
      font-size: 12px;
    }

    .rrw-link-gen-btn-generate {
      width: 100%;
      padding: 10px 16px;
      background: #0079d3;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.2s;
    }

    .rrw-link-gen-btn-generate:hover {
      background: #0066a8;
    }

    .rrw-link-gen-result {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid var(--rrw-border, #eee);
    }

    .rrw-link-gen-result h3 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
    }

    .rrw-link-gen-output {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .rrw-link-gen-output code {
      flex: 1;
      padding: 10px 12px;
      background: var(--rrw-bg-alt, #f0f1f2);
      border: 1px solid var(--rrw-border, #ccc);
      border-radius: 4px;
      font-family: "Courier New", monospace;
      font-size: 12px;
      word-break: break-all;
      white-space: pre-wrap;
    }

    .rrw-link-gen-btn-copy {
      padding: 10px 16px;
      background: #555;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      transition: background 0.2s;
    }

    .rrw-link-gen-btn-copy:hover {
      background: #333;
    }

    .rrw-link-gen-result .rrw-muted {
      margin: 0;
      font-size: 12px;
    }
  `;

  document.head.appendChild(style);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Initialization
// ────────────────────────────────────────────────────────────────────────────────────────────────

function initLinkGenerator() {
  injectLinkGeneratorStyles();
  console.log("[ModBox] Link generator initialized");
}
