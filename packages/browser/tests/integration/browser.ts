///<reference types="jasmine"/>
import { Browser } from "../../src";

describe("browser integration tests", () => {
  let testHistory;
  beforeEach(() => {
    // we cannot fully reset the history, but this can give us a blank state
    window.history.pushState(null, "", "/");
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

    /*     it("new URL uses rawPathname, not pathname", () => {
      testHistory = Browser(pending => {
        pending.finish();
      });
      testHistory.navigate({
        pathname: "/encoded-percent%25"
      });
      expect(window.location.pathname).toEqual("/encoded-percent%25");
      expect(testHistory.location.pathname).toEqual("/encoded-percent%");
    }); */

    describe("push navigation", () => {
      it("uses history.pushState", () => {
        console.log(
          "BEFORE PUSHING",
          (<jasmine.Spy>window.history.pushState).calls.count(),
          (<jasmine.Spy>window.history.replaceState).calls.count()
        );

        testHistory = Browser(pending => {
          pending.finish();
        });
        testHistory.navigate("/the-new-location", "push");

        console.log(
          "AFTER PUSHING",
          (<jasmine.Spy>window.history.pushState).calls.count(),
          (<jasmine.Spy>window.history.replaceState).calls.count()
        );

        expect(window.location.pathname).toEqual("/the-new-location");
        expect((<jasmine.Spy>window.history.pushState).calls.count()).toBe(1);
        expect((<jasmine.Spy>window.history.replaceState).calls.count()).toBe(
          0
        );
      });

      /*       it("sets the state", () => {
        testHistory = Browser(pending => {
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
      }); */
    });

    /*     describe("replace navigation", () => {
      it("uses history.replaceState", () => {
        testHistory = Browser(pending => {
          pending.finish();
        });
        testHistory.navigate("/the-same-location", "replace");
        expect(window.location.pathname).toEqual("/the-same-location");
        expect((<jasmine.Spy>window.history.pushState).calls.count()).toBe(0);
        expect((<jasmine.Spy>window.history.replaceState).calls.count()).toBe(
          1
        );
      });

      it("sets the state", () => {
        testHistory = Browser(pending => {
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
    }); */
  });

  /*   describe("go", () => {
    it("is detectable through a popstate listener", done => {
      let calls = 0;
      testHistory = Browser(pending => {
        let localHistory = testHistory;
        switch (calls++) {
          case 0:
            pending.finish();
            localHistory.navigate("/one", "push");
            break;
          case 1:
            pending.finish();
            localHistory.navigate("/two", "push");
            break;
          case 2:
            pending.finish();
            localHistory.navigate("/three", "push");
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
      testHistory = Browser(pending => {
        let localHistory = testHistory;
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
      testHistory.current();
    });
  }); */
});
