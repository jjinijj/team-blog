import { supabase } from '../supabaseClient';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

// 전체 태그 조회
export const fetchTags = async (): Promise<Tag[]> => {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
};

// 태그 생성 (관리자 전용)
export const createTag = async (name: string, slug: string): Promise<Tag> => {
  const { data, error } = await supabase
    .from('tags')
    .insert([{ name, slug }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// 태그 삭제 (관리자 전용)
export const deleteTag = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// 특정 글의 태그 조회
export const fetchTagsByPostId = async (postId: string): Promise<Tag[]> => {
  const { data, error } = await supabase
    .from('post_tags')
    .select('tags(*)')
    .eq('post_id', postId);

  if (error) throw error;
  return data.map((row: any) => row.tags);
};

// 글의 태그 일괄 설정 (기존 삭제 후 새로 삽입)
export const setPostTags = async (postId: string, tagIds: string[]): Promise<void> => {
  const { error: deleteError } = await supabase
    .from('post_tags')
    .delete()
    .eq('post_id', postId);

  if (deleteError) throw deleteError;

  if (tagIds.length === 0) return;

  const { error: insertError } = await supabase
    .from('post_tags')
    .insert(tagIds.map(tagId => ({ post_id: postId, tag_id: tagId })));

  if (insertError) throw insertError;
};
