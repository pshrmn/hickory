import { strip_prefix, ensure_begins_with } from "@hickory/location-utils";

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
export default function hash_encoder_and_decoder(
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
          let no_slash = strip_prefix(path, "/");
          if (
            no_slash === "" ||
            no_slash.charAt(0) === "?" ||
            no_slash.charAt(0) === "#"
          ) {
            no_slash = "/" + no_slash;
          }
          return "#" + no_slash;
        },
        decode: (path: string): string => {
          const no_hash = strip_prefix(path, "#");
          return ensure_begins_with(no_hash, "/");
        }
      };
    case BANG:
      return {
        encode: (path: string): string => {
          const withSlash = ensure_begins_with(path, "/");
          return "#" + ensure_begins_with(withSlash, "!");
        },
        decode: (path: string): string => {
          const no_hash = strip_prefix(path, "#");
          const noBang = strip_prefix(no_hash, "!");
          return ensure_begins_with(noBang, "/");
        }
      };
    case DEFAULT:
    default:
      return {
        encode: (path: string): string => {
          return "#" + ensure_begins_with(path, "/");
        },
        decode: (path: string): string => {
          const no_hash = strip_prefix(path, "#");
          return ensure_begins_with(no_hash, "/");
        }
      };
  }
}
