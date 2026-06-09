(() => {
  "use strict";

  const DATA = window.WC_DATA || fallbackData();
  const stadiums = Array.isArray(DATA.stadiums) ? DATA.stadiums : [];
  const matches = Array.isArray(DATA.matches) ? DATA.matches : [];
  const teams = DATA.teams || {};
  const stageOrder = DATA.stages || [];

  const els = {};
  const state = {
    map: null,
    activeView: "map",
    selectedId: null,
    hoverId: null,
    markerObjects: new Map(),
    labelObjects: new Map(),
    countryLabelObjects: [],
    filters: {
      search: "",
      country: "all",
      status: "all",
      round: "all",
      team: "all"
    },
    three: {
      ok: false,
      renderer: null,
      scene: null,
      camera: null,
      sprites: new Map(),
      particles: null,
      raf: null,
      clock: 0
    },
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    cardPosition: { x: 0, y: 0 }
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    bindElements();
    applySavedTheme();
    populateFilters();
    bindEvents();
    renderLegend();
    renderMatchesView();
    renderBracketView();
    initMap();
    setView("map");
  }

  function bindElements() {
    els.html = document.documentElement;
    els.app = document.getElementById("app");
    els.mapStage = document.getElementById("mapStage");
    els.map = document.getElementById("map");
    els.leaderLayer = document.getElementById("leaderLayer");
    els.hoverCard = document.getElementById("hoverCard");
    els.detailCard = document.getElementById("detailCard");
    els.filterPanel = document.getElementById("filterPanel");
    els.matchesView = document.getElementById("matchesView");
    els.bracketView = document.getElementById("bracketView");
    els.threeCanvas = document.getElementById("three-bg");
    els.searchInput = document.getElementById("searchInput");
    els.countryFilter = document.getElementById("countryFilter");
    els.statusFilter = document.getElementById("statusFilter");
    els.roundFilter = document.getElementById("roundFilter");
    els.teamFilter = document.getElementById("teamFilter");
  }

  function applySavedTheme() {
    const saved = localStorage.getItem("wc-map-theme") || DATA.meta?.defaultTheme || "dark";
    els.html.dataset.theme = saved === "light" ? "light" : "dark";
  }

  function initMap() {
    if (!window.maplibregl) {
      showFatalMapMessage("MapLibre did not load. Check your internet connection and refresh.");
      return;
    }

    state.map = new maplibregl.Map({
      container: "map",
      style: makeMapStyle(currentTheme()),
      center: [-99.5, 39.2],
      zoom: initialZoom(),
      minZoom: 2.25,
      maxZoom: 9,
      bearing: 0,
      pitch: 0,
      dragRotate: false,
      touchZoomRotate: true,
      maxBounds: [[-143.5, 12.5], [-50.0, 61.8]],
      attributionControl: false
    });

    state.map.touchZoomRotate.disableRotation();
    state.map.keyboard.enable();

    state.map.on("load", () => {
      addMapLayers();
      renderCountryWatermarks();
      renderStadiumLayer();
      renderRoutes();
      fitHostBounds(false);
      initThreeLayer();
      updateLeaderLines();
    });

    state.map.on("move", syncMapOverlays);
    state.map.on("zoom", syncMapOverlays);
    state.map.on("resize", syncMapOverlays);
    state.map.on("click", (event) => {
      if (!event.originalEvent.target.closest(".stadium-marker, .stadium-label, .floating-card, .panel, .topbar, .mobile-tabs, .control-stack")) {
        closeDetailCard();
      }
    });
  }

  function makeMapStyle(theme) {
    const isLight = theme === "light";
    const tileName = isLight ? "light_nolabels" : "dark_nolabels";
    const opacity = isLight ? 0.94 : 0.88;
    const saturation = isLight ? -0.55 : -0.72;
    const contrast = isLight ? 0.05 : 0.18;
    const brightnessMax = isLight ? 1.0 : 0.76;

    return {
      version: 8,
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
            "raster-opacity": opacity,
            "raster-saturation": saturation,
            "raster-contrast": contrast,
            "raster-brightness-min": 0,
            "raster-brightness-max": brightnessMax
          }
        }
      ]
    };
  }

  function addMapLayers() {
    if (!state.map || !state.map.isStyleLoaded()) return;

    addRealCountryBorders();

    if (!state.map.getSource("routes")) {
      state.map.addSource("routes", { type: "geojson", data: routesGeoJSON() });
      state.map.addLayer({
        id: "route-lines-shadow",
        type: "line",
        source: "routes",
        paint: {
          "line-color": "#000000",
          "line-opacity": 0.18,
          "line-width": 3.2,
          "line-blur": 4
        }
      });
      state.map.addLayer({
        id: "route-lines",
        type: "line",
        source: "routes",
        paint: {
          "line-color": ["match", ["get", "route"], "west", "#25ddff", "mexico-central", "#d9b25f", "east", "#006dff", "#d9b25f"],
          "line-opacity": ["interpolate", ["linear"], ["zoom"], 2.2, 0.16, 4.2, 0.36, 7, 0.50],
          "line-width": ["interpolate", ["linear"], ["zoom"], 2, 0.55, 6, 1.35],
          "line-dasharray": [1.1, 2.8]
        }
      });
    }
  }

  async function addRealCountryBorders() {
    if (!state.map || state.map.getSource("host-country-borders")) return;

    try {
      let data = null;
      if (window.topojson) {
        const response = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json", { cache: "force-cache" });
        if (!response.ok) throw new Error(`Country border request failed: ${response.status}`);
        const topo = await response.json();
        const countries = window.topojson.feature(topo, topo.objects.countries);
        const names = { "124": "Canada", "484": "Mexico", "840": "United States" };
        data = {
          type: "FeatureCollection",
          features: countries.features
            .filter((feature) => Object.prototype.hasOwnProperty.call(names, String(feature.id)))
            .map((feature) => ({
              ...feature,
              properties: { ...(feature.properties || {}), country: names[String(feature.id)] }
            }))
        };
      }

      if (!data || !data.features?.length || state.map.getSource("host-country-borders")) return;

      state.map.addSource("host-country-borders", { type: "geojson", data });
      state.map.addLayer({
        id: "host-country-border-glow",
        type: "line",
        source: "host-country-borders",
        paint: {
          "line-color": ["match", ["get", "country"], "United States", "#e66d55", "Mexico", "#d9a232", "Canada", "#2aa8ff", "#d9b25f"],
          "line-opacity": ["interpolate", ["linear"], ["zoom"], 2, 0.20, 4.5, 0.34, 8, 0.22],
          "line-width": ["interpolate", ["linear"], ["zoom"], 2, 2.0, 5, 3.2, 8, 2.2],
          "line-blur": 5
        }
      });
      state.map.addLayer({
        id: "host-country-border-core",
        type: "line",
        source: "host-country-borders",
        paint: {
          "line-color": ["match", ["get", "country"], "United States", "#e66d55", "Mexico", "#d9a232", "Canada", "#2aa8ff", "#d9b25f"],
          "line-opacity": ["interpolate", ["linear"], ["zoom"], 2, 0.38, 4.5, 0.58, 8, 0.42],
          "line-width": ["interpolate", ["linear"], ["zoom"], 2, 0.55, 5, 1.1, 8, 1.6]
        }
      });
    } catch (error) {
      console.warn("Real country borders could not be loaded. The basemap borders are still visible.", error);
    }
  }

  function routesGeoJSON() {
    const features = [];
    const routeGroups = DATA.routes || [
      ["vancouver", "seattle", "san-francisco", "los-angeles"],
      ["guadalajara", "mexico-city", "monterrey", "dallas", "houston", "kansas-city"],
      ["toronto", "boston", "new-york-new-jersey", "philadelphia", "atlanta", "miami"]
    ];
    const routeNames = ["west", "mexico-central", "east"];
    routeGroups.forEach((route, index) => {
      route.forEach((id, i) => {
        const a = findStadium(id);
        const b = findStadium(route[i + 1]);
        if (!a || !b) return;
        features.push({
          type: "Feature",
          properties: { route: routeNames[index] || `route-${index}` },
          geometry: { type: "LineString", coordinates: curvedLngLat(a, b, index % 2 ? -0.22 : 0.22) }
        });
      });
    });
    return { type: "FeatureCollection", features };
  }

  function curvedLngLat(a, b, bend) {
    const steps = 34;
    const coords = [];
    const dx = b.lng - a.lng;
    const dy = b.lat - a.lat;
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const curve = Math.sin(Math.PI * t) * bend;
      const lng = a.lng + dx * t + (-dy) * curve;
      const lat = a.lat + dy * t + dx * curve * 0.18;
      coords.push([lng, lat]);
    }
    return coords;
  }

  function renderRoutes() {
    if (!state.map || !state.map.getSource("routes")) return;
    state.map.getSource("routes").setData(routesGeoJSON());
  }

  function renderCountryWatermarks() {
    removeCountryWatermarks();
    const labels = [
      { text: "CANADA", lng: -98, lat: 55.5, className: "country-watermark" },
      { text: "UNITED STATES", lng: -98, lat: 38.8, className: "country-watermark" },
      { text: "MEXICO", lng: -102, lat: 22.3, className: "country-watermark" },
      { text: "UTC-8 PACIFIC", lng: -122.8, lat: 17.2, className: "timezone-label" },
      { text: "UTC-7 MOUNTAIN", lng: -111.5, lat: 17.2, className: "timezone-label" },
      { text: "UTC-6 CENTRAL", lng: -98.2, lat: 17.2, className: "timezone-label" },
      { text: "UTC-5 EASTERN", lng: -82.2, lat: 17.2, className: "timezone-label" }
    ];
    labels.forEach((label) => {
      const el = document.createElement("div");
      el.className = label.className;
      el.textContent = label.text;
      const marker = new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat([label.lng, label.lat]).addTo(state.map);
      state.countryLabelObjects.push(marker);
    });
  }

  function removeCountryWatermarks() {
    state.countryLabelObjects.forEach((marker) => marker.remove());
    state.countryLabelObjects = [];
  }

  function renderStadiumLayer() {
    removeStadiumLayer();
    const visible = visibleStadiums();

    visible.forEach((stadium) => {
      const status = stadiumStatus(stadium);
      const markerEl = createMarkerEl(stadium, status);
      const marker = new maplibregl.Marker({ element: markerEl, anchor: "center" })
        .setLngLat([stadium.lng, stadium.lat])
        .addTo(state.map);

      const labelEl = createLabelEl(stadium, status);
      const offset = labelOffset(stadium);
      const anchor = offset.anchor === "end" ? "right" : "left";
      const label = new maplibregl.Marker({ element: labelEl, anchor, offset: [offset.dx, offset.dy] })
        .setLngLat([stadium.lng, stadium.lat])
        .addTo(state.map);

      bindStadiumEvents(markerEl, stadium);
      bindStadiumEvents(labelEl, stadium);
      state.markerObjects.set(stadium.id, { marker, el: markerEl });
      state.labelObjects.set(stadium.id, { label, el: labelEl, offset });
    });

    requestAnimationFrame(() => {
      refreshLabelLayout();
      updateLeaderLines();
      updateThreePositions();
    });
  }

  function removeStadiumLayer() {
    state.markerObjects.forEach((item) => item.marker.remove());
    state.labelObjects.forEach((item) => item.label.remove());
    state.markerObjects.clear();
    state.labelObjects.clear();
    els.leaderLayer.innerHTML = "";
  }

  function createMarkerEl(stadium, status) {
    const el = document.createElement("button");
    el.type = "button";
    el.className = `stadium-marker ${countryClass(stadium.country)} status-${status}`;
    el.dataset.id = stadium.id;
    el.setAttribute("aria-label", `${stadium.city}, ${stadium.name}`);
    el.innerHTML = `<span class="marker-visual"><span class="marker-halo"></span><span class="marker-ring"></span><span class="marker-core"></span></span>`;
    return el;
  }

  function createLabelEl(stadium, status) {
    const games = stadiumMatches(stadium.id).length;
    const el = document.createElement("div");
    el.className = `stadium-label ${countryClass(stadium.country)} status-${status}`;
    el.dataset.id = stadium.id;
    el.innerHTML = `
      <span class="label-city">${escapeHTML(shortCity(stadium.city))}</span>
      <span class="label-meta">${escapeHTML(stadium.name)} · ${formatCapacity(stadium.capacity)} · ${games} games</span>
    `;
    return el;
  }

  function labelOffset(stadium) {
    const defaults = { dx: 36, dy: -14, anchor: "start" };
    const byId = {
      "vancouver": { dx: -250, dy: -48, anchor: "end" },
      "seattle": { dx: -238, dy: 36, anchor: "end" },
      "san-francisco": { dx: -248, dy: -12, anchor: "end" },
      "los-angeles": { dx: -238, dy: 38, anchor: "end" },
      "kansas-city": { dx: -258, dy: -20, anchor: "end" },
      "dallas": { dx: -250, dy: 18, anchor: "end" },
      "houston": { dx: 34, dy: 12, anchor: "start" },
      "monterrey": { dx: 34, dy: -16, anchor: "start" },
      "guadalajara": { dx: 32, dy: -38, anchor: "start" },
      "mexico-city": { dx: 34, dy: 28, anchor: "start" },
      "toronto": { dx: -246, dy: -36, anchor: "end" },
      "boston": { dx: 38, dy: -28, anchor: "start" },
      "new-york-new-jersey": { dx: 38, dy: 2, anchor: "start" },
      "philadelphia": { dx: 38, dy: 38, anchor: "start" },
      "atlanta": { dx: 38, dy: -16, anchor: "start" },
      "miami": { dx: 34, dy: -8, anchor: "start" }
    };
    const fromData = stadium.label || {};
    return { ...defaults, ...(byId[stadium.id] || {}), ...fromData };
  }

  function bindStadiumEvents(el, stadium) {
    el.addEventListener("pointerenter", (event) => {
      state.hoverId = stadium.id;
      setActiveStadium(stadium.id, true);
      refreshLabelLayout();
      updateLeaderLines();
      if (!state.selectedId) renderHoverCard(stadium, event.clientX, event.clientY);
    });
    el.addEventListener("pointermove", (event) => {
      if (!state.selectedId && state.hoverId === stadium.id) positionFloatingCard(els.hoverCard, event.clientX + 22, event.clientY + 18);
    });
    el.addEventListener("pointerleave", () => {
      state.hoverId = null;
      if (state.selectedId !== stadium.id) setActiveStadium(stadium.id, false);
      els.hoverCard.classList.add("hidden");
      refreshLabelLayout();
      updateLeaderLines();
    });
    el.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      selectStadium(stadium, event.clientX, event.clientY);
    });
    el.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const screen = screenPoint(stadium);
        selectStadium(stadium, screen.x, screen.y);
      }
    });
  }

  function setActiveStadium(id, active) {
    const marker = state.markerObjects.get(id);
    const label = state.labelObjects.get(id);
    marker?.el.classList.toggle("is-active", active);
    label?.el.classList.toggle("is-active", active);
  }

  function updateLeaderLines() {
    if (!state.map || !els.leaderLayer) return;
    const width = els.mapStage.clientWidth;
    const height = els.mapStage.clientHeight;
    els.leaderLayer.setAttribute("viewBox", `0 0 ${width} ${height}`);
    els.leaderLayer.innerHTML = "";

    visibleStadiums().forEach((stadium) => {
      const labelItem = state.labelObjects.get(stadium.id);
      if (!labelItem || labelItem.el.classList.contains("is-collapsed")) return;
      const p = state.map.project([stadium.lng, stadium.lat]);
      const o = labelItem.offset;
      const endX = p.x + o.dx;
      const endY = p.y + o.dy;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const midX = p.x + (endX - p.x) * 0.55;
      const d = `M ${p.x.toFixed(1)} ${p.y.toFixed(1)} C ${midX.toFixed(1)} ${p.y.toFixed(1)}, ${midX.toFixed(1)} ${endY.toFixed(1)}, ${endX.toFixed(1)} ${endY.toFixed(1)}`;
      line.setAttribute("d", d);
      line.setAttribute("class", `leader-line ${countryClass(stadium.country)}`);
      els.leaderLayer.appendChild(line);
    });
  }

  function refreshLabelLayout() {
    if (!state.map || !els.mapStage) return;
    const isPhone = window.matchMedia("(max-width: 560px)").matches;
    const zoom = state.map.getZoom();
    const accepted = [];
    const stageRect = els.mapStage.getBoundingClientRect();
    const items = visibleStadiums()
      .map((stadium) => {
        const item = state.labelObjects.get(stadium.id);
        if (!item?.el) return null;
        const active = stadium.id === state.selectedId || stadium.id === state.hoverId;
        const rect = item.el.getBoundingClientRect();
        const screen = screenPoint(stadium);
        const onscreen = screen.x > -80 && screen.x < window.innerWidth + 80 && screen.y > -80 && screen.y < window.innerHeight + 80;
        const importance = active ? 1000 : labelImportance(stadium);
        return { stadium, el: item.el, rect, active, onscreen, importance };
      })
      .filter(Boolean)
      .sort((a, b) => b.importance - a.importance);

    items.forEach((item) => {
      const shouldHideForScale = isPhone || zoom < 2.65 || !item.onscreen;
      let visible = item.active || !shouldHideForScale;

      if (visible && !item.active) {
        const inflated = inflateRect(item.rect, window.matchMedia("(max-width: 960px)").matches ? 12 : 8);
        visible = !accepted.some((rect) => rectsOverlap(inflated, rect));
        if (visible) accepted.push(inflated);
      }

      if (item.active) accepted.push(inflateRect(item.rect, 4));
      item.el.classList.toggle("is-collapsed", !visible);
      item.el.setAttribute("aria-hidden", visible ? "false" : "true");
    });
  }

  function labelImportance(stadium) {
    const games = stadiumMatches(stadium.id).length;
    const easternDensePenalty = ["boston", "new-york-new-jersey", "philadelphia"].includes(stadium.id) ? -1 : 0;
    const finalsBoost = stadiumStatus(stadium) === "final" ? 6 : 0;
    return games * 2 + finalsBoost + easternDensePenalty;
  }

  function inflateRect(rect, pad) {
    return { left: rect.left - pad, top: rect.top - pad, right: rect.right + pad, bottom: rect.bottom + pad };
  }

  function rectsOverlap(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }

  function renderHoverCard(stadium, x, y) {
    const games = stadiumMatches(stadium.id);
    const next = nextMatchForStadium(stadium.id);
    els.hoverCard.innerHTML = `
      ${mediaBlock(stadium)}
      <div class="card-body">
        <div class="card-kicker"><span>${stadium.countryFlag || ""} ${escapeHTML(stadium.country)}</span><span>${escapeHTML(stadium.region || "Host")}</span></div>
        <h2 class="card-title">${escapeHTML(stadium.name)}</h2>
        <p class="card-subtitle">${escapeHTML(stadium.city)} · ${escapeHTML(stadium.airportCode || "")}</p>
        <div class="stat-grid">
          <div class="stat"><span>Capacity</span><strong>${formatCapacity(stadium.capacity)}</strong></div>
          <div class="stat"><span>Games</span><strong>${games.length}</strong></div>
          <div class="stat"><span>Status</span><strong>${titleCase(stadiumStatus(stadium))}</strong></div>
        </div>
        ${next ? nextMatchBlock(next) : ""}
      </div>
    `;
    els.hoverCard.classList.remove("hidden");
    positionFloatingCard(els.hoverCard, x + 22, y + 18);
  }

  function selectStadium(stadium, clientX, clientY) {
    if (state.selectedId && state.selectedId !== stadium.id) {
      setActiveStadium(state.selectedId, false);
      els.detailCard.classList.add("hidden");
    }

    state.selectedId = stadium.id;
    state.hoverId = null;
    setActiveStadium(stadium.id, true);
    els.hoverCard.classList.add("hidden");
    renderDetailCard(stadium);

    const screen = screenPoint(stadium);
    state.cardPosition = { x: Number.isFinite(clientX) ? clientX : screen.x, y: Number.isFinite(clientY) ? clientY : screen.y };
    positionFloatingCard(els.detailCard, state.cardPosition.x + 26, state.cardPosition.y - 34);
    refreshLabelLayout();
    updateLeaderLines();

    const targetZoom = window.matchMedia("(max-width: 760px)").matches ? 3.55 : 3.92;
    if (state.map) {
      const afterMove = () => {
        updateDetailCardPosition();
        refreshLabelLayout();
        updateLeaderLines();
      };
      state.map.once("moveend", afterMove);
      state.map.flyTo({
        center: [stadium.lng, stadium.lat],
        zoom: Math.max(state.map.getZoom(), targetZoom),
        speed: state.reduceMotion ? 4 : 0.72,
        curve: 1.08,
        essential: true
      });
    }
  }

  function renderDetailCard(stadium) {
    const games = stadiumMatches(stadium.id);
    const next = nextMatchForStadium(stadium.id);
    els.detailCard.innerHTML = `
      <button type="button" class="close-btn" id="closeDetail" aria-label="Close stadium card">×</button>
      ${mediaBlock(stadium)}
      <div class="card-body">
        <div class="card-kicker"><span>${stadium.countryFlag || ""} ${escapeHTML(stadium.country)}</span><span>${escapeHTML(stadium.region || "Host")}</span></div>
        <h2 class="card-title">${escapeHTML(stadium.name)}</h2>
        <p class="card-subtitle">${escapeHTML(stadium.city)} · Capacity ${formatCapacity(stadium.capacity)} · ${games.length} matches</p>
        <div class="stat-grid">
          <div class="stat"><span>Airport</span><strong>${escapeHTML(stadium.airportCode || "TBC")}</strong></div>
          <div class="stat"><span>Weather</span><strong>${next?.weather || "TBC"}</strong></div>
          <div class="stat"><span>Status</span><strong>${titleCase(stadiumStatus(stadium))}</strong></div>
        </div>
        ${next ? nextMatchBlock(next) : ""}
        <div style="height:14px"></div>
        <div class="match-list">
          ${games.map(matchRow).join("")}
        </div>
      </div>
    `;
    els.detailCard.classList.remove("hidden");
    document.getElementById("closeDetail")?.addEventListener("click", closeDetailCard);
  }

  function closeDetailCard() {
    if (state.selectedId) setActiveStadium(state.selectedId, false);
    state.selectedId = null;
    els.detailCard.classList.add("hidden");
    refreshLabelLayout();
    updateLeaderLines();
  }

  function updateDetailCardPosition() {
    if (!state.selectedId || els.detailCard.classList.contains("hidden")) return;
    const stadium = findStadium(state.selectedId);
    if (!stadium) return;
    const screen = screenPoint(stadium);
    positionFloatingCard(els.detailCard, screen.x + 30, screen.y - 42);
  }

  function positionFloatingCard(card, x, y) {
    if (!card || (window.matchMedia("(max-width: 960px)").matches && card === els.detailCard)) return;
    const wasHidden = card.classList.contains("hidden");
    if (wasHidden) {
      card.style.visibility = "hidden";
      card.classList.remove("hidden");
    }
    const rect = card.getBoundingClientRect();
    const isDetail = card === els.detailCard;
    const safe = {
      left: 18,
      right: 18,
      top: isDetail ? 100 : 78,
      bottom: isDetail ? 26 : 18
    };
    const prefersLeft = x + rect.width + safe.right > window.innerWidth && x - rect.width - 36 > safe.left;
    const rawLeft = prefersLeft ? x - rect.width - 36 : x;
    const left = clamp(rawLeft, safe.left, window.innerWidth - rect.width - safe.right);
    const top = clamp(y, safe.top, window.innerHeight - rect.height - safe.bottom);
    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
    card.style.right = "auto";
    card.style.bottom = "auto";
    if (wasHidden) {
      card.classList.add("hidden");
      card.style.visibility = "";
    }
  }

  function mediaBlock(stadium) {
    const src = stadium.image || "";
    return `
      <div class="card-media" data-src="${escapeHTML(src)}">
        ${src ? `<img src="${escapeHTML(src)}" alt="${escapeHTML(stadium.name)}" onerror="this.parentElement.classList.remove('has-image'); this.remove();" onload="this.parentElement.classList.add('has-image');" />` : ""}
      </div>
    `;
  }

  function nextMatchBlock(match) {
    const a = team(match.teamA);
    const b = team(match.teamB);
    return `
      <div class="next-match">
        <small>Next match · ${escapeHTML(match.round)}</small>
        <strong>${a.flag} ${escapeHTML(a.name)} <span class="vs-pill">VS</span> ${b.flag} ${escapeHTML(b.name)}</strong>
        <time>${formatDate(match.date)} · Match ${match.matchNumber}</time>
      </div>
    `;
  }

  function matchRow(match) {
    const a = team(match.teamA);
    const b = team(match.teamB);
    return `
      <article class="match-row">
        <div class="match-topline"><span>Match ${match.matchNumber} · ${escapeHTML(match.label || match.round)}</span><span>${escapeHTML(matchStatus(match))}</span></div>
        <div class="versus">
          <span class="team-side">${a.flag} ${escapeHTML(a.name)}</span>
          <span class="vs-pill">VS</span>
          <span class="team-side" style="text-align:right">${b.flag} ${escapeHTML(b.name)}</span>
        </div>
        <div class="match-topline"><span>${formatDate(match.date)}</span><span>${escapeHTML(match.round)}</span></div>
      </article>
    `;
  }

  function syncMapOverlays() {
    refreshLabelLayout();
    updateLeaderLines();
    updateThreePositions();
    updateDetailCardPosition();
  }

  function initThreeLayer() {
    if (!window.THREE || !els.threeCanvas || !state.map) return;
    const THREE = window.THREE;
    const t = state.three;
    t.ok = true;
    t.scene = new THREE.Scene();
    t.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1000, 1000);
    t.renderer = new THREE.WebGLRenderer({ canvas: els.threeCanvas, alpha: true, antialias: true, premultipliedAlpha: false });
    t.renderer.setClearColor(0x000000, 0);
    t.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const particleTexture = makeGlowTexture();
    const geo = new THREE.BufferGeometry();
    const particleCount = window.matchMedia("(max-width: 760px)").matches ? 90 : 170;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * els.mapStage.clientWidth;
      positions[i * 3 + 1] = (Math.random() - 0.5) * els.mapStage.clientHeight;
      positions[i * 3 + 2] = -8 - Math.random() * 12;
      sizes[i] = 1 + Math.random() * 4;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    const mat = new THREE.PointsMaterial({
      map: particleTexture,
      color: currentTheme() === "light" ? 0x006dff : 0xd9b25f,
      transparent: true,
      opacity: currentTheme() === "light" ? 0.16 : 0.22,
      size: 3.2,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    t.particles = new THREE.Points(geo, mat);
    t.scene.add(t.particles);

    visibleStadiums().forEach((stadium) => addThreeSprite(stadium));
    resizeThree();
    updateThreePositions();
    if (!state.reduceMotion) animateThree();
    else t.renderer.render(t.scene, t.camera);
    window.addEventListener("resize", () => {
      resizeThree();
      updateThreePositions();
    });
  }

  function addThreeSprite(stadium) {
    if (!state.three.ok || !window.THREE || state.three.sprites.has(stadium.id)) return;
    const THREE = window.THREE;
    const texture = makeGlowTexture();
    const color = stadium.country === "Canada" ? 0x2aa8ff : stadium.country === "Mexico" ? 0xd9a232 : 0xe66d55;
    const material = new THREE.SpriteMaterial({
      map: texture,
      color,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(72, 72, 1);
    sprite.userData = { stadiumId: stadium.id, baseScale: stadiumStatus(stadium) === "final" ? 96 : 72 };
    state.three.scene.add(sprite);
    state.three.sprites.set(stadium.id, sprite);
  }

  function rebuildThreeSprites() {
    if (!state.three.ok) return;
    state.three.sprites.forEach((sprite) => state.three.scene.remove(sprite));
    state.three.sprites.clear();
    visibleStadiums().forEach((stadium) => addThreeSprite(stadium));
    updateThreePositions();
  }

  function updateThreePositions() {
    if (!state.three.ok || !state.map) return;
    const width = els.mapStage.clientWidth;
    const height = els.mapStage.clientHeight;
    state.three.sprites.forEach((sprite, id) => {
      const stadium = findStadium(id);
      if (!stadium || !isVisibleStadium(stadium)) {
        sprite.visible = false;
        return;
      }
      const p = state.map.project([stadium.lng, stadium.lat]);
      sprite.position.set(p.x - width / 2, height / 2 - p.y, -1);
      sprite.visible = p.x > -80 && p.x < width + 80 && p.y > -80 && p.y < height + 80;
    });
  }

  function resizeThree() {
    if (!state.three.ok) return;
    const width = Math.max(1, els.mapStage.clientWidth);
    const height = Math.max(1, els.mapStage.clientHeight);
    const t = state.three;
    t.camera.left = -width / 2;
    t.camera.right = width / 2;
    t.camera.top = height / 2;
    t.camera.bottom = -height / 2;
    t.camera.updateProjectionMatrix();
    t.renderer.setSize(width, height, false);
  }

  function animateThree() {
    const t = state.three;
    if (!t.ok) return;
    t.clock += 0.012;
    if (t.particles) {
      t.particles.rotation.z += 0.00045;
      const pos = t.particles.geometry.attributes.position;
      for (let i = 0; i < pos.count; i += 1) {
        const y = pos.getY(i) + Math.sin(t.clock + i) * 0.013;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }
    t.sprites.forEach((sprite, id) => {
      const stadium = findStadium(id);
      const selectedBoost = id === state.selectedId ? 1.34 : 1;
      const base = sprite.userData.baseScale || 72;
      const pulse = 1 + Math.sin(t.clock * 3.0 + id.length) * 0.10;
      sprite.scale.set(base * pulse * selectedBoost, base * pulse * selectedBoost, 1);
      sprite.material.opacity = id === state.selectedId ? 0.64 : stadiumStatus(stadium) === "final" ? 0.58 : 0.40;
    });
    t.renderer.render(t.scene, t.camera);
    t.raf = requestAnimationFrame(animateThree);
  }

  function makeGlowTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    const grd = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.24, "rgba(255,255,255,0.62)");
    grd.addColorStop(0.54, "rgba(255,255,255,0.18)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 128, 128);
    return new window.THREE.CanvasTexture(canvas);
  }

  function bindEvents() {
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => setView(button.dataset.view));
    });

    document.getElementById("filterToggle")?.addEventListener("click", toggleFilters);
    document.getElementById("mobileFilterToggle")?.addEventListener("click", toggleFilters);
    document.getElementById("closeFilters")?.addEventListener("click", () => els.filterPanel.classList.add("hidden"));
    document.getElementById("clearFilters")?.addEventListener("click", clearFilters);
    document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);
    document.getElementById("zoomIn")?.addEventListener("click", () => state.map?.zoomIn({ duration: 420 }));
    document.getElementById("zoomOut")?.addEventListener("click", () => state.map?.zoomOut({ duration: 420 }));
    document.getElementById("resetMap")?.addEventListener("click", () => fitHostBounds(true));

    [els.searchInput, els.countryFilter, els.statusFilter, els.roundFilter, els.teamFilter].forEach((field) => {
      field?.addEventListener("input", readFiltersAndRender);
      field?.addEventListener("change", readFiltersAndRender);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeDetailCard();
        els.filterPanel.classList.add("hidden");
      }
    });

    document.addEventListener("pointerdown", (event) => {
      const target = event.target;
      if (!target.closest("#filterPanel, #filterToggle, #mobileFilterToggle") && !els.filterPanel.classList.contains("hidden")) {
        els.filterPanel.classList.add("hidden");
      }
    });
  }

  function toggleFilters() {
    const willOpen = els.filterPanel.classList.contains("hidden");
    if (willOpen) closeDetailCard();
    els.filterPanel.classList.toggle("hidden");
  }

  function toggleTheme() {
    const next = currentTheme() === "dark" ? "light" : "dark";
    els.html.dataset.theme = next;
    localStorage.setItem("wc-map-theme", next);
    document.querySelector("meta[name='theme-color']")?.setAttribute("content", next === "dark" ? "#03130f" : "#f4edda");
    if (state.map) {
      state.map.setStyle(makeMapStyle(next));
      state.map.once("style.load", () => {
        addMapLayers();
        renderRoutes();
        renderCountryWatermarks();
      });
    }
    if (state.three.particles) {
      state.three.particles.material.color.set(next === "light" ? 0x006dff : 0xd9b25f);
      state.three.particles.material.opacity = next === "light" ? 0.16 : 0.22;
    }
  }

  function currentTheme() {
    return els.html?.dataset.theme === "light" ? "light" : "dark";
  }

  function setView(view) {
    state.activeView = view;
    document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
    els.matchesView.classList.toggle("hidden", view !== "matches");
    els.bracketView.classList.toggle("hidden", view !== "bracket");
    if (view !== "map") {
      closeDetailCard();
      els.hoverCard.classList.add("hidden");
      els.filterPanel.classList.add("hidden");
    }
    if (view === "map") {
      requestAnimationFrame(() => state.map?.resize());
    }
  }

  function populateFilters() {
    fillSelect(els.countryFilter, unique(stadiums.map((s) => s.country)).sort(), "All countries");
    fillSelect(els.statusFilter, ["upcoming", "live", "finished", "knockout", "final"], "All statuses", titleCase);
    fillSelect(els.roundFilter, unique(matches.map((m) => m.round)).filter(Boolean), "All rounds");
    const teamOptions = Object.keys(teams).map((code) => ({ value: code, label: `${teams[code].flag || ""} ${teams[code].name}` })).sort((a, b) => a.label.localeCompare(b.label));
    fillSelectObjects(els.teamFilter, teamOptions, "All teams");
  }

  function fillSelect(select, values, allLabel, formatter = (v) => v) {
    if (!select) return;
    select.innerHTML = `<option value="all">${escapeHTML(allLabel)}</option>` + values.map((value) => `<option value="${escapeHTML(value)}">${escapeHTML(formatter(value))}</option>`).join("");
  }

  function fillSelectObjects(select, values, allLabel) {
    if (!select) return;
    select.innerHTML = `<option value="all">${escapeHTML(allLabel)}</option>` + values.map((item) => `<option value="${escapeHTML(item.value)}">${escapeHTML(item.label)}</option>`).join("");
  }

  function readFiltersAndRender() {
    state.filters.search = (els.searchInput?.value || "").trim().toLowerCase();
    state.filters.country = els.countryFilter?.value || "all";
    state.filters.status = els.statusFilter?.value || "all";
    state.filters.round = els.roundFilter?.value || "all";
    state.filters.team = els.teamFilter?.value || "all";
    renderStadiumLayer();
    renderMatchesView();
    renderBracketView();
    rebuildThreeSprites();
    closeDetailCard();
  }

  function clearFilters() {
    if (els.searchInput) els.searchInput.value = "";
    [els.countryFilter, els.statusFilter, els.roundFilter, els.teamFilter].forEach((select) => { if (select) select.value = "all"; });
    readFiltersAndRender();
  }

  function visibleStadiums() {
    return stadiums.filter(isVisibleStadium);
  }

  function isVisibleStadium(stadium) {
    const f = state.filters;
    const games = stadiumMatches(stadium.id);
    if (f.country !== "all" && stadium.country !== f.country) return false;
    if (f.status !== "all" && stadiumStatus(stadium) !== f.status) return false;
    if (f.round !== "all" && !games.some((m) => m.round === f.round)) return false;
    if (f.team !== "all" && !games.some((m) => m.teamA === f.team || m.teamB === f.team)) return false;
    if (f.search) {
      const haystack = [stadium.name, stadium.city, stadium.country, stadium.region, stadium.airportCode, ...games.flatMap((m) => [team(m.teamA).name, team(m.teamB).name, m.label, m.round])].join(" ").toLowerCase();
      if (!haystack.includes(f.search)) return false;
    }
    return true;
  }

  function renderLegend() {
    const counts = stadiums.reduce((acc, s) => {
      acc[s.country] = (acc[s.country] || 0) + 1;
      return acc;
    }, {});
    const usCount = document.getElementById("usCount");
    const mxCount = document.getElementById("mxCount");
    const caCount = document.getElementById("caCount");
    if (usCount) usCount.textContent = `${counts["United States"] || 0} stadiums`;
    if (mxCount) mxCount.textContent = `${counts.Mexico || 0} stadiums`;
    if (caCount) caCount.textContent = `${counts.Canada || 0} stadiums`;
  }

  function renderMatchesView() {
    const filtered = filteredMatches();
    els.matchesView.innerHTML = `
      <div class="view-header">
        <div><span class="view-eyebrow">Schedule</span><h2 class="view-title">Matches</h2></div>
        <span class="view-count">${filtered.length} / ${matches.length} matches</span>
      </div>
      <div class="matches-grid">
        ${filtered.map((match) => {
          const stadium = findStadium(match.stadiumId);
          const a = team(match.teamA);
          const b = team(match.teamB);
          return `
            <article class="match-card" data-stadium="${escapeHTML(match.stadiumId)}">
              <div class="match-meta"><span>Match ${match.matchNumber}</span><span>${escapeHTML(match.round)}</span></div>
              <h3>${a.flag} ${escapeHTML(a.name)} <span class="vs-pill">VS</span> ${b.flag} ${escapeHTML(b.name)}</h3>
              <div class="match-meta"><span>${formatDate(match.date)}</span><span>${escapeHTML(stadium?.city || "TBC")}</span></div>
            </article>
          `;
        }).join("")}
      </div>
    `;
    els.matchesView.querySelectorAll(".match-card").forEach((card) => {
      card.addEventListener("click", () => {
        const stadium = findStadium(card.dataset.stadium);
        if (stadium) {
          setView("map");
          const p = screenPoint(stadium);
          selectStadium(stadium, p.x, p.y);
        }
      });
    });
  }

  function filteredMatches() {
    const f = state.filters;
    return matches.filter((match) => {
      const stadium = findStadium(match.stadiumId);
      if (!stadium) return false;
      if (f.country !== "all" && stadium.country !== f.country) return false;
      if (f.status !== "all" && stadiumStatus(stadium) !== f.status) return false;
      if (f.round !== "all" && match.round !== f.round) return false;
      if (f.team !== "all" && match.teamA !== f.team && match.teamB !== f.team) return false;
      if (f.search) {
        const a = team(match.teamA);
        const b = team(match.teamB);
        const haystack = [stadium.city, stadium.name, stadium.country, a.name, b.name, match.label, match.round].join(" ").toLowerCase();
        if (!haystack.includes(f.search)) return false;
      }
      return true;
    }).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  }

  function renderBracketView() {
    const rounds = stageOrder.length ? stageOrder.map((s) => s.name || s.stage_name || s).filter(Boolean) : unique(matches.map((m) => m.round));
    els.bracketView.innerHTML = `
      <div class="view-header">
        <div><span class="view-eyebrow">Knockout path</span><h2 class="view-title">Bracket</h2></div>
        <span class="view-count">Cinematic tree</span>
      </div>
      <div class="bracket-grid">
        ${rounds.map((round) => {
          const roundMatches = matches.filter((m) => m.round === round);
          return `
            <section class="bracket-column">
              <h3>${escapeHTML(round)}</h3>
              ${roundMatches.map((match) => {
                const a = team(match.teamA);
                const b = team(match.teamB);
                const stadium = findStadium(match.stadiumId);
                const finalClass = /final/i.test(round) ? " final-cell" : "";
                return `
                  <article class="bracket-cell${finalClass}">
                    <div class="match-meta"><span>M${match.matchNumber}</span><span>${escapeHTML(stadium?.city || "TBC")}</span></div>
                    <div style="margin-top:8px;font-weight:850">${a.flag} ${escapeHTML(a.name)}</div>
                    <div style="color:var(--gold);font-size:10px;font-weight:900;letter-spacing:.14em;margin:3px 0">VS</div>
                    <div style="font-weight:850">${b.flag} ${escapeHTML(b.name)}</div>
                  </article>
                `;
              }).join("") || `<article class="bracket-cell"><span style="color:var(--muted)">No matches</span></article>`}
            </section>
          `;
        }).join("")}
      </div>
    `;
  }

  function stadiumMatches(stadiumId) {
    return matches.filter((m) => m.stadiumId === stadiumId).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  }

  function nextMatchForStadium(stadiumId) {
    const now = Date.now();
    return stadiumMatches(stadiumId).find((m) => Date.parse(m.date) + 2 * 60 * 60 * 1000 >= now) || stadiumMatches(stadiumId)[0] || null;
  }

  function stadiumStatus(stadium) {
    if (!stadium) return "upcoming";
    const games = stadiumMatches(stadium.id);
    const now = Date.now();
    if (games.some((m) => matchStatus(m) === "live")) return "live";
    if (games.length && games.every((m) => Date.parse(m.date) + 2 * 60 * 60 * 1000 < now)) return "finished";
    if (games.some((m) => /final/i.test(m.round))) return "final";
    if (games.some((m) => !/group/i.test(m.round))) return "knockout";
    return stadium.status || "upcoming";
  }

  function matchStatus(match) {
    const start = Date.parse(match.date);
    if (!Number.isFinite(start)) return match.status || "upcoming";
    const now = Date.now();
    const liveStart = start - 30 * 60 * 1000;
    const liveEnd = start + 2.25 * 60 * 60 * 1000;
    if (now >= liveStart && now <= liveEnd) return "live";
    if (now > liveEnd) return "finished";
    return "upcoming";
  }

  function team(code) {
    return teams[code] || { name: code || "TBC", flag: "🏳️" };
  }

  function findStadium(id) {
    return stadiums.find((s) => s.id === id);
  }

  function screenPoint(stadium) {
    if (!state.map) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const rect = els.mapStage.getBoundingClientRect();
    const p = state.map.project([stadium.lng, stadium.lat]);
    return { x: rect.left + p.x, y: rect.top + p.y };
  }

  function fitHostBounds(animated = true) {
    if (!state.map || !stadiums.length) return;
    const bounds = new maplibregl.LngLatBounds();
    stadiums.forEach((s) => bounds.extend([s.lng, s.lat]));
    state.map.fitBounds(bounds, {
      padding: window.matchMedia("(max-width: 760px)").matches
        ? { top: 110, right: 42, bottom: 120, left: 42 }
        : { top: 124, right: 210, bottom: 108, left: 230 },
      duration: animated && !state.reduceMotion ? 900 : 0,
      maxZoom: window.matchMedia("(max-width: 760px)").matches ? 3.35 : 3.55
    });
  }

  function initialZoom() {
    return window.matchMedia("(max-width: 760px)").matches ? 2.55 : 3.05;
  }

  function showFatalMapMessage(message) {
    els.map.innerHTML = `<div style="position:absolute;inset:0;display:grid;place-items:center;color:var(--text);padding:30px;text-align:center"><strong>${escapeHTML(message)}</strong></div>`;
  }

  function countryClass(country) {
    return `country-${String(country || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  }

  function shortCity(city) {
    return String(city || "").replace("New York / New Jersey", "New York / NJ").replace("San Francisco Bay Area", "San Francisco");
  }

  function formatCapacity(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "TBC";
    return n.toLocaleString("en-US").replace(/,/g, " ");
  }

  function formatDate(value) {
    const raw = String(value || "");
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}).*?([+-]\d{2}:?\d{2})?$/);
    if (match) {
      const [, year, month, day, hour, minute, offset] = match;
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      const weekday = new Intl.DateTimeFormat("en", { weekday: "short" }).format(date);
      const monthName = new Intl.DateTimeFormat("en", { month: "short" }).format(date);
      const zone = offset ? ` UTC${offset.replace(":", "")}` : "";
      return `${weekday}, ${monthName} ${Number(day)} · ${hour}:${minute}${zone}`;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date TBC";
    return new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
  }

  function titleCase(value) {
    return String(value || "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function unique(values) {
    return [...new Set(values.filter(Boolean))];
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  }

  function fallbackData() {
    return {
      meta: { title: "World Cup 2026 Map", defaultTheme: "dark" },
      teams: { MEX: { name: "Mexico", flag: "🇲🇽" }, CAN: { name: "Canada", flag: "🇨🇦" }, USA: { name: "USA", flag: "🇺🇸" } },
      stages: [],
      stadiums: [
        { id: "mexico-city", name: "Estadio Azteca", city: "Mexico City", country: "Mexico", countryFlag: "🇲🇽", capacity: 83000, lat: 19.3029, lng: -99.1505, region: "Central", airportCode: "MEX" },
        { id: "toronto", name: "BMO Field", city: "Toronto", country: "Canada", countryFlag: "🇨🇦", capacity: 45000, lat: 43.6332, lng: -79.4186, region: "East", airportCode: "YYZ" },
        { id: "los-angeles", name: "SoFi Stadium", city: "Los Angeles", country: "United States", countryFlag: "🇺🇸", capacity: 70000, lat: 33.9535, lng: -118.3392, region: "West", airportCode: "LAX" }
      ],
      matches: [
        { id: "m001", matchNumber: 1, stadiumId: "mexico-city", date: "2026-06-11T15:00:00-06:00", round: "Group Stage", teamA: "MEX", teamB: "CAN", label: "Group A", weather: "Weather TBC" }
      ],
      routes: [["mexico-city", "los-angeles", "toronto"]]
    };
  }
})();
