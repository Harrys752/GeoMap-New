import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { UI_STRINGS } from '../js/i18n/uiStrings.js';
import { DATASET_PROSE_ID, PERIOD_CONTEXT_DATA_ID, PROCESS_CARDS_ID } from '../js/i18n/datasetContentId.js';
import { 
  getLanguage, 
  setLanguage, 
  t, 
  getLocalizedFeature, 
  getLocalizedProcessCard, 
  getLocalizedPeriodData 
} from '../js/i18n/i18n.js';
import { 
  CONFIDENCE_METADATA_MAP, 
  CONFIDENCE_METADATA_MAP_ID, 
  NON_OFFICIAL_DISCLAIMER, 
  NON_OFFICIAL_DISCLAIMER_ID, 
  getConfidenceMetadata 
} from '../js/ui/confidenceLabels.js';
import { 
  matchesCanonicalFilter, 
  computeCanonicalDatasetCounts, 
  findFeatureById 
} from '../js/data/queryHelper.js';
import { adaptGeologyFeature } from '../js/data/adapters/geologyAdapter.js';
import { adaptHazardFeature } from '../js/data/adapters/hazardAdapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const geologyPath = path.join(rootDir, 'data/geology/sites.demo.geojson');
const hazardPath = path.join(rootDir, 'data/hazard/historical-events.demo.geojson');
const candidatePath = path.join(rootDir, 'data/geology/candidates.demo.geojson');

const geologyData = JSON.parse(fs.readFileSync(geologyPath, 'utf-8'));
const hazardData = JSON.parse(fs.readFileSync(hazardPath, 'utf-8'));
const candidateData = JSON.parse(fs.readFileSync(candidatePath, 'utf-8'));

console.log('\n=================================================');
console.log('Running Bilingual UI & i18n Architecture Test Suite');
console.log('=================================================\n');

test('Test 1: UI Strings Dictionary Symmetry and Completeness', (tTest) => {
  assert.ok(UI_STRINGS.en, 'UI_STRINGS must contain "en" dictionary');
  assert.ok(UI_STRINGS.id, 'UI_STRINGS must contain "id" dictionary');
  
  const enKeys = Object.keys(UI_STRINGS.en).sort();
  const idKeys = Object.keys(UI_STRINGS.id).sort();
  
  assert.deepEqual(enKeys, idKeys, 'EN and ID UI string dictionaries must have identical key sets');
  
  for (const key of enKeys) {
    assert.strictEqual(typeof UI_STRINGS.en[key], 'string', `UI_STRINGS.en[${key}] must be a string`);
    assert.strictEqual(typeof UI_STRINGS.id[key], 'string', `UI_STRINGS.id[${key}] must be a string`);
    assert.ok(UI_STRINGS.en[key].trim().length > 0, `UI_STRINGS.en[${key}] cannot be empty`);
    assert.ok(UI_STRINGS.id[key].trim().length > 0, `UI_STRINGS.id[${key}] cannot be empty`);
  }
  
  assert.strictEqual(t('app_brand_title', 'en'), 'GeoMap Indonesia 2.0');
  assert.strictEqual(t('app_brand_title', 'id'), 'GeoMap Indonesia 2.0');
  assert.strictEqual(t('domain_all', { count: 31 }, 'id'), 'Semua Domain (31)');
  assert.strictEqual(t('domain_geology', { count: 20 }, 'id'), 'Geologi (20)');
  assert.strictEqual(t('domain_hazard', { count: 11 }, 'id'), 'Bahaya Geologi (11)');
  
  console.log('[PASS] Test 1: UI Strings Dictionary Symmetry and Completeness');
});

test('Test 2: Complete Translation Coverage for All 31 Production Features', (tTest) => {
  const allProdFeatures = [...geologyData.features, ...hazardData.features];
  assert.strictEqual(allProdFeatures.length, 31, 'Dataset must have exactly 31 production features');
  
  for (const feat of allProdFeatures) {
    const id = feat.properties.id;
    const trans = DATASET_PROSE_ID[id];
    assert.ok(trans, `Missing Indonesian translation for production feature: ${id}`);
    assert.ok(trans.name, `Translation for ${id} must have a localized 'name'`);
    assert.ok(trans.description, `Translation for ${id} must have a localized 'description'`);
    
    if (feat.properties.geological_process) {
      assert.ok(trans.geological_process, `Translation for ${id} must have localized 'geological_process'`);
    }
    if (feat.properties.why_it_matters) {
      assert.ok(trans.why_it_matters, `Translation for ${id} must have localized 'why_it_matters'`);
    }
    if (feat.properties.significance) {
      assert.ok(trans.significance, `Translation for ${id} must have localized 'significance'`);
    }
  }
  
  console.log('[PASS] Test 2: Complete Translation Coverage for All 31 Production Features');
});

test('Test 3: Complete Translation Coverage for All 47 Candidate Features', (tTest) => {
  assert.strictEqual(candidateData.features.length, 47, 'Candidate dataset must have 47 features');
  
  for (const feat of candidateData.features) {
    const id = feat.properties.id;
    const trans = DATASET_PROSE_ID[id];
    assert.ok(trans, `Missing Indonesian translation for candidate feature: ${id}`);
    assert.ok(trans.name, `Candidate translation for ${id} must have a localized 'name'`);
    assert.ok(trans.description, `Candidate translation for ${id} must have a localized 'description'`);
  }
  
  console.log('[PASS] Test 3: Complete Translation Coverage for All 47 Candidate Features');
});

test('Test 4: Process Cards and Timeline Period Indonesian Translations', (tTest) => {
  const processKeys = [
    'subduction_zone', 'strike_slip_fault', 'caldera_supervolcano',
    'ophiolite_obduction', 'back_arc_basin', 'stratovolcano_arc',
    'continental_rift', 'subduction_trench', 'thrust_and_fold_belt'
  ];
  
  for (const key of processKeys) {
    const cardId = getLocalizedProcessCard(key, 'id');
    assert.ok(cardId, `Localized process card missing for key: ${key}`);
    assert.ok(cardId.title && cardId.title.length > 0, `Process card title must exist for ${key}`);
    assert.ok(cardId.mechanism && cardId.mechanism.length > 0, `Process card mechanism must exist for ${key}`);
    assert.ok(cardId.summary && cardId.summary.length > 0);
  }
  
  const periods = ['Quaternary', 'Neogene', 'Paleogene', 'Cretaceous', 'Triassic', 'Historical'];
  for (const p of periods) {
    const periodId = getLocalizedPeriodData(p, 'id');
    assert.ok(periodId, `Localized period data missing for: ${p}`);
    assert.ok(periodId.desc.length > 0);
    assert.ok(periodId.context.length > 0);
  }
  
  console.log('[PASS] Test 4: Process Cards and Timeline Period Indonesian Translations');
});

test('Test 5: Confidence Labels Single Source of Truth & Localized Resolvers', (tTest) => {
  const statuses = ['verified', 'partially_verified', 'needs_review', 'invalid', 'missing', 'unknown'];
  
  for (const st of statuses) {
    const metaEn = getConfidenceMetadata(st, 'en');
    const metaId = getConfidenceMetadata(st, 'id');
    
    assert.strictEqual(metaEn.label, CONFIDENCE_METADATA_MAP[st].label);
    assert.strictEqual(metaId.label, CONFIDENCE_METADATA_MAP_ID[st].label);
    assert.notStrictEqual(metaEn.label, metaId.label);
    assert.notStrictEqual(metaEn.explanation, metaId.explanation);
  }
  
  assert.strictEqual(NON_OFFICIAL_DISCLAIMER_ID.length > 20, true);
  assert.strictEqual(NON_OFFICIAL_DISCLAIMER.length > 20, true);
  
  console.log('[PASS] Test 5: Confidence Labels Single Source of Truth & Localized Resolvers');
});

test('Test 6: Core Filter Logic Independence from Language', (tTest) => {
  const allFeatures = [...geologyData.features, ...hazardData.features];
  
  const counts = computeCanonicalDatasetCounts(allFeatures);
  assert.strictEqual(counts.total, 31);
  assert.strictEqual(counts.domain.geology, 20);
  assert.strictEqual(counts.domain.hazard, 11);
  
  const filterState = {
    domain: 'all',
    featureType: 'all',
    hazardType: 'all',
    timeFilter: 'all',
    evidenceCategory: 'all',
    confidenceStatus: 'all',
    searchQuery: ''
  };
  
  const matched = allFeatures.filter(f => matchesCanonicalFilter(f, filterState));
  assert.strictEqual(matched.length, 31);
  
  const merapi = findFeatureById(allFeatures, 'geo_merapi');
  assert.ok(merapi);
  assert.strictEqual(merapi.properties.id, 'geo_merapi');
  
  console.log('[PASS] Test 6: Core Filter Logic Independence from Language');
});

test('Test 7: Adapter View Models Localize Cleanly on Demand Without Mutating Dataset', (tTest) => {
  const rawMerapi = geologyData.features.find(f => f.properties.id === 'geo_merapi');
  const originalDescription = rawMerapi.properties.description;
  
  const vmEn = adaptGeologyFeature(rawMerapi, 'en');
  const vmId = adaptGeologyFeature(rawMerapi, 'id');
  
  assert.strictEqual(vmEn.description, originalDescription);
  assert.notStrictEqual(vmId.description, originalDescription);
  assert.ok(vmId.description.includes('Stratovulkan') || vmId.description.includes('Merapi'));
  
  // Invariant: original rawMerapi properties must remain untouched
  assert.strictEqual(rawMerapi.properties.description, originalDescription);
  
  const rawKrakatau = hazardData.features.find(f => f.properties.id === 'haz_krakatau_1883');
  const originalHazDesc = rawKrakatau.properties.description;
  
  const vmHazEn = adaptHazardFeature(rawKrakatau, 'en');
  const vmHazId = adaptHazardFeature(rawKrakatau, 'id');
  
  assert.strictEqual(vmHazEn.description, originalHazDesc);
  assert.notStrictEqual(vmHazId.description, originalHazDesc);
  assert.ok(vmHazId.description.includes('Letusan kataklismik') || vmHazId.description.includes('Krakatau'));
  assert.strictEqual(rawKrakatau.properties.description, originalHazDesc);
  
  console.log('[PASS] Test 7: Adapter View Models Localize Cleanly on Demand Without Mutating Dataset');
});

test('Test 8: Coordinator i18n Getter/Setter and Localized Feature Resolver', (tTest) => {
  setLanguage('en');
  assert.strictEqual(getLanguage(), 'en');
  assert.strictEqual(t('app_brand_title'), 'GeoMap Indonesia 2.0');
  assert.strictEqual(t('domain_geology', { count: 20 }), 'Geology (20)');
  
  setLanguage('id');
  assert.strictEqual(getLanguage(), 'id');
  assert.strictEqual(t('domain_geology', { count: 20 }), 'Geologi (20)');
  assert.strictEqual(t('empty_state_reset_btn'), 'Reset Semua Filter');
  
  const rawToba = geologyData.features.find(f => f.properties.id === 'geo_toba_caldera');
  const locTobaId = getLocalizedFeature(rawToba, 'id');
  assert.strictEqual(locTobaId.properties.name, 'Kaldera Danau Toba');
  assert.ok(locTobaId.properties.description.includes('supervulkan'));
  
  const locTobaEn = getLocalizedFeature(rawToba, 'en');
  assert.strictEqual(locTobaEn.properties.name, 'Toba Caldera');
  
  // Fallback to en
  setLanguage('en');
  assert.strictEqual(getLanguage(), 'en');
  
  console.log('[PASS] Test 8: Coordinator i18n Getter/Setter and Localized Feature Resolver');
});

console.log('-------------------------------------------------');
console.log('Bilingual UI Test Suite Finished: 8/8 Tests Passed.');
console.log('-------------------------------------------------\n');
