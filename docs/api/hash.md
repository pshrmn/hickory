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

- `decode` - Whether or not to automatically decode the `pathname` when creating a location. This should almost always be `true`, but if you have a reason to use invalid URIs, then you _can_ set this to `false` (possibly to your own peril). (default: `true`)

- `hashType` - The `hashType` specifies how we translate `window.location.hash` to a location (and vice versa). The options are `default`, `bang`. and `clean`.

  - `default` - The encoded path begins with `#/`. If you do not provide a `hashType` option, this one will be used.

  - `bang` - The encoded path begins with `#!/`.

  - `clean` - The encoded path begins with `#` (no leading slash). This has one exception, which is the root location because there has to be at least one charater after the pound sign for a valid hash string.

- `base` - This is a string that begins with a forward slash and ends with a non-foward slash character. It should be provided if your application is not being served from the root of your server.

**Note:** While you _can_ use the `base` with a `hash` history, you probably should not. The `base` only affects the `pathname` of location objects (and the URIs those produce). For example, if you create a history like this:

```js
const history = hash({ base: "/test" });
```

The `/test` segment will be stripped from and included in the hash segment of the full URI.

```js
const uri = history.href({ pathname: "/pathname" });
// uri === '#/test/pathname'
```

Any pathname segments that exist prior to the hash section (or the full URI) will be ignored.

## Properties

### location

The current location object.

## Methods

### navigate()

```js
history.navigate("/the-producers");
history.navigate({
  pathname: "/oklahoma",
  state: { musical: true }
});
```

The `navigate` function is used to navigate to a new location.

There are three ways that it can do this: `push`, `replace`, and `anchor`.

1.  `push` navigation pushes the new location onto the session history after the current location. Any existing locations after the current location are dropped.

```js
history.navigate("/lion-king", "push");
history.navigate(
  {
    pathname: "/wicked",
    state: { musical: true }
  },
  "push"
);
```

2.  `replace` navigation replaces the current location with the new location. Any existing locations after the current location are unaffected.

```js
history.navigate("/cats", "replace");
history.navigate(
  {
    pathname: "/rent",
    state: { musical: true }
  },
  "replace"
);
```

3.  `anchor` mimics the behavior of clicking on an `<a>` element. When the new location's URL is exactly the same as the current location's, it will act like `replace`; when they are different, it will act like `push`.

```js
history.navigate("/hairspray", "anchor");
history.navigate(
  {
    pathname: "/hamilton",
    state: { musical: true }
  },
  "anchor"
);
```

#### arguments

`to` - This can either be a string or an object. If it is a string, it will be parsed to create a location object. If it is an object, then its properties will be used to create a new location object. If the provided object is missing any location properties, then those will be given default values on the new location object.

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

### href()

```js
history.href({ pathname: "/spamalot" });
// #/spamalot
```

The `href` function generates the string representation of the location object. This string could be parsed to create the same location object, which means that for a hash history, it will be prepended with the pound sign (`#`).

#### arguments

`location` - The location to create a path for.

### destroy()

```js
history.destroy();
```

The `destroy` function allows you to remove all event listeners. Generally speaking, you will not need to call this. However, if for some reason you want to create a new history object, you should call this one on the existing history object .
