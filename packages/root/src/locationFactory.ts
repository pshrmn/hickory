import {
  completePathname,
  completeHash,
  completeQuery,
  stripBaseSegment
} from "@hickory/location-utils";

import {
  HickoryLocation,
  PartialLocation,
  AnyLocation,
  LocationDetails
} from "./types/location";
import { ToArgument } from "./types/hickory";
import {
  LocationFactoryOptions,
  LocationMethods
} from "./types/locationFactory";

function defaultParseQuery(query?: string): any {
  return query ? query : "";
}

function defaultStringifyQuery(query?: any): string {
  return query ? query : "";
}

function isValidBase(baseSegment: string): boolean {
  return (
    typeof baseSegment === "string" &&
    baseSegment.charAt(0) === "/" &&
    baseSegment.charAt(baseSegment.length - 1) !== "/"
  );
}

export default function locationFactory<Q>(
  options: LocationFactoryOptions<Q> = {}
): LocationMethods<Q> {
  const {
    query: {
      parse: parseQuery = defaultParseQuery,
      stringify: stringifyQuery = defaultStringifyQuery
    } = {},
    decode = true,
    baseSegment = "",
    raw = (p: string): string => p
  } = options;

  if (baseSegment !== "" && !isValidBase(baseSegment)) {
    throw new Error(
      'The baseSegment "' +
        baseSegment +
        '" is not valid.' +
        " The baseSegment must begin with a forward slash and end with a" +
        " non-forward slash character."
    );
  }

  function parsePath(value: string, state: any): LocationDetails<Q> {
    // hash is always after query, so split it off first
    const hashIndex = value.indexOf("#");
    let hash;
    if (hashIndex !== -1) {
      hash = value.substring(hashIndex + 1);
      value = value.substring(0, hashIndex);
    } else {
      hash = "";
    }

    const queryIndex = value.indexOf("?");
    let query;
    if (queryIndex !== -1) {
      query = parseQuery(value.substring(queryIndex + 1));
      value = value.substring(0, queryIndex);
    } else {
      query = parseQuery();
    }

    const pathname = stripBaseSegment(value, baseSegment);

    const details: LocationDetails<Q> = {
      hash,
      query,
      pathname
    };

    if (state) {
      details.state = state;
    }

    return details;
  }

  function getDetails(
    partial: PartialLocation<Q>,
    state: any
  ): LocationDetails<Q> {
    const details: LocationDetails<Q> = {
      pathname: partial.pathname == null ? "/" : partial.pathname,
      hash: partial.hash == null ? "" : partial.hash,
      query: partial.query == null ? parseQuery() : partial.query
    };

    if (partial.state) {
      details.state = partial.state;
    } else if (state) {
      details.state = state;
    }

    return details;
  }

  function createLocation(
    value: ToArgument<Q>,
    key?: string,
    state?: any
  ): HickoryLocation<Q> {
    if (state === undefined) {
      state = null;
    }
    const details =
      typeof value === "string"
        ? parsePath(value, state)
        : getDetails(value, state);
    const rawPathname = raw(details.pathname);

    // it can be more convenient to interact with the decoded pathname,
    // but leave the option for using the encoded value
    if (decode) {
      try {
        details.pathname = decodeURI(details.pathname);
      } catch (e) {
        throw new URIError(
          'Pathname "' +
            details.pathname +
            '" could not be decoded. ' +
            "This is most likely due to a bad percent-encoding. For more information, " +
            "see the third paragraph here https://tools.ietf.org/html/rfc3986#section-2.4"
        );
      }
    }

    const locationParts = {
      ...details,
      key: key,
      rawPathname
    };

    const url = createPath(locationParts);
    return {
      ...locationParts,
      url
    };
  }

  function createPath(location: AnyLocation<Q>): string {
    // ensure that pathname begins with a forward slash, query begins
    // with a question mark, and hash begins with a pound sign
    return (
      baseSegment +
      completePathname(
        (location as HickoryLocation<Q>).rawPathname || location.pathname || ""
      ) +
      completeQuery(stringifyQuery(location.query)) +
      completeHash(location.hash)
    );
  }

  return { createLocation, createPath };
}
