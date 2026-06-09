(() => {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const VIEW = { w: 1600, h: 900 };
  const DATA = window.WC_DATA || fallbackData();
  const stadiums = DATA.stadiums || [];
  const matches = DATA.matches || [];
  const teams = DATA.teams || {};

  const els = {};
  const state = {
    transform: { x: 0, y: 0, k: 1 },
    dragging: false,
    pointerStart: null,
    transformStart: null,
    selectedId: null,
    activeView: "map",
    filters: {
      search: "",
      country: "all",
      status: "all",
      round: "all",
      team: "all"
    },
    hoverId: null,
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches
  };

  const three = {
    enabled: false,
    renderer: null,
    scene: null,
    camera: null,
    sprites: new Map(),
    cursor: null,
    particles: null,
    raf: null,
    width: 0,
    height: 0
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    bindElements();
    applySavedTheme();
    drawStaticMap();
    populateFilters();
    renderMarkers();
    renderRoutes();
    renderLegend();
    bindEvents();
    renderMatchesView();
    renderBracketView();
    loadThreeScript()
      .then(() => {
        initThreeAtmosphere();
        updateThreePositions();
      })
      .catch(() => {
        console.warn("Three.js could not be loaded. The SVG map remains fully functional.");
      });
    setView("map");
  }

  function bindElements() {
    els.html = document.documentElement;
    els.app = document.getElementById("app");
    els.mapStage = document.getElementById("mapStage");
    els.svg = document.getElementById("mapSvg");
    els.viewport = document.getElementById("viewport");
    els.gridLayer = document.getElementById("gridLayer");
    els.countryLayer = document.getElementById("countryLayer");
    els.routeLayer = document.getElementById("routeLayer");
    els.labelLayer = document.getElementById("labelLayer");
    els.markerLayer = document.getElementById("markerLayer");
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
    els.html.dataset.theme = saved;
  }

  function drawStaticMap() {
    drawGrid();
    drawCountries();
    drawCountryLabels();
    applyTransform();
  }

  function drawGrid() {
    clear(els.gridLayer);
    for (let x = 120; x <= VIEW.w - 120; x += 160) {
      const line = svgEl("line", { x1: x, y1: 40, x2: x, y2: VIEW.h - 40 });
      els.gridLayer.appendChild(line);
    }
    for (let y = 100; y <= VIEW.h - 100; y += 110) {
      const line = svgEl("line", { x1: 60, y1: y, x2: VIEW.w - 60, y2: y });
      els.gridLayer.appendChild(line);
    }
  }

  function drawCountries() {
    clear(els.countryLayer);

    const countries = [
      {
        id: "ca",
        cls: "country ca",
        path: "M150,55 C320,20 475,36 630,78 C805,126 958,92 1168,78 C1342,64 1482,94 1552,170 L1506,286 C1360,254 1246,284 1114,292 C948,303 762,262 598,254 C430,246 292,268 138,232 Z"
      },
      {
        id: "us",
        cls: "country us",
        path: "M280,252 C388,234 512,264 626,278 C742,292 866,276 1002,288 C1128,299 1244,286 1362,338 L1328,548 C1194,548 1074,568 956,590 C832,613 720,574 606,574 C488,574 374,610 278,548 C234,500 228,340 280,252 Z"
      },
      {
        id: "mx",
        cls: "country mx",
        path: "M506,540 C592,548 675,575 756,604 C842,634 918,632 1000,604 L1048,702 C960,730 878,784 810,844 C730,842 666,812 622,756 C580,704 522,666 468,640 Z"
      }
    ];

    countries.forEach((country) => {
      els.countryLayer.appendChild(svgEl("path", {
        d: country.path,
        class: country.cls,
        id: `country-${country.id}`
      }));
    });

    const borderLines = [
      { x1: 214, y1: 250, x2: 1340, y2: 318, stroke: "rgba(245,240,223,.075)" },
      { x1: 520, y1: 572, x2: 958, y2: 606, stroke: "rgba(245,240,223,.075)" }
    ];
    borderLines.forEach((l) => els.countryLayer.appendChild(svgEl("line", { ...l, class: "label-link" })));
  }

  function drawCountryLabels() {
    const labels = [
      { text: "CANADA", x: 780, y: 120 },
      { text: "UNITED STATES", x: 730, y: 360 },
      { text: "MEXICO", x: 690, y: 684 }
    ];
    labels.forEach((label) => {
      const t = svgEl("text", {
        x: label.x,
        y: label.y,
        class: "country-label",
        "text-anchor": "middle"
      });
      t.textContent = label.text;
      els.countryLayer.appendChild(t);
    });

    const zones = [
      { text: "UTC-8 Pacific", x: 388, y: 874 },
      { text: "UTC-7 Mountain", x: 612, y: 874 },
      { text: "UTC-6 Central", x: 830, y: 874 },
      { text: "UTC-5 Eastern", x: 1060, y: 874 }
    ];
    zones.forEach((zone) => {
      const t = svgEl("text", {
        x: zone.x,
        y: zone.y,
        class: "timezone-label",
        "text-anchor": "middle"
      });
      t.textContent = zone.text;
      els.countryLayer.appendChild(t);
    });
  }

  function renderRoutes() {
    clear(els.routeLayer);
    (DATA.routes || []).forEach((route, routeIndex) => {
      const points = route.map((id) => stadiums.find((s) => s.id === id)).filter(Boolean).map(project);
      for (let i = 0; i < points.length - 1; i += 1) {
        const a = points[i];
        const b = points[i + 1];
        const curve = curvedPath(a, b, routeIndex % 2 ? -0.16 : 0.16);
        els.routeLayer.appendChild(svgEl("path", {
          d: curve,
          class: `route-line ${routeIndex === 2 ? "blue" : ""}`
        }));
      }
    });
  }

  function renderMarkers() {
    clear(els.markerLayer);
    clear(els.labelLayer);

    stadiums.forEach((stadium) => {
      const point = project(stadium);
      const status = stadiumStatus(stadium);
      const marker = svgEl("g", {
        class: `marker-node status-${status}`,
        transform: `translate(${point.x} ${point.y})`,
        tabindex: "0",
        role: "button",
        "aria-label": `${stadium.city}, ${stadium.name}`,
        "data-id": stadium.id
      });

      marker.appendChild(svgEl("circle", { class: "marker-halo pulse", r: 22, cx: 0, cy: 0, filter: "url(#softGlow)" }));
      marker.appendChild(svgEl("circle", { class: "marker-ring", r: status === "final" ? 19 : 15, cx: 0, cy: 0, fill: "none" }));
      marker.appendChild(svgEl("circle", { class: "marker-core", r: status === "final" ? 7 : 6, cx: 0, cy: 0, filter: "url(#softGlow)" }));
      marker.appendChild(svgEl("circle", { class: "hit-area", r: 28, cx: 0, cy: 0, fill: "transparent" }));

      marker.addEventListener("mouseenter", (event) => showHover(stadium, event.clientX, event.clientY));
      marker.addEventListener("mousemove", (event) => moveFloatingCard(els.hoverCard, event.clientX, event.clientY));
      marker.addEventListener("mouseleave", () => hideHover());
      marker.addEventListener("focus", () => {
        const screen = contentPointToClient(project(stadium));
        showHover(stadium, screen.x, screen.y);
      });
      marker.addEventListener("blur", hideHover);
      marker.addEventListener("click", (event) => {
        event.stopPropagation();
        selectStadium(stadium, event.clientX, event.clientY, true);
      });
      marker.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const screen = contentPointToClient(project(stadium));
          selectStadium(stadium, screen.x, screen.y, true);
        }
      });

      els.markerLayer.appendChild(marker);
      els.labelLayer.appendChild(labelForStadium(stadium, point, status));
    });

    applyFiltersToMarkers();
  }

  function labelForStadium(stadium, point, status) {
    const offset = stadium.label || { dx: 34, dy: -20, anchor: "start" };
    const width = Math.min(285, Math.max(218, stadium.city.length * 9 + 92));
    const height = 54;
    const x = offset.anchor === "end" ? point.x + offset.dx - width : point.x + offset.dx;
    const y = point.y + offset.dy - height / 2;
    const lineEndX = offset.anchor === "end" ? x + width : x;
    const lineEndY = y + height / 2;

    const group = svgEl("g", { class: `map-label-card status-${status}`, filter: "url(#labelShadow)" });
    group.appendChild(svgEl("line", {
      x1: point.x,
      y1: point.y,
      x2: lineEndX,
      y2: lineEndY,
      class: "label-link"
    }));
    group.appendChild(svgEl("rect", { x, y, width, height, rx: 7, ry: 7 }));

    const title = svgEl("text", { x: x + 14, y: y + 21, class: "map-label-title" });
    title.textContent = compactCity(stadium.city);
    group.appendChild(title);

    const sub = svgEl("text", { x: x + 14, y: y + 41, class: "map-label-sub" });
    sub.textContent = `${stadium.name} · ${formatCapacity(stadium.capacity)}`;
    group.appendChild(sub);

    return group;
  }

  function bindEvents() {
    window.addEventListener("resize", () => {
      resizeThree();
      updateThreePositions();
      if (state.selectedId) positionDetailAtStadium(getStadium(state.selectedId));
    });

    els.svg.addEventListener("wheel", onWheel, { passive: false });
    els.svg.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    els.svg.addEventListener("click", (event) => {
      if (event.target === els.svg || event.target.id === "gridLayer" || event.target.id === "viewport") {
        closeDetail();
      }
    });

    document.getElementById("zoomIn").addEventListener("click", () => zoomBy(1.22));
    document.getElementById("zoomOut").addEventListener("click", () => zoomBy(0.82));
    document.getElementById("resetMap").addEventListener("click", () => animateTransform({ x: 0, y: 0, k: 1 }));

    document.getElementById("filterToggle").addEventListener("click", () => els.filterPanel.classList.toggle("hidden"));
    document.getElementById("closeFilters").addEventListener("click", () => els.filterPanel.classList.add("hidden"));
    document.getElementById("clearFilters").addEventListener("click", clearFilters);
    document.getElementById("themeToggle").addEventListener("click", toggleTheme);

    [els.searchInput, els.countryFilter, els.statusFilter, els.roundFilter, els.teamFilter].forEach((input) => {
      input.addEventListener("input", readFilters);
      input.addEventListener("change", readFilters);
    });

    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => setView(button.dataset.view));
    });
  }

  function onWheel(event) {
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1.12 : 0.9;
    const mouse = screenToSvg(event.clientX, event.clientY);
    const nextK = clamp(state.transform.k * direction, 0.82, 3.25);
    const ratio = nextK / state.transform.k;
    state.transform.x = mouse.x - (mouse.x - state.transform.x) * ratio;
    state.transform.y = mouse.y - (mouse.y - state.transform.y) * ratio;
    state.transform.k = nextK;
    clampTransform();
    applyTransform();
  }

  function onPointerDown(event) {
    if (event.button !== 0) return;
    if (event.target.closest && event.target.closest(".marker-node")) return;
    state.dragging = true;
    els.mapStage.classList.add("dragging");
    els.svg.setPointerCapture?.(event.pointerId);
    state.pointerStart = screenToSvg(event.clientX, event.clientY);
    state.transformStart = { ...state.transform };
  }

  function onPointerMove(event) {
    if (three.cursor) {
      three.cursor.position.set(event.clientX, event.clientY, 2);
    }
    if (!state.dragging) return;
    const now = screenToSvg(event.clientX, event.clientY);
    state.transform.x = state.transformStart.x + (now.x - state.pointerStart.x);
    state.transform.y = state.transformStart.y + (now.y - state.pointerStart.y);
    clampTransform();
    applyTransform();
  }

  function onPointerUp() {
    state.dragging = false;
    els.mapStage.classList.remove("dragging");
  }

  function zoomBy(factor) {
    const center = { x: VIEW.w / 2, y: VIEW.h / 2 };
    const nextK = clamp(state.transform.k * factor, 0.82, 3.25);
    const ratio = nextK / state.transform.k;
    animateTransform({
      x: center.x - (center.x - state.transform.x) * ratio,
      y: center.y - (center.y - state.transform.y) * ratio,
      k: nextK
    });
  }

  function applyTransform() {
    els.viewport.setAttribute("transform", `translate(${state.transform.x} ${state.transform.y}) scale(${state.transform.k})`);
    updateThreePositions();
    if (state.selectedId) positionDetailAtStadium(getStadium(state.selectedId), false);
  }

  function clampTransform() {
    const k = state.transform.k;
    const margin = 420 * k;
    state.transform.x = clamp(state.transform.x, -VIEW.w * (k - 0.72) - margin, margin);
    state.transform.y = clamp(state.transform.y, -VIEW.h * (k - 0.72) - margin, margin);
  }

  function animateTransform(target, onDone) {
    const start = { ...state.transform };
    const duration = state.reduceMotion ? 0 : 820;
    const startTime = performance.now();

    const tick = (now) => {
      const t = duration === 0 ? 1 : clamp((now - startTime) / duration, 0, 1);
      const e = easeOutCubic(t);
      state.transform.x = lerp(start.x, target.x, e);
      state.transform.y = lerp(start.y, target.y, e);
      state.transform.k = lerp(start.k, target.k, e);
      clampTransform();
      applyTransform();
      if (t < 1) requestAnimationFrame(tick);
      else if (onDone) onDone();
    };
    requestAnimationFrame(tick);
  }

  function flyToStadium(stadium, onDone) {
    const p = project(stadium);
    const mobile = window.innerWidth <= 900;
    const targetK = mobile ? 1.42 : 1.35;
    const offsetX = mobile ? 0 : -120;
    const offsetY = mobile ? -70 : 0;
    animateTransform({
      x: VIEW.w / 2 + offsetX - p.x * targetK,
      y: VIEW.h / 2 + offsetY - p.y * targetK,
      k: targetK
    }, onDone);
  }

  function screenToSvg(clientX, clientY) {
    const pt = els.svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const matrix = els.svg.getScreenCTM();
    if (!matrix) return { x: clientX, y: clientY };
    const converted = pt.matrixTransform(matrix.inverse());
    return { x: converted.x, y: converted.y };
  }

  function contentPointToClient(point) {
    const pt = els.svg.createSVGPoint();
    pt.x = point.x;
    pt.y = point.y;
    const matrix = els.viewport.getScreenCTM();
    if (!matrix) return { x: point.x, y: point.y };
    const converted = pt.matrixTransform(matrix);
    return { x: converted.x, y: converted.y };
  }

  function project(stadium) {
    const minLng = -132;
    const maxLng = -64;
    const minLat = 17.5;
    const maxLat = 54.5;
    const x = 115 + ((stadium.lng - minLng) / (maxLng - minLng)) * 1370;
    const y = 80 + ((maxLat - stadium.lat) / (maxLat - minLat)) * 760;
    return { x, y };
  }

  function curvedPath(a, b, intensity) {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const cx = mx - dy * intensity;
    const cy = my + dx * intensity;
    return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }

  function showHover(stadium, clientX, clientY) {
    state.hoverId = stadium.id;
    els.hoverCard.innerHTML = stadiumCardHTML(stadium, { compact: true });
    els.hoverCard.classList.remove("hidden");
    moveFloatingCard(els.hoverCard, clientX, clientY);
    setMarkerClass(stadium.id, "hovered", true);
  }

  function hideHover() {
    if (state.hoverId) setMarkerClass(state.hoverId, "hovered", false);
    state.hoverId = null;
    els.hoverCard.classList.add("hidden");
  }

  function selectStadium(stadium, clientX, clientY, fly = true) {
    state.selectedId = stadium.id;
    document.querySelectorAll(".marker-node.selected").forEach((m) => m.classList.remove("selected"));
    setMarkerClass(stadium.id, "selected", true);
    els.detailCard.innerHTML = detailCardHTML(stadium);
    bindDetailCardActions(stadium);
    els.detailCard.classList.remove("hidden");
    moveFloatingCard(els.detailCard, clientX, clientY);
    if (fly) {
      flyToStadium(stadium, () => positionDetailAtStadium(stadium));
    } else {
      positionDetailAtStadium(stadium);
    }
  }

  function closeDetail() {
    if (state.selectedId) setMarkerClass(state.selectedId, "selected", false);
    state.selectedId = null;
    els.detailCard.classList.add("hidden");
  }

  function positionDetailAtStadium(stadium, animate = true) {
    if (!stadium || els.detailCard.classList.contains("hidden")) return;
    const point = contentPointToClient(project(stadium));
    const rect = els.detailCard.getBoundingClientRect();
    if (window.innerWidth <= 900) return;
    const x = point.x + 24;
    const y = point.y - rect.height / 2;
    positionElement(els.detailCard, x, y, animate);
  }

  function moveFloatingCard(card, clientX, clientY) {
    if (window.innerWidth <= 900 && card === els.detailCard) return;
    const x = clientX + 22;
    const y = clientY + 18;
    positionElement(card, x, y, false);
  }

  function positionElement(el, x, y) {
    const margin = 14;
    const rect = el.getBoundingClientRect();
    const width = rect.width || 360;
    const height = rect.height || 240;
    const nextX = clamp(x, margin, window.innerWidth - width - margin);
    const nextY = clamp(y, margin, window.innerHeight - height - margin);
    el.style.left = `${nextX}px`;
    el.style.top = `${nextY}px`;
    el.style.right = "auto";
    el.style.bottom = "auto";
  }

  function stadiumCardHTML(stadium) {
    const stadiumMatches = matchesForStadium(stadium.id);
    const next = nextMatch(stadium.id);
    const status = stadiumStatus(stadium);
    return `
      <div class="card-image">
        <span class="image-fallback">${escapeHTML(stadium.city)}</span>
        <img src="${escapeHTML(stadium.image || "")}" alt="${escapeHTML(stadium.name)}" onload="this.classList.add('loaded')" onerror="this.remove()">
      </div>
      <div class="card-header">
        <div>
          <h3 class="card-title">${escapeHTML(stadium.name)}</h3>
          <div class="card-city">${stadium.countryFlag || ""} ${escapeHTML(stadium.city)}, ${escapeHTML(stadium.country)}</div>
        </div>
        <span class="status-chip ${status}">${labelStatus(status)}</span>
      </div>
      <div class="metric-grid">
        <div class="metric"><span>Capacity</span><strong>${formatCapacity(stadium.capacity)}</strong></div>
        <div class="metric"><span>Matches</span><strong>${stadiumMatches.length || "—"}</strong></div>
        <div class="metric"><span>Region</span><strong>${escapeHTML(stadium.region || "—")}</strong></div>
      </div>
      ${next ? nextMatchHTML(next) : `<div class="next-match"><div class="next-label">Next match</div><div class="match-date">No match connected yet.</div></div>`}
    `;
  }

  function detailCardHTML(stadium) {
    const stadiumMatches = matchesForStadium(stadium.id);
    return `
      <button type="button" class="close-btn" data-close-detail aria-label="Close">×</button>
      ${stadiumCardHTML(stadium)}
      <div class="match-list">
        ${stadiumMatches.length ? stadiumMatches.map(matchItemHTML).join("") : `<div class="match-item"><div class="match-date">No fixture data connected to this stadium yet.</div></div>`}
      </div>
      <div class="card-actions">
        <button type="button" class="primary-btn" data-view-stadium>View all matches here</button>
        <button type="button" class="ghost-btn" data-reset-map>Reset map</button>
      </div>
    `;
  }

  function bindDetailCardActions(stadium) {
    const close = els.detailCard.querySelector("[data-close-detail]");
    const view = els.detailCard.querySelector("[data-view-stadium]");
    const reset = els.detailCard.querySelector("[data-reset-map]");
    close?.addEventListener("click", closeDetail);
    view?.addEventListener("click", () => {
      state.filters.search = stadium.city;
      els.searchInput.value = stadium.city;
      renderMatchesView();
      setView("matches");
    });
    reset?.addEventListener("click", () => animateTransform({ x: 0, y: 0, k: 1 }));
  }

  function nextMatchHTML(match) {
    const a = team(match.teamA);
    const b = team(match.teamB);
    return `
      <div class="next-match">
        <div class="next-label">Next match</div>
        <div class="match-line">
          <span>${a.flag} ${escapeHTML(a.name)}</span>
          <span class="vs">VS</span>
          <span>${b.flag} ${escapeHTML(b.name)}</span>
        </div>
        <div class="match-date">Match ${escapeHTML(match.matchNumber || "—")} · ${escapeHTML(match.label || match.round)} · ${formatDate(match.date)}</div>
        <div class="match-date">${escapeHTML(match.weather || "Weather TBC")}</div>
      </div>
    `;
  }

  function matchItemHTML(match) {
    const a = team(match.teamA);
    const b = team(match.teamB);
    return `
      <div class="match-item">
        <div class="match-line">
          <span>${a.flag} ${escapeHTML(a.name)}</span>
          <span class="vs">VS</span>
          <span>${b.flag} ${escapeHTML(b.name)}</span>
        </div>
        <div class="match-meta">
          <span>${formatDate(match.date)}</span>
          <span>${escapeHTML(match.round)}</span>
          <span>${escapeHTML(match.label || match.score || labelStatus(match.status))}</span>
        </div>
        <div class="match-date">${escapeHTML(match.weather || "Weather TBC")}</div>
      </div>
    `;
  }

  function renderMatchesView() {
    const list = filteredMatches();
    els.matchesView.innerHTML = `
      <h2 class="panel-title">Matches</h2>
      <div class="view-grid">
        ${list.map((match) => {
          const stadium = getStadium(match.stadiumId);
          const a = team(match.teamA);
          const b = team(match.teamB);
          return `
            <article class="compact-card" data-match-stadium="${escapeHTML(match.stadiumId)}">
              <span class="round-chip">Match ${escapeHTML(match.matchNumber || "—")} · ${escapeHTML(match.round)}</span>
              <div style="height:10px"></div>
              <div class="match-line"><span>${a.flag} ${escapeHTML(a.name)}</span><span class="vs">VS</span><span>${b.flag} ${escapeHTML(b.name)}</span></div>
              <div class="match-date">${formatDate(match.date)}</div>
              <div class="match-date">${escapeHTML(match.label || "")}</div>
              <div class="match-date">${stadium?.countryFlag || ""} ${escapeHTML(stadium?.city || "Unknown")}</div>
            </article>
          `;
        }).join("") || `<div class="compact-card">No matches match the current filters.</div>`}
      </div>
    `;
    els.matchesView.querySelectorAll("[data-match-stadium]").forEach((card) => {
      card.addEventListener("click", () => {
        const stadium = getStadium(card.dataset.matchStadium);
        if (stadium) {
          setView("map");
          const p = contentPointToClient(project(stadium));
          selectStadium(stadium, p.x, p.y, true);
        }
      });
    });
  }

  function renderBracketView() {
    const rounds = DATA.stages?.filter((stage) => stage.name !== "Group Stage").sort((a, b) => a.order - b.order).map((stage) => stage.name) || ["Round of 32", "Round of 16", "Quarterfinals", "Semifinals", "Third Place Playoff", "Final"];
    const knockout = matches.filter((m) => rounds.includes(m.round) || m.status === "final" || m.status === "knockout");
    const fallback = knockout.length ? knockout : matches.slice(-8);
    els.bracketView.innerHTML = `
      <h2 class="panel-title">Knockout Tree</h2>
      <div class="bracket">
        ${rounds.map((round, index) => {
          const roundMatches = fallback.filter((m) => m.round === round || (round === "Final" && m.status === "final"));
          const entries = roundMatches.length ? roundMatches : fallback.slice(index * 2, index * 2 + Math.max(1, 4 - index));
          return `
            <div class="bracket-col">
              <div class="bracket-title">${round}</div>
              ${entries.map((m) => {
                const a = team(m.teamA);
                const b = team(m.teamB);
                const stadium = getStadium(m.stadiumId);
                return `
                  <article class="bracket-match ${round === "Final" ? "final" : ""}">
                    <div class="match-line"><span>${a.flag} ${escapeHTML(a.name)}</span><span class="vs">VS</span><span>${b.flag} ${escapeHTML(b.name)}</span></div>
                    <div class="match-date">Match ${escapeHTML(m.matchNumber || "—")} · ${stadium?.city || "TBC"} · ${formatShortDate(m.date)}</div>
                  </article>
                `;
              }).join("")}
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function setView(view) {
    state.activeView = view;
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.classList.toggle("active", button.dataset.view === view);
    });
    els.matchesView.classList.toggle("hidden", view !== "matches");
    els.bracketView.classList.toggle("hidden", view !== "bracket");
    if (view !== "map") els.filterPanel.classList.add("hidden");
  }

  function populateFilters() {
    unique(stadiums.map((s) => s.country)).forEach((country) => option(els.countryFilter, country, country));
    unique(["upcoming", "live", "finished", "knockout", "final", ...matches.map((m) => m.status)]).forEach((status) => option(els.statusFilter, status, labelStatus(status)));
    unique(matches.map((m) => m.round)).forEach((round) => option(els.roundFilter, round, round));
    Object.entries(teams).sort((a, b) => a[1].name.localeCompare(b[1].name)).forEach(([code, t]) => option(els.teamFilter, code, `${t.flag} ${t.name}`));
  }

  function option(select, value, text) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = text;
    select.appendChild(opt);
  }

  function readFilters() {
    state.filters.search = els.searchInput.value.trim().toLowerCase();
    state.filters.country = els.countryFilter.value;
    state.filters.status = els.statusFilter.value;
    state.filters.round = els.roundFilter.value;
    state.filters.team = els.teamFilter.value;
    applyFiltersToMarkers();
    renderMatchesView();
  }

  function clearFilters() {
    els.searchInput.value = "";
    els.countryFilter.value = "all";
    els.statusFilter.value = "all";
    els.roundFilter.value = "all";
    els.teamFilter.value = "all";
    readFilters();
  }

  function applyFiltersToMarkers() {
    stadiums.forEach((stadium) => {
      const visible = stadiumPassesFilters(stadium);
      const marker = document.querySelector(`.marker-node[data-id="${cssEscape(stadium.id)}"]`);
      marker?.classList.toggle("dim", !visible);
    });
  }

  function stadiumPassesFilters(stadium) {
    const f = state.filters;
    const stadiumMatches = matchesForStadium(stadium.id);
    if (f.country !== "all" && stadium.country !== f.country) return false;
    if (f.status !== "all" && stadiumStatus(stadium) !== f.status && !stadiumMatches.some((m) => m.status === f.status)) return false;
    if (f.round !== "all" && !stadiumMatches.some((m) => m.round === f.round)) return false;
    if (f.team !== "all" && !stadiumMatches.some((m) => m.teamA === f.team || m.teamB === f.team)) return false;
    if (f.search) {
      const haystack = [
        stadium.name,
        stadium.city,
        stadium.country,
        stadium.region,
        ...stadiumMatches.flatMap((m) => [team(m.teamA).name, team(m.teamB).name, m.round])
      ].join(" ").toLowerCase();
      if (!haystack.includes(f.search)) return false;
    }
    return true;
  }

  function filteredMatches() {
    return matches.filter((match) => {
      const stadium = getStadium(match.stadiumId);
      if (!stadium) return false;
      if (state.filters.country !== "all" && stadium.country !== state.filters.country) return false;
      if (state.filters.status !== "all" && match.status !== state.filters.status && stadiumStatus(stadium) !== state.filters.status) return false;
      if (state.filters.round !== "all" && match.round !== state.filters.round) return false;
      if (state.filters.team !== "all" && match.teamA !== state.filters.team && match.teamB !== state.filters.team) return false;
      if (state.filters.search) {
        const haystack = [stadium.name, stadium.city, stadium.country, match.round, team(match.teamA).name, team(match.teamB).name].join(" ").toLowerCase();
        if (!haystack.includes(state.filters.search)) return false;
      }
      return true;
    });
  }

  function renderLegend() {
    const byCountry = stadiums.reduce((acc, s) => {
      acc[s.country] = (acc[s.country] || 0) + 1;
      return acc;
    }, {});
    document.getElementById("usCount").textContent = `${byCountry["United States"] || 0} stadiums`;
    document.getElementById("mxCount").textContent = `${byCountry.Mexico || 0} stadiums`;
    document.getElementById("caCount").textContent = `${byCountry.Canada || 0} stadiums`;
  }

  function toggleTheme() {
    const next = els.html.dataset.theme === "dark" ? "light" : "dark";
    els.html.dataset.theme = next;
    localStorage.setItem("wc-map-theme", next);
  }

  function loadThreeScript() {
    if (window.THREE) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.min.js";
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initThreeAtmosphere() {
    if (!window.THREE || !els.threeCanvas) {
      console.warn("Three.js is not loaded. The map will still work without the WebGL atmosphere.");
      return;
    }

    const THREE = window.THREE;
    three.enabled = true;
    three.renderer = new THREE.WebGLRenderer({ canvas: els.threeCanvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    three.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    three.scene = new THREE.Scene();
    three.camera = new THREE.OrthographicCamera(0, window.innerWidth, window.innerHeight, 0, -1000, 1000);

    const particleCount = window.innerWidth <= 800 ? 110 : 240;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = Math.random() * window.innerWidth;
      positions[i * 3 + 1] = Math.random() * window.innerHeight;
      positions[i * 3 + 2] = -12 - Math.random() * 40;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xd9b25f,
      size: 1.35,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    three.particles = new THREE.Points(particleGeometry, particleMaterial);
    three.scene.add(three.particles);

    const texture = makeGlowTexture();
    stadiums.forEach((stadium) => {
      const material = new THREE.SpriteMaterial({
        map: texture,
        color: colorForStatus(stadiumStatus(stadium)),
        transparent: true,
        opacity: 0.58,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const sprite = new THREE.Sprite(material);
      const size = stadiumStatus(stadium) === "final" ? 116 : 82;
      sprite.scale.set(size, size, 1);
      sprite.userData.stadiumId = stadium.id;
      three.sprites.set(stadium.id, sprite);
      three.scene.add(sprite);
    });

    const cursorMaterial = new THREE.SpriteMaterial({
      map: texture,
      color: 0x25ddff,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    three.cursor = new THREE.Sprite(cursorMaterial);
    three.cursor.scale.set(210, 210, 1);
    three.cursor.position.set(window.innerWidth / 2, window.innerHeight / 2, 1);
    three.scene.add(three.cursor);

    resizeThree();
    animateThree();
  }

  function resizeThree() {
    if (!three.enabled) return;
    three.width = window.innerWidth;
    three.height = window.innerHeight;
    three.renderer.setSize(three.width, three.height, false);
    three.camera.left = 0;
    three.camera.right = three.width;
    three.camera.top = 0;
    three.camera.bottom = three.height;
    three.camera.updateProjectionMatrix();
  }

  function updateThreePositions() {
    if (!three.enabled) return;
    stadiums.forEach((stadium) => {
      const sprite = three.sprites.get(stadium.id);
      if (!sprite) return;
      const screen = contentPointToClient(project(stadium));
      sprite.position.set(screen.x, screen.y, 0);
      sprite.visible = screen.x > -180 && screen.x < window.innerWidth + 180 && screen.y > -180 && screen.y < window.innerHeight + 180;
    });
  }

  function animateThree() {
    if (!three.enabled) return;
    const time = performance.now() * 0.001;
    if (three.particles) {
      three.particles.rotation.z = Math.sin(time * 0.08) * 0.018;
      const positions = three.particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += 0.035;
        if (positions[i + 1] > window.innerHeight + 20) positions[i + 1] = -20;
      }
      three.particles.geometry.attributes.position.needsUpdate = true;
    }
    three.sprites.forEach((sprite) => {
      const base = sprite.userData.baseOpacity || 0.58;
      sprite.material.opacity = base + Math.sin(time * 2.1 + sprite.position.x * 0.01) * 0.08;
    });
    three.renderer.render(three.scene, three.camera);
    three.raf = requestAnimationFrame(animateThree);
  }

  function makeGlowTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(255,255,255,0.95)");
    gradient.addColorStop(0.17, "rgba(255,255,255,0.52)");
    gradient.addColorStop(0.42, "rgba(255,255,255,0.16)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    return new window.THREE.CanvasTexture(canvas);
  }

  function setMarkerClass(id, cls, on) {
    const marker = document.querySelector(`.marker-node[data-id="${cssEscape(id)}"]`);
    marker?.classList.toggle(cls, on);
  }

  function matchesForStadium(stadiumId) {
    return matches
      .filter((m) => m.stadiumId === stadiumId)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  function nextMatch(stadiumId) {
    const connected = matchesForStadium(stadiumId);
    return connected.find((m) => m.status !== "finished") || connected[0] || null;
  }

  function stadiumStatus(stadium) {
    const connected = matchesForStadium(stadium.id);
    if (connected.some((m) => m.status === "final" || m.round === "Final")) return "final";
    if (connected.some((m) => m.status === "live")) return "live";
    if (connected.some((m) => m.status === "knockout")) return "knockout";
    if (connected.length && connected.every((m) => m.status === "finished")) return "finished";
    return stadium.status || "upcoming";
  }

  function team(code) {
    return teams[code] || { name: code || "TBC", flag: "🏳️" };
  }

  function getStadium(id) {
    return stadiums.find((s) => s.id === id);
  }

  function labelStatus(status) {
    return String(status || "upcoming").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function compactCity(city) {
    return city.replace("San Francisco Bay Area", "San Francisco").replace("New York / New Jersey", "New York / NJ").toUpperCase();
  }

  function formatCapacity(value) {
    if (!value) return "—";
    return Number(value).toLocaleString("en-US").replace(/,/g, " ");
  }

  function formatDate(value) {
    if (!value) return "TBC";
    const date = new Date(value);
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(date);
  }

  function formatShortDate(value) {
    if (!value) return "TBC";
    const date = new Date(value);
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
  }

  function colorForStatus(status) {
    const map = {
      upcoming: 0xd9b25f,
      live: 0x25ddff,
      finished: 0xf5f0df,
      knockout: 0x006dff,
      final: 0xd9b25f
    };
    return map[status] || map.upcoming;
  }

  function unique(arr) {
    return [...new Set(arr.filter(Boolean))];
  }

  function svgEl(tag, attrs = {}) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      node.setAttribute(key, String(value));
    });
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function cssEscape(value) {
    if (window.CSS?.escape) return CSS.escape(value);
    return String(value).replace(/"/g, "\\\"");
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#039;",
      "\"": "&quot;"
    }[char]));
  }

  function fallbackData() {
    return {
      meta: { title: "World Cup 2026 Map", defaultTheme: "dark" },
      teams: {},
      stadiums: [
        { id: "fallback-la", name: "SoFi Stadium", city: "Los Angeles", country: "United States", countryFlag: "🇺🇸", capacity: 70000, lat: 33.9535, lng: -118.3392, status: "upcoming" },
        { id: "fallback-mx", name: "Estadio Azteca", city: "Mexico City", country: "Mexico", countryFlag: "🇲🇽", capacity: 83000, lat: 19.3029, lng: -99.1505, status: "upcoming" },
        { id: "fallback-to", name: "BMO Field", city: "Toronto", country: "Canada", countryFlag: "🇨🇦", capacity: 45000, lat: 43.6332, lng: -79.4186, status: "upcoming" }
      ],
      matches: [],
      routes: []
    };
  }
})();
