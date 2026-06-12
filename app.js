(() => {
  "use strict";

  const DATA = window.WC_DATA || { stadiums: [], matches: [], teams: {}, stages: [] };
  const stadiums = DATA.stadiums || [];
  const baseMatches = DATA.matches || [];
  let matches = baseMatches.map((match) => ({ ...match }));
  const teams = DATA.teams || {};
  const stages = DATA.stages || [];

  const FIFA_TO_ISO2 = {
    MEX: "mx", RSA: "za", KOR: "kr", CZE: "cz", CAN: "ca", BIH: "ba", QAT: "qa", SUI: "ch", BRA: "br", MAR: "ma",
    HAI: "ht", SCO: "gb-sct", USA: "us", PAR: "py", AUS: "au", TUR: "tr", GER: "de", CUR: "cw", CIV: "ci", ECU: "ec",
    NED: "nl", JPN: "jp", SWE: "se", TUN: "tn", BEL: "be", EGY: "eg", IRN: "ir", NZL: "nz", ESP: "es",
    CPV: "cv", KSA: "sa", URU: "uy", FRA: "fr", SEN: "sn", NOR: "no", ARG: "ar", ALG: "dz",
    AUT: "at", JOR: "jo", POR: "pt", UZB: "uz", COL: "co", ENG: "gb-eng", CRO: "hr", GHA: "gh",
    PAN: "pa", UAE: "ae", BOL: "bo", COD: "cd", IRQ: "iq", JAM: "jm", SUR: "sr", NCL: "nc"
  };

  const COUNTRY_TO_ISO2 = {
    "united states": "us", usa: "us", "mexico": "mx", "canada": "ca", "south africa": "za", "south korea": "kr",
    "czechia": "cz", "bosnia and herzegovina": "ba", "qatar": "qa", "switzerland": "ch", "brazil": "br", "morocco": "ma", "haiti": "ht", "scotland": "gb-sct",
    "paraguay": "py", "australia": "au", "turkiye": "tr", "turkey": "tr", "germany": "de", "curacao": "cw", "cote d ivoire": "ci",
    "ecuador": "ec", "netherlands": "nl", "japan": "jp", "sweden": "se", "tunisia": "tn", "belgium": "be", "egypt": "eg",
    "ir iran": "ir", "iran": "ir", "new zealand": "nz", "spain": "es", "cabo verde": "cv", "saudi arabia": "sa",
    "uruguay": "uy", "france": "fr", "senegal": "sn", "dr congo": "cd", "democratic republic of the congo": "cd", "norway": "no", "argentina": "ar", "algeria": "dz",
    "austria": "at", "jordan": "jo", "portugal": "pt", "iraq": "iq", "uzbekistan": "uz", "colombia": "co", "england": "gb-eng",
    "croatia": "hr", "ghana": "gh", "panama": "pa"
  };

  const els = {};
  const state = {
    map: null,
    view: "map",
    selectedId: null,
    hoveringId: null,
    filters: { search: "", country: "all", round: "all", team: "all" },
    filteredStadiumIds: new Set(stadiums.map((s) => s.id)),
    motionOk: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    activeBracketMatch: null,
    focusMatchNumber: null,
    live: {
      enabled: true,
      loading: false,
      ok: false,
      mode: "static",
      lastUpdated: null,
      quota: null,
      provider: "static",
      providerName: "Static dataset",
      timer: null,
      error: ""
    }
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    bindEls();
    applyTheme();
    populateFilters();
    bindEvents();
    renderLegend();
    renderMatchesView();
    renderBracketView();
    initMap();
    setView("map");
    setupLiveData();
  }

  function bindEls() {
    els.html = document.documentElement;
    els.mapStage = document.getElementById("mapStage");
    els.map = document.getElementById("map");
    els.hoverCard = document.getElementById("hoverCard");
    els.detailCard = document.getElementById("detailCard");
    els.filterPanel = document.getElementById("filterPanel");
    els.matchesView = document.getElementById("matchesView");
    els.bracketView = document.getElementById("bracketView");
    els.searchInput = document.getElementById("searchInput");
    els.countryFilter = document.getElementById("countryFilter");
    els.roundFilter = document.getElementById("roundFilter");
    els.teamFilter = document.getElementById("teamFilter");
    els.usCount = document.getElementById("usCount");
    els.mxCount = document.getElementById("mxCount");
    els.caCount = document.getElementById("caCount");
    els.mapHint = document.getElementById("mapHint");
    els.liveStatus = document.getElementById("liveStatus");
    els.refreshLive = document.getElementById("refreshLive");
  }

  function applyTheme() {
    const saved = localStorage.getItem("wc-theme") || DATA.meta?.defaultTheme || "dark";
    els.html.dataset.theme = saved === "light" ? "light" : "dark";
  }

  function bindEvents() {
    document.querySelectorAll("[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => setView(btn.dataset.view));
    });

    document.getElementById("homeButton")?.addEventListener("click", () => {
      closeAllCards();
      setView("map");
      fitHostBounds(true);
    });

    els.refreshLive?.addEventListener("click", () => {
      fetchLiveFixtures({ force: true });
    });

    document.getElementById("themeToggle")?.addEventListener("click", () => {
      const next = els.html.dataset.theme === "light" ? "dark" : "light";
      els.html.dataset.theme = next;
      localStorage.setItem("wc-theme", next);
      if (state.map) state.map.setStyle(makeMapStyle(next));
      state.map?.once("styledata", () => addMapLayers());
    });

    document.getElementById("filterToggle")?.addEventListener("click", toggleFilters);
    document.getElementById("mobileFilterToggle")?.addEventListener("click", toggleFilters);
    document.getElementById("closeFilters")?.addEventListener("click", closeFilters);
    document.getElementById("applyFilters")?.addEventListener("click", closeFilters);
    document.getElementById("clearFilters")?.addEventListener("click", clearFilters);

    [els.searchInput, els.countryFilter, els.roundFilter, els.teamFilter].forEach((el) => {
      el?.addEventListener("input", updateFiltersFromInputs);
      el?.addEventListener("change", updateFiltersFromInputs);
    });

    document.getElementById("zoomIn")?.addEventListener("click", () => state.map?.zoomIn({ duration: 450 }));
    document.getElementById("zoomOut")?.addEventListener("click", () => state.map?.zoomOut({ duration: 450 }));
    document.getElementById("resetMap")?.addEventListener("click", () => fitHostBounds(true));

    isolateOverlayScroll(els.detailCard);
    isolateOverlayScroll(els.filterPanel);
    isolateOverlayScroll(els.matchesView);
    isolateOverlayScroll(els.bracketView);

    els.matchesView?.addEventListener("click", onMatchesClick);
    els.matchesView?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        const card = event.target.closest("[data-focus-match]");
        if (card) {
          event.preventDefault();
          openMatchOnMap(Number(card.dataset.focusMatch));
        }
      }
    });
    els.bracketView?.addEventListener("click", onBracketClick);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeAllCards();
        closeFilters();
      }
    });

    window.addEventListener("resize", () => {
      state.map?.resize();
      if (state.selectedId) positionDetailAtStadium(state.selectedId);
    });
  }

  function initMap() {
    if (!window.maplibregl) {
      els.map.innerHTML = `<div class="empty-state" style="margin: 120px auto; max-width: 420px;">Map library did not load. Refresh the page or check the internet connection.</div>`;
      return;
    }

    state.map = new maplibregl.Map({
      container: "map",
      style: makeMapStyle(els.html.dataset.theme),
      center: [-101.5, 43.5],
      zoom: initialZoom(),
      minZoom: 0.25,
      maxZoom: 8,
      pitch: 0,
      bearing: 0,
      dragRotate: false,
      attributionControl: false,
      maxBounds: [[-178, 0], [-25, 78]]
    });

    state.map.touchZoomRotate.disableRotation();

    state.map.on("load", () => {
      addMapLayers();
      fitHostBounds(false);
    });

    state.map.on("styledata", () => {
      if (state.map.isStyleLoaded()) addMapLayers();
    });

    state.map.on("mousemove", "stadiums-hit", onPointMove);
    state.map.on("mouseleave", "stadiums-hit", onPointLeave);
    state.map.on("click", "stadiums-hit", onPointClick);

    state.map.on("mousemove", () => {
      if (state.map) state.map.getCanvas().style.cursor = "";
    });

    state.map.on("click", (event) => {
      const features = state.map.queryRenderedFeatures(event.point, { layers: ["stadiums-hit"] });
      if (!features.length) closeAllCards();
    });
  }

  function makeMapStyle(theme) {
    const light = theme === "light";
    const tileName = light ? "light_nolabels" : "dark_nolabels";
    return {
      version: 8,
      glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
      sources: {
        carto: {
          type: "raster",
          tiles: [
            `https://a.basemaps.cartocdn.com/${tileName}/{z}/{x}/{y}{r}.png`,
            `https://b.basemaps.cartocdn.com/${tileName}/{z}/{x}/{y}{r}.png`,
            `https://c.basemaps.cartocdn.com/${tileName}/{z}/{x}/{y}{r}.png`,
            `https://d.basemaps.cartocdn.com/${tileName}/{z}/{x}/{y}{r}.png`
          ],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors © CARTO"
        }
      },
      layers: [
        {
          id: "carto-base",
          type: "raster",
          source: "carto",
          paint: {
            "raster-opacity": light ? 0.96 : 0.90,
            "raster-saturation": light ? -0.52 : -0.72,
            "raster-contrast": light ? 0.04 : 0.16,
            "raster-brightness-min": 0,
            "raster-brightness-max": light ? 1 : 0.72
          }
        }
      ]
    };
  }

  function addMapLayers() {
    if (!state.map || !state.map.isStyleLoaded()) return;
    addRealBorders();
    addStadiumSourceAndLayers();
  }

  async function addRealBorders() {
    if (!window.topojson || state.map.getSource("host-borders")) return;
    try {
      const response = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json", { cache: "force-cache" });
      if (!response.ok) return;
      const topo = await response.json();
      const countries = window.topojson.feature(topo, topo.objects.countries);
      const names = { "124": "Canada", "484": "Mexico", "840": "United States" };
      const data = {
        type: "FeatureCollection",
        features: countries.features
          .filter((feature) => names[String(feature.id)])
          .map((feature) => ({ ...feature, properties: { country: names[String(feature.id)] } }))
      };
      if (state.map.getSource("host-borders")) return;
      state.map.addSource("host-borders", { type: "geojson", data });
      state.map.addLayer({
        id: "host-border-glow",
        type: "line",
        source: "host-borders",
        paint: {
          "line-color": els.html.dataset.theme === "light" ? "#9b7a36" : "#d8b35f",
          "line-opacity": 0.16,
          "line-width": ["interpolate", ["linear"], ["zoom"], 2, 0.7, 5, 1.4],
          "line-blur": 3
        }
      });
      state.map.addLayer({
        id: "host-border-line",
        type: "line",
        source: "host-borders",
        paint: {
          "line-color": els.html.dataset.theme === "light" ? "#18251e" : "#f4efe2",
          "line-opacity": els.html.dataset.theme === "light" ? 0.28 : 0.22,
          "line-width": ["interpolate", ["linear"], ["zoom"], 2, 0.35, 5, 0.8]
        }
      });
    } catch (_) {
      // Border layer is decorative. The real map still works if the CDN is offline.
    }
  }

  function addStadiumSourceAndLayers() {
    const data = stadiumGeoJSON();
    if (state.map.getSource("stadiums")) {
      state.map.getSource("stadiums").setData(data);
      return;
    }
    state.map.addSource("stadiums", { type: "geojson", data });

    state.map.addLayer({
      id: "stadiums-glow",
      type: "circle",
      source: "stadiums",
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 10, 5, 20, 8, 34],
        "circle-color": ["get", "color"],
        "circle-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 0.36, 0.16],
        "circle-blur": 0.78
      }
    });

    state.map.addLayer({
      id: "stadiums-ring",
      type: "circle",
      source: "stadiums",
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 5.8, 5, 8.5, 8, 13],
        "circle-color": "rgba(0,0,0,0)",
        "circle-stroke-color": ["case", ["boolean", ["feature-state", "selected"], false], "#f4efe2", ["get", "color"]],
        "circle-stroke-width": ["case", ["boolean", ["feature-state", "selected"], false], 2.6, 1.6],
        "circle-opacity": 0.95
      }
    });

    state.map.addLayer({
      id: "stadiums-core",
      type: "circle",
      source: "stadiums",
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 3.5, 5, 5.4, 8, 8],
        "circle-color": ["get", "color"],
        "circle-stroke-color": "#f4efe2",
        "circle-stroke-width": 1.4,
        "circle-opacity": 1
      }
    });

    state.map.addLayer({
      id: "stadiums-hit",
      type: "circle",
      source: "stadiums",
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 18, 5, 24, 8, 32],
        "circle-color": "rgba(255,255,255,0)",
        "circle-opacity": 0
      }
    });
  }

  function stadiumGeoJSON() {
    const features = getFilteredStadiums().map((stadium) => ({
      type: "Feature",
      id: stadium.id,
      properties: {
        id: stadium.id,
        city: stadium.city,
        venue: stadium.venue,
        country: stadium.country,
        color: stadiumColor(stadium),
        liveStatus: stadiumLiveStatus(stadium.id),
        matches: stadium.totalMatches
      },
      geometry: { type: "Point", coordinates: [stadium.lng, stadium.lat] }
    }));
    return { type: "FeatureCollection", features };
  }

  function onPointMove(event) {
    if (!event.features?.length || state.selectedId) return;
    const id = event.features[0].properties.id;
    const stadium = getStadium(id);
    if (!stadium) return;
    state.hoveringId = id;
    state.map.getCanvas().style.cursor = "pointer";
    renderHoverCard(stadium, event.originalEvent.clientX, event.originalEvent.clientY);
  }

  function onPointLeave() {
    state.hoveringId = null;
    state.map.getCanvas().style.cursor = "";
    hideHoverCard();
  }

  function onPointClick(event) {
    if (!event.features?.length) return;
    event.preventDefault();
    const id = event.features[0].properties.id;
    const stadium = getStadium(id);
    if (!stadium) return;
    hideHoverCard();
    setSelectedFeature(id);
    openDetailCard(stadium, event.originalEvent.clientX, event.originalEvent.clientY, null);
    flyToStadium(stadium, { source: "map" });
  }

  function setSelectedFeature(id) {
    if (state.selectedId && state.map?.getSource("stadiums")) {
      try { state.map.setFeatureState({ source: "stadiums", id: state.selectedId }, { selected: false }); } catch (_) {}
    }
    state.selectedId = id;
    if (id && state.map?.getSource("stadiums")) {
      try { state.map.setFeatureState({ source: "stadiums", id }, { selected: true }); } catch (_) {}
    }
  }

  function renderHoverCard(stadium, x, y) {
    const next = getNextMatch(stadium.id);
    els.hoverCard.innerHTML = cardHTML(stadium, next, false);
    els.hoverCard.classList.remove("hidden");
    positionCard(els.hoverCard, x + 18, y + 18);
  }

  function openDetailCard(stadium, x, y, focusMatchNumber = null) {
    const next = getNextMatch(stadium.id);
    const stadiumMatches = getStadiumMatches(stadium.id);
    state.focusMatchNumber = focusMatchNumber;
    els.detailCard.innerHTML = cardHTML(stadium, next, true, stadiumMatches, focusMatchNumber);
    els.detailCard.classList.remove("hidden");
    els.detailCard.scrollTop = 0;
    const detailScroll = els.detailCard.querySelector(".detail-scroll");
    if (detailScroll) detailScroll.scrollTop = 0;
    els.detailCard.querySelector(".card-close")?.addEventListener("click", closeAllCards);
    positionCard(els.detailCard, x + 18, y + 18);
    els.mapHint.textContent = `${stadium.city} selected`;
  }

  function positionDetailAtStadium(id) {
    const stadium = getStadium(id);
    if (!stadium || !state.map) return;
    const point = state.map.project([stadium.lng, stadium.lat]);
    const rect = els.mapStage.getBoundingClientRect();
    positionCard(els.detailCard, rect.left + point.x + 18, rect.top + point.y + 18);
  }

  function positionCard(card, clientX, clientY) {
    if (window.innerWidth < 760 && card === els.detailCard) return;
    const stageRect = els.mapStage.getBoundingClientRect();
    const width = card.offsetWidth || 380;
    const height = Math.min(card.offsetHeight || 360, window.innerHeight - 40);
    const margin = 16;
    let x = clientX - stageRect.left;
    let y = clientY - stageRect.top;

    if (x + width + margin > stageRect.width) x = x - width - 36;
    if (y + height + margin > stageRect.height) y = stageRect.height - height - margin;
    if (x < margin) x = margin;
    if (y < margin) y = margin;

    card.style.left = `${Math.round(x)}px`;
    card.style.top = `${Math.round(y)}px`;
    card.style.right = "auto";
    card.style.bottom = "auto";
  }

  function cardHTML(stadium, next, detail, stadiumMatches = [], focusMatchNumber = null) {
    const computedStatus = stadiumLiveStatus(stadium.id);
    const focused = focusMatchNumber ? getMatch(focusMatchNumber) : null;
    const primary = focused || next;
    const primaryLabel = focused ? "Selected match" : "Next match";
    return `
      <div class="venue-strip" data-code="${escapeHTML(stadium.airportCode || stadium.city.slice(0, 3).toUpperCase())}"></div>
      <div class="card-body">
        <div class="card-topline">
          <div>
            <span class="eyebrow country-eyebrow">${flagMarkup(stadium.countryFlag, stadium.country, stadium.countryCode)} ${escapeHTML(stadium.country)}</span>
            <h2 class="card-title">${escapeHTML(stadium.venue)}</h2>
            <p class="card-sub">${escapeHTML(stadium.city)} · ${escapeHTML(stadium.region)} region</p>
          </div>
          ${detail ? `<button type="button" class="card-close" aria-label="Close">×</button>` : ""}
        </div>
        <div class="stats">
          <div class="stat"><b>${formatNumber(stadium.capacity)}</b><span>Capacity</span></div>
          <div class="stat"><b>${stadium.totalMatches}</b><span>Games</span></div>
          <div class="stat"><b>${escapeHTML(computedStatus)}</b><span>Status</span></div>
        </div>
        <div class="next-match primary-match ${focused ? "selected-primary" : ""}">
          <small>${primaryLabel}</small>
          ${primary ? `<strong>${matchTeams(primary)} ${matchScoreHTML(primary)}</strong><span>${matchStatusHTML(primary)} ${formatDate(primary.kickoff)} · ${escapeHTML(primary.stage)}</span>` : `<strong>No match listed</strong><span>Dataset has no game for this venue</span>`}
        </div>
      </div>
      ${detail ? `<div class="detail-scroll"><div class="match-list">${stadiumMatches.map((match) => matchRowHTML(match, focusMatchNumber)).join("")}</div></div>` : ""}
    `;
  }

  function matchRowHTML(match, focusMatchNumber = null) {
    const focused = Number(match.matchNumber) === Number(focusMatchNumber);
    return `
      <article class="match-row ${focused ? "focused" : ""}" data-focus-match="${escapeHTML(match.matchNumber)}">
        <div class="match-no">M${match.matchNumber}</div>
        <div class="match-teams">${matchTeams(match)}</div>
        <div class="match-meta">${matchStatusHTML(match)} ${matchScoreHTML(match)}<br>${escapeHTML(match.stage)}<br>${formatDate(match.kickoff)}</div>
      </article>
    `;
  }

  function matchTeams(match) {
    if (match?.homeTeam && match?.awayTeam) {
      return `${teamHTML(match.homeTeam)} <span class="versus">vs</span> ${teamHTML(match.awayTeam)}`;
    }
    const parts = splitMatchLabel(match?.label || match?.display || "Teams TBC");
    if (parts.length === 2) {
      return `${placeholderHTML(parts[0])} <span class="versus">vs</span> ${placeholderHTML(parts[1])}`;
    }
    return escapeHTML(match?.label || match?.display || "Teams TBC");
  }

  function teamHTML(team) {
    const name = team?.name || team?.code || "Team TBC";
    return `<span class="team-chip">${flagMarkup(team?.flag || "🏳️", name, team?.code)}<span>${escapeHTML(name)}</span></span>`;
  }

  function placeholderHTML(token) {
    const parsed = parseParticipantToken(token);
    return `<span class="team-chip placeholder-team"><span class="code-badge">${escapeHTML(parsed.code)}</span>${escapeHTML(parsed.short)}</span>`;
  }

  function explainMatchLabel(label) {
    const parts = splitMatchLabel(label);
    if (parts.length !== 2) return escapeHTML(label || "Teams TBC");
    return `${escapeHTML(parseParticipantToken(parts[0]).long)} vs ${escapeHTML(parseParticipantToken(parts[1]).long)}`;
  }

  function splitMatchLabel(label) {
    return String(label || "")
      .replace(/3RD\s+/gi, "3")
      .split(/\s+vs\s+/i)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  function parseParticipantToken(rawToken) {
    const raw = String(rawToken || "").trim().replace(/3RD\s+/i, "3");
    const token = raw.replace(/[\/\s]/g, "");
    const groupRank = token.match(/^([123])([A-L]+)$/i);
    if (groupRank) {
      const rank = groupRank[1];
      const groups = groupRank[2].toUpperCase().split("");
      if (rank === "1") return { code: raw, short: `Winner Group ${groups[0]}`, long: `winner of Group ${groups[0]}` };
      if (rank === "2") return { code: raw, short: `Runner-up Group ${groups[0]}`, long: `runner-up of Group ${groups[0]}` };
      return { code: raw, short: `3rd place ${groups.join("/")}`, long: `one of the qualified third-place teams from Group ${groups.join("/")}` };
    }
    const winner = token.match(/^W(\d+)$/i);
    if (winner) return { code: raw, short: `Winner M${winner[1]}`, long: `winner of Match ${winner[1]}` };
    const loser = token.match(/^(?:L|RU)(\d+)$/i);
    if (loser) return { code: raw, short: `Loser M${loser[1]}`, long: `loser of Match ${loser[1]}` };
    const rd32 = token.match(/^RD32W(\d+)$/i);
    if (rd32) return { code: raw, short: `RD32 winner ${rd32[1]}`, long: `winner path ${rd32[1]} from the Round of 32` };
    const rd16 = token.match(/^RD16W(\d+)$/i);
    if (rd16) return { code: raw, short: `RD16 winner ${rd16[1]}`, long: `winner path ${rd16[1]} from the Round of 16` };
    const qf = token.match(/^QFW(\d+)$/i);
    if (qf) return { code: raw, short: `QF winner ${qf[1]}`, long: `winner path ${qf[1]} from the quarterfinals` };
    const sf = token.match(/^SFW(\d+)$/i);
    if (sf) return { code: raw, short: `SF winner ${sf[1]}`, long: `winner path ${sf[1]} from the semifinals` };
    return { code: raw || "TBC", short: raw || "Team TBC", long: raw || "team to be confirmed" };
  }

  function getFeederMatches(match) {
    const numbers = (match?.label || match?.display || "").match(/(?:W|L|RU)(\d+)/gi) || [];
    return numbers.map((token) => getMatch(token.match(/\d+/)?.[0])).filter(Boolean);
  }

  function getNextBracketMatch(matchNumber) {
    const pattern = new RegExp(`(?:^|\\b)(?:W|L|RU)${Number(matchNumber)}(?:\\b|$)`, "i");
    return matches
      .filter((m) => m.stageOrder > 1 && pattern.test(m.label || m.display || ""))
      .sort(compareMatchesChronological)[0] || null;
  }

  function onBracketClick(event) {
    const stageButton = event.target.closest("[data-bracket-stage]");
    if (stageButton) {
      state.activeBracketStage = stageButton.dataset.bracketStage;
      renderBracketView();
      return;
    }
    const node = event.target.closest("[data-match]");
    if (!node) return;
    const matchNumber = Number(node.dataset.match);
    if (!matchNumber) return;
    state.activeBracketMatch = matchNumber;
    const match = getMatch(matchNumber);
    if (match) state.activeBracketStage = match.stage;
    renderBracketView();
  }

  function onMatchesClick(event) {
    const card = event.target.closest("[data-focus-match]");
    if (!card) return;
    const matchNumber = Number(card.dataset.focusMatch);
    if (!matchNumber) return;
    openMatchOnMap(matchNumber);
  }

  function openMatchOnMap(matchNumber) {
    const match = getMatch(matchNumber);
    if (!match) return;
    const stadium = getStadium(match.stadiumId);
    if (!stadium) return;

    setView("map");
    closeFilters();
    hideHoverCard();
    setSelectedFeature(stadium.id);
    state.focusMatchNumber = matchNumber;
    els.mapHint.textContent = `M${match.matchNumber} · ${stadium.city}`;

    flyToStadium(stadium, { source: "match" });

    window.setTimeout(() => {
      const point = state.map?.project([stadium.lng, stadium.lat]);
      const rect = els.mapStage.getBoundingClientRect();
      const x = point ? rect.left + point.x + 18 : window.innerWidth * 0.52;
      const y = point ? rect.top + point.y + 18 : window.innerHeight * 0.28;
      openDetailCard(stadium, x, y, matchNumber);
    }, state.motionOk ? 360 : 0);
  }

  function flyToStadium(stadium, options = {}) {
    if (!state.map || !stadium) return;
    const currentZoom = state.map.getZoom();
    const mobile = window.innerWidth < 760;
    const targetZoom = options.source === "match"
      ? (mobile ? 1.25 : 1.55)
      : Math.min(Math.max(currentZoom, mobile ? 0.85 : 1.0), mobile ? 1.15 : 1.35);
    state.map.flyTo({
      center: [stadium.lng, stadium.lat],
      zoom: targetZoom,
      duration: state.motionOk ? 850 : 0,
      essential: true
    });
  }

  function hideHoverCard() {
    els.hoverCard.classList.add("hidden");
  }

  function closeAllCards() {
    hideHoverCard();
    els.detailCard.classList.add("hidden");
    els.mapHint.textContent = "Hover a stadium point";
    state.focusMatchNumber = null;
    setSelectedFeature(null);
  }

  function toggleFilters() {
    closeAllCards();
    const hidden = els.filterPanel.classList.toggle("hidden");
    document.getElementById("filterToggle")?.setAttribute("aria-expanded", String(!hidden));
  }

  function closeFilters() {
    els.filterPanel.classList.add("hidden");
    document.getElementById("filterToggle")?.setAttribute("aria-expanded", "false");
  }

  function clearFilters() {
    els.searchInput.value = "";
    els.countryFilter.value = "all";
    els.roundFilter.value = "all";
    els.teamFilter.value = "all";
    updateFiltersFromInputs();
  }

  function updateFiltersFromInputs() {
    state.filters.search = els.searchInput.value.trim().toLowerCase();
    state.filters.country = els.countryFilter.value;
    state.filters.round = els.roundFilter.value;
    state.filters.team = els.teamFilter.value;
    state.filteredStadiumIds = new Set(getFilteredStadiums().map((s) => s.id));
    closeAllCards();
    if (state.map?.getSource("stadiums")) state.map.getSource("stadiums").setData(stadiumGeoJSON());
    renderMatchesView();
    renderLegend();
  }


  function setupLiveData() {
    updateLiveStatusBadge();
    fetchLiveFixtures({ force: false });
    const intervalMs = DATA.meta?.liveRefreshMs || 20 * 60 * 1000;
    state.live.timer = window.setInterval(() => fetchLiveFixtures({ force: false }), intervalMs);
  }

  async function fetchLiveFixtures({ force = false } = {}) {
    if (state.live.loading) return;
    state.live.loading = true;
    updateLiveStatusBadge(force ? "Refreshing…" : undefined);
    try {
      const url = `/api/worldcup?resource=fixtures${force ? "&fresh=1" : ""}`;
      const response = await fetch(url, { headers: { "Accept": "application/json" } });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || json.ok === false) {
        throw new Error(json.message || json.error || `Live API failed (${response.status})`);
      }
      const payload = json.payload || json;
      const apiError = extractApiError(payload) || json.message || "";
      const fixtures = Array.isArray(payload.response) ? payload.response : [];
      if (apiError || fixtures.length === 0) {
        throw new Error(apiError || "API returned no 2026 fixtures on this plan. Static data is being used.");
      }
      mergeLiveFixtures(fixtures);
      state.live.ok = true;
      state.live.mode = "live";
      state.live.lastUpdated = json.fetchedAt || new Date().toISOString();
      state.live.quota = json.quota || null;
      state.live.provider = json.provider || payload.provider || "free-data";
      state.live.providerName = json.providerName || payload.provider || "Free data";
      state.live.error = json.message || "";
      rerenderAfterLiveUpdate();
    } catch (error) {
      state.live.ok = false;
      state.live.mode = "static";
      state.live.error = error.message || "Live API unavailable";
      matches = baseMatches.map((match) => ({ ...match }));
      rerenderAfterLiveUpdate();
      updateLiveStatusBadge();
      // The website remains fully functional from the static dataset / manual results.
    } finally {
      state.live.loading = false;
      updateLiveStatusBadge();
    }
  }


  function extractApiError(payload) {
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

  function mergeLiveFixtures(fixtures) {
    if (!fixtures.length) return;
    const fixtureIndex = buildFixtureIndex(fixtures);
    matches = baseMatches.map((base) => {
      const fixture = findFixtureForMatch(base, fixtureIndex);
      return fixture ? mergeMatchWithFixture(base, fixture) : { ...base };
    });
  }

  function buildFixtureIndex(fixtures) {
    const byTeamDay = new Map();
    const byVenueDay = new Map();
    fixtures.forEach((fixture) => {
      const home = normalizeTeamName(fixture?.teams?.home?.name);
      const away = normalizeTeamName(fixture?.teams?.away?.name);
      const day = dayKey(fixture?.fixture?.date);
      const venue = normalizeText(fixture?.fixture?.venue?.name || fixture?.fixture?.venue?.city);
      if (day && home && away) {
        byTeamDay.set(`${day}|${home}|${away}`, fixture);
        byTeamDay.set(`${day}|${away}|${home}`, fixture);
      }
      if (day && venue) {
        const key = `${day}|${venue}`;
        if (!byVenueDay.has(key)) byVenueDay.set(key, []);
        byVenueDay.get(key).push(fixture);
      }
    });
    return { byTeamDay, byVenueDay };
  }

  function findFixtureForMatch(match, index) {
    const day = dayKey(match.kickoff);
    const home = normalizeTeamName(match.homeTeam?.name);
    const away = normalizeTeamName(match.awayTeam?.name);
    if (day && home && away) {
      const byTeams = index.byTeamDay.get(`${day}|${home}|${away}`) || index.byTeamDay.get(`${day}|${away}|${home}`);
      if (byTeams) return byTeams;
    }
    const stadium = getStadium(match.stadiumId);
    const venueKeys = [stadium?.venue, stadium?.city].map(normalizeText).filter(Boolean);
    for (const keyPart of venueKeys) {
      const candidates = index.byVenueDay.get(`${day}|${keyPart}`) || [];
      if (candidates.length === 1) return candidates[0];
      const exact = candidates.find((fixture) => {
        const apiHome = normalizeTeamName(fixture?.teams?.home?.name);
        const apiAway = normalizeTeamName(fixture?.teams?.away?.name);
        return home && away && ((home === apiHome && away === apiAway) || (home === apiAway && away === apiHome));
      });
      if (exact) return exact;
    }
    return null;
  }

  function mergeMatchWithFixture(base, fixture) {
    const status = fixture?.fixture?.status || {};
    const goals = fixture?.goals || {};
    const homeTeam = apiTeamToLocal(fixture?.teams?.home, base.homeTeam);
    const awayTeam = apiTeamToLocal(fixture?.teams?.away, base.awayTeam);
    return {
      ...base,
      apiFixtureId: fixture?.fixture?.id || base.apiFixtureId,
      kickoff: fixture?.fixture?.date || base.kickoff,
      homeTeam,
      awayTeam,
      homeTeamId: homeTeam?.id ?? base.homeTeamId,
      awayTeamId: awayTeam?.id ?? base.awayTeamId,
      display: homeTeam && awayTeam ? `${homeTeam.name} vs ${awayTeam.name}` : base.display,
      status: mapApiStatus(status.short || status.long),
      statusShort: status.short || base.statusShort || "NS",
      statusLabel: status.long || base.statusLabel || "Scheduled",
      elapsed: status.elapsed ?? null,
      goalsHome: numberOrNull(goals.home),
      goalsAway: numberOrNull(goals.away),
      score: fixture?.score || null,
      hasLiveData: true,
      winner: fixture?.teams?.home?.winner ? "home" : fixture?.teams?.away?.winner ? "away" : null,
      apiUpdatedAt: new Date().toISOString()
    };
  }

  function apiTeamToLocal(apiTeam, fallback) {
    if (!apiTeam?.name && fallback) return fallback;
    const byName = findTeamByName(apiTeam?.name);
    return {
      ...(fallback || {}),
      ...(byName || {}),
      id: byName?.id ?? fallback?.id ?? apiTeam?.id ?? null,
      name: byName?.name || apiTeam?.name || fallback?.name || "Team TBC",
      code: byName?.code || fallback?.code || makeCode(apiTeam?.name),
      flag: byName?.flag || fallback?.flag || flagForTeamName(apiTeam?.name) || "🏳️",
      logo: apiTeam?.logo || fallback?.logo || "",
      winner: Boolean(apiTeam?.winner)
    };
  }

  function mapApiStatus(status) {
    const short = String(status || "").toUpperCase();
    if (["1H", "2H", "ET", "BT", "P", "LIVE", "INT"].includes(short)) return "live";
    if (short === "HT") return "halftime";
    if (["FT", "AET", "PEN"].includes(short)) return "finished";
    if (["PST", "CANC", "ABD", "SUSP"].includes(short)) return "postponed";
    return "upcoming";
  }

  function rerenderAfterLiveUpdate() {
    if (state.map?.getSource("stadiums")) state.map.getSource("stadiums").setData(stadiumGeoJSON());
    renderMatchesView();
    renderBracketView();
    renderLegend();
    if (state.selectedId) {
      const stadium = getStadium(state.selectedId);
      if (stadium) openDetailCard(stadium, window.innerWidth / 2, window.innerHeight / 2);
    }
  }

  function updateLiveStatusBadge(label) {
    if (!els.liveStatus) return;
    if (label) {
      els.liveStatus.textContent = label;
      els.liveStatus.dataset.state = "loading";
      return;
    }
    if (state.live.ok) {
      const remaining = state.live.quota?.remaining ?? state.live.quota?.requestsRemaining ?? state.live.quota?.minuteRemaining ?? null;
      const provider = state.live.providerName || "Free data";
      const label = state.live.provider === "openfootball" ? "Free public data" : state.live.provider === "football-data" ? "Free scores" : "Live data";
      els.liveStatus.textContent = remaining === null ? label : `${label} · ${remaining} left`;
      els.liveStatus.title = `${provider}. Last update: ${formatLiveUpdated(state.live.lastUpdated)}${state.live.error ? ` — ${state.live.error}` : ""}`;
      els.liveStatus.dataset.state = "live";
    } else {
      const blocked = /free plans do not have access|no 2026 fixtures|no fixtures|restricted|forbidden/i.test(state.live.error || "");
      els.liveStatus.textContent = blocked ? "Static · API locked" : "Static mode";
      els.liveStatus.title = state.live.error || "Static dataset shown until live API data is available.";
      els.liveStatus.dataset.state = "static";
    }
  }

  function formatLiveUpdated(value) {
    const date = parseMatchDate(value);
    if (!date) return "not yet";
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short"
    }).format(date);
  }

  function matchComputedStatus(match) {
    const apiStatus = match?.status || "upcoming";
    const short = String(match?.statusShort || "").toUpperCase();
    const label = String(match?.statusLabel || "").toLowerCase();
    const kickoff = parseMatchDate(match?.kickoff);
    const now = Date.now();
    const start = kickoff ? kickoff.getTime() : null;
    const stage = String(match?.stage || "").toLowerCase();
    const isKnockout = /(round of|quarter|semi|third|final)/.test(stage);

    const explicitLive = ["1H", "2H", "ET", "BT", "P", "LIVE", "INT"].includes(short) || apiStatus === "live";
    const explicitHalf = short === "HT" || apiStatus === "halftime";
    const explicitFinished = ["FT", "AET", "PEN"].includes(short) || /finished|after extra time|penalties/.test(label) || apiStatus === "finished";
    const explicitPostponed = ["PST", "CANC", "ABD", "SUSP"].includes(short) || ["postponed", "cancelled", "abandoned", "suspended"].some((word) => label.includes(word)) || apiStatus === "postponed";

    // Hard safety windows. These prevent a stale API/cache response from showing LIVE
    // long after the match should already have ended. Time is absolute, so this behaves
    // the same in KSA, USA, Mexico, Canada, or anywhere else.
    const normalHardEndMs = 2 * 60 * 60 * 1000 + 45 * 60 * 1000; // 2h 45m
    const knockoutHardEndMs = 4 * 60 * 60 * 1000; // ET + penalties + delay buffer
    const hardEndMs = isKnockout ? knockoutHardEndMs : normalHardEndMs;
    const hardPastEnd = start !== null && now > start + hardEndMs;
    const beforeKickoff = start !== null && now < start;

    if (explicitPostponed) return "postponed";
    if (explicitFinished) return "finished";

    // If an API response says LIVE but the absolute match window has clearly passed,
    // do not keep the UI glowing live. Mark it finished if we have a score/winner;
    // otherwise mark it pending so the user knows we are waiting for API confirmation.
    if (hardPastEnd && (explicitLive || explicitHalf)) {
      return hasScoreOrWinner(match) ? "finished" : "awaiting";
    }

    if (explicitHalf) return hardPastEnd ? (hasScoreOrWinner(match) ? "finished" : "awaiting") : "halftime";
    if (explicitLive) return beforeKickoff ? "upcoming" : "live";

    if (!kickoff) return apiStatus || "upcoming";
    if (beforeKickoff) return "upcoming";

    // No explicit live API status: do NOT invent LIVE from the clock.
    // This avoids wrong states when the free API/cache is delayed.
    if (hardPastEnd) return hasScoreOrWinner(match) ? "finished" : "awaiting";
    return "awaiting";
  }

  function hasScoreOrWinner(match) {
    return match?.winner || (match?.goalsHome !== null && match?.goalsHome !== undefined && match?.goalsAway !== null && match?.goalsAway !== undefined);
  }

  function computedStatusLabel(match) {
    const status = matchComputedStatus(match);
    if (["live", "halftime"].includes(status)) {
      if (match?.elapsed) return `${status === "halftime" ? "HT" : "LIVE"} ${match.elapsed}'`;
      return status === "halftime" ? "HT" : "LIVE";
    }
    if (status === "finished") return "FT";
    if (status === "awaiting") return "Result pending";
    if (status === "postponed") return match?.statusLabel || "Postponed";
    return match?.statusLabel || "Scheduled";
  }

  function isLive(match) {
    return ["live", "halftime"].includes(matchComputedStatus(match));
  }

  function isFinished(match) {
    return matchComputedStatus(match) === "finished";
  }

  function matchStatusHTML(match) {
    const status = matchComputedStatus(match);
    const label = computedStatusLabel(match);
    return `<span class="status-pill ${escapeHTML(status)}">${escapeHTML(label)}</span>`;
  }

  function matchScoreHTML(match) {
    if (match?.goalsHome === null || match?.goalsHome === undefined || match?.goalsAway === null || match?.goalsAway === undefined) return "";
    return `<span class="score-pill">${escapeHTML(match.goalsHome)} - ${escapeHTML(match.goalsAway)}</span>`;
  }

  function stadiumLiveStatus(stadiumId) {
    const stadiumMatches = getStadiumMatches(stadiumId);
    if (stadiumMatches.some(isLive)) return "live";
    if (stadiumMatches.some((m) => m.stage === "Final")) return "final";
    if (stadiumMatches.some((m) => m.stageOrder > 1 && !isFinished(m))) return "knockout";
    if (stadiumMatches.length && stadiumMatches.every(isFinished)) return "finished";
    return "upcoming";
  }

  function normalizeTeamName(value) {
    return normalizeText(value).replace(/^usa$/i, "united states").replace(/^u\.s\.a\.$/i, "united states");
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function findTeamByName(name) {
    const normalized = normalizeTeamName(name);
    return Object.values(teams).find((team) => normalizeTeamName(team.name) === normalized || normalizeTeamName(team.code) === normalized);
  }

  function makeCode(name) {
    return String(name || "TBC").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "TBC";
  }

  function flagForTeamName(name) {
    return findTeamByName(name)?.flag || "🏳️";
  }

  function flagMarkup(flag, label = "flag", code = "") {
    const safeFlag = String(flag || "🏳️");
    const iso2 = iso2FromCodeOrFlag(code, safeFlag, label);
    const url = iso2 ? `https://flagcdn.com/w40/${iso2}.png` : twemojiFlagUrl(safeFlag);
    const img = url ? `<img src="${url}" alt="${escapeHTML(label)} flag" loading="lazy" decoding="async" onerror="this.remove()">` : "";
    return `<span class="flag flag-render" title="${escapeHTML(label)}"><span class="flag-fallback">${escapeHTML(safeFlag)}</span>${img}</span>`;
  }

  function iso2FromCodeOrFlag(code, flag, label) {
    const direct = FIFA_TO_ISO2[String(code || "").toUpperCase()] || COUNTRY_TO_ISO2[normalizeText(label)];
    if (direct) return direct;
    const chars = Array.from(String(flag || ""));
    const codes = chars.map((char) => char.codePointAt(0));
    if (codes.length >= 2 && codes.every((value) => value >= 0x1F1E6 && value <= 0x1F1FF)) {
      return String.fromCharCode(...codes.map((value) => value - 0x1F1E6 + 65)).toLowerCase();
    }
    return "";
  }

  function twemojiFlagUrl(flag) {
    const chars = Array.from(String(flag || "")).filter((char) => char.trim() !== "");
    if (chars.length < 2) return null;
    const codes = chars.map((char) => char.codePointAt(0));
    const regionalIndicators = codes.every((code) => code >= 0x1F1E6 && code <= 0x1F1FF);
    if (!regionalIndicators) return null;
    const file = codes.map((code) => code.toString(16)).join("-");
    return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${file}.svg`;
  }

  function isolateOverlayScroll(element) {
    if (!element) return;
    ["wheel", "touchstart", "touchmove"].forEach((eventName) => {
      element.addEventListener(eventName, (event) => event.stopPropagation(), { passive: true });
    });
  }

  function numberOrNull(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function populateFilters() {
    unique(stadiums.map((s) => s.country)).forEach((country) => addOption(els.countryFilter, country, country));
    stages.slice().sort((a, b) => a.order - b.order).forEach((stage) => addOption(els.roundFilter, stage.name, stage.name));
    Object.values(teams)
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((team) => addOption(els.teamFilter, String(team.id), `${team.flag} ${team.name}`));
  }

  function addOption(select, value, label) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }

  function setView(view) {
    state.view = view;
    closeAllCards();
    closeFilters();
    document.querySelectorAll("[data-view]").forEach((btn) => btn.classList.toggle("active", btn.dataset.view === view));
    els.matchesView.classList.toggle("hidden", view !== "matches");
    els.bracketView.classList.toggle("hidden", view !== "bracket");
    els.mapStage.style.pointerEvents = view === "map" ? "auto" : "none";
    if (view === "map") setTimeout(() => state.map?.resize(), 50);
  }

  function renderLegend() {
    const filtered = getFilteredStadiums();
    els.usCount.textContent = filtered.filter((s) => s.country === "United States").length;
    els.mxCount.textContent = filtered.filter((s) => s.country === "Mexico").length;
    els.caCount.textContent = filtered.filter((s) => s.country === "Canada").length;
  }

  function renderMatchesView() {
    const filteredMatches = getFilteredMatches();
    const grouped = groupBy(filteredMatches, (match) => dayKey(match.kickoff));
    const days = Array.from(grouped.keys()).sort((a, b) => dayTime(a) - dayTime(b));
    els.matchesView.innerHTML = `
      <div class="view-title">
        <div><span class="eyebrow">Schedule</span><h2>Matches</h2></div>
        <p>${filteredMatches.length} matches · chronological</p>
      </div>
      <div class="schedule-timeline">
        ${days.map((day) => `<section class="schedule-day">
          <div class="day-label"><span>${formatDayTitle(day)}</span><strong>${grouped.get(day).length} matches</strong></div>
          <div class="matches-grid">
            ${grouped.get(day).map(matchCardHTML).join("")}
          </div>
        </section>`).join("") || `<div class="empty-state">No matches match the current filters.</div>`}
      </div>`;
  }

  function matchCardHTML(match) {
    const stadium = getStadium(match.stadiumId);
    const status = matchComputedStatus(match);
    return `<article class="match-card ${escapeHTML(status)}" data-focus-match="${escapeHTML(match.matchNumber)}" tabindex="0" role="button" aria-label="Show match ${escapeHTML(match.matchNumber)} on the map">
      <header><span>M${match.matchNumber}</span><span>${escapeHTML(match.stage)}</span></header>
      <h3>${matchTeams(match)}</h3>
      <div class="match-score-line">${matchScoreHTML(match) || `<span class="score-placeholder">Score TBC</span>`}</div>
      <div class="match-live-line">${matchStatusHTML(match)}</div>
      ${match.label && !match.homeTeam && !match.awayTeam ? `<p class="code-explain">${explainMatchLabel(match.label)}</p>` : ""}
      <div class="match-info-grid">
        <div><small>Kickoff</small><strong>${formatDate(match.kickoff)}</strong></div>
        <div><small>Venue</small><strong>${escapeHTML(stadium?.venue || "Venue TBC")}</strong></div>
        <div><small>City</small><strong>${escapeHTML(stadium?.city || "City TBC")}${stadium?.country ? ` · ${escapeHTML(stadium.country)}` : ""}</strong></div>
      </div>
      <button type="button" class="show-on-map" tabindex="-1">Show on map</button>
    </article>`;
  }

  function renderBracketView() {
    const knockoutStages = stages
      .filter((stage) => stage.order > 1)
      .sort((a, b) => a.order - b.order);
    const byStage = groupBy(matches.filter((m) => m.stageOrder > 1), (m) => m.stage);
    const firstStage = state.activeBracketStage || knockoutStages[0]?.name || "Round of 32";
    const nextKnockout = matches.filter((m) => m.stageOrder > 1).sort(compareMatchesChronological)[0];

    els.bracketView.innerHTML = `
      <div class="view-title bracket-title">
        <div><span class="eyebrow">Knockout path</span><h2>Bracket</h2></div>
        <p>Interactive · chronological by kickoff</p>
      </div>
      <div class="bracket-tabs" role="tablist" aria-label="Bracket rounds">
        ${knockoutStages.map((stage) => `<button type="button" class="${stage.name === firstStage ? "active" : ""}" data-bracket-stage="${escapeHTML(stage.name)}">${escapeHTML(stage.name)}</button>`).join("")}
      </div>
      ${nextKnockout ? `<div class="bracket-note">
        <strong>First knockout match:</strong> M${nextKnockout.matchNumber} · ${matchTeams(nextKnockout)} · ${formatDate(nextKnockout.kickoff)}
      </div>` : ""}
      <div class="bracket-shell">
        <div class="bracket-grid espn-style">
          ${knockoutStages.map((stage) => {
            const stageMatches = (byStage.get(stage.name) || []).slice().sort(compareMatchesChronological);
            return `<section class="bracket-col" data-stage-col="${escapeHTML(stage.name)}">
              <h3>${escapeHTML(stage.name)}</h3>
              ${stageMatches.map((match) => bracketNodeHTML(match)).join("")}
            </section>`;
          }).join("")}
        </div>
        <aside class="bracket-detail ${state.activeBracketMatch ? "" : "muted-detail"}" id="bracketDetail">
          ${state.activeBracketMatch ? bracketDetailHTML(getMatch(state.activeBracketMatch)) : `<span class="eyebrow">How to read</span><h3>Click any bracket card</h3><p>Codes like <b>1L</b>, <b>3EHIJK</b>, and <b>W79</b> are placeholders until the group stage and knockout winners are known.</p>`}
        </aside>
      </div>`;

    requestAnimationFrame(() => {
      const active = els.bracketView.querySelector(`[data-stage-col="${cssEscape(firstStage)}"]`);
      active?.scrollIntoView({ behavior: state.motionOk ? "smooth" : "auto", block: "nearest", inline: "start" });
    });
  }

  function bracketNodeHTML(match) {
    const active = state.activeBracketMatch === match.matchNumber;
    return `<article class="bracket-node ${match.stage === "Final" ? "final" : ""} ${active ? "selected" : ""}" data-match="${match.matchNumber}" tabindex="0" role="button" aria-label="Open match ${match.matchNumber}">
      <div class="node-top"><span>M${match.matchNumber}</span><span>${formatShortDate(match.kickoff)}</span></div>
      <div class="node-teams">${matchTeams(match)} ${matchScoreHTML(match)}</div>
      <div class="node-code">${matchStatusHTML(match)} ${escapeHTML(match.label || match.display || "Teams TBC")}</div>
      <div class="node-meta">${escapeHTML(getStadium(match.stadiumId)?.city || "City TBC")} · ${formatTime(match.kickoff)}</div>
    </article>`;
  }

  function bracketDetailHTML(match) {
    if (!match) return `<span class="eyebrow">Match</span><h3>Not found</h3>`;
    const stadium = getStadium(match.stadiumId);
    const feeds = getFeederMatches(match);
    const next = getNextBracketMatch(match.matchNumber);
    return `<span class="eyebrow">Selected match</span>
      <h3>M${match.matchNumber} · ${escapeHTML(match.stage)}</h3>
      <div class="detail-fixture">${matchTeams(match)} ${matchScoreHTML(match)}</div>
      <p>${matchStatusHTML(match)}</p>
      <p>${explainMatchLabel(match.label || match.display || "")}</p>
      <div class="detail-meta-grid">
        <div><small>Date</small><strong>${formatDate(match.kickoff)}</strong></div>
        <div><small>Venue</small><strong>${escapeHTML(stadium?.venue || "TBC")}</strong></div>
        <div><small>City</small><strong>${escapeHTML(stadium?.city || "TBC")}</strong></div>
        <div><small>Path</small><strong>${next ? `Winner goes to M${next.matchNumber}` : match.stage === "Final" ? "Champion decided" : "TBC"}</strong></div>
      </div>
      ${feeds.length ? `<div class="feeders"><small>Feeds from</small>${feeds.map((m) => `<button type="button" data-match="${m.matchNumber}">M${m.matchNumber}</button>`).join("")}</div>` : ""}`;
  }

  function getFilteredStadiums() {
    return stadiums.filter((stadium) => {
      const stadiumMatches = getStadiumMatches(stadium.id);
      if (state.filters.country !== "all" && stadium.country !== state.filters.country) return false;
      if (state.filters.round !== "all" && !stadiumMatches.some((m) => m.stage === state.filters.round)) return false;
      if (state.filters.team !== "all") {
        const teamId = Number(state.filters.team);
        if (!stadiumMatches.some((m) => m.homeTeamId === teamId || m.awayTeamId === teamId)) return false;
      }
      if (state.filters.search) {
        const haystack = [stadium.city, stadium.venue, stadium.country, stadium.region, ...stadiumMatches.flatMap((m) => [m.stage, m.label, m.homeTeam?.name, m.awayTeam?.name])]
          .filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(state.filters.search)) return false;
      }
      return true;
    });
  }

  function getFilteredMatches() {
    return matches.filter((match) => {
      const stadium = getStadium(match.stadiumId);
      if (!stadium) return false;
      if (state.filters.country !== "all" && stadium.country !== state.filters.country) return false;
      if (state.filters.round !== "all" && match.stage !== state.filters.round) return false;
      if (state.filters.team !== "all") {
        const teamId = Number(state.filters.team);
        if (match.homeTeamId !== teamId && match.awayTeamId !== teamId) return false;
      }
      if (state.filters.search) {
        const haystack = [stadium.city, stadium.venue, stadium.country, match.stage, match.label, match.display, match.homeTeam?.name, match.awayTeam?.name]
          .filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(state.filters.search)) return false;
      }
      return true;
    }).sort(compareMatchesChronological);
  }

  function getStadium(id) {
    return stadiums.find((s) => s.id === id || String(s.cityId) === String(id));
  }

  function getMatch(matchNumber) {
    return matches.find((m) => Number(m.matchNumber) === Number(matchNumber));
  }

  function getStadiumMatches(stadiumId) {
    return matches.filter((m) => m.stadiumId === stadiumId).sort(compareMatchesChronological);
  }

  function getNextMatch(stadiumId) {
    const stadiumMatches = getStadiumMatches(stadiumId);
    return stadiumMatches.find((match) => !isFinished(match)) || stadiumMatches[stadiumMatches.length - 1] || null;
  }

  function compareMatchesChronological(a, b) {
    const byDate = matchTimeMs(a) - matchTimeMs(b);
    if (byDate !== 0) return byDate;
    return Number(a.matchNumber || 0) - Number(b.matchNumber || 0);
  }

  function matchTimeMs(match) {
    const date = parseMatchDate(match?.kickoff);
    return date ? date.getTime() : Number.MAX_SAFE_INTEGER;
  }

  function initialZoom() {
    // Production default: wide enough to see the full host region immediately.
    return window.innerWidth < 760 ? 0.05 : 0.35;
  }

  function fitHostBounds(animate) {
    if (!state.map) return;
    const mobile = window.innerWidth < 760;
    // Keep the whole North American host context visible on load/reset.
    state.map.easeTo({
      center: mobile ? [-104, 45] : [-103, 44],
      zoom: mobile ? 0.16 : 0.42,
      bearing: 0,
      pitch: 0,
      duration: animate && state.motionOk ? 900 : 0,
      essential: true
    });
  }

  function countryColor(country) {
    if (country === "Mexico") return "#d8a236";
    if (country === "Canada") return "#ff2f8c";
    return "#ff715f";
  }

  function stadiumColor(stadium) {
    const status = stadiumLiveStatus(stadium.id);
    if (status === "live") return "#2de2ff";
    if (status === "final") return "#ffd76b";
    if (status === "knockout") return "#d8b35f";
    if (status === "finished") return els.html.dataset.theme === "light" ? "#6b6f66" : "#8d8a7e";
    return countryColor(stadium.country);
  }

  function formatNumber(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return "TBC";
    return Number(value).toLocaleString("en-US");
  }

  function normalizeDateInput(value) {
    if (!value) return "";
    return String(value)
      .trim()
      .replace(" ", "T")
      .replace(/([+-]\d{2})$/, "$1:00");
  }

  function parseMatchDate(value) {
    if (!value) return null;
    const normalized = normalizeDateInput(value);
    const date = new Date(normalized);
    if (!Number.isNaN(date.getTime())) return date;
    return null;
  }

  function getViewerTimeZone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "local time";
  }

  function formatDate(value) {
    const date = parseMatchDate(value);
    if (!date) return value ? escapeHTML(String(value)) : "Date TBC";
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short"
    }).format(date);
  }

  function formatTime(value) {
    const date = parseMatchDate(value);
    if (!date) return value ? escapeHTML(String(value)) : "Time TBC";
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short"
    }).format(date);
  }

  function formatShortDate(value) {
    const date = parseMatchDate(value);
    if (!date) return value ? escapeHTML(String(value)) : "TBC";
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
  }

  function localDateKeyFromDate(date) {
    const parts = new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date).reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  function dayKey(value) {
    const date = parseMatchDate(value);
    if (!date) return "TBC";
    return localDateKeyFromDate(date);
  }

  function dayTime(day) {
    const date = new Date(`${day}T00:00:00`);
    return Number.isNaN(date.getTime()) ? Number.MAX_SAFE_INTEGER : date.getTime();
  }

  function formatDayTitle(day) {
    if (day === "TBC") return "Date TBC";
    const date = new Date(`${day}T00:00:00`);
    if (Number.isNaN(date.getTime())) return day;
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(date);
  }

  function cssEscape(value) {
    if (window.CSS?.escape) return window.CSS.escape(value);
    return String(value).replace(/"/g, '\\"');
  }

  function unique(list) {
    return Array.from(new Set(list.filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b)));
  }

  function groupBy(list, fn) {
    const map = new Map();
    list.forEach((item) => {
      const key = fn(item);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });
    return map;
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }
})();
