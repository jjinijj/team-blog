interface CommentItemProps {
  comment: Comment;
  isOwner: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (content: string) => Promise<void>;
  onDelete: () => Promise<void>;
}