const EVENTS = require('../EVENTS');

const announce = function (type, el) {
  if (!this.events) return false;
  switch (type) {
    case EVENTS.BALANCE_CHANGED:
    case EVENTS.UNCONFIRMED_BALANCE_CHANGED:
      this.events.emit(type, el);
      break;
    default:
      this.events.emit(type, el);
      console.warn('Not implemented, announce of ', type, el);
  }
  return true;
};
module.exports = announce;