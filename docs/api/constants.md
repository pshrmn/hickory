# Constants

Each of the public packages -- `@hickory/browser`, `@hickory/hash`, and `@hickory/in-memory` -- export some constants. These are `PUSH`, `REPLACE`, `ANCHOR`, and `POP`.

The constants, which are all strings, are provided as a convenience.

## `PUSH`

The string `"push`, this can be used either as a `navigate()` method or to compare against a history's current `action`.

```js
history.navigate(location, PUSH);
history.action === PUSH;
```

## `REPLACE`

The string `"replace`, this can be used either as a `navigate()` method or to compare against a history's current `action`.

```js
history.navigate(location, REPLACE);
history.action === REPLACE;
```

## `ANCHOR`

The string `"anchor`, this can be used either as a `navigate()` method.

```js
// this is also the default navigate method
history.navigate(location, ANCHOR);
```

## `POP`

The string `"pop`, this can be used to compare against a history's current `action`.

```js
history.action === POP;
```
