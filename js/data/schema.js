/**
 * Schema Definitions & Validation Constants
 */

export const ALLOWED_DOMAINS = ["geology", "hazard"];

export const ALLOWED_FEATURE_TYPES = [
  "site",
  "volcano",
  "paleontology_site",
  "historical_event",
  "tectonic_structure",
  "geological_complex",
  "volcanic_complex"
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

export const ALLOWED_EVIDENCE_TYPES = [
  "Rock",
  "Fossil",
  "Landform",
  "Geological Structure",
  "Historical Record"
];

export const ALLOWED_SOURCE_TYPES = [
  "peer-reviewed_publication",
  "government_survey",
  "institutional_record",
  "educational_interpretation",
  "illustrative"
];

export const ALLOWED_VERIFICATION_STATUSES = [
  "verified",
  "partially_verified",
  "needs_review",
  "invalid",
  "missing"
];

export const ALLOWED_DATE_PRECISION_VALUES = [
  "exact_day",
  "month_year",
  "year_only",
  "multi_year_range",
  "geological_approximate"
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

export const ALLOWED_GEOMETRY_TYPES = [
  "Point",
  "LineString",
  "Polygon"
];

export const ALLOWED_GEOMETRY_STATUSES = [
  "verified",
  "partially_verified",
  "needs_review",
  "missing"
];
