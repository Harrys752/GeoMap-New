import fs from 'fs';
import https from 'https';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, url, body: data }));
    }).on('error', reject);
  });
}

async function run() {
  const urls = [
    'https://whc.unesco.org/en/list/592/',
    'https://whc.unesco.org/en/list/609/'
  ];
  for (const url of urls) {
    console.log('Fetching:', url);
    const r = await fetchUrl(url);
    const titleMatch = r.body.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'No Title';
    const textSnippet = r.body.replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '')
                              .replace(/<style\b[^<]*>([\s\S]*?)<\/style>/gi, '')
                              .replace(/<[^>]+>/g, ' ')
                              .replace(/\s+/g, ' ')
                              .trim();
    console.log('Status:', r.status);
    console.log('Title:', title);
    console.log('Snippet:', textSnippet.slice(0, 300));
    console.log('--------------------------------------------------');
  }
}

run().catch(console.error);
