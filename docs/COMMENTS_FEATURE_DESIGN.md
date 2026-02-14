# 댓글 기능 설계 문서

## 📋 개요

팀 블로그 에디터에 댓글 기능을 추가하기 위한 전체 구조 설계 문서입니다.

**목표**: 사용자들이 글에 댓글을 작성하고, 수정/삭제할 수 있는 기본적인 댓글 시스템 구현

**범위**: 
- ✅ 단순 댓글 (flat structure)
- ❌ 대댓글 (추후 v2로 확장 가능)

**예상 소요 시간**: 3-5시간

---

## 1. 데이터베이스 스키마

### 1.1 테이블 구조

```sql
-- comments 테이블 생성
create table comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references posts(id) on delete cascade not null,
  author_id uuid references public.users(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 인덱스 생성 (성능 최적화)
create index idx_comments_post_id on comments(post_id);
create index idx_comments_created_at on comments(created_at desc);

-- RLS (Row Level Security) 활성화
alter table comments enable row level security;
```

### 1.2 RLS 정책

```sql
-- 정책 1: 모두 댓글 읽기 가능
create policy "Anyone can read comments"
  on comments for select 
  using (true);

-- 정책 2: 로그인한 사용자만 댓글 작성 가능
create policy "Authenticated users can create comments"
  on comments for insert 
  with check (auth.uid() = author_id);

-- 정책 3: 본인 댓글만 수정 가능
create policy "Users can update own comments"
  on comments for update 
  using (auth.uid() = author_id);

-- 정책 4: 본인 댓글만 삭제 가능
create policy "Users can delete own comments"
  on comments for delete 
  using (auth.uid() = author_id);
```

### 1.3 설계 포인트

| 항목 | 설명 |
|------|------|
| `on delete cascade` | 글이 삭제되면 댓글도 자동 삭제 |
| `idx_comments_post_id` | 특정 글의 댓글 조회 성능 향상 |
| `idx_comments_created_at` | 최신순 정렬 성능 향상 |
| RLS 정책 | 보안: 본인 댓글만 수정/삭제 가능 |

---

## 2. TypeScript 타입 정의

### 2.1 Comment 인터페이스

```typescript
// src/types/Comment.ts
export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  
  // JOIN으로 가져올 필드
  author_email?: string;
}
```

### 2.2 폼 데이터 타입

```typescript
export interface CommentFormData {
  content: string;
}
```

---

## 3. 컴포넌트 구조

### 3.1 파일 구조

```
src/
├── types/
│   └── Comment.ts                  # Comment 인터페이스
├── screens/
│   └── PostDetailScreen.tsx        # 댓글 섹션 포함
└── components/
    └── comments/
        ├── CommentsSection.tsx     # 댓글 전체 컨테이너
        ├── CommentList.tsx         # 댓글 목록
        ├── CommentItem.tsx         # 개별 댓글
        └── CommentForm.tsx         # 댓글 작성/수정 폼
```

### 3.2 컴포넌트 역할

#### CommentsSection.tsx (컨테이너)
**역할**: 댓글 데이터 fetch 및 상태 관리

**상태**:
```typescript
const [comments, setComments] = useState<Comment[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
```

**주요 기능**:
- `fetchComments()` - 댓글 목록 조회
- `createComment(content)` - 댓글 작성
- `updateComment(id, content)` - 댓글 수정
- `deleteComment(id)` - 댓글 삭제

**Props**:
```typescript
interface CommentsSectionProps {
  postId: string;
}
```

---

#### CommentList.tsx
**역할**: 댓글 목록 렌더링

**Props**:
```typescript
interface CommentListProps {
  comments: Comment[];
  currentUserId: string | null;
  editingCommentId: string | null;
  onEdit: (commentId: string) => void;
  onCancelEdit: () => void;
  onUpdate: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}
```

**특징**:
- 최신순 정렬 (created_at desc)
- 빈 상태 처리 ("첫 댓글을 작성해보세요")

---

#### CommentItem.tsx
**역할**: 개별 댓글 표시 및 수정/삭제

**Props**:
```typescript
interface CommentItemProps {
  comment: Comment;
  isOwner: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (content: string) => Promise<void>;
  onDelete: () => Promise<void>;
}
```

**모드**:
1. **일반 모드**: 댓글 내용 + 작성자 + 시간 + (본인이면 수정/삭제 버튼)
2. **수정 모드**: textarea + 취소/저장 버튼

---

#### CommentForm.tsx
**역할**: 댓글 작성/수정 폼

**Props**:
```typescript
interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  initialValue?: string;
  placeholder?: string;
  submitButtonText?: string;
}
```

**유효성 검사**:
- 빈 댓글 방지 (content.trim().length > 0)
- 최대 길이 제한 (선택 사항)

---

## 4. 데이터 흐름

### 4.1 전체 흐름도

```
┌─────────────────────────────────────────┐
│      PostDetailScreen                    │
│  ┌───────────────────────────────────┐  │
│  │     CommentsSection               │  │
│  │  - fetchComments(post_id)         │  │
│  │  - createComment(content)         │  │
│  │  - updateComment(id, content)     │  │
│  │  - deleteComment(id)              │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│     ┌────────────┼────────────┐         │
│     ↓            ↓            ↓          │
│  ┌─────┐  ┌──────────┐  ┌──────────┐   │
│  │Form │  │   List   │  │  Item    │   │
│  └─────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────┘
           ↓                ↑
    ┌──────────────────────────┐
    │   Supabase (comments)    │
    │   - RLS 정책 적용         │
    │   - JOIN public.users    │
    └──────────────────────────┘
```

### 4.2 조회 흐름

```typescript
// CommentsSection.tsx
useEffect(() => {
  fetchComments();
}, [postId]);

const fetchComments = async () => {
  setIsLoading(true);
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:public.users!author_id(email)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // author 객체를 author_email로 평탄화
    const flattenedData = data.map(comment => ({
      ...comment,
      author_email: comment.author?.email
    }));
    
    setComments(flattenedData);
  } catch (error) {
    console.error('Error fetching comments:', error);
  } finally {
    setIsLoading(false);
  }
};
```

### 4.3 작성 흐름

```typescript
const handleCreate = async (content: string) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: user.id,
        content: content.trim()
      })
      .select(`
        *,
        author:public.users!author_id(email)
      `)
      .single();
    
    if (error) throw error;
    
    // 새 댓글을 목록 맨 위에 추가 (최신순)
    setComments([
      { ...data, author_email: data.author?.email },
      ...comments
    ]);
  } catch (error) {
    console.error('Error creating comment:', error);
  }
};
```

### 4.4 수정 흐름

```typescript
const handleUpdate = async (commentId: string, content: string) => {
  try {
    const { error } = await supabase
      .from('comments')
      .update({ 
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId);
    
    if (error) throw error;
    
    // 로컬 상태 업데이트
    setComments(comments.map(comment =>
      comment.id === commentId
        ? { ...comment, content: content.trim() }
        : comment
    ));
    
    setEditingCommentId(null);
  } catch (error) {
    console.error('Error updating comment:', error);
  }
};
```

### 4.5 삭제 흐름

```typescript
const handleDelete = async (commentId: string) => {
  if (!confirm('댓글을 삭제하시겠습니까?')) return;
  
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    
    if (error) throw error;
    
    // 로컬 상태에서 제거
    setComments(comments.filter(comment => comment.id !== commentId));
  } catch (error) {
    console.error('Error deleting comment:', error);
  }
};
```

---

## 5. UI/UX 설계

### 5.1 레이아웃 (PostDetailScreen)

```
┌─────────────────────────────────────┐
│  [뒤로가기] [수정] [삭제]           │
├─────────────────────────────────────┤
│  제목: 팀 블로그 소개                │
│  작성자: admin@example.com          │
│  작성일: 2026-02-13                  │
├─────────────────────────────────────┤
│  본문 내용                           │
│  안녕하세요, 팀 블로그입니다...     │
├─────────────────────────────────────┤
│  💬 댓글 (3)                        │
│  ┌───────────────────────────────┐ │
│  │ [댓글을 작성하세요...]        │ │
│  │ [등록]                        │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ user@example.com  2시간 전    │ │
│  │ 좋은 글 감사합니다!           │ │
│  │                    [수정][삭제]│ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ other@example.com  5시간 전   │ │
│  │ 다음 글도 기대됩니다.         │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 5.2 상태별 UI

#### 1. 일반 모드 (CommentItem)
```
┌─────────────────────────────────────┐
│ user@example.com  2시간 전          │
│ 댓글 내용입니다...                  │
│                        [수정] [삭제]│ (본인만 표시)
└─────────────────────────────────────┘
```

#### 2. 수정 모드
```
┌─────────────────────────────────────┐
│ user@example.com  2시간 전          │
│ ┌─────────────────────────────────┐│
│ │ [수정할 내용...]                ││
│ └─────────────────────────────────┘│
│                        [취소] [저장]│
└─────────────────────────────────────┘
```

#### 3. 로딩 상태
```
┌─────────────────────────────────────┐
│  💬 댓글 불러오는 중...             │
└─────────────────────────────────────┘
```

#### 4. 빈 상태
```
┌─────────────────────────────────────┐
│  💬 댓글 (0)                        │
│  첫 댓글을 작성해보세요!            │
└─────────────────────────────────────┘
```

### 5.3 스타일링 (Tailwind CSS)

#### 주요 색상
- Primary: `text-blue-600`
- Success: `bg-green-600`
- Danger: `bg-red-600`
- Border: `border-gray-300`
- Background: `bg-gray-50`

#### 반응형
- 모바일: 단일 컬럼
- 데스크톱: 최대 너비 제한 (max-w-4xl)

---

## 6. 구현 순서

### Phase 1: DB 설정 (15분)
- [ ] Supabase Dashboard에서 comments 테이블 생성
- [ ] RLS 정책 적용
- [ ] 인덱스 추가
- [ ] 테스트 데이터 입력

### Phase 2: 타입 & 유틸 (15분)
- [ ] `src/types/Comment.ts` 생성
- [ ] Comment 인터페이스 정의
- [ ] CommentFormData 타입 정의

### Phase 3: 기본 컴포넌트 (1시간)
- [ ] `components/comments/` 폴더 생성
- [ ] CommentsSection.tsx (컨테이너)
- [ ] CommentForm.tsx (작성 폼)
- [ ] CommentList.tsx (목록)
- [ ] CommentItem.tsx (개별 댓글)

### Phase 4: CRUD 구현 (1시간)
- [ ] fetchComments 구현
- [ ] createComment 구현
- [ ] updateComment 구현
- [ ] deleteComment 구현

### Phase 5: 권한 & UX (30분)
- [ ] 본인 댓글만 수정/삭제 버튼 표시
- [ ] 수정 모드 전환 로직
- [ ] 삭제 확인 다이얼로그
- [ ] 에러 처리 및 토스트 메시지

### Phase 6: 통합 & 테스트 (30분)
- [ ] PostDetailScreen에 CommentsSection 통합
- [ ] 엣지 케이스 테스트
  - [ ] 빈 댓글 작성 시도
  - [ ] 본인 아닌 댓글 수정/삭제 시도 (RLS 확인)
  - [ ] 글 삭제 시 댓글도 삭제되는지 확인
- [ ] 스타일링 마무리

---

## 7. 기능 요구사항

### 7.1 구현할 기능 ✅

- [x] 댓글 작성 (로그인한 사용자)
- [x] 댓글 목록 조회 (모든 사용자)
- [x] 댓글 수정 (본인만)
- [x] 댓글 삭제 (본인만)
- [x] 작성자 정보 표시 (email)
- [x] 작성 시간 표시 (상대 시간)
- [x] 실시간 업데이트 (작성/수정/삭제 후 목록 갱신)
- [x] 수정 모드 전환
- [x] 삭제 확인 다이얼로그
- [x] 에러 처리

### 7.2 구현하지 않을 기능 ❌ (v1)

- [ ] 대댓글 (parent_id)
- [ ] 좋아요/반응
- [ ] 실시간 구독 (Supabase Realtime)
- [ ] 페이지네이션 (댓글이 많을 때)
- [ ] 마크다운/리치텍스트 (plain text만)
- [ ] 이미지 첨부
- [ ] 멘션 (@user)

### 7.3 추후 확장 가능 🔮 (v2)

#### 대댓글 기능
```sql
-- parent_id 컬럼 추가
alter table comments 
add column parent_id uuid references comments(id) on delete cascade;

-- 인덱스 추가
create index idx_comments_parent_id on comments(parent_id);
```

#### 좋아요 기능
```sql
create table comment_likes (
  id uuid primary key default uuid_generate_v4(),
  comment_id uuid references comments(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(comment_id, user_id)
);
```

#### 실시간 구독
```typescript
// Supabase Realtime 구독
supabase
  .channel('comments')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'comments' },
    (payload) => {
      // 실시간 업데이트 처리
    }
  )
  .subscribe();
```

---

## 8. 보안 고려사항

### 8.1 RLS (Row Level Security)
- ✅ 읽기: 모두 가능
- ✅ 작성: 로그인한 사용자만
- ✅ 수정/삭제: 본인만

### 8.2 입력 검증
- XSS 방지: Supabase는 자동으로 SQL Injection 방지
- 빈 댓글 방지: `content.trim().length > 0`
- 최대 길이 제한 (선택): `maxLength={500}`

### 8.3 에러 처리
```typescript
try {
  // Supabase 작업
} catch (error) {
  console.error('Error:', error);
  // 사용자에게 친절한 에러 메시지 표시
  alert('댓글 작성에 실패했습니다. 다시 시도해주세요.');
}
```

---

## 9. 성능 최적화

### 9.1 인덱스 활용
- `idx_comments_post_id`: 특정 글의 댓글 빠른 조회
- `idx_comments_created_at`: 최신순 정렬 성능 향상

### 9.2 쿼리 최적화
```typescript
// JOIN으로 한 번에 가져오기 (N+1 쿼리 방지)
.select(`
  *,
  author:public.users!author_id(email)
`)
```

### 9.3 낙관적 업데이트 (선택)
```typescript
// 즉시 UI 업데이트 → 서버 요청
setComments([newComment, ...comments]); // 낙관적
await supabase.from('comments').insert(newComment); // 실제 저장
```

---

## 10. 테스트 시나리오

### 10.1 기본 기능 테스트
1. ✅ 로그인한 사용자가 댓글 작성
2. ✅ 작성한 댓글이 목록에 즉시 표시
3. ✅ 본인 댓글에 수정/삭제 버튼 표시
4. ✅ 타인 댓글에는 수정/삭제 버튼 없음
5. ✅ 댓글 수정 → 내용 업데이트 확인
6. ✅ 댓글 삭제 → 목록에서 제거 확인

### 10.2 권한 테스트
1. ✅ 비로그인 사용자는 댓글 작성 폼 보이지 않음
2. ✅ 타인 댓글 수정 API 직접 호출 → RLS로 차단
3. ✅ 타인 댓글 삭제 API 직접 호출 → RLS로 차단

### 10.3 엣지 케이스
1. ✅ 빈 댓글 작성 시도 → 에러 메시지
2. ✅ 글 삭제 시 댓글도 함께 삭제 (cascade)
3. ✅ 댓글이 없을 때 빈 상태 표시
4. ✅ 네트워크 에러 시 에러 메시지

---

## 11. 참고 자료

### Supabase 문서
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime) (추후 확장 시)

### React 패턴
- [Compound Components](https://kentcdodds.com/blog/compound-components-with-react-hooks)
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

### UI/UX 참고
- [Medium 댓글 시스템](https://medium.com)
- [GitHub Discussions](https://github.com/features/discussions)

---

**문서 작성일**: 2026-02-14  
**작성자**: Claude & 진  
**버전**: 1.0.0  
**상태**: 설계 완료, 구현 대기
