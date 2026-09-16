/**
 * Native Node.js Test Suite for GeoMap Indonesia 2.0 — Phase 6 Data Synchronization & Verification
 * Run using: node test/phase6.test.js
 */

import assert from "node:assert";
import { readFileSync } from "node:fs";
import {
  computeCanonicalDatasetCounts,
  isHistoricalHazard,
  isGeologicalPeriod,
  matchesEvidenceCategory,
  matchesCanonicalFilter,
  sanitizeFilterStateForDomain,
  getFeatureEvidenceCategories
} from "../js/data/queryHelper.js";
import { filterByDomainAndType } from "../js/ui/filterPanel.js";
import { validateFeature } from "../js/utils/validate.js";
import { ALLOWED_EVIDENCE_TYPES } from "../js/data/schema.js";
import { detectSourceMismatchFlags, isVerificationValid } from "../js/utils/diagnostic.js";

console.log("=================================================");
console.log("Running GeoMap Indonesia 2.0 Phase 6 Verification Test Suite");
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

// 1. Total Dataset Count Verification (Prompt Requirement 1)
runTest("Total Dataset Feature Count Validation (31 records)", () => {
  assert.strictEqual(allFeatures.length, 31, "Total features must be 31 (20 geology + 11 hazard)");
  assert.strictEqual(geoSites.features.length, 20, "Geology features must be 20");
  assert.strictEqual(hazEvents.features.length, 11, "Hazard features must be 11");
});

// 2. Geohazard Domain Selection & Stale Filter Sanitization Test (Prompt Requirement 1 & 3)
runTest("Geohazard Domain Selection & Stale Filter Sanitization Test", () => {
  const staleFilter = {
    domain: "geology",
    featureTypes: new Set(["site", "volcano", "paleontology_site"]),
    process: "Volcanism",
    period: "Triassic",
    evidenceType: "Rock"
  };

  const { sanitizedState, resetFields } = sanitizeFilterStateForDomain(staleFilter, "hazard", allFeatures);

  assert.strictEqual(sanitizedState.domain, "hazard");
  assert.strictEqual(sanitizedState.process, "all", "Incompatible process filter must reset to 'all'");
  assert.strictEqual(sanitizedState.period, "all", "Incompatible period filter must reset to 'all'");
  assert.strictEqual(sanitizedState.evidenceType, "all", "Incompatible evidence filter must reset to 'all'");
  assert.ok(resetFields.includes("Process"));
  assert.ok(resetFields.includes("Period"));
  assert.ok(resetFields.includes("Evidence Category"));

  const filtered = filterByDomainAndType(allFeatures, sanitizedState);
  assert.strictEqual(filtered.length, 11, "Sanitized hazard filter must return all 11 historical hazard records");
  assert.strictEqual(filtered.every(f => f.properties && f.properties.feature_type === "historical_event"), true);
});

// 3. Strict Historical Hazard Canonical Condition Test (Section 1)
runTest("Strict Historical Hazard Canonical Condition Test (feature_type === 'historical_event')", () => {
  for (const f of hazEvents.features) {
    assert.strictEqual(isHistoricalHazard(f), true, `Feature '${f.properties.id}' must be identified as historical hazard`);
    assert.strictEqual(f.properties.feature_type, "historical_event");
  }

  for (const f of geoSites.features) {
    assert.strictEqual(isHistoricalHazard(f), false, `Geology feature '${f.properties.id}' must NOT be identified as historical hazard`);
    assert.notStrictEqual(f.properties.feature_type, "historical_event");
  }
});

// 4. Truly Independent Geological Period Count Verification Test (Section 3)
runTest("Truly Independent Geological Period Count Verification Test", () => {
  const counts = computeCanonicalDatasetCounts(allFeatures);
  const periods = ["Triassic", "Cretaceous", "Neogene", "Quaternary", "Historical"];

  for (const per of periods) {
    const helperComputedCount = counts.period[per];

    // Truly independent raw array calculation without calling queryHelper functions
    let independentRawCount = 0;
    if (per === "Historical") {
      independentRawCount = allFeatures.filter(f => f.properties && f.properties.feature_type === "historical_event").length;
    } else {
      independentRawCount = allFeatures.filter(f => f.properties && f.properties.geological_period === per && f.properties.feature_type !== "historical_event").length;
    }

    assert.strictEqual(helperComputedCount, independentRawCount, `Independent period count for '${per}' (${independentRawCount}) must match computed count (${helperComputedCount})`);
  }
});

// 5. Quaternary Geology & Historical Hazard Separation Test (Section 2 & 3)
runTest("Quaternary Geology & Historical Hazard Separation Test", () => {
  // Independent count 1: Quaternary geology
  const independentQuatCount = allFeatures.filter(f => f.properties && f.properties.geological_period === "Quaternary" && f.properties.feature_type !== "historical_event").length;
  assert.strictEqual(independentQuatCount, 13, "Quaternary geology count must independently equal 13");

  // Independent count 2: Historical hazards
  const independentHazardCount = allFeatures.filter(f => f.properties && f.properties.feature_type === "historical_event").length;
  assert.strictEqual(independentHazardCount, 11, "Historical Hazards track count must independently equal 11");
});

// 6. Truly Independent Evidence Category Count Verification Test (Section 3)
runTest("Truly Independent Evidence Category Count Verification Test", () => {
  const counts = computeCanonicalDatasetCounts(allFeatures);
  const categories = Object.keys(counts.evidenceType);

  for (const cat of categories) {
    const helperComputedCount = counts.evidenceType[cat];

    // Truly independent raw array calculation without calling queryHelper functions
    const independentRawCount = allFeatures.filter(f => {
      const raw = f.properties && f.properties.evidence_type;
      if (!raw) return cat === "Uncategorized";
      const parts = Array.isArray(raw) ? raw : String(raw).split(",").map(s => s.trim());
      const valid = parts.filter(p => ALLOWED_EVIDENCE_TYPES.includes(p));
      if (valid.length === 0) return cat === "Uncategorized";
      return valid.includes(cat);
    }).length;

    assert.strictEqual(helperComputedCount, independentRawCount, `Independent evidence count for '${cat}' (${independentRawCount}) must match computed count (${helperComputedCount})`);
  }
});

// 7. Explicit Evidence Category Edge-Case Tests (Section 4)
runTest("Explicit Evidence Category Edge-Case Tests", () => {
  // Test 1: Missing evidence_type field entirely
  assert.deepStrictEqual(getFeatureEvidenceCategories({ properties: {} }), ["Uncategorized"]);

  // Test 2: Empty string evidence_type
  assert.deepStrictEqual(getFeatureEvidenceCategories({ properties: { evidence_type: "" } }), ["Uncategorized"]);

  // Test 3: Whitespace-only string
  assert.deepStrictEqual(getFeatureEvidenceCategories({ properties: { evidence_type: "   " } }), ["Uncategorized"]);

  // Test 4: Unknown/unrecognized category value
  assert.deepStrictEqual(getFeatureEvidenceCategories({ properties: { evidence_type: "UnknownCategory" } }), ["Uncategorized"]);

  // Test 5: Valid single category
  assert.deepStrictEqual(getFeatureEvidenceCategories({ properties: { evidence_type: "Rock" } }), ["Rock"]);
  assert.deepStrictEqual(getFeatureEvidenceCategories({ properties: { evidence_type: ["Landform"] } }), ["Landform"]);

  // Test 6: Valid multi-category record
  assert.deepStrictEqual(getFeatureEvidenceCategories({ properties: { evidence_type: ["Rock", "Landform"] } }), ["Rock", "Landform"]);
  assert.deepStrictEqual(getFeatureEvidenceCategories({ properties: { evidence_type: "Rock, Landform" } }), ["Rock", "Landform"]);

  // Test 7: Mixed record containing valid category AND invalid category
  const mixedResult = getFeatureEvidenceCategories({ properties: { evidence_type: ["Rock", "InvalidCategory"] } });
  assert.deepStrictEqual(mixedResult, ["Rock"], "Mixed category must extract valid 'Rock' category and drop invalid category from valid list");
});

// 8. Multi-Filter Combination Tests
runTest("Multi-Filter Combination Tests", () => {
  const combo1 = filterByDomainAndType(allFeatures, { domain: "geology", period: "Quaternary", evidenceType: "Rock" });
  assert.ok(combo1.length > 0);
  assert.strictEqual(combo1.every(f => f.properties.domain === "geology" && f.properties.geological_period === "Quaternary" && matchesEvidenceCategory(f, "Rock")), true);

  const combo2 = filterByDomainAndType(allFeatures, { domain: "hazard", period: "Historical", evidenceType: "Historical Record" });
  assert.strictEqual(combo2.length, 11);

  const zeroCombo = filterByDomainAndType(allFeatures, { domain: "geology", period: "Triassic", evidenceType: "Historical Record" });
  assert.strictEqual(zeroCombo.length, 0);
});

// 9. Four-Tier Reachability Framework Test across 31 Records
runTest("Four-Tier Reachability Framework Test across 31 Records", () => {
  const seenIds = new Set();

  for (const f of allFeatures) {
    const props = f.properties;
    const geom = f.geometry;

    // 1. Dataset reachability
    assert.ok(props.id, "Feature must have ID");
    assert.strictEqual(seenIds.has(props.id), false, `Duplicate ID found: ${props.id}`);
    seenIds.add(props.id);

    // 2. Map reachability (coordinates check)
    assert.ok(geom && geom.type === "Point" && Array.isArray(geom.coordinates) && geom.coordinates.length === 2);
    const [lng, lat] = geom.coordinates;
    assert.ok(lng >= 90 && lng <= 142 && lat >= -11 && lat <= 6, `Coordinates [${lng}, ${lat}] out of Indonesia bounds for ${props.id}`);

    // 3. Filter reachability
    assert.ok(props.domain && props.feature_type, `Feature ${props.id} missing domain or feature_type`);

    // 4. Audit reachability
    assert.ok(props.source_verification_status, `Feature ${props.id} missing source_verification_status`);
  }
});

// 10. Gunung Ciremai Field-by-Field Audit Test (Section 8)
runTest("Gunung Ciremai Field-by-Field Audit Test", () => {
  const ciremai = allFeatures.find(f => f.properties.id === "geo_mount_ciremai");
  assert.ok(ciremai, "Gunung Ciremai feature 'geo_mount_ciremai' must exist in dataset");

  const p = ciremai.properties;
  assert.strictEqual(p.name, "Gunung Ciremai Volcanic Complex");
  assert.strictEqual(p.domain, "geology");
  assert.strictEqual(p.feature_type, "volcano");
  assert.strictEqual(p.geological_period, "Quaternary");
  assert.strictEqual(p.geological_process, "Volcanism");
  assert.strictEqual(p.evidence_type, "Landform");
  assert.strictEqual(p.source_verification_status, "needs_review");
  assert.strictEqual(p.source_url, "https://vsi.esdm.go.id");

  // Coordinate check: [108.406, -6.892] is [longitude, latitude]
  const [lng, lat] = ciremai.geometry.coordinates;
  assert.strictEqual(lng, 108.406, "Longitude must be 108.406");
  assert.strictEqual(lat, -6.892, "Latitude must be -6.892");

  const valRes = validateFeature(ciremai, new Set());
  assert.strictEqual(valRes.valid, true, `Gunung Ciremai failed validation: ${valRes.errors.join("; ")}`);
});

// 11. Komodo Source Fixture & Borobudur Mismatch Rejection Test (Prompt Section 8)
runTest("Komodo Source Fixture & Borobudur Mismatch Rejection Test", () => {
  const komodoFixture = JSON.parse(readFileSync("./test/fixtures/komodo_source_fixture.json", "utf8"));
  const borobudurFixture = JSON.parse(readFileSync("./test/fixtures/borobudur_source_fixture.json", "utf8"));
  const komodoFeature = allFeatures.find(f => f.properties.id === "geo_komodo_volcanic");

  assert.ok(komodoFeature, "Komodo feature must exist");
  assert.strictEqual(komodoFeature.properties.source_url, "https://whc.unesco.org/en/list/609");
  assert.strictEqual(komodoFeature.properties.source_verification_status, "verified");

  // 1. Verify correct Komodo fixture (#609) passes identity check
  assert.strictEqual(komodoFixture.page_title.includes("Komodo National Park"), true);
  assert.strictEqual(komodoFixture.excerpt.includes("Komodo dragons"), true);
  const komodoFlags = detectSourceMismatchFlags(komodoFeature, komodoFixture);
  assert.strictEqual(komodoFlags.length, 0, "Correct Komodo fixture must yield zero mismatch flags");
  assert.strictEqual(isVerificationValid(komodoFeature, komodoFixture), true);

  // 2. Verify wrong Borobudur fixture (#592) FAILS loudly when checked against Komodo
  assert.strictEqual(borobudurFixture.page_title.includes("Borobudur"), true);
  const borobudurFlags = detectSourceMismatchFlags(komodoFeature, borobudurFixture);
  assert.ok(borobudurFlags.includes("wrong_site_borobudur"), "Borobudur response must trigger wrong_site_borobudur flag");
  assert.strictEqual(isVerificationValid(komodoFeature, borobudurFixture), false, "Borobudur fixture must fail verification for Komodo");
});

// 12. Wrong-Location Historical Mismatch Regression Suite
runTest("Wrong-Location Historical Mismatch Regression Suite", () => {
  // Flores 1992 (Must be Maumere, NOT Nanning China usp0005j81)
  const flores = allFeatures.find(f => f.properties.id === "haz_flores_1992");
  assert.strictEqual(flores.properties.source_url.includes("usp0005j81"), false, "Flores 1992 must NOT contain China event ID usp0005j81");
  assert.strictEqual(flores.properties.source_url.includes("usp0005j5a"), true, "Flores 1992 must contain Maumere event ID usp0005j5a");

  // Yogyakarta 2006 (Must be Bantul, NOT Baculin Philippines usp000ekfv)
  const jogja = allFeatures.find(f => f.properties.id === "haz_jogja_2006");
  assert.strictEqual(jogja.properties.source_url.includes("usp000ekfv"), false, "Jogja 2006 must NOT contain Philippines event ID usp000ekfv");
  assert.strictEqual(jogja.properties.source_url.includes("usp000ej1c"), true, "Jogja 2006 must contain Bantul event ID usp000ej1c");

  // Bromo (Must be Tengger Caldera VN 263270, NOT Kelud VN 263280)
  const bromo = allFeatures.find(f => f.properties.id === "geo_bromo");
  assert.strictEqual(bromo.properties.source_url.includes("263280"), false, "Bromo must NOT point to Kelud VN 263280");
  assert.strictEqual(bromo.properties.source_url.includes("263270"), true, "Bromo must point to Tengger Caldera VN 263270");

  // Rinjani (Must be Rinjani VN 264030, NOT Tambora VN 264040)
  const rinjani = allFeatures.find(f => f.properties.id === "geo_rinjani");
  assert.strictEqual(rinjani.properties.source_url.includes("264040"), false, "Rinjani must NOT point to Tambora VN 264040");
  assert.strictEqual(rinjani.properties.source_url.includes("264030"), true, "Rinjani must point to Rinjani VN 264030");

  // Komodo (Must be Komodo National Park #609, NOT Kaziranga #337 or Borobudur #592)
  const komodo = allFeatures.find(f => f.properties.id === "geo_komodo_volcanic");
  assert.strictEqual(komodo.properties.source_url.includes("/list/337"), false, "Komodo must NOT point to Kaziranga India #337");
  assert.strictEqual(komodo.properties.source_url.includes("/list/592"), false, "Komodo must NOT point to Borobudur #592");
  assert.strictEqual(komodo.properties.source_url.includes("/list/609"), true, "Komodo must point to Komodo National Park #609");
});

console.log("\n-------------------------------------------------");
console.log(`Phase 6 Test Suite Finished: ${passed}/${total} Tests Passed.`);
console.log("-------------------------------------------------");

if (passed !== total) {
  process.exit(1);
}
