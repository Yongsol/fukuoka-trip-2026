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
    'fukuoka-planner-v3',
    'another-pages-app-v9',
  ]);
  let activation;
  listeners.get('activate')({ waitUntil(promise) { activation = promise; } });
  await activation;
  assert.deepEqual(deleted.sort(), ['fukuoka-planner-v3', 'fukuoka-trip-2026-v2']);
});
