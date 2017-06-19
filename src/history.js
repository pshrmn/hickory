import createSubscriptions from './utils/subscribe';
import locationFactory from './locationFactory';

function noop() {}

class History {
  constructor(options) {
    this.locations = [];
    this.index = -1;
    this.location;
    this.path;
    this.confirm = null;

    this.create = locationFactory(options);

    const { subscribe, emit } = createSubscriptions();
    this.subscribe = subscribe;
    this._emit = emit;
  }

  confirmWith(fn) {
    this.confirm = fn;
  }

  removeConfirmation() {
    this.confirm = null;
  }

  confirmNavigation(location, action, success, failure = noop) {
    if (!this.confirm) {
      success();
    } else {
      this.confirm(location, action, success, failure);
    }
  }
};

export default History;
