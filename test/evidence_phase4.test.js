/**
 * Native Node.js Test Suite for GeoMap Indonesia 2.0 — Phase 4 Geological Evidence & Credibility
 * Run using: node test/evidence_phase4.test.js
 */

import assert from "node:assert";
import { readFileSync } from "node:fs";
import { validateFeature } from "../js/utils/validate.js";
import {
  filterByDomainAndType,
  matchesEvidenceType,
  matchesHistoricalTrack,
  matchesAllFilters
} from "../js/ui/filterPanel.js";
import { filterBySearchQuery } from "../js/ui/searchBar.js";
import { EVIDENCE_EDUCATIONAL_GUIDE } from "../js/data/evidenceGuideData.js";
import { adaptGeologyFeature } from "../js/data/adapters/geologyAdapter.js";
import { adaptHazardFeature } from "../js/data/adapters/hazardAdapter.js";
import { ALLOWED_EVIDENCE_TYPES, ALLOWED_SOURCE_TYPES } from "../js/data/schema.js";

console.log("=================================================");
console.log("Running GeoMap Indonesia 2.0 Phase 4 Test Suite");
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

// 1. Dataset Integrity (30 Records)
runTest("All Dataset Features Pass Schema & Evidence Validation", () => {
  assert.strictEqual(allFeatures.length, 30, "Dataset must contain exactly 30 features (19 geology + 11 hazard)");
  const seenIds = new Set();
  for (const f of allFeatures) {
    const res = validateFeature(f, seenIds);
    assert.strictEqual(res.valid, true, `Feature '${f.properties.id}' failed validation: ${res.errors.join("; ")}`);
    seenIds.add(f.properties.id);
  }
});

// 2. Evidence Fields Presence & Enum Validation across all 18 Records
runTest("Core Evidence Fields & Enum Validity Check", () => {
  for (const f of allFeatures) {
    const p = f.properties;
    assert.ok(p.evidence_type, `Feature '${p.id}' missing evidence_type`);
    assert.ok(p.evidence_description, `Feature '${p.id}' missing evidence_description`);
    assert.ok(p.evidence_significance, `Feature '${p.id}' missing evidence_significance`);
    assert.ok(p.source_type, `Feature '${p.id}' missing source_type`);

    assert.ok(ALLOWED_EVIDENCE_TYPES.includes(p.evidence_type), `Invalid evidence_type '${p.evidence_type}' in ${p.id}`);
    assert.ok(ALLOWED_SOURCE_TYPES.includes(p.source_type), `Invalid source_type '${p.source_type}' in ${p.id}`);
  }
});

// 3. Whitespace-Only String & Incomplete Evidence Set Rejection
runTest("Validation Rejects Whitespace Strings & Incomplete Evidence Sets", () => {
  const whitespaceFeature = {
    type: "Feature",
    geometry: { type: "Point", coordinates: [100.0, 0.0] },
    properties: {
      id: "test_ws", name: "  ", domain: "geology", feature_type: "site", description: "desc",
      data_status: "demo", source: "src", last_updated: "2026-09-15"
    }
  };
  const wsRes = validateFeature(whitespaceFeature, new Set());
  assert.strictEqual(wsRes.valid, false, "Whitespace-only name must fail validation");

  const incompleteEvFeature = {
    type: "Feature",
    geometry: { type: "Point", coordinates: [100.0, 0.0] },
    properties: {
      id: "test_inc_ev", name: "Incomplete", domain: "geology", feature_type: "site", description: "desc",
      data_status: "demo", source: "src", last_updated: "2026-09-15",
      evidence_type: "Rock" // missing description & significance
    }
  };
  const incRes = validateFeature(incompleteEvFeature, new Set());
  assert.strictEqual(incRes.valid, false, "Incomplete evidence set must fail validation");
});

// 4. Scientifically Cautious Wording Heuristic & Non-Duplication
runTest("Cautious Wording Verification & Non-Duplication Check", () => {
  const forbiddenTerms = ["proves", "definitively confirms", "establishes the exact history", "certainly demonstrates", "beyond doubt"];
  
  for (const f of allFeatures) {
    const p = f.properties;
    const sigLower = p.evidence_significance.toLowerCase();
    for (const term of forbiddenTerms) {
      assert.strictEqual(sigLower.includes(term), false, `Overconfident term '${term}' found in '${p.id}' evidence_significance`);
    }
    assert.notStrictEqual(p.evidence_significance.trim(), p.evidence_description.trim(), `evidence_significance is duplicate of evidence_description in '${p.id}'`);
  }
});

// 5. Centralized Evidence Educational Guide Coverage
runTest("Centralized EVIDENCE_EDUCATIONAL_GUIDE Mapping Check", () => {
  for (const evType of ALLOWED_EVIDENCE_TYPES) {
    const guide = EVIDENCE_EDUCATIONAL_GUIDE[evType];
    assert.ok(guide, `EVIDENCE_EDUCATIONAL_GUIDE missing entry for '${evType}'`);
    assert.ok(guide.generalClaim && guide.generalClaim.length > 0, `Guide entry for '${evType}' missing generalClaim`);
  }
});

// 6. Evidence Type Filter Verification (Independent & Multi-Filter)
runTest("Evidence Type Filter & Multi-Filter Combination Checks", () => {
  const baseFilter = {
    domain: "all",
    featureTypes: new Set(["volcano", "paleontology_site", "site", "historical_event"]),
    process: "all",
    period: "all",
    evidenceType: "Rock"
  };

  const rockFeatures = filterByDomainAndType(allFeatures, baseFilter);
  assert.strictEqual(rockFeatures.length, 6, "Filtering by evidenceType='Rock' should return 6 features");
  assert.strictEqual(rockFeatures.every(f => f.properties.evidence_type === "Rock"), true);

  const landformFeatures = filterByDomainAndType(allFeatures, { ...baseFilter, evidenceType: "Landform" });
  assert.strictEqual(landformFeatures.length, 6, "Filtering by evidenceType='Landform' should return 6 features");

  // Evidence + Search ("Krakatau")
  let combo = filterByDomainAndType(allFeatures, { ...baseFilter, evidenceType: "Historical Record" });
  combo = filterBySearchQuery(combo, "krakatau");
  assert.strictEqual(combo.length, 2);
  assert.ok(combo.some(f => f.properties.id === "haz_krakatau_1883"));

  // Evidence + Historical Track ("Historical")
  const histCombo = filterByDomainAndType(allFeatures, { ...baseFilter, period: "Historical", evidenceType: "Historical Record" });
  assert.strictEqual(histCombo.length, 11, "Historical track + Historical Record evidence should return 11 features");

  // Zero-Result Combination (Rock evidence + Historical track)
  const zeroCombo = filterByDomainAndType(allFeatures, { ...baseFilter, period: "Historical", evidenceType: "Rock" });
  assert.strictEqual(zeroCombo.length, 0, "Rock evidence + Historical track should yield 0 results");
});

// 7. Adapter View Model & Illustrative / Source Claim Handling
runTest("Adapter View Model & Illustrative Badge Label Checks", () => {
  const geoFeature = allFeatures.find(f => f.properties.id === "geo_toba_caldera");
  const geoViewModel = adaptGeologyFeature(geoFeature);
  assert.strictEqual(geoViewModel.evidenceType, "Rock");
  assert.strictEqual(geoViewModel.sourceType, "peer-reviewed_publication");

  const illusFeature = allFeatures.find(f => f.properties.id === "geo_illustrative_example");
  const illusViewModel = adaptGeologyFeature(illusFeature);
  assert.strictEqual(illusViewModel.sourceType, "illustrative");
  assert.strictEqual(illusViewModel.dataStatus, "illustrative");
});

// 8. Historical Hazards Filter Helper & Period Schema Integrity
runTest("Historical Hazards Explicit Filter Matching & Schema Integrity", () => {
  for (const f of hazEvents.features) {
    assert.strictEqual(matchesHistoricalTrack(f, "Historical"), true, `Feature '${f.properties.id}' must match Historical track`);
    assert.strictEqual(f.properties.geological_period, "Quaternary", `Feature '${f.properties.id}' geological_period must remain Quaternary`);
  }
});

console.log("\n-------------------------------------------------");
console.log(`Phase 4 Test Suite Finished: ${passed}/${total} Tests Passed.`);
console.log("-------------------------------------------------");

if (passed !== total) {
  process.exit(1);
}
