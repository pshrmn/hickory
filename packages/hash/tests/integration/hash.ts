///<reference path="../../node_modules/@types/jasmine/index.d.ts"/>
import Hash from "../../src";

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

describe("hash integration tests", () => {
  let testHistory;

  beforeEach(() => {
    // we cannot fully reset the history, but this can give us a blank state
    window.history.pushState(null, "", "/#/");
    testHistory = Hash();
    function router(pending) {
      pending.finish();
    }
    testHistory.respondWith(router);
  });

  afterEach(() => {
    testHistory.destroy();
  });

  describe("update()", () => {
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
        testHistory.update("/the-new-location");
        expect(window.location.hash).toEqual("#/the-new-location");
      });

      it("sets the state", () => {
        const providedState = { isSet: true };
        testHistory.update({
          pathname: "/next",
          state: providedState
        });
        const { state, key } = testHistory.location;
        expect(window.history.state.state).toEqual(state);
        expect(window.history.state.key).toBe(key);
      });

      it("calls history.pushState when navigating to a new location", () => {
        testHistory.update("/new-location");
        expect((window.history.pushState as jasmine.Spy).calls.count()).toBe(1);
        expect((window.history.replaceState as jasmine.Spy).calls.count()).toBe(
          0
        );
      });

      it("calls history.replaceState when navigating to the same location", () => {
        testHistory.update("/");
        expect((window.history.pushState as jasmine.Spy).calls.count()).toBe(0);
        expect((window.history.replaceState as jasmine.Spy).calls.count()).toBe(
          1
        );
      });
    });
    describe("PUSH", () => {
      it("can navigate with push", () => {
        testHistory.update("/a-new-position", "PUSH");
        expect(window.location.hash).toEqual("#/a-new-position");
      });

      it("sets the state", () => {
        const providedState = { isSet: true };
        testHistory.update(
          {
            pathname: "/next",
            state: providedState
          },
          "PUSH"
        );
        const { state, key } = testHistory.location;
        expect(window.history.state.state).toEqual(state);
        expect(window.history.state.key).toBe(key);
      });

      it("pushes URL using rawPathname, not pathname", () => {
        testHistory.update(
          {
            pathname: "/encoded-percent%25"
          },
          "PUSH"
        );
        expect(window.location.hash).toEqual("#/encoded-percent%25");
        expect(testHistory.location.pathname).toEqual("/encoded-percent%");
      });
    });

    describe("REPLACE", () => {
      it("can navigate with replace", () => {
        testHistory.update("/the-same-position", "REPLACE");
        expect(window.location.hash).toEqual("#/the-same-position");
      });

      it("sets the state", () => {
        const providedState = { isSet: true };
        testHistory.update(
          {
            pathname: "/next",
            state: providedState
          },
          "REPLACE"
        );
        const { state, key } = testHistory.location;
        expect(window.history.state.state).toEqual(state);
        expect(window.history.state.key).toBe(key);
      });
    });
  });

  describe("go", () => {
    it("can navigate with go", done => {
      testHistory.update("/eins", "PUSH");
      testHistory.update("/zwei", "PUSH");
      testHistory.update("/drei", "PUSH");

      const goRouter = ignoreFirstCall(function(pending) {
        expect(pending.location.pathname).toEqual("/eins");
        done();
      });
      testHistory.respondWith(goRouter);

      testHistory.go(-2);
    });
  });

  describe("browser navigation", () => {
    it("can detect navigation triggered by the browser", done => {
      testHistory.update("/uno", "PUSH");
      testHistory.update("/dos", "PUSH");
      testHistory.update("/tres", "PUSH");

      const goRouter = ignoreFirstCall(function(pending) {
        expect(pending.location.pathname).toEqual("/uno");
        done();
      });
      testHistory.respondWith(goRouter);

      window.history.go(-2);
    });
  });
});
