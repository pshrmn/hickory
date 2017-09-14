## 1.0.0-beta.3

* Switch to TypeScript.

## 1.0.0-beta.2

* Add the `raw` option, which is used in `createLocation` to set a `rawPathname` property on the location object. The `rawPathname` will be preferred over `pathname` used when creating a URL (although the latter is still supported).
