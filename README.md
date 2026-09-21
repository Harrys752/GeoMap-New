# GeoMap Indonesia 2.0

GeoMap Indonesia 2.0 is an educational geological and geohazard exploration platform focused on Indonesia. It connects Indonesian geological sites with geological processes, geological time, paleontology, and historical geohazard awareness — helping students and the public explore where geology happens and understand the science behind why it occurs.

---

## Non-Affiliation Disclaimer

GeoMap Indonesia 2.0 is an independent educational project. **It does not claim or imply affiliation with, endorsement by, or official authorization from MAGMA Indonesia, Pusat Volkanologi dan Mitigasi Bencana Geologi (PVMBG), Badan Geologi, Kementerian Energi dan Sumber Daya Mineral (ESDM), Badan Meteorologi, Klimatologi, dan Geofisika (BMKG), or Badan Nasional Penanggulangan Bencana (BNPB).**

---

## Operational Scope & Warning Disclaimer

> [!IMPORTANT]
> **NO LIVE MONITORING • NO EMERGENCY ALERTS • NO OFFICIAL WARNINGS**
>
> GeoMap Indonesia 2.0 is strictly a static educational exploration platform. It does **not** provide live seismic or volcanic monitoring data, real-time emergency notifications, or official disaster warnings. For official hazards, warnings, and active emergency alerts in Indonesia, refer to official government channels:
> - **Volcanic & Geological Hazards**: [MAGMA Indonesia (ESDM / PVMBG)](https://magma.esdm.go.id)
> - **Seismic & Tsunami Warnings**: [BMKG Indonesia](https://www.bmkg.go.id)
> - **Disaster Response & Management**: [BNPB Indonesia](https://www.bnpb.go.id)

---

## Features

- **Hybrid Domain Structure**:
  - **Geological Explorer (`geology`)**: 6 point-based entries covering volcanoes, paleontological sites, and geological formations.
  - **Geohazard Information (`hazard`)**: 3 point-based historical geohazard event entries.
- **Interactive Map**: Built with OpenLayers (ol.js) featuring multi-basemap support (Esri Satellite, OpenTopoMap Terrain, OpenStreetMap Standard) with custom layer controls and place labels overlay.
- **Domain-Aware Shared Detail Panel**: Displays rich conditional metadata (process, age, period, rock type, fossil material, hazard type, event date, data status, source citations) without empty fields.
- **Search & Filter Controls**: Live text filter by location name and feature type category with dynamic result count indicators.
- **Data Quality & Status Badges**: Explicit `data_status` badges (`historical`, `illustrative`, `demo`) and source attributions for every record.
- **Responsive & Accessible Design**: Restrained visual design using system fonts and high contrast for both desktop and mobile viewports.

---

## Project Structure

```
c:\vscode\geomap2\
├── index.html                  # Main application markup
├── README.md                   # Project overview & documentation
├── docs/                       # Technical documentation
│   ├── data-dictionary.md      # Schema & data properties guide
│   ├── domain-registry.md      # Domain configuration mapping
│   ├── source-policy.md        # Data attribution & source hierarchy
│   └── roadmap.md              # Project phase roadmap
├── css/                        # Application styles
│   ├── base.css                # Typography, layout, high-contrast system
│   ├── map.css                 # OpenLayers map & custom pin markers
│   └── panel.css               # Search, filters & detail panel drawer
├── js/                         # Application JavaScript (ES Modules)
│   ├── main.js                 # App orchestrator & initialization
│   ├── core/
│   │   └── domainRegistry.js   # Plain domain config & getter
│   ├── map/
│   │   ├── initMap.js          # OpenLayers map setup & multi-basemap manager
│   │   └── markerLayer.js      # Marker creation & event handling
│   ├── data/
│   │   ├── loadData.js         # GeoJSON loader & validator integration
│   │   ├── schema.js           # Data schema constants & allowed values
│   │   └── adapters/
│   │       ├── geologyAdapter.js # Geology domain detail adapter
│   │       └── hazardAdapter.js  # Hazard domain detail adapter
│   ├── ui/
│   │   ├── searchBar.js        # Search input filter logic
│   │   ├── filterPanel.js      # Domain & feature-type filters
│   │   └── detailPanel.js      # Shared detail drawer view component
│   └── utils/
│       └── validate.js         # GeoJSON structural & property validator
├── data/                       # Static GeoJSON datasets
│   ├── geology/
│   │   └── sites.demo.geojson  # Verified geological point entries
│   └── hazard/
│       └── historical-events.demo.geojson # Verified hazard event entries
└── test/
    └── validate.test.js        # Native Node.js validation test suite
```

---

## Local Setup & Development

No build steps or bundlers are required for GeoMap Indonesia 2.0.

### 1. Serving the static app
Serve the project directory using any static HTTP server (e.g. Python, Node `http-server`, or VS Code Live Server):

```bash
# Using Python 3
python -m http.server 8000

# Or using Node npx http-server
npx http-server -p 8000
```
Open `http://localhost:8000` in your web browser.

### 2. Running validation tests
To run the automated validation test suite using Node.js:

```bash
node test/validate.test.js
```

---

## License & Attribution

- Basemap tiles by [OpenStreetMap](https://www.openstreetmap.org/copyright) under ODbL.
- OpenLayers library licensed under BSD 2-Clause.
- Educational geological content sourced from peer-reviewed publications, UNESCO World Heritage & Geopark catalogs, USGS, and NOAA NCEI databases.
