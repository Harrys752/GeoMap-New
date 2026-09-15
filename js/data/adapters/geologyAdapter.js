/**
 * Geology Data Adapter
 * Formats geology feature properties into structured view models for the Phase 1 detail panel layout.
 */

/**
 * Transforms a valid geology feature into a standardized detail panel view model.
 * @param {object} feature - GeoJSON feature record (domain: geology)
 * @returns {object} Standardized view model for UI rendering
 */
export function adaptGeologyFeature(feature) {
  const p = feature.properties || {};
  const [lng, lat] = feature.geometry.coordinates;

  const quickFacts = filterPresentFields({
    "Feature Type": formatFeatureTypeLabel(p.feature_type),
    "Geological Age": p.geological_age || p.geological_period,
    "Rock Type / Lithology": p.rock_type,
    "Location": p.discovery_locality || `${lat.toFixed(4)}° N/S, ${lng.toFixed(4)}° E`
  });

  const geologicalContext = p.geological_process || null;

  const paleontologicalRecord = p.feature_type === "paleontology_site" ? filterPresentFields({
    "Taxon Name": p.taxon_name,
    "Discovery Locality": p.discovery_locality,
    "Fossil Material": p.fossil_material,
    "Paleoenvironment": p.paleoenvironment
  }) : null;

  const whyItMatters = p.why_it_matters || null;

  return {
    id: p.id,
    name: p.name,
    domain: p.domain || "geology",
    domainLabel: "Geological Explorer",
    featureType: p.feature_type,
    featureTypeLabel: formatFeatureTypeLabel(p.feature_type),
    description: p.description,
    coordinates: { lng, lat },
    dataStatus: p.data_status,
    source: p.source,
    sourceUrl: p.source_url || null,
    sourceType: p.source_type || null,
    lastUpdated: p.last_updated,
    geometryNote: p.geometry_note || null,

    // Phase 4 Evidence Properties
    evidenceType: p.evidence_type || null,
    evidenceDescription: p.evidence_description || null,
    evidenceSignificance: p.evidence_significance || null,

    // Phase 1 Structured Sections
    quickFacts,
    geologicalContext,
    paleontologicalRecord,
    whyItMatters
  };
}

function formatFeatureTypeLabel(type) {
  switch (type) {
    case "volcano": return "Volcano / Volcanic Complex";
    case "paleontology_site": return "Paleontological Site";
    case "site": return "Geological Site / Formation";
    default: return type || "Geology Site";
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
