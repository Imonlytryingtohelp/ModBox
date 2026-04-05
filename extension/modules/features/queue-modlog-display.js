// ════════════════════════════════════════════════════════════════════════════════════════════════
// Queue Modlog Display Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Displays the last 2 modlog entries for posts/comments in mod queues (modqueue, unmoderated, reports).
// Dependencies: constants.js, state.js, utilities.js, features/modlog-popup.js

// ──── Queue Modlog Display Functions ────

async function renderModlogEntriesForQueueItem(container, target, subreddit) {
  if (!(container instanceof HTMLElement) || !target || !subreddit) {
    console.log("[ModBox QueueModlog] Skipping: invalid params - container:", !!container, "target:", target, "subreddit:", subreddit);
    return;
  }

  // Remove any existing queue modlog display
  const existingDisplay = container.querySelector("[data-rrw-queue-modlog]");
  if (existingDisplay instanceof HTMLElement) {
    existingDisplay.remove();
  }

  try {
    console.log("[ModBox QueueModlog] Loading modlog for target:", target, "subreddit:", subreddit);
    
    // Load modlog index for this subreddit
    const index = await loadSubredditModlogIndex(subreddit);
    console.log("[ModBox QueueModlog] Index loaded, total size:", index.size);
    console.log("[ModBox QueueModlog] First 5 keys in index:", Array.from(index.keys()).slice(0, 5));
    console.log("[ModBox QueueModlog] Looking for target:", target);
    console.log("[ModBox QueueModlog] Entries for target:", index.get(target));
    
    const entries = Array.isArray(index.get(target)) ? index.get(target).slice(0, 2) : [];

    if (entries.length === 0) {
      console.log("[ModBox QueueModlog] No modlog entries for", target);
      return; // No modlog entries for this item
    }

    console.log("[ModBox QueueModlog] Found", entries.length, 'entries for', target);

    // Create the display element
    const display = createQueueModlogDisplay(entries);
    if (display instanceof HTMLElement) {
      // Insert after the main content area
      const insertPoint = findQueueItemInsertPoint(container);
      console.log("[ModBox QueueModlog] Insert point found:", !!insertPoint);
      
      if (insertPoint instanceof HTMLElement) {
        insertPoint.parentNode?.insertBefore(display, insertPoint.nextSibling);
        console.log("[ModBox QueueModlog] Display inserted after content");
      } else {
        container.appendChild(display);
        console.log("[ModBox QueueModlog] Display appended to container");
      }
    }
  } catch (error) {
    console.log("[ModBox QueueModlog] Error rendering queue modlog display:", error);
  }
}

function createQueueModlogDisplay(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return null;
  }

  const container = document.createElement("div");
  container.setAttribute("data-rrw-queue-modlog", "1");
  container.className = "rrw-queue-modlog-display";

  // Format entries as a single line: "action by /u/mod 22m ago - details | action by /u/mod 1h ago - details"
  const entryTexts = entries.map((entry) => {
    const details = entry.details ? ` - ${escapeHtml(entry.details)}` : "";
    return `<span class="rrw-queue-modlog-entry">${escapeHtml(entry.action || "unknown")} by /u/${escapeHtml(entry.mod || "unknown")} ${escapeHtml(formatRelativeTime(entry.createdUtc))}${details}</span>`;
  }).join('<span class="rrw-queue-modlog-separator"> | </span>');

  container.innerHTML = entryTexts;

  return container;
}

function findQueueItemInsertPoint(container) {
  if (!(container instanceof HTMLElement)) {
    return null;
  }

  // For old.reddit queue items (.thing), insert after the content
  const thingContent = container.querySelector(".thing > .entry");
  if (thingContent instanceof HTMLElement) {
    return thingContent;
  }

  // For new.reddit mod queue items (mod-queue-list-item), insert after the main content
  const modQueueContent = container.querySelector("[data-testid='post-container'], article");
  if (modQueueContent instanceof HTMLElement) {
    return modQueueContent;
  }

  // Fallback: insert after first major content container
  const contentContainers = [
    container.querySelector("article"),
    container.querySelector(".Post"),
    container.querySelector(".Comment"),
    container.querySelector("[data-testid='post-container']"),
  ];

  for (const contentContainer of contentContainers) {
    if (contentContainer instanceof HTMLElement) {
      return contentContainer;
    }
  }

  return null;
}

function bindQueueModlogDisplay() {
  console.log("[ModBox QueueModlog] Binding queue modlog display feature");
  console.log("[ModBox QueueModlog] Current pathname:", window.location.pathname);
  
  // Track which items we've already processed to avoid duplicate rendering
  const processedItems = new Set();

  const renderQueueModlogs = async (containers = null) => {
    const itemsToProcess = containers || collectQueueListingItems();
    console.log("[ModBox QueueModlog] Found", itemsToProcess.length, 'queue items to process');

    for (const item of itemsToProcess) {
      if (!item.container || !item.target || !item.subreddit) {
        console.log("[ModBox QueueModlog] Skipping item: missing container/target/subreddit");
        continue;
      }

      // Skip if already processed
      const itemKey = `${item.target}|${item.subreddit}`;
      if (processedItems.has(itemKey)) {
        continue;
      }
      processedItems.add(itemKey);

      console.log("[ModBox QueueModlog] Processing queue item:", itemKey);
      
      // Render modlog entries
      await renderModlogEntriesForQueueItem(item.container, item.target, item.subreddit);
    }
  };

  // Preload modlog index for the current subreddit to warm up the cache
  const subreddit = parseSubredditFromPath(window.location.pathname);
  console.log("[ModBox QueueModlog] parseSubredditFromPath returned:", subreddit);
  
  if (subreddit) {
    console.log("[ModBox QueueModlog] Preloading modlog index for subreddit:", subreddit);
    loadSubredditModlogIndex(subreddit)
      .then(() => {
        console.log("[ModBox QueueModlog] Modlog index preloaded successfully");
        // Now do the initial render with the warm cache
        renderQueueModlogs().catch((error) => {
          console.log("[ModBox QueueModlog] Error in queue modlog display:", error);
        });
      })
      .catch((error) => {
        console.log("[ModBox QueueModlog] Error preloading modlog index:", error);
      });
  } else {
    console.log("[ModBox QueueModlog] No subreddit found, skipping preload");
  }

  // Observe DOM for new queue items and re-render
  const observer = new MutationObserver((records) => {
    // Debounce by batching multiple mutations
    if (queueModlogDisplayRafScheduled) {
      return;
    }
    queueModlogDisplayRafScheduled = true;

    requestAnimationFrame(() => {
      queueModlogDisplayRafScheduled = false;
      renderQueueModlogs().catch((error) => {
        console.log("[ModBox QueueModlog] Error in queue modlog display mutation:", error);
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}
