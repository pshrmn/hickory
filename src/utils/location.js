export function randomKey() {
  return Math.random().toString(36).slice(2, 8);
}

function beginsWith(str, char) {
  if (!str) {
    return '';
  }
  return str.charAt(0) === char ? str : char + str;
}

export function completePathname(pathname) {
  return beginsWith(pathname, '/');
}

export function completeHash(hash) {
  return beginsWith(hash, '#');
}

export function completeQuery(query) {
  return beginsWith(query, '?');
}
