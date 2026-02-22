// src/components/comments/CommentItem.tsx
import type { Comment } from '../../types/Comment';

interface CommentItemProps {
  comment: Comment;
  isOwner: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (content: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function CommentItem({
  comment,
  isOwner,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete
}: CommentItemProps) {
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}개월 전`;
    return `${Math.floor(diffInSeconds / 31536000)}년 전`;
  };

  const displayName = comment.author_name ?? comment.author_email ?? '?';
  const avatarColor = comment.author_color ?? '#3b82f6';
  const initial = displayName[0].toUpperCase();

  // 수정 모드
  if (isEditing) {
    return (
      <div className="flex gap-4">
        <div
          className="size-10 rounded-full shrink-0 flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: avatarColor }}
        >
          {initial}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold">{displayName}</span>
            <span className="text-xs text-slate-500">{getRelativeTime(comment.created_at)}</span>
          </div>

          <textarea
            defaultValue={comment.content}
            id={`edit-${comment.id}`}
            rows={3}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none mb-2"
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={onCancelEdit}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => {
                const textarea = document.getElementById(`edit-${comment.id}`) as HTMLTextAreaElement;
                const content = textarea?.value.trim();
                if (content) {
                  onUpdate(content);
                } else {
                  alert('댓글 내용을 입력해주세요.');
                }
              }}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-600/90 transition-colors"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 일반 모드
  return (
    <div className="flex gap-4">
      <div
        className="size-10 rounded-full shrink-0 flex items-center justify-center text-white font-bold"
        style={{ backgroundColor: avatarColor }}
      >
        {initial}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold">{displayName}</span>
          <span className="text-xs text-slate-500">{getRelativeTime(comment.created_at)}</span>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
          {comment.content}
        </p>

        {isOwner && (
          <div className="flex items-center gap-4">
            <button
              onClick={onEdit}
              className="text-xs font-bold text-slate-500 hover:text-blue-600 uppercase tracking-wider transition-colors"
            >
              수정
            </button>
            <button
              onClick={onDelete}
              className="text-xs font-bold text-slate-500 hover:text-red-600 uppercase tracking-wider transition-colors"
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}