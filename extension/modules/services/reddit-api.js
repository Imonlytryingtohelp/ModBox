// ============================================================================
// REDDIT API SERVICE LAYER
// ============================================================================
// Core API request functions and Reddit moderation actions.
// Handles both direct (native session) and OAuth-based API calls.

// ============================================================================
// MESSAGE & COMMUNICATION
// ============================================================================

function sendMessage(message) {
  return new Promise((resolve, reject) => {
    ext.runtime.sendMessage(message, (response) => {
      const runtimeError = ext.runtime?.lastError;
      if (runtimeError) {
        reject(new Error(runtimeError.message || "Extension runtime error"));
        return;
      }
      resolve(response);
    });
  });
}

function withTimeout(promise, timeoutMs, timeoutMessage) {
  const ms = Number(timeoutMs);
  if (!Number.isFinite(ms) || ms <= 0) {
    return promise;
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(timeoutMessage || "Request timed out"));
    }, ms);

    Promise.resolve(promise)
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

// ============================================================================
// REDDIT MODHASH & SESSION UTILITIES
// ============================================================================

function getRedditModhash() {
  const globalReaders = [
    () => globalThis?.reddit?.uh,
    () => globalThis?.r?.config?.modhash,
    () => globalThis?.__r?.config?.modhash,
    () => globalThis?.__INITIAL_STATE__?.user?.modhash,
  ];

  for (const readCandidate of globalReaders) {
    let candidate = "";
    try {
      candidate = readCandidate();
    } catch {
      candidate = "";
    }
    const value = String(candidate || "").trim();
    if (value) {
      return value;
    }
  }

  const domCandidates = [
    document.querySelector("input[name='uh']")?.value,
    document.querySelector("input[name='modhash']")?.value,
    document.querySelector("meta[name='csrf-token']")?.getAttribute("content"),
  ];

  for (const candidate of domCandidates) {
    const value = String(candidate || "").trim();
    if (value) {
      return value;
    }
  }

  return "";
}

function getSafeErrorMessage(errorLike) {
  try {
    if (errorLike && typeof errorLike === "object" && "message" in errorLike) {
      const message = errorLike.message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }
  } catch {
    // Some Firefox cross-compartment objects can throw on property access.
  }

  try {
    const fallback = String(errorLike);
    return fallback && fallback.trim() ? fallback : "Unknown error";
  } catch {
    return "Unknown error";
  }
}

function summarizeRedditFailureMessage(message) {
  const text = String(message || "").trim();
  if (!text) {
    return "Unknown error";
  }
  if (/<\s*!doctype\s+html|<\s*html/i.test(text)) {
    return "Received HTML response instead of Reddit API JSON";
  }
  return text.length > 400 ? `${text.slice(0, 400)}...` : text;
}

function formatRedditApiError(rawBody, fallbackMessage = "Request failed") {
  const text = String(rawBody || "").trim();
  if (!text) {
    return fallbackMessage;
  }

  try {
    const parsed = JSON.parse(text);
    const apiErrors = Array.isArray(parsed?.json?.errors) ? parsed.json.errors : [];
    if (apiErrors.length > 0) {
      const first = apiErrors[0];
      const detail = Array.isArray(first) ? first.filter(Boolean).join(": ") : String(first || "").trim();
      if (detail) {
        return detail;
      }
    }

    const message = String(parsed?.message || parsed?.error || "").trim();
    const reason = String(parsed?.reason || "").trim();
    const explanation = String(parsed?.explanation || parsed?.detail || "").trim();
    const fields = Array.isArray(parsed?.fields) ? parsed.fields.filter(Boolean).join(", ") : "";
    const parts = [message || fallbackMessage];
    if (reason) {
      parts.push(`(${reason})`);
    }
    if (explanation) {
      parts.push(`- ${explanation}`);
    }
    if (fields) {
      parts.push(`[fields: ${fields}]`);
    }
    const combined = parts.join(" ").trim();
    return combined || fallbackMessage;
  } catch {
    return text;
  }
}

// ============================================================================
// BACKGROUND REQUEST SCHEDULING & CACHING
// ============================================================================

function pumpBackgroundRequestSchedulerQueue() {
  while (
    backgroundRequestSchedulerActive < BACKGROUND_REQUEST_SCHEDULER_MAX_CONCURRENCY
    && backgroundRequestSchedulerQueue.length > 0
  ) {
    const nextTask = backgroundRequestSchedulerQueue.shift();
    backgroundRequestSchedulerActive += 1;

    Promise.resolve()
      .then(() => nextTask.run())
      .then((value) => nextTask.resolve(value))
      .catch((error) => nextTask.reject(error))
      .finally(() => {
        backgroundRequestSchedulerActive = Math.max(0, backgroundRequestSchedulerActive - 1);
        pumpBackgroundRequestSchedulerQueue();
      });
  }
}

function enqueueBackgroundRequest(taskFactory, priority = 0) {
  return new Promise((resolve, reject) => {
    backgroundRequestSchedulerQueue.push({
      id: backgroundRequestSchedulerSeq,
      priority: Number.isFinite(Number(priority)) ? Number(priority) : 0,
      run: taskFactory,
      resolve,
      reject,
    });
    backgroundRequestSchedulerSeq += 1;
    backgroundRequestSchedulerQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.id - b.id;
    });
    pumpBackgroundRequestSchedulerQueue();
  });
}

function buildBackgroundRequestCacheKey(url, options = null) {
  const method = String(options?.method || "GET").toUpperCase();
  const oauth = options?.oauth ? "oauth" : "anon";
  return `${method}:${oauth}:${String(url || "")}`;
}

// ============================================================================
// CORE API REQUEST FUNCTIONS
// ============================================================================

async function redditFormRequest(path, params, options = null) {
  const payload = params instanceof URLSearchParams ? new URLSearchParams(params) : new URLSearchParams();
  if (!payload.has("api_type")) {
    payload.set("api_type", "json");
  }
  const isFirefox = /firefox\//i.test(String(globalThis?.navigator?.userAgent || ""));
  const forceBackground = Boolean(options?.forceBackground);
  const preferredOrigins = Array.isArray(options?.preferredOrigins) && options.preferredOrigins.length > 0
    ? options.preferredOrigins
    : [
      window.location.origin,
      "https://www.reddit.com",
      "https://old.reddit.com",
    ];

  console.log("[ModBox] redditFormRequest calling:", path);
  let firstFailureMessage = "";
  if (forceBackground) {
    firstFailureMessage = "Direct form request skipped; using background request";
    console.log("[ModBox] Direct form request skipped for:", path);
  } else if (isFirefox) {
    firstFailureMessage = "Direct form request disabled on Firefox; using background request";
    console.log("[ModBox] Firefox detected, skipping direct form request path");
  } else {
    const pageModhash = getRedditModhash();
    console.log("[ModBox] pageModhash available:", !!pageModhash);
    if (pageModhash) {
      const directPayload = new URLSearchParams(payload);
      directPayload.set("uh", pageModhash);

      try {
        console.log("[ModBox] Attempting direct fetch to:", `${window.location.origin}${path}`);
        const response = await fetch(`${window.location.origin}${path}`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Modhash": pageModhash,
          },
          body: directPayload.toString(),
        });

        console.log("[ModBox] Fetch response status:", response.status);
        const text = await response.text();
        let parsed = null;
        try {
          parsed = text ? JSON.parse(text) : null;
        } catch {
          parsed = null;
        }

        if (!response.ok) {
          throw new Error((parsed && (parsed.message || parsed.error)) || text || `HTTP ${response.status}`);
        }

        const errors = parsed?.json?.errors;
        if (Array.isArray(errors) && errors.length > 0) {
          const first = errors[0];
          const detail = Array.isArray(first) ? first.join(": ") : String(first);
          throw new Error(detail || "Reddit API returned errors");
        }

        console.log("[ModBox] Direct fetch successful, returning:", parsed);
        return parsed;
      } catch (error) {
        firstFailureMessage = summarizeRedditFailureMessage(getSafeErrorMessage(error));
        console.debug("[ModBox] Direct fetch failed (fallback will run):", firstFailureMessage);
      }
    } else {
      firstFailureMessage = "Reddit modhash unavailable in this page context";
      console.warn("[ModBox] No modhash available");
    }
  }

  console.log("[ModBox] Falling back to background message for:", path);
  const fallbackResult = await sendMessage({
    type: "REDDIT_FORM_REQUEST",
    path,
    params: Object.fromEntries(
      (payload instanceof URLSearchParams ? payload : new URLSearchParams(payload)).entries()
    ),
    preferredOrigins,
  });

  console.log("[ModBox] Background message result:", fallbackResult);
  if (!fallbackResult?.ok) {
    throw new Error(fallbackResult?.error || firstFailureMessage || "Native Reddit form request failed");
  }

  if (fallbackResult?.json && typeof fallbackResult.json === "object") {
    return fallbackResult.json;
  }

  const text = String(fallbackResult?.text || "");
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function redditFormRequestBackgroundOnly(path, params, preferredOrigins = null) {
  const payload = params instanceof URLSearchParams ? new URLSearchParams(params) : new URLSearchParams();
  if (!payload.has("api_type")) {
    payload.set("api_type", "json");
  }

  const fallbackResult = await sendMessage({
    type: "REDDIT_FORM_REQUEST",
    path,
    params: Object.fromEntries(
      (payload instanceof URLSearchParams ? payload : new URLSearchParams(payload)).entries()
    ),
    preferredOrigins: Array.isArray(preferredOrigins) && preferredOrigins.length
      ? preferredOrigins
      : [
        "https://old.reddit.com",
        "https://www.reddit.com",
        "https://sh.reddit.com",
      ],
  });

  if (!fallbackResult?.ok) {
    throw new Error(summarizeRedditFailureMessage(fallbackResult?.error || "Native Reddit form request failed"));
  }

  if (fallbackResult?.json && typeof fallbackResult.json === "object") {
    return fallbackResult.json;
  }

  const text = String(fallbackResult?.text || "");
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Received non-JSON response");
  }
}

async function requestJsonViaBackground(url, options = null) {
  const method = String(options?.method || "GET").toUpperCase();
  const timeoutMs = Number.isFinite(Number(options?.timeoutMs))
    ? Number(options.timeoutMs)
    : BACKGROUND_REQUEST_TIMEOUT_MS;
  const response = await withTimeout(
    sendMessage({
      type: "API_REQUEST",
      url,
      method,
      body: method === "GET" || method === "HEAD" ? undefined : (options?.body ?? undefined),
      oauth: Boolean(options?.oauth),
      formData: Boolean(options?.formData),
    }),
    timeoutMs,
    `Request timed out (${method} ${String(url || "")})`,
  );
  const body = String(response?.text || "");
  if (!response?.ok) {
    throw new Error(formatRedditApiError(body, `HTTP ${response?.status || 0}`));
  }
  try {
    return body ? JSON.parse(body) : null;
  } catch {
    throw new Error("Received non-JSON response");
  }
}

async function requestJsonViaBackgroundScheduled(url, options = null, schedule = null) {
  const cacheTtlMs = Number(schedule?.cacheTtlMs || 0);
  const priority = Number(schedule?.priority || 0);
  const dedupe = schedule?.dedupe !== false;
  const key = buildBackgroundRequestCacheKey(url, options);
  const now = Date.now();

  if (cacheTtlMs > 0) {
    const cached = backgroundRequestCache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }
  }

  if (dedupe) {
    const inFlight = backgroundRequestInflight.get(key);
    if (inFlight) {
      return inFlight;
    }
  }

  const taskPromise = enqueueBackgroundRequest(
    () => requestJsonViaBackground(url, options),
    priority,
  );

  if (dedupe) {
    backgroundRequestInflight.set(key, taskPromise);
  }

  try {
    const value = await taskPromise;
    if (cacheTtlMs > 0) {
      backgroundRequestCache.set(key, {
        value,
        expiresAt: Date.now() + cacheTtlMs,
      });
      if (backgroundRequestCache.size > 200) {
        for (const [cacheKey, cacheValue] of backgroundRequestCache) {
          if (!cacheValue || cacheValue.expiresAt <= Date.now()) {
            backgroundRequestCache.delete(cacheKey);
          }
        }
      }
    }
    return value;
  } finally {
    if (dedupe) {
      backgroundRequestInflight.delete(key);
    }
  }
}

// ============================================================================
// MOD ACTIONS - APPROVALS, REMOVALS, LOCKS, POSTS
// ============================================================================

async function approveThingViaNativeSession(fullname) {
  const cleanFullname = String(fullname || "").trim().toLowerCase();
  if (!cleanFullname) {
    throw new Error("Missing target fullname for native approval");
  }

  const params = new URLSearchParams();
  params.set("id", cleanFullname);
  await redditFormRequest("/api/approve", params);
  return true;
}

async function removeThingViaNativeSession(fullname, spam = false) {
  const cleanFullname = String(fullname || "").trim().toLowerCase();
  if (!cleanFullname) {
    throw new Error("Missing target fullname for native removal");
  }

  console.log("[ModBox] removeThingViaNativeSession called for:", cleanFullname, "spam:", spam);
  const params = new URLSearchParams();
  params.set("id", cleanFullname);
  params.set("spam", spam ? "true" : "false");
  const result = await redditFormRequest("/api/remove", params);
  console.log("[ModBox] removeThingViaNativeSession result:", result);
  return true;
}

async function isThingRemovedViaReddit(fullname) {
  const cleanFullname = String(fullname || "").trim().toLowerCase();
  if (!/^t[13]_[a-z0-9]{5,10}$/i.test(cleanFullname)) {
    return false;
  }

  try {
    const info = await requestJsonViaBackground(`/api/info.json?id=${encodeURIComponent(cleanFullname)}`, { oauth: true });
    const data = info?.data?.children?.[0]?.data;
    if (!data || typeof data !== "object") {
      return false;
    }
    const removedByCategory = String(data?.removed_by_category || "").trim();
    return Boolean(data?.removed === true || data?.spam === true || removedByCategory || data?.banned_by);
  } catch {
    return false;
  }
}

async function confirmThingRemovedViaReddit(fullname) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (await isThingRemovedViaReddit(fullname)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

async function lockThingViaNativeSession(fullname) {
  const cleanFullname = String(fullname || "").trim().toLowerCase();
  if (!cleanFullname) {
    throw new Error("Missing target fullname for native lock");
  }

  const params = new URLSearchParams();
  params.set("id", cleanFullname);
  await redditFormRequest("/api/lock", params);
  return true;
}

async function unlockThingViaNativeSession(fullname) {
  const cleanFullname = String(fullname || "").trim().toLowerCase();
  if (!cleanFullname) {
    throw new Error("Missing target fullname for native unlock");
  }

  const params = new URLSearchParams();
  params.set("id", cleanFullname);
  await redditFormRequest("/api/unlock", params);
  return true;
}

async function distinguishThingViaNativeSession(fullname, sticky = false) {
  const cleanFullname = String(fullname || "").trim().toLowerCase();
  if (!cleanFullname) {
    throw new Error("Missing target fullname for native distinguish");
  }

  const params = new URLSearchParams();
  params.set("id", cleanFullname);
  params.set("how", "yes");
  if (sticky) {
    params.set("sticky", "true");
  }
  await redditFormRequest("/api/distinguish", params);
  return true;
}

async function postCommentViaNativeSession(parentFullname, text) {
  const rawParent = String(parentFullname || "").trim();
  const body = String(text || "").trim();
  if (!rawParent || !body) {
    throw new Error("Missing parent fullname or comment text");
  }

  let cleanParent = "";
  try {
    cleanParent = /^t[13]_[a-z0-9]{5,10}$/i.test(rawParent)
      ? rawParent.toLowerCase()
      : parseTargetToFullname(rawParent);
  } catch {
    throw new Error("Comment step target is not a valid Reddit post/comment target");
  }

  // Prefer Reddit's canonical fullname whenever possible.
  try {
    const info = await requestJsonViaBackground(`/api/info.json?id=${encodeURIComponent(cleanParent)}`, { oauth: true });
    const canonical = String(info?.data?.children?.[0]?.data?.name || "").trim().toLowerCase();
    if (/^t[13]_[a-z0-9]{5,10}$/i.test(canonical)) {
      cleanParent = canonical;
    }
  } catch {
    // Non-fatal: continue with derived target.
  }

  const params = new URLSearchParams();
  params.set("thing_id", cleanParent);
  params.set("text", body);
  const attemptedTargets = [cleanParent];
  try {
    return await redditFormRequest("/api/comment", params);
  } catch (error) {
    const message = getSafeErrorMessage(error);
    const hasInvalidId = /INVALID_ID|specified id is invalid/i.test(message);
    if (!hasInvalidId) {
      throw error;
    }

    const retryTargets = new Set();

    // If a stale/invalid comment target is provided, retry against its parent post.
    if (cleanParent.startsWith("t1_")) {
      try {
        const info = await requestJsonViaBackground(`/api/info.json?id=${encodeURIComponent(cleanParent)}`, { oauth: true });
        const parentPostFullname = String(info?.data?.children?.[0]?.data?.link_id || "").trim().toLowerCase();
        if (/^t3_[a-z0-9]{5,10}$/i.test(parentPostFullname)) {
          retryTargets.add(parentPostFullname);
        }
      } catch {
        // Keep trying other fallbacks below.
      }
    }

    // If the original target was a Reddit URL, retry with that URL's post id.
    try {
      const parsedTargetUrl = new URL(rawParent, window.location.origin);
      const postIdFromTarget = parsePostIdFromPath(parsedTargetUrl.pathname);
      if (postIdFromTarget) {
        retryTargets.add(`t3_${postIdFromTarget}`);
      }
    } catch {
      // Ignore invalid URL fallback.
    }

    // Final fallback: current page post id when available.
    const postIdFromPage = parsePostIdFromPath(window.location.pathname);
    if (postIdFromPage) {
      retryTargets.add(`t3_${postIdFromPage}`);
    }

    for (const retryTarget of retryTargets) {
      if (!retryTarget || retryTarget === cleanParent) {
        continue;
      }
      try {
        attemptedTargets.push(retryTarget);
        const retryParams = new URLSearchParams();
        retryParams.set("thing_id", retryTarget);
        retryParams.set("text", body);
        return await redditFormRequest("/api/comment", retryParams);
      } catch {
        // Try next fallback target.
      }
    }

    throw new Error(`${message} [thing_id attempted: ${attemptedTargets.join(", ")}]`);
  }
}

async function postPlaybookCommentStepViaNativeSession(step, parentFullname, text) {
  // Support comment_as_subreddit workaround for playbook comment steps (remove, post as subreddit, re-approve)
  if (step?.comment_as_subreddit === true) {
    await removeThingViaNativeSession(parentFullname);
    await sendRemovalCommentAsSubreddit(parentFullname, text, false);
    await approveThingViaNativeSession(parentFullname);
    return;
  }
  // Otherwise, post as normal user
  return postCommentViaNativeSession(parentFullname, text);
}

async function sendRemovalCommentAsSubreddit(fullname, message, lockComment = false) {
  const cleanFullname = String(fullname || "").trim().toLowerCase();
  const cleanMessage = String(message || "").trim();
  if (!cleanFullname || !cleanMessage) {
    throw new Error("Missing removal target or message");
  }

  const endpoint = cleanFullname.startsWith("t1_")
    ? "/api/v1/modactions/removal_comment_message"
    : "/api/v1/modactions/removal_link_message";

  return requestJsonViaBackground(endpoint, {
    method: "POST",
    oauth: true,
    body: {
      item_id: [cleanFullname],
      message: cleanMessage,
      title: "removal reason through ModBox",
      type: "public_as_subreddit",
      lock_comment: Boolean(lockComment),
    },
  });
}

async function sendModmailViaReddit({ subreddit, to, subject, body, isAuthorHidden = true }) {
  const cleanSubreddit = normalizeSubreddit(subreddit);
  const cleanTo = to == null ? null : String(to || "").trim().replace(/^u\//i, "");
  const cleanSubject = String(subject || "").trim();
  const cleanBody = String(body || "").trim();
  if (!cleanSubreddit || !cleanSubject || !cleanBody) {
    throw new Error("Missing subreddit, subject, or body for modmail");
  }

  return requestJsonViaBackground("/api/mod/conversations", {
    method: "POST",
    oauth: true,
    formData: true,
    body: {
      srName: cleanSubreddit,
      to: cleanTo || undefined,
      subject: cleanSubject,
      body: cleanBody,
      isAuthorHidden: String(Boolean(isAuthorHidden)),
    },
  });
}

async function archiveModmailConversationViaReddit(conversationId) {
  const cleanConversationId = String(conversationId || "").trim();
  if (!cleanConversationId) {
    return null;
  }
  return requestJsonViaBackground(`/api/mod/conversations/${encodeURIComponent(cleanConversationId)}/archive`, {
    method: "POST",
    oauth: true,
  });
}

// ============================================================================
// MOD ACTIONS - FLAIR, BANS
// ============================================================================

async function applyFlairViaNativeSession({ subreddit, flairTemplateId, username, linkFullname }) {
  const cleanSubreddit = normalizeSubreddit(subreddit);
  const cleanTemplateId = String(flairTemplateId || "").trim();
  const cleanUsername = String(username || "").trim();
  const cleanLinkFullname = String(linkFullname || "").trim().toLowerCase();
  if (!cleanSubreddit) {
    throw new Error("Missing subreddit for native flair change");
  }
  if (!cleanUsername && !cleanLinkFullname) {
    throw new Error("Missing flair target for native flair change");
  }

  const baseParams = new URLSearchParams();
  const baseBody = {
    flair_template_id: cleanTemplateId,
    return_rtjson: "none",
    api_type: "json",
    r: cleanSubreddit,
  };
  baseParams.set("flair_template_id", cleanTemplateId);
  baseParams.set("return_rtjson", "none");
  baseParams.set("api_type", "json");
  baseParams.set("r", cleanSubreddit);
  if (cleanUsername) {
    baseBody.name = cleanUsername;
    baseParams.set("name", cleanUsername);
  }
  if (cleanLinkFullname) {
    baseBody.link = cleanLinkFullname;
    baseParams.set("link", cleanLinkFullname);
  }

  const flairPaths = [
    `/r/${encodeURIComponent(cleanSubreddit)}/api/selectflair`,
    "/api/selectflair",
    `/r/${encodeURIComponent(cleanSubreddit)}/api/flair`,
    "/api/flair",
  ];

  const nativeFailures = [];
  for (const path of flairPaths) {
    try {
      const params = new URLSearchParams(baseParams);
      await redditFormRequestBackgroundOnly(path, params, [
        "https://old.reddit.com",
        "https://www.reddit.com",
        "https://sh.reddit.com",
      ]);
      return true;
    } catch (error) {
      nativeFailures.push(`${path}: ${summarizeRedditFailureMessage(getSafeErrorMessage(error))}`);
    }
  }

  const oauthFailures = [];
  for (const path of flairPaths) {
    try {
      await requestJsonViaBackground(path, {
        method: "POST",
        oauth: true,
        formData: true,
        body: { ...baseBody },
      });
      return true;
    } catch (error) {
      oauthFailures.push(`${path}: ${summarizeRedditFailureMessage(getSafeErrorMessage(error))}`);
    }
  }

  throw new Error(
    `Flair application failed. Native: ${nativeFailures.join(" | ") || "unknown error"}. OAuth: ${oauthFailures.join(" | ") || "unknown error"}`,
  );
}

async function banUserViaNativeSession({ subreddit, username, durationDays, banMessage, note }) {
  const cleanSubreddit = normalizeSubreddit(subreddit);
  const cleanUser = String(username || "").trim();
  if (!cleanSubreddit || !cleanUser) {
    throw new Error("Missing subreddit or username for native ban");
  }

  const cleanNote = String(note || "").trim().slice(0, 300);
  const params = new URLSearchParams();
  params.set("name", cleanUser);
  params.set("type", "banned");
  params.set("r", cleanSubreddit);
  if (cleanNote) params.set("note", cleanNote);
  params.set("ban_message", String(banMessage || ""));
  if (Number.isFinite(durationDays) && durationDays > 0) {
    params.set("duration", String(durationDays));
  }

  await redditFormRequest("/api/friend", params);
  return true;
}

async function unbanUserViaNativeSession({ subreddit, username }) {
  const cleanSubreddit = normalizeSubreddit(subreddit);
  const cleanUser = String(username || "").trim();
  if (!cleanSubreddit || !cleanUser) {
    throw new Error("Missing subreddit or username for native unban");
  }

  const params = new URLSearchParams();
  params.set("name", cleanUser);
  params.set("type", "banned");
  params.set("r", cleanSubreddit);

  await redditFormRequest("/api/unfriend", params);
  return true;
}

// ============================================================================
// FETCH UTILITIES
// ============================================================================

async function fetchModmailUnreadCount() {
  const payload = await requestJsonViaBackgroundScheduled(
    "/api/mod/conversations/unread/count",
    { oauth: true },
    { cacheTtlMs: QUEUE_REQUEST_CACHE_TTL_MS, priority: 2 },
  );
  return parseModmailUnreadCount(payload);
}

async function fetchUserFlairTemplatesViaReddit(subreddit) {
  const cleanSubreddit = normalizeSubreddit(subreddit);
  if (!cleanSubreddit) {
    return [];
  }

  try {
    console.log("[ModBox] Fetching user flair for subreddit:", cleanSubreddit);
    const payload = await requestJsonViaBackground(`/r/${encodeURIComponent(cleanSubreddit)}/api/user_flair_v2`, {
      oauth: true,
    });
    console.log("[ModBox] Raw user_flair_v2 response:", payload);
    
    // API can return either an array directly or an object with user_flair property
    const rows = Array.isArray(payload)
      ? payload
      : (Array.isArray(payload?.user_flair) ? payload.user_flair : (Array.isArray(payload?.choices) ? payload.choices : []));
    
    console.log("[ModBox] Extracted rows:", rows, "count:", rows.length);
    
    const templates = [];
    const seen = new Set();
    rows.forEach((row) => {
      if (!row || typeof row !== "object") {
        return;
      }
      const id = String(row.id || "").trim();
      if (!id || seen.has(id)) {
        return;
      }
      seen.add(id);
      templates.push({
        id,
        text: row.text == null ? null : String(row.text),
        css_class: row.css_class == null ? null : String(row.css_class),
        mod_only: typeof row.mod_only === "boolean" ? row.mod_only : null,
        user_selectable: typeof row.user_selectable === "boolean" ? row.user_selectable : null,
      });
    });

    // Sort by text label, then ID
    templates.sort((a, b) => {
      const aLabel = String(a.text || "").toLowerCase();
      const bLabel = String(b.text || "").toLowerCase();
      if (aLabel !== bLabel) {
        return aLabel.localeCompare(bLabel);
      }
      return String(a.id || "").toLowerCase().localeCompare(String(b.id || "").toLowerCase());
    });
    
    console.log("[ModBox] Final user flair templates:", templates);
    return templates;
  } catch (err) {
    console.error("[ModBox] Error fetching user flair templates:", err);
    return [];
  }
}

// ============================================================================
// TARGET RESOLUTION & VALIDATION
// ============================================================================

async function resolveTargetViaReddit(target) {
  const fullname = parseTargetToFullname(target);
  const info = await requestJsonViaBackground(`/api/info.json?id=${encodeURIComponent(fullname)}`, { oauth: true });
  const children = Array.isArray(info?.data?.children) ? info.data.children : [];
  const item = children.find((row) => String(row?.kind || "").toLowerCase().startsWith("t"));
  if (!item?.data) {
    throw new Error("Unable to resolve Reddit target metadata");
  }

  const data = item.data;
  const subreddit = normalizeSubreddit(data.subreddit || "");
  const normalizedSubreddit = subreddit.toLowerCase();
  let actionableReason = null;
  let isActionable = true;

  try {
    await ensureAllowedLaunchSubredditsLoaded();
    if (allowedLaunchSubreddits instanceof Set && allowedLaunchSubreddits.size) {
      isActionable = allowedLaunchSubreddits.has(normalizedSubreddit);
      if (!isActionable) {
        actionableReason = `Target belongs to r/${subreddit}, and this account is not a moderator there.`;
      }
    }
  } catch {
    // Fail open here: permission is still enforced by Reddit/native APIs.
    isActionable = true;
  }

  console.log("[ModBox] Subreddit check - target:", subreddit, "isActionable:", isActionable);
  const thingType = getThingTypeFromFullname(fullname);
  const permalink = String(data.permalink || "").trim();
  const bodyRaw = String(data.selftext || data.body || "");
  const renderedBody = thingType === "submission"
    ? String(data.selftext_html || "").trim()
    : String(data.body_html || "").trim();
  const bodyHtml = renderedBody
    ? sanitizeProfileRenderedHtml(decodeHtmlEntities(renderedBody))
    : renderProfileMarkdown(bodyRaw);

  return {
    fullname,
    thingType,
    subreddit,
    author: data.author || null,
    title: thingType === "submission" ? String(data.title || "") : null,
    bodyPreview: bodyRaw.slice(0, 500),
    bodyHtml,
    permalink: permalink ? `https://reddit.com${permalink}` : formatRedditByIdUrl(fullname),
    isActionable,
    reason: actionableReason,
  };
}

async function fetchPostFlairTemplatesViaReddit(subreddit) {
  const cleanSubreddit = normalizeSubreddit(subreddit);
  if (!cleanSubreddit) {
    return [];
  }

  const payload = await requestJsonViaBackground(`/r/${encodeURIComponent(cleanSubreddit)}/api/link_flair_v2`, {
    oauth: true,
  });
  const rows = Array.isArray(payload) ? payload : [];
  return rows
    .map((row) => {
      // Extract flair label: prefer text, then flair_text, then plain from richtext, then fallback
      let label = row?.text;
      if (!label && row?.flair_text) label = row.flair_text;
      if (!label && Array.isArray(row?.richtext) && row.richtext.length > 0) {
        // Try to join all plain text segments from richtext
        label = row.richtext.map(rt => typeof rt.t === 'string' ? rt.t : '').join('').trim();
      }
      if (!label) label = null;
      return {
        id: String(row?.id || "").trim(),
        text: label,
        css_class: row?.css_class ?? null,
        mod_only: row?.mod_only ?? null,
        user_selectable: row?.allowable_content ?? null,
      };
    })
    .filter((row) => row.id);
}

async function fetchBanStatusViaReddit(subreddit, username) {
  const cleanSubreddit = normalizeSubreddit(subreddit);
  const cleanUser = String(username || "").trim();
  if (!cleanSubreddit || !cleanUser) {
    return { is_banned: false };
  }

  const payload = await requestJsonViaBackground(
    `/r/${encodeURIComponent(cleanSubreddit)}/about/banned/.json?user=${encodeURIComponent(cleanUser)}`,
    { oauth: true },
  );
  const rows = Array.isArray(payload?.data?.children) ? payload.data.children : [];
  const matched = rows.find((row) => String(row?.name || "").toLowerCase() === cleanUser.toLowerCase());
  return {
    fullname: "",
    author: cleanUser,
    subreddit: cleanSubreddit,
    is_banned: Boolean(matched),
  };
}

// ============================================================================
// NATIVE REDDIT MODNOTES API
// ============================================================================


// ============================================================================
// NATIVE MODNOTES CACHE
// ============================================================================
// Cache for native modnotes to prevent rate limiting from repeated API calls
// Cache entries expire after 5 minutes

const nativeModnotesCache = new Map();
const NATIVE_MODNOTES_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Track in-flight requests to deduplicate concurrent requests for the same user
const nativeModnotesInFlightRequests = new Map();

function buildNativeModnotesCacheKey(subreddit, username) {
  const cleanSub = normalizeSubreddit(subreddit);
  const cleanUser = String(username || "").trim();
  return `${cleanSub}|${cleanUser}`;
}

function getNativeModnotesFromCache(subreddit, username) {
  const key = buildNativeModnotesCacheKey(subreddit, username);
  const cached = nativeModnotesCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    console.log("[ModBox] Returning native modnotes from cache for:", key);
    return cached.value;
  }
  return null;
}

function setNativeModnotesCache(subreddit, username, notes) {
  const key = buildNativeModnotesCacheKey(subreddit, username);
  nativeModnotesCache.set(key, {
    value: notes,
    expiresAt: Date.now() + NATIVE_MODNOTES_CACHE_TTL_MS,
  });
  
  // Prune old entries if cache gets too large
  if (nativeModnotesCache.size > 100) {
    const now = Date.now();
    for (const [cacheKey, cacheValue] of nativeModnotesCache) {
      if (!cacheValue || cacheValue.expiresAt <= now) {
        nativeModnotesCache.delete(cacheKey);
      }
    }
  }
}

async function fetchNativeModnotesViaReddit(subreddit, username) {
  const cleanSubreddit = normalizeSubreddit(subreddit);
  const cleanUser = String(username || "").trim();
  if (!cleanSubreddit || !cleanUser) {
    console.log("[ModBox] Skipping native modnotes fetch: missing subreddit or username");
    return [];
  }

  // Check cache first
  const cachedNotes = getNativeModnotesFromCache(cleanSubreddit, cleanUser);
  if (cachedNotes !== null) {
    return cachedNotes;
  }

  // Check if a request is already in-flight for this user
  const cacheKey = buildNativeModnotesCacheKey(cleanSubreddit, cleanUser);
  if (nativeModnotesInFlightRequests.has(cacheKey)) {
    console.log("[ModBox] Returning in-flight request for:", cacheKey);
    return nativeModnotesInFlightRequests.get(cacheKey);
  }

  // Create the fetch promise
  const fetchPromise = (async () => {
    try {
      const url = `/api/mod/notes?subreddit=${encodeURIComponent(cleanSubreddit)}&user=${encodeURIComponent(cleanUser)}&limit=100`;
      console.log("[ModBox] Fetching native modnotes from:", url);
      
      const payload = await requestJsonViaBackground(url, { oauth: true });
      console.log("[ModBox] Native modnotes response:", payload);
      
      // Reddit API returns mod_notes, not notes
      let notes = Array.isArray(payload?.mod_notes) ? payload.mod_notes : [];
      console.log("[ModBox] Extracted native modnotes count before filtering:", notes.length);
      
      // Filter out REMOVAL, APPROVAL, and SPAM notes (action notes, not user notes)
      const excludedTypes = ["REMOVAL", "APPROVAL", "SPAM", "CONTENT_CHANGE"];
      notes = notes.filter((note) => !excludedTypes.includes(String(note?.type || "").toUpperCase()));
      console.log("[ModBox] Extracted native modnotes count after filtering:", notes.length);
      
      if (notes.length > 0) {
        console.log("[ModBox] First note structure:", notes[0]);
        console.log("[ModBox] First note keys:", Object.keys(notes[0] || {}));
        console.log("[ModBox] user_note_data:", notes[0]?.user_note_data);
        
        // Log all unique types in the filtered response
        const uniqueTypes = new Set(notes.map(n => String(n?.type || "")).filter(Boolean));
        console.log("[ModBox] Unique note types after filtering:", Array.from(uniqueTypes));
      }
      
      const transformedNotes = notes.map((note) => ({
        id: String(note?.id || "").trim(),
        user: String(note?.user || "").trim(),
        subreddit: String(note?.subreddit || "").trim(),
        note: String(note?.user_note_data?.note || "").trim(),
        label: String(note?.type || "").trim(),
        created_at: Number(note?.created_at || 0),
        created_by: String(note?.operator || "unknown").trim(),
        reddit_id: String(note?.mod_action_data?.action_id || "").trim(),
      })).filter((note) => note.id);
      
      // Cache the result before returning
      setNativeModnotesCache(cleanSubreddit, cleanUser, transformedNotes);
      return transformedNotes;
    } catch (error) {
      const errorMsg = getSafeErrorMessage(error);
      console.error("[ModBox] Error fetching native modnotes:", errorMsg);
      return [];
    } finally {
      // Clean up the in-flight request tracker
      nativeModnotesInFlightRequests.delete(cacheKey);
    }
  })();

  // Store the in-flight request promise
  nativeModnotesInFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

async function createNativeModNoteViaReddit(subreddit, username, noteText, redditId = null) {
  const cleanSubreddit = normalizeSubreddit(subreddit);
  const cleanUser = String(username || "").trim();
  const cleanNote = String(noteText || "").trim();
  
  if (!cleanSubreddit || !cleanUser || !cleanNote) {
    throw new Error("Missing subreddit, username, or note text for native moderation note");
  }

  if (cleanNote.length > 250) {
    throw new Error("Native note text exceeds 250 character limit");
  }

  const body = {
    subreddit: cleanSubreddit.toLowerCase(),
    user: cleanUser,
    note: cleanNote,
  };

  if (redditId) {
    const cleanRedditId = String(redditId || "").trim();
    if (cleanRedditId) {
      body.reddit_id = cleanRedditId;
    }
  }

  try {
    console.log("[ModBox] Creating native modnote with body:", JSON.stringify(body));
    const response = await requestJsonViaBackground(
      "/api/mod/notes",
      {
        method: "POST",
        oauth: true,
        body,
      },
    );
    
    console.log("[ModBox] Native modnote created successfully:", JSON.stringify(response));
    return {
      id: String(response?.id || "").trim(),
      user: cleanUser,
      subreddit: cleanSubreddit,
      note: cleanNote,
      label: String(response?.label || "").trim(),
      created_at: Number(response?.created_at || Date.now() / 1000),
      created_by: String(response?.created_by || "").trim(),
      reddit_id: String(response?.reddit_id || "").trim(),
    };
  } catch (error) {
    console.log("[ModBox] Create native modnote error response:", error);
    const message = getSafeErrorMessage(error);
    throw new Error(`Failed to create native moderation note: ${message}`);
  }
}

async function deleteNativeModNoteViaReddit(subreddit, username, noteId) {
  const cleanSubreddit = normalizeSubreddit(subreddit);
  const cleanUser = String(username || "").trim();
  const cleanNoteId = String(noteId || "").trim();
  
  if (!cleanSubreddit || !cleanUser || !cleanNoteId) {
    throw new Error("Missing subreddit, username, or note ID for native moderation note deletion");
  }

  try {
    await requestJsonViaBackground(
      `/api/mod/notes?subreddit=${encodeURIComponent(cleanSubreddit)}&user=${encodeURIComponent(cleanUser)}&note_id=${encodeURIComponent(cleanNoteId)}`,
      {
        method: "DELETE",
        oauth: true,
      },
    );
    return true;
  } catch (error) {
    const message = getSafeErrorMessage(error);
    throw new Error(`Failed to delete native moderation note: ${message}`);
  }
}
