import { supabase } from '../supabaseClient';
import type { Post } from '../types/Post';

const mapBookmarkedPost = (item: any): Post => {
  const post = item.posts;
  return {
    id: post.id,
    title: post.title,
    content: post.content ?? '',
    content_json: post.content_json ?? null,
    content_type: post.content_type ?? null,
    created_at: post.created_at,
    updated_at: post.updated_at,
    author_id: post.author_id,
    author_email: post.users?.email ?? null,
    author_name: post.users?.display_name ?? null,
    author_color: post.users?.avatar_color ?? '#3b82f6',
    status: post.status,
    view_count: post.view_count ?? 0,
    is_pinned: post.is_pinned ?? false,
    tags: Array.isArray(post.post_tags)
      ? post.post_tags.map((pt: any) => pt.tags).filter(Boolean)
      : [],
    isMarkdown: post.isMarkdown ?? false,
  };
};

// 북마크 토글 — 현재 북마크 상태(true=추가됨, false=삭제됨) 반환
export const toggleBookmark = async (postId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .maybeSingle();

  if (existing) {
    await supabase.from('bookmarks').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('bookmarks').insert({ user_id: user.id, post_id: postId });
    return true;
  }
};

// 단순 조회
export const checkIsBookmarked = async (postId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .maybeSingle();

  return !!data;
};

// 북마크한 글 목록 (최신 북마크순)
export const fetchBookmarkedPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      created_at,
      posts!post_id(
        *,
        users!author_id(email, display_name, avatar_color),
        post_tags(tags(*))
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .filter((item: any) => item.posts !== null)
    .map(mapBookmarkedPost);
};
