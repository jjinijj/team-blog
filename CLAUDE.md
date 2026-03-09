# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 명령어

```bash
# 개발 서버 실행
npm run dev

# 타입 체크 + 프로덕션 빌드
npm run build

# 빌드 결과물 로컬 미리보기
npm run preview
```

`package.json`에 테스트 및 lint 스크립트는 없다.

## 환경 설정

`.env.local` 파일을 생성하고 아래 값을 설정한다:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## 아키텍처 개요

**스택**: React 18, TypeScript, Vite, Tailwind CSS, Supabase (PostgreSQL + Auth), React Router v6

### 진입점 & 라우팅

- [src/index.tsx](src/index.tsx) — `<App>`을 `<BrowserRouter>` 안에 마운트
- [src/App.tsx](src/App.tsx) — 모든 라우트 정의 및 포스트 CRUD 핸들러(`handleAddPost`, `handleUpdatePost`, `handleDeletePost`) 보유. `<AuthProvider>`로 전체를 감싼다.

### 인증 (Auth)

- [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) — 인증 상태의 단일 출처: `user`, `loading`, `isAdmin`, `displayName`, `avatarColor`. 로그인 시 `users` 테이블을 조회해 확장 필드를 채운다.
- 회원가입은 화이트리스트 기반: `signUp`이 계정 생성 전 `allowed_emails` 테이블을 확인한다.
- 관리자 라우트는 [src/component/admin/AdminGuard.tsx](src/component/admin/AdminGuard.tsx)가 `isAdmin`을 검사해 보호한다.

### Supabase API 레이어

- [src/supabaseClient.ts](src/supabaseClient.ts) — 단일 Supabase 클라이언트 인스턴스 (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` 사용)
- [src/api/supabaseApi.ts](src/api/supabaseApi.ts) — `posts` 테이블 CRUD (`users!author_id` 조인으로 작성자 정보 포함)
- [src/api/AdminApi.ts](src/api/AdminApi.ts) — `allowed_emails` 화이트리스트 관리
- [src/api/userApi.ts](src/api/userApi.ts) — 사용자 프로필 수정
- [src/api/CommentApi.ts](src/api/CommentApi.ts) — `comments` 테이블 CRUD

### 콘텐츠 시스템 (두 가지 모드)

포스트는 두 가지 콘텐츠 타입을 지원하며, [src/types/Post.ts](src/types/Post.ts)의 `getRenderMode()`가 렌더링 모드를 결정한다:

| 모드 | 저장 방식 | 필드 |
|------|----------|------|
| `richtext` | 커스텀 `DocumentNode` JSON | `content_json` (파싱됨) + `content` (HTML 폴백) |
| `markdown` | 마크다운 원문 문자열 | `content` |

`content_type` 필드가 우선하며, `isMarkdown` boolean은 레거시 폴백이다.

**리치 텍스트 타입**은 [src/utils/richTextTypes.ts](src/utils/richTextTypes.ts)에 정의: `DocumentNode` = `ParagraphNode[]`, 각 문단은 `TextStyle`(bold, italic, underline, color, size)을 가진 `TextNode[]` 자식을 갖는다.

리치 텍스트 유틸리티:
- [src/utils/richTextParser.ts](src/utils/richTextParser.ts) — HTML ↔ `DocumentNode` 변환
- [src/utils/richTextStyler.ts](src/utils/richTextStyler.ts) — `execCommand` 기반 서식 적용 (굵기, 기울임, 밑줄, 색상, 글자 크기)
- [src/utils/richTextRenderer.tsx](src/utils/richTextRenderer.tsx) — `DocumentNode`를 JSX로 렌더링

### 임시저장 (Draft Auto-Save)

[src/hooks/useDraft.ts](src/hooks/useDraft.ts) — 1.5초 디바운스를 적용한 localStorage 기반 임시저장. 키는 포스트 ID로 스코프됨 (새 글은 공통 키 사용). [src/utils/draftUtils.ts](src/utils/draftUtils.ts)가 직렬화 및 만료된 임시저장 정리를 처리한다.

### 스크린 & 컴포넌트

- [src/screens/](src/screens/) — 페이지 단위 컴포넌트 (`MainScreen`, `EditorScreen`, `PostDetailScreen`, `AuthScreen`, `admin/` 하위 관리자 페이지, `profile/` 하위 프로필 페이지)
- [src/component/](src/component/) — 재사용 컴포넌트 (`comments/` 하위 디렉토리 포함)
- [src/hooks/](src/hooks/) — `useDraft`, `useComments`

### 데이터베이스 테이블

`posts`, `users`, `allowed_emails`, `comments`

### 포스트 공개 범위 규칙

- `readPosts()` — `status = 'published'`인 글만 반환 (메인 화면)
- `readMyPosts()` — 본인의 `draft` / `published` / `private` 전체 반환 (내 글 보기)
- 새 글 작성 시 기본값은 `'published'`

### 아이콘 & 폰트

[index.html](index.html)에서 Google CDN으로 로드:
- **Material Symbols Outlined** — `<span class="material-symbols-outlined">아이콘명</span>` 형태로 사용
- **Inter** — 전체 body 기본 폰트

### EditorScreen 인증 처리 방식

`/write`, `/edit/:id` 라우트에는 별도의 라우트 가드가 없다. 대신 `EditorScreen` 내부의 `useEffect`에서 `user`가 없으면 `navigate('/login')`으로 직접 리다이렉트한다. 관리자 라우트(`/admin`)가 `AdminGuard` 컴포넌트로 보호되는 것과 다른 방식이다.
