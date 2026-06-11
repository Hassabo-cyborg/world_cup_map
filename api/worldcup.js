// V9 World Cup live-data proxy for Vercel.
// Keep APIFOOTBALL_KEY private in Vercel Environment Variables.

const API_BASE = "https://v3.football.api-sports.io";
const LEAGUE = "1";
const SEASON = "2026";
const memoryCache = new Map();

const RESOURCE_CONFIG = {
  coverage: {
    path: "/leagues",
    params: { id: LEAGUE, season: SEASON },
    cdnSeconds: 24 * 60 * 60,
    staleSeconds: 24 * 60 * 60
  },
  fixtures: {
    path: "/fixtures",
    params: { league: LEAGUE, season: SEASON },
    cdnSeconds: 20 * 60,
    staleSeconds: 5 * 60,
    dynamicCache: true
  },
  standings: {
    path: "/standings",
    params: { league: LEAGUE, season: SEASON },
    cdnSeconds: 2 * 60 * 60,
    staleSeconds: 60 * 60
  },
  events: {
    path: "/fixtures/events",
    params: {},
    cdnSeconds: 5 * 60,
    staleSeconds: 5 * 60,
    requiresFixture: true
  }
};

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, message: "Only GET requests are supported." });
  }

  const query = getQuery(req);
  const resource = String(query.resource || "fixtures").toLowerCase();
  const config = RESOURCE_CONFIG[resource];

  if (!config) {
    return res.status(400).json({ ok: false, message: `Unsupported resource: ${resource}` });
  }

  if (config.requiresFixture && !query.fixture) {
    return res.status(400).json({ ok: false, message: "Missing required fixture id." });
  }

  const apiKey = process.env.APIFOOTBALL_KEY;
  if (!apiKey) {
    setNoStore(res);
    return res.status(503).json({
      ok: false,
      mode: "static",
      message: "APIFOOTBALL_KEY is not configured. Add it in Vercel Project Settings → Environment Variables."
    });
  }

  const cacheKey = makeCacheKey(resource, query);
  const cached = memoryCache.get(cacheKey);
  const now = Date.now();
  const forceFresh = query.fresh === "1" || query.force === "1";

  if (!forceFresh && cached && now - cached.time < cached.ttlMs) {
    setCacheHeaders(res, cached.cacheConfig || config);
    return res.status(200).json({ ...cached.body, cache: "memory-hit" });
  }

  try {
    const url = makeApiUrl(config, query);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-apisports-key": apiKey,
        "Accept": "application/json"
      }
    });

    const payload = await response.json().catch(() => null);
    const body = {
      ok: response.ok,
      resource,
      league: Number(LEAGUE),
      season: Number(SEASON),
      fetchedAt: new Date().toISOString(),
      quota: readQuotaHeaders(response.headers),
      payload
    };

    if (!response.ok) {
      setNoStore(res);
      return res.status(response.status).json({ ...body, message: "API-Football request failed." });
    }

    const cacheConfig = config.dynamicCache ? dynamicFixtureCacheConfig(payload) : config;
    memoryCache.set(cacheKey, { time: now, ttlMs: cacheConfig.cdnSeconds * 1000, cacheConfig, body });
    setCacheHeaders(res, cacheConfig);
    return res.status(200).json({ ...body, cache: "fresh", cacheTtlSeconds: cacheConfig.cdnSeconds });
  } catch (error) {
    setNoStore(res);
    return res.status(500).json({
      ok: false,
      resource,
      mode: "static",
      message: error.message || "Live API request failed."
    });
  }
};

function getQuery(req) {
  if (req.query) return req.query;
  const url = new URL(req.url, "http://localhost");
  return Object.fromEntries(url.searchParams.entries());
}

function makeApiUrl(config, query) {
  const url = new URL(config.path, API_BASE);
  const params = { ...config.params };
  if (config.requiresFixture) params.fixture = String(query.fixture).replace(/[^0-9]/g, "");
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

function makeCacheKey(resource, query) {
  if (resource === "events") return `${resource}:${String(query.fixture || "")}`;
  return resource;
}

function setCacheHeaders(res, config) {
  res.setHeader("Cache-Control", "public, max-age=60, must-revalidate");
  res.setHeader("CDN-Cache-Control", `public, s-maxage=${config.cdnSeconds}, stale-while-revalidate=${config.staleSeconds}`);
  res.setHeader("Vercel-CDN-Cache-Control", `public, s-maxage=${config.cdnSeconds}, stale-while-revalidate=${config.staleSeconds}`);
}

function setNoStore(res) {
  res.setHeader("Cache-Control", "no-store");
}

function readQuotaHeaders(headers) {
  const names = [
    "x-ratelimit-requests-limit",
    "x-ratelimit-requests-remaining",
    "x-ratelimit-requests-reset",
    "x-ratelimit-limit",
    "x-ratelimit-remaining"
  ];
  const quota = {};
  names.forEach((name) => {
    const value = headers.get(name);
    if (value !== null) quota[toCamel(name.replace(/^x-ratelimit-/, ""))] = value;
  });
  return quota;
}

function toCamel(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}


function dynamicFixtureCacheConfig(payload) {
  const base = RESOURCE_CONFIG.fixtures;
  const fixtures = Array.isArray(payload?.response) ? payload.response : [];
  const now = Date.now();
  const activeWindow = fixtures.some((item) => {
    const date = parseDateMs(item?.fixture?.date);
    if (!date) return false;
    const short = String(item?.fixture?.status?.short || "").toUpperCase();
    const explicitlyLive = ["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "INT"].includes(short);
    // Treat a fixture as active from 30 minutes before kickoff until 3 hours after.
    return explicitlyLive || (now >= date - 30 * 60 * 1000 && now <= date + 3 * 60 * 60 * 1000);
  });
  if (activeWindow) {
    return { ...base, cdnSeconds: 8 * 60, staleSeconds: 60 };
  }
  return { ...base, cdnSeconds: 20 * 60, staleSeconds: 5 * 60 };
}

function parseDateMs(value) {
  if (!value) return null;
  const normalized = String(value).trim().replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}
