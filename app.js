/* World Cup 2026 Map — cinematic facelift v2
   Fixes:
   - markers render even when a stadium has no visible match yet
   - selected stadium card floats on top of the map near click / marker
   - hover card follows the mouse
   - app survives if data.js fails or is accidentally malformed
*/

const fallbackData = {
  stadiums: [
    { id: "MEX", fifaName: "Mexico City Stadium", stadium: "Estadio Azteca", city: "Mexico City", country: "Mexico", countryCode: "MX", lat: 19.3029, lng: -99.1505, capacity: 87523, image: "assets/stadiums/mexico-city.jpg", weather: "22°C · Clear" },
    { id: "GDL", fifaName: "Guadalajara Stadium", stadium: "Estadio Akron", city: "Guadalajara", country: "Mexico", countryCode: "MX", lat: 20.6818, lng: -103.4624, capacity: 48071, image: "assets/stadiums/guadalajara.jpg", weather: "25°C · Clear" },
    { id: "MTY", fifaName: "Monterrey Stadium", stadium: "Estadio BBVA", city: "Monterrey", country: "Mexico", countryCode: "MX", lat: 25.6689, lng: -100.2440, capacity: 53500, image: "assets/stadiums/monterrey.jpg", weather: "30°C · Dry" },
    { id: "TOR", fifaName: "Toronto Stadium", stadium: "BMO Field", city: "Toronto", country: "Canada", countryCode: "CA", lat: 43.6332, lng: -79.4186, capacity: 45000, image: "assets/stadiums/toronto.jpg", weather: "21°C · Mild" },
    { id: "VAN", fifaName: "Vancouver Stadium", stadium: "BC Place", city: "Vancouver", country: "Canada", countryCode: "CA", lat: 49.2768, lng: -123.1119, capacity: 54500, image: "assets/stadiums/vancouver.jpg", weather: "18°C · Cloudy" },
    { id: "ATL", fifaName: "Atlanta Stadium", stadium: "Mercedes-Benz Stadium", city: "Atlanta", country: "USA", countryCode: "US", lat: 33.7554, lng: -84.4008, capacity: 71000, image: "assets/stadiums/atlanta.jpg", weather: "28°C · Humid" },
    { id: "BOS", fifaName: "Boston Stadium", stadium: "Gillette Stadium", city: "Boston / Foxborough", country: "USA", countryCode: "US", lat: 42.0909, lng: -71.2643, capacity: 65878, image: "assets/stadiums/boston.jpg", weather: "23°C · Clear" },
    { id: "DAL", fifaName: "Dallas Stadium", stadium: "AT&T Stadium", city: "Dallas / Arlington", country: "USA", countryCode: "US", lat: 32.7473, lng: -97.0945, capacity: 80000, image: "assets/stadiums/dallas.jpg", weather: "31°C · Hot" },
    { id: "HOU", fifaName: "Houston Stadium", stadium: "NRG Stadium", city: "Houston", country: "USA", countryCode: "US", lat: 29.6847, lng: -95.4107, capacity: 72220, image: "assets/stadiums/houston.jpg", weather: "30°C · Humid" },
    { id: "KC", fifaName: "Kansas City Stadium", stadium: "Arrowhead Stadium", city: "Kansas City", country: "USA", countryCode: "US", lat: 39.0490, lng: -94.4839, capacity: 76416, image: "assets/stadiums/kansas-city.jpg", weather: "26°C · Clear" },
    { id: "LA", fifaName: "Los Angeles Stadium", stadium: "SoFi Stadium", city: "Los Angeles / Inglewood", country: "USA", countryCode: "US", lat: 33.9535, lng: -118.3392, capacity: 70240, image: "assets/stadiums/los-angeles.jpg", weather: "24°C · Clear" },
    { id: "MIA", fifaName: "Miami Stadium", stadium: "Hard Rock Stadium", city: "Miami", country: "USA", countryCode: "US", lat: 25.9580, lng: -80.2389, capacity: 64767, image: "assets/stadiums/miami.jpg", weather: "29°C · Humid" },
    { id: "NYNJ", fifaName: "New York New Jersey Stadium", stadium: "MetLife Stadium", city: "New York / New Jersey", country: "USA", countryCode: "US", lat: 40.8135, lng: -74.0745, capacity: 82500, image: "assets/stadiums/new-york-new-jersey.jpg", weather: "24°C · Clear" },
    { id: "PHI", fifaName: "Philadelphia Stadium", stadium: "Lincoln Financial Field", city: "Philadelphia", country: "USA", countryCode: "US", lat: 39.9008, lng: -75.1675, capacity: 67594, image: "assets/stadiums/philadelphia.jpg", weather: "25°C · Mild" },
    { id: "SF", fifaName: "San Francisco Bay Area Stadium", stadium: "Levi's Stadium", city: "San Francisco Bay Area / Santa Clara", country: "USA", countryCode: "US", lat: 37.4030, lng: -121.9700, capacity: 68500, image: "assets/stadiums/san-francisco.jpg", weather: "19°C · Breezy" },
    { id: "SEA", fifaName: "Seattle Stadium", stadium: "Lumen Field", city: "Seattle", country: "USA", countryCode: "US", lat: 47.5952, lng: -122.3316, capacity: 68740, image: "assets/stadiums/seattle.jpg", weather: "18°C · Cloudy" }
  ],
  matches: [
    { id: 1, date: "2026-06-11T13:00:00-06:00", round: "Group stage", group: "Group A", team1: "Mexico", team2: "South Africa", stadiumId: "MEX", status: "scheduled" },
    { id: 2, date: "2026-06-11T20:00:00-04:00", round: "Group stage", group: "Group K", team1: "TBD", team2: "TBD", stadiumId: "ATL", status: "sample" },
    { id: 3, date: "2026-06-12T15:00:00-04:00", round: "Group stage", group: "Group B", team1: "Canada", team2: "TBD", stadiumId: "TOR", status: "sample" },
    { id: 4, date: "2026-06-12T18:00:00-07:00", round: "Group stage", group: "Group D", team1: "USA", team2: "TBD", stadiumId: "LA", status: "sample" },
    { id: 85, date: "2026-06-28T15:00:00-07:00", round: "Round of 32", group: "Knockout", team1: "Winner Group A", team2: "Runner-up Group B", stadiumId: "LA", status: "placeholder" },
    { id: 97, date: "2026-07-09T19:00:00-04:00", round: "Quarter-final", group: "Knockout", team1: "Winner M89", team2: "Winner M90", stadiumId: "BOS", status: "placeholder" },
    { id: 101, date: "2026-07-14T20:00:00-05:00", round: "Semi-final", group: "Knockout", team1: "Winner M97", team2: "Winner M98", stadiumId: "DAL", status: "placeholder" },
    { id: 104, date: "2026-07-19T15:00:00-04:00", round: "Final", group: "Knockout", team1: "Winner M102", team2: "Winner M103", stadiumId: "NYNJ", status: "placeholder" }
  ],
  bracketRounds: [
    { name: "Round of 32", matchIds: [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88] },
    { name: "Round of 16", matchIds: [89, 90, 91, 92, 93, 94, 95, 96] },
    { name: "Quarter-finals", matchIds: [97, 98, 99, 100] },
    { name: "Semi-finals", matchIds: [101, 102] },
    { name: "Final", matchIds: [104] }
  ],
  bracketMatches: {}
};

const sourceData = window.WC_DATA && Array.isArray(window.WC_DATA.stadiums) ? window.WC_DATA : fallbackData;
const stadiums = Array.isArray(sourceData.stadiums) ? sourceData.stadiums : fallbackData.stadiums;
const matches = Array.isArray(sourceData.matches) ? sourceData.matches : fallbackData.matches;
const bracketRounds = Array.isArray(sourceData.bracketRounds) ? sourceData.bracketRounds : fallbackData.bracketRounds;
const bracketMatches = sourceData.bracketMatches && typeof sourceData.bracketMatches === "object" ? sourceData.bracketMatches : fallbackData.bracketMatches;

const stadiumById = Object.fromEntries(stadiums.map((stadium) => [stadium.id, stadium]));
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

let map;
let stadiumLayer;
let routeLayer;
let labelLayer;
let markers = [];
let selectedStadiumId = null;
let selectedAnchorPoint = null;
let previewTimer = null;
let hasFitInitialBounds = false;

const teamFlags = {
  Mexico: "🇲🇽",
  Canada: "🇨🇦",
  USA: "🇺🇸",
  "United States": "🇺🇸",
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
  "United States": "🇺🇸",
  MX: "🇲🇽",
  Mexico: "🇲🇽",
  CA: "🇨🇦",
  Canada: "🇨🇦"
};

function fmtDate(iso) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(iso));
}

function fmtShortDate(iso) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(iso));
}

function init() {
  if (!window.L) {
    showMapError("Leaflet did not load. Check your internet connection or the CDN script in index.html.");
    return;
  }

  setupTheme();
  setupTabs();
  setupFilters();
  setupMap();
  setupAmbient();
  renderEverything();

  window.addEventListener("resize", () => {
    if (map) map.invalidateSize();
    if (selectedStadiumId) positionSelectedPanel(selectedAnchorPoint || pointForStadium(stadiumById[selectedStadiumId]));
  });
}

function showMapError(message) {
  const mapElement = $("#map");
  if (!mapElement) return;
  mapElement.innerHTML = `<div class="map-error"><strong>Map failed to load</strong><span>${message}</span></div>`;
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
      switchToTab(target);
    });
  });
}

function setupFilters() {
  const teamSelect = $("#teamFilter");
  [...getTeams(matches)].sort().forEach((team) => addOption(teamSelect, team, `${flagForTeam(team)} ${team}`));

  const roundSelect = $("#roundFilter");
  [...new Set(matches.map((match) => match.round).filter(Boolean))]
    .sort()
    .forEach((round) => addOption(roundSelect, round, round));

  const stadiumSelect = $("#stadiumFilter");
  stadiums
    .slice()
    .sort((a, b) => a.city.localeCompare(b.city))
    .forEach((stadium) => addOption(stadiumSelect, stadium.id, `${flagForCountry(stadium)} ${stadium.city} — ${stadium.stadium}`));

  ["teamFilter", "roundFilter", "stadiumFilter", "statusFilter", "searchFilter"].forEach((id) => {
    $("#" + id).addEventListener("input", () => {
      selectedStadiumId = null;
      $("#selectedStadium").classList.remove("open");
      renderEverything();
    });
  });

  $("#resetFilters").addEventListener("click", () => {
    $("#teamFilter").value = "all";
    $("#roundFilter").value = "all";
    $("#stadiumFilter").value = "all";
    $("#statusFilter").value = "all";
    $("#searchFilter").value = "";
    selectedStadiumId = null;
    $("#selectedStadium").classList.remove("open");
    renderEverything();
  });

  $("#filterToggle").addEventListener("click", () => setFilterPanel(true));
  $("#filterClose").addEventListener("click", () => setFilterPanel(false));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setFilterPanel(false);
      closeSelectedPanel();
      hideHoverCard(true);
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
  }).setView([39.7, -96.7], 3);

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

  map.on("click", (event) => {
    if (event.originalEvent?.target?.closest?.(".leaflet-marker-icon")) return;
    hideHoverCard(true);
  });
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
  const filteredMatches = getFilteredMatches();
  const visibleStadiums = getVisibleStadiums(filteredMatches);
  const matchesByStadium = groupBy(filteredMatches, (match) => match.stadiumId);

  renderStats(filteredMatches, visibleStadiums);
  renderRoutes(filteredMatches);
  renderMarkers(visibleStadiums, matchesByStadium);
  renderMatchList(filteredMatches);
  renderDataTable(filteredMatches);
  renderBracket();

  if (selectedStadiumId) {
    const selectedMatches = matchesByStadium[selectedStadiumId] || getStadiumMatches(selectedStadiumId);
    renderSelectedStadium(selectedStadiumId, selectedMatches, selectedAnchorPoint || pointForStadium(stadiumById[selectedStadiumId]));
  }
}

function readFilters() {
  return {
    team: $("#teamFilter").value,
    round: $("#roundFilter").value,
    stadiumId: $("#stadiumFilter").value,
    status: $("#statusFilter").value,
    query: $("#searchFilter").value.trim().toLowerCase()
  };
}

function getFilteredMatches() {
  const filters = readFilters();

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
    ]
      .join(" ")
      .toLowerCase();

    return (
      (filters.team === "all" || match.team1 === filters.team || match.team2 === filters.team) &&
      (filters.round === "all" || match.round === filters.round) &&
      (filters.stadiumId === "all" || match.stadiumId === filters.stadiumId) &&
      (filters.status === "all" || normalizedStatus === filters.status) &&
      (!filters.query || haystack.includes(filters.query))
    );
  });
}

function getVisibleStadiums(filteredMatches) {
  const filters = readFilters();
  const filteredByStadium = groupBy(filteredMatches, (match) => match.stadiumId);
  const hasMatchFilter = filters.team !== "all" || filters.round !== "all" || filters.status !== "all";

  return stadiums.filter((stadium) => {
    const allStadiumMatches = getStadiumMatches(stadium.id);
    const visibleMatches = filteredByStadium[stadium.id] || [];
    const stadiumText = [stadium.id, stadium.stadium, stadium.fifaName, stadium.city, stadium.country]
      .join(" ")
      .toLowerCase();

    if (filters.stadiumId !== "all" && stadium.id !== filters.stadiumId) return false;
    if (hasMatchFilter && !visibleMatches.length) return false;

    if (filters.query) {
      return stadiumText.includes(filters.query) || visibleMatches.length > 0 || allStadiumMatches.some((match) => {
        const text = [match.team1, match.team2, match.round, match.group, match.status].join(" ").toLowerCase();
        return text.includes(filters.query);
      });
    }

    return true;
  });
}

function renderStats(filteredMatches, visibleStadiums) {
  const teams = getTeams(filteredMatches).size;
  $("#mapStats").innerHTML = [
    [visibleStadiums.length, "Stadiums"],
    [filteredMatches.length, "Matches"],
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

function renderMarkers(visibleStadiums, matchesByStadium) {
  stadiumLayer.clearLayers();
  markers = [];

  visibleStadiums.forEach((stadium) => {
    const stadiumMatches = matchesByStadium[stadium.id] || getStadiumMatches(stadium.id);
    const state = getStadiumState(stadiumMatches);
    const icon = L.divIcon({
      className: "cinematic-marker-icon",
      html: markerHTML(state, stadium.id === selectedStadiumId),
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const marker = L.marker([stadium.lat, stadium.lng], {
      icon,
      keyboard: true,
      title: `${stadium.stadium} — ${stadium.city}`
    }).addTo(stadiumLayer);

    marker.on("mouseover", (event) => showHoverCard(stadium, stadiumMatches, event.originalEvent));
    marker.on("mousemove", (event) => moveHoverCardToPointer(event.originalEvent));
    marker.on("mouseout", () => hideHoverCard(false));
    marker._stadiumId = stadium.id;

    marker.on("click", (event) => {
      if (event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent);
      const clickPoint = event.containerPoint || pointForStadium(stadium);
      selectStadium(stadium.id, stadiumMatches, clickPoint);
    });

    markers.push(marker);
  });

  fitToMarkersWhenNeeded(visibleStadiums);
}

function fitToMarkersWhenNeeded(visibleStadiums) {
  if (!visibleStadiums.length || !markers.length) return;

  const filters = readFilters();
  const filtersActive = filters.team !== "all" || filters.round !== "all" || filters.stadiumId !== "all" || filters.status !== "all" || Boolean(filters.query);

  if (!hasFitInitialBounds || filtersActive) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.22), {
      maxZoom: filters.stadiumId !== "all" ? 5.2 : 4.35,
      animate: true,
      duration: 0.75
    });
    hasFitInitialBounds = true;
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

function showHoverCard(stadium, stadiumMatches, pointerEvent) {
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
        <strong>${nextMatch ? teamsLine(nextMatch) : "No match listed yet"}</strong>
        <small>${nextMatch ? fmtShortDate(nextMatch.date) : "Add fixture data to show match info"}</small>
      </div>
    </div>
  `;

  moveHoverCardToPointer(pointerEvent, stadium);
  card.classList.add("visible");
  card.setAttribute("aria-hidden", "false");
}

function moveHoverCardToPointer(pointerEvent, stadiumFallback) {
  const card = $("#hoverCard");
  if (!card) return;

  const shell = $("#mapShell").getBoundingClientRect();
  const fallbackPoint = stadiumFallback ? pointForStadium(stadiumFallback) : { x: shell.width / 2, y: shell.height / 2 };
  const pointerX = pointerEvent ? pointerEvent.clientX - shell.left : fallbackPoint.x;
  const pointerY = pointerEvent ? pointerEvent.clientY - shell.top : fallbackPoint.y;

  positionFloatingElement(card, pointerX, pointerY, 330, 360, 22);
}

function hideHoverCard(immediate = false) {
  clearTimeout(previewTimer);
  const close = () => {
    const card = $("#hoverCard");
    card.classList.remove("visible");
    card.setAttribute("aria-hidden", "true");
  };

  if (immediate) close();
  else previewTimer = setTimeout(close, 90);
}

function selectStadium(stadiumId, stadiumMatches = getStadiumMatches(stadiumId), anchorPoint = null) {
  selectedStadiumId = stadiumId;
  const stadium = stadiumById[stadiumId];
  if (!stadium) return;

  selectedAnchorPoint = anchorPoint || pointForStadium(stadium);
  activateMarkerByStadiumId(stadiumId);
  hideHoverCard(true);
  setFilterPanel(false);

  map.flyTo([stadium.lat, stadium.lng], Math.max(map.getZoom(), 4.9), {
    animate: true,
    duration: 0.75
  });

  renderSelectedStadium(stadiumId, stadiumMatches, selectedAnchorPoint);
}

function renderSelectedStadium(stadiumId, stadiumMatches = getStadiumMatches(stadiumId), anchorPoint = null) {
  const stadium = stadiumById[stadiumId];
  const panel = $("#selectedStadium");
  if (!stadium || !panel) return;

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
        <strong>${nextMatch ? teamsLine(nextMatch) : "No match listed yet"}</strong>
        <small>${nextMatch ? `${fmtDate(nextMatch.date)} · ${nextMatch.round}` : "Add fixture data to show match info"}</small>
      </div>

      <div class="card-action-row">
        <strong>All matches here</strong>
        <button class="mini-btn" id="viewMatchesHere">View list</button>
      </div>

      <div class="stadium-matches">
        ${sortedMatches.length ? sortedMatches.map(renderStadiumMatchRow).join("") : `<p class="empty-state">No matches are listed for this stadium yet.</p>`}
      </div>
    </div>
  `;

  panel.classList.add("open");
  positionSelectedPanel(anchorPoint || pointForStadium(stadium));

  $("#closeSelected").addEventListener("click", closeSelectedPanel);
  $("#viewMatchesHere").addEventListener("click", () => {
    switchToTab("matchesView");
    setTimeout(() => $("#matchList")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  });
}

function positionSelectedPanel(anchorPoint) {
  const panel = $("#selectedStadium");
  if (!panel || !anchorPoint) return;

  if (window.matchMedia("(max-width: 760px)").matches) {
    panel.style.left = "";
    panel.style.top = "";
    return;
  }

  positionFloatingElement(panel, anchorPoint.x, anchorPoint.y, 430, Math.min(panel.scrollHeight || 580, window.innerHeight - 120), 28);
}

function positionFloatingElement(element, x, y, width, height, offset) {
  const shell = $("#mapShell").getBoundingClientRect();
  const safeTop = 92;
  const safeBottom = 24;
  const safeX = 18;

  const measuredWidth = Math.min(width, shell.width - safeX * 2);
  const measuredHeight = Math.min(height, shell.height - safeTop - safeBottom);

  let left = x + offset;
  if (left + measuredWidth > shell.width - safeX) left = x - measuredWidth - offset;
  if (left < safeX) left = safeX;

  let top = y - 72;
  if (top + measuredHeight > shell.height - safeBottom) top = shell.height - measuredHeight - safeBottom;
  if (top < safeTop) top = safeTop;

  element.style.left = `${Math.round(left)}px`;
  element.style.top = `${Math.round(top)}px`;
}

function pointForStadium(stadium) {
  if (!stadium || !map) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  return map.latLngToContainerPoint([stadium.lat, stadium.lng]);
}

function closeSelectedPanel() {
  selectedStadiumId = null;
  selectedAnchorPoint = null;
  activateMarkerByStadiumId(null);
  const panel = $("#selectedStadium");
  if (!panel) return;
  panel.classList.remove("open");
}

function activateMarkerByStadiumId(stadiumId) {
  markers.forEach((marker) => {
    const element = marker.getElement?.();
    const markerNode = element?.querySelector?.(".stadium-marker");
    if (!markerNode) return;
    markerNode.classList.toggle("active", Boolean(stadiumId) && marker._stadiumId === stadiumId);
  });
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
      setTimeout(() => {
        const stadium = stadiumById[button.dataset.stadium];
        selectStadium(button.dataset.stadium, stadiumMatches, pointForStadium(stadium));
      }, 90);
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
  if (!stadiumMatches.length) return null;
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
