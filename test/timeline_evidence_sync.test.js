/**
 * GeoMap Indonesia 2.0 — Geological Time Explorer Dynamic Evidence Sync Test Suite
 * Validates dynamic dataset-evidence derivation, queryHelper predicate sharing, and candidate preservation.
 */

import assert from "node:assert";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { PERIOD_CONTEXT_DATA, deriveDatasetEvidence } from "../js/data/periodContextData.js";
import { isGeologicalPeriod, isHistoricalHazard, computeCanonicalDatasetCounts } from "../js/data/queryHelper.js";
import { getLocalizedPeriodData } from "../js/i18n/i18n.js";

// Load real production and candidate datasets directly
const geoSites = JSON.parse(readFileSync("./data/geology/sites.demo.geojson", "utf8"));
const geoCandidates = JSON.parse(readFileSync("./data/geology/candidates.demo.geojson", "utf8"));
const hazEvents = JSON.parse(readFileSync("./data/hazard/historical-events.demo.geojson", "utf8"));

const allFeatures = [
  ...geoSites.features,
  ...geoCandidates.features,
  ...hazEvents.features
];

test("Test 1: Dataset Total Feature Count Invariant", () => {
  assert.strictEqual(allFeatures.length, 78, "Total dataset must contain exactly 78 features");
  assert.strictEqual(geoSites.features.length, 20, "Production geology must contain 20 features");
  assert.strictEqual(geoCandidates.features.length, 47, "Candidate geology must contain 47 features");
  assert.strictEqual(hazEvents.features.length, 11, "Hazard dataset must contain 11 features");
});

test("Test 2: Dynamic Dataset Evidence Count Exactly Matches queryHelper Period Predicates", () => {
  const periods = ["Triassic", "Cretaceous", "Paleogene", "Neogene", "Quaternary", "Historical"];
  const counts = computeCanonicalDatasetCounts(allFeatures);

  for (const periodKey of periods) {
    const derivedEvidence = deriveDatasetEvidence(allFeatures, periodKey, "en");
    const canonicalMatchingFeatures = allFeatures.filter(f => isGeologicalPeriod(f, periodKey));

    assert.strictEqual(
      derivedEvidence.length,
      canonicalMatchingFeatures.length,
      `Derived evidence count for '${periodKey}' (${derivedEvidence.length}) must match queryHelper filter (${canonicalMatchingFeatures.length})`
    );

    assert.strictEqual(
      derivedEvidence.length,
      counts.period[periodKey],
      `Derived evidence count for '${periodKey}' (${derivedEvidence.length}) must match computeCanonicalDatasetCounts (${counts.period[periodKey]})`
    );
  }
});

test("Test 3: Triassic Evidence Sync & Specific Regression Assertion (Timor + Misool + Belitung)", () => {
  const triassicEvidence = deriveDatasetEvidence(allFeatures, "Triassic", "en");
  assert.strictEqual(triassicEvidence.length, 3, "Triassic period must contain exactly 3 evidence records");

  const ids = triassicEvidence.map(e => e.id);
  assert.ok(ids.includes("geo_belitung_granite"), "Triassic evidence must include production 'geo_belitung_granite'");
  assert.ok(ids.includes("geo_cand_timor_triassic_marine"), "Regression Guard: Triassic evidence MUST include 'geo_cand_timor_triassic_marine'");
  assert.ok(ids.includes("geo_cand_misool_triassic_marine"), "Regression Guard: Triassic evidence MUST include 'geo_cand_misool_triassic_marine'");

  const timor = triassicEvidence.find(e => e.id === "geo_cand_timor_triassic_marine");
  assert.strictEqual(timor.isCandidate, true, "Timor record must be flagged as candidate");
  assert.ok(timor.detail.includes("Globidens timorensis") || timor.detail.includes("Ammonites"), "Timor detail must reflect authentic feature properties");

  const misool = triassicEvidence.find(e => e.id === "geo_cand_misool_triassic_marine");
  assert.strictEqual(misool.isCandidate, true, "Misool record must be flagged as candidate");
  assert.ok(misool.detail.includes("Beyrichites") || misool.detail.includes("Ammonoid"), "Misool detail must reflect authentic feature properties");
});

test("Test 4: Paleogene Node & Evidence Completeness (4 Features)", () => {
  assert.ok(PERIOD_CONTEXT_DATA["Paleogene"], "PERIOD_CONTEXT_DATA['Paleogene'] must be defined");
  
  const paleogeneEvidence = deriveDatasetEvidence(allFeatures, "Paleogene", "en");
  assert.strictEqual(paleogeneEvidence.length, 4, "Paleogene period must contain exactly 4 evidence records");

  const ids = paleogeneEvidence.map(e => e.id);
  assert.ok(ids.includes("geo_cand_banggai_sula_microcontinent"), "Paleogene evidence must include Banggai-Sula");
  assert.ok(ids.includes("geo_cand_cyclops_ophiolite_complex"), "Paleogene evidence must include Cyclops Ophiolite");
  assert.ok(ids.includes("geo_cand_formasi_nanggulan"), "Paleogene evidence must include Formasi Nanggulan");
  assert.ok(ids.includes("geo_cand_formasi_rajamandala"), "Paleogene evidence must include Formasi Rajamandala");

  for (const item of paleogeneEvidence) {
    assert.strictEqual(item.isCandidate, true, `Paleogene candidate '${item.id}' must maintain candidate status`);
    assert.ok(item.age.length > 0, `Paleogene candidate '${item.id}' must have an age`);
    assert.ok(item.detail.length > 0, `Paleogene candidate '${item.id}' must have detail info`);
  }
});

test("Test 5: Cretaceous Dynamic Evidence List (6 Features)", () => {
  const cretaceousEvidence = deriveDatasetEvidence(allFeatures, "Cretaceous", "en");
  assert.strictEqual(cretaceousEvidence.length, 6, "Cretaceous period must contain exactly 6 evidence records");

  const ids = cretaceousEvidence.map(e => e.id);
  assert.ok(ids.includes("geo_ciletuh"), "Must include geo_ciletuh");
  assert.ok(ids.includes("geo_karangsambung"), "Must include geo_karangsambung");
  assert.ok(ids.includes("geo_kalimantan_diamond"), "Must include geo_kalimantan_diamond");
  assert.ok(ids.includes("geo_cand_pegunungan_meratus"), "Must include candidate Pegunungan Meratus");
  assert.ok(ids.includes("geo_ciletuh_melange_complex"), "Must include geo_ciletuh_melange_complex");
  assert.ok(ids.includes("geo_karangsambung_melange_complex"), "Must include geo_karangsambung_melange_complex");

  const meratus = cretaceousEvidence.find(e => e.id === "geo_cand_pegunungan_meratus");
  assert.strictEqual(meratus.isCandidate, true, "Meratus must be flagged as candidate");
});

test("Test 6: Neogene Dynamic Evidence List (12 Features)", () => {
  const neogeneEvidence = deriveDatasetEvidence(allFeatures, "Neogene", "en");
  assert.strictEqual(neogeneEvidence.length, 12, "Neogene period must contain exactly 12 evidence records");

  const ids = neogeneEvidence.map(e => e.id);
  const expectedNeogeneCandidates = [
    "geo_cand_pegunungan_selatan_jawa",
    "geo_cand_karst_gunung_sewu",
    "geo_cand_formasi_baturaja",
    "geo_cand_karangbolong_limestone",
    "geo_cand_formasi_jonggrangan",
    "geo_cand_formasi_sentolo",
    "geo_cand_formasi_cibodas",
    "geo_cand_formasi_gumai"
  ];

  for (const candId of expectedNeogeneCandidates) {
    assert.ok(ids.includes(candId), `Neogene evidence must include '${candId}'`);
    const item = neogeneEvidence.find(e => e.id === candId);
    assert.strictEqual(item.isCandidate, true, `'${candId}' must be flagged as candidate`);
  }
});

test("Test 7: Quaternary & Historical Dynamic Evidence Counts", () => {
  const quatEvidence = deriveDatasetEvidence(allFeatures, "Quaternary", "en");
  assert.strictEqual(quatEvidence.length, 39, "Quaternary period must contain exactly 39 evidence records");

  const histEvidence = deriveDatasetEvidence(allFeatures, "Historical", "en");
  assert.strictEqual(histEvidence.length, 11, "Historical period must contain exactly 11 evidence records");
});

test("Test 8: Bilingual Localization of Dynamic Evidence Entries", () => {
  const triassicEn = deriveDatasetEvidence(allFeatures, "Triassic", "en");
  const triassicId = deriveDatasetEvidence(allFeatures, "Triassic", "id");

  assert.strictEqual(triassicEn.length, triassicId.length);

  const belitungEn = triassicEn.find(e => e.id === "geo_belitung_granite");
  const belitungId = triassicId.find(e => e.id === "geo_belitung_granite");
  assert.strictEqual(belitungEn.name, "Belitung Granitic Boulders");
  assert.strictEqual(belitungId.name, "Tor Granit Belitung");

  const timorEn = triassicEn.find(e => e.id === "geo_cand_timor_triassic_marine");
  const timorId = triassicId.find(e => e.id === "geo_cand_timor_triassic_marine");
  assert.ok(timorId.name.includes("Timor") || timorId.name.includes("Trias"));

  // Check educational context localization
  const paleogeneContextEn = getLocalizedPeriodData("Paleogene", PERIOD_CONTEXT_DATA["Paleogene"], "en");
  const paleogeneContextId = getLocalizedPeriodData("Paleogene", PERIOD_CONTEXT_DATA["Paleogene"], "id");
  assert.strictEqual(paleogeneContextEn.period, "Paleogene Period");
  assert.strictEqual(paleogeneContextId.name, "Paleogen");
});
