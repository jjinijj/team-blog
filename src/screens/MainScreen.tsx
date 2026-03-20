import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Post } from '../types/Post';
import SiteHeader from '../component/SiteHeader';
import { readPinnedPosts, readRecentPosts } from '../api/postApi';
import RecentView, { RECENT_POST_LIMIT } from '../component/posts/RecentView';
import AllPostsView from '../component/posts/AllPostsView';

interface MainScreenProps {
  onGoToEditor: () => void;
  onViewPost: (postId: string) => void;
}

function MainScreen({ onGoToEditor, onViewPost }: MainScreenProps) {
  const [pinnedPosts, setPinnedPosts] = useState<Post[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const isAllView = searchParams.get('all') === 'true';

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [pinned, recent] = await Promise.all([
          readPinnedPosts(),
          readRecentPosts(RECENT_POST_LIMIT),
        ]);
        setPinnedPosts(pinned);
        setRecentPosts(recent);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleWriteClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      onGoToEditor();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <SiteHeader />

      <main className="flex-1 max-w-[960px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Pinned Posts Section — 항상 표시 (로딩 완료 후, 핀 글 있을 때) */}
        {!loading && pinnedPosts.length > 0 && (
          <div className="flex flex-col mb-12">
            <div className="flex items-center gap-2 mb-4 px-1">
              <span className="material-symbols-outlined text-blue-500 text-[20px]">keep</span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">고정 게시물</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pinnedPosts.map(post => (
                <div
                  key={post.id}
                  onClick={() => onViewPost(post.id)}
                  className="group relative flex flex-col p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-blue-200 dark:border-blue-900/40 hover:border-blue-500 transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="size-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                        style={{ backgroundColor: post.author_color ?? '#3b82f6' }}
                      >
                        {(post.author_name ?? post.author_email ?? 'U')[0].toUpperCase()}
                      </div>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                        {post.author_name ?? post.author_email ?? 'Unknown'}
                      </span>
                    </div>
                    <span
                      className="material-symbols-outlined text-blue-500 text-[16px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >keep</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight group-hover:text-blue-500 transition-colors">
                    {post.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RecentView or AllPostsView */}
        {isAllView ? (
          <AllPostsView onViewPost={onViewPost} />
        ) : (
          <RecentView
            recentPosts={recentPosts}
            loading={loading}
            onViewPost={onViewPost}
          />
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={handleWriteClick}
        className="fixed bottom-8 right-8 flex items-center justify-center gap-2 px-5 h-12 bg-blue-500 text-white rounded-full shadow-2xl hover:bg-blue-600 hover:scale-105 transition-all z-40 text-sm font-semibold"
        title="새 글 작성"
      >
        <span className="material-symbols-outlined text-[20px]">edit</span>
        <span>글쓰기</span>
      </button>
    </div>
  );
}

export default MainScreen;
