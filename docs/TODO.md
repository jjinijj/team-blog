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

- [ ] 관리자 권한 설정
  - [ ] `users` 테이블에 `is_admin` 컬럼 추가
  - [ ] 초기 관리자 설정
- [ ] 관리자 페이지 UI (`/admin`)
  - [ ] 이메일 화이트리스트 목록 조회
  - [ ] 새 이메일 추가 폼
  - [ ] 이메일 삭제 기능
  - [ ] 추가한 날짜 표시
- [ ] 권한 체크
  - [ ] 관리자만 접근 가능하게 라우팅 보호
  - [ ] 일반 사용자 접근 시 리다이렉트

---

### Phase 3: 에디터 개선

#### 4. 리치텍스트 에디터 개선
**예상 소요**: 2-4시간

- [ ] 에디터 모드 추가
  - [ ] Post에 `editorMode: 'rich' | 'markdown'` 추가
  - [ ] 기본값은 'rich'
- [ ] 리치텍스트 툴바 개선
  - [ ] 현재 폼 방식 → 인라인 툴바로 변경
  - [ ] 텍스트 선택 시 포맷 적용
  - [ ] 더 많은 포맷 옵션 추가
    - [ ] 제목 (H1, H2, H3)
    - [ ] 리스트 (순서/비순서)
    - [ ] 링크
    - [ ] 인용구
- [ ] 마크다운 모드 추가
  - [ ] 마크다운 입력 영역
  - [ ] 실시간 프리뷰
  - [ ] 마크다운 → HTML 변환
  - [ ] 마크다운 파싱 로직
- [ ] 모드 전환 UI
  - [ ] 에디터 상단에 토글 버튼
  - [ ] 모드 전환 시 안내 메시지

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

### ✅ Milestone 1: 기본 기능 완성 (현재)
- [x] 글 작성/수정/삭제
- [x] 검색/정렬
- [x] 다중 삭제
- [x] localStorage 저장
- [x] Supabase 마이그레이션
- [x] Vite + Tailwind CSS 전환

### ✅ Milestone 2: 사용자 시스템 (완료!)
- [x] 로그인/회원가입
- [x] 작성자 정보
- [ ] 관리자 페이지

### 📅 Milestone 3: 에디터 고도화
- [ ] 리치텍스트 개선
- [ ] 마크다운 지원

### 📅 Milestone 4: 협업 기능
- [ ] 댓글
- [ ] (추후) 좋아요/반응

---

## 📝 작업 진행 노트

### 2026-02-03
- ✅ Phase 1 완료!
- 로그인/회원가입 기능 구현
  - Supabase Auth 설정
  - 이메일 화이트리스트 기반 회원가입
  - AuthContext 구현 (세션 관리, signUp, signIn, signOut)
  - AuthScreen UI (로그인/회원가입 토글)
- 작성자 정보 및 권한 관리
  - public.users 테이블 생성 및 트리거 설정
  - posts와 users JOIN으로 작성자 이메일 표시
  - 본인 글만 수정/삭제 가능하도록 권한 체크
  - EditorScreen 접근 제어 (로그인 필수, 권한 체크)
- 문서 업데이트
  - DATABASE_SCHEMA.md 업데이트 (v2.0.0)
  - TODO.md 업데이트
- 다음 작업: Phase 2 관리자 페이지 또는 Phase 4 댓글 기능

### 2026-02-01
- 작업 순서 확정
- TODO 문서 생성
- 다음 작업: 로그인 기능 구현

---

## 🔗 참고 자료

- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [React Hook Form](https://react-hook-form.com/) (폼 관리 시)

---

**작업 완료 시 체크박스를 `[x]`로 변경하세요!**
