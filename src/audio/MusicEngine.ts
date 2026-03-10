import * as Tone from 'tone';

export type MusicTheme = 'main' | 'classic' | 'puzzle' | 'rhythm' | 'battle' | 'editor' | 'none';

class MusicEngine {
  private synth: Tone.PolySynth | null = null;
  private drumSynth: Tone.MembraneSynth | null = null;
  private metalSynth: Tone.MetalSynth | null = null;
  private noiseSynth: Tone.NoiseSynth | null = null;
  
  private loop: Tone.Loop | null = null;
  private currentTheme: MusicTheme = 'none';
  private isStarted = false;
  private volume: Tone.Volume;

  constructor() {
    this.volume = new Tone.Volume(-12).toDestination();
  }

  private async initialize() {
    if (this.isStarted) return;
    
    // PolySynth for melodies (SNES style square/saw)
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'square' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
    }).connect(this.volume);

    // MembraneSynth for kicks
    this.drumSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: 'sine' }
    }).connect(this.volume);

    // MetalSynth for hi-hats
    this.metalSynth = new Tone.MetalSynth({
      frequency: 200,
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5
    }).connect(this.volume);

    // NoiseSynth for snares
    this.noiseSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
    }).connect(this.volume);

    await Tone.start();
    this.isStarted = true;
  }

  public setVolume(val: number) {
    // val is 0 to 1
    const db = Tone.gainToDb(val);
    this.volume.volume.value = db - 12; // Base offset
  }

  public async setTheme(theme: MusicTheme, bpm: number = 120) {
    if (this.currentTheme === theme && theme !== 'rhythm') return;
    
    await this.initialize();
    this.stop();
    
    this.currentTheme = theme;
    Tone.getTransport().bpm.value = bpm;

    if (theme === 'none') return;

    switch (theme) {
      case 'main':
        this.setupMainTheme();
        break;
      case 'classic':
        this.setupClassicTheme();
        break;
      case 'puzzle':
        this.setupPuzzleTheme();
        break;
      case 'rhythm':
        this.setupRhythmTheme();
        break;
      case 'battle':
        this.setupBattleTheme();
        break;
      case 'editor':
        this.setupEditorTheme();
        break;
    }

    Tone.getTransport().start();
  }

  private setupMainTheme() {
    // Chill menu vibe
    this.loop = new Tone.Loop((time) => {
      this.synth?.triggerAttackRelease('C3', '8n', time);
      this.synth?.triggerAttackRelease('G3', '8n', time + Tone.Time('4n'));
      this.synth?.triggerAttackRelease('A3', '8n', time + Tone.Time('2n'));
      this.synth?.triggerAttackRelease('F3', '8n', time + Tone.Time('2n') + Tone.Time('4n'));
      
      // Soft kick on 1
      this.drumSynth?.triggerAttackRelease('C1', '8n', time);
    }, '1m').start(0);
  }

  private setupClassicTheme() {
    // Standard arcade feel
    this.loop = new Tone.Loop((time) => {
      // Bass line
      const seq = ['C2', 'C2', 'Eb2', 'F2'];
      seq.forEach((note, i) => {
        this.synth?.triggerAttackRelease(note, '16n', time + Tone.Time('4n') * i);
      });

      // Kick on 1 and 3
      this.drumSynth?.triggerAttackRelease('C1', '8n', time);
      this.drumSynth?.triggerAttackRelease('C1', '8n', time + Tone.Time('2n'));
      
      // Hat on off-beats
      this.metalSynth?.triggerAttackRelease(time + Tone.Time('8n'));
      this.metalSynth?.triggerAttackRelease(time + Tone.Time('4n') + Tone.Time('8n'));
      this.metalSynth?.triggerAttackRelease(time + Tone.Time('2n') + Tone.Time('8n'));
      this.metalSynth?.triggerAttackRelease(time + Tone.Time('2n') + Tone.Time('4n') + Tone.Time('8n'));
    }, '1m').start(0);
  }

  private setupPuzzleTheme() {
    // Plucky and thoughtful
    this.loop = new Tone.Loop((time) => {
      const notes = ['E4', 'G4', 'B4', 'A4'];
      notes.forEach((note, i) => {
        this.synth?.triggerAttackRelease(note, '16n', time + Tone.Time('4n') * i);
      });
      
      this.metalSynth?.triggerAttackRelease(time + Tone.Time('4n'));
      this.metalSynth?.triggerAttackRelease(time + Tone.Time('2n') + Tone.Time('4n'));
    }, '1m').start(0);
  }

  private setupRhythmTheme() {
    // Punchy and very rhythmic
    this.loop = new Tone.Loop((time) => {
      // Four-on-the-floor kick
      for (let i = 0; i < 4; i++) {
        this.drumSynth?.triggerAttackRelease('C1', '8n', time + Tone.Time('4n') * i);
      }
      
      // Snare on 2 and 4
      this.noiseSynth?.triggerAttackRelease('8n', time + Tone.Time('4n'));
      this.noiseSynth?.triggerAttackRelease('8n', time + Tone.Time('2n') + Tone.Time('4n'));
      
      // High energy bass synth
      const bass = ['C2', 'G1', 'C2', 'Bb1'];
      bass.forEach((note, i) => {
        this.synth?.triggerAttackRelease(note, '16n', time + Tone.Time('4n') * i);
        this.synth?.triggerAttackRelease(note, '16n', time + Tone.Time('4n') * i + Tone.Time('8n'));
      });
    }, '1m').start(0);
  }

  private setupBattleTheme() {
    // Fast and aggressive
    this.loop = new Tone.Loop((time) => {
      // Fast kick
      for (let i = 0; i < 8; i++) {
        this.drumSynth?.triggerAttackRelease('C1', '16n', time + Tone.Time('8n') * i);
      }
      
      // Aggressive synth
      const notes = ['C3', 'Eb3', 'F3', 'Gb3', 'F3', 'Eb3', 'C3', 'Bb2'];
      notes.forEach((note, i) => {
        this.synth?.triggerAttackRelease(note, '16n', time + Tone.Time('8n') * i);
      });
      
      this.noiseSynth?.triggerAttackRelease('16n', time + Tone.Time('4n'));
      this.noiseSynth?.triggerAttackRelease('16n', time + Tone.Time('2n') + Tone.Time('4n'));
    }, '1m').start(0);
  }

  private setupEditorTheme() {
    // Creative and loopable
    this.loop = new Tone.Loop((time) => {
      this.synth?.triggerAttackRelease('G3', '4n', time);
      this.synth?.triggerAttackRelease('D4', '4n', time + Tone.Time('2n'));
    }, '1m').start(0);
  }

  public stop() {
    if (this.loop) {
      this.loop.stop();
      this.loop.dispose();
      this.loop = null;
    }
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
  }
}

export const musicEngine = new MusicEngine();
