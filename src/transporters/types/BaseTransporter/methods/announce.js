const EVENTS = require('../../../../EVENTS');
const logger = require('../../../../logger');

module.exports = function announce(eventName, args) {
  switch (eventName) {
    case EVENTS.BLOCKHEADER:
      this.emit(EVENTS.BLOCKHEADER, { type: EVENTS.BLOCKHEADER, payload: args });
      break;
    case EVENTS.BLOCK:
      this.emit(EVENTS.BLOCK, { type: EVENTS.BLOCK, payload: args });
      break;
    case EVENTS.TRANSACTION:
      this.emit(EVENTS.TRANSACTION, { type: EVENTS.TRANSACTION, payload: args });
      break;
    default:
      this.emit(eventName, { type: eventName, payload: args });
      logger.warn('Transporter - Not implemented, announce of ', eventName, args);
  }
};
