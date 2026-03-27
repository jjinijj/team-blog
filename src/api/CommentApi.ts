import { supabase } from "../supabaseClient";
import type { Comment } from '../types/Comment';

const tableName = 'comments';

/**
 * 특정 글의 댓글 목록 조회
 */
export const fetchComments = async (postId: string): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(`
        *,
        users!author_id(email,display_name,avatar_color)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(data);

    return ((data as any[]) || []).map((comment: any) => ({
      ...comment,
      author_email: comment.users?.email,
      author_name: comment.users?.display_name ?? null,
      author_color: comment.users?.avatar_color ?? '#3b82f6',
    }));
  } catch (e) {
    console.error('Error fetching comments:', e);
    throw e;
  }
};

/**
 * 댓글 작성
 */
export const createComment = async (
  postId: string,
  authorId: string,
  content: string
): Promise<Comment> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert({
        post_id: postId,
        author_id: authorId,
        content: content.trim()
      })
      .select(`
        *,
        author:users!author_id(email, display_name, avatar_color)
      `)
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned');

    const result = data as any;
    return {
      ...result,
      author_email: result.author?.email,
      author_name: result.author?.display_name ?? null,
      author_color: result.author?.avatar_color ?? '#3b82f6',
    };
  } catch (e) {
    console.error('Error creating comment:', e);
    throw e;
  }
};

/**
 * 댓글 수정
 */
export const updateComment = async (
  commentId: string,
  content: string
): Promise<Comment> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select(`
        *,
        author:users!author_id(email, display_name, avatar_color)
      `)
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned');

    const result = data as any;
    return {
      ...result,
      author_email: result.author?.email,
      author_name: result.author?.display_name ?? null,
      author_color: result.author?.avatar_color ?? '#3b82f6',
    };
  } catch (e) {
    console.error('Error updating comment:', e);
    throw e;
  }
};

/**
 * 내가 작성한 댓글 목록 조회 (글 제목 포함)
 */
export const fetchMyComments = async (userId: string): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(`*, posts!post_id(id, title)`)
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return ((data as any[]) || []).map((comment: any) => ({
      ...comment,
      post_title: comment.posts?.title ?? null,
    }));
  } catch (e) {
    console.error('Error fetching my comments:', e);
    throw e;
  }
};

/**
 * 댓글 삭제
 */
export const deleteComment = async (commentId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  } catch (e) {
    console.error('Error deleting comment:', e);
    throw e;
  }
};