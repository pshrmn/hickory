export function ensureBeginsWith(
  str: string | undefined | null,
  prefix: string
): string {
  if (!str) {
    return "";
  }
  return str.indexOf(prefix) === 0 ? str : prefix + str;
}

export function stripPrefix(str: string, prefix: string): string {
  return str.indexOf(prefix) === 0 ? str.slice(prefix.length) : str;
}
