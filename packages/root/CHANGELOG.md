## Next

* Don't publish source maps.

## 1.0.0-beta.6

* Add `cancelled` property to `PendingNavigation`. This allows the response handler to more easily track if a navigation has been cancelled.

## 1.0.0-beta.5

* Transition Hickory to being paired with a router. This change removes subscriptions and instead uses a `ResponseHandler` from the router (assigned using the `respondWith` function). When the location changes,  the `history` instance will call the response handler. The response handler will be provided the new `location` object, the `action` type of the navigation, a `finish` to be called once the router finishes loading the new location, and a `cancel` function that will be called when another navigation happens prior to the current one finishing. There are a couple of benefits from this change. The first is that there is now only one source for emitting the results of location changes (the router). The second is that updating the history array does not happen until any async code has finished running. This allows us to more easily handle navigation that occurs while a previous navigation is still resolving.

## 1.0.0-beta.4

* Rename `update` method to `navigate`.
* Create a `NavFn` type for navigation methods.

## 1.0.0-beta.3

* Switch to TypeScript.

## 1.0.0-beta.2

* Add the `raw` option, which is used in `createLocation` to set a `rawPathname` property on the location object. The `rawPathname` will be preferred over `pathname` used when creating a URL (although the latter is still supported).
