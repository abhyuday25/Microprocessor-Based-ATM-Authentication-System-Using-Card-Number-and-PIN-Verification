/**
 * Database.js
 * Simulates an EEPROM or External Flash memory to store user credentials.
 * Implements persistence using localStorage.
 */
class CardDatabase {
  constructor() {
    this.storageKey = 'atm_auth_db';
    this.defaultCards = [
      '4111111111','4222222222','4333333333','4444444444','4555555555',
      '5111111111','5222222222','5333333333','5444444444','5555555555',
      '6011111111','6022222222','6033333333','6044444444','6055555555',
      '3711111111','3722222222','3733333333','3744444444','3755555555'
    ];
    this.defaultPins = [
      '1234','2345','3456','4567','5678',
      '6789','7890','8901','9012','0123',
      '1111','2222','3333','4444','5555',
      '6666','7777','8888','9999','0000'
    ];
    this.data = this._load();
  }

  _load() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    const initial = {
      cards: [...this.defaultCards],
      pins: [...this.defaultPins]
    };
    this._save(initial);
    return initial;
  }

  _save(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  /**
   * Validates a card and PIN combination.
   * @param {string} card 10-digit card number.
   * @param {string} pin 4-digit PIN.
   * @returns {boolean} True if authorized.
   */
  validate(card, pin) {
    const index = this.data.cards.indexOf(card);
    return index !== -1 && this.data.pins[index] === pin;
  }

  getAll() {
    return this.data;
  }

  /**
   * Resets the database to factory settings.
   */
  reset() {
    localStorage.removeItem(this.storageKey);
    this.data = this._load();
  }
}

// Export as a singleton
const DB = new CardDatabase();
