const validCoordinate = value => Number.isFinite(value);

export function createRequestController({
  createAbortController = () => new AbortController(),
  setTimer = setTimeout,
  clearTimer = clearTimeout,
} = {}) {
  let current = null;

  const settle = (request, abort) => {
    if (!request || current !== request) return false;
    current = null;
    clearTimer(request.timeout);
    if (abort) request.controller.abort();
    request.onFinish?.();
    return true;
  };

  return {
    begin(timeoutMs, onFinish) {
      if (current) settle(current, true);
      const request = { controller: createAbortController(), timeout: null, onFinish };
      current = request;
      request.timeout = setTimer(() => {
        if (current === request) request.controller.abort();
      }, timeoutMs);
      return request;
    },
    cancel() { return settle(current, true); },
    finish(request) { return settle(request, false); },
    isCurrent(request) { return current === request; },
    isBusy() { return current !== null; },
  };
}

export function createDeferredTask({ setTimer = setTimeout, clearTimer = clearTimeout } = {}) {
  let timer = null;
  let generation = 0;
  return {
    schedule(callback, isActive = () => true) {
      if (timer !== null) clearTimer(timer);
      const scheduledGeneration = ++generation;
      timer = setTimer(() => {
        if (scheduledGeneration !== generation) return;
        timer = null;
        if (isActive()) callback();
      }, 0);
    },
    cancel() {
      generation += 1;
      if (timer === null) return false;
      clearTimer(timer);
      timer = null;
      return true;
    },
  };
}

export const dailyRoutes = {
  '2026-08-28': {
    label: '8/28 금',
    summary: '공항 도착 후 텐진에 체크인하고 저녁 권역으로 이동해요.',
    stops: [
      { name: '후쿠오카공항 국제선', lat: 33.5859, lng: 130.4507, modeToNext: 'airport-bus' },
      { name: '텐진/숙소 권역', lat: 33.5903, lng: 130.4017, modeToNext: 'walk' },
      { name: '텐진·다이묘/나카스 저녁 권역', lat: 33.5914, lng: 130.4031 },
    ],
  },
  '2026-08-29': {
    label: '8/29 토',
    summary: '11:00 우나후지 예약부터 동물원, 텐진 복귀까지의 핵심 동선이에요.',
    stops: [
      { name: '우나후지 (11:00 예약)', lat: 33.5869, lng: 130.3942, modeToNext: 'taxi' },
      { name: '토리아스 후레아이 동물원', lat: 33.6506, lng: 130.4886, modeToNext: 'bus' },
      { name: '텐진', lat: 33.5903, lng: 130.4017 },
    ],
  },
  '2026-08-30': {
    label: '8/30 일',
    summary: '오호리공원 산책 후 텐진에서 짐을 찾아 국제선으로 이동해요.',
    stops: [
      { name: '오호리공원', lat: 33.5861, lng: 130.3764, modeToNext: 'walk' },
      { name: '텐진/짐 찾기', lat: 33.5904, lng: 130.3999, modeToNext: 'airport-bus' },
      { name: '후쿠오카공항 국제선', lat: 33.5859, lng: 130.4507 },
    ],
  },
};

export const modeDetails = {
  'airport-bus': { icon: '🚌', label: '공항버스' },
  bus: { icon: '🚌', label: '버스' },
  taxi: { icon: '🚕', label: '택시' },
  walk: { icon: '🚶', label: '도보' },
};

export function normalizeRoute(route = {}) {
  const stops = [];
  for (const source of route.stops ?? []) {
    if (!validCoordinate(source?.lat) || !validCoordinate(source?.lng)) continue;
    const stop = { ...source };
    const previous = stops.at(-1);
    if (previous && previous.lat === stop.lat && previous.lng === stop.lng) continue;
    stops.push(stop);
  }
  return { ...route, stops };
}

function segmentLength(a, b) {
  const meanLatitude = (a.lat + b.lat) * Math.PI / 360;
  return Math.hypot((b.lat - a.lat), (b.lng - a.lng) * Math.cos(meanLatitude));
}

export function routePosition(route, rawProgress) {
  const stops = normalizeRoute(route).stops;
  if (!stops.length) return null;
  if (stops.length === 1) return { lat: stops[0].lat, lng: stops[0].lng, segmentIndex: 0, stopIndex: 0, mode: stops[0].modeToNext ?? 'walk' };
  const progress = Math.max(0, Math.min(1, Number(rawProgress) || 0));
  const lengths = stops.slice(0, -1).map((stop, index) => segmentLength(stop, stops[index + 1]));
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let distance = progress * total;
  let segmentIndex = lengths.length - 1;
  for (let index = 0; index < lengths.length; index += 1) {
    if (distance <= lengths[index] || index === lengths.length - 1) { segmentIndex = index; break; }
    distance -= lengths[index];
  }
  const fraction = lengths[segmentIndex] ? Math.min(1, distance / lengths[segmentIndex]) : 0;
  const start = stops[segmentIndex];
  const end = stops[segmentIndex + 1];
  return {
    lat: start.lat + (end.lat - start.lat) * fraction,
    lng: start.lng + (end.lng - start.lng) * fraction,
    segmentIndex,
    stopIndex: progress === 1 ? stops.length - 1 : segmentIndex,
    mode: start.modeToNext ?? 'walk',
  };
}
