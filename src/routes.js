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
    summary: '니시테츠 그랜드 호텔에 체크인한 뒤 텐진에서 저녁과 돈키호테 쇼핑을 해요.',
    stops: [
      { id: 'flight-out', eventIds: ['flight-out'], name: '후쿠오카공항 국제선', lat: 33.5848221, lng: 130.4442945, modeToNext: 'airport-bus' },
      { id: 'airport-hotel', eventIds: ['airport-hotel', 'fri-dinner'], name: '니시테츠 그랜드 호텔·텐진 저녁', lat: 33.5898408, lng: 130.3954577, modeToNext: 'walk' },
      { id: 'donki-whisky', eventIds: ['donki-whisky'], name: '돈키호테 후쿠오카 텐진 본점', lat: 33.5891, lng: 130.3972, modeToNext: 'walk' },
      { id: 'convenience', eventIds: ['convenience'], name: '니시테츠 그랜드 호텔 복귀', lat: 33.5898408, lng: 130.3954577 },
    ],
  },
  '2026-08-29': {
    label: '8/29 토',
    summary: '11:00 우나후지 식사 후 라라포트에서 쇼핑하고 호텔로 돌아와요.',
    stops: [
      { id: 'sat-breakfast', eventIds: ['sat-breakfast'], name: '니시테츠 그랜드 호텔·아침', lat: 33.5898408, lng: 130.3954577, modeToNext: 'walk' },
      { id: 'unafuji', eventIds: ['unafuji'], name: '우나후지 (11:00 예약)', lat: 33.588668, lng: 130.3948393, modeToNext: 'transit' },
      { id: 'akachan-shopping', eventIds: ['to-lalaport', 'akachan-shopping'], name: '라라포트·아카짱혼포', lat: 33.5647723, lng: 130.4403204, modeToNext: 'taxi' },
      { id: 'taxi-hotel', eventIds: ['taxi-hotel', 'sat-rest'], name: '니시테츠 그랜드 호텔', lat: 33.5898408, lng: 130.3954577, modeToNext: 'walk' },
      { id: 'sat-dinner', eventIds: ['sat-shopping', 'sat-dinner'], name: '텐진·다이묘 쇼핑과 저녁', lat: 33.5903, lng: 130.4017 },
    ],
  },
  '2026-08-30': {
    label: '8/30 일',
    summary: '호텔에서 CARGOPASS에 짐을 맡기고 트리아스 동물원 방문 후 국제선으로 이동해요.',
    stops: [
      { id: 'cargopass-handoff', eventIds: ['sun-breakfast', 'cargopass-handoff'], name: '니시테츠 그랜드 호텔·CARGOPASS 인계', lat: 33.5898408, lng: 130.3954577, modeToNext: 'bus' },
      { id: 'zoo', eventIds: ['to-torius', 'zoo', 'torius-lunch', 'torius-buffer'], name: '트리아스·후레아이 동물원·점심', lat: 33.6527549, lng: 130.4928927, modeToNext: 'transit' },
      { id: 'cargopass-pickup', eventIds: ['torius-airport', 'cargopass-pickup', 'flight-home'], name: '후쿠오카공항 국제선·CARGOPASS 수령', lat: 33.5848221, lng: 130.4442945 },
    ],
  },
};

export const modeDetails = {
  'airport-bus': { icon: '🚌', label: '공항버스', color: '#2563a6', googleTravelMode: 'transit' },
  bus: { icon: '🚌', label: '버스', color: '#2563a6', googleTravelMode: 'transit' },
  transit: { icon: '🚆', label: '대중교통', color: '#2f7d64', googleTravelMode: 'transit' },
  taxi: { icon: '🚕', label: '택시', color: '#d97706', googleTravelMode: 'driving' },
  walk: { icon: '🚶', label: '도보', color: '#7c3aed', googleTravelMode: 'walking' },
};

export function buildRouteSegments(route = {}) {
  const stops = normalizeRoute(route).stops;
  return stops.slice(0, -1).map((start, index) => {
    const end = stops[index + 1];
    const mode = start.modeToNext ?? 'walk';
    const detail = modeDetails[mode] ?? modeDetails.walk;
    const query = new URLSearchParams({
      api: '1',
      origin: `${start.lat},${start.lng}`,
      destination: `${end.lat},${end.lng}`,
      travelmode: detail.googleTravelMode,
    });
    return {
      index,
      start,
      end,
      mode,
      detail,
      googleTravelMode: detail.googleTravelMode,
      googleMapsUrl: `https://www.google.com/maps/dir/?${query}`,
      routeKind: mode === 'walk' ? '실제 도보 경로' : mode === 'taxi' ? '실제 도로 경로' : '도로망 참고 경로',
      osrmUrl: `${mode === 'walk' ? 'https://routing.openstreetmap.de/routed-foot/route/v1/driving' : 'https://router.project-osrm.org/route/v1/driving'}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`,
    };
  });
}

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

export function groupRouteStops(route = {}) {
  const groups = [];
  const byCoordinates = new Map();
  normalizeRoute(route).stops.forEach((stop, index) => {
    const key = `${stop.lat},${stop.lng}`;
    let group = byCoordinates.get(key);
    if (!group) {
      group = { lat: stop.lat, lng: stop.lng, numbers: [], names: [] };
      byCoordinates.set(key, group);
      groups.push(group);
    }
    group.numbers.push(index + 1);
    if (!group.names.includes(stop.name)) group.names.push(stop.name);
  });
  return groups;
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
