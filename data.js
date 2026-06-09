/*
  World Cup 2026 Map — data generated from uploaded CSV/SQLite dataset.
  Source files: host_cities.csv, teams.csv, tournament_stages.csv, matches.csv.
*/

window.WC_DATA = {
  "meta": {
    "title": "World Cup 2026 Map",
    "defaultTheme": "dark",
    "note": "Built from uploaded worldcup2026 dataset: host_cities.csv, teams.csv, tournament_stages.csv, matches.csv. Coordinates/capacities are visual map metadata merged from the prototype because the uploaded host city file does not include lat/lng or capacity.",
    "counts": {
      "hostCities": 16,
      "teams": 48,
      "stages": 7,
      "matches": 104
    }
  },
  "teams": {
    "MEX": {
      "id": 1,
      "name": "Mexico",
      "flag": "🇲🇽",
      "group": "A",
      "placeholder": false
    },
    "RSA": {
      "id": 2,
      "name": "South Africa",
      "flag": "🇿🇦",
      "group": "A",
      "placeholder": false
    },
    "KOR": {
      "id": 3,
      "name": "South Korea",
      "flag": "🇰🇷",
      "group": "A",
      "placeholder": false
    },
    "UEPD": {
      "id": 4,
      "name": "Winner UEFA Playoff D",
      "flag": "🏳️",
      "group": "A",
      "placeholder": true
    },
    "CAN": {
      "id": 5,
      "name": "Canada",
      "flag": "🇨🇦",
      "group": "B",
      "placeholder": false
    },
    "UEPA": {
      "id": 6,
      "name": "Winner UEFA Playoff A",
      "flag": "🏳️",
      "group": "B",
      "placeholder": true
    },
    "QAT": {
      "id": 7,
      "name": "Qatar",
      "flag": "🇶🇦",
      "group": "B",
      "placeholder": false
    },
    "SUI": {
      "id": 8,
      "name": "Switzerland",
      "flag": "🇨🇭",
      "group": "B",
      "placeholder": false
    },
    "BRA": {
      "id": 9,
      "name": "Brazil",
      "flag": "🇧🇷",
      "group": "C",
      "placeholder": false
    },
    "MAR": {
      "id": 10,
      "name": "Morocco",
      "flag": "🇲🇦",
      "group": "C",
      "placeholder": false
    },
    "HAI": {
      "id": 11,
      "name": "Haiti",
      "flag": "🇭🇹",
      "group": "C",
      "placeholder": false
    },
    "SCO": {
      "id": 12,
      "name": "Scotland",
      "flag": "🏴",
      "group": "C",
      "placeholder": false
    },
    "USA": {
      "id": 13,
      "name": "USA",
      "flag": "🇺🇸",
      "group": "D",
      "placeholder": false
    },
    "PAR": {
      "id": 14,
      "name": "Paraguay",
      "flag": "🇵🇾",
      "group": "D",
      "placeholder": false
    },
    "AUS": {
      "id": 15,
      "name": "Australia",
      "flag": "🇦🇺",
      "group": "D",
      "placeholder": false
    },
    "UEPC": {
      "id": 16,
      "name": "Winner UEFA Playoff C",
      "flag": "🏳️",
      "group": "D",
      "placeholder": true
    },
    "GER": {
      "id": 17,
      "name": "Germany",
      "flag": "🇩🇪",
      "group": "E",
      "placeholder": false
    },
    "CUR": {
      "id": 18,
      "name": "Curaçao",
      "flag": "🇨🇼",
      "group": "E",
      "placeholder": false
    },
    "CIV": {
      "id": 19,
      "name": "Côte d'Ivoire",
      "flag": "🇨🇮",
      "group": "E",
      "placeholder": false
    },
    "ECU": {
      "id": 20,
      "name": "Ecuador",
      "flag": "🇪🇨",
      "group": "E",
      "placeholder": false
    },
    "NED": {
      "id": 21,
      "name": "Netherlands",
      "flag": "🇳🇱",
      "group": "F",
      "placeholder": false
    },
    "JPN": {
      "id": 22,
      "name": "Japan",
      "flag": "🇯🇵",
      "group": "F",
      "placeholder": false
    },
    "UEPB": {
      "id": 23,
      "name": "Winner UEFA Playoff B",
      "flag": "🏳️",
      "group": "F",
      "placeholder": true
    },
    "TUN": {
      "id": 24,
      "name": "Tunisia",
      "flag": "🇹🇳",
      "group": "F",
      "placeholder": false
    },
    "BEL": {
      "id": 25,
      "name": "Belgium",
      "flag": "🇧🇪",
      "group": "G",
      "placeholder": false
    },
    "EGY": {
      "id": 26,
      "name": "Egypt",
      "flag": "🇪🇬",
      "group": "G",
      "placeholder": false
    },
    "IRN": {
      "id": 27,
      "name": "IR Iran",
      "flag": "🇮🇷",
      "group": "G",
      "placeholder": false
    },
    "NZL": {
      "id": 28,
      "name": "New Zealand",
      "flag": "🇳🇿",
      "group": "G",
      "placeholder": false
    },
    "ESP": {
      "id": 29,
      "name": "Spain",
      "flag": "🇪🇸",
      "group": "H",
      "placeholder": false
    },
    "CPV": {
      "id": 30,
      "name": "Cabo Verde",
      "flag": "🇨🇻",
      "group": "H",
      "placeholder": false
    },
    "KSA": {
      "id": 31,
      "name": "Saudi Arabia",
      "flag": "🇸🇦",
      "group": "H",
      "placeholder": false
    },
    "URU": {
      "id": 32,
      "name": "Uruguay",
      "flag": "🇺🇾",
      "group": "H",
      "placeholder": false
    },
    "FRA": {
      "id": 33,
      "name": "France",
      "flag": "🇫🇷",
      "group": "I",
      "placeholder": false
    },
    "SEN": {
      "id": 34,
      "name": "Senegal",
      "flag": "🇸🇳",
      "group": "I",
      "placeholder": false
    },
    "FP02": {
      "id": 35,
      "name": "Winner FIFA Playoff 2",
      "flag": "🏳️",
      "group": "I",
      "placeholder": true
    },
    "NOR": {
      "id": 36,
      "name": "Norway",
      "flag": "🇳🇴",
      "group": "I",
      "placeholder": false
    },
    "ARG": {
      "id": 37,
      "name": "Argentina",
      "flag": "🇦🇷",
      "group": "J",
      "placeholder": false
    },
    "ALG": {
      "id": 38,
      "name": "Algeria",
      "flag": "🇩🇿",
      "group": "J",
      "placeholder": false
    },
    "AUT": {
      "id": 39,
      "name": "Austria",
      "flag": "🇦🇹",
      "group": "J",
      "placeholder": false
    },
    "JOR": {
      "id": 40,
      "name": "Jordan",
      "flag": "🇯🇴",
      "group": "J",
      "placeholder": false
    },
    "POR": {
      "id": 41,
      "name": "Portugal",
      "flag": "🇵🇹",
      "group": "K",
      "placeholder": false
    },
    "FP01": {
      "id": 42,
      "name": "Winner FIFA Playoff 1",
      "flag": "🏳️",
      "group": "K",
      "placeholder": true
    },
    "UZB": {
      "id": 43,
      "name": "Uzbekistan",
      "flag": "🇺🇿",
      "group": "K",
      "placeholder": false
    },
    "COL": {
      "id": 44,
      "name": "Colombia",
      "flag": "🇨🇴",
      "group": "K",
      "placeholder": false
    },
    "ENG": {
      "id": 45,
      "name": "England",
      "flag": "🏴",
      "group": "L",
      "placeholder": false
    },
    "CRO": {
      "id": 46,
      "name": "Croatia",
      "flag": "🇭🇷",
      "group": "L",
      "placeholder": false
    },
    "GHA": {
      "id": 47,
      "name": "Ghana",
      "flag": "🇬🇭",
      "group": "L",
      "placeholder": false
    },
    "PAN": {
      "id": 48,
      "name": "Panama",
      "flag": "🇵🇦",
      "group": "L",
      "placeholder": false
    },
    "2A": {
      "name": "2A",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "2B": {
      "name": "2B",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "1C": {
      "name": "1C",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "2F": {
      "name": "2F",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "1E": {
      "name": "1E",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "3ABCDF": {
      "name": "3ABCDF",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "1F": {
      "name": "1F",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "2C": {
      "name": "2C",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "2E": {
      "name": "2E",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "2I": {
      "name": "2I",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "1I": {
      "name": "1I",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "3CDFGH": {
      "name": "3CDFGH",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "1A": {
      "name": "1A",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "3CEFHI": {
      "name": "3CEFHI",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "1L": {
      "name": "1L",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "3EHIJK": {
      "name": "3EHIJK",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "1G": {
      "name": "1G",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "3AEHIJ": {
      "name": "3AEHIJ",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "1D": {
      "name": "1D",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "3BEFIJ": {
      "name": "3BEFIJ",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "1H": {
      "name": "1H",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "2J": {
      "name": "2J",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "2K": {
      "name": "2K",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "2L": {
      "name": "2L",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "1B": {
      "name": "1B",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "3EFGIJ": {
      "name": "3EFGIJ",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "2D": {
      "name": "2D",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "2G": {
      "name": "2G",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "1J": {
      "name": "1J",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "2H": {
      "name": "2H",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "1K": {
      "name": "1K",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "3DEIJL": {
      "name": "3DEIJL",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W73": {
      "name": "W73",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W75": {
      "name": "W75",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W74": {
      "name": "W74",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W77": {
      "name": "W77",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W76": {
      "name": "W76",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W78": {
      "name": "W78",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W79": {
      "name": "W79",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W80": {
      "name": "W80",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W83": {
      "name": "W83",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W84": {
      "name": "W84",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W81": {
      "name": "W81",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W82": {
      "name": "W82",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W86": {
      "name": "W86",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W88": {
      "name": "W88",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W85": {
      "name": "W85",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W87": {
      "name": "W87",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W89": {
      "name": "W89",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W90": {
      "name": "W90",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W93": {
      "name": "W93",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W94": {
      "name": "W94",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W91": {
      "name": "W91",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W92": {
      "name": "W92",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W95": {
      "name": "W95",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W100": {
      "name": "W100",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W97": {
      "name": "W97",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W98": {
      "name": "W98",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W99": {
      "name": "W99",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "RU101": {
      "name": "RU101",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "RU102": {
      "name": "RU102",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W101": {
      "name": "W101",
      "flag": "",
      "group": null,
      "placeholder": true
    },
    "W102": {
      "name": "W102",
      "flag": "",
      "group": null,
      "placeholder": true
    }
  },
  "stages": [
    {
      "id": 1,
      "name": "Group Stage",
      "order": 1
    },
    {
      "id": 2,
      "name": "Round of 32",
      "order": 2
    },
    {
      "id": 3,
      "name": "Round of 16",
      "order": 3
    },
    {
      "id": 4,
      "name": "Quarterfinals",
      "order": 4
    },
    {
      "id": 5,
      "name": "Semifinals",
      "order": 5
    },
    {
      "id": 6,
      "name": "Third Place Playoff",
      "order": 6
    },
    {
      "id": 7,
      "name": "Final",
      "order": 7
    }
  ],
  "stadiums": [
    {
      "id": "atlanta",
      "sourceCityId": 1,
      "name": "Mercedes-Benz Stadium",
      "city": "Atlanta",
      "country": "United States",
      "countryFlag": "🇺🇸",
      "region": "East",
      "airportCode": "ATL",
      "capacity": 75000,
      "lat": 33.7554,
      "lng": -84.4009,
      "status": "upcoming",
      "image": "assets/stadiums/atlanta.jpg",
      "label": {
        "dx": 38,
        "dy": -16,
        "anchor": "start"
      }
    },
    {
      "id": "boston",
      "sourceCityId": 2,
      "name": "Gillette Stadium",
      "city": "Boston",
      "country": "United States",
      "countryFlag": "🇺🇸",
      "region": "East",
      "airportCode": "BOS",
      "capacity": 65000,
      "lat": 42.0909,
      "lng": -71.2643,
      "status": "upcoming",
      "image": "assets/stadiums/boston.jpg",
      "label": {
        "dx": 38,
        "dy": -28,
        "anchor": "start"
      }
    },
    {
      "id": "dallas",
      "sourceCityId": 3,
      "name": "AT&T Stadium",
      "city": "Dallas",
      "country": "United States",
      "countryFlag": "🇺🇸",
      "region": "Central",
      "airportCode": "DAL",
      "capacity": 94000,
      "lat": 32.7473,
      "lng": -97.0945,
      "status": "upcoming",
      "image": "assets/stadiums/dallas.jpg",
      "label": {
        "dx": -246,
        "dy": 18,
        "anchor": "end"
      }
    },
    {
      "id": "houston",
      "sourceCityId": 4,
      "name": "NRG Stadium",
      "city": "Houston",
      "country": "United States",
      "countryFlag": "🇺🇸",
      "region": "Central",
      "airportCode": "IAH",
      "capacity": 72000,
      "lat": 29.6847,
      "lng": -95.4107,
      "status": "upcoming",
      "image": "assets/stadiums/houston.jpg",
      "label": {
        "dx": 36,
        "dy": 12,
        "anchor": "start"
      }
    },
    {
      "id": "kansas-city",
      "sourceCityId": 5,
      "name": "Arrowhead Stadium",
      "city": "Kansas City",
      "country": "United States",
      "countryFlag": "🇺🇸",
      "region": "Central",
      "airportCode": "MCI",
      "capacity": 73000,
      "lat": 39.0489,
      "lng": -94.4839,
      "status": "upcoming",
      "image": "assets/stadiums/kansas-city.jpg",
      "label": {
        "dx": -260,
        "dy": -18,
        "anchor": "end"
      }
    },
    {
      "id": "los-angeles",
      "sourceCityId": 6,
      "name": "SoFi Stadium",
      "city": "Los Angeles",
      "country": "United States",
      "countryFlag": "🇺🇸",
      "region": "West",
      "airportCode": "LAX",
      "capacity": 70000,
      "lat": 33.9535,
      "lng": -118.3392,
      "status": "upcoming",
      "image": "assets/stadiums/los-angeles.jpg",
      "label": {
        "dx": -245,
        "dy": 36,
        "anchor": "end"
      }
    },
    {
      "id": "miami",
      "sourceCityId": 7,
      "name": "Hard Rock Stadium",
      "city": "Miami",
      "country": "United States",
      "countryFlag": "🇺🇸",
      "region": "East",
      "airportCode": "MIA",
      "capacity": 65000,
      "lat": 25.958,
      "lng": -80.2389,
      "status": "upcoming",
      "image": "assets/stadiums/miami.jpg",
      "label": {
        "dx": 34,
        "dy": -6,
        "anchor": "start"
      }
    },
    {
      "id": "new-york-new-jersey",
      "sourceCityId": 8,
      "name": "MetLife Stadium",
      "city": "New York / New Jersey",
      "country": "United States",
      "countryFlag": "🇺🇸",
      "region": "East",
      "airportCode": "EWR",
      "capacity": 82500,
      "lat": 40.8135,
      "lng": -74.0745,
      "status": "upcoming",
      "image": "assets/stadiums/new-york-new-jersey.jpg",
      "label": {
        "dx": 36,
        "dy": 0,
        "anchor": "start"
      }
    },
    {
      "id": "philadelphia",
      "sourceCityId": 9,
      "name": "Lincoln Financial Field",
      "city": "Philadelphia",
      "country": "United States",
      "countryFlag": "🇺🇸",
      "region": "East",
      "airportCode": "PHL",
      "capacity": 69000,
      "lat": 39.9008,
      "lng": -75.1675,
      "status": "upcoming",
      "image": "assets/stadiums/philadelphia.jpg",
      "label": {
        "dx": 36,
        "dy": 38,
        "anchor": "start"
      }
    },
    {
      "id": "san-francisco",
      "sourceCityId": 10,
      "name": "Levi's Stadium",
      "city": "San Francisco Bay Area",
      "country": "United States",
      "countryFlag": "🇺🇸",
      "region": "West",
      "airportCode": "SFO",
      "capacity": 71000,
      "lat": 37.403,
      "lng": -121.97,
      "status": "upcoming",
      "image": "assets/stadiums/san-francisco.jpg",
      "label": {
        "dx": -250,
        "dy": -18,
        "anchor": "end"
      }
    },
    {
      "id": "seattle",
      "sourceCityId": 11,
      "name": "Lumen Field",
      "city": "Seattle",
      "country": "United States",
      "countryFlag": "🇺🇸",
      "region": "West",
      "airportCode": "SEA",
      "capacity": 69000,
      "lat": 47.5952,
      "lng": -122.3316,
      "status": "upcoming",
      "image": "assets/stadiums/seattle.jpg",
      "label": {
        "dx": -245,
        "dy": 34,
        "anchor": "end"
      }
    },
    {
      "id": "toronto",
      "sourceCityId": 12,
      "name": "BMO Field",
      "city": "Toronto",
      "country": "Canada",
      "countryFlag": "🇨🇦",
      "region": "East",
      "airportCode": "YYZ",
      "capacity": 45000,
      "lat": 43.6332,
      "lng": -79.4186,
      "status": "upcoming",
      "image": "assets/stadiums/toronto.jpg",
      "label": {
        "dx": -252,
        "dy": -34,
        "anchor": "end"
      }
    },
    {
      "id": "vancouver",
      "sourceCityId": 13,
      "name": "BC Place",
      "city": "Vancouver",
      "country": "Canada",
      "countryFlag": "🇨🇦",
      "region": "West",
      "airportCode": "YVR",
      "capacity": 54000,
      "lat": 49.2767,
      "lng": -123.1119,
      "status": "upcoming",
      "image": "assets/stadiums/vancouver.jpg",
      "label": {
        "dx": -260,
        "dy": -52,
        "anchor": "end"
      }
    },
    {
      "id": "guadalajara",
      "sourceCityId": 14,
      "name": "Estadio Akron",
      "city": "Guadalajara",
      "country": "Mexico",
      "countryFlag": "🇲🇽",
      "region": "Central",
      "airportCode": "GDL",
      "capacity": 48000,
      "lat": 20.6819,
      "lng": -103.4622,
      "status": "upcoming",
      "image": "assets/stadiums/guadalajara.jpg",
      "label": {
        "dx": 28,
        "dy": -34,
        "anchor": "start"
      }
    },
    {
      "id": "mexico-city",
      "sourceCityId": 15,
      "name": "Estadio Azteca",
      "city": "Mexico City",
      "country": "Mexico",
      "countryFlag": "🇲🇽",
      "region": "Central",
      "airportCode": "MEX",
      "capacity": 83000,
      "lat": 19.3029,
      "lng": -99.1505,
      "status": "upcoming",
      "image": "assets/stadiums/mexico-city.jpg",
      "label": {
        "dx": 34,
        "dy": 26,
        "anchor": "start"
      }
    },
    {
      "id": "monterrey",
      "sourceCityId": 16,
      "name": "Estadio BBVA",
      "city": "Monterrey",
      "country": "Mexico",
      "countryFlag": "🇲🇽",
      "region": "Central",
      "airportCode": "MTY",
      "capacity": 53500,
      "lat": 25.6685,
      "lng": -100.2445,
      "status": "upcoming",
      "image": "assets/stadiums/monterrey.jpg",
      "label": {
        "dx": 38,
        "dy": -14,
        "anchor": "start"
      }
    }
  ],
  "matches": [
    {
      "id": "m001",
      "matchNumber": 1,
      "stadiumId": "mexico-city",
      "date": "2026-06-11T15:00:00-06:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "MEX",
      "teamB": "RSA",
      "label": "Group A",
      "weather": "Weather TBC"
    },
    {
      "id": "m002",
      "matchNumber": 2,
      "stadiumId": "guadalajara",
      "date": "2026-06-11T22:00:00-06:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "KOR",
      "teamB": "UEPD",
      "label": "Group A",
      "weather": "Weather TBC"
    },
    {
      "id": "m003",
      "matchNumber": 3,
      "stadiumId": "toronto",
      "date": "2026-06-12T15:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "CAN",
      "teamB": "UEPA",
      "label": "Group B",
      "weather": "Weather TBC"
    },
    {
      "id": "m004",
      "matchNumber": 4,
      "stadiumId": "los-angeles",
      "date": "2026-06-12T21:00:00-07:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "USA",
      "teamB": "PAR",
      "label": "Group D",
      "weather": "Weather TBC"
    },
    {
      "id": "m005",
      "matchNumber": 5,
      "stadiumId": "san-francisco",
      "date": "2026-06-13T15:00:00-07:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "QAT",
      "teamB": "SUI",
      "label": "Group B",
      "weather": "Weather TBC"
    },
    {
      "id": "m006",
      "matchNumber": 6,
      "stadiumId": "new-york-new-jersey",
      "date": "2026-06-13T18:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "BRA",
      "teamB": "MAR",
      "label": "Group C",
      "weather": "Weather TBC"
    },
    {
      "id": "m007",
      "matchNumber": 7,
      "stadiumId": "boston",
      "date": "2026-06-13T21:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "HAI",
      "teamB": "SCO",
      "label": "Group C",
      "weather": "Weather TBC"
    },
    {
      "id": "m008",
      "matchNumber": 8,
      "stadiumId": "vancouver",
      "date": "2026-06-14T00:00:00-07:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "AUS",
      "teamB": "UEPC",
      "label": "Group D",
      "weather": "Weather TBC"
    },
    {
      "id": "m009",
      "matchNumber": 9,
      "stadiumId": "houston",
      "date": "2026-06-14T13:00:00-05:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "GER",
      "teamB": "CUR",
      "label": "Group E",
      "weather": "Weather TBC"
    },
    {
      "id": "m010",
      "matchNumber": 10,
      "stadiumId": "dallas",
      "date": "2026-06-14T16:00:00-05:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "NED",
      "teamB": "JPN",
      "label": "Group F",
      "weather": "Weather TBC"
    },
    {
      "id": "m011",
      "matchNumber": 11,
      "stadiumId": "philadelphia",
      "date": "2026-06-14T19:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "CIV",
      "teamB": "ECU",
      "label": "Group E",
      "weather": "Weather TBC"
    },
    {
      "id": "m012",
      "matchNumber": 12,
      "stadiumId": "monterrey",
      "date": "2026-06-14T22:00:00-06:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "UEPB",
      "teamB": "TUN",
      "label": "Group F",
      "weather": "Weather TBC"
    },
    {
      "id": "m013",
      "matchNumber": 13,
      "stadiumId": "atlanta",
      "date": "2026-06-15T12:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "ESP",
      "teamB": "CPV",
      "label": "Group H",
      "weather": "Weather TBC"
    },
    {
      "id": "m014",
      "matchNumber": 14,
      "stadiumId": "seattle",
      "date": "2026-06-15T15:00:00-07:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "BEL",
      "teamB": "EGY",
      "label": "Group G",
      "weather": "Weather TBC"
    },
    {
      "id": "m015",
      "matchNumber": 15,
      "stadiumId": "miami",
      "date": "2026-06-15T18:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "KSA",
      "teamB": "URU",
      "label": "Group H",
      "weather": "Weather TBC"
    },
    {
      "id": "m016",
      "matchNumber": 16,
      "stadiumId": "los-angeles",
      "date": "2026-06-15T21:00:00-07:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "IRN",
      "teamB": "NZL",
      "label": "Group G",
      "weather": "Weather TBC"
    },
    {
      "id": "m017",
      "matchNumber": 17,
      "stadiumId": "new-york-new-jersey",
      "date": "2026-06-16T15:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "FRA",
      "teamB": "SEN",
      "label": "Group I",
      "weather": "Weather TBC"
    },
    {
      "id": "m018",
      "matchNumber": 18,
      "stadiumId": "boston",
      "date": "2026-06-16T18:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "FP02",
      "teamB": "NOR",
      "label": "Group I",
      "weather": "Weather TBC"
    },
    {
      "id": "m019",
      "matchNumber": 19,
      "stadiumId": "kansas-city",
      "date": "2026-06-16T21:00:00-05:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "ARG",
      "teamB": "ALG",
      "label": "Group J",
      "weather": "Weather TBC"
    },
    {
      "id": "m020",
      "matchNumber": 20,
      "stadiumId": "san-francisco",
      "date": "2026-06-17T00:00:00-07:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "AUT",
      "teamB": "JOR",
      "label": "Group J",
      "weather": "Weather TBC"
    },
    {
      "id": "m021",
      "matchNumber": 21,
      "stadiumId": "houston",
      "date": "2026-06-17T13:00:00-05:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "POR",
      "teamB": "FP01",
      "label": "Group K",
      "weather": "Weather TBC"
    },
    {
      "id": "m022",
      "matchNumber": 22,
      "stadiumId": "dallas",
      "date": "2026-06-17T16:00:00-05:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "ENG",
      "teamB": "CRO",
      "label": "Group L",
      "weather": "Weather TBC"
    },
    {
      "id": "m023",
      "matchNumber": 23,
      "stadiumId": "toronto",
      "date": "2026-06-17T19:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "GHA",
      "teamB": "PAN",
      "label": "Group L",
      "weather": "Weather TBC"
    },
    {
      "id": "m024",
      "matchNumber": 24,
      "stadiumId": "mexico-city",
      "date": "2026-06-17T22:00:00-06:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "UZB",
      "teamB": "COL",
      "label": "Group K",
      "weather": "Weather TBC"
    },
    {
      "id": "m025",
      "matchNumber": 25,
      "stadiumId": "atlanta",
      "date": "2026-06-18T12:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "UEPD",
      "teamB": "RSA",
      "label": "Group A",
      "weather": "Weather TBC"
    },
    {
      "id": "m026",
      "matchNumber": 26,
      "stadiumId": "los-angeles",
      "date": "2026-06-18T15:00:00-07:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "SUI",
      "teamB": "UEPA",
      "label": "Group B",
      "weather": "Weather TBC"
    },
    {
      "id": "m027",
      "matchNumber": 27,
      "stadiumId": "vancouver",
      "date": "2026-06-18T18:00:00-07:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "CAN",
      "teamB": "QAT",
      "label": "Group B",
      "weather": "Weather TBC"
    },
    {
      "id": "m028",
      "matchNumber": 28,
      "stadiumId": "guadalajara",
      "date": "2026-06-18T21:00:00-06:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "MEX",
      "teamB": "KOR",
      "label": "Group A",
      "weather": "Weather TBC"
    },
    {
      "id": "m029",
      "matchNumber": 29,
      "stadiumId": "seattle",
      "date": "2026-06-19T15:00:00-07:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "USA",
      "teamB": "AUS",
      "label": "Group D",
      "weather": "Weather TBC"
    },
    {
      "id": "m030",
      "matchNumber": 30,
      "stadiumId": "boston",
      "date": "2026-06-19T18:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "SCO",
      "teamB": "MAR",
      "label": "Group C",
      "weather": "Weather TBC"
    },
    {
      "id": "m031",
      "matchNumber": 31,
      "stadiumId": "philadelphia",
      "date": "2026-06-19T21:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "BRA",
      "teamB": "HAI",
      "label": "Group C",
      "weather": "Weather TBC"
    },
    {
      "id": "m032",
      "matchNumber": 32,
      "stadiumId": "san-francisco",
      "date": "2026-06-20T00:00:00-07:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "UEPC",
      "teamB": "PAR",
      "label": "Group D",
      "weather": "Weather TBC"
    },
    {
      "id": "m033",
      "matchNumber": 33,
      "stadiumId": "houston",
      "date": "2026-06-20T13:00:00-05:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "NED",
      "teamB": "UEPB",
      "label": "Group F",
      "weather": "Weather TBC"
    },
    {
      "id": "m034",
      "matchNumber": 34,
      "stadiumId": "toronto",
      "date": "2026-06-20T16:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "GER",
      "teamB": "CIV",
      "label": "Group E",
      "weather": "Weather TBC"
    },
    {
      "id": "m035",
      "matchNumber": 35,
      "stadiumId": "kansas-city",
      "date": "2026-06-20T20:00:00-05:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "ECU",
      "teamB": "CUR",
      "label": "Group E",
      "weather": "Weather TBC"
    },
    {
      "id": "m036",
      "matchNumber": 36,
      "stadiumId": "monterrey",
      "date": "2026-06-21T00:00:00-06:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "TUN",
      "teamB": "JPN",
      "label": "Group F",
      "weather": "Weather TBC"
    },
    {
      "id": "m037",
      "matchNumber": 37,
      "stadiumId": "atlanta",
      "date": "2026-06-21T12:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "ESP",
      "teamB": "KSA",
      "label": "Group H",
      "weather": "Weather TBC"
    },
    {
      "id": "m038",
      "matchNumber": 38,
      "stadiumId": "los-angeles",
      "date": "2026-06-21T15:00:00-07:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "BEL",
      "teamB": "IRN",
      "label": "Group G",
      "weather": "Weather TBC"
    },
    {
      "id": "m039",
      "matchNumber": 39,
      "stadiumId": "miami",
      "date": "2026-06-21T18:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "URU",
      "teamB": "CPV",
      "label": "Group H",
      "weather": "Weather TBC"
    },
    {
      "id": "m040",
      "matchNumber": 40,
      "stadiumId": "vancouver",
      "date": "2026-06-21T21:00:00-07:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "NZL",
      "teamB": "EGY",
      "label": "Group G",
      "weather": "Weather TBC"
    },
    {
      "id": "m041",
      "matchNumber": 41,
      "stadiumId": "dallas",
      "date": "2026-06-22T13:00:00-05:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "ARG",
      "teamB": "AUT",
      "label": "Group J",
      "weather": "Weather TBC"
    },
    {
      "id": "m042",
      "matchNumber": 42,
      "stadiumId": "philadelphia",
      "date": "2026-06-22T17:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "FRA",
      "teamB": "FP02",
      "label": "Group I",
      "weather": "Weather TBC"
    },
    {
      "id": "m043",
      "matchNumber": 43,
      "stadiumId": "new-york-new-jersey",
      "date": "2026-06-22T20:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "NOR",
      "teamB": "SEN",
      "label": "Group I",
      "weather": "Weather TBC"
    },
    {
      "id": "m044",
      "matchNumber": 44,
      "stadiumId": "san-francisco",
      "date": "2026-06-22T23:00:00-07:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "JOR",
      "teamB": "ALG",
      "label": "Group J",
      "weather": "Weather TBC"
    },
    {
      "id": "m045",
      "matchNumber": 45,
      "stadiumId": "houston",
      "date": "2026-06-23T13:00:00-05:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "POR",
      "teamB": "UZB",
      "label": "Group K",
      "weather": "Weather TBC"
    },
    {
      "id": "m046",
      "matchNumber": 46,
      "stadiumId": "boston",
      "date": "2026-06-23T16:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "ENG",
      "teamB": "GHA",
      "label": "Group L",
      "weather": "Weather TBC"
    },
    {
      "id": "m047",
      "matchNumber": 47,
      "stadiumId": "toronto",
      "date": "2026-06-23T19:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "PAN",
      "teamB": "CRO",
      "label": "Group L",
      "weather": "Weather TBC"
    },
    {
      "id": "m048",
      "matchNumber": 48,
      "stadiumId": "guadalajara",
      "date": "2026-06-23T22:00:00-06:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "COL",
      "teamB": "FP01",
      "label": "Group K",
      "weather": "Weather TBC"
    },
    {
      "id": "m049",
      "matchNumber": 49,
      "stadiumId": "vancouver",
      "date": "2026-06-24T15:00:00-07:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "SUI",
      "teamB": "CAN",
      "label": "Group B",
      "weather": "Weather TBC"
    },
    {
      "id": "m050",
      "matchNumber": 50,
      "stadiumId": "seattle",
      "date": "2026-06-24T15:00:00-07:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "UEPA",
      "teamB": "QAT",
      "label": "Group B",
      "weather": "Weather TBC"
    },
    {
      "id": "m051",
      "matchNumber": 51,
      "stadiumId": "miami",
      "date": "2026-06-24T18:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "SCO",
      "teamB": "BRA",
      "label": "Group C",
      "weather": "Weather TBC"
    },
    {
      "id": "m052",
      "matchNumber": 52,
      "stadiumId": "atlanta",
      "date": "2026-06-24T18:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "MAR",
      "teamB": "HAI",
      "label": "Group C",
      "weather": "Weather TBC"
    },
    {
      "id": "m053",
      "matchNumber": 53,
      "stadiumId": "mexico-city",
      "date": "2026-06-24T21:00:00-06:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "UEPD",
      "teamB": "MEX",
      "label": "Group A",
      "weather": "Weather TBC"
    },
    {
      "id": "m054",
      "matchNumber": 54,
      "stadiumId": "monterrey",
      "date": "2026-06-24T21:00:00-06:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "RSA",
      "teamB": "KOR",
      "label": "Group A",
      "weather": "Weather TBC"
    },
    {
      "id": "m055",
      "matchNumber": 55,
      "stadiumId": "philadelphia",
      "date": "2026-06-25T16:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "CUR",
      "teamB": "CIV",
      "label": "Group E",
      "weather": "Weather TBC"
    },
    {
      "id": "m056",
      "matchNumber": 56,
      "stadiumId": "new-york-new-jersey",
      "date": "2026-06-25T16:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "ECU",
      "teamB": "GER",
      "label": "Group E",
      "weather": "Weather TBC"
    },
    {
      "id": "m057",
      "matchNumber": 57,
      "stadiumId": "dallas",
      "date": "2026-06-25T19:00:00-05:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "JPN",
      "teamB": "UEPB",
      "label": "Group F",
      "weather": "Weather TBC"
    },
    {
      "id": "m058",
      "matchNumber": 58,
      "stadiumId": "kansas-city",
      "date": "2026-06-25T19:00:00-05:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "TUN",
      "teamB": "NED",
      "label": "Group F",
      "weather": "Weather TBC"
    },
    {
      "id": "m059",
      "matchNumber": 59,
      "stadiumId": "los-angeles",
      "date": "2026-06-25T22:00:00-07:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "UEPC",
      "teamB": "USA",
      "label": "Group D",
      "weather": "Weather TBC"
    },
    {
      "id": "m060",
      "matchNumber": 60,
      "stadiumId": "san-francisco",
      "date": "2026-06-25T22:00:00-07:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "PAR",
      "teamB": "AUS",
      "label": "Group D",
      "weather": "Weather TBC"
    },
    {
      "id": "m061",
      "matchNumber": 61,
      "stadiumId": "boston",
      "date": "2026-06-26T15:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "NOR",
      "teamB": "FRA",
      "label": "Group I",
      "weather": "Weather TBC"
    },
    {
      "id": "m062",
      "matchNumber": 62,
      "stadiumId": "toronto",
      "date": "2026-06-26T15:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "SEN",
      "teamB": "FP02",
      "label": "Group I",
      "weather": "Weather TBC"
    },
    {
      "id": "m063",
      "matchNumber": 63,
      "stadiumId": "houston",
      "date": "2026-06-26T20:00:00-05:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "CPV",
      "teamB": "KSA",
      "label": "Group H",
      "weather": "Weather TBC"
    },
    {
      "id": "m064",
      "matchNumber": 64,
      "stadiumId": "guadalajara",
      "date": "2026-06-26T20:00:00-06:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "URU",
      "teamB": "ESP",
      "label": "Group H",
      "weather": "Weather TBC"
    },
    {
      "id": "m065",
      "matchNumber": 65,
      "stadiumId": "seattle",
      "date": "2026-06-26T23:00:00-07:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "EGY",
      "teamB": "IRN",
      "label": "Group G",
      "weather": "Weather TBC"
    },
    {
      "id": "m066",
      "matchNumber": 66,
      "stadiumId": "vancouver",
      "date": "2026-06-26T23:00:00-07:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "NZL",
      "teamB": "BEL",
      "label": "Group G",
      "weather": "Weather TBC"
    },
    {
      "id": "m067",
      "matchNumber": 67,
      "stadiumId": "new-york-new-jersey",
      "date": "2026-06-27T17:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "PAN",
      "teamB": "ENG",
      "label": "Group L",
      "weather": "Weather TBC"
    },
    {
      "id": "m068",
      "matchNumber": 68,
      "stadiumId": "philadelphia",
      "date": "2026-06-27T17:00:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "CRO",
      "teamB": "GHA",
      "label": "Group L",
      "weather": "Weather TBC"
    },
    {
      "id": "m069",
      "matchNumber": 69,
      "stadiumId": "miami",
      "date": "2026-06-27T19:30:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "COL",
      "teamB": "POR",
      "label": "Group K",
      "weather": "Weather TBC"
    },
    {
      "id": "m070",
      "matchNumber": 70,
      "stadiumId": "atlanta",
      "date": "2026-06-27T19:30:00-04:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "FP01",
      "teamB": "UZB",
      "label": "Group K",
      "weather": "Weather TBC"
    },
    {
      "id": "m071",
      "matchNumber": 71,
      "stadiumId": "kansas-city",
      "date": "2026-06-27T22:00:00-05:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "ALG",
      "teamB": "AUT",
      "label": "Group J",
      "weather": "Weather TBC"
    },
    {
      "id": "m072",
      "matchNumber": 72,
      "stadiumId": "dallas",
      "date": "2026-06-27T22:00:00-05:00",
      "round": "Group Stage",
      "status": "upcoming",
      "teamA": "JOR",
      "teamB": "ARG",
      "label": "Group J",
      "weather": "Weather TBC"
    },
    {
      "id": "m073",
      "matchNumber": 73,
      "stadiumId": "los-angeles",
      "date": "2026-06-28T15:00:00-07:00",
      "round": "Round of 32",
      "status": "knockout",
      "teamA": "2A",
      "teamB": "2B",
      "label": "2A vs 2B",
      "weather": "Weather TBC"
    },
    {
      "id": "m074",
      "matchNumber": 74,
      "stadiumId": "houston",
      "date": "2026-06-29T13:00:00-05:00",
      "round": "Round of 32",
      "status": "knockout",
      "teamA": "1C",
      "teamB": "2F",
      "label": "1C vs 2F",
      "weather": "Weather TBC"
    },
    {
      "id": "m075",
      "matchNumber": 75,
      "stadiumId": "boston",
      "date": "2026-06-29T16:30:00-04:00",
      "round": "Round of 32",
      "status": "knockout",
      "teamA": "1E",
      "teamB": "3ABCDF",
      "label": "1E vs 3ABCDF",
      "weather": "Weather TBC"
    },
    {
      "id": "m076",
      "matchNumber": 76,
      "stadiumId": "monterrey",
      "date": "2026-06-29T21:00:00-06:00",
      "round": "Round of 32",
      "status": "knockout",
      "teamA": "1F",
      "teamB": "2C",
      "label": "1F vs 2C",
      "weather": "Weather TBC"
    },
    {
      "id": "m077",
      "matchNumber": 77,
      "stadiumId": "dallas",
      "date": "2026-06-30T13:00:00-05:00",
      "round": "Round of 32",
      "status": "knockout",
      "teamA": "2E",
      "teamB": "2I",
      "label": "2E vs 2I",
      "weather": "Weather TBC"
    },
    {
      "id": "m078",
      "matchNumber": 78,
      "stadiumId": "new-york-new-jersey",
      "date": "2026-06-30T17:00:00-04:00",
      "round": "Round of 32",
      "status": "knockout",
      "teamA": "1I",
      "teamB": "3CDFGH",
      "label": "1I vs 3CDFGH",
      "weather": "Weather TBC"
    },
    {
      "id": "m079",
      "matchNumber": 79,
      "stadiumId": "mexico-city",
      "date": "2026-06-30T21:00:00-06:00",
      "round": "Round of 32",
      "status": "knockout",
      "teamA": "1A",
      "teamB": "3CEFHI",
      "label": "1A vs 3CEFHI",
      "weather": "Weather TBC"
    },
    {
      "id": "m080",
      "matchNumber": 80,
      "stadiumId": "atlanta",
      "date": "2026-07-01T12:00:00-04:00",
      "round": "Round of 32",
      "status": "knockout",
      "teamA": "1L",
      "teamB": "3EHIJK",
      "label": "1L vs 3EHIJK",
      "weather": "Weather TBC"
    },
    {
      "id": "m081",
      "matchNumber": 81,
      "stadiumId": "seattle",
      "date": "2026-07-01T16:00:00-07:00",
      "round": "Round of 32",
      "status": "knockout",
      "teamA": "1G",
      "teamB": "3AEHIJ",
      "label": "1G vs 3AEHIJ",
      "weather": "Weather TBC"
    },
    {
      "id": "m082",
      "matchNumber": 82,
      "stadiumId": "san-francisco",
      "date": "2026-07-01T20:00:00-07:00",
      "round": "Round of 32",
      "status": "knockout",
      "teamA": "1D",
      "teamB": "3BEFIJ",
      "label": "1D vs 3BEFIJ",
      "weather": "Weather TBC"
    },
    {
      "id": "m083",
      "matchNumber": 83,
      "stadiumId": "los-angeles",
      "date": "2026-07-02T15:00:00-07:00",
      "round": "Round of 32",
      "status": "knockout",
      "teamA": "1H",
      "teamB": "2J",
      "label": "1H vs 2J",
      "weather": "Weather TBC"
    },
    {
      "id": "m084",
      "matchNumber": 84,
      "stadiumId": "toronto",
      "date": "2026-07-02T19:00:00-04:00",
      "round": "Round of 32",
      "status": "knockout",
      "teamA": "2K",
      "teamB": "2L",
      "label": "2K vs 2L",
      "weather": "Weather TBC"
    },
    {
      "id": "m085",
      "matchNumber": 85,
      "stadiumId": "vancouver",
      "date": "2026-07-02T23:00:00-07:00",
      "round": "Round of 32",
      "status": "knockout",
      "teamA": "1B",
      "teamB": "3EFGIJ",
      "label": "1B vs 3EFGIJ",
      "weather": "Weather TBC"
    },
    {
      "id": "m086",
      "matchNumber": 86,
      "stadiumId": "dallas",
      "date": "2026-07-03T14:00:00-05:00",
      "round": "Round of 32",
      "status": "knockout",
      "teamA": "2D",
      "teamB": "2G",
      "label": "2D vs 2G",
      "weather": "Weather TBC"
    },
    {
      "id": "m087",
      "matchNumber": 87,
      "stadiumId": "miami",
      "date": "2026-07-03T18:00:00-04:00",
      "round": "Round of 32",
      "status": "knockout",
      "teamA": "1J",
      "teamB": "2H",
      "label": "1J vs 2H",
      "weather": "Weather TBC"
    },
    {
      "id": "m088",
      "matchNumber": 88,
      "stadiumId": "kansas-city",
      "date": "2026-07-03T21:30:00-05:00",
      "round": "Round of 32",
      "status": "knockout",
      "teamA": "1K",
      "teamB": "3DEIJL",
      "label": "1K vs 3DEIJL",
      "weather": "Weather TBC"
    },
    {
      "id": "m089",
      "matchNumber": 89,
      "stadiumId": "houston",
      "date": "2026-07-04T13:00:00-05:00",
      "round": "Round of 16",
      "status": "knockout",
      "teamA": "W73",
      "teamB": "W75",
      "label": "W73 vs W75",
      "weather": "Weather TBC"
    },
    {
      "id": "m090",
      "matchNumber": 90,
      "stadiumId": "philadelphia",
      "date": "2026-07-04T17:00:00-04:00",
      "round": "Round of 16",
      "status": "knockout",
      "teamA": "W74",
      "teamB": "W77",
      "label": "W74 vs W77",
      "weather": "Weather TBC"
    },
    {
      "id": "m091",
      "matchNumber": 91,
      "stadiumId": "new-york-new-jersey",
      "date": "2026-07-05T16:00:00-04:00",
      "round": "Round of 16",
      "status": "knockout",
      "teamA": "W76",
      "teamB": "W78",
      "label": "W76 vs W78",
      "weather": "Weather TBC"
    },
    {
      "id": "m092",
      "matchNumber": 92,
      "stadiumId": "mexico-city",
      "date": "2026-07-05T20:00:00-06:00",
      "round": "Round of 16",
      "status": "knockout",
      "teamA": "W79",
      "teamB": "W80",
      "label": "W79 vs W80",
      "weather": "Weather TBC"
    },
    {
      "id": "m093",
      "matchNumber": 93,
      "stadiumId": "dallas",
      "date": "2026-07-06T15:00:00-05:00",
      "round": "Round of 16",
      "status": "knockout",
      "teamA": "W83",
      "teamB": "W84",
      "label": "W83 vs W84",
      "weather": "Weather TBC"
    },
    {
      "id": "m094",
      "matchNumber": 94,
      "stadiumId": "seattle",
      "date": "2026-07-06T20:00:00-07:00",
      "round": "Round of 16",
      "status": "knockout",
      "teamA": "W81",
      "teamB": "W82",
      "label": "W81 vs W82",
      "weather": "Weather TBC"
    },
    {
      "id": "m095",
      "matchNumber": 95,
      "stadiumId": "atlanta",
      "date": "2026-07-07T12:00:00-04:00",
      "round": "Round of 16",
      "status": "knockout",
      "teamA": "W86",
      "teamB": "W88",
      "label": "W86 vs W88",
      "weather": "Weather TBC"
    },
    {
      "id": "m096",
      "matchNumber": 96,
      "stadiumId": "vancouver",
      "date": "2026-07-07T16:00:00-07:00",
      "round": "Round of 16",
      "status": "knockout",
      "teamA": "W85",
      "teamB": "W87",
      "label": "W85 vs W87",
      "weather": "Weather TBC"
    },
    {
      "id": "m097",
      "matchNumber": 97,
      "stadiumId": "boston",
      "date": "2026-07-09T16:00:00-04:00",
      "round": "Quarterfinals",
      "status": "knockout",
      "teamA": "W89",
      "teamB": "W90",
      "label": "W89 vs W90",
      "weather": "Weather TBC"
    },
    {
      "id": "m098",
      "matchNumber": 98,
      "stadiumId": "los-angeles",
      "date": "2026-07-10T15:00:00-07:00",
      "round": "Quarterfinals",
      "status": "knockout",
      "teamA": "W93",
      "teamB": "W94",
      "label": "W93 vs W94",
      "weather": "Weather TBC"
    },
    {
      "id": "m099",
      "matchNumber": 99,
      "stadiumId": "miami",
      "date": "2026-07-11T17:00:00-04:00",
      "round": "Quarterfinals",
      "status": "knockout",
      "teamA": "W91",
      "teamB": "W92",
      "label": "W91 vs W92",
      "weather": "Weather TBC"
    },
    {
      "id": "m100",
      "matchNumber": 100,
      "stadiumId": "kansas-city",
      "date": "2026-07-11T21:00:00-05:00",
      "round": "Quarterfinals",
      "status": "knockout",
      "teamA": "W95",
      "teamB": "W100",
      "label": "W95 vs W100",
      "weather": "Weather TBC"
    },
    {
      "id": "m101",
      "matchNumber": 101,
      "stadiumId": "dallas",
      "date": "2026-07-14T15:00:00-05:00",
      "round": "Semifinals",
      "status": "knockout",
      "teamA": "W97",
      "teamB": "W98",
      "label": "W97 vs W98",
      "weather": "Weather TBC"
    },
    {
      "id": "m102",
      "matchNumber": 102,
      "stadiumId": "atlanta",
      "date": "2026-07-15T15:00:00-04:00",
      "round": "Semifinals",
      "status": "knockout",
      "teamA": "W99",
      "teamB": "W100",
      "label": "W99 vs W100",
      "weather": "Weather TBC"
    },
    {
      "id": "m103",
      "matchNumber": 103,
      "stadiumId": "miami",
      "date": "2026-07-18T17:00:00-04:00",
      "round": "Third Place Playoff",
      "status": "knockout",
      "teamA": "RU101",
      "teamB": "RU102",
      "label": "RU101 vs RU102",
      "weather": "Weather TBC"
    },
    {
      "id": "m104",
      "matchNumber": 104,
      "stadiumId": "new-york-new-jersey",
      "date": "2026-07-19T15:00:00-04:00",
      "round": "Final",
      "status": "final",
      "teamA": "W101",
      "teamB": "W102",
      "label": "W101 vs W102",
      "weather": "Weather TBC"
    }
  ],
  "routes": [
    [
      "vancouver",
      "seattle",
      "san-francisco",
      "los-angeles"
    ],
    [
      "guadalajara",
      "mexico-city",
      "monterrey",
      "dallas",
      "houston",
      "kansas-city"
    ],
    [
      "toronto",
      "boston",
      "new-york-new-jersey",
      "philadelphia",
      "atlanta",
      "miami"
    ]
  ]
};
