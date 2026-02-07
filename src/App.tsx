import { useState, useEffect } from 'react';
import MainScreen from './screens/MainScreen';
import EditorScreen from './screens/EditorScreen';
import PostDetailScreen from './screens/PostDetailScreen';
import AuthScreen from './screens/AuthScreen';
import { Post } from './types/Post';
import { createPost, deleteMultiplePosts, deletePost, readPost, updatePost } from './lib/supabaseApi';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminScreen from './screens/AdminScreen';
import AdminGuard from './component/admin/AdminGuard';
import AdminLayout from './component/admin/AdminLayout';
import Dashboard from './screens/admin/Dashboard';
import WhitelistPage from './screens/admin/WhitelistPage';
import PostManagePage from './screens/admin/PostManagePage';

function AppContent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  // 초기 데이터 로드
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await readPost();
        console.log('데이터 로드 성공:', data);
        setPosts(data);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      }
    };
    
    loadPosts();
  }, []);

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('글을 삭제하시겠습니까?')) {
      try {
        await deletePost(postId);
        setPosts(posts.filter((post) => postId !== post.id));
        navigate('/');
      } catch (error) {
        console.error('글 삭제 실패:', error);
        alert('글 삭제에 실패했습니다.');
      }
    }
  };

  const handleDeleteMultiplePosts = async (deletePosts: Post[]) => {
    if (window.confirm('선택한 글들을 모두 삭제하시겠습니까?')) {
      const ids = deletePosts.map(post => post.id);
      
      try {
        await deleteMultiplePosts(ids);
        setPosts(prev => prev.filter(post => !deletePosts.includes(post)));
      } catch (error) {
        console.error('글 여러개 삭제 실패:', error);
        alert('글 삭제에 실패했습니다.');
      }
    }
  };

  const handleAddPost = async (
    title: string, 
    content: string, 
    fontSize: number,
    isBold: boolean,
    isItalic: boolean,
    isUnderline: boolean,
    textColor: string,
    isMarkdown: boolean,
  ) => {
    const newPost: Post = {
      id: Date.now().toString(),
      title,
      content,
      fontSize,
      isBold,
      isItalic,
      isUnderline,
      textColor,
      createdAt: new Date().toLocaleDateString('ko-KR'),
      isMarkdown: isMarkdown,
      author_id: user?.id || null,
      author_email: user?.email || null,
    };

    try {
      await createPost(newPost);
      setPosts([newPost, ...posts]);
      navigate(`/post/${newPost.id}`);
    } catch (error) {
      console.error('글 생성 실패:', error);
      alert('글 생성에 실패했습니다.');
    }
  };

  const handleUpdatePost = async (
    postId: string,
    title: string, 
    content: string, 
    fontSize: number,
    isBold: boolean,
    isItalic: boolean,
    isUnderline: boolean,
    textColor: string,
    isMarkdown: boolean,
  ) => {
    const updatedPost: Post = {
      id: postId,
      title,
      content,
      fontSize,
      isBold,
      isItalic,
      isUnderline,
      textColor,
      createdAt: new Date().toLocaleDateString('ko-KR'),
      isMarkdown: isMarkdown,
      author_id: user?.id || null,
      author_email:user?.email || null,
    };

    try {
      await updatePost(updatedPost);
      setPosts(posts.map((post) => 
        post.id === postId 
          ? { ...post, title, content, fontSize, isBold, isItalic, isUnderline, textColor, isMarkdown }
          : post
      ));
      navigate(`/post/${postId}`);
    } catch (error) {
      console.error('업데이트 실패:', error);
      alert('글 수정에 실패했습니다.');
    }
  };

  return (
    <Routes>
      {/* 로그인 화면 */}
      <Route path="/login"
             element={
             <AuthScreen
              goToMain={() => navigate('/')}
            />
          }
        />
      
      {/* 메인 화면 */}
      <Route
        path="/"
        element={
          <MainScreen 
            posts={posts}
            onViewPost={(postId) => navigate(`/post/${postId}`)}
            onGoToEditor={() => navigate('/write')} 
            onDeletePost={handleDeleteMultiplePosts}
          />
        }
      />
      
      {/* 글쓰기 */}
      <Route
        path="/write"
        element={
          <EditorScreen 
            onGoToMain={() => navigate('/')} 
            onAddPost={handleAddPost}
            editingPost={undefined}
          />
        }
      />
      
      {/* 글 수정 */}
      <Route
        path="/edit/:id"
        element={
          <EditorScreen 
            posts={posts}
            onGoToMain={() => navigate('/')} 
            onAddPost={handleAddPost}
            onUpdatePost={handleUpdatePost}
          />
        }
      />
      
      {/* 글 상세 */}
      <Route
        path="/post/:id"
        element={
          <PostDetailScreen 
            posts={posts} 
            onGoToMain={() => navigate('/')}  
            onEdit={(postId) => navigate(`edit/${postId}`)}
            onDelete={handleDeletePost}
          />
        }
      />

      {/* 관리자 라우트 - 중첩 구조 */}
          <Route path="/admin" element={<AdminGuard />}>
            <Route element={<AdminLayout />}>
              {/* /admin → /admin/dashboard로 리다이렉트 */}
              <Route index element={<Navigate to="dashboard" replace />} />
              
              {/* 실제 관리자 페이지들 */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="whitelist" element={<WhitelistPage />} />
              <Route path="posts" element={<PostManagePage />} />
            </Route>
          </Route>

          {/* 404 - 존재하지 않는 경로는 홈으로 */}
          <Route path="*" element={<Navigate to="/" replace />} />

      
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;