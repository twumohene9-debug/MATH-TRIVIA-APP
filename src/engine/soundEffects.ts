/**
 * Synthesizes audio cues using standard browser Web Audio API.
 * Operates 100% offline with zero external audio assets.
 */
class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playTone(freq: number, type: OscillatorType, duration: number, delay = 0, gainLevel = 0.15) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(gainLevel, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    } catch {
      // Audio failure safe ignore
    }
  }

  playCorrect() {
    this.playTone(523.25, 'sine', 0.12, 0); // C5
    this.playTone(659.25, 'sine', 0.16, 0.08); // E5
    this.playTone(783.99, 'triangle', 0.22, 0.16); // G5
  }

  playIncorrect() {
    this.playTone(280, 'sawtooth', 0.18, 0, 0.1);
    this.playTone(220, 'sawtooth', 0.28, 0.12, 0.12);
  }

  playBlockComplete() {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.28, idx * 0.09, 0.18);
    });
  }

  playLevelComplete() {
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'sine', 0.35, idx * 0.1, 0.2);
    });
  }

  playStageComplete() {
    const chord1 = [523.25, 659.25, 783.99];
    const chord2 = [587.33, 739.99, 880];
    const chord3 = [1046.5, 1318.5, 1567.98];

    chord1.forEach(f => this.playTone(f, 'sine', 0.4, 0, 0.15));
    chord2.forEach(f => this.playTone(f, 'sine', 0.4, 0.25, 0.15));
    chord3.forEach(f => this.playTone(f, 'triangle', 0.8, 0.55, 0.25));
  }
}

export const sounds = new SoundEffectsEngine();
