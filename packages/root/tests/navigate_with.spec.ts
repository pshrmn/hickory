import "jest";
import { navigate_with, location_utils, key_generator } from "../src";

import { PendingNavigation, SessionLocation } from "@hickory/root";

const initial_location: SessionLocation = {
  pathname: "/",
  hash: "",
  query: "",
  key: [0, 0]
};

const location_one: SessionLocation = {
  pathname: "/one",
  hash: "",
  query: "",
  key: [1, 0]
};

const location_two: SessionLocation = {
  pathname: "/two",
  hash: "",
  query: "",
  key: [2, 0]
};

function history_helpers(initial: SessionLocation) {
  const current = jest.fn(() => {
    return initial;
  });

  let finish_push_mock;
  const finish_push = jest.fn((l: SessionLocation) => {
    finish_push_mock = jest.fn();
    return finish_push_mock;
  });

  let finish_replace_mock;
  const finish_replace = jest.fn((l: SessionLocation) => {
    finish_replace_mock = jest.fn();
    return finish_replace_mock;
  });

  return {
    current,
    push: {
      finish: finish_push,
      cancel: () => {}
    },
    replace: {
      finish: finish_replace,
      cancel: () => {}
    },
    finish_mock(name: "push" | "replace") {
      return name === "push" ? finish_push_mock : finish_replace_mock;
    }
  };
}

describe("navigate_with", () => {
  describe("prepare", () => {
    describe("anchor", () => {
      describe("new location", () => {
        const utils = location_utils();
        const keygen = key_generator();

        const { finish_mock, ...rest } = history_helpers(initial_location);
        const { prepare, emit_navigation } = navigate_with({
          response_handler: pending => {
            pending.finish();
          },
          utils,
          keygen,
          ...rest
        });

        const nav = prepare("/next", "anchor");

        it("returns a push navigation object", () => {
          expect(nav.location).toMatchObject({
            pathname: "/next",
            key: [1, 0]
          });
          expect(nav.action).toBe("push");

          expect(rest.push.finish.mock.calls.length).toBe(1);
          expect(rest.replace.finish.mock.calls.length).toBe(0);
        });

        it("finishing navigation calls function returned by push.finish", () => {
          const finished = finish_mock("push");
          expect(finished.mock.calls.length).toBe(0);
          emit_navigation(nav);
          expect(finished.mock.calls.length).toBe(1);
        });
      });

      describe("same location", () => {
        const utils = location_utils();
        const keygen = key_generator();
        const { finish_mock, ...rest } = history_helpers(initial_location);
        const { prepare, emit_navigation } = navigate_with({
          response_handler: pending => {
            pending.finish();
          },
          utils,
          keygen,
          ...rest
        });

        const nav = prepare("/", "anchor");

        it("returns a replace navigation object", () => {
          expect(nav.location).toMatchObject({
            pathname: "/",
            key: [0, 1]
          });
          expect(nav.action).toBe("replace");
          expect(rest.push.finish.mock.calls.length).toBe(0);
          expect(rest.replace.finish.mock.calls.length).toBe(1);
        });

        it("finishing navigation calls the function returned by replace.finish", () => {
          const finished = finish_mock("replace");
          expect(finished.mock.calls.length).toBe(0);
          emit_navigation(nav);
          expect(finished.mock.calls.length).toBe(1);
        });
      });
    });

    describe("push", () => {
      describe("new location", () => {
        const utils = location_utils();
        const keygen = key_generator();
        const { finish_mock, ...rest } = history_helpers(initial_location);
        const { prepare, emit_navigation } = navigate_with({
          response_handler: pending => {
            pending.finish();
          },
          utils,
          keygen,
          ...rest
        });
        const nav = prepare("/next", "push");

        it("returns a push navigation object", () => {
          expect(nav.location).toMatchObject({
            pathname: "/next",
            key: [1, 0]
          });
          expect(nav.action).toBe("push");

          expect(rest.push.finish.mock.calls.length).toBe(1);
          expect(rest.replace.finish.mock.calls.length).toBe(0);
        });

        it("finishing navigation calls the function returned by push.finish", () => {
          const finished = finish_mock("push");
          expect(finished.mock.calls.length).toBe(0);
          emit_navigation(nav);
          expect(finished.mock.calls.length).toBe(1);
        });
      });
    });

    describe("replace", () => {
      describe("new location", () => {
        const utils = location_utils();
        const keygen = key_generator();
        const { finish_mock, ...rest } = history_helpers(initial_location);
        const { prepare, emit_navigation } = navigate_with({
          response_handler: pending => {
            pending.finish();
          },
          utils,
          keygen,
          ...rest
        });

        const nav = prepare("/next", "replace");

        it("returns a replace navigation object", () => {
          expect(nav.location).toMatchObject({
            pathname: "/next",
            key: [0, 1]
          });
          expect(nav.action).toBe("replace");
          expect(rest.push.finish.mock.calls.length).toBe(0);
          expect(rest.replace.finish.mock.calls.length).toBe(1);
        });

        it("finishing navigation calls the function returned by replace.finish", () => {
          const finished = finish_mock("replace");
          expect(finished.mock.calls.length).toBe(0);
          emit_navigation(nav);
          expect(finished.mock.calls.length).toBe(1);
        });
      });
    });

    describe("[invalid]", () => {
      it("throws", () => {
        const utils = location_utils();
        const keygen = key_generator();
        const { finish_mock, ...rest } = history_helpers(initial_location);
        const handler = jest.fn();
        const { prepare } = navigate_with({
          response_handler: handler,
          utils,
          keygen,
          ...rest
        });

        expect(() => {
          // @ts-ignore
          const nav = prepare("/next", "test");
        }).toThrow();
      });
    });
  });

  describe("create_navigation", () => {
    it("returns a navigation object", () => {
      const utils = location_utils();
      const keygen = key_generator();
      const { finish_mock, ...rest } = history_helpers(initial_location);
      const handler = jest.fn();
      const { create_navigation } = navigate_with({
        response_handler: handler,
        utils,
        keygen,
        ...rest
      });
      const nav = create_navigation(location_one, "push", () => {}, () => {});
      expect(nav.location).toBe(location_one);
      expect(nav.action).toBe("push");
      expect(nav.cancelled).toBe(false);
      expect(typeof nav.finish).toBe("function");
      expect(typeof nav.cancel).toBe("function");
    });
  });

  describe("emit_navigation", () => {
    it("calls response handler", () => {
      const utils = location_utils();
      const keygen = key_generator();
      const { finish_mock, ...rest } = history_helpers(initial_location);
      const handler = jest.fn();
      const { emit_navigation, prepare } = navigate_with({
        response_handler: handler,
        utils,
        keygen,
        ...rest
      });
      emit_navigation({} as PendingNavigation);
      expect(handler.mock.calls.length).toBe(1);
    });
  });

  describe("cancel_pending", () => {
    it("calls the pending navigation's cancel method with action", () => {
      const finish = jest.fn();
      const cancel = jest.fn();

      const utils = location_utils();
      const keygen = key_generator();
      const { finish_mock, ...rest } = history_helpers(initial_location);
      const {
        emit_navigation,
        cancel_pending,
        create_navigation
      } = navigate_with({
        response_handler: pending => {
          cancel_pending("pop");
          expect(cancel.mock.calls.length).toBe(1);
        },
        utils,
        keygen,
        ...rest
      });

      const navigation = create_navigation(
        location_one,
        "push",
        finish,
        cancel
      );
      emit_navigation(navigation);
    });
  });

  describe("calling navigation.finish", () => {
    it("does nothing if not the current pending", () => {
      const finish_one = jest.fn();
      const finish_two = jest.fn();
      const cancel_one = jest.fn();
      const cancel_two = jest.fn();
      let calls = 0;

      let original_pending;

      const utils = location_utils();
      const keygen = key_generator();
      const { finish_mock, ...rest } = history_helpers(initial_location);
      const { emit_navigation, create_navigation } = navigate_with({
        response_handler: pending => {
          switch (calls++) {
            case 0:
              original_pending = pending;
              break;
            case 1:
              pending.finish();
              expect(finish_two.mock.calls.length).toBe(1);
              original_pending.finish();
              expect(finish_one.mock.calls.length).toBe(0);
          }
        },
        utils,
        keygen,
        ...rest
      });

      const navigation_one = create_navigation(
        location_one,
        "push",
        finish_one,
        cancel_one
      );
      const navigation_two = create_navigation(
        location_two,
        "push",
        finish_two,
        cancel_two
      );

      emit_navigation(navigation_one);
      emit_navigation(navigation_two);
    });

    it("does nothing if already called", () => {
      const finish_one = jest.fn();
      const cancel_one = jest.fn();

      const utils = location_utils();
      const keygen = key_generator();
      const { finish_mock, ...rest } = history_helpers(initial_location);
      const { emit_navigation, create_navigation } = navigate_with({
        response_handler: pending => {
          pending.finish();
          expect(finish_one.mock.calls.length).toBe(1);
          pending.finish();
          expect(finish_one.mock.calls.length).toBe(1);
        },
        utils,
        keygen,
        ...rest
      });

      const navigation = create_navigation(
        location_one,
        "push",
        finish_one,
        cancel_one
      );
      emit_navigation(navigation);
    });

    it("does nothing if already cancelled", () => {
      const finish_one = jest.fn();
      const cancel_one = jest.fn();

      const utils = location_utils();
      const keygen = key_generator();
      const { finish_mock, ...rest } = history_helpers(initial_location);
      const { emit_navigation, create_navigation } = navigate_with({
        response_handler: pending => {
          pending.cancel();
          expect(finish_one.mock.calls.length).toBe(0);
          pending.finish();
          expect(finish_one.mock.calls.length).toBe(0);
        },
        utils,
        keygen,
        ...rest
      });

      const navigation = create_navigation(
        location_one,
        "push",
        finish_one,
        cancel_one
      );
      emit_navigation(navigation);
    });
  });

  describe("calling navigation.cancel", () => {
    it("does nothing if not the current pending", () => {
      const finish_one = jest.fn();
      const finish_two = jest.fn();
      const cancel_one = jest.fn();
      const cancel_two = jest.fn();
      let calls = 0;

      let original_pending;

      const utils = location_utils();
      const keygen = key_generator();
      const { finish_mock, ...rest } = history_helpers(initial_location);
      const { emit_navigation, create_navigation } = navigate_with({
        response_handler: pending => {
          switch (calls++) {
            case 0:
              original_pending = pending;
              break;
            case 1:
              pending.finish();
              expect(finish_two.mock.calls.length).toBe(1);
              original_pending.cancel();
              expect(cancel_one.mock.calls.length).toBe(0);
          }
        },
        utils,
        keygen,
        ...rest
      });

      const navigation_one = create_navigation(
        location_one,
        "push",
        finish_one,
        cancel_one
      );
      const navigation_two = create_navigation(
        location_two,
        "push",
        finish_two,
        cancel_two
      );

      emit_navigation(navigation_one);
      emit_navigation(navigation_two);
    });

    it("does nothing if already called", () => {
      const finish_one = jest.fn();
      const cancel_one = jest.fn();

      const utils = location_utils();
      const keygen = key_generator();
      const { finish_mock, ...rest } = history_helpers(initial_location);
      const { emit_navigation, create_navigation } = navigate_with({
        response_handler: pending => {
          pending.cancel();
          expect(cancel_one.mock.calls.length).toBe(1);
          pending.cancel();
          expect(cancel_one.mock.calls.length).toBe(1);
        },
        utils,
        keygen,
        ...rest
      });

      const navigation = create_navigation(
        location_one,
        "push",
        finish_one,
        cancel_one
      );
      emit_navigation(navigation);
    });

    it("does nothing if already cancelled", () => {
      const finish_one = jest.fn();
      const cancel_one = jest.fn();

      const utils = location_utils();
      const keygen = key_generator();
      const { finish_mock, ...rest } = history_helpers(initial_location);
      const { emit_navigation, create_navigation } = navigate_with({
        response_handler: pending => {
          pending.cancel();
          expect(cancel_one.mock.calls.length).toBe(1);
          pending.cancel();
          expect(cancel_one.mock.calls.length).toBe(1);
        },
        utils,
        keygen,
        ...rest
      });

      const navigation = create_navigation(
        location_one,
        "push",
        finish_one,
        cancel_one
      );
      emit_navigation(navigation);
    });
  });
});
