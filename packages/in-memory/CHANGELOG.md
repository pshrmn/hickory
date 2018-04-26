## 1.0.0-beta.5

* Unify `navigate()`, `push()`, and `replace()` under `navigate()`. The optional second argument controls which type of navigation: `ANCHOR` (default), `PUSH`, or `REPLACE`.

## 1.0.0-beta.4

* Re-export `LocationDetails`.
* Don't publish source maps.

## 1.0.0-beta.3

* Switch to using a response handler (assigned using `respondWith`) instead of the `subscriber` model.
* Default function returns an `InMemoryHistory` instead of just a `History`. `InMemoryHistory` extends `History`, but also includes `locations` and `index` properties.

## 1.0.0-beta.2

* Rename `update` to `navigate`.

## 1.0.0-beta.1

* Switch to TypeScript.
