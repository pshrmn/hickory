import "jest";
import { Hash } from "../../src";

import { withDOM } from "../../../../tests/utils/dom";

// We create our own jsdom instead of using the one that Jest will create
// so that we can reset the DOM between tests
describe("Hash constructor", () => {
  it("returns object with expected API", () => {
    withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
      const testHistory = Hash();
      const expectedProperties = [
        "location",
        "action",
        "toHref",
        "respondWith",
        "destroy"
      ];
      expectedProperties.forEach(property => {
        expect(testHistory.hasOwnProperty(property)).toBe(true);
      });
    });
  });

  it("initializes using window.location", () => {
    withDOM({ url: "http://example.com/#/one" }, () => {
      const testHistory = Hash();
      expect(testHistory.location).toMatchObject({
        pathname: "/one",
        hash: "",
        query: ""
      });
    });
  });

  it("throws if there is no DOM", () => {
    withDOM({ url: "http://example.com/#/one", setGlobal: false }, () => {
      expect(() => {
        const testHistory = Hash();
      }).toThrow();
    });
  });

  it('sets initial action to "push" when page has not been previously visited', () => {
    withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
      window.history.pushState(null, "", "/#has-no-key");
      const testHistory = Hash();
      expect(testHistory.action).toBe("push");
    });
  });

  it('sets initial action to "pop" when page has been previously visited', () => {
    withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
      window.history.pushState({ key: "17.0" }, "", "/#has-key");
      const testHistory = Hash();
      expect(testHistory.action).toBe("pop");
    });
  });

  describe("no initial hash path", () => {
    describe("no hashType", () => {
      it("sets the expected hash format", () => {
        withDOM({ url: "http://example.com/" }, ({ window }) => {
          expect(window.location.hash).toBe("");
          const testHistory = Hash();
          expect(window.location.hash).toBe("#/");
        });
      });
    });

    describe("default hashType", () => {
      it("sets the expected hash format", () => {
        withDOM({ url: "http://example.com/" }, ({ window }) => {
          expect(window.location.hash).toBe("");
          const testHistory = Hash({ hashType: "default" });
          expect(window.location.hash).toBe("#/");
        });
      });
    });

    describe("bang hashType", () => {
      it("sets the expected hash format", () => {
        withDOM({ url: "http://example.com/" }, ({ window }) => {
          expect(window.location.hash).toBe("");
          const testHistory = Hash({ hashType: "bang" });
          expect(window.location.hash).toBe("#!/");
        });
      });
    });

    describe("clean hashType", () => {
      it("sets the expected hash format", () => {
        withDOM({ url: "http://example.com/" }, ({ window }) => {
          expect(window.location.hash).toBe("");
          const testHistory = Hash({ hashType: "clean" });
          expect(window.location.hash).toBe("#/");
        });
      });
    });
  });

  describe("decodes from browser based on options.hashType", () => {
    it("works with default hashType", () => {
      withDOM({ url: "http://example.com/#/the-path" }, () => {
        // default and basic should be the same
        const noTypeHistory = Hash();
        expect(noTypeHistory.location).toMatchObject({
          pathname: "/the-path"
        });
        const defaultHistory = Hash({ hashType: "default" });
        expect(defaultHistory.location).toMatchObject({
          pathname: "/the-path"
        });
      });
    });

    it("works with bang hashType", () => {
      // bang expects an exclamation point before the leading slash
      withDOM({ url: "http://example.com/#!/the-path" }, () => {
        const bangHistory = Hash({ hashType: "bang" });
        expect(bangHistory.location).toMatchObject({
          pathname: "/the-path"
        });
      });
    });

    it("works with default hashType", () => {
      // clean expects no leading slash
      withDOM({ url: "http://example.com/#the-path" }, () => {
        const cleanHistory = Hash({ hashType: "clean" });
        expect(cleanHistory.location).toMatchObject({
          pathname: "/the-path"
        });
      });
    });
  });
});
