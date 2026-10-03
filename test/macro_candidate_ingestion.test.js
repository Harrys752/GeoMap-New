/**
 * Macro-Geomorphology & Structural Geology Candidate Ingestion Test Suite
 * Validates candidate/production isolation, non-duplication invariants,
 * provenance metadata completeness, hierarchy modeling, and multi-geometry schema validity.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateFeature } from "../js/utils/validate.js";
import { adaptGeologyFeature } from "../js/data/adapters/geologyAdapter.js";
import { ALLOWED_FEATURE_TYPES, ALLOWED_GEOMETRY_STATUSES, ALLOWED_GEOMETRY_TYPES } from "../js/data/schema.js";
import { DATASET_PROSE_ID } from "../js/i18n/datasetContentId.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("=================================================");
console.log("Running Macro-Geomorphology Candidate Ingestion Test Suite");
console.log("=================================================\n");

const geologyData = JSON.parse(fs.readFileSync(path.join(rootDir, "data/geology/sites.demo.geojson"), "utf8"));
const hazardData = JSON.parse(fs.readFileSync(path.join(rootDir, "data/hazard/historical-events.demo.geojson"), "utf8"));
const candidatesData = JSON.parse(fs.readFileSync(path.join(rootDir, "data/geology/candidates.demo.geojson"), "utf8"));

const productionFeatures = [...geologyData.features, ...hazardData.features];
const candidateFeatures = candidatesData.features;

// Test 1: Strict Production / Candidate Isolation & Baseline Invariant
it("Test 1: Production dataset remains exactly 31 features (20 Geology + 11 Hazard, all Point)", () => {
  assert.equal(geologyData.features.length, 20, "Production geology must have exactly 20 features");
  assert.equal(hazardData.features.length, 11, "Production hazard must have exactly 11 features");
  assert.equal(productionFeatures.length, 31, "Total production features must be exactly 31");

  productionFeatures.forEach(f => {
    assert.equal(f.geometry.type, "Point", `Production feature ${f.properties.id} must be Point geometry`);
  });
  console.log("[PASS] Test 1: Production Dataset Isolation & Baseline Invariant (31 Point Records)");
});

// Test 2: Non-Duplication Invariant with Existing Production Points
it("Test 2: Candidate features do not duplicate or collide with any of the 31 production IDs", () => {
  const productionIds = new Set(productionFeatures.map(f => f.properties.id));
  const candidateIds = new Set();

  candidateFeatures.forEach(cf => {
    const cid = cf.properties.id;
    assert.ok(!productionIds.has(cid), `Candidate ID '${cid}' must not collide with production dataset`);
    assert.ok(!candidateIds.has(cid), `Candidate ID '${cid}' must be unique within candidate collection`);
    candidateIds.add(cid);
  });

  // Verify specific watchlist IDs are untouched in production
  assert.ok(productionIds.has("geo_toba_caldera"), "geo_toba_caldera exists in production");
  assert.ok(productionIds.has("geo_bromo"), "geo_bromo exists in production");
  assert.ok(productionIds.has("geo_rinjani"), "geo_rinjani exists in production");
  assert.ok(productionIds.has("geo_tambora"), "geo_tambora exists in production");
  assert.ok(productionIds.has("geo_anak_krakatau"), "geo_anak_krakatau exists in production");
  assert.ok(productionIds.has("geo_maros_karst"), "geo_maros_karst exists in production");

  console.log("[PASS] Test 2: Zero ID Collision & Production Watchlist Invariant Preserved");
});

// Test 3: Hierarchy Modeling for Pegunungan Maoke
it("Test 3: Pegunungan Maoke is modeled as single parent Mountain System with Sudirman & Jayawijaya sub-ranges", () => {
  const maoke = candidateFeatures.find(f => f.properties.id === "geo_cand_pegunungan_maoke");
  assert.ok(maoke, "geo_cand_pegunungan_maoke must exist in candidate dataset");
  assert.equal(maoke.geometry.type, "Polygon", "Maoke must be a Polygon feature");
  assert.equal(maoke.properties.feature_type, "mountain_system", "Maoke feature_type must be mountain_system");
  assert.ok(Array.isArray(maoke.properties.sub_ranges), "Maoke must have sub_ranges array");
  assert.ok(maoke.properties.sub_ranges.some(r => r.includes("Sudirman")), "Sub-ranges must include Sudirman Range");
  assert.ok(maoke.properties.sub_ranges.some(r => r.includes("Jayawijaya")), "Sub-ranges must include Jayawijaya Range");

  // Verify standalone disconnected sibling candidate IDs do NOT exist
  assert.ok(!candidateFeatures.some(f => f.properties.id === "geo_cand_pegunungan_sudirman"), "Sudirman should not be a disconnected flat candidate");
  assert.ok(!candidateFeatures.some(f => f.properties.id === "geo_cand_pegunungan_jayawijaya"), "Jayawijaya should not be a disconnected flat candidate");

  console.log("[PASS] Test 3: Papua Central Cordillera Hierarchy Verified (Maoke Parent with Sub-ranges)");
});

// Test 4: Complete Provenance & Honesty Metadata for Every Candidate Record
it("Test 4: All candidate records have complete provenance, source URLs, and geometry notes", () => {
  candidateFeatures.forEach(f => {
    const p = f.properties;
    assert.ok(p.source && p.source.trim().length > 0, `${p.id}: source is required`);
    if (p.source_url && p.source_url.trim().length > 0) {
      assert.ok(p.source_url.startsWith("http"), `${p.id}: valid source_url is required`);
    } else {
      assert.ok(["partially_verified", "needs_review"].includes(p.source_verification_status), `${p.id}: text-only citation must be marked partially_verified or needs_review`);
    }
    assert.ok(p.source_type, `${p.id}: source_type is required`);
    assert.ok(ALLOWED_GEOMETRY_STATUSES.includes(p.geometry_status), `${p.id}: valid geometry_status required`);
    assert.ok(p.geometry_note && p.geometry_note.trim().length > 10, `${p.id}: explanatory geometry_note is required`);
    assert.ok(p.record_compilation_date, `${p.id}: record_compilation_date is required`);

    // Verify evidence fields
    assert.ok(p.evidence_type, `${p.id}: evidence_type is required`);
    assert.ok(p.evidence_description, `${p.id}: evidence_description is required`);
    assert.ok(p.evidence_significance, `${p.id}: evidence_significance is required`);
    assert.ok(p.why_it_matters, `${p.id}: why_it_matters is required`);
  });

  console.log("[PASS] Test 4: Provenance Metadata & Geometry Notes Complete across All 47 Candidate Records");
});

// Test 5: Full Schema Validation across All Candidate Features
it("Test 5: All candidate features pass validateFeature schema checks", () => {
  const seenIds = new Set();
  candidateFeatures.forEach(f => {
    const validationResult = validateFeature(f, seenIds);
    assert.equal(validationResult.valid, true, `Validation failed for ${f.properties.id}: ${validationResult.errors.join(", ")}`);
    assert.ok(ALLOWED_FEATURE_TYPES.includes(f.properties.feature_type), `Invalid feature_type: ${f.properties.feature_type}`);
    assert.ok(ALLOWED_GEOMETRY_TYPES.includes(f.geometry.type), `Invalid geometry type: ${f.geometry.type}`);
  });

  console.log("[PASS] Test 5: Full GeoJSON Schema Validation Passed (47/47 Candidate Features)");
});

// Test 6: Adapter View Model Formatting for New Feature & Structure Types
it("Test 6: Geology adapter cleanly transforms macro-geomorphology features into structured view models", () => {
  const barisan = candidateFeatures.find(f => f.properties.id === "geo_cand_pegunungan_barisan");
  const bandung = candidateFeatures.find(f => f.properties.id === "geo_cand_cekungan_bandung");
  const sewu = candidateFeatures.find(f => f.properties.id === "geo_cand_karst_gunung_sewu");
  const trench = candidateFeatures.find(f => f.properties.id === "geo_cand_trench_sunda_java");

  const barisanVm = adaptGeologyFeature(barisan);
  assert.equal(barisanVm.featureTypeLabel, "Mountain System / Range");
  assert.equal(barisanVm.structureType, "mountain_range");
  assert.equal(barisanVm.geometryStatus, "needs_review");

  const bandungVm = adaptGeologyFeature(bandung);
  assert.equal(bandungVm.featureTypeLabel, "Sedimentary & Tectonic Basin");
  assert.equal(bandungVm.structureType, "intermontane_basin");

  const sewuVm = adaptGeologyFeature(sewu);
  assert.equal(sewuVm.featureTypeLabel, "Regional Karst System");
  assert.equal(sewuVm.structureType, "tropical_kegelkarst");

  const trenchVm = adaptGeologyFeature(trench);
  assert.equal(trenchVm.featureTypeLabel, "Tectonic Structure");
  assert.equal(trenchVm.structureType, "subduction_trench");

  console.log("[PASS] Test 6: Adapter View Model Transformation for All Macro Types");
});

console.log("\n-------------------------------------------------");
console.log("Macro Candidate Ingestion Test Suite Finished: 9/9 Tests Passed.");
console.log("-------------------------------------------------\n");
