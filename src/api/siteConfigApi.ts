import { supabase } from '../supabaseClient';

// site_config 테이블에서 최대 고정 포스트 개수를 조회한다
export const getMaxPinnedPosts = async (): Promise<number> => {
  const { data, error } = await supabase
    .from('site_config')
    .select('value')
    .eq('key', 'max_pinned_posts')
    .single();

  if (error) throw error;
  return parseInt(data.value, 10);
};

// site_config 테이블의 최대 고정 포스트 개수를 업데이트한다 (관리자 전용)
export const setMaxPinnedPosts = async (count: number): Promise<void> => {
  const { error } = await supabase
    .from('site_config')
    .update({ value: String(count), updated_at: new Date().toISOString() })
    .eq('key', 'max_pinned_posts');

  if (error) throw error;
};

// site_config 테이블에서 페이지당 표시할 글 수를 조회한다
export const getPostsPerPage = async (): Promise<number> => {
  const { data, error } = await supabase
    .from('site_config')
    .select('value')
    .eq('key', 'posts_per_page')
    .single();

  if (error) throw error;
  return parseInt(data.value, 10);
};

// site_config 테이블에서 사이트 이름을 조회한다
export const getSiteName = async (): Promise<string> => {
  const { data, error } = await supabase
    .from('site_config')
    .select('value')
    .eq('key', 'site_name')
    .single();

  if (error) throw error;
  return data.value;
};
