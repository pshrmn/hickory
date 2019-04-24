# Browser API

```js
import { browser } from "@hickory/browser";

const history = browser(responseHandler, options);
```

## Response Handler

When creating a history object, it must be passed a response handler function. This function will be called every time that a location change occurs. Any route matching/data loading that you need to perform should be triggered by this function.

The response handler function will be passed a "pending navigation" object. This object has four properties: `location`, `action`, `finish`, and `cancel`.

- `location` - This is the location object that is being navigated to.
- `action` - This is the string (`pop`, `push`, or `replace`) for the navigation type.
- `finish` - Once all matching/loading has finished, then you need to call the `finish` method to finalize the navigation. If you do not call this, the navigation will not actually occur.
- `cancel` - This method allows you to cancel a navigation. It should be called if another location change occurs while the current pending navigation is still pending. Calling `cancel` gives your history instance the opportunity to roll back to its previous state. This is only really necessary for `pop` navigation since the browser has already changed the location before Hickory knows about the location change. This method takes one argument, an action string; the action string may be used to alter the cancel behavior.

## Options

- `query` - An object with two required properties: `parse` and `stringify`.

  - `parse` - A function that will convert a search string to a query value. This function should return a default value when it is called with no arguments.

  - `stringify` - A function that will convert a query value into a search string. This function should return an empty string when it is called with no arguments.

- `decode` - Whether or not to automatically decode the `pathname` when creating a location. This should almost always be `true`, but if you have a reason to use invalid URIs, then you _can_ set this to `false` (possibly to your own peril). (default: `true`)

- `base` - An object with `add` and `remove` functions for adding and removing a base segment
  from locations/URLs, which is useful if the application isn't hosted from the root directory of a domain. The object can be created using the [`createBase`](./createBase.md) function.

## Properties

### location

The current location object.

## Methods

### navigate()

```js
history.navigate({
  url: "/oklahoma",
  state: { musical: true }
});
```

The `navigate` function is used to navigate to a new location.

There are three ways that it can do this: `push`, `replace`, and `anchor`.

1. `push` navigation pushes the new location onto the session history after the current location. Any existing locations after the current location are dropped.

```js
history.navigate({ url: "/lion-king" }, "push");
```

2. `replace` navigation replaces the current location with the new location. Any existing locations after the current location are unaffected.

```js
history.navigate({ url: "/cats" }, "replace");
```

3. `anchor` mimics the behavior of clicking on an `<a>` element. When the new location's URL is exactly the same as the current location's, it will act like `replace`; when they are different, it will act like `push`.

```js
history.navigate({ url: "/hairspray" }, "anchor");
```

#### arguments

`to` - An object with a `url` property, which is the URL to navigate to. The object can also include a `state` property, which is state that should be attached to the location.

`navType` - `anchor`, `push`, or `replace`. If none are provided, this will default to `anchor`.

### go()

```js
history.go(-1);
history.go();
history.go(2);
```

The `go` function is used to jump forward and backward to already visited locations. If you call it with a negative number, it goes backward. With a positive number, it goes forward. If you call it with no value (or `0`), it will reload the current location.

#### arguments

`num` - The number of steps forward or backward to go.

### href()

```js
history.href({ pathname: "/spamalot" });
// /spamalot
```

The `href` function generates the string representation of the location object. This string will be prepended with the `base` (if you provided one).

#### arguments

`location` - The location to create a path for.

### destroy()

```js
history.destroy();
```

The `destroy` function allows you to remove all event listeners. Generally speaking, you will not need to call this. However, if for some reason you want to create a new history object, you should call this one on the existing history object .
