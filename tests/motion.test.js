import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { applyTimelineMotion, dateTransitionDirection, prefersReducedMotion } from '../src/motion.js';

test('dateTransitionDirection follows the chronological tab direction', () => {
  assert.equal(dateTransitionDirection('2026-08-28', '2026-08-29'), 'forward');
  assert.equal(dateTransitionDirection('2026-08-30', '2026-08-29'), 'backward');
  assert.equal(dateTransitionDirection('2026-08-29', '2026-08-29'), 'still');
});

test('prefersReducedMotion respects the browser media query and degrades safely', () => {
  assert.equal(prefersReducedMotion(() => ({ matches: true })), true);
  assert.equal(prefersReducedMotion(() => ({ matches: false })), false);
  assert.equal(prefersReducedMotion(undefined), false);
});

test('applyTimelineMotion always clears stale direction classes before applying the next state', () => {
  const classes = new Set(['timeline-forward']);
  const timeline = {
    offsetWidth: 480,
    classList: {
      add(value) { classes.add(value); },
      remove(...values) { values.forEach(value => classes.delete(value)); },
    },
  };

  applyTimelineMotion(timeline, 'still', false);
  assert.deepEqual([...classes], []);

  applyTimelineMotion(timeline, 'backward', false);
  assert.deepEqual([...classes], ['timeline-backward']);

  applyTimelineMotion(timeline, 'forward', true);
  assert.deepEqual([...classes], []);
});

test('motion styling includes app-like entrances and a reduced-motion fallback', async () => {
  const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
  assert.match(css, /@keyframes\s+panel-enter/);
  assert.match(css, /@keyframes\s+timeline-forward/);
  assert.match(css, /@keyframes\s+timeline-backward/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /\.motion-ready\s+\.reveal/);
  assert.match(css, /\.tabs button\{padding:6px 6px;flex:1;min-width:0\}/);
});

test('planner markup exposes the animated tab indicator and decorative route', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /class="tab-indicator"/);
  assert.match(html, /class="hero-route"/);
  assert.match(html, /aria-hidden="true"/);
});

test('offline shell includes the motion module in a fresh cache generation', async () => {
  const worker = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
  assert.match(worker, /fukuoka-trip-2026-v6/);
  assert.match(worker, /\.\/src\/motion\.js/);
});
