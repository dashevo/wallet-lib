module.exports = async function setItem(key, item) {
  this.keys[key] = item;
  return item;
};
