module.exports = async function setItem(key, value) {
  return this.adapter.setItem(key, value);
};
