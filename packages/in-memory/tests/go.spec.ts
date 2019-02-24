import "jest";
import { InMemory } from "../src";

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
describe("go", () => {
  describe("with no value", () => {
    it("does nothing if there is no responseHandler", () => {
      const testHistory = InMemory();
      expect(() => {
        testHistory.go();
      }).not.toThrow();
    });

    it('calls response handler with current location and "pop" action', done => {
      const testHistory = InMemory();
      const router = ignoreFirstCall(function(pending) {
        expect(pending.location).toMatchObject({
          pathname: "/"
        });
        expect(pending.action).toBe("pop");
        done();
      });
      testHistory.respondWith(router); // calls router
      testHistory.go();
    });

    it('sets history.action to "pop" when calling "finish"', done => {
      const testHistory = InMemory();
      expect(testHistory.action).toBe("push");
      const router = ignoreFirstCall(function(pending) {
        pending.finish();
        expect(testHistory.action).toBe("pop");
        done();
      });
      testHistory.respondWith(router);
      testHistory.go();
    });
  });

  describe("with a value", () => {
    it("does nothing if the value is outside of the range", () => {
      const testHistory = InMemory();
      const router = jest.fn();
      testHistory.respondWith(router);
      testHistory.go(10);
      // just verifying that a popstate event hasn't emitted to
      // trigger the history's event handler
      expect(router.mock.calls.length).toBe(1);
    });

    it("calls response handler with expected location and action", done => {
      const testHistory = InMemory();
      let setup = false;
      function router(pending) {
        pending.finish();
        if (!setup) {
          return;
        }
        expect(pending.location).toMatchObject({
          pathname: "/four",
          key: "3.0"
        });
        expect(pending.action).toBe("pop");
        done();
      }
      testHistory.respondWith(router);
      testHistory.navigate("/two", "push"); // 1.0
      testHistory.navigate("/three", "push"); // 2.0
      testHistory.navigate("/four", "push"); // 3.0
      testHistory.navigate("/five", "push"); // 4.0
      testHistory.navigate("/six", "push"); // 5.0
      setup = true;
      testHistory.go(-2);
    });

    it("does nothing if there is no responseHandler", () => {
      const testHistory = InMemory({
        locations: ["/one", "/two"],
        index: 1
      });
      expect(() => {
        testHistory.go(-1);
      }).not.toThrow();
    });
  });

  describe("respondWith", () => {
    describe("cancel", () => {
      it("does not update InMemory history when cancel function is called", () => {
        const testHistory = InMemory();
        let setup = false;
        function initialRouter(pending) {
          pending.finish();
        }
        let cancelGo;
        const goRouter = ignoreFirstCall(function(pending) {
          expect(testHistory.location.pathname).toBe("/six");
          cancelGo = pending.cancel;
          // trigger a push call and don't resolve the go
          testHistory.respondWith(pushRouter);
          testHistory.navigate("/seven", "push");
        });
        const pushRouter = ignoreFirstCall(function(pending) {
          cancelGo("push");
        });

        testHistory.respondWith(initialRouter);
        testHistory.navigate("/two", "push"); // 1.0
        testHistory.navigate("/three", "push"); // 2.0
        testHistory.navigate("/four", "push"); // 3.0
        testHistory.navigate("/five", "push"); // 4.0
        testHistory.navigate("/six", "push"); // 5.0

        testHistory.respondWith(goRouter);
        testHistory.go(-2);

        expect(testHistory.location.pathname).toBe("/six");
      });
    });
  });
});
