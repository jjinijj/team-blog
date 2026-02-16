/**
 * DB에서 가져온 완전한 댓글 데이터
 */
export interface Comment {
  id: string;                    // UUID (DB에서 자동 생성)
  post_id: string;               // 글 ID
  author_id: string;             // 작성자 ID
  content: string;               // 댓글 내용
  created_at: string;            // 작성 시간
  updated_at: string;            // 수정 시간
  
  // JOIN으로 가져올 필드 (선택적)
  author_email?: string;         // 작성자 이메일
}

/**
 * 댓글 작성 시 사용하는 입력 데이터
 * (id, created_at, updated_at, author_email은 DB에서 생성)
 */
export interface CreateCommentInput {
  post_id: string;
  author_id: string;
  content: string;
}

/**
 * 댓글 수정 시 사용하는 입력 데이터
 */
export interface UpdateCommentInput {
  content: string;
}