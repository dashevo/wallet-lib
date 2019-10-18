const CryptoJS = require('crypto-js');

class SecureStorage {
  constructor() {
    this.data = { };
    this.secret = CryptoJS.SHA256(`${Math.random()}`).toString();
  }

  getItem(key, secret = this.secret) {
    const encryptedKey = CryptoJS.SHA256(`${key}`).toString();
    const value = this.data[encryptedKey];
    if (value === undefined) {
      return null;
    }
    try {
      const bytes = CryptoJS.AES.decrypt(value, secret);
      const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedStr);
    } catch (e) {
      console.error(`SecureStorage: cannot retrieve "${key}"`);
      return null;
    }
  }

  setItem(key, value, secret = this.secret) {
    if (!key || !value) {
      return;
    }
    const strValue = JSON.stringify(value);
    const encryptedStr = CryptoJS.AES.encrypt(strValue, secret).toString();
    const encryptedKey = CryptoJS.SHA256(`${key}`);
    this.data[encryptedKey] = encryptedStr;
  }
}

module.exports = SecureStorage;
