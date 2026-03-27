import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Comment } from '../types/Comment';
import { fetchMyComments, deleteComment } from '../api/CommentApi';
import { getRelativeTime } from '../utils/DataFormat';
import { ROUTES } from '../types/routes';
import LogoMark from '../component/LogoMark';
import ProfileDropdown from '../component/Profiledropdown';
import NotificationBell from '../component/NotificationBell';
import { getSiteName, getCachedSiteName } from '../api/siteConfigApi';

const MyCommentsScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [siteName, setSiteName] = useState(getCachedSiteName());

  useEffect(() => {
    getSiteName().then(setSiteName).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchMyComments(user.id)
      .then(setComments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    setDeletingId(commentId);
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (e) {
      console.error(e);
      alert('삭제에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 lg:px-20">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(ROUTES.POSTS)}
            className="flex items-center gap-3"
          >
            <LogoMark size="md" />
            <span className="text-base font-bold text-slate-800">{siteName}</span>
          </button>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px] text-blue-500">chat</span>
            내 댓글
          </h1>
          {!loading && (
            <p className="mt-1 text-sm text-slate-500">
              {comments.length > 0
                ? `${comments.length}개의 댓글을 작성했습니다.`
                : '작성한 댓글이 없습니다.'}
            </p>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-slate-100 p-5 space-y-3">
                <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-3.5 bg-slate-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <span className="material-symbols-outlined text-[48px]">chat_bubble_outline</span>
            <p className="text-sm">작성한 댓글이 없습니다.</p>
            <button
              onClick={() => navigate(ROUTES.POSTS)}
              className="mt-2 text-sm text-blue-500 hover:underline"
            >
              글 목록 보러 가기
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {comments.map((comment) => (
              <li key={comment.id}>
                <div className="rounded-xl border border-slate-100 hover:border-slate-200 transition-colors p-5">
                  {/* 글 제목 */}
                  <button
                    onClick={() => navigate(ROUTES.POST_DETAIL(comment.post_id))}
                    className="text-xs font-medium text-blue-500 hover:underline mb-2 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">article</span>
                    {comment.post_title ?? '(제목 없음)'}
                  </button>

                  {/* 댓글 내용 */}
                  <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>

                  {/* 날짜 + 삭제 */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {getRelativeTime(comment.created_at)}
                    </span>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {deletingId === comment.id ? '삭제 중...' : '삭제'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default MyCommentsScreen;
