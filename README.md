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
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) |
| Routing | React Router v6 |
| Deployment | Vercel |

---

## 주요 기능

- 리치텍스트 / 마크다운 두 가지 에디터 모드
- 이미지 업로드 (Supabase Storage)
- 글 상태 관리: draft / published / private
- 댓글
- 임시저장 (localStorage, 1.5초 디바운스)
- 화이트리스트 기반 회원가입
- 관리자 페이지: 게시글 관리, 가입 허용 이메일 관리, 랜딩 페이지 편집

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
│   ├── index.tsx                  # 진입점 (BrowserRouter)
│   ├── App.tsx                    # 라우트 정의, CRUD 핸들러
│   ├── supabaseClient.ts          # Supabase 클라이언트 인스턴스
│   ├── contexts/
│   │   └── AuthContext.tsx        # 전역 인증 상태
│   ├── api/                       # Supabase API 레이어
│   │   ├── postApi.ts             # 게시글 CRUD
│   │   ├── allowedEmailApi.ts     # 화이트리스트 관리
│   │   ├── userApi.ts             # 사용자 프로필
│   │   ├── CommentApi.ts          # 댓글 CRUD
│   │   ├── imageApi.ts            # 이미지 업로드/삭제
│   │   └── homeScreenApi.ts       # 랜딩 페이지 설정
│   ├── screens/                   # 페이지 단위 컴포넌트
│   │   ├── LandingPage.tsx
│   │   ├── MainScreen.tsx
│   │   ├── EditorScreen.tsx
│   │   ├── PostDetailScreen.tsx
│   │   ├── AuthScreen.tsx
│   │   ├── Mypostsscreen.tsx
│   │   ├── admin/
│   │   └── profile/
│   ├── component/                 # 재사용 컴포넌트
│   │   ├── AuthGuard.tsx          # 로그인 라우트 가드
│   │   ├── admin/
│   │   │   └── AdminGuard.tsx     # 관리자 라우트 가드
│   │   └── comments/
│   ├── hooks/
│   │   ├── useDraft.ts            # 임시저장
│   │   └── useComments.ts         # 댓글
│   ├── types/
│   │   └── Post.ts                # Post 타입, getRenderMode()
│   └── utils/
│       ├── richTextTypes.ts       # DocumentNode 타입 정의
│       ├── richTextParser.ts      # HTML ↔ DocumentNode 변환
│       ├── richTextStyler.ts      # execCommand 기반 서식
│       ├── richTextRenderer.tsx   # DocumentNode → JSX
│       └── draftUtils.ts          # 임시저장 직렬화/정리
├── docs/
│   ├── ARCHITECTURE.md            # 화면 구조, 라우팅, 컴포넌트 계층
│   ├── TODO.md                    # 작업 목록
│   └── DATABASE_SCHEMA.md         # DB 스키마
└── index.html
```

---

## 문서

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — 화면 구조, 라우팅, 인증 요구사항, API 레이어
- [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) — 데이터베이스 스키마
- [TODO.md](./docs/TODO.md) — 작업 목록 및 진행 상황
