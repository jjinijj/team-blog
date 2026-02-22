import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Post } from '../types/Post';
import { getRelativeTime } from '../utils/DataFormat';
import ProfileDropdown from '../component/Profiledropdown';
import { readPosts } from '../api/supabaseApi';

interface MainScreenProps {
  onGoToEditor: () => void;
  onViewPost: (postId: string) => void;
}

function MainScreen({ onGoToEditor, onViewPost }: MainScreenProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const navigate = useNavigate();
  const { user } = useAuth();

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

  const handleWriteClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      onGoToEditor();
    }
  };

  const stripHtml = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  const getSearchedPosts = () => {
    return posts.filter((post) => {
      const plainContent = stripHtml(post.content);
      return (
        post.title.includes(searchKeyword) ||
        plainContent.includes(searchKeyword)
      );
    });
  };

  const getSortedPosts = () => {
    const sorted = searchKeyword === '' ? [...posts] : getSearchedPosts();
    if (sortOrder === 'newest') {
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                <span className="text-lg">📝</span>
              </div>
              <h1 className="text-lg font-bold tracking-tight">TeamBlog</h1>
            </div>
          </div>

          <div className='h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1' />
          <ProfileDropdown />
        </div>
      </header>

      <main className="flex-1 max-w-[960px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Sort Area */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 group-focus-within:text-blue-500 transition-colors">🔍</span>
            </div>
            <input
              className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base placeholder:text-gray-400"
              placeholder="Search team posts..."
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          {/* Categories and Sort */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <div className="flex h-8 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-500 text-white px-4 cursor-pointer">
                <p className="text-sm font-medium">전체</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pb-2">
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 h-8 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-500 transition-all">
                  <span className="text-gray-900">{sortOrder === 'newest' ? '최신순' : '등록순'}</span>
                  <span className="text-xs">▼</span>
                </button>
                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                  <button
                    onClick={() => setSortOrder('newest')}
                    className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center justify-between transition-colors ${
                      sortOrder === 'newest' ? 'text-blue-500 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    최신순
                    {sortOrder === 'newest' && <span>✓</span>}
                  </button>
                  <button
                    onClick={() => setSortOrder('oldest')}
                    className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center justify-between transition-colors ${
                      sortOrder === 'oldest' ? 'text-blue-500 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    등록순
                    {sortOrder === 'oldest' && <span>✓</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* List View */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">최근 게시물</h2>
            <span className="text-xs font-medium text-gray-400">
              총 {getSortedPosts().length} 개
            </span>
          </div>

          {loading ? (
            <p className="text-center text-gray-400 text-base py-20">불러오는 중...</p>
          ) : getSortedPosts().length === 0 ? (
            <p className="text-center text-gray-400 text-base py-20">아직 글이 없습니다.</p>
          ) : (
            getSortedPosts().map((post, index) => (
              <div key={post.id}>
                <div
                  className="group relative flex items-start gap-6 p-4 rounded-xl hover:bg-white transition-all border border-transparent hover:border-gray-200 cursor-pointer"
                  onClick={() => onViewPost(post.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ backgroundColor: post.author_color ?? '#3b82f6' }}
                      >
                        {(post.author_name ?? post.author_email ?? 'U')[0].toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {post.author_name ?? post.author_email ?? 'Unknown'}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-500">{getRelativeTime(post.created_at)}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-tight group-hover:text-blue-500 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {stripHtml(post.content)}
                    </p>
                  </div>
                </div>
                {index < getSortedPosts().length - 1 && (
                  <div className="h-px bg-gray-200 my-2 mx-4" />
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={handleWriteClick}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-500 text-white rounded-full shadow-2xl hover:bg-blue-600 hover:scale-110 transition-all flex items-center justify-center z-40"
        title="새 글 작성"
      >
        <span className="text-2xl">✏️</span>
      </button>
    </div>
  );
}

export default MainScreen;