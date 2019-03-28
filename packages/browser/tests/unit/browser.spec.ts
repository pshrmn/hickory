import "jest";
import { browser } from "../../src/browser";

import { with_dom, async_with_dom } from "../../../../tests/utils/dom";
import {
  navigate_suite,
  go_suite,
  cancel_suite
} from "../../../../tests/cases";

import { TestCase, Suite } from "../../../../tests/types";

function run_async_test(test: TestCase) {
  it(test.msg, async () => {
    expect.assertions(test.assertions);
    await async_with_dom(
      { url: "http://example.com/one" },
      ({ window, resolve }) => {
        test.fn({
          constructor: browser,
          resolve
        });
      }
    );
  });
}

function run_test(test: TestCase) {
  it(test.msg, () => {
    with_dom({ url: "http://example.com/one" }, ({ window }) => {
      test.fn({
        constructor: browser
      });
    });
  });
}

function run_suite(suite: Suite) {
  suite.forEach(test => {
    if (test.async) {
      run_async_test(test);
    } else {
      run_test(test);
    }
  });
}

describe("browser", () => {
  it("initializes using window.location", () => {
    with_dom({ url: "http://example.com/one" }, ({ window }) => {
      const test_history = browser(pending => {
        pending.finish();
      });
      expect(test_history.location).toMatchObject({
        pathname: "/one",
        hash: "",
        query: ""
      });
    });
  });

  it("throws if there is no DOM", () => {
    with_dom({ url: "http://example.com/one", set_global: false }, () => {
      expect(() => {
        const test_history = browser(pending => {
          pending.finish();
        });
      }).toThrow();
    });
  });

  it('sets initial action to "push" when page has not been previously visited', () => {
    with_dom({ url: "http://example.com/one" }, ({ window }) => {
      window.history.pushState(null, "", "/has-no-key");
      const test_history = browser(pending => {
        expect(pending.action).toBe("push");
        pending.finish();
      });
    });
  });

  it('sets initial action to "pop" when page has been previously visited', () => {
    with_dom({ url: "http://example.com/one" }, ({ window }) => {
      window.history.pushState({ key: "17.0" }, "", "/has-key");
      const test_history = browser(pending => {
        expect(pending.action).toBe("pop");
        pending.finish();
      });
    });
  });
});

describe("cancel", () => {
  run_suite(cancel_suite);
});

describe("navigate()", () => {
  run_suite(navigate_suite);
});

describe("go", () => {
  run_suite(go_suite);
});

describe("browser history.go", () => {
  // integration?
  it("calls window.history.go with provided value", () => {
    with_dom({ url: "http://example.com/one" }, ({ window }) => {
      const real_go = window.history.go;
      const mock_go = (window.history.go = jest.fn());
      const test_history = browser(pending => {
        pending.finish();
      });

      [undefined, 0, 1, -1].forEach((value, index) => {
        test_history.go(value);
        expect(mock_go.mock.calls[index][0]).toBe(value);
      });
    });
  });
});

describe("to_href", () => {
  it("returns the location formatted as a string", () => {
    with_dom({ url: "http://example.com/one" }, () => {
      const test_history = browser(pending => {
        pending.finish();
      });
      const path = test_history.to_href({
        pathname: "/one",
        query: "test=query"
      });
      expect(path).toBe("/one?test=query");
    });
  });
});
