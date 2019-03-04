import "jest";
import { Browser } from "../../src";

import { withDOM, asyncWithDOM } from "../../../../tests/utils/dom";
import { navigateSuite, goSuite, cancelSuite } from "../../../../tests/cases";

import { TestCase, Suite } from "../../../../tests/types";

function runAsyncTest(test: TestCase) {
  it(test.msg, async () => {
    expect.assertions(test.assertions);
    await asyncWithDOM(
      { url: "http://example.com/one" },
      ({ window, resolve }) => {
        test.fn({
          pendingHistory: Browser(),
          resolve
        });
      }
    );
  });
}

function runTest(test: TestCase) {
  it(test.msg, () => {
    withDOM({ url: "http://example.com/one" }, ({ window }) => {
      test.fn({
        pendingHistory: Browser()
      });
    });
  });
}

function runSuite(suite: Suite) {
  suite.forEach(test => {
    if (test.async) {
      runAsyncTest(test);
    } else {
      runTest(test);
    }
  });
}

describe("Browser", () => {
  it("initializes using window.location", () => {
    withDOM({ url: "http://example.com/one" }, ({ window }) => {
      const pendingHistory = Browser();
      const testHistory = pendingHistory(() => {});
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
      const pendingHistory = Browser();
      pendingHistory(pending => {
        expect(pending.action).toBe("push");
      });
    });
  });

  it('sets initial action to "pop" when page has been previously visited', () => {
    withDOM({ url: "http://example.com/one" }, ({ window }) => {
      window.history.pushState({ key: "17.0" }, "", "/has-key");
      const pendingHistory = Browser();
      pendingHistory(pending => {
        expect(pending.action).toBe("pop");
      });
    });
  });
});

describe("cancel", () => {
  runSuite(cancelSuite);
});

describe("navigate()", () => {
  runSuite(navigateSuite);
});

describe("go", () => {
  runSuite(goSuite);
});

describe("Browser history.go", () => {
  // integration?
  it("calls window.history.go with provided value", () => {
    withDOM({ url: "http://example.com/one" }, ({ window }) => {
      const realGo = window.history.go;
      const mockGo = (window.history.go = jest.fn());
      const pendingHistory = Browser();
      const testHistory = pendingHistory(pending => {
        pending.finish();
      });

      [undefined, 0, 1, -1].forEach((value, index) => {
        testHistory.go(value);
        expect(mockGo.mock.calls[index][0]).toBe(value);
      });
    });
  });
});

describe("toHref", () => {
  it("returns the location formatted as a string", () => {
    withDOM({ url: "http://example.com/one" }, () => {
      const pendingHistory = Browser();
      const testHistory = pendingHistory(pending => {
        pending.finish();
      });
      const path = testHistory.toHref({
        pathname: "/one",
        query: "test=query"
      });
      expect(path).toBe("/one?test=query");
    });
  });
});
