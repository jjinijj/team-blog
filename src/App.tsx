import { useState, useEffect } from 'react';
import MainScreen from './screens/MainScreen';
import EditorScreen from './screens/EditorScreen';
import PostDetailScreen from './screens/PostDetailScreen';
import { Post } from './types/Post';
import { createPost, deleteMultiplePosts, deletePost, readPost, updatePost } from './lib/supabaseApi';

type Screen = 'main' | 'editor' | 'detail';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null); 
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

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

  const goToEditor = () => {
    setEditingPostId(null);
    setCurrentScreen('editor');
  };

  const goToMain = () => {
    setCurrentScreen('main');
    setEditingPostId(null);
  };

  const goToDetail = (postId: string) => {
    setSelectedPostId(postId);
    setCurrentScreen('detail');
  };

  const handleEditPost = (postId: string) => {
    setEditingPostId(postId);
    setCurrentScreen('editor');
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('글을 삭제하시겠습니까?')) {
      try {
        await deletePost(postId);
        setPosts(posts.filter((post) => postId !== post.id));
        goToMain();
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
  ) => {
    if (editingPostId) {
      // 수정 모드
      const updatedPost: Post = {
        id: editingPostId,
        title,
        content,
        fontSize,
        isBold,
        isItalic,
        isUnderline,
        textColor,
        createdAt: new Date().toLocaleDateString('ko-KR'),
      };

      try {
        await updatePost(updatedPost);
        setPosts(posts.map((post) => 
          post.id === editingPostId 
            ? { ...post, title, content, fontSize, isBold, isItalic, isUnderline, textColor }
            : post
        ));
        goToMain();
      } catch (error) {
        console.error('업데이트 실패:', error);
        alert('글 수정에 실패했습니다.');
      }
    } else {
      // 새 글 작성 모드
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
      };

      try {
        await createPost(newPost);
        setPosts([newPost, ...posts]);
        goToMain();
      } catch (error) {
        console.error('글 생성 실패:', error);
        alert('글 생성에 실패했습니다.');
      }
    }
  };

  const selectedPost = posts.find((post) => post.id === selectedPostId);
  const editingPost = posts.find((post) => post.id === editingPostId);

  return (
    <>
      {currentScreen === 'main' && (
        <MainScreen 
          onGoToEditor={goToEditor} 
          posts={posts}
          onViewPost={goToDetail}
          onDeletePost={handleDeleteMultiplePosts}
        />
      )}
      {currentScreen === 'editor' && (
        <EditorScreen 
          onGoToMain={goToMain} 
          onAddPost={handleAddPost}
          editingPost={editingPost}
        />
      )}
      {currentScreen === 'detail' && selectedPost && (
        <PostDetailScreen 
          post={selectedPost} 
          onGoToMain={goToMain}  
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
        />
      )}
    </>
  );
}

export default App;