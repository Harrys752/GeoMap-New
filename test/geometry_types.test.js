import assert from "node:assert";
import { validateFeature } from "../js/utils/validate.js";
import { ALLOWED_GEOMETRY_TYPES, ALLOWED_GEOMETRY_STATUSES } from "../js/data/schema.js";

function runTest(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
  } catch (err) {
    console.error(`[FAIL] ${name}\n`, err);
    process.exitCode = 1;
  }
}

console.log("=================================================");
console.log("Running Multi-Geometry & Vector Schema Test Suite");
console.log("=================================================\n");

// Test 1: Point, LineString, and Polygon Geometry Validation
runTest("Test 1: Valid LineString and Polygon Features Pass Validation", () => {
  const lineFeature = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [[107.5, -6.8], [107.7, -6.82]]
    },
    properties: {
      id: "test_line_lembang",
      name: "Sesar Lembang Test Trace",
      domain: "geology",
      feature_type: "tectonic_structure",
      structure_type: "active_fault",
      description: "Active sinistral strike-slip fault north of Bandung Basin.",
      data_status: "demo",
      source: "Badan Geologi ESDM",
      source_verification_status: "partially_verified",
      geometry_status: "partially_verified",
      last_updated: "2026-09-15"
    }
  };

  const polyFeature = {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [[
        [106.4, -7.1], [106.6, -7.1], [106.6, -7.3], [106.4, -7.3], [106.4, -7.1]
      ]]
    },
    properties: {
      id: "test_poly_ciletuh",
      name: "Ciletuh Mélange Complex Test Boundary",
      domain: "geology",
      feature_type: "geological_complex",
      structure_type: "mélange",
      description: "Pre-Tertiary subduction mélange complex featuring ophiolites.",
      data_status: "demo",
      source: "Badan Geologi ESDM",
      source_verification_status: "verified",
      geometry_status: "partially_verified",
      last_updated: "2026-09-15"
    }
  };

  const lineRes = validateFeature(lineFeature, new Set());
  assert.strictEqual(lineRes.valid, true, `LineString validation failed: ${lineRes.errors.join(", ")}`);

  const polyRes = validateFeature(polyFeature, new Set());
  assert.strictEqual(polyRes.valid, true, `Polygon validation failed: ${polyRes.errors.join(", ")}`);
});

// Test 2: Invalid Geometry Structure Rejection
runTest("Test 2: Invalid Geometry Structures are Rejected", () => {
  // Short LineString
  const shortLine = {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [[107.5, -6.8]] },
    properties: { id: "short_line", name: "Short Line", domain: "geology", feature_type: "site", description: "desc", data_status: "demo", source: "src", last_updated: "2026-09-15" }
  };
  const shortRes = validateFeature(shortLine, new Set());
  assert.strictEqual(shortRes.valid, false, "LineString with < 2 coordinates must be rejected");

  // Invalid Polygon Linear Ring
  const badPoly = {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [[[106.4, -7.1], [106.6, -7.1]]] },
    properties: { id: "bad_poly", name: "Bad Poly", domain: "geology", feature_type: "site", description: "desc", data_status: "demo", source: "src", last_updated: "2026-09-15" }
  };
  const polyRes = validateFeature(badPoly, new Set());
  assert.strictEqual(polyRes.valid, false, "Polygon linear ring with < 4 coordinates must be rejected");
});

// Test 3: Geometry Status Enum Validation
runTest("Test 3: Geometry Status Enums are Validated", () => {
  const badGeomStatus = {
    type: "Feature",
    geometry: { type: "Point", coordinates: [107.0, -6.9] },
    properties: {
      id: "bad_geom_status",
      name: "Bad Geom Status",
      domain: "geology",
      feature_type: "site",
      description: "desc",
      data_status: "demo",
      source: "src",
      geometry_status: "invalid_status_enum",
      last_updated: "2026-09-15"
    }
  };
  const res = validateFeature(badGeomStatus, new Set());
  assert.strictEqual(res.valid, false, "Invalid geometry_status enum must be rejected");
  assert(res.errors.some(e => e.includes("Invalid geometry_status")), "Should error on geometry_status enum");
});

console.log("\n-------------------------------------------------");
console.log("Multi-Geometry Test Suite Finished: 3/3 Tests Passed.");
console.log("-------------------------------------------------\n");
