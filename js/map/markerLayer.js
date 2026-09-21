/**
 * Marker & Vector Layer Module
 * Renders Point features using custom DOM Overlay pins and LineString / Polygon features
 * using OpenLayers Vector Layers with interactive selection hit detection.
 */

import { domains } from "../core/domainRegistry.js";

let activeHighlightedMarker = null;
let activeHighlightedVectorFeature = null;

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
 * Creates vector style for LineString and Polygon features.
 * Interface conventions only — not official cartographic symbology.
 */
function createVectorStyle(featureProps, isHighlighted = false) {
  if (typeof ol === "undefined" || !ol.style) return null;

  const structType = featureProps.structure_type || "";
  const featType = featureProps.feature_type || "";

  let strokeColor = "#ffa726";
  let strokeWidth = isHighlighted ? 6 : 3.5;
  let lineDash = undefined;
  let fillColor = "rgba(255, 167, 38, 0.2)";

  if (structType === "active_fault") {
    strokeColor = "#ff7043";
    lineDash = isHighlighted ? undefined : [8, 5];
  } else if (structType === "subduction_trench") {
    strokeColor = "#26c6da";
    strokeWidth = isHighlighted ? 7 : 4.5;
  } else if (featType === "geological_complex" || structType === "mélange") {
    strokeColor = "#81c784";
    fillColor = isHighlighted ? "rgba(129, 199, 132, 0.45)" : "rgba(76, 175, 80, 0.25)";
  }

  return new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: strokeColor,
      width: strokeWidth,
      lineDash: lineDash
    }),
    fill: new ol.style.Fill({
      color: fillColor
    })
  });
}

/**
 * Highlights a specific marker element or vector feature while clearing previous highlights.
 * @param {ol.Overlay|ol.Feature|HTMLElement} marker
 */
export function setMarkerHighlight(marker) {
  clearMarkerHighlight();

  if (!marker) return;

  // Handle OpenLayers Vector Feature (LineString / Polygon)
  if (typeof ol !== "undefined" && marker instanceof ol.Feature) {
    activeHighlightedVectorFeature = marker;
    const props = marker.get("featureProps") || {};
    marker.setStyle(createVectorStyle(props, true));
    return;
  }

  // Handle Overlay / HTML Element (Point)
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

/**
 * Clears active marker and vector feature highlight styling.
 */
export function clearMarkerHighlight() {
  if (activeHighlightedVectorFeature) {
    try {
      const props = activeHighlightedVectorFeature.get("featureProps") || {};
      activeHighlightedVectorFeature.setStyle(createVectorStyle(props, false));
    } catch (e) {
      // Ignore cleanup error
    }
    activeHighlightedVectorFeature = null;
  }

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
 * Calculates central coordinate [lng, lat] for any geometry (Point, LineString, Polygon).
 */
export function getFeatureCenter(feature) {
  if (!feature || !feature.geometry || !Array.isArray(feature.geometry.coordinates)) return null;

  const { type, coordinates } = feature.geometry;

  if (type === "Point") {
    return coordinates;
  }

  if (type === "LineString") {
    const midIdx = Math.floor(coordinates.length / 2);
    return coordinates[midIdx];
  }

  if (type === "Polygon") {
    const ring = coordinates[0] || [];
    let sumLng = 0, sumLat = 0;
    ring.forEach(([lng, lat]) => {
      sumLng += lng;
      sumLat += lat;
    });
    return ring.length > 0 ? [sumLng / ring.length, sumLat / ring.length] : null;
  }

  return null;
}

/**
 * Creates and renders OpenLayers Overlays for Point features and Vector Layers for LineString / Polygon features.
 * @param {ol.Map} map - OpenLayers map instance
 * @param {object[]} features - Array of validated GeoJSON feature objects
 * @param {function} onMarkerSelect - Callback when marker/vector feature is clicked
 * @returns {{ markerGroup: { remove: function }, markerMap: Map<string, ol.Overlay|ol.Feature> }}
 */
export function renderMarkers(map, features, onMarkerSelect) {
  clearMarkerHighlight();
  const overlaysList = [];
  const vectorFeaturesList = [];
  const markerMap = new Map();

  // Separate Point features vs LineString/Polygon vector features
  const pointFeatures = [];
  const vectorGeoFeatures = [];

  for (const feature of features) {
    if (!feature || !feature.geometry) continue;
    if (feature.geometry.type === "Point") {
      pointFeatures.push(feature);
    } else if (feature.geometry.type === "LineString" || feature.geometry.type === "Polygon") {
      vectorGeoFeatures.push(feature);
    }
  }

  // 1. Render Point Features using DOM Overlays
  for (const feature of pointFeatures) {
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

  // 2. Render LineString and Polygon Features using Vector Layer
  let vectorLayer = null;
  if (vectorGeoFeatures.length > 0 && typeof ol !== "undefined" && ol.layer && ol.layer.Vector) {
    const vectorSource = new ol.source.Vector();

    for (const feature of vectorGeoFeatures) {
      const { type, coordinates } = feature.geometry;
      const { id } = feature.properties;

      let olGeom = null;
      if (type === "LineString") {
        const transformedCoords = coordinates.map(pt => ol.proj.fromLonLat(pt));
        olGeom = new ol.geom.LineString(transformedCoords);
      } else if (type === "Polygon") {
        const transformedRings = coordinates.map(ring => ring.map(pt => ol.proj.fromLonLat(pt)));
        olGeom = new ol.geom.Polygon(transformedRings);
      }

      if (olGeom) {
        const olFeature = new ol.Feature({
          geometry: olGeom,
          geoJsonFeature: feature,
          featureProps: feature.properties
        });

        olFeature.setStyle(createVectorStyle(feature.properties, false));
        vectorSource.addFeature(olFeature);
        vectorFeaturesList.push(olFeature);
        markerMap.set(id, olFeature);
      }
    }

    vectorLayer = new ol.layer.Vector({
      source: vectorSource,
      zIndex: 10
    });

    map.addLayer(vectorLayer);
  }

  // Handle map click hit detection for vector features
  let mapClickListener = null;
  if (vectorLayer) {
    mapClickListener = (e) => {
      let hitFound = false;
      map.forEachFeatureAtPixel(e.pixel, (olFeature, layer) => {
        if (hitFound) return;
        if (layer === vectorLayer && olFeature) {
          hitFound = true;
          const feature = olFeature.get("geoJsonFeature");
          if (feature) {
            setMarkerHighlight(olFeature);
            if (typeof onMarkerSelect === "function") {
              onMarkerSelect(feature, olFeature);
            }
          }
        }
      });
    };
    map.on("click", mapClickListener);
  }

  const markerGroup = {
    overlays: overlaysList,
    vectorLayer: vectorLayer,
    remove: () => {
      if (mapClickListener) {
        try {
          map.un("click", mapClickListener);
        } catch (err) {}
      }
      overlaysList.forEach(ov => {
        try {
          map.removeOverlay(ov);
        } catch (err) {}
      });
      if (vectorLayer) {
        try {
          map.removeLayer(vectorLayer);
        } catch (err) {}
      }
    }
  };

  return { markerGroup, markerMap };
}
