/**
 * Filter Panel & Geological Process/Period Explorer UI Component
 * Phase 2 — Handles Domain Toggles, Feature Types, Process Explorer, Period Explorer, and Process Cards.
 * Phase 6 — Synchronized via queryHelper.js canonical data model.
 */

import { domains } from "../core/domainRegistry.js";
import { PROCESS_CARDS } from "../data/processCardsData.js";
import {
  computeCanonicalDatasetCounts,
  matchesCanonicalFilter,
  sanitizeFilterStateForDomain,
  matchesEvidenceCategory,
  isGeologicalPeriod,
  isHistoricalHazard
} from "../data/queryHelper.js";

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
  const evidenceSelectContainer = document.getElementById("evidence-filter-select");
  const activeCountBadge = document.getElementById("active-count-badge");
  const processCardContainer = document.getElementById("process-card-display");

  let activeDomain = "all";
  const selectedFeatureTypes = new Set();
  let selectedProcess = "all";
  let selectedPeriod = "all";
  let selectedEvidenceType = "all";

  // Compute canonical dataset counts using centralized helper module
  const datasetCounts = computeCanonicalDatasetCounts(allFeatures);

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
      const targetDomain = btn.getAttribute("data-domain");

      // Sanitize filter state when switching domains to prevent stale incompatible filters
      const { sanitizedState } = sanitizeFilterStateForDomain(
        {
          domain: targetDomain,
          featureTypes: new Set(selectedFeatureTypes),
          process: selectedProcess,
          period: selectedPeriod,
          evidenceType: selectedEvidenceType
        },
        targetDomain,
        allFeatures
      );

      activeDomain = sanitizedState.domain;
      selectedProcess = sanitizedState.process;
      selectedPeriod = sanitizedState.period;
      selectedEvidenceType = sanitizedState.evidenceType;

      // Update UI dropdown values to reflect sanitized selections
      if (processSelectContainer) processSelectContainer.value = selectedProcess;
      if (periodSelectContainer) periodSelectContainer.value = selectedPeriod;
      if (evidenceSelectContainer) evidenceSelectContainer.value = selectedEvidenceType;

      renderProcessCard(selectedProcess);
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
    const periodOrder = ["Triassic", "Cretaceous", "Neogene", "Quaternary", "Historical"];
    const periodLabels = {
      Triassic: "Triassic",
      Cretaceous: "Cretaceous",
      Neogene: "Neogene",
      Quaternary: "Quaternary",
      Historical: "Historical Hazards"
    };

    const presentPeriods = periodOrder.filter(per => (datasetCounts.period[per] || 0) > 0);
    Object.keys(datasetCounts.period).forEach(per => {
      if (!presentPeriods.includes(per) && datasetCounts.period[per] > 0) {
        presentPeriods.push(per);
      }
    });

    periodSelectContainer.innerHTML = `
      <option value="all">All Geological Periods (${presentPeriods.length})</option>
      ${presentPeriods.map(per => `
        <option value="${escapeHtml(per)}">${escapeHtml(periodLabels[per] || per)} (${datasetCounts.period[per]})</option>
      `).join("")}
    `;

    periodSelectContainer.addEventListener("change", (e) => {
      selectedPeriod = e.target.value;
      triggerChange();
    });
  }

  // 5. Render Geological Evidence Type Explorer Dropdown (only evidence types present in dataset)
  if (evidenceSelectContainer) {
    const presentEvidenceTypes = Object.keys(datasetCounts.evidenceType)
      .filter(ev => datasetCounts.evidenceType[ev] > 0)
      .sort();

    evidenceSelectContainer.innerHTML = `
      <option value="all">All Evidence Categories (${presentEvidenceTypes.length})</option>
      ${presentEvidenceTypes.map(ev => `
        <option value="${escapeHtml(ev)}">${escapeHtml(ev)} (${datasetCounts.evidenceType[ev]})</option>
      `).join("")}
    `;

    evidenceSelectContainer.addEventListener("change", (e) => {
      selectedEvidenceType = e.target.value;
      triggerChange();
    });
  }

  // 6. Render Educational Process Card when a Process is Selected
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
        period: selectedPeriod,
        evidenceType: selectedEvidenceType
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
    selectedEvidenceType = "all";

    if (domainButtonsContainer) {
      domainButtonsContainer.querySelectorAll(".filter-btn").forEach(b => {
        b.classList.toggle("active", b.getAttribute("data-domain") === "all");
      });
    }

    if (processSelectContainer) processSelectContainer.value = "all";
    if (periodSelectContainer) periodSelectContainer.value = "all";
    if (evidenceSelectContainer) evidenceSelectContainer.value = "all";

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

/** Helper: Check if feature matches requested Evidence Type */
export function matchesEvidenceType(feature, evidenceType) {
  return matchesEvidenceCategory(feature, evidenceType);
}

/** Helper: Check if feature matches requested Period / Historical Track */
export function matchesHistoricalTrack(feature, period) {
  return isGeologicalPeriod(feature, period);
}

/** Helper: Unified evaluation ensuring feature satisfies ALL active filters */
export function matchesAllFilters(feature, filterState) {
  return matchesCanonicalFilter(feature, filterState);
}

/**
 * Filters dataset features by domain, feature types, process, period, and evidence type.
 * @param {object[]} features - Validated dataset features
 * @param {object} filterState - Current filter state { domain, featureTypes, process, period, evidenceType }
 * @returns {object[]} Filtered features
 */
export function filterByDomainAndType(features, filterState) {
  if (!filterState) return features;
  return features.filter(f => matchesCanonicalFilter(f, filterState));
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

