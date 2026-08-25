export const trip={title:'후쿠오카 2박 3일',dates:'2026. 8. 28 — 8. 30',hotelArea:'텐진',timezone:'Asia/Tokyo'};

export const events=[
  {id:'flight-out',date:'2026-08-28',start:'15:00',end:'16:30',title:'TW205 · 후쿠오카로',location:'인천공항 T1 → 후쿠오카 국제선',notes:'출발 전 탑승권의 시각·터미널 재확인',category:'flight',lat:33.5859,lng:130.4507},
  {id:'airport-tenjin',date:'2026-08-28',start:'17:30',end:'18:20',title:'Airport Express로 텐진 체크인',location:'후쿠오카공항 국제선 8번 → 니시테쓰 텐진 버스터미널',notes:'직행 약 30~40분 · 확인 당시 현금 500엔/IC 480엔 · 입석 불가라 만석이면 다음 차. 대안: 무료 국내선 연락버스+지하철',category:'transit',lat:33.5903,lng:130.4017},
  {id:'night-tenjin',date:'2026-08-28',start:'19:00',end:'21:00',title:'텐진 첫 저녁 & 산책',location:'텐진·다이묘·나카스',notes:'도착 지연과 컨디션에 따라 조정',category:'spot',lat:33.5914,lng:130.4031},
  {id:'unafuji',date:'2026-08-29',start:'11:00',end:'12:00',title:'炭焼 うな富士 福岡大名別邸',location:'다이묘',notes:'예약 확정 · 바로 주문하고 늦어도 12:05 계산 시작',category:'food',fixed:true,lat:33.5869,lng:130.3942},
  {id:'taxi-zoo',date:'2026-08-29',start:'12:00',end:'12:50',title:'12:00~12:10 택시 출발',location:'우나후지 → 트리아스',notes:'13시 입장을 위해 12:10을 넘기지 않기 · 12:35~12:50 도착 예상',category:'transit',lat:33.6506,lng:130.4886},
  {id:'zoo',date:'2026-08-29',start:'13:00',end:'16:00',title:'トリアスふれあい動物園',location:'트리아스 히사야마 E21',notes:'고정 일정 · 퇴장 후 바로 귀환 정류장 이동',category:'spot',fixed:true,lat:33.6506,lng:130.4886},
  {id:'return',date:'2026-08-29',start:'16:10',end:'17:40',title:'270번 직행으로 텐진 복귀',location:'트리아스 히사야마 → 텐진',notes:'16:10 이후 텐진 방면 첫차 우선 · 전날 실제 시간표와 다음 편까지 재확인·캡처',category:'transit',lat:33.5903,lng:130.4017},
  {id:'dinner',date:'2026-08-29',start:'18:30',end:'20:30',title:'예약한 텐진 저녁',location:'텐진',notes:'후보 중 한 곳 예약·휴무 재확인',category:'food',lat:33.5903,lng:130.4017},
  {id:'ohori',date:'2026-08-30',start:'10:30',end:'12:00',title:'오호리·마이즈루 또는 텐진',location:'후쿠오카 시내',notes:'날씨와 짐 보관 상황에 따라 선택',category:'spot',lat:33.5861,lng:130.3764},
  {id:'lunch',date:'2026-08-30',start:'12:00',end:'13:30',title:'마지막 점심',location:'텐진·후쿠오카 시내',notes:'요시즈카 우나기야·치카에·멘타이주 중 선택',category:'food',lat:33.5903,lng:130.4017},
  {id:'shopping',date:'2026-08-30',start:'13:30',end:'16:00',title:'텐진 쇼핑 & 짐 찾기',location:'텐진·다이묘',notes:'15:30~16:00 숙소에서 짐 수령',category:'spot',lat:33.5904,lng:130.3999},
  {id:'to-airport',date:'2026-08-30',start:'16:30',end:'17:30',title:'Airport Express로 공항 이동',location:'니시테쓰 텐진 버스터미널 → 후쿠오카 국제선',notes:'16:30~16:50 출발, 17:30 전후 국제선 도착 목표 · 만석/정체 시 지하철+무료 연락버스',category:'transit',lat:33.5859,lng:130.4507},
  {id:'flight-home',date:'2026-08-30',start:'20:30',end:'22:00',title:'TW208 · 인천으로',location:'후쿠오카 국제선 → 인천공항 T1',notes:'탑승권의 시각·터미널 재확인',category:'flight',lat:33.5859,lng:130.4507}
];

const food=(id,name,caption,tip,mapQuery,officialUrl)=>({id,name,category:'food',caption,tip,mapQuery,...(officialUrl?{officialUrl}:{})});
export const places=[
  {id:'icn-t1',name:'인천공항 제1터미널',category:'transit',caption:'TW205 출발 · TW208 도착',mapQuery:'인천국제공항 제1여객터미널'},
  {id:'airport',name:'후쿠오카공항 국제선',category:'transit',caption:'Airport Express 국제선 8번 승강장',lat:33.5859,lng:130.4507,mapQuery:'福岡空港 国際線旅客ターミナル'},
  {id:'tenjin',name:'텐진역',category:'stay',caption:'숙소·교통·쇼핑 거점',lat:33.5903,lng:130.4017,mapQuery:'天神駅 福岡'},
  {id:'tenjin-bus',name:'니시테쓰 텐진 고속버스터미널',category:'transit',caption:'Airport Express 승하차 · 공항행 6번 승강장',mapQuery:'西鉄天神高速バスターミナル'},
  {id:'tenjin-post',name:'텐진 중앙우체국 앞 정류장',category:'transit',caption:'270번은 18번 승강장·동쪽 방면 확인',mapQuery:'天神中央郵便局前 18番 東向き'},
  {id:'zoo',name:'トリアスふれあい動物園',category:'spot',caption:'토 13:00~16:00 · 단지 E21',lat:33.6506,lng:130.4886,mapQuery:'トリアスふれあい動物園',officialUrl:'https://www.biopark.co.jp/toriuszoo/'},
  {id:'torius',name:'트리아스 히사야마',category:'spot',caption:'270번 トリアス久山 정류장',mapQuery:'トリアス久山'},
  {id:'donki',name:'돈키호테 후쿠오카 텐진 본점',category:'spot',caption:'확인 당시 24시간 · 방문 전 재확인 · 텐진역 도보 약 10분',mapQuery:'ドン・キホーテ 福岡天神本店'},
  {id:'ohori',name:'오호리 공원',category:'spot',caption:'마지막 날 산책 후보',lat:33.5861,lng:130.3764},
  {id:'hotel-grandolce',name:'호텔 그란돌체 하카타',category:'stay',caption:'1순위 · 텐진역 도보 7~8분 · 금연/취소조건 재확인',mapQuery:'ホテルグランドルチェ博多'},
  {id:'hotel-tokyu',name:'도큐스테이 후쿠오카 텐진',category:'stay',caption:'2순위 · 객실 편의시설 장점 · 취소조건 재확인',mapQuery:'東急ステイ福岡天神'},
  {id:'hotel-onefive',name:'더 원파이브 빌라 후쿠오카',category:'stay',caption:'넓은 킹침대 · 텐진역에서 후보 중 가장 멂',mapQuery:'The OneFive Villa Fukuoka'},
  {id:'hotel-richmond',name:'리치몬드 호텔 텐진 니시도리',category:'stay',caption:'위치·가격 장점 · 확인 최저가는 흡연실이라 금연 재고 확인',mapQuery:'リッチモンドホテル天神西通'},
  {...food('unafuji','炭焼 うな富士 福岡大名別邸','나고야식 숯불 민물장어 · 히츠마부시·우나기동','토 11:00 예약. 12:00~12:10 택시 출발을 위해 늦어도 12:05 계산 시작','炭焼 うな富士 福岡大名別邸','https://sumiyaki-unafuji.com/'),lat:33.5869,lng:130.3942,address:'2 Chome-1-41 Daimyo, Chuo Ward, Fukuoka 810-0041',phone:'+81 92-406-1288'},
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
  {id:'airport-tenjin',title:'국제선 → 텐진',primary:'국제선 8번 승강장에서 Airport Express 직행 → 니시테쓰 텐진 고속버스터미널. 약 30~40분, 확인 당시 현금 500엔/IC 480엔. 입석 불가라 만석이면 다음 차.',fallback:'무료 국내선 연락버스 → 지하철 후쿠오카공항역 → 텐진역.',mapsUrl:'https://www.google.com/maps/dir/?api=1&origin=福岡空港+国際線旅客ターミナル&destination=西鉄天神高速バスターミナル&travelmode=transit'},
  {id:'tenjin-torius',title:'텐진 → 트리아스',primary:'텐진 중앙우체국 앞 18번·동쪽 방면에서 270번 トリアス久山 행. 공식 약 43분이나 주말에는 50~60분 이상 확보.',fallback:'13시 입장은 우나후지에서 12:00~12:10 택시 출발이 가장 안전.',mapsUrl:'https://www.google.com/maps/dir/?api=1&origin=天神中央郵便局前&destination=トリアスふれあい動物園&travelmode=transit'},
  {id:'torius-tenjin',title:'트리아스 → 텐진',primary:'16:10 이후 첫 270번 텐진 방면 직행을 우선. 전날 실제 시간표와 다음 편까지 재확인·캡처.',fallback:'직행을 놓치면 Google Maps에서 당일 대중교통 대안을 다시 확인.',mapsUrl:'https://www.google.com/maps/dir/?api=1&origin=トリアス久山&destination=天神駅+福岡&travelmode=transit'},
  {id:'tenjin-airport',title:'텐진 → 국제선',primary:'니시테쓰 텐진 고속버스터미널 6번에서 Airport Express. 16:30~16:50 출발, 17:30 전후 도착 목표.',fallback:'만석 또는 도로 정체 시 텐진역 → 지하철 후쿠오카공항역 → 무료 국제선 연락버스.',mapsUrl:'https://www.google.com/maps/dir/?api=1&origin=西鉄天神高速バスターミナル&destination=福岡空港+国際線旅客ターミナル&travelmode=transit'}
];

export const officialLinks=[
  {title:'Airport Express 공식 안내',url:'https://www.nishitetsu.jp/bus/rosen/airportexpress/'},{title:'공항 무료 터미널 연락버스',url:'https://www.fukuoka-airport.jp/access/bus2.html'},{title:'후쿠오카 지하철 노선도',url:'https://subway.city.fukuoka.lg.jp/eng/route/index.php'},{title:'니시테쓰 날짜별 버스 검색',url:'https://jik.nishitetsu.jp/'},{title:'TORIUS 공식 교통 안내',url:'https://torius.com/access/'},{title:'동물원 공식 홈페이지',url:'https://www.biopark.co.jp/toriuszoo/'},{title:'동물원 운영시간·요금',url:'https://www.biopark.co.jp/toriuszoo/info/'}
];

export const defaultChecklist=[
  {id:'hotel',label:'텐진/버스터미널 도보권 호텔 예약',category:'예약',done:false},{id:'sat-dinner',label:'토요일 저녁 식당 예약',category:'예약',done:false},{id:'ic-card',label:'교통계 IC카드 준비',category:'준비',done:false},{id:'esim',label:'eSIM 또는 로밍 준비',category:'준비',done:false},{id:'insurance',label:'여행자보험 확인',category:'필수',done:false},{id:'weather',label:'날씨·태풍 예보 확인',category:'출발 전',done:false},{id:'zoo-closure',label:'동물원 임시휴원·체험 중단 공지 확인',category:'출발 전',done:false},{id:'restaurant',label:'식당 휴무일·예약 재확인',category:'출발 전',done:false},{id:'airport-bus',label:'Airport Express 최신 시간표 확인',category:'출발 전',done:false},{id:'route-out',label:'270번 가는 편 시간표 확인·캡처',category:'8/28 밤',done:false},{id:'route-return',label:'270번 16시 이후 오는 편 2개 캡처',category:'8/28 밤',done:false},{id:'fare',label:'현재 버스 운임 확인',category:'8/28 밤',done:false},{id:'final-zoo-weather',label:'동물원 공지와 날씨 최종 확인',category:'8/28 밤',done:false},{id:'cash-ic',label:'IC카드·엔화 현금',category:'당일',done:false},{id:'bus-screenshots',label:'버스 시간표 캡처',category:'당일',done:false},{id:'water',label:'물·휴대용 선풍기·수건',category:'소지품',done:false},{id:'passport',label:'여권·항공권',category:'필수',done:false},{id:'power-bank',label:'보조배터리',category:'소지품',done:false},{id:'umbrella',label:'양산 또는 우산',category:'소지품',done:false}
];
export const dateLabels={'2026-08-28':'8/28 금 · 도착','2026-08-29':'8/29 토 · 핵심 일정','2026-08-30':'8/30 일 · 출국'};
