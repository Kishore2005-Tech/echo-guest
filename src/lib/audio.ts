/**
 * Ethereal Web Audio Chime Synthesizer
 * Produces subtle, beautiful crystal harmonic resonance for ECHO interactions.
 */

class EchoAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Check localStorage preference
    const saved = localStorage.getItem('echo_sound_muted');
    if (saved !== null) {
      this.isMuted = saved === 'true';
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('echo_sound_muted', String(this.isMuted));
    if (!this.isMuted) {
      this.playChime(528, 0.4);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playChime(freq = 528, duration = 0.8) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Soft harmonic sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Subtle pitch bend upwards for mystical resonance
      osc.frequency.exponentialRampToValueAtTime(freq * 1.015, now + duration);

      // Soft exponential attack & decay
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch {
      // Audio autoplay policy or browser limitation safely ignored
    }
  }

  public playResonanceChord(baseFreq = 432) {
    if (this.isMuted) return;
    const intervals = [1, 1.25, 1.5, 1.875]; // major 7th ethereal chord
    intervals.forEach((ratio, idx) => {
      setTimeout(() => {
        this.playChime(baseFreq * ratio, 1.2);
      }, idx * 70);
    });
  }
}

export const soundEngine = new EchoAudioEngine();
