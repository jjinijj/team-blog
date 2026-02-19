import { supabase } from "../supabaseClient";
import type { Comment } from '../types/Comment';

const tableName = 'comments';

/**
 * 특정 글의 댓글 목록 조회
 * JOIN 대신 두 번의 쿼리로 분리 (안정성 향상)
 */
export const fetchComments = async (postId: string): Promise<Comment[]> => {
  try {
    // Step 1: 댓글 목록 가져오기
    const { data: commentsData, error: commentsError } = await supabase
      .from(tableName)
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (commentsError) throw commentsError;
    if (!commentsData) return [];

    // Step 2: 작성자 정보 가져오기
    const authorIds = [...new Set(commentsData.map(c => c.author_id))];
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .in('id', authorIds);

    if (usersError) throw usersError;

    // Step 3: 댓글과 작성자 정보 병합
    const usersMap = new Map(usersData?.map(u => [u.id, u.email]) || []);
    
    return commentsData.map(comment => ({
      ...comment,
      author_email: usersMap.get(comment.author_id) || null
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
    // Step 1: 댓글 생성
    const { data: commentData, error: commentError } = await supabase
      .from(tableName)
      .insert({
        post_id: postId,
        author_id: authorId,
        content: content.trim()
      })
      .select()
      .single();

    if (commentError) throw commentError;
    if (!commentData) throw new Error('No data returned');

    // Step 2: 작성자 정보 가져오기
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', authorId)
      .single();

    if (userError) throw userError;

    // Step 3: 병합
    return {
      ...commentData,
      author_email: userData?.email || null
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
    // Step 1: 댓글 수정
    const { data: commentData, error: commentError } = await supabase
      .from(tableName)
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select()
      .single();

    if (commentError) throw commentError;
    if (!commentData) throw new Error('No data returned');

    // Step 2: 작성자 정보 가져오기
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', commentData.author_id)
      .single();

    if (userError) throw userError;

    // Step 3: 병합
    return {
      ...commentData,
      author_email: userData?.email || null
    };
  } catch (e) {
    console.error('Error updating comment:', e);
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