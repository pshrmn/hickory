///<reference types="jasmine"/>
import { hash } from "../../src/hash";

describe("hash integration tests", () => {
  let testHistory;

  beforeEach(() => {
    // we cannot fully reset the history, but this can give us a blank state
    window.history.pushState({ key: [0, 0] }, "", "/#/");
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
      testHistory = hash(pending => {
        pending.finish();
      });
      testHistory.navigate(
        {
          pathname: "/encoded-percent%25"
        },
        "push"
      );
      expect(window.location.hash).toEqual("#/encoded-percent%25");
      expect(testHistory.location.pathname).toEqual("/encoded-percent%25");
    });

    describe("push navigation", () => {
      it("uses history.pushState", () => {
        testHistory = hash(pending => {
          pending.finish();
        });
        testHistory.navigate({ url: "/a-new-position" }, "push");
        expect(window.location.hash).toEqual("#/a-new-position");
        expect((<jasmine.Spy>window.history.pushState).calls.count()).toBe(1);
        expect((<jasmine.Spy>window.history.replaceState).calls.count()).toBe(
          0
        );
      });

      it("sets the state", () => {
        testHistory = hash(pending => {
          pending.finish();
        });
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
        expect(window.history.state.key).toEqual(key);
      });
    });

    describe("replace navigation", () => {
      it("uses history.replaceState", () => {
        testHistory = hash(pending => {
          pending.finish();
        });
        testHistory.navigate({ url: "/the-same-position" }, "replace");
        expect(window.location.hash).toEqual("#/the-same-position");
        expect((<jasmine.Spy>window.history.pushState).calls.count()).toBe(0);
        expect((<jasmine.Spy>window.history.replaceState).calls.count()).toBe(
          1
        );
      });

      it("sets the state", () => {
        testHistory = hash(pending => {
          pending.finish();
        });
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
        expect(window.history.state.key).toEqual(key);
      });
    });
  });

  describe("go", () => {
    it("is detectable through a popstate listener", done => {
      let calls = 0;
      testHistory = hash(pending => {
        let localHistory = testHistory;
        switch (calls++) {
          case 0:
            pending.finish();
            localHistory.navigate({ url: "/eins" }, "push");
            break;
          case 1:
            pending.finish();
            localHistory.navigate({ url: "/zwei" }, "push");
            break;
          case 2:
            pending.finish();
            localHistory.navigate({ url: "/drei" }, "push");
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
      testHistory.current();
    });
  });

  describe("browser navigation", () => {
    it("can detect navigation triggered by the browser", done => {
      let calls = 0;
      testHistory = hash(pending => {
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
