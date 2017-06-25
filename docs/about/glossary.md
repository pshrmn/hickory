# Hickory Glossary

* [hash](#hash)
* [key](#key)
* [location](#location)
* [pathname](#pathname)
* [query](#query)
* [state](#state)

## hash

The hash property of a location object is the hash string from the URI (with the leading pound symbol removed).

```js
// https://example.com/hello#goodbye
{ hash: 'goodbye' }
```

## key

The key is a string that is used to uniquely identify a location. It consists of two numbers that are joined using a period.

The first number is the "major" version and corresponds to the location's position among all visited locations. If you are comparing two locations, the one with the higher "major" version comes after the one with the lower.

The second number is the "minor" version. This number will typically be `0`, but it is incremented when you use `replace` to change locations at the same position.

## location

A location is an object with a number properties. Its [pathname](#pathname), [query](#query), and [hash](#hash) properties describe the location's path (e.g. how it is displayed as a string in your browser's address bar). The [key](#key) and [state](#state) properties provide additional data about the location that is not part of the path.

## pathname

The pathname property of a location is an absolute string (begins with a forward slash). The pathname is the primary way to identify what a location represents. For example, the pathname `/about` most likely represents the resource that will describe what your application is about. Similarly, the `/contact` pathname will probably correspond to a resource that describes how someone should contact you.

```js
// https://example.com/ni+hao
{ pathname: '/ni+hao' }
```

## query

The query property of a location represents the `window.location`'s `search` string, but possibly in a more digestible format. The default type of the query property is a string, but if you provide a `parse` function option when you create your history, that function will be used to transform the string.

```js
import { parse } from 'qs';
const history = Browser({ parse });

// https://example.com/hola?language=es
{ query: { language: 'es' }}
```

If you do not provide a `parse` function, the one thing to remember is that the `query` string will not have a leading question mark (?), which is different from `window.location.search`.

```js
const history = Browser();

// https://example.com/hola?language=es
{ query: 'language=es' }
```

## state

The state property allows you to attach additional information to a location. This is persistent data, so it will remain when the user reloads the page.
