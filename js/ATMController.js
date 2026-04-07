/**
 * ATMController.js
 * Main system controller that acts as the 'firmware' loop.
 */
class ATMController {
  constructor() {
    this.busy = false;
    this.resetTimeout = null;
    this.stats = { t: 0, g: 0, d: 0 };
    
    this.cardIn = document.getElementById('cIn');
    this.pinIn = document.getElementById('pIn');
    this.cardHint = document.getElementById('cHint');
    this.banner = document.getElementById('banner');
    this.attemptsBadge = document.getElementById('aBadge');
    
    this._addInputListeners();
  }

  _addInputListeners() {
    this.cardIn.addEventListener('input', () => {
      const v = this.cardIn.value.replace(/\D/g, '');
      this.cardIn.value = v;
      this.cardHint.textContent = `${v.length} / 10 digits`;
      this.cardIn.className = 'finput' + (v.length === 10 ? ' ok' : (v.length > 0 ? ' ' : ' '));
      this.cardHint.style.color = v.length === 10 ? 'var(--green)' : (v.length > 0 ? 'var(--amber)' : 'var(--dim)');
    });

    this.pinIn.addEventListener('input', () => {
      const v = this.pinIn.value.replace(/\D/g, '');
      this.pinIn.value = v;
      const dots = document.querySelectorAll('.pdot');
      dots.forEach((d, i) => v.length > i ? d.classList.add('filled') : d.classList.remove('filled'));
      this.pinIn.className = 'finput' + (v.length === 4 ? ' ok' : (v.length > 0 ? ' ' : ' '));
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && (document.activeElement === this.cardIn || document.activeElement === this.pinIn)) this.send();
    });
  }

  buildRefGrid() {
    const grid = document.getElementById('refGrid');
    const dbData = DB.getAll();
    grid.innerHTML = '';
    
    dbData.cards.forEach((card, i) => {
      const item = document.createElement('div');
      item.className = 'ref-item';
      const fmt = card.slice(0, 4) + ' ' + card.slice(4, 7) + ' ' + card.slice(7);
      item.innerHTML = `<div class="rcard">${fmt}</div><div class="rpin">PIN: ${dbData.pins[i]}</div>`;
      item.onclick = () => {
        this.cardIn.value = card;
        this.pinIn.value = dbData.pins[i];
        this.cardIn.dispatchEvent(new Event('input'));
        this.pinIn.dispatchEvent(new Event('input'));
      };
      grid.appendChild(item);
    });
  }

  validate() {
    const card = this.cardIn.value.trim();
    const pin = this.pinIn.value.trim();

    if (card.length !== 10) {
      Serial.println('// ERROR: Card number must be exactly 10 digits', 'sys');
      this.cardIn.classList.add('error');
      setTimeout(() => this.cardIn.classList.remove('error'), 1500);
      return null;
    }
    if (pin.length !== 4) {
      Serial.println('// ERROR: PIN must be exactly 4 digits', 'sys');
      this.pinIn.classList.add('error');
      setTimeout(() => this.pinIn.classList.remove('error'), 1500);
      return null;
    }
    return { card, pin };
  }

  async send() {
    if (this.busy) return;
    const input = this.validate();
    if (!input) return;

    this.busy = true;
    clearTimeout(this.resetTimeout);
    
    const { card, pin } = input;
    const masked = '*'.repeat(6) + card.slice(-4);
    Serial.println(`> Card: ${masked} | PIN: ****`, 'tx');

    await new Promise(r => setTimeout(r, 80));
    
    const authorized = DB.validate(card, pin);
    Serial.println(authorized ? 'AUTHORIZED' : 'DENIED', authorized ? 'ok' : 'no');
    
    this.showBanner(authorized);
    this.updateStats(authorized);
    Hardware.circuitHighlight(authorized);

    if (authorized) {
      Voice.playGrantedSound();
      Hardware.digitalWrite('D13', true);
      await LCD.type('ACCESS GRANTED', 'Welcome User', true, 28);
      await new Promise(res => Voice.speak('Access granted. Welcome, authorized user. Please proceed.', res));
    } else {
      Voice.playBuzzerSound();
      Hardware.activateBuzzer();
      Hardware.digitalWrite('D13', false);
      await LCD.type('ACCESS DENIED', 'Invalid Details', true, 28);
      await new Promise(res => Voice.speak('Access denied. Invalid card or PIN. Please try again.', res));
    }

    this.resetTimeout = setTimeout(() => {
      Hardware.digitalWrite('D13', false);
      LCD.set('ATM AUTH SYSTEM', 'Enter Card+PIN', true);
      this._clearInputs();
      Voice.speak('Please enter your card number and PIN.');
      this.busy = false;
    }, 3200);
  }

  _clearInputs() {
    this.cardIn.value = '';
    this.pinIn.value = '';
    this.cardHint.textContent = '0 / 10 digits';
    this.cardHint.style.color = 'var(--dim)';
    document.querySelectorAll('.pdot').forEach(d => d.classList.remove('filled'));
    this.cardIn.className = 'finput';
    this.pinIn.className = 'finput';
  }

  showBanner(ok) {
    this.banner.className = 'banner';
    void this.banner.offsetWidth; // trigger reflow
    this.banner.className = 'banner ' + (ok ? 'ok' : 'no');
    this.banner.innerHTML = ok ? 
      '✅ &nbsp; ACCESS GRANTED — Welcome, Authorized User' : 
      '❌ &nbsp; ACCESS DENIED — Invalid Card or PIN';
    setTimeout(() => { this.banner.className = 'banner'; }, 3500);
  }

  updateStats(ok) {
    this.stats.t++;
    if (ok) this.stats.g++; else this.stats.d++;
    
    document.getElementById('stT').textContent = this.stats.t;
    document.getElementById('stG').textContent = this.stats.g;
    document.getElementById('stD').textContent = this.stats.d;
    document.getElementById('stR').textContent = this.stats.t ? Math.round(this.stats.g / this.stats.t * 100) + '%' : '—';
    this.attemptsBadge.textContent = `${this.stats.t} ATTEMPT${this.stats.t !== 1 ? 'S' : ''}`;
  }

  resetStats() {
    this.stats = { t: 0, g: 0, d: 0 };
    document.getElementById('stT').textContent = '0';
    document.getElementById('stG').textContent = '0';
    document.getElementById('stD').textContent = '0';
    document.getElementById('stR').textContent = '—';
    this.attemptsBadge.textContent = '0 ATTEMPTS';
    Serial.println('// Stats reset', 'sys');
  }

  clearLog() {
    Serial.clear();
  }

  init() {
    Hardware.buildPinMap();
    this.buildRefGrid();
    Serial.init();
    LCD.set('ATM AUTH SYSTEM', 'Enter Card+PIN', true);
    
    setTimeout(() => {
      Voice.playBootSound();
      setTimeout(() => {
        Voice.speak('Welcome to A T M Authorization System. Please enter your 10-digit card number and 4-digit PIN.');
      }, 600);
    }, 500);
  }
}

// Global instance for UI access
const ATM = new ATMController();
window.onload = () => ATM.init();
