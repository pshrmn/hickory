# `createBase`

An application that does not exist at a domain's root can use a base segment to create correct URLs.

For example, if an application is served from `https://www.example.com/my-application`, then `/my-application` would be a base segment.

Hickory provides a `createBase` function for setting up a base segment for a history. This would then be passed as an option when creating a history object.

```js
import { browser, createBase } from "@hickory/browser";
// the in-memory and hash packages also export createBase

const base = createBase("/my-application");
const history = browser(fn, { base });
```

The base has two functionalities:

1. It adds the base segment to the beginning of URL strings.
2. It removes the base segment from a URL when creating a location object.

In addition to the base segment, `createBase` can take an options object to configure how it works.

### Configuration Argument

#### `emptyRoot`

An application typically has a root location whose pathname is `/`. Given an application whose base segment is `/my-application` and a location whose pathname is `/`, creating a URL from those would yield the string `/my-application/`. If you prefer for the root location to be represented without a trailing slash, `emptyRoot` can be set to `true`.

```js
const nonEmptyRoot = createBase("/my-application"); // emptyRoot = false
const history = browser(fn, { base: nonEmptyRoot });
const url = history.url({ pathname: "/" });
// url = "/my-appliction/"

const emptyRoot = createBase("/my-application"), { emptyRoot: true });
const history = browser(fn, { base: emptyRoot });
const url = history.url({ pathname: "/" });
// url = "/my-appliction"
```

This option only affects the root location `/`; any other location pathnames will be kept as provided.

#### `strict`

When `strict` is true (it defaults to false), it causes the application to throw when given an invalid URL.

```js
const nonStrict = createBase("/my-application");
const history = browser(fn, { base: nonStrict });
history.navigate({ url: "/my-application/test" });
// navigates to location { pathname: "/test" }
history.navigate({ url: "/test" });
// navigates to location { pathname: "/test" }

const strict = createBase("/my-application");
const history = browser(fn, { base: strict });
history.navigate({ url: "/my-application/test" });
// navigates to location { pathname: "/test" }
history.navigate({ url: "/test" });
// throws
```

Additionally, when `emptyRoot` is false, `strict` will cause the application to throw when navigating to the root location if it is missing the trailing slash.

```js
const nonEmptyRoot = createBase("/my-application", { strict: true });
const history = browser(fn, { base: nonEmptyRoot });
history.navigate({ url: "/my-application" });
// throws
history.navigate({ url: "/my-application/" });
// navigates to location { pathname: "/" }

const emptyRoot = createBase("/my-application", {
  strict: true,
  emptyRoot: true
});
const history = browser(fn, { base: strict });
history.navigate({ url: "/my-application" });
// navigates to location { pathname: "/" }
history.navigate({ url: "/my-application/" });
// navigates to location { pathname: "/" }
```
