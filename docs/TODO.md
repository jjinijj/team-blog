# 팀 블로그 에디터 - 작업 TODO

## 📌 작업 우선순위

### Phase 1: 로그인 & 기본 사용자 시스템 ⭐ (필수 선행)

#### 1. 로그인 기능
**예상 소요**: 2-3시간 | **실제 소요**: 약 3시간

- [x] Supabase Auth 설정
  - [x] Supabase 프로젝트에서 Email Auth 활성화
  - [x] 환경변수 설정 (.env)
  - [x] Supabase 클라이언트 초기화
- [x] 데이터베이스 스키마
  - [x] `allowed_emails` 테이블 생성
  - [x] `public.users` 테이블 생성 및 트리거 설정
  - [x] 초기 팀 멤버 이메일 추가
- [x] 회원가입 UI
  - [x] 회원가입 폼 컴포넌트
  - [x] 이메일 화이트리스트 체크 로직
  - [x] 에러 처리 (화이트리스트 없는 이메일)
  - [x] 회원가입 성공 처리
- [x] 로그인 UI
  - [x] 로그인 폼 컴포넌트
  - [x] 세션 관리
  - [x] 자동 로그인 (세션 유지)
- [x] 라우팅 보호
  - [x] 로그인 안 한 사용자 리다이렉트
  - [x] 로그아웃 기능

---

#### 2. 작성자 정보
**예상 소요**: 30분-1시간 | **실제 소요**: 약 1시간

- [x] DB 스키마 업데이트
  - [x] `posts` 테이블에 `author_id` 컬럼 추가
  - [x] `public.users` 테이블 생성 (auth.users 미러링)
  - [x] posts 외래키를 public.users로 변경
- [x] Post 인터페이스 업데이트
  ```typescript
  interface Post {
    // ... 기존 필드
    author_id: string | null;
    author_email: string | null; // 조인해서 가져오기
  }
  ```
- [x] UI 업데이트
  - [x] 글 목록에 작성자 이메일 표시
  - [x] 글 상세에 작성자 정보 표시
- [x] 권한 관리
  - [x] 본인이 쓴 글만 수정 버튼 표시
  - [x] 본인이 쓴 글만 삭제 버튼 표시
  - [x] EditorScreen 접근 권한 체크 (비로그인/권한 없음 리다이렉트)

---

### Phase 2: 관리 기능

#### 3. 관리자 페이지
**예상 소요**: 1-2시간

- [x] 관리자 권한 설정
  - [x] `users` 테이블에 `is_admin` 컬럼 추가
  - [x] 초기 관리자 설정
- [x] 관리자 페이지 UI (`/admin`)
  - [x] 이메일 화이트리스트 목록 조회
  - [x] 새 이메일 추가 폼
  - [x] 이메일 삭제 기능
  - [x] 추가한 날짜 표시
- [x] 권한 체크
  - [x] 관리자만 접근 가능하게 라우팅 보호
  - [x] 일반 사용자 접근 시 리다이렉트

---

### Phase 3: 에디터 개선

#### 4-1. 리치텍스트 에디터 v1 (DOM 기반) - 완료 및 한계 확인

**완료된 작업:**

- [x] 에디터 모드 추가
  - [x] Post에 `isMarkdown: boolean`, `content_type` 추가
  - [x] 기본값은 richtext
- [x] 리치텍스트 툴바 (기본 기능)
  - [x] 텍스트 선택 후 포맷 적용 (Selection API 기반 커스텀 구현)
  - [x] Bold 적용/해제 ✅ 안정적
  - [x] Italic 적용/해제 ✅ 안정적
  - [x] Underline 적용/해제 ✅ 안정적
  - [x] Font Size 적용 ⚠️ 중첩 문제
  - [x] Color 적용 ⚠️ 중첩 문제
- [x] 마크다운 모드
  - [x] 마크다운 입력 영역
  - [x] 모드 전환 토글 버튼
- [x] PostDetailScreen 연동
  - [x] content_type에 따라 렌더링 분기 (getRenderMode 함수)
  - [x] richtext: RichTextRenderer + content_json (DocumentNode[])
  - [x] markdown: 기존 마크다운 렌더러 사용
  - [x] 레거시 글 fallback 처리 (safeParseDoc)
- [x] DB 구조 변경
  - [x] `content_type` 컬럼 추가 (TEXT, NULL = 레거시)
  - [x] `content_json` 컬럼 추가 (JSONB, richtext 렌더링용)
  - [x] 불필요한 전역 스타일 컬럼 제거 (font_size, is_bold 등)
  - [x] `isMarkdown` 레거시 컬럼 유지 (하위 호환)
- [x] 검색/미리보기 수정
  - [x] 글 목록 미리보기 HTML 태그 노출 문제 (DOMParser로 해결)
  - [x] 검색 로직 수정 (stripHtml 함수로 HTML 태그 제거)

**발견된 근본적 한계:**

- ❌ **span 중첩 문제 미해결**
  - fontSize/Color 적용 시 중첩된 span이 계속 쌓임
  - 예: `<span 32px><span 14px><span 12px><span 16px>test</span></span></span></span>`
- ❌ **DOM 구조 예측 불가**
  - contentEditable은 브라우저마다 다른 HTML 생성
  - extractContents, range 조작이 매우 tricky
- ❌ **디버깅 극도로 어려움**
  - 여러 세션에 걸쳐 수십 번 시도했으나 근본 해결 실패
  - whack-a-mole 패턴 (하나 고치면 다른 버그 발생)
- ❌ **유지보수 불가능**
  - 코드 복잡도 높고 예측 불가능한 동작

**결론:** contentEditable + DOM 직접 조작 방식은 **구조적 한계**가 있음. 핵심 기능(fontSize/Color)을 안정적으로 구현하려면 **근본적인 접근 방식 변경 필요**.

---

#### 4-2. 리치텍스트 에디터 v2 (JSON 기반) - 재작성 ⭐

**예상 소요**: 7-10일 (1.5-2주)

**접근 방식:** contentEditable 버리고 JSON 상태 기반 커스텀 에디터 구현

**Phase 1: 데이터 구조 설계** (0.5일)
- [ ] TextNode 타입 정의
  ```typescript
  type TextNode = {
    text: string;
    styles: {
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      fontSize?: number;
      color?: string;
    };
  };
  type EditorState = TextNode[];
  ```
- [ ] Selection 타입 정의
  ```typescript
  type Selection = {
    anchorNodeIndex: number;
    anchorOffset: number;
    focusNodeIndex: number;
    focusOffset: number;
  };
  ```

**Phase 2: 렌더링 엔진** (1일)
- [ ] EditorState → React 컴포넌트 렌더링
- [ ] 각 TextNode를 styled span으로 변환
- [ ] 커서/선택 영역 시각화

**Phase 3: 선택 관리** (1-2일) ← 가장 복잡
- [ ] 마우스 드래그 → Selection 계산
- [ ] 키보드 화살표 → Selection 이동
- [ ] 더블클릭 → 단어 선택
- [ ] 드래그 앤 드롭 선택 처리

**Phase 4: 입력 처리** (1-2일)
- [ ] 텍스트 입력 → EditorState 업데이트
- [ ] Backspace/Delete → 텍스트 삭제
- [ ] Enter → 개행 처리
- [ ] Selection 기반 텍스트 교체

**Phase 5: 스타일 적용** (0.5일) ← 핵심, 쉬워짐!
- [ ] applyFontSize 구현
  ```typescript
  // 선택 영역을 split → 스타일 적용 → merge
  const { start, middle, end } = splitBySelection(state, selection);
  const styledMiddle = middle.map(node => ({
    ...node,
    styles: { ...node.styles, fontSize: size }
  }));
  return [...start, ...styledMiddle, ...end];
  ```
- [ ] applyColor 구현
- [ ] toggleBold/Italic/Underline 구현
- [ ] **중첩 문제 근본 해결** (JSON은 중첩 불가능)

**Phase 6: IME/복붙** (1일)
- [ ] 한글 입력 (compositionstart/end)
- [ ] 복사/붙여넣기 (plain text만 허용)
- [ ] Cut 처리

**Phase 7: 기존 시스템 통합** (0.5일)
- [ ] 저장 시: EditorState → HTML + DocumentNode (기존 파서 재사용)
- [ ] 불러오기 시: HTML/DocumentNode → EditorState
- [ ] 기존 DB 스키마 유지 (호환성)

**Phase 8: 테스트 & 버그 수정** (1-2일)
- [ ] 엣지 케이스 테스트
- [ ] 성능 최적화
- [ ] 크로스 브라우저 테스트

**장점:**
- ✅ 중첩 문제 근본 해결 (JSON은 구조적으로 중첩 불가)
- ✅ 로직 명확, 디버깅 쉬움
- ✅ 테스트 가능 (순수 함수)
- ✅ Undo/Redo 쉬움 (state 히스토리)
- ✅ 확장 가능 (링크, 이미지 등 추가 용이)
- ✅ 유지보수 가능

**다음 작업:**
1. Phase 1부터 순차적 구현
2. 각 Phase 완료 후 테스트
3. Bold/Italic/Underline은 이미 작동하므로 참고

- [ ] 추가 기능 (선택, v2 완성 후)
  - [ ] 모드 전환 시 내용 호환 처리 (richtext ↔ markdown 전환)
  - [ ] 붙여넣기 시 서식 옵션 (plain text / keep formatting)
  - [ ] 제목 (H1, H2, H3)
  - [ ] 리스트 (순서/비순서)
  - [ ] 링크
  - [ ] 인용구

---

### Phase 4: 소셜 기능

#### 5. 댓글 기능 ✅
**예상 소요**: 3-5시간 | **실제 소요**: 약 4시간

- [x] DB 스키마
  - [x] `comments` 테이블 생성
    ```sql
    - id: uuid
    - post_id: uuid (FK)
    - author_id: uuid (FK)
    - content: text
    - created_at: timestamp
    - updated_at: timestamp
    ```
  - [x] RLS 정책 적용 (읽기: 전체, 작성: 로그인, 수정/삭제: 본인만)
  - [x] 인덱스 추가 (post_id, created_at)
  - [x] users 테이블 RLS 정책 추가 (이메일 조회 가능)
- [x] 타입 정의
  - [x] Comment 인터페이스
  - [x] CreateCommentInput 타입
  - [x] UpdateCommentInput 타입
- [x] API 레이어
  - [x] commentApi.ts 생성 (API 로직 분리)
  - [x] fetchComments (JOIN으로 작성자 정보 포함)
  - [x] createComment
  - [x] updateComment
  - [x] deleteComment
- [x] 댓글 UI 컴포넌트
  - [x] CommentsSection (컨테이너, 상태 관리)
  - [x] CommentForm (작성/수정 폼, 아바타 포함)
  - [x] CommentList (목록, 빈 상태 처리)
  - [x] CommentItem (개별 댓글, 일반/수정 모드)
- [x] 기능 구현
  - [x] 댓글 작성 (로그인한 사용자만)
  - [x] 댓글 목록 조회 (모든 사용자)
  - [x] 댓글 수정 (본인만, 수정 모드 전환)
  - [x] 댓글 삭제 (본인만, 확인 다이얼로그)
  - [x] 작성자 정보 표시 (이메일, 아바타)
  - [x] 상대 시간 표시 ("방금 전", "2시간 전" 등)
- [x] PostDetailScreen 통합
  - [x] CommentsSection 컴포넌트 추가
  - [x] 기존 하드코딩된 댓글 섹션 제거
- [x] UI/UX 개선
  - [x] 참고 디자인 적용 (Tailwind CSS)
  - [x] 다크 모드 지원
  - [x] 버튼 레이아웃 수정 (취소/저장 나란히)

---

## 🎯 마일스톤

### ✅ Milestone 1: 기본 기능 완성
- [x] 글 작성/수정/삭제
- [x] 검색/정렬
- [x] 다중 삭제
- [x] localStorage 저장
- [x] Supabase 마이그레이션
- [x] Vite + Tailwind CSS 전환

### ✅ Milestone 2: 사용자 시스템
- [x] 로그인/회원가입
- [x] 작성자 정보
- [x] 관리자 페이지

### ✅ Milestone 3-v1: 에디터 기본 구현 (DOM 기반) - 완료
- [x] richtext / markdown 모드 전환
- [x] Bold / Italic / Underline 토글 (안정적)
- [x] Font Size / Color 적용 (중첩 문제로 한계)
- [x] PostDetailScreen 연동 (RichTextRenderer)
- [x] DB 구조 변경 (content_type, content_json)
- [x] 글 목록 미리보기 HTML 태그 노출 수정
- [x] 검색 로직 수정 (HTML 태그 제거 후 plain text 검색)

### 🚧 Milestone 3-v2: 에디터 재작성 (JSON 기반) - 예정 (1.5-2주)
- [ ] Phase 1: 데이터 구조 설계 (0.5일)
- [ ] Phase 2: 렌더링 엔진 (1일)
- [ ] Phase 3: 선택 관리 (1-2일)
- [ ] Phase 4: 입력 처리 (1-2일)
- [ ] Phase 5: 스타일 적용 (0.5일) - 중첩 문제 근본 해결
- [ ] Phase 6: IME/복붙 (1일)
- [ ] Phase 7: 기존 시스템 통합 (0.5일)
- [ ] Phase 8: 테스트 & 버그 수정 (1-2일)

### ✅ Milestone 4: 협업 기능
- [x] 댓글 (단순 댓글, 작성/수정/삭제)
- [ ] (추후) 대댓글
- [ ] (추후) 좋아요/반응

---

## 📝 작업 진행 노트

### 2026-02-16
- ✅ **댓글 기능 완료** (예상: 3-5시간, 실제: 약 4시간)
  - DB 스키마 설계 및 생성 (comments 테이블, RLS 정책, 인덱스)
  - **중요**: users 테이블 RLS 정책 추가 필요 (이메일 조회 가능하도록)
  - API 레이어 분리 (commentApi.ts) - 서버 통신 로직 독립
  - 컴포넌트 구조: CommentsSection → CommentList → CommentItem
  - CommentForm 재사용 (작성/수정 모두 사용)
  - **Supabase JOIN 구문 에러 해결**: users 테이블 RLS 정책 추가로 해결
  - UI/UX: 참고 디자인 적용, 아바타 자동 생성, 상대 시간 표시
  - 버튼 레이아웃 개선: 수정 모드에서 취소/저장 버튼 나란히 배치
  - PostDetailScreen 통합 완료
  - **배운 점**: 
    - API 로직을 컴포넌트에서 분리하면 관리가 훨씬 쉬움
    - Supabase JOIN 사용 시 관련 테이블의 RLS 정책 확인 필수
    - TypeScript spread 연산자는 타입이 명확해야 작동 (`as any[]` 타입 단언 필요)

### 2026-02-13
- 리치텍스트 에디터 v1 (DOM 기반) 완료 및 한계 발견
  - expandRangeBoundaries: range 경계를 부모 요소로 확장 (빈 껍데기 방지)
  - removeStyleFromFragment 개선: querySelectorAll 방식, fontSize만 있는 span 완전 언래핑
  - **한계 발견: span 중첩 문제 근본 해결 불가**
    - contentEditable + DOM 직접 조작 방식의 구조적 한계
    - 여러 세션에 걸쳐 수십 번 시도했으나 중첩 문제 해결 실패
    - Bold/Italic/Underline은 안정적이나 fontSize/Color는 중첩 발생
- MainScreen 검색/미리보기 수정
  - stripHtml 함수로 HTML 태그 제거
  - DOMParser 사용하여 plain text 추출
- RICHTEXT_ARCHITECTURE.md 문서 작성
  - 전체 데이터 흐름 정리
  - 각 파일별 역할 및 사용 예시
- **중요 결정: JSON 기반 에디터 v2 재작성**
  - 핵심 기능 요구사항 + DOM 방식의 근본적 한계 → 재작성 결정
  - 라이브러리 없이 커스텀 구현 목표
  - 예상 소요: 1.5-2주 (7-10일)
  - 장점: 중첩 문제 근본 해결, 테스트 가능, 유지보수 용이
- 다음 작업: JSON 기반 에디터 v2 Phase 1부터 순차 구현

### 2026-02-11
- 리치텍스트 에디터 마무리
  - Color picker 중첩 span 버그 수정 (removeStyleFromFragment)
  - Color picker 실시간 반영 (savedRangeRef + onChange)
  - Font Size select selection 복원 (onMouseDown + savedRangeRef)
  - EditorScreen / App.tsx 함수 시그니처 불일치 수정
  - safeParseDoc 단순화 (content_json 직접 반환)
  - DB 마이그레이션 SQL 준비 및 적용
- 미해결 버그 2건 + 추가 발견 2건 (다음 세션에서 처리 예정)
- 다음 작업: 미리보기 HTML 태그 노출 수정 → 검색 로직 수정 → 버그 수정 → 붙여넣기 처리 → 댓글 기능

### 2026-02-10
- 리치텍스트 에디터 커스텀 구현
  - contentEditable + Selection API 기반
  - content + content_json 병행 저장 방식 채택
  - Bold/Italic/Underline: toggleSemanticStyle + removeStyle 로직
  - Color: savedRangeRef + removeStyleFromFragment 중첩 방지
  - FontSize: savedRangeRef로 select 클릭 시 selection 복원

### 2026-02-03
- ✅ Phase 1 완료
  - Supabase Auth 설정, 이메일 화이트리스트 기반 회원가입
  - AuthContext 구현 (세션 관리, signUp, signIn, signOut)
  - public.users 테이블 생성 및 트리거 설정
  - 본인 글만 수정/삭제 권한 체크

### 2026-02-01
- 작업 순서 확정
- TODO 문서 생성

---

## 🔗 참고 자료

- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [React Hook Form](https://react-hook-form.com/) (폼 관리 시)

---

**작업 완료 시 체크박스를 `[x]`로 변경하세요!**