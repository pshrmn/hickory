import History from './history';
import locationFactory from './locationFactory';
import createKeyGen from './utils/keygen';

export default class MemoryHistory extends History {
  constructor(options = {}) {
    super(options);

    const { createLocation, createPath } = locationFactory(options);
    this.createLocation = createLocation;
    this.createPath = createPath;
    this.keygen = createKeyGen();

    // convert the provided values into location objects
    // the values can be a path string, a (partial) location object,
    // or an array (in which case the first value is either a path string
    // or a partial location object and the second argument is a state object).
    if (options.locations) {
      this.locations = options.locations.map(loc => {
        const key = this.keygen.major();
        if (Array.isArray(loc)) {
          const [value, state] = loc;
          return this.createLocation(value, key, state);
        } else {
          return this.createLocation(loc, key);
        }
      })
    } else {
      this.locations = [
        this.createLocation({ pathname: '/' }, this.keygen.major())
      ];
    }

    // if options.index is invalid, we will fallback to 0
    if (options.index && options.index > 0 && options.index < this.locations.length) {
      this.index = options.index;
    } else {
      this.index = 0;
    }


    this.location = this.locations[this.index];
    this.action = 'POP';
  }

  // This should be fixed because we are creating location objects
  // twice (once here, once in the actual nav function).
  navigate(to, state) {
    const location = this.createLocation(to, state, null);
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
        this.location = location;
        this.locations[this.index] = this.location;
        this.action = 'REPLACE';
        this._emit(this.location, 'REPLACE');
      }
    );
  }

  go(num) {
    if (num == null || num === 0) {
      this._emit(this.location, this.action);
    } else {
      const newIndex = this.index + num;
      if (newIndex < 0 || newIndex >= this.locations.length) {
        return;
      } else {
        this.confirmNavigation(
          this.locations[newIndex],
          'POP',
          () => {
            this.index = newIndex;
            this.location = this.locations[this.index];
            this.action = 'POP';
            this._emit(this.location, 'POP');
          }
        )
      }
    }
  }
};

