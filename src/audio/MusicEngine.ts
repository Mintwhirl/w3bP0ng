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

    // Increased volume from -15dB to -5dB for better audibility
    this.volume = new Tone.Volume(-5).toDestination();
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

    // Only modify BPM if transport is actually running
    if (Tone.getTransport().state !== 'started') {
      console.log("[MusicEngine] setIntensity skipped - transport not running");
      return;
    }

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
    console.log("[MusicEngine] setTheme called:", theme, "current:", this.currentTheme, "bpm:", bpm);

    // Don't return early if we need to start music or if theme is 'none'
    const transportState = Tone.getTransport().state;
    const needsRestart = transportState !== 'started';

    // Always restart if transport state is 'stopped' or undefined
    const forceRestart = !transportState || transportState === 'stopped';

    if (this.currentTheme === theme && !needsRestart && !forceRestart && theme !== 'rhythm' && theme !== 'none') {
      console.log("[MusicEngine] Theme already active and transport running, skipping");
      return;
    }

    console.log("[MusicEngine] Starting theme:", theme, "transport state:", transportState);

    this.stop();

    // CRITICAL FIX: Ensure Tone.js is started BEFORE creating instruments
    // This ensures all Tone.js nodes are properly initialized
    await Tone.start().catch(err => {
      console.warn("[MusicEngine] Tone.start() failed:", err);
    });
    console.log("[MusicEngine] Tone.js started, context:", Tone.getContext().name);

    // Now create instruments after Tone.js is initialized
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

    // Wait for Tone to load everything
    await Tone.loaded();

    // Start transport and wait for it to actually be running
    console.log("[MusicEngine] About to start transport, current state:", Tone.getTransport().state);
    Tone.getTransport().start("+0.1");

    // Verify transport is running after startup
    await new Promise(resolve => setTimeout(resolve, 200));
    const actualTransportState = Tone.getTransport().state;
    console.log("[MusicEngine] Transport state after 200ms:", actualTransportState);

    // If transport is still not started, try again
    if (actualTransportState !== 'started') {
      console.warn("[MusicEngine] Transport not started, retrying...");
      Tone.getTransport().start();
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log("[MusicEngine] Transport state after retry:", Tone.getTransport().state);
    }

    // Play a test note to verify audio is working
    setTimeout(() => {
      console.log("[MusicEngine] Playing test note, transport state:", Tone.getTransport().state);
      this.synth?.triggerAttackRelease('C4', '8n');
    }, 500);

    console.log("[MusicEngine] Theme set, transport state after start:", Tone.getTransport().state);
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
    console.log("[MusicEngine] setupClassicTheme - creating loop");
    this.loop = new Tone.Loop((time) => {
      console.log("[MusicEngine] Loop callback firing at time:", time);
      this.synth?.triggerAttackRelease('C2', '16n', time);
      this.synth?.triggerAttackRelease('G2', '16n', time + Tone.Time('8n'));
      this.synth?.triggerAttackRelease('C2', '16n', time + Tone.Time('4n'));

      this.drumSynth?.triggerAttackRelease('C1', '8n', time);
      this.metalSynth?.triggerAttackRelease(time + Tone.Time('8n'));
      this.metalSynth?.triggerAttackRelease(time + Tone.Time('4n') + Tone.Time('8n'));
    }, '2n').start(0);
    console.log("[MusicEngine] Classic theme loop started");
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
