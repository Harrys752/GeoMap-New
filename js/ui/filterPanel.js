/**
 * Shared Feature Type & Domain Filter Controller Component
 * Phase 1 — Dynamically generates feature-type filters based on active domain.
 * Supports full bilingual display (English & Bahasa Indonesia).
 *
 * UX Paradigm:
 * - All available feature types for active domain are CHECKED by default ([x]).
 * - Unchecking a checkbox hides features of that type.
 * - Re-checking a checkbox restores features of that type.
 * - Candidate Layer Master Toggle (Orange Area) controls all 6 candidate feature types:
 *   * When Orange toggle is CHECKED: all 6 candidate checkboxes are checked ([x]), markers shown.
 *   * When Orange toggle is UNCHECKED: all 6 candidate checkboxes are unchecked ([ ]), markers hidden.
 *   * Crucially: Unchecking the Orange toggle does NOT hide or remove the 6 candidate checkboxes from the UI list!
 *   * Checking/unchecking individual candidate checkboxes updates visibility and syncs Orange toggle state.
 */

import { computeCanonicalDatasetCounts, matchesCanonicalFilter, matchesEvidenceCategory, isGeologicalPeriod, sanitizeFilterStateForDomain } from "../data/queryHelper.js";
import { PROCESS_CARDS } from "../data/processCardsData.js";
import { getConfidenceMetadata } from "./confidenceLabels.js";
import { formatFeatureTypeLabel } from "../data/adapters/geologyAdapter.js";
import { getLanguage, t, getLocalizedProcessCard } from "../i18n/i18n.js";

export const CANDIDATE_FEATURE_TYPES = new Set([
  "mountain_system",
  "basin",
  "regional_karst",
  "tectonic_structure",
  "volcanic_arc",
  "geological_complex"
]);

/**
 * Initializes the unified Domain & Feature-Type filter UI.
 * @param {object[]} allFeatures - Validated dataset features (geology + hazard)
 * @param {function} onFilterChange - Callback invoked with new filter state { domain, featureTypes, process, period, evidenceType, confidenceStatus }
 */
export function initFilterPanel(allFeatures, onFilterChange) {
  const domainButtonsContainer = document.getElementById("domain-filter-group");
  const featureGroupContainer = document.getElementById("feature-type-filter-group");
  const activeCountBadge = document.getElementById("active-count-badge");
  const processSelectContainer = document.getElementById("process-filter-select");
  const processCardContainer = document.getElementById("process-card-display");
  const periodSelectContainer = document.getElementById("period-filter-select");
  const evidenceSelectContainer = document.getElementById("evidence-filter-select");
  const confidenceSelectContainer = document.getElementById("confidence-filter-select");

  let currentFeaturesList = allFeatures || [];
  let datasetCounts = computeCanonicalDatasetCounts(currentFeaturesList);

  let activeDomain = "all"; // 'all' | 'geology' | 'hazard'

  function getAvailableTypesForDomain(domainKey, counts = datasetCounts) {
    let available = [];
    if (domainKey === "all") {
      available = Object.keys(counts.featureType);
    } else if (domainKey === "geology") {
      available = Object.keys(counts.featureType).filter(type => type !== "historical_event");
    } else if (domainKey === "hazard") {
      available = ["historical_event"];
    }
    return available.filter(type => (counts.featureType[type] || 0) > 0);
  }

  // ALL AVAILABLE TYPES CHECKED BY DEFAULT
  let selectedFeatureTypes = new Set(getAvailableTypesForDomain(activeDomain, datasetCounts));
  let selectedProcess = "all";
  let selectedPeriod = "all";
  let selectedEvidenceType = "all";
  let selectedConfidenceStatus = "all";
  let currentLang = getLanguage();

  function syncCandidateToggleUI() {
    const sideChk = document.getElementById("sidebar-candidates-toggle");
    const mapChk = document.querySelector('input[name="ol-candidates-toggle"]');

    const availableTypes = getAvailableTypesForDomain(activeDomain, datasetCounts);
    const candidateTypesInDomain = availableTypes.filter(t => CANDIDATE_FEATURE_TYPES.has(t));

    if (candidateTypesInDomain.length === 0) {
      if (sideChk) { sideChk.checked = false; sideChk.indeterminate = false; }
      if (mapChk) { mapChk.checked = false; mapChk.indeterminate = false; }
      return;
    }

    const checkedCount = candidateTypesInDomain.filter(t => selectedFeatureTypes.has(t)).length;
    const isAllChecked = checkedCount === candidateTypesInDomain.length;
    const isSomeChecked = checkedCount > 0 && checkedCount < candidateTypesInDomain.length;

    if (sideChk) {
      sideChk.checked = isAllChecked || isSomeChecked;
      sideChk.indeterminate = isSomeChecked;
    }
    if (mapChk) {
      mapChk.checked = isAllChecked || isSomeChecked;
      mapChk.indeterminate = isSomeChecked;
    }
  }

  // Master Toggle Handler for Candidate Feature Types (Orange Area)
  function toggleCandidateFeatureTypes(explicitState) {
    const availableTypes = getAvailableTypesForDomain(activeDomain, datasetCounts);
    const candidateTypesInDomain = availableTypes.filter(t => CANDIDATE_FEATURE_TYPES.has(t));

    let shouldCheck;
    if (typeof explicitState === "boolean") {
      shouldCheck = explicitState;
    } else {
      const allChecked = candidateTypesInDomain.length > 0 && candidateTypesInDomain.every(t => selectedFeatureTypes.has(t));
      shouldCheck = !allChecked;
    }

    if (shouldCheck) {
      candidateTypesInDomain.forEach(t => selectedFeatureTypes.add(t));
    } else {
      candidateTypesInDomain.forEach(t => selectedFeatureTypes.delete(t));
    }

    renderFeatureTypeCheckboxes();
    syncCandidateToggleUI();
    triggerChange();
  }

  // 1. Render Domain Explorer Buttons
  function renderDomainButtons() {
    if (!domainButtonsContainer) return;
    domainButtonsContainer.innerHTML = "";

    const allBtn = createDomainButton("all", t("domain_all", { count: datasetCounts.domain.all }, currentLang), activeDomain === "all");
    const geologyBtn = createDomainButton("geology", t("domain_geology", { count: datasetCounts.domain.geology }, currentLang), activeDomain === "geology");
    const hazardBtn = createDomainButton("hazard", t("domain_hazard", { count: datasetCounts.domain.hazard }, currentLang), activeDomain === "hazard");

    domainButtonsContainer.appendChild(allBtn);
    domainButtonsContainer.appendChild(geologyBtn);
    domainButtonsContainer.appendChild(hazardBtn);
  }

  function createDomainButton(domainKey, label, isActive) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `filter-btn ${isActive ? "active" : ""}`;
    btn.setAttribute("data-domain", domainKey);
    btn.textContent = label;

    btn.addEventListener("click", () => {
      if (activeDomain === domainKey) return;

      activeDomain = domainKey;
      const availableInNewDomain = getAvailableTypesForDomain(domainKey, datasetCounts);
      // Select all available types for the newly active domain by default
      selectedFeatureTypes = new Set(availableInNewDomain);

      const currentFilterState = {
        domain: domainKey,
        featureTypes: selectedFeatureTypes,
        process: selectedProcess,
        period: selectedPeriod,
        evidenceType: selectedEvidenceType,
        confidenceStatus: selectedConfidenceStatus
      };

      const { sanitizedState } = sanitizeFilterStateForDomain(currentFilterState, domainKey, currentFeaturesList);

      selectedProcess = sanitizedState.process || "all";
      selectedPeriod = sanitizedState.period || "all";
      selectedEvidenceType = sanitizedState.evidenceType || "all";
      selectedConfidenceStatus = sanitizedState.confidenceStatus || "all";

      // Update button active classes
      domainButtonsContainer.querySelectorAll(".filter-btn").forEach(b => {
        b.classList.toggle("active", b.getAttribute("data-domain") === domainKey);
      });

      // Synchronize dropdown values in DOM
      if (processSelectContainer) processSelectContainer.value = selectedProcess;
      if (periodSelectContainer) periodSelectContainer.value = selectedPeriod;
      if (evidenceSelectContainer) evidenceSelectContainer.value = selectedEvidenceType;
      if (confidenceSelectContainer) confidenceSelectContainer.value = selectedConfidenceStatus;

      renderProcessCard(selectedProcess);
      renderFeatureTypeCheckboxes();
      syncCandidateToggleUI();
      triggerChange();
    });

    return btn;
  }

  // 2. Render Feature Type Checkboxes based on Active Domain
  function renderFeatureTypeCheckboxes(counts = datasetCounts) {
    if (!featureGroupContainer) return;
    featureGroupContainer.innerHTML = "";

    const availableTypes = getAvailableTypesForDomain(activeDomain, counts);

    if (availableTypes.length === 0) {
      featureGroupContainer.innerHTML = `<p class="no-filter-types-msg">${escapeHtml(t("empty_state_message", {}, currentLang))}</p>`;
      return;
    }

    availableTypes.forEach(type => {
      const count = counts.featureType[type] || 0;
      const labelText = formatFeatureTypeLabel(type, currentLang);

      const labelEl = document.createElement("label");
      labelEl.className = "checkbox-item";

      const inputEl = document.createElement("input");
      inputEl.type = "checkbox";
      inputEl.value = type;
      inputEl.checked = selectedFeatureTypes.has(type);

      inputEl.addEventListener("change", (e) => {
        if (e.target.checked) {
          selectedFeatureTypes.add(type);
        } else {
          selectedFeatureTypes.delete(type);
        }
        syncCandidateToggleUI();
        triggerChange();
      });

      const spanEl = document.createElement("span");
      spanEl.className = "checkbox-text";
      spanEl.textContent = `${labelText} (${count})`;

      labelEl.appendChild(inputEl);
      labelEl.appendChild(spanEl);
      featureGroupContainer.appendChild(labelEl);
    });
  }

  // 3. Render Geological Process Explorer Dropdown
  function renderProcessDropdown() {
    if (!processSelectContainer) return;
    const processes = Object.keys(datasetCounts.process).filter(proc => datasetCounts.process[proc] > 0);

    processSelectContainer.innerHTML = `
      <option value="all">${escapeHtml(t("process_all_option", { count: processes.length }, currentLang))}</option>
      ${processes.map(proc => {
        const localizedCard = getLocalizedProcessCard(proc, PROCESS_CARDS[proc], currentLang);
        const displayName = localizedCard ? localizedCard.name : proc;
        return `<option value="${escapeHtml(proc)}"${selectedProcess === proc ? " selected" : ""}>${escapeHtml(displayName)} (${datasetCounts.process[proc]})</option>`;
      }).join("")}
    `;

    processSelectContainer.value = selectedProcess;
  }

  if (processSelectContainer) {
    processSelectContainer.addEventListener("change", (e) => {
      selectedProcess = e.target.value;
      renderProcessCard(selectedProcess);
      triggerChange();
    });
  }

  // 4. Render Geological Period Explorer Dropdown
  function renderPeriodDropdown() {
    if (!periodSelectContainer) return;
    const periods = Object.keys(datasetCounts.period).filter(p => datasetCounts.period[p] > 0);

    periodSelectContainer.innerHTML = `
      <option value="all">${escapeHtml(t("period_all_option", { count: periods.length }, currentLang))}</option>
      ${periods.map(p => {
        const periodKey = `period_${p.toLowerCase()}`;
        const label = t(periodKey, {}, currentLang) || p;
        return `<option value="${escapeHtml(p)}"${selectedPeriod === p ? " selected" : ""}>${escapeHtml(label)} (${datasetCounts.period[p]})</option>`;
      }).join("")}
    `;

    periodSelectContainer.value = selectedPeriod;
  }

  if (periodSelectContainer) {
    periodSelectContainer.addEventListener("change", (e) => {
      selectedPeriod = e.target.value;
      triggerChange();
    });
  }

  // 5. Render Evidence Type Explorer Dropdown
  function renderEvidenceDropdown() {
    if (!evidenceSelectContainer) return;
    const evidenceCategories = Object.keys(datasetCounts.evidenceType).filter(cat => datasetCounts.evidenceType[cat] > 0);

    evidenceSelectContainer.innerHTML = `
      <option value="all">${escapeHtml(t("evidence_all_option", { count: evidenceCategories.length }, currentLang))}</option>
      ${evidenceCategories.map(cat => {
        const catKey = `evidence_cat_${cat.toLowerCase().replace(/\s+/g, "_")}`;
        const label = t(catKey, {}, currentLang) || cat;
        return `<option value="${escapeHtml(cat)}"${selectedEvidenceType === cat ? " selected" : ""}>${escapeHtml(label)} (${datasetCounts.evidenceType[cat]})</option>`;
      }).join("")}
    `;

    evidenceSelectContainer.value = selectedEvidenceType;
  }

  if (evidenceSelectContainer) {
    evidenceSelectContainer.addEventListener("change", (e) => {
      selectedEvidenceType = e.target.value;
      triggerChange();
    });
  }

  // 6. Render Data Confidence Status Explorer Dropdown
  function renderConfidenceDropdown() {
    if (!confidenceSelectContainer) return;
    const presentStatuses = Object.keys(datasetCounts.confidenceStatus)
      .filter(st => datasetCounts.confidenceStatus[st] > 0);

    confidenceSelectContainer.innerHTML = `
      <option value="all">${escapeHtml(t("confidence_all_option", { count: presentStatuses.length }, currentLang))}</option>
      ${presentStatuses.map(st => {
        const meta = getConfidenceMetadata(st, currentLang);
        return `<option value="${escapeHtml(st)}"${selectedConfidenceStatus === st ? " selected" : ""}>${escapeHtml(meta.label)} (${datasetCounts.confidenceStatus[st]})</option>`;
      }).join("")}
    `;

    confidenceSelectContainer.value = selectedConfidenceStatus;
  }

  if (confidenceSelectContainer) {
    confidenceSelectContainer.addEventListener("change", (e) => {
      selectedConfidenceStatus = e.target.value;
      triggerChange();
    });
  }

  // 7. Render Educational Process Card when a Process is Selected
  function renderProcessCard(processName) {
    if (!processCardContainer) return;

    if (!processName || processName === "all" || !PROCESS_CARDS[processName]) {
      processCardContainer.style.display = "none";
      processCardContainer.innerHTML = "";
      return;
    }

    const card = getLocalizedProcessCard(processName, PROCESS_CARDS[processName], currentLang);
    processCardContainer.style.display = "block";
    processCardContainer.innerHTML = `
      <div class="process-card">
        <div class="process-card-header">
          <span class="process-card-tag">${escapeHtml(t("process_card_tag", {}, currentLang))}</span>
          <h4 class="process-card-title">${escapeHtml(card.name)}</h4>
        </div>
        <div class="process-card-body">
          <div class="process-card-section">
            <strong>${escapeHtml(t("process_card_what_is_it", {}, currentLang))}</strong>
            <p>${escapeHtml(card.whatIsIt)}</p>
          </div>
          <div class="process-card-section">
            <strong>${escapeHtml(t("process_card_how_it_works", {}, currentLang))}</strong>
            <p>${escapeHtml(card.howItWorks)}</p>
          </div>
          <div class="process-card-section">
            <strong>${escapeHtml(t("process_card_indonesian_examples", {}, currentLang))}</strong>
            <p class="process-card-examples">${escapeHtml(card.indonesianExamples.join(", "))}</p>
          </div>
          <div class="process-card-section">
            <strong>${escapeHtml(t("process_card_what_can_we_learn", {}, currentLang))}</strong>
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
        evidenceType: selectedEvidenceType,
        confidenceStatus: selectedConfidenceStatus
      });
    }
  }

  function updateResultBadgeCount(visibleCount) {
    if (activeCountBadge) {
      const templateKey = visibleCount === 1 ? "count_badge_singular" : "count_badge_plural";
      activeCountBadge.textContent = t(templateKey, { count: visibleCount }, currentLang);
    }
  }

  function resetAllFiltersUI() {
    activeDomain = "all";
    selectedProcess = "all";
    selectedPeriod = "all";
    selectedEvidenceType = "all";
    selectedConfidenceStatus = "all";
    selectedFeatureTypes = new Set(getAvailableTypesForDomain("all", datasetCounts));

    if (domainButtonsContainer) {
      domainButtonsContainer.querySelectorAll(".filter-btn").forEach(b => {
        b.classList.toggle("active", b.getAttribute("data-domain") === "all");
      });
    }

    if (processSelectContainer) processSelectContainer.value = "all";
    if (periodSelectContainer) periodSelectContainer.value = "all";
    if (evidenceSelectContainer) evidenceSelectContainer.value = "all";
    if (confidenceSelectContainer) confidenceSelectContainer.value = "all";

    renderProcessCard("all");
    renderFeatureTypeCheckboxes();
    syncCandidateToggleUI();
    triggerChange();
  }

  /**
   * Updates all UI labels when language changes without resetting active filter state.
   * @param {string} newLang - "en" | "id"
   */
  function updateLanguage(newLang) {
    currentLang = newLang;
    renderDomainButtons();
    renderFeatureTypeCheckboxes();
    renderProcessDropdown();
    renderPeriodDropdown();
    renderEvidenceDropdown();
    renderConfidenceDropdown();
    renderProcessCard(selectedProcess);
    syncCandidateToggleUI();

    // Update static labels in sidebar
    const candidateToggleTitle = document.querySelector(".candidate-toggle-label span");
    if (candidateToggleTitle) candidateToggleTitle.textContent = t("candidate_toggle_title", {}, currentLang);

    const candidateHint = document.querySelector(".candidate-toggle-hint");
    if (candidateHint) candidateHint.textContent = t("candidate_toggle_hint", {}, currentLang);

    const domainSectionLabel = document.querySelector(".domain-filter-section .section-label");
    if (domainSectionLabel) domainSectionLabel.textContent = t("domain_label", {}, currentLang);

    const featureSectionLabel = document.querySelector(".feature-filter-section .section-label");
    if (featureSectionLabel) featureSectionLabel.textContent = t("feature_type_label", {}, currentLang);

    const processSectionLabel = document.querySelector(".process-filter-section .section-label");
    if (processSectionLabel) processSectionLabel.textContent = t("process_filter_label", {}, currentLang);

    const periodSectionLabel = document.querySelector(".period-filter-section .section-label");
    if (periodSectionLabel) periodSectionLabel.textContent = t("period_filter_label", {}, currentLang);

    const evidenceSectionLabel = document.querySelector(".evidence-filter-section .section-label");
    if (evidenceSectionLabel) evidenceSectionLabel.textContent = t("evidence_filter_label", {}, currentLang);

    const confidenceSectionLabel = document.querySelector(".confidence-filter-section .section-label");
    if (confidenceSectionLabel) confidenceSectionLabel.textContent = t("confidence_filter_label", {}, currentLang);
  }

  function syncPeriodSelection(periodKey) {
    selectedPeriod = periodKey || "all";
    if (periodSelectContainer) {
      periodSelectContainer.value = selectedPeriod;
    }
  }

  // Initial renders
  renderDomainButtons();
  renderFeatureTypeCheckboxes();
  renderProcessDropdown();
  renderPeriodDropdown();
  renderEvidenceDropdown();
  renderConfidenceDropdown();
  syncCandidateToggleUI();
  triggerChange();

  return {
    updateResultBadgeCount,
    resetAllFiltersUI,
    updateLanguage,
    syncPeriodSelection,
    toggleCandidateFeatureTypes,
    updateDataset: (newAllFeatures) => {
      currentFeaturesList = newAllFeatures || [];
      datasetCounts = computeCanonicalDatasetCounts(currentFeaturesList);

      const availableForDomain = getAvailableTypesForDomain(activeDomain, datasetCounts);

      // Retain valid selected types
      const validSelected = Array.from(selectedFeatureTypes).filter(t => availableForDomain.includes(t));
      if (validSelected.length === 0) {
        selectedFeatureTypes = new Set(availableForDomain);
      } else {
        selectedFeatureTypes = new Set(validSelected);
      }

      const currentFilterState = {
        domain: activeDomain,
        featureTypes: selectedFeatureTypes,
        process: selectedProcess,
        period: selectedPeriod,
        evidenceType: selectedEvidenceType,
        confidenceStatus: selectedConfidenceStatus
      };

      const { sanitizedState } = sanitizeFilterStateForDomain(currentFilterState, activeDomain, currentFeaturesList);

      selectedProcess = sanitizedState.process || "all";
      selectedPeriod = sanitizedState.period || "all";
      selectedEvidenceType = sanitizedState.evidenceType || "all";
      selectedConfidenceStatus = sanitizedState.confidenceStatus || "all";

      if (processSelectContainer) processSelectContainer.value = selectedProcess;
      if (periodSelectContainer) periodSelectContainer.value = selectedPeriod;
      if (evidenceSelectContainer) evidenceSelectContainer.value = selectedEvidenceType;
      if (confidenceSelectContainer) confidenceSelectContainer.value = selectedConfidenceStatus;

      renderDomainButtons();
      renderFeatureTypeCheckboxes(datasetCounts);
      renderProcessDropdown();
      renderPeriodDropdown();
      renderEvidenceDropdown();
      renderConfidenceDropdown();
      renderProcessCard(selectedProcess);
      syncCandidateToggleUI();
      triggerChange();
    }
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
