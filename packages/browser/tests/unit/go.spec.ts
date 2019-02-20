import "jest";
import { Browser } from "../../src";
import { JSDOM } from "jsdom";

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
  let dom: JSDOM;
  let window;

  beforeEach(() => {
    dom = new JSDOM("", {
      url: "http://example.com/one"
    });
    window = global.window = dom.window;
    global.document = dom.window.document;
  });

  afterEach(() => {
    global.document = undefined;
  });

  it("calls window.history.go with provided value", () => {
    const realGo = window.history.go;
    const mockGo = (window.history.go = jest.fn());
    const testHistory = Browser();

    [undefined, 0, 1, -1].forEach((value, index) => {
      testHistory.go(value);
      expect(mockGo.mock.calls[index][0]).toBe(value);
    });
    window.history.go = realGo;
  });

  describe("respondWith", () => {
    describe("cancel", () => {
      it("undoes the pop if pushing before pending response finishes", done => {
        const testHistory = Browser();
        let setup = false;
        function initialRouter(pending) {
          pending.finish();
        }
        let cancelGo;
        const goRouter = ignoreFirstCall(function(pending) {
          // at this point, the browser has popped
          expect(window.location.pathname).toBe("/four");
          cancelGo = pending.cancel;
          // trigger a push call and don't resolve the go
          testHistory.respondWith(pushRouter);
          testHistory.navigate("/seven", "push");
        });
        const pushRouter = ignoreFirstCall(function(pending) {
          cancelGo("push");
          setTimeout(() => {
            expect(window.location.pathname).toBe("/six");
            done();
          }, 50);
        });

        testHistory.respondWith(initialRouter);
        testHistory.navigate("/two", "push"); // 1.0
        testHistory.navigate("/three", "push"); // 2.0
        testHistory.navigate("/four", "push"); // 3.0
        testHistory.navigate("/five", "push"); // 4.0
        testHistory.navigate("/six", "push"); // 5.0

        testHistory.respondWith(goRouter);
        testHistory.go(-2);
      });

      it("undoes the pop if replacing before pending response finishes", done => {
        const testHistory = Browser();
        let setup = false;
        function initialRouter(pending) {
          pending.finish();
        }
        let cancelGo;
        const goRouter = ignoreFirstCall(function(pending) {
          // at this point, the browser has popped
          expect(window.location.pathname).toBe("/four");
          cancelGo = pending.cancel;
          // trigger a push call and don't resolve the go
          testHistory.respondWith(replaceRouter);
          testHistory.navigate("/seven", "replace");
        });
        const replaceRouter = ignoreFirstCall(function(pending) {
          cancelGo("replace");
          setTimeout(() => {
            expect(window.location.pathname).toBe("/six");
            done();
          }, 50);
        });

        testHistory.respondWith(initialRouter);
        testHistory.navigate("/two", "push"); // 1.0
        testHistory.navigate("/three", "push"); // 2.0
        testHistory.navigate("/four", "push"); // 3.0
        testHistory.navigate("/five", "push"); // 4.0
        testHistory.navigate("/six", "push"); // 5.0

        testHistory.respondWith(goRouter);
        testHistory.go(-2);
      });

      it("does nothing if popping before pending response finishes", done => {
        const testHistory = Browser();
        let setup = false;
        function initialRouter(pending) {
          pending.finish();
        }
        let cancelGo;
        const goRouter = ignoreFirstCall(function(pending) {
          // at this point, the browser has popped
          expect(window.location.pathname).toBe("/four");
          cancelGo = pending.cancel;
          // trigger a push call and don't resolve the go
          testHistory.respondWith(popRouter);
          testHistory.go(-1);
        });
        const popRouter = ignoreFirstCall(function(pending) {
          cancelGo("pop");
          setTimeout(() => {
            expect(window.location.pathname).toBe("/three");
            done();
          }, 50);
        });

        testHistory.respondWith(initialRouter);
        testHistory.navigate("/two", "push"); // 1.0
        testHistory.navigate("/three", "push"); // 2.0
        testHistory.navigate("/four", "push"); // 3.0
        testHistory.navigate("/five", "push"); // 4.0
        testHistory.navigate("/six", "push"); // 5.0

        testHistory.respondWith(goRouter);
        testHistory.go(-2);
      });
    });
  });

  describe("with user confirmation", () => {
    it("calls response handler after the user confirms the navigation", done => {
      const testHistory = Browser();
      let setup = false;
      const router = ignoreFirstCall(function(pending) {
        pending.finish();
        if (!setup) {
          return;
        }
        expect(testHistory.location).toMatchObject({
          pathname: "/one",
          key: "0.0"
        });
        done();
      });
      const confirm = (info, confirm, prevent) => {
        confirm();
      };
      testHistory.confirmWith(confirm);
      testHistory.respondWith(router);

      testHistory.navigate("/two", "push"); // 1.0
      testHistory.navigate("/three", "push"); // 2.0
      setup = true;
      testHistory.go(-2);
    });

    it("does not call response handler when the user prevents the navigation", done => {
      const testHistory = Browser();
      const confirm = (info, confirm, prevent) => {
        prevent();
      };
      function router(pending) {
        pending.finish();
      }
      testHistory.respondWith(router);

      testHistory.navigate("/two", "push"); // 1.0
      testHistory.navigate("/three", "push"); // 2.0
      // don't add function until we have setup the history
      testHistory.confirmWith(confirm);
      testHistory.go(-2);

      // need to wait for window.history.go to emit a popstate event
      setTimeout(() => {
        expect(testHistory.location).toMatchObject({
          pathname: "/three",
          key: "2.0"
        });
        done();
      }, 50);
    });
  });
});
