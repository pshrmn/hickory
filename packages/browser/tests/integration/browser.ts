///<reference types="jasmine"/>
import { Browser } from "../../src";

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
    beforeEach(() => {
      spyOn(window.history, "pushState").and.callThrough();
      spyOn(window.history, "replaceState").and.callThrough();
    });

    afterEach(() => {
      (<jasmine.Spy>window.history.pushState).calls.reset();
      (<jasmine.Spy>window.history.replaceState).calls.reset();
    });

    it("new URL uses rawPathname, not pathname", () => {
      testHistory.navigate({
        pathname: "/encoded-percent%25"
      });
      expect(window.location.pathname).toEqual("/encoded-percent%25");
      expect(testHistory.location.pathname).toEqual("/encoded-percent%");
    });

    describe("push navigation", () => {
      it("uses history.pushState", () => {
        testHistory.navigate("/the-new-location", "push");
        expect(window.location.pathname).toEqual("/the-new-location");
        expect((<jasmine.Spy>window.history.pushState).calls.count()).toBe(1);
        expect((<jasmine.Spy>window.history.replaceState).calls.count()).toBe(
          0
        );
      });

      it("sets the state", () => {
        const providedState = { isSet: true };
        testHistory.navigate(
          {
            pathname: "/next",
            state: providedState
          },
          "push"
        );
        const { state, key } = testHistory.location;
        expect(window.history.state.state).toEqual(state);
        expect(window.history.state.key).toBe(key);
      });
    });

    describe("replace navigation", () => {
      it("uses history.replaceState", () => {
        testHistory.navigate("/the-same-location", "replace");
        expect(window.location.pathname).toEqual("/the-same-location");
        expect((<jasmine.Spy>window.history.pushState).calls.count()).toBe(0);
        expect((<jasmine.Spy>window.history.replaceState).calls.count()).toBe(
          1
        );
      });

      it("sets the state", () => {
        const providedState = { isSet: true };
        testHistory.navigate(
          {
            pathname: "/next",
            state: providedState
          },
          "replace"
        );
        const { state, key } = testHistory.location;
        expect(window.history.state.state).toEqual(state);
        expect(window.history.state.key).toBe(key);
      });
    });
  });

  describe("go", () => {
    it("is detectable through a popstate listener", done => {
      testHistory.navigate("/one", "push");
      testHistory.navigate("/two", "push");
      testHistory.navigate("/three", "push");

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
      testHistory.navigate("/uno", "push");
      testHistory.navigate("/dos", "push");
      testHistory.navigate("/tres", "push");

      const goRouter = ignoreFirstCall(function(pending) {
        expect(pending.location.pathname).toEqual("/uno");
        done();
      });
      testHistory.respondWith(goRouter);

      window.history.go(-2);
    });
  });
});
