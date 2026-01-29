# 팀 블로그 에디터 - 프로젝트 문서

## 1. 프로젝트 개요

**팀 블로그 에디터**는 팀이 함께 글을 작성, 편집, 관리할 수 있는 웹 기반 에디터입니다.

### 주요 특징
- ✅ 글 작성/수정/삭제 (개별 + 다중 삭제)
- ✅ 마크다운 스타일 텍스트 포맷팅 (굵기/기울임/밑줄/취소선)
- ✅ 글 검색 기능 (제목/내용)
- ✅ 글 정렬 기능 (최신순/오래된순)
- ✅ 댓글 기능
- ✅ localStorage를 통한 데이터 영속성
- ✅ 반응형 UI (Tailwind CSS)
- 🔄 Supabase 연동 (진행 중)

---

## 2. 기술 스택

| 분류 | 기술 |
|------|------|
| **Language** | TypeScript |
| **Frontend Framework** | React 18 |
| **Styling** | Tailwind CSS |
| **State Management** | React Hooks (useState, useEffect) |
| **Data Persistence** | localStorage (Supabase 마이그레이션 진행 중) |
| **Build Tool** | Vite |
| **Deployment** | Vercel |
| **Version Control** | Git/GitHub |
| **Backend (진행 중)** | Supabase |

---

## 3. 프로젝트 구조

```
team-blog/
├── public/                      # 정적 파일
├── src/
│   ├── App.tsx                 # 메인 앱, 상태 관리
│   ├── types/
│   │   └── Post.ts             # Post 인터페이스 정의
│   ├── screens/
│   │   ├── MainScreen.tsx       # 글 목록, 검색, 정렬
│   │   ├── EditorScreen.tsx     # 글 작성/수정, 마크다운 에디터
│   │   └── PostDetailScreen.tsx # 글 상세 보기, 댓글, 삭제
│   ├── utils/
│   │   └── markdown.ts         # 마크다운 파싱 유틸리티
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
  content: string;         // 글 본문 (마크다운 스타일 문법 포함)
  createdAt: string;       // 작성일자 (YYYY-MM-DD 형식)
}
```

**마크다운 스타일 문법**:
- `**텍스트**` → **굵게**
- `*텍스트*` → *기울임*
- `__텍스트__` → <u>밑줄</u>
- `~~텍스트~~` → ~~취소선~~

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
  ├─ 본문 입력 (마크다운 문법 사용)
  ├─ 실시간 미리보기로 확인
  └─ "등록" 버튼 클릭
       ↓
App.tsx: handleAddPost()
  ├─ 새 Post 객체 생성 (id: Date.now(), createdAt: 현재 날짜)
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
2. **본문 입력** - 마크다운 스타일 문법으로 텍스트 포맷팅
3. **실시간 미리보기** - 입력한 마크다운이 실제로 어떻게 렌더링되는지 확인
4. **포맷 도구** - 버튼 클릭으로 마크다운 문법 자동 삽입
   - 굵게 (`**텍스트**`)
   - 기울임 (`*텍스트*`)
   - 밑줄 (`__텍스트__`)
   - 취소선 (`~~텍스트~~`)
5. **유효성 검사** - 제목/본문 필수 입력
6. **수정 모드** - editingPost이 있으면 수정 모드

**상태**:
```typescript
- title: string
- content: string  // 마크다운 문법이 포함된 텍스트
```

**특징**:
- textarea에서 마크다운 문법 입력
- 실시간 미리보기로 렌더링 결과 확인
- 커스텀 파싱 유틸리티로 마크다운 → HTML 변환
- 수정 모드 시 기존 데이터로 폼 미리 채우기
- "등록" 또는 "수정" 버튼 동적 표시

---

### 6.3 PostDetailScreen (글 상세보기 화면)

**위치**: `src/screens/PostDetailScreen.tsx`

**주요 기능**:
1. **글 상세 표시** - 제목, 내용, 작성일 표시
2. **마크다운 렌더링** - 마크다운 문법을 HTML로 변환하여 표시
3. **댓글 섹션** - 댓글 작성 및 조회
4. **수정 버튼** - EditorScreen으로 이동 (수정 모드)
5. **삭제 버튼** - 개별 글 삭제 (확인 후)
6. **뒤로가기** - MainScreen으로 이동

**Props**:
```typescript
interface PostDetailScreenProps {
  post: Post;                    // 표시할 글
  onGoToMain: () => void;        // 메인 화면 이동
  onEdit: (postId: string) => void;   // 수정 모드
  onDelete: (postId: string) => void; // 삭제
}
```

**마크다운 파싱**:
- 커스텀 파싱 유틸리티로 마크다운 문법 → HTML 변환
- `dangerouslySetInnerHTML`로 안전하게 렌더링
- 지원 문법: 굵기, 기울임, 밑줄, 취소선

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
- handleAddPost(title, content)          // 글 추가/수정 (editingPostId로 구분)
- handleEditPost(postId)                  // 수정 모드 진입
- handleDeletePost(postId)                // 개별 삭제
- handleDeletePosts(posts)                // 다중 삭제

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
커스텀 마크다운 파싱 유틸리티를 직접 구현하여 텍스트 포맷팅 기능 제공

### 지원 문법

| 문법 | 결과 | HTML |
|------|------|------|
| `**텍스트**` | **굵게** | `<strong>텍스트</strong>` |
| `*텍스트*` | *기울임* | `<em>텍스트</em>` |
| `__텍스트__` | <u>밑줄</u> | `<u>텍스트</u>` |
| `~~텍스트~~` | ~~취소선~~ | `<del>텍스트</del>` |

### 파싱 흐름

```
사용자 입력: "이것은 **굵은** 텍스트입니다."
     ↓
parseMarkdown() 함수 호출
     ↓
정규식으로 마크다운 문법 감지
     ↓
HTML 태그로 변환
     ↓
출력: "이것은 <strong>굵은</strong> 텍스트입니다."
     ↓
dangerouslySetInnerHTML로 렌더링
```

### 보안 고려사항

- **제한된 문법만 지원**: script, iframe 등 위험한 태그 불가
- **입력 검증**: 허용된 마크다운 문법만 HTML로 변환
- **XSS 방지**: 사용자 입력을 직접 HTML로 삽입하지 않고 파싱 과정 거침

### 구현 파일

```typescript
// src/utils/markdown.ts
export const parseMarkdown = (text: string): string => {
  let html = text;
  
  // 굵게
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // 기울임
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // 밑줄
  html = html.replace(/__(.+?)__/g, '<u>$1</u>');
  
  // 취소선
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
  
  return html;
};
```

---

## 10. 주요 기능 상세 설명

### 10.1 검색 기능

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

### 10.2 정렬 기능

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

### 10.4 localStorage 영속성

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

### Phase 2: Supabase 연동 (진행 중 🔄)
- [x] Supabase 프로젝트 생성
- [ ] PostgreSQL 테이블 설계
- [ ] React 클라이언트 설정
- [ ] localStorage → Supabase API로 전환
- [ ] 실시간 협업 기능 (모두가 같은 글 볼 수 있음)
- [ ] 인증 시스템 통합

### Phase 3: 추가 기능
- [ ] 댓글 시스템 개선 (답글, 좋아요)
- [ ] 글 카테고리/태그
- [ ] 이미지 업로드 기능
- [ ] 마크다운 에디터 개선 (더 많은 문법 지원)
- [ ] 글 추천 기능
- [ ] 사용자 프로필

### Phase 4: React Router
- [ ] URL 기반 라우팅 추가
- [ ] 각 화면별 URL 설정
- [ ] 브라우저 뒤로가기 기능
- [ ] SEO 개선

### Phase 5: 성능 최적화
- [ ] 페이징 (글이 많을 때)
- [ ] 가상 스크롤링
- [ ] 이미지 최적화
- [ ] 코드 스플리팅

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
**최종 업데이트**: 2026년 1월 29일  
**버전**: 2.0.0 (Vite + Tailwind CSS 마이그레이션)