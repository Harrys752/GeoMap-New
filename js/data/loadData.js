/**
 * Data Loading Module
 * Asynchronously fetches static GeoJSON datasets, runs validation via validate.js,
 * logs rejected records without crashing, and returns verified records.
 */

import { validateDataset } from "../utils/validate.js";

/**
 * Loads and validates GeoJSON data from specified file paths.
 * @param {string[]} paths - Array of relative or absolute URLs to GeoJSON files
 * @returns {Promise<{ features: object[], rejectedCount: number, errorsLog: string[] }>}
 */
export async function loadAllDatasets(paths = [
  "data/geology/sites.demo.geojson",
  "data/hazard/historical-events.demo.geojson"
]) {
  const allValidFeatures = [];
  const errorsLog = [];
  const seenIds = new Set();
  let rejectedCount = 0;

  for (const path of paths) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        const errorMsg = `Failed to load dataset at '${path}': HTTP ${response.status} ${response.statusText}`;
        console.error(`[GeoMap Loader] ${errorMsg}`);
        errorsLog.push(errorMsg);
        continue;
      }

      const rawData = await response.json();
      const validationResult = validateDataset(rawData, seenIds);

      if (!validationResult.isCollectionValid) {
        const errorMsg = `Invalid GeoJSON file structure in '${path}'`;
        console.error(`[GeoMap Loader] ${errorMsg}`, validationResult.rejectedFeatures);
        errorsLog.push(errorMsg);
        continue;
      }

      if (validationResult.rejectedFeatures.length > 0) {
        rejectedCount += validationResult.rejectedFeatures.length;
        for (const item of validationResult.rejectedFeatures) {
          const idStr = item.feature?.properties?.id || "unknown_id";
          const logText = `Rejected feature '${idStr}' in '${path}': ${item.errors.join("; ")}`;
          console.warn(`[GeoMap Loader] ${logText}`);
          errorsLog.push(logText);
        }
      }

      allValidFeatures.push(...validationResult.validFeatures);
    } catch (err) {
      const errorMsg = `Error loading dataset '${path}': ${err.message}`;
      console.error(`[GeoMap Loader] ${errorMsg}`, err);
      errorsLog.push(errorMsg);
    }
  }

  return {
    features: allValidFeatures,
    rejectedCount,
    errorsLog
  };
}
