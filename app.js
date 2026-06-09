(() => {
  "use strict";

  const DATA = window.WC_DATA || { stadiums: [], matches: [], teams: {}, stages: [] };
  const stadiums = DATA.stadiums || [];
  const matches = DATA.matches || [];
  const teams = DATA.teams || {};
  const stages = DATA.stages || [];

  const els = {};
  const state = {
    map: null,
    view: "map",
    selectedId: null,
    hoveringId: null,
    filters: { search: "", country: "all", round: "all", team: "all" },
    filteredStadiumIds: new Set(stadiums.map((s) => s.id)),
    motionOk: !window.matchMedia("(prefers-reduced-motion: reduce)").matches
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
      center: [-99.2, 39.3],
      zoom: initialZoom(),
      minZoom: 2.1,
      maxZoom: 8,
      pitch: 0,
      bearing: 0,
      dragRotate: false,
      attributionControl: false,
      maxBounds: [[-145, 10], [-48, 64]]
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
        color: countryColor(stadium.country),
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
    openDetailCard(stadium, event.originalEvent.clientX, event.originalEvent.clientY);
    const currentZoom = state.map.getZoom();
    state.map.flyTo({
      center: [stadium.lng, stadium.lat],
      zoom: Math.max(currentZoom, window.innerWidth < 760 ? 3.75 : 4.05),
      duration: state.motionOk ? 850 : 0,
      essential: true
    });
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

  function openDetailCard(stadium, x, y) {
    const next = getNextMatch(stadium.id);
    const stadiumMatches = getStadiumMatches(stadium.id);
    els.detailCard.innerHTML = cardHTML(stadium, next, true, stadiumMatches);
    els.detailCard.classList.remove("hidden");
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

  function cardHTML(stadium, next, detail, stadiumMatches = []) {
    return `
      <div class="venue-strip" data-code="${escapeHTML(stadium.airportCode || stadium.city.slice(0, 3).toUpperCase())}"></div>
      <div class="card-body">
        <div class="card-topline">
          <div>
            <span class="eyebrow">${escapeHTML(stadium.countryFlag)} ${escapeHTML(stadium.country)}</span>
            <h2 class="card-title">${escapeHTML(stadium.venue)}</h2>
            <p class="card-sub">${escapeHTML(stadium.city)} · ${escapeHTML(stadium.region)} region</p>
          </div>
          ${detail ? `<button type="button" class="card-close" aria-label="Close">×</button>` : ""}
        </div>
        <div class="stats">
          <div class="stat"><b>${formatNumber(stadium.capacity)}</b><span>Capacity</span></div>
          <div class="stat"><b>${stadium.totalMatches}</b><span>Games</span></div>
          <div class="stat"><b>${escapeHTML(stadium.status)}</b><span>Status</span></div>
        </div>
        <div class="next-match">
          <small>Next match</small>
          ${next ? `<strong>${matchTeams(next)}</strong><span>${formatDate(next.kickoff)} · ${escapeHTML(next.stage)}</span>` : `<strong>No match listed</strong><span>Dataset has no game for this venue</span>`}
        </div>
      </div>
      ${detail ? `<div class="detail-scroll"><div class="match-list">${stadiumMatches.map(matchRowHTML).join("")}</div></div>` : ""}
    `;
  }

  function matchRowHTML(match) {
    return `
      <article class="match-row">
        <div class="match-no">M${match.matchNumber}</div>
        <div class="match-teams">${matchTeams(match)}</div>
        <div class="match-meta">${escapeHTML(match.stage)}<br>${formatDate(match.kickoff)}</div>
      </article>
    `;
  }

  function matchTeams(match) {
    if (match.homeTeam && match.awayTeam) {
      return `${escapeHTML(match.homeTeam.flag)} ${escapeHTML(match.homeTeam.name)} <span style="color:var(--muted)">vs</span> ${escapeHTML(match.awayTeam.flag)} ${escapeHTML(match.awayTeam.name)}`;
    }
    return escapeHTML(match.label || match.display || "Teams TBC");
  }

  function hideHoverCard() {
    els.hoverCard.classList.add("hidden");
  }

  function closeAllCards() {
    hideHoverCard();
    els.detailCard.classList.add("hidden");
    els.mapHint.textContent = "Hover a stadium point";
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
    els.matchesView.innerHTML = `
      <div class="view-title">
        <div><span class="eyebrow">Schedule</span><h2>Matches</h2></div>
        <p>${filteredMatches.length} matches</p>
      </div>
      <div class="matches-grid">
        ${filteredMatches.map((match) => {
          const stadium = getStadium(match.stadiumId);
          return `<article class="match-card">
            <header><span>M${match.matchNumber}</span><span>${escapeHTML(match.stage)}</span></header>
            <h3>${matchTeams(match)}</h3>
            <p>${formatDate(match.kickoff)}<br>${escapeHTML(stadium?.venue || "Venue TBC")} · ${escapeHTML(stadium?.city || "City TBC")}</p>
          </article>`;
        }).join("") || `<div class="empty-state">No matches match the current filters.</div>`}
      </div>`;
  }

  function renderBracketView() {
    const byStage = groupBy(matches, (m) => m.stage);
    const stageList = stages.slice().sort((a, b) => a.order - b.order);
    els.bracketView.innerHTML = `
      <div class="view-title">
        <div><span class="eyebrow">Knockout path</span><h2>Bracket</h2></div>
        <p>Dataset stages</p>
      </div>
      <div class="bracket-grid">
        ${stageList.map((stage) => {
          const stageMatches = byStage.get(stage.name) || [];
          return `<section class="bracket-col">
            <h3>${escapeHTML(stage.name)}</h3>
            ${stageMatches.map((match) => `<article class="bracket-node ${stage.name === "Final" ? "final" : ""}">
              <div class="match-no">M${match.matchNumber}</div>
              <div class="match-teams">${matchTeams(match)}</div>
              <p class="card-sub">${formatDate(match.kickoff)}</p>
            </article>`).join("")}
          </section>`;
        }).join("")}
      </div>`;
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
        const haystack = [stadium.city, stadium.venue, stadium.country, match.stage, match.label, match.homeTeam?.name, match.awayTeam?.name]
          .filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(state.filters.search)) return false;
      }
      return true;
    }).sort((a, b) => a.matchNumber - b.matchNumber);
  }

  function getStadium(id) {
    return stadiums.find((s) => s.id === id || String(s.cityId) === String(id));
  }

  function getStadiumMatches(stadiumId) {
    return matches.filter((m) => m.stadiumId === stadiumId).sort((a, b) => a.matchNumber - b.matchNumber);
  }

  function getNextMatch(stadiumId) {
    return getStadiumMatches(stadiumId)[0] || null;
  }

  function initialZoom() {
    return window.innerWidth < 760 ? 2.35 : 2.82;
  }

  function fitHostBounds(animate) {
    if (!state.map || !stadiums.length) return;
    const bounds = new maplibregl.LngLatBounds();
    stadiums.forEach((s) => bounds.extend([s.lng, s.lat]));
    state.map.fitBounds(bounds, {
      padding: window.innerWidth < 760 ? { top: 110, right: 28, bottom: 110, left: 28 } : { top: 120, right: 110, bottom: 95, left: 110 },
      duration: animate && state.motionOk ? 900 : 0,
      maxZoom: window.innerWidth < 760 ? 3.25 : 3.85
    });
  }

  function countryColor(country) {
    if (country === "Mexico") return "#d8a236";
    if (country === "Canada") return "#ff2f8c";
    return "#ff715f";
  }

  function formatNumber(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return "TBC";
    return Number(value).toLocaleString("en-US");
  }

  function formatDate(value) {
    if (!value) return "Date TBC";
    const normalized = String(value).replace(/([+-]\d{2})$/, "$1:00");
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return escapeHTML(String(value));
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
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
