import "jest";
import { ensureBeginsWith, stripPrefix } from "../src";

describe("location utils", () => {
  describe("ensureBeginsWith", () => {
    it("returns empty string if first argument is undefined", () => {
      expect(ensureBeginsWith(undefined, "?")).toBe("");
    });

    it("prepends second argument if first argument does not begin with it", () => {
      const input = "test=ing";
      expect(ensureBeginsWith(input, "?")).toBe(`?${input}`);
    });

    it("returns first argument if it begins with the second argument", () => {
      const input = "?test=ing";
      expect(ensureBeginsWith(input, "?")).toBe(input);
    });
  });

  describe("stripPrefix", () => {
    it("removes the prefix from provided string", () => {
      expect(stripPrefix("/test/string", "/test")).toBe("/string");
    });

    it("does nothing when the string does not begin with the prefix", () => {
      expect(stripPrefix("/string", "/test")).toBe("/string");
    });
  });
});
