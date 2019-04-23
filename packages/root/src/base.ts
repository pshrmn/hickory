import { BaseFunctions, BaseOptions } from "./types/base";

function hasBase(path: string, prefix: string): boolean {
  return new RegExp("^" + prefix + "(\\/|\\?|#|$)", "i").test(path);
}

export default function createBase(
  base: string,
  options?: BaseOptions
): BaseFunctions {
  if (
    typeof base !== "string" ||
    base.charAt(0) !== "/" ||
    base.charAt(base.length - 1) === "/"
  ) {
    throw new Error(
      'The base segment "' +
        base +
        '" is not valid.' +
        ' The "base" option must begin with a forward slash and end with a' +
        " non-forward slash character."
    );
  }

  const { emptyRoot = false, strict = false } = options || {};
  return {
    add(path: string) {
      if (emptyRoot) {
        if (path === "/") {
          return base;
        } else if (path.startsWith("/?") || path.startsWith("/#")) {
          return `${base}${path.substr(1)}`;
        }
      } else if (path.charAt(0) === "?" || path.charAt(0) === "#") {
        return path;
      }
      return `${base}${path}`;
    },
    remove(pathname: string) {
      if (pathname === "") {
        return "";
      }
      const exists = hasBase(pathname, base);
      if (!exists) {
        if (strict) {
          throw new Error(
            `Expected a string that begins with "${base}", but received "${pathname}".`
          );
        } else {
          return pathname;
        }
      }
      if (pathname === base) {
        if (strict && !emptyRoot) {
          throw new Error(
            `Received string "${base}", which is the same as the base, but "emptyRoot" is not true.`
          );
        }
        return "/";
      }
      return pathname.substr(base.length);
    }
  };
}
