/**
 * Tests for Zustand game store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore, GAME_MODES } from '../useGameStore';

describe('useGameStore', () => {
  // Reset store before each test
  beforeEach(() => {
    useGameStore.setState({
      currentMode: 'menu',
      soundEnabled: true,
      currentTheme: 'synthwave-sunset',
      settingsPanelOpen: false,
    });
  });

  describe('Initial State', () => {
    it('should initialize with menu mode', () => {
      const { currentMode } = useGameStore.getState();
      expect(currentMode).toBe('menu');
    });

    it('should initialize with sound enabled', () => {
      const { soundEnabled } = useGameStore.getState();
      expect(soundEnabled).toBe(true);
    });

    it('should initialize with synthwave-sunset theme', () => {
      const { currentTheme } = useGameStore.getState();
      expect(currentTheme).toBe('synthwave-sunset');
    });

    it('should initialize with settings panel closed', () => {
      const { settingsPanelOpen } = useGameStore.getState();
      expect(settingsPanelOpen).toBe(false);
    });
  });

  describe('Mode Management', () => {
    it('should change to classic mode', () => {
      const { setMode } = useGameStore.getState();
      setMode('classic');
      expect(useGameStore.getState().currentMode).toBe('classic');
    });

    it('should change to puzzle mode', () => {
      const { setMode } = useGameStore.getState();
      setMode('puzzle');
      expect(useGameStore.getState().currentMode).toBe('puzzle');
    });

    it('should change to rhythm mode', () => {
      const { setMode } = useGameStore.getState();
      setMode('rhythm');
      expect(useGameStore.getState().currentMode).toBe('rhythm');
    });

    it('should change to battle-royale mode', () => {
      const { setMode } = useGameStore.getState();
      setMode('battle-royale');
      expect(useGameStore.getState().currentMode).toBe('battle-royale');
    });

    it('should change to editor mode', () => {
      const { setMode } = useGameStore.getState();
      setMode('editor');
      expect(useGameStore.getState().currentMode).toBe('editor');
    });

    it('should return to menu', () => {
      const { setMode, returnToMenu } = useGameStore.getState();
      setMode('classic');
      returnToMenu();
      expect(useGameStore.getState().currentMode).toBe('menu');
    });
  });

  describe('Sound Toggle', () => {
    it('should toggle sound from enabled to disabled', () => {
      const { toggleSound } = useGameStore.getState();
      toggleSound();
      expect(useGameStore.getState().soundEnabled).toBe(false);
    });

    it('should toggle sound from disabled to enabled', () => {
      const { toggleSound } = useGameStore.getState();
      toggleSound(); // disabled
      toggleSound(); // enabled again
      expect(useGameStore.getState().soundEnabled).toBe(true);
    });

    it('should toggle multiple times correctly', () => {
      const { toggleSound } = useGameStore.getState();
      toggleSound(); // false
      toggleSound(); // true
      toggleSound(); // false
      toggleSound(); // true
      expect(useGameStore.getState().soundEnabled).toBe(true);
    });
  });

  describe('Theme Selection', () => {
    it('should change theme to arctic-glass', () => {
      const { setTheme } = useGameStore.getState();
      setTheme('arctic-glass');
      expect(useGameStore.getState().currentTheme).toBe('arctic-glass');
    });

    it('should change theme back to synthwave-sunset', () => {
      const { setTheme } = useGameStore.getState();
      setTheme('arctic-glass');
      setTheme('synthwave-sunset');
      expect(useGameStore.getState().currentTheme).toBe('synthwave-sunset');
    });

    it('should accept custom theme ids', () => {
      const { setTheme } = useGameStore.getState();
      setTheme('custom-theme-future');
      expect(useGameStore.getState().currentTheme).toBe('custom-theme-future');
    });
  });

  describe('Settings Panel', () => {
    it('should open settings panel', () => {
      const { toggleSettingsPanel } = useGameStore.getState();
      toggleSettingsPanel();
      expect(useGameStore.getState().settingsPanelOpen).toBe(true);
    });

    it('should close settings panel', () => {
      const { toggleSettingsPanel } = useGameStore.getState();
      toggleSettingsPanel(); // open
      toggleSettingsPanel(); // close
      expect(useGameStore.getState().settingsPanelOpen).toBe(false);
    });

    it('should close settings panel when returning to menu', () => {
      const { toggleSettingsPanel, returnToMenu } = useGameStore.getState();
      toggleSettingsPanel(); // open
      returnToMenu();
      expect(useGameStore.getState().settingsPanelOpen).toBe(false);
    });
  });

  describe('Complex State Interactions', () => {
    it('should handle multiple state changes in sequence', () => {
      const { setMode, toggleSound, setTheme, toggleSettingsPanel } = useGameStore.getState();

      setMode('classic');
      toggleSound();
      setTheme('arctic-glass');
      toggleSettingsPanel();

      const state = useGameStore.getState();
      expect(state.currentMode).toBe('classic');
      expect(state.soundEnabled).toBe(false);
      expect(state.currentTheme).toBe('arctic-glass');
      expect(state.settingsPanelOpen).toBe(true);
    });

    it('should maintain state independence', () => {
      const { setMode, toggleSound } = useGameStore.getState();

      setMode('rhythm');
      toggleSound();

      const state = useGameStore.getState();
      expect(state.currentMode).toBe('rhythm');
      expect(state.soundEnabled).toBe(false);
      // Other state should remain at defaults
      expect(state.currentTheme).toBe('synthwave-sunset');
      expect(state.settingsPanelOpen).toBe(false);
    });
  });

  describe('GAME_MODES Configuration', () => {
    it('should have 5 game modes defined', () => {
      expect(GAME_MODES).toHaveLength(5);
    });

    it('should have classic mode available', () => {
      const classicMode = GAME_MODES.find(mode => mode.id === 'classic');
      expect(classicMode).toBeDefined();
      expect(classicMode?.available).toBe(true);
    });

    it('should have puzzle mode unavailable', () => {
      const puzzleMode = GAME_MODES.find(mode => mode.id === 'puzzle');
      expect(puzzleMode).toBeDefined();
      expect(puzzleMode?.available).toBe(false);
    });

    it('should have rhythm mode unavailable', () => {
      const rhythmMode = GAME_MODES.find(mode => mode.id === 'rhythm');
      expect(rhythmMode).toBeDefined();
      expect(rhythmMode?.available).toBe(false);
    });

    it('should have battle-royale mode unavailable', () => {
      const battleMode = GAME_MODES.find(mode => mode.id === 'battle-royale');
      expect(battleMode).toBeDefined();
      expect(battleMode?.available).toBe(false);
    });

    it('should have editor mode unavailable', () => {
      const editorMode = GAME_MODES.find(mode => mode.id === 'editor');
      expect(editorMode).toBeDefined();
      expect(editorMode?.available).toBe(false);
    });

    it('should have all required metadata for each mode', () => {
      GAME_MODES.forEach(mode => {
        expect(mode.id).toBeDefined();
        expect(mode.name).toBeDefined();
        expect(mode.description).toBeDefined();
        expect(mode.available).toBeDefined();
        expect(mode.icon).toBeDefined();
      });
    });
  });
});
