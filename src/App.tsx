import { useState } from 'react';
import MainScreen from './screens/MainScreen';
import EditorScreen from './screens/EditorScreen';
import PostDetailScreen from './screens/PostDetailScreen';
import { Post } from './types/Post';


type Screen = 'main' | 'editor' | 'detail';



function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null> (null);

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

  const handleAddPost = (title: string, content: string, fontSize: number) => {
    const newPost: Post = {
      id: Date.now().toString(),
      title,
      content,
      fontSize: fontSize,
      createdAt: new Date().toLocaleDateString('ko-KR'),
    }

    setPosts([newPost, ...posts]);
    goToMain();
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
        <PostDetailScreen post={selectedPost} onGoToMain={goToMain}/>
      )}
    </>
  );
}

export default App;
