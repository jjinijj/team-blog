import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../../types/Post';
import {
  readPost,
  deletePost,
  deleteMultiplePosts,
} from '../../lib/supabaseApi';

/**
 * 게시글 관리 페이지
 */
const PostManagePage: React.FC = () => {
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
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

  const handleDeleteMultiplePosts = async () => {
    if (selectedPosts.length === 0) {
      setError('삭제할 게시글을 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택한 ${selectedPosts.length}개의 게시글을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteMultiplePosts(selectedPosts);
      setSuccess(`${selectedPosts.length}개의 게시글 삭제 완료!`);
      setSelectedPosts([]);
      loadPosts();
    } catch (err) {
      setError('게시글 삭제에 실패했습니다.');
    }
  };

  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const toggleAllPosts = () => {
    if (selectedPosts.length === filteredPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(filteredPosts.map(post => post.id));
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
            {selectedPosts.length > 0 && (
              <button
                onClick={handleDeleteMultiplePosts}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-all shadow-sm"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                <span>선택 삭제 ({selectedPosts.length})</span>
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
                  <th className="px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                      onChange={toggleAllPosts}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
                    />
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Title
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Author
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Date Published
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                  filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedPosts.includes(post.id)}
                          onChange={() => togglePostSelection(post.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-900">
                          {post.title}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {post.author_email || '알 수 없음'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(post.createdAt)}
                      </td>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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