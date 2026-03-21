import { supabase } from '../supabaseClient';

export const getMaxPinnedPosts = async (): Promise<number> => {
  const { data, error } = await supabase
    .from('site_config')
    .select('value')
    .eq('key', 'max_pinned_posts')
    .single();

  if (error) throw error;
  return parseInt(data.value, 10);
};

export const setMaxPinnedPosts = async (count: number): Promise<void> => {
  const { error } = await supabase
    .from('site_config')
    .update({ value: String(count), updated_at: new Date().toISOString() })
    .eq('key', 'max_pinned_posts');

  if (error) throw error;
};
