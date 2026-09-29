/**
 * Geological Time & Earth History Timeline Component
 * Phase 3 — Lightweight, interactive geological time bar connecting periods to dataset evidence and map locations.
 * Supports full bilingual display (English & Bahasa Indonesia).
 */

import { PERIOD_CONTEXT_DATA } from "../data/periodContextData.js";
import { isHistoricalHazard } from "../data/queryHelper.js";
import { getLanguage, t, getLocalizedPeriodData, getLocalizedFeature } from "../i18n/i18n.js";

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
  let currentLang = getLanguage();

  // Build feature ID lookup map
  const featureMap = new Map();
  for (const f of allFeatures) {
    if (f.properties && f.properties.id) {
      featureMap.set(f.properties.id, f);
    }
  }

  function getPeriodSequence() {
    return [
      { key: "Triassic", label: t("period_Triassic", {}, currentLang), sub: "~252 – 201 Ma", type: "geo" },
      { key: "Cretaceous", label: t("period_Cretaceous", {}, currentLang), sub: "~145 – 66 Ma", type: "geo" },
      { key: "Neogene", label: t("period_Neogene", {}, currentLang), sub: "~23 – 2.58 Ma", type: "geo" },
      { key: "Quaternary", label: t("period_Quaternary", {}, currentLang), sub: "~2.58 Ma – Present", type: "geo" },
      { key: "Historical", label: t("period_Historical", {}, currentLang), sub: "1883 – 2021 CE", type: "hazard" }
    ];
  }

  function renderTimelineBar() {
    const periodSequence = getPeriodSequence();
    containerEl.innerHTML = `
      <div class="timeline-wrapper">
        <header class="timeline-header">
          <div class="timeline-title-row">
            <span class="timeline-icon">&#9201;</span>
            <h3 class="timeline-title">${escapeHtml(t("timeline_title", {}, currentLang))}</h3>
          </div>
          <p class="timeline-disclaimer">
            ${escapeHtml(t("timeline_disclaimer", {}, currentLang))}
          </p>
        </header>

        <!-- Relative Time Sequence Nodes -->
        <div class="timeline-sequence-bar" role="tablist" aria-label="Geological time period sequence">
          ${periodSequence.map(p => `
            <button type="button" class="timeline-node node-${p.type}${activePeriodKey === p.key ? " active" : ""}" data-period="${p.key}" role="tab" aria-selected="${activePeriodKey === p.key ? "true" : "false"}">
              <span class="node-label">${escapeHtml(p.label)}</span>
              <span class="node-sub">${escapeHtml(p.sub)}</span>
            </button>
          `).join('<div class="timeline-connector"></div>')}
        </div>

        <!-- Period Educational Details Card Container -->
        <div id="timeline-period-card" class="timeline-period-card" style="${activePeriodKey ? "display: block;" : "display: none;"}"></div>
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

    if (activePeriodKey) {
      renderPeriodCard(activePeriodKey);
    }
  }

  function renderPeriodCard(periodKey) {
    const cardEl = document.getElementById("timeline-period-card");
    if (!cardEl || !PERIOD_CONTEXT_DATA[periodKey]) {
      if (cardEl) cardEl.style.display = "none";
      return;
    }

    const baseData = PERIOD_CONTEXT_DATA[periodKey];
    const data = getLocalizedPeriodData(periodKey, baseData, currentLang);

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
          <strong>${escapeHtml(t("timeline_period_significance", {}, currentLang))}</strong>
          <p>${escapeHtml(data.generalInfo)}</p>
        </div>

        <div class="period-card-section">
          <strong>${escapeHtml(t("timeline_dataset_evidence", { count: data.datasetEvidence.length }, currentLang))}</strong>
          <div class="evidence-chip-list">
            ${data.datasetEvidence.map(item => {
              const rawFeat = featureMap.get(item.id);
              const locFeat = rawFeat ? getLocalizedFeature(rawFeat, currentLang) : null;
              const displayName = locFeat ? locFeat.properties.name : item.name;
              return `
                <button type="button" class="evidence-chip" data-feature-id="${item.id}" title="${escapeHtml(t("timeline_chip_tooltip", {}, currentLang))}">
                  <span class="chip-name">${escapeHtml(displayName)}</span>
                  <span class="chip-detail">${escapeHtml(item.detail || item.age)}</span>
                </button>
              `;
            }).join("")}
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

  function selectPeriod(periodKey) {
    activePeriodKey = periodKey;
    const nodes = containerEl.querySelectorAll(".timeline-node");

    nodes.forEach(n => {
      const match = n.getAttribute("data-period") === periodKey;
      n.classList.toggle("active", match);
      n.setAttribute("aria-selected", match ? "true" : "false");
    });

    renderPeriodCard(periodKey);
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

  /**
   * Updates timeline language in-memory.
   * @param {string} newLang - "en" | "id"
   */
  function updateLanguage(newLang) {
    currentLang = newLang;
    renderTimelineBar();
  }

  renderTimelineBar();

  return {
    selectPeriod,
    deselectPeriod,
    syncTimelineWithFeature,
    updateLanguage
  };
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
