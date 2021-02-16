module.exports = async function getItem(key) {
  return this.keys[key] || null;
};
