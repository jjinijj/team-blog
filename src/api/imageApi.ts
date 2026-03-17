import { supabase } from '../supabaseClient';

const BUCKET = 'post-images';
const HOME_BUCKET = 'home-images';
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export const uploadPostImage = async (
  file: File,
  authorId: string,
): Promise<{ url: string; imageId: string }> => {
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('파일 크기는 50MB를 초과할 수 없습니다.');
  }

  const ext = file.name.split('.').pop() ?? 'bin';
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const storagePath = `${authorId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file);
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  const { data, error: dbError } = await supabase
    .from('post_images')
    .insert({
      post_id: null,
      author_id: authorId,
      storage_path: storagePath,
      url: publicUrl,
    })
    .select('id')
    .single();
  if (dbError) throw dbError;

  return { url: publicUrl, imageId: data.id as string };
};

export const linkImagesToPost = async (imageIds: string[], postId: string): Promise<void> => {
  if (imageIds.length === 0) return;
  const { error, count } = await supabase
    .from('post_images')
    .update({ post_id: postId }, { count: 'exact' })
    .in('id', imageIds);
  if (error) throw error;
  if (count === 0) throw new Error('post_images UPDATE 0행: RLS 정책을 확인하세요.');
};

// 홈 화면 팀 이미지 업로드
export const uploadTeamImage = async (file: File): Promise<{ url: string; storagePath: string }> => {
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('파일 크기는 50MB를 초과할 수 없습니다.');
  }

  const ext = file.name.split('.').pop() ?? 'bin';
  const storagePath = `team/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(HOME_BUCKET)
    .upload(storagePath, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from(HOME_BUCKET)
    .getPublicUrl(storagePath);

  return { url: publicUrl, storagePath };
};

// 홈 화면 팀 이미지 삭제 (교체/제거 시 기존 파일 정리)
// imageUrl에서 storagePath 추출: .../home-images/{path} → {path}
export const deleteTeamImage = async (imageUrl: string): Promise<void> => {
  const marker = `/${HOME_BUCKET}/`;
  const idx = imageUrl.indexOf(marker);
  if (idx === -1) return;
  const storagePath = imageUrl.slice(idx + marker.length);
  await supabase.storage.from(HOME_BUCKET).remove([storagePath]);
};

// 글 삭제 전 호출: Storage 파일 삭제 (DB는 CASCADE로 자동 처리)
export const deleteStorageImagesForPosts = async (postIds: string[]): Promise<void> => {
  if (postIds.length === 0) return;

  const { data, error } = await supabase
    .from('post_images')
    .select('storage_path')
    .in('post_id', postIds);

  if (error || !data || data.length === 0) return;

  const paths = data.map((row: { storage_path: string }) => row.storage_path);
  await supabase.storage.from(BUCKET).remove(paths);
};
