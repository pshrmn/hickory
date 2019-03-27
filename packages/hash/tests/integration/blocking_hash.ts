///<reference types="jasmine"/>
import { blocking_hash } from "../../src";

describe("blocking_hash integration tests", () => {
  let test_history;

  beforeEach(() => {
    // we cannot fully reset the history, but this can give us a blank state
    window.history.pushState({ key: [0, 0] }, "", "/#/");
  });

  afterEach(() => {
    test_history.destroy();
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
      test_history = blocking_hash(pending => {
        pending.finish();
      });
      test_history.navigate(
        {
          pathname: "/encoded-percent%25"
        },
        "push"
      );
      expect(window.location.hash).toEqual("#/encoded-percent%25");
      expect(test_history.location.pathname).toEqual("/encoded-percent%25");
    });

    describe("push navigation", () => {
      it("uses history.pushState", () => {
        test_history = blocking_hash(pending => {
          pending.finish();
        });
        test_history.navigate("/a-new-position", "push");
        expect(window.location.hash).toEqual("#/a-new-position");
        expect((<jasmine.Spy>window.history.pushState).calls.count()).toBe(1);
        expect((<jasmine.Spy>window.history.replaceState).calls.count()).toBe(
          0
        );
      });

      it("sets the state", () => {
        test_history = blocking_hash(pending => {
          pending.finish();
        });
        const provided_state = { is_set: true };
        test_history.navigate(
          {
            pathname: "/next",
            state: provided_state
          },
          "push"
        );
        const { state, key } = test_history.location;
        expect(window.history.state.state).toEqual(state);
        expect(window.history.state.key).toEqual(key);
      });
    });

    describe("replace navigation", () => {
      it("uses history.replaceState", () => {
        test_history = blocking_hash(pending => {
          pending.finish();
        });
        test_history.navigate("/the-same-position", "replace");
        expect(window.location.hash).toEqual("#/the-same-position");
        expect((<jasmine.Spy>window.history.pushState).calls.count()).toBe(0);
        expect((<jasmine.Spy>window.history.replaceState).calls.count()).toBe(
          1
        );
      });

      it("sets the state", () => {
        test_history = blocking_hash(pending => {
          pending.finish();
        });
        const provided_state = { is_set: true };
        test_history.navigate(
          {
            pathname: "/next",
            state: provided_state
          },
          "replace"
        );
        const { state, key } = test_history.location;
        expect(window.history.state.state).toEqual(state);
        expect(window.history.state.key).toEqual(key);
      });
    });
  });

  describe("go", () => {
    it("is detectable through a popstate listener", done => {
      let calls = 0;
      test_history = blocking_hash(pending => {
        let local_history = test_history;
        switch (calls++) {
          case 0:
            pending.finish();
            local_history.navigate("/eins", "push");
            break;
          case 1:
            pending.finish();
            local_history.navigate("/zwei", "push");
            break;
          case 2:
            pending.finish();
            local_history.navigate("/drei", "push");
            break;
          case 3:
            pending.finish();
            local_history.go(-2);
            break;
          case 4:
            pending.finish();
            expect(pending.location.pathname).toEqual("/eins");

            local_history.destroy();
            done();
        }
      });
      test_history.current();
    });
  });

  describe("browser navigation", () => {
    it("can detect navigation triggered by the browser", done => {
      let calls = 0;
      test_history = blocking_hash(pending => {
        let local_history = test_history;
        switch (calls++) {
          case 0:
            pending.finish();
            local_history.navigate("/uno", "push");
            break;
          case 1:
            pending.finish();
            local_history.navigate("/dos", "push");
            break;
          case 2:
            pending.finish();
            local_history.navigate("/tres", "push");
            break;
          case 3:
            pending.finish();
            window.history.go(-2);
            break;
          case 4:
            pending.finish();
            expect(pending.location.pathname).toEqual("/uno");

            local_history.destroy();
            done();
        }
      });
      test_history.current();
    });
  });
});
