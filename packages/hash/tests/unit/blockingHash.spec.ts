import "jest";
import { blockingHash } from "../../src";

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
    await asyncWithDOM(
      { url: "http://example.com/#/one" },
      ({ window, resolve }) => {
        test.fn({
          constructor: blockingHash,
          resolve
        });
      }
    );
  });
}

function runTest(test: TestCase) {
  it(test.msg, () => {
    withDOM({ url: "http://example.com/#/one" }, () => {
      test.fn({
        constructor: blockingHash
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

describe("hash constructor", () => {
  it("initializes using window.location", () => {
    withDOM({ url: "http://example.com/#/one" }, () => {
      const testHistory = blockingHash(pending => {
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
    withDOM({ url: "http://example.com/#/one", setGlobal: false }, () => {
      expect(() => {
        blockingHash(pending => {
          pending.finish();
        });
      }).toThrow();
    });
  });

  it('sets initial action to "push" when page has not been previously visited', () => {
    withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
      window.history.pushState(null, "", "/#has-no-key");
      blockingHash(pending => {
        expect(pending.action).toBe("push");
        pending.finish();
      });
    });
  });

  it('sets initial action to "pop" when page has been previously visited', () => {
    withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
      window.history.pushState({ key: "17.0" }, "", "/#has-key");
      blockingHash(pending => {
        expect(pending.action).toBe("pop");
        pending.finish();
      });
    });
  });

  describe("no initial hash path", () => {
    describe("no hashType", () => {
      it("sets the expected hash format", () => {
        withDOM({ url: "http://example.com/" }, ({ window }) => {
          expect(window.location.hash).toBe("");
          blockingHash(pending => {
            pending.finish();
          });
          expect(window.location.hash).toBe("#/");
        });
      });
    });

    describe("default hashType", () => {
      it("sets the expected hash format", () => {
        withDOM({ url: "http://example.com/" }, ({ window }) => {
          expect(window.location.hash).toBe("");
          blockingHash(
            pending => {
              pending.finish();
            },
            { hashType: "default" }
          );
          expect(window.location.hash).toBe("#/");
        });
      });
    });

    describe("bang hashType", () => {
      it("sets the expected hash format", () => {
        withDOM({ url: "http://example.com/" }, ({ window }) => {
          expect(window.location.hash).toBe("");
          blockingHash(
            pending => {
              pending.finish();
            },
            { hashType: "bang" }
          );
          expect(window.location.hash).toBe("#!/");
        });
      });
    });

    describe("clean hashType", () => {
      it("sets the expected hash format", () => {
        withDOM({ url: "http://example.com/" }, ({ window }) => {
          expect(window.location.hash).toBe("");
          blockingHash(
            pending => {
              pending.finish();
            },
            { hashType: "clean" }
          );
          expect(window.location.hash).toBe("#/");
        });
      });
    });
  });

  describe("decodes from browser based on options.hashType", () => {
    it("works with no hashType (default)", () => {
      withDOM({ url: "http://example.com/#/the-path" }, () => {
        const testHistory = blockingHash(pending => {
          pending.finish();
        });
        expect(testHistory.location).toMatchObject({
          pathname: "/the-path"
        });
      });
    });

    it("works with default hashType", () => {
      withDOM({ url: "http://example.com/#/the-path" }, () => {
        const testHistory = blockingHash(
          pending => {
            pending.finish();
          },
          { hashType: "default" }
        );
        expect(testHistory.location).toMatchObject({
          pathname: "/the-path"
        });
      });
    });

    it("works with bang hashType", () => {
      // bang expects an exclamation point before the leading slash
      withDOM({ url: "http://example.com/#!/the-path" }, () => {
        const testHistory = blockingHash(
          pending => {
            pending.finish();
          },
          { hashType: "bang" }
        );
        expect(testHistory.location).toMatchObject({
          pathname: "/the-path"
        });
      });
    });

    it("works with default hashType", () => {
      // clean expects no leading slash
      withDOM({ url: "http://example.com/#the-path" }, () => {
        const testHistory = blockingHash(
          pending => {
            pending.finish();
          },
          { hashType: "clean" }
        );
        expect(testHistory.location).toMatchObject({
          pathname: "/the-path"
        });
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

describe("go suite", () => {
  runSuite(goSuite);
});

describe("go", () => {
  // integration?
  it("calls window.history.go with provided value", () => {
    withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
      const mock_go = (window.history.go = jest.fn());
      const testHistory = blockingHash(pending => {
        pending.finish();
      });
      [undefined, 0, 1, -1].forEach((value, index) => {
        testHistory.go(value);
        expect(mock_go.mock.calls[index][0]).toBe(value);
      });
    });
  });
});

describe("url", () => {
  it("returns the location formatted as a string", () => {
    withDOM({ url: "http://example.com/#/one" }, () => {
      const testHistory = blockingHash(pending => {
        pending.finish();
      });
      const current_path = testHistory.url({
        pathname: "/one",
        query: "test=query"
      });
      expect(current_path).toBe("#/one?test=query");
    });
  });

  const location = { pathname: "/simple-path" };

  describe("hashType", () => {
    describe("[none provided]", () => {
      it("outputs expected string", () => {
        withDOM({ url: "http://example.com/#/one" }, () => {
          const testHistory = blockingHash(pending => {
            pending.finish();
          });
          expect(testHistory.url(location)).toBe("#/simple-path");
        });
      });
    });

    describe("default", () => {
      it("outputs expected string", () => {
        withDOM({ url: "http://example.com/#/one" }, () => {
          const testHistory = blockingHash(
            pending => {
              pending.finish();
            },
            { hashType: "default" }
          );
          expect(testHistory.url(location)).toBe("#/simple-path");
        });
      });
    });

    describe("bang", () => {
      it("outputs expected string", () => {
        withDOM({ url: "http://example.com/#/one" }, () => {
          const testHistory = blockingHash(
            pending => {
              pending.finish();
            },
            { hashType: "bang" }
          );
          expect(testHistory.url(location)).toBe("#!/simple-path");
        });
      });
    });

    describe("clean", () => {
      it("outputs expected string", () => {
        withDOM({ url: "http://example.com/#/one" }, () => {
          const testHistory = blockingHash(
            pending => {
              pending.finish();
            },
            { hashType: "clean" }
          );
          expect(testHistory.url(location)).toBe("#simple-path");
        });
      });
    });
  });
});
