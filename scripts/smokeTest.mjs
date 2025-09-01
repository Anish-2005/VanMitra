import fetch from 'node-fetch';

const port = process.env.PORT || process.env.NEXT_PORT || 3001;
const base = `http://localhost:${port}`;
const endpoints = [
  `${base}/api/atlas/fra`,
  `${base}/api/atlas/boundaries`,
  `${base}/api/atlas/assets`,
];

async function run() {
  for (const url of endpoints) {
    try {
      const res = await fetch(url);
      const json = await res.json();
      console.log(url, res.status, json && json.type ? json.type : 'no-type');
    } catch (e) {
      console.error('ERROR', url);
      console.error(e && e.stack ? e.stack : e);
      process.exitCode = 2;
    }
  }
}

run();
