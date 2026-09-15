/**
 * Basemap Tile Connectivity & Integration Test Suite
 * Executes live HTTP GET requests for sample tiles over Indonesia (zoom 5) for all configured providers.
 * Run using: node test/basemap.test.js
 */

import assert from "node:assert";

console.log("=================================================");
console.log("Running GeoMap Indonesia 2.0 Basemap Test Suite");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

async function runAsyncTest(testName, testFn) {
  totalTests++;
  try {
    await testFn();
    console.log(`[PASS] Test ${totalTests}: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] Test ${totalTests}: ${testName}`);
    console.error(`       Error: ${err.message}`);
  }
}

// Tile coordinates over Indonesia (Zoom 5, X=26, Y=16)
const sampleTile = { z: 5, x: 26, y: 16 };

async function fetchTileStatus(url) {
  const headers = { "User-Agent": "GeoMapIndonesia-Educational/2.0" };
  const res = await fetch(url, { headers });
  return res.status;
}

// 1. Esri World Imagery (Satellite) Connectivity
await runAsyncTest("Esri World Imagery (Satellite) Tile Reachability", async () => {
  const url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${sampleTile.z}/${sampleTile.y}/${sampleTile.x}`;
  const status = await fetchTileStatus(url);
  assert.strictEqual(status, 200, `Expected HTTP 200, got ${status} for ${url}`);
});

// 2. Esri World Boundaries & Places (Place Labels Overlay) Connectivity
await runAsyncTest("Esri World Boundaries and Places (Place Labels Overlay) Tile Reachability", async () => {
  const url = `https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/${sampleTile.z}/${sampleTile.y}/${sampleTile.x}`;
  const status = await fetchTileStatus(url);
  assert.strictEqual(status, 200, `Expected HTTP 200, got ${status} for ${url}`);
});

// 3. OpenStreetMap Standard (Street Map Terminal Fallback) Connectivity
await runAsyncTest("OpenStreetMap Standard (Street Map) Tile Reachability", async () => {
  const url = `https://tile.openstreetmap.org/${sampleTile.z}/${sampleTile.x}/${sampleTile.y}.png`;
  const status = await fetchTileStatus(url);
  assert.strictEqual(status, 200, `Expected HTTP 200, got ${status} for ${url}`);
});

// 4. OpenTopoMap (Terrain) Connectivity
await runAsyncTest("OpenTopoMap (Terrain) Tile Reachability", async () => {
  const url = `https://a.tile.opentopomap.org/${sampleTile.z}/${sampleTile.x}/${sampleTile.y}.png`;
  const status = await fetchTileStatus(url);
  assert.strictEqual(status, 200, `Expected HTTP 200, got ${status} for ${url}`);
});

console.log("\n-------------------------------------------------");
console.log(`Basemap Test Suite Finished: ${passedTests}/${totalTests} Tests Passed.`);
console.log("-------------------------------------------------");

if (passedTests !== totalTests) {
  process.exit(1);
}
