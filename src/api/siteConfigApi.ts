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
