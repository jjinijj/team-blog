# 아키텍처 문서

> 앱의 화면 구조, 라우팅, 컴포넌트 계층, 인증 요구사항을 정리한 문서입니다.

**최종 업데이트**: 2026-03-27

---

## 라우트 & 화면 목록

| 경로 | 파일 | 인증 요구 | 설명 |
|------|------|-----------|------|
| `/` | `screens/LandingPage.tsx` | 공개 | 팀 소개 랜딩 페이지 |
| `/login` | `screens/AuthScreen.tsx` | 공개 | 로그인 / 회원가입 |
| `/posts` | `screens/MainScreen.tsx` | 공개 | 게시글 목록, 검색, 태그 필터, 정렬 |
| `/post/:id` | `screens/PostDetailScreen.tsx` | 공개 | 게시글 상세 + 댓글 + 북마크 |
| `/team` | `screens/TeamPage.tsx` | 공개 | 팀 소개 |
| `/contact` | `screens/ContactPage.tsx` | 공개 | 연락처 |
| `/comingsoon` | `screens/ComingSoonPage.tsx` | 공개 | 준비 중 페이지 |
| `/write` | `screens/EditorScreen.tsx` | **AuthGuard** | 새 글 작성 |
| `/edit/:id` | `screens/EditorScreen.tsx` | **AuthGuard** | 기존 글 수정 |
| `/my-posts` | `screens/profile/Mypostsscreen.tsx` | **AuthGuard** | 내 글 관리 |
| `/bookmarks` | `screens/BookmarksScreen.tsx` | **AuthGuard** | 북마크 목록 |
| `/profile/edit` | `screens/profile/EditProfilePage.tsx` | **AuthGuard** | 프로필 수정 |
| `/profile/password` | `screens/profile/ChangePasswordPage.tsx` | **AuthGuard** | 비밀번호 변경 |
| `/admin/dashboard` | `screens/admin/Dashboard.tsx` | **AdminGuard** | 관리자 대시보드 |
| `/admin/home-screen` | `screens/admin/HomeScreenPage.tsx` | **AdminGuard** | 랜딩 페이지 설정 |
| `/admin/whitelist` | `screens/admin/WhitelistPage.tsx` | **AdminGuard** | 가입 허용 이메일 관리 |
| `/admin/posts` | `screens/admin/PostManagePage.tsx` | **AdminGuard** | 전체 게시글 관리 |
| `/admin/tags` | `screens/admin/TagManagePage.tsx` | **AdminGuard** | 태그 관리 |
| `/admin/settings` | `screens/admin/SiteSettingsPage.tsx` | **AdminGuard** | 사이트 전역 설정 |

---

## 컴포넌트 계층

```
BrowserRouter  (src/index.tsx)
└── AuthProvider  (contexts/AuthContext.tsx)
    └── NotificationProvider  (contexts/NotificationContext.tsx)
        └── AppContent  (App.tsx)
            ├── [공개 라우트]
            │   ├── /             → LandingPage
            │   ├── /login        → AuthScreen
            │   ├── /posts        → MainScreen
            │   ├── /post/:id     → PostDetailScreen
            │   ├── /team         → TeamPage
            │   ├── /contact      → ContactPage
            │   └── /comingsoon   → ComingSoonPage
            │
            ├── AuthGuard  (component/AuthGuard.tsx)
            │   ├── /write           → EditorScreen
            │   ├── /edit/:id        → EditorScreen
            │   ├── /my-posts        → MyPostsScreen
            │   ├── /bookmarks       → BookmarksScreen
            │   └── /profile/*       → ProfileLayout → EditProfilePage / ChangePasswordPage
            │
            └── AdminGuard  (component/admin/AdminGuard.tsx)
                └── AdminLayout
                    ├── /admin/dashboard   → Dashboard
                    ├── /admin/home-screen → HomeScreenPage
                    ├── /admin/whitelist   → WhitelistPage
                    ├── /admin/posts       → PostManagePage
                    ├── /admin/tags        → TagManagePage
                    └── /admin/settings    → SiteSettingsPage
```

---

## 인증 & 가드

### AuthContext (`contexts/AuthContext.tsx`)
- 전역 인증 상태: `user`, `loading`, `profileReady`, `isAdmin`, `displayName`, `avatarColor`
- 로그인 시 `users` 테이블 조회로 확장 필드 채움 (타임아웃 3초 보호)
- 회원가입 시 `allowed_emails` 화이트리스트 검사 후 계정 생성

### NotificationContext (`contexts/NotificationContext.tsx`)
- 전역 알림 상태: `notifications`, `unreadCount`, `loading`
- 앱 레벨에서 한 번만 fetch + Supabase Realtime 구독 → 페이지 이동 시 뱃지 유지
- `markAsRead`, `markAllAsRead` 제공

### AuthGuard (`component/AuthGuard.tsx`)
- `loading` 중: 스피너
- `user` 없음: `/login`으로 리다이렉트
- 인증됨: `<Outlet />` 렌더

### AdminGuard (`component/admin/AdminGuard.tsx`)
- `user && isAdmin` 아닌 경우: 권한 없음 UI
- 관리자: `<Outlet />` 렌더

### 인증 흐름

**회원가입**:
```
이메일/비밀번호/이름 입력
  → allowed_emails 화이트리스트 확인
  → (없으면) 에러 반환
  → (있으면) supabase.auth.signUp()
  → 트리거 자동 실행 → public.users에 미러링
  → onAuthStateChange → users 테이블 로드 → 자동 로그인
```

**로그인**:
```
이메일/비밀번호 입력
  → supabase.auth.signInWithPassword()
  → onAuthStateChange → users 테이블 조회 (타임아웃 3초)
  → displayName / avatarColor / isAdmin 채움
  → profileReady = true
```

---

## 주요 화면 설명

### LandingPage
`home_screen_config` 싱글톤에서 설정을 읽어 히어로 / 최신 글 / 팀 소개 섹션을 동적 렌더링. 팀 이미지는 `home-images` Storage 버킷 사용.

### MainScreen
`status = 'published'` 게시글 목록. 서버사이드 검색(`.ilike`), 태그 필터, 최신·오래된·인기순 정렬, 서버사이드 페이징(`site_config.posts_per_page`).

### EditorScreen
`/write`와 `/edit/:id` 공유. 마크다운 에디터 (툴바, 실시간 미리보기 분할 화면). `useDraft` 훅으로 1.5초 디바운스 임시저장. 이미지 업로드 → `post-images` Storage → URL 삽입 → 저장 시 `linkImagesToPost`로 post_id 연결.

### PostDetailScreen
`richtext`(DocumentNode JSON) 또는 `markdown` 렌더링 분기. 북마크 버튼(본인 글 제외), 댓글, 조회수, 공유(URL 복사). `CommentsSection`에서 댓글 작성 시 `createCommentNotification` 호출.

### MyPostsScreen
본인의 draft / published / private 전체 게시글. 상태 탭 필터, 최신·오래된순 정렬, 다중 선택 삭제.

### BookmarksScreen
북마크한 글 목록 (`bookmarkApi.fetchBookmarkedPosts`). 빈 상태 UI 포함.

### ProfileLayout
사이드바(프로필 수정 / 비밀번호 변경) + 상단 공통 헤더. `Outlet`으로 하위 페이지 렌더링.

---

## 공통 헤더

| 컴포넌트 | 사용처 |
|----------|--------|
| `SiteHeader` | LandingPage, MainScreen, TeamPage, ContactPage |
| 인라인 헤더 | PostDetailScreen, MyPostsScreen, BookmarksScreen, ProfileLayout, EditorScreen |

모든 헤더에 `NotificationBell` + `ProfileDropdown` 포함 (로그인 시).

---

## API 레이어 (`src/api/`)

| 파일 | 역할 |
|------|------|
| `postApi.ts` | `posts` CRUD (`users!author_id` 조인, 태그 조인) |
| `allowedEmailApi.ts` | 화이트리스트 관리 |
| `userApi.ts` | 사용자 프로필 수정 |
| `CommentApi.ts` | `comments` CRUD |
| `imageApi.ts` | Storage 이미지 업로드/삭제, `post_images` 연결 |
| `bookmarkApi.ts` | 북마크 토글/조회 |
| `notificationApi.ts` | 알림 조회/읽음 처리/생성 |
| `tagApi.ts` | 태그 + `post_tags` 관리 |
| `homeScreenApi.ts` | `home_screen_config` 읽기/쓰기 |
| `siteConfigApi.ts` | `site_config` 읽기/쓰기 + localStorage 캐시 |

---

## 콘텐츠 시스템

포스트는 두 가지 콘텐츠 타입을 지원하며, `Post.ts`의 `getRenderMode()`가 렌더링 모드를 결정한다.

| 모드 | 저장 방식 | 관련 필드 |
|------|----------|-----------|
| `richtext` | 커스텀 `DocumentNode` JSON | `content_json` + `content`(HTML 폴백) |
| `markdown` | 마크다운 원문 문자열 | `content` |

`content_type` 필드가 우선하며, `isMarkdown` boolean은 레거시 폴백.

**리치텍스트 유틸리티** (`src/utils/`)
- `richTextTypes.ts` — `DocumentNode` 타입 정의
- `richTextParser.ts` — HTML ↔ `DocumentNode` 변환
- `richTextStyler.ts` — 서식 적용
- `richTextRenderer.tsx` — `DocumentNode` → JSX 렌더링

---

## 임시저장 (Auto-save)

`useDraft` 훅 — 1.5초 디바운스 localStorage 저장.

```typescript
interface DraftData {
  title: string;
  content: string;
  content_json: DocumentNode | null;
  content_type: 'richtext' | 'markdown';
  uploadedImageIds?: string[];  // 저장 전 이미지 UUID
  savedAt: string;              // ISO timestamp (7일 만료)
}
```

키: `draft:post:{postId}` (수정) / `draft:new` (새 글)

---

## 데이터베이스 테이블

| 테이블 | 용도 |
|--------|------|
| `posts` | 게시글 |
| `users` | 사용자 프로필 |
| `comments` | 댓글 |
| `bookmarks` | 북마크 |
| `notifications` | 알림 (Realtime) |
| `tags` / `post_tags` | 태그 시스템 |
| `post_images` | 업로드 이미지 메타데이터 |
| `post_views` | 조회수 추적 |
| `allowed_emails` | 회원가입 화이트리스트 |
| `home_screen_config` | 랜딩 페이지 설정 (싱글톤) |
| `site_config` | 사이트 전역 설정 (싱글톤) |

→ 상세 스키마: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

---

## Supabase Storage 버킷

| 버킷 | 용도 | 접근 |
|------|------|------|
| `post-images` | 게시글 본문 이미지 | 읽기 전체 / 쓰기 로그인 |
| `home-images` | 랜딩 팀 이미지 | 읽기 전체 / 쓰기 관리자 |
