# 아키텍처 문서

> 앱의 화면 구조, 라우팅, 컴포넌트 계층, 인증 요구사항을 정리한 문서입니다.

---

## 라우트 & 화면 목록

| 경로 | 파일 | 인증 요구 | 설명 |
|------|------|-----------|------|
| `/` | `src/screens/LandingPage.tsx` | 공개 | 팀 소개 랜딩 페이지 |
| `/login` | `src/screens/AuthScreen.tsx` | 공개 | 로그인 / 회원가입 |
| `/blog` | `src/screens/MainScreen.tsx` | 공개 | 게시글 목록, 검색, 정렬 |
| `/post/:id` | `src/screens/PostDetailScreen.tsx` | 공개 | 게시글 상세 보기 + 댓글 |
| `/team` | `src/screens/TeamPage.tsx` | 공개 | 팀 소개 (placeholder) |
| `/contact` | `src/screens/ContactPage.tsx` | 공개 | 연락처 |
| `/write` | `src/screens/EditorScreen.tsx` | **AuthGuard** | 새 글 작성 |
| `/edit/:id` | `src/screens/EditorScreen.tsx` | **AuthGuard** | 기존 글 수정 |
| `/my-posts` | `src/screens/Mypostsscreen.tsx` | **AuthGuard** | 내 글 관리 (draft/published/private) |
| `/profile/edit` | `src/screens/profile/EditProfilePage.tsx` | **AuthGuard** | 프로필(표시이름, 아바타) 수정 |
| `/profile/password` | `src/screens/profile/ChangePasswordPage.tsx` | **AuthGuard** | 비밀번호 변경 |
| `/admin/dashboard` | `src/screens/admin/Dashboard.tsx` | **AdminGuard** | 관리자 대시보드 |
| `/admin/home-screen` | `src/screens/admin/HomeScreenPage.tsx` | **AdminGuard** | 랜딩 페이지 콘텐츠 설정 |
| `/admin/whitelist` | `src/screens/admin/WhitelistPage.tsx` | **AdminGuard** | 가입 허용 이메일 관리 |
| `/admin/posts` | `src/screens/admin/PostManagePage.tsx` | **AdminGuard** | 전체 게시글 관리 |

---

## 컴포넌트 계층

```
BrowserRouter  (src/index.tsx)
└── AuthProvider  (src/contexts/AuthContext.tsx)
    └── App  (src/App.tsx)
        ├── [공개 라우트]
        │   ├── /             → LandingPage
        │   ├── /login        → AuthScreen
        │   ├── /blog         → MainScreen
        │   ├── /post/:id     → PostDetailScreen
        │   ├── /team         → TeamPage
        │   └── /contact      → ContactPage
        │
        ├── AuthGuard  (src/component/AuthGuard.tsx)
        │   ├── /write        → EditorScreen
        │   ├── /edit/:id     → EditorScreen
        │   ├── /my-posts     → Mypostsscreen
        │   ├── /profile/edit → EditProfilePage
        │   └── /profile/password → ChangePasswordPage
        │
        └── AdminGuard  (src/component/admin/AdminGuard.tsx)
            ├── /admin/dashboard   → Dashboard
            ├── /admin/home-screen → HomeScreenPage
            ├── /admin/whitelist   → WhitelistPage
            └── /admin/posts       → PostManagePage
```

---

## 인증 & 가드

### AuthGuard (`src/component/AuthGuard.tsx`)
- `useAuth()`에서 `user`, `loading` 조회
- `loading` 중: 스피너 표시
- `user` 없음: `/login`으로 리다이렉트 (`<Navigate replace />`)
- 인증됨: `<Outlet />` 렌더

### AdminGuard (`src/component/admin/AdminGuard.tsx`)
- `useAuth()`에서 `user`, `isAdmin` 조회
- `user && isAdmin` 아닌 경우: 권한 없음 UI 표시
- 관리자: `<Outlet />` 렌더

### AuthContext (`src/contexts/AuthContext.tsx`)
- 전역 인증 상태: `user`, `loading`, `isAdmin`, `displayName`, `avatarColor`
- 로그인 시 `users` 테이블 조회로 확장 필드 채움
- 회원가입 시 `allowed_emails` 화이트리스트 검사

---

## 주요 화면 설명

### LandingPage
팀 소개 랜딩 페이지. `home_screen_config` 테이블(id=1 싱글톤)에서 설정값을 읽어 동적으로 콘텐츠를 구성한다. 팀 이미지는 `home-images` Supabase Storage 버킷에서 제공.

### MainScreen
`status = 'published'`인 게시글 목록 표시. 제목/내용 검색, 최신순·오래된순 정렬.

### EditorScreen
`/write`와 `/edit/:id`를 공유. 리치텍스트 에디터(`contenteditable`)와 마크다운 두 가지 콘텐츠 모드 지원. 이미지 업로드 시 `post-images` 버킷에 저장하고 URL 삽입. `useDraft` 훅으로 1.5초 디바운스 자동저장.

### PostDetailScreen
게시글 렌더링(`richtext` JSON 또는 `markdown` 문자열)과 댓글 목록. `useComments` 훅 사용.

### Mypostsscreen
로그인 사용자 본인의 draft/published/private 전체 게시글 관리. 상태 변경 및 삭제 가능.

### HomeScreenPage (Admin)
랜딩 페이지 설정 관리: 팀 이미지 업로드/교체, 팀원 목록 편집, 섹션 텍스트 수정.

---

## API 레이어 (`src/api/`)

| 파일 | 역할 |
|------|------|
| `supabaseApi.ts` (postApi) | `posts` 테이블 CRUD (`users!author_id` 조인) |
| `AdminApi.ts` (allowedEmailApi) | `allowed_emails` 화이트리스트 관리 |
| `userApi.ts` | 사용자 프로필 수정 |
| `CommentApi.ts` | `comments` 테이블 CRUD |
| `imageApi.ts` | Supabase Storage 이미지 업로드/삭제, DB 레코드 연결 |
| `homeScreenApi.ts` | `home_screen_config` 테이블 읽기/쓰기 |

---

## 콘텐츠 시스템

포스트는 두 가지 콘텐츠 타입을 지원하며, `Post.ts`의 `getRenderMode()`가 렌더링 모드를 결정한다.

| 모드 | 저장 방식 | 관련 필드 |
|------|----------|-----------|
| `richtext` | 커스텀 `DocumentNode` JSON | `content_json` + `content`(HTML 폴백) |
| `markdown` | 마크다운 원문 문자열 | `content` |

`content_type` 필드가 우선하며, `isMarkdown` boolean은 레거시 폴백.

---

## 데이터베이스 테이블

| 테이블 | 용도 |
|--------|------|
| `posts` | 게시글 (author_id FK → users) |
| `users` | 사용자 프로필 (displayName, avatarColor, isAdmin) |
| `allowed_emails` | 회원가입 화이트리스트 |
| `comments` | 댓글 (post_id FK → posts) |
| `post_images` | 업로드 이미지 메타데이터 (post_id, storage_path, url) |
| `home_screen_config` | 랜딩 페이지 설정 (id=1 싱글톤) |

---

## Supabase Storage 버킷

| 버킷 | 용도 |
|------|------|
| `post-images` | 게시글 본문 이미지 (`{authorId}/{fileName}`) |
| `home-images` | 랜딩 페이지 팀 이미지 (`team/{fileName}`) |
