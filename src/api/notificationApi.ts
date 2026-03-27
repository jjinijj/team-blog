import { supabase } from '../supabaseClient';

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  actor_name: string | null;
  actor_color: string | null;
  type: 'comment';
  post_id: string | null;
  post_title: string | null;
  comment_id: string | null;
  is_read: boolean;
  created_at: string;
}

const mapNotification = (row: any): Notification => ({
  id: row.id,
  user_id: row.user_id,
  actor_id: row.actor_id ?? null,
  actor_name: row.actor?.display_name ?? null,
  actor_color: row.actor?.avatar_color ?? '#3b82f6',
  type: row.type,
  post_id: row.post_id ?? null,
  post_title: row.posts?.title ?? null,
  comment_id: row.comment_id ?? null,
  is_read: row.is_read,
  created_at: row.created_at,
});

const NOTIFICATION_SELECT = `
  *,
  actor:users!actor_id(display_name, avatar_color),
  posts!post_id(title)
`;

// 내 알림 목록 조회 (최신순, 최대 30개)
export const fetchNotifications = async (): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select(NOTIFICATION_SELECT)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) throw error;
  return (data ?? []).map(mapNotification);
};

// 단건 조회 (Realtime payload 수신 후 join 포함 데이터 가져올 때)
export const fetchNotificationById = async (id: string): Promise<Notification | null> => {
  const { data, error } = await supabase
    .from('notifications')
    .select(NOTIFICATION_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) return null;
  return data ? mapNotification(data) : null;
};

// 읽음 처리
export const markAsRead = async (id: string): Promise<void> => {
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
};

// 전체 읽음 처리
export const markAllAsRead = async (): Promise<void> => {
  await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
};

// 댓글 알림 생성 (댓글 작성 시 호출)
// RLS: auth.uid() != user_id 이므로 본인 글에 본인 댓글은 자동 차단
export const createCommentNotification = async (
  postAuthorId: string,
  actorId: string,
  postId: string,
  commentId: string,
): Promise<void> => {
  const { error } = await supabase.from('notifications').insert({
    user_id: postAuthorId,
    actor_id: actorId,
    type: 'comment',
    post_id: postId,
    comment_id: commentId,
  });

  if (error) console.warn('알림 생성 실패:', error);
};
