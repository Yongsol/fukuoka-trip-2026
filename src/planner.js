const DATE_RE = /^2026-08-(28|29|30)$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;
const LIMITS = { checklist: 200, customEvents: 100, completedEvents: 500, title: 60, location: 80, notes: 200, label: 160, category: 40 };

export function eventsForDate(events, date) {
  return events.filter(e => e.date === date).toSorted((a, b) => (a.start || '').localeCompare(b.start || ''));
}
export function toggleChecklist(state, id) {
  return { ...state, checklist: state.checklist.map(item => item.id === id ? { ...item, done: !item.done } : item) };
}
export function toggleEvent(state, id) {
  const set = new Set(state.completedEvents || []);
  set.has(id) ? set.delete(id) : set.add(id);
  return { ...state, completedEvents: [...set] };
}

function plusOneHour(date, time) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const value = new Date(Date.UTC(year, month - 1, day, hour, minute) + 60 * 60 * 1000);
  return { date: value.toISOString().slice(0, 10), time: value.toISOString().slice(11, 16) };
}
function compareDateTime(dateA, timeA, dateB, timeB) { return `${dateA}T${timeA}`.localeCompare(`${dateB}T${timeB}`); }
function normalizedEventTimes(date, start, requestedEnd, requestedEndDate) {
  if (!DATE_RE.test(date) || !TIME_RE.test(start)) throw new Error('일정 제목, 날짜, 시간을 확인해 주세요.');
  if (!requestedEnd) {
    const next = plusOneHour(date, start);
    return { end: next.time, endDate: next.date };
  }
  if (!TIME_RE.test(requestedEnd)) throw new Error('종료 시간을 확인해 주세요.');
  const endDate = requestedEndDate || date;
  if (!ISO_DATE_RE.test(endDate) || compareDateTime(date, start, endDate, requestedEnd) >= 0) throw new Error('종료 시간은 시작 시간보다 늦어야 합니다.');
  return { end: requestedEnd, endDate };
}
export function addCustomEvent(state, input) {
  if (!Array.isArray(state.customEvents) || state.customEvents.length >= LIMITS.customEvents) throw new Error('사용자 일정은 최대 100개까지 추가할 수 있습니다.');
  const title = String(input.title || '').trim();
  if (!title || title.length > LIMITS.title) throw new Error('일정 제목, 날짜, 시간을 확인해 주세요.');
  const times = normalizedEventTimes(input.date, input.start, input.end, input.endDate);
  const event = { id: `custom-${globalThis.crypto?.randomUUID?.() || Date.now()}`, title, date: input.date, start: input.start, ...times, location: String(input.location || '').trim().slice(0, LIMITS.location), notes: String(input.notes || '').trim().slice(0, LIMITS.notes), category: 'custom', custom: true };
  return { ...state, customEvents: [...state.customEvents, event] };
}
export function deleteCustomEvent(state, id) { return { ...state, customEvents: state.customEvents.filter(e => e.id !== id) }; }
export function categoryFilter(items, category) { return category === 'all' ? items : items.filter(x => x.category === category); }

function localDateString(date) {
  const pad = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
export function departureReminderDecision({ now = new Date(), departure, permission, lastNotifiedDate = null, windowDays = 7 }) {
  const localDate = localDateString(now);
  const [year, month, day] = String(departure).split('-').map(Number);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(year, month - 1, day);
  const daysUntil = Math.round((target - today) / 86400000);
  const notify = permission === 'granted' && Number.isInteger(daysUntil) && daysUntil >= 0 && daysUntil <= windowDays && lastNotifiedDate !== localDate;
  return { notify, daysUntil, localDate };
}

export function createBackup(state) { return JSON.stringify({ ...state, version: 1, exportedAt: new Date().toISOString() }, null, 2); }
function assertUniqueIds(items, label) {
  const ids = new Set();
  for (const item of items) {
    if (!item || typeof item !== 'object' || Array.isArray(item) || !ID_RE.test(item.id || '') || ids.has(item.id)) throw new Error(`${label} ID가 올바르지 않습니다.`);
    ids.add(item.id);
  }
}
function cleanText(value, max, required = false) {
  if (typeof value !== 'string') { if (required) throw new Error('문자열 데이터가 올바르지 않습니다.'); return ''; }
  const result = value.trim();
  if ((required && !result) || result.length > max) throw new Error('문자열 데이터 길이가 올바르지 않습니다.');
  return result;
}
function sanitizeBackup(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.version !== 1 || !Array.isArray(value.checklist) || !Array.isArray(value.customEvents)) throw new Error('지원하지 않는 백업 형식입니다.');
  if (value.checklist.length > LIMITS.checklist || value.customEvents.length > LIMITS.customEvents) throw new Error('백업 항목이 너무 많습니다.');
  assertUniqueIds(value.checklist, '준비물');
  assertUniqueIds(value.customEvents, '사용자 일정');
  if (value.customEvents.some(item => !item.id.startsWith('custom-'))) throw new Error('사용자 일정 ID는 custom-으로 시작해야 합니다.');
  const checklist = value.checklist.map(item => {
    if (typeof item.done !== 'boolean') throw new Error('준비물 데이터가 올바르지 않습니다.');
    const clean = { id: item.id, done: item.done };
    if ('label' in item) clean.label = cleanText(item.label, LIMITS.label, true);
    if ('category' in item) clean.category = cleanText(item.category, LIMITS.category, true);
    return clean;
  });
  const customEvents = value.customEvents.map(item => {
    const title = cleanText(item.title, LIMITS.title, true);
    const times = normalizedEventTimes(item.date, item.start, item.end, item.endDate);
    return { id: item.id, title, date: item.date, start: item.start, ...times, location: cleanText(item.location ?? '', LIMITS.location), notes: cleanText(item.notes ?? '', LIMITS.notes), category: 'custom', custom: true };
  });
  const rawCompleted = value.completedEvents == null ? [] : value.completedEvents;
  if (!Array.isArray(rawCompleted) || rawCompleted.length > LIMITS.completedEvents) throw new Error('완료 일정 데이터가 올바르지 않습니다.');
  const completedEvents = [...new Set(rawCompleted.filter(id => typeof id === 'string' && ID_RE.test(id)))];
  return { version: 1, checklist, customEvents, completedEvents };
}
export function validateBackup(text) {
  try {
    const value = typeof text === 'string' ? JSON.parse(text) : text;
    return { valid: true, value: sanitizeBackup(value) };
  } catch (error) { return { valid: false, error: error.message || 'JSON을 읽을 수 없습니다.' }; }
}
export function restoreBackup(text) {
  const result = validateBackup(text);
  if (!result.valid) throw new Error(result.error);
  return result.value;
}

export function escapeICS(value = '') { return String(value).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;'); }
function stamp(date, time) { return `${date.replaceAll('-', '')}T${time.replace(':', '')}00`; }
function foldICSLine(line) {
  const encoder = new TextEncoder();
  const output = [];
  let part = '';
  let limit = 75;
  for (const character of line) {
    if (encoder.encode(part + character).length > limit) {
      output.push(part);
      part = ` ${character}`;
      limit = 75;
    } else part += character;
  }
  output.push(part);
  return output;
}
export function createICS(events) {
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Fukuoka Trip Planner//KO', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:후쿠오카 2박 3일',
    'BEGIN:VTIMEZONE', 'TZID:Asia/Tokyo', 'X-LIC-LOCATION:Asia/Tokyo', 'BEGIN:STANDARD', 'TZOFFSETFROM:+0900', 'TZOFFSETTO:+0900', 'TZNAME:JST', 'DTSTART:19700101T000000', 'END:STANDARD', 'END:VTIMEZONE'
  ];
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  for (const event of events) {
    const end = event.end ? { time: event.end, date: event.endDate || event.date } : plusOneHour(event.date, event.start || '09:00');
    lines.push('BEGIN:VEVENT', `UID:${escapeICS(event.id)}@fukuoka-planner`, `DTSTAMP:${dtstamp}`, `DTSTART;TZID=Asia/Tokyo:${stamp(event.date, event.start || '09:00')}`, `DTEND;TZID=Asia/Tokyo:${stamp(end.date, end.time)}`, `SUMMARY:${escapeICS(event.title)}`, `LOCATION:${escapeICS(event.location)}`, `DESCRIPTION:${escapeICS(event.notes)}`, 'END:VEVENT');
  }
  return `${lines.concat('END:VCALENDAR').flatMap(foldICSLine).join('\r\n')}\r\n`;
}
export function googleMapsUrl(place) {
  if (place.mapUrl) return place.mapUrl;
  if (Number.isFinite(place.lat) && Number.isFinite(place.lng)) return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${place.lat},${place.lng}`)}${place.googlePlaceId ? `&destination_place_id=${encodeURIComponent(place.googlePlaceId)}` : ''}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.mapQuery || place.name || '')}`;
}
export function downloadText(name, text, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
