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

ext.runtime.onMessage.addListener((message, _sender, sendResponse) => {
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

