# 팀 블로그 에디터 - 프로젝트 문서

## 1. 프로젝트 개요

**팀 블로그 에디터**는 팀이 함께 글을 작성, 편집, 관리할 수 있는 웹 기반 에디터입니다.

### 주요 특징
- ✅ 글 작성/수정/삭제 (개별 + 다중 삭제)
- ✅ 마크다운 & 리치텍스트 에디터 지원
- ✅ 글자 크기, 스타일(굵기/기울임/밑줄), 색상 옵션
- ✅ 글 검색 기능 (제목/내용)
- ✅ 글 정렬 기능 (최신순/오래된순)
- ✅ 이메일 화이트리스트 기반 사용자 인증
- ✅ 작성자 정보 표시 및 권한 관리
- ✅ Supabase를 통한 데이터 영속성 및 실시간 동기화
- ✅ 반응형 UI (Tailwind CSS)

---

## 2. 기술 스택

| 분류 | 기술 |
|------|------|
| **Language** | TypeScript |
| **Frontend Framework** | React 18 |
| **Routing** | React Router v6 |
| **Styling** | Tailwind CSS |
| **State Management** | React Hooks (useState, useEffect, useContext) |
| **Backend** | Supabase (PostgreSQL, Auth, Storage) |
| **Authentication** | Supabase Auth (이메일 화이트리스트) |
| **Build Tool** | Vite |
| **Deployment** | Vercel |
| **Version Control** | Git/GitHub |

---

## 3. 프로젝트 구조

```
team-blog/
├── public/
├── src/
│   ├── App.tsx                  # 메인 앱, 라우팅, 상태 관리
│   ├── types/
│   │   ├── Post.ts              # Post 인터페이스 정의
│   │   └── Auth.ts              # Auth 타입 정의
│   ├── contexts/
│   │   └── AuthContext.tsx      # 인증 Context (세션, 로그인, 회원가입)
│   ├── screens/
│   │   ├── MainScreen.tsx       # 글 목록, 검색, 정렬
│   │   ├── EditorScreen.tsx     # 글 작성/수정, 마크다운/리치텍스트
│   │   ├── PostDetailScreen.tsx # 글 상세 보기, 삭제, 권한 체크
│   │   └── AuthScreen.tsx       # 로그인/회원가입
│   ├── lib/
│   │   └── supabaseApi.ts       # Supabase CRUD 함수
│   ├── utils/
│   │   ├── markdown.ts          # 마크다운 파싱
│   │   └── markdownRender.tsx   # 마크다운 렌더링 컴포넌트
│   ├── supabaseClient.ts        # Supabase 클라이언트 초기화
│   ├── index.tsx
│   └── index.css
├── docs/
│   ├── DATABASE_SCHEMA.md       # 데이터베이스 스키마 문서
|   ├── MARKDOWN_GUIDE.md         # 마크다운 가이드 문서
│   ├── TEAM_BLOG_DOCUMENTATION.md # 전체 프로젝트 문서
│   └── TODO.md                  # 작업 TODO 리스트
├── package.json
└── README.md
```

---

## 4. 데이터 구조

### Post 인터페이스

```typescript
export interface Post {
  id: string;                 // 타임스탬프 기반 고유 ID
  title: string;              // 글 제목
  content: string;            // 글 본문
  fontSize: number;           // 글자 크기 (12-24px)
  isBold: boolean;            // 굵기 여부
  isItalic: boolean;          // 기울임 여부
  isUnderline: boolean;       // 밑줄 여부
  textColor: string;          // 글자 색상 (hex 색상코드)
  createdAt: string;          // 작성일자 (YYYY-MM-DD 형식)
  isMarkdown: boolean;        // 마크다운 모드 여부
  author_id: string | null;   // 작성자 ID (Supabase Auth)
  author_email: string | null; // 작성자 이메일 (JOIN)
}
```

---

## 5. 데이터 흐름 및 아키텍처

### 5.1 전체 아키텍처

```
┌─────────────────────────────────────────────────┐
│              App.tsx (Root)                      │
│  ┌───────────────────────────────────────────┐  │
│  │        AuthProvider (Context)             │  │
│  │  - user, loading, signUp, signIn, signOut │  │
│  └───────────────────────────────────────────┘  │
│                      │                           │
│         ┌────────────┴────────────┐             │
│         ▼                         ▼              │
│  React Router              Supabase Client       │
│  ┌────────────┐            ┌──────────────┐    │
│  │ Routes     │            │ Auth         │    │
│  │ - /        │◄───────────│ Database     │    │
│  │ - /login   │            │ Storage      │    │
│  │ - /write   │            └──────────────┘    │
│  │ - /edit/:id│                                 │
│  │ - /post/:id│                                 │
│  └────────────┘                                 │
└─────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│              Screen Components                   │
│  ┌──────────┐  ┌───────────┐  ┌─────────────┐ │
│  │MainScreen│  │AuthScreen │  │EditorScreen │ │
│  │          │  │           │  │             │ │
│  └──────────┘  └───────────┘  └─────────────┘ │
│  ┌──────────────────┐                          │
│  │PostDetailScreen  │                          │
│  └──────────────────┘                          │
└─────────────────────────────────────────────────┘
```

### 5.2 데이터 저장소

**Supabase PostgreSQL**:
```
posts (테이블)
├─ id, title, content
├─ fontSize, isBold, isItalic, isUnderline, textColor
├─ isMarkdown, createdAt
└─ author_id (FK → public.users)

public.users (테이블)
├─ id (PK, FK → auth.users)
├─ email
└─ created_at

allowed_emails (테이블)
├─ id, email (화이트리스트)
├─ added_at
└─ added_by
```

**React State (App.tsx)**:
```typescript
- posts: Post[]          // Supabase에서 로드
- loading: boolean       // 데이터 로딩 상태
```

**AuthContext**:
```typescript
- user: User | null      // Supabase Auth 세션
- loading: boolean       // 세션 확인 중
```

### 5.3 글 생성 흐름

```
EditorScreen
  ├─ 사용자 입력 (title, content, 스타일 옵션)
  └─ "등록" 버튼 클릭
       ↓
App.tsx: handleAddPost()
  ├─ Post 객체 생성 (author_id: user.id)
  └─ createPost(newPost) 호출
       ↓
supabaseApi.ts: createPost()
  ├─ supabase.from('posts').insert([newPost])
  └─ DB에 저장
       ↓
App.tsx
  ├─ setPosts([newPost, ...posts])  // 로컬 상태 업데이트
  └─ navigate(`/post/${newPost.id}`)
       ↓
PostDetailScreen에서 새 글 표시
```

### 5.4 글 수정 흐름

```
MainScreen → PostDetailScreen
  └─ "수정" 버튼 클릭 (권한 체크: author_id === user.id)
       ↓
navigate(`/edit/${postId}`)
       ↓
EditorScreen
  ├─ useParams()로 postId 가져오기
  ├─ posts에서 해당 글 찾기
  ├─ 권한 체크 (author_id === user.id)
  └─ 폼에 기존 데이터 채우기
       ↓
"수정" 버튼 클릭
       ↓
App.tsx: handleUpdatePost()
  └─ updatePost(updatedPost) 호출
       ↓
supabaseApi.ts: updatePost()
  ├─ supabase.from('posts').update(...).eq('id', postId)
  └─ DB 업데이트
       ↓
App.tsx
  ├─ posts.map()으로 해당 글 업데이트
  └─ navigate(`/post/${postId}`)
       ↓
PostDetailScreen에서 수정된 글 표시
```

### 5.5 인증 흐름

#### 회원가입
```
AuthScreen
  ├─ 이메일/비밀번호 입력
  └─ "Sign up" 버튼 클릭
       ↓
AuthContext: signUp()
  ├─ supabase.from('allowed_emails').select().eq('email')
  ├─ 화이트리스트 체크
  └─ supabase.auth.signUp({ email, password })
       ↓
Supabase
  ├─ auth.users에 사용자 추가
  └─ 트리거 실행 → public.users에 자동 추가
       ↓
AuthContext
  ├─ onAuthStateChange 트리거
  ├─ setUser(session.user)
  └─ navigate('/') (자동 로그인)
```

#### 로그인
```
AuthScreen
  ├─ 이메일/비밀번호 입력
  └─ "Sign in" 버튼 클릭
       ↓
AuthContext: signIn()
  └─ supabase.auth.signInWithPassword({ email, password })
       ↓
Supabase
  └─ 세션 생성
       ↓
AuthContext
  ├─ onAuthStateChange 트리거
  ├─ setUser(session.user)
  └─ navigate('/')
```

### 5.6 실시간 데이터 동기화

**초기 로드**:
```typescript
useEffect(() => {
  const loadPosts = async () => {
    const data = await readPost();  // Supabase JOIN 포함
    setPosts(data);
  };
  loadPosts();
}, []);
```

**세션 관리**:
```typescript
useEffect(() => {
  // 초기 세션 확인
  supabase.auth.getSession();
  
  // 실시간 세션 변경 구독
  const { data: { subscription } } = 
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  
  return () => subscription.unsubscribe();
}, []);
```

### 5.7 라우팅 및 접근 제어

| Route | 컴포넌트 | 접근 권한 |
|-------|---------|----------|
| `/` | MainScreen | 모두 (비로그인 가능) |
| `/login` | AuthScreen | 모두 |
| `/write` | EditorScreen | 로그인 필요 |
| `/edit/:id` | EditorScreen | 로그인 + 본인 글만 |
| `/post/:id` | PostDetailScreen | 모두 (수정/삭제는 본인만) |

**접근 제어 방식**:
```typescript
// EditorScreen
useEffect(() => {
  if (!user) navigate('/login');
  if (postToEdit && postToEdit.author_id !== user.id) {
    alert('권한 없음');
    navigate('/');
  }
}, [user, postToEdit]);
```

---

## 6. 각 스크린별 주요 기능

### 6.1 MainScreen (글 목록 화면)

**위치**: `src/screens/MainScreen.tsx`

**주요 기능**:
1. **글 목록 표시** - 모든 Post 배열 렌더링
2. **글 상세보기** - PostListItem 클릭 시 상세 화면 이동
3. **검색** - 제목/내용에서 검색어 필터링
4. **정렬** - 최신순/오래된순 정렬
5. **선택 모드** - 체크박스로 다중 선택
6. **다중 삭제** - 선택된 글 한 번에 삭제
7. **새 글 작성** - EditorScreen으로 이동

**상태**:
```typescript
- isSelectMode: boolean          // 선택 모드 여부
- selectedPosts: Post[]          // 선택된 글들
- sortOrder: 'newest' | 'oldest'   // 정렬 순서
- searchKeyword: string          // 검색 입력값
- keyword: string                // 적용된 검색어
```

**주요 함수**:
- `getSortedPosts()` - 검색+정렬 결과 반환
- `getSearchedPosts()` - 검색 필터링
- `handleSelectPost()` - 글 선택/해제
- `handleDeletePosts()` - 다중 삭제

---

### 6.2 EditorScreen (글 작성/수정 화면)

**위치**: `src/screens/EditorScreen.tsx`

**주요 기능**:
1. **제목 입력** - 글 제목 입력
2. **본문 입력** - 글 본문 입력 (실시간 스타일 미리보기)
3. **에디터 모드** - 리치텍스트 / 마크다운 모드 전환
4. **글자 크기** - 12px ~ 24px 선택 (리치텍스트 모드)
5. **글자 스타일** - Bold, Italic, Underline 토글 (리치텍스트 모드)
6. **글자 색상** - color picker로 색상 선택 (리치텍스트 모드)
7. **유효성 검사** - 제목/본문 필수 입력
8. **권한 체크** - 로그인 필수, 수정 시 본인 글만

**상태**:
```typescript
- title: string
- content: string
- editorMode: 'markdown' | 'richtext'  // 에디터 모드
- fontSize: number (기본값: 16)
- isBold: boolean (기본값: false)
- isItalic: boolean (기본값: false)
- isUnderline: boolean (기본값: false)
- textColor: string (기본값: '#000000')
```

**특징**:
- 리치텍스트 모드: textarea에서 실시간 스타일 프리뷰
- 마크다운 모드: 마크다운 문법 사용, 저장 시 자동 파싱
- 수정 모드 시 기존 데이터로 폼 미리 채우기
- "등록" 또는 "수정" 버튼 동적 표시
- 본인 글이 아니면 접근 차단

---

### 6.3 PostDetailScreen (글 상세보기 화면)

**위치**: `src/screens/PostDetailScreen.tsx`

**주요 기능**:
1. **글 상세 표시** - 제목, 내용, 작성자, 작성일 표시
2. **스타일 적용** - 저장된 스타일(크기, 굵기, 색상 등) 반영
3. **마크다운/리치텍스트 렌더링** - isMarkdown에 따라 렌더링
4. **수정 버튼** - 본인 글만 표시, 클릭 시 `/edit/:id`로 이동
5. **삭제 버튼** - 본인 글만 표시, 확인 후 삭제
6. **뒤로가기** - `/`로 이동

**권한 체크**:
```typescript
{post.author_id === user?.id && (
  <button onClick={() => navigate(`/edit/${post.id}`)}>수정</button>
  <button onClick={() => handleDelete(post.id)}>삭제</button>
)}
```

---

## 7. 상태 관리

### 7.1 App.tsx 구조

```typescript
function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // 초기 데이터 로드
  useEffect(() => {
    const loadPosts = async () => {
      const data = await readPost();  // Supabase JOIN
      setPosts(data);
      setLoading(false);
    };
    loadPosts();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainScreen posts={posts} ... />} />
          <Route path="/login" element={<AuthScreen />} />
          <Route path="/write" element={<EditorScreen ... />} />
          <Route path="/edit/:id" element={<EditorScreen ... />} />
          <Route path="/post/:id" element={<PostDetailScreen ... />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

### 7.2 주요 상태

**App.tsx**:
```typescript
- posts: Post[]         // 전체 글 목록 (Supabase에서 로드)
- loading: boolean      // 데이터 로딩 상태
```

**AuthContext**:
```typescript
- user: User | null     // 현재 로그인한 사용자
- loading: boolean      // 세션 확인 중
```

**각 Screen**:
- MainScreen: 검색, 정렬, 선택 모드 관련 로컬 상태
- EditorScreen: 폼 입력 관련 로컬 상태
- PostDetailScreen: 댓글 관련 로컬 상태 (추후)

### 7.3 주요 함수 (App.tsx)

**글 관리**:
```typescript
handleAddPost(title, content, ..., isMarkdown)
  ├─ Post 객체 생성 (author_id: user.id)
  ├─ await createPost(newPost)  // Supabase
  ├─ setPosts([newPost, ...posts])
  └─ navigate(`/post/${newPost.id}`)

handleUpdatePost(postId, title, content, ..., isMarkdown)
  ├─ Post 객체 생성
  ├─ await updatePost(updatedPost)  // Supabase
  ├─ setPosts(posts.map(p => p.id === postId ? updatedPost : p))
  └─ navigate(`/post/${postId}`)

handleDeletePost(postId)
  ├─ await deletePost(postId)  // Supabase
  ├─ setPosts(posts.filter(p => p.id !== postId))
  └─ navigate('/')
```

**라우팅**:
```typescript
// React Router의 navigate 사용
navigate('/')           // 메인 화면
navigate('/login')      // 로그인 화면
navigate('/write')      // 글쓰기
navigate(`/edit/${id}`) // 글 수정
navigate(`/post/${id}`) // 글 상세
```

### 7.4 데이터 흐름

```
Supabase DB
    ↓
readPost() → JOIN with users
    ↓
App.tsx: setPosts()
    ↓
Props로 전달 → Screens
    ↓
사용자 액션 (작성/수정/삭제)
    ↓
App.tsx: handleXXX()
    ↓
supabaseApi (createPost/updatePost/deletePost)
    ↓
Supabase DB 업데이트
    ↓
App.tsx: setPosts() (로컬 상태 동기화)
```

---

## 8. 스타일링 (Tailwind CSS)

### 주요 특징
- **Utility-First CSS** - HTML에 직접 클래스 적용
- **반응형 디자인** - `sm:`, `md:`, `lg:` prefix로 브레이크포인트 지정
- **다크 모드 지원** - `dark:` prefix 사용 가능
- **커스텀 설정** - `tailwind.config.js`에서 테마 확장
- **JIT 모드** - 필요한 클래스만 생성, 빠른 빌드

### 색상 팔레트

```css
Primary (Blue): 
- bg-blue-500, text-blue-500, hover:bg-blue-600

Success (Green):
- bg-green-500, text-green-500

Danger (Red):
- bg-red-500, text-red-500

Gray Scales:
- text-gray-900 (진한 회색)
- text-gray-600 (중간 회색)
- text-gray-500 (연한 회색)
- bg-gray-50 (매우 연한 배경)
- border-gray-200 (테두리)
```

### 주요 UI 패턴

**버튼**:
```html
<!-- Primary Button -->
<button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
  등록
</button>

<!-- Secondary Button -->
<button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
  취소
</button>
```

**카드**:
```html
<div class="p-4 rounded-xl hover:bg-white transition-all border border-transparent hover:border-gray-200">
  <!-- 내용 -->
</div>
```

**입력 폼**:
```html
<input class="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
```

**프로필 아이콘**:
```html
<div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
  A
</div>
```

### 반응형 디자인

```html
<!-- 모바일: 전체 너비, 데스크톱: 최대 4xl -->
<div class="w-full max-w-4xl mx-auto px-4 sm:px-6">
  <!-- 내용 -->
</div>

<!-- 모바일: 세로 배치, 데스크톱: 가로 배치 -->
<div class="flex flex-col md:flex-row gap-4">
  <!-- 내용 -->
</div>
```

### 애니메이션

```html
<!-- Hover 효과 -->
<button class="transition-colors hover:text-blue-500">버튼</button>

<!-- 부드러운 전환 -->
<div class="transition-all duration-200">내용</div>

<!-- 그룹 Hover -->
<div class="group">
  <h3 class="group-hover:text-blue-500">제목</h3>
</div>
```

---

## 9. 주요 기능 상세 설명

### 9.1 검색 기능

**동작 방식**:
1. input에 검색어 입력 → `searchKeyword` 상태 업데이트
2. "🔍" 버튼 클릭 → `keyword` 상태 업데이트
3. `getSortedPosts()`에서 keyword로 필터링
4. 정렬과 함께 검색 결과 표시

**코드**:
```typescript
const getSearchedPosts = () => {
  return posts.filter(post =>
    post.title.includes(keyword) ||
    post.content.includes(keyword)
  );
};
```

**특징**:
- 검색어는 대소문자 구분 (includes 사용)
- 제목 또는 내용 중 하나라도 포함되면 결과에 표시

---

### 9.2 정렬 기능

**동작 방식**:
1. Select 드롭다운에서 "최신순" 또는 "오래된순" 선택
2. `sortOrder` 상태 업데이트
3. `getSortedPosts()`에서 정렬 적용
4. 검색과 함께 작동 (검색된 글들을 정렬)

**코드**:
```typescript
const getSortedPosts = () => {
  const sorted = keyword === '' ? [...posts] : getSearchedPosts();
  if (sortOrder === 'newer') {
    return sorted.sort((a, b) => Number(b.id) - Number(a.id));
  } else {
    return sorted.sort((a, b) => Number(a.id) - Number(b.id));
  }
};
```

**ID 기반 정렬**:
- ID는 `Date.now()` 타임스탬프 → 최신 글이 더 큰 ID를 가짐
- 최신순: 큰 ID → 작은 ID
- 오래된순: 작은 ID → 큰 ID

---

### 9.3 다중 삭제 기능

**동작 방식**:
1. "선택" 버튼 클릭 → 선택 모드 진입 (체크박스 표시)
2. 삭제할 글들 선택 → `selectedPosts` 배열에 추가
3. "삭제" 버튼 클릭 → 확인 창 표시
4. "확인" 시 `onDeletePost(selectedPosts)` 호출
5. App에서 posts 배열에서 제거

**코드**:
```typescript
const handleDeletePosts = (deletePosts: Post[]) => {
  setPosts(prev => prev.filter(post => !deletePosts.includes(post)));
};
```

---

### 9.4 Supabase 데이터 영속성

**특징**:
- PostgreSQL 데이터베이스에 안전하게 저장
- 팀 멤버 간 실시간 데이터 공유
- 어떤 기기에서든 로그인 후 접근 가능
- 작성자 정보 및 권한 관리

**데이터 저장 위치**:
```
Supabase PostgreSQL
├─ posts (테이블)
│  ├─ 모든 글 데이터
│  └─ author_id로 작성자 추적
├─ public.users (테이블)
│  └─ 작성자 이메일 정보
└─ allowed_emails (테이블)
   └─ 회원가입 허용 이메일
```

**CRUD 함수** (src/lib/supabaseApi.ts):
```typescript
// 생성
createPost(post: Post): Promise<Post>
  └─ supabase.from('posts').insert([post])

// 조회 (JOIN 포함)
readPost(): Promise<Post[]>
  └─ supabase.from('posts').select('*, users!author_id (email)')

// 수정
updatePost(post: Post): Promise<Post>
  └─ supabase.from('posts').update(...).eq('id', post.id)

// 삭제
deletePost(postId: string): Promise<void>
  └─ supabase.from('posts').delete().eq('id', postId)
```

**장점**:
- ✅ 팀 협업 가능 (모든 팀원이 동일한 데이터 공유)
- ✅ 데이터 백업 및 복구
- ✅ 작성자 추적 및 권한 관리
- ✅ 실시간 동기화 (선택사항)
- ✅ 브라우저 제한 없음

---

## 10. 로그인 및 인증 시스템

### 10.1 인증 방식

**이메일 화이트리스트 기반 회원가입**
- 사전에 등록된 이메일만 회원가입 가능
- `allowed_emails` 테이블에서 관리
- 관리자가 팀 멤버 이메일 추가/삭제

### 10.2 데이터베이스 구조

```
auth.users (Supabase 기본 제공)
  ↓ 트리거 자동 동기화
public.users (미러 테이블)
  ↓ 1:N 관계
posts (author_id FK)
```

**주요 테이블**:
- `allowed_emails`: 허용된 이메일 화이트리스트
- `public.users`: auth.users 미러링 (JOIN 용이)
- `posts.author_id`: 작성자 ID 참조

### 10.3 AuthContext 구조

```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;           // 현재 로그인한 사용자
  loading: boolean;            // 세션 확인 중
  signUp: (email, password) => Promise<{ error }>;
  signIn: (email, password) => Promise<{ error }>;
  signOut: () => Promise<void>;
}
```

**기능**:
- 초기 세션 자동 확인
- 실시간 세션 변경 구독
- 회원가입 시 화이트리스트 검증
- 로그인/로그아웃 처리

### 10.4 인증 흐름

#### 회원가입 흐름
```
1. 사용자가 이메일/비밀번호 입력
   ↓
2. AuthContext.signUp() 호출
   ↓
3. allowed_emails 테이블에서 이메일 확인
   ↓
4-1. 화이트리스트에 있음 → Supabase Auth 회원가입
   ↓
5. 트리거 자동 실행 → public.users에 추가
   ↓
6. 자동 로그인 처리

4-2. 화이트리스트에 없음 → 에러 반환
```

#### 로그인 흐름
```
1. 사용자가 이메일/비밀번호 입력
   ↓
2. AuthContext.signIn() 호출
   ↓
3. Supabase Auth 인증
   ↓
4. 세션 생성 및 user 상태 업데이트
   ↓
5. onAuthStateChange로 실시간 동기화
```

### 10.5 권한 관리

**UI 레벨 권한 체크**:
- PostDetailScreen: 본인 글만 수정/삭제 버튼 표시
  ```typescript
  {post.author_id === user?.id && (
    <button>수정</button>
    <button>삭제</button>
  )}
  ```

- EditorScreen: 로그인 필수, 본인 글만 수정 가능
  ```typescript
  useEffect(() => {
    if (!user) navigate('/login');
    if (postToEdit && postToEdit.author_id !== user.id) {
      navigate('/');
    }
  }, [user, postToEdit]);
  ```

**DB 레벨 보안 (추후)**:
- RLS (Row Level Security) 정책
- 본인 글만 UPDATE/DELETE 가능하도록 제한

### 10.6 세션 관리

**자동 세션 유지**:
```typescript
useEffect(() => {
  // 앱 로드 시 세션 확인
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
  });

  // 세션 변경 구독
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user ?? null);
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

**특징**:
- 페이지 새로고침 시 로그인 유지
- 여러 탭에서 로그인 상태 동기화
- 로그아웃 시 모든 탭에서 자동 로그아웃

### 10.7 보안 고려사항

**현재 구현**:
- 프론트엔드 권한 체크 (UI 레벨)
- Supabase RLS로 allowed_emails 보호
- 비로그인 사용자는 글 조회만 가능

**추후 개선 필요**:
- posts 테이블 RLS 정책 (DB 레벨 보안)
- 관리자 권한 시스템 (is_admin)
- API Rate Limiting

---

## 11. 배포

### 현재 배포 상태
- **플랫폼**: Vercel
- **URL**: `https://team-blog-delta.vercel.app`
- **트래킹 브랜치**: main
- **자동 배포**: main 브랜치 push 시 자동 배포

### 배포 프로세스
1. 로컬에서 코드 수정
2. `git add . && git commit -m "..."` 커밋
3. `git push origin main` 푸시
4. Vercel이 자동으로 감지하여 빌드 및 배포
5. 1-2분 후 배포 완료

### Vercel 대시보드
```
https://vercel.com → team-blog 프로젝트 → Deployments
```

---

## 12. 향후 개선 사항

### ✅ Phase 1: 로그인 & 기본 사용자 시스템 (완료!)
- [x] Supabase 연동
- [x] 이메일 화이트리스트 기반 회원가입
- [x] 로그인/로그아웃
- [x] 작성자 정보 표시
- [x] 권한 관리 (본인 글만 수정/삭제)
- [x] EditorScreen 접근 제어

### Phase 2: 관리 기능
- [ ] 관리자 페이지 (이메일 화이트리스트 관리 UI)
- [ ] 관리자 권한 시스템 (is_admin 컬럼)
- [ ] posts 테이블 RLS 정책 추가

### Phase 3: 에디터 개선 (일부 완료)
- [x] 마크다운 지원
- [x] 리치텍스트/마크다운 모드 전환
- [ ] 더 많은 포맷 옵션 (링크, 이미지 등)
- [ ] 드래그앤드롭 파일 업로드

### Phase 4: 소셜 기능
- [ ] 댓글 기능
- [ ] 좋아요/반응 기능
- [ ] 글 카테고리/태그
- [ ] 글 공유 기능

### Phase 5: 추가 기능
- [ ] 페이징 (글이 많을 때)
- [ ] 알림 시스템
- [ ] 검색 고도화 (전문 검색)
- [ ] SEO 최적화

---

## 13. 문제 해결

### 문제: 색상이 textarea에서 미리보기 안 됨
**원인**: textarea의 color 속성 제약
**해결**: 상세 페이지에서만 색상 확인 가능

### 문제: 검색 후 실시간 반영됨
**원인**: searchKeyword 직접 사용
**해결**: keyword 상태로 분리, 버튼 클릭 시에만 업데이트

### 문제: PostItem 레이아웃 깨짐
**원인**: flex 설정 누락
**해결**: PostItem에 `flex: 1` 추가로 남은 공간 모두 차지

---

## 14. 참고 자료

- [React 공식 문서](https://react.dev)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Supabase Auth 가이드](https://supabase.com/docs/guides/auth)
- [React Router 문서](https://reactrouter.com)
- [Vite 문서](https://vitejs.dev)
- [Vercel 배포 가이드](https://vercel.com/docs)

---

**문서 작성일**: 2026년 1월 20일  
**최종 업데이트**: 2026년 2월 3일  
**버전**: 2.0.0