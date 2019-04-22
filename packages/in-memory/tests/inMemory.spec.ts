import "jest";
import { inMemory } from "../src";

import { navigateSuite, goSuite, cancelSuite } from "../../../tests/cases";

import { TestCase, Suite } from "../../../tests/types";

import { InMemoryOptions, HistoryConstructor } from "@hickory/in-memory";

interface FnOptions {
  constructor: HistoryConstructor<InMemoryOptions>;
  options: InMemoryOptions;
}

interface AsyncFnOptions extends FnOptions {
  resolve: (value?: {} | PromiseLike<{}>) => void;
}

function runAsyncTest(test: TestCase) {
  it(test.msg, async () => {
    expect.assertions(test.assertions);
    await new Promise(resolve => {
      test.fn({
        constructor: inMemory,
        options: {
          locations: [{ url: "/one" }]
        },
        resolve
      } as AsyncFnOptions);
    });
  });
}

function runTest(test: TestCase) {
  it(test.msg, () => {
    test.fn({
      constructor: inMemory,
      options: {
        locations: [{ url: "/one" }]
      }
    } as FnOptions);
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

describe("Memory constructor", () => {
  it("initializes with root location (/) if none provided", () => {
    const testHistory = inMemory(pending => {
      pending.finish();
    });
    expect(testHistory.location).toMatchObject({
      pathname: "/",
      hash: "",
      query: ""
    });
  });

  it("works with string locations", () => {
    const testHistory = inMemory(
      pending => {
        pending.finish();
      },
      {
        locations: [{ url: "/one#step" }]
      }
    );
    expect(testHistory.location).toMatchObject({
      pathname: "/one",
      hash: "step"
    });
  });

  it("works with object locations", () => {
    const testHistory = inMemory(
      pending => {
        pending.finish();
      },
      {
        locations: [{ pathname: "/two", hash: "daloo" }]
      }
    );
    expect(testHistory.location).toMatchObject({
      pathname: "/two",
      hash: "daloo"
    });
  });

  it("uses the provided index to select initial location", () => {
    const testHistory = inMemory(
      pending => {
        pending.finish();
      },
      {
        locations: [{ url: "/one" }, { url: "/two" }, { url: "/three" }],
        index: 2
      }
    );
    expect(testHistory.location).toMatchObject({
      pathname: "/three"
    });
  });

  it("defaults to index 0 if provided index is out of bounds", () => {
    [-1, 3].forEach(value => {
      const testHistory = inMemory(
        pending => {
          pending.finish();
        },
        {
          locations: [{ url: "/one" }, { url: "/two" }, { url: "/three" }],
          index: value
        }
      );
      expect(testHistory.location).toMatchObject({
        pathname: "/one"
      });
    });
  });

  it('sets initial action to "push"', () => {
    const testHistory = inMemory(
      pending => {
        expect(pending.action).toBe("push");
        pending.finish();
      },
      {
        locations: [{ url: "/one" }, { url: "/two" }, { url: "/three" }],
        index: 0
      }
    );
  });
});

describe("cancel", () => {
  runSuite(cancelSuite);
});

describe("navigate()", () => {
  runSuite(navigateSuite);
});

describe("go suite", () => {
  runSuite(goSuite);
});

describe("go", () => {
  describe("with no value", () => {
    it('calls response handler with current location and "pop" action', done => {
      const testHistory = inMemory(pending => {
        expect(pending.location).toMatchObject({
          pathname: "/"
        });
        expect(pending.action).toBe("pop");
        done();
        pending.finish();
      });
      testHistory.go();
    });
  });

  describe("with a value", () => {
    it("does nothing if the value is outside of the range", () => {
      const router = jest.fn();
      const testHistory = inMemory(router);
      testHistory.go(10);
      // just verifying that a popstate event hasn't emitted to
      // trigger the history's event handler
      expect(router.mock.calls.length).toBe(0);
    });
  });
});

describe("href", () => {
  it("returns the location formatted as a string", () => {
    const testHistory = inMemory(
      pending => {
        pending.finish();
      },
      {
        locations: [{ pathname: "/one", query: "test=query" }]
      }
    );
    const currentPath = testHistory.href(testHistory.location);
    expect(currentPath).toBe("/one?test=query");
  });
});

describe("reset()", () => {
  describe("locations", () => {
    it("works with string locations", () => {
      const testHistory = inMemory(
        pending => {
          pending.finish();
        },
        {
          locations: [{ url: "/one" }, { url: "/two" }, { url: "/three" }]
        }
      );
      expect(testHistory.location).toMatchObject({
        pathname: "/one"
      });

      testHistory.reset({
        locations: [{ url: "/uno" }, { url: "/dos" }]
      });
      expect(testHistory.location).toMatchObject({
        pathname: "/uno"
      });
    });

    it("works with object locations", () => {
      const testHistory = inMemory(
        pending => {
          pending.finish();
        },
        {
          locations: [{ url: "/one" }, { url: "/two" }, { url: "/three" }]
        }
      );
      expect(testHistory.location).toMatchObject({
        pathname: "/one"
      });

      testHistory.reset({
        locations: [{ pathname: "/uno" }, { pathname: "/dos" }]
      });
      expect(testHistory.location).toMatchObject({
        pathname: "/uno"
      });
    });

    it("uses default '/' location if no locations are provided", () => {
      const testHistory = inMemory(
        pending => {
          pending.finish();
        },
        {
          locations: [{ url: "/one" }, { url: "/two" }, { url: "/three" }]
        }
      );
      expect(testHistory.location).toMatchObject({
        pathname: "/one"
      });

      testHistory.reset();
      expect(testHistory.location).toMatchObject({
        pathname: "/"
      });
    });

    it("reset removes existing locations", () => {
      const router = jest.fn();
      const testHistory = inMemory(router, {
        locations: [{ url: "/one" }, { url: "/two" }, { url: "/three" }]
      });

      // reset the call from attaching the router
      router.mockReset();

      testHistory.go(2);

      // response handler is called because we can pop
      expect(router.mock.calls.length).toBe(1);

      testHistory.reset({ locations: [{ url: "/uno" }] });
      router.mockReset();

      testHistory.go(2);

      // response handler is not called because there is no location
      // to pop to
      expect(router.mock.calls.length).toBe(0);
    });
  });

  it("sets location using provided index value", () => {
    const testHistory = inMemory(
      pending => {
        pending.finish();
      },
      {
        locations: [{ url: "/one" }, { url: "/two" }, { url: "/three" }],
        index: 1
      }
    );
    expect(testHistory.location.pathname).toBe("/two");

    testHistory.reset({
      locations: [{ url: "/uno" }, { url: "/dos" }, { url: "/tres" }],
      index: 2
    });
    expect(testHistory.location.pathname).toBe("/tres");
  });

  it("uses location at index 0 if index is not provided", () => {
    const testHistory = inMemory(
      pending => {
        pending.finish();
      },
      {
        locations: [{ url: "/one" }, { url: "/two" }, { url: "/three" }],
        index: 1
      }
    );
    expect(testHistory.location.pathname).toBe("/two");

    testHistory.reset({
      locations: [{ url: "/uno" }, { url: "/dos" }, { url: "/tres" }]
    });
    expect(testHistory.location.pathname).toBe("/uno");
  });

  it("uses location at index 0 if provided index < 0", () => {
    const testHistory = inMemory(
      pending => {
        pending.finish();
      },
      {
        locations: [{ url: "/one" }, { url: "/two" }, { url: "/three" }],
        index: 1
      }
    );
    expect(testHistory.location.pathname).toBe("/two");

    testHistory.reset({
      locations: [{ url: "/uno" }, { url: "/dos" }, { url: "/tres" }],
      index: -1
    });
    expect(testHistory.location.pathname).toBe("/uno");
  });

  it("uses location at index 0 if index is larger than length of locations array", () => {
    const testHistory = inMemory(
      pending => {
        pending.finish();
      },
      {
        locations: [{ url: "/one" }, { url: "/two" }, { url: "/three" }],
        index: 1
      }
    );
    expect(testHistory.location.pathname).toBe("/two");

    testHistory.reset({
      locations: [{ url: "/uno" }, { url: "/dos" }, { url: "/tres" }],
      index: 7
    });
    expect(testHistory.location.pathname).toBe("/uno");
  });

  describe("emitting new location", () => {
    it("emits the new location", () => {
      const router = jest.fn();
      const testHistory = inMemory(router, {
        locations: [{ url: "/one" }, { url: "/two" }, { url: "/three" }]
      });

      testHistory.reset({
        locations: [{ url: "/uno" }, { url: "/dos" }]
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
      const testHistory = inMemory(router, {
        locations: [{ url: "/one" }, { url: "/two" }, { url: "/three" }]
      });

      testHistory.reset({
        locations: [{ url: "/uno" }, { url: "/dos" }]
      });
      expect(router.mock.calls[0][0]).toMatchObject({
        action: "push"
      });
    });
  });
});
