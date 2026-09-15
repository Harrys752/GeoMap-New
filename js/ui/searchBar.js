/**
 * Search Bar UI Component
 * Provides live text search filtering by entry name and feature-type label.
 */

/**
 * Initializes search bar listener.
 * @param {string} inputId - DOM ID for search input element
 * @param {string} clearBtnId - DOM ID for clear button element
 * @param {function} onSearchChange - Callback function triggered on search query update
 */
export function initSearchBar(inputId = "search-input", clearBtnId = "search-clear", onSearchChange) {
  const inputEl = document.getElementById(inputId);
  const clearBtn = document.getElementById(clearBtnId);

  if (!inputEl) return;

  function updateClearButtonVisibility() {
    if (clearBtn) {
      clearBtn.style.display = inputEl.value.trim().length > 0 ? "block" : "none";
    }
  }

  inputEl.addEventListener("input", () => {
    updateClearButtonVisibility();
    if (typeof onSearchChange === "function") {
      onSearchChange(inputEl.value.trim().toLowerCase());
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      inputEl.value = "";
      updateClearButtonVisibility();
      inputEl.focus();
      if (typeof onSearchChange === "function") {
        onSearchChange("");
      }
    });
  }

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

  return features.filter(f => {
    const props = f.properties || {};
    const nameStr = (props.name || "").toLowerCase();
    const typeStr = (props.feature_type || "").replace("_", " ").toLowerCase();
    const descStr = (props.description || "").toLowerCase();

    return nameStr.includes(query) || typeStr.includes(query) || descStr.includes(query);
  });
}
