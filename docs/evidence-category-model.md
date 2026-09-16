# GeoMap Indonesia 2.0 — Evidence Category Model & Mixed-Category Rule

## Overview
This document defines the canonical schema, normalization rules, and counting methodology for `evidence_type` in GeoMap Indonesia 2.0.

---

## 1. Schema & Data Formats

Allowed evidence categories (`ALLOWED_EVIDENCE_TYPES` in [`js/data/schema.js`](file:///c:/vscode/geomap2/js/data/schema.js)):
- `"Rock"`
- `"Fossil"`
- `"Landform"`
- `"Geological Structure"`
- `"Historical Record"`

Accepted data representations in GeoJSON feature properties:
1. **Single Category String**: `"Rock"`
2. **Multi-Category Array**: `["Rock", "Landform"]`
3. **Comma-Separated String**: `"Rock, Landform"`

---

## 2. Mixed-Category & Edge-Case Handling Rules

| Input Case | Description | Normalization Result | Category Dropdown Counts | Filter Selection Behavior |
|---|---|---|---|---|
| **Valid Single Category** | `"Rock"` or `["Rock"]` | `["Rock"]` | Adds 1 count to `"Rock"` | Visible when `"Rock"` or `"all"` selected |
| **Valid Multi-Category** | `["Rock", "Landform"]` or `"Rock, Landform"` | `["Rock", "Landform"]` | Adds 1 count to `"Rock"` AND 1 count to `"Landform"` | Visible when `"Rock"`, `"Landform"`, or `"all"` selected |
| **Mixed Valid / Invalid** | `["Rock", "UnknownType"]` or `"Rock, UnknownType"` | `["Rock"]` | Adds 1 count to `"Rock"`; invalid portion ignored for count, flagged for diagnostic audit | Visible when `"Rock"` selected; not dropped from view |
| **Missing Field** | `evidence_type` omitted | `["Uncategorized"]` | Adds 1 count to `"Uncategorized"` | Visible when `"Uncategorized"` or `"all"` selected |
| **Empty String** | `evidence_type: ""` | `["Uncategorized"]` | Adds 1 count to `"Uncategorized"` | Visible when `"Uncategorized"` or `"all"` selected |
| **Whitespace String** | `evidence_type: "   "` | `["Uncategorized"]` | Adds 1 count to `"Uncategorized"` | Visible when `"Uncategorized"` or `"all"` selected |
| **Unknown Category Only** | `evidence_type: "Subduction"` | `["Uncategorized"]` | Adds 1 count to `"Uncategorized"` | Visible when `"Uncategorized"` or `"all"` selected |

---

## 3. Product Rule Summary
- **No Silent Dropping**: Every record in the dataset is guaranteed to be counted and reachable under at least one Evidence Category option (either one or more allowed categories, or `"Uncategorized"`).
- **Multi-Category Count Aggregation**: In category dropdown displays, the sum of category counts may exceed the total number of features if multi-category records exist. This is expected and documented.
