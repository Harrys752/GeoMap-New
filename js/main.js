/**
 * GeoMap Indonesia 2.0 Application Main Orchestrator Module
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

document.addEventListener("DOMContentLoaded", async () => {
  const loadingOverlay = document.getElementById("loading-overlay");
  const emptyStateEl = document.getElementById("empty-state");
  const aboutModal = document.getElementById("about-modal");
  const btnOpenAbout = document.getElementById("btn-open-about");
  const btnCloseAbout = document.getElementById("about-modal-close");

  let mapInstance = null;
  let allFeatures = [];
  let currentMarkerGroup = null;
  let currentMarkerMap = new Map();
  let searchSearchQuery = "";
  let currentFilterState = { domain: "all", featureTypes: new Set(), process: "all", period: "all", evidenceType: "all", confidenceStatus: "all" };
  let timelineInstance = null;

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
          <span class="transparency-total-badge">Canonical Dataset Total: ${total} records</span>
        </div>
        <div class="transparency-status-grid">
          ${activeStatuses.map(st => {
            const count = statusCounts[st];
            const pct = Math.round((count / total) * 100);
            const meta = getConfidenceMetadata(st);
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

  // 4. Fetch & Validate Static GeoJSON Datasets
  try {
    const dataResult = await loadAllDatasets([
      "data/geology/sites.demo.geojson",
      "data/hazard/historical-events.demo.geojson"
    ]);

    allFeatures = dataResult.features;

    if (dataResult.rejectedCount > 0) {
      console.warn(`[GeoMap Loader] ${dataResult.rejectedCount} record(s) rejected due to validation errors.`);
    }

    if (allFeatures.length === 0) {
      showEmptyState("No valid geological or geohazard records could be loaded.");
      hideLoadingOverlay();
      return;
    }
  } catch (err) {
    console.error("[GeoMap] Critical error loading datasets:", err);
    showNotification("Error loading geological datasets.", "error");
    hideLoadingOverlay();
    return;
  }

  /**
   * Shared Canonical Feature Selection & Navigation Pipeline
   * Converges both sidebar entry clicks and direct map marker clicks onto one consistent sequence:
   * 1. Resolve target feature using findFeatureById
   * 2. Open detail panel (renders detail data + Phase 7 Data Confidence Card)
   * 3. Highlight marker if available on current map view
   * 4. Sync timeline period node selection if available
   * 5. Center & fly map to feature coordinates
   * 
   * @param {object|string} featureOrId - GeoJSON feature object or feature ID / alias string
   */
  function selectFeatureAndFocus(featureOrId) {
    if (!featureOrId) return;

    let targetFeature = null;
    if (typeof featureOrId === "string") {
      targetFeature = findFeatureById(allFeatures, featureOrId);
    } else if (typeof featureOrId === "object" && featureOrId.properties) {
      targetFeature = findFeatureById(allFeatures, featureOrId.properties.id) || featureOrId;
    }

    if (!targetFeature || !targetFeature.properties) {
      console.warn("[GeoMap Selection] Target feature could not be resolved:", featureOrId);
      return;
    }

    const canonicalId = targetFeature.properties.id;
    const isMobile = (typeof window !== "undefined" && typeof window.matchMedia === "function")
      ? window.matchMedia("(max-width: 768px)").matches
      : false;

    // 1. Find and highlight marker if available on current map view
    const marker = currentMarkerMap.get(canonicalId);
    if (marker) {
      setMarkerHighlight(marker);
    }

    // 2. Sync timeline period node selection if available
    if (timelineInstance) {
      timelineInstance.syncTimelineWithFeature(targetFeature);
    }

    // 3. Zoom & Detail Panel Sequencing based on Device Viewport
    const centerCoords = getFeatureCenter(targetFeature);
    if (centerCoords && Array.isArray(centerCoords)) {
      const [lng, lat] = centerCoords;

      if (isMobile) {
        // MOBILE DEVICE SPECIFIC: Auto-zoom FIRST, then open detail panel after camera movement completes
        let hasOpened = false;
        const openPanel = () => {
          if (hasOpened) return;
          hasOpened = true;
          detailPanel.openDetailPanel(targetFeature);
          triggerMapInvalidateSize();
        };

        const easingFunc = (typeof ol.easing === "object" && typeof ol.easing.easeInOut === "function")
          ? ol.easing.easeInOut
          : (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

        mapInstance.getView().animate(
          {
            center: ol.proj.fromLonLat([lng, lat]),
            zoom: 9,
            duration: 700,
            easing: easingFunc
          },
          (completed) => {
            openPanel();
          }
        );

        // Fallback timer to ensure detail panel opens even if view animation callback is delayed
        setTimeout(openPanel, 750);
      } else {
        // DESKTOP / LAPTOP LAYOUT: Open detail panel immediately & animate camera simultaneously
        detailPanel.openDetailPanel(targetFeature);
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
      detailPanel.openDetailPanel(targetFeature);
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
      const periodSelect = document.getElementById("period-filter-select");
      if (periodSelect) {
        periodSelect.value = periodKey;
      }
      currentFilterState.period = periodKey;
      applyFiltersAndRender();
    }
  );

  // 6. Initialize Filter Panel & Explorers
  const filterPanel = initFilterPanel(allFeatures, (newFilterState) => {
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
  initSearchBar(
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
    filtered = filterBySearchQuery(filtered, searchSearchQuery);

    if (filterPanel) {
      filterPanel.updateResultBadgeCount(filtered.length);
    }

    if (filtered.length === 0) {
      showEmptyState("No geological sites or hazard events match your active search and filter criteria.");
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


  // Explicitly reset candidate checkboxes on application startup
  const resetCandidateCheckboxes = () => {
    const sideChk = document.getElementById("sidebar-candidates-toggle");
    if (sideChk) sideChk.checked = false;
    const mapChk = document.querySelector('input[name="ol-candidates-toggle"]');
    if (mapChk) mapChk.checked = false;
  };
  resetCandidateCheckboxes();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", resetCandidateCheckboxes);
  }

  // Candidate Layer Card Full Click Target Handler
  const candidateBox = document.querySelector(".candidate-layer-box");
  if (candidateBox) {
    candidateBox.addEventListener("click", (e) => {
      // Don't double toggle if click hit input directly
      if (e.target && e.target.tagName === "INPUT") return;
      const sideChk = document.getElementById("sidebar-candidates-toggle");
      if (sideChk) {
        sideChk.checked = !sideChk.checked;
        handleCandidateToggle(sideChk.checked);
      }
    });
  }

  // Candidate Structures Synchronous Toggle Handler
  let candidateFeatures = [];

  // Pre-load candidate dataset in background so user toggle is 100% synchronous
  loadAllDatasets(["data/geology/candidates.demo.geojson"]).then(res => {
    candidateFeatures = res.features || [];
    resetCandidateCheckboxes();
  });

  function handleCandidateToggle(isChecked) {
    const mapChk = document.querySelector('input[name="ol-candidates-toggle"]');
    const sideChk = document.getElementById("sidebar-candidates-toggle");
    if (mapChk) mapChk.checked = isChecked;
    if (sideChk) sideChk.checked = isChecked;

    if (isChecked) {
      candidateFeatures.forEach(cf => {
        if (!allFeatures.some(f => f.properties && f.properties.id === cf.properties.id)) {
          allFeatures.push(cf);
        }
      });
    } else {
      const candidateIds = new Set(candidateFeatures.map(cf => cf.properties.id));
      allFeatures = allFeatures.filter(f => !candidateIds.has(f.properties.id));
    }

    // Update existing filterPanel dataset dynamically without re-initializing event listeners
    if (filterPanel && typeof filterPanel.updateDataset === "function") {
      filterPanel.updateDataset(allFeatures);
    } else {
      applyFiltersAndRender();
    }
  }

  document.addEventListener("change", (e) => {
    if (e.target && (e.target.name === "ol-candidates-toggle" || e.target.id === "sidebar-candidates-toggle")) {
      handleCandidateToggle(e.target.checked);
    }
  });

  // Initial render call
  applyFiltersAndRender();

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
          <h3>No Results Found</h3>
          <p>${escapeHtml(message)}</p>
          <button type="button" class="btn-reset-filters" id="btn-reset-filters">Reset All Filters</button>
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

          if (filterPanel && typeof filterPanel.resetAllFiltersUI === "function") {
            filterPanel.resetAllFiltersUI();
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
