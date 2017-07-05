export function ensureBeginsWith(str, prefix) {
  if (!str) {
    return '';
  }
  return str.indexOf(prefix) === 0 ? str : prefix + str;
}

export function completePathname(pathname) {
  return ensureBeginsWith(pathname, '/');
}

export function completeHash(hash) {
  return ensureBeginsWith(hash, '#');
}

export function completeQuery(query) {
  return ensureBeginsWith(query, '?');
}

export function stripPrefix(str, prefix) {
  return str.indexOf(prefix) === 0
    ? str.slice(prefix.length)
    : str;
}

function hasBaseSegment(path, prefix) {
  return (new RegExp('^' + prefix + '(\\/|\\?|#|$)', 'i')).test(path);
}

export function stripBaseSegment(path, prefix) {
  return hasBaseSegment(path, prefix) ? path.substr(prefix.length) : path;
}
