import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../../types/Post';
import {
  readPost,
  deletePost,
  deleteMultiplePosts,
} from '../../api/supabaseApi';
import { getAbsoluteTime } from '../../utils/DataFormat';

/**
 * 게시글 관리 페이지
 * 선택 모드 토글 방식 적용
 */
const PostManagePage: React.FC = () => {
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<Post[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await readPost();
      setPosts(data);
    } catch (err) {
      console.error('게시글 목록 로드 실패:', err);
      setError('게시글 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
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
    if (!window.confirm(`정말 "${title}" 글을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deletePost(postId);
      setSuccess(`"${title}" 삭제 완료!`);
      loadPosts();
    } catch (err) {
      setError('게시글 삭제에 실패했습니다.');
    }
  };

  const handleDeleteSelectedPosts = async () => {
    if (selectedPosts.length === 0) {
      setError('삭제할 게시글을 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택한 ${selectedPosts.length}개의 게시글을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const postIds = selectedPosts.map(p => p.id);
      await deleteMultiplePosts(postIds);
      setSuccess(`${selectedPosts.length}개의 게시글 삭제 완료!`);
      setSelectedPosts([]);
      setIsSelectMode(false);
      loadPosts();
    } catch (err) {
      setError('게시글 삭제에 실패했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    post.content.toLowerCase().includes(searchKeyword.toLowerCase())
  );

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
            {/* 선택 모드 토글 버튼 */}
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
                onClick={() => {
                  setIsSelectMode(false);
                  setSelectedPosts([]);
                }}
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

      {/* 검색바 */}
      <section className="px-8 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '20px' }}>search</span>
          </div>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 outline-none text-sm shadow-sm"
            placeholder="Search posts by title, author, or category..."
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
                  
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Title
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Author
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Date Published
                  </th>
                  {/* 선택 모드일 때만 체크박스 컬럼 표시 */}
                  {isSelectMode ? (
                    <th className="px-6 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                        onChange={handleToggleAllPosts}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600 cursor-pointer"
                      />
                    </th>
                    ) 
                    :
                    (
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                            Actions
                        </th>
                    )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={isSelectMode ? 4 : 4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-slate-500 text-sm">게시글 목록 불러오는 중...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={isSelectMode ? 4 : 4} className="px-6 py-12 text-center text-slate-500">
                      {searchKeyword ? '검색 결과가 없습니다.' : '등록된 게시글이 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                      
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-900">
                          {post.title}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {post.author_email || '알 수 없음'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {getAbsoluteTime(post.created_at)}
                      </td>
                      {/* 선택 모드가 아닐 때만 액션 버튼 표시 */}
                    {isSelectMode ? (
                        <td className="px-6 py-4">
                        <input
                            type="checkbox"
                            checked={selectedPosts.some(p => p.id === post.id)}
                            onChange={() => handleSelectPost(post)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600 cursor-pointer"
                            />
                        </td>
                    ) 
                    : (
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1">
                            <button
                                onClick={() => navigate(`/post/${post.id}`)}
                                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                title="View"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                visibility
                                </span>
                            </button>
                            <button
                                onClick={() => handleDeletePost(post.id, post.title)}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                title="Delete"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                delete
                                </span>
                            </button>
                            </div>
                        </td>
                    )}
                    </tr>
                  ))
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
                    onClick={() => {
                      setIsSelectMode(false);
                      setSelectedPosts([]);
                    }}
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
          </div>
        </div>
      </section>
    </>
  );
};

export default PostManagePage;