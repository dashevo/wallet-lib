const {
  util: { buffer: BufferUtil },
} = require('@dashevo/dashcore-lib');

function addKeysToWatchedKeys(keys) {
  if (!Array.isArray(keys)) {
    return this.addKeysToWatchedKeys([keys]);
  }
  let added = 0;

  keys.forEach((key) => {
    const keyDepth = Number(key.depth);
    // eslint-disable-next-line no-underscore-dangle
    const keyIndex = BufferUtil.integerFromBuffer(key._buffers.childIndex);
    // eslint-disable-next-line no-underscore-dangle
    const keyParentFingerPrint = BufferUtil.integerFromBuffer(key._buffers.parentFingerPrint);
    const keyId = `${keyDepth}-${keyParentFingerPrint}/${keyIndex}`;
    if (this.watchedKeys.has(keyId)) {
      throw new Error('Key is already watched');
    }
    this.watchedKeys.set(keyId, key);
    added += 1;
  });

  return added;
}
module.exports = addKeysToWatchedKeys;
