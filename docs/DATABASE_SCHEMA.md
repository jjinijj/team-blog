# 팀 블로그 - 데이터베이스 스키마

현재 Supabase(PostgreSQL)에 구성된 전체 테이블 스키마 레퍼런스입니다.

**최종 업데이트**: 2026-03-27

---

## 테이블 목록

| 테이블 | 설명 |
|--------|------|
| `public.users` | 사용자 프로필 (`auth.users` 미러링) |
| `posts` | 게시글 |
| `comments` | 댓글 |
| `bookmarks` | 북마크 |
| `notifications` | 알림 |
| `tags` | 태그 |
| `post_tags` | 게시글-태그 연결 |
| `post_images` | 게시글 이미지 |
| `post_views` | 조회수 추적 |
| `allowed_emails` | 회원가입 화이트리스트 |
| `home_screen_config` | 랜딩 페이지 설정 |
| `site_config` | 사이트 전역 설정 |

---

## 테이블 상세

### `public.users`

`auth.users` 생성 시 트리거로 자동 동기화되는 사용자 프로필 테이블.

```sql
CREATE TABLE public.users (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text,
  display_name text,
  avatar_color text    DEFAULT '#3b82f6',
  is_admin     boolean DEFAULT false,
  show_in_team boolean DEFAULT true,
  created_at   timestamptz DEFAULT now()
);
```

**RLS**: 읽기 전체 허용 / 수정 본인만

---

### `posts`

```sql
CREATE TABLE posts (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title        text NOT NULL,
  content      text,
  content_json jsonb,
  content_type text CHECK (content_type IN ('markdown', 'richtext')),
  author_id    uuid REFERENCES public.users(id) ON DELETE SET NULL,
  status       text DEFAULT 'published'
                    CHECK (status IN ('draft', 'published', 'private')),
  is_pinned    boolean DEFAULT false,
  view_count   integer DEFAULT 0,
  "isMarkdown" boolean DEFAULT false,  -- 레거시 호환용
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);
```

**RLS**
- `published`: 전체 조회
- `draft`: 본인 + 관리자
- `private`: 본인만
- INSERT/UPDATE/DELETE: 본인만

**비고**: `content_type`이 우선, `isMarkdown`은 레거시 폴백

---

### `comments`

```sql
CREATE TABLE comments (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id    uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id  uuid REFERENCES public.users(id) ON DELETE SET NULL,
  content    text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX ON comments(post_id);
CREATE INDEX ON comments(created_at);
```

**RLS**: 읽기 전체 / 작성 로그인 / 수정·삭제 본인만

---

### `bookmarks`

```sql
CREATE TABLE bookmarks (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  post_id    uuid REFERENCES posts(id)         ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, post_id)
);
```

**RLS**: 본인 북마크만 접근 (SELECT/INSERT/UPDATE/DELETE)

---

### `notifications`

```sql
CREATE TABLE notifications (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,  -- 받는 사람
  actor_id   uuid REFERENCES public.users(id) ON DELETE SET NULL,           -- 유발한 사람
  type       text NOT NULL CHECK (type IN ('comment')),
  post_id    uuid REFERENCES posts(id)    ON DELETE CASCADE,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  is_read    boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER TABLE notifications REPLICA IDENTITY FULL;
```

**RLS**
- SELECT/UPDATE: 본인(`user_id = auth.uid()`)
- INSERT: 타인에게만(`auth.uid() != user_id`) — 본인 글 본인 댓글 알림 자동 차단

---

### `tags`

```sql
CREATE TABLE tags (
  id   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL
);
```

**RLS**: 읽기 전체 / 쓰기 관리자만

---

### `post_tags`

```sql
CREATE TABLE post_tags (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  uuid REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

**RLS**: 읽기 전체 / 쓰기 로그인

---

### `post_images`

```sql
CREATE TABLE post_images (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id      uuid REFERENCES posts(id) ON DELETE CASCADE,  -- 저장 전 null
  author_id    uuid REFERENCES public.users(id) ON DELETE SET NULL,
  storage_path text NOT NULL,
  url          text NOT NULL,
  created_at   timestamptz DEFAULT now()
);
```

**Storage 버킷**: `post-images` (읽기 전체 / 쓰기 로그인)

**비고**: 업로드 시 `post_id = null`, 글 저장 완료 후 `linkImagesToPost`로 일괄 업데이트. `post_id = null` + 7일 이상 된 레코드 = 고아 이미지 후보.

---

### `post_views`

```sql
CREATE TABLE post_views (
  id        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id   uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id   uuid REFERENCES public.users(id) ON DELETE SET NULL,
  viewed_at timestamptz DEFAULT now()
);
```

**집계 규칙**
- 같은 유저 24시간 내 재조회는 카운트 제외
- 본인 글 조회 제외
- 조회 시 `posts.view_count` 캐시 컬럼 업데이트

---

### `allowed_emails`

```sql
CREATE TABLE allowed_emails (
  id       uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email    text UNIQUE NOT NULL,
  added_at timestamptz DEFAULT now(),
  added_by uuid REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX ON allowed_emails(email);
```

**RLS**: 읽기 로그인 전체 / 쓰기 관리자만

---

### `home_screen_config`

싱글 로우 테이블 (`id = 1` 고정).

```sql
CREATE TABLE home_screen_config (
  id                integer PRIMARY KEY DEFAULT 1,

  -- 히어로 섹션
  hero_visible      boolean DEFAULT true,
  hero_badge        text,
  hero_headline     text,
  hero_subheadline  text,
  hero_cta_text     text,
  hero_cta_url      text,

  -- 최신 글 섹션
  recent_visible    boolean DEFAULT true,
  recent_count      integer DEFAULT 6,
  recent_sort       text    DEFAULT 'latest',
  recent_layout     text    DEFAULT 'grid',

  -- 팀 소개 섹션
  team_visible      boolean DEFAULT true,
  team_description  text,
  team_image_url    text,

  updated_at timestamptz DEFAULT now(),

  CONSTRAINT single_row CHECK (id = 1)
);
```

**Storage 버킷**: `home-images` (읽기 전체 / 쓰기 관리자만)

**RLS**: 읽기 전체 / 쓰기 관리자만

---

### `site_config`

```sql
CREATE TABLE site_config (
  id              integer PRIMARY KEY DEFAULT 1,
  site_name       text    DEFAULT 'Team Blog',
  posts_per_page  integer DEFAULT 10,
  max_pinned_posts integer DEFAULT 3,

  CONSTRAINT single_row CHECK (id = 1)
);
```

**RLS**: 읽기 전체 / 쓰기 관리자만

---

## 테이블 관계도

```
auth.users
    │
    │ (트리거 자동 동기화)
    ▼
public.users ──────────────────────────────────────┐
    │                                               │
    ├─ posts (author_id)                            │
    │     │                                         │
    │     ├─ comments (post_id) ◄── author_id ──────┤
    │     ├─ post_tags ──► tags                     │
    │     ├─ post_images (post_id)                  │
    │     ├─ post_views (post_id)                   │
    │     └─ bookmarks (post_id) ◄── user_id ───────┤
    │                                               │
    ├─ notifications (user_id / actor_id) ──────────┤
    │                                               │
    └─ allowed_emails (added_by) ───────────────────┘
```

---

## 참고

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
