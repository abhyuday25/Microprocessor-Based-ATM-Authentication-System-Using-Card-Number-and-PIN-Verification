/**
 * LCDDriver.js
 * Mimics a 16x2 LiquidCrystal display common in microprocessor projects.
 */
class LCDDriver {
  constructor() {
    this.r0 = document.getElementById('r0');
    this.r1 = document.getElementById('r1');
  }

  set(a, b, lit = true) {
    const pad = s => String(s).padEnd(16, ' ').slice(0, 16);
    this.r0.textContent = pad(a);
    this.r1.textContent = pad(b);
    this.r0.className = 'lcd-row' + (lit ? ' lit' : '');
    this.r1.className = 'lcd-row' + (lit ? ' lit' : '');
  }

  async type(a, b, lit = true, sp = 32) {
    return new Promise(res => {
      const f0 = String(a).padEnd(16, ' ').slice(0, 16);
      const f1 = String(b).padEnd(16, ' ').slice(0, 16);
      this.r0.className = 'lcd-row' + (lit ? ' lit' : '');
      this.r1.className = 'lcd-row' + (lit ? ' lit' : '');
      this.r0.textContent = ' '.repeat(16);
      this.r1.textContent = ' '.repeat(16);
      let i = 0;
      const t = setInterval(() => {
        if (i < 16) {
          this.r0.textContent = f0.slice(0, i + 1) + ' '.repeat(15 - i);
        } else if (i < 32) {
          const j = i - 16;
          this.r1.textContent = f1.slice(0, j + 1) + ' '.repeat(15 - j);
        } else {
          clearInterval(t);
          res();
        }
        i++;
      }, sp);
    });
  }
}

// Export singleton instance
const LCD = new LCDDriver();
