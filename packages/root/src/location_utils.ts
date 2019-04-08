import {
  complete_pathname,
  complete_hash,
  complete_query,
  strip_base_segment
} from "@hickory/location-utils";

import {
  SessionLocation,
  PartialLocation,
  Hrefable,
  LocationComponents,
  Key
} from "./types/location";
import { ToArgument } from "./types/navigate";
import { LocationUtilOptions, LocationUtils } from "./types/location_utils";

function default_parse_query(query?: string): any {
  return query ? query : "";
}

function default_stringify_query(query?: any): string {
  return query ? query : "";
}

function is_valid_base(base: string): boolean {
  return (
    typeof base === "string" &&
    base.charAt(0) === "/" &&
    base.charAt(base.length - 1) !== "/"
  );
}

export default function location_factory(
  options: LocationUtilOptions = {}
): LocationUtils {
  const {
    query: {
      parse: parse_query = default_parse_query,
      stringify: stringify_query = default_stringify_query
    } = {},
    base = ""
  } = options;

  if (base !== "" && !is_valid_base(base)) {
    throw new Error(
      'The base segment "' +
        base +
        '" is not valid.' +
        ' The "base" option must begin with a forward slash and end with a' +
        " non-forward slash character."
    );
  }

  function from_string(value: string, state: any): LocationComponents {
    // hash is always after query, so split it off first
    const hash_index = value.indexOf("#");
    let hash;
    if (hash_index !== -1) {
      hash = value.substring(hash_index + 1);
      value = value.substring(0, hash_index);
    } else {
      hash = "";
    }

    const query_index = value.indexOf("?");
    let query;
    if (query_index !== -1) {
      query = parse_query(value.substring(query_index + 1));
      value = value.substring(0, query_index);
    } else {
      query = parse_query();
    }

    const pathname = strip_base_segment(value, base);

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

  function from_object(
    partial: PartialLocation,
    state: any
  ): LocationComponents {
    const details: LocationComponents = {
      pathname: partial.pathname == null ? "/" : partial.pathname,
      hash: partial.hash == null ? "" : partial.hash,
      query: partial.query == null ? parse_query() : partial.query
    };

    if (partial.state) {
      details.state = partial.state;
    } else if (state) {
      details.state = state;
    }

    return details;
  }

  return {
    location(value: ToArgument, state?: any): LocationComponents {
      if (state === undefined) {
        state = null;
      }
      const location =
        typeof value === "string"
          ? from_string(value, state)
          : from_object(value, state);
      return location;
    },
    keyed(location: LocationComponents, key: Key): SessionLocation {
      return {
        ...location,
        key
      };
    },
    stringify(location: Hrefable): string {
      if (typeof location === "string") {
        const first_char = location.charAt(0);
        // keep hash/query only strings relative
        if (first_char === "#" || first_char === "?") {
          return location;
        }
        return base + complete_pathname(location);
      }
      // Ensure that pathname begins with a forward slash, query begins
      // with a question mark, and hash begins with a pound sign.
      // If there is no pathname, it is relative and shouldn't
      // start with the receive the base segment.
      return (
        (location.pathname !== undefined
          ? base + complete_pathname(location.pathname)
          : "") +
        complete_query(stringify_query(location.query)) +
        complete_hash(location.hash)
      );
    }
  };
}
