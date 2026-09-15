# GeoMap Indonesia 2.0 — Project Roadmap

This roadmap outlines the development phases for GeoMap Indonesia 2.0, distinguishing completed releases from future planned enhancements.

---

## Phase 0 — Planning & Specification (Completed)
- Define hybrid educational identity (Geological Explorer + Geohazard Information).
- Establish technology stack constraints (HTML5, Vanilla CSS, Vanilla JS ES Modules, Leaflet.js, Static GeoJSON).
- Define project folder architecture, schema specifications, and workspace safety guidelines.

---

## Phase 1 — Stabilize and Educate (Completed Current Release)
- **Basemap Realism Upgrade**: Esri World Imagery (Satellite) default basemap, Esri World Boundaries & Places overlay, OpenTopoMap (Terrain), OpenStreetMap (Street Map), and session fallback handling.
- **Marker Readability**: Dual-contrast halo outline around custom SVG markers for legibility across satellite and terrain tiles.
- **Detail Panel Restructure**: Structured educational drawer (Quick Facts, Geological Context, Paleontological Record, Geohazard Context, Why It Matters, Source & Data Status) with strict conditional rendering (omitting empty containers).
- **Zoom-to-Feature & Marker Highlight**: `flyTo` camera zoom (zoom level 9) and marker highlight pulse ring on marker selection.
- **"Why It Matters" Educational Hooks**: 1–3 sentence educational significance added to all 10 verified candidate records.
- **About / Mission Section**: Dismissible modal detailing platform Mission, Vision, Educational Goals, and Scope Limitations.
- **Java Marker Density**: Solved via targeted `flyTo` zoom-to-feature without requiring third-party clustering libraries.

---

## Phase 2 — UX Refinement & Dataset Expansion (Deferred)
- Expansion of field-verified geological sites and paleontology localities across all Indonesian islands.
- Additional geological period filters (e.g. Cenozoic, Mesozoic, Paleozoic).
- Export capability for educational summaries (PDF / Print view).

---

## Phase 3 — Advanced Geological Geometry & Complex Layers (Deferred)
- Geometry extensions to support `LineString` (fault lines, tectonic subduction trenches) and `Polygon` (caldera boundaries, volcanic hazard zones).
- *Explicitly deferred until reliable, open scientific vector datasets are curated and verified.*

---

## Phase 4 — Institutional & Educational Integration (Deferred)
- Student quiz / educational interactive challenges.
- Offline PWA (Progressive Web App) support for classroom usage without internet connection.
