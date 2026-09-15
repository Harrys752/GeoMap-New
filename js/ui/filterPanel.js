/**
 * Filter Panel & Geological Process/Period Explorer UI Component
 * Phase 2 — Handles Domain Toggles, Feature Types, Process Explorer, Period Explorer, and Process Cards.
 */

import { domains } from "../core/domainRegistry.js";
import { PROCESS_CARDS } from "../data/processCardsData.js";

const FEATURE_TYPE_LABELS = {
  volcano: "Volcanoes",
  paleontology_site: "Paleontology Sites",
  site: "Geological Sites",
  historical_event: "Historical Hazard Events"
};

/**
 * Initializes filter controls and process/period explorers.
 * @param {object[]} allFeatures - Array of validated GeoJSON features
 * @param {function} onFilterChange - Callback function triggered on filter state update
 */
export function initFilterPanel(allFeatures, onFilterChange) {
  const domainButtonsContainer = document.getElementById("domain-filter-group");
  const featureTypeContainer = document.getElementById("feature-type-filter-group");
  const processSelectContainer = document.getElementById("process-filter-select");
  const periodSelectContainer = document.getElementById("period-filter-select");
  const activeCountBadge = document.getElementById("active-count-badge");
  const processCardContainer = document.getElementById("process-card-display");

  let activeDomain = "all";
  const selectedFeatureTypes = new Set();
  let selectedProcess = "all";
  let selectedPeriod = "all";

  // Compute available feature types, processes, and periods present in loaded dataset
  function computeDatasetCounts() {
    const counts = {
      domain: { all: allFeatures.length, geology: 0, hazard: 0 },
      featureType: {},
      process: {},
      period: {}
    };

    for (const f of allFeatures) {
      const props = f.properties || {};
      const d = props.domain;
      const t = props.feature_type;
      const proc = props.geological_process;
      const per = props.geological_period;

      if (counts.domain[d] !== undefined) counts.domain[d]++;
      if (t) counts.featureType[t] = (counts.featureType[t] || 0) + 1;
      if (proc) counts.process[proc] = (counts.process[proc] || 0) + 1;
      if (per) counts.period[per] = (counts.period[per] || 0) + 1;
    }

    return counts;
  }

  const datasetCounts = computeDatasetCounts();

  // 1. Render Domain Filter Buttons
  if (domainButtonsContainer) {
    domainButtonsContainer.innerHTML = `
      <button type="button" class="filter-btn active" data-domain="all">
        All Domains (${datasetCounts.domain.all})
      </button>
      <button type="button" class="filter-btn" data-domain="geology" style="--domain-color: ${domains.geology.color}">
        ${domains.geology.label} (${datasetCounts.domain.geology})
      </button>
      <button type="button" class="filter-btn" data-domain="hazard" style="--domain-color: ${domains.hazard.color}">
        ${domains.hazard.label} (${datasetCounts.domain.hazard})
      </button>
    `;

    domainButtonsContainer.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-domain]");
      if (!btn) return;

      domainButtonsContainer.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeDomain = btn.getAttribute("data-domain");

      renderFeatureTypeCheckboxes();
      triggerChange();
    });
  }

  // 2. Render Dynamic Feature-Type Checkboxes (only types with > 0 valid records)
  function renderFeatureTypeCheckboxes() {
    if (!featureTypeContainer) return;

    featureTypeContainer.innerHTML = "";
    selectedFeatureTypes.clear();

    let allowedTypes = [];
    if (activeDomain === "geology") {
      allowedTypes = domains.geology.featureTypes;
    } else if (activeDomain === "hazard") {
      allowedTypes = domains.hazard.featureTypes;
    } else {
      allowedTypes = [...domains.geology.featureTypes, ...domains.hazard.featureTypes];
    }

    const validAvailableTypes = allowedTypes.filter(type => (datasetCounts.featureType[type] || 0) > 0);

    if (validAvailableTypes.length === 0) {
      featureTypeContainer.innerHTML = `<p class="filter-empty-text">No feature types available for selection.</p>`;
      return;
    }

    validAvailableTypes.forEach(type => {
      selectedFeatureTypes.add(type);

      const labelText = FEATURE_TYPE_LABELS[type] || type;
      const count = datasetCounts.featureType[type] || 0;

      const wrapper = document.createElement("label");
      wrapper.className = "checkbox-item";
      wrapper.innerHTML = `
        <input type="checkbox" value="${type}" checked />
        <span class="checkbox-label">${escapeHtml(labelText)}</span>
        <span class="type-count-badge">${count}</span>
      `;

      wrapper.querySelector("input").addEventListener("change", (e) => {
        if (e.target.checked) {
          selectedFeatureTypes.add(type);
        } else {
          selectedFeatureTypes.delete(type);
        }
        triggerChange();
      });

      featureTypeContainer.appendChild(wrapper);
    });
  }

  // 3. Render Geological Process Explorer Dropdown (only processes with > 0 dataset entries)
  if (processSelectContainer) {
    const processes = Object.keys(datasetCounts.process).sort();
    
    processSelectContainer.innerHTML = `
      <option value="all">All Geological Processes (${processes.length})</option>
      ${processes.map(proc => `
        <option value="${escapeHtml(proc)}">${escapeHtml(proc)} (${datasetCounts.process[proc]})</option>
      `).join("")}
    `;

    processSelectContainer.addEventListener("change", (e) => {
      selectedProcess = e.target.value;
      renderProcessCard(selectedProcess);
      triggerChange();
    });
  }

  // 4. Render Geological Age / Period Explorer Dropdown (only periods with > 0 dataset entries)
  if (periodSelectContainer) {
    const periods = Object.keys(datasetCounts.period).sort();

    periodSelectContainer.innerHTML = `
      <option value="all">All Geological Periods (${periods.length})</option>
      ${periods.map(per => `
        <option value="${escapeHtml(per)}">${escapeHtml(per)} (${datasetCounts.period[per]})</option>
      `).join("")}
    `;

    periodSelectContainer.addEventListener("change", (e) => {
      selectedPeriod = e.target.value;
      triggerChange();
    });
  }

  // 5. Render Educational Process Card when a Process is Selected
  function renderProcessCard(processName) {
    if (!processCardContainer) return;

    if (!processName || processName === "all" || !PROCESS_CARDS[processName]) {
      processCardContainer.style.display = "none";
      processCardContainer.innerHTML = "";
      return;
    }

    const card = PROCESS_CARDS[processName];
    processCardContainer.style.display = "block";
    processCardContainer.innerHTML = `
      <div class="process-card">
        <div class="process-card-header">
          <span class="process-card-tag">Process Insight</span>
          <h4 class="process-card-title">${escapeHtml(card.name)}</h4>
        </div>
        <div class="process-card-body">
          <div class="process-card-section">
            <strong>What is it?</strong>
            <p>${escapeHtml(card.whatIsIt)}</p>
          </div>
          <div class="process-card-section">
            <strong>How does it work?</strong>
            <p>${escapeHtml(card.howItWorks)}</p>
          </div>
          <div class="process-card-section">
            <strong>Indonesian Examples in Dataset:</strong>
            <p class="process-card-examples">${escapeHtml(card.indonesianExamples.join(", "))}</p>
          </div>
          <div class="process-card-section">
            <strong>What can we learn?</strong>
            <p>${escapeHtml(card.whatCanWeLearn)}</p>
          </div>
        </div>
      </div>
    `;
  }

  function triggerChange() {
    if (typeof onFilterChange === "function") {
      onFilterChange({
        domain: activeDomain,
        featureTypes: new Set(selectedFeatureTypes),
        process: selectedProcess,
        period: selectedPeriod
      });
    }
  }

  function updateResultBadgeCount(visibleCount) {
    if (activeCountBadge) {
      activeCountBadge.textContent = `${visibleCount} ${visibleCount === 1 ? 'entry' : 'entries'} visible`;
    }
  }

  function resetAllFiltersUI() {
    activeDomain = "all";
    selectedProcess = "all";
    selectedPeriod = "all";

    if (domainButtonsContainer) {
      domainButtonsContainer.querySelectorAll(".filter-btn").forEach(b => {
        b.classList.toggle("active", b.getAttribute("data-domain") === "all");
      });
    }

    if (processSelectContainer) processSelectContainer.value = "all";
    if (periodSelectContainer) periodSelectContainer.value = "all";

    renderProcessCard("all");
    renderFeatureTypeCheckboxes();
    triggerChange();
  }

  renderFeatureTypeCheckboxes();

  return {
    updateResultBadgeCount,
    resetAllFiltersUI
  };
}

/**
 * Filters dataset features by domain, feature types, process, and period.
 * @param {object[]} features - Validated dataset features
 * @param {object} filterState - Current filter state { domain, featureTypes, process, period }
 * @returns {object[]} Filtered features
 */
export function filterByDomainAndType(features, filterState) {
  if (!filterState) return features;

  const { domain, featureTypes, process, period } = filterState;

  return features.filter(f => {
    const props = f.properties || {};

    // Domain check
    if (domain && domain !== "all" && props.domain !== domain) {
      return false;
    }

    // Feature type check
    if (featureTypes && featureTypes.size > 0 && !featureTypes.has(props.feature_type)) {
      return false;
    }

    // Geological Process check
    if (process && process !== "all" && props.geological_process !== process) {
      return false;
    }

    // Geological Period check
    if (period && period !== "all" && props.geological_period !== period) {
      return false;
    }

    return true;
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
