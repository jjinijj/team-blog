import { supabase } from '../supabaseClient';

export interface HomeScreenConfig {
  id: number;
  hero_visible: boolean;
  hero_headline: string;
  hero_subheadline: string;
  hero_cta_text: string;
  latest_posts_visible: boolean;
  latest_posts_count: number;
  latest_posts_sort: string;
  card_layout: 'grid' | 'list';
  team_visible: boolean;
  team_description: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  display_name: string | null;
  avatar_color: string | null;
  show_in_team: boolean;
}

// 홈 화면 설정 조회 (id=1 고정)
export const fetchHomeScreenConfig = async (): Promise<HomeScreenConfig | null> => {
  const { data, error } = await supabase
    .from('home_screen_config')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) return null;
  return data as HomeScreenConfig;
};

// 홈 화면 설정 저장 (upsert)
export const saveHomeScreenConfig = async (
  config: Omit<HomeScreenConfig, 'id' | 'updated_at'>
): Promise<void> => {
  const { error } = await supabase
    .from('home_screen_config')
    .upsert({ id: 1, ...config, updated_at: new Date().toISOString() });

  if (error) throw error;
};

// 팀원 목록 조회 (전체 users)
export const fetchTeamMembers = async (): Promise<TeamMember[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, display_name, avatar_color, show_in_team')
    .order('display_name');

  if (error) return [];
  return data as TeamMember[];
};

// 특정 팀원의 show_in_team 토글
export const updateTeamMemberVisibility = async (
  userId: string,
  showInTeam: boolean
): Promise<void> => {
  const { error } = await supabase
    .from('users')
    .update({ show_in_team: showInTeam })
    .eq('id', userId);

  if (error) throw error;
};
