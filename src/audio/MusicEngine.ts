import * as Tone from 'tone';

export type MusicTheme = 'main' | 'classic' | 'puzzle' | 'rhythm' | 'battle' | 'editor' | 'none';

class MusicEngine {
  private synth: Tone.PolySynth | null = null;
  private drumSynth: Tone.MembraneSynth | null = null;
  private metalSynth: Tone.MetalSynth | null = null;
  private noiseSynth: Tone.NoiseSynth | null = null;
  private filter: Tone.Filter | null = null;
  
  private loop: Tone.Loop | null = null;
  private currentTheme: MusicTheme = 'none';
  private volume: Tone.Volume | null = null;
  private baseBpm: number = 120;

  constructor() {
    // We don't create nodes here to avoid context mismatch at module load
  }

  private setupInstruments() {
    if (this.synth) return;
    
    console.log("[MusicEngine] Initializing instruments on context:", Tone.getContext().name);

    this.volume = new Tone.Volume(-15).toDestination();
    this.filter = new Tone.Filter(2000, "lowpass").connect(this.volume);

    // Classic Square-Wave Chiptune Lead
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'square8' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.8 }
    }).connect(this.filter);

    // Chiptune Kick
    this.drumSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05, octaves: 2, oscillator: { type: 'sine' }
    }).connect(this.volume);

    // Chiptune Hi-hat (Metal)
    this.metalSynth = new Tone.MetalSynth({
      frequency: 250, envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
      harmonicity: 3, modulationIndex: 10, resonance: 2000
    }).connect(this.volume);

    // Chiptune Snare (Noise)
    this.noiseSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0 }
    }).connect(this.volume);
  }

  /**
   * Generative Logic: Maps ball speed to Music Intensity
   * @param speed Current ball velocity magnitude (approx 4 to 20)
   */
  public setIntensity(speed: number) {
    if (!this.synth) return;

    // 1. Modulate BPM (Tempo increases with speed)
    // Map speed 4-15 to 100-180 BPM
    const targetBpm = Math.min(200, Math.max(80, this.baseBpm + (speed - 5) * 5));
    Tone.getTransport().bpm.rampTo(targetBpm, 0.5);

    // 2. Modulate Filter (Music gets "brighter" as speed increases)
    const freq = Math.min(8000, Math.max(800, 1000 + (speed * 300)));
    this.filter?.frequency.rampTo(freq, 0.2);

    // 3. Modulate Volume (Slight boost during high speed)
    if (this.volume) {
      const vol = Math.min(0, -15 + (speed - 5));
      this.volume.volume.rampTo(vol, 0.5);
    }
  }

  public setVolume(val: number) {
    if (!this.volume) this.setupInstruments();
    const db = Tone.gainToDb(Math.max(0.0001, val));
    this.volume?.volume.rampTo(db - 15, 0.1);
  }

  public async setTheme(theme: MusicTheme, bpm: number = 120) {
    if (this.currentTheme === theme && theme !== 'rhythm') return;
    
    this.stop();
    this.setupInstruments();
    
    this.currentTheme = theme;
    this.baseBpm = bpm;
    Tone.getTransport().bpm.value = bpm;

    if (theme === 'none') return;

    switch (theme) {
      case 'main': this.setupMainTheme(); break;
      case 'classic': this.setupClassicTheme(); break;
      case 'puzzle': this.setupPuzzleTheme(); break;
      case 'rhythm': this.setupRhythmTheme(); break;
      case 'battle': this.setupBattleTheme(); break;
      case 'editor': this.setupEditorTheme(); break;
    }

    Tone.getTransport().start("+0.1");
  }

  private setupMainTheme() {
    // Ambient Arp
    this.loop = new Tone.Loop((time) => {
      const notes = ['C3', 'E3', 'G3', 'B3', 'A3', 'G3', 'E3', 'D3'];
      notes.forEach((n, i) => {
        this.synth?.triggerAttackRelease(n, '16n', time + Tone.Time('16n') * i);
      });
      this.drumSynth?.triggerAttackRelease('C1', '8n', time);
    }, '2n').start(0);
  }

  private setupClassicTheme() {
    // Driving Bassline
    this.loop = new Tone.Loop((time) => {
      this.synth?.triggerAttackRelease('C2', '16n', time);
      this.synth?.triggerAttackRelease('G2', '16n', time + Tone.Time('8n'));
      this.synth?.triggerAttackRelease('C2', '16n', time + Tone.Time('4n'));
      
      this.drumSynth?.triggerAttackRelease('C1', '8n', time);
      this.metalSynth?.triggerAttackRelease(time + Tone.Time('8n'));
      this.metalSynth?.triggerAttackRelease(time + Tone.Time('4n') + Tone.Time('8n'));
    }, '2n').start(0);
  }

  private setupPuzzleTheme() {
    this.loop = new Tone.Loop((time) => {
      this.synth?.triggerAttackRelease('F4', '32n', time);
      this.synth?.triggerAttackRelease('A4', '32n', time + Tone.Time('8n'));
      this.metalSynth?.triggerAttackRelease(time + Tone.Time('2n'));
    }, '1m').start(0);
  }

  private setupRhythmTheme() {
    this.loop = new Tone.Loop((time) => {
      for (let i = 0; i < 4; i++) {
        this.drumSynth?.triggerAttackRelease('C1', '8n', time + Tone.Time('4n') * i);
        this.metalSynth?.triggerAttackRelease(time + Tone.Time('4n') * i + Tone.Time('8n'));
        if (i % 2 === 1) this.noiseSynth?.triggerAttackRelease('16n', time + Tone.Time('4n') * i);
      }
    }, '1m').start(0);
  }

  private setupBattleTheme() {
    this.loop = new Tone.Loop((time) => {
      for (let i = 0; i < 8; i++) {
        this.drumSynth?.triggerAttackRelease('C1', '16n', time + Tone.Time('8n') * i);
        const note = i % 2 === 0 ? 'C2' : 'Eb2';
        this.synth?.triggerAttackRelease(note, '32n', time + Tone.Time('8n') * i);
      }
    }, '1m').start(0);
  }

  private setupEditorTheme() {
    this.loop = new Tone.Loop((time) => {
      this.synth?.triggerAttackRelease('G3', '4n', time);
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
