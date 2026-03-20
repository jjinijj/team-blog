import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Post } from '../types/Post';
import { getRelativeTime } from '../utils/DataFormat';
import SiteHeader from '../component/SiteHeader';
import { readPosts } from '../api/postApi';

// 관리자 페이지에서 설정 가능하도록 추후 변경 예정
const DEFAULT_PAGE_SIZE = 10;

interface MainScreenProps {
  onGoToEditor: () => void;
  onViewPost: (postId: string) => void;
}

function MainScreen({ onGoToEditor, onViewPost }: MainScreenProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'popular'>(
    () => (localStorage.getItem('blog_sort_order') as 'newest' | 'oldest' | 'popular') ?? 'newest'
  );
  const [visibleCount, setVisibleCount] = useState(DEFAULT_PAGE_SIZE);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    localStorage.setItem('blog_sort_order', sortOrder);
  }, [sortOrder]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await readPosts();
        setPosts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // 검색어 변경 시 visible count 초기화
  useEffect(() => {
    setVisibleCount(DEFAULT_PAGE_SIZE);
  }, [searchKeyword]);

  const handleWriteClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      onGoToEditor();
    }
  };

  const stripHtml = (html: string): string => {
    const withoutImages = html.replace(/!\[[^\]]*\]\([^)]*\)/g, '[이미지]');
    const doc = new DOMParser().parseFromString(withoutImages, 'text/html');
    return doc.body.textContent || '';
  };

  const pinnedPosts = posts.filter(p => p.is_pinned);

  const getSortedRegularPosts = () => {
    let filtered = posts.filter(p => !p.is_pinned);
    if (searchKeyword) {
      filtered = posts.filter(p => {
        const plainContent = stripHtml(p.content);
        return p.title.includes(searchKeyword) || plainContent.includes(searchKeyword);
      });
    }
    if (sortOrder === 'newest') {
      return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortOrder === 'oldest') {
      return filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      return filtered.sort((a, b) => b.view_count - a.view_count || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  };

  const sortedRegularPosts = getSortedRegularPosts();
  const displayedPosts = sortedRegularPosts.slice(0, visibleCount);
  const hasMore = sortedRegularPosts.length > visibleCount;
  const remainingCount = sortedRegularPosts.length - visibleCount;

  const sortLabel = sortOrder === 'newest' ? '최신순' : sortOrder === 'oldest' ? '등록순' : '인기순';

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <SiteHeader />

      <main className="flex-1 max-w-[960px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Sort Area */}
        <div className="flex flex-col gap-6 mb-10">
          {/* Search Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 group-focus-within:text-blue-500 transition-colors text-[20px]">search</span>
            </div>
            <input
              className="block w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base placeholder:text-slate-400"
              placeholder="제목 또는 내용 검색..."
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

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
                        onClick={() => { setSortOrder(order); setSortMenuOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center justify-between transition-colors ${
                          sortOrder === order
                            ? 'text-blue-500 bg-blue-50 dark:bg-blue-950/30'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {label}
                        {sortOrder === order && <span className="material-symbols-outlined text-[16px]">check</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pinned Posts Section */}
        {!searchKeyword && !loading && pinnedPosts.length > 0 && (
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

        {/* Recent Posts Section */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {searchKeyword ? '검색 결과' : '최근 게시물'}
            </h2>
            <span className="text-xs font-medium text-slate-400">
              {searchKeyword
                ? `${sortedRegularPosts.length}개 발견`
                : `총 ${sortedRegularPosts.length}개`}
            </span>
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
          ) : sortedRegularPosts.length === 0 ? (
            <p className="text-center text-slate-400 text-base py-20">
              {searchKeyword ? '검색 결과가 없습니다.' : '아직 글이 없습니다.'}
            </p>
          ) : (
            <>
              {displayedPosts.map((post, index) => (
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
                  {index < displayedPosts.length - 1 && (
                    <div className="h-px bg-slate-200 dark:bg-slate-800 my-2 mx-4" />
                  )}
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-8 flex justify-center pb-8">
                  <button
                    onClick={() => setVisibleCount(prev => prev + DEFAULT_PAGE_SIZE)}
                    className="flex items-center justify-center gap-3 px-10 h-12 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-md hover:shadow-lg"
                  >
                    <span>더보기 ({remainingCount}개 남음)</span>
                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
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
