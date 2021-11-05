const {
  util: { buffer: BufferUtil },
} = require('@dashevo/dashcore-lib');
const { sha256 } = require('../../../utils/crypto');

function addKeysToWatchedKeys(keys) {
  if (!Array.isArray(keys)) {
    return this.addKeysToWatchedKeys([keys]);
  }
  let added = 0;

  keys.forEach((key) => {
    let keyId;
    if (key.depth) {
      const keyDepth = Number(key.depth);
      // eslint-disable-next-line no-underscore-dangle
      const keyIndex = BufferUtil.integerFromBuffer(key._buffers.childIndex);
      // eslint-disable-next-line no-underscore-dangle
      const keyParentFingerPrint = BufferUtil.integerFromBuffer(key._buffers.parentFingerPrint);
      keyId = `${keyDepth}-${keyParentFingerPrint}/${keyIndex}`;
    } else {
      keyId = sha256(key.toString()).slice(0, 5).toString('hex');
    }

    if (this.watchedKeys.has(keyId)) {
      throw new Error('Key is already watched');
    }
    this.watchedKeys.set(keyId, key);
    added += 1;
  });

  return added;
}
module.exports = addKeysToWatchedKeys;
