import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../../types/Post';
import { ROUTES } from '../../types/routes';
import {
  readAllPostsForAdmin,
  deletePost,
  deleteMultiplePosts,
  togglePinPost,
} from '../../api/postApi';
import { getMaxPinnedPosts, setMaxPinnedPosts } from '../../api/siteConfigApi';
import { getAbsoluteTime } from '../../utils/DataFormat';

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  published: { label: 'Published', className: 'bg-green-100 text-green-700' },
  draft:     { label: 'Draft',     className: 'bg-slate-100 text-slate-700' },
  private:   { label: 'Private',   className: 'bg-amber-100 text-amber-700' },
};

const PostManagePage: React.FC = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<Post[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [maxPinned, setMaxPinned] = useState(3);
  const [maxPinnedInput, setMaxPinnedInput] = useState(3);
  const [savingMax, setSavingMax] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [data, max] = await Promise.all([
        readAllPostsForAdmin(),
        getMaxPinnedPosts(),
      ]);
      setPosts(data);
      setMaxPinned(max);
      setMaxPinnedInput(max);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const pinnedPosts = posts.filter(p => p.is_pinned);

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    (post.author_email ?? '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
    (post.author_name ?? '').toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const pagedPosts = filteredPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleTogglePin = async (post: Post) => {
    const willPin = !post.is_pinned;
    if (willPin && pinnedPosts.length >= maxPinned) {
      setError(`최대 ${maxPinned}개까지만 고정할 수 있습니다.`);
      return;
    }
    // 낙관적 업데이트
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_pinned: willPin } : p));
    try {
      await togglePinPost(post.id, willPin);
    } catch (err) {
      // 실패 시 원상복구
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_pinned: post.is_pinned } : p));
      setError('고정 상태 변경에 실패했습니다.');
    }
  };

  const handleSaveMaxPinned = async () => {
    if (maxPinnedInput < 1) {
      setError('최소 1개 이상이어야 합니다.');
      return;
    }
    setSavingMax(true);
    try {
      // 새 max보다 고정글이 많으면 하위 순서부터 해제
      if (pinnedPosts.length > maxPinnedInput) {
        const toUnpin = pinnedPosts.slice(maxPinnedInput);
        await Promise.all(toUnpin.map(p => togglePinPost(p.id, false)));
        setPosts(prev => prev.map(p =>
          toUnpin.some(u => u.id === p.id) ? { ...p, is_pinned: false } : p
        ));
      }
      await setMaxPinnedPosts(maxPinnedInput);
      setMaxPinned(maxPinnedInput);
      setSuccess('최대 고정 개수가 저장되었습니다.');
    } catch (err) {
      setError('저장에 실패했습니다.');
    } finally {
      setSavingMax(false);
    }
  };

  const handleSelectPost = (post: Post) => {
    const isSelected = selectedPosts.find(p => p.id === post.id);
    if (isSelected) {
      setSelectedPosts(selectedPosts.filter(p => p.id !== post.id));
    } else {
      setSelectedPosts([...selectedPosts, post]);
    }
  };

  const handleToggleAllPosts = () => {
    if (selectedPosts.length === filteredPosts.length && filteredPosts.length > 0) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts([...filteredPosts]);
    }
  };

  const handleDeletePost = async (postId: string, title: string) => {
    if (!window.confirm(`정말 "${title}" 글을 삭제하시겠습니까?`)) return;
    try {
      await deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      setSuccess(`"${title}" 삭제 완료!`);
    } catch (err) {
      setError('게시글 삭제에 실패했습니다.');
    }
  };

  const handleDeleteSelectedPosts = async () => {
    if (selectedPosts.length === 0) {
      setError('삭제할 게시글을 선택해주세요.');
      return;
    }
    if (!window.confirm(`선택한 ${selectedPosts.length}개의 게시글을 삭제하시겠습니까?`)) return;
    try {
      const postIds = selectedPosts.map(p => p.id);
      await deleteMultiplePosts(postIds);
      setPosts(prev => prev.filter(p => !postIds.includes(p.id)));
      setSuccess(`${selectedPosts.length}개의 게시글 삭제 완료!`);
      setSelectedPosts([]);
      setIsSelectMode(false);
    } catch (err) {
      setError('게시글 삭제에 실패했습니다.');
    }
  };

  return (
    <>
      {/* 페이지 헤더 */}
      <header className="p-8 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-slate-900 text-3xl font-black tracking-tight">Blog Posts</h2>
            <p className="text-slate-500 text-sm">Manage, edit and publish articles for the team blog.</p>
          </div>
          <div className="flex gap-2">
            {!isSelectMode ? (
              <button
                onClick={() => setIsSelectMode(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_box</span>
                <span>선택</span>
              </button>
            ) : (
              <button
                onClick={() => { setIsSelectMode(false); setSelectedPosts([]); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                <span>취소</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 알림 메시지 */}
      {error && (
        <div className="mx-8 mb-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
          </div>
        </div>
      )}
      {success && (
        <div className="mx-8 mb-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="text-sm">{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-700 hover:text-green-900">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
          </div>
        </div>
      )}

      {/* 고정 포스트 관리 섹션 */}
      <section className="px-8 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-slate-900 text-lg font-bold">Pinned Posts Management</h3>
                <p className="text-slate-500 text-xs">Featured content displayed at the top of the blog.</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="max-pins">
                  Max Pinned Posts:
                </label>
                <input
                  id="max-pins"
                  type="number"
                  min={1}
                  value={maxPinnedInput}
                  onChange={e => setMaxPinnedInput(Number(e.target.value))}
                  className="w-16 h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
                <button
                  onClick={handleSaveMaxPinned}
                  disabled={savingMax || maxPinnedInput === maxPinned}
                  className={`h-9 px-4 text-sm font-bold rounded-lg transition-colors ${
                    savingMax || maxPinnedInput === maxPinned
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {savingMax ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>

            {/* 핀 슬롯 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: maxPinned }).map((_, i) => {
                const post = pinnedPosts[i];
                return post ? (
                  <div key={post.id} className="flex items-center justify-between gap-4 p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-semibold text-slate-900 truncate">{post.title}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                        {post.author_name ?? post.author_email ?? '알 수 없음'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleTogglePin(post)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"
                      title="Unpin Post"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>keep_off</span>
                    </button>
                  </div>
                ) : (
                  <div key={`empty-${i}`} className="flex items-center justify-center p-3 rounded-lg border border-dashed border-slate-300">
                    <span className="text-xs text-slate-400 font-medium italic">Empty Slot</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 검색바 */}
      <section className="px-8 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '20px' }}>search</span>
          </div>
          <input
            type="text"
            value={searchKeyword}
            onChange={e => { setSearchKeyword(e.target.value); setCurrentPage(1); }}
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary outline-none text-sm shadow-sm"
            placeholder="Search posts by title or author..."
          />
        </div>
      </section>

      {/* 게시글 테이블 */}
      <section className="px-8 pb-12">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-bottom border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Title</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Author</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  {isSelectMode ? (
                    <th className="px-6 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                        onChange={handleToggleAllPosts}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600 cursor-pointer"
                      />
                    </th>
                  ) : (
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        <p className="text-slate-500 text-sm">게시글 목록 불러오는 중...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      {searchKeyword ? '검색 결과가 없습니다.' : '등록된 게시글이 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  pagedPosts.map(post => {
                    const badge = STATUS_BADGE[post.status] ?? { label: post.status, className: 'bg-slate-100 text-slate-700' };
                    return (
                      <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {post.is_pinned && (
                              <span
                                className="material-symbols-outlined text-primary"
                                style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}
                              >
                                push_pin
                              </span>
                            )}
                            <span className="text-sm font-semibold text-slate-900">{post.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {post.author_name ?? post.author_email ?? '알 수 없음'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {post.status === 'draft' ? '—' : getAbsoluteTime(post.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        {isSelectMode ? (
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedPosts.some(p => p.id === post.id)}
                              onChange={() => handleSelectPost(post)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600 cursor-pointer"
                            />
                          </td>
                        ) : (
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() =>
                                  post.status === 'private'
                                    ? setError('비공개 글은 관리자도 열람할 수 없습니다.')
                                    : navigate(ROUTES.POST_DETAIL(post.id))
                                }
                                className="p-2 text-slate-400 hover:text-primary transition-colors"
                                title={post.status === 'private' ? '비공개 글' : 'View'}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                  {post.status === 'private' ? 'visibility_off' : 'visibility'}
                                </span>
                              </button>
                              <button
                                onClick={() => handleTogglePin(post)}
                                className={`p-2 transition-colors ${post.is_pinned ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
                                title={post.is_pinned ? 'Unpin' : 'Pin'}
                              >
                                <span
                                  className="material-symbols-outlined"
                                  style={{ fontSize: '20px', fontVariationSettings: post.is_pinned ? "'FILL' 1" : "'FILL' 0" }}
                                >
                                  push_pin
                                </span>
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id, post.title)}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                title="Delete"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bulk Action Toast */}
          {isSelectMode && selectedPosts.length > 0 && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-8 z-50">
              <span className="text-sm font-medium">{selectedPosts.length} 개 선택됨</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleDeleteSelectedPosts}
                  className="text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors"
                >
                  삭제
                </button>
                <div className="w-px h-4 bg-gray-700" />
                <button
                  onClick={() => { setIsSelectMode(false); setSelectedPosts([]); }}
                  className="text-xs font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
              Showing {filteredPosts.length} of {posts.length} posts
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default PostManagePage;
