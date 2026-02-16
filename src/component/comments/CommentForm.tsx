// src/components/comments/CommentForm.tsx
import { useState, FormEvent } from 'react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  initialValue?: string;
  placeholder?: string;
  submitButtonText?: string;
  userEmail?: string;  // 사용자 이메일 (아바타 표시용)
  showAvatar?: boolean;  // 아바타 표시 여부
}

export default function CommentForm({
  onSubmit,
  initialValue = '',
  placeholder = '댓글을 작성하세요...',
  submitButtonText = '등록',
  userEmail,
  showAvatar = true
}: CommentFormProps) {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 유효성 검사: 빈 댓글 방지
    if (content.trim().length === 0) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent(''); // 제출 후 입력창 비우기
    } catch (error) {
      // 에러는 부모 컴포넌트에서 처리
    } finally {
      setIsSubmitting(false);
    }
  };

  // 이메일에서 첫 글자 추출 (아바타용)
  const getInitial = (email?: string) => {
    return email ? email.charAt(0).toUpperCase() : '?';
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 mb-10">
      {/* 사용자 아바타 (선택적) */}
      {showAvatar && (
        <div className="size-10 bg-blue-600 rounded-full shrink-0 flex items-center justify-center text-white font-bold">
          {getInitial(userEmail)}
        </div>
      )}

      <div className="flex-1">
        {/* 댓글 입력창 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
          disabled={isSubmitting}
        />

        {/* 제출 버튼 */}
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={isSubmitting || content.trim().length === 0}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? '등록 중...' : submitButtonText}
          </button>
        </div>
      </div>
    </form>
  );
}