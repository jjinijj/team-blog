import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LogoMark from '../../component/LogoMark';
import ProfileDropdown from '../../component/Profiledropdown';
import NotificationBell from '../../component/NotificationBell';
import { getSiteName, getCachedSiteName } from '../../api/siteConfigApi';
import { Post } from '../../types/Post';
import { readMyPosts, deletePost, deleteMultiplePosts } from '../../api/postApi';
import { getAbsoluteTime } from '../../utils/DataFormat';
import { ROUTES } from '../../types/routes';

type FilterStatus = 'all' | 'published' | 'draft' | 'private';
type SortOrder = 'newest' | 'oldest';

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

// 정렬 드롭다운
const SortDropdown = ({
  sortOrder,
  onChange,
}: {
  sortOrder: SortOrder;
  onChange: (v: SortOrder) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const LABELS: Record<SortOrder, string> = { newest: '최신순', oldest: '오래된순' };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 h-9 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
      >
        <span className="material-symbols-outlined text-slate-400 text-lg">filter_alt</span>
        {LABELS[sortOrder]}
        <span className="material-symbols-outlined text-xs">expand_more</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-50">
          {(['newest', 'oldest'] as SortOrder[]).map((v) => (
            <button
              key={v}
              onClick={() => { onChange(v); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                sortOrder === v
                  ? 'text-blue-600 bg-blue-50 font-semibold dark:bg-blue-900/20'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {LABELS[v]}
              {sortOrder === v && <span className="material-symbols-outlined text-sm text-blue-600">check</span>}
            </button>
          ))}
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

  const [siteName, setSiteNameState] = useState<string | null>(getCachedSiteName());
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    getSiteName().then(setSiteNameState).catch(() => {});
  }, []);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // 선택 모드
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  // 필터 + 정렬 적용
  const getFilteredSorted = () => {
    let result = filter === 'all' ? [...posts] : posts.filter((p) => p.status === filter);
    result.sort((a, b) => {
      const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return sortOrder === 'newest' ? diff : -diff;
    });
    return result;
  };

  const filtered = getFilteredSorted();

  const counts: Record<FilterStatus, number> = {
    all:       posts.length,
    published: posts.filter((p) => p.status === 'published').length,
    draft:     posts.filter((p) => p.status === 'draft').length,
    private:   posts.filter((p) => p.status === 'private').length,
  };

  // 체크박스 핸들러
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isAllSelected = filtered.length > 0 && filtered.every((p) => selectedIds.has(p.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  };

  // 선택 모드 진입/해제
  const enterSelectMode = () => setIsSelectMode(true);
  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
  };

  // 단건 삭제
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

  // 다중 삭제
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`선택한 ${selectedIds.size}개의 글을 삭제하시겠습니까?`)) return;
    try {
      await deleteMultiplePosts([...selectedIds]);
      setPosts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      exitSelectMode();
    } catch (e) {
      console.error(e);
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 lg:px-20">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          <button onClick={onGoToMain} className="flex items-center gap-3">
            <LogoMark size="md" />
            {siteName && <span className="text-base font-bold text-slate-800">{siteName}</span>}
          </button>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <ProfileDropdown />
          </div>
        </div>
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
                  onClick={() => { setFilter(tab.value); exitSelectMode(); }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-blue-600 font-semibold border-l-2 border-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 border-l-2 border-transparent'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-blue-600' : ''}`}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  <span className={`ml-auto hidden text-xs font-medium lg:inline ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
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
            {/* 상단 타이틀 + 컨트롤 */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">내 글</h2>
                <p className="text-sm text-slate-500">{counts[filter]}개의 글</p>
              </div>
              <div className="flex items-center gap-3">
                <SortDropdown sortOrder={sortOrder} onChange={setSortOrder} />
                {isSelectMode ? (
                  <button
                    onClick={exitSelectMode}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 h-9 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                    취소
                  </button>
                ) : (
                  <button
                    onClick={enterSelectMode}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 h-9 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  >
                    <span className="material-symbols-outlined text-sm">check_box</span>
                    선택
                  </button>
                )}
              </div>
            </div>

            {/* Post List */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

              {/* Bulk Action Bar - 선택 모드일 때 표시 */}
              {isSelectMode && (
                <div className="flex items-center justify-between border-b border-slate-200 bg-blue-50 px-6 py-3 dark:border-slate-800 dark:bg-blue-900/20">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedIds.size}개 선택됨
                    </span>
                  </div>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.size === 0}
                    className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    선택 삭제
                  </button>
                </div>
              )}

              {/* Table Header */}
              <div className={`hidden border-b border-slate-200 bg-slate-50/50 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 md:grid ${isSelectMode ? 'grid-cols-12' : 'grid-cols-12'}`}>
                {isSelectMode && <div className="col-span-1" />}
                <div className={isSelectMode ? 'col-span-6' : 'col-span-7'}>제목</div>
                <div className="col-span-2">상태</div>
                <div className={`${isSelectMode ? 'col-span-3' : 'col-span-3'} text-right`}>작성일</div>
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
                      className={`group grid grid-cols-1 gap-4 px-6 py-4 transition-colors md:grid-cols-12 md:items-center md:gap-0 ${
                        selectedIds.has(post.id)
                          ? 'bg-blue-50 dark:bg-blue-900/10'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {/* 체크박스 - 선택 모드일 때만 */}
                      {isSelectMode && (
                        <div className="col-span-1 flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(post.id)}
                            onChange={() => toggleSelect(post.id)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                          />
                        </div>
                      )}

                      {/* 제목 */}
                      <div className={`${isSelectMode ? 'col-span-6' : 'col-span-7'} flex items-start gap-4`}>
                        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                          <span className="material-symbols-outlined text-slate-400">article</span>
                        </div>
                        <div>
                          <button
                            onClick={() => !isSelectMode && navigate(ROUTES.POST_DETAIL(post.id))}
                            className={`text-base font-semibold text-slate-900 dark:text-slate-100 transition-colors text-left ${
                              isSelectMode ? 'cursor-default' : 'group-hover:text-blue-600 cursor-pointer'
                            }`}
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

                      {/* 날짜 */}
                      <div className="col-span-3 flex items-center justify-between md:justify-end gap-3">
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