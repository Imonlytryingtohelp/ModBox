// ════════════════════════════════════════════════════════════════════════════════════════════════
// Theme Feature Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Handles theme detection, application, and preference management.
// Dependencies: constants.js (THEME_MODE_KEY, OVERLAY_ROOT_ID), state.js (currentThemeMode, etc)

// ──── Theme Mode Normalization ────

function normalizeThemeMode(value, fallback = "auto") {
  const clean = String(value || "").trim().toLowerCase();
  return ["auto", "light", "dark"].includes(clean) ? clean : fallback;
}

// ──── Color Detection ────

function isDarkColor(colorValue) {
  const match = String(colorValue || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) {
    return false;
  }
  const r = Number(match[1]) / 255;
  const g = Number(match[2]) / 255;
  const b = Number(match[3]) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 0.45;
}

function pageUsesDarkTheme() {
  const html = document.documentElement;
  const body = document.body;
  const classText = `${html.className || ""} ${body?.className || ""}`.toLowerCase();
  if (/(^|\s)(dark|theme-dark|nightmode|theme--dark)(\s|$)/.test(classText)) {
    return true;
  }

  const themeText = `${html.getAttribute("data-theme") || ""} ${body?.getAttribute("data-theme") || ""} ${html.getAttribute("theme") || ""} ${body?.getAttribute("theme") || ""}`.toLowerCase();
  if (themeText.includes("dark")) {
    return true;
  }
  if (themeText.includes("light")) {
    return false;
  }

  const bodyBg = getComputedStyle(body || html).backgroundColor;
  const htmlBg = getComputedStyle(html).backgroundColor;
  if (isDarkColor(bodyBg) || isDarkColor(htmlBg)) {
    return true;
  }

  return globalThis.matchMedia?.("(prefers-color-scheme: dark)")?.matches === true;
}

// ──── Theme Resolution ────

function resolveActiveTheme(mode = currentThemeMode) {
  const normalizedMode = normalizeThemeMode(mode, "auto");
  if (normalizedMode === "light" || normalizedMode === "dark") {
    return normalizedMode;
  }

  const host = String(window.location.hostname || "").toLowerCase();
  if (host === "old.reddit.com") {
    return "light";
  }
  return pageUsesDarkTheme() ? "dark" : "light";
}

// ──── Theme Application ────

function applyThemeToDocument() {
  const activeTheme = resolveActiveTheme(currentThemeMode);
  document.documentElement.setAttribute("data-rrw-theme", activeTheme);
  const root = document.getElementById(OVERLAY_ROOT_ID);
  if (root instanceof HTMLElement) {
    root.setAttribute("data-rrw-theme", activeTheme);
  }
}

// ──── Theme Preference Management ────

async function loadThemePreference() {
  try {
    const stored = await ext.storage.sync.get([THEME_MODE_KEY]);
    currentThemeMode = normalizeThemeMode(stored?.[THEME_MODE_KEY], "auto");
  } catch {
    currentThemeMode = "auto";
  }
  applyThemeToDocument();
}

function bindThemeObservers() {
  if (themeObserverBound) {
    return;
  }
  themeObserverBound = true;

  if (typeof globalThis.matchMedia === "function") {
    themeMediaQueryList = globalThis.matchMedia("(prefers-color-scheme: dark)");
    const onThemeSignal = () => {
      if (currentThemeMode === "auto") {
        applyThemeToDocument();
      }
    };
    if (typeof themeMediaQueryList.addEventListener === "function") {
      themeMediaQueryList.addEventListener("change", onThemeSignal);
    } else if (typeof themeMediaQueryList.addListener === "function") {
      themeMediaQueryList.addListener(onThemeSignal);
    }
  }

  const observer = new MutationObserver(() => {
    if (currentThemeMode === "auto") {
      applyThemeToDocument();
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme", "theme"],
  });
}
