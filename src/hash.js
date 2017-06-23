import History from './history';
import locationFactory from './locationFactory';
import createKeyGen from './utils/keygen';
import {
  stripPrefix,
  completeHash
} from './utils/location'
import {
  ignorablePopstateEvent,
  needToUseHashchangeEvent,
  getStateFromHistory,
  domExists
} from './utils/domCompat';
import createEventCoordinator from './utils/eventCoordinator';

function getMajor(key) {
  return parseInt(key.split('.')[0], 10);
}

function diffKeys(previous, next) {
  const previousMajor = getMajor(previous);
  const nextMajor = getMajor(next);
  return nextMajor - previousMajor;
}

function decodeHashPath(path) {
  return stripPrefix(path, '#');
}

function encodeHashPath(path) {
  return completeHash(path);
}

function ensureHash() {
  if (window.location.hash === '') {
    window.history.replaceState(null, '', '#/');
  }
}

class HashHistory extends History {

  constructor(options = {}) {
    super(options);
    if (!domExists()) {
      return;
    }

    const { createLocation, createPath } = locationFactory(options);
    this.createLocation = createLocation;
    this.createPath = createPath;
    this._keygen = createKeyGen();

    ensureHash();

    this.location = this.locationFromBrowser()
    this.index = 0;
    this.locations = [this.location];
    this.action = 'POP';

    // true when undoing an out-of-app navigation
    // e.g. browser back/forward buttons
    this._reverting = false;

    this._beforeDestroy.push(
      createEventCoordinator({
        hashchange: (event) => { this._pop(); }
      })
    );
  }

  locationFromBrowser(providedState) {
    let { hash } = window.location;
    const path = decodeHashPath(hash);
    let { key, state } = providedState || getStateFromHistory();
    if (!key) {
      key = this._keygen.major();
      // replace with the hash we received, not the decoded path
      window.history.replaceState({ key, state }, null, hash);
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
    const key = this._keygen.major(wipingOutHistory && this.location.key);
    const location = this.createLocation(to, key, state);
    this._confirmNavigation  (
      location,
      'PUSH',
      () => {
        const path = encodeHashPath(this.createPath(location));
        window.history.pushState({ key, state }, null, path);

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
    // pass the current key to just increment the minor portion
    const key = this._keygen.minor(this.location.key);
    const location = this.createLocation(to, key, state);
    this._confirmNavigation(
      location,
      'REPLACE',
      () => {
        const path = encodeHashPath(this.createPath(location));
        window.history.replaceState({key, state }, null, path);

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
    // when we are reverting a pop (the user did not confirm navigation), we
    // just need to reset the boolean and return. The browser has already taken
    // care of updating the address bar and we never touched our internal values.
    if (this._reverting) {
      this._reverting = false;
      return;
    }
    const location = this.locationFromBrowser(state);
    const currentKey = this.location.key;
    const diff = diffKeys(currentKey, location.key);
    this._confirmNavigation(
      location,
      'POP',
      () => {
        this.location = location;
        this.index += diff;
        this.action = 'POP';
        this._emit(this.location, 'POP');
      },
      () => {
        this._reverting = true;

        window.history.go(-1*diff);
      }
    );
  }

}

export default HashHistory;
