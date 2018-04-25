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
describe("go", () => {
  describe("with no value", () => {
    it("does nothing if there is no responseHandler", () => {
      const testHistory = InMemory();
      expect(() => {
        testHistory.go();
      }).not.toThrow();
    });

    it('calls response handler with current location and "POP" action', done => {
      const testHistory = InMemory();
      const router = ignoreFirstCall(function(pending) {
        expect(pending.location).toMatchObject({
          pathname: "/"
        });
        expect(pending.action).toBe("POP");
        done();
      });
      testHistory.respondWith(router); // calls router
      testHistory.go();
    });

    it('sets history.action to "POP" when calling "finish"', done => {
      const testHistory = InMemory();
      expect(testHistory.action).toBe("PUSH");
      const router = ignoreFirstCall(function(pending) {
        pending.finish();
        expect(testHistory.action).toBe("POP");
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
        expect(pending.action).toBe("POP");
        done();
      }
      testHistory.respondWith(router);
      testHistory.update("/two", "PUSH"); // 1.0
      testHistory.update("/three", "PUSH"); // 2.0
      testHistory.update("/four", "PUSH"); // 3.0
      testHistory.update("/five", "PUSH"); // 4.0
      testHistory.update("/six", "PUSH"); // 5.0
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
          testHistory.update("/seven", "PUSH");
        });
        const pushRouter = ignoreFirstCall(function(pending) {
          cancelGo("PUSH");
        });

        testHistory.respondWith(initialRouter);
        testHistory.update("/two", "PUSH"); // 1.0
        testHistory.update("/three", "PUSH"); // 2.0
        testHistory.update("/four", "PUSH"); // 3.0
        testHistory.update("/five", "PUSH"); // 4.0
        testHistory.update("/six", "PUSH"); // 5.0

        testHistory.respondWith(goRouter);
        testHistory.go(-2);

        expect(testHistory.location.pathname).toBe("/six");
      });
    });
  });

  describe("with user confirmation", () => {
    it("calls response handler after the user confirms the navigation", done => {
      const testHistory = InMemory();
      let setup = false;
      const router = ignoreFirstCall(function(pending) {
        pending.finish();
        if (!setup) {
          return;
        }
        expect(testHistory.location).toMatchObject({
          pathname: "/",
          key: "0.0"
        });
        done();
      });
      const confirm = (info, confirm, prevent) => {
        confirm();
      };
      testHistory.confirmWith(confirm);
      testHistory.respondWith(router);

      testHistory.update("/two", "PUSH"); // 1.0
      testHistory.update("/three", "PUSH"); // 2.0
      setup = true;
      testHistory.go(-2);
    });

    it("does not call response handler when the user prevents the navigation", () => {
      const testHistory = InMemory();
      const confirm = (info, confirm, prevent) => {
        prevent();
      };
      function router(pending) {
        pending.finish();
      }
      testHistory.respondWith(router);

      testHistory.update("/two", "PUSH"); // 1.0
      testHistory.update("/three", "PUSH"); // 2.0
      // don't add function until we have setup the history
      testHistory.confirmWith(confirm);
      testHistory.go(-2);

      expect(testHistory.location).toMatchObject({
        pathname: "/three",
        key: "2.0"
      });
    });
  });
});
