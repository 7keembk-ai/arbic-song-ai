/**
 * Web Audio API synthesizer & audio processing engine.
 * Generates real, playable Arabic Rap & Trap beats (Boom-Bap, 808 Trap, Drill, Lo-Fi)
 * directly in the browser with 0 external network requests, zero bandwidth costs,
 * plus in-browser waveform extraction and client-side Opus compression calculation.
 */

class AudioSynthesizerEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTrackId: string | null = null;
  private tempoBpm: number = 138;
  private intervalId: number | null = null;
  private masterGain: GainNode | null = null;
  private playbackPosition: number = 0;
  private currentDuration: number = 180;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private playbackRate: number = 1.0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, volume));
      this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = rate;
  }

  // Plays synthetic 808 Sub Kick
  private trigger808Kick(time: number, pitch = 55) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Frequency drop for punchy kick
    osc.frequency.setValueAtTime(pitch * 2.2, time);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.7, time + 0.08);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.35);

    gain.gain.setValueAtTime(1.0, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.4);
  }

  // Plays Snare / Trap Clap
  private triggerSnare(time: number) {
    if (!this.ctx || !this.masterGain) return;

    // Noise buffer for snap
    const bufferSize = this.ctx.sampleRate * 0.15;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.65, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(time);
    whiteNoise.stop(time + 0.15);
  }

  // Plays Metallic Hi-Hat
  private triggerHiHat(time: number, open = false) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(8000, time);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const dur = open ? 0.2 : 0.04;
    gain.gain.setValueAtTime(open ? 0.3 : 0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + dur);
  }

  // Plays Melodic Trap / Arabic Scale Synth Note (Hijaz / Bayati scale simulation)
  private triggerSynthLead(time: number, freq: number, duration = 0.28) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, time);
    filter.frequency.exponentialRampToValueAtTime(450, time + duration);

    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  public playTrack(
    trackId: string,
    durationSeconds: number,
    startPosition: number = 0,
    style: 'trap' | 'boombap' | 'drill' | 'lofi' = 'trap',
    onTimeUpdate?: (time: number) => void,
    onEnd?: () => void
  ) {
    this.initContext();
    this.stop();

    this.currentTrackId = trackId;
    this.currentDuration = durationSeconds;
    this.playbackPosition = startPosition;
    this.onTimeUpdateCallback = onTimeUpdate || null;
    this.onEndCallback = onEnd || null;
    this.isPlaying = true;

    // Tempo based on style
    if (style === 'drill') this.tempoBpm = 142;
    else if (style === 'boombap') this.tempoBpm = 92;
    else if (style === 'lofi') this.tempoBpm = 84;
    else this.tempoBpm = 136; // trap

    let step = Math.floor((this.playbackPosition * this.tempoBpm) / 15);
    const arabicScaleFreqs = [220, 246.9, 261.6, 293.66, 329.63, 349.23, 440]; // D Arabic Hijaz / A Minor

    const stepInterval = (60 / this.tempoBpm / 4) * 1000; // 16th notes

    this.intervalId = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;

      this.playbackPosition += (stepInterval / 1000) * this.playbackRate;
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.playbackPosition);
      }

      if (this.playbackPosition >= this.currentDuration) {
        this.stop();
        if (this.onEndCallback) this.onEndCallback();
        return;
      }

      const now = this.ctx.currentTime;
      const beat = step % 16;

      // 808 Kick pattern
      if (style === 'trap') {
        if (beat === 0 || beat === 6 || beat === 10) {
          this.trigger808Kick(now, 48);
        }
      } else if (style === 'drill') {
        if (beat === 0 || beat === 5 || beat === 11) {
          this.trigger808Kick(now, 52);
        }
      } else {
        // BoomBap
        if (beat === 0 || beat === 10) {
          this.trigger808Kick(now, 58);
        }
      }

      // Snare / Clap pattern on beat 4 & 12
      if (beat === 4 || beat === 12) {
        this.triggerSnare(now);
      }

      // Hi-Hats
      if (style === 'trap') {
        // Rolls on 14, 15
        if (beat === 14 || beat === 15) {
          this.triggerHiHat(now, false);
          this.triggerHiHat(now + 0.03, false);
        } else {
          this.triggerHiHat(now, beat === 8);
        }
      } else if (beat % 2 === 0) {
        this.triggerHiHat(now, false);
      }

      // Melodic Arabic synth lead
      if (beat === 0 || beat === 3 || beat === 7 || beat === 12) {
        const noteIndex = (Math.floor(step / 4)) % arabicScaleFreqs.length;
        this.triggerSynthLead(now, arabicScaleFreqs[noteIndex]);
      }

      step++;
    }, stepInterval);
  }

  public pause() {
    this.isPlaying = false;
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public seek(positionSeconds: number) {
    this.playbackPosition = Math.max(0, Math.min(this.currentDuration, positionSeconds));
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(this.playbackPosition);
    }
  }

  public stop() {
    this.pause();
    this.playbackPosition = 0;
    this.currentTrackId = null;
  }

  public getPlaybackState() {
    return {
      isPlaying: this.isPlaying,
      trackId: this.currentTrackId,
      currentTime: this.playbackPosition,
      duration: this.currentDuration,
    };
  }
}

export const audioEngine = new AudioSynthesizerEngine();

/**
 * Generates an array of normalized waveform peaks (0.1 to 1.0) for audio visualization.
 * Synthesizes realistic dynamic punchy rap peaks without downloading heavy audio buffers.
 */
export function generateWaveformPeaks(count: number = 60, seed: string = 'meydan'): number[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  const peaks: number[] = [];
  for (let i = 0; i < count; i++) {
    const x = i / count;
    // Harmonic rap beat envelope (verse, chorus build, drop, outro)
    const baseWave = Math.sin(x * Math.PI) * 0.5 + 0.3;
    const rhythmicVariation = (Math.sin(i * 1.8 + hash) + Math.cos(i * 0.9)) * 0.25;
    const kickPunch = (i % 4 === 0) ? 0.35 : 0;
    const finalPeak = Math.max(0.12, Math.min(1.0, baseWave + rhythmicVariation + kickPunch));
    peaks.push(Math.round(finalPeak * 100) / 100);
  }
  return peaks;
}

/**
 * Client-Side Audio Compression Simulator & Web Audio Encoder.
 * Simulates in-browser downsampling to 96kbps Opus/WebM to maximize Cloudflare R2's 10GB free tier.
 * Shows original vs compressed file size, reduction ratio, and saved quota.
 */
export function simulateClientAudioCompression(
  fileSizeBytes: number,
  durationSeconds: number,
  targetBitrateKbps: number = 96
): {
  originalSizeBytes: number;
  compressedSizeBytes: number;
  reductionPercentage: number;
  savingsMb: number;
  estimatedTracksIn10Gb: number;
  estimatedBitrate: string;
} {
  // 96kbps = 12 KB per second + container header ~24KB
  const estimatedCompressedBytes = Math.round((targetBitrateKbps * 1000 / 8) * durationSeconds + 24576);
  // Cap compressed size to not exceed original
  const compressedSizeBytes = Math.min(fileSizeBytes, estimatedCompressedBytes);
  const reductionPercentage = Math.round(((fileSizeBytes - compressedSizeBytes) / fileSizeBytes) * 100);
  const savingsMb = Math.round(((fileSizeBytes - compressedSizeBytes) / (1024 * 1024)) * 10) / 10;
  
  // Total 10GB = 10,737,418,240 bytes
  const freeTier10GbBytes = 10 * 1024 * 1024 * 1024;
  const estimatedTracksIn10Gb = Math.floor(freeTier10GbBytes / compressedSizeBytes);

  return {
    originalSizeBytes: fileSizeBytes,
    compressedSizeBytes,
    reductionPercentage: Math.max(0, reductionPercentage),
    savingsMb,
    estimatedTracksIn10Gb,
    estimatedBitrate: `${targetBitrateKbps} kbps Opus/AAC`
  };
}
