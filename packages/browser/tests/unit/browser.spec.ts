import "jest";
import { Browser } from "../../src";

import { withDOM } from "../../../../tests/utils/dom";
import { navigateSuite } from "../../../../tests/cases/navigate";

describe("Browser constructor", () => {
  it("initializes using window.location", () => {
    withDOM({ url: "http://example.com/one" }, ({ window }) => {
      const testHistory = Browser();
      expect(testHistory.location).toMatchObject({
        pathname: "/one",
        hash: "",
        query: ""
      });
    });
  });

  it("throws if there is no DOM", () => {
    withDOM({ url: "http://example.com/one", setGlobal: false }, () => {
      expect(() => {
        const testHistory = Browser();
      }).toThrow();
    });
  });

  it('sets initial action to "push" when page has not been previously visited', () => {
    withDOM({ url: "http://example.com/one" }, ({ window }) => {
      window.history.pushState(null, "", "/has-no-key");
      const testHistory = Browser();
      expect(testHistory.action).toBe("push");
    });
  });

  it('sets initial action to "pop" when page has been previously visited', () => {
    withDOM({ url: "http://example.com/one" }, ({ window }) => {
      window.history.pushState({ key: "17.0" }, "", "/has-key");
      const testHistory = Browser();
      expect(testHistory.action).toBe("pop");
    });
  });
});

describe("navigate()", () => {
  navigateSuite.forEach(test => {
    it(test.msg, () => {
      withDOM({ url: "http://example.com/one" }, ({ window }) => {
        const testHistory = Browser();
        test.fn({
          history: testHistory
        });
      });
    });
  });
});

describe("toHref", () => {
  it("returns the location formatted as a string", () => {
    withDOM({ url: "http://example.com/one" }, () => {
      const testHistory = Browser();
      const path = testHistory.toHref({
        pathname: "/one",
        query: "test=query"
      });
      expect(path).toBe("/one?test=query");
    });
  });
});
