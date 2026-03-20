import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Post } from '../../types/Post';
import { getRelativeTime } from '../../utils/DataFormat';
import { ROUTES } from '../../types/routes';

// 관리자 설정으로 교체 예정
export const RECENT_POST_LIMIT = 10;

interface RecentViewProps {
  recentPosts: Post[];
  loading: boolean;
  onViewPost: (postId: string) => void;
}

function RecentView({ recentPosts, loading, onViewPost }: RecentViewProps) {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');

  const stripHtml = (html: string): string => {
    const withoutImages = html.replace(/!\[[^\]]*\]\([^)]*\)/g, '');
    const doc = new DOMParser().parseFromString(withoutImages, 'text/html');
    return doc.body.textContent || '';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = searchInput.trim();
    if (keyword) {
      navigate(`${ROUTES.POSTS}?all=true&q=${encodeURIComponent(keyword)}`);
    } else {
      navigate(`${ROUTES.POSTS}?all=true`);
    }
  };

  return (
    <>
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="mb-10">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400 group-focus-within:text-blue-500 transition-colors text-[20px]">search</span>
          </div>
          <input
            className="block w-full pl-12 pr-28 py-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base placeholder:text-slate-400"
            placeholder="제목 또는 내용 검색..."
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-3 my-1.5 flex items-center px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            검색
          </button>
        </div>
      </form>

      {/* Recent Posts Section */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">최근 게시물</h2>
        </div>

        {loading ? (
          <div className="flex flex-col animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i}>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-6 rounded-full bg-slate-200 shrink-0" />
                    <div className="h-3 w-20 bg-slate-200 rounded-full" />
                    <div className="h-3 w-16 bg-slate-200 rounded-full" />
                  </div>
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 bg-slate-200 rounded w-full" />
                    <div className="h-3.5 bg-slate-200 rounded w-5/6" />
                  </div>
                </div>
                {i < 4 && <div className="h-px bg-slate-200 dark:bg-slate-800 my-2 mx-4" />}
              </div>
            ))}
          </div>
        ) : recentPosts.length === 0 ? (
          <p className="text-center text-slate-400 text-base py-20">아직 글이 없습니다.</p>
        ) : (
          <>
            {recentPosts.map((post, index) => (
              <div key={post.id}>
                <div
                  className="group relative flex items-start gap-6 p-4 rounded-xl hover:bg-white dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800 cursor-pointer"
                  onClick={() => onViewPost(post.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="size-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ backgroundColor: post.author_color ?? '#3b82f6' }}
                      >
                        {(post.author_name ?? post.author_email ?? 'U')[0].toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {post.author_name ?? post.author_email ?? 'Unknown'}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs text-slate-500">{getRelativeTime(post.created_at)}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2 leading-tight group-hover:text-blue-500 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                      {stripHtml(post.content)}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        {Math.max(1, Math.ceil(post.content.length / 1000))} min read
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        {post.view_count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-3 py-1 shrink-0">
                    <button
                      className="text-slate-300 dark:text-slate-700 hover:text-slate-600 dark:hover:text-slate-400 transition-colors opacity-0 group-hover:opacity-100"
                      onClick={e => e.stopPropagation()}
                    >
                      <span className="material-symbols-outlined">bookmark</span>
                    </button>
                  </div>
                </div>
                {index < recentPosts.length - 1 && (
                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-2 mx-4" />
                )}
              </div>
            ))}

            {/* 더보기 버튼 */}
            <div className="mt-8 flex justify-center pb-8">
              <button
                onClick={() => navigate(`${ROUTES.POSTS}?all=true`)}
                className="flex items-center justify-center gap-3 px-10 h-12 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-md hover:shadow-lg"
              >
                <span>전체 글 보기</span>
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default RecentView;
