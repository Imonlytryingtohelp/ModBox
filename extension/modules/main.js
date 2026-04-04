// ============================================================================
// EXTENSION INITIALIZATION
// ============================================================================
// This is the main entry point that initializes all extension functionality.
// It should be included LAST in the build, after all other modules.

function start() {
  console.log("[ModBox] ===== EXTENSION START =====");
  console.log("[ModBox] Extension loaded and initializing...");
  markRrwSiteHost();
  applyThemeToDocument();
  bindThemeObservers();
  injectStyles();
  refreshPageTargetHints();
  bindNativeRemoveInterceptor();
  void loadNativeInterceptPreference();

  // Pointer-down guard: track when the user is mid-click so that full DOM
  // replacements in renderOverlay / renderRemovalConfigEditor / renderQueueBar
  // can be deferred rather than destroying the button node being clicked.
  document.addEventListener("pointerdown", () => { isPointerDown = true; }, true);
  document.addEventListener("pointerup", () => {
    isPointerDown = false;
    if (deferredRenders.size > 0) {
      const pending = new Set(deferredRenders);
      deferredRenders.clear();
      requestAnimationFrame(() => {
        if (pending.has("overlay")) renderOverlay();
        if (pending.has("config_editor")) renderRemovalConfigEditor();
        if (pending.has("queue_bar")) renderQueueBar(queueBarLastState);
      });
    }
  }, true);

  void loadContextPopupPreference().then(() => {
    bindOldRedditContextPopupLinks();
    bindCommentLockButtons();
  });
  void loadThemePreference();
  void loadCommentNukeIgnoreDistinguishedPreference();
  void loadContextPopupPosition();
  // Prioritize queue bar on page reload: initialize immediately so counts and links
  // appear without waiting for idle time or timeout fallback.
  void initQueueBar();
  // Bind queue tools immediately on queue pages so bulk actions toolbar appears
  const isQueuePage = /\/about\/(modqueue|unmoderated|reports)(?:\/|$)/i.test(String(window.location.pathname || "")) ||
                      /\/mod\/\w+\/queue(?:\/|$)/i.test(String(window.location.pathname || ""));
  console.log("[ModBox] Checking if this is a queue page:", isQueuePage);
  if (isQueuePage) {
    console.log("[ModBox] Calling bindQueueToolsFeatures on page load");
    bindQueueToolsFeatures();
  }
  bindContextPopupEvents();
  const pageSubreddit = normalizeSubreddit(parseSubredditFromPath(window.location.pathname));
  const initAllowedSubreddits = ensureAllowedLaunchSubredditsLoaded();

  // Do an immediate pass so the page starts progressively rather than waiting
  // on moderated-subreddit discovery before any bind work can happen.
  scheduleVisibleContainerBind({ fullScan: true });

  if (ext.storage?.onChanged) {
    ext.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "sync") {
        if (changes?.[INTERCEPT_NATIVE_REMOVE_KEY]) {
          const nextValue = changes[INTERCEPT_NATIVE_REMOVE_KEY].newValue;
          interceptNativeRemoveEnabled = typeof nextValue === "boolean" ? nextValue : true;
        }

        if (changes?.[COMMENT_NUKE_IGNORE_DISTINGUISHED_KEY]) {
          const nextValue = changes[COMMENT_NUKE_IGNORE_DISTINGUISHED_KEY].newValue;
          commentNukeIgnoreDistinguished = typeof nextValue === "boolean" ? nextValue : false;
        }

        if (
          changes?.[QUEUE_BAR_ENABLED_KEY] ||
          changes?.[QUEUE_BAR_SCOPE_KEY] ||
          changes?.[QUEUE_BAR_FIXED_SUBREDDIT_KEY] ||
          changes?.[QUEUE_BAR_LINK_HOST_KEY] ||
          changes?.[QUEUE_BAR_USE_OLD_REDDIT_KEY] ||
          changes?.[QUEUE_BAR_OPEN_IN_NEW_TAB_KEY] ||
          changes?.[CONTEXT_POPUP_ENABLED_KEY] ||
          changes?.[THEME_MODE_KEY] ||
          changes?.buttonVisibilityScope
        ) {
          panelSettingsPromise = null;
          clearQueueBarContextCache();
          allowedLaunchSubredditsLoaded = false;
          allowedLaunchSubredditsPromise = null;

          if (changes?.[CONTEXT_POPUP_ENABLED_KEY]) {
            const nextValue = changes[CONTEXT_POPUP_ENABLED_KEY].newValue;
            contextPopupFeatureEnabled = typeof nextValue === "boolean" ? nextValue : true;
            if (!contextPopupFeatureEnabled) {
              clearOldRedditContextPopupLinks();
              closeContextPopup();
            } else {
              bindOldRedditContextPopupLinks();
            }
          }

          if (changes?.[THEME_MODE_KEY]) {
            currentThemeMode = normalizeThemeMode(changes[THEME_MODE_KEY].newValue, "auto");
            applyThemeToDocument();
          }

          void ensureAllowedLaunchSubredditsLoaded();
          void refreshQueueBar(true);
        }
        return;
      }

      if (areaName === "local") {
        if (changes?.[QUEUE_BAR_COLLAPSED_KEY]) {
          queueBarCollapsed = Boolean(changes[QUEUE_BAR_COLLAPSED_KEY].newValue);
          if (queueBarLastState?.enabled) {
            renderQueueBar(queueBarLastState);
          }
        }

        if (changes?.[CONTEXT_POPUP_POSITION_KEY]) {
          contextPopupStoredPosition = normalizeContextPopupPosition(changes[CONTEXT_POPUP_POSITION_KEY].newValue);
          if (contextPopupState && contextPopupStoredPosition?.custom) {
            contextPopupState.position = { ...contextPopupStoredPosition };
            contextPopupState.customPosition = true;
            renderContextPopup();
          }
        }
      }
    });
  }

  void initAllowedSubreddits.finally(() => {
    scheduleVisibleContainerBind({ fullScan: true });

    const observer = new MutationObserver((records) => {
      scheduleVisibleContainerBind({ mutationRecords: records });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  });
}

// Start the extension
start();
