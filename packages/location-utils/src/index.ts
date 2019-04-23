export function ensureBeginsWith(
  str: string | undefined | null,
  prefix: string
): string {
  if (!str) {
    return "";
  }
  return str.indexOf(prefix) === 0 ? str : prefix + str;
}

export function completePathname(pathname?: string): string {
  return ensureBeginsWith(pathname, "/");
}

export function completeHash(hash?: string): string {
  return ensureBeginsWith(hash, "#");
}

export function completeQuery(query?: string): string {
  return ensureBeginsWith(query, "?");
}

export function stripPrefix(str: string, prefix: string): string {
  return str.indexOf(prefix) === 0 ? str.slice(prefix.length) : str;
}
