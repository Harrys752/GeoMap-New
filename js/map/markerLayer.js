/**
 * Marker Layer Module
 * Creates domain and feature-type aware custom DOM Overlay pins combining distinct color, SVG symbols,
 * accessibility labels, and active marker highlight tracking.
 */

import { domains } from "../core/domainRegistry.js";

let activeHighlightedMarker = null;

/**
 * Generates custom SVG icon DOM element based on feature type and domain.
 * @param {string} domain - "geology" or "hazard"
 * @param {string} featureType - feature classification
 * @param {string} name - location title
 * @returns {{ element: HTMLElement }} Custom marker DOM element
 */
export function createCustomIcon(domain, featureType, name = "") {
  const domainConfig = domains[domain] || domains.geology;
  const color = domainConfig.color;

  let svgShape = "";
  let iconClass = `marker-pin marker-${domain}`;

  switch (featureType) {
    case "volcano":
      svgShape = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 22h20L12 2z"/><path d="M12 7v5"/></svg>`;
      break;
    case "paleontology_site":
      svgShape = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.5 2.5 0 0 1 2.5 2.5c0 .9-.5 1.7-1.2 2.1l-10 10A2.5 2.5 0 1 1 5 14l10-10c.4-.7 1.2-1 2 1z"/></svg>`;
      break;
    case "site":
      svgShape = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l9 10-9 10-9-10 9-10z"/></svg>`;
      break;
    case "historical_event":
      svgShape = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/></svg>`;
      break;
    default:
      svgShape = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="6"/></svg>`;
      break;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "custom-marker-wrapper custom-ol-marker";
  wrapper.title = name;
  wrapper.innerHTML = `
    <div class="${iconClass}" style="--pin-color: ${color};" role="button" tabindex="0" aria-label="${name} (${domain} - ${featureType})">
      <div class="marker-symbol">${svgShape}</div>
    </div>
  `;

  return { element: wrapper };
}

/**
 * Highlights a specific marker element while clearing previous highlights.
 * @param {ol.Overlay|HTMLElement} marker - OpenLayers Overlay instance or HTMLElement
 */
export function setMarkerHighlight(marker) {
  clearMarkerHighlight();

  if (marker) {
    activeHighlightedMarker = marker;
    let element = null;

    if (typeof marker.getElement === "function") {
      element = marker.getElement();
    } else if (marker instanceof HTMLElement) {
      element = marker;
    }

    if (element) {
      const pinContainer = element.querySelector(".marker-pin") || (element.classList.contains("marker-pin") ? element : null);
      if (pinContainer) {
        pinContainer.classList.add("marker-highlight");
      }
    }
  }
}

/**
 * Clears active marker highlight styling.
 */
export function clearMarkerHighlight() {
  if (activeHighlightedMarker) {
    let prevElement = null;
    if (typeof activeHighlightedMarker.getElement === "function") {
      prevElement = activeHighlightedMarker.getElement();
    } else if (activeHighlightedMarker instanceof HTMLElement) {
      prevElement = activeHighlightedMarker;
    }

    if (prevElement) {
      const pinContainer = prevElement.querySelector(".marker-pin") || (prevElement.classList.contains("marker-pin") ? prevElement : null);
      if (pinContainer) {
        pinContainer.classList.remove("marker-highlight");
      }
    }
    activeHighlightedMarker = null;
  }
}

/**
 * Creates and renders OpenLayers Overlays for validated GeoJSON features onto the map.
 * @param {ol.Map} map - OpenLayers map instance
 * @param {object[]} features - Array of validated GeoJSON feature objects
 * @param {function} onMarkerSelect - Callback when marker is clicked (passes feature, overlay)
 * @returns {{ markerGroup: { remove: function }, markerMap: Map<string, ol.Overlay> }}
 */
export function renderMarkers(map, features, onMarkerSelect) {
  clearMarkerHighlight();
  const overlaysList = [];
  const markerMap = new Map();

  for (const feature of features) {
    if (!feature || !feature.geometry || !Array.isArray(feature.geometry.coordinates)) continue;

    const [lng, lat] = feature.geometry.coordinates;
    const { domain, feature_type, name, id } = feature.properties;

    const { element } = createCustomIcon(domain, feature_type, name);

    const overlay = new ol.Overlay({
      element: element,
      position: ol.proj.fromLonLat([lng, lat]),
      positioning: "bottom-center",
      stopEvent: true
    });

    element.addEventListener("click", (e) => {
      e.stopPropagation();
      setMarkerHighlight(overlay);
      if (typeof onMarkerSelect === "function") {
        onMarkerSelect(feature, overlay);
      }
    });

    element.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        setMarkerHighlight(overlay);
        if (typeof onMarkerSelect === "function") {
          onMarkerSelect(feature, overlay);
        }
      }
    });

    map.addOverlay(overlay);
    overlaysList.push(overlay);
    markerMap.set(id, overlay);
  }

  const markerGroup = {
    overlays: overlaysList,
    remove: () => {
      overlaysList.forEach(ov => {
        try {
          map.removeOverlay(ov);
        } catch (err) {
          // Ignore removal errors
        }
      });
    }
  };

  return { markerGroup, markerMap };
}
