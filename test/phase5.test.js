/**
 * Native Node.js Test Suite for GeoMap Indonesia 2.0 — Phase 5 Data Verification & Source Audit
 * Run using: node test/phase5.test.js
 */

import assert from "node:assert";
import { readFileSync } from "node:fs";
import { validateFeature, isValidCalendarDate } from "../js/utils/validate.js";
import { filterByDomainAndType } from "../js/ui/filterPanel.js";
import { filterBySearchQuery } from "../js/ui/searchBar.js";
import { PERIOD_CONTEXT_DATA } from "../js/data/periodContextData.js";
import { adaptHazardFeature } from "../js/data/adapters/hazardAdapter.js";
import { adaptGeologyFeature } from "../js/data/adapters/geologyAdapter.js";
import { ALLOWED_VERIFICATION_STATUSES } from "../js/data/schema.js";

console.log("=================================================");
console.log("Running GeoMap Indonesia 2.0 Phase 5 Test Suite");
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

// Load Datasets
const geoSites = JSON.parse(readFileSync("./data/geology/sites.demo.geojson", "utf8"));
const hazEvents = JSON.parse(readFileSync("./data/hazard/historical-events.demo.geojson", "utf8"));
const allFeatures = [...geoSites.features, ...hazEvents.features];

// 1. Total Dataset Record Count
runTest("Total Dataset Record Count is 30 (19 Geology + 11 Hazard)", () => {
  assert.strictEqual(allFeatures.length, 30, "Dataset must contain exactly 30 records");
  assert.strictEqual(geoSites.features.length, 19, "Geology dataset must contain 19 records");
  assert.strictEqual(hazEvents.features.length, 11, "Hazard dataset must contain 11 records");
});

// 2. True Calendar Date Validation & Future Date Protection
runTest("True Calendar Date Validation & Future Date Restriction", () => {
  assert.strictEqual(isValidCalendarDate("2026-09-16"), true, "2026-09-16 is a valid date");
  assert.strictEqual(isValidCalendarDate("2026-02-30"), false, "2026-02-30 must be rejected");
  assert.strictEqual(isValidCalendarDate("2026-13-01"), false, "Month 13 must be rejected");

  const futureFeature = {
    type: "Feature",
    geometry: { type: "Point", coordinates: [100.0, 0.0] },
    properties: {
      id: "test_future", name: "Future Event", domain: "hazard", feature_type: "historical_event",
      description: "Future hazard", data_status: "historical", source: "USGS", last_updated: "2026-09-16",
      event_date: "2099-01-01"
    }
  };
  const futRes = validateFeature(futureFeature, new Set());
  assert.strictEqual(futRes.valid, false, "Future event date must be rejected");
  assert(futRes.errors.some(e => e.includes("cannot be in the future")), "Error must mention future event date");
});

// 3. Compilation Date Preservation & Verification Status Enums
runTest("Compilation Date Preservation & Verification Status Enums", () => {
  const seenIds = new Set();
  for (const f of allFeatures) {
    const res = validateFeature(f, seenIds);
    assert.strictEqual(res.valid, true, `Feature '${f.properties.id}' failed validation: ${res.errors.join("; ")}`);
    seenIds.add(f.properties.id);

    const p = f.properties;
    assert.ok(p.record_compilation_date || p.last_updated, `Feature '${p.id}' missing compilation date`);
    assert.ok(ALLOWED_VERIFICATION_STATUSES.includes(p.source_verification_status), `Invalid status '${p.source_verification_status}' in '${p.id}'`);
  }
});

// 4. Flores 1992 Source Fix Regression Test
runTest("Flores 1992 Source Link Regression Check (Non-Nanning URL)", () => {
  const flores = hazEvents.features.find(f => f.properties.id === "haz_flores_1992");
  assert.ok(flores, "haz_flores_1992 record must exist");
  assert.strictEqual(flores.properties.source_url, "https://earthquake.usgs.gov/earthquakes/eventpage/usp0005j81");
  assert.strictEqual(flores.properties.source_url.includes("Nanning"), false, "URL must not contain Nanning");
  assert.strictEqual(flores.properties.source_url.includes("China"), false, "URL must not contain China");
  assert.strictEqual(flores.properties.event_date, "1992-12-12");
  assert.strictEqual(flores.properties.source_verification_status, "verified");
});

// 5. UI Timeline Hazards Backing Dataset Mapping
runTest("UI Timeline Historical Evidence Backs Dataset Records", () => {
  const histTimelineEvidence = PERIOD_CONTEXT_DATA["Historical"].datasetEvidence;
  assert.strictEqual(histTimelineEvidence.length, 11, "Timeline should list all 11 historical hazards");

  for (const item of histTimelineEvidence) {
    const matchingFeature = hazEvents.features.find(f => f.properties.id === item.id);
    assert.ok(matchingFeature, `Timeline item '${item.id}' missing backing GeoJSON feature record`);
    assert.strictEqual(matchingFeature.properties.feature_type, "historical_event");
  }
});

// 6. Multi-Year Hazard Range Semantics (Sinabung 2010)
runTest("Multi-Year Hazard Range Semantics (haz_sinabung_2010)", () => {
  const sinabung = hazEvents.features.find(f => f.properties.id === "haz_sinabung_2010");
  assert.ok(sinabung, "haz_sinabung_2010 record must exist");
  assert.strictEqual(sinabung.properties.event_date, "2010-08-29");
  assert.strictEqual(sinabung.properties.event_end_date, "2021-07-28");
  assert.strictEqual(sinabung.properties.event_date_precision, "multi_year_range");
  assert.strictEqual(sinabung.properties.source_verification_status, "partially_verified");
});

// 7. Adapter Distinct Date Display & Verification Status Badges
runTest("Adapter View Model Generates Distinct Event & Compilation Dates", () => {
  const hazViewModel = adaptHazardFeature(hazEvents.features.find(f => f.properties.id === "haz_sinabung_2010"));
  assert.strictEqual(hazViewModel.eventDate, "2010-08-29");
  assert.strictEqual(hazViewModel.eventEndDate, "2021-07-28");
  assert.strictEqual(hazViewModel.eventDatePrecision, "multi_year_range");
  assert.strictEqual(hazViewModel.sourceVerificationStatus, "partially_verified");

  const geoViewModel = adaptGeologyFeature(geoSites.features.find(f => f.properties.id === "geo_kalimantan_diamond"));
  assert.strictEqual(geoViewModel.sourceVerificationStatus, "needs_review");
});

// 8. Multi-Filter & Historical Hazards Track Filter Consistency
runTest("Multi-Filter & Historical Track Consistency across 30 Records", () => {
  const allHist = filterByDomainAndType(allFeatures, {
    domain: "all",
    featureTypes: new Set(["volcano", "paleontology_site", "site", "historical_event"]),
    process: "all",
    period: "Historical",
    evidenceType: "all"
  });

  assert.strictEqual(allHist.length, 11, "Historical period filter must return 11 historical hazard records");
  assert.strictEqual(allHist.every(f => f.properties.feature_type === "historical_event"), true);

  // Search within 30 records
  const searchRes = filterBySearchQuery(allFeatures, "tambora");
  assert.strictEqual(searchRes.length, 2, "Searching 'tambora' should return 2 records (geology caldera + 1815 hazard)");
});

console.log("\n-------------------------------------------------");
console.log(`Phase 5 Test Suite Finished: ${passed}/${total} Tests Passed.`);
console.log("-------------------------------------------------");

if (passed !== total) {
  process.exit(1);
}
