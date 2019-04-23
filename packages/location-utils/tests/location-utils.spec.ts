import "jest";
import {
  completePathname,
  completeHash,
  completeQuery,
  stripPrefix
} from "../src";

describe("location utils", () => {
  describe("completePathname", () => {
    it("prepends forward slash if it doesn't exist", () => {
      expect(completePathname("test")).toBe("/test");
    });

    it("does nothing if pathname already begins with forward slash", () => {
      expect(completePathname("/best")).toBe("/best");
    });

    it("returns empty string if argument is falsy", () => {
      const falsy = [undefined, null, ""];
      falsy.forEach(value => {
        expect(completePathname(value)).toBe("");
      });
    });
  });

  describe("completeHash", () => {
    it("prepends pound sign if it doesn't exist", () => {
      expect(completeHash("test")).toBe("#test");
    });

    it("does nothing if hash already begins with pound sign", () => {
      expect(completeHash("#best")).toBe("#best");
    });

    it("returns empty string if argument is falsy", () => {
      const falsy = [undefined, null, ""];
      falsy.forEach(value => {
        expect(completeHash(value)).toBe("");
      });
    });
  });

  describe("completeQuery", () => {
    it("prepends forward slash if it doesn't exist", () => {
      expect(completeQuery("test=one")).toBe("?test=one");
    });

    it("does nothing if pathname already begins with forward slash", () => {
      expect(completeQuery("?best=two")).toBe("?best=two");
    });

    it("returns empty string if argument is falsy", () => {
      const falsy = [undefined, null, ""];
      falsy.forEach(value => {
        expect(completeQuery(value)).toBe("");
      });
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
