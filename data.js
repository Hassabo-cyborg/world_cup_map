// Replace/extend the sample fixtures below with the full official schedule you are allowed to use.
// Keep the same field names so the map, filters, table, and bracket update automatically.
window.WC_DATA = {
  stadiums: [
    { id: "MEX", fifaName: "Mexico City Stadium", stadium: "Estadio Azteca", city: "Mexico City", country: "Mexico", lat: 19.3029, lng: -99.1505, capacity: 87523 },
    { id: "GDL", fifaName: "Guadalajara Stadium", stadium: "Estadio Akron", city: "Guadalajara", country: "Mexico", lat: 20.6818, lng: -103.4624, capacity: 48071 },
    { id: "MTY", fifaName: "Monterrey Stadium", stadium: "Estadio BBVA", city: "Monterrey", country: "Mexico", lat: 25.6689, lng: -100.2440, capacity: 53500 },
    { id: "TOR", fifaName: "Toronto Stadium", stadium: "BMO Field", city: "Toronto", country: "Canada", lat: 43.6332, lng: -79.4186, capacity: 45000 },
    { id: "VAN", fifaName: "Vancouver Stadium", stadium: "BC Place", city: "Vancouver", country: "Canada", lat: 49.2768, lng: -123.1119, capacity: 54500 },
    { id: "ATL", fifaName: "Atlanta Stadium", stadium: "Mercedes-Benz Stadium", city: "Atlanta", country: "USA", lat: 33.7554, lng: -84.4008, capacity: 71000 },
    { id: "BOS", fifaName: "Boston Stadium", stadium: "Gillette Stadium", city: "Boston / Foxborough", country: "USA", lat: 42.0909, lng: -71.2643, capacity: 65878 },
    { id: "DAL", fifaName: "Dallas Stadium", stadium: "AT&T Stadium", city: "Dallas / Arlington", country: "USA", lat: 32.7473, lng: -97.0945, capacity: 80000 },
    { id: "HOU", fifaName: "Houston Stadium", stadium: "NRG Stadium", city: "Houston", country: "USA", lat: 29.6847, lng: -95.4107, capacity: 72220 },
    { id: "KC", fifaName: "Kansas City Stadium", stadium: "Arrowhead Stadium", city: "Kansas City", country: "USA", lat: 39.0490, lng: -94.4839, capacity: 76416 },
    { id: "LA", fifaName: "Los Angeles Stadium", stadium: "SoFi Stadium", city: "Los Angeles / Inglewood", country: "USA", lat: 33.9535, lng: -118.3392, capacity: 70240 },
    { id: "MIA", fifaName: "Miami Stadium", stadium: "Hard Rock Stadium", city: "Miami", country: "USA", lat: 25.9580, lng: -80.2389, capacity: 64767 },
    { id: "NYNJ", fifaName: "New York New Jersey Stadium", stadium: "MetLife Stadium", city: "New York / New Jersey", country: "USA", lat: 40.8135, lng: -74.0745, capacity: 82500 },
    { id: "PHI", fifaName: "Philadelphia Stadium", stadium: "Lincoln Financial Field", city: "Philadelphia", country: "USA", lat: 39.9008, lng: -75.1675, capacity: 67594 },
    { id: "SF", fifaName: "San Francisco Bay Area Stadium", stadium: "Levi's Stadium", city: "San Francisco Bay Area / Santa Clara", country: "USA", lat: 37.4030, lng: -121.9700, capacity: 68500 },
    { id: "SEA", fifaName: "Seattle Stadium", stadium: "Lumen Field", city: "Seattle", country: "USA", lat: 47.5952, lng: -122.3316, capacity: 68740 }
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
    { name: "Round of 32", matchIds: [73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88] },
    { name: "Round of 16", matchIds: [89,90,91,92,93,94,95,96] },
    { name: "Quarter-finals", matchIds: [97,98,99,100] },
    { name: "Semi-finals", matchIds: [101,102] },
    { name: "Final", matchIds: [104] }
  ],
  bracketMatches: (() => {
    const roundOf32 = [73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88];
    const roundOf16 = [89,90,91,92,93,94,95,96];
    const quarters = [97,98,99,100];
    const semis = [101,102];
    const data = {};

    // Replace these placeholders after the group stage is complete. FIFA's exact third-place pairings depend on which eight third-place teams qualify.
    const r32Teams = [
      ["Winner Group A", "Runner-up Group C"], ["Winner Group B", "3rd-place qualifier"],
      ["Winner Group C", "Runner-up Group F"], ["Winner Group D", "3rd-place qualifier"],
      ["Winner Group E", "Runner-up Group I"], ["Winner Group F", "Runner-up Group C"],
      ["Winner Group G", "3rd-place qualifier"], ["Winner Group H", "Runner-up Group E"],
      ["Winner Group I", "3rd-place qualifier"], ["Winner Group J", "Runner-up Group H"],
      ["Winner Group K", "3rd-place qualifier"], ["Winner Group L", "Runner-up Group J"],
      ["Runner-up Group A", "Runner-up Group B"], ["Runner-up Group D", "Runner-up Group G"],
      ["Runner-up Group K", "3rd-place qualifier"], ["Runner-up Group L", "3rd-place qualifier"]
    ];

    roundOf32.forEach((id, i) => {
      data[id] = { id, team1: r32Teams[i][0], team2: r32Teams[i][1], score1: null, score2: null, winner: `Winner M${id}` };
    });
    roundOf16.forEach((id, i) => {
      const feeder = 73 + i * 2;
      data[id] = { id, team1: `Winner M${feeder}`, team2: `Winner M${feeder + 1}`, score1: null, score2: null, winner: `Winner M${id}` };
    });
    quarters.forEach((id, i) => {
      const feeder = 89 + i * 2;
      data[id] = { id, team1: `Winner M${feeder}`, team2: `Winner M${feeder + 1}`, score1: null, score2: null, winner: `Winner M${id}` };
    });
    semis.forEach((id, i) => {
      const feeder = 97 + i * 2;
      data[id] = { id, team1: `Winner M${feeder}`, team2: `Winner M${feeder + 1}`, score1: null, score2: null, winner: `Winner M${id}` };
    });
    data[104] = { id: 104, team1: "Winner M101", team2: "Winner M102", score1: null, score2: null, winner: "Champion" };
    return data;
  })()
};
