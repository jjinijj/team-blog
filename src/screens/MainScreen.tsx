import { useState } from 'react';
import type { Post } from '../types/Post';

interface MainScreenProps {
  onGoToEditor: () => void;
  posts: Post[];
  onViewPost: (postId: string) => void;
  onDeletePost: (deletePosts: Post[]) => void;
}

function MainScreen({ onGoToEditor, posts, onViewPost, onDeletePost }: MainScreenProps) {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<Post[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSelectPost = (post: Post) => {
    const isSelected = selectedPosts.find(p => p.id === post.id);
    if (isSelected) {
      setSelectedPosts(selectedPosts.filter(p => p.id !== post.id));
    } else {
      setSelectedPosts([...selectedPosts, post]);
    }
  };

  const handleDeletePosts = () => {
    if (window.confirm('선택된 항목들을 삭제하겠습니까?')) {
      onDeletePost(selectedPosts);
      setIsSelectMode(false);
      setSelectedPosts([]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                <span className="text-lg">📝</span>
              </div>
              <h1 className="text-lg font-bold tracking-tight">TeamBlog</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onGoToEditor}
              className="flex items-center justify-center gap-2 px-4 h-10 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
            >
              <span>✏️</span>
              <span>Write</span>
            </button>
            
            {!isSelectMode ? (
              <button
                onClick={() => setIsSelectMode(true)}
                className="flex items-center justify-center gap-2 px-4 h-10 bg-gray-100 text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                <span>☑️</span>
                <span>Select</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsSelectMode(false);
                  setSelectedPosts([]);
                }}
                className="flex items-center justify-center gap-2 px-4 h-10 bg-gray-100 text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[960px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Area */}
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
        </div>

        {/* List View */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Recent Publications
            </h2>
            <span className="text-xs font-medium text-gray-400">
              {posts.length} Posts Found
            </span>
          </div>

          {posts.length === 0 ? (
            <p className="text-center text-gray-400 text-base py-20">
              아직 글이 없습니다.
            </p>
          ) : (
            <>
              {posts.map((post, index) => (
                <div key={post.id}>
                  <div className="group relative flex items-start gap-6 p-4 rounded-xl hover:bg-white transition-all border border-transparent hover:border-gray-200 cursor-pointer">
                    <div className="flex-1" onClick={() => !isSelectMode && onViewPost(post.id)}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-medium text-gray-600">Author</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500">{post.createdAt}</span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-tight group-hover:text-blue-500 transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {post.content}
                      </p>
                    </div>
                    
                    {isSelectMode && (
                      <div className="flex flex-col items-center gap-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedPosts.some(p => p.id === post.id)}
                          onChange={() => handleSelectPost(post)}
                          className="h-5 w-5 rounded border-gray-300 bg-transparent text-blue-500 checked:bg-blue-500 checked:border-blue-500 focus:ring-0 focus:ring-offset-0 transition-all"
                        />
                      </div>
                    )}
                  </div>
                  
                  {index < posts.length - 1 && (
                    <div className="h-px bg-gray-200 my-2 mx-4" />
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </main>

      {/* Bulk Action Toast */}
      {isSelectMode && selectedPosts.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-8 z-50">
          <span className="text-sm font-medium">{selectedPosts.length} posts selected</span>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDeletePosts}
              className="text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors"
            >
              Delete
            </button>
            <div className="w-px h-4 bg-gray-700" />
            <button
              onClick={() => {
                setIsSelectMode(false);
                setSelectedPosts([]);
              }}
              className="text-xs font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainScreen;