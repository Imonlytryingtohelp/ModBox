// ════════════════════════════════════════════════════════════════════════════════════════════════
// Comment Nuke Module
// ════════════════════════════════════════════════════════════════════════════════════════════════
// Bulk removal workflow for user comments with confirmation, removal reasons, and modmail.
// Dependencies: constants.js, state.js, services/reddit-api.js, services/wiki-loader.js,
//               features/context-popup.js, utilities.js
// Global State: commentNukeBusyTargets, commentNukeIgnoreDistinguished (defined elsewhere)

// ──── Helper Functions ────

function getCommentNukeButtonsForTarget(target) {
  const cleanTarget = String(target || "").trim().toLowerCase();
  if (!cleanTarget) {
    return [];
  }

  return Array.from(document.querySelectorAll(`.rrw-comment-nuke-btn[data-comment-nuke-target="${CSS.escape(cleanTarget)}"]`))
    .filter((button) => button instanceof HTMLButtonElement);
}

function setCommentNukeButtonsState(target, state = {}) {
  getCommentNukeButtonsForTarget(target).forEach((button) => {
    if (typeof state.text === "string") {
      button.textContent = state.text;
    }
    if (typeof state.title === "string") {
      button.title = state.title;
    }
    if (typeof state.disabled === "boolean") {
      button.disabled = state.disabled;
    }
    if (typeof state.variant === "string") {
      button.dataset.commentNukeState = state.variant;
    }
  });
}

function resetCommentNukeButtonsState(target) {
  setCommentNukeButtonsState(target, {
    text: "R",
    title: "Remove this comment and its replies",
    disabled: false,
    variant: "idle",
  });
}

function buildCommentNukeConfirmMessage(plan) {
  const total = Number(plan?.removalTargets?.length || 0);
  const descendantCount = Math.max(0, total - 1);
  const parts = [];

  if (descendantCount > 0) {
    parts.push(`Remove this comment and ${descendantCount} repl${descendantCount === 1 ? "y" : "ies"}?`);
  } else {
    parts.push("Remove this comment? No loaded replies were found.");
  }

  if (plan?.distinguishedCount > 0 && commentNukeIgnoreDistinguished) {
    parts.push(`Note: ${plan.distinguishedCount} distinguished comment${plan.distinguishedCount === 1 ? "" : "s"} will be skipped.`);
  }

  if (plan?.omittedReplyCount > 0) {
    parts.push(`Warning: ${plan.omittedReplyCount} repl${plan.omittedReplyCount === 1 ? "y" : "ies"} could not be expanded and may remain after removal.`);
  }

  return parts.join("\n\n");
}

function collectCommentNukeTargets(commentEntry, summary, targets = [], options = {}) {
  if (!commentEntry || commentEntry.kind !== "t1" || typeof commentEntry.data !== "object") {
    return targets;
  }

  const moreQueue = Array.isArray(options?.moreQueue) ? options.moreQueue : null;
  const ignoreDistinguished = Boolean(options?.ignoreDistinguished);

  const replies = Array.isArray(commentEntry.data?.replies?.data?.children)
    ? commentEntry.data.replies.data.children
    : [];

  replies.forEach((child) => {
    if (child?.kind === "t1" && typeof child.data === "object") {
      collectCommentNukeTargets(child, summary, targets, options);
      return;
    }

    if (child?.kind === "more") {
      const childIds = Array.isArray(child?.data?.children) ? child.data.children : [];
      if (moreQueue && childIds.length > 0) {
        moreQueue.push(...childIds);
      } else {
        summary.morePlaceholders += 1;
        summary.omittedReplyCount += childIds.length;
      }
    }
  });

  const fullname = String(commentEntry.data?.name || "").trim().toLowerCase();
  if (/^t1_[a-z0-9]{5,10}$/i.test(fullname)) {
    const isDistinguished = Boolean(String(commentEntry.data?.distinguished || "").trim());
    if (isDistinguished) {
      summary.distinguishedCount += 1;
      if (!ignoreDistinguished) {
        targets.push(fullname);
      }
    } else {
      targets.push(fullname);
    }
  }

  return targets;
}

async function expandMoreChildrenAndCollect(postFullname, initialChildIds, summary, targets, options) {
  const ignoreDistinguished = Boolean(options?.ignoreDistinguished);
  const seenIds = new Set(targets.map((fn) => String(fn || "").replace(/^t1_/i, "")));
  const MAX_BATCH = 100;
  const pending = initialChildIds.map((id) => String(id || "").trim().toLowerCase()).filter(Boolean);

  while (pending.length > 0) {
    const batch = pending.splice(0, MAX_BATCH);
    try {
      const response = await requestJsonViaBackground(
        `/api/morechildren?link_id=${encodeURIComponent(postFullname)}&children=${batch.join(",")}&api_type=json&raw_json=1`,
        { oauth: true, timeoutMs: 30000 },
      );
      const things = Array.isArray(response?.json?.data?.things) ? response.json.data.things : [];
      for (const thing of things) {
        if (!thing || typeof thing.data !== "object") {
          continue;
        }
        if (thing.kind === "t1") {
          const fullname = String(thing.data?.name || "").trim().toLowerCase();
          if (!/^t1_[a-z0-9]{5,10}$/i.test(fullname)) {
            continue;
          }
          const bareId = fullname.replace(/^t1_/i, "");
          if (seenIds.has(bareId)) {
            continue;
          }
          seenIds.add(bareId);
          const isDistinguished = Boolean(String(thing.data?.distinguished || "").trim());
          if (isDistinguished) {
            summary.distinguishedCount += 1;
            if (!ignoreDistinguished) {
              targets.push(fullname);
            }
          } else {
            targets.push(fullname);
          }
        } else if (thing.kind === "more") {
          const nestedChildIds = Array.isArray(thing.data?.children) ? thing.data.children : [];
          for (const id of nestedChildIds) {
            const cleanId = String(id || "").trim().toLowerCase();
            if (cleanId && !seenIds.has(cleanId)) {
              pending.push(cleanId);
            }
          }
        }
      }
    } catch {
      summary.morePlaceholders += 1;
      summary.omittedReplyCount += batch.length;
    }
  }
}

function buildCommentThreadJsonUrlFromPermalink(permalink) {
  const value = String(permalink || "").trim();
  if (!value) {
    return "";
  }

  const parsed = parseUrl(value.startsWith("http") ? value : `https://www.reddit.com${value}`);
  if (!parsed) {
    return "";
  }

  let pathname = String(parsed.pathname || "").replace(/\/+$/, "");
  if (!pathname) {
    return "";
  }
  if (!pathname.endsWith(".json")) {
    pathname = `${pathname}.json`;
  }

  const query = new URLSearchParams(parsed.search || "");
  query.set("context", "0");
  query.set("limit", query.get("limit") || "500");
  query.set("depth", query.get("depth") || "10");
  query.set("raw_json", "1");
  return `https://www.reddit.com${pathname}?${query.toString()}`;
}

function findCommentEntryById(children, targetCommentId) {
  const cleanTargetId = String(targetCommentId || "").trim().toLowerCase();
  if (!cleanTargetId) {
    return null;
  }

  const list = Array.isArray(children) ? children : [];
  for (const item of list) {
    if (!item || item.kind !== "t1" || typeof item.data !== "object") {
      continue;
    }

    const fullname = String(item.data?.name || "").trim().toLowerCase();
    if (fullname === `t1_${cleanTargetId}`) {
      return item;
    }

    const nested = findCommentEntryById(item.data?.replies?.data?.children, cleanTargetId);
    if (nested) {
      return nested;
    }
  }

  return null;
}

async function fetchCommentNukePlan(fullname) {
  const cleanFullname = String(fullname || "").trim().toLowerCase();
  if (!/^t1_[a-z0-9]{5,10}$/i.test(cleanFullname)) {
    throw new Error("Comment nuke only works on comment targets.");
  }

  const info = await requestJsonViaBackground(`/api/info.json?id=${encodeURIComponent(cleanFullname)}`, { oauth: true });
  const infoData = info?.data?.children?.[0]?.data;
  if (!infoData || typeof infoData !== "object") {
    throw new Error("Unable to load target comment metadata.");
  }

  const permalink = String(infoData?.permalink || "").trim();
  const threadJsonUrl = buildCommentThreadJsonUrlFromPermalink(permalink);
  if (!threadJsonUrl) {
    throw new Error("Unable to build comment thread URL for nuke.");
  }

  const payload = await requestJsonViaBackground(threadJsonUrl, { timeoutMs: 30000 });
  const listing = Array.isArray(payload) ? payload[1] : null;
  const children = Array.isArray(listing?.data?.children) ? listing.data.children : [];
  const commentId = extractCommentIdFromFullname(cleanFullname);
  const targetEntry = findCommentEntryById(children, commentId);
  if (!targetEntry) {
    throw new Error("Unable to locate the target comment in the loaded thread.");
  }

  const postFullname = String(infoData?.link_id || "").trim().toLowerCase();
  const summary = {
    morePlaceholders: 0,
    omittedReplyCount: 0,
    distinguishedCount: 0,
  };
  const nukeOptions = {
    moreQueue: [],
    ignoreDistinguished: commentNukeIgnoreDistinguished,
  };
  const removalTargets = collectCommentNukeTargets(targetEntry, summary, [], nukeOptions);

  if (nukeOptions.moreQueue.length > 0 && /^t3_[a-z0-9]{4,13}$/i.test(postFullname)) {
    await expandMoreChildrenAndCollect(postFullname, nukeOptions.moreQueue, summary, removalTargets, nukeOptions);
  } else if (nukeOptions.moreQueue.length > 0) {
    summary.morePlaceholders += nukeOptions.moreQueue.length;
    summary.omittedReplyCount += nukeOptions.moreQueue.length;
  }

  if (!removalTargets.length) {
    throw new Error("The loaded thread did not contain any removable comments.");
  }

  return {
    targetFullname: cleanFullname,
    author: String(infoData?.author || "[deleted]"),
    subreddit: normalizeSubreddit(infoData?.subreddit || ""),
    permalink,
    removalTargets,
    descendantCount: Math.max(0, removalTargets.length - 1),
    morePlaceholders: summary.morePlaceholders,
    omittedReplyCount: summary.omittedReplyCount,
    distinguishedCount: summary.distinguishedCount,
  };
}

// ──── Main Entry Point ────

async function runCommentNukeWorkflow(fullname, options = null) {
  const cleanFullname = String(fullname || "").trim().toLowerCase();
  if (!/^t1_[a-z0-9]{5,10}$/i.test(cleanFullname)) {
    throw new Error("Comment nuke only works on comment targets.");
  }
  if (commentNukeBusyTargets.has(cleanFullname)) {
    throw new Error("Comment nuke is already running for this comment.");
  }

  const onProgress = typeof options?.onProgress === "function" ? options.onProgress : null;
  commentNukeBusyTargets.add(cleanFullname);
  setCommentNukeButtonsState(cleanFullname, {
    text: "R...",
    title: "Loading comment tree...",
    disabled: true,
    variant: "busy",
  });

  try {
    const plan = await fetchCommentNukePlan(cleanFullname);
    onProgress?.({ phase: "planned", plan });

    if (!options?.skipConfirm) {
      const confirmed = window.confirm(buildCommentNukeConfirmMessage(plan));
      if (!confirmed) {
        return { cancelled: true, plan };
      }
    }

    const failures = [];
    for (let index = 0; index < plan.removalTargets.length; index += 1) {
      const current = plan.removalTargets[index];
      setCommentNukeButtonsState(cleanFullname, {
        text: `${index + 1}/${plan.removalTargets.length}`,
        title: `Removing ${index + 1} of ${plan.removalTargets.length} comments...`,
        disabled: true,
        variant: "busy",
      });
      onProgress?.({
        phase: "removing",
        current: index + 1,
        total: plan.removalTargets.length,
        target: current,
        plan,
      });

      try {
        await removeThingViaNativeSession(current, false);
      } catch (error) {
        failures.push(`${current}: ${summarizeRedditFailureMessage(getSafeErrorMessage(error))}`);
      }

      if (index + 1 < plan.removalTargets.length) {
        await wait(80);
      }
    }

    const result = {
      ...plan,
      successCount: plan.removalTargets.length - failures.length,
      failureCount: failures.length,
      failures,
    };
    const resultTitle = result.failureCount
      ? `${result.successCount}/${plan.removalTargets.length} comments removed. ${result.failures[0] || "Some removals failed."}`
      : `Removed ${result.successCount} comment${result.successCount === 1 ? "" : "s"}.`;
    setCommentNukeButtonsState(cleanFullname, {
      text: result.failureCount ? "!" : "OK",
      title: resultTitle,
      disabled: true,
      variant: result.failureCount ? "error" : "success",
    });
    onProgress?.({ phase: "complete", result });
    await wait(result.failureCount ? 2600 : 1200);
    return result;
  } catch (error) {
    const message = summarizeRedditFailureMessage(getSafeErrorMessage(error));
    setCommentNukeButtonsState(cleanFullname, {
      text: "!",
      title: message,
      disabled: true,
      variant: "error",
    });
    await wait(2600);
    throw error;
  } finally {
    commentNukeBusyTargets.delete(cleanFullname);
    resetCommentNukeButtonsState(cleanFullname);
  }
}
