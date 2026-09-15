# GeoMap Indonesia 2.0 — Domain Registry Specifications

The Domain Registry in GeoMap Indonesia 2.0 defines the configuration mapping for the platform's two core educational domains: `geology` and `hazard`.

---

## 1. Domain Architectural Constraint

In accordance with strict technical constraints:
- `js/core/domainRegistry.js` is implemented as a **plain configuration object (`domains`) plus a single getter function (`getDomainConfig`)**.
- It does **not** use classes, object factories, inheritance, or plugin frameworks.

---

## 2. Configuration Object Schema

```js
export const domains = {
  geology: {
    label: "Geological Explorer",
    color: "#4a7c59", // Muted forest green
    featureTypes: ["site", "volcano", "paleontology_site"],
    detailFields: [
      "geological_process",
      "geological_age",
      "geological_period",
      "rock_type",
      "taxon_name",
      "discovery_locality",
      "fossil_material",
      "paleoenvironment"
    ]
  },

  hazard: {
    label: "Geohazard Information",
    color: "#c85a32", // Terra cotta / muted rust orange
    featureTypes: ["historical_event"],
    detailFields: [
      "hazard_type",
      "event_date",
      "geological_explanation"
    ]
  }
};

export function getDomainConfig(domainKey) {
  return domains[domainKey];
}
```

---

## 3. Visual & Accessible Differentiation Rules

Color is **never** used as the sole visual differentiator between domains or statuses. The UI combines multiple sensory channels:

1. **Color Palette**:
   - `geology`: Deep natural slate green (`#4a7c59`)
   - `hazard`: Warm terra cotta orange (`#c85a32`)
2. **Text Labels**:
   - Explicit domain badges (`Geological Explorer` vs `Geohazard Information`).
3. **Distinct Symbols & SVG Shapes**:
   - `volcano`: Triangle icon with central vent indicator.
   - `site`: Diamond icon representing rock crystal / formation.
   - `paleontology_site`: Fossil / bone silhouette icon.
   - `historical_event`: Circle with internal hazard glyph (pulse / burst).
4. **Status Badges & WCAG AA Contrast**:
   - High contrast textual badges (`HISTORICAL`, `ILLUSTRATIVE`, `DEMO`).
