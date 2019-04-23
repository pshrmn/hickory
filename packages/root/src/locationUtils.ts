import {
  completePathname,
  completeHash,
  completeQuery
} from "@hickory/location-utils";

import {
  SessionLocation,
  Hrefable,
  LocationComponents,
  Key,
  URLWithState
} from "./types/location";
import { LocationUtilOptions, LocationUtils } from "./types/locationUtils";

function defaultParseQuery(query?: string): any {
  return query ? query : "";
}

function defaultStringifyQuery(query?: any): string {
  return query ? query : "";
}

export default function locationUtils(
  options: LocationUtilOptions = {}
): LocationUtils {
  const {
    query: {
      parse: parseQuery = defaultParseQuery,
      stringify: stringifyQuery = defaultStringifyQuery
    } = {},
    base
  } = options;

  return {
    location(
      value: URLWithState,
      current?: LocationComponents
    ): LocationComponents {
      let { url, state } = value;
      // special cases for empty/hash URLs
      if (url === "" || url.charAt(0) === "#") {
        if (!current) {
          current = { pathname: "/", hash: "", query: parseQuery() };
        }
        const details: LocationComponents = {
          pathname: current.pathname,
          hash: url.charAt(0) === "#" ? url.substring(1) : current.hash,
          query: current.query
        };
        if (state) {
          details.state = state;
        }
        return details;
      }

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
      let rawQuery;
      if (queryIndex !== -1) {
        rawQuery = url.substring(queryIndex + 1);
        url = url.substring(0, queryIndex);
      }
      const query = parseQuery(rawQuery);

      let pathname = base ? base.remove(url) : url;
      if (pathname === "") {
        pathname = "/";
      }

      const details: LocationComponents = {
        hash,
        query,
        pathname
      };

      if (state) {
        details.state = state;
      }

      return details;
    },
    keyed(location: LocationComponents, key: Key): SessionLocation {
      (location as SessionLocation).key = key;
      return location as SessionLocation;
    },
    stringify(location: Hrefable): string {
      if (typeof location === "string") {
        const firstChar = location.charAt(0);
        // keep hash/query only strings relative
        if (firstChar === "#" || firstChar === "?") {
          return location;
        }
        const pathname = completePathname(location);
        return base ? base.add(pathname) : pathname;
      }
      // Ensure that pathname begins with a forward slash, query begins
      // with a question mark, and hash begins with a pound sign.
      // If there is no pathname, it is relative and shouldn't
      // start with the receive the base segment.
      const pathname =
        location.pathname !== undefined
          ? base
            ? base.add(completePathname(location.pathname))
            : completePathname(location.pathname)
          : "";
      return (
        pathname +
        completeQuery(stringifyQuery(location.query)) +
        completeHash(location.hash)
      );
    }
  };
}
