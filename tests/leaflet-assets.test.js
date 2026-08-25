import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('map loads Leaflet from same-origin vendored assets', async () => {
  const html = await text('index.html');
  const headers = await text('_headers');

  assert.match(html, /href="vendor\/leaflet\/leaflet\.css"/);
  assert.match(html, /src="vendor\/leaflet\/leaflet\.js"/);
  assert.doesNotMatch(html, /unpkg\.com\/leaflet/);
  assert.doesNotMatch(headers, /unpkg\.com/);
});

test('vendored Leaflet marker images and files are present', async () => {
  const paths = [
    'vendor/leaflet/leaflet.css',
    'vendor/leaflet/leaflet.js',
    'vendor/leaflet/images/marker-icon.png',
    'vendor/leaflet/images/marker-icon-2x.png',
    'vendor/leaflet/images/marker-shadow.png',
    'vendor/leaflet/images/layers.png',
    'vendor/leaflet/images/layers-2x.png',
  ];

  await Promise.all(paths.map(path => access(new URL(path, root))));
});

test('service worker precaches vendored Leaflet assets', async () => {
  const serviceWorker = await text('sw.js');

  for (const path of [
    './vendor/leaflet/leaflet.css',
    './vendor/leaflet/leaflet.js',
    './vendor/leaflet/images/marker-icon.png',
    './vendor/leaflet/images/marker-icon-2x.png',
    './vendor/leaflet/images/marker-shadow.png',
    './vendor/leaflet/images/layers.png',
    './vendor/leaflet/images/layers-2x.png',
  ]) {
    assert.ok(serviceWorker.includes(`'${path}'`), `${path} must be precached`);
  }
});
