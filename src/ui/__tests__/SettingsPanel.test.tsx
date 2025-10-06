/**
 * Tests for SettingsPanel component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPanel from '../SettingsPanel';
import { useGameStore } from '../../hooks/useGameStore';
import { THEMES } from '../../rendering/types';

describe('SettingsPanel', () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.setState({
      currentMode: 'menu',
      soundEnabled: true,
      currentTheme: 'synthwave-sunset',
      settingsPanelOpen: false,
    });
  });

  describe('Visibility', () => {
    it('should not render when panel is closed', () => {
      render(<SettingsPanel />);
      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });

    it('should render when panel is open', () => {
      useGameStore.setState({ settingsPanelOpen: true });
      render(<SettingsPanel />);
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  describe('Panel Structure', () => {
    beforeEach(() => {
      useGameStore.setState({ settingsPanelOpen: true });
    });

    it('should render the settings title', () => {
      render(<SettingsPanel />);
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<SettingsPanel />);
      expect(screen.getByLabelText('Close settings')).toBeInTheDocument();
    });

    it('should render Audio section', () => {
      render(<SettingsPanel />);
      expect(screen.getByText('Audio')).toBeInTheDocument();
    });

    it('should render Visual Theme section', () => {
      render(<SettingsPanel />);
      expect(screen.getByText('Visual Theme')).toBeInTheDocument();
    });

    it('should render About section', () => {
      render(<SettingsPanel />);
      expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('should render version info', () => {
      render(<SettingsPanel />);
      expect(screen.getByText(/w3bP0ng v0.1.0/i)).toBeInTheDocument();
    });
  });

  describe('Sound Toggle', () => {
    beforeEach(() => {
      useGameStore.setState({ settingsPanelOpen: true, soundEnabled: true });
    });

    it('should render sound effects toggle', () => {
      render(<SettingsPanel />);
      expect(screen.getByText('Sound Effects')).toBeInTheDocument();
    });

    it('should show sound as enabled initially', () => {
      render(<SettingsPanel />);
      const toggle = screen.getByLabelText('Sound enabled');
      expect(toggle).toBeInTheDocument();
      expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });

    it('should toggle sound when clicking toggle button', async () => {
      const user = userEvent.setup();
      render(<SettingsPanel />);

      const toggle = screen.getByLabelText('Sound enabled');
      await user.click(toggle);

      expect(useGameStore.getState().soundEnabled).toBe(false);
    });

    it('should update aria-pressed attribute when toggled', async () => {
      const user = userEvent.setup();
      render(<SettingsPanel />);

      const toggle = screen.getByLabelText('Sound enabled');
      await user.click(toggle);

      const disabledToggle = screen.getByLabelText('Sound disabled');
      expect(disabledToggle).toHaveAttribute('aria-pressed', 'false');
    });

    it('should toggle sound multiple times', async () => {
      const user = userEvent.setup();
      render(<SettingsPanel />);

      const enabledToggle = screen.getByLabelText('Sound enabled');
      await user.click(enabledToggle); // disabled

      const disabledToggle = screen.getByLabelText('Sound disabled');
      await user.click(disabledToggle); // enabled again

      expect(useGameStore.getState().soundEnabled).toBe(true);
    });
  });

  describe('Theme Selection', () => {
    beforeEach(() => {
      useGameStore.setState({ settingsPanelOpen: true, currentTheme: 'synthwave-sunset' });
    });

    it('should render all available themes', () => {
      render(<SettingsPanel />);

      Object.values(THEMES).forEach((theme) => {
        expect(screen.getByText(theme.name)).toBeInTheDocument();
      });
    });

    it('should show current theme as active', () => {
      render(<SettingsPanel />);

      const sunsetButton = screen.getByLabelText(/Select Synthwave Sunset theme/i);
      expect(sunsetButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should show checkmark on active theme', () => {
      render(<SettingsPanel />);

      const sunsetButton = screen.getByLabelText(/Select Synthwave Sunset theme/i);
      expect(sunsetButton.textContent).toContain('✓');
    });

    it('should change theme when clicking theme option', async () => {
      const user = userEvent.setup();
      render(<SettingsPanel />);

      const arcticButton = screen.getByLabelText(/Select Arctic Glass theme/i);
      await user.click(arcticButton);

      expect(useGameStore.getState().currentTheme).toBe('arctic-glass');
    });

    it('should update active state when theme changes', async () => {
      const user = userEvent.setup();
      render(<SettingsPanel />);

      const arcticButton = screen.getByLabelText(/Select Arctic Glass theme/i);
      await user.click(arcticButton);

      expect(arcticButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should render theme previews', () => {
      const { container } = render(<SettingsPanel />);

      const previews = container.querySelectorAll('.theme-preview');
      expect(previews.length).toBe(Object.keys(THEMES).length);
    });

    it('should render theme previews with inline styles', () => {
      const { container } = render(<SettingsPanel />);

      const firstPreview = container.querySelector('.theme-preview');
      expect(firstPreview).toBeInTheDocument();
      expect(firstPreview).toHaveAttribute('style');
    });
  });

  describe('Close Functionality', () => {
    beforeEach(() => {
      useGameStore.setState({ settingsPanelOpen: true });
    });

    it('should close panel when clicking close button', async () => {
      const user = userEvent.setup();
      render(<SettingsPanel />);

      const closeButton = screen.getByLabelText('Close settings');
      await user.click(closeButton);

      expect(useGameStore.getState().settingsPanelOpen).toBe(false);
    });

    it('should close panel when clicking overlay', async () => {
      const user = userEvent.setup();
      const { container } = render(<SettingsPanel />);

      const overlay = container.querySelector('.settings-overlay');
      if (overlay) {
        await user.click(overlay);
      }

      expect(useGameStore.getState().settingsPanelOpen).toBe(false);
    });

    it('should not close when clicking panel content', async () => {
      const user = userEvent.setup();
      const { container } = render(<SettingsPanel />);

      const panel = container.querySelector('.settings-panel');
      if (panel) {
        await user.click(panel);
      }

      expect(useGameStore.getState().settingsPanelOpen).toBe(true);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      useGameStore.setState({ settingsPanelOpen: true });
    });

    it('should have dialog role', () => {
      const { container } = render(<SettingsPanel />);
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toBeInTheDocument();
    });

    it('should have aria-labelledby attribute', () => {
      const { container } = render(<SettingsPanel />);
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveAttribute('aria-labelledby', 'settings-title');
    });

    it('should have aria-modal attribute', () => {
      const { container } = render(<SettingsPanel />);
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have proper aria-labels on theme buttons', () => {
      render(<SettingsPanel />);

      Object.values(THEMES).forEach((theme) => {
        expect(screen.getByLabelText(`Select ${theme.name} theme`)).toBeInTheDocument();
      });
    });

    it('should have aria-pressed on toggle button', () => {
      render(<SettingsPanel />);
      const toggle = screen.getByLabelText(/Sound (enabled|disabled)/);
      expect(toggle).toHaveAttribute('aria-pressed');
    });
  });

  describe('State Persistence', () => {
    it('should maintain theme selection when reopening panel', async () => {
      const user = userEvent.setup();
      useGameStore.setState({ settingsPanelOpen: true, currentTheme: 'arctic-glass' });

      const { unmount } = render(<SettingsPanel />);
      unmount();

      render(<SettingsPanel />);

      const arcticButton = screen.getByLabelText(/Select Arctic Glass theme/i);
      expect(arcticButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should maintain sound setting when reopening panel', async () => {
      useGameStore.setState({ settingsPanelOpen: true, soundEnabled: false });

      const { unmount } = render(<SettingsPanel />);
      unmount();

      render(<SettingsPanel />);

      const toggle = screen.getByLabelText('Sound disabled');
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
    });
  });
});
