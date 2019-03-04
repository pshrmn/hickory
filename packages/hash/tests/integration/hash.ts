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
      const pendingHistory = Hash();
      let calls = 0;
      const history = pendingHistory(pending => {
        let localHistory = history;
        switch (calls++) {
          case 0:
            pending.finish();
            localHistory.navigate("/eins", "push");
            break;
          case 1:
            pending.finish();
            localHistory.navigate("/zwei", "push");
            break;
          case 2:
            pending.finish();
            localHistory.navigate("/drei", "push");
            break;
          case 3:
            pending.finish();
            localHistory.go(-2);
            break;
          case 4:
            pending.finish();
            expect(pending.location.pathname).toEqual("/eins");

            localHistory.destroy();
            done();
        }
      });
      history.current();
    });
  });

  describe("browser navigation", () => {
    it("can detect navigation triggered by the browser", done => {
      const pendingHistory = Hash();
      let calls = 0;
      const history = pendingHistory(pending => {
        let localHistory = history;
        switch (calls++) {
          case 0:
            pending.finish();
            localHistory.navigate("/uno", "push");
            break;
          case 1:
            pending.finish();
            localHistory.navigate("/dos", "push");
            break;
          case 2:
            pending.finish();
            localHistory.navigate("/tres", "push");
            break;
          case 3:
            pending.finish();
            window.history.go(-2);
            break;
          case 4:
            pending.finish();
            expect(pending.location.pathname).toEqual("/uno");

            localHistory.destroy();
            done();
        }
      });
      history.current();
    });
  });
});
