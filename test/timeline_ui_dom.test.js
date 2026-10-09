import assert from "node:assert";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { deriveDatasetEvidence, PERIOD_CONTEXT_DATA } from "../js/data/periodContextData.js";
import { getLocalizedPeriodData } from "../js/i18n/i18n.js";

// Load datasets
const geoSites = JSON.parse(readFileSync("./data/geology/sites.demo.geojson", "utf8"));
const geoCandidates = JSON.parse(readFileSync("./data/geology/candidates.demo.geojson", "utf8"));
const hazEvents = JSON.parse(readFileSync("./data/hazard/historical-events.demo.geojson", "utf8"));
const allFeatures = [...geoSites.features, ...geoCandidates.features, ...hazEvents.features];

test("Timeline Interactive Model and Evidence Verification", () => {
  // 1. Triassic
  const triassic = deriveDatasetEvidence(allFeatures, "Triassic", "en");
  assert.strictEqual(triassic.length, 3);
  assert.deepStrictEqual(triassic.map(t => t.id), [
    "geo_belitung_granite",
    "geo_cand_timor_triassic_marine",
    "geo_cand_misool_triassic_marine"
  ]);
  assert.strictEqual(triassic[0].isCandidate, false);
  assert.strictEqual(triassic[1].isCandidate, true);
  assert.strictEqual(triassic[2].isCandidate, true);

  // 2. Cretaceous
  const cretaceous = deriveDatasetEvidence(allFeatures, "Cretaceous", "en");
  assert.strictEqual(cretaceous.length, 6);
  assert.ok(cretaceous.some(c => c.id === "geo_cand_pegunungan_meratus" && c.isCandidate === true));

  // 3. Paleogene
  const paleogene = deriveDatasetEvidence(allFeatures, "Paleogene", "en");
  assert.strictEqual(paleogene.length, 4);
  assert.deepStrictEqual(paleogene.map(p => p.id), [
    "geo_cand_banggai_sula_microcontinent",
    "geo_cand_cyclops_ophiolite_complex",
    "geo_cand_formasi_nanggulan",
    "geo_cand_formasi_rajamandala"
  ]);

  // 4. Neogene (3 production + 9 candidates = 12 total)
  const neogene = deriveDatasetEvidence(allFeatures, "Neogene", "en");
  assert.strictEqual(neogene.length, 12);
  const neogeneCands = neogene.filter(n => n.isCandidate);
  assert.strictEqual(neogeneCands.length, 9);
  const neogeneProd = neogene.filter(n => !n.isCandidate);
  assert.strictEqual(neogeneProd.length, 3);

  // 5. Quaternary (19 production + 20 candidates = 39 total)
  const quat = deriveDatasetEvidence(allFeatures, "Quaternary", "en");
  assert.strictEqual(quat.length, 39);

  // 6. Historical (11 production hazards = 11 total)
  const hist = deriveDatasetEvidence(allFeatures, "Historical", "en");
  assert.strictEqual(hist.length, 11);
});
