/**
 * Main App Component
 * Routes between menu and game modes based on Zustand state
 */

import { useGameStore } from './hooks/useGameStore';
import MainMenu from './ui/MainMenu';
import SettingsPanel from './ui/SettingsPanel';
import PongGame from './components/PongGame';
import './App.css';

function App() {
  const currentMode = useGameStore((state) => state.currentMode);

  return (
    <div className="App">
      {/* Show menu or game based on current mode */}
      {currentMode === 'menu' ? (
        <MainMenu />
      ) : currentMode === 'classic' ? (
        <>
          <h1>Web Pong</h1>
          <PongGame />
        </>
      ) : (
        // Placeholder for future game modes
        <div className="coming-soon">
          <h1>Coming Soon</h1>
          <p>This game mode is under development.</p>
          <button onClick={() => useGameStore.getState().returnToMenu()}>
            Return to Menu
          </button>
        </div>
      )}

      {/* Settings panel overlay (shown when opened) */}
      <SettingsPanel />
    </div>
  );
}

export default App;
