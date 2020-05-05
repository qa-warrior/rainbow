import { NativeModules } from 'react-native';
const AesEncryption = NativeModules.Aes;

console.log('native modules', AesEncryption);

export default class AesEncryptor {
  key = null;

  generateSalt(byteCount = 32) {
    const view = new Uint8Array(byteCount);
    global.crypto.getRandomValues(view);
    const b64encoded = btoa(String.fromCharCode.apply(null, view));
    return b64encoded;
  }

  generateKey = (password, salt) =>
    AesEncryption.pbkdf2(password, salt, 5000, 256);

  keyFromPassword = (password, salt) => this.generateKey(password, salt);

  encryptWithKey = (text, keyBase64) => {
    const ivBase64 = this.generateSalt(32);
    return AesEncryption.encrypt(text, keyBase64, ivBase64).then(cipher => ({
      cipher,
      iv: ivBase64,
    }));
  };

  decryptWithKey = (encryptedData, key) =>
    AesEncryption.decrypt(encryptedData.cipher, key, encryptedData.iv);

  encrypt = async (password, string) => {
    const salt = this.generateSalt(16);
    const key = await this.keyFromPassword(password, salt);
    const result = await this.encryptWithKey(string, key);
    result.salt = salt;
    return JSON.stringify(result);
  };

  decrypt = async (password, encryptedString) => {
    const encryptedData = JSON.parse(encryptedString);
    const key = await this.keyFromPassword(password, encryptedData.salt);
    const data = await this.decryptWithKey(encryptedData, key);
    console.log(typeof data);
    return data;
  };
}