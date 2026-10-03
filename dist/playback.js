// Time is measured in playback milliseconds, so speed and pause preserve progress.
export const eventReadingMs = text => Math.min(6000, Math.max(3600,
  1200 + String(text || '').trim().split(/\s+/).filter(Boolean).length * 230));

export class FightClock {
  constructor({ onStep, getDelay, now = () => performance.now(),
    schedule = (callback, delay) => setTimeout(callback, delay),
    cancel = handle => clearTimeout(handle) }) {
    this.onStep = onStep;
    this.getDelay = getDelay;
    this.now = now;
    this.schedule = schedule;
    this.cancel = cancel;
    this.rate = 1;
    this.running = false;
    this.remaining = getDelay();
    this.handle = null;
    this.startedAt = 0;
  }
  settle() {
    if (!this.running) return;
    this.remaining = Math.max(0, this.remaining - (this.now() - this.startedAt) * this.rate);
    this.cancel(this.handle);
    this.handle = null;
  }
  arm() {
    this.startedAt = this.now();
    this.handle = this.schedule(() => {
      this.handle = null;
      if (!this.running) return;
      this.remaining = 0;
      const keepGoing = this.onStep();
      if (keepGoing === false) { this.running = false; return; }
      this.remaining = this.getDelay();
      if (this.running) this.arm();
    }, this.remaining / this.rate);
  }
  pause() { this.settle(); this.running = false; }
  resume() {
    if (this.running) return;
    this.running = true;
    this.arm();
  }
  reset() { this.pause(); this.remaining = this.getDelay(); }
  setRate(rate) {
    if (![0.5, 1, 2].includes(rate)) throw new Error('Invalid playback rate');
    if (this.rate === rate) return;
    this.settle();
    this.rate = rate;
    if (this.running) this.arm();
  }
}
