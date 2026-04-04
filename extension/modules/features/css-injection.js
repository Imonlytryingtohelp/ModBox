// ════════════════════════════════════════════════════════════════════════════════════════════════
// CSS Injection Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Injects all extension styling including queue bar, overlays, and theme-specific colors.
// Dependencies: constants.js

function injectStyles() {
  if (document.getElementById("rrw-style")) {
    console.log("[ModBox] CSS already injected, skipping");
    return;
  }
  console.log("[ModBox] Injecting ModBox CSS styles...");
  const style = document.createElement("style");
  style.id = "rrw-style";
  style.textContent = `
    #rrw-overlay-root {
      --rrw-font-family: "Segoe UI Variable Text", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;
      --rrw-modal-bg: rgba(248, 251, 255, 0.98);
      --rrw-text: #21324a;
      --rrw-border: rgba(152, 175, 208, 0.68);
      --rrw-soft-border: rgba(168, 187, 214, 0.56);
      --rrw-muted: #5f7797;
      --rrw-link: #245eb8;
      --rrw-field-bg: rgba(238, 245, 255, 0.92);
      --rrw-card-bg: rgba(245, 250, 255, 0.95);
      --rrw-chip-bg: rgba(218, 233, 255, 0.95);
      --rrw-chip-text: #1f4d8f;
      --rrw-footer-bg-top: rgba(245, 250, 255, 0.98);
      --rrw-footer-bg-bottom: rgba(239, 247, 255, 0.93);
      --rrw-close-bg: rgba(233, 242, 255, 0.95);
      --rrw-close-border: rgba(145, 170, 208, 0.68);
      --rrw-preview-bg: rgba(239, 247, 255, 0.96);
      --rrw-preview-text: #223856;
      --rrw-success-bg: rgba(228, 248, 235, 0.95);
      --rrw-success-border: rgba(118, 180, 139, 0.9);
      --rrw-success-text: #24633e;
      --rrw-error-bg: rgba(255, 236, 239, 0.96);
      --rrw-error-border: rgba(214, 136, 148, 0.9);
      --rrw-error-text: #8a2f3f;
      --rrw-warning-bg: rgba(255, 245, 225, 0.96);
      --rrw-warning-border: rgba(220, 180, 103, 0.9);
      --rrw-warning-text: #7f5d18;
      color-scheme: light;
      font-family: var(--rrw-font-family);
    }

    #rrw-overlay-root[data-rrw-theme="dark"] {
      --rrw-font-family: "Segoe UI Variable Text", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;
      --rrw-modal-bg: rgba(12, 20, 34, 0.98);
      --rrw-text: #e7f0ff;
      --rrw-border: rgba(98, 133, 192, 0.52);
      --rrw-soft-border: rgba(98, 133, 192, 0.4);
      --rrw-muted: #9eb6df;
      --rrw-link: #9bc2ff;
      --rrw-field-bg: rgba(15, 28, 45, 0.86);
      --rrw-card-bg: rgba(21, 38, 62, 0.88);
      --rrw-chip-bg: rgba(31, 65, 114, 0.92);
      --rrw-chip-text: #cfe2ff;
      --rrw-footer-bg-top: rgba(12, 20, 34, 0.98);
      --rrw-footer-bg-bottom: rgba(12, 20, 34, 0.92);
      --rrw-close-bg: rgba(28, 49, 78, 0.92);
      --rrw-close-border: rgba(98, 133, 192, 0.55);
      --rrw-preview-bg: rgba(14, 24, 39, 0.95);
      --rrw-preview-text: #dce9ff;
      --rrw-success-bg: rgba(16, 40, 26, 0.92);
      --rrw-success-border: rgba(41, 101, 66, 0.9);
      --rrw-success-text: #9cddb1;
      --rrw-error-bg: rgba(42, 20, 24, 0.92);
      --rrw-error-border: rgba(139, 59, 70, 0.9);
      --rrw-error-text: #ffb6bf;
      --rrw-warning-bg: rgba(58, 44, 15, 0.92);
      --rrw-warning-border: rgba(164, 127, 45, 0.88);
      --rrw-warning-text: #ffd88a;
      color-scheme: dark;
      font-family: var(--rrw-font-family);
    }

    #rrw-queuebar-root {
      pointer-events: auto;
      position: fixed;
      bottom: 10px;
      right: 10px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif;
    }

    .rrw-queuebar {
      pointer-events: auto;
      min-width: 252px;
      max-width: min(92vw, 340px);
      border: 1px solid rgba(58, 84, 129, 0.5);
      border-radius: 12px;
      background: linear-gradient(160deg, rgba(12, 20, 34, 0.97), rgba(16, 27, 44, 0.98));
      box-shadow: 0 10px 26px rgba(5, 9, 14, 0.45);
      color: #dbe9ff;
      display: grid;
      gap: 5px;
      padding: 6px;
      backdrop-filter: blur(2px);
    }

    .rrw-queuebar[data-collapsed="1"] {
      min-width: auto;
      max-width: none;
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 4px;
    }

    .rrw-queuebar[data-collapsed="1"][data-reddit-version="new"] {
      padding: 4px 2px !important;
      gap: 2px !important;
    }

    .rrw-queuebar-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 6px;
      padding: 0;
    }

    .rrw-queuebar[data-collapsed="1"] .rrw-queuebar-header {
      align-items: center;
      justify-content: flex-start;
      gap: 2px;
      width: fit-content;
    }

    .rrw-queuebar-title-wrap {
      display: grid;
      gap: 1px;
      min-width: 0;
    }

    .rrw-queuebar-title {
      font-size: 0.8rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #a3c2fb;
    }

    .rrw-queuebar-subtitle {
      font-size: 0.75rem;
      color: #d4e2ff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .rrw-queuebar-header-actions {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .rrw-queuebar-icon-btn {
      appearance: none;
      -webkit-appearance: none;
      border: 1px solid rgba(84, 118, 173, 0.45);
      background: rgba(30, 50, 77, 0.86);
      color: #e6efff;
      border-radius: 7px;
      font-size: 0.78rem;
      line-height: 1;
      padding: 4px 7px;
      cursor: pointer;
      min-width: 28px;
      transition: background-color 0.2s, border-color 0.2s;
    }

    .rrw-queuebar-icon-btn:hover {
      background: rgba(44, 73, 112, 0.92);
      border-color: rgba(110, 151, 221, 0.62);
    }

    .rrw-queuebar-badges {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 5px;
    }

    .rrw-queuebar-secondary-links {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 4px;
    }

    .rrw-queuebar-secondary-link {
      appearance: none;
      -webkit-appearance: none;
      border: 1px solid rgba(98, 133, 192, 0.5);
      background: rgba(24, 42, 68, 0.88);
      border-radius: 8px;
      padding: 4px 5px;
      color: #d8e8ff;
      font-size: 0.74rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
      transition: background-color 0.2s, border-color 0.2s;
    }

    .rrw-queuebar-secondary-link:hover {
      border-color: rgba(131, 176, 255, 0.78);
      background: rgba(31, 54, 85, 0.93);
    }

    .rrw-queuebar-compact-list {
      display: inline-flex;
      align-items: center;
      flex-wrap: nowrap;
      gap: 5px;
      min-width: 0;
    }

    .rrw-queuebar-compact-item {
      appearance: none;
      -webkit-appearance: none;
      border: 1px solid rgba(98, 133, 192, 0.4);
      background: rgba(24, 42, 68, 0.9);
      border-radius: 8px;
      padding: 4px 6px;
      color: #eef4ff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 5px;
      font-size: 0.72rem;
      min-width: 38px;
      transition: background-color 0.2s, border-color 0.2s;
    }

    .rrw-queuebar-compact-item:hover {
      border-color: rgba(131, 176, 255, 0.72);
      background: rgba(31, 54, 85, 0.94);
    }

    .rrw-queuebar-compact-icon {
      width: 13px;
      height: 13px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
    }

    .rrw-queuebar-compact-icon svg {
      display: block;
      width: 13px;
      height: 13px;
      fill: none;
      stroke: #c8dbff;
      stroke-width: 1.35;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .rrw-queuebar-compact-count {
      font-variant-numeric: tabular-nums;
      font-weight: 700;
      color: #ffffff;
      min-width: 10px;
      text-align: right;
      flex: 0 0 auto;
    }

    .rrw-queuebar-badge {
      appearance: none;
      -webkit-appearance: none;
      border: 1px solid rgba(98, 133, 192, 0.55);
      background: rgba(28, 49, 78, 0.92);
      border-radius: 10px;
      padding: 4px 5px;
      color: #eef4ff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 5px;
      font-size: 0.84rem;
      transition: background-color 0.2s, border-color 0.2s;
    }

    .rrw-queuebar-badge:hover {
      border-color: rgba(131, 176, 255, 0.8);
      background: rgba(35, 62, 98, 0.95);
    }

    .rrw-queuebar-badge-main {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      min-width: 0;
    }

    .rrw-queuebar-badge-icon {
      width: 16px;
      height: 16px;
      text-align: center;
      opacity: 0.95;
      flex: 0 0 auto;
    }

    .rrw-queuebar-badge-icon svg {
      display: block;
      width: 16px;
      height: 16px;
      fill: none;
      stroke: #bed5ff;
      stroke-width: 1.35;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .rrw-queuebar-badge-label {
      font-weight: 600;
      color: #bed5ff;
      letter-spacing: 0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .rrw-queuebar-badge-count {
      font-variant-numeric: tabular-nums;
      font-weight: 700;
      color: #fff;
      min-width: 26px;
      text-align: right;
    }

    .rrw-queuebar-footer {
      font-size: 0.72rem;
      color: #9eb6df;
      line-height: 1.25;
      border-top: 1px solid rgba(98, 133, 192, 0.26);
      padding-top: 7px;
      min-height: 1.2em;
    }

    .rrw-queuebar-footer[data-error="1"] {
      color: #ffb7bb;
    }

    .rrw-queuebar-footer[data-rrw-fresh="1"] {
      animation: rrw-queuebar-fresh 2s ease forwards;
    }

    @keyframes rrw-queuebar-fresh {
      0%, 60% { color: #4ade80; }
      100% { color: #9eb6df; }
    }

    /* Light Theme Overrides */
    html[data-rrw-theme="light"] #rrw-queuebar-root {
      color-scheme: light;
    }

    html[data-rrw-theme="light"] .rrw-queuebar {
      border-color: rgba(162, 184, 214, 0.78);
      background: linear-gradient(160deg, rgba(246, 250, 255, 0.98), rgba(234, 243, 255, 0.99));
      box-shadow: 0 10px 26px rgba(78, 108, 143, 0.22);
      color: #27486e;
    }

    html[data-rrw-theme="light"] .rrw-queuebar-title {
      color: #4f75a5;
    }

    html[data-rrw-theme="light"] .rrw-queuebar-subtitle {
      color: #33587f;
    }

    html[data-rrw-theme="light"] .rrw-queuebar-icon-btn {
      border-color: rgba(158, 182, 212, 0.78);
      background: rgba(231, 241, 255, 0.98);
      color: #2f4f78;
    }

    html[data-rrw-theme="light"] .rrw-queuebar-icon-btn:hover {
      background: rgba(220, 233, 255, 0.99);
      border-color: rgba(127, 162, 204, 0.85);
    }

    html[data-rrw-theme="light"] .rrw-queuebar-icon-btn svg,
    html[data-rrw-theme="light"] .rrw-queuebar-badge-icon svg,
    html[data-rrw-theme="light"] .rrw-queuebar-compact-icon svg {
      stroke: #355a86;
    }

    html[data-rrw-theme="light"] .rrw-queuebar-icon-btn:hover svg,
    html[data-rrw-theme="light"] .rrw-queuebar-badge:hover .rrw-queuebar-badge-icon svg,
    html[data-rrw-theme="light"] .rrw-queuebar-compact-item:hover .rrw-queuebar-compact-icon svg {
      stroke: #214a7b;
    }

    html[data-rrw-theme="light"] .rrw-queuebar-badge,
    html[data-rrw-theme="light"] .rrw-queuebar-compact-item {
      border-color: rgba(157, 183, 214, 0.75);
      background: rgba(234, 243, 255, 0.98);
      color: #2a4a72;
    }

    html[data-rrw-theme="light"] .rrw-queuebar-badge:hover,
    html[data-rrw-theme="light"] .rrw-queuebar-compact-item:hover {
      border-color: rgba(127, 162, 204, 0.85);
      background: rgba(225, 237, 253, 0.99);
    }

    html[data-rrw-theme="light"] .rrw-queuebar-secondary-link {
      border-color: rgba(157, 183, 214, 0.75);
      background: rgba(237, 245, 255, 0.98);
      color: #2a4a72;
    }

    html[data-rrw-theme="light"] .rrw-queuebar-secondary-link:hover {
      border-color: rgba(127, 162, 204, 0.85);
      background: rgba(228, 238, 252, 0.99);
    }

    html[data-rrw-theme="light"] .rrw-queuebar-compact-icon svg {
      stroke: #5a7f9f;
    }

    html[data-rrw-theme="light"] .rrw-queuebar-badge-label {
      color: #4d6f98;
    }

    html[data-rrw-theme="light"] .rrw-queuebar-badge-count,
    html[data-rrw-theme="light"] .rrw-queuebar-compact-count {
      color: #1f3958;
    }

    html[data-rrw-theme="light"] .rrw-queuebar-footer {
      color: #617f9f;
      border-top-color: rgba(158, 182, 212, 0.55);
    }

    html[data-rrw-theme="light"] .rrw-queuebar-footer[data-rrw-fresh="1"] {
      animation: rrw-queuebar-fresh-light 2s ease forwards;
    }

    @keyframes rrw-queuebar-fresh-light {
      0%, 60% { color: #0a8a2b; }
      100% { color: #617f9f; }
    }

    /* Inline UI Buttons & Pills */
    .rrw-launch-btn,
    .rrw-usernote-chip,
    .rrw-history-btn,
    .rrw-modlog-btn,
    .rrw-comment-nuke-btn,
    .rrw-profile-btn {
      display: inline-flex;
      align-items: center;
      padding: 1px 5px;
      min-height: 0;
      height: auto;
      border: 1px solid #355a91;
      border-radius: 4px;
      background: linear-gradient(180deg, #173a63 0%, #102a4a 100%);
      color: #d8e9ff;
      font-size: 9px;
      font-weight: 600;
      line-height: 1;
      cursor: pointer;
      align-self: auto;
      text-decoration: none;
      font-family: "Segoe UI Variable Text", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;
      position: relative;
      z-index: 100;
      pointer-events: auto;
    }

    .rrw-launch-btn-inline {
      margin: 0;
      position: relative;
      z-index: 100;
      pointer-events: auto;
    }

    .rrw-usernote-chip--error {
      border-color: #7a2a2a !important;
      background: linear-gradient(180deg, #4a1414 0%, #3a0e0e 100%) !important;
      color: #ffb3b3 !important;
    }

    .rrw-profile-btn {
      margin: 0;
      min-width: 18px;
      justify-content: center;
      font-weight: 700;
      letter-spacing: 0.01em;
    }

    .rrw-history-btn {
      margin: 0;
      min-width: 18px;
      justify-content: center;
      font-weight: 700;
      letter-spacing: 0.01em;
    }

    .rrw-modlog-btn {
      margin: 0;
      min-width: 18px;
      justify-content: center;
      font-weight: 700;
      letter-spacing: 0.01em;
    }

    .rrw-comment-nuke-btn {
      margin: 0;
      min-width: 18px;
      justify-content: center;
      font-weight: 700;
      letter-spacing: 0.01em;
      border-color: #8c3a3a;
      background: linear-gradient(180deg, #6b1f1f 0%, #4f1515 100%);
      color: #ffe0e0;
    }

    .rrw-comment-nuke-btn[data-comment-nuke-state="idle"] {
      border-color: #355a91;
      background: linear-gradient(180deg, #173a63 0%, #102a4a 100%);
      color: #d8e9ff;
    }

    .rrw-comment-nuke-btn[data-comment-nuke-state="busy"] {
      border-color: #916d2c;
      background: linear-gradient(180deg, #7b5a1f 0%, #5f4316 100%);
      color: #fff1cf;
    }

    .rrw-comment-nuke-btn[data-comment-nuke-state="success"] {
      border-color: #2f7a54;
      background: linear-gradient(180deg, #1d5d3d 0%, #154630 100%);
      color: #d8ffec;
    }

    .rrw-comment-nuke-btn[data-comment-nuke-state="error"] {
      border-color: #8c3a3a;
      background: linear-gradient(180deg, #7b2323 0%, #5f1717 100%);
      color: #ffd6d6;
    }

    .rrw-launch-btn-inline--solo {
      margin-left: 3px !important;
    }

    .rrw-launch-btn-inline:hover {
      filter: none;
      opacity: 1;
    }

    .rrw-usernote-chip {
      margin: 0;
      max-width: none;
      display: inline-flex;
      align-items: center;
      gap: 1px;
    }

    .rrw-usernote-inline-text {
      min-width: 0;
      max-width: none;
      font-weight: 600;
      white-space: nowrap;
      overflow: visible;
      text-overflow: clip;
    }

    .rrw-usernote-count {
      font-weight: 700;
      color: inherit;
      white-space: nowrap;
      margin-left: 1px;
    }

    .rrw-usernote-chip[data-has-notes="0"] {
      opacity: 1;
    }

    .rrw-launch-btn:hover,
    .rrw-launch-btn-inline:hover,
    .rrw-usernote-chip:hover,
    .rrw-history-btn:hover,
    .rrw-modlog-btn:hover,
    .rrw-comment-nuke-btn:hover,
    .rrw-profile-btn:hover {
      background: linear-gradient(180deg, #204a7d 0%, #153861 100%);
      border-color: #4f79b6;
      color: #eaf3ff;
      opacity: 1;
    }

    .rrw-launch-btn:focus-visible,
    .rrw-launch-btn-inline:focus-visible,
    .rrw-usernote-chip:focus-visible,
    .rrw-history-btn:focus-visible,
    .rrw-modlog-btn:focus-visible,
    .rrw-comment-nuke-btn:focus-visible,
    .rrw-profile-btn:focus-visible {
      outline: 2px solid #79a9ef;
      outline-offset: 1px;
    }

    .rrw-inline-group {
      display: inline-flex;
      gap: 2px;
      align-items: center;
      position: relative;
      z-index: 100;
      pointer-events: auto;
    }

    /* Light Theme Pill/Button Overrides */
    html[data-rrw-theme="light"] .rrw-launch-btn,
    html[data-rrw-theme="light"] .rrw-usernote-chip,
    html[data-rrw-theme="light"] .rrw-history-btn,
    html[data-rrw-theme="light"] .rrw-modlog-btn,
    html[data-rrw-theme="light"] .rrw-comment-nuke-btn,
    html[data-rrw-theme="light"] .rrw-profile-btn {
      border: 1px solid #c5d9f1;
      background: linear-gradient(180deg, #e8f1ff 0%, #d8e8ff 100%);
      color: #2c4a70;
    }

    html[data-rrw-theme="light"] .rrw-launch-btn:hover,
    html[data-rrw-theme="light"] .rrw-usernote-chip:hover,
    html[data-rrw-theme="light"] .rrw-history-btn:hover,
    html[data-rrw-theme="light"] .rrw-modlog-btn:hover,
    html[data-rrw-theme="light"] .rrw-profile-btn:hover {
      background: linear-gradient(180deg, #d8e8ff 0%, #c8dcff 100%);
      border-color: #8fb3d9;
      color: #1a3a5c;
    }

    html[data-rrw-theme="light"] .rrw-comment-nuke-btn {
      border-color: #e5c5c5;
      background: linear-gradient(180deg, #fff0f0 0%, #ffe8e8 100%);
      color: #8b3a3a;
    }

    html[data-rrw-theme="light"] .rrw-comment-nuke-btn[data-comment-nuke-state="idle"] {
      border-color: #a4b8d8;
      background: linear-gradient(180deg, #e8f0fb 0%, #dce8f7 100%);
      color: #2f5178;
    }

    html[data-rrw-theme="light"] .rrw-comment-nuke-btn:hover {
      background: linear-gradient(180deg, #d8e8ff 0%, #c8dcff 100%);
      border-color: #8fb3d9;
      color: #1a3a5c;
    }

    html[data-rrw-theme="light"] .rrw-usernote-chip--error {
      border-color: #e5a5a5 !important;
      background: linear-gradient(180deg, #ffe8e8 0%, #ffd8d8 100%) !important;
      color: #9a4a4a !important;
    }

    .rrw-qa-reply-pill {
      display: inline-block;
      padding: 3px 10px;
      border: 1px solid #355a91;
      border-radius: 4px;
      background: linear-gradient(180deg, #173a63 0%, #102a4a 100%);
      color: #d8e9ff;
      font-size: 11px;
      font-weight: 600;
      line-height: 1.4;
      cursor: pointer;
      vertical-align: middle;
      margin-left: 8px;
      font-family: "Segoe UI Variable Text", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .rrw-qa-reply-pill:hover {
      background: linear-gradient(180deg, #1e487a 0%, #143560 100%);
      color: #eef4ff;
      border-color: #6699cc;
    }

    .rrw-qa-reply-pill:focus-visible {
      outline: 2px solid #79a9ef;
      outline-offset: 1px;
    }

    html[data-rrw-theme="light"] .rrw-qa-reply-pill {
      border-color: #747c8e;
      background: linear-gradient(180deg, #f0f2f5 0%, #e9ecf1 100%);
      color: #2f5178;
    }

    html[data-rrw-theme="light"] .rrw-qa-reply-pill:hover {
      background: linear-gradient(180deg, #e9ecf1 0%, #dfe5ed 100%);
      color: #1a3a5c;
      border-color: #5a6b8f;
    }

    .rrw-inline-group.rrw-mm-pills {
      display: flex !important;
      gap: 4px;
      align-items: center;
      justify-content: flex-start !important;
      margin: 8px 0 0 0 !important;
      padding: 0 !important;
      flex-wrap: wrap;
      text-align: left !important;
      width: 100%;
    }

    .rrw-mm-pills {
      display: flex !important;
      gap: 4px;
      align-items: center;
      justify-content: flex-start !important;
      margin: 8px 0 0 0 !important;
      padding: 0 !important;
      flex-wrap: wrap;
      text-align: left !important;
      width: 100%;
    }

    .rrw-note-type-pill {
      --rrw-pill-bg: #f3f4f6;
      --rrw-pill-border: #d1d5db;
      --rrw-pill-text: #374151;
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--rrw-pill-border);
      background: var(--rrw-pill-bg);
      color: var(--rrw-pill-text);
      border-radius: 4px;
      padding: 0 5px;
      font-size: 0.72rem;
      font-weight: 600;
      line-height: 1.05;
      max-width: 180px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .rrw-note-type-pill--compact {
      font-size: 0.62rem;
      padding: 1px 4px;
      border-radius: 4px;
      line-height: 1;
      max-width: 88px;
      flex: 0 0 auto;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .rrw-usernotes-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.62);
      z-index: 2147483646;
    }

    .rrw-usernotes-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(760px, calc(100vw - 24px));
      max-height: calc(100vh - 24px);
      overflow: auto;
      border-radius: 12px;
      border: 1px solid var(--rrw-border);
      background: var(--rrw-modal-bg);
      color: var(--rrw-text);
      box-shadow: 0 20px 55px rgba(0, 0, 0, 0.35);
      z-index: 2147483647;
      padding: 0;
    }

    .rrw-usernotes-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 12px 14px;
      border-bottom: 1px solid var(--rrw-soft-border);
      position: sticky;
      top: 0;
      background: var(--rrw-modal-bg);
      z-index: 2;
    }

    .rrw-usernotes-header h3 {
      margin: 0;
      font-size: 0.94rem;
      line-height: 1.3;
    }

    .rrw-usernotes-body {
      display: grid;
      gap: 10px;
      padding: 12px 14px 14px;
    }

    .rrw-usernote-list {
      display: grid;
      gap: 8px;
    }

    .rrw-usernote-row {
      display: grid;
      gap: 6px;
      border: 1px solid var(--rrw-soft-border);
      border-radius: 8px;
      padding: 8px;
      background: var(--rrw-card-bg);
    }

    .rrw-usernote-type-wrap {
      display: flex;
      align-items: center;
    }

    .rrw-usernote-meta {
      color: var(--rrw-muted);
      font-size: 0.79rem;
      line-height: 1.3;
    }

    .rrw-usernote-link {
      color: var(--rrw-link);
      font-size: 0.78rem;
      line-height: 1.25;
      text-decoration: underline;
      word-break: break-all;
    }

    .rrw-usernote-row-actions {
      display: flex;
      justify-content: flex-end;
    }

    .rrw-usernote-include-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.82rem;
      color: var(--rrw-text);
    }

    .rrw-usernote-add-box {
      display: grid;
      gap: 6px;
      border: 1px solid var(--rrw-border);
      border-radius: 10px;
      background: var(--rrw-field-bg);
      padding: 10px;
    }

    .rrw-usernote-add-box h4 {
      margin: 0;
      font-size: 0.88rem;
    }

    .rrw-field {
      display: grid;
      gap: 6px;
      font-size: 0.86rem;
      color: var(--rrw-text);
    }

    .rrw-field--checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
    }

    .rrw-field--checkbox input[type="checkbox"] {
      margin: 0;
      width: auto;
    }

    html[data-rrw-theme="light"] .rrw-usernotes-backdrop {
      background: rgba(215, 227, 245, 0.68);
    }

    html[data-rrw-theme="light"] .rrw-usernotes-modal {
      border-color: rgba(149, 175, 210, 0.78);
      background: linear-gradient(180deg, rgba(246, 250, 255, 0.995), rgba(236, 245, 255, 0.99));
      color: #21324a;
      box-shadow: 0 24px 70px rgba(81, 109, 145, 0.28);
    }

    html[data-rrw-theme="light"] .rrw-usernotes-header {
      background: rgba(245, 250, 255, 0.98);
      border-bottom-color: rgba(153, 179, 212, 0.48);
    }

    html[data-rrw-theme="light"] .rrw-usernote-row {
      background: rgba(241, 248, 255, 0.95);
    }

    html[data-rrw-theme="light"] .rrw-usernote-add-box {
      background: rgba(236, 245, 255, 0.96);
    }

    html[data-rrw-theme="light"] .rrw-usernotes-modal textarea,
    html[data-rrw-theme="light"] .rrw-usernotes-modal input,
    html[data-rrw-theme="light"] .rrw-usernotes-modal select {
      background: rgba(236, 245, 255, 0.96);
      color: #21324a;
    }

    html[data-rrw-theme="light"] .rrw-usernotes-modal textarea::placeholder,
    html[data-rrw-theme="light"] .rrw-usernotes-modal input::placeholder {
      color: #6b84a5;
    }

    #rrw-context-popup-root {
      --rrw-font-family: "Segoe UI Variable Text", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;
      --rrw-context-bg: rgba(12, 20, 34, 0.98);
      --rrw-context-surface: rgba(21, 38, 62, 0.9);
      --rrw-context-border: rgba(98, 133, 192, 0.52);
      --rrw-context-text: #e7f0ff;
      --rrw-context-muted: #9eb6df;
      --rrw-context-link: #9bc2ff;
      color-scheme: dark;
      font-family: var(--rrw-font-family);
    }

    .rrw-comment-context-popup {
      color: #4f84d8 !important;
    }

    .rrw-comment-context-popup:hover {
      color: #2a5fb4 !important;
      text-decoration: underline;
    }

    #rrw-context-popup-root .rrw-context-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(7, 12, 22, 0.72);
      z-index: 2147483642;
    }

    #rrw-context-popup-root .rrw-context-modal {
      position: fixed;
      inset: 50% auto auto 50%;
      transform: translate(-50%, -50%);
      width: min(860px, calc(100vw - 24px));
      max-height: calc(100vh - 24px);
      overflow: auto;
      border-radius: 12px;
      border: 1px solid var(--rrw-context-border);
      background: linear-gradient(160deg, rgba(12, 20, 34, 0.98), rgba(16, 27, 44, 0.99));
      color: var(--rrw-context-text);
      box-shadow: 0 18px 44px rgba(5, 9, 14, 0.56);
      z-index: 2147483643;
      font-family: var(--rrw-font-family);
    }

    #rrw-context-popup-root .rrw-context-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 12px;
      border-bottom: 1px solid var(--rrw-context-border);
      position: sticky;
      top: 0;
      background: linear-gradient(180deg, rgba(17, 29, 47, 0.98), rgba(17, 29, 47, 0.88));
      backdrop-filter: blur(2px);
      z-index: 1;
      cursor: move;
      user-select: none;
    }

    #rrw-context-popup-root .rrw-context-header h2 {
      margin: 0;
      font-size: 0.98rem;
      line-height: 1.25;
      color: #dce9ff;
    }

    #rrw-context-popup-root .rrw-context-body {
      display: grid;
      gap: 8px;
      padding: 10px 12px 12px;
    }

    #rrw-context-popup-root .rrw-context-empty {
      border: 1px dashed var(--rrw-context-border);
      border-radius: 10px;
      background: var(--rrw-context-surface);
      color: var(--rrw-context-muted);
      padding: 12px;
      text-align: center;
      font-size: 0.84rem;
    }

    #rrw-context-popup-root .rrw-context-item {
      margin-left: var(--rrw-context-indent, 0px);
      border: 1px solid var(--rrw-context-border);
      border-radius: 10px;
      background: var(--rrw-context-surface);
      padding: 8px 9px;
      display: grid;
      gap: 5px;
    }

    #rrw-context-popup-root .rrw-context-item--target {
      border-color: rgba(153, 194, 255, 0.86);
      box-shadow: 0 0 0 1px rgba(153, 194, 255, 0.28);
      background: rgba(35, 62, 98, 0.72);
    }

    #rrw-context-popup-root .rrw-context-item-header {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      font-size: 0.75rem;
      color: var(--rrw-context-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    #rrw-context-popup-root .rrw-context-item-target-tag {
      border: 1px solid rgba(153, 194, 255, 0.8);
      border-radius: 999px;
      padding: 1px 7px;
      background: rgba(31, 65, 114, 0.92);
      color: #cfe2ff;
      font-size: 0.68rem;
      font-weight: 600;
    }

    #rrw-context-popup-root .rrw-context-item-body {
      color: var(--rrw-context-text);
      font-size: 0.84rem;
      line-height: 1.35;
      word-break: break-word;
    }

    #rrw-context-popup-root .rrw-context-item-body .md,
    #rrw-context-popup-root .rrw-context-item-body .md p,
    #rrw-context-popup-root .rrw-context-item-body .md li,
    #rrw-context-popup-root .rrw-context-item-body .md strong,
    #rrw-context-popup-root .rrw-context-item-body .md em,
    #rrw-context-popup-root .rrw-context-item-body .md code {
      color: var(--rrw-context-text) !important;
    }

    #rrw-context-popup-root .rrw-context-item-body .md a {
      color: var(--rrw-context-link) !important;
      text-decoration: underline;
    }

    #rrw-context-popup-root .rrw-context-item-footer a {
      color: var(--rrw-context-link);
      text-decoration: underline;
      font-size: 0.76rem;
    }

    @media (max-width: 900px) {
      #rrw-context-popup-root .rrw-context-modal {
        width: calc(100vw - 12px);
        max-height: calc(100vh - 12px);
      }

      #rrw-context-popup-root .rrw-context-item {
        margin-left: 0;
      }
    }

    /* ──── Removal Overlay Styles ──── */

    .rrw-overlay-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.62);
      z-index: 2147483645;
    }

    .rrw-overlay-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      width: min(680px, calc(100vw - 32px));
      max-height: calc(100vh - 32px);
      overflow: auto;
      transform: translate(-50%, -50%);
      background: var(--rrw-modal-bg);
      color: var(--rrw-text);
      border-radius: 12px;
      box-shadow: 0 20px 55px rgba(0, 0, 0, 0.35);
      z-index: 2147483646;
      font-family: var(--rrw-font-family);
    }

    .rrw-overlay-modal--compact {
      width: min(620px, calc(100vw - 20px));
      max-height: calc(100vh - 20px);
    }

    .rrw-overlay-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--rrw-soft-border);
      padding: 12px 16px;
    }

    .rrw-header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .rrw-overlay-header h2 {
      margin: 0;
      font-size: 1.05rem;
      color: var(--rrw-text);
    }

    .rrw-refresh-btn {
      appearance: none;
      -webkit-appearance: none;
      border: 1px solid var(--rrw-soft-border);
      border-radius: 6px;
      background: transparent;
      color: var(--rrw-muted);
      padding: 2px 6px;
      font-size: 0.95rem;
      line-height: 1.2;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
    }

    .rrw-refresh-btn:hover {
      color: var(--rrw-text);
      border-color: var(--rrw-text);
    }

    .rrw-refresh-btn--spinning {
      animation: rrw-spin 0.8s linear infinite;
    }

    @keyframes rrw-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .rrw-close {
      appearance: none;
      -webkit-appearance: none;
      border: 1px solid var(--rrw-close-border);
      border-radius: 8px;
      background: var(--rrw-close-bg);
      color: var(--rrw-text);
      padding: 4px 9px;
      line-height: 1.2;
      font-size: 0.84rem;
      cursor: pointer;
    }

    .rrw-overlay-body {
      padding: 14px 16px 16px;
      display: grid;
      gap: 12px;
    }

    .rrw-tabs {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid var(--rrw-soft-border);
      padding-bottom: 8px;
    }

    .rrw-tab-btn {
      appearance: none;
      -webkit-appearance: none;
      border: 1px solid var(--rrw-soft-border);
      border-radius: 8px;
      background: var(--rrw-card-bg);
      color: var(--rrw-muted);
      font-size: 0.84rem;
      font-weight: 600;
      padding: 6px 10px;
      cursor: pointer;
    }

    .rrw-tab-btn--active {
      border-color: var(--rrw-link);
      color: var(--rrw-link);
      background: var(--rrw-field-bg);
    }

    .rrw-sticky-footer {
      position: sticky;
      bottom: 0;
      display: grid;
      gap: 10px;
      background: linear-gradient(to top, var(--rrw-footer-bg-top), var(--rrw-footer-bg-bottom));
      border-top: 1px solid var(--rrw-soft-border);
      margin: 4px -16px -16px;
      padding: 12px 16px 16px;
    }

    .rrw-target-card {
      border: 1px solid var(--rrw-soft-border);
      border-radius: 10px;
      padding: 10px 12px;
      background: var(--rrw-card-bg);
    }

    .rrw-target-card h3 {
      margin: 0 0 4px;
      font-size: 0.98rem;
      line-height: 1.3;
    }

    .rrw-target-card a {
      color: var(--rrw-link);
      text-decoration: none;
      font-size: 0.88rem;
    }

    .rrw-target-body {
      margin: 8px 0;
      font-size: 0.84rem;
      line-height: 1.35;
      color: var(--rrw-text);
      word-break: break-word;
    }

    .rrw-target-body--collapsed {
      max-height: calc(1.35em * 8);
      overflow: hidden;
      -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
      mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
    }

    .rrw-target-expand-btn {
      background: none;
      border: none;
      padding: 2px 0;
      font-size: 0.78rem;
      color: var(--rrw-link);
      cursor: pointer;
      display: block;
      margin-top: 2px;
    }

    .rrw-target-expand-btn:hover {
      text-decoration: underline;
    }

    .rrw-target-body > *:first-child {
      margin-top: 0;
    }

    .rrw-target-body > *:last-child {
      margin-bottom: 0;
    }

    .rrw-target-body p {
      margin: 0 0 0.45em;
    }

    .rrw-target-body a {
      text-decoration: underline;
    }

    .rrw-target-body ul,
    .rrw-target-body ol {
      margin: 0 0 0.45em;
      padding-left: 18px;
    }

    .rrw-target-body blockquote {
      margin: 0 0 0.45em;
      border-left: 3px solid var(--rrw-soft-border);
      padding-left: 9px;
      color: var(--rrw-muted);
    }

    .rrw-target-body code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 0.78rem;
      border: 1px solid var(--rrw-soft-border);
      background: var(--rrw-field-bg);
      border-radius: 4px;
      padding: 1px 4px;
    }

    .rrw-target-body .rrw-profile-codeblock {
      margin: 0 0 0.45em;
      border: 1px solid var(--rrw-soft-border);
      background: var(--rrw-field-bg);
      border-radius: 8px;
      padding: 8px;
      overflow: auto;
      white-space: pre;
    }

    .rrw-field {
      display: grid;
      gap: 6px;
      font-size: 0.86rem;
      color: var(--rrw-text);
    }

    .rrw-field--checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
    }

    .rrw-field--checkbox input[type="checkbox"] {
      margin: 0;
      width: auto;
    }

    .rrw-field--disabled {
      opacity: 0.45;
      pointer-events: none;
    }

    .rrw-field--search {
      margin-bottom: 6px;
    }

    .rrw-field--invalid input,
    .rrw-field--invalid textarea,
    .rrw-field--invalid select {
      border-color: #d13a46;
      box-shadow: 0 0 0 1px rgba(209, 58, 70, 0.12);
    }

    .rrw-field-error {
      color: #a61b26;
      font-size: 0.8rem;
    }

    .rrw-reason-summary {
      margin: 0 0 6px;
    }

    .rrw-chip-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 0 0 8px;
    }

    .rrw-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid var(--rrw-border);
      border-radius: 999px;
      background: var(--rrw-chip-bg);
      color: var(--rrw-chip-text);
      padding: 4px 10px;
      font-size: 0.8rem;
      cursor: pointer;
    }

    .rrw-fieldset {
      border: 1px solid var(--rrw-border);
      border-radius: 8px;
      padding: 8px 10px;
      margin: 0;
      background: var(--rrw-field-bg);
    }

    .rrw-fieldset legend {
      padding: 0 4px;
      font-size: 0.84rem;
      color: var(--rrw-muted);
      line-height: 1.2;
    }

    .rrw-checklist {
      display: grid;
      gap: 6px;
      max-height: 160px;
      overflow: auto;
      padding-right: 2px;
    }

    .rrw-preview-panel {
      display: grid;
      gap: 8px;
      border: 1px solid var(--rrw-border);
      border-radius: 10px;
      background: var(--rrw-card-bg);
      padding: 10px 12px;
    }

    .rrw-inline-usernote-panel {
      display: grid;
      gap: 8px;
      border: 1px solid var(--rrw-border);
      border-radius: 10px;
      background: var(--rrw-card-bg);
      padding: 10px 12px;
    }

    .rrw-user-actions-panel {
      display: grid;
      gap: 8px;
      border: 1px solid var(--rrw-border);
      border-radius: 10px;
      background: var(--rrw-card-bg);
      padding: 10px 12px;
    }

    .rrw-inline-usernote-panel h3 {
      margin: 0;
      font-size: 0.92rem;
      color: var(--rrw-text);
    }

    .rrw-user-actions-panel h3 {
      margin: 0;
      font-size: 0.92rem;
      color: var(--rrw-text);
    }

    .rrw-preview-panel__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .rrw-preview-panel__header h3 {
      margin: 0;
      font-size: 0.92rem;
      color: var(--rrw-text);
    }

    .rrw-preview-subject {
      margin: 0;
      font-size: 0.84rem;
      color: var(--rrw-text);
    }

    .rrw-preview-body {
      margin: 0;
      padding: 10px;
      border-radius: 8px;
      background: var(--rrw-preview-bg);
      border: 1px solid var(--rrw-border);
      color: var(--rrw-preview-text);
      font-family: monospace;
      font-size: 0.8rem;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-word;
      overflow-y: auto;
      max-height: 320px;
    }

    .rrw-check-item {
      display: grid;
      grid-template-columns: 16px minmax(0, 1fr);
      gap: 10px;
      align-items: start;
      font-size: 0.85rem;
      color: var(--rrw-text);
      text-align: left;
      width: 100%;
      margin: 0;
    }

    .rrw-check-item input[type="checkbox"] {
      margin: 2px 0 0;
      justify-self: center;
    }

    .rrw-check-item span {
      display: block;
      text-align: left;
      line-height: 1.25;
      word-break: break-word;
    }

    .rrw-field input,
    .rrw-field textarea,
    .rrw-field select {
      border: 1px solid var(--rrw-border);
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 0.9rem;
      width: 100%;
      box-sizing: border-box;
      background: var(--rrw-field-bg);
      color: var(--rrw-text);
    }

    .rrw-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .rrw-actions--inline {
      justify-content: flex-start;
    }

    .rrw-quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 8px;
      width: 100%;
    }

    .rrw-quick-action-btn {
      width: 100%;
      justify-content: flex-start;
      text-align: left;
      min-height: 34px;
    }

    .rrw-btn {
      appearance: none;
      -webkit-appearance: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      border-radius: 8px;
      color: #fff;
      font-weight: 600;
      font-size: 0.85rem;
      line-height: 1.15;
      padding: 6px 11px;
      min-height: 30px;
      cursor: pointer;
    }

    .rrw-btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .rrw-btn-primary {
      background: #cb2431;
    }

    .rrw-btn-secondary {
      background: #1e5bd6;
    }

    .rrw-btn-danger {
      background: #7f1d1d;
    }

    .rrw-error {
      border: 1px solid var(--rrw-error-border);
      background: var(--rrw-error-bg);
      color: var(--rrw-error-text);
      border-radius: 8px;
      padding: 10px;
      font-size: 0.86rem;
    }

    .rrw-success {
      border: 1px solid var(--rrw-success-border);
      background: var(--rrw-success-bg);
      color: var(--rrw-success-text);
      border-radius: 8px;
      padding: 10px;
      font-size: 0.86rem;
    }

    .rrw-warning {
      border: 1px solid var(--rrw-warning-border);
      background: var(--rrw-warning-bg);
      color: var(--rrw-warning-text);
      border-radius: 8px;
      padding: 10px;
      font-size: 0.86rem;
    }

    .rrw-muted {
      color: var(--rrw-muted);
      margin: 0;
      font-size: 0.84rem;
    }

    .rrw-footer-links {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
    }

    .rrw-footer-links--solo {
      border-top: 1px solid var(--rrw-soft-border);
      padding-top: 10px;
    }

    .rrw-link-btn {
      border: 0;
      background: transparent;
      color: var(--rrw-link);
      cursor: pointer;
      padding: 0;
      font-size: 0.85rem;
      text-decoration: underline;
    }

    .rrw-removal-config-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(8, 14, 26, 0.7);
      z-index: 2147483646;
    }

    .rrw-removal-config-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(1080px, calc(100vw - 24px));
      max-height: calc(100vh - 24px);
      overflow: hidden;
      border-radius: 14px;
      border: 1px solid rgba(61, 92, 143, 0.72);
      background: linear-gradient(180deg, rgba(10, 18, 31, 0.99), rgba(12, 21, 36, 0.99));
      color: var(--rrw-text);
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.48);
      z-index: 2147483647;
      display: grid;
      grid-template-rows: auto auto minmax(0, 1fr) auto;
    }

    .rrw-removal-config-header,
    .rrw-removal-config-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 16px;
      background: rgba(10, 18, 31, 0.98);
      position: sticky;
      z-index: 2;
    }

    .rrw-removal-config-header {
      top: 0;
      border-bottom: 1px solid rgba(54, 83, 130, 0.38);
    }

    .rrw-removal-config-header h2 {
      margin: 0 0 2px;
      font-size: 1rem;
      line-height: 1.2;
    }

    .rrw-removal-config-title {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .rrw-removal-config-logo {
      width: 34px;
      height: 34px;
      object-fit: contain;
      border-radius: 6px;
      flex: 0 0 auto;
    }

    .rrw-removal-config-tabs {
      display: flex;
      gap: 8px;
      padding: 10px 16px 0;
      background: rgba(10, 18, 31, 0.98);
      position: sticky;
      top: 58px;
      z-index: 2;
      border-bottom: 1px solid rgba(54, 83, 130, 0.24);
    }

    .rrw-removal-config-tab {
      border: 1px solid rgba(57, 86, 130, 0.5);
      border-bottom: 0;
      border-radius: 10px 10px 0 0;
      padding: 8px 12px;
      background: rgba(17, 29, 49, 0.9);
      color: #cfe1ff;
      cursor: pointer;
      font-size: 0.86rem;
      font-weight: 600;
    }

    .rrw-removal-config-tab.is-active {
      background: rgba(28, 49, 82, 0.96);
      color: #ffffff;
      border-color: rgba(106, 153, 224, 0.72);
      box-shadow: inset 0 -2px 0 rgba(120, 173, 255, 0.7);
    }

    .rrw-ext-wiki-actions {
      justify-content: flex-start;
    }

    .rrw-removal-config-footer {
      border-top: 1px solid rgba(54, 83, 130, 0.38);
      align-items: end;
      position: relative;
    }

    .rrw-removal-config-body {
      display: grid;
      gap: 14px;
      padding: 14px 16px 18px;
      min-height: 0;
      overflow: auto;
    }

    .rrw-removal-config-note {
      min-width: min(420px, 52vw);
      flex: 1 1 auto;
    }

    .rrw-config-section {
      display: grid;
      gap: 12px;
    }

    .rrw-config-grid {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    }

    .rrw-config-grid--queue-bar {
      align-items: start;
    }

    .rrw-config-grid--queue-bar .rrw-field {
      align-content: start;
    }

    .rrw-config-help {
      margin-top: 2px;
      font-size: 0.78rem;
      line-height: 1.25;
    }

    .rrw-config-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .rrw-config-toolbar--sticky {
      position: sticky;
      top: -14px;
      z-index: 4;
      align-self: start;
      background: var(--rrw-modal-bg);
      margin: -14px -16px 0;
      padding: 14px 16px 12px;
      border-bottom: 1px solid var(--rrw-soft-border);
    }

    .rrw-config-section--playbooks {
      position: relative;
    }

    .rrw-config-toolbar h3 {
      margin: 0;
      font-size: 0.94rem;
    }

    .rrw-config-reason-list {
      display: grid;
      gap: 12px;
    }

    .rrw-config-reason-card {
      display: grid;
      gap: 12px;
      border: 1px solid rgba(71, 104, 160, 0.42);
      border-radius: 12px;
      background: rgba(18, 30, 49, 0.88);
      padding: 12px;
    }

    .rrw-config-reason-head {
      display: grid;
      gap: 8px;
    }

    .rrw-config-reason-title-row {
      display: grid;
      gap: 8px;
      grid-template-columns: minmax(0, 1fr) auto auto auto auto;
      align-items: center;
    }

    .rrw-config-inline-toggle {
      white-space: normal;
      align-self: stretch;
      min-width: 0;
    }

    .rrw-config-inline-toggle span {
      min-width: 0;
      line-height: 1.3;
      overflow-wrap: anywhere;
    }

    .rrw-config-flag-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .rrw-config-preview-panel {
      background: rgba(11, 19, 31, 0.72);
    }

    .rrw-config-preview-list {
      margin: 0;
      padding-left: 18px;
      display: grid;
      gap: 6px;
      color: #d4e4ff;
      font-size: 0.83rem;
    }

    .rrw-config-preview-list li {
      margin: 0;
      line-height: 1.35;
    }

    .rrw-removal-config-modal textarea,
    .rrw-removal-config-modal input,
    .rrw-removal-config-modal select {
      background: rgba(11, 19, 31, 0.94);
    }

    @media (max-width: 900px) {
      .rrw-config-reason-title-row {
        grid-template-columns: 1fr 1fr;
      }

      .rrw-removal-config-footer {
        flex-direction: column;
        align-items: stretch;
      }

      .rrw-removal-config-note {
        min-width: 0;
        width: 100%;
      }
    }

    html[data-rrw-theme="light"] .rrw-removal-config-modal {
      border-color: rgba(149, 175, 210, 0.78);
      background: linear-gradient(180deg, rgba(246, 250, 255, 0.995), rgba(236, 245, 255, 0.99));
      color: #21324a;
      box-shadow: 0 24px 70px rgba(81, 109, 145, 0.28);
    }

    html[data-rrw-theme="light"] .rrw-removal-config-header,
    html[data-rrw-theme="light"] .rrw-removal-config-footer,
    html[data-rrw-theme="light"] .rrw-removal-config-tabs {
      background: rgba(245, 250, 255, 0.98);
    }

    html[data-rrw-theme="light"] .rrw-removal-config-header {
      border-bottom-color: rgba(153, 179, 212, 0.48);
    }

    html[data-rrw-theme="light"] .rrw-removal-config-tabs {
      border-bottom-color: rgba(153, 179, 212, 0.38);
    }

    html[data-rrw-theme="light"] .rrw-removal-config-tab {
      border-color: rgba(153, 179, 212, 0.66);
      background: rgba(232, 242, 255, 0.92);
      color: #355982;
    }

    html[data-rrw-theme="light"] .rrw-removal-config-tab.is-active {
      background: rgba(222, 235, 254, 0.98);
      color: #1e3a5a;
      border-color: rgba(120, 159, 220, 0.78);
      box-shadow: inset 0 -2px 0 rgba(94, 144, 214, 0.7);
    }

    html[data-rrw-theme="light"] .rrw-removal-config-footer {
      border-top-color: rgba(153, 179, 212, 0.48);
    }

    html[data-rrw-theme="light"] .rrw-config-reason-card {
      border-color: rgba(153, 179, 212, 0.68);
      background: rgba(241, 248, 255, 0.95);
    }

    html[data-rrw-theme="light"] .rrw-config-preview-panel {
      background: rgba(232, 242, 255, 0.9);
    }

    html[data-rrw-theme="light"] .rrw-config-preview-list {
      color: #29496f;
    }

    html[data-rrw-theme="light"] .rrw-removal-config-modal textarea,
    html[data-rrw-theme="light"] .rrw-removal-config-modal input,
    html[data-rrw-theme="light"] .rrw-removal-config-modal select {
      background: rgba(236, 245, 255, 0.96);
    }

    html[data-rrw-theme="light"] #rrw-context-popup-root .rrw-context-backdrop {
      background: rgba(176, 190, 212, 0.32);
    }

    html[data-rrw-theme="light"] #rrw-context-popup-root .rrw-context-modal {
      background: linear-gradient(160deg, rgba(246, 250, 255, 0.995), rgba(236, 245, 255, 0.99));
      border-color: rgba(149, 175, 210, 0.78);
      box-shadow: 0 18px 44px rgba(81, 109, 145, 0.24);
    }

    html[data-rrw-theme="light"] #rrw-context-popup-root .rrw-context-header {
      background: linear-gradient(180deg, rgba(245, 250, 255, 0.98), rgba(240, 247, 255, 0.95));
      border-bottom-color: rgba(153, 179, 212, 0.48);
    }

    html[data-rrw-theme="light"] #rrw-context-popup-root .rrw-context-header h2 {
      color: #21324a;
    }

    html[data-rrw-theme="light"] #rrw-context-popup-root .rrw-context-item--target {
      border-color: rgba(120, 159, 220, 0.78);
      box-shadow: 0 0 0 1px rgba(120, 159, 220, 0.42);
      background: rgba(214, 229, 252, 0.68);
    }

    html[data-rrw-theme="light"] #rrw-context-popup-root .rrw-context-item-target-tag {
      border-color: rgba(120, 159, 220, 0.78);
      background: rgba(222, 235, 254, 0.92);
      color: #3a5f8f;
    }

    html[data-rrw-theme="light"] #rrw-context-popup-root {
      --rrw-context-bg: rgba(248, 251, 255, 0.98);
      --rrw-context-surface: rgba(239, 247, 255, 0.96);
      --rrw-context-border: rgba(156, 181, 213, 0.72);
      --rrw-context-text: #213854;
      --rrw-context-muted: #607c9d;
      --rrw-context-link: #2a63be;
      color-scheme: light;
    }

    html[data-rrw-theme="light"] #rrw-profile-root {
      --rrw-profile-bg: rgba(248, 251, 255, 0.98);
      --rrw-profile-surface: rgba(232, 242, 255, 0.75);
      --rrw-profile-surface-strong: rgba(240, 247, 255, 0.95);
      --rrw-profile-border: rgba(156, 181, 213, 0.72);
      --rrw-profile-text: #223a58;
      --rrw-profile-muted: #627d9d;
      --rrw-profile-link: #2a63be;
      color-scheme: light;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-backdrop {
      background: rgba(215, 227, 245, 0.68);
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-modal {
      background: linear-gradient(180deg, rgba(246, 250, 255, 0.995), rgba(236, 245, 255, 0.99));
      border-color: rgba(149, 175, 210, 0.78);
      box-shadow: 0 18px 44px rgba(81, 109, 145, 0.28);
      color: #223a58;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-header {
      background: linear-gradient(180deg, rgba(245, 250, 255, 0.98), rgba(240, 247, 255, 0.95));
      border-bottom-color: rgba(153, 179, 212, 0.48);
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-header h2 {
      color: #23405f;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-avatar {
      background: rgba(236, 245, 255, 0.96);
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-sidebar-panel {
      border-color: rgba(153, 179, 212, 0.56);
      background: rgba(236, 245, 255, 0.92);
      color: #27486e;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-sidebar-panel h4 {
      color: #4f75a5;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-sidebar-row {
      color: #27486e;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-sidebar-row a {
      color: #2a63be;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-toolbar,
    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-search {
      border-color: rgba(156, 181, 213, 0.60);
      background: rgba(236, 245, 255, 0.96);
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-input,
    html[data-rrw-theme="light"] #rrw-profile-root select,
    html[data-rrw-theme="light"] #rrw-profile-root input[type="text"],
    html[data-rrw-theme="light"] #rrw-profile-root input[type="search"] {
      border-color: rgba(156, 181, 213, 0.60);
      background: rgba(240, 247, 255, 0.96);
      color: #223a58;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-field--checkbox {
      color: #627d9d;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-tab-btn {
      border-color: rgba(156, 181, 213, 0.56);
      background: rgba(232, 242, 255, 0.92);
      color: #355982;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-tab-btn:hover {
      border-color: rgba(120, 159, 220, 0.76);
      background: rgba(222, 235, 254, 0.98);
      color: #223a58;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-tab-btn--active {
      border-color: rgba(120, 159, 220, 0.82);
      background: rgba(214, 229, 252, 0.99);
      color: #1e3a5a;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-btn,
    html[data-rrw-theme="light"] #rrw-profile-root .rrw-close {
      border-color: rgba(153, 179, 212, 0.68);
      background: rgba(231, 241, 255, 0.98);
      color: #2f4f78;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-btn:hover,
    html[data-rrw-theme="light"] #rrw-profile-root .rrw-close:hover {
      border-color: rgba(120, 159, 220, 0.78);
      background: rgba(222, 235, 254, 0.98);
      color: #1e3a5a;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item {
      border-color: rgba(153, 179, 212, 0.52);
      background: rgba(236, 245, 255, 0.92);
      color: #27486e;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item-header {
      color: #4f75a5;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item-title {
      color: #1e3a5a;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item-mod {
      border-color: rgba(120, 159, 220, 0.62);
      background: rgba(214, 229, 252, 0.98);
      color: #2a63be;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item-body a {
      color: #2a63be;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item-body code {
      border-color: rgba(153, 179, 212, 0.36);
      background: rgba(236, 245, 255, 0.96);
      color: #27486e;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item-body .rrw-profile-codeblock {
      border-color: rgba(153, 179, 212, 0.36);
      background: rgba(236, 245, 255, 0.96);
      color: #27486e;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item-body .rrw-profile-codeblock code {
      color: #27486e;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item-body blockquote {
      border-left-color: rgba(153, 179, 212, 0.52);
      color: #627d9d;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item-footer {
      color: #627d9d;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-item-footer a {
      color: #2a63be;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-empty {
      border-color: rgba(153, 179, 212, 0.36);
      background: rgba(236, 245, 255, 0.92);
      color: #627d9d;
    }

    #rrw-inline-history-root {
      position: fixed;
      z-index: 2147483644;
      --rrw-font-family: "Segoe UI Variable Text", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;
      font-family: var(--rrw-font-family);
    }

    #rrw-inline-history-root .rrw-inline-history-popup {
      width: min(760px, calc(100vw - 20px));
      max-height: min(78vh, 560px);
      overflow: hidden;
      border: 1px solid rgba(98, 133, 192, 0.58);
      border-radius: 10px;
      background: rgba(12, 20, 34, 0.98);
      color: #e7f0ff;
      font-family: "Segoe UI Variable Text", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      box-shadow: 0 14px 36px rgba(0, 0, 0, 0.42);
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
    }

    #rrw-inline-history-root .rrw-inline-history-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 12px;
      border-bottom: 1px solid rgba(98, 133, 192, 0.4);
      background: rgba(21, 38, 62, 0.9);
    }

    #rrw-inline-history-root .rrw-inline-history-header h4 {
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.2;
      color: #dbe8ff;
    }

    #rrw-inline-history-root .rrw-inline-history-body {
      display: grid;
      gap: 10px;
      padding: 10px 12px 12px;
      overflow-y: auto;
    }

    #rrw-inline-history-root .rrw-inline-history-summary {
      display: grid;
      gap: 4px;
      padding: 8px;
      border: 1px solid rgba(98, 133, 192, 0.36);
      border-radius: 8px;
      background: rgba(21, 38, 62, 0.62);
      color: #dce9ff;
      font-size: 0.9rem;
    }

    #rrw-inline-history-root .rrw-inline-history-summary a {
      color: #9bc2ff;
      text-decoration: none;
    }

    #rrw-inline-history-root .rrw-inline-history-summary a:hover {
      text-decoration: underline;
    }

    #rrw-inline-history-root .rrw-inline-history-disclaimer {
      margin: 0;
      font-size: 0.84rem;
      line-height: 1.35;
      color: #9eb6df;
    }

    #rrw-inline-history-root .rrw-inline-history-available {
      margin: 0;
      font-size: 0.86rem;
      line-height: 1.4;
      color: #dce9ff;
    }

    #rrw-inline-history-root .rrw-inline-history-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    #rrw-inline-history-root .rrw-inline-history-panel {
      border: 1px solid rgba(98, 133, 192, 0.36);
      border-radius: 8px;
      background: rgba(21, 38, 62, 0.62);
      overflow: hidden;
    }

    #rrw-inline-history-root .rrw-inline-history-panel h5 {
      margin: 0;
      padding: 8px 10px;
      font-size: 0.82rem;
      line-height: 1.2;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: #b7cef1;
      border-bottom: 1px solid rgba(98, 133, 192, 0.32);
      background: rgba(19, 35, 58, 0.74);
    }

    #rrw-inline-history-root .rrw-inline-history-panel table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 0.81rem;
      color: #dce9ff;
    }

    #rrw-inline-history-root .rrw-inline-history-panel th,
    #rrw-inline-history-root .rrw-inline-history-panel td {
      padding: 6px 8px;
      border-bottom: 1px solid rgba(98, 133, 192, 0.2);
      text-align: left;
      vertical-align: top;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    #rrw-inline-history-root .rrw-inline-history-panel th {
      font-size: 0.74rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: #9eb6df;
      background: rgba(18, 32, 53, 0.8);
    }

    #rrw-inline-history-root .rrw-inline-history-panel td a {
      color: #9bc2ff;
      text-decoration: none;
    }

    #rrw-inline-history-root .rrw-inline-history-panel td a:hover {
      text-decoration: underline;
    }

    #rrw-inline-history-root .rrw-inline-history-row--warning {
      background: rgba(168, 118, 21, 0.18);
    }

    #rrw-inline-history-root .rrw-inline-history-row--danger {
      background: rgba(147, 44, 58, 0.2);
    }

    #rrw-inline-history-root .rrw-inline-history-row--current {
      box-shadow: inset 2px 0 0 rgba(121, 169, 239, 0.95);
    }

    #rrw-inline-history-root .rrw-inline-history-empty-cell {
      color: #9eb6df;
      font-style: italic;
    }

    html[data-rrw-theme="light"] #rrw-inline-history-root {
      color-scheme: light;
    }

    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-popup {
      border-color: rgba(149, 175, 210, 0.78);
      background: linear-gradient(180deg, rgba(246, 250, 255, 0.995), rgba(236, 245, 255, 0.99));
      color: #21324a;
      box-shadow: 0 14px 36px rgba(81, 109, 145, 0.24);
    }

    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-header {
      border-bottom-color: rgba(153, 179, 212, 0.42);
      background: rgba(245, 250, 255, 0.98);
    }

    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-header h4 {
      color: #23405f;
    }

    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-summary,
    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-panel {
      border-color: rgba(153, 179, 212, 0.42);
      background: rgba(236, 245, 255, 0.92);
      color: #27486e;
    }

    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-summary a,
    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-panel td a {
      color: #2a63be;
    }

    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-disclaimer,
    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-empty-cell {
      color: #627d9d;
    }

    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-available,
    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-panel table {
      color: #27486e;
    }

    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-panel h5 {
      color: #4f75a5;
      border-bottom-color: rgba(153, 179, 212, 0.36);
      background: rgba(227, 239, 255, 0.96);
    }

    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-panel th,
    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-panel td {
      border-bottom-color: rgba(153, 179, 212, 0.24);
    }

    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-panel th {
      color: #627d9d;
      background: rgba(232, 242, 255, 0.96);
    }

    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-row--warning {
      background: rgba(230, 193, 118, 0.22);
    }

    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-row--danger {
      background: rgba(223, 154, 165, 0.22);
    }

    html[data-rrw-theme="light"] #rrw-inline-history-root .rrw-inline-history-row--current {
      box-shadow: inset 2px 0 0 rgba(42, 99, 190, 0.64);
    }

    /* ════════════════════════════════════════════════════════════════════════════════════════ */
    /* Inline Modlog Popup */
    /* ════════════════════════════════════════════════════════════════════════════════════════ */

    #rrw-inline-modlog-root {
      position: fixed;
      z-index: 2147483644;
      --rrw-font-family: "Segoe UI Variable Text", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;
      font-family: var(--rrw-font-family);
    }

    #rrw-inline-modlog-root .rrw-inline-modlog-popup {
      width: min(560px, calc(100vw - 20px));
      max-height: min(72vh, 440px);
      overflow: hidden;
      border: 1px solid rgba(98, 133, 192, 0.58);
      border-radius: 10px;
      background: rgba(12, 20, 34, 0.98);
      color: #e7f0ff;
      font-family: "Segoe UI Variable Text", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      box-shadow: 0 14px 36px rgba(0, 0, 0, 0.42);
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
    }

    #rrw-inline-modlog-root .rrw-inline-modlog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 12px;
      border-bottom: 1px solid rgba(98, 133, 192, 0.4);
      background: rgba(21, 38, 62, 0.9);
    }

    #rrw-inline-modlog-root .rrw-inline-modlog-header h4 {
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.2;
      color: #dbe8ff;
    }

    #rrw-inline-modlog-root .rrw-inline-modlog-body {
      display: grid;
      gap: 10px;
      padding: 10px 12px 12px;
      overflow-y: auto;
    }

    #rrw-inline-modlog-root .rrw-inline-modlog-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 8px;
    }

    #rrw-inline-modlog-root .rrw-inline-modlog-list li {
      padding: 8px 10px;
      border: 1px solid rgba(98, 133, 192, 0.36);
      border-radius: 6px;
      background: rgba(21, 38, 62, 0.62);
      color: #dce9ff;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    #rrw-inline-modlog-root .rrw-inline-modlog-list strong {
      color: #cfe2ff;
      font-weight: 600;
    }

    #rrw-inline-modlog-root .rrw-muted {
      color: #9eb6df;
    }

    html[data-rrw-theme="light"] #rrw-inline-modlog-root {
      color-scheme: light;
    }

    html[data-rrw-theme="light"] #rrw-inline-modlog-root .rrw-inline-modlog-popup {
      border-color: rgba(149, 175, 210, 0.78);
      background: linear-gradient(180deg, rgba(246, 250, 255, 0.995), rgba(236, 245, 255, 0.99));
      color: #21324a;
      box-shadow: 0 14px 36px rgba(81, 109, 145, 0.24);
    }

    html[data-rrw-theme="light"] #rrw-inline-modlog-root .rrw-inline-modlog-header {
      border-bottom-color: rgba(153, 179, 212, 0.48);
      background: linear-gradient(180deg, rgba(245, 250, 255, 0.98), rgba(240, 247, 255, 0.95));
    }

    html[data-rrw-theme="light"] #rrw-inline-modlog-root .rrw-inline-modlog-header h4 {
      color: #223856;
    }

    html[data-rrw-theme="light"] #rrw-inline-modlog-root .rrw-inline-modlog-list li {
      border-color: rgba(149, 175, 210, 0.52);
      background: rgba(236, 245, 255, 0.88);
      color: #223856;
    }

    html[data-rrw-theme="light"] #rrw-inline-modlog-root .rrw-inline-modlog-list strong {
      color: #0f3a7d;
    }

    html[data-rrw-theme="light"] #rrw-inline-modlog-root .rrw-muted {
      color: #627d9d;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-modal {
      border-color: rgba(149, 175, 210, 0.78);
      background: linear-gradient(180deg, rgba(246, 250, 255, 0.995), rgba(236, 245, 255, 0.99));
      color: #223a58;
      box-shadow: 0 24px 70px rgba(81, 109, 145, 0.28);
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-header {
      border-bottom-color: rgba(153, 179, 212, 0.48);
      background: linear-gradient(180deg, rgba(245, 250, 255, 0.98), rgba(240, 247, 255, 0.95));
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-toolbar {
      border-color: rgba(156, 181, 213, 0.48);
      background: rgba(236, 245, 255, 0.96);
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-profile-search {
      border-color: rgba(156, 181, 213, 0.48);
      background: rgba(236, 245, 255, 0.96);
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-input {
      border-color: rgba(156, 181, 213, 0.72);
      background: rgba(240, 247, 255, 0.95);
      color: #223a58;
    }

    html[data-rrw-theme="light"] #rrw-profile-root .rrw-btn {
      border-color: rgba(156, 181, 213, 0.48);
      background: rgba(236, 245, 255, 0.96);
      color: #223a58;
    }

    #rrw-profile-root {
      --rrw-font-family: "Segoe UI Variable Text", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;
      --rrw-profile-bg: rgba(12, 20, 34, 0.97);
      --rrw-profile-surface: rgba(27, 46, 74, 0.55);
      --rrw-profile-surface-strong: rgba(21, 38, 62, 0.88);
      --rrw-profile-border: rgba(98, 133, 192, 0.52);
      --rrw-profile-text: #e7f0ff;
      --rrw-profile-muted: #9eb6df;
      --rrw-profile-link: #9bc2ff;
      color-scheme: dark;
      font-family: var(--rrw-font-family);
    }

    #rrw-profile-root .rrw-profile-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(7, 12, 22, 0.72);
      z-index: 2147483644;
    }

    #rrw-profile-root .rrw-profile-modal {
      position: fixed;
      inset: 50% auto auto 50%;
      transform: translate(-50%, -50%);
      width: min(1080px, calc(100vw - 28px));
      max-height: calc(100vh - 28px);
      overflow: auto;
      border: 1px solid var(--rrw-profile-border);
      border-radius: 14px;
      background: linear-gradient(160deg, rgba(12, 20, 34, 0.98), rgba(16, 27, 44, 0.99));
      color: var(--rrw-profile-text);
      box-shadow: 0 18px 44px rgba(5, 9, 14, 0.56);
      z-index: 2147483645;
      scrollbar-color: rgba(120, 159, 225, 0.5) transparent;
    }

    #rrw-profile-root .rrw-profile-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      border-bottom: 1px solid var(--rrw-profile-border);
      padding: 12px 16px;
      position: sticky;
      top: 0;
      background: linear-gradient(180deg, rgba(17, 29, 47, 0.98), rgba(17, 29, 47, 0.88));
      backdrop-filter: blur(2px);
      z-index: 1;
    }

    #rrw-profile-root .rrw-profile-header h2 {
      margin: 0;
      font-size: 1.04rem;
      line-height: 1.25;
      color: #dce9ff;
    }

    #rrw-profile-root .rrw-profile-layout {
      display: grid;
      grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
      gap: 12px;
      padding: 12px 14px 14px;
    }

    #rrw-profile-root .rrw-profile-sidebar {
      display: grid;
      align-content: start;
      gap: 10px;
    }

    #rrw-profile-root .rrw-profile-sidebar-panel {
      border: 1px solid var(--rrw-profile-border);
      border-radius: 10px;
      background: var(--rrw-profile-surface-strong);
      padding: 10px;
      display: grid;
      gap: 6px;
    }

    #rrw-profile-root .rrw-profile-sidebar-panel h4 {
      margin: 0;
      font-size: 0.86rem;
      color: var(--rrw-profile-muted);
      line-height: 1.25;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    #rrw-profile-root .rrw-profile-avatar {
      width: 56px;
      height: 56px;
      border-radius: 999px;
      object-fit: cover;
      border: 1px solid var(--rrw-profile-border);
      background: rgba(14, 24, 39, 0.95);
    }

    #rrw-profile-root .rrw-profile-sidebar-row {
      font-size: 0.82rem;
      color: var(--rrw-profile-text);
      line-height: 1.3;
      word-break: break-word;
    }

    #rrw-profile-root .rrw-profile-sidebar-row a,
    #rrw-profile-root .rrw-profile-item-footer a,
    #rrw-profile-root .rrw-profile-item a {
      color: var(--rrw-profile-link);
      text-decoration: underline;
    }

    #rrw-profile-root .rrw-profile-sidebar-description {
      margin: 0;
      font-size: 0.8rem;
      color: var(--rrw-profile-muted);
      line-height: 1.35;
    }

    #rrw-profile-root .rrw-profile-sidebar-list {
      margin: 0;
      padding-left: 16px;
      display: grid;
      gap: 4px;
      font-size: 0.8rem;
    }

    #rrw-profile-root .rrw-profile-main {
      display: grid;
      align-content: start;
      gap: 10px;
      min-width: 0;
    }

    #rrw-profile-root .rrw-profile-toolbar {
      display: grid;
      grid-template-columns: minmax(150px, 190px) max-content max-content;
      gap: 8px;
      align-items: end;
      padding: 8px 10px;
      border: 1px solid var(--rrw-profile-border);
      border-radius: 10px;
      background: var(--rrw-profile-surface);
    }

    #rrw-profile-root .rrw-profile-toolbar-field {
      min-width: 0;
      max-width: none;
    }

    #rrw-profile-root .rrw-profile-search {
      display: grid;
      grid-template-columns: minmax(130px, 180px) minmax(180px, 1fr) auto auto auto auto;
      gap: 8px;
      align-items: center;
      padding: 8px 10px;
      border: 1px solid var(--rrw-profile-border);
      border-radius: 10px;
      background: var(--rrw-profile-surface);
    }

    #rrw-profile-root .rrw-input {
      border: 1px solid var(--rrw-profile-border);
      border-radius: 8px;
      background: rgba(15, 28, 45, 0.86);
      color: var(--rrw-profile-text);
      padding: 7px 9px;
      font-size: 0.85rem;
      min-width: 0;
    }

    #rrw-profile-root select,
    #rrw-profile-root input[type="text"],
    #rrw-profile-root input[type="search"] {
      border: 1px solid var(--rrw-profile-border);
      border-radius: 8px;
      background: rgba(15, 28, 45, 0.86);
      color: var(--rrw-profile-text);
      height: 30px;
      line-height: 1.2;
      padding: 5px 9px;
      box-sizing: border-box;
    }

    #rrw-profile-root .rrw-field--checkbox {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--rrw-profile-muted);
      font-size: 0.82rem;
      margin: 0;
      white-space: nowrap;
    }

    #rrw-profile-root .rrw-field--checkbox input[type="checkbox"] {
      margin: 0;
      width: 14px;
      height: 14px;
    }

    #rrw-profile-root .rrw-profile-search .rrw-field--checkbox {
      justify-self: start;
    }

    #rrw-profile-root .rrw-tabs {
      display: flex;
      gap: 8px;
      border-bottom: 0;
      padding-bottom: 0;
      margin-bottom: 2px;
    }

    #rrw-profile-root .rrw-tab-btn {
      border: 1px solid var(--rrw-profile-border);
      border-radius: 8px;
      background: rgba(24, 42, 68, 0.9);
      color: #bed5ff;
      padding: 6px 10px;
      font-size: 0.82rem;
      line-height: 1;
      text-transform: lowercase;
      cursor: pointer;
    }

    #rrw-profile-root .rrw-tab-btn:hover {
      border-color: rgba(131, 176, 255, 0.8);
      background: rgba(35, 62, 98, 0.95);
    }

    #rrw-profile-root .rrw-tab-btn--active {
      border-color: rgba(131, 176, 255, 0.9);
      background: rgba(44, 73, 112, 0.95);
      color: #ffffff;
    }

    #rrw-profile-root .rrw-btn {
      appearance: none;
      -webkit-appearance: none;
      border: 1px solid rgba(98, 133, 192, 0.55);
      background: rgba(28, 49, 78, 0.92);
      color: #eef4ff;
      border-radius: 8px;
      padding: 0 11px;
      min-height: 30px;
      line-height: 1;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
    }

    #rrw-profile-root .rrw-btn:hover {
      border-color: rgba(131, 176, 255, 0.8);
      background: rgba(35, 62, 98, 0.95);
    }

    #rrw-profile-root .rrw-btn:disabled {
      opacity: 0.52;
      cursor: not-allowed;
    }

    #rrw-profile-root .rrw-close {
      border: 1px solid rgba(98, 133, 192, 0.55);
      background: rgba(28, 49, 78, 0.92);
      color: #eef4ff;
      border-radius: 8px;
    }

    #rrw-profile-root .rrw-close:hover {
      border-color: rgba(131, 176, 255, 0.8);
      background: rgba(35, 62, 98, 0.95);
    }

    #rrw-profile-root .rrw-profile-items {
      display: grid;
      gap: 8px;
      max-height: 62vh;
      overflow: auto;
      padding-right: 2px;
    }

    #rrw-profile-root .rrw-profile-item {
      border: 1px solid var(--rrw-profile-border);
      border-radius: 10px;
      background: var(--rrw-profile-surface-strong);
      padding: 9px 10px;
      display: grid;
      gap: 6px;
    }

    #rrw-profile-root .rrw-profile-item-header {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      font-size: 0.77rem;
      color: var(--rrw-profile-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    #rrw-profile-root .rrw-profile-item-mod {
      border: 1px solid rgba(131, 176, 255, 0.62);
      border-radius: 999px;
      background: rgba(31, 65, 114, 0.92);
      color: #cfe2ff;
      padding: 1px 7px;
      font-size: 0.7rem;
      font-weight: 600;
    }

    #rrw-profile-root .rrw-profile-item-title {
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.3;
      color: var(--rrw-profile-text);
      word-break: break-word;
    }

    #rrw-profile-root .rrw-profile-item-body {
      margin: 0;
      font-size: 0.84rem;
      color: var(--rrw-profile-text);
      line-height: 1.35;
      white-space: normal;
      word-break: break-word;
    }

    #rrw-profile-root .rrw-profile-item-body > *:first-child {
      margin-top: 0;
    }

    #rrw-profile-root .rrw-profile-item-body > *:last-child {
      margin-bottom: 0;
    }

    #rrw-profile-root .rrw-profile-item-body p {
      margin: 0 0 0.45em;
    }

    #rrw-profile-root .rrw-profile-item-body .md {
      margin: 0;
      color: var(--rrw-profile-text) !important;
    }

    #rrw-profile-root .rrw-profile-item-body .md > *:first-child {
      margin-top: 0;
    }

    #rrw-profile-root .rrw-profile-item-body .md > *:last-child {
      margin-bottom: 0;
    }

    #rrw-profile-root .rrw-profile-item-body h1,
    #rrw-profile-root .rrw-profile-item-body h2,
    #rrw-profile-root .rrw-profile-item-body h3,
    #rrw-profile-root .rrw-profile-item-body h4,
    #rrw-profile-root .rrw-profile-item-body h5,
    #rrw-profile-root .rrw-profile-item-body h6 {
      margin: 0 0 0.42em;
      line-height: 1.28;
      color: var(--rrw-profile-text);
    }

    #rrw-profile-root .rrw-profile-item-body h1 { font-size: 1.06rem; }
    #rrw-profile-root .rrw-profile-item-body h2 { font-size: 1.01rem; }
    #rrw-profile-root .rrw-profile-item-body h3 { font-size: 0.96rem; }
    #rrw-profile-root .rrw-profile-item-body h4,
    #rrw-profile-root .rrw-profile-item-body h5,
    #rrw-profile-root .rrw-profile-item-body h6 { font-size: 0.9rem; }

    #rrw-profile-root .rrw-profile-item-body a {
      color: var(--rrw-profile-link);
      text-decoration: underline;
    }

    #rrw-profile-root .rrw-profile-item-body .md p,
    #rrw-profile-root .rrw-profile-item-body .md li,
    #rrw-profile-root .rrw-profile-item-body .md td,
    #rrw-profile-root .rrw-profile-item-body .md th,
    #rrw-profile-root .rrw-profile-item-body .md h1,
    #rrw-profile-root .rrw-profile-item-body .md h2,
    #rrw-profile-root .rrw-profile-item-body .md h3,
    #rrw-profile-root .rrw-profile-item-body .md h4,
    #rrw-profile-root .rrw-profile-item-body .md h5,
    #rrw-profile-root .rrw-profile-item-body .md h6,
    #rrw-profile-root .rrw-profile-item-body .md strong,
    #rrw-profile-root .rrw-profile-item-body .md em,
    #rrw-profile-root .rrw-profile-item-body .md code {
      color: var(--rrw-profile-text) !important;
    }

    #rrw-profile-root .rrw-profile-item-body .md a {
      color: var(--rrw-profile-link) !important;
    }

    #rrw-profile-root .rrw-profile-item-body ul,
    #rrw-profile-root .rrw-profile-item-body ol {
      margin: 0 0 0.45em;
      padding-left: 18px;
    }

    #rrw-profile-root .rrw-profile-item-body blockquote {
      margin: 0 0 0.45em;
      border-left: 3px solid var(--rrw-profile-border);
      padding-left: 9px;
      color: var(--rrw-profile-muted);
    }

    #rrw-profile-root .rrw-profile-item-body code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 0.78rem;
      border: 1px solid var(--rrw-profile-border);
      background: var(--rrw-profile-surface);
      border-radius: 4px;
      padding: 1px 4px;
    }

    #rrw-profile-root .rrw-profile-item-body .rrw-profile-codeblock {
      margin: 0 0 0.45em;
      border: 1px solid var(--rrw-profile-border);
      background: rgba(14, 24, 39, 0.95);
      border-radius: 8px;
      padding: 8px;
      overflow: auto;
      white-space: pre;
    }

    #rrw-profile-root .rrw-profile-item-body .rrw-profile-codeblock code {
      border: 0;
      background: transparent;
      padding: 0;
      border-radius: 0;
      font-size: 0.76rem;
      line-height: 1.35;
      display: block;
    }

    #rrw-profile-root .rrw-profile-item-body table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 0 0.45em;
      font-size: 0.8rem;
    }

    #rrw-profile-root .rrw-profile-item-body th,
    #rrw-profile-root .rrw-profile-item-body td {
      border: 1px solid var(--rrw-profile-border);
      padding: 4px 6px;
      text-align: left;
      vertical-align: top;
    }

    #rrw-profile-root .rrw-profile-item-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
      font-size: 0.75rem;
      color: var(--rrw-profile-muted);
    }

    #rrw-profile-root .rrw-profile-empty {
      border: 1px dashed var(--rrw-profile-border);
      border-radius: 10px;
      padding: 16px;
      text-align: center;
      color: var(--rrw-profile-muted);
      font-size: 0.84rem;
      background: var(--rrw-profile-surface-strong);
    }

    @media (max-width: 900px) {
      #rrw-profile-root .rrw-profile-modal {
        width: calc(100vw - 16px);
        max-height: calc(100vh - 16px);
      }

      #rrw-profile-root .rrw-profile-layout {
        grid-template-columns: minmax(0, 1fr);
      }

      #rrw-profile-root .rrw-profile-toolbar {
        grid-template-columns: minmax(0, 1fr);
      }

      #rrw-profile-root .rrw-profile-search {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    #rrw-inline-history-root .rrw-inline-history-popup {
      width: min(760px, calc(100vw - 20px));
      max-height: min(78vh, 560px);
      overflow: hidden;
      border: 1px solid rgba(98, 133, 192, 0.58);
      border-radius: 10px;
      background: rgba(12, 20, 34, 0.98);
      color: #e7f0ff;
      font-family: "Segoe UI Variable Text", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      box-shadow: 0 14px 36px rgba(0, 0, 0, 0.42);
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
    }

    #rrw-inline-history-root .rrw-inline-history-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 12px;
      border-bottom: 1px solid rgba(98, 133, 192, 0.4);
      background: rgba(21, 38, 62, 0.9);
    }

    #rrw-inline-history-root .rrw-inline-history-header h4 {
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.2;
      color: #dbe8ff;
    }

    #rrw-inline-history-root .rrw-inline-history-body {
      display: grid;
      gap: 10px;
      padding: 10px 12px 12px;
      overflow-y: auto;
    }

    #rrw-inline-history-root .rrw-inline-history-summary {
      display: grid;
      gap: 4px;
      padding: 8px;
      border: 1px solid rgba(98, 133, 192, 0.36);
      border-radius: 8px;
      background: rgba(21, 38, 62, 0.62);
      color: #dce9ff;
      font-size: 0.9rem;
    }

    #rrw-inline-history-root .rrw-inline-history-summary a {
      color: #9bc2ff;
      text-decoration: none;
    }

    #rrw-inline-history-root .rrw-inline-history-summary a:hover {
      text-decoration: underline;
    }

    #rrw-inline-history-root .rrw-inline-history-disclaimer {
      margin: 0;
      font-size: 0.84rem;
      line-height: 1.35;
      color: #9eb6df;
    }

    #rrw-inline-history-root .rrw-inline-history-available {
      margin: 0;
      font-size: 0.86rem;
      line-height: 1.4;
      color: #dce9ff;
    }

    #rrw-inline-history-root .rrw-inline-history-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    #rrw-inline-history-root .rrw-inline-history-panel {
      border: 1px solid rgba(98, 133, 192, 0.36);
      border-radius: 8px;
      background: rgba(21, 38, 62, 0.62);
      overflow: hidden;
    }

    #rrw-inline-history-root .rrw-inline-history-panel h5 {
      margin: 0;
      padding: 8px 10px;
      font-size: 0.82rem;
      line-height: 1.2;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: #b7cef1;
      border-bottom: 1px solid rgba(98, 133, 192, 0.32);
      background: rgba(19, 35, 58, 0.74);
    }

    #rrw-inline-history-root .rrw-inline-history-panel table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 0.81rem;
      color: #dce9ff;
    }

    #rrw-inline-history-root .rrw-inline-history-panel th,
    #rrw-inline-history-root .rrw-inline-history-panel td {
      padding: 6px 8px;
      border-bottom: 1px solid rgba(98, 133, 192, 0.2);
      text-align: left;
      vertical-align: top;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    #rrw-inline-history-root .rrw-inline-history-panel th {
      font-size: 0.74rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: #9eb6df;
      background: rgba(18, 32, 53, 0.8);
    }

    #rrw-inline-history-root .rrw-inline-history-panel td a {
      color: #9bc2ff;
      text-decoration: none;
    }

    #rrw-inline-history-root .rrw-inline-history-panel td a:hover {
      text-decoration: underline;
    }

    #rrw-inline-history-root .rrw-inline-history-row--warning {
      background: rgba(168, 118, 21, 0.18);
    }

    #rrw-inline-history-root .rrw-inline-history-row--danger {
      background: rgba(147, 44, 58, 0.2);
    }

    #rrw-inline-history-root .rrw-inline-history-row--current {
      box-shadow: inset 2px 0 0 rgba(121, 169, 239, 0.95);
    }

    #rrw-inline-history-root .rrw-inline-history-empty-cell {
      color: #9eb6df;
      font-style: italic;
    }

    @media (max-width: 860px) {
      #rrw-inline-history-root .rrw-inline-history-grid {
        grid-template-columns: minmax(0, 1fr);
      }

      #rrw-profile-root .rrw-profile-layout {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    /* Queue Tools Toolbar Styling */
    .rrw-queue-tools {
      position: sticky;
      top: 10px;
      z-index: 2147482998;
      margin: 8px 14px;
      padding: 7px 8px;
      border: 1px solid rgba(98, 133, 192, 0.55);
      border-radius: 8px;
      background: rgba(12, 20, 34, 0.95);
      color: #d9e9ff;
      font-family: var(--rrw-font-family);
      box-shadow: 0 8px 18px rgba(3, 8, 16, 0.32);
    }

    .rrw-queue-tools-row {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 5px;
    }

    .rrw-queue-tools-row:last-child {
      margin-bottom: 0;
    }

    .rrw-queue-tools-meta {
      color: #9eb6df;
      font-size: 0.72rem;
      line-height: 1.2;
    }

    .rrw-queue-tools-controls button,
    .rrw-queue-tools-controls select,
    .rrw-queue-tools-controls input {
      appearance: none;
      -webkit-appearance: none;
      text-transform: none !important;
      letter-spacing: normal !important;
      text-shadow: none !important;
      font-weight: 600;
      line-height: 1.1;
      height: 26px;
      box-sizing: border-box;
      font-family: var(--rrw-font-family);
      font-size: 0.72rem;
      border-radius: 5px;
      border: 1px solid rgba(98, 133, 192, 0.55);
      background: rgba(22, 39, 62, 0.94);
      color: #e7f1ff;
      padding: 2px 7px;
    }

    .rrw-queue-tools-controls button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .rrw-queue-tools-controls input {
      min-width: 170px;
    }

    .rrw-queue-tools-controls button:disabled,
    .rrw-queue-tools-controls select:disabled,
    .rrw-queue-tools-controls input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .rrw-queue-tools-controls label {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #a9c3ee;
      font-size: 0.7rem;
      line-height: 1.1;
    }

    .rrw-queue-tools-empty {
      color: #9eb6df;
      font-size: 0.72rem;
    }

    .rrw-queue-tools-status {
      color: #9cddb1;
      font-size: 0.72rem;
    }

    .rrw-queue-tools-error {
      color: #ffb6bf;
      font-size: 0.72rem;
    }

    .rrw-queue-select {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-left: 6px;
      font-size: 0.72rem;
      color: #9eb6df;
      user-select: none;
    }

    .rrw-queue-select-li {
      display: inline-flex;
      align-items: center;
      list-style: none;
      margin-left: 6px;
    }

    .rrw-queue-select-input {
      width: 14px;
      height: 14px;
      accent-color: #6ea2f7;
    }

    .rrw-queue-filter-hidden {
      display: none !important;
    }

    /* Light theme queue tools */
    html[data-rrw-theme="light"] .rrw-queue-tools {
      border-color: rgba(166, 189, 217, 0.8);
      background: rgba(244, 249, 255, 0.98);
      color: #28415f;
      box-shadow: 0 8px 18px rgba(72, 102, 136, 0.18);
    }

    html[data-rrw-theme="light"] .rrw-queue-tools-meta,
    html[data-rrw-theme="light"] .rrw-queue-tools-empty {
      color: #637f9f;
    }

    html[data-rrw-theme="light"] .rrw-queue-tools-controls button,
    html[data-rrw-theme="light"] .rrw-queue-tools-controls select,
    html[data-rrw-theme="light"] .rrw-queue-tools-controls input {
      border-color: rgba(156, 183, 214, 0.75);
      background: rgba(233, 243, 255, 0.98);
      color: #24466f;
    }

    html[data-rrw-theme="light"] .rrw-queue-tools-controls label {
      color: #607694;
    }

    html[data-rrw-theme="light"] .rrw-queue-tools-status {
      color: #47a85f;
    }

    html[data-rrw-theme="light"] .rrw-queue-tools-error {
      color: #d93f5f;
    }
  `;
  document.documentElement.appendChild(style);
}
