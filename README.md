# 후쿠오카, 우리의 주말

2026-08-28~30 후쿠오카 여행을 위해 만든 모바일 우선 PWA입니다. 일정, 지도·경로, 맛집, 준비물, 로컬 첨부 보관함을 제공합니다. 계정이나 API 키가 필요 없습니다.

## 로컬 실행

Node.js 22 이상에서:

```bash
npm test
npm run serve
# http://localhost:4173
```

또는 `python3 -m http.server 4173`을 사용할 수 있습니다. Service Worker와 ES modules 때문에 `file://`로 직접 열지 마세요.

## 데이터와 개인정보

- 체크·사용자 일정: 브라우저 `localStorage`
- 첨부: 브라우저 `IndexedDB` (PDF/JPG/PNG/WebP, 파일당 15MB 이하)
- 외부 통신: OpenStreetMap 타일, Nominatim 장소 검색, OSRM 자동차 경로, Google Maps 링크
- 검색/경로 장애 시에도 기본 일정과 저장 데이터는 사용 가능합니다.
- Nominatim 검색은 클라이언트당 동시에 하나만 실행되고 요청 시작 간격을 최소 1초로 제한합니다. Nominatim과 OSRM 요청은 제한 시간 후 취소됩니다.
- 알림은 브라우저 권한과 앱 실행 상태에 의존하며, 앱을 닫은 상태의 정확한 예약 알림은 보장하지 않습니다.
- JSON 백업에는 첨부파일이 포함되지 않습니다. 브라우저 데이터 삭제 전 첨부파일을 개별 다운로드하세요.

## Cloudflare Workers Static Assets

로그인 후 아래 명령으로 배포할 수 있습니다(실제 배포는 이 저장소에서 수행하지 않음).

```bash
npx wrangler dev
npx wrangler deploy
```

`wrangler.jsonc`가 현재 디렉터리를 Static Assets로 게시하고 SPA fallback을 사용합니다.
Cloudflare Static Assets는 `_headers`의 CSP, Referrer-Policy, `X-Content-Type-Options` 및 Permissions-Policy를 적용합니다. GitHub Pages는 `_headers`를 응답 헤더 설정으로 처리하지 않으므로, Pages 배포에서는 HTML의 CSP/referrer meta만 적용되고 `frame-ancestors`와 `nosniff`는 보장되지 않습니다. 강한 보안 헤더가 필요하면 Cloudflare 등 `_headers`를 지원하는 전용 origin에 배포하세요.

## 공개 배포와 개인정보

- 이 저장소와 GitHub Pages 일정은 공개 정보입니다. 항공·예약·동선 공개 범위를 배포 전에 확인하세요.
- 첨부는 서버로 업로드되지 않지만 브라우저의 origin 단위 IndexedDB에 저장됩니다. 공유 기기에서는 사용하지 말고 예약번호·여권 등 민감한 파일은 보관하지 마세요.
- 장소 검색·지도·경로 기능은 OpenStreetMap 타일, Nominatim 및 OSRM에 IP, 검색어 또는 조회 동선을 전달할 수 있습니다.

## 접근성·오프라인

44px 이상 터치 영역, 키보드 포커스, skip link, 상태 메시지, reduced-motion 및 반응형 레이아웃을 제공합니다. 첫 온라인 방문 후 앱 shell과 기본 일정은 오프라인으로 열립니다. 지도 타일, 검색, 경로, Google Maps는 네트워크가 필요합니다.
