interface CommentListProps {
  comments: Comment[];
  currentUserId: string | null;
  editingCommentId: string | null;
  onEdit: (commentId: string) => void;
  onCancelEdit: () => void;
  onUpdate: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}