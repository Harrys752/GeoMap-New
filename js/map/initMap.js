/**
 * OpenLayers Map Initialization & Basemap Management Module
 * Configures Esri World Imagery (Satellite), Esri World Boundaries & Places (Place Labels overlay),
 * OpenStreetMap (Street Map), and OpenTopoMap (Terrain) with layer controls and robust fallback handling.
 */

/**
 * Non-blocking Toast Notification Helper
 * @param {string} message - Message to display
 */
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

/**
 * Initializes the interactive OpenLayers map with multi-basemap support.
 * @param {string} elementId - DOM ID of map container element
 * @returns {ol.Map} OpenLayers map instance
 */
export function initMap(elementId = "map") {
  const mapElement = document.getElementById(elementId);
  if (!mapElement) {
    throw new Error(`Map container element #${elementId} not found.`);
  }

  // Center coordinates for Indonesia ([118.0 lng, -2.5 lat] in EPSG:3857)
  const defaultCenter = ol.proj.fromLonLat([118.0, -2.5]);
  const defaultZoom = 5;

  // 1. Terminal Fallback Base Layer: OpenStreetMap Standard
  const streetMapSource = new ol.source.OSM({
    attributions: "© OpenStreetMap contributors"
  });
  const streetMapLayer = new ol.layer.Tile({
    source: streetMapSource,
    visible: false
  });

  // 2. Default Base Layer: Esri World Imagery (Satellite)
  const satelliteSource = new ol.source.XYZ({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attributions: "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    maxZoom: 18
  });
  const satelliteLayer = new ol.layer.Tile({
    source: satelliteSource,
    visible: true
  });

  // 3. Topographic Base Layer: OpenTopoMap (Terrain)
  const terrainSource = new ol.source.XYZ({
    url: "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
    attributions: "Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)",
    maxZoom: 17
  });
  const terrainLayer = new ol.layer.Tile({
    source: terrainSource,
    visible: false
  });

  // 4. Overlay Layer: Esri World Boundaries and Places (Place Labels)
  const labelsSource = new ol.source.XYZ({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    attributions: "Esri, HERE, Garmin, © OpenStreetMap contributors, and the GIS User Community",
    maxZoom: 18
  });
  const labelsLayer = new ol.layer.Tile({
    source: labelsSource,
    visible: true
  });

  // Create OpenLayers Map View
  const view = new ol.View({
    center: defaultCenter,
    zoom: defaultZoom,
    minZoom: 4,
    maxZoom: 18
  });

  const controls = (typeof ol.control.defaults === "function") 
    ? ol.control.defaults({ zoom: true, attribution: true })
    : (ol.control.defaults && typeof ol.control.defaults.defaults === "function" 
        ? ol.control.defaults.defaults({ zoom: true, attribution: true }) 
        : undefined);

  const map = new ol.Map({
    target: elementId,
    layers: [
      streetMapLayer,
      terrainLayer,
      satelliteLayer,
      labelsLayer
    ],
    view: view,
    controls: controls
  });

  // Fallback Tracking State (Session Scope)
  const failedProviders = new Set();

  function setupBaseLayerFallback(source, layer, providerName) {
    let hasNotified = false;

    source.on("tileloaderror", () => {
      if (failedProviders.has(providerName)) return;

      failedProviders.add(providerName);
      if (!hasNotified) {
        hasNotified = true;
        showToastNotification(`Basemap "${providerName}" unavailable. Switched to Street Map fallback.`);
        console.warn(`[GeoMap Basemap] ${providerName} tile error. Falling back to OpenStreetMap standard.`);
      }

      layer.setVisible(false);
      streetMapLayer.setVisible(true);

      const radio = document.querySelector('input[name="ol-base-layer"][value="Street Map"]');
      if (radio) radio.checked = true;
    });
  }

  function setupOverlayFallback(source, layer, overlayName) {
    let hasNotified = false;

    source.on("tileloaderror", () => {
      if (failedProviders.has(overlayName)) return;

      failedProviders.add(overlayName);
      if (!hasNotified) {
        hasNotified = true;
        showToastNotification(`Overlay "${overlayName}" unavailable. Place labels disabled.`);
        console.warn(`[GeoMap Basemap] Overlay ${overlayName} tile error.`);
      }

      layer.setVisible(false);

      const chk = document.querySelector('input[name="ol-labels-toggle"]');
      if (chk) chk.checked = false;
    });
  }

  setupBaseLayerFallback(satelliteSource, satelliteLayer, "Satellite");
  setupBaseLayerFallback(terrainSource, terrainLayer, "Terrain");
  setupOverlayFallback(labelsSource, labelsLayer, "Place Labels");

  // Custom Layer Switcher Control
  const switcherContainer = document.createElement("div");
  switcherContainer.className = "ol-control-layers";

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "ol-layers-toggle-btn";
  toggleBtn.setAttribute("aria-label", "Toggle basemap layer switcher");
  toggleBtn.title = "Layers";
  toggleBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`;

  const panel = document.createElement("div");
  panel.className = "ol-layers-panel hidden";
  panel.innerHTML = `
    <div class="ol-layers-title">Base Layers</div>
    <label class="ol-layer-radio">
      <input type="radio" name="ol-base-layer" value="Satellite" checked>
      <span>Satellite</span>
    </label>
    <label class="ol-layer-radio">
      <input type="radio" name="ol-base-layer" value="Street Map">
      <span>Street Map</span>
    </label>
    <label class="ol-layer-radio">
      <input type="radio" name="ol-base-layer" value="Terrain">
      <span>Terrain</span>
    </label>
    <div class="ol-layers-separator"></div>
    <div class="ol-layers-title">Overlays</div>
    <label class="ol-layer-checkbox">
      <input type="checkbox" name="ol-labels-toggle" checked>
      <span>Place Labels</span>
    </label>
    <label class="ol-layer-checkbox">
      <input type="checkbox" name="ol-candidates-toggle" autocomplete="off">
      <span>Candidate Structures</span>
    </label>
  `;

  switcherContainer.appendChild(toggleBtn);
  switcherContainer.appendChild(panel);
  mapElement.appendChild(switcherContainer);

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!switcherContainer.contains(e.target)) {
      panel.classList.add("hidden");
    }
  });

  // Handle Base Layer Switch
  const baseRadios = panel.querySelectorAll('input[name="ol-base-layer"]');
  baseRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      const val = e.target.value;
      satelliteLayer.setVisible(val === "Satellite");
      streetMapLayer.setVisible(val === "Street Map");
      terrainLayer.setVisible(val === "Terrain");

      // Auto-enable Place Labels when user switches to Satellite if not failed
      if (val === "Satellite") {
        if (!failedProviders.has("Place Labels")) {
          labelsLayer.setVisible(true);
          const chk = panel.querySelector('input[name="ol-labels-toggle"]');
          if (chk) chk.checked = true;
        }
      }
    });
  });

  // Handle Place Labels Overlay Toggle
  const labelsCheckbox = panel.querySelector('input[name="ol-labels-toggle"]');
  if (labelsCheckbox) {
    labelsCheckbox.addEventListener("change", (e) => {
      labelsLayer.setVisible(e.target.checked);
    });
  }

  // 5. Window resize listener to automatically update size
  window.addEventListener("resize", () => {
    map.updateSize();
  });

  return map;
}
