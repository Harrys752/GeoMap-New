/**
 * Educational Geological Period Context Repository
 * General period educational information separated from location-specific dataset evidence.
 * Dataset evidence is derived dynamically at runtime from the loaded dataset.
 */

import { isGeologicalPeriod } from "./queryHelper.js";
import { getLocalizedFeature } from "../i18n/i18n.js";

export const PERIOD_CONTEXT_DATA = {
  "Triassic": {
    period: "Triassic Period",
    era: "Mesozoic Era",
    timeRange: "~252 – 201 Million Years Ago",
    generalInfo: "The Triassic Period marked the recovery of life after the End-Permian mass extinction and the assembly of the Pangaea supercontinent. In Southeast Asia, plutonic magma intrusions cooled deep beneath the crust of the ancient Sundaland continent, alongside pelagic marine sedimentation in eastern peri-Gondwanan terranes."
  },
  "Cretaceous": {
    period: "Cretaceous Period",
    era: "Mesozoic Era",
    timeRange: "~145 – 66 Million Years Ago",
    generalInfo: "The Cretaceous Period was characterized by high sea levels, warm global climates, and major plate tectonic reorganization. In West Java, Central Java, and Southeast Kalimantan, subduction accretion squeezed seafloor sediments, ophiolites, and oceanic crust against the Sundaland margin."
  },
  "Paleogene": {
    period: "Paleogene Period",
    era: "Cenozoic Era",
    timeRange: "~66 – 23 Million Years Ago",
    generalInfo: "The Paleogene Period marked the dawn of the Cenozoic Era following the Cretaceous-Paleogene extinction event. In the Indonesian archipelago, Paleogene rifting formed major hydrocarbon basins, while early volcanic arcs, obducted ophiolites, and carbonate platforms developed across the Sundaland margin and proto-Sulawesi."
  },
  "Neogene": {
    period: "Neogene Period",
    era: "Cenozoic Era",
    timeRange: "~23 – 2.58 Million Years Ago",
    generalInfo: "The Neogene Period featured major tectonic collision between the Indo-Australian, Eurasian, and Pacific plates, uplifting extensive coral reefs in Sulawesi and Java, and forming deep sea basins in the Banda Arc."
  },
  "Quaternary": {
    period: "Quaternary Period",
    era: "Cenozoic Era",
    timeRange: "~2.58 Million Years Ago – Present",
    generalInfo: "The Quaternary Period encompasses glacial-interglacial climate cycles, major Sunda Arc super-eruptions, river terrace sedimentation, and the evolution and island dispersal of hominins across Indonesia."
  },
  "Historical": {
    period: "Modern Historical Geohazard Record",
    era: "Human History",
    timeRange: "1815 – 2021 CE (Modern Instrument & Historical Record)",
    generalInfo: "Historical geohazard events represent documented natural disasters occurring within modern human memory. Unlike deep geological periods spanning millions of years, these events record specific subduction ruptures, volcanic caldera collapses, and fault slips."
  }
};

/**
 * Dynamically derives the dataset evidence list for a given period key from loaded features.
 * Matches exact canonical predicate logic from queryHelper.js.
 * 
 * @param {object[]} allFeatures - Complete list of loaded features
 * @param {string} periodKey - "Triassic" | "Cretaceous" | "Paleogene" | "Neogene" | "Quaternary" | "Historical"
 * @param {string} [currentLang="en"] - Language code ("en" | "id")
 * @returns {Array<{ id: string, name: string, age: string, detail: string, isCandidate: boolean, dataStatus: string }>}
 */
export function deriveDatasetEvidence(allFeatures = [], periodKey, currentLang = "en") {
  if (!Array.isArray(allFeatures) || !periodKey) return [];

  const matchingFeatures = allFeatures.filter(f => isGeologicalPeriod(f, periodKey));

  return matchingFeatures.map(f => {
    const props = f?.properties || {};
    const locFeat = (typeof getLocalizedFeature === "function") ? getLocalizedFeature(f, currentLang) : null;
    const locProps = locFeat?.properties || props;

    const id = props.id || "";
    const name = locProps.name || props.name || id;
    const age = props.geological_age || props.event_date || "";
    const detail = props.rock_type || props.formation || props.fossil_material || props.geological_process || props.hazard_type || "";
    const isCandidate = id.startsWith("geo_cand_") || props.data_status === "demo" || props.data_status === "candidate" || props.source_type === "illustrative";
    const dataStatus = props.data_status || (id.startsWith("geo_cand_") ? "candidate" : "verified");

    return {
      id,
      name,
      age,
      detail,
      isCandidate,
      dataStatus
    };
  });
}
