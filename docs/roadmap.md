# GeoMap Indonesia 2.0 — Project Roadmap

This roadmap outlines the development phases for GeoMap Indonesia 2.0, distinguishing completed releases from future planned enhancements.

---

## Phase 0 — Planning & Specification (Completed)
- Define hybrid educational identity (Geological Explorer + Geohazard Information).
- Establish technology stack constraints (HTML5, Vanilla CSS, Vanilla JS ES Modules, OpenLayers (migrated from Leaflet.js baseline), Static GeoJSON).
- Define project folder architecture, schema specifications, and workspace safety guidelines.

---

## Phase 1 — Stabilize and Educate (Completed Release)
- **Basemap Realism Upgrade**: Esri World Imagery (Satellite) default basemap, Esri World Boundaries & Places overlay, OpenTopoMap (Terrain), OpenStreetMap (Street Map), and session fallback handling.
- **Marker Readability**: Dual-contrast halo outline around custom SVG markers for legibility across satellite and terrain tiles.
- **Detail Panel Restructure**: Structured educational drawer (Quick Facts, Geological Context, Paleontological Record, Geohazard Context, Why It Matters, Source & Data Status) with strict conditional rendering (omitting empty containers).
- **Zoom-to-Feature & Marker Highlight**: `flyTo` camera zoom (zoom level 9) and marker highlight pulse ring on marker selection.
- **"Why It Matters" Educational Hooks**: 1–3 sentence educational significance added to candidate records.
- **About / Mission Section**: Dismissible modal detailing platform Mission, Vision, Educational Goals, and Scope Limitations.

---

## Phase 2 — Explore Geological Meaning (Completed Release)
- **Data Audit & Normalization**: Standardized `geological_period` buckets (`Quaternary`, `Neogene`, `Cretaceous`, `Triassic`) and 9 `geological_process` classifications.
- **Geological Process Explorer**: Process filter dropdown surfacing processes present in dataset.
- **Educational Geological Process Cards**: Interactive cards explaining What is it, How it works, Indonesian examples, and What we learn.
- **Dataset Expansion**: 18 total field-verified candidate entries (13 geology/paleontology + 5 historical hazard events) covering Lombok, Sulawesi, Sumatra, Flores, and Banda Deep.

---

## Phase 3 — Geological Time & Earth History (Completed Current Release)
- **Data Precision Audit**: Evaluated age precision across all 18 entries. Handled historical hazard events (1883-2018 CE) honestly by placing them in a separate Modern Historical Geohazard Record track.
- **Geological Time Visualization & Timeline**: Relative chronological sequence bar (Triassic → Cretaceous → Neogene → Quaternary → Historical Hazards) with dataset evidence chips.
- **Time-to-Map Connection**: Clicking a timeline dataset entry flies map to location, highlights marker, and opens detail panel.
- **Map-to-Time Reverse Connection**: Clicking any marker on the map syncs and highlights the corresponding period node on the timeline.
- **Educational Period Context Cards**: Displays general period planetary significance alongside specific dataset evidence.

---

## Phase 4 — Institutional & Educational Integration (Deferred)
- Student quiz / educational interactive challenges.
- Geometry extensions (`LineString` fault lines, `Polygon` caldera boundaries) pending open vector datasets.
- Offline PWA (Progressive Web App) support for classroom usage without internet connection.
