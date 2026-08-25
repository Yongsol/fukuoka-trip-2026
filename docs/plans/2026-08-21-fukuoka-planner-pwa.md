# Fukuoka Trip Planner PWA Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** 2026-08-28~30 후쿠오카 2박 3일 일정과 핵심 교통·맛집·예약 정보를 기본 탑재한 모바일 우선 여행 플래너 PWA를 만든다.

**Architecture:** 프레임워크 없는 HTML/CSS/ES modules 구조로 구현한다. `app.js`는 상태·화면 조합, `data.js`는 초기 여행 데이터, `planner.js`는 순수 함수와 저장/내보내기 로직을 담당한다. Leaflet 지도는 CDN, 장소 검색은 Nominatim, 자동차 경로는 OSRM, 영구 상태는 localStorage, 첨부파일은 IndexedDB에 저장한다. Cloudflare Workers Static Assets로 배포 가능하도록 `wrangler.jsonc`를 포함한다.

**Tech Stack:** HTML5, CSS, JavaScript ES modules, Leaflet 1.9.4, Nominatim, OSRM, Web APIs(localStorage, IndexedDB, Notification, Service Worker), Node.js built-in test runner, Cloudflare Workers static assets.

---

## Task 1: 프로젝트 골격과 순수 데이터 로직

**Objective:** 테스트 가능한 여행 상태 모델과 기본 후쿠오카 일정을 만든다.

**Files:**
- Create: `/mnt/c/Fukuoka_planner/package.json`
- Create: `/mnt/c/Fukuoka_planner/src/data.js`
- Create: `/mnt/c/Fukuoka_planner/src/planner.js`
- Create: `/mnt/c/Fukuoka_planner/tests/planner.test.js`

**TDD:** 날짜별 필터, 체크리스트 토글, 사용자 이벤트 추가/삭제, JSON 백업 validation, ICS escaping·생성 테스트를 먼저 실패시킨 후 최소 구현한다.

**Verification:** `npm test` 전체 PASS.

## Task 2: 모바일 우선 UI와 지도

**Objective:** 일정·지도·맛집·준비물·보관함을 한 화면에서 빠르게 사용할 수 있는 원본 디자인을 구현한다.

**Files:**
- Create: `/mnt/c/Fukuoka_planner/index.html`
- Create: `/mnt/c/Fukuoka_planner/styles.css`
- Create: `/mnt/c/Fukuoka_planner/src/app.js`

**Requirements:**
- 2026 후쿠오카 D-데이, TW205/TW208, 토요일 우나후지 11:00와 동물원 13:00~16:00를 강조한다.
- 탭: 일정, 지도, 맛집, 준비, 보관함.
- 일정 체크·사용자 일정 추가/삭제는 localStorage에 즉시 저장한다.
- Leaflet 마커와 카테고리 필터, 장소 검색(Nominatim), 현재 선택 장소의 Google Maps 길찾기, 핵심 경로 OSRM 표시를 제공한다.
- 44px 이상 touch target, keyboard focus, mobile/desktop responsive, reduced-motion을 지원한다.
- 외부 서비스 실패 시 사용 가능한 오류 메시지를 표시한다.

**Verification:** 브라우저 console error 0, 핵심 탭·상호작용 수동 검증.

## Task 3: PWA·오프라인·알림·캘린더·백업·첨부

**Objective:** 설치 가능한 여행 동반 앱의 실용 기능을 완성한다.

**Files:**
- Create: `/mnt/c/Fukuoka_planner/manifest.webmanifest`
- Create: `/mnt/c/Fukuoka_planner/sw.js`
- Create: `/mnt/c/Fukuoka_planner/icons/icon.svg`
- Create: `/mnt/c/Fukuoka_planner/src/storage.js`
- Create: `/mnt/c/Fukuoka_planner/tests/storage.test.js`
- Create: `/mnt/c/Fukuoka_planner/wrangler.jsonc`
- Create: `/mnt/c/Fukuoka_planner/README.md`

**Requirements:**
- 앱 shell과 초기 데이터는 오프라인에서도 열린다. 지도 타일·외부 API는 온라인 필요 상태를 명시한다.
- 전체 일정 `.ics` 다운로드.
- JSON 백업 다운로드 및 schema 검증 후 복원.
- 예약 서류/사진은 IndexedDB에 저장·목록·다운로드·삭제.
- Notification 권한 요청과 여행 전 알림 예약 안내(브라우저 제약 명시).
- Cloudflare Static Assets 설정과 로컬 실행/배포 명령 문서화.

**Verification:** `npm test`, manifest/service worker 정적 파일 확인, local HTTP server에서 installability 관련 오류와 console error 확인.

## Task 4: Review 및 통합 검증

**Objective:** 요구사항 누락·보안·접근성·데이터 손상 위험을 제거한다.

**Review gates:**
1. spec compliance review: 요구사항 모두 구현됐는지 PASS.
2. code quality review: 중요 이슈 0, APPROVED.
3. 통합 검증: 전체 테스트 PASS, 브라우저 console error 0, 390px 모바일 및 desktop 화면 확인, 핵심 상호작용 확인.

**Acceptance criteria:**
- 새 사용자가 열면 후쿠오카 일정·지도·맛집이 즉시 보인다.
- 새로고침 후 체크·추가 일정이 보존된다.
- JSON/ICS가 유효하게 내려받아진다.
- 첨부파일 CRUD가 동작한다.
- 네트워크 실패가 앱 전체를 깨뜨리지 않는다.
- Cloudflare Workers Static Assets 배포 준비가 완료된다.
