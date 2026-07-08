export class RateLimiter {
  constructor({ intervalMs, sleep }) {
    this.intervalMs = intervalMs;
    this.sleep = sleep;
    this.nextAvailableAt = 0;
  }

  async wait() {
    const now = Date.now();
    const delayMs = Math.max(0, this.nextAvailableAt - now);
    if (delayMs > 0) {
      await this.sleep(delayMs);
    }
    this.nextAvailableAt = Date.now() + this.intervalMs;
  }
}
