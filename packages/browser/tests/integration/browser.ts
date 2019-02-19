///<reference types="jasmine"/>
import { Browser, PUSH, REPLACE } from "../../src";

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

describe("browser integration tests", () => {
  let testHistory;

  beforeEach(() => {
    // we cannot fully reset the history, but this can give us a blank state
    window.history.pushState(null, "", "/");
    testHistory = Browser();
    function router(pending) {
      pending.finish();
    }
    testHistory.respondWith(router);
  });

  afterEach(() => {
    testHistory.destroy();
  });

  describe("navigate()", () => {
    describe("ANCHOR (default)", () => {
      beforeEach(() => {
        spyOn(window.history, "pushState").and.callThrough();
        spyOn(window.history, "replaceState").and.callThrough();
      });

      afterEach(() => {
        (window.history.pushState as jasmine.Spy).calls.reset();
        (window.history.replaceState as jasmine.Spy).calls.reset();
      });

      it("can navigate with navigate", () => {
        testHistory.navigate("/the-new-location");
        expect(window.location.pathname).toEqual("/the-new-location");
      });

      it("sets the state", () => {
        const providedState = { isSet: true };
        testHistory.navigate({
          pathname: "/next",
          state: providedState
        });
        const { state, key } = testHistory.location;
        expect(window.history.state.state).toEqual(state);
        expect(window.history.state.key).toBe(key);
      });

      it("calls history.pushState when navigating to a new location", () => {
        testHistory.navigate("/new-location");
        expect((window.history.pushState as jasmine.Spy).calls.count()).toBe(1);
        expect((window.history.replaceState as jasmine.Spy).calls.count()).toBe(
          0
        );
      });

      it("calls history.replaceState when navigating to the same location", () => {
        testHistory.navigate("/");
        expect((window.history.pushState as jasmine.Spy).calls.count()).toBe(0);
        expect((window.history.replaceState as jasmine.Spy).calls.count()).toBe(
          1
        );
      });
    });

    describe(PUSH, () => {
      it("can navigate with push", () => {
        testHistory.navigate("/the-new-location", PUSH);
        expect(window.location.pathname).toEqual("/the-new-location");
      });

      it("sets the state", () => {
        const providedState = { isSet: true };
        testHistory.navigate(
          {
            pathname: "/next",
            state: providedState
          },
          PUSH
        );
        const { state, key } = testHistory.location;
        expect(window.history.state.state).toEqual(state);
        expect(window.history.state.key).toBe(key);
      });

      it("pushes URL using rawPathname, not pathname", () => {
        testHistory.navigate(
          {
            pathname: "/encoded-percent%25"
          },
          PUSH
        );
        expect(window.location.pathname).toEqual("/encoded-percent%25");
        expect(testHistory.location.pathname).toEqual("/encoded-percent%");
      });
    });

    describe(REPLACE, () => {
      it("can navigate with replace", () => {
        testHistory.navigate("/the-same-location", REPLACE);
        expect(window.location.pathname).toEqual("/the-same-location");
      });

      it("sets the state", () => {
        const providedState = { isSet: true };
        testHistory.navigate(
          {
            pathname: "/next",
            state: providedState
          },
          REPLACE
        );
        const { state, key } = testHistory.location;
        expect(window.history.state.state).toEqual(state);
        expect(window.history.state.key).toBe(key);
      });
    });
  });

  describe("go", () => {
    it("can navigate with go", done => {
      testHistory.navigate("/one", PUSH);
      testHistory.navigate("/two", PUSH);
      testHistory.navigate("/three", PUSH);

      const goRouter = ignoreFirstCall(function(pending) {
        expect(pending.location.pathname).toEqual("/one");
        done();
      });
      testHistory.respondWith(goRouter);
      testHistory.go(-2);
    });
  });

  describe("browser navigation", () => {
    it("can detect navigation triggered by the browser", done => {
      testHistory.navigate("/uno", PUSH);
      testHistory.navigate("/dos", PUSH);
      testHistory.navigate("/tres", PUSH);

      const goRouter = ignoreFirstCall(function(pending) {
        expect(pending.location.pathname).toEqual("/uno");
        done();
      });
      testHistory.respondWith(goRouter);

      window.history.go(-2);
    });
  });
});
