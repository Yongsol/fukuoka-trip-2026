import test from 'node:test';
import assert from 'node:assert/strict';
import { events, places, defaultChecklist, transportGuides, officialLinks } from '../src/data.js';

test('canonical trip data includes complete food, transport and checklist shapes', () => {
  const foodIds=new Set(places.filter(place=>place.category==='food').map(place=>place.id));
  for(const id of ['unafuji','hirao','hyotan','shinshin','akanoren','rakutenti','hanamidori','mentaiju','kiwamiya','yamanaka','kawaya','nikuichi','chikae','yoshizuka','nagahamake']) assert.ok(foodIds.has(id),id);
  assert.ok(places.every(place=>(Number.isFinite(place.lat)&&Number.isFinite(place.lng))||place.mapQuery));
  assert.deepEqual(transportGuides.map(guide=>guide.id),['airport-tenjin','tenjin-torius','torius-tenjin','tenjin-airport']);
  assert.ok(transportGuides.every(guide=>guide.mapsUrl.includes('travelmode=transit')));
  assert.ok(officialLinks.length>=7);
  assert.ok(events.every(event=>!event.id.startsWith('custom-')), 'custom- is reserved for user events');
  assert.equal(events.find(event=>event.id==='unafuji').end,'12:00');
  assert.match(events.find(event=>event.id==='return').notes,/시간표/);
  for(const id of ['hotel','sat-dinner','ic-card','esim','insurance','weather','zoo-closure','restaurant','airport-bus','route-out','route-return','fare','water','passport','power-bank','umbrella']) assert.ok(defaultChecklist.some(item=>item.id===id),id);
});
