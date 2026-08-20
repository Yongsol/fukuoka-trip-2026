# 2026 후쿠오카 2박 3일 여행 웹사이트

Obsidian의 `2026 후쿠오카 2박 3일 여행 일정표.md` 내용을 모바일에서 보기 쉬운 정적 웹사이트로 구성했습니다.

## 로컬 미리보기

```bash
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173`을 엽니다.

## 배포

- 정적 파일만 사용하므로 Cloudflare Pages 또는 GitHub Pages에 바로 배포할 수 있습니다.
- Cloudflare Pages 빌드 설정: Framework preset `None`, Build command 비움, Output directory `/`.
- `main` 브랜치가 갱신되면 Git 연동을 통해 자동 배포됩니다.

## 원본

`/mnt/c/Users/Yongsol/Documents/Obsidian Vault/여행/2026 후쿠오카 2박 3일 여행 일정표.md`
