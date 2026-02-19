import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Post } from '../../types/Post';
import { readMyPosts, deletePost } from '../../api/supabaseApi';
import { getAbsoluteTime } from '../../utils/DataFormat';

type FilterStatus = 'all' | 'published' | 'draft' | 'private';

const STATUS_TABS: { value: FilterStatus; label: string; icon: string }[] = [
  { value: 'all',       label: '전체',   icon: 'format_list_bulleted' },
  { value: 'published', label: '공개',   icon: 'check_circle' },
  { value: 'draft',     label: '초안',   icon: 'draft' },
  { value: 'private',   label: '비공개', icon: 'lock' },
];

const StatusBadge = ({ status }: { status: Post['status'] }) => {
  if (status === 'published') return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      공개
    </span>
  );
  if (status === 'draft') return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      초안
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      비공개
    </span>
  );
};

const PostActionMenu = ({
  post,
  onEdit,
  onDelete,
}: {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 transition-colors"
      >
        <span className="material-symbols-outlined">more_vert</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-50">
          <button
            onClick={() => { setOpen(false); onEdit(post); }}
            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            수정
          </button>
          <button
            onClick={() => { setOpen(false); onDelete(post.id); }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            삭제
          </button>
        </div>
      )}
    </div>
  );
};

interface MyPostsScreenProps {
  onGoToMain: () => void;
  onEditPost: (post: Post) => void;
}

export const MyPostsScreen = ({ onGoToMain, onEditPost }: MyPostsScreenProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await readMyPosts(user.id);
        setPosts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const handleDelete = async (postId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (e) {
      console.error(e);
      alert('삭제에 실패했습니다.');
    }
  };

  const filtered = filter === 'all' ? posts : posts.filter((p) => p.status === filter);

  const counts: Record<FilterStatus, number> = {
    all:       posts.length,
    published: posts.filter((p) => p.status === 'published').length,
    draft:     posts.filter((p) => p.status === 'draft').length,
    private:   posts.filter((p) => p.status === 'private').length,
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={onGoToMain}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <span className="material-symbols-outlined text-xl">terminal</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight">TeamBlog</h2>
          </div>
        </div>
        <button
          onClick={() => navigate('/editor')}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-all"
        >
          <span className="material-symbols-outlined text-sm">edit</span>
          새 글 작성
        </button>
      </header>

      <main className="flex flex-1 flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 lg:w-64 lg:border-b-0 lg:border-r lg:px-6 lg:py-6">
          <div className="mb-6 hidden lg:block">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">내 글 관리</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">작성한 글을 관리하세요</p>
          </div>
          <nav className="flex flex-row gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {STATUS_TABS.map((tab) => {
              const isActive = filter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-blue-600 font-semibold border-l-2 border-primary bg-primary/5'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 border-l-2 border-transparent'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-primary' : ''}`}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  <span className={`ml-auto hidden text-xs font-medium lg:inline ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                    {counts[tab.value]}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <section className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">내 글</h2>
              <p className="text-sm text-slate-500">{counts[filter]}개의 글</p>
            </div>

            {/* Post List */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {/* Table Header */}
              <div className="hidden grid-cols-12 border-b border-slate-200 bg-slate-50/50 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 md:grid">
                <div className="col-span-7">제목</div>
                <div className="col-span-2">상태</div>
                <div className="col-span-3 text-right">작성일</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <div className="px-6 py-16 text-center text-sm text-slate-400">불러오는 중...</div>
                ) : filtered.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">article</span>
                    <p className="text-sm text-slate-400">글이 없어요</p>
                  </div>
                ) : (
                  filtered.map((post) => (
                    <div
                      key={post.id}
                      className="group grid grid-cols-1 gap-4 px-6 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 md:grid-cols-12 md:items-center md:gap-0"
                    >
                      {/* 제목 */}
                      <div className="col-span-7 flex items-start gap-4">
                        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                          <span className="material-symbols-outlined text-slate-400">article</span>
                        </div>
                        <div>
                          <button
                            onClick={() => navigate(`/post/${post.id}`)}
                            className="text-base font-semibold text-slate-900 group-hover:text-primary dark:text-slate-100 transition-colors text-left"
                          >
                            {post.title}
                          </button>
                          {post.status === 'draft' && (
                            <p className="mt-1 text-xs text-slate-400 italic">작성 중...</p>
                          )}
                        </div>
                      </div>

                      {/* 상태 */}
                      <div className="col-span-2">
                        <StatusBadge status={post.status} />
                      </div>

                      {/* 날짜 + 액션 */}
                      <div className="col-span-3 flex items-center justify-between md:justify-end">
                        <span className="text-sm text-slate-500">{getAbsoluteTime(post.created_at)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MyPostsScreen;