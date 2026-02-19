// src/components/comments/CommentList.tsx
import type { Comment } from '../../types/Comment';
import CommentItem from './CommentItem';

interface CommentListProps {
  comments: Comment[];
  currentUserId: string | null;
  editingCommentId: string | null;
  onEdit: (commentId: string) => void;
  onCancelEdit: () => void;
  onUpdate: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

export default function CommentList({
  comments,
  currentUserId,
  editingCommentId,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete
}: CommentListProps) {
  // 빈 상태 처리
  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-sm">
          첫 댓글을 작성해보세요! 💬
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          isOwner={currentUserId === comment.author_id}
          isEditing={editingCommentId === comment.id}
          onEdit={() => onEdit(comment.id)}
          onCancelEdit={onCancelEdit}
          onUpdate={(content) => onUpdate(comment.id, content)}
          onDelete={() => onDelete(comment.id)}
        />
      ))}
    </div>
  );
}