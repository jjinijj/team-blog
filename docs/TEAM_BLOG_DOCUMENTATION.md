# 팀 블로그 에디터 - 프로젝트 문서

## 1. 프로젝트 개요

**팀 블로그 에디터**는 팀이 함께 글을 작성, 편집, 관리할 수 있는 웹 기반 에디터입니다.

### 주요 특징
- ✅ 글 작성/수정/삭제 (개별 + 다중 삭제)
- ✅ 글자 크기, 스타일(굵기/기울임/밑줄), 색상 옵션
- ✅ 글 검색 기능 (제목/내용)
- ✅ 글 정렬 기능 (최신순/오래된순)
- ✅ localStorage를 통한 데이터 영속성
- ✅ 반응형 UI (styled-components)

---

## 2. 기술 스택

| 분류 | 기술 |
|------|------|
| **Language** | TypeScript |
| **Frontend Framework** | React 18 |
| **Styling** | styled-components |
| **State Management** | React Hooks (useState, useEffect) |
| **Data Persistence** | localStorage |
| **Build Tool** | Create React App |
| **Deployment** | Vercel |
| **Version Control** | Git/GitHub |

---

## 3. 프로젝트 구조

```
team-blog/
├── public/
├── src/
│   ├── App.tsx                 # 메인 앱, 상태 관리
│   ├── types/
│   │   └── Post.ts             # Post 인터페이스 정의
│   ├── screens/
│   │   ├── MainScreen.tsx       # 글 목록, 검색, 정렬
│   │   ├── EditorScreen.tsx     # 글 작성/수정, 스타일 옵션
│   │   └── PostDetailScreen.tsx # 글 상세 보기, 삭제
│   ├── index.tsx
│   └── App.css
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
  isBold: boolean;         # 굵기 여부
  isItalic: boolean;       # 기울임 여부
  isUnderline: boolean;    # 밑줄 여부
  textColor: string;       # 글자 색상 (hex 색상코드)
  createdAt: string;       # 작성일자 (YYYY-MM-DD 형식)
}
```

---

## 5. 데이터 흐름

### 5.1 전체 데이터 흐름

```
┌─────────────────────────────────────────────┐
│           React State (App.tsx)              │
│  - posts: Post[]                            │
│  - currentScreen: 'main' | 'editor' | 'detail'
│  - editingPostId, selectedPostId            │
└────────────────┬────────────────────────────┘
                 │
     ┌───────────┼───────────┐
     ↓           ↓           ↓
┌──────────┐ ┌──────────┐ ┌────────────┐
│  Main    │ │ Editor   │ │   Detail   │
│ Screen   │ │ Screen   │ │   Screen   │
└──────────┘ └──────────┘ └────────────┘
     │           │           │
     └───────────┼───────────┘
                 ↓
      ┌────────────────────┐
      │  localStorage      │
      │  'blog-posts' key  │
      └────────────────────┘
```

### 5.2 글 생성 흐름

```
EditorScreen (새로 쓰기 모드)
  ├─ 제목 입력
  ├─ 본문 입력
  ├─ 스타일 옵션 선택 (크기, 스타일, 색상)
  └─ "등록" 버튼 클릭
       ↓
App.tsx: handleAddPost()
  ├─ 새 Post 객체 생성 (id: Date.now())
  ├─ setPosts([newPost, ...posts])
  └─ goToMain()
       ↓
useEffect 트리거
  └─ localStorage.setItem('blog-posts', JSON.stringify(posts))
       ↓
MainScreen에 새 글 표시
```

### 5.3 글 수정 흐름

```
MainScreen → PostDetailScreen
  └─ "수정" 버튼 클릭
       ↓
App.tsx: handleEditPost(postId)
  ├─ setEditingPostId(postId)
  └─ setCurrentScreen('editor')
       ↓
EditorScreen (수정 모드)
  ├─ editingPost의 데이터로 폼 채우기
  └─ "수정" 버튼 클릭
       ↓
App.tsx: handleAddPost() (수정 모드 감지)
  ├─ posts.map()으로 해당 글 업데이트
  ├─ setPosts(updatedPosts)
  └─ goToMain()
       ↓
MainScreen에 수정된 글 표시
```

### 5.4 검색 흐름

```
MainScreen
  ├─ searchKeyword 입력
  └─ "🔍" 버튼 클릭
       ↓
handleSearchClick()
  └─ setKeyword(searchKeyword.trim())
       ↓
getSortedPosts()
  ├─ getSearchedPosts() 호출
  │  └─ posts.filter(post => 
  │      post.title.includes(keyword) || 
  │      post.content.includes(keyword))
  └─ 필터링된 배열 정렬
       ↓
MainScreen에 검색 결과만 표시
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
- sortOrder: 'newer' | 'older'   // 정렬 순서
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
3. **글자 크기** - 12px ~ 24px 선택
4. **글자 스타일** - Bold, Italic, Underline 토글
5. **글자 색상** - color picker로 색상 선택
6. **유효성 검사** - 제목/본문 필수 입력
7. **수정 모드** - editingPost이 있으면 수정 모드

**상태**:
```typescript
- title: string
- content: string
- fontSize: number (기본값: 16)
- isBold: boolean (기본값: false)
- isItalic: boolean (기본값: false)
- isUnderline: boolean (기본값: false)
- textColor: string (기본값: '#000000')
```

**특징**:
- textarea에서 실시간 스타일 프리뷰
- 수정 모드 시 기존 데이터로 폼 미리 채우기
- "등록" 또는 "수정" 버튼 동적 표시

---

### 6.3 PostDetailScreen (글 상세보기 화면)

**위치**: `src/screens/PostDetailScreen.tsx`

**주요 기능**:
1. **글 상세 표시** - 제목, 내용, 작성일 표시
2. **스타일 적용** - 저장된 스타일(크기, 굵기, 색상 등) 반영
3. **수정 버튼** - EditorScreen으로 이동 (수정 모드)
4. **삭제 버튼** - 개별 글 삭제 (확인 후)
5. **뒤로가기** - MainScreen으로 이동

**Props**:
```typescript
interface PostDetailScreenProps {
  post: Post;                    // 표시할 글
  onGoToMain: () => void;        // 메인 화면 이동
  onEdit: (postId: string) => void;   // 수정 모드
  onDelete: (postId: string) => void; // 삭제
}
```

---

## 7. 상태 관리 (App.tsx)

### 주요 상태

```typescript
- currentScreen: 'main' | 'editor' | 'detail'  // 현재 화면
- posts: Post[]                                 // 전체 글 목록
- selectedPostId: string | null                 // 상세 보기할 글 ID
- editingPostId: string | null                  // 수정할 글 ID
```

### 주요 함수

```typescript
// 화면 전환
- goToMain()              // 메인 화면으로
- goToEditor()            // 에디터 화면으로 (새로 쓰기)
- goToDetail(postId)      // 상세 보기 화면으로

// 글 관리
- handleAddPost(...)      // 글 추가/수정 (editingPostId로 구분)
- handleEditPost(postId)  // 수정 모드 진입
- handleDeletePost(postId)        // 개별 삭제
- handleDeletePosts(posts)        // 다중 삭제

// 데이터 조회
- selectedPost = posts.find(post => post.id === selectedPostId)
- editingPost = posts.find(post => post.id === editingPostId)
```

### useEffect로 localStorage 동기화

```typescript
// 초기 로드 (useEffect 제거, useState 초기화 함수 사용)
const [posts, setPosts] = useState<Post[]>(() => {
  const saved = localStorage.getItem('blog-posts');
  return saved ? JSON.parse(saved) : [];
});

// 자동 저장
useEffect(() => {
  localStorage.setItem('blog-posts', JSON.stringify(posts));
}, [posts]);
```

---

## 8. 스타일링 (styled-components)

### 주요 특징
- **컴포넌트 기반** - 각 UI 요소를 styled component로 정의
- **Props 기반 동적 스타일** - `${(props) => ...}` 문법으로 동적 스타일
- **Transient Props** - `$` prefix로 DOM에 전달되지 않는 props
- **색상 통일** - 
  - Primary: #007bff (파란색)
  - Success: #28a745 (초록색)
  - Danger: #dc3545 (빨간색)
  - Select: #16a34a (진한 초록색)

### 주요 스타일 컴포넌트

```typescript
// MainScreen
- Container           // 전체 컨테이너
- Header              // 상단 헤더
- Title               // 제목
- WriteButton         // 글쓰기 버튼
- SelectButton        // 선택 버튼
- DeleteButton        // 삭제 버튼
- PostList            // 글 목록
- PostListItem        // 글 항목 (체크박스 포함)
- PostItem            // 글 상세 정보
- PostTitle           // 글 제목
- PostContent         // 글 내용 (3줄 클립)
- PostDate            // 작성일

// EditorScreen
- TextArea<Props>     // 본문 입력창 (동적 스타일)
  - fontSize
  - isBold
  - isItalic
  - isUnderline
  - textColor

// PostDetailScreen
- PostContent<Props>  // 글 표시 (저장된 스타일 적용)
  - fontSize
  - isBold
  - isItalic
  - isUnderline
  - textColor
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

### 9.4 localStorage 영속성

**특징**:
- 앱 새로고침 시에도 글 유지
- 브라우저 종료 후 다시 열어도 글 유지
- 각 브라우저/기기마다 독립적으로 저장

**코드**:
```typescript
// 초기 로드
const [posts, setPosts] = useState<Post[]>(() => {
  const saved = localStorage.getItem('blog-posts');
  return saved ? JSON.parse(saved) : [];
});

// 자동 저장
useEffect(() => {
  localStorage.setItem('blog-posts', JSON.stringify(posts));
}, [posts]);
```

---

## 10. 배포

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

## 11. 향후 개선 사항

### Phase 2: Supabase 연동
- [ ] Supabase 프로젝트 생성
- [ ] PostgreSQL 테이블 설계
- [ ] React 클라이언트 설정
- [ ] localStorage → Supabase API로 전환
- [ ] 팀원 공유 기능 (모두가 같은 글 볼 수 있음)

### Phase 3: React Router
- [ ] URL 기반 라우팅 추가
- [ ] 각 화면별 URL 설정
- [ ] 브라우저 뒤로가기 기능
- [ ] SEO 개선

### Phase 4: 추가 기능
- [ ] 페이징 (글이 많을 때)
- [ ] 글 카테고리/태그
- [ ] 댓글 기능
- [ ] 글 추천 기능
- [ ] 사용자 인증 (누가 글을 작성했는지)

---

## 12. 문제 해결

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

## 13. 참고 자료

- [React 공식 문서](https://react.dev)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [styled-components 문서](https://styled-components.com)
- [Vercel 배포 가이드](https://vercel.com/docs)

---

**문서 작성일**: 2026년 1월 20일
**최종 업데이트**: 2026년 1월 20일
**버전**: 1.0.0
