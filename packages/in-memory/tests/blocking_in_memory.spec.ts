import "jest";
import { blocking_in_memory } from "../src";

import {
  navigate_suite,
  go_suite,
  cancel_suite,
  blocking_suite
} from "../../../tests/cases";

import { TestCase, Suite } from "../../../tests/types";

import { InMemoryOptions, HistoryConstructor } from "@hickory/in-memory";

interface FnOptions {
  constructor: HistoryConstructor<InMemoryOptions>;
  options: InMemoryOptions;
}

interface AsyncFnOptions extends FnOptions {
  resolve: (value?: {} | PromiseLike<{}>) => void;
}

function run_async_test(test: TestCase) {
  it(test.msg, async () => {
    expect.assertions(test.assertions);
    await new Promise(resolve => {
      test.fn({
        constructor: blocking_in_memory,
        options: {
          locations: ["/one"]
        },
        resolve
      } as AsyncFnOptions);
    });
  });
}

function run_test(test: TestCase) {
  it(test.msg, () => {
    test.fn({
      constructor: blocking_in_memory,
      options: {
        locations: ["/one"]
      }
    } as FnOptions);
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

describe("Memory constructor", () => {
  it("initializes with root location (/) if none provided", () => {
    const test_history = blocking_in_memory(pending => {
      pending.finish();
    });
    expect(test_history.location).toMatchObject({
      pathname: "/",
      hash: "",
      query: ""
    });
  });

  it("works with string locations", () => {
    const test_history = blocking_in_memory(
      pending => {
        pending.finish();
      },
      {
        locations: ["/one#step"]
      }
    );
    expect(test_history.location).toMatchObject({
      pathname: "/one",
      hash: "step"
    });
  });

  it("works with object locations", () => {
    const test_history = blocking_in_memory(
      pending => {
        pending.finish();
      },
      {
        locations: [{ pathname: "/two", hash: "daloo" }]
      }
    );
    expect(test_history.location).toMatchObject({
      pathname: "/two",
      hash: "daloo"
    });
  });

  it("uses the provided index to select initial location", () => {
    const test_history = blocking_in_memory(
      pending => {
        pending.finish();
      },
      {
        locations: ["/one", "/two", "/three"],
        index: 2
      }
    );
    expect(test_history.location).toMatchObject({
      pathname: "/three"
    });
  });

  it("defaults to index 0 if provided index is out of bounds", () => {
    [-1, 3].forEach(value => {
      const test_history = blocking_in_memory(
        pending => {
          pending.finish();
        },
        {
          locations: ["/one", "/two", "/three"],
          index: value
        }
      );
      expect(test_history.location).toMatchObject({
        pathname: "/one"
      });
    });
  });

  it('sets initial action to "push"', () => {
    const test_history = blocking_in_memory(
      pending => {
        expect(pending.action).toBe("push");
        pending.finish();
      },
      {
        locations: ["/one", "/two", "/three"],
        index: 0
      }
    );
  });
});

describe("cancel", () => {
  run_suite(cancel_suite);
});

describe("navigate()", () => {
  run_suite(navigate_suite);
});

describe("blocking", () => {
  run_suite(blocking_suite);
});

describe("go suite", () => {
  run_suite(go_suite);
});

describe("go", () => {
  describe("with no value", () => {
    it('calls response handler with current location and "pop" action', done => {
      const test_history = blocking_in_memory(pending => {
        expect(pending.location).toMatchObject({
          pathname: "/"
        });
        expect(pending.action).toBe("pop");
        done();
        pending.finish();
      });
      test_history.go();
    });
  });

  describe("with a value", () => {
    it("does nothing if the value is outside of the range", () => {
      const router = jest.fn();
      const test_history = blocking_in_memory(router);
      test_history.go(10);
      // just verifying that a popstate event hasn't emitted to
      // trigger the history's event handler
      expect(router.mock.calls.length).toBe(0);
    });
  });
});

describe("to_href", () => {
  it("returns the location formatted as a string", () => {
    const test_history = blocking_in_memory(
      pending => {
        pending.finish();
      },
      {
        locations: [{ pathname: "/one", query: "test=query" }]
      }
    );
    const currentPath = test_history.to_href(test_history.location);
    expect(currentPath).toBe("/one?test=query");
  });
});

describe("reset()", () => {
  describe("locations", () => {
    it("works with string locations", () => {
      const test_history = blocking_in_memory(
        pending => {
          pending.finish();
        },
        {
          locations: ["/one", "/two", "/three"]
        }
      );
      expect(test_history.location).toMatchObject({
        pathname: "/one"
      });

      test_history.reset({
        locations: ["/uno", "/dos"]
      });
      expect(test_history.location).toMatchObject({
        pathname: "/uno"
      });
    });

    it("works with object locations", () => {
      const test_history = blocking_in_memory(
        pending => {
          pending.finish();
        },
        {
          locations: ["/one", "/two", "/three"]
        }
      );
      expect(test_history.location).toMatchObject({
        pathname: "/one"
      });

      test_history.reset({
        locations: [{ pathname: "/uno" }, { pathname: "/dos" }]
      });
      expect(test_history.location).toMatchObject({
        pathname: "/uno"
      });
    });

    it("uses default '/' location if no locations are provided", () => {
      const test_history = blocking_in_memory(
        pending => {
          pending.finish();
        },
        {
          locations: ["/one", "/two", "/three"]
        }
      );
      expect(test_history.location).toMatchObject({
        pathname: "/one"
      });

      test_history.reset();
      expect(test_history.location).toMatchObject({
        pathname: "/"
      });
    });

    it("reset removes existing locations", () => {
      const router = jest.fn();
      const test_history = blocking_in_memory(router, {
        locations: ["/one", "/two", "/three"]
      });

      // reset the call from attaching the router
      router.mockReset();

      test_history.go(2);

      // response handler is called because we can pop
      expect(router.mock.calls.length).toBe(1);

      test_history.reset({ locations: ["/uno"] });
      router.mockReset();

      test_history.go(2);

      // response handler is not called because there is no location
      // to pop to
      expect(router.mock.calls.length).toBe(0);
    });
  });

  it("sets location using provided index value", () => {
    const test_history = blocking_in_memory(
      pending => {
        pending.finish();
      },
      {
        locations: ["/one", "/two", "/three"],
        index: 1
      }
    );
    expect(test_history.location.pathname).toBe("/two");

    test_history.reset({
      locations: ["/uno", "/dos", "/tres"],
      index: 2
    });
    expect(test_history.location.pathname).toBe("/tres");
  });

  it("uses location at index 0 if index is not provided", () => {
    const test_history = blocking_in_memory(
      pending => {
        pending.finish();
      },
      {
        locations: ["/one", "/two", "/three"],
        index: 1
      }
    );
    expect(test_history.location.pathname).toBe("/two");

    test_history.reset({
      locations: ["/uno", "/dos", "/tres"]
    });
    expect(test_history.location.pathname).toBe("/uno");
  });

  it("uses location at index 0 if provided index < 0", () => {
    const test_history = blocking_in_memory(
      pending => {
        pending.finish();
      },
      {
        locations: ["/one", "/two", "/three"],
        index: 1
      }
    );
    expect(test_history.location.pathname).toBe("/two");

    test_history.reset({
      locations: ["/uno", "/dos", "/tres"],
      index: -1
    });
    expect(test_history.location.pathname).toBe("/uno");
  });

  it("uses location at index 0 if index is larger than length of locations array", () => {
    const test_history = blocking_in_memory(
      pending => {
        pending.finish();
      },
      {
        locations: ["/one", "/two", "/three"],
        index: 1
      }
    );
    expect(test_history.location.pathname).toBe("/two");

    test_history.reset({
      locations: ["/uno", "/dos", "/tres"],
      index: 7
    });
    expect(test_history.location.pathname).toBe("/uno");
  });

  describe("emitting new location", () => {
    it("emits the new location", () => {
      const router = jest.fn();
      const test_history = blocking_in_memory(router, {
        locations: ["/one", "/two", "/three"]
      });

      test_history.reset({
        locations: ["/uno", "/dos"]
      });
      expect(router.mock.calls.length).toBe(1);
      expect(router.mock.calls[0][0]).toMatchObject({
        location: {
          pathname: "/uno"
        }
      });
    });

    it('emits the action as "push"', () => {
      const router = jest.fn();
      const test_history = blocking_in_memory(router, {
        locations: ["/one", "/two", "/three"]
      });

      test_history.reset({
        locations: ["/uno", "/dos"]
      });
      expect(router.mock.calls[0][0]).toMatchObject({
        action: "push"
      });
    });
  });
});
