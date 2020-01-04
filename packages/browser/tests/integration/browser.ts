///<reference types="jasmine"/>
import { browser } from "../../src/browser";

describe("browser integration tests", () => {
  let testHistory;
  beforeEach(() => {
    // we cannot fully reset the history, but this can give us a blank state
    window.history.pushState({ key: [0, 0] }, "", "/");
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

    it("new URL is encoded", () => {
      testHistory = browser(pending => {
        pending.finish();
      });
      testHistory.navigate({
        url: "/encoded-percent%25"
      });
      expect(window.location.pathname).toEqual("/encoded-percent%25");
      expect(testHistory.location.pathname).toEqual("/encoded-percent%25");
    });

    describe("push navigation", () => {
      it("uses history.pushState", () => {
        testHistory = browser(pending => {
          pending.finish();
        });
        testHistory.navigate({ url: "/the-new-location" }, "push");

        expect(window.location.pathname).toEqual("/the-new-location");
        expect((<jasmine.Spy>window.history.pushState).calls.count()).toBe(1);
        expect((<jasmine.Spy>window.history.replaceState).calls.count()).toBe(
          0
        );
      });

      it("sets the state", () => {
        testHistory = browser(pending => {
          pending.finish();
        });
        let providedState = { isSet: true };
        testHistory.navigate(
          {
            url: "/next",
            state: providedState
          },
          "push"
        );
        let { state, key } = testHistory.location;
        expect(window.history.state.state).toEqual(state);
        expect(window.history.state.key).toEqual(key);
      });
    });

    describe("replace navigation", () => {
      it("uses history.replaceState", () => {
        testHistory = browser(pending => {
          pending.finish();
        });
        testHistory.navigate({ url: "/the-same-location" }, "replace");
        expect(window.location.pathname).toEqual("/the-same-location");
        expect((<jasmine.Spy>window.history.pushState).calls.count()).toBe(0);
        expect((<jasmine.Spy>window.history.replaceState).calls.count()).toBe(
          1
        );
      });

      it("sets the state", () => {
        testHistory = browser(pending => {
          pending.finish();
        });
        let providedState = { isSet: true };
        testHistory.navigate(
          {
            url: "/next",
            state: providedState
          },
          "replace"
        );
        let { state, key } = testHistory.location;
        expect(window.history.state.state).toEqual(state);
        expect(window.history.state.key).toEqual(key);
      });
    });
  });

  describe("go", () => {
    it("is detectable through a popstate listener", done => {
      let calls = 0;
      testHistory = browser(pending => {
        let localHistory = testHistory;
        switch (calls++) {
          case 0:
            pending.finish();
            localHistory.navigate({ url: "/one" }, "push");
            break;
          case 1:
            pending.finish();
            localHistory.navigate({ url: "/two" }, "push");
            break;
          case 2:
            pending.finish();
            localHistory.navigate({ url: "/three" }, "push");
            break;
          case 3:
            pending.finish();
            localHistory.go(-2);
            break;
          case 4:
            pending.finish();
            expect(pending.location.pathname).toEqual("/one");

            localHistory.destroy();
            done();
        }
      });
      testHistory.current();
    });
  });

  describe("browser navigation", () => {
    it("can detect navigation triggered by the browser", done => {
      let calls = 0;
      testHistory = browser(pending => {
        let localHistory = testHistory;
        switch (calls++) {
          case 0:
            pending.finish();
            localHistory.navigate({ url: "/uno" }, "push");
            break;
          case 1:
            pending.finish();
            localHistory.navigate({ url: "/dos" }, "push");
            break;
          case 2:
            pending.finish();
            localHistory.navigate({ url: "/tres" }, "push");
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
      testHistory.current();
    });
  });
});
