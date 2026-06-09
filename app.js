const { stadiums, matches, bracketRounds, bracketMatches } = window.WC_DATA;

const stadiumById = Object.fromEntries(stadiums.map((stadium) => [stadium.id, stadium]));
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

let map;
let stadiumLayer;
let routeLayer;
let labelLayer;
let markers = [];
let selectedStadiumId = null;
let previewTimer = null;

const teamFlags = {
  Mexico: "🇲🇽",
  Canada: "🇨🇦",
  USA: "🇺🇸",
  "South Africa": "🇿🇦",
  Brazil: "🇧🇷",
  Argentina: "🇦🇷",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Spain: "🇪🇸",
  England: "🏴",
  Portugal: "🇵🇹",
  Italy: "🇮🇹",
  Morocco: "🇲🇦",
  Japan: "🇯🇵",
  Korea: "🇰🇷",
  Australia: "🇦🇺"
};

const countryFlags = {
  US: "🇺🇸",
  USA: "🇺🇸",
  MX: "🇲🇽",
  Mexico: "🇲🇽",
  CA: "🇨🇦",
  Canada: "🇨🇦"
};

const fmtDate = (iso) => new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short"
}).format(new Date(iso));

const fmtShortDate = (iso) => new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
}).format(new Date(iso));

function init() {
  setupTheme();
  setupTabs();
  setupFilters();
  setupMap();
  setupAmbient();
  renderEverything();
}

function setupTheme() {
  const savedTheme = localStorage.getItem("wc-theme") || "dark";
  document.body.classList.toggle("light-mode", savedTheme === "light");
  $("#themeToggle").textContent = savedTheme === "light" ? "Light" : "Dark";

  $("#themeToggle").addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-mode");
    localStorage.setItem("wc-theme", isLight ? "light" : "dark");
    $("#themeToggle").textContent = isLight ? "Light" : "Dark";
  });
}

function setupTabs() {
  $$('[data-tab]').forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.tab;
      if (!target) return;

      $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === target));
      $$(".view").forEach((view) => view.classList.toggle("active", view.id === target));

      if (target === "mapView" && map) {
        setTimeout(() => map.invalidateSize(), 80);
      }
    });
  });
}

function setupFilters() {
  const teamSelect = $("#teamFilter");
  [...getTeams(matches)].sort().forEach((team) => addOption(teamSelect, team, `${flagForTeam(team)} ${team}`));

  const roundSelect = $("#roundFilter");
  [...new Set(matches.map((match) => match.round))].sort().forEach((round) => addOption(roundSelect, round, round));

  const stadiumSelect = $("#stadiumFilter");
  stadiums
    .slice()
    .sort((a, b) => a.city.localeCompare(b.city))
    .forEach((stadium) => addOption(stadiumSelect, stadium.id, `${flagForCountry(stadium)} ${stadium.city} — ${stadium.stadium}`));

  ["teamFilter", "roundFilter", "stadiumFilter", "statusFilter", "searchFilter"].forEach((id) => {
    $("#" + id).addEventListener("input", renderEverything);
  });

  $("#resetFilters").addEventListener("click", () => {
    $("#teamFilter").value = "all";
    $("#roundFilter").value = "all";
    $("#stadiumFilter").value = "all";
    $("#statusFilter").value = "all";
    $("#searchFilter").value = "";
    renderEverything();
  });

  $("#filterToggle").addEventListener("click", () => setFilterPanel(true));
  $("#filterClose").addEventListener("click", () => setFilterPanel(false));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setFilterPanel(false);
      closeSelectedPanel();
    }
  });
}

function setFilterPanel(open) {
  $("#filterPanel").classList.toggle("open", open);
  $("#filterToggle").setAttribute("aria-expanded", String(open));
}

function addOption(select, value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  select.appendChild(option);
}

function setupMap() {
  map = L.map("map", {
    zoomControl: false,
    scrollWheelZoom: true,
    preferCanvas: true,
    worldCopyJump: false,
    maxBoundsViscosity: 0.3
  }).setView([39.7, -96.7], 3.1);

  L.control.zoom({ position: "bottomleft" }).addTo(map);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    subdomains: "abcd",
    maxZoom: 19
  }).addTo(map);

  routeLayer = L.layerGroup().addTo(map);
  stadiumLayer = L.layerGroup().addTo(map);
  labelLayer = L.layerGroup().addTo(map);

  addCountryLabels();
}

function addCountryLabels() {
  labelLayer.clearLayers();
  const labels = [
    { name: "Canada", lat: 55.2, lng: -106.3 },
    { name: "USA", lat: 39.1, lng: -98.7 },
    { name: "Mexico", lat: 23.5, lng: -102.1 }
  ];

  labels.forEach((label) => {
    L.marker([label.lat, label.lng], {
      interactive: false,
      icon: L.divIcon({
        className: "",
        html: `<div class="country-label">${label.name}</div>`,
        iconSize: [120, 20],
        iconAnchor: [60, 10]
      })
    }).addTo(labelLayer);
  });
}

function renderEverything() {
  const filtered = getFilteredMatches();
  const matchesByStadium = groupBy(filtered, (match) => match.stadiumId);

  renderStats(filtered, matchesByStadium);
  renderRoutes(filtered);
  renderMarkers(matchesByStadium);
  renderMatchList(filtered);
  renderDataTable(filtered);
  renderBracket();

  if (selectedStadiumId) {
    const selectedMatches = matchesByStadium[selectedStadiumId] || getStadiumMatches(selectedStadiumId);
    renderSelectedStadium(selectedStadiumId, selectedMatches);
  }
}

function getFilteredMatches() {
  const team = $("#teamFilter").value;
  const round = $("#roundFilter").value;
  const stadiumId = $("#stadiumFilter").value;
  const status = $("#statusFilter").value;
  const query = $("#searchFilter").value.trim().toLowerCase();

  return matches.filter((match) => {
    const stadium = stadiumById[match.stadiumId];
    const normalizedStatus = normalizeStatus(match);
    const haystack = [
      match.id,
      match.team1,
      match.team2,
      match.round,
      match.group,
      match.status,
      normalizedStatus,
      stadium?.stadium,
      stadium?.fifaName,
      stadium?.city,
      stadium?.country
    ].join(" ").toLowerCase();

    return (
      (team === "all" || match.team1 === team || match.team2 === team) &&
      (round === "all" || match.round === round) &&
      (stadiumId === "all" || match.stadiumId === stadiumId) &&
      (status === "all" || normalizedStatus === status) &&
      (!query || haystack.includes(query))
    );
  });
}

function renderStats(filtered, matchesByStadium) {
  const visibleStadiums = Object.keys(matchesByStadium).length;
  const teams = getTeams(filtered).size;
  $("#mapStats").innerHTML = [
    [visibleStadiums, "Stadiums"],
    [filtered.length, "Matches"],
    [teams, "Teams"]
  ]
    .map(([value, label]) => `<div class="stat-pill"><strong>${value}</strong><span>${label}</span></div>`)
    .join("");
}

function renderRoutes(filteredMatches) {
  routeLayer.clearLayers();

  const sortedMatches = filteredMatches
    .filter((match) => stadiumById[match.stadiumId])
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  for (let i = 0; i < sortedMatches.length - 1; i += 1) {
    const start = stadiumById[sortedMatches[i].stadiumId];
    const end = stadiumById[sortedMatches[i + 1].stadiumId];
    if (!start || !end || start.id === end.id) continue;

    L.polyline(
      [
        [start.lat, start.lng],
        [end.lat, end.lng]
      ],
      {
        color: "#d6b15e",
        weight: 1.25,
        opacity: 0.28,
        dashArray: "2 9",
        className: "route-line"
      }
    ).addTo(routeLayer);
  }
}

function renderMarkers(matchesByStadium) {
  stadiumLayer.clearLayers();
  markers = [];

  Object.entries(matchesByStadium).forEach(([stadiumId, stadiumMatches]) => {
    const stadium = stadiumById[stadiumId];
    if (!stadium) return;

    const state = getStadiumState(stadiumMatches);
    const icon = L.divIcon({
      className: "cinematic-marker-icon",
      html: markerHTML(state, stadiumId === selectedStadiumId),
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const marker = L.marker([stadium.lat, stadium.lng], { icon, keyboard: true, title: stadium.stadium }).addTo(stadiumLayer);

    marker.on("mouseover", () => showHoverCard(stadium, stadiumMatches));
    marker.on("mousemove", () => moveHoverCard(stadium));
    marker.on("mouseout", hideHoverCard);
    marker.on("click", () => selectStadium(stadium.id, stadiumMatches));

    markers.push(marker);
  });

  if (markers.length) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.23), { maxZoom: 4.8, animate: true, duration: 0.85 });
  }
}

function markerHTML(state, active) {
  return `
    <div class="stadium-marker ${state} ${active ? "active" : ""}">
      <span class="marker-shadow"></span>
      <span class="marker-pulse"></span>
      <span class="marker-ring"></span>
      <span class="marker-core"></span>
    </div>
  `;
}

function showHoverCard(stadium, stadiumMatches) {
  clearTimeout(previewTimer);
  const card = $("#hoverCard");
  const nextMatch = getNextMatch(stadiumMatches);
  const state = getStadiumState(stadiumMatches);

  card.innerHTML = `
    <div class="stadium-image">
      ${imageHTML(stadium)}
      <span>${stadium.fifaName || stadium.stadium}</span>
    </div>
    <div class="hover-content">
      <span class="status-pill ${state}">${state}</span>
      <h3>${stadium.stadium}</h3>
      <p class="selected-meta">${flagForCountry(stadium)} ${stadium.city}, ${stadium.country}</p>
      <div class="hover-grid">
        <div class="data-chip"><span>Capacity</span><strong>${formatNumber(stadium.capacity)}</strong></div>
        <div class="data-chip"><span>Games</span><strong>${stadiumMatches.length}</strong></div>
      </div>
      <div class="next-match">
        <span>Next match</span>
        <strong>${nextMatch ? teamsLine(nextMatch) : "No match in current filter"}</strong>
        <small>${nextMatch ? fmtShortDate(nextMatch.date) : "Reset filters to see all matches"}</small>
      </div>
    </div>
  `;

  moveHoverCard(stadium);
  card.classList.add("visible");
  card.setAttribute("aria-hidden", "false");
}

function moveHoverCard(stadium) {
  const card = $("#hoverCard");
  const shell = $("#mapShell").getBoundingClientRect();
  const point = map.latLngToContainerPoint([stadium.lat, stadium.lng]);
  const cardWidth = 330;
  const leftOffset = point.x > shell.width - cardWidth - 56 ? -cardWidth - 30 : 32;
  const top = clamp(point.y - 118, 88, shell.height - 330);
  const left = clamp(point.x + leftOffset, 16, shell.width - cardWidth - 16);

  card.style.left = `${left}px`;
  card.style.top = `${top}px`;
}

function hideHoverCard() {
  previewTimer = setTimeout(() => {
    const card = $("#hoverCard");
    card.classList.remove("visible");
    card.setAttribute("aria-hidden", "true");
  }, 90);
}

function selectStadium(stadiumId, stadiumMatches = getStadiumMatches(stadiumId)) {
  selectedStadiumId = stadiumId;
  const stadium = stadiumById[stadiumId];
  if (!stadium) return;

  map.flyTo([stadium.lat, stadium.lng], Math.max(map.getZoom(), 5.4), { animate: true, duration: 0.9 });
  renderSelectedStadium(stadiumId, stadiumMatches);
  setFilterPanel(false);
}

function renderSelectedStadium(stadiumId, stadiumMatches = getStadiumMatches(stadiumId)) {
  const stadium = stadiumById[stadiumId];
  const panel = $("#selectedStadium");
  if (!stadium) return;

  const sortedMatches = stadiumMatches.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const nextMatch = getNextMatch(sortedMatches);
  const state = getStadiumState(sortedMatches);

  panel.innerHTML = `
    <div class="stadium-image">
      ${imageHTML(stadium)}
      <span>${stadium.fifaName || stadium.stadium}</span>
    </div>
    <div class="selected-body">
      <div class="selected-top">
        <div>
          <span class="status-pill ${state}">${state}</span>
          <h2>${stadium.stadium}</h2>
          <p class="selected-meta">${flagForCountry(stadium)} ${stadium.city}, ${stadium.country}</p>
        </div>
        <button class="close-btn" id="closeSelected" aria-label="Close stadium card">×</button>
      </div>

      <div class="info-grid">
        <div class="data-chip"><span>Capacity</span><strong>${formatNumber(stadium.capacity)}</strong></div>
        <div class="data-chip"><span>Matches</span><strong>${sortedMatches.length}</strong></div>
        <div class="data-chip"><span>Weather</span><strong>${stadium.weather || "TBD"}</strong></div>
      </div>

      <div class="next-match">
        <span>Next match here</span>
        <strong>${nextMatch ? teamsLine(nextMatch) : "No match in current filter"}</strong>
        <small>${nextMatch ? `${fmtDate(nextMatch.date)} · ${nextMatch.round}` : "Use filters to reveal more fixtures"}</small>
      </div>

      <div class="card-action-row">
        <strong>All matches here</strong>
        <button class="mini-btn" id="viewMatchesHere">View list</button>
      </div>

      <div class="stadium-matches">
        ${sortedMatches.length ? sortedMatches.map(renderStadiumMatchRow).join("") : `<p class="empty-state">No matches visible for this stadium with the current filters.</p>`}
      </div>
    </div>
  `;

  panel.classList.add("open");
  $("#closeSelected").addEventListener("click", closeSelectedPanel);
  $("#viewMatchesHere").addEventListener("click", () => {
    switchToTab("matchesView");
    setTimeout(() => $("#matchList")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  });
}

function closeSelectedPanel() {
  selectedStadiumId = null;
  $("#selectedStadium").classList.remove("open");
  renderEverything();
}

function switchToTab(target) {
  $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === target));
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === target));
  if (target === "mapView" && map) setTimeout(() => map.invalidateSize(), 80);
}

function renderStadiumMatchRow(match) {
  const status = normalizeStatus(match);
  return `
    <div class="match-row">
      <div class="match-teams">
        <span>${teamLabel(match.team1)}</span>
        <span class="versus">VS</span>
        <span>${teamLabel(match.team2)}</span>
      </div>
      <small>${fmtDate(match.date)} · ${match.round} · ${status}</small>
    </div>
  `;
}

function renderMatchList(filteredMatches) {
  const target = $("#matchList");

  if (!filteredMatches.length) {
    target.innerHTML = `<div class="empty-state"><h3>No matches found</h3><p>Reset filters or search for a different team, city, or stadium.</p></div>`;
    return;
  }

  target.innerHTML = filteredMatches
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((match) => {
      const stadium = stadiumById[match.stadiumId];
      const status = normalizeStatus(match);
      return `
        <article class="match-card">
          <div class="card-head">
            <small>M${match.id} · ${match.round}</small>
            <span class="status-pill ${status}">${status}</span>
          </div>
          <h3>${teamLabel(match.team1)} <span class="versus">VS</span> ${teamLabel(match.team2)}</h3>
          <p class="match-meta">${fmtDate(match.date)}</p>
          <p class="match-meta">${stadium?.stadium || "TBD"}<br>${stadium ? `${flagForCountry(stadium)} ${stadium.city}, ${stadium.country}` : ""}</p>
          <div class="card-action-row">
            <span>${stadium?.weather || "Weather TBD"}</span>
            <button class="mini-btn show-on-map" data-stadium="${match.stadiumId}">Show on map</button>
          </div>
        </article>
      `;
    })
    .join("");

  $$(".show-on-map").forEach((button) => {
    button.addEventListener("click", () => {
      switchToTab("mapView");
      const stadiumMatches = getFilteredMatches().filter((match) => match.stadiumId === button.dataset.stadium);
      setTimeout(() => selectStadium(button.dataset.stadium, stadiumMatches), 90);
    });
  });
}

function renderDataTable(filteredMatches) {
  $("#dataTable tbody").innerHTML = filteredMatches
    .slice()
    .sort((a, b) => a.id - b.id)
    .map((match) => {
      const stadium = stadiumById[match.stadiumId];
      const status = normalizeStatus(match);
      return `
        <tr>
          <td>M${match.id}</td>
          <td>${fmtDate(match.date)}</td>
          <td>${match.round}</td>
          <td>${teamLabel(match.team1)}</td>
          <td>${teamLabel(match.team2)}</td>
          <td>${stadium?.stadium || "TBD"}</td>
          <td>${stadium ? `${flagForCountry(stadium)} ${stadium.city}, ${stadium.country}` : "TBD"}</td>
          <td><span class="status-pill ${status}">${status}</span></td>
        </tr>
      `;
    })
    .join("");
}

function renderBracket() {
  $("#bracket").innerHTML = bracketRounds
    .map((round) => `
      <section class="round">
        <h3>${round.name}</h3>
        ${round.matchIds.map((id) => renderBracketMatch(bracketMatches[id] || fallbackBracketMatch(id))).join("")}
      </section>
    `)
    .join("");
}

function renderBracketMatch(match) {
  return `
    <article class="bracket-match">
      <div class="bracket-id"><span>M${match.id}</span><span>${match.winner || `Winner M${match.id}`}</span></div>
      <div class="team-row"><span>${teamLabel(match.team1)}</span><span class="score">${match.score1 ?? "—"}</span></div>
      <div class="team-row"><span>${teamLabel(match.team2)}</span><span class="score">${match.score2 ?? "—"}</span></div>
    </article>
  `;
}

function fallbackBracketMatch(id) {
  return {
    id,
    team1: `Winner M${id * 2 - 1}`,
    team2: `Winner M${id * 2}`,
    score1: null,
    score2: null,
    winner: `Winner M${id}`
  };
}

function getTeams(items) {
  const teams = new Set();
  items.forEach((match) => {
    [match.team1, match.team2].forEach((team) => {
      if (!team) return;
      if (team === "TBD") return;
      if (team.startsWith("Winner") || team.startsWith("Runner") || team.includes("qualifier")) return;
      teams.add(team);
    });
  });
  return teams;
}

function groupBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] ||= [];
    acc[key].push(item);
    return acc;
  }, {});
}

function normalizeStatus(match) {
  const explicit = String(match.status || "").toLowerCase();
  const round = String(match.round || "").toLowerCase();

  if (["live", "finished", "upcoming"].includes(explicit)) return explicit;
  if (round.includes("final") && !round.includes("quarter") && !round.includes("semi")) return "final";
  if (round.includes("round") || round.includes("quarter") || round.includes("semi") || match.group === "Knockout") return "knockout";
  return "upcoming";
}

function getStadiumState(stadiumMatches) {
  if (!stadiumMatches.length) return "upcoming";
  const states = stadiumMatches.map(normalizeStatus);
  if (states.includes("live")) return "live";
  if (states.includes("final")) return "final";
  if (states.includes("knockout")) return "knockout";
  if (states.every((state) => state === "finished")) return "finished";
  return "upcoming";
}

function getStadiumMatches(stadiumId) {
  return matches.filter((match) => match.stadiumId === stadiumId);
}

function getNextMatch(stadiumMatches) {
  const now = Date.now();
  const upcoming = stadiumMatches
    .filter((match) => new Date(match.date).getTime() >= now || normalizeStatus(match) !== "finished")
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return upcoming[0] || stadiumMatches.slice().sort((a, b) => new Date(a.date) - new Date(b.date))[0];
}

function flagForTeam(team) {
  return teamFlags[team] || "🌐";
}

function flagForCountry(stadium) {
  return countryFlags[stadium.countryCode] || countryFlags[stadium.country] || "🏟️";
}

function teamLabel(team) {
  if (!team || team === "TBD") return "🌐 TBD";
  if (team.startsWith("Winner") || team.startsWith("Runner") || team.includes("qualifier")) return `◇ ${team}`;
  return `${flagForTeam(team)} ${team}`;
}

function teamsLine(match) {
  return `${teamLabel(match.team1)} vs ${teamLabel(match.team2)}`;
}

function imageHTML(stadium) {
  if (!stadium.image) return "";
  return `<img src="${stadium.image}" alt="${stadium.stadium}" onerror="this.remove()" />`;
}

function formatNumber(value) {
  if (!Number.isFinite(Number(value))) return "TBD";
  return new Intl.NumberFormat().format(value);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setupAmbient() {
  if (!window.THREE) return;

  const canvas = $("#ambientCanvas");
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 18;

  const count = window.innerWidth < 760 ? 85 : 150;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 36;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 24;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xd6b15e,
    size: 0.035,
    transparent: true,
    opacity: 0.72
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  function animate(time) {
    particles.rotation.y = time * 0.000035;
    particles.rotation.x = Math.sin(time * 0.00008) * 0.05;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(animate);
}

document.addEventListener("DOMContentLoaded", init);
