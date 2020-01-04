import { ensureBeginsWith } from "@hickory/location-utils";

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
  let {
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
        let details: LocationComponents = {
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
      let hashIndex = url.indexOf("#");
      let hash;
      if (hashIndex !== -1) {
        hash = url.substring(hashIndex + 1);
        url = url.substring(0, hashIndex);
      } else {
        hash = "";
      }

      let queryIndex = url.indexOf("?");
      let rawQuery;
      if (queryIndex !== -1) {
        rawQuery = url.substring(queryIndex + 1);
        url = url.substring(0, queryIndex);
      }
      let query = parseQuery(rawQuery);

      let pathname = base ? base.remove(url) : url;
      if (pathname === "") {
        pathname = "/";
      }

      let details: LocationComponents = {
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
        let firstChar = location.charAt(0);
        if (firstChar === "#" || firstChar === "?") {
          return location;
        }
        return base ? base.add(location) : location;
      }

      let pathname =
        location.pathname !== undefined
          ? base
            ? base.add(location.pathname)
            : location.pathname
          : "";
      return (
        pathname +
        ensureBeginsWith(stringifyQuery(location.query), "?") +
        ensureBeginsWith(location.hash, "#")
      );
    }
  };
}
