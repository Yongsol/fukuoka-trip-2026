import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { trip, events, places, restaurantGuide, defaultChecklist, transportGuides, officialLinks } from '../src/data.js';

const byEventId=id=>events.find(event=>event.id===id);
const byPlaceId=id=>places.find(place=>place.id===id);
const execFileAsync=promisify(execFile);

test('numbered restaurant guide has exactly 11 Tenjin-area entries with contiguous map numbers', () => {
  const expectedIds=['shinshin-tenjin','unafuji-daimyo','kanetora-tenjin-nishidori','ichifuji-imaizumi','rakutenti-tenjin-nishidori','ooyama-fukuoka-parco','mentaiju-nishinakasu','fukutaro-tenjin-terra','shinmiura-tenjin','mamichan-yatai','pyonkichi'];
  assert.equal(restaurantGuide.length,11);
  assert.deepEqual(restaurantGuide.map(place=>place.number),Array.from({length:11},(_,index)=>index+1));
  assert.deepEqual(restaurantGuide.map(place=>place.id),expectedIds);
  assert.equal(new Set(restaurantGuide.map(place=>place.id)).size,11);
  assert.equal(new Set(restaurantGuide.map(place=>place.number)).size,11);
  for(const place of restaurantGuide){
    assert.notEqual(place.area,'하카타역',place.id);
    assert.ok(Number.isFinite(place.lat),`${place.id}.lat`);
    assert.ok(Number.isFinite(place.lng),`${place.id}.lng`);
    assert.match(place.image,/^assets\/restaurants\/\d{2}-.*\.webp$/,place.id);
    assert.ok(place.imageAlt,`${place.id}.imageAlt`);
    assert.match(place.imageSource,/^https:\/\//,`${place.id}.imageSource`);
    assert.match(place.officialUrl,/^https:\/\//,`${place.id}.officialUrl`);
    assert.ok(place.menuUrl||place.sourceUrl,`${place.id}.menu/source`);
    assert.ok(place.mapQuery,`${place.id}.mapQuery`);
    assert.ok(place.address,`${place.id}.address`);
    assert.ok(place.menus.length>0,`${place.id}.menus`);
    assert.ok(place.menus.every(menu=>menu.name&&menu.price&&menu.priceNote),`${place.id}.representative prices`);
    assert.match(place.hotelAccess,/니시테츠 그랜드 호텔에서 도보 약/,`${place.id}.hotelAccess`);
  }
  for(const removed of ['shinshin-deitos','kanetora-deitos','ichifuji-hakata','rakutenti-hakata-ekimae','shoboan','hamadaya-honten','nakasu-yatai']) assert.equal(restaurantGuide.some(place=>place.id===removed),false,removed);
});

test('restaurant WebP files are decodable when ImageMagick is available', async t => {
  try{await execFileAsync('identify',['-version']);}catch{t.skip('ImageMagick identify not installed');return;}
  for(const place of restaurantGuide) await execFileAsync('identify',[new URL(`../${place.image}`,import.meta.url).pathname]);
});

test('restaurant guide assets, 11-place numbered map markup, and offline cache are wired', async () => {
  await Promise.all(restaurantGuide.map(place=>access(new URL(`../${place.image}`,import.meta.url))));
  const [html,app,css,worker]=await Promise.all([
    readFile(new URL('../index.html',import.meta.url),'utf8'),
    readFile(new URL('../src/app.js',import.meta.url),'utf8'),
    readFile(new URL('../styles.css',import.meta.url),'utf8'),
    readFile(new URL('../sw.js',import.meta.url),'utf8'),
  ]);
  assert.match(html,/id="food-map"/);
  assert.match(html,/id="food-list" class="cards"/);
  assert.match(html,/텐진역 근처 맛집 11곳/);
  assert.doesNotMatch(html,/전체 맛집 1–33|총 33곳|legacy-food-list|social-food-list/);
  assert.doesNotMatch(app,/foodScope|socialFoodCandidates|renderSocialFood|legacy-food-list|social-food-list/);
  assert.match(app,/L\.divIcon\(\{className:'food-number-icon'/);
  assert.match(app,/텐진역 인근 맛집 11곳의 번호 위치 지도/);
  assert.match(app,/focusRestaurant\(place\.id,\{scroll:true\}\)/);
  assert.match(css,/#food-map\{height:clamp/);
  for(const place of restaurantGuide) assert.ok(worker.includes(`./${place.image}`),place.image);
});

test('canonical trip keeps all food candidates and valid UI shapes', () => {
  const foodIds=new Set(places.filter(place=>place.category==='food').map(place=>place.id));
  for(const id of ['unafuji','hirao','hyotan','shinshin','akanoren','rakutenti','hanamidori','mentaiju','kiwamiya','yamanaka','kawaya','nikuichi','chikae','yoshizuka','nagahamake']) assert.ok(foodIds.has(id),id);
  assert.equal(foodIds.size,15);
  assert.ok(places.every(place=>(Number.isFinite(place.lat)&&Number.isFinite(place.lng))||place.mapQuery));
  assert.ok(transportGuides.every(guide=>guide.mapsUrl.includes('travelmode=transit')));
  assert.ok(events.every(event=>!event.id.startsWith('custom-')), 'custom- is reserved for user events');
});

test('events have unique ids, complete schema, and chronological non-overlap per day', () => {
  assert.equal(new Set(events.map(event=>event.id)).size,events.length);
  for(const event of events){
    for(const key of ['id','date','start','end','title','location','notes','category']) assert.equal(typeof event[key],'string',`${event.id}.${key}`);
    assert.match(event.date,/^2026-08-(28|29|30)$/);
    assert.match(event.start,/^\d{2}:\d{2}$/);
    assert.match(event.end,/^\d{2}:\d{2}$/);
    assert.ok(event.start<event.end,event.id);
    assert.ok(Number.isFinite(event.lat),`${event.id}.lat`);
    assert.ok(Number.isFinite(event.lng),`${event.id}.lng`);
  }
  for(const date of new Set(events.map(event=>event.date))){
    const day=events.filter(event=>event.date===date);
    assert.deepEqual(day.map(event=>event.start),[...day].sort((a,b)=>a.start.localeCompare(b.start)).map(event=>event.start),date);
    for(let index=1;index<day.length;index+=1) assert.ok(day[index-1].end<=day[index].start,`${day[index-1].id} overlaps ${day[index].id}`);
  }
});

test('Friday sequence covers hotel check-in, Donki, and hotel return', () => {
  assert.deepEqual(events.filter(event=>event.date==='2026-08-28').map(event=>event.id),[
    'flight-out','airport-hotel','fri-dinner','donki-whisky','convenience',
  ]);
});

test('fixed hotel replaces obsolete hotel candidates', () => {
  assert.equal(trip.hotelArea,'Nishitetsu Grand Hotel');
  const hotel=byPlaceId('hotel-nishitetsu-grand');
  assert.ok(hotel);
  assert.equal(hotel.category,'stay');
  assert.match(hotel.caption,/예약 확정/);
  for(const id of ['hotel-grandolce','hotel-tokyu','hotel-onefive','hotel-richmond','ohori']) assert.equal(byPlaceId(id),undefined,id);
});

test('Saturday schedules Unafuji before LaLaport and Akachan Honpo', () => {
  const unafuji=byEventId('unafuji');
  const transit=byEventId('to-lalaport');
  const shopping=byEventId('akachan-shopping');
  assert.equal(unafuji.date,'2026-08-29');
  assert.equal(unafuji.start,'11:00');
  assert.equal(unafuji.fixed,true);
  assert.ok(unafuji.end<=transit.start);
  assert.ok(transit.end<=shopping.start);
  assert.equal(shopping.start,'13:30');
  assert.equal(transit.location,'우나후지 → 라라포트 후쿠오카');
  assert.doesNotMatch(transit.location,/호텔/);
  assert.match(transit.notes,/하카타·JR 다케시타/);
  assert.ok(byPlaceId('lalaport'));
  assert.equal(byPlaceId('akachan-honpo').officialUrl,'https://stores.akachan.jp/282');
  assert.equal(events.some(event=>event.date==='2026-08-29'&&event.id==='zoo'),false);
});

test('zoo and beaver visit is on Sunday with operating-hour notes', () => {
  const zoo=byEventId('zoo');
  assert.equal(zoo.date,'2026-08-30');
  assert.match(zoo.title,/비버/);
  assert.match(zoo.notes,/10:00~17:00/);
  assert.match(zoo.notes,/16:30/);
  assert.equal(zoo.fixed,true);
});

test('CARGOPASS records only verified cutoff and counter details', () => {
  const handoff=byEventId('cargopass-handoff');
  const pickup=byEventId('cargopass-pickup');
  assert.equal(handoff.date,'2026-08-30');
  assert.equal(handoff.start,'09:30');
  assert.match(handoff.notes,/10:00/);
  assert.match(handoff.notes,/08:00~19:30/);
  assert.match(handoff.notes,/조기 종료/);
  assert.match(handoff.notes,/니시테츠 그랜드 호텔 이용 가능/);
  assert.match(pickup.location,/국제선 1F/);
  assert.ok(byPlaceId('cargopass'));
  for(const url of ['https://cargopass.jp/hotel','https://cargopass.jp/about']) assert.ok(officialLinks.some(link=>link.url===url),url);
  assert.doesNotMatch(`${handoff.notes} ${pickup.notes}`,/14:00/);
});

test('verified map points use the actual POIs rather than nearby roads or stops', () => {
  const expected={
    airport:[33.5848221,130.4442945],
    zoo:[33.6527549,130.4928927],
    lalaport:[33.5647723,130.4403204],
    'hotel-nishitetsu-grand':[33.5898408,130.3954577],
    unafuji:[33.588668,130.3948393],
  };
  for(const [id,[lat,lng]] of Object.entries(expected)){
    const place=byPlaceId(id);
    assert.ok(place,id);
    assert.equal(place.lat,lat,`${id}.lat`);
    assert.equal(place.lng,lng,`${id}.lng`);
  }
});

test('Sunday departure sequence preserves 15:30 transit, 18:30 pickup, and 20:30 flight', () => {
  assert.deepEqual(['torius-airport','cargopass-pickup','flight-home'].map(id=>byEventId(id).start),['15:30','18:30','20:30']);
});

test('transport guides cover the revised four legs and retain Sunday uncertainty', () => {
  assert.deepEqual(transportGuides.map(guide=>guide.id),['airport-hotel','unafuji-lalaport','hotel-torius','torius-airport']);
  const lalaport=transportGuides.find(guide=>guide.id==='unafuji-lalaport');
  const outbound=transportGuides.find(guide=>guide.id==='hotel-torius');
  const airport=transportGuides.find(guide=>guide.id==='torius-airport');
  assert.match(lalaport.title,/우나후지 → 라라포트/);
  assert.match(lalaport.primary,/하카타·JR 다케시타/);
  assert.match(lalaport.mapsUrl,/origin=炭焼\+うな富士\+福岡大名別邸/);
  assert.match(outbound.primary,/270번/);
  assert.match(outbound.primary,/43분/);
  assert.match(outbound.fallback,/정확한 출발 시각은 아직 미확정/);
  assert.match(airport.fallback,/택시 직행/);
  assert.match(byEventId('torius-airport').notes,/정확한 일요일 시간표 미확정/);
});

test('official links and checklist cover revised bookings and day-of safeguards', () => {
  for(const url of ['https://stores.akachan.jp/282','https://mitsui-shopping-park.com/lalaport/fukuoka/access/train.html','https://www.biopark.co.jp/toriuszoo/info.html']) assert.ok(officialLinks.some(link=>link.url===url),url);
  for(const deadPath of [`/${370}`,`/archives/${140}`,`/info${'/'}`]) assert.equal(officialLinks.some(link=>link.url.includes(deadPath)),false,deadPath);
  for(const id of ['hotel','unafuji','sat-dinner','cargopass','tripp-trapp','ic-card','esim','insurance','weather','zoo-closure','restaurant','airport-bus','route-out','route-airport','taxi-fallback','fare','cargopass-pack','cargopass-cutoff','water','passport','power-bank','umbrella']) assert.ok(defaultChecklist.some(item=>item.id===id),id);
  assert.match(defaultChecklist.find(item=>item.id==='route-out').label,/8\/30 일요일/);
  assert.match(defaultChecklist.find(item=>item.id==='cargopass-cutoff').label,/10:00/);
});
