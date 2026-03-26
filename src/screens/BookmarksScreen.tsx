import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Post } from '../types/Post';
import { fetchBookmarkedPosts } from '../api/bookmarkApi';
import { getAbsoluteTime } from '../utils/DataFormat';
import { ROUTES } from '../types/routes';
import LogoMark from '../component/LogoMark';
import ProfileDropdown from '../component/Profiledropdown';
import SiteFooter from '../component/SiteFooter';
import { getSiteName, getCachedSiteName } from '../api/siteConfigApi';

const BookmarksScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteName, setSiteName] = useState(getCachedSiteName());

  useEffect(() => {
    getSiteName().then(setSiteName).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchBookmarkedPosts()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

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
          <ProfileDropdown />
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px] text-blue-500">bookmark</span>
            북마크
          </h1>
          {!loading && (
            <p className="mt-1 text-sm text-slate-500">
              {posts.length > 0 ? `${posts.length}개의 글을 저장했습니다.` : '저장한 글이 없습니다.'}
            </p>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-slate-100 p-5 space-y-3">
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-3.5 bg-slate-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <span className="material-symbols-outlined text-[48px]">bookmark_border</span>
            <p className="text-sm">북마크한 글이 없습니다.</p>
            <button
              onClick={() => navigate(ROUTES.POSTS)}
              className="mt-2 text-sm text-blue-500 hover:underline"
            >
              글 목록 보러 가기
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.id}>
                <button
                  onClick={() => navigate(ROUTES.POST_DETAIL(post.id))}
                  className="w-full text-left rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-colors p-5 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                        {post.title}
                      </h2>
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
                        <span>{post.author_name ?? post.author_email ?? 'Unknown'}</span>
                        <span>·</span>
                        <span>{getAbsoluteTime(post.created_at)}</span>
                      </div>
                      {post.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {post.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="material-symbols-outlined text-[20px] text-blue-400 shrink-0 mt-0.5">
                      bookmark_added
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default BookmarksScreen;
