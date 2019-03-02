## Next

- Add `history.cancel` function for cancelling the active navigation.
- The history object will automatically cancel the pending navigation when another navigation happens.

## 2.0.0-alpha.3

- Remove generic `query` type.

## 2.0.0-alpha.2

- Remove navigation blocking from `Browser`
- Use modular `@hickory/root` exports
- Remove `location.url`
- Remove event coordinator (handle events manually)
- `strict` types
- Export `Location` type, rename `HickoryLocation` to `SessionLocation` and `LocationDetails` to `LocationComponents`.

## 2.0.0-alpha.1

- Remove `PUSH`, `REPLACE`, `ANCHOR`, and `POP` exports.

## 2.0.0-alpha.0

- `Browser` is now a named export.
- Export `PUSH`, `REPLACE`, `ANCHOR`, and `POP` constants

## 1.0.2

- Revert dual-mode (not ready yet!).

## 1.0.1

- Build UMD, not IIFE
- Support dual-mode package (CJS/ESM) builds with `.js` and `.mjs` files.

## 1.0.0

- Wrap `pushState()` and `replaceState()` calls in a `try..catch` to protect against iOS Safari limits.

## 1.0.0-beta.7

- `history.go()` and `history.go(0)` now reload the page.
- Unify `navigate()`, `push()`, and `replace()` under `navigate()`. The optional second argument controls which type of navigation: `ANCHOR` (default), `PUSH`, or `REPLACE`.

## 1.0.0-beta.6

- Re-export `LocationDetails`.
- Don't publish source maps.

## 1.0.0-beta.5

- Switch to using a response handler (assigned using `respondWith`) instead of the `subscriber` model.

## 1.0.0-beta.4

- Rename `update` to `navigate`.

## 1.0.0-beta.3

- Switch to TypeScript.

## 1.0.0-beta.2

- Add `raw` option to `Hash` options. This defaults to a function that will generate the encoded version of a pathname (by setting an anchor element's `href` attribute and reading its `pathname`).
