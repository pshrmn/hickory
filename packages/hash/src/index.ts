import createCommonHistory from '@hickory/root';
import {
  getStateFromHistory,
  domExists,
  createEventCoordinator,
  ensureEncodedPathname
} from '@hickory/dom-utils';
import hashEncoderAndDecoder from './hashTypes';

import {
  History,
  HickoryLocation,
  PartialLocation,
  AnyLocation,
  ConfirmationFunction,
  Options as RootOptions,
  ToArgument,
  ResponseHandler,
  PendingNavigation,
  Action
} from '@hickory/root';

export { History, HickoryLocation, PartialLocation, AnyLocation };

function ensureHash(encode: (path: string) => string): void {
  if (window.location.hash === '') {
    window.history.replaceState(null, '', encode('/'));
  }
}

export interface Options extends RootOptions {
  raw?: (pathname: string) => string;
  hashType?: string
}


export default function Hash(options: Options = {}): History {
  if (!domExists()) {
    return;
  }

  if (!options.raw) {
    options.raw = ensureEncodedPathname;
  }

  const {
    createLocation,
    createPath,
    confirmNavigation,
    confirmWith,
    removeConfirmation,
    keygen
  } = createCommonHistory(options);

  const {
    decode: decodeHashPath,
    encode: encodeHashPath
  } = hashEncoderAndDecoder(options.hashType);

  const beforeDestroy: Array<() => void> = [];

  // when true, pop will run without attempting to get user confirmation
  let reverting = false;

  ensureHash(encodeHashPath);

  function locationFromBrowser(providedState?: object): HickoryLocation {
    let { hash } = window.location;
    const path = decodeHashPath(hash);
    let { key, state } = providedState || getStateFromHistory();
    if (!key) {
      key = keygen.major();
      // replace with the hash we received, not the decoded path
      window.history.replaceState({ key, state }, '', hash);
    }
    return createLocation(path, key);
  }

  function toHref(location: AnyLocation): string {
    return encodeHashPath(createPath(location));
  }

  let responseHandler: ResponseHandler;
  
    function finalizePush(location: HickoryLocation) {
      return () => {
        const path = toHref(location);
        const { key, state } = location;
        window.history.pushState({ key, state }, '', path);
        hashHistory.location = location;
        hashHistory.action = 'PUSH';
      }
    }
  
    function finalizeReplace(location: HickoryLocation) {
      return () => {
        const path = toHref(location);
        const { key, state } = location;
        window.history.replaceState({ key, state }, '', path);
        hashHistory.location = location;
        hashHistory.action = 'REPLACE';
      }
    }

  const hashHistory: History = {
    // location
    action: (getStateFromHistory().key !== undefined ? 'POP' : 'PUSH') as Action,
    location: locationFromBrowser(),
    // set response handler
    respondWith: function(fn: ResponseHandler) {
      responseHandler = fn;
      responseHandler({
        location: hashHistory.location,
        action: hashHistory.action,
        finish: () => {},
        cancel: () => {}
      });
    },
    // convenience
    toHref,
    confirmWith,
    removeConfirmation,
    destroy: function destroy() {
      beforeDestroy.forEach(fn => { fn(); });
    },
    navigate: function navigate(to: ToArgument): void {
      const location = createLocation(to, null);
      const path = createPath(location);
      const currentPath = createPath(hashHistory.location);
      
      if (path === currentPath) {
        hashHistory.replace(to);
      } else {
        hashHistory.push(to);
      }
    },
    push: function push(to: ToArgument): void {
      const key = keygen.major(hashHistory.location.key);
      const location = createLocation(to, key);
      confirmNavigation  (
        {
          to: location,
          from: hashHistory.location,
          action: 'PUSH'
        },
        () => {
          if (!responseHandler) {
            return;
          }
          responseHandler({
            location,
            action: 'PUSH',
            finish: finalizePush(location),
            cancel: () => {}
          });          
        }
      );
    },
    replace: function replace(to: ToArgument): void {
      // pass the current key to just increment the minor portion
      const key = keygen.minor(hashHistory.location.key);
      const location = createLocation(to, key);
      confirmNavigation(
        {
          to: location,
          from: hashHistory.location,
          action: 'REPLACE'
        },
        () => {
          if (!responseHandler) {
            return;
          }
          responseHandler({
            location,
            action: 'REPLACE',
            finish: finalizeReplace(location),
            cancel: () => {}
          });
        }
      );
    },
    go: function go(num: number): void {
      // calling window.history.go with no value reloads the page, but
      // we will just re-emit instead
      if (!num) {
        if (!responseHandler) {
          return;
        }
        responseHandler({
          location: hashHistory.location,
          action: 'POP',
          finish: () => {
            hashHistory.action = 'POP';
          },
          cancel: () => {}
        });
      } else {
        window.history.go(num);
      }
    }
  };

  function pop(state: object): void {
    // when we are reverting a pop (the user did not confirm navigation), we
    // just need to reset the boolean and return. The browser has already taken
    // care of updating the address bar and we never touched our internal values.
    if (reverting) {
      reverting = false;
      return;
    }
    const location: HickoryLocation = locationFromBrowser(state);
    const currentKey: string = hashHistory.location.key;
    const diff: number = keygen.diff(currentKey, location.key);
    confirmNavigation(
      {
        to: location,
        from: hashHistory.location,
        action: 'POP'
      },
      () => {
        if (!responseHandler) {
          return;
        }
        responseHandler({
          location,
          action: 'POP',
          finish: () => {
            hashHistory.location = location;
            hashHistory.action = 'POP';
          },
          cancel: (nextAction: Action) => {
            if (nextAction === 'POP') {
              return;
            }
            reverting = true;
            window.history.go(-1*diff);
          }
        });
      },
      () => {
        reverting = true;
        window.history.go(-1*diff);
      }
    );
  }

  beforeDestroy.push(
    createEventCoordinator({
      hashchange: (event: PopStateEvent) => {
        pop(event.state);
      }
    })
  );

  return hashHistory;
}
