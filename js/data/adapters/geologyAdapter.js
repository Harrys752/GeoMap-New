import { getFeatureCenter } from "../../map/markerLayer.js";
import { getLanguage, getLocalizedFeature, t } from "../../i18n/i18n.js";

/**
 * Geology Data Adapter
 * Formats geology feature properties into structured view models for the Phase 1 detail panel layout.
 * Supports dynamic bilingual presentation without mutating canonical datasets.
 */

/**
 * Transforms a valid geology feature into a standardized detail panel view model.
 * @param {object} rawFeature - GeoJSON feature record (domain: geology)
 * @param {string} [lang=null] - Target language ('en' | 'id')
 * @returns {object} Standardized view model for UI rendering
 */
export function adaptGeologyFeature(rawFeature, lang = null) {
  const activeLang = lang || getLanguage();
  const feature = getLocalizedFeature(rawFeature, activeLang);
  const p = feature.properties || {};
  const center = getFeatureCenter(feature) || [0, 0];
  const lng = typeof center[0] === "number" ? center[0] : 0;
  const lat = typeof center[1] === "number" ? center[1] : 0;

  const quickFacts = filterPresentFields({
    [t("fact_feature_type", {}, activeLang)]: formatFeatureTypeLabel(p.feature_type, activeLang),
    [t("fact_structure_type", {}, activeLang)]: formatStructureTypeLabel(p.structure_type, activeLang),
    [t("fact_geological_age", {}, activeLang)]: p.geological_age || (p.geological_period ? (t("period_" + p.geological_period, {}, activeLang) || p.geological_period) : null),
    [t("fact_rock_type", {}, activeLang)]: p.rock_type,
    [t("fact_location", {}, activeLang)]: p.discovery_locality || `${lat.toFixed(4)}° N/S, ${lng.toFixed(4)}° E`
  });

  const geologicalContext = p.geological_process || null;

  const paleontologicalRecord = p.feature_type === "paleontology_site" ? filterPresentFields({
    [t("fact_taxon_name", {}, activeLang)]: p.taxon_name,
    [t("fact_discovery_locality", {}, activeLang)]: p.discovery_locality,
    [t("fact_fossil_material", {}, activeLang)]: p.fossil_material,
    [t("fact_paleoenvironment", {}, activeLang)]: p.paleoenvironment
  }) : null;

  const whyItMatters = p.why_it_matters || null;

  return {
    id: p.id,
    name: p.name,
    domain: p.domain || "geology",
    domainLabel: t("domain_label_geology", {}, activeLang),
    featureType: p.feature_type,
    featureTypeLabel: formatFeatureTypeLabel(p.feature_type, activeLang),
    description: p.description,
    coordinates: { lng, lat },
    dataStatus: p.data_status,
    source: p.source,
    sourceUrl: p.source_url || null,
    sourceType: p.source_type || null,
    sourceVerificationStatus: p.source_verification_status || "needs_review",
    recordCompilationDate: p.record_compilation_date || p.last_updated || null,
    lastUpdated: p.last_updated,
    geometryNote: p.geometry_note || null,
    structureType: p.structure_type || null,
    geometryStatus: p.geometry_status || null,
    activeLang,

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

export function formatFeatureTypeLabel(type, lang = "en") {
  const key = "ft_" + type;
  const translated = t(key, {}, lang);
  if (translated && translated !== key) return translated;

  switch (type) {
    case "volcano": return lang === "id" ? "Gunung Api / Kompleks Vulkanik" : "Volcano / Volcanic Complex";
    case "paleontology_site": return lang === "id" ? "Situs Paleontologi" : "Paleontological Site";
    case "site": return lang === "id" ? "Situs / Formasi Geologi" : "Geological Site / Formation";
    case "tectonic_structure": return lang === "id" ? "Struktur Tektonik" : "Tectonic Structure";
    case "geological_complex": return lang === "id" ? "Kompleks Geologi" : "Geological Complex";
    case "volcanic_complex": return lang === "id" ? "Kompleks Vulkanik" : "Volcanic Complex";
    case "mountain_system": return lang === "id" ? "Sistem / Pegunungan" : "Mountain System / Range";
    case "basin": return lang === "id" ? "Cekungan Sedimen & Tektonik" : "Sedimentary & Tectonic Basin";
    case "regional_karst": return lang === "id" ? "Sistem Karst Regional" : "Regional Karst System";
    case "volcanic_arc": return lang === "id" ? "Sistem Busur Vulkanik" : "Volcanic Arc System";
    default: return type || (lang === "id" ? "Situs Geologi" : "Geology Site");
  }
}

export function formatStructureTypeLabel(type, lang = "en") {
  const normalized = (type || "").replace("mAclange", "melange").replace("mélange", "melange");
  const key = "st_" + normalized;
  const translated = t(key, {}, lang);
  if (translated && translated !== key) return translated;

  switch (normalized) {
    case "active_fault": return lang === "id" ? "Jalur Sesar Aktif" : "Active Fault Line";
    case "subduction_trench": return lang === "id" ? "Sumbu Palung Subduksi" : "Subduction Trench Axis";
    case "melange": return lang === "id" ? "Kompleks Melange Subduksi" : "Subduction Mélange Complex";
    case "fold_thrust_belt": return lang === "id" ? "Jalur Lipatan & Sesar Naik (Fold & Thrust Belt)" : "Fold & Thrust Belt";
    case "mountain_range": return lang === "id" ? "Pegunungan" : "Mountain Range";
    case "physiographic_zone": return lang === "id" ? "Zona Fisiografi" : "Physiographic Zone";
    case "intermontane_basin": return lang === "id" ? "Cekungan Antarmontana Vulkano-Tektonik" : "Intermontane Volcano-Tectonic Basin";
    case "sedimentary_basin": return lang === "id" ? "Cekungan Sedimen" : "Sedimentary Basin";
    case "tropical_kegelkarst": return lang === "id" ? "Sistem Karst Tropis (Kegelkarst)" : "Tropical Kegelkarst System";
    case "volcanic_arc_axis": return lang === "id" ? "Sumbu Depan Vulkanik (Representatif)" : "Volcanic Front Axis (Representative)";
    default: return type || null;
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
