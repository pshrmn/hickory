import "jest";
import { blockingBrowser } from "../../src";

import { withDOM, asyncWithDOM } from "../../../../tests/utils/dom";
import {
  navigateSuite,
  goSuite,
  cancelSuite,
  blockingSuite
} from "../../../../tests/cases";

import { TestCase, Suite } from "../../../../tests/types";

function runAsyncTest(test: TestCase) {
  it(test.msg, async () => {
    expect.assertions(test.assertions);
    await asyncWithDOM({ url: "http://example.com/one" }, ({ resolve }) => {
      test.fn({
        constructor: blockingBrowser,
        resolve
      });
    });
  });
}

function runTest(test: TestCase) {
  it(test.msg, () => {
    withDOM({ url: "http://example.com/one" }, () => {
      test.fn({
        constructor: blockingBrowser
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

describe("blockingBrowser", () => {
  it("initializes using window.location", () => {
    withDOM({ url: "http://example.com/one" }, () => {
      let testHistory = blockingBrowser(pending => {
        pending.finish();
      });
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
        let testHistory = blockingBrowser(pending => {
          pending.finish();
        });
      }).toThrow();
    });
  });

  it('sets initial action to "push" when page has not been previously visited', () => {
    withDOM({ url: "http://example.com/one" }, ({ window }) => {
      window.history.pushState(null, "", "/has-no-key");
      let testHistory = blockingBrowser(pending => {
        expect(pending.action).toBe("push");
        pending.finish();
      });
    });
  });

  it('sets initial action to "pop" when page has been previously visited', () => {
    withDOM({ url: "http://example.com/one" }, ({ window }) => {
      window.history.pushState({ key: "17.0" }, "", "/has-key");
      let testHistory = blockingBrowser(pending => {
        expect(pending.action).toBe("pop");
        pending.finish();
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

describe("blocking", () => {
  runSuite(blockingSuite);
});

describe("go", () => {
  runSuite(goSuite);
});

describe("browser history.navigate", () => {
  it("throws if trying to navigate with a non-encoded pathname", () => {
    withDOM({ url: "http://example.com/one" }, () => {
      let testHistory = blockingBrowser(pending => {
        pending.finish();
      });
      expect(() => {
        testHistory.navigate({ url: "/test ing" });
      }).toThrow();
    });
  });
});

describe("browser history.go", () => {
  // integration?
  it("calls window.history.go with provided value", () => {
    withDOM({ url: "http://example.com/one" }, ({ window }) => {
      let realGo = window.history.go;
      let mockGo = (window.history.go = jest.fn());
      let testHistory = blockingBrowser(pending => {
        pending.finish();
      });

      [undefined, 0, 1, -1].forEach((value, index) => {
        testHistory.go(value);
        expect(mockGo.mock.calls[index][0]).toBe(value);
      });

      window.history.go = realGo;
    });
  });
});

describe("url", () => {
  it("returns the location formatted as a string", () => {
    withDOM({ url: "http://example.com/one" }, () => {
      let testHistory = blockingBrowser(pending => {
        pending.finish();
      });
      let path = testHistory.url({
        pathname: "/one",
        query: "test=query"
      });
      expect(path).toBe("/one?test=query");
    });
  });
});
