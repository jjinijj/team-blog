import { useState } from 'react';
import MainScreen from './screens/MainScreen';
import EditorScreen from './screens/EditorScreen';

type Screen = 'main' | 'editor';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');

  const goToEditor = () => {
    setCurrentScreen('editor');
  };

  const goToMain = () => {
    setCurrentScreen('main');
  };

  return (
    <>
      {currentScreen === 'main' && <MainScreen onGoToEditor={goToEditor} />}
      {currentScreen === 'editor' && <EditorScreen onGoToMain={goToMain} />}
    </>
  );
}

export default App;
