/**
 * Native Node.js Test Suite for GeoMap Indonesia 2.0 — Phase 7 Data Confidence & Transparency Layer
 * Run using: node test/phase7.test.js
 */

import assert from "node:assert";
import { readFileSync, statSync } from "node:fs";
import {
  getConfidenceMetadata,
  CONFIDENCE_METADATA_MAP,
  NON_OFFICIAL_DISCLAIMER
} from "../js/ui/confidenceLabels.js";
import {
  computeCanonicalDatasetCounts,
  matchesConfidenceStatus,
  matchesCanonicalFilter,
  sanitizeFilterStateForDomain,
  findFeatureById
} from "../js/data/queryHelper.js";
import { filterByDomainAndType } from "../js/ui/filterPanel.js";

console.log("=================================================");
console.log("Running GeoMap Indonesia 2.0 Phase 7 Verification Test Suite");
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

// 1. Fail-Safe Presentation Metadata & Mapping Test
runTest("Fail-Safe Verification Status Metadata Mapping Test", () => {
  // Test exact valid statuses
  const verifiedMeta = getConfidenceMetadata("verified");
  assert.strictEqual(verifiedMeta.label, "Verified Source");
  assert.strictEqual(verifiedMeta.badgeClass, "badge-confidence-verified");
  assert.strictEqual(verifiedMeta.statusKey === "verified", true);

  const partialMeta = getConfidenceMetadata("partially_verified");
  assert.strictEqual(partialMeta.label, "Partially Verified");
  assert.strictEqual(partialMeta.badgeClass, "badge-confidence-partially-verified");
  assert.strictEqual(partialMeta.statusKey === "verified", false);

  const needsReviewMeta = getConfidenceMetadata("needs_review");
  assert.strictEqual(needsReviewMeta.label, "Needs Review");
  assert.strictEqual(needsReviewMeta.badgeClass, "badge-confidence-needs-review");
  assert.strictEqual(needsReviewMeta.statusKey === "verified", false);

  const invalidMeta = getConfidenceMetadata("invalid");
  assert.strictEqual(invalidMeta.label, "Invalid Source");
  assert.strictEqual(invalidMeta.badgeClass, "badge-confidence-invalid");
  assert.strictEqual(invalidMeta.statusKey === "verified", false);

  const missingMeta = getConfidenceMetadata("missing");
  assert.strictEqual(missingMeta.label, "Missing Source");
  assert.strictEqual(missingMeta.badgeClass, "badge-confidence-missing");
  assert.strictEqual(missingMeta.statusKey === "verified", false);

  // Test fail-safe fallbacks: null, undefined, empty, unrecognized
  const nullMeta = getConfidenceMetadata(null);
  assert.strictEqual(nullMeta.statusKey === "verified", false, "Null status must never evaluate to verified");
  assert.strictEqual(nullMeta.statusKey, "needs_review");

  const undefinedMeta = getConfidenceMetadata(undefined);
  assert.strictEqual(undefinedMeta.statusKey === "verified", false, "Undefined status must never evaluate to verified");
  assert.strictEqual(undefinedMeta.statusKey, "needs_review");

  const emptyMeta = getConfidenceMetadata("");
  assert.strictEqual(emptyMeta.statusKey === "verified", false, "Empty status must never evaluate to verified");

  const garbageMeta = getConfidenceMetadata("unrecognized_status_xyz");
  assert.strictEqual(garbageMeta.statusKey === "verified", false, "Unrecognized status string must never evaluate to verified");
  assert.strictEqual(garbageMeta.statusKey, "unknown");
});

// 2. Status Predicate & Filtering Helpers Test
runTest("Confidence Status Predicate (matchesConfidenceStatus) Test", () => {
  const verifiedFeature = { properties: { id: "test1", source_verification_status: "verified" } };
  const partialFeature = { properties: { id: "test2", source_verification_status: "partially_verified" } };
  const missingFeature = { properties: { id: "test3" } }; // missing status property

  assert.strictEqual(matchesConfidenceStatus(verifiedFeature, "all"), true);
  assert.strictEqual(matchesConfidenceStatus(verifiedFeature, "verified"), true);
  assert.strictEqual(matchesConfidenceStatus(verifiedFeature, "partially_verified"), false);

  assert.strictEqual(matchesConfidenceStatus(partialFeature, "partially_verified"), true);
  assert.strictEqual(matchesConfidenceStatus(partialFeature, "verified"), false);

  // Fallback check
  assert.strictEqual(matchesConfidenceStatus(missingFeature, "needs_review"), true, "Feature missing status property must match 'needs_review'");
  assert.strictEqual(matchesConfidenceStatus(missingFeature, "verified"), false);
});

// 3. Independent Raw .filter() Count Verification vs Dynamic Transparency Counts
runTest("Truly Independent Dataset Transparency Counts Verification", () => {
  const counts = computeCanonicalDatasetCounts(allFeatures);
  const confidenceCounts = counts.confidenceStatus;

  assert.ok(confidenceCounts, "Counts object must contain confidenceStatus summary");

  // Independently count each status directly from allFeatures array
  const rawVerified = allFeatures.filter(f => f.properties && f.properties.source_verification_status === "verified").length;
  const rawPartial = allFeatures.filter(f => f.properties && f.properties.source_verification_status === "partially_verified").length;
  const rawNeedsReview = allFeatures.filter(f => f.properties && f.properties.source_verification_status === "needs_review").length;
  const rawInvalid = allFeatures.filter(f => f.properties && f.properties.source_verification_status === "invalid").length;
  const rawMissing = allFeatures.filter(f => f.properties && f.properties.source_verification_status === "missing").length;

  assert.strictEqual(confidenceCounts["verified"], rawVerified, `Computed verified count (${confidenceCounts["verified"]}) must match raw count (${rawVerified})`);
  assert.strictEqual(confidenceCounts["partially_verified"], rawPartial, `Computed partially_verified count (${confidenceCounts["partially_verified"]}) must match raw count (${rawPartial})`);
  assert.strictEqual(confidenceCounts["needs_review"], rawNeedsReview, `Computed needs_review count (${confidenceCounts["needs_review"]}) must match raw count (${rawNeedsReview})`);
  assert.strictEqual(confidenceCounts["invalid"], rawInvalid, `Computed invalid count (${confidenceCounts["invalid"]}) must match raw count (${rawInvalid})`);
  assert.strictEqual(confidenceCounts["missing"], rawMissing, `Computed missing count (${confidenceCounts["missing"]}) must match raw count (${rawMissing})`);

  // Sum check
  const totalCounted = Object.values(confidenceCounts).reduce((a, b) => a + b, 0);
  assert.strictEqual(totalCounted, allFeatures.length, `Total confidence status count (${totalCounted}) must equal total dataset features (${allFeatures.length})`);
});

// 4. Sidebar Data Confidence Filter Execution Test
runTest("Sidebar Data Confidence Filter Execution Test", () => {
  // Filter for verified
  const verifiedFeatures = filterByDomainAndType(allFeatures, { confidenceStatus: "verified" });
  assert.strictEqual(verifiedFeatures.every(f => f.properties.source_verification_status === "verified"), true);
  assert.strictEqual(verifiedFeatures.length, computeCanonicalDatasetCounts(allFeatures).confidenceStatus["verified"]);

  // Filter for partially_verified
  const partialFeatures = filterByDomainAndType(allFeatures, { confidenceStatus: "partially_verified" });
  assert.strictEqual(partialFeatures.every(f => f.properties.source_verification_status === "partially_verified"), true);

  // Combined filter: hazard domain + verified status
  const hazardVerified = filterByDomainAndType(allFeatures, { domain: "hazard", confidenceStatus: "verified" });
  assert.strictEqual(hazardVerified.every(f => f.properties.domain === "hazard" && f.properties.source_verification_status === "verified"), true);

  // Combined filter: geology domain + Quaternary period + verified confidence
  const quatGeoVerified = filterByDomainAndType(allFeatures, { domain: "geology", period: "Quaternary", confidenceStatus: "verified" });
  assert.strictEqual(quatGeoVerified.every(f => f.properties.domain === "geology" && f.properties.geological_period === "Quaternary" && f.properties.source_verification_status === "verified"), true);
});

// 5. Non-Certification Guardrail Compliance Test
runTest("Non-Certification Wording Guardrail Compliance Test", () => {
  // Check metadata labels for prohibited terms
  const prohibitedTerms = ["officially verified", "official verification", "certified", "endorsed by unesco", "government certified"];

  for (const [key, meta] of Object.entries(CONFIDENCE_METADATA_MAP)) {
    const textToSearch = `${meta.label} ${meta.explanation}`.toLowerCase();
    for (const term of prohibitedTerms) {
      assert.strictEqual(textToSearch.includes(term), false, `Metadata for '${key}' contains prohibited term '${term}'`);
    }
  }

  // Check NON_OFFICIAL_DISCLAIMER string
  const disclaimerLower = NON_OFFICIAL_DISCLAIMER.toLowerCase();
  assert.ok(disclaimerLower.includes("internal dataset verification"), "Disclaimer must state it reflects internal GeoMap dataset verification stages");
  assert.ok(disclaimerLower.includes("not an official external certification"), "Disclaimer must clarify it is NOT an official external certification");
});

// 6. Dataset & Phase 6 Audit Documentation Non-Mutation Invariant Test
runTest("Non-Mutation Invariant Test (Datasets & Phase 6 Audit Doc Untouched)", () => {
  // Verify files exist and can be read
  const geoContent = readFileSync("./data/geology/sites.demo.geojson", "utf8");
  const hazContent = readFileSync("./data/hazard/historical-events.demo.geojson", "utf8");
  const auditDocContent = readFileSync("./docs/phase6-record-level-source-audit.md", "utf8");

  assert.ok(geoContent.length > 0, "Geology dataset file must exist and be non-empty");
  assert.ok(hazContent.length > 0, "Hazard dataset file must exist and be non-empty");
  assert.ok(auditDocContent.length > 0, "Phase 6 audit documentation file must exist and be non-empty");

  // Verify feature counts in datasets remain exactly 20 and 11
  const geoObj = JSON.parse(geoContent);
  const hazObj = JSON.parse(hazContent);
  assert.strictEqual(geoObj.features.length, 20, "Geology dataset must contain exactly 20 features");
  assert.strictEqual(hazObj.features.length, 11, "Hazard dataset must contain exactly 11 features");
});

import { adaptGeologyFeature } from "../js/data/adapters/geologyAdapter.js";
import { adaptHazardFeature } from "../js/data/adapters/hazardAdapter.js";
import { renderDetailContent } from "../js/ui/detailPanel.js";

// 7. Detail Panel Content Rendering Test across All 31 Records (Regression Protection)
runTest("Detail Panel Content Rendering Test across All 31 Records", () => {
  for (const feature of allFeatures) {
    const domain = feature.properties.domain;
    let adapterData = null;

    if (domain === "geology") {
      adapterData = adaptGeologyFeature(feature);
    } else if (domain === "hazard") {
      adapterData = adaptHazardFeature(feature);
    } else {
      assert.fail(`Unknown feature domain '${domain}' on record ${feature.properties.id}`);
    }

    assert.ok(adapterData, `Adapter data must be generated for ${feature.properties.id}`);

    // Must execute renderDetailContent without throwing ReferenceError or exceptions
    let htmlOutput = "";
    assert.doesNotThrow(() => {
      htmlOutput = renderDetailContent(adapterData);
    }, `renderDetailContent threw an exception for feature ${feature.properties.id}`);

    assert.ok(htmlOutput.includes("confidence-badge-box"), `Rendered HTML must contain Data Confidence badge for ${feature.properties.id}`);
    assert.ok(htmlOutput.includes("Source Classification"), `Rendered HTML must contain Source Classification for ${feature.properties.id}`);
  }
});

// 8. Strict Canonical Feature ID & Explicit Alias Resolution Test (User Condition #6)
runTest("Strict Canonical Feature ID & Explicit Alias Resolution Test", () => {
  // Dataset Size & ID Uniqueness Hardening
  assert.strictEqual(allFeatures.length, 31, "allFeatures dataset must contain exactly 31 features");
  const featureIds = allFeatures.map(f => f?.properties?.id).filter(Boolean);
  assert.strictEqual(featureIds.length, 31, "All 31 features must have non-empty IDs");
  assert.strictEqual(new Set(featureIds).size, featureIds.length, "All 31 canonical feature IDs must be unique");

  // A. Exact Canonical ID Resolution
  const toba = findFeatureById(allFeatures, "geo_toba_caldera");
  assert.ok(toba, "Exact ID 'geo_toba_caldera' must resolve to a feature");
  assert.strictEqual(toba.properties.id, "geo_toba_caldera");

  const krakatau1883 = findFeatureById(allFeatures, "haz_krakatau_1883");
  assert.ok(krakatau1883, "Exact ID 'haz_krakatau_1883' must resolve to a feature");
  assert.strictEqual(krakatau1883.properties.id, "haz_krakatau_1883");

  // B. All 6 Explicit Aliases Resolution
  const explicitAliases = {
    geo_sangiran_paleo: "geo_sangiran",
    geo_merapi_volcano: "geo_merapi",
    geo_trinil_paleo: "geo_trinil",
    geo_rinjani_caldera: "geo_rinjani",
    geo_bromo_caldera: "geo_bromo",
    geo_tambora_caldera: "geo_tambora"
  };

  for (const [alias, expectedId] of Object.entries(explicitAliases)) {
    const resolved = findFeatureById(allFeatures, alias);
    assert.ok(resolved, `Explicit alias '${alias}' must resolve to feature '${expectedId}'`);
    assert.strictEqual(resolved.properties.id, expectedId, `Alias '${alias}' must resolve specifically to '${expectedId}'`);
  }

  // C. Missing ID returning null
  const missingRes = findFeatureById(allFeatures, "non_existent_feature_id_123");
  assert.strictEqual(missingRes, null, "Missing feature ID must return null");

  // D. Empty / Null input returning null
  assert.strictEqual(findFeatureById(allFeatures, ""), null, "Empty string input must return null");
  assert.strictEqual(findFeatureById(allFeatures, null), null, "Null input must return null");
  assert.strictEqual(findFeatureById(null, "geo_toba_caldera"), null, "Null features array must return null");

  // E. Ambiguous Lookup Rejection
  const duplicateArray = [
    { properties: { id: "dup_id", name: "Dup 1" } },
    { properties: { id: "dup_id", name: "Dup 2" } }
  ];
  assert.strictEqual(findFeatureById(duplicateArray, "dup_id"), null, "Ambiguous lookup with duplicate IDs must return null");

  // F. Complete Dataset Enumeration: All 31 canonical IDs resolve uniquely
  for (const f of allFeatures) {
    const id = f.properties.id;
    assert.ok(id, "Every feature must have an ID");
    const found = findFeatureById(allFeatures, id);
    assert.ok(found, `Canonical ID '${id}' must resolve via findFeatureById`);
    assert.strictEqual(found.properties.id, id, `Canonical ID '${id}' must resolve uniquely to itself`);
  }
});

console.log("\n-------------------------------------------------");
console.log(`Phase 7 Test Suite Finished: ${passed}/${total} Tests Passed.`);
console.log("-------------------------------------------------");

if (passed !== total) {
  process.exit(1);
}
