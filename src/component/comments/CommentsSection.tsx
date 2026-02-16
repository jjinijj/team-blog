// src/components/comments/CommentsSection.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as commentApi from '../../api/CommentApi';
import type { Comment } from '../../types/Comment';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

interface CommentsSectionProps {
  postId: string;
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  // 댓글 목록 불러오기
  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const data = await commentApi.fetchComments(postId);
      setComments(data);
    } catch (error) {
      alert('댓글을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 댓글 작성
  const handleCreate = async (content: string) => {
    if (!user) return;

    try {
      const newComment = await commentApi.createComment(postId, user.id, content);
      setComments([newComment, ...comments]);
    } catch (error) {
      alert('댓글 작성에 실패했습니다.');
    }
  };

  // 댓글 수정
  const handleUpdate = async (commentId: string, content: string) => {
    try {
      const updatedComment = await commentApi.updateComment(commentId, content);
      setComments(comments.map(c =>
        c.id === commentId ? updatedComment : c
      ));
      setEditingCommentId(null);
    } catch (error) {
      alert('댓글 수정에 실패했습니다.');
    }
  };

  // 댓글 삭제
  const handleDelete = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await commentApi.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="mt-8 border-t pt-8">
      {/* 헤더 */}
      <h2 className="text-2xl font-bold mb-4">
        💬 댓글 ({comments.length})
      </h2>

      {/* 댓글 작성 폼 (로그인한 사용자만) */}
      {user && (
        <CommentForm
          onSubmit={handleCreate}
          placeholder="댓글을 작성하세요..."
          submitButtonText="등록"
          userEmail={user.email}
          showAvatar={true}
        />
      )}

      {/* 댓글 목록 */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">댓글을 불러오는 중...</p>
        </div>
      ) : (
        <CommentList
          comments={comments}
          currentUserId={user?.id || null}
          editingCommentId={editingCommentId}
          onEdit={setEditingCommentId}
          onCancelEdit={() => setEditingCommentId(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}