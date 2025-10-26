/**
 * Main App Component
 * Routes between menu and game modes based on Zustand state
 * Implements smooth transitions following W3BP0NG liquid glass synthwave aesthetic
 */

import React from 'react';
import { useGameStore, type GameMode } from './hooks/useGameStore';
import TitleScreen from './ui/TitleScreen';
import MainMenu from './ui/MainMenu';
import SettingsPanel from './ui/SettingsPanel';
import ModeTransition from './ui/ModeTransition';
import ClassicMode from './modes/ClassicMode';
import PhysicsPuzzleMode from './modes/PhysicsPuzzleMode';
import RhythmMode from './modes/RhythmMode';
import BattleRoyaleMode from './modes/BattleRoyaleMode';
import LevelEditorMode from './modes/LevelEditorMode';
import { startPerformanceMonitoring } from './utils/perfMonitor';
import { setAudioTheme } from './audio/AudioEngine';
import './App.css';
import './styles/glassmorphism.css';

/**
 * Component map for game modes
 * Each mode is a self-contained component
 */
const MODE_COMPONENTS: Record<GameMode, React.ComponentType> = {
  title: TitleScreen,
  menu: MainMenu,
  classic: ClassicMode,
  puzzle: PhysicsPuzzleMode,
  rhythm: RhythmMode,
  'battle-royale': BattleRoyaleMode,
  editor: LevelEditorMode,
};

function App() {
  const currentMode = useGameStore((state) => state.currentMode);
  const setMode = useGameStore((state) => state.setMode);
  const ModeComponent = MODE_COMPONENTS[currentMode];

  // Initialize systems on mount
  React.useEffect(() => {
    // Start performance monitoring
    startPerformanceMonitoring();

    // Set initial audio theme
    setAudioTheme('main');
  }, []);

  // Handle audio theme changes based on mode
  React.useEffect(() => {
    const themeMap: Record<GameMode, string> = {
      title: 'main',
      menu: 'main',
      classic: 'classic',
      puzzle: 'puzzle',
      rhythm: 'rhythm',
      'battle-royale': 'battle',
      editor: 'editor',
    };

    const theme = themeMap[currentMode];
    if (theme) {
      setAudioTheme(theme, false); // No crossfade for initial load
    }
  }, [currentMode]);

  const isGameMode = currentMode !== 'title' && currentMode !== 'menu';
  // Toggle body class to ensure layout stretches in game modes
  React.useEffect(() => {
    const cls = 'game-mode';
    if (isGameMode) {
      document.body.classList.add(cls);
    } else {
      document.body.classList.remove(cls);
    }
    return () => document.body.classList.remove(cls);
  }, [isGameMode]);

  return (
    <div className={`App cosmic-bg ${isGameMode ? 'full-bleed' : ''}`}>
      <ModeTransition mode={currentMode}>
        {currentMode === 'title' ? (
          <TitleScreen onStart={() => setMode('menu')} />
        ) : (
          <ModeComponent />
        )}
      </ModeTransition>
      <SettingsPanel />
    </div>
  );
}

export default App;
