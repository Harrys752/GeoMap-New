/**
 * GeoMap Indonesia 2.0 — Geological Time & Earth History Timeline Component
 * Phase 3 Implementation: Interactive chronological sequence bar and educational context panel.
 * 
 * Dynamically derives Dataset Evidence entries at runtime from the loaded dataset (production + candidates),
 * sharing identical canonical period matching logic with queryHelper.
 */

import { PERIOD_CONTEXT_DATA, deriveDatasetEvidence } from "../data/periodContextData.js";
import { isHistoricalHazard } from "../data/queryHelper.js";
import { getLocalizedPeriodData, getLanguage, t } from "../i18n/i18n.js";

/**
 * Initializes the Geological Timeline component.
 * @param {object[]} allFeatures - Array of validated GeoJSON features
 * @param {function} onTimelineSelectFeature - Callback when user clicks a dataset entry chip on the timeline
 * @param {function} onTimelineSelectPeriod - Callback when user filters by period via timeline
 */
export function initTimeline(allFeatures, onTimelineSelectFeature, onTimelineSelectPeriod) {
  const containerEl = document.getElementById("geological-timeline-container");
  if (!containerEl) return null;

  let currentFeatures = Array.isArray(allFeatures) ? allFeatures : [];
  let activePeriodKey = null;
  let currentLang = getLanguage();

  function getPeriodSequence() {
    return [
      { key: "Triassic", label: t("period_Triassic", {}, currentLang) || "Triassic", sub: "~252 – 201 Ma", type: "geo" },
      { key: "Cretaceous", label: t("period_Cretaceous", {}, currentLang) || "Cretaceous", sub: "~145 – 66 Ma", type: "geo" },
      { key: "Paleogene", label: t("period_Paleogene", {}, currentLang) || "Paleogene", sub: "~66 – 23 Ma", type: "geo" },
      { key: "Neogene", label: t("period_Neogene", {}, currentLang) || "Neogene", sub: "~23 – 2.58 Ma", type: "geo" },
      { key: "Quaternary", label: t("period_Quaternary", {}, currentLang) || "Quaternary", sub: "~2.58 Ma – Present", type: "geo" },
      { key: "Historical", label: t("period_Historical", {}, currentLang) || "Historical", sub: "1815 – 2021 CE", type: "hazard" }
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
    const evidenceList = deriveDatasetEvidence(currentFeatures, periodKey, currentLang);

    cardEl.style.display = "block";
    cardEl.innerHTML = `
      <div class="period-card-content">
        <div class="period-card-header">
          <div class="period-card-meta">
            <span class="period-era-tag">${escapeHtml(data.era)}</span>
            <span class="period-time-range">${escapeHtml(data.timeRange || data.range)}</span>
          </div>
          <h4 class="period-card-name">${escapeHtml(data.period || data.name)}</h4>
        </div>

        <div class="period-card-section">
          <strong>${escapeHtml(t("timeline_period_significance", {}, currentLang))}</strong>
          <p>${escapeHtml(data.generalInfo || data.desc)}</p>
        </div>

        <div class="period-card-section">
          <strong>${escapeHtml(t("timeline_dataset_evidence", { count: evidenceList.length }, currentLang))}</strong>
          <div class="evidence-chip-list">
            ${evidenceList.map(item => {
              return `
                <button type="button" class="evidence-chip${item.isCandidate ? " chip-candidate" : ""}" data-feature-id="${item.id}" title="${escapeHtml(t("timeline_chip_tooltip", {}, currentLang))}">
                  <div class="chip-title-row">
                    <span class="chip-name">${escapeHtml(item.name)}</span>
                    ${item.isCandidate ? `<span class="chip-badge chip-badge-candidate">${escapeHtml(t("badge_candidate", {}, currentLang) || "Candidate")}</span>` : ""}
                  </div>
                  <div class="chip-meta-row">
                    <span class="chip-detail">${escapeHtml(item.detail || item.age)}</span>
                  </div>
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
    } else if (period === "Paleogene") {
      targetKey = "Paleogene";
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

  /**
   * Updates backing features list when dataset is modified/updated.
   * @param {object[]} newFeatures - Updated array of GeoJSON features
   */
  function updateDataset(newFeatures) {
    currentFeatures = Array.isArray(newFeatures) ? newFeatures : [];
    if (activePeriodKey) {
      renderPeriodCard(activePeriodKey);
    }
  }

  renderTimelineBar();

  return {
    selectPeriod,
    deselectPeriod,
    syncTimelineWithFeature,
    updateLanguage,
    updateDataset
  };
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
