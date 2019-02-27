import "jest";
import { Browser } from "../../src";

import { withDOM } from "../../../../tests/utils/dom";

function ignoreFirstCall(fn) {
  let notCalled = true;
  return function() {
    if (notCalled) {
      notCalled = false;
      return;
    }
    fn.apply(null, arguments);
  };
}

// We create our own jsdom instead of using the one that Jest will create
// so that we can reset the DOM between tests
describe("navigate()", () => {
  describe("response handler", () => {
    it("does nothing without a response handler", () => {
      withDOM({ url: "http://example.com/one" }, ({ window }) => {
        const testHistory = Browser();
        testHistory.navigate("/two");
        expect(window.location.pathname).toBe("/one");
      });
    });

    it("triggers a response handler call if handler is registered", () => {
      withDOM({ url: "http://example.com/one" }, () => {
        const testHistory = Browser();
        const router = jest.fn();
        testHistory.respondWith(router);
        testHistory.navigate("/two");
        expect(router.mock.calls.length).toBe(2);
      });
    });
  });

  describe("invalid method", () => {
    it("throws", () => {
      withDOM({ url: "http://example.com/one" }, ({ window }) => {
        const testHistory = Browser();
        const router = jest.fn();
        testHistory.respondWith(router);

        expect(() => {
          // @ts-ignore
          testHistory.navigate("/somewhere", "throws");
        }).toThrowError("Invalid navigation type: throws");
      });
    });
  });

  describe("location", () => {
    describe("from string", () => {
      it("is a location object created from pushed string", () => {
        withDOM({ url: "http://example.com/one" }, ({ window }) => {
          const testHistory = Browser();
          const router = ignoreFirstCall(function(pending) {
            expect(pending.location).toMatchObject({
              pathname: "/two",
              query: "test=ing"
            });
          });
          testHistory.respondWith(router);
          testHistory.navigate("/two?test=ing");
        });
      });
    });

    describe("from object", () => {
      it("is a location object created from pushed object", () => {
        withDOM({ url: "http://example.com/one" }, ({ window }) => {
          const testHistory = Browser();
          const router = ignoreFirstCall(function(pending) {
            expect(pending.location).toMatchObject({
              pathname: "/two",
              hash: "test"
            });
          });
          testHistory.respondWith(router);
          testHistory.navigate({ pathname: "/two", hash: "test" });
        });
      });
    });

    it("pushing increments major key", () => {
      withDOM({ url: "http://example.com/one" }, ({ window }) => {
        const testHistory = Browser();
        function router(pending) {
          pending.finish();
        }
        testHistory.respondWith(router); // calls router

        const [initMajor] = testHistory.location.key.split(".");
        const initMajorNum = parseInt(initMajor, 10);

        testHistory.navigate("/next");

        const current = testHistory.location;
        const [currentMajor, currentMinor] = current.key.split(".");
        const currentMajorNum = parseInt(currentMajor, 10);

        expect(currentMajorNum).toEqual(initMajorNum + 1);
        expect(currentMinor).toBe("0");
      });
    });

    it("replacing increments minor key", () => {
      withDOM({ url: "http://example.com/one" }, ({ window }) => {
        const testHistory = Browser();
        function router(pending) {
          pending.finish();
        }
        testHistory.respondWith(router); // calls router

        const [initMajor, initMinor] = testHistory.location.key.split(".");
        const initMajorNum = parseInt(initMajor, 10);
        const initMinorNum = parseInt(initMinor, 10);

        testHistory.navigate("/one");

        const current = testHistory.location;
        const [currentMajor, currentMinor] = current.key.split(".");
        const currentMajorNum = parseInt(currentMajor, 10);
        const currentMinorNum = parseInt(currentMinor, 10);

        expect(currentMajorNum).toEqual(initMajorNum);
        expect(currentMinorNum).toBe(initMinorNum + 1);
      });
    });
  });

  describe("action", () => {
    describe("push", () => {
      it("navigate(newLocation)", () => {
        withDOM({ url: "http://example.com/one" }, ({ window }) => {
          const testHistory = Browser();
          const router = ignoreFirstCall(({ action }) => {
            expect(action).toBe("push");
          });
          testHistory.respondWith(router);

          testHistory.navigate("/two");
        });
      });

      it('navigate(newLocation, "anchor")', () => {
        withDOM({ url: "http://example.com/one" }, ({ window }) => {
          const testHistory = Browser();
          const router = ignoreFirstCall(({ action }) => {
            expect(action).toBe("push");
          });
          testHistory.respondWith(router);

          testHistory.navigate("/two", "anchor");
        });
      });

      it('navigate(location, "push")', () => {
        withDOM({ url: "http://example.com/one" }, ({ window }) => {
          const testHistory = Browser();
          const router = ignoreFirstCall(({ action }) => {
            expect(action).toBe("push");
          });
          testHistory.respondWith(router);

          testHistory.navigate("/two", "push");
        });
      });
    });

    describe("replace", () => {
      it("navigate(sameLocation)", () => {
        withDOM({ url: "http://example.com/one" }, ({ window }) => {
          const testHistory = Browser();
          const router = ignoreFirstCall(({ action }) => {
            expect(action).toBe("replace");
          });
          testHistory.respondWith(router);

          testHistory.navigate("/one");
        });
      });

      it('navigate(sameLocation, "anchor")', () => {
        withDOM({ url: "http://example.com/one" }, ({ window }) => {
          const testHistory = Browser();
          const router = ignoreFirstCall(({ action }) => {
            expect(action).toBe("replace");
          });
          testHistory.respondWith(router);

          testHistory.navigate("/one", "anchor");
        });
      });

      it('navigate(location, "replace")', () => {
        withDOM({ url: "http://example.com/one" }, ({ window }) => {
          const testHistory = Browser();
          const router = ignoreFirstCall(({ action }) => {
            expect(action).toBe("replace");
          });
          testHistory.respondWith(router);

          testHistory.navigate("/two", "replace");
        });
      });
    });
  });

  describe("finish", () => {
    it("updates browser history when finish function is called", () => {
      withDOM({ url: "http://example.com/one" }, ({ window }) => {
        const testHistory = Browser();
        let router = ignoreFirstCall(function(pending) {
          expect(window.location.pathname).toBe("/one");
          pending.finish();
          expect(window.location.pathname).toBe("/two");
        });
        testHistory.respondWith(router); // calls router
        testHistory.navigate("/two");
      });
    });

    it("does nothing if navigate() is not called", () => {
      withDOM({ url: "http://example.com/one" }, ({ window }) => {
        const testHistory = Browser();
        function router() {}
        testHistory.respondWith(router); // calls router
        testHistory.navigate("/two");
        expect(window.location.pathname).toBe("/one");
      });
    });

    it("sets history.location to new location object", () => {
      withDOM({ url: "http://example.com/one" }, ({ window }) => {
        const testHistory = Browser();
        function router(pending) {
          pending.finish();
        }
        testHistory.respondWith(router); // calls router
        testHistory.navigate("/next");
        expect(testHistory.location).toMatchObject({
          pathname: "/next"
        });
      });
    });

    it('(new) sets history.action to "push"', () => {
      withDOM({ url: "http://example.com/one" }, ({ window }) => {
        const testHistory = Browser();
        function router(pending) {
          pending.finish();
        }
        testHistory.respondWith(router); // calls router
        testHistory.navigate("/next");
        expect(testHistory.action).toBe("push");
      });
    });

    it('(same) sets history.action to "replace"', () => {
      withDOM({ url: "http://example.com/one" }, ({ window }) => {
        const testHistory = Browser();
        function router(pending) {
          pending.finish();
        }
        testHistory.respondWith(router); // calls router
        testHistory.navigate("/one");
        expect(testHistory.action).toBe("replace");
      });
    });
  });

  describe("cancel", () => {
    it("does not update browser history when cancel function is called", () => {
      withDOM({ url: "http://example.com/one" }, ({ window }) => {
        const testHistory = Browser();
        let router = ignoreFirstCall(function(pending) {
          expect(window.location.pathname).toBe("/one");
          pending.cancel();
          expect(window.location.pathname).toBe("/one");
        });
        testHistory.respondWith(router); // calls router
        testHistory.navigate("/two");
      });
    });

    it("does not update the action value", () => {
      withDOM({ url: "http://example.com/one" }, ({ window }) => {
        const testHistory = Browser();
        let router = ignoreFirstCall(function(pending) {
          expect(testHistory.action).toBe("push");
          pending.cancel();
          expect(testHistory.action).toBe("push");
        });
        testHistory.respondWith(router); // calls router
        testHistory.navigate("/two");
      });
    });
  });
});
