/**
 * Tests for useTheme hook
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme, useCurrentThemeId } from '../useTheme';
import { useGameStore } from '../useGameStore';
import { THEMES } from '../../rendering/types';

describe('useTheme hook', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useGameStore.setState({
      currentMode: 'menu',
      currentTheme: 'synthwave-sunset',
      soundEnabled: true,
      settingsPanelOpen: false,
    });

    // Clear any CSS variables set by previous tests
    const root = document.documentElement;
    root.style.removeProperty('--theme-paddle-left');
    root.style.removeProperty('--theme-paddle-right');
    root.style.removeProperty('--theme-ball');
    root.style.removeProperty('--theme-ball-trail');
    root.style.removeProperty('--theme-score');
    root.style.removeProperty('--theme-bg-gradient');
  });

  describe('Mode-specific theme switching', () => {
    it('should return synthwave-sunset theme for menu mode', () => {
      useGameStore.setState({ currentMode: 'menu' });
      const { result } = renderHook(() => useTheme());

      expect(result.current.id).toBe('synthwave-sunset');
      expect(result.current.name).toBe('Synthwave Sunset');
    });

    it('should return synthwave-sunset theme for classic mode', () => {
      useGameStore.setState({ currentMode: 'classic' });
      const { result } = renderHook(() => useTheme());

      expect(result.current.id).toBe('synthwave-sunset');
    });

    it('should return puzzle-logic theme for puzzle mode', () => {
      useGameStore.setState({ currentMode: 'puzzle' });
      const { result } = renderHook(() => useTheme());

      expect(result.current.id).toBe('puzzle-logic');
      expect(result.current.name).toBe('Puzzle Logic');
    });

    it('should return rhythm-beats theme for rhythm mode', () => {
      useGameStore.setState({ currentMode: 'rhythm' });
      const { result } = renderHook(() => useTheme());

      expect(result.current.id).toBe('rhythm-beats');
      expect(result.current.name).toBe('Rhythm Beats');
    });

    it('should return battle-intensity theme for battle-royale mode', () => {
      useGameStore.setState({ currentMode: 'battle-royale' });
      const { result } = renderHook(() => useTheme());

      expect(result.current.id).toBe('battle-intensity');
      expect(result.current.name).toBe('Battle Intensity');
    });

    it('should return editor-pro theme for editor mode', () => {
      useGameStore.setState({ currentMode: 'editor' });
      const { result } = renderHook(() => useTheme());

      expect(result.current.id).toBe('editor-pro');
      expect(result.current.name).toBe('Editor Pro');
    });
  });

  describe('Manual theme selection', () => {
    it('should use manually selected theme in menu mode', () => {
      useGameStore.setState({
        currentMode: 'menu',
        currentTheme: 'arctic-glass',
      });
      const { result } = renderHook(() => useTheme());

      expect(result.current.id).toBe('arctic-glass');
      expect(result.current.name).toBe('Arctic Glass');
    });

    it('should prioritize mode-specific theme when not in menu', () => {
      useGameStore.setState({
        currentMode: 'puzzle',
        currentTheme: 'arctic-glass', // Manual selection should be ignored
      });
      const { result } = renderHook(() => useTheme());

      // Should use puzzle mode theme, not manual selection
      expect(result.current.id).toBe('puzzle-logic');
    });

    it('should ignore manual theme if it is the default theme in menu', () => {
      useGameStore.setState({
        currentMode: 'menu',
        currentTheme: 'synthwave-sunset', // Default theme
      });
      const { result } = renderHook(() => useTheme());

      expect(result.current.id).toBe('synthwave-sunset');
    });
  });

  describe('Theme reactivity', () => {
    it('should update theme when mode changes', () => {
      const { result, rerender } = renderHook(() => useTheme());

      // Start in menu mode
      expect(result.current.id).toBe('synthwave-sunset');

      // Change to puzzle mode
      act(() => {
        useGameStore.setState({ currentMode: 'puzzle' });
      });
      rerender();

      expect(result.current.id).toBe('puzzle-logic');
    });

    it('should update theme when manual selection changes in menu', () => {
      useGameStore.setState({ currentMode: 'menu' });
      const { result, rerender } = renderHook(() => useTheme());

      expect(result.current.id).toBe('synthwave-sunset');

      // Manually select different theme
      act(() => {
        useGameStore.setState({ currentTheme: 'arctic-glass' });
      });
      rerender();

      expect(result.current.id).toBe('arctic-glass');
    });

    it('should revert to mode theme when leaving menu', () => {
      useGameStore.setState({
        currentMode: 'menu',
        currentTheme: 'arctic-glass',
      });
      const { result, rerender } = renderHook(() => useTheme());

      expect(result.current.id).toBe('arctic-glass');

      // Switch to puzzle mode
      act(() => {
        useGameStore.setState({ currentMode: 'puzzle' });
      });
      rerender();

      // Should now use puzzle mode theme
      expect(result.current.id).toBe('puzzle-logic');
    });
  });

  describe('CSS variable application', () => {
    it('should apply theme as CSS variables on mount', () => {
      useGameStore.setState({ currentMode: 'menu' });
      renderHook(() => useTheme());

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--theme-paddle-left')).toBe('#ed64a6');
      expect(root.style.getPropertyValue('--theme-paddle-right')).toBe('#6d28d9');
      expect(root.style.getPropertyValue('--theme-ball')).toBe('#81ecec');
    });

    it('should update CSS variables when theme changes', () => {
      const { rerender } = renderHook(() => useTheme());

      let root = document.documentElement;
      expect(root.style.getPropertyValue('--theme-paddle-left')).toBe('#ed64a6');

      // Change to puzzle mode
      act(() => {
        useGameStore.setState({ currentMode: 'puzzle' });
      });
      rerender();

      root = document.documentElement;
      expect(root.style.getPropertyValue('--theme-paddle-left')).toBe('#10b981');
      expect(root.style.getPropertyValue('--theme-paddle-right')).toBe('#f59e0b');
    });

    it('should set all required CSS variables', () => {
      renderHook(() => useTheme());

      const root = document.documentElement;
      const requiredVars = [
        '--theme-paddle-left',
        '--theme-paddle-right',
        '--theme-ball',
        '--theme-ball-trail',
        '--theme-score',
        '--theme-powerup-big-paddle',
        '--theme-powerup-fast-ball',
        '--theme-powerup-multi-ball',
        '--theme-powerup-shield',
        '--theme-bg-gradient',
      ];

      requiredVars.forEach((varName) => {
        const value = root.style.getPropertyValue(varName);
        expect(value).toBeTruthy();
      });
    });
  });

  describe('Fallback behavior', () => {
    it('should fall back to default theme for invalid mode', () => {
      // @ts-expect-error Testing invalid mode
      useGameStore.setState({ currentMode: 'invalid-mode' });
      const { result } = renderHook(() => useTheme());

      expect(result.current.id).toBe('synthwave-sunset');
    });

    it('should fall back to default theme for invalid manual selection', () => {
      useGameStore.setState({
        currentMode: 'menu',
        currentTheme: 'invalid-theme-id',
      });
      const { result } = renderHook(() => useTheme());

      expect(result.current.id).toBe('synthwave-sunset');
    });
  });

  describe('Theme object structure', () => {
    it('should return complete theme object', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current).toHaveProperty('id');
      expect(result.current).toHaveProperty('name');
      expect(result.current).toHaveProperty('background');
      expect(result.current).toHaveProperty('paddle');
      expect(result.current).toHaveProperty('ball');
      expect(result.current).toHaveProperty('centerLine');
      expect(result.current).toHaveProperty('score');
      expect(result.current).toHaveProperty('powerUp');
    });

    it('should return theme with valid background gradient', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.background.gradient).toBeInstanceOf(Array);
      expect(result.current.background.gradient.length).toBeGreaterThan(0);
      expect(result.current.background.animated).toBeDefined();
      expect(result.current.background.animationSpeed).toBeGreaterThan(0);
    });
  });

  describe('Performance and memoization', () => {
    it('should memoize theme object when dependencies do not change', () => {
      const { result, rerender } = renderHook(() => useTheme());
      const firstTheme = result.current;

      rerender();
      const secondTheme = result.current;

      // Should be the same reference (memoized)
      expect(firstTheme).toBe(secondTheme);
    });

    it('should return new theme object when mode changes', () => {
      const { result, rerender } = renderHook(() => useTheme());
      const firstTheme = result.current;

      act(() => {
        useGameStore.setState({ currentMode: 'puzzle' });
      });
      rerender();
      const secondTheme = result.current;

      // Should be different objects
      expect(firstTheme).not.toBe(secondTheme);
    });
  });
});

describe('useCurrentThemeId hook', () => {
  beforeEach(() => {
    useGameStore.setState({
      currentMode: 'menu',
      currentTheme: 'synthwave-sunset',
      soundEnabled: true,
      settingsPanelOpen: false,
    });
  });

  describe('Theme ID retrieval', () => {
    it('should return theme ID for menu mode', () => {
      useGameStore.setState({ currentMode: 'menu' });
      const { result } = renderHook(() => useCurrentThemeId());

      expect(result.current).toBe('synthwave-sunset');
    });

    it('should return manually selected theme ID in menu mode', () => {
      useGameStore.setState({
        currentMode: 'menu',
        currentTheme: 'arctic-glass',
      });
      const { result } = renderHook(() => useCurrentThemeId());

      expect(result.current).toBe('arctic-glass');
    });

    it('should return mode-specific theme ID for puzzle mode', () => {
      useGameStore.setState({ currentMode: 'puzzle' });
      const { result } = renderHook(() => useCurrentThemeId());

      expect(result.current).toBe('puzzle-logic');
    });

    it('should return mode-specific theme ID for rhythm mode', () => {
      useGameStore.setState({ currentMode: 'rhythm' });
      const { result } = renderHook(() => useCurrentThemeId());

      expect(result.current).toBe('rhythm-beats');
    });

    it('should return mode-specific theme ID for battle-royale mode', () => {
      useGameStore.setState({ currentMode: 'battle-royale' });
      const { result } = renderHook(() => useCurrentThemeId());

      expect(result.current).toBe('battle-intensity');
    });

    it('should return mode-specific theme ID for editor mode', () => {
      useGameStore.setState({ currentMode: 'editor' });
      const { result } = renderHook(() => useCurrentThemeId());

      expect(result.current).toBe('editor-pro');
    });
  });

  describe('Theme ID reactivity', () => {
    it('should update when mode changes', () => {
      const { result, rerender } = renderHook(() => useCurrentThemeId());

      expect(result.current).toBe('synthwave-sunset');

      act(() => {
        useGameStore.setState({ currentMode: 'rhythm' });
      });
      rerender();

      expect(result.current).toBe('rhythm-beats');
    });

    it('should update when manual theme changes in menu', () => {
      useGameStore.setState({ currentMode: 'menu' });
      const { result, rerender } = renderHook(() => useCurrentThemeId());

      expect(result.current).toBe('synthwave-sunset');

      act(() => {
        useGameStore.setState({ currentTheme: 'editor-pro' });
      });
      rerender();

      expect(result.current).toBe('editor-pro');
    });
  });

  describe('Fallback behavior', () => {
    it('should fall back to synthwave-sunset for invalid mode', () => {
      // @ts-expect-error Testing invalid mode
      useGameStore.setState({ currentMode: 'invalid-mode' });
      const { result } = renderHook(() => useCurrentThemeId());

      expect(result.current).toBe('synthwave-sunset');
    });
  });

  describe('Integration with MODE_THEMES', () => {
    it('should return valid theme IDs that exist in THEMES registry', () => {
      const modes = ['menu', 'classic', 'puzzle', 'rhythm', 'battle-royale', 'editor'] as const;

      modes.forEach((mode) => {
        act(() => {
          useGameStore.setState({ currentMode: mode });
        });
        const { result } = renderHook(() => useCurrentThemeId());
        const themeId = result.current;

        // Theme ID should exist in THEMES
        expect(THEMES[themeId]).toBeDefined();
      });
    });
  });
});
