import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

async function loadServiceWorker(cacheNames) {
  const listeners = new Map();
  const deleted = [];
  const context = {
    URL,
    Set,
    Promise,
    fetch: async () => ({ ok: true, clone() { return this; } }),
    caches: {
      async keys() { return cacheNames; },
      async delete(name) { deleted.push(name); return true; },
      async open() { return { addAll: async () => {}, put: async () => {}, match: async () => null }; },
      async match() { return null; },
    },
    self: {
      registration: { scope: 'https://example.test/fukuoka-trip-2026/' },
      location: { origin: 'https://example.test' },
      clients: { claim: async () => {} },
      skipWaiting: async () => {},
      addEventListener(type, handler) { listeners.set(type, handler); },
    },
  };
  vm.runInNewContext(await readFile(new URL('../sw.js', import.meta.url), 'utf8'), context);
  return { listeners, deleted };
}

test('service worker activation deletes only this app cache generations', async () => {
  const { listeners, deleted } = await loadServiceWorker([
    'fukuoka-trip-2026-v2',
    'fukuoka-trip-2026-v4',
    'fukuoka-trip-2026-v5',
    'fukuoka-trip-2026-v6',
    'fukuoka-trip-2026-v7',
    'fukuoka-trip-2026-v8',
    'fukuoka-trip-2026-v9',
    'fukuoka-trip-2026-v10',
    'fukuoka-planner-v3',
    'another-pages-app-v9',
  ]);
  let activation;
  listeners.get('activate')({ waitUntil(promise) { activation = promise; } });
  await activation;
  assert.deepEqual(deleted.sort(), ['fukuoka-planner-v3', 'fukuoka-trip-2026-v10', 'fukuoka-trip-2026-v2', 'fukuoka-trip-2026-v4', 'fukuoka-trip-2026-v5', 'fukuoka-trip-2026-v6', 'fukuoka-trip-2026-v7', 'fukuoka-trip-2026-v8', 'fukuoka-trip-2026-v9']);
});

test('service worker v22 caches only the 11-place Tenjin restaurant guide and current modules', async () => {
  const worker=await readFile(new URL('../sw.js',import.meta.url),'utf8');
  assert.match(worker,/fukuoka-trip-2026-v22/);
  for(const module of ['data','restaurant-data']) assert.ok(worker.includes(`./src/${module}.js?v=22`),module);
  assert.ok(worker.includes('./src/app.js?v=22'));
  assert.ok(worker.includes('./styles.css?v=22'));
  assert.match(worker,/assets\/theme\/beaver-baby-hero\.svg/);
  assert.doesNotMatch(worker,/social-food-data|assets\/social-food|shinshin-deitos|shoboan|hamadaya|nakasu-yatai/);
  for(const file of ['01-shinshin-tenjin.webp','02-unafuji-daimyo.webp','03-kanetora.webp','04-ichifuji.webp','05-rakutenti.webp','06-ooyama.webp','07-mentaiju.webp','08-fukutaro-tenjin-terra.webp','09-shinmiura-tenjin.webp','10-mamichan-yatai.webp','11-pyonkichi.webp']) assert.ok(worker.includes(`./assets/restaurants/${file}`),file);
});
