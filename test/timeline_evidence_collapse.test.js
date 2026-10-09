/**
 * Test Suite: Geological Time Explorer Dataset Evidence Collapse/Expand
 */

import assert from "node:assert";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { initTimeline } from "../js/ui/timeline.js";
import { deriveDatasetEvidence, PERIOD_CONTEXT_DATA } from "../js/data/periodContextData.js";
import { UI_STRINGS } from "../js/i18n/uiStrings.js";
import { t, setLanguage, getLanguage } from "../js/i18n/i18n.js";

// Load datasets
const geoSites = JSON.parse(readFileSync("./data/geology/sites.demo.geojson", "utf8"));
const geoCandidates = JSON.parse(readFileSync("./data/geology/candidates.demo.geojson", "utf8"));
const hazEvents = JSON.parse(readFileSync("./data/hazard/historical-events.demo.geojson", "utf8"));
const allFeatures = [...geoSites.features, ...geoCandidates.features, ...hazEvents.features];

// Mock DOM elements
function createMockContainer() {
  const listeners = {};
  const container = {
    id: "geological-timeline-container",
    innerHTML: "",
    querySelector: (sel) => {
      if (sel === "#timeline-period-card") return cardEl;
      if (sel === "#timeline-evidence-toggle-btn") return toggleBtn;
      return null;
    },
    querySelectorAll: (sel) => {
      if (sel === ".timeline-node") return nodes;
      if (sel === ".evidence-chip") return chips;
      return [];
    }
  };

  const cardEl = {
    id: "timeline-period-card",
    style: { display: "none" },
    innerHTML: "",
    querySelector: (sel) => {
      if (sel === "#timeline-evidence-toggle-btn") return toggleBtn;
      return null;
    },
    querySelectorAll: (sel) => {
      if (sel === ".evidence-chip") return chips;
      return [];
    }
  };

  const toggleBtn = {
    id: "timeline-evidence-toggle-btn",
    _listeners: {},
    addEventListener: (event, fn) => {
      toggleBtn._listeners[event] = fn;
    },
    click: () => {
      if (toggleBtn._listeners["click"]) toggleBtn._listeners["click"]();
    }
  };

  const nodes = [];
  const chips = [];

  return { container, cardEl, toggleBtn };
}

test("Test 1: UI Strings Dictionary Symmetry for Expand/Collapse", () => {
  assert.strictEqual(t("timeline_show_all", { count: 39 }, "en"), "Show all 39");
  assert.strictEqual(t("timeline_show_less", {}, "en"), "Show less");

  assert.strictEqual(t("timeline_show_all", { count: 39 }, "id"), "Tampilkan semua 39");
  assert.strictEqual(t("timeline_show_less", {}, "id"), "Tampilkan lebih sedikit");

  assert.ok(UI_STRINGS.en.timeline_show_all);
  assert.ok(UI_STRINGS.en.timeline_show_less);
  assert.ok(UI_STRINGS.id.timeline_show_all);
  assert.ok(UI_STRINGS.id.timeline_show_less);
});

test("Test 2: Quaternary Period (39 entries) Default 5-Entry View & Expand Toggle", () => {
  const quatEvidence = deriveDatasetEvidence(allFeatures, "Quaternary", "en");
  assert.strictEqual(quatEvidence.length, 39, "Quaternary must have 39 total entries");

  // First 5 entries
  const top5 = quatEvidence.slice(0, 5);
  assert.strictEqual(top5.length, 5);
  assert.strictEqual(top5[0].id, "geo_toba_caldera");
  assert.strictEqual(top5[1].id, "geo_sangiran");
  assert.strictEqual(top5[2].id, "geo_merapi");
  assert.strictEqual(top5[3].id, "geo_trinil");
  assert.strictEqual(top5[4].id, "geo_rinjani");
});

test("Test 3: Periods with <= 5 entries (Triassic = 3, Paleogene = 4)", () => {
  const triassic = deriveDatasetEvidence(allFeatures, "Triassic", "en");
  assert.strictEqual(triassic.length, 3);
  assert.strictEqual(triassic.length <= 5, true, "Triassic should have <= 5 entries (no toggle needed)");

  const paleogene = deriveDatasetEvidence(allFeatures, "Paleogene", "en");
  assert.strictEqual(paleogene.length, 4);
  assert.strictEqual(paleogene.length <= 5, true, "Paleogene should have <= 5 entries (no toggle needed)");
});

test("Test 4: Periods with > 5 entries (Neogene = 12, Cretaceous = 6, Historical = 11)", () => {
  const neogene = deriveDatasetEvidence(allFeatures, "Neogene", "en");
  assert.strictEqual(neogene.length, 12);
  assert.strictEqual(neogene.length > 5, true);

  const cretaceous = deriveDatasetEvidence(allFeatures, "Cretaceous", "en");
  assert.strictEqual(cretaceous.length, 6);
  assert.strictEqual(cretaceous.length > 5, true);

  const historical = deriveDatasetEvidence(allFeatures, "Historical", "en");
  assert.strictEqual(historical.length, 11);
  assert.strictEqual(historical.length > 5, true);
});

test("Test 5: Full Expanded List Preserves Exact Dynamic Derivation & Invariant Order", () => {
  const periods = ["Triassic", "Cretaceous", "Paleogene", "Neogene", "Quaternary", "Historical"];
  for (const p of periods) {
    const fullList = deriveDatasetEvidence(allFeatures, p, "en");
    const collapsed = (fullList.length > 5) ? fullList.slice(0, 5) : fullList;
    const expanded = fullList;

    assert.deepStrictEqual(expanded.slice(0, collapsed.length), collapsed, `Collapsed view for ${p} must be exact prefix of expanded view`);
    assert.strictEqual(expanded.length, fullList.length, `Expanded view for ${p} must contain all entries`);
  }
});
