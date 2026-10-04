# GeoMap Indonesia 2.0

GeoMap Indonesia 2.0 is an independent educational web map for exploring the geology, paleontology, and historical geohazards of the Indonesian archipelago. It connects geographic locations with geological processes, geological time periods, physical evidence types, fossil records, and documented academic literature.

---

## Disclaimers

### Non-Affiliation
GeoMap Indonesia 2.0 is an independent educational project. It does not claim or imply affiliation with, endorsement by, or official authorization from MAGMA Indonesia, Pusat Volkanologi dan Mitigasi Bencana Geologi (PVMBG), Badan Geologi, Kementerian Energi dan Sumber Daya Mineral (ESDM), Badan Meteorologi, Klimatologi, dan Geofisika (BMKG), or Badan Nasional Penanggulangan Bencana (BNPB).

### Operational Scope & Limitations
**NO LIVE MONITORING • NO EMERGENCY ALERTS • NO OFFICIAL WARNINGS**

GeoMap Indonesia 2.0 is strictly a static educational exploration tool. It does not provide live seismic or volcanic monitoring data, real-time emergency notifications, or official disaster warnings. For official alerts and active disaster response information in Indonesia, refer to official channels:
- **Volcanic & Geological Hazards**: [MAGMA Indonesia (ESDM / PVMBG)](https://magma.esdm.go.id)
- **Seismic & Tsunami Warnings**: [BMKG Indonesia](https://www.bmkg.go.id)
- **Disaster Response & Management**: [BNPB Indonesia](https://www.bnpb.go.id)

---

## Features

- **Multi-Geometry Map Visualization**:
  - Interactive map built with OpenLayers (ol.js v9.2.4).
  - Renders 54 Point markers, 11 LineString traces (active fault lines and subduction trench axes), and 13 Polygon boundaries (regional mélange and karst complexes).
  - Multiple basemap layers: Esri World Imagery (Satellite), OpenTopoMap (Terrain), and OpenStreetMap Standard.
  - Candidate structural feature layer toggle to view regional structures separately from site pins.
- **Search & Filtering**:
  - Client-side keyword search with autocomplete matching location names, fossil taxa, rock types, discovery localities, and descriptions.
  - Multi-facet filtering by domain (`geology` / `hazard`), feature types, geological periods (Triassic to Quaternary), physical evidence categories (Rock, Fossil, Landform, Geological Structure, Historical Record), and candidate layer visibility.
- **Contextual Detail Panel**:
  - Responsive side drawer presenting structured metadata without empty fields: geological processes, geological age, rock types, fossil materials, paleoenvironments, hazard details, and physical evidence descriptions.
  - Multi-source citation viewer with geological explanations and source references.
- **Bilingual Interface**:
  - Dynamic runtime language toggle between English and Bahasa Indonesia across all UI controls, timeline labels, and dataset descriptions.

---

## Data

The project contains 78 geospatial records stored across three static GeoJSON files in WGS84 (`EPSG:4326`):

1. **Production Geological Sites** (`data/geology/sites.demo.geojson`, 20 records):
   - Point localities covering volcanoes, hominin discovery sites (e.g., Sangiran, Trinil, Liang Bua), and geological complexes.
2. **Candidate Geological & Structural Features** (`data/geology/candidates.demo.geojson`, 47 records):
   - Regional macro-geomorphological features (e.g., Pegunungan Bukit Barisan, Pegunungan Meratus, Pegunungan Maoke), sedimentary and tectonic basins (e.g., Cekungan Bandung, Cekungan Barito), regional karst systems (Gunung Sewu), active fault traces (e.g., Palu-Koro, Lembang, Cimandiri, Baribis, Opak, Semangko, Sorong), subduction zones (Palung Sunda-Jawa, Molucca Sea collision), ophiolite complexes (Cyclops), and marine fossil formations (e.g., Nanggulan, Baturaja, Karangbolong, Rajamandala, Jonggrangan, Sentolo, Cibodas, Gumai, Misool, Timor).
   - Candidate records allow expanding the map's structural and paleontological coverage while maintaining a clear distinction from core production sites.
3. **Historical Geohazard Events** (`data/hazard/historical-events.demo.geojson`, 11 records):
   - Documented historical earthquakes, tsunamis, and volcanic eruptions (e.g., Krakatau 1883, Tambora 1815, Aceh 2004, Flores 1992, Yogyakarta 2006, Palu 2018) with geological explanations and source references.

### Metadata & Provenance Fields
Each record in the dataset is structured with standard properties:
- **Identification**: `id`, `name`, `domain` (`geology` | `hazard`), `feature_type`
- **Earth Science Context**: `geological_process`, `geological_age`, `geological_period`, `rock_type`, `formation`
- **Paleontology (where applicable)**: `taxon_name`, `fossil_material`, `paleoenvironment`, `discovery_locality`
- **Physical Evidence**: `evidence_type`, `evidence_description`, `evidence_significance`, `why_it_matters`
- **Hazard Context (where applicable)**: `hazard_type`, `event_date`, `event_end_date`, `event_date_precision`, `geological_explanation`
- **Provenance & Verification**: `source`, `source_citation`, `source_url`, `doi`, `source_type`, `source_verification_status` (`verified` | `partially_verified` | `needs_review`), and structured `sources` arrays for multi-reference features.

---

## Project Structure

```text
.
├── index.html                  # Application entry point
├── README.md                   # Project documentation
├── css/                        # Stylesheets
│   ├── base.css                # Base typography, layout, and theme variables
│   ├── map.css                 # OpenLayers map and vector pin styling
│   └── panel.css               # Search, filter panels, and detail drawer
├── js/                         # Application JavaScript (ES Modules)
│   ├── main.js                 # Application coordinator and initialization
│   ├── core/
│   │   └── domainRegistry.js   # Domain configuration mapping
│   ├── data/                   # Data loaders, schemas, and adapters
│   │   ├── loadData.js         # GeoJSON fetch and validation pipeline
│   │   ├── queryHelper.js      # Filter and search query functions
│   │   ├── schema.js           # Schema constants and allowed enum values
│   │   ├── periodContextData.js # Geological period metadata
│   │   ├── processCardsData.js # Geological process reference data
│   │   ├── evidenceGuideData.js # Evidence category definitions
│   │   └── adapters/
│   │       ├── geologyAdapter.js # Transforms geology records for detail UI
│   │       └── hazardAdapter.js  # Transforms hazard records for detail UI
│   ├── i18n/                   # Internationalization
│   │   ├── i18n.js             # Translation resolver and language state
│   │   ├── uiStrings.js        # UI label dictionaries (EN / ID)
│   │   └── datasetContentId.js # Localized Indonesian dataset prose
│   ├── map/                    # Map initialization and vector layers
│   │   ├── initMap.js          # OpenLayers setup and basemap switcher
│   │   └── markerLayer.js      # Vector features, styling, and click events
│   ├── ui/                     # User interface components
│   │   ├── searchBar.js        # Search input and autocomplete suggestions
│   │   ├── filterPanel.js      # Domain, category, and evidence filters
│   │   ├── timeline.js         # Geological time period controls
│   │   ├── detailPanel.js      # Detail drawer renderer with source links
│   │   └── confidenceLabels.js # Data confidence metadata helpers
│   └── utils/                  # Utilities and validation
│       ├── diagnostic.js       # Reachability and audit helpers
│       └── validate.js         # GeoJSON schema and coordinate validator
├── data/                       # Static GeoJSON datasets (WGS84 / EPSG:4326)
│   ├── geology/
│   │   ├── sites.demo.geojson  # 20 production geology site records
│   │   └── candidates.demo.geojson # 47 candidate geology/structural records
│   └── hazard/
│       └── historical-events.demo.geojson # 11 historical hazard event records
├── docs/                       # Technical documentation and data policies
│   ├── data-dictionary.md      # Schema properties and data fields guide
│   ├── domain-registry.md      # Domain and feature type definitions
│   ├── evidence-category-model.md # Physical evidence taxonomy
│   ├── source-policy.md        # Provenance hierarchy and source standards
│   ├── phase5-data-change-log.md # Dataset revision log
│   ├── phase5-source-audit.md  # Source connectivity audit log
│   ├── phase5-source-connectivity-audit.md # Connectivity test records
│   ├── phase6-diagnostic-report.md # Phase 6 diagnostic analysis
│   ├── phase6-record-level-source-audit.md # Record-level source audit report
│   └── roadmap.md              # Project phase roadmap
└── test/                       # Automated test suites (Node.js)
    ├── validate.test.js        # Schema validation and anti-bare-homepage tests
    ├── phase6.test.js          # Provenance and multi-filter combination tests
    ├── macro_candidate_ingestion.test.js # Candidate dataset ingestion tests
    ├── geometry_types.test.js  # Point, LineString, Polygon schema tests
    ├── i18n.test.js            # Bilingual translation symmetry tests
    ├── evidence_phase4.test.js # Evidence category model tests
    ├── candidate_toggle.test.js# Candidate layer toggle invariant tests
    ├── basemap.test.js         # Basemap tile reachability tests
    ├── phase5.test.js          # Date precision and provenance tests
    ├── phase7.test.js          # Detail rendering and alias resolution tests
    ├── timeline_fix.test.js    # Historical hazards timeline filter tests
    └── fixtures/               # Test fixtures for audit verification
```

---

## Running Locally

GeoMap Indonesia 2.0 runs as a static web application using standard ES Modules. No build step, bundler, or compilation pipeline is required.

### 1. Start a Local Static Server
Serve the repository root directory using any local static HTTP server:

```bash
# Using Python 3
python -m http.server 8000

# Or using Node http-server
npx http-server -p 8000
```

Open `http://localhost:8000` in your browser.

### 2. Run Automated Tests
The repository includes automated test suites using the native Node.js test runner:

```bash
# Run all test suites
node --test

# Or run individual test suites
node test/validate.test.js
node test/phase6.test.js
node test/macro_candidate_ingestion.test.js
```

---

## Data Sources and Attribution

### Scientific Literature & Institutional Sources
Records in the dataset cite peer-reviewed academic publications and institutional surveys, including:
- **Journals**: Records cite peer-reviewed publications and institutional sources, including geological surveys, scientific journals, UNESCO documentation, and hazard archives.
- **Monographs & Memoirs**: Geological Society of London Memoirs, U.S. Geological Survey (USGS) Professional Papers, and Geological Research and Development Centre (GRDC / Badan Geologi) publications.
- **Institutional Catalogs**: UNESCO World Heritage and Global Geopark dossiers, Naturalis Biodiversity Center registers, and NOAA NCEI hazard archives.

### Third-Party Software & Basemaps
- **OpenLayers**: [OpenLayers](https://openlayers.org/) (ol.js v9.2.4), licensed under the BSD 2-Clause License.
- **OpenStreetMap**: [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, licensed under the Open Data Commons Open Database License (ODbL).
- **Esri Imagery**: Esri World Imagery and Boundaries/Places layers courtesy of Esri, Maxar, Earthstar Geographics, and the GIS User Community.
- **OpenTopoMap**: [OpenTopoMap](https://opentopomap.org), licensed under CC-BY-SA.

---

## Limitations

- **Static Educational Dataset**: The dataset is static and curated for educational exploration. It does not ingest live telemetry or real-time earthquake/volcanic feeds.
- **Representative Geometries**: Regional formations and broad mountain chains are represented by representative centroid points or generalized linear/polygonal boundaries rather than high-resolution engineering survey contacts.
- **Educational Scope**: While entries cite peer-reviewed literature, GeoMap is an educational synthesis and is not an official government cadastre or geological mapping authority.
