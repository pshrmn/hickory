import "jest";
import { Browser } from "../../src";

import { withDOM } from "../../../../tests/utils/dom";

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
