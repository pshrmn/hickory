import {
  stripPrefix,
  completeHash,
  ensureBeginsWith
} from '@hickory/location-utils'

const DEFAULT = 'default';
const CLEAN = 'clean';
const BANG = 'bang';

// no matter with type of hash configuration we are using,
// our decode function should return a string that begins
// with a forward slash
export default function hashEncoderAndDecoder(type = DEFAULT) {
  switch (type) {
  case CLEAN:
    return {  
      encode: (path) => {
        // When we are at the root (/), we need to include the leading
        // slash because the hash needs at least one character after the
        // pound sign. We do the same even if there is a query or hash 
        // for consistency.
        let noSlash = stripPrefix(path, '/');
        if (noSlash === '' || noSlash.charAt(0) === '?' || noSlash.charAt(0) === '#') {
          noSlash = '/' + noSlash
        }
        return '#' + noSlash;
      },
      decode: (path) => {
        const noHash = stripPrefix(path, '#');
        return ensureBeginsWith(noHash, '/');
      }
    };
  case BANG:
    return {
      encode: (path) => {
        const withSlash = ensureBeginsWith(path, '/');
        return '#' + ensureBeginsWith(withSlash, '!');
      },
      decode: (path) => {
        const noHash = stripPrefix(path, '#');
        const noBang = stripPrefix(noHash, '!');
        return ensureBeginsWith(noBang, '/');
      }
    };
  case DEFAULT:
  default:
    return {
      encode: (path) => {
        return '#' + ensureBeginsWith(path, '/');
      },
      decode: (path) => {
        const noHash = stripPrefix(path, '#');
        return ensureBeginsWith(noHash, '/');
      }
    };
  }
}
