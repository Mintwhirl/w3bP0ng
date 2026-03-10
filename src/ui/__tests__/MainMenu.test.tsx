/**
 * Tests for MainMenu component
 */

import { describe, it, expect, beforeEach } from 'vitest';
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
    it('should show all modes as available', () => {
      render(<MainMenu />);
      
      expect(screen.getByLabelText(/Classic Mode - Available/i)).not.toBeDisabled();
      expect(screen.getByLabelText(/Physics Puzzle - Available/i)).not.toBeDisabled();
      expect(screen.getByLabelText(/Rhythm Mode - Available/i)).not.toBeDisabled();
      expect(screen.getByLabelText(/Battle Royale - Available/i)).not.toBeDisabled();
      expect(screen.getByLabelText(/Level Editor - Available/i)).not.toBeDisabled();
    });

    it('should not display "Coming Soon" badges', () => {
      render(<MainMenu />);
      const badges = screen.queryAllByText('Coming Soon');
      expect(badges).toHaveLength(0);
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

    it('should change to puzzle mode when clicking Physics Puzzle card', async () => {
      const user = userEvent.setup();
      render(<MainMenu />);

      const puzzleButton = screen.getByLabelText(/Physics Puzzle - Available/i);
      await user.click(puzzleButton);

      expect(useGameStore.getState().currentMode).toBe('puzzle');
    });

    it('should change to rhythm mode when clicking Rhythm Mode card', async () => {
      const user = userEvent.setup();
      render(<MainMenu />);

      const rhythmButton = screen.getByLabelText(/Rhythm Mode - Available/i);
      await user.click(rhythmButton);

      expect(useGameStore.getState().currentMode).toBe('rhythm');
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
      expect(screen.getByLabelText(/Physics Puzzle - Available/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Rhythm Mode - Available/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Battle Royale - Available/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Level Editor - Available/i)).toBeInTheDocument();
    });

    it('should have aria-label on settings button', () => {
      render(<MainMenu />);
      expect(screen.getByLabelText('Open settings')).toBeInTheDocument();
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
    it('should not apply disabled class to available mode cards', () => {
      render(<MainMenu />);

      const classicButton = screen.getByLabelText(/Classic Mode - Available/i);
      expect(classicButton).not.toHaveClass('mode-card--disabled');
      
      const puzzleButton = screen.getByLabelText(/Physics Puzzle - Available/i);
      expect(puzzleButton).not.toHaveClass('mode-card--disabled');
    });
  });
});
