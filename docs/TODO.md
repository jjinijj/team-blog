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

#### 1-1. 라우팅 보호 리팩토링

- [ ] `AuthGuard` 컴포넌트 생성 (로그인 여부만 체크)
- [ ] `/write`, `/edit/:id` 라우트에 `AuthGuard` 적용
- [ ] `EditorScreen` 내부의 로그인 체크 `useEffect` 제거 (작성자 체크는 유지)

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

#### 2-0. Post 날짜 필드 리팩토링 ✅

- [x] DB 스키마
  - [x] `posts.createdAt` 레거시 필드 제거 (클라이언트에서 직접 생성하던 방식 폐기)
  - [x] `posts.created_at` 필드 사용 (DB 자동 생성, INSERT 시 서버 타임스탬프)
  - [x] `posts.updated_at` 필드 추가 (UPDATE 시 자동 갱신)
- [x] 날짜 표시 방식 개선
  - [x] 상황에 따라 상대적 표시 ("방금 전", "3시간 전", "어제") 또는 절대적 표시 ("2026-02-17") 전환
  - [x] 날짜 포맷 유틸 함수 구현

---

#### 2-1. 사용자 이름 추가 ✅
**예상 소요**: 30분

- [x] DB 스키마
  - [x] `users` 테이블에 `display_name` 컬럼 추가
  - [x] 기존 사용자 기본값 설정 (이메일 앞부분)
- [x] 회원가입 폼 수정
  - [x] 이름 입력 필드 추가
  - [x] 필수 입력으로 설정
  - [x] `options.data`로 트리거에 전달 (race condition 방지)
- [x] UI 업데이트
  - [x] 글 목록/상세에서 이메일 대신 이름 표시
  - [x] hover 시 이메일 표시 (title 속성)
  - [x] 댓글에도 이름 표시
- [x] Post ID를 DB 생성 UUID로 변경
  - [x] posts 테이블 id를 TEXT → UUID로 마이그레이션
  - [x] 클라이언트에서 ID 생성 로직 제거
  - [x] insert 시 `.select()` 추가

---

### Phase 2: 관리 기능

#### 2-2. 홈 화면(랜딩 페이지) 설정 ✅
**예상 소요**: 3-4시간 | **실제 소요**: 약 4시간

- [x] DB 스키마
  - [x] `home_screen_config` 테이블 생성 (싱글 로우, id=1 고정)
  - [x] `users` 테이블에 `show_in_team`, `avatar_color` 컬럼 추가
  - [x] RLS 정책 (읽기: 전체, 쓰기: 관리자만)
- [x] API 레이어 (`homeScreenApi.ts`)
  - [x] `fetchHomeScreenConfig`, `saveHomeScreenConfig` (upsert)
  - [x] `fetchTeamMembers`, `updateTeamMemberVisibility`
- [x] 관리자 페이지 (`/admin/home-screen`)
  - [x] 히어로 섹션: 표시 여부, 배지 텍스트, 헤드라인(multiline), 서브헤드라인, CTA 버튼 텍스트/URL
  - [x] 최신 글 섹션: 표시 여부, 표시 개수, 정렬, 레이아웃(그리드/리스트)
  - [x] 팀 소개 섹션: 표시 여부, 소개 문구, 팀원별 show_in_team 토글 (optimistic update)
- [x] LandingPage DB 연동
  - [x] 하드코딩 제거, DB 설정값 반영
  - [x] 히어로/최신글/팀 섹션 조건부 렌더링
  - [x] 리스트/그리드 레이아웃 분기
  - [x] 로딩 중 스켈레톤 UI (텍스트 깜빡임 방지)

---

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

#### API 파일명 리팩토링 ✅
- [x] `supabaseApi.ts` → `postApi.ts`
- [x] `AdminApi.ts` → `allowedEmailApi.ts`
- [x] import 경로 일괄 수정

---

#### API-컴포넌트 간 에러 처리 일관성 정비 ✅

- [x] `homeScreenApi.ts` — `fetchHomeScreenConfig`, `fetchTeamMembers` `throw`로 변경
- [x] `userApi.ts` — `fetchUserProfile` `throw`로 변경
- [x] `postApi.ts` — `readPostById` `throw`로 변경
- [x] `HomeScreenPage` — `try/catch/finally` + 에러 UI 추가
- [x] `LandingPage` — `.catch()/.finally()` + 에러 UI 추가
- [x] `PostDetailScreen` — 에러 상태 분리 (네트워크 에러 vs 글 없음)
- [x] `ProfileLayout` — `.catch(console.error)` 추가

---
**예상 소요**: 1시간

- [ ] 글 목록 관리
  - [ ] 모든 글 목록 조회 (작성자별, 상태별)
  - [ ] 글 상태 일괄 변경 (발행/비공개)
  - [ ] 글 삭제 (관리 목적)
- [ ] (선택) 화이트리스트 페이징
  - [ ] 팀원이 20명 이상일 때 추가

---

#### 3-2. 사용자 페이지 (프로필) - 진행 중
**예상 소요**: 2-3시간

- [x] 내가 쓴 글 목록 (상태별 필터)
  - [x] `MyPostsScreen` 신규 구현
  - [x] 전체/공개/초안/비공개 사이드바 탭 필터
  - [x] status 배지 (공개: 초록, 초안: 회색, 비공개: 노란색)
  - [x] 다중 선택 + 삭제 (체크박스, 전체 선택, 선택 삭제)
  - [x] 정렬 드롭다운 (최신순/오래된순)
  - [x] `ProfileDropdown` "내 글 보기" 버튼 연결
- [x] 사용자 정보 표시 (이름, 이메일)
- [x] 프로필 수정 폼 (이름 변경, 비밀번호 변경)
- [ ] 내가 쓴 댓글 목록
- [ ] 통계 (글 수, 댓글 수)

---

#### 3-4. 팀 소개 페이지
**예상 소요**: 1-2시간

- [ ] DB 스키마
  - [ ] `team_info` 테이블 생성 (싱글 로우)
    ```sql
    - id: int (항상 1)
    - title: text (팀 이름)
    - description: text (팀 소개 본문)
    - updated_at: timestamp
    ```
  - [ ] `users` 테이블에 `show_in_team` 컬럼 추가 (boolean, default true)
  - [ ] RLS 정책 (`team_info` 읽기: 전체, 수정: 관리자만)
- [ ] 공개 페이지 (`/about`)
  - [ ] 팀 이름 + 소개 텍스트 표시
  - [ ] 멤버 카드 목록 (`show_in_team = true`인 users 조회, 아바타 + 이름 + 이메일)
  - [ ] 헤더/내비에 About 링크 추가
- [ ] 관리자 편집
  - [ ] 관리자 페이지(`/admin`)에 팀 소개 편집 탭 추가
  - [ ] 팀 이름 / 소개 텍스트 수정 폼 (textarea)
  - [ ] 저장 시 `team_info` upsert
  - [ ] 멤버 목록 관리 (전체 유저 표시, `show_in_team` 토글)

---

#### 3-3. 글 상태 관리 (3-tier) ✅
**예상 소요**: 1시간 | **실제 소요**: 약 1시간

- [x] DB 스키마
  - [x] `posts` 테이블에 `status` 컬럼 추가
    ```sql
    status TEXT DEFAULT 'published' 
    CHECK (status IN ('draft', 'published', 'private'))
    ```
  - [x] 기존 글 일괄 업데이트 (`status = 'published'`)
- [x] RLS 정책 수정
  - [x] Published: 모두 조회 가능
  - [x] Draft: 본인 + 관리자만 조회 가능
  - [x] Private: 본인만 조회 가능
- [x] Post 타입 수정
  - [x] `status: 'draft' | 'published' | 'private'` 필드 추가
  - [x] `UpdatePost`에서 `author_id` 제거
- [x] postApi.ts 쿼리 분기
  - [x] `readPosts()` — published만 조회 (메인 화면)
  - [x] `readMyPosts(userId)` — 모든 status 조회 (내 글)
- [x] EditorScreen UI
  - [x] status 드롭다운 (Draft / Publish / Private)
  - [x] 선택한 status와 함께 등록/수정 호출
- [ ] 글 목록 status 배지 표시 → **3-2. 사용자 페이지에서 구현**

---

### Phase 3: 에디터 개선

#### 4-0. 마크다운 에디터 UX 개선
**예상 소요**: 2-3시간

- [x] 에디터 마크다운 전용으로 고정 (richtext 모드 토글 제거, `content_type` 항상 `'markdown'`)
  - 기존 richtext 글은 읽기 렌더링 유지 (하위 호환)
- [x] 선택 영역 자동 감싸기 (wrap selection)
  - [x] `*` 입력 시 → `*선택텍스트*` (이탤릭)
  - [x] `` ` `` 입력 시 → `` `선택텍스트` `` (인라인 코드)
  - [x] `~` 입력 시 → `~~선택텍스트~~` (취소선)
  - [x] `_` 입력 시 → `__선택텍스트__` (밑줄)
  - 선택 없이 입력하면 기존처럼 문자 그대로 삽입
- [x] 마크다운 파서 취소선(`~~`) 지원 추가 (`del` 타입, `<del>` 렌더링)
- [x] 에디터 툴바 추가 (Bold, Italic, Link, H1, H2, Quote, Code, Image — Markdown Supported + Guide 버튼)
  - [x] Bold, Italic, Link, H1, H2, Quote, Code 버튼 동작 연결
  - [x] Code 블록 삽입 시 줄 시작 보장 (중간 삽입 시 `\n` 자동 추가)
  - [x] Image 버튼 활성화 → 이미지 업로드 기능으로 연결 (13-1에서 구현)
- [x] 에디터 작성자 아바타 색상을 사용자 설정 색상(`avatarColor`)으로 반영
- [x] 렌더러 인라인 코드 백틱 노출 버그 수정 (Tailwind `prose` 클래스 `code::before/after` content 제거)

---

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

### Phase 5: 확장 기능

#### 6. 포스트 페이징
**예상 소요**: 1-2시간

- [ ] 페이지네이션 UI
  - [ ] 페이지 번호 표시
  - [ ] 이전/다음 버튼
  - [ ] 페이지당 글 수 설정 (10개, 20개 등)
- [ ] 쿼리 수정
  - [ ] LIMIT, OFFSET 활용
  - [ ] 전체 글 수 조회 (페이지 수 계산)

---

#### 7. 임시저장 (Auto-save) ✅
**예상 소요**: 1-2시간 | **실제 소요**: 약 2시간

- [x] 자동 저장 로직
  - [x] debounce(1500ms)로 타이핑 멈춤 후 자동 저장
  - [x] 제목, 내용, content_json, content_type 저장
- [x] 복원 기능
  - [x] 에디터 진입 시 임시저장 데이터 확인
  - [x] 헤더 바로 아래 복원 배너 표시 (전체 너비, 공간 항상 확보)
  - [x] "Restore Draft" → 내용 복원 + draft 삭제
  - [x] "Dismiss" → 배너만 숨김, draft는 유지
- [x] 임시저장 관리
  - [x] 발행 시 임시저장 데이터 삭제
  - [x] 오래된 임시저장 자동 삭제 (7일 이상)
- [x] 파일 구조
  - [x] `draftUtils.ts` — 저장/불러오기/삭제 순수 함수
  - [x] `useDraft.ts` — 커스텀 훅 (debounce 포함)
  - [x] `DraftRecoveryBanner.tsx` — 복원 배너 UI
  - [x] `EditorScreen.tsx` — 통합

---

#### 8. 핀 고정 글 (공지사항)
**예상 소요**: 30분

- [ ] DB 스키마
  - [ ] `posts` 테이블에 `is_pinned` 컬럼 추가
- [ ] 권한 설정
  - [ ] 관리자만 핀 설정/해제 가능
- [ ] UI 업데이트
  - [ ] 메인 화면 상단에 고정 글 표시
  - [ ] 📌 아이콘으로 표시
  - [ ] 최대 3개까지 고정

---

#### 9. 북마크 (즐겨찾기)
**예상 소요**: 1-2시간

- [ ] DB 스키마
  - [ ] `bookmarks` 테이블 생성
    ```sql
    - id: uuid
    - user_id: uuid (FK)
    - post_id: uuid (FK)
    - created_at: timestamp
    ```
- [ ] 북마크 CRUD
  - [ ] 북마크 추가/제거 (토글)
  - [ ] 내 북마크 목록 조회
- [ ] UI 업데이트
  - [ ] 글 상세에 북마크 버튼 (⭐)
  - [ ] 사용자 페이지에 북마크 목록

---

#### 9-1. 태그 기능
**예상 소요**: 2-3시간

- [ ] DB 스키마
  - [ ] `tags` 테이블 생성 (id, name, slug)
  - [ ] `post_tags` 테이블 생성 (post_id, tag_id)
- [ ] 에디터에 태그 입력 UI 추가 (쉼표 구분 입력)
- [ ] 글 목록/상세에 태그 표시 및 태그 클릭 시 필터
- [ ] 히어로 배지 텍스트를 인기 태그로 연동 (관리자 설정)

---

#### 10. 검색 고도화
**예상 소요**: 1-2시간

- [ ] 필터 추가
  - [ ] 작성자별 필터
  - [ ] 날짜 범위 필터
  - [ ] 상태별 필터 (본인 글에서)
- [ ] 정렬 옵션 확장
  - [ ] 조회수 순
  - [ ] 댓글 많은 순
- [ ] 검색 UI 개선
  - [ ] 고급 검색 패널
  - [ ] 필터 선택 UI

---

#### 11. 알림 시스템
**예상 소요**: 2-3시간

- [ ] DB 스키마
  - [ ] `notifications` 테이블 생성
    ```sql
    - id: uuid
    - user_id: uuid (FK)
    - type: text (comment, mention)
    - post_id: uuid (FK)
    - comment_id: uuid (FK, nullable)
    - is_read: boolean
    - created_at: timestamp
    ```
- [ ] 알림 생성 로직
  - [ ] 내 글에 댓글 달리면 알림
  - [ ] (선택) @멘션 시 알림
- [ ] 알림 UI
  - [ ] 헤더에 알림 아이콘 + 개수 표시
  - [ ] 알림 목록 드롭다운
  - [ ] 읽음 처리
  - [ ] 알림 클릭 시 해당 글/댓글로 이동

---

#### 12. 기타 편의 기능

- [x] 조회수 (1-2시간)
  - [x] `post_views` 테이블 생성 (post_id, user_id, viewed_at)
  - [x] 같은 유저 24시간 내 재조회 카운트 제외
  - [x] 본인 글 조회 제외
  - [x] `posts` 테이블에 `view_count` 캐시 컬럼 추가 (집계 성능용)
  - [x] 인기 글 정렬 옵션 (MainScreen, LandingPage)
  
- [ ] 다크모드 (1-2시간)
  - [ ] Tailwind 다크모드 활용
  - [ ] 토글 버튼 (헤더)
  - [ ] localStorage에 설정 저장
  
- [ ] 최근 본 글 (30분-1시간)
  - [ ] localStorage에 최근 본 글 ID 저장
  - [ ] 사이드바에 표시
  
- [ ] 글 공유 (30분)
  - [ ] URL 복사 버튼
  - [ ] 클립보드 복사 + 토스트 메시지

---

### Phase 6: 아키텍처 개선

#### 14. 렌더링 방식 개선 (CSR → SSR/SSG 검토)

> 현재 Vite + React 기반 CSR. 초기 로딩 속도 및 SEO 개선을 위해 SSR/SSG 도입 검토.

- [ ] 방향 결정 (선택지 비교 후 확정)
  - Vite SSR — 현재 스택 유지, 서버 렌더링만 추가
  - Next.js 마이그레이션 — SSR/SSG/ISR 풀 지원, 마이그레이션 비용 있음
  - React Router v7 (Remix 방식) — 파일 기반 라우팅 + SSR
- [ ] 방향 확정 후 마이그레이션 계획 수립
- [ ] 단계적 마이그레이션 실행

---

### Phase 7: 파일 & 이미지

#### 13-1. 글 본문 이미지 업로드 ✅
**예상 소요**: 2-3시간

- [x] Supabase Storage 버킷 생성 (`post-images`, 읽기: 전체, 쓰기/삭제: 로그인 사용자)
- [x] DB 스키마
  - [x] `post_images` 테이블 생성 (id, post_id nullable FK+CASCADE, author_id, storage_path, url)
  - [x] RLS UPDATE 정책 추가 (`auth.uid() = author_id`)
- [x] API 레이어 (`imageApi.ts` 신규)
  - [x] `uploadPostImage` — Storage 업로드 + `post_images` INSERT (post_id=null)
  - [x] `linkImagesToPost` — 저장 완료 후 post_id 일괄 업데이트
  - [x] `deleteStorageImagesForPosts` — 글 삭제 전 Storage 파일 삭제
- [x] EditorScreen 연동
  - [x] 툴바 Image 버튼 활성화 + hidden `<input type="file">` 연결
  - [x] 업로드 중 플레이스홀더 텍스트 삽입 (`![⠋ 이미지 업로드 중...](uploading:id)`) → 완료 시 실제 이미지로 교체
  - [x] 동시 다중 업로드 지원 (placeholderId로 각각 추적)
  - [x] 50MB 용량 제한
  - [x] 새 글: uploadedImageIds 배열에 누적 → 저장 후 linkImagesToPost 호출
  - [x] 수정 글: 업로드 즉시 linkImagesToPost 호출
- [x] App.tsx 연동
  - [x] `handleDeletePost` / `handleDeleteMultiplePosts`에서 Storage 파일 선삭제
  - [x] `handleAddPost` 반환타입 `Promise<string | null>`로 변경 (post ID 전달용)
- [x] 글 목록 미리보기 이미지 처리
  - [x] `![...](url)` 형태를 `[이미지]`로 치환 (MainScreen `stripHtml`, LandingPage 정규식)

---

#### 13-0. 이미지 업로드 (홈 화면용)
=======
**예상 소요**: 1-2시간

- [x] Supabase Storage 버킷 생성 (`home-images`, 공개 읽기 / 관리자 쓰기)
  - [x] RLS 정책 4개 추가 (SELECT: 전체, INSERT/UPDATE/DELETE: 관리자만)
- [x] `home_screen_config` 테이블에 `team_image_url TEXT` 컬럼 추가
- [x] API (`imageApi.ts`)
  - [x] `uploadTeamImage` — `home-images` 버킷 업로드, `{ url, storagePath }` 반환
  - [x] `deleteTeamImage` — URL에서 경로 추출 후 Storage 파일 삭제
- [x] 관리자 페이지 팀 소개 섹션에 이미지 업로드 UI
  - [x] 이미지 없음: 점선 업로드 버튼
  - [x] 이미지 있음: 미리보기 + 교체/제거 버튼
  - [x] 교체 시 기존 파일 자동 삭제
  - [x] 저장 시 `team_image_url` DB 반영
- [x] LandingPage 팀 섹션에 이미지 표시
  - [x] `team_image_url` 있으면 이미지, 없으면 기존 장식용 도형 유지
  - [x] 텍스트/아바타/버튼 우측 정렬, 이미지는 우측 고정

---

#### 이미지 업로드 — 알려진 이슈 / 향후 고려사항

> 현재 의도적으로 미처리(C안: 현 규모에서 허용). 트래픽/용량 문제 발생 시 재검토.

**A. 고아(orphan) 이미지 누적**
- 현상: 이미지를 업로드한 뒤 글을 저장하지 않으면 `post_images.post_id = null`인 행과 Storage 파일이 영구 잔류
- 선택지:
  - A안: EditorScreen `beforeunload` 핸들러에서 미저장 `uploadedImageIds` 삭제 API 호출 (SPA 이탈 감지 불완전)
  - B안: Supabase Cron / Edge Function — 24시간 이상 `post_id = null`인 `post_images` 행을 주기적으로 조회 → Storage 파일 삭제 → DB 행 삭제
  - C안: ✅ 현재 채택 — 소규모 팀 블로그 수준에서 용량 문제 미미, 단순성 우선

**B. 에디터에서 이미지 마크다운 삭제 시 Storage 파일 미정리**
- 현상: 글 수정 중 `![이미지](url)` 구문을 직접 지워도 Storage의 실제 파일은 그대로 남음
- 해결 방향: 저장 시 이전 content와 현재 content를 비교해 사라진 이미지 URL을 감지 → Storage 삭제
- 현재 미구현 사유: 구현 복잡도 대비 효용 낮음 (A와 같은 맥락)

---

#### 13. 파일 첨부 기능
**예상 소요**: 2-3시간

- [ ] Supabase Storage 설정
  - [ ] Storage 버킷 생성 (`post-attachments`)
  - [ ] RLS 정책 설정 (업로드, 삭제, 조회)
  - [ ] 공개 URL 설정
- [ ] DB 스키마
  - [ ] `post_attachments` 테이블 생성
    ```sql
    - id: uuid
    - post_id: uuid (FK)
    - file_name: text
    - file_path: text (Storage 경로)
    - file_size: integer
    - file_type: text (MIME)
    - uploaded_at: timestamp
    ```
- [ ] 파일 업로드 기능
  - [ ] 파일 선택 UI (input type="file")
  - [ ] Storage 업로드 로직
  - [ ] 메타데이터 DB 저장
  - [ ] 업로드 진행률 표시 (선택)
- [ ] 파일 표시 및 다운로드
  - [ ] 첨부 파일 목록 UI
  - [ ] 이미지 미리보기 (선택)
  - [ ] 다운로드 링크
  - [ ] 파일 크기 표시
- [ ] 파일 삭제
  - [ ] Storage에서 파일 삭제
  - [ ] DB에서 메타데이터 삭제
  - [ ] 본인이 업로드한 파일만 삭제 가능
- [ ] (선택) 고급 기능
  - [ ] 드래그 앤 드롭 업로드
  - [ ] 파일 타입 제한 (이미지, PDF, 문서 등)
  - [ ] 파일 크기 제한 검증
  - [ ] 썸네일 자동 생성 (Edge Functions 필요)

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

### 📅 Milestone 5: 확장 기능
- [ ] 포스트 페이징
- [x] 임시저장
- [x] 글 상태 관리 (Draft/Published/Private)
- [ ] 핀 고정 글
- [ ] 북마크
- [ ] 검색 고도화
- [ ] 알림 시스템
- [ ] 기타 편의 기능 (조회수, 다크모드, 최근 본 글, 글 공유)

### 📅 Milestone 6: 파일 관리
- [ ] 파일 첨부/다운로드
- [ ] 이미지 미리보기

---

## 📝 작업 진행 노트

### 2026-03-16
- ✅ **홈 화면 팀 이미지 업로드 완료** (13-0)
  - `home-images` Storage 버킷 + RLS 4개 정책 (읽기: 전체, 쓰기/수정/삭제: 관리자)
  - `home_screen_config.team_image_url` 컬럼 추가
  - `uploadTeamImage`, `deleteTeamImage` API 추가 (`imageApi.ts`)
  - 관리자 페이지: 점선 업로드 버튼 → 이미지 미리보기 + 교체/제거, 저장 시 DB 반영
  - LandingPage: 이미지 있으면 표시, 없으면 장식용 도형 유지 / 텍스트 우측 정렬
  - **RLS 주의**: Storage 버킷 정책에 `is_admin` 서브쿼리로 관리자 체크
- ✅ **글 수정 시 빈 에디터 버그 수정**
  - `posts` prop 없을 때 `readPostById` fallback 조회 추가 (EditorScreen)
- ✅ **글 미리보기 이미지 링크 처리** — `![...](url)` → `[이미지]` 치환 (MainScreen, LandingPage)
- ✅ **글 본문 이미지 업로드 완료** (13-1)
  - 업로드 중 플레이스홀더 삽입 → 완료 시 실제 이미지 교체 (Medium 방식)
  - 새 글: `uploadedImageIds` 추적 → 저장 후 `linkImagesToPost` / 수정 글: 즉시 연결
  - 글 삭제 시 Storage 파일 선삭제

### 2026-03-15
- ✅ **글 본문 이미지 업로드 완료** (`imageApi.ts` 신규, EditorScreen 연동)
  - Storage 업로드 → `post_images` INSERT (post_id=null) → 저장 시 linkImagesToPost로 post_id 연결
  - 업로드 중 플레이스홀더 삽입 후 완료 시 실제 이미지 마크다운으로 교체 (Medium 방식)
  - 동시 다중 업로드: placeholderId(랜덤 문자열)로 각 업로드를 독립 추적
  - 글 삭제 시 Storage 파일 선삭제 → DB CASCADE 삭제
  - **RLS 주의**: UPDATE 정책 없으면 에러 없이 0행 업데이트 — `{ count: 'exact' }`로 감지
- ✅ **글 수정 시 빈 에디터 버그 수정**
  - `posts` prop은 MainScreen 로드 시에만 채워짐 → 직접 `/edit/:id` 접근이나 MyPostsScreen 경유 시 항상 빈 에디터
  - EditorScreen 내 `readPostById` 직접 조회 fallback 추가 (`posts` prop 우선, 없으면 API 조회)
- ✅ **글 미리보기 이미지 링크 처리**
  - MainScreen `stripHtml`, LandingPage 정규식 모두 `![...](url)` → `[이미지]` 치환

### 2026-03-13
- ✅ **조회수 기능 완료** — `post_views` 테이블, `record_post_view` RPC, 24시간 내 재조회/본인 글 제외, `view_count` 캐시 컬럼
- ✅ **인기순 정렬 완료** — MainScreen, LandingPage에서 `view_count` 기준 정렬 적용
- 🔍 **API 에러 처리 일관성 문제 발견**
  - 파일마다 조회 실패 시 패턴이 다름 (`null` 반환 vs `throw`)
  - `CommentApi.ts`는 throw, `homeScreenApi.ts`/`userApi.ts`는 null 반환
  - 정비 방향: 조회도 throw + 컴포넌트에서 catch → 에러/빈 데이터 구분 가능, 사용자에게 에러 UI 표시 가능
  - 실무에서는 React Query/SWR 전제 하에 throw 패턴이 일반적

### 2026-02-19
- ✅ **임시저장 (Auto-save) 완료**
  - debounce(1500ms) 방식 채택 — 30초 인터벌보다 반응 빠르고 불필요한 I/O 없음
  - localStorage key 구조: `draft:new` / `draft:post:{uuid}`
  - `draftUtils.ts` → `useDraft.ts` → `DraftRecoveryBanner.tsx` → `EditorScreen` 순으로 구현
  - 배너는 항상 렌더링, draft 없을 때 `opacity-0`으로 처리 — 레이아웃 흔들림 없음
  - 7일 이상 된 draft 자동 정리 (EditorScreen 진입 시)
  - **배운 점**: Auto-save(로컬 crash recovery)와 Draft status(DB 저장 초안)는 완전히 다른 개념
- ✅ **글 상태 관리 (Draft/Published/Private) 완료**
  - DB: `status` 컬럼 추가 + RLS 정책 수정 (status별 조회 범위 제한)
  - `Post` 타입에 `status` 필드 추가, `UpdatePost`에서 `author_id` 제거
  - `postApi.ts`: `readPosts()` published 필터, `readMyPosts()` 신규 추가
  - EditorScreen: 드롭다운 UI로 상태 선택 후 등록/수정 (초안/공개/비공개 한글화)
  - 글 목록 배지 표시는 사용자 페이지(3-2) 구현 시 함께 처리
  - **배운 점**: `EXISTS (SELECT 1 ...)` — 존재 여부만 확인할 때 관례적으로 사용
- ✅ **ProfileDropdown 공통 컴포넌트 분리**
  - MainScreen과 EditorScreen에서 동일한 프로필 드롭다운 사용 → 컴포넌트로 분리
  - `isAdmin`, `signOut`을 props 대신 `useAuth()`에서 직접 가져와 props 최소화
  - EditorScreen 헤더에 프로필 버튼 추가
- ✅ **내 글 보기 (MyPostsScreen) 구현**
  - 전체/공개/초안/비공개 사이드바 탭 + 카운트 표시
  - status 배지 (공개: 초록, 초안: 회색, 비공개: 노란색)
  - more_vert 액션 메뉴로 수정/삭제
- ✅ **아키텍처 개선 — props 대신 직접 fetch**
  - `MainScreen`: `posts` props 제거 → `readPosts()` 직접 fetch
  - `PostDetailScreen`: `posts` props 제거 → `readPostById()` 직접 fetch
  - `App.tsx`에서 posts state/fetch 로직 제거
  - 초안/비공개 글 상세 조회 버그 수정 (RLS 덕분에 본인 글은 status 무관 조회 가능)
  - 뒤로가기 `navigate(-1)` 적용 — 내 글 보기에서 왔으면 내 글 보기로, 메인에서 왔으면 메인으로
  - **배운 점**: 화면별 독립 fetch가 props drilling보다 유지보수에 유리

### 2026-02-17
- ✅ **Post 날짜 필드 리팩토링 완료**
  - `createdAt` (클라이언트 생성) → `created_at` (DB 자동 생성) 으로 전환
  - `updated_at` 필드 신규 추가 — 글 수정 시 자동 갱신
  - 날짜 표시 방식 개선: 상대적 표시 ("방금 전", "3시간 전") ↔ 절대적 표시 전환
  - 날짜 포맷 유틸 함수 구현
  - **배운 점**: 날짜는 항상 서버에서 생성해야 신뢰성 보장. `updated_at = null` 초기값으로 "미수정" 상태 구분 가능

### 2026-02-16
- 프로젝트 기능 설계 및 TODO 업데이트
  - 사용자 이름 추가 기능 (Phase 1 최우선)
  - Post ID를 DB 생성 UUID로 변경 결정 (현재 클라이언트 생성은 안티패턴)
  - 글 상태 관리 3-tier 추가 (Draft/Published/Private)
    - Draft: 본인 + 관리자
    - Published: 모두
    - Private: 본인만
  - 사용자 페이지 추가 (프로필, 이름 변경, 비밀번호 변경, 내 글/댓글)
  - 관리자 페이지 개선 (글 목록 관리)
  - Phase 5 확장 기능 추가 (페이징, 임시저장, 핀 고정, 북마크, 검색 고도화, 알림, 편의 기능)
  - Phase 6 파일 첨부 기능 추가
  - 에디터 모드 결정: 리치텍스트 디폴트 + 마크다운 옵션
  - 카테고리 기능은 보류 (태그로 대체 고려, 글 많아지면 추가)

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