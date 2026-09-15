/**
 * Data Validation Utility
 * Validates GeoJSON structure and individual feature records against GeoMap 2.0 Schema rules.
 */

import {
  ALLOWED_DOMAINS,
  ALLOWED_FEATURE_TYPES,
  ALLOWED_DATA_STATUSES,
  REQUIRED_BASE_PROPERTIES
} from "../data/schema.js";

/**
 * Validates a single GeoJSON Feature record.
 * @param {object} feature - GeoJSON feature candidate
 * @param {Set<string>} seenIds - Set of previously validated feature IDs to check uniqueness
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateFeature(feature, seenIds = new Set()) {
  const errors = [];

  // 1. Basic Feature Structure Validation
  if (!feature || typeof feature !== "object" || Array.isArray(feature)) {
    return { valid: false, errors: ["Invalid feature structure: not an object"] };
  }

  if (feature.type !== "Feature") {
    errors.push(`Invalid feature type: expected 'Feature', got '${feature.type}'`);
  }

  // 2. Geometry Validation (Point geometry only in V1)
  const geom = feature.geometry;
  if (!geom || typeof geom !== "object") {
    errors.push("Missing or invalid geometry object");
  } else {
    if (geom.type !== "Point") {
      errors.push(`Unsupported geometry type '${geom.type}'. V1 only supports 'Point' geometry.`);
    }

    if (!Array.isArray(geom.coordinates) || geom.coordinates.length < 2) {
      errors.push("Invalid geometry coordinates: expected [longitude, latitude] array");
    } else {
      const [lng, lat] = geom.coordinates;
      if (typeof lng !== "number" || isNaN(lng) || lng < -180 || lng > 180) {
        errors.push(`Invalid longitude coordinate '${lng}'. Must be a number between -180 and 180.`);
      }
      if (typeof lat !== "number" || isNaN(lat) || lat < -90 || lat > 90) {
        errors.push(`Invalid latitude coordinate '${lat}'. Must be a number between -90 and 90.`);
      }
    }
  }

  // 3. Properties Object Validation
  const props = feature.properties;
  if (!props || typeof props !== "object" || Array.isArray(props)) {
    errors.push("Missing or invalid properties object");
    return { valid: false, errors };
  }

  // 4. Missing Required Properties Check
  for (const propName of REQUIRED_BASE_PROPERTIES) {
    if (props[propName] === undefined || props[propName] === null || props[propName] === "") {
      errors.push(`Missing required property '${propName}'`);
    }
  }

  // 5. Unique ID Check
  if (props.id) {
    if (typeof props.id !== "string" || props.id.trim() === "") {
      errors.push("Property 'id' must be a non-empty string");
    } else if (seenIds.has(props.id)) {
      errors.push(`Duplicate ID detected: '${props.id}' has already been registered`);
    }
  }

  // 6. Domain Value Check
  if (props.domain && !ALLOWED_DOMAINS.includes(props.domain)) {
    errors.push(`Unsupported domain '${props.domain}'. Must be one of: ${ALLOWED_DOMAINS.join(", ")}`);
  }

  // 7. Feature Type Check
  if (props.feature_type && !ALLOWED_FEATURE_TYPES.includes(props.feature_type)) {
    errors.push(`Unsupported feature_type '${props.feature_type}'. Must be one of: ${ALLOWED_FEATURE_TYPES.join(", ")}`);
  }

  // 8. Data Status Check
  if (props.data_status && !ALLOWED_DATA_STATUSES.includes(props.data_status)) {
    errors.push(`Invalid data_status '${props.data_status}'. Must be one of: ${ALLOWED_DATA_STATUSES.join(", ")}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates an entire GeoJSON FeatureCollection.
 * @param {object} geojson - Parsed GeoJSON FeatureCollection candidate
 * @param {Set<string>} seenIds - Shared ID tracking set
 * @returns {{ validFeatures: object[], rejectedFeatures: Array<{ feature: object, errors: string[] }>, isCollectionValid: boolean }}
 */
export function validateDataset(geojson, seenIds = new Set()) {
  const rejectedFeatures = [];
  const validFeatures = [];

  if (!geojson || typeof geojson !== "object" || Array.isArray(geojson)) {
    return {
      isCollectionValid: false,
      validFeatures: [],
      rejectedFeatures: [{ feature: geojson, errors: ["Dataset is not a valid GeoJSON object"] }]
    };
  }

  if (geojson.type !== "FeatureCollection") {
    return {
      isCollectionValid: false,
      validFeatures: [],
      rejectedFeatures: [{ feature: geojson, errors: [`Expected FeatureCollection, got '${geojson.type}'`] }]
    };
  }

  if (!Array.isArray(geojson.features)) {
    return {
      isCollectionValid: false,
      validFeatures: [],
      rejectedFeatures: [{ feature: geojson, errors: ["Missing or non-array 'features' property in FeatureCollection"] }]
    };
  }

  for (const feature of geojson.features) {
    const result = validateFeature(feature, seenIds);
    if (result.valid) {
      seenIds.add(feature.properties.id);
      validFeatures.push(feature);
    } else {
      rejectedFeatures.push({
        feature,
        errors: result.errors
      });
    }
  }

  return {
    isCollectionValid: true,
    validFeatures,
    rejectedFeatures
  };
}
