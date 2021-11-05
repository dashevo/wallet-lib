const {
  util: { buffer: BufferUtil },
} = require('@dashevo/dashcore-lib');

function removeKeysToWatchedKeys(keys) {
  if (!Array.isArray(keys)) {
    return this.removeKeysToWatchedKeys([keys]);
  }
  let removed = 0;

  keys.forEach((key) => {
    const keyDepth = Number(key.depth);
    // eslint-disable-next-line no-underscore-dangle
    const keyIndex = BufferUtil.integerFromBuffer(key._buffers.childIndex);
    // eslint-disable-next-line no-underscore-dangle
    const keyParentFingerPrint = BufferUtil.integerFromBuffer(key._buffers.parentFingerPrint);
    const keyId = `${keyDepth}-${keyParentFingerPrint}/${keyIndex}`;
    if (!this.watchedKeys.has(keyId)) {
      throw new Error('Key is not watched');
    }
    this.watchedKeys.delete(keyId);
    removed += 1;
  });

  return removed;
}
module.exports = removeKeysToWatchedKeys;
