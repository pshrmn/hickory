import "jest";
import { Hash } from "../../src";

import { withDOM } from "../../../../tests/utils/dom";
import { navigateSuite } from "../../../../tests/cases/navigate";

// We create our own jsdom instead of using the one that Jest will create
// so that we can reset the DOM between tests
describe("Hash constructor", () => {
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

describe("navigate()", () => {
  navigateSuite.forEach(test => {
    it(test.msg, () => {
      withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
        const testHistory = Hash();
        test.fn({
          history: testHistory
        });
      });
    });
  });
});

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
