import "jest";
import { hash } from "../../src";

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
      { url: "http://example.com/#/one" },
      ({ window, resolve }) => {
        test.fn({
          constructor: hash,
          resolve
        });
      }
    );
  });
}

function run_test(test: TestCase) {
  it(test.msg, () => {
    with_dom({ url: "http://example.com/#/one" }, ({ window }) => {
      test.fn({
        constructor: hash
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

describe("hash constructor", () => {
  it("initializes using window.location", () => {
    with_dom({ url: "http://example.com/#/one" }, () => {
      const test_history = hash(pending => {
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
    with_dom({ url: "http://example.com/#/one", set_global: false }, () => {
      expect(() => {
        const test_history = hash(pending => {
          pending.finish();
        });
      }).toThrow();
    });
  });

  it('sets initial action to "push" when page has not been previously visited', () => {
    with_dom({ url: "http://example.com/#/one" }, ({ window }) => {
      window.history.pushState(null, "", "/#has-no-key");
      const test_history = hash(pending => {
        expect(pending.action).toBe("push");
        pending.finish();
      });
    });
  });

  it('sets initial action to "pop" when page has been previously visited', () => {
    with_dom({ url: "http://example.com/#/one" }, ({ window }) => {
      window.history.pushState({ key: "17.0" }, "", "/#has-key");
      const test_history = hash(pending => {
        expect(pending.action).toBe("pop");
        pending.finish();
      });
    });
  });

  describe("no initial hash path", () => {
    describe("no hash_type", () => {
      it("sets the expected hash format", () => {
        with_dom({ url: "http://example.com/" }, ({ window }) => {
          expect(window.location.hash).toBe("");
          const test_history = hash(pending => {
            pending.finish();
          });
          expect(window.location.hash).toBe("#/");
        });
      });
    });

    describe("default hash_type", () => {
      it("sets the expected hash format", () => {
        with_dom({ url: "http://example.com/" }, ({ window }) => {
          expect(window.location.hash).toBe("");
          const test_history = hash(
            pending => {
              pending.finish();
            },
            { hash_type: "default" }
          );
          expect(window.location.hash).toBe("#/");
        });
      });
    });

    describe("bang hash_type", () => {
      it("sets the expected hash format", () => {
        with_dom({ url: "http://example.com/" }, ({ window }) => {
          expect(window.location.hash).toBe("");
          const test_history = hash(
            pending => {
              pending.finish();
            },
            { hash_type: "bang" }
          );
          expect(window.location.hash).toBe("#!/");
        });
      });
    });

    describe("clean hash_type", () => {
      it("sets the expected hash format", () => {
        with_dom({ url: "http://example.com/" }, ({ window }) => {
          expect(window.location.hash).toBe("");
          const test_history = hash(
            pending => {
              pending.finish();
            },
            { hash_type: "clean" }
          );
          expect(window.location.hash).toBe("#/");
        });
      });
    });
  });

  describe("decodes from browser based on options.hash_type", () => {
    it("works with no hash_type (default)", () => {
      with_dom({ url: "http://example.com/#/the-path" }, () => {
        const test_history = hash(pending => {
          pending.finish();
        });
        expect(test_history.location).toMatchObject({
          pathname: "/the-path"
        });
      });
    });

    it("works with default hash_type", () => {
      with_dom({ url: "http://example.com/#/the-path" }, () => {
        const test_history = hash(
          pending => {
            pending.finish();
          },
          { hash_type: "default" }
        );
        expect(test_history.location).toMatchObject({
          pathname: "/the-path"
        });
      });
    });

    it("works with bang hash_type", () => {
      // bang expects an exclamation point before the leading slash
      with_dom({ url: "http://example.com/#!/the-path" }, () => {
        const test_history = hash(
          pending => {
            pending.finish();
          },
          { hash_type: "bang" }
        );
        expect(test_history.location).toMatchObject({
          pathname: "/the-path"
        });
      });
    });

    it("works with default hash_type", () => {
      // clean expects no leading slash
      with_dom({ url: "http://example.com/#the-path" }, () => {
        const test_history = hash(
          pending => {
            pending.finish();
          },
          { hash_type: "clean" }
        );
        expect(test_history.location).toMatchObject({
          pathname: "/the-path"
        });
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

describe("go suite", () => {
  run_suite(go_suite);
});

describe("hash history.navigate", () => {
  it("throws if trying to navigate with a non-encoded pathname", () => {
    with_dom({ url: "http://example.com/one" }, ({ window }) => {
      const test_history = hash(pending => {
        pending.finish();
      });
      expect(() => {
        test_history.navigate("/test ing");
      }).toThrow();
    });
  });
});

describe("go", () => {
  // integration?
  it("calls window.history.go with provided value", () => {
    with_dom({ url: "http://example.com/#/one" }, ({ window }) => {
      const mock_go = (window.history.go = jest.fn());
      const test_history = hash(pending => {
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
    with_dom({ url: "http://example.com/#/one" }, ({ window }) => {
      const test_history = hash(pending => {
        pending.finish();
      });
      const current_path = test_history.to_href({
        pathname: "/one",
        query: "test=query"
      });
      expect(current_path).toBe("#/one?test=query");
    });
  });

  const location = { pathname: "/simple-path" };

  describe("hash_type", () => {
    describe("[none provided]", () => {
      it("outputs expected string", () => {
        with_dom({ url: "http://example.com/#/one" }, ({ window }) => {
          const test_history = hash(pending => {
            pending.finish();
          });
          expect(test_history.to_href(location)).toBe("#/simple-path");
        });
      });
    });

    describe("default", () => {
      it("outputs expected string", () => {
        with_dom({ url: "http://example.com/#/one" }, ({ window }) => {
          const test_history = hash(
            pending => {
              pending.finish();
            },
            { hash_type: "default" }
          );
          expect(test_history.to_href(location)).toBe("#/simple-path");
        });
      });
    });

    describe("bang", () => {
      it("outputs expected string", () => {
        with_dom({ url: "http://example.com/#/one" }, ({ window }) => {
          const test_history = hash(
            pending => {
              pending.finish();
            },
            { hash_type: "bang" }
          );
          expect(test_history.to_href(location)).toBe("#!/simple-path");
        });
      });
    });

    describe("clean", () => {
      it("outputs expected string", () => {
        with_dom({ url: "http://example.com/#/one" }, ({ window }) => {
          const test_history = hash(
            pending => {
              pending.finish();
            },
            { hash_type: "clean" }
          );
          expect(test_history.to_href(location)).toBe("#simple-path");
        });
      });
    });
  });
});
