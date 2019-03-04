///<reference types="jasmine"/>
import { Hash } from "../../src";

describe("hash integration tests", () => {
  let testHistory;

  beforeEach(() => {
    // we cannot fully reset the history, but this can give us a blank state
    window.history.pushState(null, "", "/#/");
    const pendingHistory = Hash();
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
      testHistory.navigate(
        {
          pathname: "/encoded-percent%25"
        },
        "push"
      );
      expect(window.location.hash).toEqual("#/encoded-percent%25");
      expect(testHistory.location.pathname).toEqual("/encoded-percent%");
    });

    describe("push navigation", () => {
      it("uses history.pushState", () => {
        testHistory.navigate("/a-new-position", "push");
        expect(window.location.hash).toEqual("#/a-new-position");
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
        testHistory.navigate("/the-same-position", "replace");
        expect(window.location.hash).toEqual("#/the-same-position");
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
      window.history.pushState(null, "", "/#/");

      const pendingHistory = Hash();
      let setup = true;
      const history = pendingHistory(pending => {
        pending.finish();
        if (setup) {
          return;
        }
        expect(pending.location.pathname).toEqual("/eins");
        let localHistory = history;
        localHistory.destroy();
        done();
      });
      history.navigate("/eins", "push");
      history.navigate("/zwei", "push");
      history.navigate("/drei", "push");
      setup = false;

      history.go(-2);
    });
  });

  describe("browser navigation", () => {
    it("can detect navigation triggered by the browser", done => {
      testHistory.destroy();
      window.history.pushState(null, "", "/#/");

      const pendingHistory = Hash();
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
      setup = false;

      window.history.go(-2);
    });
  });
});
