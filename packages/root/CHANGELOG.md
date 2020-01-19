## 2.1.0

- Add navigation confirmation to each history type. Confirmation function is added using `history.confirm(fn)` and removed using `history.confirm()` (no argument).
- Rename `navigationConfirmation` to `confirmation`. `navigationConfirmation` still exists, but will be removed in next major.

## 2.0.0

The following is a consolidation of the pre-v2 changes.

### Exports

The module's exports have been broken up into modular functions.

#### `locationUtils`

- A function that creates functions for working with locations.
- The `stringify` function from `locationUtils` can receive a location object or a string.
- Location util's `stringify` function expects pathname to be absolute.
- Rename `baseSegment` option to `base`.
- `base` option for `locationUtils` is an object with `add` and `remove` properties (object returned by `createBase`).
- `locationUtils.location` can take an object of shape `{ url: string, state: any }`.

#### `keyGenerator`

- A function that sets up keys for locations.

#### `navigationConfirmation`

- A function that sets up the ability to block navigation until a user confirms that navigation.

#### `navigateWith`

- A function for setting up cancellable/finishable navigation.

#### `createBase`

- A function for creating a "base" object for applications that are not served from the "root" of a server.

## 1.0.2

- Revert dual-mode (not ready yet!).

## 1.0.1

- Build UMD, not IIFE
- Support dual-mode package (CJS/ESM) builds with `.js` and `.mjs` files

## 1.0.0-beta.8

- History objects have a single `navigate()` method instead of `push()`, `replace()`, and `navigate()`.

## 1.0.0-beta.7

- Export `LocationDetails` interface to describe `query`, `hash`, and `state`.
- Don't publish source maps.

## 1.0.0-beta.6

- Add `cancelled` property to `PendingNavigation`. This allows the response handler to more easily track if a navigation has been cancelled.

## 1.0.0-beta.5

- Transition Hickory to being paired with a router. This change removes subscriptions and instead uses a `ResponseHandler` from the router (assigned using the `respondWith` function). When the location changes, the `history` instance will call the response handler. The response handler will be provided the new `location` object, the `action` type of the navigation, a `finish` to be called once the router finishes loading the new location, and a `cancel` function that will be called when another navigation happens prior to the current one finishing. There are a couple of benefits from this change. The first is that there is now only one source for emitting the results of location changes (the router). The second is that updating the history array does not happen until any async code has finished running. This allows us to more easily handle navigation that occurs while a previous navigation is still resolving.

## 1.0.0-beta.4

- Rename `update` method to `navigate`.
- Create a `NavFn` type for navigation methods.

## 1.0.0-beta.3

- Switch to TypeScript.

## 1.0.0-beta.2

- Add the `raw` option, which is used in `createLocation` to set a `rawPathname` property on the location object. The `rawPathname` will be preferred over `pathname` used when creating a URL (although the latter is still supported).
