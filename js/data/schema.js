/**
 * Schema Definitions & Validation Constants
 */

export const ALLOWED_DOMAINS = ["geology", "hazard"];

export const ALLOWED_FEATURE_TYPES = [
  "site",
  "volcano",
  "paleontology_site",
  "historical_event"
];

export const ALLOWED_DATA_STATUSES = [
  "demo",
  "historical",
  "illustrative",
  "current"
];

export const ALLOWED_HAZARD_TYPES = [
  "volcanic",
  "seismic",
  "landslide",
  "tsunami"
];

export const REQUIRED_BASE_PROPERTIES = [
  "id",
  "name",
  "domain",
  "feature_type",
  "description",
  "data_status",
  "source",
  "last_updated"
];
