/**
 * Tests for MainMenu component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MainMenu from '../MainMenu';
import { useGameStore, GAME_MODES } from '../../hooks/useGameStore';

describe('MainMenu', () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.setState({
      currentMode: 'menu',
      soundEnabled: true,
      currentTheme: 'synthwave-sunset',
      settingsPanelOpen: false,
    });
  });

  describe('Rendering', () => {
    it('should render the main menu title', () => {
      render(<MainMenu />);
      expect(screen.getByText('w3bP0ng')).toBeInTheDocument();
    });

    it('should render the subtitle', () => {
      render(<MainMenu />);
      expect(screen.getByText('ARCADE MAYHEM UNLEASHED')).toBeInTheDocument();
    });

    it('should render all 5 game mode cards', () => {
      render(<MainMenu />);
      GAME_MODES.forEach((mode) => {
        expect(screen.getByText(mode.name)).toBeInTheDocument();
      });
    });

    it('should render mode descriptions', () => {
      render(<MainMenu />);
      GAME_MODES.forEach((mode) => {
        expect(screen.getByText(mode.description)).toBeInTheDocument();
      });
    });

    it('should render settings button', () => {
      render(<MainMenu />);
      expect(screen.getByLabelText('Open settings')).toBeInTheDocument();
    });

    it('should render footer with GitHub link', () => {
      render(<MainMenu />);
      const githubLink = screen.getByText('View Source on GitHub');
      expect(githubLink).toBeInTheDocument();
      expect(githubLink).toHaveAttribute('href', 'https://github.com/mintwhirl/w3bP0ng');
    });
  });

  describe('Mode Availability', () => {
    it('should show Classic Mode as available', () => {
      render(<MainMenu />);
      const classicButton = screen.getByLabelText(/Classic Mode - Available/i);
      expect(classicButton).not.toBeDisabled();
    });

    it('should show Physics Puzzle as coming soon', () => {
      render(<MainMenu />);
      const puzzleButton = screen.getByLabelText(/Physics Puzzle - Coming Soon/i);
      expect(puzzleButton).toBeDisabled();
    });

    it('should show Rhythm Mode as coming soon', () => {
      render(<MainMenu />);
      const rhythmButton = screen.getByLabelText(/Rhythm Mode - Coming Soon/i);
      expect(rhythmButton).toBeDisabled();
    });

    it('should show Battle Royale as coming soon', () => {
      render(<MainMenu />);
      const battleButton = screen.getByLabelText(/Battle Royale - Coming Soon/i);
      expect(battleButton).toBeDisabled();
    });

    it('should show Level Editor as coming soon', () => {
      render(<MainMenu />);
      const editorButton = screen.getByLabelText(/Level Editor - Coming Soon/i);
      expect(editorButton).toBeDisabled();
    });

    it('should display "Coming Soon" badges on unavailable modes', () => {
      render(<MainMenu />);
      const badges = screen.getAllByText('Coming Soon');
      expect(badges).toHaveLength(4); // 4 unavailable modes
    });
  });

  describe('Mode Selection', () => {
    it('should change to classic mode when clicking Classic Mode card', async () => {
      const user = userEvent.setup();
      render(<MainMenu />);

      const classicButton = screen.getByLabelText(/Classic Mode - Available/i);
      await user.click(classicButton);

      expect(useGameStore.getState().currentMode).toBe('classic');
    });

    it('should not change mode when clicking disabled mode card', async () => {
      const user = userEvent.setup();
      render(<MainMenu />);

      const puzzleButton = screen.getByLabelText(/Physics Puzzle - Coming Soon/i);
      await user.click(puzzleButton);

      expect(useGameStore.getState().currentMode).toBe('menu');
    });

    it('should maintain current mode state after clicking disabled modes', async () => {
      const user = userEvent.setup();
      render(<MainMenu />);

      const rhythmButton = screen.getByLabelText(/Rhythm Mode - Coming Soon/i);
      const battleButton = screen.getByLabelText(/Battle Royale - Coming Soon/i);

      await user.click(rhythmButton);
      await user.click(battleButton);

      expect(useGameStore.getState().currentMode).toBe('menu');
    });
  });

  describe('Settings Panel', () => {
    it('should open settings panel when clicking settings button', async () => {
      const user = userEvent.setup();
      render(<MainMenu />);

      const settingsButton = screen.getByLabelText('Open settings');
      await user.click(settingsButton);

      expect(useGameStore.getState().settingsPanelOpen).toBe(true);
    });

    it('should toggle settings panel on multiple clicks', async () => {
      const user = userEvent.setup();
      render(<MainMenu />);

      const settingsButton = screen.getByLabelText('Open settings');

      await user.click(settingsButton);
      expect(useGameStore.getState().settingsPanelOpen).toBe(true);

      await user.click(settingsButton);
      expect(useGameStore.getState().settingsPanelOpen).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-labels on mode cards', () => {
      render(<MainMenu />);

      expect(screen.getByLabelText(/Classic Mode - Available/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Physics Puzzle - Coming Soon/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Rhythm Mode - Coming Soon/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Battle Royale - Coming Soon/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Level Editor - Coming Soon/i)).toBeInTheDocument();
    });

    it('should have aria-label on settings button', () => {
      render(<MainMenu />);
      expect(screen.getByLabelText('Open settings')).toBeInTheDocument();
    });

    it('should have proper link attributes on external link', () => {
      render(<MainMenu />);
      const link = screen.getByText('View Source on GitHub');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Mode Icons', () => {
    it('should render emojis for all mode icons', () => {
      render(<MainMenu />);

      // Check that each mode's icon emoji is rendered
      const container = screen.getByText('w3bP0ng').closest('.main-menu');
      GAME_MODES.forEach((mode) => {
        expect(container?.textContent).toContain(mode.icon);
      });
    });
  });

  describe('CSS Classes', () => {
    it('should apply disabled class to unavailable mode cards', () => {
      render(<MainMenu />);

      const puzzleButton = screen.getByLabelText(/Physics Puzzle - Coming Soon/i);
      expect(puzzleButton).toHaveClass('mode-card--disabled');
    });

    it('should not apply disabled class to available mode cards', () => {
      render(<MainMenu />);

      const classicButton = screen.getByLabelText(/Classic Mode - Available/i);
      expect(classicButton).not.toHaveClass('mode-card--disabled');
    });
  });
});
