import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { createDeferredTask, createRequestController, dailyRoutes, normalizeRoute, routePosition } from '../src/routes.js';
import { events } from '../src/data.js';

test('request controller aborts and settles only its latest request', () => {
  const cleared = [];
  const finished = [];
  let timeoutCallback;
  const requests = createRequestController({
    createAbortController: () => ({ aborted: false, abort() { this.aborted = true; } }),
    setTimer(callback) { timeoutCallback = callback; return 42; },
    clearTimer(id) { cleared.push(id); },
  });

  const first = requests.begin(12000, () => finished.push('first'));
  const second = requests.begin(12000, () => finished.push('second'));
  assert.equal(first.controller.aborted, true);
  assert.deepEqual(finished, ['first']);
  assert.equal(requests.isCurrent(first), false);
  assert.equal(requests.finish(first), false, 'stale finally cannot finish the newer request');
  assert.equal(requests.isCurrent(second), true);

  timeoutCallback();
  assert.equal(second.controller.aborted, true);
  assert.equal(requests.finish(second), true);
  assert.deepEqual(finished, ['first', 'second']);
  assert.deepEqual(cleared, [42, 42]);
});

test('explicit request cancellation clears state and makes late completion stale', () => {
  let timeoutCallback;
  let finished = 0;
  const requests = createRequestController({
    createAbortController: () => ({ aborted: false, abort() { this.aborted = true; } }),
    setTimer(callback) { timeoutCallback = callback; return 9; },
    clearTimer() {},
  });
  const request = requests.begin(12000, () => { finished += 1; });
  assert.equal(requests.cancel(), true);
  assert.equal(request.controller.aborted, true);
  assert.equal(requests.isBusy(), false);
  assert.equal(requests.finish(request), false);
  timeoutCallback();
  assert.equal(finished, 1);
});

test('deferred task cancellation and activity guard prevent hidden map initialization', () => {
  let pending;
  let cancelled;
  let active = true;
  let runs = 0;
  const task = createDeferredTask({
    setTimer(callback) { pending = callback; return 7; },
    clearTimer(id) { cancelled = id; },
  });

  task.schedule(() => { runs += 1; }, () => active);
  task.cancel();
  pending();
  assert.equal(cancelled, 7);
  assert.equal(runs, 0);

  task.schedule(() => { runs += 1; }, () => active);
  active = false;
  pending();
  assert.equal(runs, 0, 'callback also checks activity after the timer fires');

  active = true;
  task.schedule(() => { runs += 1; }, () => active);
  pending();
  assert.equal(runs, 1, 're-entering can schedule initialization again');
});

test('normalizeRoute removes adjacent duplicate coordinates without mutating input', () => {
  const input = {
    date: '2026-08-29',
    stops: [
      { name: 'A', lat: 33.5, lng: 130.4, modeToNext: 'taxi' },
      { name: 'duplicate', lat: 33.5, lng: 130.4, modeToNext: 'walk' },
      { name: 'B', lat: 33.6, lng: 130.5 },
    ],
  };
  const normalized = normalizeRoute(input);
  assert.deepEqual(normalized.stops.map(stop => stop.name), ['A', 'B']);
  assert.equal(normalized.stops[0].modeToNext, 'taxi');
  assert.equal(input.stops.length, 3);
});

test('daily routes contain itinerary-consistent non-duplicate stops per date', () => {
  assert.deepEqual(Object.keys(dailyRoutes), ['2026-08-28', '2026-08-29', '2026-08-30']);
  for (const [date, route] of Object.entries(dailyRoutes)) {
    const normalized = normalizeRoute(route);
    assert.ok(normalized.stops.length >= 3);
    assert.equal(normalized.stops.length, route.stops.length);
    assert.equal(new Set(route.stops.map(stop => stop.id)).size, route.stops.length);
    normalized.stops.forEach(stop => {
      assert.equal(typeof stop.id, 'string');
      assert.ok(Array.isArray(stop.eventIds));
      assert.ok(Number.isFinite(stop.lat));
      assert.ok(Number.isFinite(stop.lng));
      assert.ok(stop.eventIds.every(eventId => events.some(event => event.id === eventId && event.date === date)), stop.id);
    });
    const routedEventIds=normalized.stops.flatMap(stop=>stop.eventIds);
    const datedEventIds=events.filter(event=>event.date===date).map(event=>event.id);
    assert.deepEqual(routedEventIds,datedEventIds,`${date} route must cover every event in chronological order`);
  }
  assert.deepEqual(dailyRoutes['2026-08-28'].stops.map(stop=>stop.id),['flight-out','airport-hotel','donki-whisky','convenience']);
  assert.deepEqual(dailyRoutes['2026-08-29'].stops.map(stop=>stop.id),['sat-breakfast','unafuji','akachan-shopping','taxi-hotel','sat-dinner']);
  assert.deepEqual(dailyRoutes['2026-08-29'].stops.slice(0,2).map(stop=>stop.eventIds),[['sat-breakfast'],['unafuji']]);
  assert.equal(dailyRoutes['2026-08-29'].stops[0].modeToNext,'walk');
  assert.deepEqual(dailyRoutes['2026-08-30'].stops.map(stop=>stop.id),['cargopass-handoff','zoo','cargopass-pickup']);
  assert.match(dailyRoutes['2026-08-29'].summary,/라라포트/);
  assert.doesNotMatch(dailyRoutes['2026-08-29'].summary,/동물원/);
  assert.match(dailyRoutes['2026-08-30'].summary,/CARGOPASS.*트리아스 동물원/);
  assert.doesNotMatch(dailyRoutes['2026-08-30'].summary,/오호리/);
});

test('routePosition interpolates by distance and selects the active segment mode', () => {
  const route = normalizeRoute({ stops: [
    { name: 'A', lat: 0, lng: 0, modeToNext: 'walk' },
    { name: 'B', lat: 0, lng: 1, modeToNext: 'bus' },
    { name: 'C', lat: 0, lng: 3 },
  ] });
  assert.deepEqual(routePosition(route, 0), { lat: 0, lng: 0, segmentIndex: 0, stopIndex: 0, mode: 'walk' });
  assert.deepEqual(routePosition(route, 0.5), { lat: 0, lng: 1.5, segmentIndex: 1, stopIndex: 1, mode: 'bus' });
  assert.deepEqual(routePosition(route, 1), { lat: 0, lng: 3, segmentIndex: 1, stopIndex: 2, mode: 'bus' });
});

test('overview markup exposes date controls, animation controls and honest route labeling', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /data-tab="map"[^>]*>[\s\S]*?오버뷰<\/button>/);
  assert.match(html, /id="overview-days"/);
  assert.match(html, /id="route-toggle"/);
  assert.match(html, /id="route-progress"[^>]*aria-live="polite"/);
  assert.match(html, /일정 기준 동선/);
});

test('static route shortcuts and featured food match the revised itinerary', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /data-route="lalaport,hotel-nishitetsu-grand"/);
  assert.match(html, /공항 → 호텔/);
  assert.match(html, /우나후지 → 라라포트/);
  assert.match(html, /origin=炭焼\+うな富士\+福岡大名別邸&destination=ららぽーと福岡/);
  assert.match(html, /호텔 → 트리아스/);
  assert.match(html, /트리아스 → 국제선/);
  assert.match(html, /토요일 11:00~12:15/);
  assert.match(html, /12:30~13:00 라라포트로 출발/);
  assert.doesNotMatch(html, /data-route="unafuji,zoo"/);
  assert.doesNotMatch(html, /13시 동물원 입장|12:00~12:10 택시 출발|트리아스 → 텐진/);
});

test('overview styling keeps the route map and controls mobile friendly', async () => {
  const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.overview-card/);
  assert.match(css, /\.route-controls/);
  assert.match(css, /\.route-stop-icon/);
  assert.match(css, /#map\.panel\.active\s*\{\s*display:\s*block/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.transport-marker/);
});

test('offline shell includes routes module in cache v7', async () => {
  const worker = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
  assert.match(worker, /fukuoka-trip-2026-v7/);
  assert.match(worker, /\.\/src\/routes\.js/);
});
