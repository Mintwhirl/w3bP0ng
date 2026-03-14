import * as Tone from 'tone';

export type MusicTheme = 'main' | 'classic' | 'puzzle' | 'rhythm' | 'battle' | 'editor' | 'none';

/**
 * Procedural Chiptune Engine
 * Generates SNES/GameBoy style multi-track music using functional synthesis
 */
class MusicEngine {
  // Instruments
  private leadSynth: Tone.PolySynth | null = null;
  private bassSynth: Tone.MonoSynth | null = null;
  private padSynth: Tone.PolySynth | null = null;
  private drumSynth: Tone.MembraneSynth | null = null;
  private noiseSnare: Tone.NoiseSynth | null = null;
  private hiHat: Tone.MetalSynth | null = null;
  
  // Effects
  private masterVolume: Tone.Volume | null = null;
  private lowpass: Tone.Filter | null = null;
  private bitcrusher: Tone.BitCrusher | null = null;
  
  // State
  private currentTheme: MusicTheme = 'none';
  private baseBpm: number = 120;
  private intensity: number = 1.0;
  private loops: Tone.Loop[] = [];

  constructor() {
    // Lazy initialization on first setTheme
  }

  private setupInstruments() {
    if (this.leadSynth) return;

    console.log("[MusicEngine] Initializing Chiptune Orchestra");

    this.masterVolume = new Tone.Volume(-10).toDestination();
    this.lowpass = new Tone.Filter(4000, "lowpass").connect(this.masterVolume);
    this.bitcrusher = new Tone.BitCrusher(4).connect(this.lowpass);

    // Track 1: Square Wave Lead (The "GameBoy" Sound)
    this.leadSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'square4' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1.0 }
    }).connect(this.bitcrusher);

    // Track 2: Pulse Wave Bass (The "NES" Power)
    this.bassSynth = new Tone.MonoSynth({
      oscillator: { type: 'pulse' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.1 },
      filter: { Q: 2, type: 'lowpass', rolloff: -24 },
      filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.8, baseFrequency: 200, octaves: 2 }
    }).connect(this.bitcrusher);

    // Track 3: Triangle/Soft Wave Harmony
    this.padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.1, decay: 0.5, sustain: 0.5, release: 2.0 }
    }).connect(this.lowpass);

    // Track 4: Percussion
    this.drumSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05, octaves: 4, oscillator: { type: 'sine' }
    }).connect(this.masterVolume);

    this.noiseSnare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
    }).connect(this.masterVolume);

    this.hiHat = new Tone.MetalSynth({
      frequency: 200, envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
      harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5
    }).connect(this.masterVolume);
  }

  /**
   * Generative Music Intensity Modulator
   */
  public setIntensity(speed: number) {
    if (!this.leadSynth) return;
    
    this.intensity = Math.min(2.0, Math.max(0.5, speed / 5));

    // 1. Dynamic Tempo
    const targetBpm = Math.min(200, Math.max(80, this.baseBpm + (speed - 5) * 6));
    Tone.getTransport().bpm.rampTo(targetBpm, 0.5);

    // 2. Harmonic Brightness
    const freq = Math.min(12000, 1500 + (speed * 400));
    this.lowpass?.frequency.rampTo(freq, 0.2);
    
    // 3. Bitcrusher Depth (More "crunch" as game intensifies)
    if (this.bitcrusher) {
      const bits = Math.max(2, Math.min(8, 9 - (speed / 3)));
      this.bitcrusher.bits.value = bits;
    }
  }

  public setVolume(val: number) {
    if (!this.masterVolume) this.setupInstruments();
    const db = Tone.gainToDb(Math.max(0.0001, val));
    this.masterVolume?.volume.rampTo(db - 10, 0.1);
  }

  public async setTheme(theme: MusicTheme, bpm: number = 120) {
    if (this.currentTheme === theme && Tone.getTransport().state === 'started') return;

    this.stop();
    await Tone.start();
    this.setupInstruments();

    this.currentTheme = theme;
    this.baseBpm = bpm;
    Tone.getTransport().bpm.value = bpm;

    if (theme === 'none') return;

    switch (theme) {
      case 'main': this.composeMainTheme(); break;
      case 'classic': this.composeClassicTheme(); break;
      case 'puzzle': this.composePuzzleTheme(); break;
      case 'rhythm': this.composeRhythmTheme(); break;
      case 'battle': this.composeBattleTheme(); break;
      case 'editor': this.composeEditorTheme(); break;
    }

    await Tone.loaded();
    Tone.getTransport().start("+0.1");
  }

  /**
   * MAIN THEME: Heroic Arpeggios & Steady Beat
   */
  private composeMainTheme() {
    const scale = ['C4', 'Eb4', 'F4', 'G4', 'Bb4'];
    
    // Arpeggio Lead
    this.loops.push(new Tone.Loop((time) => {
      const pattern = [0, 2, 3, 4, 3, 2, 0, -1]; // Index mapping
      pattern.forEach((p, i) => {
        if (p === -1) return;
        const note = scale[p % scale.length];
        this.leadSynth?.triggerAttackRelease(note, '16n', time + Tone.Time('16n') * i);
      });
    }, '2n').start(0));

    // Syncopated Bass
    this.loops.push(new Tone.Loop((time) => {
      this.bassSynth?.triggerAttackRelease('C2', '8n', time);
      this.bassSynth?.triggerAttackRelease('C2', '16n', time + Tone.Time('4n') + Tone.Time('8n'));
      this.bassSynth?.triggerAttackRelease('Bb1', '8n', time + Tone.Time('2n'));
    }, '1m').start(0));

    // Basic 4-on-the-floor
    this.loops.push(new Tone.Loop((time) => {
      this.drumSynth?.triggerAttackRelease('C1', '8n', time);
      this.drumSynth?.triggerAttackRelease('C1', '8n', time + Tone.Time('4n'));
      this.drumSynth?.triggerAttackRelease('C1', '8n', time + Tone.Time('2n'));
      this.drumSynth?.triggerAttackRelease('C1', '8n', time + Tone.Time('2n') + Tone.Time('4n'));
      
      this.noiseSnare?.triggerAttackRelease('16n', time + Tone.Time('4n'));
      this.noiseSnare?.triggerAttackRelease('16n', time + Tone.Time('2n') + Tone.Time('4n'));
    }, '1m').start(0));
  }

  /**
   * CLASSIC THEME: Driving "Megaman" Style High-Energy Chiptune
   */
  private composeClassicTheme() {
    // Dynamic Bassline (Octave Jumps)
    this.loops.push(new Tone.Loop((time) => {
      const root = 'G2';
      this.bassSynth?.triggerAttackRelease(root, '16n', time);
      this.bassSynth?.triggerAttackRelease(root, '16n', time + Tone.Time('16n'));
      this.bassSynth?.triggerAttackRelease('G3', '16n', time + Tone.Time('8n'));
      this.bassSynth?.triggerAttackRelease(root, '16n', time + Tone.Time('8n') + Tone.Time('16n'));
      
      this.bassSynth?.triggerAttackRelease('F2', '16n', time + Tone.Time('4n'));
      this.bassSynth?.triggerAttackRelease('F3', '16n', time + Tone.Time('4n') + Tone.Time('8n'));
    }, '2n').start(0));

    // Melodic Motifs
    this.loops.push(new Tone.Loop((time) => {
      const melody = ['G4', 'Bb4', 'C5', 'D5', 'F5', 'D5', 'C5', 'Bb4'];
      melody.forEach((note, i) => {
        const vel = i % 2 === 0 ? 0.8 : 0.5;
        this.leadSynth?.triggerAttackRelease(note, '16n', time + Tone.Time('8n') * i, vel);
      });
    }, '1m').start(0));

    // Fast Hi-Hats & Snare
    this.loops.push(new Tone.Loop((time) => {
      for(let i=0; i<8; i++) {
        this.hiHat?.triggerAttackRelease(time + Tone.Time('8n') * i, 0.1);
      }
      this.noiseSnare?.triggerAttackRelease('16n', time + Tone.Time('4n'));
      this.noiseSnare?.triggerAttackRelease('16n', time + Tone.Time('2n') + Tone.Time('4n'));
    }, '1m').start(0));
  }

  /**
   * PUZZLE THEME: Ambient, Thoughtful Melodies
   */
  private composePuzzleTheme() {
    this.loops.push(new Tone.Loop((time) => {
      const chords = [['A3', 'C4', 'E4'], ['G3', 'B3', 'D4'], ['F3', 'A3', 'C4']];
      const chord = chords[Math.floor(time / 2) % chords.length];
      this.padSynth?.triggerAttackRelease(chord, '1n', time);
    }, '2m').start(0));

    this.loops.push(new Tone.Loop((time) => {
      const notes = ['E5', 'G5', 'A5', 'C6'];
      const note = notes[Math.floor(Math.random() * notes.length)];
      this.leadSynth?.triggerAttackRelease(note, '8n', time + Tone.Time('4n') * (Math.random() > 0.5 ? 1 : 2));
    }, '1m').start(0));
  }

  /**
   * RHYTHM THEME: Heavy Bass & Dynamic Beats
   */
  private composeRhythmTheme() {
    this.loops.push(new Tone.Loop((time) => {
      this.drumSynth?.triggerAttackRelease('C1', '8n', time);
      this.drumSynth?.triggerAttackRelease('C1', '8n', time + Tone.Time('8n') * 3);
      this.noiseSnare?.triggerAttackRelease('8n', time + Tone.Time('4n'));
    }, '2n').start(0));

    this.loops.push(new Tone.Loop((time) => {
      this.bassSynth?.triggerAttackRelease('E2', '16n', time);
      this.bassSynth?.triggerAttackRelease('E2', '16n', time + Tone.Time('8n'));
      this.bassSynth?.triggerAttackRelease('G2', '16n', time + Tone.Time('4n'));
    }, '2n').start(0));
  }

  /**
   * BATTLE THEME: Intense, Fast-Paced Chaos
   */
  private composeBattleTheme() {
    this.loops.push(new Tone.Loop((time) => {
      this.drumSynth?.triggerAttackRelease('C1', '16n', time);
      this.drumSynth?.triggerAttackRelease('C1', '16n', time + Tone.Time('16n') * 2);
      this.noiseSnare?.triggerAttackRelease('16n', time + Tone.Time('8n'));
    }, '4n').start(0));

    this.loops.push(new Tone.Loop((time) => {
      const seq = ['A2', 'A2', 'C3', 'A2', 'D3', 'A2', 'Eb3', 'D3'];
      seq.forEach((note, i) => {
        this.bassSynth?.triggerAttackRelease(note, '16n', time + Tone.Time('16n') * i);
      });
    }, '2n').start(0));
  }

  /**
   * EDITOR THEME: Minimalist Grid Music
   */
  private composeEditorTheme() {
    this.loops.push(new Tone.Loop((time) => {
      this.leadSynth?.triggerAttackRelease('G4', '16n', time);
      this.hiHat?.triggerAttackRelease(time + Tone.Time('4n'));
    }, '1m').start(0));
  }

  public stop() {
    this.loops.forEach(l => {
      l.stop();
      l.dispose();
    });
    this.loops = [];
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
  }
}

export const musicEngine = new MusicEngine();
