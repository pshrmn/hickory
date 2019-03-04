///<reference types="jasmine"/>
import { Browser } from "../../src";

describe("browser integration tests", () => {
  let testHistory;

  beforeEach(() => {
    // we cannot fully reset the history, but this can give us a blank state
    window.history.pushState(null, "", "/");
    const pendingHistory = Browser();
    testHistory = pendingHistory(pending => {
      pending.finish();
    });
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
      testHistory.destroy();

      const pendingHistory = Browser();
      let setup = true;
      const history = pendingHistory(pending => {
        pending.finish();
        if (setup) {
          return;
        }
        expect(pending.location.pathname).toEqual("/one");
        let localHistory = history;
        localHistory.destroy();
        done();
      });
      history.navigate("/one", "push");
      history.navigate("/two", "push");
      history.navigate("/three", "push");
      setup = false;

      history.go(-2);
    });
  });

  describe("browser navigation", () => {
    it("can detect navigation triggered by the browser", done => {
      testHistory.destroy();

      const pendingHistory = Browser();
      let setup = true;
      const history = pendingHistory(pending => {
        pending.finish();
        if (setup) {
          return;
        }
        expect(pending.location.pathname).toEqual("/uno");
        let localHistory = history;
        localHistory.destroy();
        done();
      });
      history.navigate("/uno", "push");
      history.navigate("/dos", "push");
      history.navigate("/tres", "push");

      window.history.go(-2);
    });
  });
});
