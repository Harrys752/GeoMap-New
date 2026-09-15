# GeoMap Indonesia 2.0 — Source Policy

This document defines the data source hierarchy, metadata rules, non-attribution policies, and basemap tile provider terms of use for GeoMap Indonesia 2.0.

---

## 1. Source Hierarchy Preference (Per Domain)

Data entries must be compiled from reliable scientific, historical, or academic sources according to the following preference hierarchy (most to least preferred):

### 1.1 Geology Domain (`geology`)
1. **Tier 1 (Highest)**: Peer-reviewed geological publications (e.g. *Journal of Volcanology and Geothermal Research*, *Precambrian Research*, *GSA Bulletin*).
2. **Tier 2**: Official government survey publications & catalogs (non-live) — e.g., Badan Geologi reference monographs, USGS Geology research papers.
3. **Tier 3**: UNESCO World Heritage & UNESCO Global Geopark official nomination dossiers and geological summaries.
4. **Tier 4**: University / museum educational reference materials.
5. **Tier 5**: Clearly labeled educational interpretations (`data_status: illustrative`).

### 1.2 Paleontology Localities (`feature_type: paleontology_site`)
1. **Tier 1 (Highest)**: Peer-reviewed paleontological literature (e.g., primary publications by E. Dubois, G.H.R. von Koenigswald, or modern peer-reviewed analyses).
2. **Tier 2**: Institutional / museum specimen catalog records (e.g., Museum Geologi Bandung, Naturalis Biodiversity Center).
3. **Tier 3**: UNESCO World Heritage property documentation.

### 1.3 Volcanic & Geohazard Entries (`domain: hazard` or `feature_type: volcano`)
1. **Tier 1 (Highest)**: Smithsonian Institution Global Volcanism Program (GVP) reference catalog.
2. **Tier 2**: USGS Earthquake Hazards Program historical event archives & NOAA National Centers for Environmental Information (NCEI) hazard databases.
3. **Tier 3**: Published historical disaster post-event scientific monographs.

---

## 2. Minimum Required Metadata

Every single entry in GeoMap Indonesia 2.0 GeoJSON datasets must contain:
- `source`: Precise citation text (Author/Institution, Year, Document/Catalog Title).
- `data_status`: One of `historical`, `illustrative`, `demo`, or `current`.
- `last_updated`: ISO 8601 compilation date (`YYYY-MM-DD`).
- `source_url`: Required whenever the source is available via a stable digital catalog or URL.

---

## 3. Strict Non-Fabrication Rules

1. **No Invented Attributes**: Never fabricate coordinates, publication titles, event dates, author names, or URLs.
2. **Field-Level Candidate Handling**: If a specific candidate record cannot have all fields verified against traceable scientific literature:
   - Unsupported optional fields are omitted.
   - The record is marked with `data_status: illustrative`.
   - The `source` property is explicitly set to: `Illustrative educational example, not official data`.
3. **No False Government / Agency Endorsement**: Do not claim or imply that an entry is an official alert, warning, or live report issued by PVMBG, BMKG, BNPB, or ESDM.

---

## 4. Basemap Tile Providers & Geospatial Terms of Use

All tile providers integrated into GeoMap Indonesia 2.0 are publicly documented geospatial services. None require API key authentication for standard web map display.

### 4.1 Esri World Imagery (Satellite Base Layer — Default)
- **URL**: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
- **Attribution**: `Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community`
- **Max Zoom**: 18
- **Usage Terms**: Intended for low-traffic educational interactive display with visible attribution at all times. Bulk downloading, offline pre-caching, or dataset redistribution is prohibited.

### 4.2 Esri World Boundaries and Places (Place Labels Overlay Layer)
- **URL**: `https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`
- **Attribution**: `Esri, HERE, Garmin, © OpenStreetMap contributors, and the GIS User Community`
- **Max Zoom**: 18
- **Usage Terms**: Low-traffic educational interactive display with visible attribution. Bulk downloading or pre-caching prohibited.

### 4.3 OpenStreetMap Standard (Street Map Base Layer)
- **URL**: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Attribution**: `© OpenStreetMap contributors`
- **Max Zoom**: 19
- **Usage Terms**: Donation-funded public tile service without SLA. Intended for normal interactive web map viewing with visible attribution. No bulk scraping or prefetching.

### 4.4 OpenTopoMap (Terrain Base Layer)
- **URL**: `https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png`
- **Attribution**: `Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)`
- **Max Zoom**: 17
- **Usage Terms**: Donation-funded service intended for low-volume educational projects. Visible attribution required at all times. Bulk downloading or prefetching is prohibited.
