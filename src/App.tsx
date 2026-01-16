import { useState } from 'react';
import MainScreen from './screens/MainScreen';
import EditorScreen from './screens/EditorScreen';
import { Post } from './types/Post';
import { title } from 'process';
import { EXPRESSIONWRAPPER_TYPES } from '@babel/types';

type Screen = 'main' | 'editor';



function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [posts, setPosts] = useState<Post[]>([]);

  const goToEditor = () => {
    setCurrentScreen('editor');
  };

  const goToMain = () => {
    setCurrentScreen('main');
  };

  const handleAddPost = (title: string, content: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date().toLocaleDateString('ko-KR'),
    }

    setPosts([newPost, ...posts]);
    goToMain();
  };

  return (
    <>
      {currentScreen === 'main' && <MainScreen onGoToEditor={goToEditor} posts = {posts}/>}
      {currentScreen === 'editor' && <EditorScreen onGoToMain={goToMain} onAddPost={handleAddPost}/>}
    </>
  );
}

export default App;
