module.exports = async function getItem(key) {
  return this.adapter.getItem(key);
};
