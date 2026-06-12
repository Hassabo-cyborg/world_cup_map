// V10.6 free provider proxy for Vercel.
// Priority:
// 1) football-data.org free API when FOOTBALLDATA_KEY is configured.
// 2) OpenFootball public JSON fallback, no key required.
// 3) API-Football only as optional fallback, but its free plan currently blocks 2026.

const FOOTBALL_DATA_BASE = "https://api.football-data.org/v4";
const OPENFOOTBALL_2026_URL = "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";
const APIFOOTBALL_BASE = "https://v3.football.api-sports.io";

const LEAGUE = "1";
const SEASON = "2026";
const WC_COMPETITION_CODE = "WC";
const memoryCache = new Map();

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, message: "Only GET requests are supported." });
  }

  const query = getQuery(req);
  const resource = String(query.resource || "fixtures").toLowerCase();
  const forceFresh = query.fresh === "1" || query.force === "1";

  if (!["fixtures", "standings", "coverage", "events"].includes(resource)) {
    return res.status(400).json({ ok: false, message: `Unsupported resource: ${resource}` });
  }

  const cacheKey = `${resource}:${String(query.fixture || "")}`;
  const cached = memoryCache.get(cacheKey);
  const now = Date.now();
  if (!forceFresh && cached && now - cached.time < cached.ttlMs) {
    setCacheHeaders(res, cached.cdnSeconds, cached.staleSeconds);
    return res.status(200).json({ ...cached.body, cache: "memory-hit" });
  }

  try {
    let body;

    if (resource === "fixtures") {
      body = await getFixtures(query);
    } else if (resource === "standings") {
      body = await getStandings(query);
    } else if (resource === "coverage") {
      body = await getCoverage(query);
    } else if (resource === "events") {
      body = await getEvents(query);
    }

    const { cdnSeconds, staleSeconds } = cachePolicy(resource, body);
    memoryCache.set(cacheKey, { time: now, ttlMs: cdnSeconds * 1000, cdnSeconds, staleSeconds, body });
    setCacheHeaders(res, cdnSeconds, staleSeconds);
    return res.status(200).json({ ...body, cache: "fresh", cacheTtlSeconds: cdnSeconds });
  } catch (error) {
    setNoStore(res);
    return res.status(200).json({
      ok: false,
      resource,
      mode: "static",
      provider: "static",
      providerName: "Static dataset",
      fetchedAt: new Date().toISOString(),
      message: error.message || "Free data provider request failed. Static data is being used."
    });
  }
};

async function getFixtures(query) {
  const footballDataKey = process.env.FOOTBALLDATA_KEY;
  const apiFootballKey = process.env.APIFOOTBALL_KEY;
  const errors = [];

  if (footballDataKey) {
    try {
      const fd = await fetchFootballDataFixtures(footballDataKey);
      if (fd.response.length) return fd;
      errors.push("football-data.org returned no fixtures.");
    } catch (error) {
      errors.push(`football-data.org: ${error.message}`);
    }
  }

  // OpenFootball is completely free and needs no key. It may not be instant-live,
  // but it keeps the website updated with public fixtures/results whenever the repo updates.
  try {
    const of = await fetchOpenFootballFixtures();
    if (of.response.length) {
      return {
        ok: true,
        resource: "fixtures",
        league: Number(LEAGUE),
        season: Number(SEASON),
        provider: "openfootball",
        providerName: "OpenFootball public data",
        mode: "free-public-data",
        fetchedAt: new Date().toISOString(),
        message: footballDataKey ? errors.join(" | ") : "No FOOTBALLDATA_KEY configured; using OpenFootball public data.",
        quota: {},
        payload: {
          get: "fixtures",
          provider: "openfootball",
          source: OPENFOOTBALL_2026_URL,
          response: of.response
        }
      };
    }
  } catch (error) {
    errors.push(`OpenFootball: ${error.message}`);
  }

  // Optional last try: API-Football. Free accounts currently block 2026 for many users,
  // so this is intentionally after the free alternatives.
  if (apiFootballKey) {
    try {
      const af = await fetchApiFootballFixtures(apiFootballKey, query);
      if (af.ok && Array.isArray(af.payload?.response) && af.payload.response.length) return af;
      errors.push(extractApiFootballError(af.payload) || "API-Football returned no 2026 fixtures.");
    } catch (error) {
      errors.push(`API-Football: ${error.message}`);
    }
  }

  throw new Error(errors.filter(Boolean).join(" | ") || "No free provider returned World Cup 2026 fixtures.");
}

async function getStandings(query) {
  const footballDataKey = process.env.FOOTBALLDATA_KEY;
  if (!footballDataKey) {
    return {
      ok: false,
      resource: "standings",
      mode: "static",
      provider: "static",
      providerName: "Static dataset",
      fetchedAt: new Date().toISOString(),
      message: "FOOTBALLDATA_KEY is required for free standings. Add it in Vercel Environment Variables."
    };
  }

  const url = `${FOOTBALL_DATA_BASE}/competitions/${WC_COMPETITION_CODE}/standings?season=${SEASON}`;
  const response = await fetch(url, { headers: { "X-Auth-Token": footballDataKey, Accept: "application/json" } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || `football-data.org standings failed (${response.status})`);
  return {
    ok: true,
    resource: "standings",
    league: Number(LEAGUE),
    season: Number(SEASON),
    provider: "football-data",
    providerName: "football-data.org",
    fetchedAt: new Date().toISOString(),
    quota: readFootballDataQuota(response.headers),
    payload: data
  };
}

async function getCoverage(query) {
  const footballDataKey = process.env.FOOTBALLDATA_KEY;
  if (footballDataKey) {
    const url = `${FOOTBALL_DATA_BASE}/competitions/${WC_COMPETITION_CODE}`;
    const response = await fetch(url, { headers: { "X-Auth-Token": footballDataKey, Accept: "application/json" } });
    const data = await response.json().catch(() => ({}));
    return {
      ok: response.ok,
      resource: "coverage",
      provider: "football-data",
      providerName: "football-data.org",
      fetchedAt: new Date().toISOString(),
      quota: readFootballDataQuota(response.headers),
      payload: data
    };
  }
  return {
    ok: true,
    resource: "coverage",
    provider: "openfootball",
    providerName: "OpenFootball public data",
    fetchedAt: new Date().toISOString(),
    payload: { message: "OpenFootball fallback requires no key; football-data.org coverage requires FOOTBALLDATA_KEY." }
  };
}

async function getEvents(query) {
  return {
    ok: false,
    resource: "events",
    mode: "static",
    provider: "static",
    providerName: "Static dataset",
    fetchedAt: new Date().toISOString(),
    message: "Free event-level World Cup data is not enabled. Scores/fixtures are supported first."
  };
}

async function fetchFootballDataFixtures(token) {
  const url = `${FOOTBALL_DATA_BASE}/competitions/${WC_COMPETITION_CODE}/matches?season=${SEASON}`;
  const response = await fetch(url, { headers: { "X-Auth-Token": token, Accept: "application/json" } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || `football-data.org fixtures failed (${response.status})`);
  }
  const matches = Array.isArray(data.matches) ? data.matches : [];
  const normalized = matches.map(normalizeFootballDataMatch).filter(Boolean).map(applyManualOverride);
  return {
    ok: true,
    resource: "fixtures",
    league: Number(LEAGUE),
    season: Number(SEASON),
    provider: "football-data",
    providerName: "football-data.org",
    mode: "free-api",
    fetchedAt: new Date().toISOString(),
    quota: readFootballDataQuota(response.headers),
    payload: {
      get: "fixtures",
      provider: "football-data.org",
      originalCount: matches.length,
      response: normalized
    }
  };
}

async function fetchOpenFootballFixtures() {
  const response = await fetch(`${OPENFOOTBALL_2026_URL}?cb=${Date.now()}`, { headers: { Accept: "application/json" } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`OpenFootball request failed (${response.status})`);
  const matches = Array.isArray(data.matches) ? data.matches : [];
  const normalized = matches.map(normalizeOpenFootballMatch).filter(Boolean).map(applyManualOverride);
  return { response: normalized };
}

async function fetchApiFootballFixtures(apiKey, query) {
  const url = new URL("/fixtures", APIFOOTBALL_BASE);
  url.searchParams.set("league", LEAGUE);
  url.searchParams.set("season", SEASON);
  const response = await fetch(url, {
    headers: { "x-apisports-key": apiKey, Accept: "application/json" }
  });
  const payload = await response.json().catch(() => ({}));
  const apiPlanError = extractApiFootballError(payload);
  return {
    ok: response.ok && !apiPlanError,
    resource: "fixtures",
    league: Number(LEAGUE),
    season: Number(SEASON),
    provider: "api-football",
    providerName: "API-Football",
    fetchedAt: new Date().toISOString(),
    quota: readApiFootballQuota(response.headers),
    apiBlocked: Boolean(apiPlanError),
    message: apiPlanError || "",
    payload
  };
}

function normalizeFootballDataMatch(match) {
  if (!match) return null;
  const homeName = match.homeTeam?.shortName || match.homeTeam?.name || match.homeTeam?.tla || "Team TBC";
  const awayName = match.awayTeam?.shortName || match.awayTeam?.name || match.awayTeam?.tla || "Team TBC";
  const status = mapFootballDataStatus(match.status);
  const homeGoals = numberOrNull(match.score?.fullTime?.home ?? match.score?.regularTime?.home);
  const awayGoals = numberOrNull(match.score?.fullTime?.away ?? match.score?.regularTime?.away);
  return {
    fixture: {
      id: match.id || null,
      date: match.utcDate || null,
      venue: { name: match.venue || "", city: "" },
      status
    },
    teams: {
      home: { id: match.homeTeam?.id || null, name: homeName, logo: match.homeTeam?.crest || "", winner: match.score?.winner === "HOME_TEAM" },
      away: { id: match.awayTeam?.id || null, name: awayName, logo: match.awayTeam?.crest || "", winner: match.score?.winner === "AWAY_TEAM" }
    },
    goals: { home: homeGoals, away: awayGoals },
    score: {
      halftime: { home: numberOrNull(match.score?.halfTime?.home), away: numberOrNull(match.score?.halfTime?.away) },
      fulltime: { home: homeGoals, away: awayGoals },
      extratime: { home: numberOrNull(match.score?.extraTime?.home), away: numberOrNull(match.score?.extraTime?.away) },
      penalty: { home: numberOrNull(match.score?.penalties?.home), away: numberOrNull(match.score?.penalties?.away) }
    }
  };
}

function normalizeOpenFootballMatch(match) {
  if (!match) return null;
  const date = openFootballDateToISO(match.date, match.time);
  const homeGoals = firstNumber(match.score1, match.goals1, match.ft1, match.team1_score);
  const awayGoals = firstNumber(match.score2, match.goals2, match.ft2, match.team2_score);
  const hasScore = homeGoals !== null && awayGoals !== null;
  const status = hasScore ? { short: "FT", long: "Finished", elapsed: null } : { short: "NS", long: "Not Started", elapsed: null };
  return {
    fixture: {
      id: match.num || makeStableId(match),
      date,
      venue: { name: match.ground || "", city: match.ground || "" },
      status
    },
    teams: {
      home: { id: null, name: normalizeOpenFootballTeamName(match.team1), logo: "", winner: hasScore ? homeGoals > awayGoals : null },
      away: { id: null, name: normalizeOpenFootballTeamName(match.team2), logo: "", winner: hasScore ? awayGoals > homeGoals : null }
    },
    goals: { home: homeGoals, away: awayGoals },
    score: { fulltime: { home: homeGoals, away: awayGoals } }
  };
}

function applyManualOverride(fixture) {
  const home = normalizeText(fixture?.teams?.home?.name);
  const away = normalizeText(fixture?.teams?.away?.name);
  const date = String(fixture?.fixture?.date || "").slice(0, 10);

  // Temporary public-data patch until the chosen free provider publishes the final result.
  if (date === "2026-06-11" && home === "mexico" && away === "south africa") {
    fixture.fixture.status = { short: "FT", long: "Finished", elapsed: null };
    fixture.goals = { home: 2, away: 0 };
    fixture.score = { ...(fixture.score || {}), fulltime: { home: 2, away: 0 } };
    fixture.teams.home.winner = true;
    fixture.teams.away.winner = false;
  }
  return fixture;
}

function mapFootballDataStatus(status) {
  const value = String(status || "").toUpperCase();
  if (["IN_PLAY", "LIVE"].includes(value)) return { short: "LIVE", long: "Live", elapsed: null };
  if (["PAUSED"].includes(value)) return { short: "HT", long: "Half Time", elapsed: null };
  if (["FINISHED", "AWARDED"].includes(value)) return { short: "FT", long: "Finished", elapsed: null };
  if (["POSTPONED", "CANCELLED", "SUSPENDED"].includes(value)) return { short: "PST", long: value.replace(/_/g, " "), elapsed: null };
  return { short: "NS", long: value === "TIMED" ? "Scheduled" : "Not Started", elapsed: null };
}

function openFootballDateToISO(dateValue, timeValue) {
  const date = String(dateValue || "").trim();
  const rawTime = String(timeValue || "00:00 UTC+0").trim();
  const match = rawTime.match(/(\d{1,2}):(\d{2})\s*UTC\s*([+-]?\d{1,2})?/i);
  if (!date || !match) return date ? `${date}T00:00:00Z` : null;
  const hour = match[1].padStart(2, "0");
  const minute = match[2];
  const offsetNum = Number(match[3] || 0);
  const sign = offsetNum >= 0 ? "+" : "-";
  const offsetHour = String(Math.abs(offsetNum)).padStart(2, "0");
  return `${date}T${hour}:${minute}:00${sign}${offsetHour}:00`;
}

function cachePolicy(resource, body) {
  if (resource === "standings") return { cdnSeconds: 2 * 60 * 60, staleSeconds: 60 * 60 };
  if (resource === "coverage") return { cdnSeconds: 24 * 60 * 60, staleSeconds: 24 * 60 * 60 };
  if (resource === "events") return { cdnSeconds: 5 * 60, staleSeconds: 5 * 60 };

  const fixtures = Array.isArray(body?.payload?.response) ? body.payload.response : [];
  const active = hasActiveFixtureWindow(fixtures);
  return active
    ? { cdnSeconds: 5 * 60, staleSeconds: 60 }
    : { cdnSeconds: 20 * 60, staleSeconds: 5 * 60 };
}

function hasActiveFixtureWindow(fixtures) {
  const now = Date.now();
  return fixtures.some((item) => {
    const start = parseDateMs(item?.fixture?.date);
    const short = String(item?.fixture?.status?.short || "").toUpperCase();
    if (["LIVE", "1H", "2H", "HT", "ET", "BT", "P", "INT"].includes(short)) return true;
    return start && now >= start - 30 * 60 * 1000 && now <= start + 3 * 60 * 60 * 1000;
  });
}

function getQuery(req) {
  if (req.query) return req.query;
  const url = new URL(req.url, "http://localhost");
  return Object.fromEntries(url.searchParams.entries());
}

function setCacheHeaders(res, cdnSeconds, staleSeconds) {
  res.setHeader("Cache-Control", "public, max-age=60, must-revalidate");
  res.setHeader("CDN-Cache-Control", `public, s-maxage=${cdnSeconds}, stale-while-revalidate=${staleSeconds}`);
  res.setHeader("Vercel-CDN-Cache-Control", `public, s-maxage=${cdnSeconds}, stale-while-revalidate=${staleSeconds}`);
}

function setNoStore(res) {
  res.setHeader("Cache-Control", "no-store");
}

function readFootballDataQuota(headers) {
  return {
    minuteReset: headers.get("x-requestcounter-reset") || null,
    minuteRemaining: headers.get("x-requests-available-minute") || null
  };
}

function readApiFootballQuota(headers) {
  const quota = {};
  ["x-ratelimit-requests-limit", "x-ratelimit-requests-remaining", "x-ratelimit-requests-reset", "x-ratelimit-limit", "x-ratelimit-remaining"].forEach((name) => {
    const value = headers.get(name);
    if (value !== null) quota[toCamel(name.replace(/^x-ratelimit-/, ""))] = value;
  });
  return quota;
}

function extractApiFootballError(payload) {
  const errors = payload?.errors;
  if (!errors) return "";
  if (Array.isArray(errors) && errors.length) return errors.join("; ");
  if (typeof errors === "string" && errors.trim()) return errors.trim();
  if (typeof errors === "object") {
    const values = Object.values(errors).filter(Boolean).map(String);
    if (values.length) return values.join("; ");
  }
  return "";
}

function normalizeOpenFootballTeamName(value) {
  const name = String(value || "Team TBC").trim();
  const replacements = {
    "USA": "United States",
    "Turkey": "Türkiye",
    "Bosnia & Herzegovina": "Bosnia and Herzegovina",
    "South Korea": "Korea Republic",
    "Czech Republic": "Czechia",
    "Ivory Coast": "Côte d'Ivoire",
    "Cape Verde": "Cabo Verde"
  };
  return replacements[name] || name;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function firstNumber(...values) {
  for (const value of values) {
    const number = numberOrNull(value);
    if (number !== null) return number;
  }
  return null;
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function parseDateMs(value) {
  if (!value) return null;
  const date = new Date(String(value).trim().replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00"));
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

function makeStableId(match) {
  return Math.abs(hashCode(`${match.date}|${match.time}|${match.team1}|${match.team2}|${match.ground}`));
}

function hashCode(value) {
  let hash = 0;
  const str = String(value || "");
  for (let i = 0; i < str.length; i += 1) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash;
}

function toCamel(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}
