import "jest";
import { Hash } from "../../src";

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
    withDOM({ url: "http://example.com/#/one" }, ({ window }) => {
      const realGo = window.history.go;
      const mockGo = (window.history.go = jest.fn());
      const testHistory = Hash();

      [undefined, 0, 1, -1].forEach((value, index) => {
        testHistory.go(value);
        expect(mockGo.mock.calls[index][0]).toBe(value);
      });
    });
  });

  it("calls response handler with expected location and action", async () => {
    await asyncWithDOM(
      { url: "http://example.com/#/one" },
      ({ window, resolve }) => {
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
          expect(pending.action).toBe("pop");
          resolve();
        }
        testHistory.respondWith(router);
        testHistory.navigate("/two", "push"); // 1.0
        testHistory.navigate("/three", "push"); // 2.0
        testHistory.navigate("/four", "push"); // 3.0
        testHistory.navigate("/five", "push"); // 4.0
        testHistory.navigate("/six", "push"); // 5.0
        setup = true;
        testHistory.go(-2);
      }
    );
  });

  describe("respondWith", () => {
    describe("cancel", () => {
      it("undoes the pop if pushing before pending response finishes", async () => {
        await asyncWithDOM(
          { url: "http://example.com/#/one" },
          ({ window, resolve }) => {
            const testHistory = Hash();
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
              testHistory.navigate("/seven", "push");
            });
            const pushRouter = ignoreFirstCall(function(pending) {
              cancelGo("push");
              setTimeout(() => {
                expect(window.location.hash).toBe("#/six");
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
          { url: "http://example.com/#/one" },
          ({ window, resolve }) => {
            const testHistory = Hash();
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
              testHistory.navigate("/seven", "replace");
            });
            const replaceRouter = ignoreFirstCall(function(pending) {
              cancelGo("replace");
              setTimeout(() => {
                expect(window.location.hash).toBe("#/six");
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
          { url: "http://example.com/#/one" },
          ({ window, resolve }) => {
            const testHistory = Hash();
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
              cancelGo("pop");
              setTimeout(() => {
                expect(window.location.hash).toBe("#/three");
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
