## 1.0.0-beta.6

* Re-export `LocationDetails`.
* Don't publish source maps.

## 1.0.0-beta.5

* Switch to using a response handler (assigned using `respondWith`) instead of the `subscriber` model.

## 1.0.0-beta.4

* Rename `update` to `navigate`.

## 1.0.0-beta.3

* Switch to TypeScript.

## 1.0.0-beta.2

* Add `raw` option to `Hash` options. This defaults to a function that will generate the encoded version of a pathname (by setting an anchor element's `href` attribute and reading its `pathname`).
