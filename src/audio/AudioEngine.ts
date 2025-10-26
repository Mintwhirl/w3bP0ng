/**
 * Audio Engine
 * Centralized audio bus for music, SFX, and ambient sounds
 * Per-mode audio themes with cross-fade mixing
 */

import { saveSaveData, loadSaveData } from '../utils/saveManager';

// ═════════════════════════════════════════════════════════
// AUDIO CONFIGURATION
// ═════════════════════════════════════════════════════════

export interface AudioTheme {
  name: string;
  musicTrack?: string;
  ambientTrack?: string;
  volumeMultiplier: number;
  crossFadeDuration: number;
}

export interface SoundEffect {
  id: string;
  url?: string;
  volume: number;
  pitch?: number;
}

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  soundEnabled: boolean;
}

// Per-mode audio themes
export const AUDIO_THEMES: Record<string, AudioTheme> = {
  main: {
    name: 'Main Menu',
    musicTrack: 'ambient-synthwave',
    volumeMultiplier: 0.6,
    crossFadeDuration: 800,
  },
  classic: {
    name: 'Classic Mode',
    musicTrack: 'retro-arcade',
    ambientTrack: 'electric-hum',
    volumeMultiplier: 0.8,
    crossFadeDuration: 600,
  },
  puzzle: {
    name: 'Physics Puzzle',
    musicTrack: 'puzzle-ambient',
    volumeMultiplier: 0.5,
    crossFadeDuration: 800,
  },
  rhythm: {
    name: 'Rhythm Mode',
    musicTrack: 'beat-sync',
    volumeMultiplier: 0.9,
    crossFadeDuration: 400,
  },
  battle: {
    name: 'Battle Royale',
    musicTrack: 'intense-battle',
    ambientTrack: 'tension-hum',
    volumeMultiplier: 1.0,
    crossFadeDuration: 300,
  },
  editor: {
    name: 'Level Editor',
    musicTrack: 'chillwave-mix',
    volumeMultiplier: 0.4,
    crossFadeDuration: 1000,
  },
};

// Sound effect definitions
export const SOUND_EFFECTS: Record<string, SoundEffect> = {
  // UI Sounds
  menuClick: { volume: 0.3 },
  menuHover: { volume: 0.2 },
  menuBack: { volume: 0.4 },
  achievementUnlock: { volume: 0.7, pitch: 1.2 },

  // Game Sounds
  ballHit: { volume: 0.6 },
  paddleHit: { volume: 0.5 },
  blockBreak: { volume: 0.8 },
  portalEnter: { volume: 0.7, pitch: 0.8 },
  portalExit: { volume: 0.7, pitch: 1.2 },

  // Power-ups
  powerUpCollect: { volume: 0.8, pitch: 1.5 },
  powerUpActivate: { volume: 0.9 },

  // Level Events
  levelComplete: { volume: 0.9, pitch: 1.3 },
  levelFail: { volume: 0.7, pitch: 0.7 },
  comboIncrease: { volume: 0.5, pitch: 1.1 },

  // Battle Royale
  elimination: { volume: 0.8 },
  playerJoin: { volume: 0.4 },
  playerLeave: { volume: 0.4 },
  countdown: { volume: 0.6 },

  // Editor
  placeObject: { volume: 0.3 },
  deleteObject: { volume: 0.3 },
  selectObject: { volume: 0.2 },
  snapToGrid: { volume: 0.1 },
};

// ═════════════════════════════════════════════════════════
// AUDIO ENGINE CLASS
// ═════════════════════════════════════════════════════════

export class AudioEngine {
  private static instance: AudioEngine;
  private audioContext: AudioContext;
  private masterGain: GainNode;
  private musicGain: GainNode;
  private sfxGain: GainNode;

  private currentMusicSource: AudioBufferSourceNode | null = null;
  private currentAmbientSource: AudioBufferSourceNode | null = null;
  private currentTheme: string = 'main';
  private musicBuffers: Map<string, AudioBuffer> = new Map();
  private sfxBuffers: Map<string, AudioBuffer> = new Map();

  private settings: AudioSettings = {
    masterVolume: 0.8,
    musicVolume: 0.7,
    sfxVolume: 0.8,
    soundEnabled: true,
  };

  private audioLoaded = false;
  private loadingPromises: Promise<void>[] = [];

  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  private constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create gain nodes for volume control
    this.masterGain = this.audioContext.createGain();
    this.musicGain = this.audioContext.createGain();
    this.sfxGain = this.audioContext.createGain();

    // Connect nodes
    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);

    // Load settings
    this.loadSettings();

    // Load audio files
    this.loadAudioFiles();

    // Handle page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  // ═════════════════════════════════════════════════════════
  // AUDIO LOADING
  // ═════════════════════════════════════════════════════════

  private async loadAudioFiles(): Promise<void> {
    // Generate procedural audio for demo purposes
    // In production, load actual audio files

    await this.loadProceduralAudio();
    this.audioLoaded = true;
  }

  private async loadProceduralAudio(): Promise<void> {
    // Create procedural audio for demonstration
    // Music tracks
    for (const theme of Object.values(AUDIO_THEMES)) {
      if (theme.musicTrack) {
        this.musicBuffers.set(theme.musicTrack, await this.createProceduralMusic(theme.musicTrack));
      }
      if (theme.ambientTrack) {
        this.musicBuffers.set(theme.ambientTrack, await this.createProceduralAmbient(theme.ambientTrack));
      }
    }

    // Sound effects
    for (const [id, effect] of Object.entries(SOUND_EFFECTS)) {
      this.sfxBuffers.set(id, await this.createProceduralSFX(id, effect));
    }
  }

  private async createProceduralMusic(trackType: string): Promise<AudioBuffer> {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 30; // 30 seconds loop
    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
    const dataL = buffer.getChannelData(0);
    const dataR = buffer.getChannelData(1);

    for (let i = 0; i < dataL.length; i++) {
      const t = i / sampleRate;
      let value = 0;

      switch (trackType) {
        case 'ambient-synthwave':
          value = this.synthwavePad(t);
          break;
        case 'retro-arcade':
          value = this.retroArcade(t);
          break;
        case 'puzzle-ambient':
          value = this.puzzleAmbient(t);
          break;
        case 'beat-sync':
          value = this.beatSync(t);
          break;
        case 'intense-battle':
          value = this.intenseBattle(t);
          break;
        case 'chillwave-mix':
          value = this.chillwave(t);
          break;
        case 'electric-hum':
          value = this.electricHum(t);
          break;
        default:
          value = 0;
      }

      dataL[i] = value * 0.3; // Volume reduction
      dataR[i] = value * 0.3;
    }

    return buffer;
  }

  private async createProceduralAmbient(ambientType: string): Promise<AudioBuffer> {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 20;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      let value = 0;

      switch (ambientType) {
        case 'tension-hum':
          value = this.tensionHum(t);
          break;
        default:
          value = 0;
      }

      data[i] = value * 0.1; // Low volume for ambient
    }

    return buffer;
  }

  private async createProceduralSFX(sfxId: string, effect: SoundEffect): Promise<AudioBuffer> {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.2; // 200ms default
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      let value = 0;

      switch (sfxId) {
        case 'ballHit':
        value = this.ballHit(t);
          break;
        case 'paddleHit':
          value = this.paddleHit(t);
          break;
        case 'blockBreak':
          value = this.blockBreak(t);
          break;
        case 'menuClick':
          value = this.menuClick(t);
          break;
        case 'achievementUnlock':
          value = this.achievementSound(t);
          break;
        default:
          value = Math.random() * 0.1 - 0.05; // White noise for unknown SFX
      }

      data[i] = value * effect.volume;
    }

    return buffer;
  }

  // ═════════════════════════════════════════════════════════
  // PROCEDURAL AUDIO GENERATORS
  // ═════════════════════════════════════════════════════════

  private synthwavePad(t: number): number {
    const note1 = Math.sin(2 * Math.PI * 110 * t); // A2
    const note2 = Math.sin(2 * Math.PI * 220 * t) * 0.5; // A3
    const filter = Math.sin(2 * Math.PI * 0.5 * t) * 0.3;

    return (note1 + note2 + filter) * Math.sin(2 * Math.PI * 0.1 * t);
  }

  private retroArcade(t: number): number {
    const squareWave = Math.sign(Math.sin(2 * Math.PI * 440 * t));
    const arpeggio = Math.sign(Math.sin(2 * Math.PI * 220 * t)) * 0.3 +
                    Math.sign(Math.sin(2 * Math.PI * 330 * t)) * 0.2 +
                    Math.sign(Math.sin(2 * Math.PI * 440 * t)) * 0.1;

    return (squareWave * 0.4 + arpeggio) * 0.5;
  }

  private puzzleAmbient(t: number): number {
    const drone1 = Math.sin(2 * Math.PI * 80 * t);
    const drone2 = Math.sin(2 * Math.PI * 120 * t) * 0.7;
    const modulation = Math.sin(2 * Math.PI * 0.2 * t);

    return (drone1 + drone2) * modulation * 0.3;
  }

  private beatSync(t: number): number {
    const kick = t % 1 < 0.1 ? 1 : 0;
    const snare = (t % 1 > 0.5 && t % 1 < 0.6) ? 1 : 0;
    const hihat = Math.sin(2 * Math.PI * 800 * t) * 0.1;

    return (kick * 0.4 + snare * 0.3 + hihat) * 0.5;
  }

  private intenseBattle(t: number): number {
    const bass = Math.sign(Math.sin(2 * Math.PI * 60 * t)) * 0.5;
    const lead = Math.sin(2 * Math.PI * 440 * t) * Math.sin(2 * Math.PI * 10 * t);
    const percussion = t % 0.5 < 0.05 ? 1 : 0;

    return (bass + lead * 0.3 + percussion * 0.4) * 0.6;
  }

  private chillwave(t: number): number {
    const pad = Math.sin(2 * Math.PI * 110 * t) * Math.sin(2 * Math.PI * 0.1 * t);
    const melody = Math.sin(2 * Math.PI * 220 * Math.pow(2, Math.floor(t * 4) / 4)) * 0.3;

    return (pad + melody) * 0.4;
  }

  private electricHum(t: number): number {
    const noise = (Math.random() - 0.5) * 0.02;
    const hum = Math.sin(2 * Math.PI * 50 * t) + Math.sin(2 * Math.PI * 150 * t) * 0.3;

    return (hum + noise) * 0.1;
  }

  private tensionHum(t: number): number {
    const lowFreq = Math.sin(2 * Math.PI * 30 * t);
    const highFreq = Math.sin(2 * Math.PI * 200 * t) * Math.random() * 0.1;
    const modulation = Math.sin(2 * Math.PI * 0.1 * t);

    return (lowFreq + highFreq) * modulation * 0.2;
  }

  private ballHit(t: number): number {
    const envelope = t < 0.01 ? 1 : Math.exp(-t * 50);
    const frequency = 440 + Math.random() * 440;
    const tone = Math.sin(2 * Math.PI * frequency * t);

    return tone * envelope;
  }

  private paddleHit(t: number): number {
    const envelope = t < 0.005 ? 1 : Math.exp(-t * 200);
    const tone = Math.sin(2 * Math.PI * 300 * t) + Math.sin(2 * Math.PI * 900 * t) * 0.3;

    return tone * envelope * 0.5;
  }

  private blockBreak(t: number): number {
    const envelope = Math.exp(-t * 20);
    const noise = (Math.random() - 0.5) * 0.5;
    const tone = Math.sin(2 * Math.PI * 880 * t);

    return (tone + noise) * envelope;
  }

  private menuClick(t: number): number {
    const envelope = t < 0.002 ? 1 : Math.exp(-t * 500);
    const frequency = 1000;
    const tone = Math.sin(2 * Math.PI * frequency * t);

    return tone * envelope * 0.3;
  }

  private achievementSound(t: number): number {
    const envelope = t < 0.01 ? 1 : Math.exp(-t * 8);
    const arpeggio = (
      Math.sin(2 * Math.PI * 523 * t) * 0.5 +
      Math.sin(2 * Math.PI * 659 * t) * 0.3 +
      Math.sin(2 * Math.PI * 784 * t) * 0.2
    );

    return arpeggio * envelope * 0.4;
  }

  // ═════════════════════════════════════════════════════════
  // MUSIC CONTROL
  // ═════════════════════════════════════════════════════════

  setTheme(themeName: string, crossFade: boolean = true): void {
    if (!this.audioLoaded) return;

    const theme = AUDIO_THEMES[themeName];
    if (!theme) {
      console.error(`Audio theme not found: ${themeName}`);
      return;
    }

    if (crossFade && this.currentTheme !== themeName) {
      this.crossFadeTheme(themeName, theme);
    } else {
      this.switchTheme(themeName, theme);
    }
  }

  private async crossFadeTheme(newThemeName: string, newTheme: AudioTheme): Promise<void> {
    const oldTheme = AUDIO_THEMES[this.currentTheme];
    const fadeDuration = newTheme.crossFadeDuration;

    // Create fade-out gain for current music
    const fadeOutGain = this.audioContext.createGain();
    fadeOutGain.gain.value = 1;

    // Start new music at zero volume
    this.switchTheme(newThemeName, newTheme, 0);

    // Fade out old and in new
    fadeOutGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + fadeDuration / 1000);

    // Apply crossfade to new music gain
    this.musicGain.gain.linearRampToValueAtTime(
      this.getMusicGainValue(newTheme),
      this.audioContext.currentTime + fadeDuration / 1000
    );

    // Clean up old sources after fade
    setTimeout(() => {
      if (this.currentMusicSource) {
        this.currentMusicSource.stop();
        this.currentMusicSource = null;
      }
      if (this.currentAmbientSource) {
        this.currentAmbientSource.stop();
        this.currentAmbientSource = null;
      }
    }, fadeDuration);
  }

  private switchTheme(themeName: string, theme: AudioTheme, startVolume?: number): void {
    if (!this.audioLoaded) return;

    // Stop current sources
    if (this.currentMusicSource) {
      try {
        this.currentMusicSource.stop();
      } catch (e) {
        // Ignore errors from already stopped sources
      }
    }
    if (this.currentAmbientSource) {
      try {
        this.currentAmbientSource.stop();
      } catch (e) {
        // Ignore errors from already stopped sources
      }
    }

    // Start new music
    if (theme.musicTrack && this.musicBuffers.has(theme.musicTrack)) {
      const musicBuffer = this.musicBuffers.get(theme.musicTrack)!;
      const musicSource = this.audioContext.createBufferSource();
      musicSource.buffer = musicBuffer;
      musicSource.loop = true;
      musicSource.connect(this.musicGain);

      musicSource.start();
      this.currentMusicSource = musicSource;
    }

    // Start ambient
    if (theme.ambientTrack && this.musicBuffers.has(theme.ambientTrack)) {
      const ambientBuffer = this.musicBuffers.get(theme.ambientTrack)!;
      const ambientSource = this.audioContext.createBufferSource();
      ambientSource.buffer = ambientBuffer;
      ambientSource.loop = true;
      ambientSource.connect(this.musicGain);

      ambientSource.start();
      this.currentAmbientSource = ambientSource;
    }

    this.currentTheme = themeName;

    // Set volume
    if (startVolume !== undefined) {
      this.musicGain.gain.value = startVolume;
    } else {
      this.musicGain.gain.value = this.getMusicGainValue(theme);
    }
  }

  private getMusicGainValue(theme: AudioTheme): number {
    return this.settings.masterVolume * this.settings.musicVolume * theme.volumeMultiplier;
  }

  // ═════════════════════════════════════════════════════════
  // SOUND EFFECTS
  // ═════════════════════════════════════════════════════════

  playSoundEffect(soundId: string, volumeMultiplier: number = 1): void {
    if (!this.audioLoaded || !this.settings.soundEnabled) return;

    const effect = SOUND_EFFECTS[soundId];
    if (!effect || !this.sfxBuffers.has(soundId)) {
      console.warn(`Sound effect not found: ${soundId}`);
      return;
    }

    const buffer = this.sfxBuffers.get(soundId)!;
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    // Apply pitch variation if specified
    if (effect.pitch && effect.pitch !== 1) {
      source.playbackRate.value = effect.pitch;
    }

    source.connect(this.sfxGain);
    source.start();

    // Clean up after playback
    source.onended = () => {
      source.disconnect();
    };
  }

  // ═════════════════════════════════════════════════════════
  // SETTINGS MANAGEMENT
  // ═════════════════════════════════════════════════════════

  updateSettings(settings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.applySettings();
    this.saveSettings();
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  private applySettings(): void {
    // Apply volume settings
    this.masterGain.gain.value = this.settings.masterVolume;
    this.musicGain.gain.value = this.getMusicGainValue(AUDIO_THEMES[this.currentTheme]);
    this.sfxGain.gain.value = this.settings.masterVolume * this.settings.sfxVolume;

    // Handle mute
    if (!this.settings.soundEnabled) {
      this.masterGain.gain.value = 0;
    }
  }

  private loadSettings(): void {
    try {
      const saveData = loadSaveData();
      if (saveData.settings) {
        this.settings = {
          masterVolume: saveData.settings.musicVolume || 0.8,
          musicVolume: saveData.settings.musicVolume || 0.7,
          sfxVolume: saveData.settings.sfxVolume || 0.8,
          soundEnabled: saveData.settings.soundEnabled !== false,
        };
      }
    } catch (error) {
      console.error('Failed to load audio settings:', error);
    }

    this.applySettings();
  }

  private saveSettings(): void {
    try {
      const saveData = loadSaveData();
      saveData.settings = {
        musicVolume: this.settings.musicVolume,
        sfxVolume: this.settings.sfxVolume,
        soundEnabled: this.settings.soundEnabled,
      };
      saveSaveData(saveData);
    } catch (error) {
      console.error('Failed to save audio settings:', error);
    }
  }

  // ═════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═════════════════════════════════════════════════════════

  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Page hidden - pause audio
      this.pauseAudio();
    } else {
      // Page visible - resume audio
      this.resumeAudio();
    }
  }

  private pauseAudio(): void {
    try {
      if (this.audioContext.state === 'running') {
        this.audioContext.suspend();
      }
    } catch (error) {
      // Ignore suspension errors
    }
  }

  private resumeAudio(): void {
    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
    } catch (error) {
      // Ignore resume errors
    }
  }

  getAudioInfo(): {
    isLoaded: boolean;
    contextState: string;
    currentTheme: string;
    loadedMusicTracks: number;
    loadedSFX: number;
  } {
    return {
      isLoaded: this.audioLoaded,
      contextState: this.audioContext.state,
      currentTheme: this.currentTheme,
      loadedMusicTracks: this.musicBuffers.size,
      loadedSFX: this.sfxBuffers.size,
    };
  }

  // Cleanup
  dispose(): void {
    try {
      if (this.currentMusicSource) {
        this.currentMusicSource.stop();
      }
      if (this.currentAmbientSource) {
        this.currentAmbientSource.stop();
      }
      this.audioContext.close();
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

// ═════════════════════════════════════════════════════════
// GLOBAL INSTANCE AND EXPORTS
// ═════════════════════════════════════════════════════════

export const audioEngine = AudioEngine.getInstance();

// Convenience functions
export function setAudioTheme(themeName: string): void {
  audioEngine.setTheme(themeName);
}

export function playSoundEffect(soundId: string): void {
  audioEngine.playSoundEffect(soundId);
}

export function updateAudioSettings(settings: Partial<AudioSettings>): void {
  audioEngine.updateSettings(settings);
}

export function getAudioSettings(): AudioSettings {
  return audioEngine.getSettings();
}