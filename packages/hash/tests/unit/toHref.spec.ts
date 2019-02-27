import "jest";
import { Hash } from "../../src";

import { withDOM } from "../../../../tests/utils/dom";

// We create our own jsdom instead of using the one that Jest will create
// so that we can reset the DOM between tests
describe("toHref", () => {
  it("returns the location formatted as a string", () => {
    withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
      const testHistory = Hash();
      const currentPath = testHistory.toHref({
        pathname: "/one",
        query: "test=query"
      });
      expect(currentPath).toBe("#/one?test=query");
    });
  });

  const location = { pathname: "/simple-path" };

  describe("hashType", () => {
    describe("[none provided]", () => {
      it("outputs expected string", () => {
        withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
          const noTypeHistory = Hash();
          expect(noTypeHistory.toHref(location)).toBe("#/simple-path");
        });
      });
    });

    describe("default", () => {
      it("outputs expected string", () => {
        withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
          const defaultHistory = Hash({ hashType: "default" });
          expect(defaultHistory.toHref(location)).toBe("#/simple-path");
        });
      });
    });

    describe("bang", () => {
      it("outputs expected string", () => {
        withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
          const bangHistory = Hash({ hashType: "bang" });
          expect(bangHistory.toHref(location)).toBe("#!/simple-path");
        });
      });
    });

    describe("clean", () => {
      it("outputs expected string", () => {
        withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
          const cleanHistory = Hash({ hashType: "clean" });
          expect(cleanHistory.toHref(location)).toBe("#simple-path");
        });
      });
    });
  });
});
