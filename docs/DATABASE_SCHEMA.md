# 팀 블로그 - 데이터베이스 스키마 설정

## 개요

이 문서는 팀 블로그 에디터의 로그인 기능 구현을 위한 Supabase 데이터베이스 스키마 설정을 설명합니다.

**작업 일자**: 2026년 2월 1일  
**작업 목적**: 이메일 화이트리스트 기반 사용자 인증 시스템 구축

---

## 실행한 SQL 쿼리

```sql
-- 1. 허용된 이메일 목록 테이블 생성
CREATE TABLE IF NOT EXISTS allowed_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id)
);

-- 2. 이메일 검색 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_allowed_emails_email ON allowed_emails(email);

-- 3. RLS (Row Level Security) 활성화
ALTER TABLE allowed_emails ENABLE ROW LEVEL SECURITY;

-- 4. 정책: 모든 인증된 사용자가 조회 가능
CREATE POLICY "Anyone can view allowed emails"
  ON allowed_emails FOR SELECT
  TO authenticated
  USING (true);

-- 5. 초기 팀 멤버 이메일 추가
INSERT INTO allowed_emails (email) VALUES
  ('your-email@example.com')
ON CONFLICT (email) DO NOTHING;

-- 6. posts 테이블에 author_id 컬럼 추가
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id);
```

---

## 상세 설명

### 1. allowed_emails 테이블 생성

```sql
CREATE TABLE IF NOT EXISTS allowed_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id)
);
```

**목적**: 회원가입이 허용된 이메일 목록을 관리하는 화이트리스트 테이블

**컬럼 설명**:
- `id` (UUID): 각 레코드의 고유 식별자
  - `gen_random_uuid()`: PostgreSQL 함수로 자동 UUID 생성
  - `PRIMARY KEY`: 기본 키로 설정
  
- `email` (TEXT): 허용된 이메일 주소
  - `UNIQUE`: 중복 이메일 방지
  - `NOT NULL`: 필수 입력 필드
  
- `added_at` (TIMESTAMP WITH TIME ZONE): 이메일이 추가된 시각
  - `DEFAULT NOW()`: 레코드 생성 시 현재 시각 자동 설정
  - 타임존 정보 포함하여 정확한 시간 추적
  
- `added_by` (UUID): 이메일을 추가한 관리자의 사용자 ID
  - `REFERENCES auth.users(id)`: Supabase Auth의 users 테이블과 외래키 관계
  - 추후 누가 이메일을 추가했는지 추적 가능

**사용 사례**:
- 회원가입 시 입력한 이메일이 이 테이블에 있는지 확인
- 관리자 페이지에서 허용된 이메일 목록 관리

---

### 2. 이메일 검색 인덱스 생성

```sql
CREATE INDEX IF NOT EXISTS idx_allowed_emails_email ON allowed_emails(email);
```

**목적**: 이메일 검색 성능 최적화

**설명**:
- `CREATE INDEX`: PostgreSQL 인덱스 생성
- `IF NOT EXISTS`: 이미 존재하면 생략 (재실행 시 에러 방지)
- `idx_allowed_emails_email`: 인덱스 이름 (관례: `idx_테이블명_컬럼명`)
- `ON allowed_emails(email)`: allowed_emails 테이블의 email 컬럼에 인덱스 생성

**효과**:
- 회원가입 시 이메일 조회 속도 향상
- `WHERE email = 'xxx@example.com'` 같은 쿼리가 빨라짐
- 테이블에 수천, 수만 개의 레코드가 있어도 빠른 검색

**성능 비교**:
- 인덱스 없음: O(n) - 전체 테이블 스캔
- 인덱스 있음: O(log n) - B-Tree 검색

---

### 3. RLS (Row Level Security) 활성화

```sql
ALTER TABLE allowed_emails ENABLE ROW LEVEL SECURITY;
```

**목적**: 테이블 수준의 보안 정책 활성화

**RLS란?**:
- Row Level Security의 약자
- PostgreSQL의 보안 기능
- **행(row) 단위**로 접근 권한을 제어
- 테이블에 접근할 때 정책(Policy)을 통해 권한 검증

**활성화 효과**:
- RLS를 활성화하면 **기본적으로 모든 접근이 차단**됨
- 명시적으로 정책(Policy)을 만들어야 데이터 접근 가능
- 클라이언트에서 직접 Supabase API를 호출해도 정책에 따라 제어됨

**보안 이점**:
- SQL Injection 공격 방지
- 권한 없는 사용자의 데이터 접근 차단
- 서버 사이드 로직 없이도 데이터 보호

---

### 4. RLS 정책: 인증된 사용자 조회 허용

```sql
CREATE POLICY "Anyone can view allowed emails"
  ON allowed_emails FOR SELECT
  TO authenticated
  USING (true);
```

**목적**: 로그인한 사용자가 화이트리스트를 조회할 수 있도록 허용

**구문 설명**:
- `CREATE POLICY`: 새로운 보안 정책 생성
- `"Anyone can view allowed emails"`: 정책 이름 (사람이 읽기 쉬운 설명)
- `ON allowed_emails`: 이 정책이 적용될 테이블
- `FOR SELECT`: SELECT 쿼리(조회)에만 적용
- `TO authenticated`: 인증된 사용자(로그인한 사용자)에게만 적용
- `USING (true)`: 조건 없이 항상 허용

**권한 범위**:
- ✅ 로그인한 사용자: allowed_emails 테이블 조회 가능
- ❌ 비로그인 사용자: 조회 불가
- ❌ INSERT, UPDATE, DELETE: 별도 정책이 없으므로 불가

**왜 조회만 허용하나?**:
- 회원가입 시 이메일 화이트리스트 확인을 위해 필요
- 추가/수정/삭제는 관리자만 가능하도록 제한 (별도 정책 필요)

---

### 5. 초기 팀 멤버 이메일 추가

```sql
INSERT INTO allowed_emails (email) VALUES
  ('your-email@example.com')
ON CONFLICT (email) DO NOTHING;
```

**목적**: 최초 관리자(본인) 이메일을 화이트리스트에 추가

**구문 설명**:
- `INSERT INTO allowed_emails (email)`: allowed_emails 테이블의 email 컬럼에 삽입
- `VALUES ('your-email@example.com')`: 추가할 이메일 (실제 이메일로 변경 필요)
- `ON CONFLICT (email) DO NOTHING`: 중복 시 아무 작업 안함

**ON CONFLICT 설명**:
- email 컬럼에 UNIQUE 제약조건이 있음
- 이미 존재하는 이메일을 INSERT 하면 충돌(conflict) 발생
- `DO NOTHING`: 충돌 시 에러 없이 무시하고 계속 진행
- SQL을 여러 번 실행해도 안전함 (멱등성 보장)

**실제 사용 예시**:
```sql
-- 팀 멤버 여러 명 추가
INSERT INTO allowed_emails (email) VALUES
  ('admin@team.com'),
  ('member1@team.com'),
  ('member2@team.com')
ON CONFLICT (email) DO NOTHING;
```

---

### 6. posts 테이블에 author_id 컬럼 추가

```sql
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id);
```

**목적**: 각 게시글의 작성자를 추적하기 위한 컬럼 추가

**구문 설명**:
- `ALTER TABLE posts`: 기존 posts 테이블 구조 변경
- `ADD COLUMN`: 새 컬럼 추가
- `IF NOT EXISTS`: 이미 존재하면 무시 (재실행 시 에러 방지)
- `author_id UUID`: 컬럼명과 데이터 타입
- `REFERENCES auth.users(id)`: 외래키 제약조건

**외래키 (Foreign Key) 설명**:
- `REFERENCES auth.users(id)`: Supabase Auth의 users 테이블의 id를 참조
- author_id에는 실제 존재하는 사용자의 ID만 저장 가능
- 사용자가 삭제되면 관련 처리 필요 (CASCADE 등)

**기존 데이터 처리**:
- 이미 존재하는 게시글들의 author_id는 NULL로 설정됨
- 추후 마이그레이션 작업으로 기존 글에 작성자 지정 가능

**활용 방안**:
- 글 작성 시: 현재 로그인한 사용자의 ID를 author_id에 저장
- 글 목록: author_id로 users 테이블과 JOIN하여 작성자 이름 표시
- 권한 제어: 본인이 쓴 글만 수정/삭제 가능하도록 제한

---

## 테이블 관계도

```
┌─────────────────────┐
│   auth.users        │  (Supabase 기본 제공)
│  ─────────────────  │
│  id (UUID) PK       │
│  email              │
│  created_at         │
└──────────┬──────────┘
           │
           │ 1:N
           │
    ┌──────┴──────────────┬──────────────────┐
    │                     │                  │
    ▼                     ▼                  ▼
┌─────────────────┐  ┌──────────────┐  ┌─────────────┐
│ allowed_emails  │  │    posts     │  │  comments   │
│ ─────────────── │  │ ──────────── │  │ ─────────── │
│ id (UUID) PK    │  │ id (str) PK  │  │ id (UUID)   │
│ email (unique)  │  │ title        │  │ post_id FK  │
│ added_at        │  │ content      │  │ author_id FK│
│ added_by FK ────┤  │ author_id FK─┤  │ content     │
└─────────────────┘  │ ...          │  │ created_at  │
                     └──────────────┘  └─────────────┘
```

---

## 다음 단계

### 즉시 작업
1. ✅ allowed_emails 테이블 생성 완료
2. ✅ posts 테이블에 author_id 추가 완료
3. ⏭️ TypeScript 타입 정의
4. ⏭️ AuthContext 구현
5. ⏭️ 로그인/회원가입 UI

### 추후 작업
- [ ] posts 테이블 RLS 정책 추가 (본인 글만 수정/삭제)
- [ ] allowed_emails 관리를 위한 관리자 정책 추가
- [ ] 기존 게시글에 author_id 할당 (마이그레이션)
- [ ] CASCADE 옵션 검토 (사용자 삭제 시 처리)

---

## 참고 자료

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [Supabase Auth Users Table](https://supabase.com/docs/guides/auth/managing-user-data)

---

**문서 작성일**: 2026년 2월 1일  
**작성자**: 진  
**버전**: 1.0.0
