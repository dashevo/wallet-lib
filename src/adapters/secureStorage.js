const CryptoJS = require('crypto-js');

class SecureStorage {
  constructor(secret) {
    this.data = { };
    this.secret = secret || CryptoJS.SHA256(`${Math.random()}`).toString();
  }

  getItem(key) {
    const encryptedKey = CryptoJS.SHA256(`${key}`).toString();
    const value = this.data[encryptedKey];
    if (value === undefined) {
      return null;
    }
    try {
      const bytes = CryptoJS.AES.decrypt(value, this.secret);
      const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedStr);
    } catch (e) {
      console.error(`SecureStorage: cannot retrieve "${key}"`);
      return null;
    }
  }

  setItem(key, value) {
    if (!key || !value) {
      return;
    }
    const strValue = JSON.stringify(value);
    const encryptedStr = CryptoJS.AES.encrypt(strValue, this.secret).toString();
    const encryptedKey = CryptoJS.SHA256(`${key}`);
    this.data[encryptedKey] = encryptedStr;
  }
}

module.exports = SecureStorage;
