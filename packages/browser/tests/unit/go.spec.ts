import "jest";
import { Browser } from "../../src";

import { withDOM, asyncWithDOM } from "../../../../tests/utils/dom";

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
  it("calls window.history.go with provided value", () => {
    withDOM({ url: "http://example.com/one" }, ({ window }) => {
      const realGo = window.history.go;
      const mockGo = (window.history.go = jest.fn());
      const testHistory = Browser();

      [undefined, 0, 1, -1].forEach((value, index) => {
        testHistory.go(value);
        expect(mockGo.mock.calls[index][0]).toBe(value);
      });
    });
  });

  describe("respondWith", () => {
    describe("cancel", () => {
      it("undoes the pop if pushing before pending response finishes", async () => {
        await asyncWithDOM(
          { url: "http://example.com/one" },
          ({ window, resolve }) => {
            const testHistory = Browser();
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
                resolve();
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
          }
        );
      });

      it("undoes the pop if replacing before pending response finishes", async () => {
        await asyncWithDOM(
          { url: "http://example.com/one" },
          ({ window, resolve }) => {
            const testHistory = Browser();
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
                resolve();
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
          }
        );
      });

      it("does nothing if popping before pending response finishes", async () => {
        await asyncWithDOM(
          { url: "http://example.com/one" },
          ({ window, resolve }) => {
            const testHistory = Browser();
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
                resolve();
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
          }
        );
      });
    });
  });
});
