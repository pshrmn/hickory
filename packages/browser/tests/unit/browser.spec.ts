import "jest";
import { Browser } from "../../src";

import { withDOM } from "../../../../tests/utils/dom";

// We create our own jsdom instead of using the one that Jest will create
// so that we can reset the DOM between tests
describe("Browser constructor", () => {
  it("returns object with expected API", () => {
    withDOM({ url: "http://example.com/one" }, () => {
      const testHistory = Browser();
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
