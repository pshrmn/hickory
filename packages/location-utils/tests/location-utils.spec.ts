import "jest";
import {
  complete_pathname,
  complete_hash,
  complete_query,
  strip_prefix,
  strip_base_segment
} from "../src";

describe("location utils", () => {
  describe("complete_pathname", () => {
    it("prepends forward slash if it doesn't exist", () => {
      expect(complete_pathname("test")).toBe("/test");
    });

    it("does nothing if pathname already begins with forward slash", () => {
      expect(complete_pathname("/best")).toBe("/best");
    });

    it("returns empty string if argument is falsy", () => {
      const falsy = [undefined, null, ""];
      falsy.forEach(value => {
        expect(complete_pathname(value)).toBe("");
      });
    });
  });

  describe("complete_hash", () => {
    it("prepends pound sign if it doesn't exist", () => {
      expect(complete_hash("test")).toBe("#test");
    });

    it("does nothing if hash already begins with pound sign", () => {
      expect(complete_hash("#best")).toBe("#best");
    });

    it("returns empty string if argument is falsy", () => {
      const falsy = [undefined, null, ""];
      falsy.forEach(value => {
        expect(complete_hash(value)).toBe("");
      });
    });
  });

  describe("complete_query", () => {
    it("prepends forward slash if it doesn't exist", () => {
      expect(complete_query("test=one")).toBe("?test=one");
    });

    it("does nothing if pathname already begins with forward slash", () => {
      expect(complete_query("?best=two")).toBe("?best=two");
    });

    it("returns empty string if argument is falsy", () => {
      const falsy = [undefined, null, ""];
      falsy.forEach(value => {
        expect(complete_query(value)).toBe("");
      });
    });
  });

  describe("strip_prefix", () => {
    it("removes the prefix from provided string", () => {
      expect(strip_prefix("/test/string", "/test")).toBe("/string");
    });

    it("does nothing when the string does not begin with the prefix", () => {
      expect(strip_prefix("/string", "/test")).toBe("/string");
    });
  });

  describe("strip_base_segment", () => {
    it("strips the base_segment off of the beginning of the path", () => {
      const with_base = "/prefix/this-is-a-test";
      expect(strip_base_segment(with_base, "/prefix")).toBe("/this-is-a-test");
    });

    it("is not case-sensitive", () => {
      const with_base = "/prefix/this-is-a-test";
      expect(strip_base_segment(with_base, "/PREFIX")).toBe("/this-is-a-test");
    });

    it("works when the first character after the base_segment is a ?,#, or end of string", () => {
      expect(strip_base_segment("/prefix?query=true", "/prefix")).toBe(
        "?query=true"
      );
      expect(strip_base_segment("/prefix#yo", "/prefix")).toBe("#yo");
      expect(strip_base_segment("/prefix", "/prefix")).toBe("");
    });

    it("does nothing if the path does not contain the base segment", () => {
      const no_base = "/this-is-a-test";
      expect(strip_base_segment(no_base, "/prefix")).toBe(no_base);
    });

    it("does not strip for incomplete prefix matches", () => {
      const incomplete_path = "/prefixthis-is-the-path";
      expect(strip_base_segment(incomplete_path, "/prefix")).toBe(
        incomplete_path
      );
    });
  });
});
