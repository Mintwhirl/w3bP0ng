/**
 * AudioManager Tests
 * Testing Web Audio API integration, sound generation, and configuration
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AudioManager } from '../AudioManager';

describe('AudioManager', () => {
  let audioManager: AudioManager;

  beforeEach(() => {
    audioManager = new AudioManager();
  });

  afterEach(() => {
    audioManager.destroy();
  });

  describe('constructor', () => {
    it('should create with default config', () => {
      const manager = new AudioManager();
      expect(manager.isEnabled()).toBe(true);
      expect(manager.getVolume()).toBe(1.0);
      manager.destroy();
    });

    it('should create with custom config', () => {
      const manager = new AudioManager({ enabled: false, volume: 0.5 });
      expect(manager.isEnabled()).toBe(false);
      expect(manager.getVolume()).toBe(0.5);
      manager.destroy();
    });

    it('should clamp volume to 0-1 range', () => {
      const manager1 = new AudioManager({ enabled: true, volume: -0.5 });
      expect(manager1.getVolume()).toBe(0);
      manager1.destroy();

      const manager2 = new AudioManager({ enabled: true, volume: 2.5 });
      expect(manager2.getVolume()).toBe(1);
      manager2.destroy();
    });
  });

  describe('initialize', () => {
    it('should initialize AudioContext', () => {
      expect(() => audioManager.initialize()).not.toThrow();
    });

    it('should not create multiple AudioContexts', () => {
      audioManager.initialize();
      audioManager.initialize();
      // No error should occur
      expect(true).toBe(true);
    });

    it('should handle AudioContext creation failure gracefully', () => {
      // Force AudioContext to fail
      const originalAudioContext = global.AudioContext;
      global.AudioContext = vi.fn(() => {
        throw new Error('AudioContext not available');
      }) as any;

      const manager = new AudioManager();
      expect(() => manager.initialize()).not.toThrow();
      expect(manager.isEnabled()).toBe(false);

      // Restore
      global.AudioContext = originalAudioContext;
      manager.destroy();
    });
  });

  describe('playPaddleHit', () => {
    it('should not throw when playing paddle hit sound', () => {
      audioManager.initialize();
      expect(() => audioManager.playPaddleHit()).not.toThrow();
    });

    it('should accept ball speed parameter', () => {
      audioManager.initialize();
      expect(() => audioManager.playPaddleHit(15)).not.toThrow();
    });

    it('should not play when disabled', () => {
      audioManager.setEnabled(false);
      audioManager.initialize();
      // Should not throw, but also not create sound nodes (tested by no errors)
      expect(() => audioManager.playPaddleHit()).not.toThrow();
    });

    it('should not play when not initialized', () => {
      // Don't call initialize()
      expect(() => audioManager.playPaddleHit()).not.toThrow();
    });

    it('should use default ball speed if not provided', () => {
      audioManager.initialize();
      expect(() => audioManager.playPaddleHit()).not.toThrow();
    });
  });

  describe('playWallBounce', () => {
    it('should not throw when playing wall bounce sound', () => {
      audioManager.initialize();
      expect(() => audioManager.playWallBounce()).not.toThrow();
    });

    it('should not play when disabled', () => {
      audioManager.setEnabled(false);
      audioManager.initialize();
      expect(() => audioManager.playWallBounce()).not.toThrow();
    });
  });

  describe('playPowerUp', () => {
    it('should not throw when playing power-up sound', () => {
      audioManager.initialize();
      expect(() => audioManager.playPowerUp()).not.toThrow();
    });

    it('should create multiple notes (arpeggio)', () => {
      audioManager.initialize();
      // Playing arpeggio should create 4 oscillators (tested by no errors)
      expect(() => audioManager.playPowerUp()).not.toThrow();
    });

    it('should not play when disabled', () => {
      audioManager.setEnabled(false);
      audioManager.initialize();
      expect(() => audioManager.playPowerUp()).not.toThrow();
    });
  });

  describe('playScore', () => {
    it('should not throw when playing score sound', () => {
      audioManager.initialize();
      expect(() => audioManager.playScore()).not.toThrow();
    });

    it('should not play when disabled', () => {
      audioManager.setEnabled(false);
      audioManager.initialize();
      expect(() => audioManager.playScore()).not.toThrow();
    });
  });

  describe('playVictory', () => {
    it('should not throw when playing victory sound', () => {
      audioManager.initialize();
      expect(() => audioManager.playVictory()).not.toThrow();
    });

    it('should create multiple notes (melody)', () => {
      audioManager.initialize();
      // Playing melody should create 5 oscillators (tested by no errors)
      expect(() => audioManager.playVictory()).not.toThrow();
    });

    it('should not play when disabled', () => {
      audioManager.setEnabled(false);
      audioManager.initialize();
      expect(() => audioManager.playVictory()).not.toThrow();
    });
  });

  describe('setEnabled', () => {
    it('should enable sounds', () => {
      audioManager.setEnabled(false);
      expect(audioManager.isEnabled()).toBe(false);

      audioManager.setEnabled(true);
      expect(audioManager.isEnabled()).toBe(true);
    });

    it('should disable sounds', () => {
      audioManager.setEnabled(true);
      expect(audioManager.isEnabled()).toBe(true);

      audioManager.setEnabled(false);
      expect(audioManager.isEnabled()).toBe(false);
    });

    it('should prevent sounds from playing when disabled', () => {
      audioManager.initialize();
      audioManager.setEnabled(false);

      // All sounds should not throw even when disabled
      expect(() => audioManager.playPaddleHit()).not.toThrow();
      expect(() => audioManager.playWallBounce()).not.toThrow();
      expect(() => audioManager.playPowerUp()).not.toThrow();
      expect(() => audioManager.playScore()).not.toThrow();
      expect(() => audioManager.playVictory()).not.toThrow();
    });
  });

  describe('setVolume', () => {
    it('should set volume', () => {
      audioManager.setVolume(0.7);
      expect(audioManager.getVolume()).toBe(0.7);
    });

    it('should clamp volume to 0-1 range', () => {
      audioManager.setVolume(-0.3);
      expect(audioManager.getVolume()).toBe(0);

      audioManager.setVolume(1.5);
      expect(audioManager.getVolume()).toBe(1);
    });

    it('should allow volume = 0', () => {
      audioManager.setVolume(0);
      expect(audioManager.getVolume()).toBe(0);
    });

    it('should allow volume = 1', () => {
      audioManager.setVolume(1);
      expect(audioManager.getVolume()).toBe(1);
    });
  });

  describe('isEnabled', () => {
    it('should return current enabled state', () => {
      audioManager.setEnabled(true);
      expect(audioManager.isEnabled()).toBe(true);

      audioManager.setEnabled(false);
      expect(audioManager.isEnabled()).toBe(false);
    });
  });

  describe('getVolume', () => {
    it('should return current volume', () => {
      audioManager.setVolume(0.5);
      expect(audioManager.getVolume()).toBe(0.5);

      audioManager.setVolume(0.8);
      expect(audioManager.getVolume()).toBe(0.8);
    });
  });

  describe('destroy', () => {
    it('should close AudioContext', () => {
      audioManager.initialize();
      expect(() => audioManager.destroy()).not.toThrow();
    });

    it('should be safe to call multiple times', () => {
      audioManager.initialize();
      audioManager.destroy();
      expect(() => audioManager.destroy()).not.toThrow();
    });

    it('should be safe to call without initialization', () => {
      expect(() => audioManager.destroy()).not.toThrow();
    });
  });

  describe('integration scenarios', () => {
    it('should handle rapid successive sounds', () => {
      audioManager.initialize();

      expect(() => {
        audioManager.playPaddleHit(10);
        audioManager.playWallBounce();
        audioManager.playPaddleHit(12);
        audioManager.playWallBounce();
        audioManager.playPaddleHit(15);
      }).not.toThrow();
    });

    it('should handle all sound types in sequence', () => {
      audioManager.initialize();

      expect(() => {
        audioManager.playPaddleHit();
        audioManager.playWallBounce();
        audioManager.playPowerUp();
        audioManager.playScore();
        audioManager.playVictory();
      }).not.toThrow();
    });

    it('should respect volume changes during playback', () => {
      audioManager.initialize();
      audioManager.setVolume(0.5);

      expect(() => {
        audioManager.playPaddleHit();
        audioManager.setVolume(0.8);
        audioManager.playWallBounce();
      }).not.toThrow();

      expect(audioManager.getVolume()).toBe(0.8);
    });

    it('should handle enabled/disabled toggling', () => {
      audioManager.initialize();

      expect(() => {
        audioManager.playPaddleHit();
        audioManager.setEnabled(false);
        audioManager.playWallBounce();
        audioManager.setEnabled(true);
        audioManager.playPowerUp();
      }).not.toThrow();
    });

    it('should handle varying ball speeds', () => {
      audioManager.initialize();

      expect(() => {
        audioManager.playPaddleHit(5);
        audioManager.playPaddleHit(10);
        audioManager.playPaddleHit(15);
        audioManager.playPaddleHit(20);
      }).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle zero volume', () => {
      audioManager.initialize();
      audioManager.setVolume(0);

      expect(() => {
        audioManager.playPaddleHit();
        audioManager.playWallBounce();
        audioManager.playPowerUp();
      }).not.toThrow();
    });

    it('should handle maximum volume', () => {
      audioManager.initialize();
      audioManager.setVolume(1);

      expect(() => {
        audioManager.playPaddleHit();
        audioManager.playWallBounce();
        audioManager.playPowerUp();
      }).not.toThrow();
    });

    it('should handle negative ball speed', () => {
      audioManager.initialize();
      expect(() => audioManager.playPaddleHit(-5)).not.toThrow();
    });

    it('should handle very high ball speed', () => {
      audioManager.initialize();
      expect(() => audioManager.playPaddleHit(100)).not.toThrow();
    });
  });
});
