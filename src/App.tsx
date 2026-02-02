import { useState, useEffect } from 'react';
import MainScreen from './screens/MainScreen';
import EditorScreen from './screens/EditorScreen';
import PostDetailScreen from './screens/PostDetailScreen';
import AuthScreen from './screens/AuthScreen';
import { Post } from './types/Post';
import { createPost, deleteMultiplePosts, deletePost, readPost, updatePost } from './lib/supabaseApi';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// 인증이 필요한 앱 컨텐츠
function AppContent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

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

 

  // 로그인됨 - 기존 앱 로직
  return (
    <Routes>
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
    </Routes>
  );
}

// AuthProvider로 감싸기
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;