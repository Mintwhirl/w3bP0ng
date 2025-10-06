/**
 * Integration tests for App component
 * Tests navigation between menu and game modes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { useGameStore } from '../hooks/useGameStore';

// Mock PongGame component (heavy component, we just need to test routing)
vi.mock('../components/PongGame', () => ({
  default: () => <div data-testid="pong-game">Pong Game Component</div>
}));

describe('App Integration Tests', () => {
  beforeEach(() => {
    // Reset store to menu state before each test
    useGameStore.setState({
      currentMode: 'menu',
      soundEnabled: true,
      currentTheme: 'synthwave-sunset',
      settingsPanelOpen: false,
    });
  });

  describe('Initial State', () => {
    it('should render main menu by default', () => {
      render(<App />);
      expect(screen.getByText('w3bP0ng')).toBeInTheDocument();
      expect(screen.getByText('ARCADE MAYHEM UNLEASHED')).toBeInTheDocument();
    });

    it('should show all 5 game mode cards on menu', () => {
      render(<App />);
      expect(screen.getByText('Classic Mode')).toBeInTheDocument();
      expect(screen.getByText('Physics Puzzle')).toBeInTheDocument();
      expect(screen.getByText('Rhythm Mode')).toBeInTheDocument();
      expect(screen.getByText('Battle Royale')).toBeInTheDocument();
      expect(screen.getByText('Level Editor')).toBeInTheDocument();
    });
  });

  describe('Navigation to Classic Mode', () => {
    it('should navigate to classic mode when clicking Classic Mode card', async () => {
      const user = userEvent.setup();
      render(<App />);

      const classicButton = screen.getByLabelText(/Classic Mode - Available/i);
      await user.click(classicButton);

      // Should show PongGame component
      expect(screen.getByTestId('pong-game')).toBeInTheDocument();
      // Should show Web Pong title
      expect(screen.getByText('Web Pong')).toBeInTheDocument();
    });

    it('should not show menu when in classic mode', async () => {
      const user = userEvent.setup();
      render(<App />);

      const classicButton = screen.getByLabelText(/Classic Mode - Available/i);
      await user.click(classicButton);

      // Menu should not be visible
      expect(screen.queryByText('ARCADE MAYHEM UNLEASHED')).not.toBeInTheDocument();
    });

    it('should update Zustand store when navigating to classic mode', async () => {
      const user = userEvent.setup();
      render(<App />);

      const classicButton = screen.getByLabelText(/Classic Mode - Available/i);
      await user.click(classicButton);

      expect(useGameStore.getState().currentMode).toBe('classic');
    });
  });

  describe('Unavailable Modes', () => {
    it('should show coming soon page for puzzle mode', () => {
      useGameStore.setState({ currentMode: 'puzzle' });
      render(<App />);

      expect(screen.getByText('Coming Soon')).toBeInTheDocument();
      expect(screen.getByText('This game mode is under development.')).toBeInTheDocument();
    });

    it('should show coming soon page for rhythm mode', () => {
      useGameStore.setState({ currentMode: 'rhythm' });
      render(<App />);

      expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    });

    it('should show coming soon page for battle-royale mode', () => {
      useGameStore.setState({ currentMode: 'battle-royale' });
      render(<App />);

      expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    });

    it('should show coming soon page for editor mode', () => {
      useGameStore.setState({ currentMode: 'editor' });
      render(<App />);

      expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    });

    it('should have return to menu button on coming soon page', () => {
      useGameStore.setState({ currentMode: 'puzzle' });
      render(<App />);

      expect(screen.getByText('Return to Menu')).toBeInTheDocument();
    });

    it('should return to menu when clicking return button', async () => {
      const user = userEvent.setup();
      useGameStore.setState({ currentMode: 'puzzle' });
      render(<App />);

      const returnButton = screen.getByText('Return to Menu');
      await user.click(returnButton);

      expect(useGameStore.getState().currentMode).toBe('menu');
    });
  });

  describe('Settings Panel Integration', () => {
    it('should render settings panel when open', () => {
      useGameStore.setState({ settingsPanelOpen: true });
      render(<App />);

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should not render settings panel when closed', () => {
      useGameStore.setState({ settingsPanelOpen: false });
      render(<App />);

      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });

    it('should open settings panel from menu', async () => {
      const user = userEvent.setup();
      render(<App />);

      const settingsButton = screen.getByLabelText('Open settings');
      await user.click(settingsButton);

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should show settings panel overlay over game', () => {
      useGameStore.setState({ currentMode: 'classic', settingsPanelOpen: true });
      render(<App />);

      // Settings should be visible even in game mode
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      // Game should still be mounted
      expect(screen.getByTestId('pong-game')).toBeInTheDocument();
    });
  });

  describe('Mode Persistence', () => {
    it('should stay in classic mode after settings panel interaction', async () => {
      const user = userEvent.setup();
      useGameStore.setState({ currentMode: 'classic', settingsPanelOpen: true });
      render(<App />);

      const closeButton = screen.getByLabelText('Close settings');
      await user.click(closeButton);

      expect(useGameStore.getState().currentMode).toBe('classic');
      expect(screen.getByTestId('pong-game')).toBeInTheDocument();
    });
  });

  describe('Routing Logic', () => {
    it('should render menu for menu mode', () => {
      useGameStore.setState({ currentMode: 'menu' });
      render(<App />);

      expect(screen.getByText('w3bP0ng')).toBeInTheDocument();
    });

    it('should render pong game for classic mode', () => {
      useGameStore.setState({ currentMode: 'classic' });
      render(<App />);

      expect(screen.getByTestId('pong-game')).toBeInTheDocument();
    });

    it('should render coming soon for all other modes', () => {
      const unavailableModes = ['puzzle', 'rhythm', 'battle-royale', 'editor'] as const;

      unavailableModes.forEach(mode => {
        useGameStore.setState({ currentMode: mode });
        const { unmount } = render(<App />);

        expect(screen.getByText('Coming Soon')).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe('App Container', () => {
    it('should render with App class', () => {
      const { container } = render(<App />);
      const appDiv = container.querySelector('.App');
      expect(appDiv).toBeInTheDocument();
    });
  });
});
