/**
 * Search Bar Component with Autocomplete Suggestions & Marker Selection Focus
 * Supports full bilingual display (English & Bahasa Indonesia).
 */

import { formatFeatureTypeLabel } from "../data/adapters/geologyAdapter.js";
import { getLanguage, t, getLocalizedFeature } from "../i18n/i18n.js";

/**
 * Initializes the Search Input component with live query callback and dropdown suggestions.
 * @param {string} inputId - DOM ID for text input
 * @param {string} clearBtnId - DOM ID for clear button
 * @param {function} onSearchChange - Callback invoked with search query string
 * @param {function} getAllFeatures - Function returning the complete active array of dataset features
 * @param {function} onSelectFeature - Callback when user clicks/selects an autocomplete suggestion
 */
export function initSearchBar(inputId = "search-input", clearBtnId = "search-clear", onSearchChange, getAllFeatures, onSelectFeature) {
  const input = document.getElementById(inputId);
  const clearBtn = document.getElementById(clearBtnId);
  if (!input) return null;

  let currentLang = getLanguage();

  // Create suggestions dropdown container
  const wrapper = input.parentElement;
  let suggestionsBox = wrapper.querySelector(".search-suggestions-dropdown, .search-suggestions-box");
  if (!suggestionsBox) {
    suggestionsBox = document.createElement("div");
    suggestionsBox.className = "search-suggestions-dropdown search-suggestions-box";
    suggestionsBox.style.display = "none";
    wrapper.appendChild(suggestionsBox);
  }

  function updateClearButtonVisibility() {
    if (clearBtn) {
      clearBtn.style.display = input.value.trim().length > 0 ? "flex" : "none";
    }
  }

  function hideSuggestions() {
    suggestionsBox.style.display = "none";
    suggestionsBox.innerHTML = "";
  }

  function renderSuggestions(matches) {
    if (!matches || matches.length === 0) {
      suggestionsBox.innerHTML = `<div class="suggestion-item no-match">${escapeHtml(t("search_no_suggestions", {}, currentLang))}</div>`;
      suggestionsBox.style.display = "flex";
      return;
    }

    suggestionsBox.innerHTML = matches.map(feature => {
      const locFeat = getLocalizedFeature(feature, currentLang);
      const props = locFeat.properties || {};
      const name = props.name || "Unnamed";
      const type = formatFeatureTypeLabel(props.feature_type, currentLang);
      const province = props.location_province ? ` • ${props.location_province}` : "";
      const isCandidate = props.data_status === "candidate";
      const domainClass = isCandidate ? "suggestion-candidate" : (props.domain === "hazard" ? "suggestion-domain-hazard" : "suggestion-domain-geology");

      let badgeLabel = props.domain === "hazard" ? t("domain_label_hazard", {}, currentLang) : t("domain_label_geology", {}, currentLang);
      if (isCandidate) {
        badgeLabel = currentLang === "id" ? "Kandidat" : "Candidate";
      }

      return `
        <div class="suggestion-item" data-feature-id="${escapeHtml(props.id)}">
          <div class="suggestion-info">
            <div class="suggestion-name">${escapeHtml(name)}</div>
            <div class="suggestion-sub ${domainClass}">${escapeHtml(type)}${escapeHtml(province)}</div>
          </div>
          <span class="suggestion-badge ${domainClass}">${escapeHtml(badgeLabel)}</span>
        </div>
      `;
    }).join("");

    suggestionsBox.style.display = "flex";

    // Attach click listeners to suggestions
    const items = suggestionsBox.querySelectorAll(".suggestion-item[data-feature-id]");
    items.forEach(item => {
      item.addEventListener("click", () => {
        const featureId = item.getAttribute("data-feature-id");
        hideSuggestions();

        const allFeats = typeof getAllFeatures === "function" ? getAllFeatures() : [];
        const found = allFeats.find(f => f.properties && f.properties.id === featureId);

        if (found) {
          const locFound = getLocalizedFeature(found, currentLang);
          input.value = locFound.properties.name || "";
          updateClearButtonVisibility();
          if (typeof onSearchChange === "function") {
            onSearchChange(locFound.properties.name || "");
          }
          if (typeof onSelectFeature === "function") {
            onSelectFeature(found);
          }
        }
      });
    });
  }

  function handleInputQuery() {
    const rawQuery = input.value;
    const q = rawQuery.trim().toLowerCase();
    updateClearButtonVisibility();

    if (typeof onSearchChange === "function") {
      onSearchChange(rawQuery);
    }

    if (q.length < 1) {
      hideSuggestions();
      return;
    }

    const allFeats = typeof getAllFeatures === "function" ? getAllFeatures() : [];
    const matches = allFeats.filter(f => {
      const locFeat = getLocalizedFeature(f, currentLang);
      const props = locFeat.properties || {};
      const nameStr = (props.name || "").toLowerCase();
      const typeStr = (props.feature_type || "").replace(/_/g, " ").toLowerCase();
      const descStr = (props.description || "").toLowerCase();
      const provStr = (props.location_province || "").toLowerCase();

      return nameStr.includes(q) || typeStr.includes(q) || descStr.includes(q) || provStr.includes(q);
    }).slice(0, 8);

    renderSuggestions(matches);
  }

  input.addEventListener("input", handleInputQuery);

  input.addEventListener("focus", () => {
    if (input.value.trim().length >= 1) {
      handleInputQuery();
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      input.value = "";
      updateClearButtonVisibility();
      hideSuggestions();
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

  function updateLanguage(newLang) {
    currentLang = newLang;
    input.setAttribute("placeholder", t("search_placeholder", {}, currentLang));
    input.setAttribute("aria-label", t("search_input_aria", {}, currentLang));
    if (clearBtn) {
      clearBtn.setAttribute("aria-label", t("search_clear_aria", {}, currentLang));
    }
    const searchSectionLabel = document.querySelector(".search-section .section-label");
    if (searchSectionLabel) {
      searchSectionLabel.textContent = t("search_label", {}, currentLang);
    }

    // Re-render suggestions if currently visible
    if (suggestionsBox.style.display !== "none" && input.value.trim().length >= 1) {
      handleInputQuery();
    }
  }

  // Set initial placeholders
  updateLanguage(currentLang);
  updateClearButtonVisibility();

  return {
    updateLanguage
  };
}

/**
 * Filters feature records by query string against name, feature_type, and description.
 * @param {object[]} features - Array of feature records
 * @param {string} query - Lowercase search query string
 * @param {string} [lang=null] - Target language
 * @returns {object[]} Filtered features
 */
export function filterBySearchQuery(features, query, lang = null) {
  if (!query) return features;
  const q = String(query).trim().toLowerCase();
  if (!q) return features;
  const activeLang = lang || getLanguage();

  return features.filter(f => {
    const locFeat = getLocalizedFeature(f, activeLang);
    const props = locFeat.properties || {};
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
