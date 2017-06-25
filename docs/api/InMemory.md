# InMemory API

```js
import { InMemory } from 'hickory';

const history = InMemory();
```

## Options

* `parse` - A function that will convert a search string to a query value. This function should return a default value when it is called with no arguments.

* `stringify` - A function that will convert a query value into a search string. This function should return an empty string when it is called with no arguments.

* `decode` - Whether or not to automatically decode the `pathname` when creating a location. This should almost always be `true`, but if you have a reason to use invalid URIs, then you _can_ set this to `false` (possibly to your own peril). (default: `true`)

## Properties

### location

The current location object.

### action

The action used to get to the current location object.

### locations

The array of all visited locations.

### index

The index of the current location in the locations array.

## Methods

### push

```js
history.push('/the-producers');
history.push({
  pathname: '/oklahoma',
  state: { musical: true }
});
```

The `push` function is used to navigate to a new location. It adds the new location after the current location. This means that if the current location is not the last location in the history array, any locations that come after the current one will be wiped out.

#### arguments

`to` - This can either be a string or an object. If it is a string, it will be parsed to create a location object. If it is an object, then its properties will be used to create a new location object. If the provided object is missing any location properties, then those will be given default values on the new location object.

### replace

```js
history.replace('/cats');
history.replacell({
  pathname: '/rent',
  state: { musical: true }
});
```

The `replace` function is used to navigate to a new location. It replaces the current location with the new one. Any location objects that come after the current location in the history array will be preserved.

#### arguments

`to` - This can either be a string or an object. If it is a string, it will be parsed to create a location object. If it is an object, then its properties will be used to create a new location object. If the provided object is missing any location properties, then those will be given default values on the new location object.

### update

```js
history.update('/hairspray');
history.update({
  pathname: '/hamilton',
  state: { musical: true }
});
```

The `update` function decides whether to `push` or `replace` for you. The path string that it creates is compared to the path string of the current location. If they are the same, then it will call `replace`. If they are different, then it will call `push`. This is done to mimic browser behavior and **unless you have a reason not to, you should prefer this over `push` and `replace`.**

#### arguments

* `to` - This can either be a string or an object. If it is a string, it will be parsed to create a location object. If it is an object, then its properties will be used to create a new location object. If the provided object is missing any location properties, then those will be given default values on the new location object.

### go

```js
history.go(-1);
history.go();
history.go(2);
```

The `go` function is used to jump forward and backward to already visited locations. If you call it with a negative number, it goes backward. With a positive number, it goes forward. If you call it with no value (or `0`), it will re-emit the current location (with a `POP` action).]

#### arguments

* `num` - The number of steps forward or backward to go.

### createPath

```js
history.createPath({ pathname: '/spamalat' });
```

The `createPath` function allows you to generate the path string for a location object. This string will be prepended with the `baseSegment` (if you provided one).

#### arguments

* `location` - The location to create a path for.

### subscribe

```js
let unsubscribe = history.subscribe((location, action) => {
  console.log(action, location);
});
```

The `subscribe` function allows you to register a function that will be called whenever the location changes. It will return a "unsubscribe" function, which you can call to stop the subscribed function from being called. You can register as many subscriber functions as you would like. When navigation happens, they will be called in the order that they were subscribed.

Each function will be passed two arguments: `location` and `action`. The location argument is the new location object. The action argument is the type of navigation that occurred.

#### arguments

* `fn` - The function to be called when the location changes.

### confirmWith

```js
history.confirmWith((location, action, success, failure) => {
  const result = window.confirm("Are you sure you want to navigate?");
  if (result) {
    success();
  } else {
    failure();
  }
});
```

The `confirmWith` function allows you to register a function that will be called when navigation happens. This allows you to prevent navigation, which can be useful if you have a form whose data will be lost after navigation. If there is no registered confirmation function, then navigation will happen automatically.

Only one confirmation function can be registered at a time, so if you call `confirmWith` when there is already a confirmation function, the existing one will be removed.

#### arguments

* `fn` - The function to be called to confirm the navigation. This will receive four arguments. The first one is the location that is being navigated to. The second is the navigation action (`PUSH`, `REPLACE`, or `POP`). The third is a success function, which you should call when you want the navigation to happen. The fourth is a failulre function, which you should call when you want to stop the navigation.

### removeConfirmation

```js
history.removeConfirmation();
```

The `removeConfirmation` function will remove the current confirmation function (if one exists). After calling `removeConfirmation`, navigation will happen automatically (until another confirmation function is added).

### destroy

```js
history.destroy();
```

The `destroy` function allows you to remove all subscribers and event listeners. Generally speaking, you will not need to call this. However, if for some reason you want to create a new history object, you should call this one on the existing history object .