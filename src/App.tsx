import { useState, useEffect } from 'react';
import MainScreen from './screens/MainScreen';
import EditorScreen from './screens/EditorScreen';
import PostDetailScreen from './screens/PostDetailScreen';
import { Post } from './types/Post';


type Screen = 'main' | 'editor' | 'detail';



function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [selectedPostId, setSelectedPostId] = useState<string | null> (null);
  const [posts, setPosts] = useState<Post[]>(()=>{
    const saved = localStorage.getItem('blog-posts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(()=>{
    localStorage.setItem('blog-posts', JSON.stringify(posts));
    console.log('save : ', JSON.stringify(posts));
  },[posts]);

  const goToEditor = () => {
    setCurrentScreen('editor');
  };

  const goToMain = () => {
    setCurrentScreen('main');
  };

  const goToDetail = (postId : string) => {
    setSelectedPostId(postId);
    setCurrentScreen('detail');
  };

  const handleAddPost = (
    title: string, 
    content: string, 
    fontSize: number,
    isBold: boolean,
    isItalic: boolean,
    isUnderline: boolean,
  ) => {
    const newPost: Post = {
      id: Date.now().toString(),
      title,
      content,
      fontSize: fontSize,
      isBold: isBold,
      isItalic: isItalic,
      isUnderline: isUnderline,
      createdAt: new Date().toLocaleDateString('ko-KR'),
    }

    setPosts([newPost, ...posts]);
    goToMain();
  };

  const handleEditPost = (postId : string) => {

    alert('수정 기능 추가 예정');

  };

  const selectedPost = posts.find((post) => post.id === selectedPostId);

  return (
    <>
      {currentScreen === 'main' && (
        <MainScreen onGoToEditor={goToEditor} posts = {posts} onViewPost={goToDetail}/>
      )}
      {currentScreen === 'editor' && (
        <EditorScreen onGoToMain={goToMain} onAddPost={handleAddPost}/>
      )}
      { currentScreen === 'detail' && selectedPost && (
        <PostDetailScreen post={selectedPost} onGoToMain={goToMain} onEdit={handleEditPost}/>
      )}
    </>
  );
}

export default App;
