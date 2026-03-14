import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useThemeStore, setTheme, getActiveTheme, getGameColors } from '../ThemeManager';
import { THEMES, LIQUID_GLASS_SUNSET, PUZZLE_LOGIC } from '../UnifiedTheme';

// Mock document for CSS variable testing
const mockStyle = {
  setProperty: vi.fn(),
};

// @ts-ignore
global.document = {
  documentElement: {
    style: mockStyle,
  },
};

describe('ThemeManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store to default
    useThemeStore.setState({ activeTheme: LIQUID_GLASS_SUNSET });
  });

  it('should have a default active theme', () => {
    const theme = getActiveTheme();
    expect(theme.id).toBe('liquid-glass-sunset');
    expect(theme.name).toBe('Liquid Glass Sunset');
  });

  it('should change theme correctly', () => {
    setTheme('puzzle-logic');
    const theme = getActiveTheme();
    expect(theme.id).toBe('puzzle-logic');
    expect(theme.name).toBe('Puzzle Logic');
  });

  it('should apply CSS variables when theme changes', () => {
    setTheme('puzzle-logic');
    
    // Check if setProperty was called for some key variables
    expect(mockStyle.setProperty).toHaveBeenCalledWith('--w3b-background-primary', PUZZLE_LOGIC.colors.background_primary);
    expect(mockStyle.setProperty).toHaveBeenCalledWith('--w3b-neon-primary', PUZZLE_LOGIC.colors.neon_primary);
    expect(mockStyle.setProperty).toHaveBeenCalledWith('--w3b-font-primary', PUZZLE_LOGIC.typography.fontFamily.primary);
  });

  it('should provide game colors correctly', () => {
    setTheme('puzzle-logic');
    const gameColors = getGameColors();
    expect(gameColors.ball.color).toBe(PUZZLE_LOGIC.game.ball.color);
    expect(gameColors.paddle_left.color).toBe(PUZZLE_LOGIC.game.paddle_left.color);
  });

  it('should fall back to default theme for invalid theme ID', () => {
    setTheme('invalid-theme-id');
    const theme = getActiveTheme();
    expect(theme.id).toBe('liquid-glass-sunset');
  });
});
