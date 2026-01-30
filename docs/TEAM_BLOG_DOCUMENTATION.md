# 팀 블로그 에디터 - 프로젝트 문서

## 1. 프로젝트 개요

**팀 블로그 에디터**는 팀이 함께 글을 작성, 편집, 관리할 수 있는 웹 기반 에디터입니다.

### 주요 특징
- ✅ 글 작성/수정/삭제 (개별 + 다중 삭제)
- ✅ 마크다운 스타일 텍스트 포맷팅 (굵기/기울임/밑줄/취소선)
- ✅ 글 검색 기능 (제목/내용, 실시간)
- ✅ 글 정렬 기능 (최신순/등록순)
- ✅ 댓글 UI (기능 미구현)
- ✅ Supabase 데이터베이스 연동
- ✅ React Router 기반 라우팅
- ✅ 반응형 UI (Tailwind CSS)
- ✅ 이중 편집 모드 (마크다운/리치텍스트)

---

## 2. 기술 스택

| 분류 | 기술 |
|------|------|
| **Language** | TypeScript |
| **Frontend Framework** | React 18 |
| **Styling** | Tailwind CSS |
| **State Management** | React Hooks (useState, useEffect) |
| **Data Persistence** | Supabase (PostgreSQL) |
| **Build Tool** | Vite |
| **Deployment** | Vercel |
| **Version Control** | Git/GitHub |
| **Backend** | Supabase |
| **Routing** | React Router |

---

## 3. 프로젝트 구조

```
team-blog/
├── public/                      # 정적 파일
├── src/
│   ├── App.tsx                 # 메인 앱, React Router 설정
│   ├── types/
│   │   └── Post.ts             # Post 인터페이스 정의
│   ├── screens/
│   │   ├── MainScreen.tsx       # 글 목록, 검색, 정렬
│   │   ├── EditorScreen.tsx     # 글 작성/수정, 마크다운 에디터
│   │   └── PostDetailScreen.tsx # 글 상세 보기, 댓글, 삭제
│   ├── lib/
│   │   ├── supabaseApi.ts      # Supabase CRUD API
│   │   └── supabaseClient.ts   # Supabase 클라이언트 초기화
│   ├── utils/
│   │   ├── markdown.ts         # 마크다운 파싱 유틸리티 (AST 생성)
│   │   └── markdownRender.tsx  # 마크다운 렌더링 컴포넌트
│   ├── main.tsx                # Vite 진입점
│   └── index.css               # Tailwind CSS imports
├── index.html                   # Vite HTML 템플릿 (루트)
├── tailwind.config.js          # Tailwind 설정
├── vite.config.ts              # Vite 설정
├── package.json
└── README.md
```

---

## 4. 데이터 구조

### Post 인터페이스

```typescript
export interface Post {
  id: string;              // 타임스탬프 기반 고유 ID
  title: string;           // 글 제목
  content: string;         // 글 본문
  fontSize: number;        // 글자 크기 (12-24px)
  isBold: boolean;         // 굵기 여부
  isItalic: boolean;       // 기울임 여부
  isUnderline: boolean;    // 밑줄 여부
  textColor: string;       // 글자 색상 (hex 색상코드)
  createdAt: string;       // 작성일자 (YYYY-MM-DD 형식)
  isMarkdown: boolean;     // 마크다운 모드 여부
}
```

**마크다운 모드 (`isMarkdown`)**:
- `true`: 마크다운 파서로 렌더링
- `false`: 일반 텍스트로 렌더링 (fontSize, isBold 등 스타일 속성 적용)

**스타일 속성**:
- 마크다운 모드가 아닐 때 사용
- 사용자가 직접 선택한 폰트 크기, 굵기, 색상 등 적용

---

## 5. 데이터 흐름

### 5.1 전체 데이터 흐름

```
┌─────────────────────────────────────────────┐
│           React State (App.tsx)              │
│  - posts: Post[]                            │
└────────────────┬────────────────────────────┘
                 │
     ┌───────────┼───────────┐
     ↓           ↓           ↓
┌──────────┐ ┌──────────┐ ┌────────────┐
│  Main    │ │ Editor   │ │   Detail   │
│ Screen   │ │ Screen   │ │   Screen   │
│   (/)    │ │ (/write) │ │ (/post/:id)│
└──────────┘ └──────────┘ └────────────┘
     │           │           │
     └───────────┼───────────┘
                 ↓
      ┌────────────────────┐
      │  Supabase API      │
      │  (supabaseApi.ts)  │
      └─────────┬──────────┘
                ↓
      ┌────────────────────┐
      │  PostgreSQL DB     │
      │  (Supabase)        │
      └────────────────────┘
```

**React Router 경로**:
- `/` - MainScreen (글 목록)
- `/write` - EditorScreen (새 글 작성)
- `/edit/:id` - EditorScreen (글 수정)
- `/post/:id` - PostDetailScreen (글 상세보기)

### 5.2 글 생성 흐름

```
EditorScreen (새로 쓰기 모드, /write)
  ├─ 제목 입력
  ├─ 본문 입력 (마크다운 문법 사용)
  ├─ 실시간 미리보기로 확인
  └─ "등록" 버튼 클릭
       ↓
App.tsx: handleAddPost()
  ├─ 새 Post 객체 생성
  │  ├─ id: Date.now().toString()
  │  ├─ createdAt: new Date().toLocaleDateString('ko-KR')
  │  └─ 기타 스타일 속성
  ├─ await createPost(newPost)  // Supabase API 호출
  ├─ setPosts([newPost, ...posts])  // 로컬 상태 업데이트
  └─ navigate(`/post/${newPost.id}`)  // 상세 페이지로 이동
       ↓
Supabase API (supabaseApi.ts)
  └─ PostgreSQL에 데이터 저장
       ↓
PostDetailScreen (/post/:id)
  └─ 새로 작성한 글 표시
```

### 5.3 글 수정 흐름

```
PostDetailScreen (/post/:id)
  └─ "수정" 버튼 클릭
       ↓
navigate(`/edit/${postId}`)
       ↓
EditorScreen (수정 모드, /edit/:id)
  ├─ useParams()로 postId 가져오기
  ├─ posts에서 해당 글 찾기
  ├─ 기존 데이터로 폼 채우기
  └─ "수정" 버튼 클릭
       ↓
App.tsx: handleUpdatePost()
  ├─ updatedPost 객체 생성 (기존 id 유지)
  ├─ await updatePost(updatedPost)  // Supabase API 호출
  ├─ setPosts(posts.map(...))  // 로컬 상태 업데이트
  └─ navigate(`/post/${postId}`)  // 상세 페이지로 이동
       ↓
Supabase API (supabaseApi.ts)
  └─ PostgreSQL에서 데이터 업데이트
       ↓
PostDetailScreen (/post/:id)
  └─ 수정된 글 표시
```

### 5.4 검색 흐름

```
MainScreen
  ├─ searchKeyword 입력
  └─ onChange 이벤트로 즉시 반영
       ↓
setSearchKeyword(e.target.value)
       ↓
getSortedPosts()
  ├─ getSearchedPosts() 호출
  │  └─ posts.filter(post => 
  │      post.title.includes(searchKeyword) || 
  │      post.content.includes(searchKeyword))
  └─ 필터링된 배열 정렬
       ↓
MainScreen에 검색 결과 실시간 표시
```

**특징**:
- **실시간 검색**: 타이핑할 때마다 즉시 결과 반영
- 별도의 검색 버튼 없음
- 검색어가 비어있으면 전체 글 표시

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
- isSelectMode: boolean              // 선택 모드 여부
- selectedPosts: Post[]              // 선택된 글들
- sortOrder: 'newest' | 'oldest'     // 정렬 순서
- searchKeyword: string              // 검색 입력값 (실시간 반영)
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
2. **편집 모드 선택** - 마크다운 모드 / 리치텍스트 모드 토글
3. **마크다운 모드**:
   - 마크다운 문법으로 텍스트 포맷팅
   - 실시간 미리보기
   - 포맷 도구바 (굵게, 기울임, 밑줄 등)
   - **스타일 도구 비활성화**: 마크다운 모드에서는 툴바 버튼들이 `disabled` 상태
4. **리치텍스트 모드**:
   - 글자 크기 선택 (12-24px)
   - 스타일 옵션 (굵기, 기울임, 밑줄)
   - 글자 색상 선택
   - 모든 스타일 도구 활성화
5. **유효성 검사** - 제목/본문 필수 입력
6. **수정 모드** - URL 파라미터(`/edit/:id`)로 postId 전달

**툴바 UI 상태**:
```typescript
// 마크다운 모드일 때
disabled={editorMode === 'markdown'}
className={`... ${
  editorMode === 'markdown' 
    ? 'opacity-30 cursor-not-allowed'  // 비활성화 스타일
    : '...'                             // 활성화 스타일
}`}
```

**상태**:
```typescript
- title: string
- content: string
- editorMode: 'markdown' | 'richtext'  // 편집 모드 (기본값: 'richtext')
- fontSize: number           // 일반 모드 전용
- isBold: boolean            // 일반 모드 전용
- isItalic: boolean          // 일반 모드 전용
- isUnderline: boolean       // 일반 모드 전용
- textColor: string          // 일반 모드 전용
```

**특징**:
- 사용자가 마크다운 모드 / 리치텍스트 모드 선택 가능
- **마크다운 모드**: 스타일 도구 비활성화 (opacity-30, cursor-not-allowed)
- **리치텍스트 모드**: 모든 스타일 도구 활성화
- 각 모드에 맞는 UI 표시
- 실시간 미리보기 (마크다운 모드)
- `useParams()`로 URL에서 postId 추출 (수정 모드)
- 수정 모드 시 기존 데이터로 폼 미리 채우기
- "등록" 또는 "수정" 버튼 동적 표시

---

### 6.3 PostDetailScreen (글 상세보기 화면)

**위치**: `src/screens/PostDetailScreen.tsx`

**주요 기능**:
1. **글 상세 표시** - 제목, 내용, 작성일 표시
2. **모드 표시 뱃지** - Markdown/Rich Text 모드 구분 표시
3. **Reading Time** - 글자 수 기반 예상 읽기 시간 (분)
4. **마크다운 렌더링** - 마크다운 문법을 React 컴포넌트로 변환
5. **댓글 섹션 UI** - 댓글 입력 폼 (기능 미구현)
6. **수정 버튼** - EditorScreen으로 이동 (수정 모드)
7. **삭제 버튼** - 개별 글 삭제 (확인 후)
8. **뒤로가기** - MainScreen으로 이동

**Props**:
```typescript
interface PostDetailScreenProps {
  posts: Post[];                     // 전체 글 목록 (URL 파라미터로 글 찾기)
  onGoToMain: () => void;            // 메인 화면 이동
  onEdit: (postId: string) => void;  // 수정 모드
  onDelete: (postId: string) => void;// 삭제
}
```

**URL 파라미터**:
- `useParams()`로 `/post/:id`에서 id 추출
- posts 배열에서 해당 id의 글 찾기

**렌더링 방식**:
- **마크다운 모드** (`isMarkdown: true`):
  ```typescript
  <MarkdownRenderer markdown={post.content} />
  ```
  - `MarkdownRenderer` 컴포넌트 사용
  - `parseMarkdown()`, `parseInline()`으로 AST 생성
  - Block 노드와 Inline 노드를 React 컴포넌트로 렌더링
  - Tailwind CSS로 스타일링
  - **모드 뱃지**: `bg-purple-100 text-purple-600`로 "Markdown" 표시
  
- **리치텍스트 모드** (`isMarkdown: false`):
  ```typescript
  <div
    className="leading-relaxed whitespace-pre-wrap"
    style={{
      fontSize: `${post.fontSize}px`,
      fontWeight: post.isBold ? 'bold' : 'normal',
      fontStyle: post.isItalic ? 'italic' : 'normal',
      textDecoration: post.isUnderline ? 'underline' : 'none',
      color: post.textColor
    }}
  >
    {post.content}
  </div>
  ```
  - 저장된 스타일 속성 직접 적용
  - 일반 텍스트로 렌더링
  - **모드 뱃지**: `bg-blue-100 text-blue-600`로 "Rich Text" 표시

**추가 UI 요소**:
- **Reading Time**: `Math.ceil(post.content.length / 1000) min read`
- **모드 뱃지**: 글 상단에 현재 모드 표시
- **댓글 섹션**: UI만 구현 (기능 미구현)

---

## 7. 상태 관리 (App.tsx)

### 주요 상태

```typescript
- posts: Post[]                    // 전체 글 목록 (Supabase에서 로드)
- navigate: NavigateFunction       // React Router 네비게이션 함수
```

**React Router 기반 라우팅**:
- URL 경로로 현재 화면 결정
- `currentScreen` 상태 불필요
- `selectedPostId`, `editingPostId`는 URL 파라미터로 대체

### 주요 함수

```typescript
// 초기 데이터 로드
useEffect(() => {
  const loadPosts = async () => {
    const data = await readPost();
    setPosts(data);
  };
  loadPosts();
}, []);

// 글 생성
- handleAddPost(title, content, ...)
  └─ await createPost(newPost)
  └─ navigate(`/post/${newPost.id}`)

// 글 수정
- handleUpdatePost(postId, title, content, ...)
  └─ await updatePost(updatedPost)
  └─ navigate(`/post/${postId}`)

// 글 삭제 (단일)
- handleDeletePost(postId)
  └─ await deletePost(postId)
  └─ navigate('/')

// 글 삭제 (다중)
- handleDeleteMultiplePosts(deletePosts)
  └─ await deleteMultiplePosts(ids)

// 화면 이동 (React Router)
- navigate('/')              // 메인 화면
- navigate('/write')         // 새 글 작성
- navigate('/edit/:id')      // 글 수정
- navigate('/post/:id')      // 글 상세보기
```

### Supabase 데이터 동기화

```typescript
// 초기 로드 (컴포넌트 마운트 시)
useEffect(() => {
  const loadPosts = async () => {
    try {
      const data = await readPost();
      console.log('데이터 로드 성공:', data);
      setPosts(data);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };
  
  loadPosts();
}, []);

// 모든 CRUD 작업은 비동기 API 호출
// - 로컬 상태(posts)와 Supabase DB를 동시 업데이트
// - 에러 발생 시 사용자에게 알림
```

---

## 8. 스타일링 (Tailwind CSS)

### 주요 특징
- **유틸리티 우선** - 클래스 이름으로 스타일 직접 적용
- **반응형 디자인** - `sm:`, `md:`, `lg:` 접두사로 반응형 처리
- **일관된 디자인 시스템** - Tailwind의 사전 정의된 색상, 간격 사용
- **빠른 개발** - 별도 CSS 파일 없이 JSX에서 바로 스타일링

### 주요 색상 팔레트

```typescript
// Primary (파란색)
- bg-blue-600 / hover:bg-blue-700
- text-blue-600

// Success (초록색)
- bg-green-600 / hover:bg-green-700
- text-green-600

// Danger (빨간색)
- bg-red-600 / hover:bg-red-700
- text-red-600

// Neutral (회색)
- bg-gray-100 / bg-gray-200
- text-gray-600 / text-gray-900
- border-gray-300
```

### 주요 스타일 패턴

```typescript
// 버튼
className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"

// 입력 필드
className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"

// 카드
className="bg-white p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer"

// 컨테이너
className="max-w-4xl mx-auto p-4"
```

### 마크다운 렌더링 스타일

MarkdownRenderer 컴포넌트에서 사용되는 Tailwind 클래스:

```typescript
// 인용구
className="border-l-4 border-blue-500 pl-4 py-2 my-4 text-gray-600 italic bg-gray-50"

// 순서 없는 리스트
className="list-disc list-inside my-4 space-y-2"

// 순서 있는 리스트
className="list-decimal list-inside my-4 space-y-2"

// 리스트 항목
className="text-gray-800"

// 체크박스
className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-0"

// 완료된 체크박스 텍스트
className="line-through text-gray-400"

// 미완료 체크박스 텍스트
className="text-gray-800"

// 구분선
className="my-8 border-t-2 border-gray-200"

// 코드 블록
className="bg-gray-800 text-white p-4 rounded-lg my-4 overflow-x-auto"

// 링크
className="text-blue-500 hover:text-blue-700 underline"

// 이미지
className="max-w-full h-auto rounded-lg my-4"
```

### 반응형 디자인

```typescript
// 모바일 우선 접근
- 기본: 모바일 스타일
- sm:  (640px+): 작은 태블릿
- md:  (768px+): 태블릿
- lg:  (1024px+): 데스크톱
- xl:  (1280px+): 큰 데스크톱

// 예시
className="text-sm md:text-base lg:text-lg"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

---

## 9. 마크다운 파싱 시스템

### 개요
2단계 파싱 시스템으로 마크다운 문법을 HTML로 변환
- **Block Parser** (`parseMarkdown`): 블록 레벨 요소 파싱 (제목, 리스트, 코드 블록 등)
- **Inline Parser** (`parseInline`): 인라인 레벨 요소 파싱 (굵기, 기울임, 링크 등)

### 지원 문법

#### Block 레벨 요소

| 문법 | 결과 | 타입 |
|------|------|------|
| `# 제목` | <h1>제목</h1> | h1 |
| `## 제목` | <h2>제목</h2> | h2 |
| `### 제목` | <h3>제목</h3> | h3 |
| `#### 제목` | <h4>제목</h4> | h4 |
| `> 인용구` | <blockquote>인용구</blockquote> | blockquote |
| `- 항목` | <ul><li>항목</li></ul> | ul |
| `1. 항목` | <ol><li>항목</li></ol> | ol |
| `- [ ] 할일` | ☐ 할일 | checklist |
| `- [x] 완료` | ☑ 완료 | checklist |
| ` ```코드``` ` | <pre><code>코드</code></pre> | code |
| `---` | <hr> | hr |
| 일반 텍스트 | <p>텍스트</p> | p |

#### Inline 레벨 요소

| 문법 | 결과 | 타입 |
|------|------|------|
| `***텍스트***` | <strong><em>텍스트</em></strong> | strongAndEm |
| `**텍스트**` | <strong>텍스트</strong> | strong |
| `*텍스트*` | <em>텍스트</em> | em |
| `__텍스트__` | <u>텍스트</u> | u |
| `` `코드` `` | <code>코드</code> | code |
| `[텍스트](URL)` | <a href="URL">텍스트</a> | link |
| `![alt](URL)` | <img src="URL" alt="alt"> | image |

### 파싱 흐름

```
마크다운 텍스트
     ↓
parseMarkdown(markdown) 
  (src/utils/markdown.ts)
     ↓
블록 단위로 분리 (줄 단위 순회)
     ↓
각 블록의 타입 결정
  - 제목 (#으로 시작)
  - 리스트 (-, *, 1. 로 시작)
  - 코드 블록 (```로 감싸짐)
  - 인용구 (>로 시작)
  - 체크리스트 (- [ ] 또는 - [x])
  - 구분선 (---, ***, ___)
  - 일반 문단
     ↓
BlockNode[] 배열 생성
     ↓
MarkdownRenderer 컴포넌트
  (src/utils/markdownRender.tsx)
     ↓
각 블록을 React 컴포넌트로 변환
  - h1 → <h1>
  - ul → <ul><li>
  - code → <pre><code>
  - etc.
     ↓
각 블록의 텍스트에 parseInline() 적용
     ↓
InlineNode[] 배열 생성
     ↓
renderInline() 헬퍼 함수
     ↓
인라인 노드를 React 요소로 변환
  - strong → <strong>
  - link → <a>
  - image → <img>
  - etc.
     ↓
최종 React 컴포넌트 트리 완성
     ↓
브라우저에 렌더링
```

**2단계 렌더링 프로세스**:
1. **파싱 단계** (markdown.ts): 텍스트 → AST
2. **렌더링 단계** (markdownRender.tsx): AST → React 컴포넌트

### 주요 특징

#### 1. 연속된 리스트 항목 그룹화
```typescript
// 입력
- 항목1
- 항목2
- 항목3

// 출력 (단일 BlockNode)
{
  type: 'ul',
  value: ['항목1', '항목2', '항목3']
}
```

#### 2. 체크리스트 지원
- 반각 괄호 `[ ]`, `[x]` 지원
- 전각 괄호 `［ ］`, `［x］` 지원 (한글 입력 호환성)
- 완료된 항목은 `line-through` 스타일 자동 적용
```typescript
- [ ] 미완료
- [x] 완료  → <span className="line-through text-gray-400">
- ［ ］ 전각 미완료
- ［x］ 전각 완료
```

#### 3. 중첩 강조 구문 처리
파싱 순서를 통한 우선순위:
1. `***` (굵게 + 기울임) - 가장 먼저 체크
2. `**` (굵게)
3. `*` (기울임)
4. `__` (밑줄)

#### 4. 이미지와 링크 구분
- 이미지: `![alt](url)` - `!`로 시작
- 링크: `[text](url)` - `!` 없음
- 파싱 순서: 이미지를 먼저 체크하여 충돌 방지
- 렌더링 시 안전한 속성 자동 추가:
  - 링크: `target="_blank" rel="noopener noreferrer"`
  - 이미지: `max-w-full h-auto` 반응형 처리

#### 5. 코드 블록 멀티라인 지원
```typescript
// 입력
```
function hello() {
  return "world";
}
```

// 출력
{
  type: 'code',
  value: 'function hello() {\n  return "world";\n}'
}

// 렌더링
<pre className="bg-gray-800 text-white p-4 rounded-lg">
  <code>{block.value}</code>
</pre>
```

#### 6. React 컴포넌트 기반 안전한 렌더링
- `dangerouslySetInnerHTML` 미사용
- 모든 요소를 실제 React 컴포넌트로 렌더링
- Tailwind CSS로 일관된 스타일링
- React의 기본 XSS 방어 활용

### 타입 정의

```typescript
// 블록 레벨 노드
export type BlockNode = 
| {type: 'h1'; value: string}
| {type: 'h2'; value: string}
| {type: 'h3'; value: string}
| {type: 'h4'; value: string}
| {type: 'blockquote'; value: string}
| {type: 'ol'; value: string[]}
| {type: 'ul'; value: string[]}
| {type: 'checklist', items: {checked:boolean; text:string}[] }
| {type: 'hr'}
| {type: 'p'; value: string}
| {type: 'code'; value: string}
;

// 인라인 레벨 노드
export type InlineNode = 
| {type: 'text'; value: string}
| {type: 'strongAndEm'; value: string} 
| {type: 'strong'; value: string}
| {type: 'em'; value: string}
| {type: 'u'; value: string}
| {type: 'code'; value: string}
| {type: 'link'; value: string; url: string}
| {type: 'image'; value: string; url: string}
;
```

### 파싱 알고리즘

#### Block Parser
```typescript
// 줄 단위 순회
while(i < lines.length) {
  const line = lines[i];
  
  // 1. 코드 블록 (여러 줄)
  if(line.startsWith('```')) {
    // 닫는 ``` 까지 모든 줄 수집
  }
  
  // 2. 제목 (# 개수로 레벨 결정)
  if(line.startsWith('####')) → h4
  if(line.startsWith('###'))  → h3
  if(line.startsWith('##'))   → h2
  if(line.startsWith('#'))    → h1
  
  // 3. 인용구
  if(line.startsWith('>'))    → blockquote
  
  // 4. 체크리스트
  if(/^[-*]\s*[\[［][xX ][］\]]/.test(line)) {
    // 연속된 체크리스트 항목 그룹화
  }
  
  // 5. 순서 없는 리스트
  if(line.startsWith('- ') || line.startsWith('* ')) {
    // 연속된 항목 그룹화
  }
  
  // 6. 순서 있는 리스트
  if(/^\d+\. /.test(line)) {
    // 연속된 항목 그룹화
  }
  
  // 7. 구분선
  if(line.trim() === '---' || '***' || '___') → hr
  
  // 8. 빈 줄 (무시)
  
  // 9. 일반 문단
  → p
}
```

#### Inline Parser
```typescript
// 문자 단위 순회
while(i < text.length) {
  // 1. 인라인 코드
  if(text[i] === '`') {
    // 다음 `까지 수집
  }
  
  // 2. 이미지
  if(text[i] === '!' && text[i+1] === '[') {
    // ![alt](url) 형식 파싱
  }
  
  // 3. 링크
  if(text[i] === '[') {
    // [text](url) 형식 파싱
  }
  
  // 4. 굵게 + 기울임
  if(text.startsWith('***', i)) {
    // *** 사이 텍스트 수집
  }
  
  // 5. 굵게
  if(text.startsWith('**', i)) {
    // ** 사이 텍스트 수집
  }
  
  // 6. 기울임
  if(text.startsWith('*', i)) {
    // * 사이 텍스트 수집
  }
  
  // 7. 밑줄
  if(text.startsWith('__', i)) {
    // __ 사이 텍스트 수집
  }
  
  // 8. 일반 텍스트
  buffer에 누적
}
```

### 보안 고려사항

- **제한된 문법만 지원**: script, iframe 등 위험한 태그 불가
- **명시적 타입 정의**: TypeScript로 허용 가능한 노드 타입 엄격히 제한
- **파싱 전용 구조**: 사용자 입력을 직접 HTML로 삽입하지 않고 AST 형태로 변환
- **React 컴포넌트 렌더링**: `dangerouslySetInnerHTML` 사용하지 않음
  - 모든 마크다운 요소를 React 컴포넌트(`<h1>`, `<strong>`, `<a>` 등)로 렌더링
  - React의 기본 XSS 방어 메커니즘 활용
- **외부 링크 안전성**: `target="_blank"` + `rel="noopener noreferrer"`로 보안 강화
- **타입 기반 렌더링**: switch 문으로 허용된 타입만 렌더링

### 구현 파일

#### markdown.ts
**위치**: `src/utils/markdown.ts`

**주요 함수**:
- `parseMarkdown(markdown: string): BlockNode[]` - 블록 레벨 파싱
- `parseInline(text: string): InlineNode[]` - 인라인 레벨 파싱

**역할**: 마크다운 텍스트를 AST(Abstract Syntax Tree) 형태로 변환

#### markdownRender.tsx
**위치**: `src/utils/markdownRender.tsx`

**주요 컴포넌트**:
- `MarkdownRenderer({markdown}: {markdown: string})` - 최상위 렌더링 컴포넌트
- `renderInline(text: string): React.ReactNode[]` - 인라인 노드 렌더링 헬퍼

**역할**: AST를 실제 React 컴포넌트로 렌더링

**렌더링 예시**:
```typescript
// Block 레벨 렌더링
{blocks.map((block, i) => {
  switch(block.type) {
    case "h1":
      return <h1 key={i}>{renderInline(block.value)}</h1>
    
    case "ul":
      return (
        <ul key={i} className="list-disc list-inside my-4 space-y-2">
          {block.value.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    
    case "code":
      return (
        <pre key={i} className="bg-gray-800 text-white p-4 rounded-lg">
          <code>{block.value}</code>
        </pre>
      );
    // ...
  }
})}

// Inline 레벨 렌더링
const renderInline = (text: string) => {
  const nodes = parseInline(text);
  return nodes.map((node, i) => {
    switch(node.type) {
      case "strong":
        return <strong key={i}>{node.value}</strong>
      
      case "link":
        return (
          <a 
            key={i} 
            href={node.url} 
            target="_blank"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            {node.value}
          </a>
        );
      
      case "image":
        return (
          <img 
            key={i} 
            src={node.url} 
            alt={node.value}
            className="max-w-full h-auto rounded-lg my-4"
          />
        );
      // ...
    }
  });
};
```

**Tailwind CSS 스타일링**:
- **인용구**: `border-l-4 border-blue-500 pl-4 py-2 my-4 text-gray-600 italic bg-gray-50`
- **리스트**: `list-disc list-inside my-4 space-y-2`
- **체크박스**: `w-4 h-4 rounded border-gray-300 text-blue-500`
- **코드 블록**: `bg-gray-800 text-white p-4 rounded-lg my-4 overflow-x-auto`
- **구분선**: `my-8 border-t-2 border-gray-200`
- **링크**: `text-blue-500 hover:text-blue-700 underline`
- **이미지**: `max-w-full h-auto rounded-lg my-4`

**사용 방법**:
```typescript
import { MarkdownRenderer } from '@/utils/markdownRender';

// 컴포넌트에서 사용
<MarkdownRenderer markdown={post.content} />
```

---

## 10. 주요 기능 상세 설명

### 10.1 검색 기능

**동작 방식**:
1. input에 검색어 입력 → `searchKeyword` 상태 즉시 업데이트
2. `onChange` 이벤트로 실시간 반영
3. `getSortedPosts()`에서 searchKeyword로 필터링
4. 정렬과 함께 검색 결과 즉시 표시

**코드**:
```typescript
// 실시간 검색 입력
<input
  value={searchKeyword}
  onChange={(e) => setSearchKeyword(e.target.value)}
  placeholder="Search team posts..."
/>

// 검색 필터링
const getSearchedPosts = () => {
  return posts.filter(post =>
    post.title.includes(searchKeyword) ||
    post.content.includes(searchKeyword)
  );
};

// 정렬과 함께 적용
const getSortedPosts = () => {
  const sorted = searchKeyword === '' ? [...posts] : getSearchedPosts();
  // ... 정렬 로직
};
```

**특징**:
- **실시간 검색**: 타이핑할 때마다 즉시 결과 반영
- 검색어는 대소문자 구분 (includes 사용)
- 제목 또는 내용 중 하나라도 포함되면 결과에 표시
- 검색어가 비어있으면 전체 글 표시

---

### 10.2 정렬 기능

**동작 방식**:
1. 드롭다운에서 "최신순" 또는 "등록순" 선택
2. `sortOrder` 상태 업데이트 (`'newest'` 또는 `'oldest'`)
3. `getSortedPosts()`에서 정렬 적용
4. 검색과 함께 작동 (검색된 글들을 정렬)

**코드**:
```typescript
const getSortedPosts = () => {
  const sorted = searchKeyword === '' ? [...posts] : getSearchedPosts();
  if (sortOrder === 'newest') {
    return sorted.sort((a, b) => Number(b.id) - Number(a.id));
  } else {
    return sorted.sort((a, b) => Number(a.id) - Number(b.id));
  }
};
```

**ID 기반 정렬**:
- ID는 `Date.now()` 타임스탬프 → 최신 글이 더 큰 ID를 가짐
- **최신순** (`'newest'`): 큰 ID → 작은 ID
- **등록순** (`'oldest'`): 작은 ID → 큰 ID

---

### 10.3 다중 삭제 기능

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

### 10.4 Supabase 데이터 영속성

**특징**:
- 클라우드 기반 PostgreSQL 데이터베이스
- 실시간 협업 가능 (팀원 간 글 공유)
- 브라우저/기기 독립적 (어디서나 접근)
- 인증/권한 관리 지원

**CRUD 작업**:
```typescript
// 읽기 (Read) - 전체 글 목록
const loadPosts = async () => {
  const data = await readPost();
  setPosts(data);
};

// 생성 (Create)
const newPost: Post = {
  id: Date.now().toString(),
  title,
  content,
  fontSize,
  isBold,
  isItalic,
  isUnderline,
  textColor,
  createdAt: new Date().toLocaleDateString('ko-KR'),
  isMarkdown,
};
await createPost(newPost);

// 수정 (Update)
const updatedPost: Post = { /* 수정된 데이터 */ };
await updatePost(updatedPost);

// 삭제 (Delete) - 단일
await deletePost(postId);

// 삭제 (Delete) - 다중
const ids = deletePosts.map(post => post.id);
await deleteMultiplePosts(ids);
```

**초기 로드**:
```typescript
useEffect(() => {
  const loadPosts = async () => {
    try {
      const data = await readPost();
      setPosts(data);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };
  
  loadPosts();
}, []);
```

**에러 처리**:
- try-catch 블록으로 API 호출 에러 처리
- 사용자에게 실패 알림 표시
- 콘솔에 에러 로그 기록

**supabaseApi.ts 파일 구조**:
```typescript
// src/lib/supabaseApi.ts
export const createPost = async (post: Post) => { /* ... */ };
export const readPost = async (): Promise<Post[]> => { /* ... */ };
export const updatePost = async (post: Post) => { /* ... */ };
export const deletePost = async (postId: string) => { /* ... */ };
export const deleteMultiplePosts = async (postIds: string[]) => { /* ... */ };
```

---

## 11. 배포

### 현재 배포 상태
- **플랫폼**: Vercel
- **URL**: `https://team-blog-delta.vercel.app`
- **트래킹 브랜치**: main
- **자동 배포**: main 브랜치 push 시 자동 배포

### 배포 프로세스
1. 로컬에서 코드 수정
2. (선택) `npm run build`로 로컬 빌드 테스트
3. `git add . && git commit -m "..."` 커밋
4. `git push origin main` 푸시
5. Vercel이 자동으로 감지하여 Vite 빌드 및 배포
6. 1-2분 후 배포 완료

### Vite 빌드 명령어
```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

### Vercel 대시보드
```
https://vercel.com → team-blog 프로젝트 → Deployments
```

---

## 12. 향후 개선 사항

### Phase 2: Supabase 연동 ✅ (완료)
- [x] Supabase 프로젝트 생성
- [x] PostgreSQL 테이블 설계 (posts 테이블)
- [x] React 클라이언트 설정
- [x] CRUD API 구현 (supabaseApi.ts)
- [x] React Router 통합
- [ ] 사용자 인증 시스템 (이메일 화이트리스트)
- [ ] 작성자 정보 연동
- [ ] 실시간 협업 기능

### Phase 3: 인증 및 권한 관리
- [ ] Supabase Auth 통합
- [ ] 이메일 화이트리스트 기반 회원가입
- [ ] 작성자별 글 관리
- [ ] 글 수정/삭제 권한 제어

### Phase 4: 댓글 시스템 개선
- [x] 댓글 UI 구현 (입력 폼, 레이아웃)
- [ ] 댓글 데이터베이스 연동 (Supabase)
- [ ] 댓글 CRUD 기능 (작성/수정/삭제)
- [ ] 답글 (대댓글) 기능
- [ ] 댓글 좋아요
- [ ] 댓글 작성자 표시
- [ ] 댓글 정렬 (최신순/오래된순)

### Phase 5: 추가 기능
- [ ] 글 카테고리/태그
- [ ] 이미지 업로드 (Supabase Storage)
- [ ] 마크다운 에디터 개선 (더 많은 문법 지원)
- [ ] 글 추천/좋아요 기능
- [ ] 사용자 프로필 페이지
- [ ] 알림 시스템

### Phase 6: 성능 최적화
- [ ] 페이징 (무한 스크롤)
- [ ] 가상 스크롤링
- [ ] 이미지 최적화
- [ ] 코드 스플리팅
- [ ] 캐싱 전략

---

## 13. 문제 해결

### 문제: Create React App에서 Vite로 마이그레이션
**원인**: CRA는 더 이상 권장되지 않음, 빌드 속도 느림
**해결**: 
- Vite로 마이그레이션
- `package.json` 스크립트 업데이트
- `index.html` 위치 변경 (public/ → 루트)
- 환경변수 접두사 변경 (REACT_APP_ → VITE_)

### 문제: styled-components에서 Tailwind CSS로 전환
**원인**: 더 빠른 개발 속도와 일관된 디자인 시스템 필요
**해결**:
- Tailwind CSS 설치 및 설정
- 모든 styled-components를 className으로 변환
- tailwind.config.js 설정

### 문제: 의존성 충돌 (dependency conflicts)
**원인**: 패키지 버전 불일치
**해결**: 
- `npm install --legacy-peer-deps` 사용
- 또는 `package.json`에서 버전 명시적으로 관리

### 문제: 마크다운 파싱 및 XSS 방지
**원인**: 사용자 입력을 HTML로 렌더링할 때 보안 이슈
**해결**:
- 커스텀 파싱 유틸리티 직접 구현
- 제한된 마크다운 문법만 지원 (굵기, 기울임, 밑줄, 취소선)
- `dangerouslySetInnerHTML` 사용 시 입력값 검증

---

## 14. 참고 자료

- [React 공식 문서](https://react.dev)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Vite 공식 문서](https://vitejs.dev)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Vercel 배포 가이드](https://vercel.com/docs)

---

**문서 작성일**: 2026년 1월 20일  
**최종 업데이트**: 2026년 1월 30일  
**버전**: 2.2.0

**주요 변경 이력**:
- v2.2.0 (2026-01-30): 실제 코드 정확도 개선
  - 실시간 검색 기능 반영
  - editorMode 상태 변수 정확히 반영
  - sortOrder 키워드 수정 (newest/oldest)
  - 마크다운 모드 툴바 비활성화 문서화
  - 모드 뱃지, Reading Time 등 UI 요소 추가
- v2.1.0 (2026-01-30): MarkdownRenderer 컴포넌트 문서화, 실제 구현 정확히 반영
- v2.0.0 (2026-01-29): Vite + Tailwind CSS + Supabase + React Router 마이그레이션 반영
- v1.0.0 (2026-01-20): 초기 문서 작성 (CRA + styled-components + localStorage)