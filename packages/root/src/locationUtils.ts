import {
  completePathname,
  completeHash,
  completeQuery,
  stripBaseSegment
} from "@hickory/location-utils";

import {
  SessionLocation,
  PartialLocation,
  AnyLocation,
  LocationComponents,
  Key
} from "./types/location";
import { ToArgument } from "./types/navigate";
import {
  LocationUtilOptions,
  LocationUtils,
  RawPathname
} from "./types/locationUtils";

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

function defaultRaw(p: string): string {
  return p;
}

export default function locationFactory(
  options: LocationUtilOptions = {}
): LocationUtils {
  const {
    query: {
      parse: parseQuery = defaultParseQuery,
      stringify: stringifyQuery = defaultStringifyQuery
    } = {},
    baseSegment = "",
    raw = defaultRaw
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

  function parsePath(
    value: string,
    state: any,
    raw: RawPathname
  ): LocationComponents {
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

    const details: LocationComponents = {
      hash,
      query,
      pathname: raw(stripBaseSegment(value, baseSegment))
    };

    if (state) {
      details.state = state;
    }

    return details;
  }

  function getDetails(
    partial: PartialLocation,
    state: any,
    raw: RawPathname
  ): LocationComponents {
    const details: LocationComponents = {
      pathname: raw(partial.pathname == null ? "/" : partial.pathname),
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

  function genericLocation(value: ToArgument, state?: any): LocationComponents {
    if (state === undefined) {
      state = null;
    }
    return typeof value === "string"
      ? parsePath(value, state, raw)
      : getDetails(value, state, raw);
  }

  function keyed(location: LocationComponents, key: Key): SessionLocation {
    return {
      ...location,
      key
    };
  }

  function stringifyLocation(location: AnyLocation): string {
    // ensure that pathname begins with a forward slash, query begins
    // with a question mark, and hash begins with a pound sign
    return (
      baseSegment +
      completePathname(location.pathname || "") +
      completeQuery(stringifyQuery(location.query)) +
      completeHash(location.hash)
    );
  }

  return { genericLocation, keyed, stringifyLocation };
}
