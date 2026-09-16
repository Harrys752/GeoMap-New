/**
 * Geological Time & Earth History Timeline Component
 * Phase 3 — Lightweight, interactive geological time bar connecting periods to dataset evidence and map locations.
 */

import { PERIOD_CONTEXT_DATA } from "../data/periodContextData.js";
import { isHistoricalHazard } from "../data/queryHelper.js";

/**
 * Initializes the Geological Timeline component.
 * @param {object[]} allFeatures - Array of validated GeoJSON features
 * @param {function} onTimelineSelectFeature - Callback when user clicks a dataset entry chip on the timeline
 * @param {function} onTimelineSelectPeriod - Callback when user filters by period via timeline
 */
export function initTimeline(allFeatures, onTimelineSelectFeature, onTimelineSelectPeriod) {
  const containerEl = document.getElementById("geological-timeline-container");
  if (!containerEl) return null;

  let activePeriodKey = null;

  // Build feature ID lookup map
  const featureMap = new Map();
  for (const f of allFeatures) {
    if (f.properties && f.properties.id) {
      featureMap.set(f.properties.id, f);
    }
  }

  // Define relative period sequence (oldest → newest + historical track)
  const periodSequence = [
    { key: "Triassic", label: "Triassic", sub: "~252 – 201 Ma", type: "geo" },
    { key: "Cretaceous", label: "Cretaceous", sub: "~145 – 66 Ma", type: "geo" },
    { key: "Neogene", label: "Neogene", sub: "~23 – 2.58 Ma", type: "geo" },
    { key: "Quaternary", label: "Quaternary", sub: "~2.58 Ma – Present", type: "geo" },
    { key: "Historical", label: "Historical Hazards", sub: "1883 – 2018 CE", type: "hazard" }
  ];

  function renderTimelineBar() {
    containerEl.innerHTML = `
      <div class="timeline-wrapper">
        <header class="timeline-header">
          <div class="timeline-title-row">
            <span class="timeline-icon">&#9201;</span>
            <h3 class="timeline-title">Geological Time & Earth History</h3>
          </div>
          <p class="timeline-disclaimer">
            Note: Timeline reflects selected educational dataset evidence in GeoMap 2.0, not the exhaustive geological history of Indonesia.
          </p>
        </header>

        <!-- Relative Time Sequence Nodes -->
        <div class="timeline-sequence-bar" role="tablist" aria-label="Geological time period sequence">
          ${periodSequence.map(p => `
            <button type="button" class="timeline-node node-${p.type}" data-period="${p.key}" role="tab" aria-selected="false">
              <span class="node-label">${escapeHtml(p.label)}</span>
              <span class="node-sub">${escapeHtml(p.sub)}</span>
            </button>
          `).join('<div class="timeline-connector"></div>')}
        </div>

        <!-- Period Educational Details Card Container -->
        <div id="timeline-period-card" class="timeline-period-card" style="display: none;"></div>
      </div>
    `;

    const nodes = containerEl.querySelectorAll(".timeline-node");
    nodes.forEach(node => {
      node.addEventListener("click", () => {
        const periodKey = node.getAttribute("data-period");
        if (activePeriodKey === periodKey) {
          // Toggle off
          deselectPeriod();
          if (typeof onTimelineSelectPeriod === "function") {
            onTimelineSelectPeriod("all");
          }
        } else {
          selectPeriod(periodKey);
          if (typeof onTimelineSelectPeriod === "function") {
            onTimelineSelectPeriod(periodKey);
          }
        }
      });
    });
  }

  function selectPeriod(periodKey) {
    activePeriodKey = periodKey;
    const cardEl = document.getElementById("timeline-period-card");
    const nodes = containerEl.querySelectorAll(".timeline-node");

    nodes.forEach(n => {
      const match = n.getAttribute("data-period") === periodKey;
      n.classList.toggle("active", match);
      n.setAttribute("aria-selected", match ? "true" : "false");
    });

    if (!cardEl || !PERIOD_CONTEXT_DATA[periodKey]) {
      if (cardEl) cardEl.style.display = "none";
      return;
    }

    const data = PERIOD_CONTEXT_DATA[periodKey];
    cardEl.style.display = "block";
    cardEl.innerHTML = `
      <div class="period-card-content">
        <div class="period-card-header">
          <div class="period-card-meta">
            <span class="period-era-tag">${escapeHtml(data.era)}</span>
            <span class="period-time-range">${escapeHtml(data.timeRange)}</span>
          </div>
          <h4 class="period-card-name">${escapeHtml(data.period)}</h4>
        </div>

        <div class="period-card-section">
          <strong>General Period Significance:</strong>
          <p>${escapeHtml(data.generalInfo)}</p>
        </div>

        <div class="period-card-section">
          <strong>Dataset Evidence (${data.datasetEvidence.length} entries):</strong>
          <div class="evidence-chip-list">
            ${data.datasetEvidence.map(item => `
              <button type="button" class="evidence-chip" data-feature-id="${item.id}" title="Click to view on map">
                <span class="chip-name">${escapeHtml(item.name)}</span>
                <span class="chip-detail">${escapeHtml(item.detail || item.age)}</span>
              </button>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    // Add click listeners to dataset evidence chips
    const chips = cardEl.querySelectorAll(".evidence-chip");
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        const featureId = chip.getAttribute("data-feature-id");
        if (featureId && typeof onTimelineSelectFeature === "function") {
          onTimelineSelectFeature(featureId);
        }
      });
    });
  }

  function deselectPeriod() {
    activePeriodKey = null;
    const cardEl = document.getElementById("timeline-period-card");
    const nodes = containerEl.querySelectorAll(".timeline-node");

    nodes.forEach(n => {
      n.classList.remove("active");
      n.setAttribute("aria-selected", "false");
    });

    if (cardEl) {
      cardEl.style.display = "none";
      cardEl.innerHTML = "";
    }
  }

  /**
   * Syncs timeline active selection when user selects a feature on the map.
   * @param {object} feature - GeoJSON feature object
   */
  function syncTimelineWithFeature(feature) {
    if (!feature || !feature.properties) return;
    const period = feature.properties.geological_period;

    let targetKey = "Quaternary";
    if (isHistoricalHazard(feature)) {
      targetKey = "Historical";
    } else if (period === "Triassic") {
      targetKey = "Triassic";
    } else if (period === "Cretaceous") {
      targetKey = "Cretaceous";
    } else if (period === "Neogene") {
      targetKey = "Neogene";
    } else if (period === "Quaternary") {
      targetKey = "Quaternary";
    }

    if (activePeriodKey !== targetKey) {
      selectPeriod(targetKey);
    }
  }

  renderTimelineBar();

  return {
    selectPeriod,
    deselectPeriod,
    syncTimelineWithFeature
  };
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
