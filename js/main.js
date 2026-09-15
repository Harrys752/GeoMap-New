/**
 * GeoMap Indonesia 2.0 Application Main Orchestrator Module
 */

import { initMap } from "./map/initMap.js";
import { renderMarkers, setMarkerHighlight, clearMarkerHighlight } from "./map/markerLayer.js";
import { loadAllDatasets } from "./data/loadData.js";
import { initSearchBar, filterBySearchQuery } from "./ui/searchBar.js";
import { initFilterPanel, filterByDomainAndType } from "./ui/filterPanel.js";
import { initDetailPanel } from "./ui/detailPanel.js";

document.addEventListener("DOMContentLoaded", async () => {
  const loadingOverlay = document.getElementById("loading-overlay");
  const emptyStateEl = document.getElementById("empty-state");
  const aboutModal = document.getElementById("about-modal");
  const btnOpenAbout = document.getElementById("btn-open-about");
  const btnCloseAbout = document.getElementById("about-modal-close");

  let mapInstance = null;
  let allFeatures = [];
  let currentMarkerGroup = null;
  let searchSearchQuery = "";
  let currentFilterState = { domain: "all", featureTypes: new Set(), process: "all", period: "all" };

  // 1. Initialize Map
  try {
    mapInstance = initMap("map");
  } catch (err) {
    console.error("[GeoMap] Failed to initialize Leaflet map:", err);
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

  function openAboutModal() {
    if (aboutModal) {
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

  // 5. Initialize Filter Panel & Explorers
  const filterPanel = initFilterPanel(allFeatures, (newFilterState) => {
    currentFilterState = newFilterState;
    applyFiltersAndRender();
  });

  // 6. Initialize Search Bar
  initSearchBar("search-input", "search-clear", (newQuery) => {
    searchSearchQuery = newQuery;
    applyFiltersAndRender();
  });

  // 7. Filter Application & Marker Rendering Pipeline
  function applyFiltersAndRender() {
    // Filter by domain, feature type, process, and period
    let filtered = filterByDomainAndType(allFeatures, currentFilterState);

    // Filter by text search query
    filtered = filterBySearchQuery(filtered, searchSearchQuery);

    // Update Result Count Badge
    if (filterPanel) {
      filterPanel.updateResultBadgeCount(filtered.length);
    }

    // Toggle Empty State UI
    if (filtered.length === 0) {
      showEmptyState("No geological sites or hazard events match your active search and filter criteria.");
    } else {
      hideEmptyState();
    }

    // Remove existing markers
    if (currentMarkerGroup) {
      mapInstance.removeLayer(currentMarkerGroup);
    }

    // Render new marker layer
    const result = renderMarkers(mapInstance, filtered, (feature, marker) => {
      detailPanel.openDetailPanel(feature);
      setMarkerHighlight(marker);

      if (feature && feature.geometry && feature.geometry.coordinates) {
        const [lng, lat] = feature.geometry.coordinates;
        mapInstance.flyTo([lat, lng], 9, {
          animate: true,
          duration: 0.8
        });
      }
    });

    currentMarkerGroup = result.markerGroup;
  }

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
