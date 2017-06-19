import {
  completePathname,
  completeHash,
  completeQuery
} from './utils/location';

function defaultParseQuery(query) {
  return query ? query : '';
}

function defaultStringifyQuery(query) {
  return query ? query : '';
}

export default function locationFactory(options = {}) {
  const {
    parse = defaultParseQuery,
    stringify = defaultStringifyQuery,
    decode = true,
    base = ''
  } = options;

  function parsePath(value) {
    const location = {
      pathname: '',
      query: parse(),
      hash: ''
    };

    // hash is always after query, so split it off first
    const hashIndex = value.indexOf('#');
    if (hashIndex !== -1) {
      location.hash = value.substring(hashIndex+1);
      value = value.substring(0, hashIndex);
    }

    const queryIndex = value.indexOf('?');
    if (queryIndex !== -1) {
      location.query = parse(value.substring(queryIndex+1));
      value = value.substring(0, queryIndex);
    }

    location.pathname = value;

    return location;
  }

  function createLocation(value, key, state = null) {
    let location;
    if (typeof value === 'string') {
      location = parsePath(value)
    } else {
      location = value;
      if (location.hash == null) {
        location.hash = ''
      }
      if (location.query == null) {
        location.query = parse();
      }
      if (location.pathname == null) {
        location.pathname = '/';
      }
    }
    location.key = key;
    // don't set state if it already exists
    if (state && !location.state) {
      location.state = state;
    }

    // it can be more convenient to interact with the decoded pathname,
    // but leave the option for using the encoded value
    if (decode) {
      try {
        location.pathname = decodeURI(location.pathname);
      } catch (e) {
        throw e instanceof URIError
          ? new URIError('Pathname "' + location.pathname + '" could not be decoded. ' +
              'This is most likely due to a bad percent-encoding. For more information, ' +
              'see the third paragraph here https://tools.ietf.org/html/rfc3986#section-2.4')
          : e;
      }
      
    }
    return location;
  }

  function createPath(location) {
    const {
      pathname = '',
      query,
      hash = ''
    } = location;
    // ensure that pathname begins with a forward slash, query begins
    // with a question mark, and hash begins with a pound sign
    return (
      completePathname(pathname) +
      completeQuery(stringify(query)) +
      completeHash(hash)
    );
  }

  return {
    createLocation,
    createPath
  };
}
