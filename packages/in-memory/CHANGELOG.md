## 2.0.0

The following is a consolidation of the pre-v2 changes.

### Exports

- The function to create an in-memory history is now a named export: `inMemory`.
- Add a `createReusable` export, which is a function that creates a reusable history constructor for server-side rendering.
- The `inMemory` function takes a `ResponseHandler` as its first argument and an optional options object as its second argument.
- Remove navigation blocking from `inMemory` history.
- Add `createBase` export, which is a function that creates a base object to be passed as the `base` option (see options below).

### `history.url`

- Rename `history.toHref` to `history.url`. The `url` function expects the provided `pathname` to be absolute.
- `url` function can take a location object or a string.

### `history.navigate`

- The first argument to `history.navigate` is an object with shape `{ url: string, state?: any }`.
- The history object will automatically cancel the pending navigation when another navigation happens.

### `history.current`

- Add `history.current` function that emits a navigation for the current location (with a no-op functions for finishing and cancelling the navigation).

### `history.cancel`

- Add `history.cancel` function for cancelling the active navigation.

### `history.destroy`

- Destroyed `history` instance no longer emits navigation.

### locations

- `location.key` is now a two number tuple (`[1, 0]` instead of `1.0`).
- Remove `location.rawPathname`.
- Remove `location.url`

### `options`

- Rename `baseSegment` option to `base`.
- Remove `raw` option.

### Other

- Remove event coordinator (handle events manually)

## 1.0.2

- Revert dual-mode (not ready yet!).

## 1.0.1

- Build UMD, not IIFE
- Support dual-mode package (CJS/ESM) builds with `.js` and `.mjs` files

## 1.0.0-beta.7

- Emit new location after resetting.

## 1.0.0-beta.6

- Add a `reset()` function to in-memory history for resetting the locations. With no arguments, this sets the location to root (`/`) and index to `0`.

## 1.0.0-beta.5

- Unify `navigate()`, `push()`, and `replace()` under `navigate()`. The optional second argument controls which type of navigation: `ANCHOR` (default), `PUSH`, or `REPLACE`.

## 1.0.0-beta.4

- Re-export `LocationDetails`.
- Don't publish source maps.

## 1.0.0-beta.3

- Switch to using a response handler (assigned using `respondWith`) instead of the `subscriber` model.
- Default function returns an `InMemoryHistory` instead of just a `History`. `InMemoryHistory` extends `History`, but also includes `locations` and `index` properties.

## 1.0.0-beta.2

- Rename `update` to `navigate`.

## 1.0.0-beta.1

- Switch to TypeScript.
