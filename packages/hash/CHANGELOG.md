## 2.0.0-beta.15

- Destroyed `history` instance no longer emits navigation.

## 2.0.0-beta.14

- `url` function expects pathname to be absolute.

## 2.0.0-beta.13

- Rename `history.href` to `history.url`.
- The first argument to `history.navigate` is an object with shape `{ url: string, state?: any }`.
- Add `createBase` export.

## 2.0.0-beta.12

- `history.navigate()` takes one argument, an object with an optional `state` property. The object can either contain URL components (`pathname`, `query`, and `hash`) or a URL string under the `url` property.

## 2.0.0-beta.10

- Rename `base_segment` option to `base`.

## 2.0.0-beta.9

- Clean up internals

## 2.0.0-beta.8

- Rename `to_href` to `href`.
- `href` function can take a location object or a string.

## 2.0.0-beta.7

- Remove `pathname` option.

## 2.0.0-beta.6

- Lowercase export (`Hash` to `hash`).

## 2.0.0-beta.5

- Rename `toHref` property to `to_href`.
- Rename `hashType` option to `hash_type`

## 2.0.0-beta.4

- Rename `raw` option to `pathname`.

## 2.0.0-beta.3

- Use `encodeurl` package to ensure proper encoding across browsers.

## 2.0.0-beta.2

- Remove `location.rawPathname`. Rely on the `raw` option to correctly format the provided pathname.
- Remove `RawLocation` type.

## 2.0.0-beta.0

- Pass `ResponseHandler` as first argument to `Hash`.
- Remove `PendingHistory` (`history` returned by calling `Hash` function).

## 2.0.0-alpha.5

- Rename `Location` type to `RawLocation`.
- `location.key` is now a two number tuple (`[1, 0]` instead of `1.0`).
- Add `history.current` function that emits a navigation for the current location (with a no-op functions for finishing and cancelling the navigation).
- `Hash` returns a pending history function. The "real" history object is created by passing a response handler to the pending history.

## 2.0.0-alpha.4

- Add `history.cancel` function for cancelling the active navigation.
- The history object will automatically cancel the pending navigation when another navigation happens.

## 2.0.0-alpha.3

- Remove generic `query` type.

## 2.0.0-alpha.2

- Remove navigation blocking from `Hash`
- Remove `location.url`
- Remove event coordinator (handle events manually)
- Listen for `popstate` instead of `hashchange`
- `strict` types
- Export `Location` type, rename `HickoryLocation` to `SessionLocation` and `LocationDetails` to `LocationComponents`.

## 2.0.0-alpha.1

- Remove `PUSH`, `REPLACE`, `ANCHOR`, and `POP` exports.

## 2.0.0-alpha.0

- `Hash` is now a named export.
- Export `PUSH`, `REPLACE`, `ANCHOR`, and `POP` constants

## 1.0.2

- Revert dual-mode (not ready yet!).

## 1.0.1

- Build UMD, not IIFE
- Support dual-mode package (CJS/ESM) builds with `.js` and `.mjs` files

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
