import assert from 'assert';
import { test } from 'node:test';
import fetch from 'node-fetch';

const base = 'http://localhost:3000';

test('GET /api/atlas/fra returns FeatureCollection', async () => {
  const res = await fetch(base + '/api/atlas/fra');
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.ok(json.type === 'FeatureCollection', 'expected FeatureCollection');
});

test('GET /api/atlas/assets returns FeatureCollection', async () => {
  const res = await fetch(base + '/api/atlas/assets');
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.ok(json.type === 'FeatureCollection', 'expected FeatureCollection');
});

