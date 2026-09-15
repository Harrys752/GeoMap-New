/**
 * Domain Registry Configuration Module
 * 
 * MUST remain a plain configuration object plus one getter function.
 * Do NOT convert to a class, factory, or plugin framework.
 */

export const domains = {
  geology: {
    label: "Geological Explorer",
    color: "#3b6e4c",
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
    color: "#c85a32",
    featureTypes: ["historical_event"],
    detailFields: [
      "hazard_type",
      "event_date",
      "geological_explanation"
    ]
  }
};

/**
 * Returns configuration object for a specific domain key.
 * @param {string} domainKey - "geology" or "hazard"
 * @returns {object|undefined} Domain configuration object
 */
export function getDomainConfig(domainKey) {
  return domains[domainKey];
}
