/**
 * Web Audio API synthesizer for a premium ambient drone pad.
 * This ensures music works 100% offline and is completely royalty-free.
 */

export type SynthPreset = 'zen' | 'space' | 'warm';

interface PresetConfig {
  name: string;
  frequencies: number[];
  types: ('sine' | 'triangle')[];
  filterFreq: number;
  lfoSpeed: number;
}

const PRESETS: Record<SynthPreset, PresetConfig> = {
  zen: {
    name: 'Zen Café (Do majeur 9)',
    frequencies: [65.41, 130.81, 196.00, 246.94, 293.66], // C2, C3, G3, B3, D4
    types: ['triangle', 'sine', 'triangle', 'sine', 'sine'],
    filterFreq: 450,
    lfoSpeed: 0.08,
  },
  space: {
    name: 'Oasis Spatial (Ré mineur 11)',
    frequencies: [73.42, 110.00, 146.83, 220.00, 261.63, 349.23], // D2, A2, D3, A3, C4, F4
    types: ['sine', 'triangle', 'sine', 'triangle', 'sine', 'sine'],
    filterFreq: 380,
    lfoSpeed: 0.05,
  },
  warm: {
    name: 'Aube Dorée (Fa majeur 9/11)',
    frequencies: [87.31, 130.81, 174.61, 261.63, 329.63, 392.00], // F2, C3, F3, C4, E4, G4
    types: ['triangle', 'triangle', 'sine', 'triangle', 'sine', 'triangle'],
    filterFreq: 520,
    lfoSpeed: 0.12,
  }
};

class AmbientSynthesizer {
  private ctx: AudioContext | null = null;
  private mainGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private oscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private isRunning: boolean = false;
  private currentVolume: number = 0.25;
  private currentPreset: SynthPreset = 'zen';

  constructor() {}

  public start(presetId: SynthPreset = 'zen') {
    this.currentPreset = presetId;
    if (this.isRunning) {
      // Re-apply preset dynamically if already running
      this.applyPreset(presetId);
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.mainGain = this.ctx.createGain();
      this.mainGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.mainGain.gain.linearRampToValueAtTime(this.currentVolume, this.ctx.currentTime + 1.5);

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      
      this.filter.connect(this.mainGain);
      this.mainGain.connect(this.ctx.destination);

      this.applyPreset(presetId);
      this.isRunning = true;
    } catch (e) {
      console.error("Failed to initialize Web Audio Synthesizer:", e);
    }
  }

  private applyPreset(presetId: SynthPreset) {
    if (!this.ctx || !this.filter) return;

    const preset = PRESETS[presetId];
    const now = this.ctx.currentTime;

    // Stop and clear any existing oscillators
    this.oscillators.forEach(o => {
      try {
        o.osc.stop(now);
      } catch (err) {}
    });
    this.oscillators = [];

    if (this.lfo) {
      try {
        this.lfo.stop(now);
      } catch (err) {}
    }

    // Set filter starting point
    this.filter.frequency.setValueAtTime(preset.filterFreq, now);
    this.filter.Q.setValueAtTime(1.5, now);

    // Rebuild oscillators
    preset.frequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.filter) return;
      
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = preset.types[idx] || 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime((Math.random() - 0.5) * 10, now);

      // Distribute volume safely to prevent digital distortion
      const baseVolume = 0.12 / preset.frequencies.length;
      oscGain.gain.setValueAtTime(baseVolume, now);

      osc.connect(oscGain);
      oscGain.connect(this.filter);
      
      osc.start(now);
      this.oscillators.push({ osc, gain: oscGain });
    });

    // Rebuild LFO
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.setValueAtTime(preset.lfoSpeed, now);

    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.setValueAtTime(120, now); // swing the cut-off frequency up/down by 120Hz

    this.lfo.connect(this.lfoGain);
    if (this.filter.frequency) {
      this.lfoGain.connect(this.filter.frequency);
    }
    
    this.lfo.start(now);
  }

  public changePreset(presetId: SynthPreset) {
    this.currentPreset = presetId;
    if (this.isRunning) {
      this.applyPreset(presetId);
    }
  }

  public stop() {
    if (!this.isRunning || !this.ctx || !this.mainGain) return;

    try {
      const stopTime = this.ctx.currentTime + 1.0;
      this.mainGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.mainGain.gain.setValueAtTime(this.mainGain.gain.value, this.ctx.currentTime);
      this.mainGain.gain.linearRampToValueAtTime(0, stopTime);

      setTimeout(() => {
        try {
          this.oscillators.forEach(o => {
            try { o.osc.stop(); } catch(e) {}
          });
          if (this.lfo) {
            try { this.lfo.stop(); } catch(e) {}
          }
          if (this.ctx && this.ctx.state !== 'closed') {
            this.ctx.close();
          }
          this.ctx = null;
          this.mainGain = null;
          this.filter = null;
          this.oscillators = [];
          this.lfo = null;
          this.lfoGain = null;
          this.isRunning = false;
        } catch (err) {
          console.error("Error during synth context teardown:", err);
        }
      }, 1100);

    } catch (e) {
      console.error("Error stopping Web Audio Synthesizer:", e);
    }
  }

  public setVolume(volume: number) {
    this.currentVolume = volume;
    if (this.mainGain && this.ctx) {
      this.mainGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.mainGain.gain.setValueAtTime(this.mainGain.gain.value, this.ctx.currentTime);
      this.mainGain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.1);
    }
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getCurrentPreset(): SynthPreset {
    return this.currentPreset;
  }

  public getPresetName(presetId: SynthPreset): string {
    return PRESETS[presetId].name;
  }
}

export const synthInstance = new AmbientSynthesizer();
