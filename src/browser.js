import History from './history';
import locationFactory from './locationFactory';
import createKeyGen from './utils/keygen';
import {
  ignorablePopstateEvent,
  canUseWindowHistory,
  needToUseHashchangeEvent,
  getStateFromHistory,
  domExists
} from './utils/domCompat';
import warn from './utils/warn';

function getMajor(key) {
  return parseInt(key.split('.')[0], 10);
}

function diffKeys(previous, next) {
  const previousMajor = getMajor(previous);
  const nextMajor = getMajor(next);
  return nextMajor - previousMajor;
}

class BrowserHistory extends History {

  constructor(options = {}) {
    super(options);
    if (!domExists()) {
      return;
    }

    window = window;

    this.modern = canUseWindowHistory();

    const { createLocation, createPath } = locationFactory(options);
    this.createLocation = createLocation;
    this.createPath = createPath;
    this.keygen = createKeyGen();

    this.location = this.locationFromBrowser()
    this.index = 0;
    this.locations = [this.location];
    this.action = 'POP';

    // true when undoing an out-of-app navigation
    // e.g. browser back/forward buttons
    this._reverting = false;

    window.addEventListener('popstate', (event) => {
      if (ignorablePopstateEvent(event)) {
        return;
      }
      this._pop(event.state);
    });

    if (needToUseHashchangeEvent()) {
      window.addEventListener('hashchange', function createHashChangeListener(pop) {
        return function onHashChange(event) {
          this._pop();
        };
      });
    }
  }

  locationFromBrowser(providedState) {
    const { pathname, search, hash } = window.location;
    const path = pathname + search + hash;
    let { key, state } = providedState || getStateFromHistory();
    if (!key) {
      key = this.keygen.major();
    }
    return this.createLocation(path, key, state);
  }

  navigate(to, state) {
    const location = this.createLocation(to, null, state);
    const path = this.createPath(location);
    const currentPath = this.createPath(this.location);
    
    if (path === currentPath) {
      this.replace(to, state);
    } else {
      this.push(to, state);
    }
  }

  push(to, state) {
    const wipingOutHistory = this.index !== this.locations.length - 1;
    const key = this.keygen.major(wipingOutHistory && this.location.key);
    const location = this.createLocation(to, key, state);
    this.confirmNavigation  (
      location,
      'PUSH',
      () => {
        const path = this.createPath(location);

        if (this.modern) {
          window.history.pushState({ key, state }, null, path);
        } else {
          if (state != null) {
            warn('Cannot use state in browsers that do not support window.history');
          }
          window.location.href = path;
        }

        this.location = location;
        this.index++;
        this.locations = [
          ...this.locations.slice(0, this.index),
          location
        ];
        this.action = 'PUSH';
        this._emit(this.location, 'PUSH');
      }
    );
  }

  replace(to, state) {
    const location = this.createLocation(
      to,
      // pass the current key to just icnrement the minor portion
      this.keygen.minor(this.location.key),
      state
    );
    this.confirmNavigation(
      location,
      'REPLACE',
      () => {
        const path = this.createPath(location);
        if (this.modern) {
          window.history.replaceState({ key: location.key, state }, null, path);
        } else {
          if (state != null) {
            warn('Cannot use state in browsers that do not support window.history');
          }
          window.location.replace(path);
        }

        this.location = location;
        this.locations[this.index] = this.location;
        this.action = 'REPLACE';
        this._emit(this.location, 'REPLACE');
      }
    );
  }

  go(num) {
    // calling window.history.go with no value reloads the page, but
    // we will just re-emit instead
    if (!num) {
      this.action = 'POP';
      this._emit(this.location, 'POP');
    } else {
      window.history.go(num);
    }
  }

  _pop(state) {
    const location = this.locationFromBrowser(state);
    const currentKey = this.location.key;
    const diff = diffKeys(currentKey, location.key);
    this.confirmNavigation(
      location,
      'POP',
      () => {
        this.location = location;
        this.index += diff;
        this.action = 'POP';
        this._emit(this.location, 'POP');
      },
      () => {
        window.history.go(-1*diff);
      }
    );
  }

}

export default BrowserHistory;
