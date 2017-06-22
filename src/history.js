import createSubscriptionCoordinator from './utils/subscriptionCoordinator';

function noop() {}

class History {
  constructor(options) {
    this.locations = [];
    this.index = -1;
    this.location;
    this.confirm = null;
    
    this._beforeDestroy = [];

    const { subscribe, emit, removeAllSubscribers } = createSubscriptionCoordinator();
    this.subscribe = subscribe;
    this._emit = emit;
    this._beforeDestroy.push(removeAllSubscribers);
  }

  confirmWith(fn) {
    this.confirm = fn;
  }

  removeConfirmation() {
    this.confirm = null;
  }

  _confirmNavigation(location, action, success, failure = noop) {
    if (!this.confirm) {
      success();
    } else {
      this.confirm(location, action, success, failure);
    }
  }

  destroy() {
    this._beforeDestroy.forEach(fn => { fn(); });
  }
};

export default History;
