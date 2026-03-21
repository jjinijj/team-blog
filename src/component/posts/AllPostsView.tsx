import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Post } from '../../types/Post';
import { getRelativeTime } from '../../utils/DataFormat';
import { searchPosts } from '../../api/postApi';
import { getPostsPerPage } from '../../api/siteConfigApi';
import { ROUTES } from '../../types/routes';

interface AllPostsViewProps {
  onViewPost: (postId: string) => void;
}

function AllPostsView({ onViewPost }: AllPostsViewProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get('q') ?? '';
  const sort = (searchParams.get('sort') as 'newest' | 'oldest' | 'popular') ?? 'newest';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const tagSlug = searchParams.get('tag') ?? '';

  const [searchInput, setSearchInput] = useState(keyword);
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [pageSize, setPageSize] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / (pageSize || 1)));

  useEffect(() => {
    getPostsPerPage().then(setPageSize).catch(() => setPageSize(10));
  }, []);

  useEffect(() => {
    setSearchInput(keyword);
  }, [keyword]);

  useEffect(() => {
    if (pageSize === 0) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const result = await searchPosts({
          keyword: keyword || undefined,
          sort,
          page,
          pageSize,
          tagSlug: tagSlug || undefined,
        });
        setPosts(result.data);
        setTotal(result.total);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [keyword, sort, page, pageSize, tagSlug]);

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    next.set('all', 'true');
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    updateParams({ q: q || null, page: '1' });
  };

  const handleSortChange = (newSort: 'newest' | 'oldest' | 'popular') => {
    updateParams({ sort: newSort, page: '1' });
    setSortMenuOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: String(newPage) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stripHtml = (html: string): string => {
    const withoutImages = html.replace(/!\[[^\]]*\]\([^)]*\)/g, '');
    const doc = new DOMParser().parseFromString(withoutImages, 'text/html');
    return doc.body.textContent || '';
  };

  const sortLabel = sort === 'newest' ? '최신순' : sort === 'oldest' ? '등록순' : '인기순';

  return (
    <>
      {/* Search & Sort */}
      <div className="flex flex-col gap-6 mb-10">
        <form onSubmit={handleSearchSubmit}>
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

        {/* Sort */}
        <div className="flex items-center justify-end">
          <div className="relative pb-2">
            <button
              onClick={() => setSortMenuOpen(prev => !prev)}
              onBlur={() => setTimeout(() => setSortMenuOpen(false), 150)}
              className="flex items-center gap-2 px-3 h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-blue-500 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">sort</span>
              <span>정렬: <span className="text-slate-900 dark:text-slate-100">{sortLabel}</span></span>
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
            {sortMenuOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-50">
                {(['newest', 'oldest', 'popular'] as const).map(order => {
                  const label = order === 'newest' ? '최신순' : order === 'oldest' ? '등록순' : '인기순';
                  return (
                    <button
                      key={order}
                      onClick={() => handleSortChange(order)}
                      className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center justify-between transition-colors ${
                        sort === order
                          ? 'text-blue-500 bg-blue-50 dark:bg-blue-950/30'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {label}
                      {sort === order && <span className="material-symbols-outlined text-[16px]">check</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {tagSlug ? `#${tagSlug}` : keyword ? '검색 결과' : '전체 게시물'}
            </h2>
            {tagSlug && (
              <button
                onClick={() => updateParams({ tag: null, page: '1' })}
                className="flex items-center gap-0.5 text-xs text-blue-500 hover:text-blue-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>
          {!loading && (
            <span className="text-xs font-medium text-slate-400">
              {keyword || tagSlug ? `${total}개 발견` : `총 ${total}개`}
            </span>
          )}
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
        ) : posts.length === 0 ? (
          <p className="text-center text-slate-400 text-base py-20">
            {keyword ? '검색 결과가 없습니다.' : '아직 글이 없습니다.'}
          </p>
        ) : (
          <>
            {posts.map((post, index) => (
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
                {index < posts.length - 1 && (
                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-2 mx-4" />
                )}
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-1 pb-8">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="flex items-center justify-center size-9 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-500"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                  const isEllipsis =
                    totalPages > 7 &&
                    p !== 1 &&
                    p !== totalPages &&
                    (p < page - 2 || p > page + 2);
                  const isPrevEllipsis = isEllipsis && p === page - 3;
                  const isNextEllipsis = isEllipsis && p === page + 3;

                  if (isEllipsis && !isPrevEllipsis && !isNextEllipsis) return null;
                  if (isPrevEllipsis || isNextEllipsis) {
                    return (
                      <span key={p} className="flex items-center justify-center size-9 text-slate-400 text-sm">
                        …
                      </span>
                    );
                  }

                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`flex items-center justify-center size-9 rounded-lg text-sm font-medium transition-all ${
                        p === page
                          ? 'bg-blue-500 text-white border border-blue-500'
                          : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-500'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="flex items-center justify-center size-9 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-500"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 최근 글 보기 버튼 */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => navigate(ROUTES.POSTS)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-500 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          최근 글 보기
        </button>
      </div>
    </>
  );
}

export default AllPostsView;
