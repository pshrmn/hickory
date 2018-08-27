import { stripPrefix, ensureBeginsWith } from "@hickory/location-utils";

const DEFAULT = "default";
const CLEAN = "clean";
const BANG = "bang";

export interface EncodingFns {
  encode: (path: string) => string;
  decode: (path: string) => string;
}

// no matter with type of hash configuration we are using,
// our decode function should return a string that begins
// with a forward slash
export default function hashEncoderAndDecoder(
  type: string = DEFAULT
): EncodingFns {
  switch (type) {
    case CLEAN:
      return {
        encode: (path: string): string => {
          // When we are at the root (/), we need to include the leading
          // slash because the hash needs at least one character after the
          // pound sign. We do the same even if there is a query or hash
          // for consistency.
          let noSlash = stripPrefix(path, "/");
          if (
            noSlash === "" ||
            noSlash.charAt(0) === "?" ||
            noSlash.charAt(0) === "#"
          ) {
            noSlash = "/" + noSlash;
          }
          return "#" + noSlash;
        },
        decode: (path: string): string => {
          const noHash = stripPrefix(path, "#");
          return ensureBeginsWith(noHash, "/");
        }
      };
    case BANG:
      return {
        encode: (path: string): string => {
          const withSlash = ensureBeginsWith(path, "/");
          return "#" + ensureBeginsWith(withSlash, "!");
        },
        decode: (path: string): string => {
          const noHash = stripPrefix(path, "#");
          const noBang = stripPrefix(noHash, "!");
          return ensureBeginsWith(noBang, "/");
        }
      };
    case DEFAULT:
    default:
      return {
        encode: (path: string): string => {
          return "#" + ensureBeginsWith(path, "/");
        },
        decode: (path: string): string => {
          const noHash = stripPrefix(path, "#");
          return ensureBeginsWith(noHash, "/");
        }
      };
  }
}
