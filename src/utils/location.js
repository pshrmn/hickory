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

function hasBaseSegment(path, prefix) {
  return (new RegExp('^' + prefix + '(\\/|\\?|#|$)', 'i')).test(path);
}

export function stripBaseSegment(path, prefix) {
  return hasBaseSegment(path, prefix) ? path.substr(prefix.length) : path;
}
