const AUTO_CLOSE_KEY = "autoCloseOnRemove";
const INTERCEPT_NATIVE_REMOVE_KEY = "interceptNativeRemove";
const LAST_SEND_MODE_KEY = "lastSendMode";
const BUTTON_VISIBILITY_SCOPE_KEY = "buttonVisibilityScope";
const QUEUE_BAR_ENABLED_KEY = "queueBarEnabled";
const QUEUE_BAR_SCOPE_KEY = "queueBarScope";
const QUEUE_BAR_LINK_HOST_KEY = "queueBarLinkHost";
const QUEUE_BAR_USE_OLD_REDDIT_KEY = "queueBarUseOldReddit";
const QUEUE_BAR_OPEN_IN_NEW_TAB_KEY = "queueBarOpenInNewTab";
const QUEUE_BAR_FIXED_SUBREDDIT_KEY = "queueBarFixedSubreddit";
const BACKGROUND_JOB_LINK_HOST_KEY = "backgroundJobLinkHost";
const CONTEXT_POPUP_ENABLED_KEY = "contextPopupEnabled";
const DEFAULT_BUTTON_VISIBILITY_SCOPE = "configured_plus_mod";
const DEFAULT_QUEUE_BAR_SCOPE = "current_subreddit";
const DEFAULT_QUEUE_BAR_LINK_HOST = "extension_preference";
const CONFIG_CACHE_KEY = "removalConfigCache";
const OAUTH_TOKEN_REFRESH_BUFFER_MS = 60000;

const ext = globalThis.browser ?? chrome;
let redditOAuthTokenCache = null;

async function getRedditOAuthToken() {
  if (
    redditOAuthTokenCache?.accessToken
    && Number.isFinite(redditOAuthTokenCache?.expiresAt)
    && redditOAuthTokenCache.expiresAt - OAUTH_TOKEN_REFRESH_BUFFER_MS > Date.now()
  ) {
    return redditOAuthTokenCache.accessToken;
  }

  let csrfToken = await ext.cookies.get({ url: "https://sh.reddit.com", name: "csrf_token" });
  if (!csrfToken?.value) {
    await fetch("https://sh.reddit.com/not_found", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    csrfToken = await ext.cookies.get({ url: "https://sh.reddit.com", name: "csrf_token" });
  }

  if (!csrfToken?.value) {
    throw new Error("Unable to read Reddit csrf_token cookie");
  }

  const tokenResponse = await fetch("https://www.reddit.com/svc/shreddit/token", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ csrf_token: csrfToken.value }),
  });

  if (!tokenResponse.ok) {
    throw new Error(`Failed OAuth token exchange: HTTP ${tokenResponse.status}`);
  }

  const tokenData = await tokenResponse.json();
  const accessToken = String(tokenData?.token || "").trim();
  if (!accessToken) {
    throw new Error("OAuth token response missing token");
  }

  const rawExpiry = Number(tokenData?.expires);
  let expiresAt = Date.now() + 50 * 60 * 1000;
  if (Number.isFinite(rawExpiry) && rawExpiry > 0) {
    expiresAt = rawExpiry < 1e12 ? rawExpiry * 1000 : rawExpiry;
  }

  redditOAuthTokenCache = {
    accessToken,
    expiresAt,
  };
  return accessToken;
}

function normalizeQueueBarScope(value, fallback = DEFAULT_QUEUE_BAR_SCOPE) {
  const clean = String(value || "").trim();
  if (clean === "configured_subreddit") {
    return "current_subreddit";
  }
  return ["current_subreddit", "fixed_subreddit", "mod_global"].includes(clean) ? clean : fallback;
}

function normalizeQueueBarFixedSubreddit(value) {
  const clean = String(value || "").trim().replace(/^\/+|\/+$/g, "").replace(/^r\//i, "");
  return clean || null;
}

async function getOverlayPreferences() {
  const stored = await ext.storage.sync.get([
    AUTO_CLOSE_KEY,
    INTERCEPT_NATIVE_REMOVE_KEY,
    LAST_SEND_MODE_KEY,
    BUTTON_VISIBILITY_SCOPE_KEY,
    QUEUE_BAR_ENABLED_KEY,
    QUEUE_BAR_SCOPE_KEY,
    QUEUE_BAR_LINK_HOST_KEY,
    QUEUE_BAR_USE_OLD_REDDIT_KEY,
    QUEUE_BAR_OPEN_IN_NEW_TAB_KEY,
    QUEUE_BAR_FIXED_SUBREDDIT_KEY,
    CONTEXT_POPUP_ENABLED_KEY,
  ]);
  const interceptNativeRemove =
    typeof stored?.[INTERCEPT_NATIVE_REMOVE_KEY] === "boolean"
      ? stored[INTERCEPT_NATIVE_REMOVE_KEY]
      : true;
  const buttonVisibilityScope =
    typeof stored?.[BUTTON_VISIBILITY_SCOPE_KEY] === "string"
      ? stored[BUTTON_VISIBILITY_SCOPE_KEY]
      : DEFAULT_BUTTON_VISIBILITY_SCOPE;
  const queueBarScope =
    typeof stored?.[QUEUE_BAR_SCOPE_KEY] === "string"
      ? stored[QUEUE_BAR_SCOPE_KEY]
      : DEFAULT_QUEUE_BAR_SCOPE;
  const queueBarLinkHost =
    typeof stored?.[QUEUE_BAR_LINK_HOST_KEY] === "string"
      ? stored[QUEUE_BAR_LINK_HOST_KEY]
      : DEFAULT_QUEUE_BAR_LINK_HOST;
  return {
    autoCloseOnRemove: Boolean(stored?.[AUTO_CLOSE_KEY]),
    interceptNativeRemove,
    lastSendMode: typeof stored?.[LAST_SEND_MODE_KEY] === "string" ? stored[LAST_SEND_MODE_KEY] : null,
    buttonVisibilityScope: ["configured_plus_mod", "configured_only", "all"].includes(buttonVisibilityScope)
      ? buttonVisibilityScope
      : DEFAULT_BUTTON_VISIBILITY_SCOPE,
    queueBarEnabled: typeof stored?.[QUEUE_BAR_ENABLED_KEY] === "boolean" ? stored[QUEUE_BAR_ENABLED_KEY] : true,
    queueBarScope: normalizeQueueBarScope(queueBarScope, DEFAULT_QUEUE_BAR_SCOPE),
    queueBarLinkHost: ["extension_preference", "old_reddit", "new_reddit"].includes(queueBarLinkHost)
      ? queueBarLinkHost
      : DEFAULT_QUEUE_BAR_LINK_HOST,
    queueBarUseOldReddit:
      typeof stored?.[QUEUE_BAR_USE_OLD_REDDIT_KEY] === "boolean"
        ? stored[QUEUE_BAR_USE_OLD_REDDIT_KEY]
        : false,
    queueBarFixedSubreddit: normalizeQueueBarFixedSubreddit(stored?.[QUEUE_BAR_FIXED_SUBREDDIT_KEY]),
    queueBarOpenInNewTab:
      typeof stored?.[QUEUE_BAR_OPEN_IN_NEW_TAB_KEY] === "boolean"
        ? stored[QUEUE_BAR_OPEN_IN_NEW_TAB_KEY]
        : false,
    contextPopupEnabled:
      typeof stored?.[CONTEXT_POPUP_ENABLED_KEY] === "boolean" ? stored[CONTEXT_POPUP_ENABLED_KEY] : true,
  };
}

const REDDIT_ORIGIN_FALLBACKS = [
  "https://www.reddit.com",
  "https://old.reddit.com",
  "https://sh.reddit.com",
];

function normalizeRedditOrigin(origin) {
  const value = String(origin || "").trim();
  if (!value) return "";
  try {
    const parsed = new URL(value);
    const host = String(parsed.hostname || "").toLowerCase();
    if (!["www.reddit.com", "old.reddit.com", "sh.reddit.com"].includes(host)) {
      return "";
    }
    return `${parsed.protocol}//${host}`;
  } catch {
    return "";
  }
}

function uniqueOrigins(origins) {
  const seen = new Set();
  const result = [];
  for (const origin of origins || []) {
    const normalized = normalizeRedditOrigin(origin);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}

function extractModhashFromHtml(html) {
  const source = String(html || "");
  if (!source) return "";

  const patterns = [
    /name=["']uh["'][^>]*value=["']([^"']+)["']/i,
    /name=["']modhash["'][^>]*value=["']([^"']+)["']/i,
    /["']modhash["']\s*:\s*["']([^"']+)["']/i,
    /["']uh["']\s*:\s*["']([^"']+)["']/i,
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);
    const value = String(match?.[1] || "").trim();
    if (value) return value;
  }

  return "";
}

async function fetchRedditModhashForOrigin(origin) {
  const response = await fetch(`${origin}/`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`modhash source HTTP ${response.status}`);
  }
  const html = await response.text();
  const modhash = extractModhashFromHtml(html);
  if (!modhash) {
    throw new Error("modhash unavailable");
  }
  return modhash;
}

async function postRedditFormAcrossOrigins(path, params, preferredOrigins) {
  const cleanPath = String(path || "").startsWith("/") ? String(path) : `/${String(path || "")}`;
  const payloadEntries = params && typeof params === "object" ? Object.entries(params) : [];
  const candidateOrigins = uniqueOrigins([...(preferredOrigins || []), ...REDDIT_ORIGIN_FALLBACKS]);
  const failures = [];

  for (const origin of candidateOrigins) {
    try {
      const modhash = await fetchRedditModhashForOrigin(origin);
      const body = new URLSearchParams();
      for (const [key, value] of payloadEntries) {
        if (value === undefined || value === null) continue;
        body.set(String(key), String(value));
      }
      if (!body.has("api_type")) {
        body.set("api_type", "json");
      }
      body.set("uh", modhash);

      const response = await fetch(`${origin}${cleanPath}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Modhash": modhash,
        },
        body: body.toString(),
      });

      const text = await response.text();
      let parsed = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = null;
      }

      if (!response.ok) {
        const detail = (parsed && (parsed.message || parsed.error)) || text || `HTTP ${response.status}`;
        failures.push(`${origin}: ${detail}`);
        continue;
      }

      const apiErrors = parsed?.json?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        const first = apiErrors[0];
        const detail = Array.isArray(first) ? first.join(": ") : String(first);
        failures.push(`${origin}: ${detail || "Reddit API returned errors"}`);
        continue;
      }

      return {
        ok: true,
        status: response.status,
        text,
        json: parsed,
        origin,
      };
    } catch (error) {
      failures.push(`${origin}: ${String(error)}`);
    }
  }

  return {
    ok: false,
    status: 0,
    error: failures.length
      ? `Native Reddit form request failed across origins: ${failures.join(" | ")}`
      : "Native Reddit form request failed (no valid Reddit origins)",
  };
}

const MODERATION_JOBS_KEY = "modboxModerationJobs";
const MODERATION_JOB_ALARM = "modboxModerationJobs";
const activeModerationJobs = new Map();

function moderationJobId() {
  return `job-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function cleanJobSubreddit(value) {
  return String(value || "").trim().replace(/^\/+|\/+$/g, "").replace(/^r\//i, "");
}

function cleanJobAuthor(value) {
  const clean = String(value || "").trim().replace(/^\/+/, "");
  return clean.toLowerCase().startsWith("u/") ? clean.slice(2).trim() : clean;
}

function backgroundJobTargetUrl(permalink, setting, sourceHost) {
  const parsed = new URL(String(permalink || "").trim());
  const hostSetting = ["extension_preference", "old_reddit", "new_reddit"].includes(setting)
    ? setting
    : "extension_preference";
  const source = String(sourceHost || "").toLowerCase();
  const host = hostSetting === "old_reddit"
    ? "old.reddit.com"
    : hostSetting === "new_reddit"
      ? "www.reddit.com"
      : ["old.reddit.com", "new.reddit.com", "www.reddit.com", "sh.reddit.com"].includes(source)
        ? source
        : "www.reddit.com";
  parsed.hostname = host;
  return parsed.toString();
}

function cleanJobFullname(value) {
  const clean = String(value || "").trim().toLowerCase();
  return /^t[13]_[a-z0-9]{5,10}$/.test(clean) ? clean : "";
}

async function readModerationJobs() {
  const stored = await ext.storage.local.get(MODERATION_JOBS_KEY);
  return stored?.[MODERATION_JOBS_KEY] && typeof stored[MODERATION_JOBS_KEY] === "object"
    ? stored[MODERATION_JOBS_KEY]
    : {};
}

async function writeModerationJobs(jobs) {
  await ext.storage.local.set({ [MODERATION_JOBS_KEY]: jobs });
}

async function updateModerationJob(jobId, updater) {
  const jobs = await readModerationJobs();
  const current = jobs[jobId];
  if (!current) return null;
  const next = typeof updater === "function" ? updater(current) : { ...current, ...updater };
  next.updatedAt = Date.now();
  jobs[jobId] = next;
  await writeModerationJobs(jobs);
  return next;
}

function jobTemplate(text, context) {
  return String(text || "")
    .replaceAll("{author}", String(context.author || ""))
    .replaceAll("{subreddit}", String(context.subreddit || ""))
    .replaceAll("{kind}", String(context.kind || "item"))
    .replaceAll("{permalink}", String(context.permalink || ""));
}

function jobInputValue(value) {
  if (!Array.isArray(value)) return String(value || "").trim();
  const values = value.map((item) => String(item || "").trim()).filter(Boolean);
  return values.length > 1 ? `\n\n${values.map((item) => `- ${item}`).join("\n")}\n\n` : (values[0] || "");
}

function jobRemovalMessage(job, reasonKeys, inputs) {
  const config = job.removalConfig && typeof job.removalConfig === "object" ? job.removalConfig : {};
  const globalSettings = config.global_settings && typeof config.global_settings === "object" ? config.global_settings : {};
  const reasons = Array.isArray(job.reasons) ? job.reasons : [];
  const selected = new Set(Array.isArray(reasonKeys) ? reasonKeys : []);
  const context = job;
  const parts = [];
  if (globalSettings.header_markdown) parts.push(jobTemplate(globalSettings.header_markdown, context));
  reasons.filter((reason) => selected.has(String(reason?.external_key || ""))).forEach((reason) => {
    let body = "";
    (Array.isArray(reason?.blocks) ? reason.blocks : []).forEach((block) => {
      if (block?.type === "markdown") {
        body += jobTemplate(block?.payload?.content || "", context);
      } else {
        const value = jobInputValue(inputs?.[String(block?.key || "")]);
        if (value) body += value;
      }
    });
    if (body) parts.push(body);
  });
  if (globalSettings.footer_markdown) parts.push(jobTemplate(globalSettings.footer_markdown, context));
  let message = parts
    .filter((part) => String(part || "").trim())
    .join("\n\n");
  Object.entries(inputs && typeof inputs === "object" ? inputs : {}).forEach(([key, value]) => {
    message = message.replaceAll(`{inputs.${key}}`, jobInputValue(value));
  });
  return message.trim();
}

async function backgroundApiRequest(path, options = {}) {
  const requestedPath = String(path || "");
  const url = requestedPath.startsWith("/") ? `https://oauth.reddit.com${requestedPath}` : requestedPath;
  const method = String(options.method || "GET").toUpperCase();
  const init = { method, credentials: "include", cache: "no-store", redirect: "error" };
  const accessToken = await getRedditOAuthToken();
  init.headers = { Authorization: `bearer ${accessToken}` };
  if (method !== "GET" && method !== "HEAD" && options.body !== undefined) {
    if (options.formData) {
      const form = new FormData();
      Object.entries(options.body || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null) form.append(String(key), String(value));
      });
      init.body = form;
    } else {
      init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(options.body);
    }
  }
  const response = await fetch(url, init);
  const text = await response.text();
  let payload = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = null; }
  if (!response.ok || payload?.json?.errors?.length) {
    throw new Error(`Reddit API request failed: ${text || response.status}`);
  }
  return payload;
}

async function backgroundArchiveModmailConversation(conversationId) {
  const cleanConversationId = String(conversationId || "").trim();
  if (!cleanConversationId) return;
  await backgroundApiRequest(`/api/mod/conversations/${encodeURIComponent(cleanConversationId)}/archive`, {
    method: "POST",
  });
}

async function backgroundFormRequest(path, params) {
  const result = await postRedditFormAcrossOrigins(path, params, [
    "https://old.reddit.com",
    "https://www.reddit.com",
    "https://sh.reddit.com",
  ]);
  if (!result?.ok) throw new Error(result?.error || "Reddit form request failed");
  return result;
}

function backgroundBase64ToBytes(encoded) {
  const binary = atob(String(encoded || ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function backgroundBytesToBase64(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
  return btoa(binary);
}

async function backgroundInflateUsernotes(encoded) {
  const stream = new Blob([backgroundBase64ToBytes(encoded)]).stream().pipeThrough(new DecompressionStream("deflate"));
  const buffer = await new Response(stream).arrayBuffer();
  return JSON.parse(new TextDecoder().decode(new Uint8Array(buffer)));
}

async function backgroundDeflateUsernotes(users) {
  const bytes = new TextEncoder().encode(JSON.stringify(users || {}));
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate"));
  const buffer = await new Response(stream).arrayBuffer();
  return backgroundBytesToBase64(new Uint8Array(buffer));
}

async function backgroundLoadUsernotes(subreddit) {
  let payload;
  try {
    payload = await backgroundApiRequest(`/r/${encodeURIComponent(subreddit)}/wiki/usernotes.json?raw_json=1`);
  } catch (error) {
    if (/404|PAGE_NOT_CREATED|WIKI_DISABLED|NOT_FOUND/i.test(String(error?.message || error))) {
      return { ver: 6, constants: { users: [], warnings: [] }, users: {} };
    }
    throw error;
  }
  const raw = String(payload?.data?.content_md || "").trim();
  if (!raw) return { ver: 6, users: {} };
  const document = JSON.parse(raw);
  const version = Number(document?.ver || 0);
  if (version !== 6 || !document.blob) {
    throw new Error(`Unsupported usernotes schema version: ${version || "unknown"}`);
  }
  const users = await backgroundInflateUsernotes(document.blob);
  return { ver: 6, constants: document.constants || { users: [], warnings: [] }, users };
}

async function backgroundSaveUsernotes(subreddit, document, reason) {
  const blob = await backgroundDeflateUsernotes(document.users);
  return backgroundFormRequest(`/r/${encodeURIComponent(subreddit)}/api/wiki/edit`, {
    api_type: "json",
    content: JSON.stringify({ ver: 6, constants: document.constants || { users: [], warnings: [] }, blob }),
    page: "usernotes",
    reason: `${String(reason || "updated usernotes")} via ModBox`,
  });
}

function backgroundSquashUsernoteLink(permalink) {
  const value = String(permalink || "").trim();
  const commentsMatch = value.match(/\/comments\/(\w+)(?:\/[^/]+\/((?:\w+)))?/i);
  if (commentsMatch?.[1]) return commentsMatch[2] ? `l,${commentsMatch[1]},${commentsMatch[2]}` : `l,${commentsMatch[1]}`;
  const modmailMatch = value.match(/\/messages\/(\w+)/i);
  return modmailMatch?.[1] ? `m,${modmailMatch[1]}` : (value.startsWith("https://mod.reddit.com") ? value : "");
}

async function backgroundAddUsernote(subreddit, author, note, noteType, permalink) {
  author = cleanJobAuthor(author);
  if (!author) throw new Error("Usernote author is missing");
  const document = await backgroundLoadUsernotes(subreddit);
  const username = Object.keys(document.users || {}).find((key) => key.toLowerCase() === author.toLowerCase()) || author;
  const user = document.users[username] && typeof document.users[username] === "object"
    ? document.users[username]
    : { name: username, ns: [] };
  const me = await backgroundApiRequest("/api/v1/me");
  const userPool = Array.isArray(document.constants?.users) ? document.constants.users : [];
  const warningPool = Array.isArray(document.constants?.warnings) ? document.constants.warnings : [];
  const moderator = String(me?.name || "");
  const cleanType = String(noteType || "none") || "none";
  const moderatorIndex = userPool.includes(moderator) ? userPool.indexOf(moderator) : (userPool.push(moderator) - 1);
  const warningIndex = warningPool.includes(cleanType) ? warningPool.indexOf(cleanType) : (warningPool.push(cleanType) - 1);
  const notes = Array.isArray(user.ns) ? user.ns : [];
  notes.unshift({
    n: note,
    t: Math.trunc(Date.now() / 1000),
    m: moderatorIndex,
    l: backgroundSquashUsernoteLink(permalink),
    w: warningIndex,
  });
  document.constants = { users: userPool, warnings: warningPool };
  document.users[username] = { ...user, name: username, ns: notes };
  return backgroundSaveUsernotes(subreddit, document, `create note on user ${username}`);
}

async function executeBackgroundStep(job, step) {
  const type = String(step?.type || "").trim().toLowerCase();
  const fullname = cleanJobFullname(job.fullname);
  const subreddit = cleanJobSubreddit(job.subreddit);
  const author = cleanJobAuthor(job.author);
  const configSettings = job.removalConfig?.global_settings && typeof job.removalConfig.global_settings === "object"
    ? job.removalConfig.global_settings
    : {};
  if (!fullname && !["usernote", "ban_user", "unban_user", "send_modmail"].includes(type)) {
    throw new Error("Background job target fullname is invalid");
  }
  if (type === "remove" || type === "remove_item") {
    if (!step?.skip_reddit_remove) {
      await backgroundFormRequest("/api/remove", { id: fullname, spam: Boolean(step?.spam) ? "true" : "false" });
    }
    if (type === "remove_item") return;
    const shouldSendRemovalMessage = !step?.no_reason && step?.send_mode !== "none";
    if (!shouldSendRemovalMessage) {
      const note = jobTemplate(job.removalNoteText, job).trim();
      if (note && subreddit && author) {
        await backgroundAddUsernote(subreddit, author, note, job.removalNoteType, job.permalink);
      }
      return;
    }
    const inputs = step?.inputs && typeof step.inputs === "object" ? step.inputs : {};
    const message = jobRemovalMessage(job, step.reason_keys, inputs);
    if (!message) throw new Error("Removal step produced no message");
    const sendMode = String(step.send_mode || "reply").toLowerCase();
    const selectedReasons = (Array.isArray(job.reasons) ? job.reasons : [])
      .filter((reason) => (step.reason_keys || []).includes(reason.external_key));
    const commentAsSubreddit = typeof step.comment_as_subreddit === "boolean"
      ? step.comment_as_subreddit
      : configSettings.comment_as_subreddit !== false;
    let replyFullname = "";
    if (sendMode === "reply" || sendMode === "both") {
      if (commentAsSubreddit) {
        const endpoint = fullname.startsWith("t1_")
          ? "/api/v1/modactions/removal_comment_message"
          : "/api/v1/modactions/removal_link_message";
        await backgroundApiRequest(endpoint, {
          method: "POST",
          body: { item_id: [fullname], message, title: "removal reason through ModBox", type: "public_as_subreddit", lock_comment: Boolean(configSettings.lock_removal_comment) },
        });
      } else {
        const response = await backgroundFormRequest("/api/comment", { thing_id: fullname, text: message });
        const reply = response?.json?.json?.data?.things?.[0]?.data || response?.json?.data?.things?.[0]?.data;
        replyFullname = cleanJobFullname(reply?.name || reply?.id || "");
      }
    }
    if ((sendMode === "pm" || sendMode === "both") && author) {
      const subjectTemplate = String(job.removalConfig?.global_settings?.pm_subject_template || "Removal reason");
      const subject = jobTemplate(subjectTemplate, job).trim() || "Removal reason";
      const modmailResult = await backgroundApiRequest("/api/mod/conversations", {
        method: "POST", oauth: true, formData: true,
        body: { srName: subreddit, to: author, subject, body: message, isAuthorHidden: "true" },
      });
      const conversationId = String(modmailResult?.conversation?.id || "").trim();
      const isInternal = Boolean(modmailResult?.conversation?.isInternal);
      if (conversationId && !isInternal && configSettings.auto_archive_modmail !== false) {
        try {
          await backgroundArchiveModmailConversation(conversationId);
        } catch {
          // Match the foreground flow: archive failure must not undo a sent modmail.
        }
      }
    }
    if (replyFullname && job.kind === "post" && selectedReasons.some((reason) => Boolean(reason?.sticky_comment))) {
      await backgroundFormRequest("/api/distinguish", { id: replyFullname, how: "yes", sticky: "true" });
    }
    if (fullname.startsWith("t3_") && selectedReasons.some((reason) => Boolean(reason?.flair_id))) {
      await backgroundFormRequest(`/r/${encodeURIComponent(subreddit)}/api/selectflair`, {
        flair_template_id: selectedReasons.find((reason) => String(reason?.flair_id || "").trim())?.flair_id,
        return_rtjson: "none", api_type: "json", r: subreddit, link: fullname,
      });
    }
    if (selectedReasons.some((reason) => Boolean(reason?.lock_post))) {
      await backgroundFormRequest("/api/lock", { id: fullname });
    }
    if (job.removalNoteText && subreddit && author) {
      const note = jobTemplate(job.removalNoteText, job).trim();
      if (note) await backgroundAddUsernote(subreddit, author, note, job.removalNoteType, job.permalink);
    }
    return;
  }
  if (type === "approve_item") return backgroundFormRequest("/api/approve", { id: fullname });
  if (type === "lock_item") return backgroundFormRequest("/api/lock", { id: fullname });
  if (type === "unlock_item") return backgroundFormRequest("/api/unlock", { id: fullname });
  if (type === "distinguish_comment") return backgroundFormRequest("/api/distinguish", { id: fullname, how: "yes", sticky: step.sticky ? "true" : undefined });
  if (type === "comment") {
    const source = String(step.source || "custom").toLowerCase();
    const body = source === "removal_reasons"
      ? jobRemovalMessage(job, step.reason_keys, step.inputs || {})
      : jobTemplate(step.text_template, job).trim();
    if (!body) throw new Error("Comment step produced no message");
    let commentResponse;
    if (step.comment_as_subreddit === true) {
      await backgroundFormRequest("/api/remove", { id: fullname, spam: "false" });
      const endpoint = fullname.startsWith("t1_")
        ? "/api/v1/modactions/removal_comment_message"
        : "/api/v1/modactions/removal_link_message";
      await backgroundApiRequest(endpoint, {
        method: "POST",
        body: { item_id: [fullname], message: body, title: "removal reason through ModBox", type: "public_as_subreddit", lock_comment: Boolean(step.lock_comment) },
      });
      await backgroundFormRequest("/api/approve", { id: fullname });
      return;
    }
    commentResponse = await backgroundFormRequest("/api/comment", { thing_id: fullname, text: body });
    const reply = commentResponse?.json?.json?.data?.things?.[0]?.data
      || commentResponse?.json?.data?.things?.[0]?.data
      || null;
    const replyFullname = cleanJobFullname(reply?.name || reply?.id || "");
    if (replyFullname && step.lock_comment) {
      await backgroundFormRequest("/api/lock", { id: replyFullname });
    }
    return;
  }
  if (type === "usernote") {
    const note = jobTemplate(step.text_template, job).trim();
    if (!note || !subreddit || !author) throw new Error("Usernote step is missing text, subreddit, or author");
    return backgroundAddUsernote(subreddit, author, note, step.note_type, job.permalink);
  }
  if (type === "ban_user" || type === "unban_user") {
    if (!subreddit || !author) throw new Error(`${type} step is missing subreddit or author`);
    return backgroundFormRequest(type === "ban_user" ? "/api/friend" : "/api/unfriend", {
      name: author, type: "banned", r: subreddit, duration: type === "ban_user" && Number(step.duration_days) > 0 ? String(step.duration_days) : undefined,
      ban_message: type === "ban_user" ? jobTemplate(step.ban_message_template, job) : undefined,
      note: type === "ban_user" ? jobTemplate(step.ban_note_template, job).slice(0, 300) : undefined,
    });
  }
  if (type === "send_modmail") {
    const toMode = String(step.to_mode || "author").toLowerCase();
    const to = toMode === "custom" ? String(step.to_username || "").trim() : toMode === "subreddit" ? undefined : author;
    const body = jobTemplate(step.body_template, job).trim();
    const subject = jobTemplate(step.subject_template, job).trim();
    if (!subreddit || !subject || !body || (toMode !== "subreddit" && !to)) throw new Error("Modmail step is incomplete");
    const modmailResult = await backgroundApiRequest("/api/mod/conversations", {
      method: "POST", formData: true,
      body: { srName: subreddit, to, subject, body, isAuthorHidden: "true" },
    });
    const conversationId = String(modmailResult?.conversation?.id || "").trim();
    const isInternal = Boolean(modmailResult?.conversation?.isInternal);
    if (conversationId && !isInternal && step.auto_archive !== false) {
      try {
        await backgroundArchiveModmailConversation(conversationId);
      } catch {
        // Modmail was sent; leave the job successful if archiving is unavailable.
      }
    }
    return modmailResult;
  }
  if (type === "set_post_flair" || type === "set_user_flair") {
    const flairId = String(step.flair_template_id || "").trim();
    if (!subreddit || !flairId) throw new Error("Flair step is incomplete");
    const body = { flair_template_id: flairId, return_rtjson: "none", api_type: "json", r: subreddit };
    if (type === "set_post_flair") body.link = fullname;
    else if (author) body.name = author;
    else throw new Error("User flair step is missing author");
    return backgroundFormRequest(`/r/${encodeURIComponent(subreddit)}/api/selectflair`, body);
  }
  throw new Error(`Unsupported background playbook step: ${type}`);
}

async function notifyModerationJob(job) {
  if (!ext.notifications?.create) return;
  const success = job.status === "completed";
  const failures = Array.isArray(job.failures) ? job.failures.filter(Boolean) : [];
  await ext.notifications.create(`modbox-${job.id}`, {
    type: "basic",
    iconUrl: ext.runtime.getURL("assets/icon-128.png"),
    title: success ? `SUCCESS: ${job.title || "Moderation job"}` : `FAILED: ${job.title || "Moderation job"}`,
    message: success
      ? "The moderation action completed successfully. Click to open the post or comment."
      : `${failures.join("; ") || "The moderation action stopped before completion."} Click to inspect the post or comment.`,
  });
}

if (ext.notifications?.onClicked?.addListener) {
  ext.notifications.onClicked.addListener(async (notificationId) => {
    const prefix = "modbox-";
    if (!String(notificationId || "").startsWith(prefix)) return;
    const jobId = String(notificationId).slice(prefix.length);
    const jobs = await readModerationJobs();
    const job = jobs[jobId];
    const permalink = String(job?.permalink || "").trim();
    if (!permalink) return;
    try {
      const url = new URL(permalink);
      if (!['reddit.com', 'www.reddit.com', 'old.reddit.com', 'new.reddit.com', 'sh.reddit.com'].includes(url.hostname.toLowerCase())) return;
      const stored = await ext.storage.sync.get(BACKGROUND_JOB_LINK_HOST_KEY);
      await ext.tabs?.create?.({
        url: backgroundJobTargetUrl(permalink, stored?.[BACKGROUND_JOB_LINK_HOST_KEY], job?.sourceHost),
      });
    } catch {
      // Ignore malformed or unavailable notification targets.
    }
  });
}

async function runModerationJob(jobId) {
  if (activeModerationJobs.has(jobId)) return activeModerationJobs.get(jobId);
  const task = (async () => {
    let job = (await readModerationJobs())[jobId];
    if (!job || ["completed", "failed", "cancelled", "interrupted"].includes(job.status)) return;
    try {
      job = await updateModerationJob(jobId, { status: "running" });
      const steps = Array.isArray(job.steps) ? job.steps : [];
      for (let index = Number(job.currentStep || 0); index < steps.length; index += 1) {
        const latestJobs = await readModerationJobs();
        if (latestJobs[jobId]?.status === "cancelled") {
          return;
        }
        job = await updateModerationJob(jobId, { currentStep: index, status: "running", stepStartedAt: Date.now() });
        try {
          await executeBackgroundStep(job, steps[index]);
          job = await updateModerationJob(jobId, (current) => ({ ...current, completedSteps: Number(current.completedSteps || 0) + 1, currentStep: index + 1, stepStartedAt: null }));
        } catch (error) {
          const failure = `step ${index + 1} (${steps[index]?.type || "unknown"}): ${String(error?.message || error)}`;
          job = await updateModerationJob(jobId, (current) => ({ ...current, status: "failed", failures: [...(current.failures || []), failure] }));
          await notifyModerationJob(job);
          return;
        }
      }
      job = await updateModerationJob(jobId, { status: "completed", completedAt: Date.now(), stepStartedAt: null });
      await notifyModerationJob(job);
    } catch (error) {
      job = await updateModerationJob(jobId, { status: "failed", failures: [String(error?.message || error)] });
      await notifyModerationJob(job);
    }
  })();
  activeModerationJobs.set(jobId, task);
  try { await task; } finally { activeModerationJobs.delete(jobId); }
  return task;
}

async function startModerationJob(payload) {
  const id = moderationJobId();
  const jobs = await readModerationJobs();
  jobs[id] = { ...payload, id, status: "queued", currentStep: 0, completedSteps: 0, failures: [], createdAt: Date.now(), updatedAt: Date.now() };
  await writeModerationJobs(jobs);
  void runModerationJob(id);
  return { id, status: "queued" };
}

async function resumeModerationJobs() {
  const jobs = await readModerationJobs();
  for (const job of Object.values(jobs)) {
    if (job?.status === "queued") void runModerationJob(job.id);
    if (job?.status === "running" && Date.now() - Number(job.stepStartedAt || job.updatedAt || 0) > 120000) {
      await updateModerationJob(job.id, { status: "interrupted", failures: ["The background worker stopped during an in-flight step; no automatic replay was attempted."] });
    }
  }
}

if (ext.alarms?.create) {
  ext.alarms.create(MODERATION_JOB_ALARM, { periodInMinutes: 1 });
  ext.alarms.onAlarm.addListener((alarm) => {
    if (alarm?.name === MODERATION_JOB_ALARM) void resumeModerationJobs();
  });
  void resumeModerationJobs();
}

ext.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "START_MODERATION_JOB") {
    startModerationJob(message.job)
      .then((result) => sendResponse({ ok: true, ...result }))
      .catch((error) => sendResponse({ ok: false, error: String(error?.message || error) }));
    return true;
  }

  if (message?.type === "GET_MODERATION_JOBS") {
    readModerationJobs()
      .then((jobs) => sendResponse({ ok: true, jobs }))
      .catch((error) => sendResponse({ ok: false, error: String(error?.message || error) }));
    return true;
  }

  if (message?.type === "CANCEL_MODERATION_JOB") {
    updateModerationJob(String(message.jobId || ""), { status: "cancelled", completedAt: Date.now() })
      .then((job) => sendResponse({ ok: Boolean(job), job }))
      .catch((error) => sendResponse({ ok: false, error: String(error?.message || error) }));
    return true;
  }

  if (message?.type === "API_REQUEST") {
    const requestedUrl = String(message.url || "");
    const method = String(message.method || "GET").toUpperCase();
    const body = message.body;
    const oauth = Boolean(message.oauth);
    const formData = Boolean(message.formData);
    const url = oauth && requestedUrl.startsWith("/")
      ? `https://oauth.reddit.com${requestedUrl}`
      : requestedUrl;

    const init = {
      method,
      credentials: "include",
      cache: "no-store",
      redirect: "error",
    };

    if (method !== "GET" && method !== "HEAD" && body !== undefined) {
      if (formData && body && typeof body === "object") {
        const payload = new FormData();
        for (const [key, value] of Object.entries(body)) {
          if (value !== undefined && value !== null) {
            payload.append(String(key), String(value));
          }
        }
        init.body = payload;
      } else {
        init.headers = {
          "Content-Type": "application/json",
        };
        init.body = JSON.stringify(body);
      }
    }

    (async () => {
      try {
        if (oauth) {
          const accessToken = await getRedditOAuthToken();
          init.headers = {
            ...(init.headers || {}),
            Authorization: `bearer ${accessToken}`,
          };
        }

        const response = await fetch(url, init);
        const text = await response.text();
        sendResponse({ ok: response.ok, status: response.status, text });
      } catch (error) {
        sendResponse({ ok: false, status: 0, text: String(error) });
      }
    })();
    return true;
  }

  if (message?.type === "REDDIT_FORM_REQUEST") {
    postRedditFormAcrossOrigins(message.path, message.params, message.preferredOrigins)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ ok: false, status: 0, error: String(error) }));
    return true;
  }

  if (message?.type === "GET_CONFIG_CACHE") {
    ext.storage.session.get(CONFIG_CACHE_KEY)
      .then((stored) => sendResponse({ ok: true, data: stored?.[CONFIG_CACHE_KEY] || null }))
      .catch(() => sendResponse({ ok: true, data: null }));
    return true;
  }

  if (message?.type === "SET_CONFIG_CACHE") {
    const entry = { config: message.config, cachedAt: Date.now() };
    ext.storage.session.set({ [CONFIG_CACHE_KEY]: entry })
      .then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }

  if (message?.type === "CLEAR_CONFIG_CACHE") {
    ext.storage.session.remove(CONFIG_CACHE_KEY)
      .then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }

  return false;
});

