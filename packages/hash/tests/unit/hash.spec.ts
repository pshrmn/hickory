import "jest";
import { hash } from "../../src/hash";

import { withDOM, asyncWithDOM } from "../../../../tests/utils/dom";
import { navigateSuite, goSuite, cancelSuite } from "../../../../tests/cases";

import { TestCase, Suite } from "../../../../tests/types";

function runAsyncTest(test: TestCase) {
  it(test.msg, async () => {
    expect.assertions(test.assertions);
    await asyncWithDOM(
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

function runTest(test: TestCase) {
  it(test.msg, () => {
    withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
      test.fn({
        constructor: hash
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
      const testHistory = hash(pending => {
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
        const testHistory = hash(pending => {
          pending.finish();
        });
      }).toThrow();
    });
  });

  it('sets initial action to "push" when page has not been previously visited', () => {
    withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
      window.history.pushState(null, "", "/#has-no-key");
      const testHistory = hash(pending => {
        expect(pending.action).toBe("push");
        pending.finish();
      });
    });
  });

  it('sets initial action to "pop" when page has been previously visited', () => {
    withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
      window.history.pushState({ key: "17.0" }, "", "/#has-key");
      const testHistory = hash(pending => {
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
          const testHistory = hash(pending => {
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
          const testHistory = hash(
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
          const testHistory = hash(
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
          const testHistory = hash(
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
        const testHistory = hash(pending => {
          pending.finish();
        });
        expect(testHistory.location).toMatchObject({
          pathname: "/the-path"
        });
      });
    });

    it("works with default hashType", () => {
      withDOM({ url: "http://example.com/#/the-path" }, () => {
        const testHistory = hash(
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
        const testHistory = hash(
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
        const testHistory = hash(
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

describe("go suite", () => {
  runSuite(goSuite);
});

describe("go", () => {
  // integration?
  it("calls window.history.go with provided value", () => {
    withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
      const mockGo = (window.history.go = jest.fn());
      const testHistory = hash(pending => {
        pending.finish();
      });
      [undefined, 0, 1, -1].forEach((value, index) => {
        testHistory.go(value);
        expect(mockGo.mock.calls[index][0]).toBe(value);
      });
    });
  });
});

describe("href", () => {
  it("returns the location formatted as a string", () => {
    withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
      const testHistory = hash(pending => {
        pending.finish();
      });
      const currentPath = testHistory.href({
        pathname: "/one",
        query: "test=query"
      });
      expect(currentPath).toBe("#/one?test=query");
    });
  });

  const location = { pathname: "/simple-path" };

  describe("hashType", () => {
    describe("[none provided]", () => {
      it("outputs expected string", () => {
        withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
          const testHistory = hash(pending => {
            pending.finish();
          });
          expect(testHistory.href(location)).toBe("#/simple-path");
        });
      });
    });

    describe("default", () => {
      it("outputs expected string", () => {
        withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
          const testHistory = hash(
            pending => {
              pending.finish();
            },
            { hashType: "default" }
          );
          expect(testHistory.href(location)).toBe("#/simple-path");
        });
      });
    });

    describe("bang", () => {
      it("outputs expected string", () => {
        withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
          const testHistory = hash(
            pending => {
              pending.finish();
            },
            { hashType: "bang" }
          );
          expect(testHistory.href(location)).toBe("#!/simple-path");
        });
      });
    });

    describe("clean", () => {
      it("outputs expected string", () => {
        withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
          const testHistory = hash(
            pending => {
              pending.finish();
            },
            { hashType: "clean" }
          );
          expect(testHistory.href(location)).toBe("#simple-path");
        });
      });
    });
  });
});
