# Hash API

```js
import { hash } from "@hickory/hash";

const history = hash(responseHandler, options);
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

- `hashType` - The `hashType` specifies how we translate `window.location.hash` to a location (and vice versa). The options are `default`, `bang`. and `clean`.

  - `default` - The encoded path begins with `#/`. If you do not provide a `hashType` option, this one will be used.

  - `bang` - The encoded path begins with `#!/`.

  - `clean` - The encoded path begins with `#` (no leading slash). This has one exception, which is the root location because there has to be at least one charater after the pound sign for a valid hash string.

- `base` - An object with `add` and `remove` functions for adding and removing a base segment
  from locations/URLs, which is useful if the application isn't hosted from the root directory of a domain. The object can be created using the [`createBase`](./createBase.md) function.

**Note:** While you _can_ use the `base` with a `hash` history, you probably should not. The `base` only affects the `pathname` of location objects (and the URIs those produce). For example, if you create a history like this:

```js
const history = hash({ base: "/test" });
```

The `/test` segment will be stripped from and included in the hash segment of the full URI.

```js
const uri = history.url({ pathname: "/pathname" });
// uri === '#/test/pathname'
```

Any pathname segments that exist prior to the hash section (or the full URI) will be ignored.

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

1.  `push` navigation pushes the new location onto the session history after the current location. Any existing locations after the current location are dropped.

```js
history.navigate({ url: "/lion-king" }, "push");
```

2.  `replace` navigation replaces the current location with the new location. Any existing locations after the current location are unaffected.

```js
history.navigate({ url: "/cats" }, "replace");
```

3.  `anchor` mimics the behavior of clicking on an `<a>` element. When the new location's URL is exactly the same as the current location's, it will act like `replace`; when they are different, it will act like `push`.

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

The `go` function is used to jump forward and backward to already visited locations. If you call it with a negative number, it goes backward. With a positive number, it goes forward. If you call it with no value (or `0`), it will re-emit the current location (with a `pop` action).]

#### arguments

`num` - The number of steps forward or backward to go.

### url()

```js
history.url({ pathname: "/spamalot" });
// /spamalot

const base = createBase("/hip/hip");
const hiptory = browser(fn, { base });
hiptory.url("/hooray");
// /hip/hip/hooray
```

The `url` function returns a URL string. It can take either a location object or a string.

If the `history` is configured with a base segment, the base segment will be prepended to the URL string.

When the argument is an object:

1. If the `pathname` is `undefined`, the returned string will have no pathname component, including no base segment.
2. If the `pathname` is included, it is expected to be absolute (begin with a forward slash `/`).

When the argument is a string:

1. If the first character is a question mark (`?`) or hash symbol (`#`), the returned string will have no pathname component, including no base segment.
2. When there is a pathname, it is expected to be absolute (begin with a forward slash).

#### arguments

`location` - A location object or a string.

### destroy()

```js
history.destroy();
```

The `destroy` function allows you to remove all event listeners. Generally speaking, you will not need to call this. However, if for some reason you want to create a new history object, you should call this one on the existing history object .
