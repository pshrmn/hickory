import "jest";
import { Hash, POP, PUSH, REPLACE } from "../../src";
import { jsdom } from "jsdom";

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
  let dom;
  let window;

  beforeEach(() => {
    dom = jsdom("", {
      url: "http://example.com/#/one"
    });
    window = global.window = dom.defaultView;
    global.document = dom;
  });

  afterEach(() => {
    dom.close();
    global.document = undefined;
  });

  it("calls window.history.go with provided value", () => {
    const realGo = window.history.go;
    const mockGo = (window.history.go = jest.fn());
    const testHistory = Hash();

    [undefined, 0, 1, -1].forEach((value, index) => {
      testHistory.go(value);
      expect(mockGo.mock.calls[index][0]).toBe(value);
    });
    window.history.go = realGo;
  });

  it("calls response handler with expected location and action", done => {
    const testHistory = Hash();
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
      expect(pending.action).toBe(POP);
      done();
    }
    testHistory.respondWith(router);
    testHistory.navigate("/two", PUSH); // 1.0
    testHistory.navigate("/three", PUSH); // 2.0
    testHistory.navigate("/four", PUSH); // 3.0
    testHistory.navigate("/five", PUSH); // 4.0
    testHistory.navigate("/six", PUSH); // 5.0
    setup = true;
    testHistory.go(-2);
  });

  describe("respondWith", () => {
    describe("cancel", () => {
      it("undoes the pop if pushing before pending response finishes", done => {
        const testHistory = Hash();
        let setup = false;
        function initialRouter(pending) {
          pending.finish();
        }
        let cancelGo;
        const goRouter = ignoreFirstCall(function(pending) {
          // at this point, the Hash has popped
          expect(window.location.hash).toBe("#/four");
          cancelGo = pending.cancel;
          // trigger a push call and don't resolve the go
          testHistory.respondWith(pushRouter);
          testHistory.navigate("/seven", PUSH);
        });
        const pushRouter = ignoreFirstCall(function(pending) {
          cancelGo(PUSH);
          setTimeout(() => {
            expect(window.location.hash).toBe("#/six");
            done();
          }, 50);
        });

        testHistory.respondWith(initialRouter);
        testHistory.navigate("/two", PUSH); // 1.0
        testHistory.navigate("/three", PUSH); // 2.0
        testHistory.navigate("/four", PUSH); // 3.0
        testHistory.navigate("/five", PUSH); // 4.0
        testHistory.navigate("/six", PUSH); // 5.0

        testHistory.respondWith(goRouter);
        testHistory.go(-2);
      });

      it("undoes the pop if replacing before pending response finishes", done => {
        const testHistory = Hash();
        let setup = false;
        function initialRouter(pending) {
          pending.finish();
        }
        let cancelGo;
        const goRouter = ignoreFirstCall(function(pending) {
          // at this point, the Hash has popped
          expect(window.location.hash).toBe("#/four");
          cancelGo = pending.cancel;
          // trigger a push call and don't resolve the go
          testHistory.respondWith(replaceRouter);
          testHistory.navigate("/seven", REPLACE);
        });
        const replaceRouter = ignoreFirstCall(function(pending) {
          cancelGo(REPLACE);
          setTimeout(() => {
            expect(window.location.hash).toBe("#/six");
            done();
          }, 50);
        });

        testHistory.respondWith(initialRouter);
        testHistory.navigate("/two", PUSH); // 1.0
        testHistory.navigate("/three", PUSH); // 2.0
        testHistory.navigate("/four", PUSH); // 3.0
        testHistory.navigate("/five", PUSH); // 4.0
        testHistory.navigate("/six", PUSH); // 5.0

        testHistory.respondWith(goRouter);
        testHistory.go(-2);
      });

      it("does nothing if popping before pending response finishes", done => {
        const testHistory = Hash();
        let setup = false;
        function initialRouter(pending) {
          pending.finish();
        }
        let cancelGo;
        const goRouter = ignoreFirstCall(function(pending) {
          // at this point, the Hash has popped
          expect(window.location.hash).toBe("#/four");
          cancelGo = pending.cancel;
          // trigger a push call and don't resolve the go
          testHistory.respondWith(popRouter);
          testHistory.go(-1);
        });
        const popRouter = ignoreFirstCall(function(pending) {
          cancelGo(POP);
          setTimeout(() => {
            expect(window.location.hash).toBe("#/three");
            done();
          }, 50);
        });

        testHistory.respondWith(initialRouter);
        testHistory.navigate("/two", PUSH); // 1.0
        testHistory.navigate("/three", PUSH); // 2.0
        testHistory.navigate("/four", PUSH); // 3.0
        testHistory.navigate("/five", PUSH); // 4.0
        testHistory.navigate("/six", PUSH); // 5.0

        testHistory.respondWith(goRouter);
        testHistory.go(-2);
      });
    });
  });

  describe("with user confirmation", () => {
    it("calls response handler after the user confirms the navigation", done => {
      const testHistory = Hash();
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

      testHistory.navigate("/two", PUSH); // 1.0
      testHistory.navigate("/three", PUSH); // 2.0
      setup = true;
      testHistory.go(-2);
    });

    it("does not call response handler when the user prevents the navigation", done => {
      const testHistory = Hash();
      const confirm = (info, confirm, prevent) => {
        prevent();
      };
      function router(pending) {
        pending.finish();
      }
      testHistory.respondWith(router);

      testHistory.navigate("/two", PUSH); // 1.0
      testHistory.navigate("/three", PUSH); // 2.0
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
