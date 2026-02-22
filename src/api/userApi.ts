import { supabase } from '../supabaseClient';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_color: string | null;
  is_admin: boolean;
  created_at: string;
}

// 프로필 조회
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as UserProfile;
};

// 이름 변경
export const updateDisplayName = async (userId: string, displayName: string): Promise<void> => {
  const { error } = await supabase
    .from('users')
    .update({ display_name: displayName.trim() })
    .eq('id', userId);

  if (error) throw error;
};

// 비밀번호 변경
export const updatePassword = async (newPassword: string): Promise<void> => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
};

// 배경 색 변경
export const updateAvatarColor = async (userId: string, color: string): Promise<void> => {
  const { error } = await supabase
    .from('users')
    .update({ avatar_color: color })
    .eq('id', userId);
  if (error) throw error;
};