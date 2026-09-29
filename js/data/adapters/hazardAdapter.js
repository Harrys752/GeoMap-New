import { getLanguage, getLocalizedFeature, t } from "../../i18n/i18n.js";

/**
 * Hazard Data Adapter
 * Formats hazard feature properties into structured view models for the Phase 1 detail panel layout.
 * Supports dynamic bilingual presentation without mutating canonical datasets.
 */

/**
 * Transforms a valid hazard feature into a standardized detail panel view model.
 * @param {object} rawFeature - GeoJSON feature record (domain: hazard)
 * @param {string} [lang=null] - Target language ('en' | 'id')
 * @returns {object} Standardized view model for UI rendering
 */
export function adaptHazardFeature(rawFeature, lang = null) {
  const activeLang = lang || getLanguage();
  const feature = getLocalizedFeature(rawFeature, activeLang);
  const p = feature.properties || {};
  const [lng, lat] = feature.geometry.coordinates;

  const quickFacts = filterPresentFields({
    [t("fact_feature_type", {}, activeLang)]: t("ft_historical_event", {}, activeLang),
    [t("fact_event_start_date", {}, activeLang)]: p.event_date,
    [t("fact_event_end_date", {}, activeLang)]: p.event_end_date,
    [t("fact_hazard_category", {}, activeLang)]: formatHazardTypeLabel(p.hazard_type, activeLang),
    [t("fact_location", {}, activeLang)]: `${lat.toFixed(4)}° N/S, ${lng.toFixed(4)}° E`
  });

  const geohazardContext = p.geological_explanation || null;
  const whyItMatters = p.why_it_matters || null;

  return {
    id: p.id,
    name: p.name,
    domain: p.domain || "hazard",
    domainLabel: t("domain_label_hazard", {}, activeLang),
    featureType: p.feature_type,
    featureTypeLabel: t("ft_historical_event", {}, activeLang),
    description: p.description,
    coordinates: { lng, lat },
    dataStatus: p.data_status,
    source: p.source,
    sourceUrl: p.source_url || null,
    sourceType: p.source_type || null,
    sourceVerificationStatus: p.source_verification_status || "needs_review",
    recordCompilationDate: p.record_compilation_date || p.last_updated || null,
    eventDate: p.event_date || null,
    eventEndDate: p.event_end_date || null,
    eventDatePrecision: p.event_date_precision || null,
    lastUpdated: p.last_updated,
    geometryNote: p.geometry_note || null,
    activeLang,

    // Phase 4 Evidence Properties
    evidenceType: p.evidence_type || null,
    evidenceDescription: p.evidence_description || null,
    evidenceSignificance: p.evidence_significance || null,

    // Phase 1 Structured Sections
    quickFacts,
    geohazardContext,
    whyItMatters
  };
}

export function formatHazardTypeLabel(type, lang = "en") {
  const key = "ht_" + type;
  const translated = t(key, {}, lang);
  if (translated && translated !== key) return translated;

  switch (type) {
    case "volcanic": return lang === "id" ? "Peristiwa Vulkanik" : "Volcanic Event";
    case "seismic": return lang === "id" ? "Peristiwa Seismik / Gempa Bumi" : "Seismic / Earthquake Event";
    case "tsunami": return lang === "id" ? "Peristiwa Tsunami" : "Tsunami Event";
    case "landslide": return lang === "id" ? "Peristiwa Longsor" : "Landslide Event";
    default: return type || (lang === "id" ? "Peristiwa Bahaya Geologi" : "Geohazard Event");
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
