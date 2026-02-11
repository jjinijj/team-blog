import { DocumentNode } from "../utils/richTextTypes";
import { Post } from "../types/Post";

export function safeParseDoc(post: Post): DocumentNode | null {
  // 신버전: content_json (JSONB) → Supabase가 자동 파싱해서 객체로 반환
  if (post.content_json) return post.content_json;

  // 레거시 글은 content_json 없음 → null (PostDetailScreen에서 fallback 메시지 표시)
  return null;
}