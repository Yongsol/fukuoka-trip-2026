export { restaurantGuide } from './restaurant-data.js?v=22';

export const trip={title:'후쿠오카 2박 3일',dates:'2026. 8. 28 — 8. 30',hotelArea:'Nishitetsu Grand Hotel',timezone:'Asia/Tokyo'};

export const events=[
  {id:'flight-out',date:'2026-08-28',start:'15:00',end:'16:30',title:'TW205 · 후쿠오카로',location:'인천공항 T1 → 후쿠오카 국제선',notes:'출발 전 탑승권의 시각·터미널 재확인',category:'flight',lat:33.5848221,lng:130.4442945},
  {id:'airport-hotel',date:'2026-08-28',start:'17:30',end:'18:30',title:'공항에서 호텔로 이동·체크인',location:'후쿠오카 국제선 → 니시테츠 그랜드 호텔',notes:'Airport Express로 텐진 이동 후 도보 · 만석이면 무료 국내선 연락버스+지하철 또는 택시',category:'transit',lat:33.5898408,lng:130.3954577},
  {id:'fri-dinner',date:'2026-08-28',start:'19:00',end:'20:15',title:'텐진 첫 저녁',location:'텐진·다이묘',notes:'입국 지연과 컨디션에 따라 식당 후보 조정',category:'food',lat:33.5898408,lng:130.3954577},
  {id:'donki-whisky',date:'2026-08-28',start:'20:15',end:'21:30',title:'돈키호테·위스키 쇼핑',location:'돈키호테 후쿠오카 텐진 본점',notes:'재고와 면세 마감 조건은 현장에서 확인',category:'spot',lat:33.5891,lng:130.3972},
  {id:'convenience',date:'2026-08-28',start:'21:30',end:'22:00',title:'편의점 들러 호텔 복귀',location:'니시테츠 그랜드 호텔 인근',notes:'물과 다음 날 아침 간식 준비',category:'spot',lat:33.5898408,lng:130.3954577},
  {id:'sat-breakfast',date:'2026-08-29',start:'08:30',end:'09:30',title:'아침 식사·여유 시간',location:'호텔·텐진',notes:'라라포트 10시 선행 방문은 11시 우나후지 예약과 충돌하므로 하지 않기',category:'food',lat:33.5898408,lng:130.3954577},
  {id:'unafuji',date:'2026-08-29',start:'11:00',end:'12:15',title:'炭焼 うな富士 福岡大名別邸',location:'다이묘',notes:'11:00 예약 확정 · 식사 후 라라포트로 이동',category:'food',fixed:true,lat:33.588668,lng:130.3948393},
  {id:'to-lalaport',date:'2026-08-29',start:'12:30',end:'13:30',title:'라라포트 후쿠오카로 이동',location:'우나후지 → 라라포트 후쿠오카',notes:'12:30~13:00 사이 출발 · 대중교통은 하카타·JR 다케시타 경유 경로를 당일 확인하거나 택시 이용',category:'transit',lat:33.5647723,lng:130.4403204},
  {id:'akachan-shopping',date:'2026-08-29',start:'13:30',end:'15:30',title:'아카짱혼포 · Tripp Trapp 쇼핑',location:'미쓰이 쇼핑파크 라라포트 후쿠오카',notes:'의자 재고·색상·면세와 큰 상자 수령 방법을 매장에 확인',category:'spot',fixed:true,lat:33.5647723,lng:130.4403204},
  {id:'taxi-hotel',date:'2026-08-29',start:'15:30',end:'16:15',title:'상자와 함께 택시로 호텔 복귀',location:'라라포트 → 니시테츠 그랜드 호텔',notes:'대형 상자가 실리는 차량인지 승차 전 확인',category:'transit',lat:33.5898408,lng:130.3954577},
  {id:'sat-rest',date:'2026-08-29',start:'16:15',end:'17:30',title:'호텔 휴식·구매품 정리',location:'니시테츠 그랜드 호텔',notes:'일요일 CARGOPASS 인계용 짐도 미리 정리',category:'spot',lat:33.5898408,lng:130.3954577},
  {id:'sat-shopping',date:'2026-08-29',start:'17:30',end:'19:00',title:'텐진·다이묘 쇼핑',location:'텐진·다이묘',notes:'저녁 예약 시간에 맞춰 유동적으로 단축',category:'spot',lat:33.5903,lng:130.4017},
  {id:'sat-dinner',date:'2026-08-29',start:'19:00',end:'21:00',title:'예약한 텐진 저녁',location:'텐진',notes:'후보 중 한 곳 예약·휴무 재확인',category:'food',lat:33.5903,lng:130.4017},
  {id:'sun-breakfast',date:'2026-08-30',start:'08:00',end:'09:00',title:'아침 식사·체크아웃 준비',location:'니시테츠 그랜드 호텔',notes:'공항 배송 짐과 직접 휴대할 짐 분리',category:'food',lat:33.5898408,lng:130.3954577},
  {id:'cargopass-handoff',date:'2026-08-30',start:'09:30',end:'09:45',title:'CARGOPASS 프런트 인계',location:'니시테츠 그랜드 호텔 프런트',notes:'호텔→공항 당일 배송 공식 접수 마감 10:00 전 인계 · 니시테츠 그랜드 호텔 이용 가능 · 국제선 1F 카운터 08:00~19:30(조기 종료 가능)',category:'transit',fixed:true,lat:33.5898408,lng:130.3954577},
  {id:'to-torius',date:'2026-08-30',start:'10:00',end:'11:15',title:'270번으로 트리아스 이동',location:'호텔 → 텐진 중앙우체국 앞 → 트리아스 히사야마',notes:'270번 버스 구간 공식 안내 약 43분 · 2026-08-30 일요일 정확한 시간은 미확정이라 전날 공식 검색',category:'transit',lat:33.6527549,lng:130.4928927},
  {id:'zoo',date:'2026-08-30',start:'11:15',end:'13:15',title:'トリアスふれあい動物園 · 비버',location:'트리아스 히사야마 E21',notes:'일요일 일정 · 운영 10:00~17:00, 입장 마감 16:30 · 비버 전시·체험 공지 확인',category:'spot',fixed:true,lat:33.6527549,lng:130.4928927},
  {id:'torius-lunch',date:'2026-08-30',start:'13:15',end:'14:15',title:'트리아스 점심',location:'트리아스 히사야마',notes:'혼잡하면 푸드코트 등 빠른 선택 우선',category:'food',lat:33.6527549,lng:130.4928927},
  {id:'torius-buffer',date:'2026-08-30',start:'14:15',end:'15:30',title:'트리아스 여유 시간·출발 준비',location:'트리아스 히사야마',notes:'15:30 출발을 넘기지 말고 버스 정류장·택시 승차 위치 확인',category:'spot',lat:33.6527549,lng:130.4928927},
  {id:'torius-airport',date:'2026-08-30',start:'15:30',end:'18:30',title:'트리아스에서 국제선으로 이동',location:'트리아스 히사야마 → 후쿠오카공항 국제선',notes:'대중교통으로 18:30 국제선 도착 목표 · 정확한 일요일 시간표 미확정 · 연결이 불안하면 즉시 공항까지 택시 직행',category:'transit',lat:33.5848221,lng:130.4442945},
  {id:'cargopass-pickup',date:'2026-08-30',start:'18:30',end:'18:45',title:'CARGOPASS 짐 수령',location:'후쿠오카공항 국제선 1F',notes:'카운터 공식 운영 08:00~19:30이나 조기 종료 가능하므로 18:30 도착 계획 · 실제 수령 가능 시각은 예약 시 확인',category:'transit',fixed:true,lat:33.5848221,lng:130.4442945},
  {id:'flight-home',date:'2026-08-30',start:'20:30',end:'22:00',title:'TW208 · 인천으로',location:'후쿠오카 국제선 → 인천공항 T1',notes:'탑승권의 시각·터미널 재확인',category:'flight',lat:33.5848221,lng:130.4442945}
];

const food=(id,name,caption,tip,mapQuery,officialUrl)=>({id,name,category:'food',caption,tip,mapQuery,...(officialUrl?{officialUrl}:{})});
export const places=[
  {id:'icn-t1',name:'인천공항 제1터미널',category:'transit',caption:'TW205 출발 · TW208 도착',mapQuery:'인천국제공항 제1여객터미널'},
  {id:'airport',name:'후쿠오카공항 국제선',category:'transit',caption:'Airport Express 국제선 8번 승강장 · CARGOPASS 국제선 1F 수령',lat:33.5848221,lng:130.4442945,mapQuery:'福岡空港 国際線旅客ターミナル'},
  {id:'tenjin',name:'텐진역',category:'stay',caption:'숙소·교통·쇼핑 거점',lat:33.5903,lng:130.4017,mapQuery:'天神駅 福岡'},
  {id:'tenjin-bus',name:'니시테쓰 텐진 고속버스터미널',category:'transit',caption:'Airport Express 승하차 · 공항행 6번 승강장',mapQuery:'西鉄天神高速バスターミナル'},
  {id:'tenjin-post',name:'텐진 중앙우체국 앞 정류장',category:'transit',caption:'270번은 18번 승강장·동쪽 방면 확인',mapQuery:'天神中央郵便局前 18番 東向き'},
  {id:'zoo',name:'トリアスふれあい動物園',category:'spot',caption:'일 11:15~13:15 · 비버 · 단지 E21',lat:33.6527549,lng:130.4928927,mapQuery:'トリアスふれあい動物園',officialUrl:'https://www.biopark.co.jp/toriuszoo/'},
  {id:'torius',name:'트리아스 히사야마',category:'spot',caption:'270번 トリアス久山 정류장',mapQuery:'トリアス久山'},
  {id:'donki',name:'돈키호테 후쿠오카 텐진 본점',category:'spot',caption:'확인 당시 24시간 · 방문 전 재확인 · 텐진역 도보 약 10분',mapQuery:'ドン・キホーテ 福岡天神本店'},
  {id:'hotel-nishitetsu-grand',name:'니시테츠 그랜드 호텔',category:'stay',caption:'예약 확정 · CARGOPASS 호텔→공항 당일 배송 가능',lat:33.5898408,lng:130.3954577,mapQuery:'西鉄グランドホテル',officialUrl:'https://nnr-h.com/grandhotel/'},
  {id:'lalaport',name:'미쓰이 쇼핑파크 라라포트 후쿠오카',category:'spot',caption:'토 13:30~15:30 · 아카짱혼포 쇼핑',lat:33.5647723,lng:130.4403204,mapQuery:'ららぽーと福岡',officialUrl:'https://mitsui-shopping-park.com/lalaport/fukuoka/'},
  {id:'akachan-honpo',name:'아카짱혼포 라라포트 후쿠오카점',category:'spot',caption:'Tripp Trapp 재고·색상·면세 확인',lat:33.5647723,lng:130.4403204,mapQuery:'アカチャンホンポ ららぽーと福岡店',officialUrl:'https://stores.akachan.jp/282'},
  {id:'cargopass',name:'CARGOPASS',category:'transit',caption:'일 10:00 전 호텔 인계 · 국제선 1F 카운터 수령',mapQuery:'福岡空港 国際線 CARGOPASS',officialUrl:'https://cargopass.jp/hotel'},
  {...food('unafuji','炭焼 うな富士 福岡大名別邸','나고야식 숯불 민물장어 · 히츠마부시·우나기동','토 11:00 예약. 식사 후 12:30~13:00 라라포트로 출발','炭焼 うな富士 福岡大名別邸','https://sumiyaki-unafuji.com/'),lat:33.588668,lng:130.3948393,address:'2 Chome-1-41 Daimyo, Chuo Ward, Fukuoka 810-0041',phone:'+81 92-406-1288'},
  food('hirao','텐푸라 히라오 텐진 아크로스점','갓 튀긴 후쿠오카식 텐푸라 · 아지와이/오코노미 정식·오징어 젓갈','예약 없이 줄 서기. 11시대 또는 14시 이후 추천','天麩羅処ひらお 天神アクロス店','https://www.hirao-foods.net/shop/shop7/'),
  food('hyotan','효탄스시 본점','대중적인 스시 · 모둠 니기리·제철 생선·게 크림 고로케','오픈 전 대기 또는 늦은 점심 추천','ひょうたん寿司 本店 福岡'),
  food('shinshin','하카타 라멘 ShinShin 텐진 본점','돈코츠 라멘 · ShinShin 라멘·야키라멘','관광객 대기가 매우 길 수 있어 식사 정시 피하기','博多らーめん ShinShin 天神本店','https://www.hakata-shinshin.com/'),
  food('akanoren','원조 아카노렌 셋짱 라멘 텐진 본점','전통 하카타 라멘 · 라멘+반볶음밥 세트','ShinShin 대기가 너무 길 때 좋은 대안','元祖赤のれん 節ちゃんラーメン 天神本店'),
  food('rakutenti','모츠나베 라쿠텐치 텐진 본점','부추 모츠나베 · 마무리 짬뽕면','저녁 예약 권장. 붐비면 인근 지점 검색','元祖もつ鍋楽天地 天神本店','https://rakutenti.com/'),
  food('hanamidori','하카타 하나미도리 텐진점','미즈타키 · 미즈타키 코스·닭 완자','조리 시간이 길어 토요일 저녁 예약 추천','博多華味鳥 天神店','https://www.hanamidori.net/'),
  food('mentaiju','원조 하카타 멘타이주','명란 덮밥·명란 츠케멘','점심보다 아침 방문이 대기 단축에 유리','元祖博多めんたい重','https://www.mentaiju.com/'),
  food('kiwamiya','키와미야 후쿠오카 파르코점','직접 구워 먹는 함바그','대기가 매우 길 수 있어 동물원 가기 전 식사로는 비추천','極味や 福岡パルコ店','https://www.kiwamiya.com/'),
  food('yamanaka','하카타 모츠나베 야마나카 아카사카점','차분한 분위기의 미소·간장 모츠나베','토요일 저녁 사전 예약 권장','博多もつ鍋 やま中 赤坂店','https://motsunabe-yamanaka.com/'),
  food('kawaya','카와야 케고점','여러 번 구운 닭껍질 꼬치 · 토리카와·사가리','예약 수요가 강하므로 가능한 한 일찍 예약','かわ屋 警固店'),
  food('nikuichi','NIKUICHI 야쿠인점','규슈산 흑모와규 · 와규 모둠·우설·갈비','토요일 저녁 예약 권장','焼肉 NIKUICHI 薬院店','https://www.nikuichi.com/'),
  food('chikae','치카에 후쿠오카점','활어·회·일식 · 오징어 활어회는 당일 입하 확인','한 끼를 제대로 먹는 곳. 주말 예약 권장','稚加榮 福岡店','https://chikae.co.jp/'),
  food('yoshizuka','요시즈카 우나기야','장어구이 · 우나주·가바야키','주말 점심 대기가 길 수 있어 오픈 전 방문 권장','博多名代 吉塚うなぎ屋','https://yoshizukaunagi.com/'),
  food('nagahamake','원조 라멘 나가하마케','소박한 나가하마계 돈코츠 · 라멘·가에다마','현금 준비 권장','元祖ラーメン長浜家')
];

export const transportGuides=[
  {id:'airport-hotel',title:'국제선 → 니시테츠 그랜드 호텔',primary:'국제선 8번 승강장에서 Airport Express 직행 → 니시테쓰 텐진 고속버스터미널, 이후 호텔까지 도보. 버스 약 30~40분이며 입석 불가라 만석이면 다음 차.',fallback:'무료 국내선 연락버스 → 지하철 후쿠오카공항역 → 텐진역 → 호텔 도보. 짐이 많거나 지연되면 택시.',mapsUrl:'https://www.google.com/maps/dir/?api=1&origin=福岡空港+国際線旅客ターミナル&destination=西鉄グランドホテル&travelmode=transit'},
  {id:'unafuji-lalaport',title:'우나후지 → 라라포트 후쿠오카',primary:'11시 우나후지 식사를 마친 뒤 12:30~13:00 출발. 대중교통은 하카타·JR 다케시타 경유 경로를 당일 확인하고 13:30 아카짱혼포 도착 목표.',fallback:'시간을 우선하면 우나후지에서 라라포트까지 택시, 큰 상자 구매 후에는 라라포트에서 호텔까지 택시가 안전.',mapsUrl:'https://www.google.com/maps/dir/?api=1&origin=炭焼+うな富士+福岡大名別邸&destination=ららぽーと福岡&travelmode=transit'},
  {id:'hotel-torius',title:'호텔·텐진 → 트리아스',primary:'호텔에서 텐진 중앙우체국 앞 정류장까지 이동 → 18번·동쪽 방면에서 270번 トリアス久山 행. 버스 구간 공식 안내 약 43분.',fallback:'2026-08-30 일요일 정확한 출발 시각은 아직 미확정. 전날 니시테쓰 공식 검색에서 실제 시간과 다음 편까지 확인·캡처.',mapsUrl:'https://www.google.com/maps/dir/?api=1&origin=西鉄グランドホテル&destination=トリアスふれあい動物園&travelmode=transit'},
  {id:'torius-airport',title:'트리아스 → 후쿠오카공항 국제선',primary:'15:30 출발, 당일 검색한 대중교통 연결로 18:30 국제선 도착 목표. CARGOPASS 국제선 1F 카운터에서 짐을 수령.',fallback:'일요일 버스 연결이 늦거나 불확실하면 트리아스에서 국제선까지 택시 직행. 20:30 TW208보다 짐 수령 마감 여유를 우선.',mapsUrl:'https://www.google.com/maps/dir/?api=1&origin=トリアス久山&destination=福岡空港+国際線旅客ターミナル&travelmode=transit'}
];

export const officialLinks=[
  {title:'니시테츠 그랜드 호텔 공식',url:'https://nnr-h.com/grandhotel/'},{title:'Airport Express 공식 안내',url:'https://www.nishitetsu.jp/bus/rosen/airportexpress/'},{title:'공항 무료 터미널 연락버스',url:'https://www.fukuoka-airport.jp/access/bus2.html'},{title:'후쿠오카 지하철 노선도',url:'https://subway.city.fukuoka.lg.jp/eng/route/index.php'},{title:'니시테쓰 날짜별 버스 검색',url:'https://jik.nishitetsu.jp/'},{title:'라라포트 후쿠오카 교통 안내',url:'https://mitsui-shopping-park.com/lalaport/fukuoka/access/train.html'},{title:'아카짱혼포 라라포트 후쿠오카점',url:'https://stores.akachan.jp/282'},{title:'CARGOPASS 호텔 배송·대상 호텔',url:'https://cargopass.jp/hotel'},{title:'CARGOPASS 이용·카운터 안내',url:'https://cargopass.jp/about'},{title:'TORIUS 공식 교통 안내',url:'https://torius.com/access/'},{title:'동물원 공식 홈페이지',url:'https://www.biopark.co.jp/toriuszoo/'},{title:'동물원 운영시간·요금',url:'https://www.biopark.co.jp/toriuszoo/info.html'}
];

export const defaultChecklist=[
  {id:'hotel',label:'니시테츠 그랜드 호텔 예약 내용·금연 조건 재확인',category:'예약',done:false},{id:'unafuji',label:'토요일 11:00 우나후지 예약 재확인',category:'예약',done:false},{id:'sat-dinner',label:'토요일 저녁 식당 예약',category:'예약',done:false},{id:'cargopass',label:'CARGOPASS 호텔→공항 배송 신청·결제',category:'예약',done:false},{id:'tripp-trapp',label:'아카짱혼포 Tripp Trapp 재고·색상·면세 확인',category:'출발 전',done:false},{id:'ic-card',label:'교통계 IC카드 준비',category:'준비',done:false},{id:'esim',label:'eSIM 또는 로밍 준비',category:'준비',done:false},{id:'insurance',label:'여행자보험 확인',category:'필수',done:false},{id:'weather',label:'날씨·태풍 예보 확인',category:'출발 전',done:false},{id:'zoo-closure',label:'일요일 동물원·비버 체험 임시중단 공지 확인',category:'출발 전',done:false},{id:'restaurant',label:'식당 휴무일·예약 재확인',category:'출발 전',done:false},{id:'airport-bus',label:'Airport Express 최신 시간표 확인',category:'출발 전',done:false},{id:'route-out',label:'8/30 일요일 270번 트리아스행 정확한 시간표 확인·캡처',category:'8/29 밤',done:false},{id:'route-airport',label:'트리아스→국제선 대중교통 연결과 다음 편 캡처',category:'8/29 밤',done:false},{id:'taxi-fallback',label:'트리아스→국제선 택시 승차 위치·예상비 확인',category:'8/29 밤',done:false},{id:'fare',label:'현재 버스 운임 확인',category:'8/29 밤',done:false},{id:'final-zoo-weather',label:'동물원 공지와 날씨 최종 확인',category:'8/29 밤',done:false},{id:'cargopass-pack',label:'배송 짐 분리·태그 후 프런트 09:30 인계 준비',category:'8/29 밤',done:false},{id:'cash-ic',label:'IC카드·엔화 현금',category:'당일',done:false},{id:'bus-screenshots',label:'일요일 버스 시간표 캡처',category:'당일',done:false},{id:'cargopass-cutoff',label:'10:00 전 호텔 인계·18:30 국제선 1F 수령',category:'8/30',done:false},{id:'water',label:'물·휴대용 선풍기·수건',category:'소지품',done:false},{id:'passport',label:'여권·항공권',category:'필수',done:false},{id:'power-bank',label:'보조배터리',category:'소지품',done:false},{id:'umbrella',label:'양산 또는 우산',category:'소지품',done:false}
];
export const dateLabels={'2026-08-28':'8/28 금 · 도착','2026-08-29':'8/29 토 · 핵심 일정','2026-08-30':'8/30 일 · 출국'};
