module.exports = async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
