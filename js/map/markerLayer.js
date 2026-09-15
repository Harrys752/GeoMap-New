/**
 * Marker Layer Module
 * Creates domain and feature-type aware custom DivIcon pins combining distinct color, SVG symbols,
 * accessibility labels, and active marker highlight tracking.
 */

import { domains } from "../core/domainRegistry.js";

let activeHighlightedMarker = null;

/**
 * Generates custom SVG icon markup based on feature type and domain.
 * @param {string} domain - "geology" or "hazard"
 * @param {string} featureType - feature classification
 * @returns {L.DivIcon} Leaflet DivIcon
 */
export function createCustomIcon(domain, featureType) {
  const domainConfig = domains[domain] || domains.geology;
  const color = domainConfig.color;

  let svgShape = "";
  let iconClass = `marker-pin marker-${domain}`;

  switch (featureType) {
    case "volcano":
      svgShape = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 22h20L12 2z"/><path d="M12 7v5"/></svg>`;
      break;
    case "paleontology_site":
      svgShape = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.5 2.5 0 0 1 2.5 2.5c0 .9-.5 1.7-1.2 2.1l-10 10A2.5 2.5 0 1 1 5 14l10-10c.4-.7 1.2-1 2-1z"/></svg>`;
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

  const html = `
    <div class="${iconClass}" style="--pin-color: ${color};" role="img" aria-label="${domain} - ${featureType}">
      <div class="marker-symbol">${svgShape}</div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: "custom-leaflet-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
}

/**
 * Highlights a specific Leaflet marker element while clearing previous highlights.
 * @param {L.Marker} marker - Leaflet marker instance
 */
export function setMarkerHighlight(marker) {
  clearMarkerHighlight();

  if (marker) {
    activeHighlightedMarker = marker;
    const element = marker.getElement();
    if (element) {
      const pinContainer = element.querySelector(".marker-pin");
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
    const prevElement = activeHighlightedMarker.getElement();
    if (prevElement) {
      const pinContainer = prevElement.querySelector(".marker-pin");
      if (pinContainer) {
        pinContainer.classList.remove("marker-highlight");
      }
    }
    activeHighlightedMarker = null;
  }
}

/**
 * Creates and renders markers for valid GeoJSON features onto the map layer group.
 * @param {L.Map} map - Leaflet map instance
 * @param {object[]} features - Array of validated GeoJSON feature objects
 * @param {function} onMarkerSelect - Callback when marker is clicked (passes feature, marker)
 * @returns {{ markerGroup: L.LayerGroup, markerMap: Map<string, L.Marker> }}
 */
export function renderMarkers(map, features, onMarkerSelect) {
  clearMarkerHighlight();
  const markerGroup = L.layerGroup();
  const markerMap = new Map();

  for (const feature of features) {
    const [lng, lat] = feature.geometry.coordinates;
    const { domain, feature_type, name } = feature.properties;

    const icon = createCustomIcon(domain, feature_type);
    const marker = L.marker([lat, lng], { icon, title: name });

    marker.on("click", () => {
      setMarkerHighlight(marker);
      if (typeof onMarkerSelect === "function") {
        onMarkerSelect(feature, marker);
      }
    });

    marker.addTo(markerGroup);
    markerMap.set(feature.properties.id, marker);
  }

  markerGroup.addTo(map);
  return { markerGroup, markerMap };
}
