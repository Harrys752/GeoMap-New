/**
 * GeoMap Indonesia 2.0 Application Main Orchestrator Module
 * Supports full bilingual display (English & Bahasa Indonesia) with instant in-memory language switching.
 */

import { initMap } from "./map/initMap.js";
import { renderMarkers, setMarkerHighlight, clearMarkerHighlight, getFeatureCenter } from "./map/markerLayer.js";
import { loadAllDatasets } from "./data/loadData.js";
import { initSearchBar, filterBySearchQuery } from "./ui/searchBar.js";
import { initFilterPanel, filterByDomainAndType } from "./ui/filterPanel.js";
import { initDetailPanel } from "./ui/detailPanel.js";
import { initTimeline } from "./ui/timeline.js";
import { computeCanonicalDatasetCounts, findFeatureById } from "./data/queryHelper.js";
import { getConfidenceMetadata } from "./ui/confidenceLabels.js";
import { getLanguage, setLanguage, t, getLocalizedFeature } from "./i18n/i18n.js";

document.addEventListener("DOMContentLoaded", async () => {
  const loadingOverlay = document.getElementById("loading-overlay");
  const emptyStateEl = document.getElementById("empty-state");
  const aboutModal = document.getElementById("about-modal");
  const btnOpenAbout = document.getElementById("btn-open-about");
  const btnCloseAbout = document.getElementById("about-modal-close");
  const btnLangToggle = document.getElementById("btn-lang-toggle");

  let mapInstance = null;
  let allFeatures = [];
  let currentMarkerGroup = null;
  let currentMarkerMap = new Map();
  let searchSearchQuery = "";
  let currentFilterState = { domain: "all", featureTypes: undefined, process: "all", period: "all", evidenceType: "all", confidenceStatus: "all" };
  let timelineInstance = null;
  let filterPanelInstance = null;
  let searchBarInstance = null;
  let currentLang = getLanguage();

  // 1. Initialize Map
  try {
    mapInstance = initMap("map");
  } catch (err) {
    console.error("[GeoMap] Failed to initialize map:", err);
    showNotification("Failed to initialize interactive map.", "error");
    return;
  }

  // 2. Initialize Detail Panel & Close Callback
  const detailPanel = initDetailPanel("detail-panel", "detail-close-btn");

  const detailCloseBtn = document.getElementById("detail-close-btn");
  if (detailCloseBtn) {
    detailCloseBtn.addEventListener("click", () => {
      clearMarkerHighlight();
    });
  }

  // 3. Initialize About & Mission Modal Handlers
  if (btnOpenAbout && aboutModal) {
    btnOpenAbout.addEventListener("click", () => {
      openAboutModal();
    });
  }

  if (btnCloseAbout && aboutModal) {
    btnCloseAbout.addEventListener("click", () => {
      closeAboutModal();
    });
  }

  if (aboutModal) {
    aboutModal.addEventListener("click", (e) => {
      if (e.target === aboutModal) {
        closeAboutModal();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && aboutModal.classList.contains("open")) {
        closeAboutModal();
      }
    });
  }

  function renderTransparencySummary() {
    const container = document.getElementById("transparency-summary-container");
    if (!container || !allFeatures || allFeatures.length === 0) return;

    const datasetCounts = computeCanonicalDatasetCounts(allFeatures);
    const total = datasetCounts.total || allFeatures.length;
    const statusCounts = datasetCounts.confidenceStatus || {};

    const activeStatuses = Object.keys(statusCounts).filter(st => statusCounts[st] > 0);

    container.innerHTML = `
      <div class="transparency-summary-card">
        <div class="transparency-summary-header">
          <span class="transparency-total-badge">${escapeHtml(t("about_transparency_total_badge", { total }, currentLang))}</span>
        </div>
        <div class="transparency-status-grid">
          ${activeStatuses.map(st => {
            const count = statusCounts[st];
            const pct = Math.round((count / total) * 100);
            const meta = getConfidenceMetadata(st, currentLang);
            return `
              <div class="transparency-status-item">
                <div class="transparency-status-badge-row">
                  <span class="confidence-badge-box ${escapeHtml(meta.badgeClass)}">
                    <span class="confidence-badge-icon" aria-hidden="true">${escapeHtml(meta.icon)}</span>
                    <span class="confidence-badge-label">${escapeHtml(meta.label)}</span>
                  </span>
                  <span class="transparency-count">${count} (${pct}%)</span>
                </div>
                <p class="transparency-status-desc">${escapeHtml(meta.explanation)}</p>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  function openAboutModal() {
    if (aboutModal) {
      renderTransparencySummary();
      aboutModal.classList.add("open");
      aboutModal.setAttribute("aria-hidden", "false");
    }
  }

  function closeAboutModal() {
    if (aboutModal) {
      aboutModal.classList.remove("open");
      aboutModal.setAttribute("aria-hidden", "true");
    }
  }

  // 4. Dataset Loading Pipeline
  const DATASET_PATHS = [
    "data/geology/sites.demo.geojson",
    "data/hazard/historical-events.demo.geojson",
    "data/geology/candidates.demo.geojson"
  ];

  try {
    const result = await loadAllDatasets(DATASET_PATHS);
    allFeatures = result.features || [];

    if (result.errors && result.errors.length > 0) {
      console.warn(`[GeoMap Load] Loaded ${allFeatures.length} records with ${result.errors.length} validation errors.`, result.errors);
    }
  } catch (err) {
    console.error("[GeoMap] Critical dataset loading failure:", err);
    showNotification("Failed to load geological datasets.", "error");
    hideLoadingOverlay();
    return;
  }

  /**
   * Unified Canonical Feature Selection & Focus Pipeline
   */
  function selectFeatureAndFocus(featureOrId) {
    let targetFeature = null;

    if (typeof featureOrId === "string") {
      targetFeature = findFeatureById(allFeatures, featureOrId);
      if (!targetFeature) {
        console.warn(`[GeoMap] Feature ID '${featureOrId}' not found in canonical dataset.`);
        return;
      }
    } else if (featureOrId && typeof featureOrId === "object" && featureOrId.properties) {
      targetFeature = featureOrId;
    }

    if (!targetFeature) return;

    const featId = targetFeature.properties.id;

    // Highlight marker or vector layer element
    if (currentMarkerMap.has(featId)) {
      const marker = currentMarkerMap.get(featId);
      setMarkerHighlight(marker);
    }

    // Sync timeline active period
    if (timelineInstance) {
      timelineInstance.syncTimelineWithFeature(targetFeature);
    }

    // Coordinates pan and zoom
    const center = getFeatureCenter(targetFeature);
    if (center && mapInstance) {
      const [lng, lat] = center;
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        // MOBILE VIEWPORT: Pan & zoom smoothly first, then open detail panel drawer
        const openPanel = () => {
          detailPanel.openDetailPanel(targetFeature, currentLang);
          triggerMapInvalidateSize();
        };

        const view = mapInstance.getView();
        view.animate({
          center: ol.proj.fromLonLat([lng, lat]),
          zoom: 8,
          duration: 600
        });

        setTimeout(openPanel, 750);
      } else {
        // DESKTOP / LAPTOP LAYOUT: Open detail panel immediately & animate camera simultaneously
        detailPanel.openDetailPanel(targetFeature, currentLang);
        triggerMapInvalidateSize();

        const easingFunc = (typeof ol.easing === "object" && typeof ol.easing.easeInOut === "function")
          ? ol.easing.easeInOut
          : (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

        mapInstance.getView().animate({
          center: ol.proj.fromLonLat([lng, lat]),
          zoom: 9,
          duration: 800,
          easing: easingFunc
        });
      }
    } else {
      // Fallback for non-point features
      detailPanel.openDetailPanel(targetFeature, currentLang);
      triggerMapInvalidateSize();
    }
  }

  // 5. Initialize Geological Time & Earth History Timeline (Phase 3)
  timelineInstance = initTimeline(
    allFeatures,
    // Callback 1: Timeline -> Map Selection (uses shared canonical selection pipeline)
    (featureId) => {
      selectFeatureAndFocus(featureId);
    },
    // Callback 2: Timeline Period Filter -> Period Explorer Sync
    (periodKey) => {
      if (filterPanelInstance && typeof filterPanelInstance.syncPeriodSelection === "function") {
        filterPanelInstance.syncPeriodSelection(periodKey);
      }
      currentFilterState.period = periodKey;
      applyFiltersAndRender();
    }
  );

  // 6. Initialize Filter Panel & Explorers
  filterPanelInstance = initFilterPanel(allFeatures, (newFilterState) => {
    currentFilterState = newFilterState;

    // Sync timeline active period selection if user updated Period select box
    if (timelineInstance && newFilterState.period) {
      if (newFilterState.period === "all") {
        timelineInstance.deselectPeriod();
      } else {
        timelineInstance.selectPeriod(newFilterState.period);
      }
    }

    applyFiltersAndRender();
  });

  // 7. Initialize Search Bar with Autocomplete Suggestions & Direct Marker Focus
  searchBarInstance = initSearchBar(
    "search-input",
    "search-clear",
    (newQuery) => {
      searchSearchQuery = newQuery;
      applyFiltersAndRender();
    },
    () => allFeatures,
    (selectedFeature) => {
      selectFeatureAndFocus(selectedFeature);
    }
  );

  function triggerMapInvalidateSize() {
    if (mapInstance && typeof mapInstance.updateSize === "function") {
      mapInstance.updateSize();
    }
  }

  // 8. Filter Application & Marker Rendering Pipeline
  function applyFiltersAndRender() {
    let filtered = filterByDomainAndType(allFeatures, currentFilterState);
    filtered = filterBySearchQuery(filtered, searchSearchQuery, currentLang);

    if (filterPanelInstance) {
      filterPanelInstance.updateResultBadgeCount(filtered.length);
    }

    if (filtered.length === 0) {
      showEmptyState(t("empty_state_message", {}, currentLang));
    } else {
      hideEmptyState();
    }

    if (currentMarkerGroup && typeof currentMarkerGroup.remove === "function") {
      currentMarkerGroup.remove();
    }

    const result = renderMarkers(mapInstance, filtered, (feature, marker) => {
      selectFeatureAndFocus(feature);
    });

    currentMarkerGroup = result.markerGroup;
    currentMarkerMap = result.markerMap;
  }

  // 9. Language Switcher Synchronization
  function syncLanguageUI(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;

    // Update Language Toggle Button (Shows the other language as switch target)
    if (btnLangToggle) {
      const nextLang = lang === "en" ? "id" : "en";
      const badge = document.getElementById("lang-code-badge");
      const label = document.getElementById("lang-text-label");

      if (badge) badge.textContent = nextLang.toUpperCase();
      if (label) label.textContent = nextLang === "id" ? "Bahasa Indonesia" : "English";

      btnLangToggle.setAttribute("aria-label", t("lang_toggle_aria", {}, lang));
    }

    // Header & Tagline
    const taglineEl = document.getElementById("app-tagline");
    if (taglineEl) taglineEl.textContent = t("app_tagline", {}, lang);

    // Scope Banner
    const scopeStrong = document.getElementById("scope-banner-strong");
    if (scopeStrong) scopeStrong.textContent = t("scope_banner_header", {}, lang);

    const scopeBody = document.getElementById("scope-banner-body");
    if (scopeBody) {
      scopeBody.innerHTML = t("scope_banner_body", {}, lang);
    }

    const scopeToggleBtn = document.getElementById("scope-toggle-btn");
    const scopeBanner = document.querySelector(".scope-statement-banner");
    if (scopeToggleBtn && scopeBanner) {
      const isExpanded = scopeBanner.classList.contains("expanded");
      scopeToggleBtn.innerHTML = isExpanded ? t("scope_toggle_less", {}, lang) : t("scope_toggle_more", {}, lang);
      scopeToggleBtn.setAttribute("aria-label", t("scope_toggle_aria", {}, lang));
    }

    // Legend Section
    const legendTitle = document.getElementById("legend-section-title");
    if (legendTitle) legendTitle.textContent = t("legend_title", {}, lang);

    const legVolcano = document.getElementById("legend-label-volcano");
    if (legVolcano) legVolcano.textContent = t("legend_volcano", {}, lang);

    const legPaleo = document.getElementById("legend-label-paleo");
    if (legPaleo) legPaleo.textContent = t("legend_paleo", {}, lang);

    const legSite = document.getElementById("legend-label-site");
    if (legSite) legSite.textContent = t("legend_site", {}, lang);

    const legHazard = document.getElementById("legend-label-hazard");
    if (legHazard) legHazard.textContent = t("legend_hazard", {}, lang);

    // Sidebar Footer
    const btnAboutText = document.getElementById("btn-about-text");
    if (btnAboutText) btnAboutText.textContent = t("btn_about_mission", {}, lang);

    const footerDisclaimer = document.getElementById("footer-disclaimer-text");
    if (footerDisclaimer) footerDisclaimer.textContent = t("footer_disclaimer", {}, lang);

    // About Modal
    const aboutTitle = document.getElementById("about-modal-title");
    if (aboutTitle) aboutTitle.textContent = t("about_modal_title", {}, lang);

    const aboutClose = document.getElementById("about-modal-close");
    if (aboutClose) aboutClose.setAttribute("aria-label", t("about_modal_close_aria", {}, lang));

    const missionHeading = document.getElementById("about-mission-heading");
    if (missionHeading) missionHeading.textContent = t("about_mission_title", {}, lang);

    const missionDesc = document.getElementById("about-mission-desc");
    if (missionDesc) missionDesc.textContent = t("about_mission_body", {}, lang);

    const visionHeading = document.getElementById("about-vision-heading");
    if (visionHeading) visionHeading.textContent = t("about_vision_title", {}, lang);

    const visionDesc = document.getElementById("about-vision-desc");
    if (visionDesc) visionDesc.textContent = t("about_vision_body", {}, lang);

    const goalsHeading = document.getElementById("about-goals-heading");
    if (goalsHeading) goalsHeading.textContent = t("about_goals_title", {}, lang);

    const goalsList = document.getElementById("about-goals-list");
    if (goalsList) {
      goalsList.innerHTML = `
        <li>${escapeHtml(t("about_goals_item_1", {}, lang))}</li>
        <li>${escapeHtml(t("about_goals_item_2", {}, lang))}</li>
        <li>${escapeHtml(t("about_goals_item_3", {}, lang))}</li>
        <li>${escapeHtml(t("about_goals_item_4", {}, lang))}</li>
        <li>${escapeHtml(t("about_goals_item_5", {}, lang))}</li>
      `;
    }

    const transHeading = document.getElementById("about-transparency-heading");
    if (transHeading) transHeading.textContent = t("about_transparency_title", {}, lang);

    const transLead = document.getElementById("about-transparency-lead");
    if (transLead) transLead.textContent = t("about_transparency_lead", {}, lang);

    const limitHeading = document.getElementById("about-limitations-heading");
    if (limitHeading) limitHeading.textContent = t("about_scope_limitations_title", {}, lang);

    const limitList = document.getElementById("about-limitations-list");
    if (limitList) {
      limitList.innerHTML = `
        <li>${t("about_limitations_item_1", {}, lang)}</li>
        <li>${t("about_limitations_item_2", {}, lang)}</li>
        <li>${t("about_limitations_item_3", {}, lang)}</li>
        <li>${t("about_limitations_item_4", {}, lang)}</li>
        <li>${t("about_limitations_item_5", {}, lang)}</li>
      `;
    }

    // Loading overlay text
    const loadingText = document.getElementById("loading-text");
    if (loadingText) loadingText.textContent = t("loading_text", {}, lang);

    // Update child components
    if (filterPanelInstance && typeof filterPanelInstance.updateLanguage === "function") {
      filterPanelInstance.updateLanguage(lang);
    }

    if (timelineInstance && typeof timelineInstance.updateLanguage === "function") {
      timelineInstance.updateLanguage(lang);
    }

    if (searchBarInstance && typeof searchBarInstance.updateLanguage === "function") {
      searchBarInstance.updateLanguage(lang);
    }

    if (detailPanel && typeof detailPanel.updateLanguage === "function") {
      detailPanel.updateLanguage(lang);
    }

    if (mapInstance && typeof mapInstance.updateLayerSwitcherLanguage === "function") {
      mapInstance.updateLayerSwitcherLanguage(lang);
    }

    if (aboutModal && aboutModal.classList.contains("open")) {
      renderTransparencySummary();
    }

    // Re-render empty state or markers with new language
    applyFiltersAndRender();
  }

  // Language Toggle Button Event Listener
  if (btnLangToggle) {
    btnLangToggle.addEventListener("click", () => {
      const nextLang = currentLang === "en" ? "id" : "en";
      setLanguage(nextLang);
      syncLanguageUI(nextLang);
    });
  }

  // Candidate Structures Synchronous Toggle Handler (Master / Sub-layer Sync)
  const candidateBox = document.querySelector(".candidate-layer-box");
  if (candidateBox) {
    candidateBox.addEventListener("click", (e) => {
      // Don't double toggle if click hit input directly
      if (e.target && e.target.tagName === "INPUT") return;
      if (filterPanelInstance && typeof filterPanelInstance.toggleCandidateFeatureTypes === "function") {
        filterPanelInstance.toggleCandidateFeatureTypes();
      }
    });
  }

  document.addEventListener("change", (e) => {
    if (e.target && (e.target.name === "ol-candidates-toggle" || e.target.id === "sidebar-candidates-toggle")) {
      if (filterPanelInstance && typeof filterPanelInstance.toggleCandidateFeatureTypes === "function") {
        filterPanelInstance.toggleCandidateFeatureTypes(e.target.checked);
      }
    }
  });

  // Mobile Scope Statement Disclaimer Toggle Handler
  const scopeToggleBtn = document.getElementById("scope-toggle-btn");
  const scopeBanner = document.querySelector(".scope-statement-banner");
  if (scopeToggleBtn && scopeBanner) {
    scopeToggleBtn.addEventListener("click", () => {
      const isExpanded = scopeBanner.classList.toggle("expanded");
      scopeToggleBtn.setAttribute("aria-expanded", isExpanded ? "true" : "false");
      scopeToggleBtn.innerHTML = isExpanded ? t("scope_toggle_less", {}, currentLang) : t("scope_toggle_more", {}, currentLang);
    });
  }

  // Initial language sync & initial render call
  syncLanguageUI(currentLang);

  // Hide Loading Screen
  hideLoadingOverlay();

  // Utility Functions
  function hideLoadingOverlay() {
    if (loadingOverlay) {
      loadingOverlay.classList.add("hidden");
      setTimeout(() => {
        loadingOverlay.style.display = "none";
      }, 300);
    }
  }

  function showEmptyState(message) {
    if (emptyStateEl) {
      emptyStateEl.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon">&#128065;</div>
          <h3>${escapeHtml(t("empty_state_title", {}, currentLang))}</h3>
          <p>${escapeHtml(message || t("empty_state_message", {}, currentLang))}</p>
          <button type="button" class="btn-reset-filters" id="btn-reset-filters">${escapeHtml(t("empty_state_reset_btn", {}, currentLang))}</button>
        </div>
      `;
      emptyStateEl.style.display = "flex";

      const resetBtn = document.getElementById("btn-reset-filters");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          const searchInput = document.getElementById("search-input");
          if (searchInput) {
            searchInput.value = "";
            searchSearchQuery = "";
          }

          if (timelineInstance && typeof timelineInstance.deselectPeriod === "function") {
            timelineInstance.deselectPeriod();
          }

          if (filterPanelInstance && typeof filterPanelInstance.resetAllFiltersUI === "function") {
            filterPanelInstance.resetAllFiltersUI();
          } else {
            applyFiltersAndRender();
          }
        });
      }
    }
  }

  function hideEmptyState() {
    if (emptyStateEl) {
      emptyStateEl.style.display = "none";
    }
  }

  function showNotification(msg, type = "info") {
    console.log(`[GeoMap Notification] (${type}): ${msg}`);
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
});
