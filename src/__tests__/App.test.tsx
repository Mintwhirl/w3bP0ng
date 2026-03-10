/**
 * Integration tests for App component
 * Tests navigation between menu and game modes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import App from '../App';
import { useGameStore } from '../hooks/useGameStore';

// Mock all mode components
vi.mock('../ui/TitleScreen', () => ({
  default: ({ onStart }: any) => (
    <div data-testid="title-screen">
      <h1>w3bP0ng Title</h1>
      <button onClick={onStart}>START</button>
    </div>
  )
}));

vi.mock('../ui/MainMenu', () => ({
  default: () => {
    const setMode = useGameStore(state => state.setMode);
    const toggleSettingsPanel = useGameStore(state => state.toggleSettingsPanel);
    return (
      <div data-testid="main-menu">
        <h1>w3bP0ng</h1>
        <button onClick={() => setMode('classic')} aria-label="Classic Mode - Available">Classic Mode</button>
        <button onClick={() => setMode('puzzle')} aria-label="Physics Puzzle - Available">Physics Puzzle</button>
        <button onClick={() => setMode('rhythm')} aria-label="Rhythm Mode - Available">Rhythm Mode</button>
        <button onClick={() => setMode('battle-royale')} aria-label="Battle Royale - Available">Battle Royale</button>
        <button onClick={() => setMode('editor')} aria-label="Level Editor - Available">Level Editor</button>
        <button onClick={() => toggleSettingsPanel()} aria-label="Open settings">Open Settings</button>
      </div>
    );
  }
}));

vi.mock('../components/PongGame', () => ({
  default: () => <div data-testid="mode-classic">Classic Mode Component</div>
}));

vi.mock('../modes/PhysicsPuzzleMode', () => ({
  default: () => <div data-testid="mode-puzzle">Physics Puzzle Component</div>
}));

vi.mock('../modes/RhythmMode', () => ({
  default: () => <div data-testid="mode-rhythm">Rhythm Mode Component</div>
}));

vi.mock('../modes/BattleRoyaleMode', () => ({
  default: () => <div data-testid="mode-battle">Battle Royale Component</div>
}));

vi.mock('../modes/LevelEditorMode', () => ({
  default: () => <div data-testid="mode-editor">Level Editor Component</div>
}));

describe('App Integration Tests', () => {
  beforeEach(() => {
    // Reset store to menu state before each test
    act(() => {
      useGameStore.setState({
        currentMode: 'menu',
        soundEnabled: true,
        currentTheme: 'synthwave-sunset',
        settingsPanelOpen: false,
      });
    });
  });

  describe('Initial State', () => {
    it('should render main menu by default', async () => {
      render(<App />);
      expect(await screen.findByTestId('main-menu')).toBeInTheDocument();
    });
  });

  describe('Mode Navigation', () => {
    it('should navigate to classic mode when clicking Classic Mode card', async () => {
      render(<App />);
      await screen.findByTestId('main-menu');
      const btn = await screen.findByLabelText(/Classic Mode - Available/i);
      
      act(() => {
        fireEvent.click(btn);
      });

      expect(await screen.findByTestId('mode-classic')).toBeInTheDocument();
      expect(useGameStore.getState().currentMode).toBe('classic');
    });

    it('should navigate to puzzle mode when clicking Physics Puzzle card', async () => {
      render(<App />);
      await screen.findByTestId('main-menu');
      const btn = await screen.findByLabelText(/Physics Puzzle - Available/i);
      
      act(() => {
        fireEvent.click(btn);
      });

      expect(await screen.findByTestId('mode-puzzle')).toBeInTheDocument();
    });

    it('should navigate to rhythm mode when clicking Rhythm Mode card', async () => {
      render(<App />);
      await screen.findByTestId('main-menu');
      const btn = await screen.findByLabelText(/Rhythm Mode - Available/i);
      
      act(() => {
        fireEvent.click(btn);
      });

      expect(await screen.findByTestId('mode-rhythm')).toBeInTheDocument();
    });

    it('should navigate to battle royale mode when clicking Battle Royale card', async () => {
      render(<App />);
      await screen.findByTestId('main-menu');
      const btn = await screen.findByLabelText(/Battle Royale - Available/i);
      
      act(() => {
        fireEvent.click(btn);
      });

      expect(await screen.findByTestId('mode-battle')).toBeInTheDocument();
    });

    it('should navigate to level editor when clicking Level Editor card', async () => {
      render(<App />);
      await screen.findByTestId('main-menu');
      const btn = await screen.findByLabelText(/Level Editor - Available/i);
      
      act(() => {
        fireEvent.click(btn);
      });

      expect(await screen.findByTestId('mode-editor')).toBeInTheDocument();
    });
  });

  describe('Settings Panel Integration', () => {
    it('should render settings panel when open', async () => {
      act(() => {
        useGameStore.setState({ settingsPanelOpen: true });
      });
      render(<App />);
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('should not render settings panel when closed', async () => {
      render(<App />);
      await screen.findByTestId('main-menu');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should open settings panel from menu', async () => {
      render(<App />);
      await screen.findByTestId('main-menu');
      const btn = await screen.findByLabelText('Open settings');
      
      act(() => {
        fireEvent.click(btn);
      });

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('App Container', () => {
    it('should render with App class', async () => {
      const { container } = render(<App />);
      await screen.findByTestId('main-menu');
      expect(container.querySelector('.App')).toBeInTheDocument();
    });
  });
});
