import type { Post } from '../types/Post';
import { useRef, useState } from 'react';

interface MainScreenProps {
  onGoToEditor: () => void;
  posts: Post[];
  onViewPost: (postId: string) => void;
  onDeletePost: (deletePosts: Post[]) => void;
}

function MainScreen({ onGoToEditor, posts, onViewPost, onDeletePost }: MainScreenProps) {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<Post[]>([]);
  const [sortOrder, setSortOrder] = useState('newer');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [keyword, setKeyword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const getSortedPosts = () => {
    const sorted = (keyword === '' ? [...posts] : getSearchedPosts());
    if (sortOrder === 'newer') {
      return sorted.sort((a, b) => b.id.localeCompare(a.id));
    } else {
      return sorted.sort((a, b) => a.id.localeCompare(b.id));
    }
  };

  const handleSearchClick = () => {
    setKeyword(searchKeyword.trim());

    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length
      );
    }
  };

  const handleSelectPostMode = () => {
    setIsSelectMode(!isSelectMode);

    if (!isSelectMode) {
      setSelectedPosts([]);
    }
  };

  const handleDeletePosts = () => {
    if (window.confirm('선택된 항목들을 삭제하겠습니까?')) {
      onDeletePost(selectedPosts);
      setIsSelectMode(false);
    }
  };

  const handleSelectPost = (selectPost: Post) => {
    const post = selectedPosts.find((post) => post.id === selectPost.id);
    if (post) {
      setSelectedPosts(selectedPosts.filter((post) => post.id !== selectPost.id));
    } else {
      setSelectedPosts(prev => [selectPost, ...prev]);
    }
  };

  const getSearchedPosts = () => {
    const totalPosts = [...posts];
    const searched = totalPosts.filter((post) => 
      post.title.includes(keyword) || post.content.includes(keyword)
    );

    if (searched) {
      return searched;
    } else {
      return [];
    }
  };

  return (
    <div className="w-full min-h-screen py-10 px-5 bg-gray-100">
      <div className="max-w-3xl mx-auto flex justify-between items-center gap-5 mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mr-auto">Team Blog</h1>
        
        {!isSelectMode && (
          <button
            onClick={onGoToEditor}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg text-base cursor-pointer transition-colors hover:bg-blue-700"
          >
            글쓰기
          </button>
        )}
        
        {isSelectMode && (
          <button
            onClick={handleDeletePosts}
            className="px-6 py-3 bg-red-600 text-white rounded-lg text-base cursor-pointer transition-colors hover:bg-red-700"
          >
            삭제
          </button>
        )}
        
        <button
          onClick={handleSelectPostMode}
          className="px-6 py-3 bg-green-600 text-white rounded-lg text-base cursor-pointer transition-colors hover:bg-green-700"
        >
          {isSelectMode ? '취소' : '선택'}
        </button>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-lg p-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchKeyword}
              ref={inputRef}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-52 h-9 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            />
            <button
              onClick={handleSearchClick}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg text-base cursor-pointer transition-colors hover:bg-blue-600"
            >
              🔍
            </button>
          </div>
          
          <div className="flex items-center gap-2.5">
            <label className="text-sm">정렬</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded text-sm cursor-pointer focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            >
              <option value="newer">최신순</option>
              <option value="older">오래된순</option>
            </select>
          </div>
        </div>

        {posts.length === 0 ? (
          <p className="text-center text-gray-400 text-base">아직 글이 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-5">
            {getSortedPosts().map((post) => (
              <div key={post.id} className="flex items-center gap-4">
                {isSelectMode && (
                  <input
                    type="checkbox"
                    checked={selectedPosts.some((p) => p.id === post.id)}
                    onChange={() => handleSelectPost(post)}
                    className="w-5 h-5 cursor-pointer"
                  />
                )}
                <div
                  onClick={() => onViewPost(post.id)}
                  className="flex-1 flex flex-col items-center gap-4 p-5 border border-gray-200 rounded-lg bg-gray-50 transition-all cursor-pointer hover:border-gray-300 hover:bg-white hover:shadow-md"
                >
                  <h2 className="text-xl font-bold text-gray-800 m-0">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 text-sm m-0 leading-relaxed line-clamp-3">
                    {post.content}
                  </p>
                  <span className="text-xs text-gray-400">{post.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MainScreen;