import {
  completePathname,
  completeHash,
  completeQuery,
  stripBase
} from "@hickory/location-utils";

import {
  SessionLocation,
  PartialLocation,
  Hrefable,
  LocationComponents,
  Key,
  URLWithState
} from "./types/location";
import { ToArgument } from "./types/navigate";
import { LocationUtilOptions, LocationUtils } from "./types/locationUtils";

function defaultParseQuery(query?: string): any {
  return query ? query : "";
}

function defaultStringifyQuery(query?: any): string {
  return query ? query : "";
}

function isValidBase(base: string): boolean {
  return (
    typeof base === "string" &&
    base.charAt(0) === "/" &&
    base.charAt(base.length - 1) !== "/"
  );
}

function isURLWithState(
  obj: URLWithState | PartialLocation
): obj is URLWithState {
  return obj.hasOwnProperty("url");
}

export default function locationUtils(
  options: LocationUtilOptions = {}
): LocationUtils {
  const {
    query: {
      parse: parseQuery = defaultParseQuery,
      stringify: stringifyQuery = defaultStringifyQuery
    } = {},
    base = ""
  } = options;

  if (base !== "" && !isValidBase(base)) {
    throw new Error(
      'The base segment "' +
        base +
        '" is not valid.' +
        ' The "base" option must begin with a forward slash and end with a' +
        " non-forward slash character."
    );
  }

  function fromUrl(value: URLWithState): LocationComponents {
    let { url, state } = value;
    // hash is always after query, so split it off first
    const hashIndex = url.indexOf("#");
    let hash;
    if (hashIndex !== -1) {
      hash = url.substring(hashIndex + 1);
      url = url.substring(0, hashIndex);
    } else {
      hash = "";
    }

    const queryIndex = url.indexOf("?");
    let query;
    if (queryIndex !== -1) {
      query = parseQuery(url.substring(queryIndex + 1));
      url = url.substring(0, queryIndex);
    } else {
      query = parseQuery();
    }

    const pathname = stripBase(url, base);

    const details: LocationComponents = {
      hash,
      query,
      pathname
    };

    if (state) {
      details.state = state;
    }

    return details;
  }

  function fromPartial(partial: PartialLocation): LocationComponents {
    const details: LocationComponents = {
      pathname: partial.pathname == null ? "/" : partial.pathname,
      hash: partial.hash == null ? "" : partial.hash,
      query: partial.query == null ? parseQuery() : partial.query
    };

    if (partial.state) {
      details.state = partial.state;
    }

    return details;
  }

  return {
    location(value: ToArgument): LocationComponents {
      return isURLWithState(value) ? fromUrl(value) : fromPartial(value);
    },
    keyed(location: LocationComponents, key: Key): SessionLocation {
      return {
        ...location,
        key
      };
    },
    stringify(location: Hrefable): string {
      if (typeof location === "string") {
        const firstChar = location.charAt(0);
        // keep hash/query only strings relative
        if (firstChar === "#" || firstChar === "?") {
          return location;
        }
        return base + completePathname(location);
      }
      // Ensure that pathname begins with a forward slash, query begins
      // with a question mark, and hash begins with a pound sign.
      // If there is no pathname, it is relative and shouldn't
      // start with the receive the base segment.
      return (
        (location.pathname !== undefined
          ? base + completePathname(location.pathname)
          : "") +
        completeQuery(stringifyQuery(location.query)) +
        completeHash(location.hash)
      );
    }
  };
}
