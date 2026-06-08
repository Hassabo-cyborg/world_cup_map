const { stadiums, matches, bracketRounds, bracketMatches } = window.WC_DATA;
const stadiumById = Object.fromEntries(stadiums.map(s => [s.id, s]));
let map;
let markers = [];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const fmtDate = (iso) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

function init() {
  renderStats();
  setupTabs();
  setupFilters();
  setupMap();
  renderEverything();
}

function renderStats() {
  const teams = getTeams(matches);
  $('#stats').innerHTML = [
    [matches.length, 'Matches in data'],
    [stadiums.length, 'Stadiums'],
    [teams.size, 'Teams in data']
  ].map(([value, label]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`).join('');
}

function setupTabs() {
  $$('.tab').forEach(button => {
    button.addEventListener('click', () => {
      $$('.tab').forEach(t => t.classList.remove('active'));
      $$('.panel').forEach(p => p.classList.remove('active'));
      button.classList.add('active');
      $('#' + button.dataset.tab).classList.add('active');
      if (button.dataset.tab === 'mapTab') setTimeout(() => map.invalidateSize(), 50);
    });
  });
}

function setupFilters() {
  const teamSelect = $('#teamFilter');
  [...getTeams(matches)].sort().forEach(team => addOption(teamSelect, team, team));

  const roundSelect = $('#roundFilter');
  [...new Set(matches.map(m => m.round))].sort().forEach(round => addOption(roundSelect, round, round));

  const stadiumSelect = $('#stadiumFilter');
  stadiums.slice().sort((a,b) => a.city.localeCompare(b.city)).forEach(s => addOption(stadiumSelect, s.id, `${s.city} — ${s.stadium}`));

  ['teamFilter', 'roundFilter', 'stadiumFilter', 'searchFilter'].forEach(id => $('#' + id).addEventListener('input', renderEverything));
  $('#resetFilters').addEventListener('click', () => {
    $('#teamFilter').value = 'all';
    $('#roundFilter').value = 'all';
    $('#stadiumFilter').value = 'all';
    $('#searchFilter').value = '';
    renderEverything();
  });
}

function addOption(select, value, text) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = text;
  select.appendChild(option);
}

function setupMap() {
  map = L.map('map', { scrollWheelZoom: true }).setView([39.8, -96.6], 3);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
}

function renderEverything() {
  const filtered = getFilteredMatches();
  renderMarkers(filtered);
  renderMatchList(filtered);
  renderDataTable(filtered);
  renderBracket();
}

function getFilteredMatches() {
  const team = $('#teamFilter').value;
  const round = $('#roundFilter').value;
  const stadiumId = $('#stadiumFilter').value;
  const q = $('#searchFilter').value.trim().toLowerCase();

  return matches.filter(match => {
    const stadium = stadiumById[match.stadiumId];
    const haystack = `${match.id} ${match.team1} ${match.team2} ${match.round} ${match.group} ${stadium?.stadium} ${stadium?.city} ${stadium?.country}`.toLowerCase();
    return (team === 'all' || match.team1 === team || match.team2 === team)
      && (round === 'all' || match.round === round)
      && (stadiumId === 'all' || match.stadiumId === stadiumId)
      && (!q || haystack.includes(q));
  });
}

function renderMarkers(filteredMatches) {
  markers.forEach(marker => marker.remove());
  markers = [];

  const matchesByStadium = groupBy(filteredMatches, m => m.stadiumId);
  Object.entries(matchesByStadium).forEach(([stadiumId, stadiumMatches]) => {
    const stadium = stadiumById[stadiumId];
    if (!stadium) return;
    const icon = L.divIcon({
      className: '',
      html: `<div class="marker-pin"><span>${stadiumMatches.length}</span></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 34]
    });
    const popupHtml = `
      <strong>${stadium.stadium}</strong><br />
      ${stadium.city}, ${stadium.country}<br />
      <span class="pill">${stadiumMatches.length} shown match${stadiumMatches.length === 1 ? '' : 'es'}</span>
      <hr />
      ${stadiumMatches.slice(0, 8).map(m => `<div><strong>M${m.id}</strong> ${m.team1} vs ${m.team2}<br /><small>${fmtDate(m.date)}</small></div>`).join('<br />')}
      ${stadiumMatches.length > 8 ? `<br /><small>+${stadiumMatches.length - 8} more</small>` : ''}
    `;
    const marker = L.marker([stadium.lat, stadium.lng], { icon }).addTo(map).bindPopup(popupHtml);
    markers.push(marker);
  });

  if (markers.length) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.24), { maxZoom: 5 });
  }
}

function renderMatchList(filteredMatches) {
  const target = $('#matchList');
  if (!filteredMatches.length) {
    target.innerHTML = '<div class="match-card"><h3>No matches found</h3><p class="match-meta">Try resetting filters.</p></div>';
    return;
  }

  target.innerHTML = filteredMatches
    .slice()
    .sort((a,b) => new Date(a.date) - new Date(b.date))
    .map(match => {
      const stadium = stadiumById[match.stadiumId];
      return `
        <article class="match-card">
          <span class="pill">M${match.id}</span><span class="pill">${match.round}</span><span class="pill">${match.status}</span>
          <h3>${match.team1} vs ${match.team2}</h3>
          <p class="match-meta">${fmtDate(match.date)}<br />${stadium.stadium}<br />${stadium.city}, ${stadium.country}</p>
          <div class="card-action" data-stadium="${match.stadiumId}">Show on map</div>
        </article>`;
    }).join('');

  $$('.card-action').forEach(action => {
    action.addEventListener('click', () => {
      const stadium = stadiumById[action.dataset.stadium];
      map.flyTo([stadium.lat, stadium.lng], 10, { duration: 0.8 });
    });
  });
}

function renderDataTable(filteredMatches) {
  $('#dataTable tbody').innerHTML = filteredMatches
    .slice()
    .sort((a,b) => a.id - b.id)
    .map(match => {
      const stadium = stadiumById[match.stadiumId];
      return `<tr>
        <td>M${match.id}</td>
        <td>${fmtDate(match.date)}</td>
        <td>${match.round}</td>
        <td>${match.team1}</td>
        <td>${match.team2}</td>
        <td>${stadium.stadium}</td>
        <td>${stadium.city}, ${stadium.country}</td>
      </tr>`;
    }).join('');
}

function renderBracket() {
  $('#bracket').innerHTML = `<div class="bracket">${bracketRounds.map(round => `
    <section class="round">
      <h3>${round.name}</h3>
      ${round.matchIds.map(id => renderBracketMatch(bracketMatches[id] || fallbackBracketMatch(id))).join('')}
    </section>
  `).join('')}</div>`;
}

function renderBracketMatch(match) {
  return `<article class="bracket-match">
    <div class="bracket-id">M${match.id}</div>
    <div class="team-row"><span>${match.team1}</span><span class="score">${match.score1 ?? ''}</span></div>
    <div class="team-row"><span>${match.team2}</span><span class="score">${match.score2 ?? ''}</span></div>
    <span class="pill">${match.winner || `Winner M${match.id}`}</span>
  </article>`;
}

function fallbackBracketMatch(id) {
  return { id, team1: `Winner M${id * 2 - 1}`, team2: `Winner M${id * 2}`, score1: null, score2: null, winner: `Winner M${id}` };
}

function getTeams(items) {
  const teams = new Set();
  items.forEach(match => [match.team1, match.team2].forEach(team => {
    if (team && team !== 'TBD' && !team.startsWith('Winner') && !team.startsWith('Runner') && !team.includes('qualifier')) teams.add(team);
  }));
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

document.addEventListener('DOMContentLoaded', init);
