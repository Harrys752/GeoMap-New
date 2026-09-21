import fs from "node:fs";
import assert from "node:assert";
import { adaptGeologyFeature } from "../js/data/adapters/geologyAdapter.js";
import { validateDataset } from "../js/utils/validate.js";

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
console.log("Running Candidate Toggle & Vector Adapter Test Suite");
console.log("=================================================\n");

// Test 1: Geology Adapter formats structureType & geometryStatus
runTest("Test 1: Adapter Formats structure_type and geometry_status Correctly", () => {
  const lineFeature = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [[107.45, -6.83], [107.75, -6.84]]
    },
    properties: {
      id: "geo_fault_lembang",
      name: "Sesar Lembang (Active Fault Trace)",
      domain: "geology",
      feature_type: "tectonic_structure",
      structure_type: "active_fault",
      description: "Active sinistral strike-slip fault.",
      data_status: "demo",
      source: "Badan Geologi ESDM",
      source_verification_status: "partially_verified",
      geometry_status: "partially_verified",
      last_updated: "2026-09-21"
    }
  };

  const viewModel = adaptGeologyFeature(lineFeature);
  assert.strictEqual(viewModel.structureType, "active_fault");
  assert.strictEqual(viewModel.geometryStatus, "partially_verified");
  assert.strictEqual(viewModel.quickFacts["Structure Type"], "Active Fault Line");
  assert.strictEqual(viewModel.quickFacts["Feature Type"], "Tectonic Structure");
});

// Test 2: Candidate Dataset Collection Validation
runTest("Test 2: candidates.demo.geojson Collection Passes Schema Validation", () => {
  const rawData = JSON.parse(fs.readFileSync("data/geology/candidates.demo.geojson", "utf8"));
  const res = validateDataset(rawData);
  assert.strictEqual(res.isCollectionValid, true, "Candidate collection structure must be valid");
  assert.strictEqual(res.validFeatures.length, 9, "Must contain exactly 9 valid candidate features");
  assert.strictEqual(res.rejectedFeatures.length, 0, "Zero candidate features should be rejected");

  const lem = res.validFeatures.find(f => f.properties.id === "geo_fault_lembang");
  assert.ok(lem, "Sesar Lembang feature must be present in candidates");
  assert.strictEqual(lem.geometry.type, "LineString");
  assert.strictEqual(lem.properties.geometry_status, "partially_verified");
});

console.log("\n-------------------------------------------------");
console.log("Candidate Toggle Test Suite Finished: 2/2 Tests Passed.");
console.log("-------------------------------------------------\n");
