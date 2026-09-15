/**
 * Leaflet Map Initialization & Basemap Management Module
 * Configures Esri World Imagery (Satellite), Esri World Boundaries & Places (Place Labels overlay),
 * OpenStreetMap (Street Map), and OpenTopoMap (Terrain) with layer controls and robust fallback handling.
 */

/**
 * Initializes the interactive Leaflet map with multi-basemap support.
 * @param {string} elementId - DOM ID of map container element
 * @returns {L.Map} Leaflet map instance
 */
export function initMap(elementId = "map") {
  // Center coordinates for Indonesia (-2.5 lat, 118.0 lng)
  const defaultCenter = [-2.5, 118.0];
  const defaultZoom = 5;

  const map = L.map(elementId, {
    center: defaultCenter,
    zoom: defaultZoom,
    minZoom: 4,
    maxZoom: 18,
    zoomControl: true
  });

  // Non-blocking Toast Notification Helper
  function showToastNotification(message) {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  // 1. Terminal Fallback Base Layer: OpenStreetMap Standard
  const streetMapAttribution = "© OpenStreetMap contributors";
  const streetMapLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: streetMapAttribution,
    maxZoom: 19
  });

  // 2. Default Base Layer: Esri World Imagery (Satellite)
  const satelliteAttribution = "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";
  const satelliteLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: satelliteAttribution,
    maxZoom: 18
  });

  // 3. Topographic Base Layer: OpenTopoMap (Terrain)
  const terrainAttribution = "Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)";
  const terrainLayer = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution: terrainAttribution,
    subdomains: ["a", "b", "c"],
    maxZoom: 17
  });

  // 4. Overlay Layer: Esri World Boundaries and Places (Place Labels)
  const labelsAttribution = "Esri, HERE, Garmin, © OpenStreetMap contributors, and the GIS User Community";
  const labelsLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", {
    attribution: labelsAttribution,
    maxZoom: 18
  });

  // Fallback Tracking State (Session Scope)
  const failedProviders = new Set();

  function setupBaseLayerFallback(layer, providerName) {
    let hasNotified = false;

    layer.on("tileerror", () => {
      if (failedProviders.has(providerName)) return;

      failedProviders.add(providerName);
      if (!hasNotified) {
        hasNotified = true;
        showToastNotification(`Basemap "${providerName}" unavailable. Switched to Street Map fallback.`);
        console.warn(`[GeoMap Basemap] ${providerName} tile error. Falling back to OpenStreetMap standard.`);
      }

      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
        if (!map.hasLayer(streetMapLayer)) {
          map.addLayer(streetMapLayer);
        }
      }
    });

    layer.on("add", () => {
      hasNotified = false;
    });
  }

  function setupOverlayFallback(layer, overlayName) {
    let hasNotified = false;

    layer.on("tileerror", () => {
      if (failedProviders.has(overlayName)) return;

      failedProviders.add(overlayName);
      if (!hasNotified) {
        hasNotified = true;
        showToastNotification(`Overlay "${overlayName}" unavailable. Place labels disabled.`);
        console.warn(`[GeoMap Basemap] Overlay ${overlayName} tile error.`);
      }

      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });

    layer.on("add", () => {
      hasNotified = false;
    });
  }

  // Attach Fallback Listeners (DO NOT attach to streetMapLayer)
  setupBaseLayerFallback(satelliteLayer, "Satellite");
  setupBaseLayerFallback(terrainLayer, "Terrain");
  setupOverlayFallback(labelsLayer, "Place Labels");

  // Base Layers & Overlays Dictionary for Leaflet Control
  const baseLayers = {
    "Satellite": satelliteLayer,
    "Street Map": streetMapLayer,
    "Terrain": terrainLayer
  };

  const overlays = {
    "Place Labels": labelsLayer
  };

  // Add Default Base Layer & Place Labels Overlay on Load
  satelliteLayer.addTo(map);
  labelsLayer.addTo(map);

  // Add Leaflet Layer Control to Top-Right
  L.control.layers(baseLayers, overlays, {
    position: "topright",
    collapsed: true
  }).addTo(map);

  // Auto-enable Place Labels when user switches to Satellite base layer if not failed
  map.on("baselayerchange", (e) => {
    if (e.name === "Satellite") {
      if (!failedProviders.has("Place Labels") && !map.hasLayer(labelsLayer)) {
        labelsLayer.addTo(map);
      }
    }
  });

  return map;
}
