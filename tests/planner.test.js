import test from 'node:test';
import assert from 'node:assert/strict';
import {
  eventsForDate, toggleChecklist, addCustomEvent, deleteCustomEvent,
  createBackup, validateBackup, restoreBackup, escapeICS, createICS,
  googleMapsUrl, categoryFilter, departureReminderDecision
} from '../src/planner.js';

const base = {
  version: 1,
  checklist: [{ id: 'passport', done: false }],
  customEvents: [],
  completedEvents: [],
};

test('eventsForDate filters and sorts built-in and custom events', () => {
  const events = [
    { id: 'b', date: '2026-08-29', start: '13:00' },
    { id: 'a', date: '2026-08-28', start: '15:00' },
    { id: 'c', date: '2026-08-29', start: '11:00' },
  ];
  assert.deepEqual(eventsForDate(events, '2026-08-29').map(e => e.id), ['c', 'b']);
});

test('checklist toggle is immutable and only toggles selected item', () => {
  const next = toggleChecklist(base, 'passport');
  assert.equal(base.checklist[0].done, false);
  assert.equal(next.checklist[0].done, true);
});

test('custom events can be added with normalized data and deleted', () => {
  const next = addCustomEvent(base, { title: '  카페  ', date: '2026-08-30', start: '10:30', location: '텐진' });
  assert.equal(next.customEvents.length, 1);
  assert.equal(next.customEvents[0].title, '카페');
  assert.match(next.customEvents[0].id, /^custom-/);
  assert.equal(deleteCustomEvent(next, next.customEvents[0].id).customEvents.length, 0);
  assert.throws(() => addCustomEvent(base, { title: '', date: 'x', start: '25:00' }), /일정/);
});

test('custom event rejects the 101st item', () => {
  const full = { ...base, customEvents: Array.from({ length: 100 }, (_, index) => ({ id: `custom-${index}` })) };
  assert.throws(
    () => addCustomEvent(full, { title: '초과 일정', date: '2026-08-30', start: '10:30' }),
    /100|일정/
  );
});

test('backup rejects a custom event ID that can collide with a built-in ID', () => {
  const payload = {
    ...base,
    customEvents: [{ id: 'flight-out', title: '충돌', date: '2026-08-28', start: '10:00', end: '11:00' }],
  };
  assert.equal(validateBackup(payload).valid, false);
  assert.throws(() => restoreBackup(payload), /ID|사용자 일정/);
});

test('custom event uses a one-hour default and validates an explicit end time', () => {
  const defaulted = addCustomEvent(base, { title:'카페', date:'2026-08-30', start:'10:30' }).customEvents[0];
  assert.equal(defaulted.end, '11:30');
  assert.equal(defaulted.endDate, '2026-08-30');
  const explicit = addCustomEvent(base, { title:'점심', date:'2026-08-29', start:'12:00', end:'13:45' }).customEvents[0];
  assert.equal(explicit.end, '13:45');
  assert.throws(() => addCustomEvent(base, { title:'오류', date:'2026-08-29', start:'13:00', end:'12:59' }), /종료/);
});

test('departure reminder is granted-only, bounded to seven days, and once per local day', () => {
  const input={departure:'2026-08-28', permission:'granted', now:new Date(2026,7,21,9), lastNotifiedDate:null};
  assert.deepEqual(departureReminderDecision(input), {notify:true, daysUntil:7, localDate:'2026-08-21'});
  assert.equal(departureReminderDecision({...input, now:new Date(2026,7,20,23,59)}).notify, false);
  assert.equal(departureReminderDecision({...input, permission:'default'}).notify, false);
  assert.equal(departureReminderDecision({...input, lastNotifiedDate:'2026-08-21'}).notify, false);
  assert.equal(departureReminderDecision({...input, now:new Date(2026,7,29,9)}).notify, false);
});

test('categoryFilter supports all and exact categories', () => {
  const places = [{ category: 'food' }, { category: 'spot' }];
  assert.equal(categoryFilter(places, 'all').length, 2);
  assert.equal(categoryFilter(places, 'food').length, 1);
});

test('backup validation rejects malformed or unsupported content', () => {
  assert.equal(validateBackup(createBackup(base)).valid, true);
  assert.equal(validateBackup('{bad').valid, false);
  assert.equal(validateBackup(JSON.stringify({ version: 99 })).valid, false);
  assert.equal(validateBackup(JSON.stringify({ version: 1, checklist: 'no', customEvents: [] })).valid, false);
});

test('backup round trip returns sanitized state', () => {
  const restored = restoreBackup(createBackup(base));
  assert.deepEqual(restored.checklist, base.checklist);
  assert.deepEqual(restored.customEvents, []);
});

test('backup restore strictly validates fields and strips untrusted extras', () => {
  const payload={version:1,checklist:[{id:'passport',done:true,label:'여권',category:'필수',admin:true}],customEvents:[{id:'custom-safe',title:' 카페 ',date:'2026-08-30',start:'10:00',end:'11:00',endDate:'2026-08-30',location:' 텐진 ',notes:' 메모 ',category:'custom',custom:true,evil:'x'}],completedEvents:['flight-out',9,'flight-out'],unknown:'drop'};
  const restored=restoreBackup(JSON.stringify(payload));
  assert.deepEqual(restored.checklist,[{id:'passport',done:true,label:'여권',category:'필수'}]);
  assert.deepEqual(restored.customEvents,[{id:'custom-safe',title:'카페',date:'2026-08-30',start:'10:00',end:'11:00',endDate:'2026-08-30',location:'텐진',notes:'메모',category:'custom',custom:true}]);
  assert.deepEqual(restored.completedEvents,['flight-out']);
  assert.equal(validateBackup({version:1,checklist:[{id:'../bad',done:true}],customEvents:[]}).valid,false);
  assert.equal(validateBackup({version:1,checklist:[{id:'x',done:true},{id:'x',done:false}],customEvents:[]}).valid,false);
  assert.equal(validateBackup({version:1,checklist:[],customEvents:[{id:'x',title:'bad',date:'2026-08-29',start:'12:00',end:'11:00'}]}).valid,false);
});

test('ICS escaping handles punctuation and newlines', () => {
  assert.equal(escapeICS('A, B; C\\D\nE'), 'A\\, B\\; C\\\\D\\nE');
});

test('ICS includes calendar, timezone, escaped events and CRLF', () => {
  const ics = createICS([{ id:'1', title:'식사, 예약', date:'2026-08-29', start:'11:00', end:'12:30', location:'다이묘', notes:'확정' }]);
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /BEGIN:VTIMEZONE\r\nTZID:Asia\/Tokyo\r\n/);
  assert.match(ics, /DTSTART;TZID=Asia\/Tokyo:20260829T110000/);
  assert.match(ics, /SUMMARY:식사\\, 예약/);
  assert.match(ics, /END:VCALENDAR\r\n$/);
});

test('ICS folds long Korean lines at 75 UTF-8 octets without breaking characters', () => {
  const notes='긴한글설명'.repeat(30);
  const ics=createICS([{id:'long',title:'아주 긴 한글 제목 '.repeat(12),date:'2026-08-29',start:'11:00',end:'12:00',location:'후쿠오카',notes}]);
  for(const line of ics.split('\r\n').filter(Boolean)) assert.ok(Buffer.byteLength(line,'utf8')<=75, `${Buffer.byteLength(line,'utf8')} octets: ${line}`);
  assert.match(ics,/\r\n /);
  assert.ok(!ics.includes('\ufffd'));
});

test('Google Maps URL is safely generated for coordinates or a query-only place', () => {
  assert.match(googleMapsUrl({ lat: 33.59, lng: 130.4, name: '텐진 역' }), /destination=33.59%2C130.4/);
  assert.match(googleMapsUrl({ name: '호텔 그란돌체 하카타', mapQuery:'ホテルグランドルチェ博多' }), /search\/\?api=1&query=/);
});
