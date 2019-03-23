export function ensure_begins_with(
  str: string | undefined | null,
  prefix: string
): string {
  if (!str) {
    return "";
  }
  return str.indexOf(prefix) === 0 ? str : prefix + str;
}

export function complete_pathname(pathname?: string): string {
  return ensure_begins_with(pathname, "/");
}

export function complete_hash(hash?: string): string {
  return ensure_begins_with(hash, "#");
}

export function complete_query(query?: string): string {
  return ensure_begins_with(query, "?");
}

export function strip_prefix(str: string, prefix: string): string {
  return str.indexOf(prefix) === 0 ? str.slice(prefix.length) : str;
}

function has_base_segment(path: string, prefix: string): boolean {
  return new RegExp("^" + prefix + "(\\/|\\?|#|$)", "i").test(path);
}

export function strip_base_segment(path: string, prefix: string): string {
  return has_base_segment(path, prefix) ? path.substr(prefix.length) : path;
}
