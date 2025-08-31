import fetch from 'node-fetch';

const endpoints = [
  'http://localhost:3000/api/atlas/fra',
  'http://localhost:3000/api/atlas/boundaries',
  'http://localhost:3000/api/atlas/assets',
];

async function run() {
  for (const url of endpoints) {
    try {
      const res = await fetch(url);
      const json = await res.json();
      console.log(url, res.status, json && json.type ? json.type : 'no-type');
    } catch (e) {
      console.error('ERROR', url, e.message || e);
      process.exitCode = 2;
    }
  }
}

run();
