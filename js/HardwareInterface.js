/**
 * HardwareInterface.js
 * Manages GPIO-like pins for LED, Buzzer, and the visual Pin Map.
 */
class HardwareInterface {
  constructor() {
    this.led = document.getElementById('led');
    this.ledVal = document.getElementById('ledV');
    this.buz = document.getElementById('buz');
    this.buzVal = document.getElementById('buzV');
    this.pinMap = document.getElementById('pinMap');
    this.buzTimeout = null;
    this.pmapConfig = [
      {p:'D2',f:'LCD D7'}, {p:'D3',f:'LCD D6'}, {p:'D4',f:'LCD D5'},
      {p:'D5',f:'LCD D4'}, {p:'D6',f:'LCD EN'}, {p:'D7',f:'LCD RS'},
      {p:'D8',f:'Buzzer +'}, {p:'D13',f:'LED +'},
      {p:'5V',f:'LCD VDD'}, {p:'GND',f:'LCD VSS, RW'}
    ];
  }

  buildPinMap() {
    this.pinMap.innerHTML = '';
    this.pmapConfig.forEach(({p, f}) => {
      const d = document.createElement('div');
      d.className = 'pin-row';
      d.dataset.pin = p;
      d.innerHTML = `<span class="pn">${p}</span><span class="pf">${f}</span>`;
      this.pinMap.appendChild(d);
    });
  }

  digitalWrite(pin, state) {
    if (pin === 'D13') {
      if (state) {
        this.led.classList.add('on');
        this.ledVal.textContent = 'ON ✓';
        this.ledVal.style.color = 'var(--green)';
      } else {
        this.led.classList.remove('on');
        this.ledVal.textContent = 'OFF';
        this.ledVal.style.color = '';
      }
    }
    this._setPinVisual(pin, state);
  }

  activateBuzzer() {
    clearTimeout(this.buzTimeout);
    this.buz.classList.add('active');
    this.buzVal.textContent = 'BUZZING!';
    this.buzVal.style.color = 'var(--red)';
    this._setPinVisual('D8', true);
    this.buzTimeout = setTimeout(() => {
      this.buz.classList.remove('active');
      this.buzVal.textContent = 'SILENT';
      this.buzVal.style.color = '';
      this._setPinVisual('D8', false);
    }, 1600);
  }

  _setPinVisual(pin, on) {
    const rows = document.querySelectorAll('.pin-row');
    rows.forEach(r => {
      if (r.dataset.pin === pin) {
        if (on) r.classList.add('hi');
        else r.classList.remove('hi');
      }
    });
  }

  circuitHighlight(ok) {
    const g = document.getElementById('cdG');
    const d = document.getElementById('cdD');
    const l = document.getElementById('cdLogic');
    l.classList.add('glow-l');
    if (ok) g.classList.add('glow-g');
    else d.classList.add('glow-r');
    setTimeout(() => {
      l.classList.remove('glow-l');
      g.classList.remove('glow-g');
      d.classList.remove('glow-r');
    }, 3500);
  }
}

// Export singleton instance
const Hardware = new HardwareInterface();
