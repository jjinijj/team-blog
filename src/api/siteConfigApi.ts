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

const SITE_NAME_CACHE_KEY = 'site_config_site_name';

// localStorage에서 캐시된 사이트 이름을 동기적으로 반환한다 (없으면 null)
export const getCachedSiteName = (): string | null =>
  localStorage.getItem(SITE_NAME_CACHE_KEY);

// site_config 테이블에서 사이트 이름을 조회하고 localStorage에 캐시한다
export const getSiteName = async (): Promise<string> => {
  const { data, error } = await supabase
    .from('site_config')
    .select('value')
    .eq('key', 'site_name')
    .single();

  if (error) throw error;
  localStorage.setItem(SITE_NAME_CACHE_KEY, data.value);
  return data.value;
};

// site_config 테이블의 사이트 이름을 업데이트하고 캐시도 갱신한다 (관리자 전용)
export const setSiteName = async (name: string): Promise<void> => {
  const { error } = await supabase
    .from('site_config')
    .update({ value: name, updated_at: new Date().toISOString() })
    .eq('key', 'site_name');

  if (error) throw error;
  localStorage.setItem(SITE_NAME_CACHE_KEY, name);
};

// site_config 테이블의 페이지당 표시할 글 수를 업데이트한다 (관리자 전용)
export const setPostsPerPage = async (count: number): Promise<void> => {
  const { error } = await supabase
    .from('site_config')
    .update({ value: String(count), updated_at: new Date().toISOString() })
    .eq('key', 'posts_per_page');

  if (error) throw error;
};
