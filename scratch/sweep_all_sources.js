import fs from 'fs';
import https from 'https';
import http from 'http';

const geoJson = JSON.parse(fs.readFileSync('./data/geology/sites.demo.geojson', 'utf8'));
const hazJson = JSON.parse(fs.readFileSync('./data/hazard/historical-events.demo.geojson', 'utf8'));
const allFeatures = [...geoJson.features, ...hazJson.features];

function fetchUrl(url) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 8000
      };
      const req = client.get(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const titleMatch = data.match(/<title>([^<]+)<\/title>/i);
          const title = titleMatch ? titleMatch[1].trim() : '';
          const snippet = data.replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '')
                              .replace(/<style\b[^<]*>([\s\S]*?)<\/style>/gi, '')
                              .replace(/<[^>]+>/g, ' ')
                              .replace(/\s+/g, ' ')
                              .trim()
                              .slice(0, 300);
          resolve({ status: res.statusCode, finalUrl: url, title, snippet, body: data });
        });
      });
      req.on('error', (err) => resolve({ status: 'ERROR', finalUrl: url, title: err.message, snippet: '', body: '' }));
      req.on('timeout', () => { req.destroy(); resolve({ status: 'TIMEOUT', finalUrl: url, title: 'Timeout', snippet: '', body: '' }); });
    } catch (e) {
      resolve({ status: 'ERROR', finalUrl: url, title: e.message, snippet: '', body: '' });
    }
  });
}

async function sweep() {
  console.log(`Starting sweep across ${allFeatures.length} records...`);
  const results = [];
  for (const f of allFeatures) {
    const props = f.properties;
    const url = props.source_url;
    console.log(`Checking [${props.id}] ${props.name} -> ${url}`);
    let fetchRes = { status: 'NO_URL', finalUrl: url, title: '', snippet: '' };
    if (url && url.startsWith('http')) {
      fetchRes = await fetchUrl(url);
    }
    results.push({
      id: props.id,
      name: props.name,
      domain: props.domain,
      feature_type: props.feature_type,
      source: props.source,
      source_url: url,
      fetch: fetchRes,
      status: props.source_verification_status
    });
  }
  fs.writeFileSync('scratch/sweep_results.json', JSON.stringify(results, null, 2));
  console.log('Sweep finished. Results saved to scratch/sweep_results.json.');
}

sweep();
