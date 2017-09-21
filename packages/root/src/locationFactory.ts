import {
  completePathname,
  completeHash,
  completeQuery,
  stripBaseSegment
} from '@hickory/location-utils';

import { HickoryLocation, PartialLocation, AnyLocation } from './interface';

export interface QueryFunctions {
  parse: (query?:string) => any;
  stringify: (query?:any) => string;
}

export interface LocationFactoryOptions {
  query?: QueryFunctions;
  decode?: boolean;
  baseSegment?: string;
  raw?: (pathname: string) => string;
}

export interface LocationMethods {
  createLocation(value: string | object, key?: string, state?: any): HickoryLocation;
  createPath(location: HickoryLocation): string;
  createPath(location: PartialLocation): string;
}

function defaultParseQuery(query?: string): string {
  return query ? query : '';
}

function defaultStringifyQuery(query?: string): string {
  return query ? query : '';
}

function isValidBase(baseSegment: string): boolean {
  return (
    typeof baseSegment === 'string' &&
    baseSegment.charAt(0) === '/' &&
    baseSegment.charAt(baseSegment.length -1) !== '/'
  );
}

function validateQueryOption(query: QueryFunctions | undefined): QueryFunctions {
  let parse, stringify;
  return query
    ? query
    : {
        parse: defaultParseQuery,
        stringify: defaultStringifyQuery
      };
}

export default function locationFactory(
  options: LocationFactoryOptions = {}
): LocationMethods {
  const {
    query,
    decode = true,
    baseSegment = '',
    raw = (p:string): string => p
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

  function parsePath(value: string): PartialLocation {
    const location: PartialLocation = {} as PartialLocation;

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

  function createLocation(
    value: PartialLocation | string,
    key?: string,
    state: any = null
  ): HickoryLocation {
    let partial: PartialLocation;
    if (typeof value === 'string') {
      partial = parsePath(value)
    } else {
      partial = {...value} as PartialLocation;
      if (partial.hash == null) {
        partial.hash = ''
      }
      if (partial.query == null) {
        partial.query = parse();
      }
      if (partial.pathname == null) {
        partial.pathname = '/';
      }
    }
    // don't set state if it already exists
    if (state && !partial.state) {
      partial.state = state;
    }

    const location: HickoryLocation = {
      ...partial as HickoryLocation,
      key: key,
      rawPathname: raw(partial.pathname)
    };

    location.key = key;

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

  function createPath(location: AnyLocation): string {
    // ensure that pathname begins with a forward slash, query begins
    // with a question mark, and hash begins with a pound sign
    return (
      baseSegment +
      completePathname(
        (<HickoryLocation>location).rawPathname ||
        location.pathname ||
        ''
      ) +
      completeQuery(stringify(location.query)) +
      completeHash(location.hash)
    );
  }

  return {
    createLocation,
    createPath
  };
}