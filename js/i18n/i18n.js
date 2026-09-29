/**
 * GeoMap Indonesia 2.0 — Internationalization (i18n) Core Coordinator Module
 * Provides unified translation lookups, language state management, feature localization,
 * and event dispatching for instant in-memory UI updates.
 */

import { UI_STRINGS } from "./uiStrings.js";
import { DATASET_PROSE_ID, PROCESS_CARDS_ID, PERIOD_CONTEXT_DATA_ID } from "./datasetContentId.js";

const STORAGE_KEY = "geomap_lang";
const SUPPORTED_LANGS = ["en", "id"];
const DEFAULT_LANG = "en";

let currentLang = DEFAULT_LANG;

// Initialize language from localStorage if available in browser environment
try {
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGS.includes(saved)) {
      currentLang = saved;
    }
  }
} catch (e) {
  // Ignore localStorage access errors (e.g., in strict iframe or SSR)
}

/**
 * Returns the currently active language code ("en" | "id").
 * @returns {string} Active language code
 */
export function getLanguage() {
  return currentLang;
}

/**
 * Sets the active language, persists to localStorage, and returns new language.
 * @param {string} lang - "en" | "id"
 * @returns {string} Newly set language code
 */
export function setLanguage(lang) {
  if (SUPPORTED_LANGS.includes(lang)) {
    currentLang = lang;
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, lang);
      }
    } catch (e) {
      // Ignore localStorage write error
    }
  }
  return currentLang;
}

/**
 * Looks up a translated UI string by key with optional variable interpolation.
 * Supports:
 *   t('key')
 *   t('key', { count: 5 })
 *   t('key', 'id')
 *   t('key', { count: 5 }, 'id')
 * @param {string} key - String resource identifier
 * @param {object|string} [paramsOrLang={}] - Interpolation map OR override language code
 * @param {string} [lang=currentLang] - Optional override language code
 * @returns {string} Translated string or fallback
 */
export function t(key, paramsOrLang = {}, lang = currentLang) {
  let targetLang = currentLang;
  let interpolationParams = {};

  if (typeof paramsOrLang === "string") {
    targetLang = paramsOrLang;
  } else if (typeof paramsOrLang === "object" && paramsOrLang !== null) {
    interpolationParams = paramsOrLang;
    if (lang && typeof lang === "string") {
      targetLang = lang;
    }
  } else if (lang && typeof lang === "string") {
    targetLang = lang;
  }

  const dict = UI_STRINGS[targetLang] || UI_STRINGS[DEFAULT_LANG] || {};
  let str = dict[key];

  if (str === undefined || str === null) {
    // Fallback to English dictionary
    const fallbackDict = UI_STRINGS[DEFAULT_LANG] || {};
    str = fallbackDict[key] !== undefined ? fallbackDict[key] : key;
  }

  if (typeof str !== "string") return String(str);

  // Variable interpolation: e.g. {count}, {provider}, {evidenceType}
  if (interpolationParams && typeof interpolationParams === "object") {
    for (const [k, v] of Object.entries(interpolationParams)) {
      const regex = new RegExp("\\{" + k + "\\}", "g");
      str = str.replace(regex, v !== undefined && v !== null ? String(v) : "");
    }
  }

  return str;
}

/**
 * Returns a localized copy of a GeoJSON feature record without mutating the canonical dataset.
 * @param {object} feature - Canonical GeoJSON feature object
 * @param {string} [lang=currentLang] - Target language ("en" | "id")
 * @returns {object} Localized feature object
 */
export function getLocalizedFeature(feature, lang = currentLang) {
  if (!feature || typeof feature !== "object" || !feature.properties) {
    return feature;
  }

  if (lang !== "id") {
    // English mode uses canonical properties as-is
    return feature;
  }

  const id = feature.properties.id;
  const idTranslations = DATASET_PROSE_ID[id];

  if (!idTranslations) {
    // If no translation exists for this specific ID, return feature unchanged
    return feature;
  }

  // Create a clean shallow clone of the feature with translated properties
  const localizedProps = { ...feature.properties };

  if (idTranslations.name) localizedProps.name = idTranslations.name;
  if (idTranslations.description) localizedProps.description = idTranslations.description;
  if (idTranslations.geological_process) {
    localizedProps.geological_process = idTranslations.geological_process;
    localizedProps.geological_explanation = idTranslations.geological_process;
  }
  if (idTranslations.why_it_matters) localizedProps.why_it_matters = idTranslations.why_it_matters;
  if (idTranslations.significance) localizedProps.significance = idTranslations.significance;
  if (idTranslations.evidence_description) localizedProps.evidence_description = idTranslations.evidence_description;
  if (idTranslations.evidence_significance) localizedProps.evidence_significance = idTranslations.evidence_significance;
  if (idTranslations.rock_type) localizedProps.rock_type = idTranslations.rock_type;
  if (idTranslations.paleoenvironment) localizedProps.paleoenvironment = idTranslations.paleoenvironment;
  if (idTranslations.fossil_material) localizedProps.fossil_material = idTranslations.fossil_material;
  if (idTranslations.geometry_note) localizedProps.geometry_note = idTranslations.geometry_note;

  return {
    ...feature,
    properties: localizedProps
  };
}

/**
 * Returns localized Process Card object.
 * Supports:
 *   getLocalizedProcessCard('subduction_zone', 'id')
 *   getLocalizedProcessCard('subduction_zone', baseCard, 'id')
 * @param {string} processKey - Canonical English process name key
 * @param {object|string} [baseCardOrLang] - Original English process card object OR lang
 * @param {string} [lang=currentLang] - Target language
 * @returns {object} Localized process card
 */
export function getLocalizedProcessCard(processKey, baseCardOrLang, lang = currentLang) {
  let baseCard = {};
  let targetLang = currentLang;

  if (typeof baseCardOrLang === "string") {
    targetLang = baseCardOrLang;
  } else if (typeof baseCardOrLang === "object" && baseCardOrLang !== null) {
    baseCard = baseCardOrLang;
    if (lang && typeof lang === "string") {
      targetLang = lang;
    }
  }

  if (targetLang !== "id" || !PROCESS_CARDS_ID[processKey]) {
    return baseCard && Object.keys(baseCard).length > 0 ? baseCard : (PROCESS_CARDS_ID[processKey] || baseCard);
  }

  return {
    ...baseCard,
    ...PROCESS_CARDS_ID[processKey]
  };
}

/**
 * Returns localized Period Context Data object.
 * Supports:
 *   getLocalizedPeriodData('Quaternary', 'id')
 *   getLocalizedPeriodData('Quaternary', baseData, 'id')
 * @param {string} periodKey - Canonical English period key
 * @param {object|string} [baseDataOrLang] - Original English period data object OR lang
 * @param {string} [lang=currentLang] - Target language
 * @returns {object} Localized period context data
 */
export function getLocalizedPeriodData(periodKey, baseDataOrLang, lang = currentLang) {
  let baseData = {};
  let targetLang = currentLang;

  if (typeof baseDataOrLang === "string") {
    targetLang = baseDataOrLang;
  } else if (typeof baseDataOrLang === "object" && baseDataOrLang !== null) {
    baseData = baseDataOrLang;
    if (lang && typeof lang === "string") {
      targetLang = lang;
    }
  }

  if (targetLang !== "id" || !PERIOD_CONTEXT_DATA_ID[periodKey]) {
    return baseData && Object.keys(baseData).length > 0 ? baseData : (PERIOD_CONTEXT_DATA_ID[periodKey] || baseData);
  }

  return {
    ...baseData,
    ...PERIOD_CONTEXT_DATA_ID[periodKey]
  };
}
