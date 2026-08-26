import { events, places, restaurantGuide, defaultChecklist, dateLabels, transportGuides, officialLinks } from './data.js?v=20';
import { socialFoodCandidates } from './social-food-data.js?v=20';
import { eventsForDate, toggleChecklist, toggleEvent, addCustomEvent, deleteCustomEvent, categoryFilter, createBackup, restoreBackup, createICS, googleMapsUrl, downloadText, departureReminderDecision } from './planner.js';
import { addAttachment, listAttachments, getAttachment, deleteAttachment } from './storage.js';
import { safeTooltipContent } from './security.js';
import { applyTimelineMotion, dateTransitionDirection, observeReducedMotion, overviewMotionMode, prefersReducedMotion, revealElements, updateTabIndicator } from './motion.js';
import { buildRouteSegments, createDeferredTask, createRequestController, dailyRoutes, groupRouteStops, modeDetails, normalizeRoute, routePosition } from './routes.js';

const KEY='fukuoka-planner-state-v1';
const REMINDER_KEY='fukuoka-planner-reminder-date';
let state=loadState(); let selectedDate='2026-08-28'; let selectedRouteDate='2026-08-28'; let map; let foodMap; let foodMarkers=new Map(); let foodScope='attached'; let markers=[]; let routeLayer; let overviewRouteLayer; let overviewStopMarkers=[]; let transportMarker; let overviewRouteRequest; let nominatimRequest=null; let lastNominatimStarted=0;
let routeAnimation={frame:null,progress:0,playing:false,startedAt:null};
let routeAnimationGeneration=0;let reducedMotion=prefersReducedMotion();
const routeRequests=createRequestController();const mapInitTask=createDeferredTask();
function freshState(){return {version:1,checklist:structuredClone(defaultChecklist),customEvents:[],completedEvents:[]};}
function mergeChecklistDefaults(clean){const byId=new Map(clean.checklist.map(item=>[item.id,item]));return {...clean,checklist:defaultChecklist.map(item=>({...structuredClone(item),done:byId.get(item.id)?.done??item.done}))};}
function loadState(){try{const raw=localStorage.getItem(KEY);if(!raw)return freshState();return mergeChecklistDefaults(restoreBackup(raw));}catch{try{localStorage.removeItem(KEY);}catch{}return freshState();}}
function persist(nextState){try{localStorage.setItem(KEY,JSON.stringify(nextState));state=nextState;return true;}catch{toast('저장 공간이 부족하거나 차단되어 변경을 저장하지 못했어요.');return false;}}
function esc(value=''){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function toast(message){const el=document.querySelector('#toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),3200);}

function renderDates(){document.querySelector('#date-chips').innerHTML=Object.entries(dateLabels).map(([date,label])=>`<button data-date="${date}" class="${date===selectedDate?'active':''}">${label}</button>`).join('');}
function renderTimeline(direction='still'){const all=[...events,...state.customEvents];const done=new Set(state.completedEvents);const list=eventsForDate(all,selectedDate);const timeline=document.querySelector('#timeline');timeline.innerHTML=list.map(e=>`<article class="event ${e.fixed?'fixed':''} ${done.has(e.id)?'done':''}"><button class="icon-btn" data-complete="${esc(e.id)}" aria-label="${done.has(e.id)?'완료 취소':'완료 표시'}">${done.has(e.id)?'✓':'○'}</button><span class="event-time">${esc(e.start)}${e.end?` — ${esc(e.end)}`:''}</span>${e.fixed?'<span class="tag">고정</span>':''}<h3>${esc(e.title)}</h3><p>📍 ${esc(e.location||'장소 미정')}</p>${e.notes?`<p>${esc(e.notes)}</p>`:''}${e.custom?`<div class="event-actions"><button class="icon-btn" data-delete="${esc(e.id)}" aria-label="일정 삭제">×</button></div>`:''}</article>`).join('')||'<p class="status">등록된 일정이 없어요.</p>';applyTimelineMotion(timeline,direction,reducedMotion);}
function renderSchedule(direction='still'){renderDates();renderTimeline(direction);}
function renderChecklist(){const done=state.checklist.filter(x=>x.done).length;const percent=Math.round(done/state.checklist.length*100)||0;document.querySelector('#check-progress').textContent=`${percent}%`;document.querySelector('#progress-bar').style.width=`${percent}%`;document.querySelector('#check-list').innerHTML=state.checklist.map(x=>`<label class="check-item"><input data-check="${esc(x.id)}" type="checkbox" ${x.done?'checked':''}><span>${esc(x.label)}</span><small>${esc(x.category)}</small></label>`).join('');}
function renderSocialFood(){
  const list=document.querySelector('#social-food-list');if(!list)return;
  list.innerHTML=socialFoodCandidates.map(candidate=>{
    const mapped=restaurantGuide.find(place=>place.id===candidate.existingRestaurantId);
    const numbers=candidate.existingRestaurantNumbers??(mapped?[mapped.number]:[]);
    const mapping=numbers.length?`<p class="social-food-duplicate">${candidate.exactBranchMatch?'동일 지점':'같은 브랜드·다른 지점'} · 정식 #${numbers.join('·#')} 카드</p>`:'<p class="social-food-archive">번호 카드와 연결하지 않은 과거 저장 증거</p>';
    const cardButton=mapped?`<button class="social-card-link" type="button" data-social-focus="${esc(mapped.id)}">정식 #${mapped.number} 카드 보기</button>`:'';
    const badge=mapped?(candidate.exactBranchMatch?'<span class="social-food-badge is-read">상호·지점 일치</span>':'<span class="social-food-badge branch-diff">같은 브랜드·다른 지점</span>'):'<span class="social-food-badge needs-check">과거 저장 · 카드 미연결</span>';
    return `<article class="social-food-card"><div class="social-food-photo"><img src="${esc(candidate.image)}" alt="${esc(candidate.title)} SNS 저장 사진" loading="lazy" width="527" height="695"></div><div class="social-food-copy">${badge}<h3>${esc(candidate.title)}</h3><p>${esc(candidate.subtitle)}</p>${mapping}<div class="social-food-actions">${cardButton}<a class="social-map-link" href="${googleMapsUrl(candidate)}" target="_blank" rel="noopener">저장 사진 지점 Maps ↗</a></div><small>사용자 제공 SNS 캡처 · 원 게시물/이용 권한 확인 권장</small></div></article>`;
  }).join('');
}
function restaurantCardLinks(place){
  const mapUrl=googleMapsUrl(place);
  const officialUrl=place.officialUrl||'';
  const sourceUrl=place.menuUrl||place.sourceUrl||'';
  const isMapUrl=url=>url.includes('google.com/maps');
  const links=[`<a href="${mapUrl}" target="_blank" rel="noopener">Google Maps</a>`];
  if(officialUrl&&!isMapUrl(officialUrl)){
    const sameSource=!sourceUrl||sourceUrl===officialUrl;
    links.push(`<a href="${esc(officialUrl)}" target="_blank" rel="noopener">${sameSource?'공식·메뉴 정보':'공식 정보'}</a>`);
  }
  if(sourceUrl&&sourceUrl!==officialUrl&&!isMapUrl(sourceUrl))links.push(`<a href="${esc(sourceUrl)}" target="_blank" rel="noopener">가격·메뉴 출처</a>`);
  return links.join('');
}
function renderFood(){document.querySelector('#food-map-legend').innerHTML=restaurantGuide.map(p=>`<button type="button" data-focus-restaurant="${esc(p.id)}"><i>${p.number}</i><span>${esc(p.koreanName)}</span></button>`).join('');document.querySelector('#food-list').innerHTML=restaurantGuide.map(p=>`<article class="food-card restaurant-card" id="restaurant-${esc(p.id)}" data-restaurant="${esc(p.id)}" tabindex="0" aria-labelledby="restaurant-title-${esc(p.id)}"><div class="restaurant-photo-wrap"><img class="restaurant-photo" src="${esc(p.image)}" alt="${esc(p.imageAlt)}" loading="lazy" width="640" height="420"><button class="restaurant-number" type="button" data-focus-restaurant="${esc(p.id)}" aria-label="지도에서 ${p.number}번 ${esc(p.koreanName)} 보기">${p.number}</button><a class="photo-source" href="${esc(p.imageSource)}" target="_blank" rel="noopener">사진 출처 ↗</a></div><div class="restaurant-copy"><div class="restaurant-meta"><span>${esc(p.category)}</span><span>${esc(p.area)}</span></div><h3 id="restaurant-title-${esc(p.id)}">${esc(p.koreanName)}</h3><p class="japanese-name" lang="ja">${esc(p.name)}</p><p class="hotel-access">🏨 ${esc(p.hotelAccess)}</p><ul class="menu-list">${p.menus.map(menu=>`<li><span>${esc(menu.name)}</span><strong>${esc(menu.price)}</strong><small>${esc(menu.priceNote)}</small></li>`).join('')}</ul><address>📍 ${esc(p.address)}</address><p class="restaurant-evidence"><b>근거</b> ${esc(p.evidenceNote)}</p><div class="card-links">${restaurantCardLinks(p)}</div></div></article>`).join('');const featuredIds=new Set(['unafuji','shinshin','rakutenti','mentaiju']);document.querySelector('#legacy-food-list').innerHTML=places.filter(p=>p.category==='food'&&!featuredIds.has(p.id)).map(p=>`<article class="food-card"><span>${esc(p.type||'맛집 후보')}</span><h3>${esc(p.name)}</h3><p>${esc(p.caption||'대표 메뉴는 공식 메뉴에서 확인하세요.')}</p><p>${esc(p.tip||'방문 직전 영업 정보를 확인하세요.')}</p><a class="important-link" href="${googleMapsUrl(p)}" target="_blank" rel="noopener">지도에서 보기 ↗</a></article>`).join('');}
function renderTransport(){document.querySelector('#transport-guides').innerHTML=transportGuides.map(g=>`<article class="transport-card"><h3>${esc(g.title)}</h3><p><b>1순위</b> ${esc(g.primary)}</p><p><b>대안</b> ${esc(g.fallback)}</p><a class="important-link" href="${esc(g.mapsUrl)}" target="_blank" rel="noopener">Google Maps 대중교통 ↗</a></article>`).join('');document.querySelector('#official-links').innerHTML=officialLinks.map(link=>`<a class="important-link" href="${esc(link.url)}" target="_blank" rel="noopener">${esc(link.title)} ↗</a>`).join('');}

const tabs=document.querySelector('.tabs');
const isOverviewActive=()=>document.querySelector('#map')?.classList.contains('active')===true;
function showTab(id){const activeButton=tabs.querySelector(`[data-tab="${id}"]`);tabs.querySelectorAll('button').forEach(b=>{b.classList.toggle('active',b===activeButton);b.toggleAttribute('aria-current',b===activeButton)});document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===id));updateTabIndicator(tabs,activeButton);if(id==='map')mapInitTask.schedule(initMap,isOverviewActive);else{overviewRouteRequest?.abort();mapInitTask.cancel();stopRouteAnimation();}if(id==='food')requestAnimationFrame(()=>{if(document.querySelector('#food')?.classList.contains('active'))initFoodMap();});if(id==='vault')renderAttachments();}
tabs.addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b)showTab(b.dataset.tab)});
document.querySelector('#date-chips').addEventListener('click',e=>{const b=e.target.closest('[data-date]');if(b){const direction=dateTransitionDirection(selectedDate,b.dataset.date);selectedDate=b.dataset.date;renderSchedule(direction);}});
document.querySelector('#timeline').addEventListener('click',e=>{const complete=e.target.closest('[data-complete]');if(complete&&persist(toggleEvent(state,complete.dataset.complete)))renderTimeline();const del=e.target.closest('[data-delete]');if(del&&confirm('이 일정을 삭제할까요?')&&persist(deleteCustomEvent(state,del.dataset.delete))){renderTimeline();toast('일정을 삭제했어요.');}});
document.querySelector('#check-list').addEventListener('change',e=>{if(e.target.dataset.check){if(persist(toggleChecklist(state,e.target.dataset.check)))renderChecklist();else renderChecklist();}});

const dialog=document.querySelector('#event-dialog');document.querySelector('#add-open').onclick=()=>dialog.showModal();document.querySelector('#dialog-close').onclick=()=>dialog.close();document.querySelector('#event-form').onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));try{const next=addCustomEvent(state,data);if(!persist(next))return;selectedDate=data.date;renderSchedule();e.currentTarget.reset();dialog.close();toast('새 일정을 추가했어요.');}catch(error){document.querySelector('#form-error').textContent=error.message;}};

function initMap(){if(map){map.invalidateSize();renderOverviewRoute();return;}if(!window.L){document.querySelector('#map-status').textContent='지도 라이브러리를 불러오지 못했어요. 일정과 Google Maps 링크는 계속 사용할 수 있습니다.';return;}map=L.map('leaflet-map',{zoomControl:true}).setView([33.606,130.42],12);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);renderMarkers('all');renderOverviewRoute();}
function updateFoodScopeControls(){document.querySelectorAll('[data-food-scope]').forEach(button=>{const active=button.dataset.foodScope===foodScope;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});}
function renderFoodMapMarkers(){
  if(!foodMap)return;
  foodMarkers.forEach(marker=>marker.remove());foodMarkers.clear();
  const visible=foodScope==='attached'?restaurantGuide.filter(place=>place.number<=11):restaurantGuide;
  const bounds=[];
  const visualOffsets=new Map([[2,[-28,-10]],[3,[28,-12]],[4,[-24,-28]],[5,[24,32]],[8,[-30,28]],[9,[28,28]]]);
  visible.forEach(place=>{const [offsetX,offsetY]=visualOffsets.get(place.number)??[0,0];const icon=L.divIcon({className:'food-number-icon',html:`<span>${place.number}</span>`,iconSize:[30,30],iconAnchor:[15-offsetX,15-offsetY]});const marker=L.marker([place.lat,place.lng],{icon,title:`${place.number}. ${place.koreanName}`,riseOnHover:true,riseOffset:500}).addTo(foodMap).bindTooltip(safeTooltipContent(document,`${place.number}. ${place.koreanName}`),{direction:'top',offset:[offsetX,offsetY-12],className:'food-map-tooltip'}).on('click',()=>focusRestaurant(place.id,{scroll:true}));foodMarkers.set(place.id,marker);bounds.push([place.lat,place.lng]);});
  if(bounds.length)foodMap.fitBounds(bounds,{padding:[28,28],maxZoom:14});
  updateFoodScopeControls();
  document.querySelectorAll('#food-map-legend [data-focus-restaurant]').forEach(button=>{
    const place=restaurantGuide.find(item=>item.id===button.dataset.focusRestaurant);
    button.hidden=foodScope==='attached'&&place?.number>11;
  });
  const mapRegion=document.querySelector('#food-map');if(mapRegion)mapRegion.setAttribute('aria-label',foodScope==='attached'?'첨부 맛집 11곳의 번호 위치 지도':'전체 맛집 33곳의 번호 위치 지도');
  const status=document.querySelector('#food-map-status');if(status)status.textContent=foodScope==='attached'?'첨부 이미지의 1–11번을 지도와 번호 목록에 표시했습니다. 번호를 누르면 같은 카드로 이동해요.':'첨부 맛집과 기존 텐진·SNS 후보 전체 1–33번을 표시했습니다. 밀집 구역은 확대해 보세요.';
}
function focusRestaurant(id,{scroll=false}={}){const place=restaurantGuide.find(item=>item.id===id);if(!place)return;if(foodMap&&!foodMarkers.has(id)){foodScope='all';renderFoodMapMarkers();}const marker=foodMarkers.get(id);if(foodMap&&marker){foodMap.setView([place.lat,place.lng],Math.max(foodMap.getZoom(),16),{animate:!reducedMotion});marker.openTooltip();}const card=document.querySelector(`#restaurant-${CSS.escape(id)}`);document.querySelectorAll('.restaurant-card.is-highlighted').forEach(item=>item.classList.remove('is-highlighted'));card?.classList.add('is-highlighted');if(scroll){card?.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'});card?.focus({preventScroll:true});const status=document.querySelector('#food-map-status');if(status)status.textContent=`${place.number}번 ${place.koreanName} 카드를 선택했습니다.`;}setTimeout(()=>card?.classList.remove('is-highlighted'),2200);}
function initFoodMap(){const status=document.querySelector('#food-map-status');if(foodMap){foodMap.invalidateSize();return;}if(!window.L){if(status)status.textContent='지도를 불러오지 못했어요. 각 카드의 Google Maps 링크를 이용해 주세요.';return;}foodMap=L.map('food-map',{zoomControl:true,scrollWheelZoom:false});L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(foodMap);renderFoodMapMarkers();}
document.querySelector('#food-list').addEventListener('click',event=>{if(event.target.closest('a'))return;const card=event.target.closest('[data-restaurant]');if(card)focusRestaurant(card.dataset.restaurant);});
document.querySelector('#food-list').addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&!event.target.closest('a,button')){event.preventDefault();const card=event.target.closest('[data-restaurant]');if(card)focusRestaurant(card.dataset.restaurant);}});
document.querySelector('#food-map-legend').addEventListener('click',event=>{const button=event.target.closest('[data-focus-restaurant]');if(button)focusRestaurant(button.dataset.focusRestaurant,{scroll:true});});
document.querySelector('.food-map-scope').addEventListener('click',event=>{const button=event.target.closest('[data-food-scope]');if(!button||button.dataset.foodScope===foodScope)return;foodScope=button.dataset.foodScope;renderFoodMapMarkers();});
document.querySelector('#social-food-list').addEventListener('click',event=>{const button=event.target.closest('[data-social-focus]');if(button)focusRestaurant(button.dataset.socialFocus,{scroll:true});});
 function stopRouteAnimation(){routeAnimationGeneration+=1;if(routeAnimation.frame!==null)cancelAnimationFrame(routeAnimation.frame);routeAnimation={...routeAnimation,frame:null,playing:false,startedAt:null};}
function transportIcon(mode){const detail=modeDetails[mode]??modeDetails.walk;return L.divIcon({className:'transport-marker',html:`<span aria-hidden="true">${detail.icon}</span>`,iconSize:[38,38],iconAnchor:[19,19]});}
function updateRoutePosition(progress){
  const route=normalizeRoute(dailyRoutes[selectedRouteDate]);const position=routePosition(route,progress);if(!position)return;
  transportMarker?.setLatLng([position.lat,position.lng]);
  if(transportMarker?.routeMode!==position.mode){transportMarker?.setIcon(transportIcon(position.mode));if(transportMarker)transportMarker.routeMode=position.mode;}
  const stop=route.stops[position.stopIndex];const detail=modeDetails[position.mode]??modeDetails.walk;
  const text=`${position.stopIndex+1}/${route.stops.length} ${stop.name}${progress<1?` · ${detail.icon} ${detail.label}`:''}`;
  const progressElement=document.querySelector('#route-progress');if(progressElement.textContent!==text)progressElement.textContent=text;
}
function startRouteAnimation(reset=false){
  const toggle=document.querySelector('#route-toggle');if(reducedMotion||!isOverviewActive())return;
  stopRouteAnimation();if(reset||routeAnimation.progress>=1)routeAnimation.progress=0;
  routeAnimation.playing=true;const base=routeAnimation.progress;const generation=routeAnimationGeneration;toggle.textContent='⏸ 일시정지';
  const tick=now=>{if(generation!==routeAnimationGeneration||!routeAnimation.playing)return;if(routeAnimation.startedAt===null)routeAnimation.startedAt=now;routeAnimation.progress=Math.min(1,base+(now-routeAnimation.startedAt)/6500);updateRoutePosition(routeAnimation.progress);if(routeAnimation.progress<1)routeAnimation.frame=requestAnimationFrame(tick);else{routeAnimation.playing=false;routeAnimation.frame=null;toggle.textContent='↻ 다시 재생';}};
  routeAnimation.frame=requestAnimationFrame(tick);
}
function renderRouteMotionState(){const route=normalizeRoute(dailyRoutes[selectedRouteDate]);const toggle=document.querySelector('#route-toggle');if(reducedMotion){stopRouteAnimation();routeAnimation.progress=0;updateRoutePosition(0);toggle.disabled=true;toggle.textContent='전체 경로 정적 표시';document.querySelector('#route-progress').textContent=`전체 경로 표시 · ${route.stops.length}개 정류장`;}else{toggle.disabled=false;updateRoutePosition(routeAnimation.progress);toggle.textContent=routeAnimation.progress>=1?'↻ 다시 재생':'▶ 재생';}}
async function fetchOverviewSegment(segment, signal){
  const controller=new AbortController();const relayAbort=()=>controller.abort();signal.addEventListener('abort',relayAbort,{once:true});const timeoutId=setTimeout(()=>controller.abort(),12000);
  try{
    const response=await fetch(segment.osrmUrl,{signal:controller.signal});
    if(!response.ok)throw new Error('route request failed');
    const json=await response.json();
    if(json.code!=='Ok'||!json.routes?.[0]?.geometry)throw new Error('route geometry missing');
    return json.routes[0];
  }finally{clearTimeout(timeoutId);signal.removeEventListener('abort',relayAbort);}
}
function openRouteSegment(segment){window.open(segment.googleMapsUrl,'_blank','noopener');}
function addClickableSegment(segment, geometry, fallback=false){
  const tooltip=`${segment.index+1}→${segment.index+2} ${segment.detail.icon} ${segment.detail.label} · ${segment.routeKind} · 눌러서 Google Maps 열기`;
  const style={color:segment.detail.color,weight:fallback?5:7,opacity:fallback ? .58 : .9,dashArray:fallback?'8 8':undefined,lineCap:'round',lineJoin:'round'};
  const layer=geometry?L.geoJSON(geometry,{style}):L.polyline([[segment.start.lat,segment.start.lng],[segment.end.lat,segment.end.lng]],style);
  layer.bindTooltip(tooltip,{sticky:true,className:'route-line-tooltip'}).on('click',()=>openRouteSegment(segment)).addTo(overviewRouteLayer);
  return layer;
}
async function renderOverviewRoute(){
  if(!map)return;stopRouteAnimation();routeAnimation.progress=0;overviewRouteRequest?.abort();overviewRouteRequest=new AbortController();
  const request=overviewRouteRequest;routeLayer?.remove();routeLayer=undefined;overviewRouteLayer?.remove();overviewStopMarkers.forEach(marker=>marker.remove());overviewStopMarkers=[];transportMarker?.remove();transportMarker=undefined;markers.forEach(marker=>marker.remove());markers=[];
  const route=normalizeRoute(dailyRoutes[selectedRouteDate]);const points=route.stops.map(stop=>[stop.lat,stop.lng]);const segments=buildRouteSegments(route);
  document.querySelector('#overview-date').textContent=route.label;document.querySelector('#overview-summary').textContent=route.summary;
  document.querySelector('#route-legend').innerHTML=segments.map(segment=>`<a class="route-leg-link" href="${esc(segment.googleMapsUrl)}" target="_blank" rel="noopener"><i style="--route-color:${segment.detail.color}"></i><span>${segment.index+1}→${segment.index+2} ${segment.detail.icon} ${esc(segment.detail.label)}</span><small>${esc(segment.start.name)} → ${esc(segment.end.name)} · ${esc(segment.routeKind)}</small></a>`).join('');
  overviewRouteLayer=L.featureGroup().addTo(map);const fallbackLayers=segments.map(segment=>addClickableSegment(segment,null,true));
  const locationGroups=groupRouteStops(route);
  overviewStopMarkers=locationGroups.map((group,index)=>{
    const direction=index%2===0?'top':'bottom';
    const offset=direction==='top'?[0,-12]:[0,12];const numberLabel=group.numbers.join('·');const placeLabel=group.names.join(' / ');
    return L.marker([group.lat,group.lng],{icon:L.divIcon({className:'route-stop-icon',html:`<span>${numberLabel}</span>`,iconSize:[44,32],iconAnchor:[22,16]})})
      .bindTooltip(safeTooltipContent(document,placeLabel),{permanent:true,direction,offset,className:'route-stop-label',opacity:.96})
      .on('click',()=>window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${group.lat},${group.lng}`)}`,'_blank','noopener'))
      .addTo(map);
  });
  map.stop();map.fitBounds(L.latLngBounds(points),{paddingTopLeft:[100,72],paddingBottomRight:[100,72],maxZoom:14,animate:false});
  const progressElement=document.querySelector('#route-progress');const toggle=document.querySelector('#route-toggle');toggle.disabled=true;toggle.textContent='경로 불러오는 중…';progressElement.textContent=`도로망 경로 계산 중 · ${segments.length}개 구간`;
  let loaded=0;let completed=0;
  const tasks=segments.map(async(segment,index)=>{
    try{
      const result=await fetchOverviewSegment(segment,request.signal);
      if(request!==overviewRouteRequest||request.signal.aborted)return;
      fallbackLayers[index].remove();addClickableSegment(segment,result.geometry);loaded+=1;
      map.fitBounds(overviewRouteLayer.getBounds(),{paddingTopLeft:[100,72],paddingBottomRight:[100,72],maxZoom:14,animate:false});
    }catch{}
    finally{
      completed+=1;
      if(request===overviewRouteRequest&&!request.signal.aborted)progressElement.textContent=completed<segments.length?`${completed}/${segments.length}개 구간 확인 · 성공 ${loaded}`:loaded===segments.length?`도로망 경로 표시 · ${loaded}개 구간 · 선을 눌러 길찾기`:`${loaded}/${segments.length}개 도로망 경로 표시 · 나머지는 직선 대체`;
    }
  });
  await Promise.allSettled(tasks);
  if(request===overviewRouteRequest){toggle.disabled=false;toggle.textContent='↻ 실제 경로 새로고침';}
}
document.querySelector('#overview-days').addEventListener('click',event=>{const button=event.target.closest('[data-route-date]');if(!button||button.dataset.routeDate===selectedRouteDate)return;overviewRouteRequest?.abort();if(routeRequests.cancel())document.querySelector('#map-status').textContent='날짜 변경으로 자동차 경로 계산을 취소했어요.';selectedRouteDate=button.dataset.routeDate;document.querySelectorAll('#overview-days button').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});renderOverviewRoute();});
document.querySelector('#route-toggle').addEventListener('click',()=>renderOverviewRoute());
function hasCoordinates(p){return Number.isFinite(p.lat)&&Number.isFinite(p.lng);}
function renderMarkers(category){if(!map)return;markers.forEach(m=>m.remove());markers=categoryFilter(places,category).filter(hasCoordinates).map(p=>L.marker([p.lat,p.lng]).addTo(map).bindTooltip(safeTooltipContent(document,p.name)).on('click',()=>selectPlace(p)));}
function selectPlace(p){document.querySelector('#place-card').innerHTML=`<h3>${esc(p.name)}</h3><p>${esc(p.caption||'검색한 장소')}</p><a class="important-link" href="${googleMapsUrl(p)}" target="_blank" rel="noopener">Google Maps에서 보기 ↗</a>`;if(hasCoordinates(p))map?.panTo([p.lat,p.lng]);}
document.querySelector('#map-filters').onclick=e=>{const b=e.target.closest('[data-category]');if(!b)return;document.querySelectorAll('#map-filters button').forEach(x=>x.classList.toggle('active',x===b));renderMarkers(b.dataset.category);};
const NOMINATIM_ATTRIBUTION='검색 데이터: © OpenStreetMap contributors · Nominatim';
const wait=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));
document.querySelector('#search-form').onsubmit=async e=>{
  e.preventDefault();
  if(nominatimRequest)return;
  const query=document.querySelector('#place-search').value.trim();if(!query||!map)return;
  const form=e.currentTarget;const submit=form.querySelector('button[type="submit"],button');const status=document.querySelector('#map-status');
  nominatimRequest=new AbortController();submit.disabled=true;status.textContent=`장소를 찾고 있어요… · ${NOMINATIM_ATTRIBUTION}`;
  let timeout;
  try{
    await wait(Math.max(0,1000-(Date.now()-lastNominatimStarted)));
    lastNominatimStarted=Date.now();timeout=setTimeout(()=>nominatimRequest?.abort(),10000);
    const url=new URL('https://nominatim.openstreetmap.org/search');url.search=new URLSearchParams({q:`${query}, Fukuoka, Japan`,format:'jsonv2',limit:'5',countrycodes:'jp','accept-language':'ko'});
    const response=await fetch(url,{headers:{Accept:'application/json'},signal:nominatimRequest.signal});if(!response.ok)throw new Error('search failed');
    const results=await response.json();if(!Array.isArray(results)||!results.length){status.textContent=`검색 결과가 없어요. 일본어 이름이나 더 짧은 검색어를 시도해 주세요. · ${NOMINATIM_ATTRIBUTION}`;return;}
    const r=results[0];const displayName=String(r.display_name??'검색한 장소');const p={name:displayName.split(',')[0],caption:displayName,lat:Number(r.lat),lng:Number(r.lon)};if(!hasCoordinates(p))throw new Error('invalid coordinates');
    L.marker([p.lat,p.lng]).addTo(map).bindTooltip(safeTooltipContent(document,p.name)).openTooltip();map.setView([p.lat,p.lng],15);selectPlace(p);status.textContent=`${results.length}개의 검색 결과를 찾았어요. 첫 번째 장소를 표시합니다. · ${NOMINATIM_ATTRIBUTION}`;
  }catch{status.textContent=`장소 검색 서비스에 연결할 수 없어요. 아래 Google Maps 링크를 이용해 주세요. · ${NOMINATIM_ATTRIBUTION}`;}
  finally{clearTimeout(timeout);nominatimRequest=null;submit.disabled=false;}
};
document.querySelector('.route-actions').onclick=async e=>{
  const button=e.target.closest('[data-route]');if(!button||!map||routeRequests.isBusy())return;
  const [a,b]=button.dataset.route.split(',').map(id=>places.find(p=>p.id===id));const status=document.querySelector('#map-status');if(!hasCoordinates(a)||!hasCoordinates(b)){status.textContent='좌표가 없는 장소는 Google Maps 검색 링크를 이용해 주세요.';return;}
  button.disabled=true;status.textContent='자동차 경로를 계산하고 있어요…';const request=routeRequests.begin(12000,()=>{button.disabled=false;});
  try{const response=await fetch(`https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`,{signal:request.controller.signal});if(!response.ok)throw new Error();const json=await response.json();if(json.code!=='Ok'||!json.routes?.[0])throw new Error();if(!routeRequests.isCurrent(request))return;routeLayer?.remove();routeLayer=L.geoJSON(json.routes[0].geometry,{style:{color:'#ef695c',weight:5}}).addTo(map);map.fitBounds(routeLayer.getBounds(),{padding:[30,30]});status.textContent=`예상 ${(json.routes[0].duration/60).toFixed(0)}분 · ${(json.routes[0].distance/1000).toFixed(1)}km (자동차·실시간 교통 미반영)`;}catch{if(!routeRequests.isCurrent(request))return;status.textContent='자동차 경로 서비스에 연결할 수 없어요. Google Maps 길찾기를 이용해 주세요.';selectPlace(b);}finally{routeRequests.finish(request);}
};

document.querySelector('#ics').onclick=()=>{downloadText('fukuoka-trip-2026.ics',createICS([...events,...state.customEvents]),'text/calendar;charset=utf-8');toast('캘린더 파일을 만들었어요.');};document.querySelector('#backup').onclick=()=>{downloadText('fukuoka-planner-backup.json',createBackup(state),'application/json');toast('백업을 저장했어요.');};document.querySelector('#restore').onchange=async e=>{try{if(!e.target.files[0])return;const next=mergeChecklistDefaults(restoreBackup(await e.target.files[0].text()));if(!persist(next))return;renderSchedule();renderChecklist();toast('백업을 복원했어요.');}catch(error){toast(`복원 실패: ${error.message}`);}finally{e.target.value='';}};
function maybeDepartureReminder(){if(!('Notification'in window)||Notification.permission!=='granted')return;try{const decision=departureReminderDecision({departure:'2026-08-28',permission:Notification.permission,lastNotifiedDate:localStorage.getItem(REMINDER_KEY)});if(decision.notify){new Notification(decision.daysUntil===0?'오늘 후쿠오카로 출발해요!':`후쿠오카 출발 D-${decision.daysUntil}`,{body:'체크리스트와 최신 교통 시간표를 확인해 주세요.',icon:'icons/icon.svg'});localStorage.setItem(REMINDER_KEY,decision.localDate);}}catch{toast('출발 알림을 표시하거나 기록하지 못했어요.');}}
document.querySelector('#notify').onclick=async()=>{try{if(!('Notification'in window)){toast('이 브라우저는 알림을 지원하지 않아요.');return;}const result=await Notification.requestPermission();if(result==='granted'){toast('출발 7일 전부터 앱을 열 때 하루 한 번 알림을 확인해요.');maybeDepartureReminder();}else toast('알림 권한이 허용되지 않았어요.');}catch{toast('알림 권한을 요청하지 못했어요.');}};
async function renderAttachments(){const box=document.querySelector('#attachment-list');try{const list=await listAttachments();box.innerHTML=list.length?list.map(x=>`<div class="attachment-row"><span>📎</span><div><b>${esc(x.name)}</b><br><small>${(x.size/1024).toFixed(1)} KB · ${new Date(x.createdAt).toLocaleDateString('ko')}</small></div><button data-download="${esc(x.id)}" aria-label="${esc(x.name)} 다운로드">↓</button><button data-remove="${esc(x.id)}" aria-label="${esc(x.name)} 삭제">×</button></div>`).join(''):'<p>아직 저장한 파일이 없어요.</p>';}catch{box.innerHTML='<p class="error">이 브라우저에서 기기 저장소를 열 수 없어요.</p>';}}
document.querySelector('#attachment-input').onchange=async e=>{try{if(e.target.files[0])await addAttachment(e.target.files[0]);await renderAttachments();toast('파일을 기기에 저장했어요.');}catch(error){toast(error.message||'파일을 저장하지 못했어요.');}finally{e.target.value='';}};document.querySelector('#attachment-list').onclick=async e=>{const down=e.target.closest('[data-download]');const remove=e.target.closest('[data-remove]');try{if(down){const record=await getAttachment(down.dataset.download);if(!record)throw new Error('파일을 찾을 수 없어요.');const a=document.createElement('a');a.href=URL.createObjectURL(record.blob);a.download=record.name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}if(remove&&confirm('이 파일을 삭제할까요?')){await deleteAttachment(remove.dataset.remove);await renderAttachments();toast('파일을 삭제했어요.');}}catch(error){toast(error.message||'파일 작업을 완료하지 못했어요.');}};
function networkStatus(){const pill=document.querySelector('#online-pill');pill.textContent=navigator.onLine?'온라인':'오프라인';pill.classList.toggle('offline',!navigator.onLine);}addEventListener('online',networkStatus);addEventListener('offline',networkStatus);networkStatus();
function renderDDay(){const today=new Date();today.setHours(0,0,0,0);const departure=new Date(2026,7,28);const days=Math.ceil((departure-today)/86400000);document.querySelector('#d-day').textContent=days>0?`D-${days}`:days===0?'D-DAY':days>=-2?'여행 중':'다녀온 여행';}renderDDay();
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>toast('오프라인 기능을 준비하지 못했지만 앱은 계속 사용할 수 있어요.')));
renderSchedule();renderChecklist();renderFood();renderSocialFood();renderTransport();maybeDepartureReminder();
document.body.classList.toggle('motion-ready',!reducedMotion);
observeReducedMotion(value=>{if(value===reducedMotion)return;const mode=overviewMotionMode(value,isOverviewActive());reducedMotion=value;document.body.classList.toggle('motion-ready',!reducedMotion);if(mode==='autoplay'&&map)renderOverviewRoute();else renderRouteMotionState();});
requestAnimationFrame(()=>{updateTabIndicator(tabs,tabs.querySelector('.active'));revealElements();});
addEventListener('resize',()=>updateTabIndicator(tabs,tabs.querySelector('.active')),{passive:true});
