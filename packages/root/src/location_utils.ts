import {
  complete_pathname,
  complete_hash,
  complete_query,
  strip_base_segment
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
  ModifyPathname
} from "./types/location_utils";

function default_parse_query(query?: string): any {
  return query ? query : "";
}

function default_stringify_query(query?: any): string {
  return query ? query : "";
}

function is_valid_base(base_segment: string): boolean {
  return (
    typeof base_segment === "string" &&
    base_segment.charAt(0) === "/" &&
    base_segment.charAt(base_segment.length - 1) !== "/"
  );
}

function default_modify(p: string): string {
  return p;
}

export default function location_factory(
  options: LocationUtilOptions = {}
): LocationUtils {
  const {
    query: {
      parse: parse_query = default_parse_query,
      stringify: stringify_query = default_stringify_query
    } = {},
    base_segment = "",
    pathname: modify_pathname = default_modify
  } = options;

  if (base_segment !== "" && !is_valid_base(base_segment)) {
    throw new Error(
      'The base_segment "' +
        base_segment +
        '" is not valid.' +
        " The base_segment must begin with a forward slash and end with a" +
        " non-forward slash character."
    );
  }

  function parse_path(
    value: string,
    state: any,
    modify_pathname: ModifyPathname
  ): LocationComponents {
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

    const details: LocationComponents = {
      hash,
      query,
      pathname: modify_pathname(strip_base_segment(value, base_segment))
    };

    if (state) {
      details.state = state;
    }

    return details;
  }

  function get_details(
    partial: PartialLocation,
    state: any,
    modify_pathname: ModifyPathname
  ): LocationComponents {
    const details: LocationComponents = {
      pathname: modify_pathname(
        partial.pathname == null ? "/" : partial.pathname
      ),
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

  function generic_location(
    value: ToArgument,
    state?: any
  ): LocationComponents {
    if (state === undefined) {
      state = null;
    }
    return typeof value === "string"
      ? parse_path(value, state, modify_pathname)
      : get_details(value, state, modify_pathname);
  }

  function keyed(location: LocationComponents, key: Key): SessionLocation {
    return {
      ...location,
      key
    };
  }

  function stringify_location(location: AnyLocation): string {
    // ensure that pathname begins with a forward slash, query begins
    // with a question mark, and hash begins with a pound sign
    return (
      base_segment +
      complete_pathname(location.pathname || "") +
      complete_query(stringify_query(location.query)) +
      complete_hash(location.hash)
    );
  }

  return { generic_location, keyed, stringify_location };
}
