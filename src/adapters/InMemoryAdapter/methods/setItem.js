module.exports = function setItem(key, item) {
  this.keys[key] = item;
  return item;
};
