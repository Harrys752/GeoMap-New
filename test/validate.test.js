import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Native Node.js Test Suite for GeoMap Indonesia 2.0 Validation Logic
 * Run using: node test/validate.test.js
 */

import assert from "node:assert";
import { validateFeature, validateDataset } from "../js/utils/validate.js";
import { filterByDomainAndType } from "../js/ui/filterPanel.js";

console.log("=================================================");
console.log("Running GeoMap Indonesia 2.0 Validation Test Suite");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

function runTest(testName, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`[PASS] Test ${totalTests}: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] Test ${totalTests}: ${testName}`);
    console.error(`       Error: ${err.message}`);
  }
}

// 1. Valid Feature Validation
runTest("Valid Geology Record Validation", () => {
  const validFeature = {
    type: "Feature",
    geometry: { type: "Point", coordinates: [106.45, -7.18] },
    properties: {
      id: "test_valid_01",
      name: "Test Site",
      domain: "geology",
      feature_type: "site",
      description: "A valid geological test site",
      data_status: "historical",
      source: "Test Source",
      last_updated: "2026-09-15"
    }
  };
  const seenIds = new Set();
  const res = validateFeature(validFeature, seenIds);
  assert.strictEqual(res.valid, true, "Valid feature should pass validation");
  assert.strictEqual(res.errors.length, 0, "Errors array should be empty");
});

// 2. FeatureCollection Structure Validation
runTest("GeoJSON FeatureCollection Structure Validation", () => {
  const invalidCollection = { type: "NotACollection", features: [] };
  const res = validateDataset(invalidCollection);
  assert.strictEqual(res.isCollectionValid, false, "Invalid collection type should be rejected");
  assert.strictEqual(res.rejectedFeatures.length, 1, "Should have 1 rejected feature item");
});

// 3. Missing Required Property Rejection
runTest("Missing Required Property Rejection", () => {
  const missingPropFeature = {
    type: "Feature",
    geometry: { type: "Point", coordinates: [100.0, 0.0] },
    properties: {
      id: "test_missing_01",
      name: "Incomplete Site",
      domain: "geology",
      // missing feature_type, description, data_status, source, last_updated
    }
  };
  const res = validateFeature(missingPropFeature, new Set());
  assert.strictEqual(res.valid, false, "Feature with missing properties must be invalid");
  assert(res.errors.some(e => e.includes("Missing required property")), "Should list missing required property errors");
});

// 4. Coordinate Range & Point Geometry Validation
runTest("Coordinate Range & Point Geometry Validation", () => {
  // Bad geometry type
  const lineFeature = {
    type: "Feature",
    geometry: { type: "MultiPoint", coordinates: [[0, 0], [1, 1]] },
    properties: { id: "test_line", name: "Line", domain: "geology", feature_type: "site", description: "desc", data_status: "demo", source: "src", last_updated: "2026-09-15" }
  };
  const lineRes = validateFeature(lineFeature, new Set());
  assert.strictEqual(lineRes.valid, false, "Unsupported geometry type should be rejected");

  // Out of range coordinates
  const badCoordsFeature = {
    type: "Feature",
    geometry: { type: "Point", coordinates: [200.0, -100.0] },
    properties: { id: "test_coords", name: "Bad Coords", domain: "geology", feature_type: "site", description: "desc", data_status: "demo", source: "src", last_updated: "2026-09-15" }
  };
  const coordsRes = validateFeature(badCoordsFeature, new Set());
  assert.strictEqual(coordsRes.valid, false, "Out of bound coordinates should be rejected");
});

// 5. Duplicate ID Detection & Rejection
runTest("Duplicate ID Detection & Rejection", () => {
  const seenIds = new Set(["dup_01"]);
  const dupFeature = {
    type: "Feature",
    geometry: { type: "Point", coordinates: [110.0, -7.0] },
    properties: {
      id: "dup_01",
      name: "Duplicate Site",
      domain: "geology",
      feature_type: "site",
      description: "Duplicate ID test",
      data_status: "demo",
      source: "Test",
      last_updated: "2026-09-15"
    }
  };
  const res = validateFeature(dupFeature, seenIds);
  assert.strictEqual(res.valid, false, "Duplicate ID must be rejected");
  assert(res.errors.some(e => e.includes("Duplicate ID detected")), "Error must mention duplicate ID");
});

// 6. Invalid Domain / Feature Type / Data Status Rejection
runTest("Invalid Domain / Feature Type / Data Status Rejection", () => {
  const invalidEnumsFeature = {
    type: "Feature",
    geometry: { type: "Point", coordinates: [110.0, -7.0] },
    properties: {
      id: "invalid_enums",
      name: "Invalid Enums",
      domain: "astronomy", // invalid
      feature_type: "meteorite", // invalid
      description: "Invalid enums test",
      data_status: "active_live_alert", // invalid
      source: "Test",
      last_updated: "2026-09-15"
    }
  };
  const res = validateFeature(invalidEnumsFeature, new Set());
  assert.strictEqual(res.valid, false, "Invalid enum values must be rejected");
  assert.strictEqual(res.errors.length, 3, "Should report 3 separate enum errors");
});

// 7. Historical Hazards Timeline Selection Filter Test
runTest("Historical Hazards Timeline Selection Filter Test", () => {
  const sampleFeatures = [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [105.42, -6.1] },
      properties: { id: "haz_1883", domain: "hazard", feature_type: "historical_event", geological_period: "Quaternary" }
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [95.98, 3.3] },
      properties: { id: "haz_2004", domain: "hazard", feature_type: "historical_event", geological_period: "Quaternary" }
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [106.45, -7.18] },
      properties: { id: "geo_ciletuh", domain: "geology", feature_type: "site", geological_period: "Cretaceous" }
    }
  ];

  const filterState = {
    domain: "all",
    featureTypes: new Set(["volcano", "paleontology_site", "site", "historical_event"]),
    process: "all",
    period: "Historical"
  };

  const filtered = filterByDomainAndType(sampleFeatures, filterState);
  assert.strictEqual(filtered.length, 2, "Should return the 2 historical hazard features");
  assert.strictEqual(filtered.every(f => f.properties.domain === "hazard"), true, "All filtered features must be hazard domain");
  assert.strictEqual(sampleFeatures[0].properties.geological_period, "Quaternary", "geological_period schema must remain Quaternary");
});

// 8. Candidate Dataset Source URL Quality & Anti-Bare-Homepage Check
runTest("Candidate Dataset Source URL Quality & Anti-Bare-Homepage Validation", () => {
  const root = path.resolve(__dirname, "..");
  const candFile = path.join(root, "data/geology/candidates.demo.geojson");

  const BARE_HOMEPAGES = [
    "https://esdm.go.id",
    "https://geologi.esdm.go.id",
    "https://badangeologi.esdm.go.id",
    "https://jgsm.geologi.esdm.go.id",
    "https://ijog.geologi.esdm.go.id",
    "https://vsi.esdm.go.id",
    "https://www.geolsoc.org.uk",
    "https://www.ipa.or.id",
    "https://walennae.kemdikbud.go.id",
    "https://berkalaarkeologi.kemdikbud.go.id",
    "https://journal.itb.ac.id/index.php/jts",
    "https://jrisetgeotam.brin.go.id"
  ];

  const candData = JSON.parse(fs.readFileSync(candFile, "utf8"));
  candData.features.forEach(feat => {
    const p = feat.properties;
    const url = p.source_url || (p.source && p.source.url) || p.primary_source_url || "";
    if (url) {
      const trimmed = url.replace(/\/$/, "");
      assert.strictEqual(
        BARE_HOMEPAGES.includes(trimmed),
        false,
        `Candidate ${p.id} has forbidden bare homepage source_url: ${url}`
      );
      if (url.startsWith("http://") || url.startsWith("https://")) {
        const parsed = new URL(url);
        assert.ok(
          parsed.pathname.length > 1 || parsed.search.length > 0 || parsed.hash.length > 0,
          `Candidate ${p.id} must have a specific document path/DOI, not bare origin: ${url}`
        );
      }
    }
  });
});

console.log("\n-------------------------------------------------");
console.log(`Test Suite Finished: ${passedTests}/${totalTests} Tests Passed.`);
console.log("-------------------------------------------------");

if (passedTests !== totalTests) {
  process.exit(1);
}

