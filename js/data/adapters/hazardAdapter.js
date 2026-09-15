/**
 * Hazard Data Adapter
 * Formats hazard feature properties into structured view models for the Phase 1 detail panel layout.
 */

/**
 * Transforms a valid hazard feature into a standardized detail panel view model.
 * @param {object} feature - GeoJSON feature record (domain: hazard)
 * @returns {object} Standardized view model for UI rendering
 */
export function adaptHazardFeature(feature) {
  const p = feature.properties || {};
  const [lng, lat] = feature.geometry.coordinates;

  const quickFacts = filterPresentFields({
    "Feature Type": "Historical Geohazard Event",
    "Event Date": p.event_date,
    "Hazard Category": formatHazardTypeLabel(p.hazard_type),
    "Location": `${lat.toFixed(4)}° N/S, ${lng.toFixed(4)}° E`
  });

  const geohazardContext = p.geological_explanation || null;
  const whyItMatters = p.why_it_matters || null;

  return {
    id: p.id,
    name: p.name,
    domain: p.domain || "hazard",
    domainLabel: "Geohazard Information",
    featureType: p.feature_type,
    featureTypeLabel: "Historical Geohazard Event",
    description: p.description,
    coordinates: { lng, lat },
    dataStatus: p.data_status,
    source: p.source,
    sourceUrl: p.source_url || null,
    lastUpdated: p.last_updated,
    geometryNote: p.geometry_note || null,

    // Phase 1 Structured Sections
    quickFacts,
    geohazardContext,
    whyItMatters
  };
}

function formatHazardTypeLabel(type) {
  switch (type) {
    case "volcanic": return "Volcanic Event";
    case "seismic": return "Seismic / Earthquake Event";
    case "tsunami": return "Tsunami Event";
    case "landslide": return "Landslide Event";
    default: return type || "Geohazard Event";
  }
}

function filterPresentFields(fieldMap) {
  const result = {};
  for (const [key, value] of Object.entries(fieldMap)) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      result[key] = value;
    }
  }
  return Object.keys(result).length > 0 ? result : null;
}
