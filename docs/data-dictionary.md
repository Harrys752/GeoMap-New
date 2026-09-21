# GeoMap Indonesia 2.0 — Data Dictionary

This document defines the properties, data types, validation rules, and schema extensions for GeoMap Indonesia 2.0 GeoJSON features.

---

## 1. GeoJSON Structure Requirements

Every dataset file must be a valid GeoJSON `FeatureCollection`. Features support `Point`, `LineString`, and `Polygon` geometries.

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [[107.45, -6.83], [107.75, -6.84]]
      },
      "properties": { ... }
    }
  ]
}
```

- **Coordinates**: Array of `[longitude, latitude]`.
  - `longitude`: Floating point number in range `[-180.0, 180.0]`.
  - `latitude`: Floating point number in range `[-90.0, 90.0]`.

---


---

## 2.1 Multi-Geometry & Structural Extension Properties

| Property Name | Type | Allowed Values / Constraints | Description |
|---|---|---|---|
| `structure_type` | `string` | `active_fault`, `subduction_trench`, `mélange`, `fold_thrust_belt` | Specific geological structure classification |
| `geometry_status` | `string` | `verified`, `partially_verified`, `needs_review`, `missing` | Spatial geometry trace evidence confidence status |

## 2. Base Schema Properties (Required on Every Record)

| Property Name | Type | Allowed Values / Constraints | Description |
|---|---|---|---|
| `id` | `string` | Non-empty, unique across all datasets | Unique identifier for the entry (e.g. `geo_toba_caldera`). |
| `name` | `string` | Non-empty string | Human-readable title of the geological site or event. |
| `domain` | `string` | `"geology"` \| `"hazard"` | Primary domain classification. |
| `feature_type` | `string` | `"site"` \| `"volcano"` \| `"paleontology_site"` \| `"historical_event"` | Specific feature classification. |
| `description` | `string` | Non-empty summary text | Educational overview of the site or event. |
| `data_status` | `string` | `"demo"` \| `"historical"` \| `"illustrative"` \| `"current"` | Status tag of the data record. |
| `source` | `string` | Non-empty citation text | Source attribution for the data record. |
| `source_url` | `string` | Optional URL string | Direct URL to publication, catalog entry, or database record. |
| `last_updated` | `string` | ISO 8601 Date format (`YYYY-MM-DD`) | Date when this record was compiled or updated. |
| `geometry_note` | `string` | Optional text | Optional spatial representation note. If present, renders as `"Point-based representation"`. |

---

## 3. Educational & Domain Schema Extensions

### 3.1 Educational Hook Extension (Phase 1 Addition)

| Property Name | Type | Description |
|---|---|---|
| `why_it_matters` | `string` | Optional 1–3 sentence educational summary highlighting why the site or event is scientifically or historically significant. |

### 3.2 Geology Extension (`domain: geology`)

Optional fields provided for general geological sites and volcanic formations.

| Property Name | Type | Description |
|---|---|---|
| `geological_process` | `string` | Primary process (e.g., `"Subduction arc volcanism"`, `"Supereruption caldera collapse"`). |
| `geological_age` | `string` | Estimated age (e.g., `"Late Pleistocene (~74,000 BP)"`, `"Early Triassic (~210 Ma)"`). |
| `geological_period` | `string` | Geologic time period (e.g., `"Quaternary / Pleistocene"`, `"Mesozoic / Triassic"`). |
| `rock_type` | `string` | Lithology or predominant rock classification (e.g., `"Ignimbrite, Rhyolite"`, `"Granite"`). |

### 3.3 Paleontology Extension (`feature_type: paleontology_site`)

Fields specific to paleontological localities.

| Property Name | Type | Description |
|---|---|---|
| `taxon_name` | `string` | Taxonomic name of fossil organisms (e.g., `"*Homo erectus*"`). |
| `discovery_locality` | `string` | Specific Geographic locality of fossil discovery (e.g., `"Sangiran Dome, Central Java"`). |
| `fossil_material` | `string` | Types of preserved material (e.g., `"Cranial fragments, mandibular fossils, Stegodon remains"`). |
| `paleoenvironment` | `string` | Inferred ancient environment (e.g., `"River terrace deposit, open woodland floodplain"`). |

### 3.4 Geohazard Extension (`domain: hazard`)

Fields specific to historical geohazard events.

| Property Name | Type | Allowed Values / Constraints | Description |
|---|---|---|---|
| `hazard_type` | `string` | `"volcanic"` \| `"seismic"` \| `"landslide"` \| `"tsunami"` | Primary hazard mechanism. |
| `event_date` | `string` | ISO Date string (`YYYY-MM-DD`) or text | Historical date of event occurrence. |
| `geological_explanation` | `string` | Non-warning educational text | Explanation of geological mechanisms behind the hazard event. |

---

## 4. Status Badge Definitions

- `historical`: Factually verified historical event or documented geological locality.
- `illustrative`: Educational candidate record where complete scientific fields are simplified or summarized. Source text reads: `Illustrative educational example, not official data`.
- `demo`: Synthetic test record used for validator verification.
- `current`: Factually static current geological classification (used sparingly and never implying live feeds).
