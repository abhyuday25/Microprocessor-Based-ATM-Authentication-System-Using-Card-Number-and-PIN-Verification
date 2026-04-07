/**
 * SerialMonitor.js
 * Mimics a Serial Terminal/Monitor at 9600 baud.
 */
class SerialMonitor {
  constructor() {
    this.output = document.getElementById('sOut');
  }

  print(txt, cls = 'sys') {
    const p = document.createElement('p');
    p.className = 'sl ' + cls;
    p.textContent = txt;
    this.output.appendChild(p);
    this.output.scrollTop = this.output.scrollHeight;
  }

  println(txt, cls = 'sys') {
    this.print(txt, cls);
  }

  clear() {
    this.output.innerHTML = '';
    this.println('// Serial monitor cleared', 'sys');
  }

  init() {
    this.println('// ATM Auth System — real-world format', 'sys');
    this.println('// Card: 10 digits  |  PIN: 4 digits', 'sys');
    this.println('// Cards are masked in logs for security', 'sys');
    this.println('// ─────────────────────────────────────', 'sys');
  }
}

// Export singleton instance
const Serial = new SerialMonitor();
