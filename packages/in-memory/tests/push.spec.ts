import "jest";
import InMemory from "../src";

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
describe('update(..., "PUSH")', () => {
  describe("without a response handler", () => {
    it("does nothing", () => {
      const testHistory = InMemory();
      testHistory.update("/two", "PUSH");
      expect(testHistory.location.pathname).toBe("/");
    });
  });

  describe("respondWith", () => {
    it("triggers a response handler call", () => {
      const testHistory = InMemory();
      const router = jest.fn();
      testHistory.respondWith(router); // calls router
      testHistory.update("/two", "PUSH");
      expect(router.mock.calls.length).toBe(2);
    });

    describe("location", () => {
      it("is a location object created from pushed string", () => {
        const testHistory = InMemory();
        const router = ignoreFirstCall(function(pending) {
          expect(pending.location).toMatchObject({
            pathname: "/two",
            query: "test=ing"
          });
        });
        testHistory.respondWith(router);
        testHistory.update("/two?test=ing", "PUSH");
      });

      it("is a location object created from pushed object", () => {
        const testHistory = InMemory();
        const router = ignoreFirstCall(function(pending) {
          expect(pending.location).toMatchObject({
            pathname: "/two",
            hash: "test"
          });
        });
        testHistory.respondWith(router);
        testHistory.update({ pathname: "/two", hash: "test" }, "PUSH");
      });

      it("increments current major key value by 1, sets minor value to 0", () => {
        const testHistory = InMemory();
        function router(pending) {
          pending.finish();
        }
        testHistory.respondWith(router); // calls router

        const [initMajor] = testHistory.location.key.split(".");
        const initMajorNum = parseInt(initMajor, 10);

        testHistory.update("/next", "PUSH");

        const current = testHistory.location;
        const [currentMajor, currentMinor] = current.key.split(".");
        const currentMajorNum = parseInt(currentMajor, 10);

        expect(currentMajorNum).toEqual(initMajorNum + 1);
        expect(currentMinor).toBe("0");
      });

      it("increments from current location's key when not at end of locations", done => {
        // async test because history.go needs to listen for a popstate event
        const testHistory = InMemory();
        let afterPop = false;
        function router(pending) {
          pending.finish();
          if (
            pending.action === "POP" &&
            pending.location.pathname === "/three"
          ) {
            testHistory.update("/new-four", "PUSH");
            afterPop = true;
          }
          if (afterPop) {
            expect(testHistory.location.key).toBe("3.0");
            done();
          }
        }
        testHistory.respondWith(router); // calls router
        // just getting the history in the expected state
        testHistory.update("/two", "PUSH"); // 1.0
        testHistory.update("/three", "PUSH"); // 2.0
        testHistory.update("/four", "PUSH"); // 3.0
        testHistory.update("/five", "PUSH"); // 4.0
        testHistory.go(-2); // 2.0
      });
    });

    describe("action", () => {
      it('is "PUSH"', () => {
        const testHistory = InMemory();
        const router = ignoreFirstCall(function router(pending) {
          expect(pending.action).toBe("PUSH");
          pending.finish();
        });
        testHistory.respondWith(router); // calls router
        testHistory.update("/next", "PUSH");
      });
    });

    describe("finish", () => {
      it("updates InMemory history when finish function is called", () => {
        const testHistory = InMemory();
        let router = ignoreFirstCall(function(pending) {
          expect(testHistory.location.pathname).toBe("/");
          pending.finish();
          expect(testHistory.location.pathname).toBe("/two");
        });
        testHistory.respondWith(router); // calls router
        testHistory.update("/two", "PUSH");
      });

      it("does nothing if update is not called", () => {
        const testHistory = InMemory();
        let call = 0;
        function router(pending) {}
        testHistory.respondWith(router); // calls router
        testHistory.update("/two", "PUSH");
        expect(testHistory.location.pathname).toBe("/");
      });

      it("sets history.location to new location object", () => {
        const testHistory = InMemory();
        function router(pending) {
          pending.finish();
        }
        testHistory.respondWith(router); // calls router
        testHistory.update("/next", "PUSH");
        expect(testHistory.location).toMatchObject({
          pathname: "/next"
        });
      });

      it('sets history.action to "PUSH"', () => {
        const testHistory = InMemory();
        function router(pending) {
          pending.finish();
        }
        testHistory.respondWith(router); // calls router
        testHistory.update("/next", "PUSH");
        expect(testHistory.action).toBe("PUSH");
      });
    });

    describe("cancel", () => {
      it("does not update InMemory history when cancel function is called", () => {
        const testHistory = InMemory();
        let router = ignoreFirstCall(function(pending) {
          expect(testHistory.location.pathname).toBe("/");
          pending.cancel();
          expect(testHistory.location.pathname).toBe("/");
        });
        testHistory.respondWith(router); // calls router
        testHistory.update("/two", "PUSH");
      });

      it("does not update the action value", () => {
        const testHistory = InMemory();
        let router = ignoreFirstCall(function(pending) {
          expect(testHistory.action).toBe("PUSH");
          pending.cancel();
          expect(testHistory.action).toBe("PUSH");
        });
        testHistory.respondWith(router); // calls router
        testHistory.update("/two", "PUSH");
      });
    });
  });

  describe("with a confirmation function", () => {
    it("calls response pending after the user confirms the navigation", () => {
      const testHistory = InMemory();
      const router = jest.fn();
      const confirm = (info, confirm, prevent) => {
        confirm();
      };
      testHistory.confirmWith(confirm);
      testHistory.respondWith(router); // calls router

      testHistory.update("/next", "PUSH");
      expect(router.mock.calls.length).toBe(2);
    });

    it("does not call response pending when the user prevents the navigation", () => {
      const testHistory = InMemory();
      const router = jest.fn();
      const confirm = (info, confirm, prevent) => {
        prevent();
      };
      testHistory.confirmWith(confirm);
      testHistory.respondWith(router); // calls router

      testHistory.update("/next", "PUSH");
      expect(router.mock.calls.length).toBe(1);
    });
  });
});
