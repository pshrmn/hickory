import {
  completePathname,
  completeHash,
  completeQuery,
  stripBaseSegment
} from '@hickory/location-utils';

function defaultParseQuery(query) {
  return query ? query : '';
}

function defaultStringifyQuery(query) {
  return query ? query : '';
}

function isValidBase(baseSegment) {
  return (
    typeof baseSegment === 'string' &&
    baseSegment.charAt(0) === '/' &&
    baseSegment.charAt(baseSegment.length -1) !== '/'
  );
}

function validateQueryOption(query) {
  let parse, stringify;
  if (!query) {
    parse = defaultParseQuery;
    stringify = defaultStringifyQuery;
  } else {
    let completeQuery = true;
    if (typeof query.parse !== 'function') {
      console.warn('The query option must contain a parse function property');
      completeQuery = false;
    }
    if (typeof query.stringify !== 'function') {
      console.warn('The query option must contain a stringify function property');
      completeQuery = false;
    }

    if (completeQuery) {
      parse = query.parse;
      stringify = query.stringify;
    } else {
      // when either property is invalid, we use the defaults for both
      parse = defaultParseQuery;
      stringify = defaultStringifyQuery;
    }
  }

  return {
    parse,
    stringify
  }
}

export default function locationFactory(options = {}) {
  const {
    query,
    decode = true,
    baseSegment = '',
    raw = p => p
  } = options;

  const {
    parse,
    stringify
  } = validateQueryOption(query);

  if (baseSegment !== '' && !isValidBase(baseSegment)) {
    throw new Error('The baseSegment "' + baseSegment + '" is not valid.' +
      ' The baseSegment must begin with a forward slash and end with a' +
      ' non-forward slash character.');
  }

  function parsePath(value) {
    const location = {};

    // hash is always after query, so split it off first
    const hashIndex = value.indexOf('#');
    if (hashIndex !== -1) {
      location.hash = value.substring(hashIndex+1);
      value = value.substring(0, hashIndex);
    } else {
      location.hash = '';
    }

    const queryIndex = value.indexOf('?');
    if (queryIndex !== -1) {
      location.query = parse(value.substring(queryIndex+1));
      value = value.substring(0, queryIndex);
    } else {
      location.query = parse();
    }

    location.pathname = stripBaseSegment(value, baseSegment);

    return location;
  }

  function createLocation(value, key, state = null) {
    let location;
    if (typeof value === 'string') {
      location = parsePath(value)
    } else {
      location = Object.assign({}, value);
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

    location.rawPathname = raw(location.pathname);

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
    // ensure that pathname begins with a forward slash, query begins
    // with a question mark, and hash begins with a pound sign
    return (
      baseSegment +
      completePathname(location.rawPathname || location.pathname || '') +
      completeQuery(stringify(location.query)) +
      completeHash(location.hash)
    );
  }

  return {
    createLocation,
    createPath
  };
}
