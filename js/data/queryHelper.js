/**
 * GeoMap Indonesia 2.0 — Query Helper & Canonical Data Model
 * 
 * Establishes centralized predicates, label mappings, evidence category normalizers,
 * dynamic dataset counter, and domain-switch filter sanitization.
 */

import { ALLOWED_EVIDENCE_TYPES } from "./schema.js";

export const LABEL_MAPPINGS = {
  geology: "Geological Explorer",
  hazard: "Geohazard Information",
  historical_event: "Historical Hazards",
  historical_event_alt: "Historical Hazard Events"
};

/**
 * Normalizes evidence_type property for a feature.
 * Supports string, array, empty/whitespace, and unknown categories.
 * @param {object} feature - GeoJSON feature
 * @returns {string[]} Array of normalized evidence category strings
 */
export function getFeatureEvidenceCategories(feature) {
  const raw = feature?.properties?.evidence_type;
  if (!raw) return ["Uncategorized"];

  let categories = [];
  if (Array.isArray(raw)) {
    categories = raw.map(c => String(c).trim()).filter(Boolean);
  } else if (typeof raw === "string") {
    // Split by comma if multi-category string, or trim
    categories = raw.split(",").map(s => s.trim()).filter(Boolean);
  }

  if (categories.length === 0) return ["Uncategorized"];

  const validCategories = [];
  let hasInvalid = false;

  for (const cat of categories) {
    if (ALLOWED_EVIDENCE_TYPES.includes(cat)) {
      validCategories.push(cat);
    } else {
      hasInvalid = true;
    }
  }

  if (validCategories.length === 0) {
    return ["Uncategorized"];
  }

  // If there's at least one valid category, return valid categories.
  return validCategories;
}

/**
 * Predicate: Checks if a feature is a Historical Hazard event.
 * Canonical definition: feature_type === "historical_event"
 * @param {object} feature - GeoJSON feature
 * @returns {boolean}
 */
export function isHistoricalHazard(feature) {
  if (!feature || !feature.properties) return false;
  return feature.properties.feature_type === "historical_event";
}

/**
 * Predicate: Checks if a feature belongs to a specific Geological Period track.
 * Product Rule:
 * - If periodKey === "Historical", returns true ONLY for historical hazards (feature_type === "historical_event").
 * - For geological periods (Triassic, Cretaceous, Neogene, Quaternary), returns true ONLY if
 *   feature.properties.geological_period === periodKey AND feature is NOT a historical hazard event.
 * Historical hazard events retain their scientific geological_period (e.g. "Quaternary") in raw GeoJSON,
 * but are counted and filtered exclusively under the "Historical Hazards" track.
 * 
 * @param {object} feature - GeoJSON feature
 * @param {string} periodKey - "Triassic" | "Cretaceous" | "Neogene" | "Quaternary" | "Historical" | "all"
 * @returns {boolean}
 */
export function isGeologicalPeriod(feature, periodKey) {
  if (!feature || !feature.properties || !periodKey || periodKey === "all") return true;

  if (periodKey === "Historical") {
    return isHistoricalHazard(feature);
  }

  // For geological period tracks, require period match AND exclude historical hazard events
  return feature.properties.geological_period === periodKey && !isHistoricalHazard(feature);
}

/**
 * Predicate: Checks if a feature matches an Evidence Category filter.
 * @param {object} feature - GeoJSON feature
 * @param {string} categoryKey - "Rock" | "Fossil" | "Landform" | "Geological Structure" | "Historical Record" | "Uncategorized" | "all"
 * @returns {boolean}
 */
export function matchesEvidenceCategory(feature, categoryKey) {
  if (!feature || !categoryKey || categoryKey === "all") return true;
  const categories = getFeatureEvidenceCategories(feature);
  return categories.includes(categoryKey);
}

/**
 * Predicate: Checks if a feature matches a Data Confidence status filter.
 * Fail-safe handling for missing, null, undefined, whitespace, or unknown status strings.
 * @param {object} feature - GeoJSON feature
 * @param {string} confidenceKey - "verified" | "partially_verified" | "needs_review" | "invalid" | "missing" | "all"
 * @returns {boolean}
 */
export function matchesConfidenceStatus(feature, confidenceKey) {
  if (!feature || !confidenceKey || confidenceKey === "all") return true;

  const raw = feature?.properties?.source_verification_status;
  const normalized = (typeof raw === "string" && raw.trim().length > 0) ? raw.trim().toLowerCase() : "needs_review";

  const knownStatuses = ["verified", "partially_verified", "needs_review", "invalid", "missing"];
  const safeStatus = knownStatuses.includes(normalized) ? normalized : "needs_review";

  if (confidenceKey === "needs_review") {
    return safeStatus === "needs_review" || !knownStatuses.includes(normalized);
  }

  return safeStatus === confidenceKey;
}

/**
 * Computes canonical dataset counts across domains, feature types, processes, periods, evidence categories, and confidence statuses.
 * @param {object[]} features - Array of GeoJSON features
 * @returns {object} Canonical dataset counts object
 */
export function computeCanonicalDatasetCounts(features = []) {
  const counts = {
    total: features.length,
    domain: { all: features.length, geology: 0, hazard: 0 },
    featureType: {},
    process: {},
    period: {
      Triassic: 0,
      Cretaceous: 0,
      Neogene: 0,
      Quaternary: 0,
      Historical: 0
    },
    evidenceType: {
      Rock: 0,
      Fossil: 0,
      Landform: 0,
      "Geological Structure": 0,
      "Historical Record": 0,
      Uncategorized: 0
    },
    confidenceStatus: {
      verified: 0,
      partially_verified: 0,
      needs_review: 0,
      invalid: 0,
      missing: 0
    }
  };

  for (const f of features) {
    const props = f?.properties || {};
    const d = props.domain;
    const t = props.feature_type;
    const proc = props.geological_process;

    // Domain count
    if (d && counts.domain[d] !== undefined) {
      counts.domain[d]++;
    }

    // Feature Type count
    if (t) {
      counts.featureType[t] = (counts.featureType[t] || 0) + 1;
    }

    // Process count
    if (proc) {
      counts.process[proc] = (counts.process[proc] || 0) + 1;
    }

    // Geological Period count (using single canonical predicate)
    if (isHistoricalHazard(f)) {
      counts.period["Historical"]++;
    } else if (props.geological_period && counts.period[props.geological_period] !== undefined) {
      counts.period[props.geological_period]++;
    }

    // Evidence Category count (handling multi-category and Uncategorized)
    const evCategories = getFeatureEvidenceCategories(f);
    for (const cat of evCategories) {
      if (counts.evidenceType[cat] !== undefined) {
        counts.evidenceType[cat]++;
      } else {
        counts.evidenceType[cat] = 1;
      }
    }

    // Data Confidence status count (fail-safe handling for missing/unknown status)
    const rawStatus = props.source_verification_status;
    const normStatus = (typeof rawStatus === "string" && rawStatus.trim().length > 0) ? rawStatus.trim().toLowerCase() : "needs_review";
    const safeStatus = (counts.confidenceStatus[normStatus] !== undefined) ? normStatus : "needs_review";
    counts.confidenceStatus[safeStatus]++;
  }

  return counts;
}

/**
 * Evaluates whether a feature matches all active filter criteria.
 * @param {object} feature - GeoJSON feature
 * @param {object} filterState - { domain, featureTypes, process, period, evidenceType, confidenceStatus }
 * @returns {boolean}
 */
export function matchesCanonicalFilter(feature, filterState) {
  if (!filterState || !feature) return true;
  const props = feature.properties || {};
  const { domain, featureTypes, process, period, evidenceType, confidenceStatus } = filterState;

  // 1. Domain Check
  if (domain && domain !== "all") {
    if (domain === "hazard" && !isHistoricalHazard(feature)) return false;
    if (domain === "geology" && isHistoricalHazard(feature)) return false;
  }

  // 2. Feature Type Check
  if (featureTypes && featureTypes.size > 0 && !featureTypes.has(props.feature_type)) {
    return false;
  }

  // 3. Geological Process Check
  if (process && process !== "all" && props.geological_process !== process) {
    return false;
  }

  // 4. Geological Period / Historical Track Check (using shared predicate)
  if (!isGeologicalPeriod(feature, period)) {
    return false;
  }

  // 5. Evidence Category Check (using shared predicate)
  if (!matchesEvidenceCategory(feature, evidenceType)) {
    return false;
  }

  // 6. Data Confidence Status Check (using shared predicate)
  if (!matchesConfidenceStatus(feature, confidenceStatus)) {
    return false;
  }

  return true;
}

/**
 * Sanitizes filter state when switching domain (e.g. "geology" -> "hazard" or vice versa).
 * Automatically resets active process, period, evidence, or confidence filters to "all" if they have 0 matching records in the target domain.
 * 
 * @param {object} currentFilterState - Existing filter state
 * @param {string} targetDomain - New domain ("geology", "hazard", or "all")
 * @param {object[]} allFeatures - Complete dataset
 * @returns {{ sanitizedState: object, resetFields: string[] }}
 */
export function sanitizeFilterStateForDomain(currentFilterState, targetDomain, allFeatures) {
  const sanitizedState = {
    ...currentFilterState,
    domain: targetDomain
  };
  const resetFields = [];

  if (targetDomain === "all") {
    return { sanitizedState, resetFields };
  }

  // Get features belonging to the target domain
  const domainFeatures = allFeatures.filter(f => {
    if (targetDomain === "hazard") return isHistoricalHazard(f);
    if (targetDomain === "geology") return !isHistoricalHazard(f);
    return true;
  });

  // Check Feature Types set
  let allowedDomainTypes = [];
  if (targetDomain === "hazard") {
    allowedDomainTypes = ["historical_event"];
  } else if (targetDomain === "geology") {
    allowedDomainTypes = ["site", "volcano", "paleontology_site"];
  }

  if (allowedDomainTypes.length > 0 && sanitizedState.featureTypes && sanitizedState.featureTypes.size > 0) {
    const hasAnyAllowed = Array.from(sanitizedState.featureTypes).some(t => allowedDomainTypes.includes(t));
    if (!hasAnyAllowed) {
      sanitizedState.featureTypes = new Set(allowedDomainTypes);
      resetFields.push("Feature Types");
    }
  }

  // Check Process filter
  if (sanitizedState.process && sanitizedState.process !== "all") {
    const hasMatch = domainFeatures.some(f => f.properties?.geological_process === sanitizedState.process);
    if (!hasMatch) {
      sanitizedState.process = "all";
      resetFields.push("Process");
    }
  }

  // Check Period filter
  if (sanitizedState.period && sanitizedState.period !== "all") {
    const hasMatch = domainFeatures.some(f => isGeologicalPeriod(f, sanitizedState.period));
    if (!hasMatch) {
      sanitizedState.period = "all";
      resetFields.push("Period");
    }
  }

  // Check Evidence Category filter
  if (sanitizedState.evidenceType && sanitizedState.evidenceType !== "all") {
    const hasMatch = domainFeatures.some(f => matchesEvidenceCategory(f, sanitizedState.evidenceType));
    if (!hasMatch) {
      sanitizedState.evidenceType = "all";
      resetFields.push("Evidence Category");
    }
  }

  // Check Data Confidence Status filter
  if (sanitizedState.confidenceStatus && sanitizedState.confidenceStatus !== "all") {
    const hasMatch = domainFeatures.some(f => matchesConfidenceStatus(f, sanitizedState.confidenceStatus));
    if (!hasMatch) {
      sanitizedState.confidenceStatus = "all";
      resetFields.push("Data Confidence");
    }
  }

  return { sanitizedState, resetFields };
}
