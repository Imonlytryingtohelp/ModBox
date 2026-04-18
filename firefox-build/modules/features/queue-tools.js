// ════════════════════════════════════════════════════════════════════════════════════════════════
// Queue Tools Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Bulk action toolbar for moderation queues (modqueue/unmoderated/reports)
// Allows filtering, selecting, and bulk approving/removing/spamming queue items
// Dependencies: constants.js, state.js, utilities.js, services/reddit-api.js

// ──── Queue Item Collection ────

function collectQueueListingItems() {
  const selectors = [
    "article",
    "shreddit-post",
    "shreddit-comment",
    "mod-queue-list-item",
    ".Comment",
    ".thing.link",
    ".thing.comment",
  ];

  const seen = new Set();
  const rows = [];
  let totalFound = 0;
  console.log("[ModBox] collectQueueListingItems: starting collection with selectors:", selectors);
  
  selectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    console.log("[ModBox] Selector", selector, "found", elements.length, "elements");
    
    elements.forEach((container) => {
      totalFound += 1;
      if (!(container instanceof HTMLElement)) {
        return;
      }
      
      // For mod-queue-list-item, extract target from data-ks-item attribute
      let target;
      if (container.tagName.toLowerCase() === "mod-queue-list-item") {
        target = String(container.getAttribute("data-ks-item") || "").trim();
        console.log("[ModBox] Found mod-queue-list-item with data-ks-item:", target);
      } else {
        target = pickTargetForContainer(container);
      }
      
      if (!target || !/^t[13]_[a-z0-9]{5,10}$/i.test(target)) {
        console.log("[ModBox] Skipping container: invalid or empty target:", target);
        return;
      }

      const subreddit = resolveContainerSubreddit(container);
      console.log("[ModBox] Resolved subreddit:", subreddit);
      if (!isAllowedLaunchSubreddit(subreddit)) {
        console.log("[ModBox] Skipping container: subreddit not allowed:", subreddit);
        return;
      }

      if (seen.has(target)) {
        return;
      }
      seen.add(target);

      const haystack = [
        container.textContent || "",
        container.getAttribute("data-author") || "",
        subreddit,
      ].join(" ").toLowerCase();

      rows.push({
        container,
        target,
        subreddit,
        thingType: getThingTypeLabelFromFullname(target),
        haystack,
      });
    });
  });

  console.log("[ModBox] collectQueueListingItems: found", totalFound, "containers, filtered to", rows.length, "valid items");

  // Ensure insertion anchors use actual page order rather than selector order.
  rows.sort((a, b) => {
    if (a.container === b.container) {
      return 0;
    }
    const relation = a.container.compareDocumentPosition(b.container);
    if (relation & Node.DOCUMENT_POSITION_FOLLOWING) {
      return -1;
    }
    if (relation & Node.DOCUMENT_POSITION_PRECEDING) {
      return 1;
    }
    return 0;
  });

  console.log("[ModBox] collectQueueListingItems found", rows.length, "items after filtering");
  return rows;
}

// ──── Queue Item Selection Controls ────

function ensureQueueSelectionControl(item) {
  const { container, target } = item;
  let input = container.querySelector(`.rrw-queue-select-input[data-target="${CSS.escape(target)}"]`);
  if (!(input instanceof HTMLInputElement)) {
    const wrapper = document.createElement("label");
    wrapper.className = "rrw-queue-select";
    wrapper.title = "Select for bulk actions";

    input = document.createElement("input");
    input.type = "checkbox";
    input.className = "rrw-queue-select-input";
    input.dataset.target = target;

    const text = document.createElement("span");
    text.textContent = "Select";

    wrapper.appendChild(input);
    wrapper.appendChild(text);

    const oldRedditButtons = container.querySelector(".entry .flat-list.buttons, .entry ul.buttons");
    if (oldRedditButtons instanceof HTMLUListElement) {
      const listItem = document.createElement("li");
      listItem.className = "rrw-queue-select-li";
      listItem.appendChild(wrapper);
      oldRedditButtons.appendChild(listItem);
    } else {
      const inlineGroup = container.querySelector(".rrw-inline-group");
      if (inlineGroup instanceof HTMLElement) {
        inlineGroup.insertAdjacentElement("afterend", wrapper);
      } else {
        const authorLink = findAuthorAnchor(container);
        const host = authorLink?.parentElement || container.querySelector("header") || container;
        host.appendChild(wrapper);
      }
    }

    input.addEventListener("click", (event) => event.stopPropagation());
    input.addEventListener("mousedown", (event) => event.stopPropagation());
    input.addEventListener("mouseup", (event) => event.stopPropagation());
    wrapper.addEventListener("click", (event) => event.stopPropagation());

    input.addEventListener("change", () => {
      if (input.checked) {
        queueToolsSelectedTargets.add(target);
      } else {
        queueToolsSelectedTargets.delete(target);
      }
      renderQueueToolsBar(collectQueueListingItems());
    });
  }

  input.checked = queueToolsSelectedTargets.has(target);
}

function findAuthorAnchor(container) {
  if (!(container instanceof HTMLElement)) {
    return null;
  }

  const selectors = [
    ".tagline a.author",
    "a.author",
    "a[data-testid='post_author_link']",
    "a[data-testid='comment_author_link']",
    "a[data-testid*='author']",
    "faceplate-tracker a[href*='/user/']",
    "faceplate-tracker a[href*='/u/']",
  ];

  for (const selector of selectors) {
    const link = container.querySelector(selector);
    if (link instanceof HTMLAnchorElement) {
      return link;
    }
  }

  const metaHosts = [
    container.querySelector(".tagline"),
    container.querySelector("header"),
    container.querySelector("[slot='commentMeta']"),
    container.querySelector("[slot='postMeta']"),
    container.querySelector("[data-testid='comment'] header"),
  ].filter(Boolean);

  for (const host of metaHosts) {
    const link = host.querySelector("a[href*='/user/'], a[href*='/u/']");
    if (link instanceof HTMLAnchorElement) {
      return link;
    }
  }

  return null;
}

// ──── Queue Item Filtering ────

function applyQueueToolsFilters(items) {
  const text = String(queueToolsFilterText || "").trim().toLowerCase();
  items.forEach((item) => {
    const typeMatch = queueToolsFilterType === "all" || queueToolsFilterType === item.thingType;
    const textMatch = !text || item.haystack.includes(text);
    item.container.classList.toggle("rrw-queue-filter-hidden", !(typeMatch && textMatch));
  });
}

// ──── Bulk Actions ────

async function runQueueToolsBulkAction(action, items) {
  if (queueToolsBusy) {
    return;
  }
  const visibleTargets = new Set(items.map((item) => item.target));
  const targets = Array.from(queueToolsSelectedTargets).filter((target) => visibleTargets.has(target));
  if (!targets.length) {
    queueToolsErrorMessage = "Select at least one queue item.";
    queueToolsStatusMessage = "";
    renderQueueToolsBar(items);
    return;
  }

  queueToolsBusy = true;
  queueToolsErrorMessage = "";
  queueToolsStatusMessage = `Running ${action} on ${targets.length} item${targets.length === 1 ? "" : "s"}...`;
  renderQueueToolsBar(items);

  let success = 0;
  let failed = 0;
  for (const target of targets) {
    try {
      if (action === "approve") {
        await approveThingViaNativeSession(target);
      } else if (action === "remove") {
        await removeThingViaNativeSession(target, false);
      } else if (action === "spam") {
        await removeThingViaNativeSession(target, true);
      }
      queueToolsSelectedTargets.delete(target);
      success += 1;
    } catch {
      failed += 1;
    }
  }

  queueToolsBusy = false;
  queueToolsStatusMessage = `${action} complete: ${success} succeeded${failed ? `, ${failed} failed` : ""}.`;
  queueToolsErrorMessage = failed ? "Some items failed; check subreddit permissions and page context." : "";
  scheduleQueueToolsBind();
}

// ──── Queue Tools Bar Rendering ────

function renderQueueToolsBar(items) {
  const rootId = "rrw-queue-tools";
  const existing = document.getElementById(rootId);
  if (!isQueueListingPage()) {
    existing?.remove();
    return;
  }

  const root = existing || document.createElement("section");
  root.id = rootId;
  root.className = "rrw-queue-tools";
  const firstItem = items[0]?.container;
  const siteTable = document.querySelector("#siteTable");
  const host = firstItem?.parentElement || siteTable?.parentElement || document.body || document.documentElement;
  if (firstItem && firstItem.parentElement === host) {
    if (root.parentElement !== host || root.nextElementSibling !== firstItem) {
      host.insertBefore(root, firstItem);
    }
  } else if (root.parentElement !== host || root !== host.firstElementChild) {
    host.insertAdjacentElement("afterbegin", root);
  }

  const visibleCount = items.filter((item) => !item.container.classList.contains("rrw-queue-filter-hidden")).length;
  const selectedCount = Array.from(queueToolsSelectedTargets).filter((target) => items.some((item) => item.target === target)).length;
  const hasItems = items.length > 0;
  const hasVisibleItems = visibleCount > 0;
  const hasSelection = selectedCount > 0;
  const stateKey = JSON.stringify({
    visibleCount,
    selectedCount,
    hasItems,
    hasVisibleItems,
    hasSelection,
    queueToolsBusy,
    queueToolsFilterType,
    queueToolsFilterText,
    queueToolsStatusMessage,
    queueToolsErrorMessage,
  });

  if (root.dataset.stateKey === stateKey) {
    return;
  }
  root.dataset.stateKey = stateKey;

  // eslint-disable-next-line no-unsanitized/property
  root.innerHTML = `
    <div class="rrw-queue-tools-row">
      <strong>Queue Tools</strong>
      <span class="rrw-queue-tools-meta">${selectedCount} selected \u00B7 ${visibleCount} visible</span>
    </div>
    <div class="rrw-queue-tools-row rrw-queue-tools-controls">
      <button type="button" data-rrw-bulk="select-visible" title="${!hasVisibleItems && hasItems ? 'No items match the current filter' : 'Select all currently visible items'}" ${queueToolsBusy || !hasVisibleItems ? "disabled" : ""}>Select visible</button>
      <button type="button" data-rrw-bulk="clear" ${queueToolsBusy || !hasSelection ? "disabled" : ""}>Clear</button>
      <button type="button" data-rrw-bulk="approve" ${queueToolsBusy || !hasSelection ? "disabled" : ""}>Approve selected</button>
      <button type="button" data-rrw-bulk="remove" ${queueToolsBusy || !hasSelection ? "disabled" : ""}>Remove selected</button>
      <button type="button" data-rrw-bulk="spam" ${queueToolsBusy || !hasSelection ? "disabled" : ""}>Spam selected</button>
      <label>
        Type
        <select data-rrw-filter-type ${queueToolsBusy ? "disabled" : ""}>
          <option value="all" ${queueToolsFilterType === "all" ? "selected" : ""}>All</option>
          <option value="post" ${queueToolsFilterType === "post" ? "selected" : ""}>Posts</option>
          <option value="comment" ${queueToolsFilterType === "comment" ? "selected" : ""}>Comments</option>
        </select>
      </label>
      <label>
        Filter
        <input type="text" data-rrw-filter-text value="${escapeHtml(queueToolsFilterText)}" placeholder="author/title/body" ${queueToolsBusy ? "disabled" : ""} />
      </label>
    </div>
    ${!hasItems ? '<div class="rrw-queue-tools-empty">No items in this queue view.</div>' : ""}
    ${hasItems && visibleCount === 0 ? '<div class="rrw-queue-tools-empty">No items match the current filter.</div>' : ""}
    ${queueToolsStatusMessage ? `<div class="rrw-queue-tools-status">${escapeHtml(queueToolsStatusMessage)}</div>` : ""}
    ${queueToolsErrorMessage ? `<div class="rrw-queue-tools-error">${escapeHtml(queueToolsErrorMessage)}</div>` : ""}
  `;

  root.querySelector('[data-rrw-bulk="select-visible"]')?.addEventListener("click", () => {
    items
      .filter((item) => !item.container.classList.contains("rrw-queue-filter-hidden"))
      .forEach((item) => queueToolsSelectedTargets.add(item.target));
    scheduleQueueToolsBind();
  });
  root.querySelector('[data-rrw-bulk="clear"]')?.addEventListener("click", () => {
    queueToolsSelectedTargets.clear();
    scheduleQueueToolsBind();
  });
  root.querySelector('[data-rrw-bulk="approve"]')?.addEventListener("click", () => {
    void runQueueToolsBulkAction("approve", items);
  });
  root.querySelector('[data-rrw-bulk="remove"]')?.addEventListener("click", () => {
    void runQueueToolsBulkAction("remove", items);
  });
  root.querySelector('[data-rrw-bulk="spam"]')?.addEventListener("click", () => {
    void runQueueToolsBulkAction("spam", items);
  });

  const typeSelect = root.querySelector("[data-rrw-filter-type]");
  if (typeSelect instanceof HTMLSelectElement) {
    typeSelect.addEventListener("change", () => {
      queueToolsFilterType = String(typeSelect.value || "all");
      scheduleQueueToolsBind();
    });
  }

  const filterInput = root.querySelector("[data-rrw-filter-text]");
  if (filterInput instanceof HTMLInputElement) {
    filterInput.addEventListener("input", () => {
      queueToolsFilterText = String(filterInput.value || "");
      scheduleQueueToolsBind();
    });
  }
}

// ──── Queue Tools Binding ────

function bindQueueToolsFeatures() {
  const pathname = String(window.location.pathname || "");
  const isQueuePage = /\/about\/(modqueue|unmoderated|reports)(?:\/|$)/i.test(pathname) ||
                      /\/mod\/\w+\/queue(?:\/|$)/i.test(pathname);
  console.log("[ModBox] bindQueueToolsFeatures: pathname=", pathname, "isQueuePage=", isQueuePage);
  
  if (!isQueuePage) {
    console.log("[ModBox] Not a queue listing page, removing queue tools");
    document.getElementById("rrw-queue-tools")?.remove();
    document.querySelectorAll(".rrw-queue-filter-hidden").forEach((node) => node.classList.remove("rrw-queue-filter-hidden"));
    return;
  }

  console.log("[ModBox] This is a queue page, proceeding with collection");
  const items = collectQueueListingItems();
  console.log("[ModBox] Queue tools: collected", items.length, "items");
  const validTargets = new Set(items.map((item) => item.target));
  Array.from(queueToolsSelectedTargets).forEach((target) => {
    if (!validTargets.has(target)) {
      queueToolsSelectedTargets.delete(target);
    }
  });

  items.forEach((item) => {
    ensureQueueSelectionControl(item);
  });
  applyQueueToolsFilters(items);
  renderQueueToolsBar(items);
}

function scheduleQueueToolsBind() {
  if (queueToolsBindRaf) {
    return;
  }
  queueToolsBindRaf = window.requestAnimationFrame(() => {
    queueToolsBindRaf = 0;
    bindQueueToolsFeatures();
  });
}

// ──---- Queue Item Stubs (Future Enhancement) ────

function getQueueItemActions(item) {
  // Returns available actions for a queue item based on type and state
  // Remove, approve, lock, ban, modmail, etc.
  if (!item) return [];
  
  const actions = [];
  if (!item.is_removed) actions.push({ id: "remove", label: "Remove" });
  if (item.is_removed) actions.push({ id: "approve", label: "Approve" });
  if (!item.is_locked) actions.push({ id: "lock", label: "Lock" });
  if (item.is_locked) actions.push({ id: "unlock", label: "Unlock" });
  actions.push({ id: "modmail", label: "Modmail" });
  
  return actions;
}

function formatQueueItemPreview(item) {
  if (!item) return "No item";
  const title = item.title || item.body?.substring(0, 50) || "Untitled";
  const author = item.author || "[deleted]";
  const score = Number(item.score || 0);
  return `${title}\nfrom /u/${author} (${score} pts)`;
}
