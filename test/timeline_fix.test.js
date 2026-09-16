/**
 * Automated Verification Script for Historical Hazards Timeline Bug Fix
 * Simulates dataset loading, timeline period selection, filter logic, and empty state check.
 */

import assert from "node:assert";
import { readFileSync } from "node:fs";
import { filterByDomainAndType } from "../js/ui/filterPanel.js";
import { filterBySearchQuery } from "../js/ui/searchBar.js";
import { PERIOD_CONTEXT_DATA } from "../js/data/periodContextData.js";

console.log("=================================================");
console.log("Running Historical Hazards Fix Verification Test");
console.log("=================================================\n");

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`[PASS] Test ${total}: ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] Test ${total}: ${name}`);
    console.error(`       Error: ${err.message}`);
  }
}

// Load static GeoJSON datasets
const geoSites = JSON.parse(readFileSync("./data/geology/sites.demo.geojson", "utf8"));
const hazEvents = JSON.parse(readFileSync("./data/hazard/historical-events.demo.geojson", "utf8"));
const allFeatures = [...geoSites.features, ...hazEvents.features];

// Test 1: Verify total features dataset count
runTest("Dataset Total Feature Count Validation", () => {
  assert.strictEqual(allFeatures.length, 30, "Dataset must contain 30 features (19 geology + 11 hazard)");
  assert.strictEqual(hazEvents.features.length, 11, "Hazard dataset must contain 11 features");
});

// Test 2: Filter by 'Historical' period key (Timeline selection simulation)
runTest("Timeline Select 'Historical' Filter Result Validation", () => {
  const filterState = {
    domain: "all",
    featureTypes: new Set(["volcano", "paleontology_site", "site", "historical_event"]),
    process: "all",
    period: "Historical"
  };

  const filtered = filterByDomainAndType(allFeatures, filterState);
  assert.strictEqual(filtered.length, 11, "Filtering by period='Historical' MUST return 11 features");
  assert.strictEqual(filtered.every(f => f.properties.domain === "hazard"), true, "All returned features must have domain='hazard'");
  assert.strictEqual(filtered.every(f => f.properties.feature_type === "historical_event"), true, "All returned features must be historical events");
});

// Test 3: Confirm empty state is NOT triggered when period is 'Historical'
runTest("Empty State Trigger Condition Validation", () => {
  const filterState = {
    domain: "all",
    featureTypes: new Set(["volcano", "paleontology_site", "site", "historical_event"]),
    process: "all",
    period: "Historical"
  };

  let filtered = filterByDomainAndType(allFeatures, filterState);
  filtered = filterBySearchQuery(filtered, "");

  const showEmptyState = (filtered.length === 0);
  assert.strictEqual(showEmptyState, false, "Empty state overlay MUST NOT be shown for period='Historical' with empty search");
});

// Test 4: Verify PERIOD_CONTEXT_DATA entries match dataset evidence
runTest("Period Context Data Evidence ID Alignment", () => {
  const historicalContext = PERIOD_CONTEXT_DATA["Historical"];
  assert.ok(historicalContext, "PERIOD_CONTEXT_DATA['Historical'] must exist");
  assert.strictEqual(historicalContext.datasetEvidence.length, 11, "Context card must list 11 evidence entries");

  const evidenceIds = historicalContext.datasetEvidence.map(e => e.id);
  const hazIds = hazEvents.features.map(f => f.properties.id);
  assert.deepStrictEqual(evidenceIds.sort(), hazIds.sort(), "Evidence IDs in context card must exactly match GeoJSON hazard IDs");
});

// Test 5: Search combined with Historical period
runTest("Search Query + Historical Hazards Filter Test", () => {
  const filterState = {
    domain: "all",
    featureTypes: new Set(["volcano", "paleontology_site", "site", "historical_event"]),
    process: "all",
    period: "Historical"
  };

  let filtered = filterByDomainAndType(allFeatures, filterState);
  filtered = filterBySearchQuery(filtered, "krakatau");

  assert.strictEqual(filtered.length, 2, "Searching 'krakatau' within Historical period should return 2 features");
  assert.strictEqual(filtered.some(f => f.properties.id === "haz_krakatau_1883"), true);
});

// Test 6: Verify scientific distinction preserved in GeoJSON properties
runTest("Scientific Constraint Schema Integrity", () => {
  for (const f of hazEvents.features) {
    assert.strictEqual(f.properties.geological_period, "Quaternary", "geological_period in GeoJSON MUST remain Quaternary");
    assert.notStrictEqual(f.properties.geological_period, "Historical Hazards", "geological_period MUST NOT be changed to Historical Hazards");
  }
});

console.log("\n-------------------------------------------------");
console.log(`Verification Suite Finished: ${passed}/${total} Tests Passed.`);
console.log("-------------------------------------------------");

if (passed !== total) {
  process.exit(1);
}
