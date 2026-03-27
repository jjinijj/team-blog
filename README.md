# Team Blog

팀이 함께 글을 작성하고 공유하는 웹 기반 블로그 플랫폼입니다.

**[라이브 데모](https://team-blog-delta.vercel.app)**

---

## 기술 스택

| 항목 | 기술 |
|------|------|
| Language | TypeScript |
| Framework | React 18 |
| Build | Vite |
| Styling | Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Routing | React Router v6 |
| Deployment | Vercel |

---

## 주요 기능

**콘텐츠**
- 마크다운 에디터 (툴바, 실시간 미리보기, 이미지 업로드)
- 리치텍스트 에디터 (Bold / Italic / Underline)
- 글 상태 관리: draft / published / private
- 핀 고정 글 (공지사항)
- 태그 시스템 (관리자 지정 태그, 태그별 필터링)
- 임시저장 (localStorage, 1.5초 디바운스, 7일 만료)
- 글 공유 (URL 클립보드 복사)
- 조회수 (24시간 중복 제외, 본인 글 제외)

**소셜**
- 댓글 (작성 / 수정 / 삭제)
- 북마크 (글 저장, 별도 북마크 페이지)
- 알림 시스템 (댓글 알림, Supabase Realtime 실시간 수신)

**사용자**
- 화이트리스트 기반 회원가입
- 프로필 수정 (이름, 아바타 색상, 비밀번호)
- 내 글 보기 (상태별 필터, 정렬, 다중 삭제)

**관리자**
- 게시글 관리 (상태 변경, 핀 고정, 삭제)
- 가입 허용 이메일 화이트리스트 관리
- 태그 관리 (추가 / 수정 / 삭제)
- 랜딩 페이지 편집 (히어로, 최신 글, 팀 소개 섹션)
- 사이트 설정 (사이트명, 페이지당 글 수, 최대 핀 수)

---

## 시작하기

### 환경 변수

`.env.local` 파일을 생성하고 아래 값을 설정합니다:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### 명령어

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 타입 체크 + 프로덕션 빌드
npm run build

# 빌드 결과물 로컬 미리보기
npm run preview
```

---

## 프로젝트 구조

```
team-blog/
├── src/
│   ├── index.tsx                    # 진입점 (BrowserRouter)
│   ├── App.tsx                      # 라우트 정의, 포스트 CRUD 핸들러
│   ├── supabaseClient.ts            # Supabase 클라이언트 인스턴스
│   ├── contexts/
│   │   ├── AuthContext.tsx          # 전역 인증 상태
│   │   └── NotificationContext.tsx  # 전역 알림 상태 (Realtime 구독)
│   ├── api/                         # Supabase API 레이어
│   │   ├── postApi.ts               # 게시글 CRUD
│   │   ├── allowedEmailApi.ts       # 화이트리스트 관리
│   │   ├── userApi.ts               # 사용자 프로필
│   │   ├── CommentApi.ts            # 댓글 CRUD
│   │   ├── imageApi.ts              # 이미지 업로드/삭제
│   │   ├── bookmarkApi.ts           # 북마크 토글/조회
│   │   ├── notificationApi.ts       # 알림 조회/읽음 처리/생성
│   │   ├── tagApi.ts                # 태그 관리
│   │   ├── homeScreenApi.ts         # 랜딩 페이지 설정
│   │   └── siteConfigApi.ts         # 사이트 전역 설정
│   ├── screens/                     # 페이지 단위 컴포넌트
│   │   ├── LandingPage.tsx
│   │   ├── MainScreen.tsx
│   │   ├── EditorScreen.tsx
│   │   ├── PostDetailScreen.tsx
│   │   ├── AuthScreen.tsx
│   │   ├── BookmarksScreen.tsx
│   │   ├── TeamPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── ComingSoonPage.tsx
│   │   ├── admin/                   # 관리자 페이지
│   │   └── profile/                 # 사용자 프로필 페이지
│   ├── component/                   # 재사용 컴포넌트
│   │   ├── SiteHeader.tsx           # 공통 상단 헤더
│   │   ├── SiteFooter.tsx           # 공통 푸터
│   │   ├── NotificationBell.tsx     # 알림 벨 + 드롭다운
│   │   ├── Profiledropdown.tsx      # 프로필 드롭다운
│   │   ├── AuthGuard.tsx            # 로그인 라우트 가드
│   │   ├── Profilelayout.tsx        # 프로필 페이지 레이아웃
│   │   ├── admin/
│   │   │   └── AdminGuard.tsx       # 관리자 라우트 가드
│   │   └── comments/                # 댓글 컴포넌트
│   ├── hooks/
│   │   └── useDraft.ts              # 임시저장 훅
│   ├── types/
│   │   ├── Post.ts                  # Post 타입, getRenderMode()
│   │   ├── Comment.ts               # Comment 타입
│   │   ├── Auth.ts                  # Auth 관련 타입
│   │   └── routes.ts                # 라우트 경로 상수
│   └── utils/
│       ├── richTextTypes.ts         # DocumentNode 타입 정의
│       ├── richTextParser.ts        # HTML ↔ DocumentNode 변환
│       ├── richTextStyler.ts        # 서식 적용
│       ├── richTextRenderer.tsx     # DocumentNode → JSX
│       ├── markdownRender.tsx       # 마크다운 렌더러
│       ├── draftUtils.ts            # 임시저장 직렬화/정리
│       └── DataFormat.ts            # 날짜 포맷 유틸
├── docs/
│   ├── ARCHITECTURE.md              # 화면 구조, 라우팅, 컴포넌트 계층
│   ├── TODO.md                      # 작업 목록 및 진행 상황
│   └── DATABASE_SCHEMA.md           # DB 스키마
├── vercel.json                      # SPA 라우팅 설정
└── index.html
```

---

## 데이터베이스 주요 테이블

| 테이블 | 설명 |
|--------|------|
| `posts` | 게시글 (status, is_pinned, view_count, content_type, content_json) |
| `users` | 사용자 프로필 (display_name, avatar_color, is_admin, show_in_team) |
| `comments` | 댓글 |
| `bookmarks` | 북마크 (user_id, post_id) |
| `notifications` | 알림 (user_id, actor_id, type, post_id, comment_id, is_read) |
| `tags` / `post_tags` | 태그 시스템 |
| `post_images` | 업로드 이미지 (Storage 연결) |
| `allowed_emails` | 가입 허용 이메일 화이트리스트 |
| `home_screen_config` | 랜딩 페이지 설정 |
| `site_config` | 사이트 전역 설정 |

---

## 문서

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — 화면 구조, 라우팅, 인증 요구사항, API 레이어
- [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) — 데이터베이스 스키마
- [TODO.md](./docs/TODO.md) — 작업 목록 및 진행 상황
