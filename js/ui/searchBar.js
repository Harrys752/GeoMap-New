/**
 * Search Bar UI Component
 * Provides live text search filtering by entry name and feature-type label,
 * with live autocomplete suggestions and direct marker navigation.
 */

const FEATURE_TYPE_LABELS = {
  volcano: "Volcano",
  paleontology_site: "Paleontology",
  site: "Geology Site",
  historical_event: "Historical Hazard",
  tectonic_structure: "Tectonic Structure",
  geological_complex: "Geological Complex",
  volcanic_complex: "Volcanic Complex"
};

/**
 * Initializes search bar listener and autocomplete suggestions.
 * @param {string} inputId - DOM ID for search input element
 * @param {string} clearBtnId - DOM ID for clear button element
 * @param {function} onSearchChange - Callback function triggered on search query update
 * @param {function} [getFeatures] - Optional provider function returning all feature records for autocomplete
 * @param {function} [onSelectFeature] - Optional callback triggered when a suggestion is selected to focus map/marker
 */
export function initSearchBar(inputId = "search-input", clearBtnId = "search-clear", onSearchChange, getFeatures, onSelectFeature) {
  const inputEl = document.getElementById(inputId);
  const clearBtn = document.getElementById(clearBtnId);

  if (!inputEl) return;

  const wrapper = inputEl.closest(".search-input-wrapper") || inputEl.parentElement;

  // Create suggestions dropdown container if not present
  let dropdownEl = wrapper.querySelector(".search-suggestions-dropdown");
  if (!dropdownEl) {
    dropdownEl = document.createElement("div");
    dropdownEl.className = "search-suggestions-dropdown hidden";
    dropdownEl.id = "search-suggestions-dropdown";
    wrapper.appendChild(dropdownEl);
  }

  let selectedIndex = -1;
  let activeSuggestions = [];

  function updateClearButtonVisibility() {
    if (clearBtn) {
      clearBtn.style.display = inputEl.value.trim().length > 0 ? "block" : "none";
    }
  }

  function hideSuggestions() {
    dropdownEl.classList.add("hidden");
    dropdownEl.innerHTML = "";
    selectedIndex = -1;
    activeSuggestions = [];
  }

  function renderSuggestions(query) {
    if (!query || typeof getFeatures !== "function") {
      hideSuggestions();
      return;
    }

    const allFeats = getFeatures() || [];
    const q = query.trim().toLowerCase();
    if (!q) {
      hideSuggestions();
      return;
    }

    // Filter features matching query against name, feature_type, process, province, rock_type
    activeSuggestions = allFeats.filter(f => {
      const props = f.properties || {};
      const name = (props.name || "").toLowerCase();
      const type = (props.feature_type || "").replace(/_/g, " ").toLowerCase();
      const proc = (props.geological_process || "").toLowerCase();
      const prov = (props.location_province || "").toLowerCase();

      return name.includes(q) || type.includes(q) || proc.includes(q) || prov.includes(q);
    }).slice(0, 6); // Top 6 matches

    if (activeSuggestions.length === 0) {
      hideSuggestions();
      return;
    }

    selectedIndex = -1;
    dropdownEl.innerHTML = activeSuggestions.map((feat, idx) => {
      const props = feat.properties || {};
      const name = props.name || "Unnamed Feature";
      const typeKey = props.feature_type || "site";
      const typeLabel = FEATURE_TYPE_LABELS[typeKey] || typeKey;
      const subLocation = props.location_province || props.geological_process || "Indonesia";

      return `
        <div class="suggestion-item" data-index="${idx}">
          <div class="suggestion-info">
            <span class="suggestion-name">${escapeHtml(name)}</span>
            <span class="suggestion-sub">${escapeHtml(subLocation)}</span>
          </div>
          <span class="suggestion-badge">${escapeHtml(typeLabel)}</span>
        </div>
      `;
    }).join("");

    dropdownEl.classList.remove("hidden");

    // Add click listeners to suggestion items
    dropdownEl.querySelectorAll(".suggestion-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(item.getAttribute("data-index"), 10);
        const selectedFeat = activeSuggestions[idx];
        if (selectedFeat) {
          selectSuggestion(selectedFeat);
        }
      });
    });
  }

  function selectSuggestion(feature) {
    const props = feature.properties || {};
    const name = props.name || "";
    inputEl.value = name;
    updateClearButtonVisibility();
    hideSuggestions();

    if (typeof onSearchChange === "function") {
      onSearchChange(name.toLowerCase());
    }

    if (typeof onSelectFeature === "function") {
      onSelectFeature(feature);
    }
  }

  inputEl.addEventListener("input", () => {
    const q = inputEl.value;
    updateClearButtonVisibility();
    if (typeof onSearchChange === "function") {
      onSearchChange(q.trim().toLowerCase());
    }
    renderSuggestions(q);
  });

  inputEl.addEventListener("keydown", (e) => {
    if (dropdownEl.classList.contains("hidden") || activeSuggestions.length === 0) {
      if (e.key === "Enter" && inputEl.value.trim()) {
        hideSuggestions();
      }
      return;
    }

    const items = dropdownEl.querySelectorAll(".suggestion-item");

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % activeSuggestions.length;
      updateKeyboardSelection(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + activeSuggestions.length) % activeSuggestions.length;
      updateKeyboardSelection(items);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < activeSuggestions.length) {
        selectSuggestion(activeSuggestions[selectedIndex]);
      } else if (activeSuggestions.length > 0) {
        selectSuggestion(activeSuggestions[0]);
      }
    } else if (e.key === "Escape") {
      hideSuggestions();
    }
  });

  function updateKeyboardSelection(items) {
    items.forEach((item, idx) => {
      if (idx === selectedIndex) {
        item.classList.add("selected");
        item.scrollIntoView({ block: "nearest" });
      } else {
        item.classList.remove("selected");
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      inputEl.value = "";
      updateClearButtonVisibility();
      hideSuggestions();
      inputEl.focus();
      if (typeof onSearchChange === "function") {
        onSearchChange("");
      }
    });
  }

  // Dismiss dropdown on click outside
  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) {
      hideSuggestions();
    }
  });

  updateClearButtonVisibility();
}

/**
 * Filters feature records by query string against name, feature_type, and description.
 * @param {object[]} features - Array of feature records
 * @param {string} query - Lowercase search query string
 * @returns {object[]} Filtered features
 */
export function filterBySearchQuery(features, query) {
  if (!query) return features;
  const q = String(query).trim().toLowerCase();
  if (!q) return features;

  return features.filter(f => {
    const props = f.properties || {};
    const nameStr = (props.name || "").toLowerCase();
    const typeStr = (props.feature_type || "").replace(/_/g, " ").toLowerCase();
    const descStr = (props.description || "").toLowerCase();
    const provStr = (props.location_province || "").toLowerCase();

    return nameStr.includes(q) || typeStr.includes(q) || descStr.includes(q) || provStr.includes(q);
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
