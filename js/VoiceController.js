/**
 * VoiceController.js
 * Encapsulates Web Speech API logic and visual waveforms.
 */
class VoiceController {
  constructor() {
    this.muted = false;
    this.synth = window.speechSynthesis;
    this.audioCtx = null;
    this._initWaves();
  }

  _initWaves() {
    this.wbars = document.querySelectorAll('.wbar');
    this.icon = document.getElementById('vIcon');
    this.statusElem = document.getElementById('vStatus');
    this.badge = document.getElementById('voiceBadge');
    this.toggleBtn = document.getElementById('vToggle');
  }

  getAudioContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioCtx;
  }

  _getVoice() {
    const vs = this.synth.getVoices();
    return vs.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('female')) ||
           vs.find(v => v.lang === 'en-US') ||
           vs.find(v => v.lang.startsWith('en')) ||
           vs[0] || null;
  }

  _setWave(on) {
    this.wbars.forEach((b, i) => {
      if (on) {
        b.classList.add('active');
        b.style.animation = `waveAnim ${0.3 + Math.random() * 0.4}s ease-in-out infinite ${i * 0.06}s`;
      } else {
        b.classList.remove('active');
        b.style.animation = '';
        b.style.height = '4px';
      }
    });
    if (this.icon) this.icon.textContent = on ? '🔊' : '🔇';
  }

  _status(t) {
    if (this.statusElem) this.statusElem.textContent = t;
  }

  speak(text, done) {
    if (this.muted || !this.synth) {
      if (done) done();
      return;
    }
    this.synth.cancel();
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(text);
      const v = this._getVoice();
      if (v) u.voice = v;
      u.rate = 0.95; u.pitch = 1; u.volume = 1; u.lang = 'en-US';
      this._setWave(true);
      this._status(`Speaking: "${text}"`);
      u.onend = () => {
        this._setWave(false);
        this._status('Voice engine ready');
        if (done) done();
      };
      u.onerror = () => {
        this._setWave(false);
        if (done) done();
      };
      this.synth.speak(u);
    }, 80);
  }

  toggle() {
    this.muted = !this.muted;
    if (this.muted) {
      this.toggleBtn.textContent = 'UNMUTE';
      this.toggleBtn.classList.add('muted');
      this.badge.textContent = '🔇 VOICE OFF';
      this.badge.className = 'badge br';
      this._setWave(false);
      this._status('Voice muted');
      this.synth.cancel();
    } else {
      this.toggleBtn.textContent = 'MUTE';
      this.toggleBtn.classList.remove('muted');
      this.badge.textContent = '🔊 VOICE ON';
      this.badge.className = 'badge bg';
      this._status('Voice engine ready');
      this.speak('Voice enabled');
    }
  }

  playBootSound() {
    this._playSeq([330, 440, 523], 0.15, 0.25, 0.18);
  }

  playGrantedSound() {
    this._playSeq([523, 659, 784, 1047], 0.12, 0.3, 0.25);
  }

  playBuzzerSound() {
    try {
      const ctx = this.getAudioContext();
      const n = ctx.currentTime;
      this._beep(ctx, n, 0.15);
      this._beep(ctx, n + 0.22, 0.15);
      this._beep(ctx, n + 0.44, 0.15);
    } catch (e) {}
  }

  _beep(ctx, t, d) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'square';
    o.frequency.setValueAtTime(880, t);
    o.frequency.exponentialRampToValueAtTime(440, t + d * 0.8);
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.start(t); o.stop(t + d);
  }

  _playSeq(freqs, step, dur, vol) {
    try {
      const ctx = this.getAudioContext();
      freqs.forEach((f, i) => {
        const t = ctx.currentTime + i * step, o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination); o.type = 'sine';
        o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.start(t); o.stop(t + dur);
      });
    } catch (e) {}
  }
}

// Export singleton instance
const Voice = new VoiceController();
