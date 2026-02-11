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

#### 4. 리치텍스트 에디터 개선

- [x] 에디터 모드 추가
  - [x] Post에 `isMarkdown: boolean`, `content_type` 추가
  - [x] 기본값은 richtext
- [x] 리치텍스트 툴바
  - [x] 텍스트 선택 후 포맷 적용 (Selection API 기반 커스텀 구현)
  - [x] Bold 적용/해제
  - [x] Italic 적용/해제
  - [x] Underline 적용/해제
  - [x] Font Size 적용 (savedRange로 select 클릭 시 selection 복원)
  - [x] Color 적용 (savedRange + removeStyleFromFragment 중첩 방지, 실시간 반영)
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

- [ ] 미해결 버그
  - [x] 색상 적용 후 Bold 토글 시 색상이 검정으로 초기화되고 Bold 해제 안 됨
  - [ ] 다양한 크기의 텍스트를 동시 선택 후 크기 변경 시 부분적으로만 적용됨

- [ ] 리치텍스트 저장 방식 관련 후속 수정
  - [x] 글 목록 미리보기 HTML 태그 노출 문제
    - content에 HTML이 저장되면서 미리보기에 `<strong>`, `<span>` 등 태그가 그대로 출력됨
    - 해결 방향: 미리보기 표시 시 HTML 태그를 제거한 plain text 사용
    - `content.replace(/<[^>]*>/g, '')` 또는 DOMParser로 텍스트만 추출
  - [x] 검색 로직 수정
    - 현재 content(HTML 문자열)에서 키워드 검색 → 태그가 포함되어 오작동 가능
    - "strong" 검색 시 `<strong>` 태그 때문에 엉뚱한 글이 매칭될 수 있음
    - 해결 방향: 검색 시 HTML 태그 제거 후 plain text 기준으로 비교

- [ ] 추가 기능 (선택)
  - [ ] 모드 전환 시 내용 호환 처리 (richtext ↔ markdown 전환)
  - [ ] 붙여넣기 시 plain text만 허용 (외부 HTML 스타일 차단)
  - [ ] 제목 (H1, H2, H3)
  - [ ] 리스트 (순서/비순서)
  - [ ] 링크
  - [ ] 인용구

---

### Phase 4: 소셜 기능

#### 5. 댓글 기능
**예상 소요**: 3-5시간

- [ ] DB 스키마
  - [ ] `comments` 테이블 생성
    ```sql
    - id: uuid
    - post_id: uuid (FK)
    - author_id: uuid (FK)
    - content: text
    - created_at: timestamp
    - updated_at: timestamp
    ```
  - [ ] (선택) 대댓글 지원 시 `parent_id` 추가
- [ ] 댓글 CRUD
  - [ ] 댓글 작성
  - [ ] 댓글 목록 조회
  - [ ] 댓글 수정 (본인만)
  - [ ] 댓글 삭제 (본인만)
- [ ] 댓글 UI
  - [ ] 댓글 목록 표시
  - [ ] 댓글 작성 폼
  - [ ] 댓글 수정 모드
  - [ ] 댓글 삭제 확인
  - [ ] 작성자 정보 표시
  - [ ] 작성 시간 표시
- [ ] (선택) 대댓글
  - [ ] 대댓글 UI
  - [ ] 중첩 구조 표시

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

### 🚧 Milestone 3: 에디터 고도화 (진행 중)
- [x] richtext / markdown 모드 전환
- [x] Bold / Italic / Underline 토글
- [x] Font Size / Color 적용
- [x] PostDetailScreen 연동 (RichTextRenderer)
- [x] DB 구조 변경 (content_type, content_json)
- [ ] 미해결 버그 수정 (색상+볼드, 다중 크기 선택)
- [ ] 글 목록 미리보기 HTML 태그 노출 수정
- [ ] 검색 로직 수정 (HTML 태그 제거 후 plain text 검색)
- [ ] 붙여넣기 처리
- [ ] 모드 전환 호환

### 📅 Milestone 4: 협업 기능
- [ ] 댓글
- [ ] (추후) 좋아요/반응

---

## 📝 작업 진행 노트

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