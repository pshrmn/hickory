## Next

- Rename `Location` type to `RawLocation`.
- `location.key` is now a two number tuple (`[1, 0]` instead of `1.0`).
- Add `history.current` function that emits a navigation for the current location (with a no-op functions for finishing and cancelling the navigation).
- `InMemory` returns a pending history function. The "real" history object is created by passing a response handler to the pending history.

## 2.0.0-alpha.4

- Add `history.cancel` function for cancelling the active navigation.
- The history object will automatically cancel the pending navigation when another navigation happens.
- Remove `history.locations` and `history.index` values.
- `go` emulates browser behavior by setting `index` immediately instead of when the navigation is finished. This means that a subsequent `go` call will be based on the pending `index`, not the index of the current `history.location`.

## 2.0.0-alpha.3

- Remove generic `query` type.

## 2.0.0-alpha.2

- Remove navigation blocking from `InMemory`
- Remove `location.url`
- `strict` types
- Export `Location` type, rename `HickoryLocation` to `SessionLocation` and `LocationDetails` to `LocationComponents`.

## 2.0.0-alpha.1

- Remove `PUSH`, `REPLACE`, `ANCHOR`, and `POP` exports.

## 2.0.0-alpha.0

- `InMemory` is now a named export.
- Export `PUSH`, `REPLACE`, `ANCHOR`, and `POP` constants

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
