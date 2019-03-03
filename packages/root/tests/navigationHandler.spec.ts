import "jest";
import { navigateWith, locationUtils, keyGenerator } from "../src";

import {
  PendingNavigation,
  SessionLocation,
  NavigateArgs
} from "@hickory/root";

const initialLocation: SessionLocation = {
  pathname: "/",
  hash: "",
  query: "",
  key: "0.0",
  rawPathname: "/"
};

const locationOne: SessionLocation = {
  pathname: "/one",
  hash: "",
  query: "",
  key: "1.0",
  rawPathname: "/one"
};

const locationTwo: SessionLocation = {
  pathname: "/two",
  hash: "",
  query: "",
  key: "2.0",
  rawPathname: "/two"
};

function historyHelpers(initial: SessionLocation) {
  const current = jest.fn(() => {
    return initial;
  });

  let finishPushMock;
  const finishPush = jest.fn((l: SessionLocation) => {
    finishPushMock = jest.fn();
    return finishPushMock;
  });

  let finishReplaceMock;
  const finishReplace = jest.fn((l: SessionLocation) => {
    finishReplaceMock = jest.fn();
    return finishReplaceMock;
  });

  return {
    current,
    push: {
      finish: finishPush,
      cancel: () => {}
    },
    replace: {
      finish: finishReplace,
      cancel: () => {}
    },
    finishMock(name: "push" | "replace") {
      return name === "push" ? finishPushMock : finishReplaceMock;
    }
  };
}

describe("navigateWith", () => {
  describe("prepare", () => {
    describe("anchor", () => {
      describe("new location", () => {
        const utils = locationUtils();
        const keygen = keyGenerator();

        const { finishMock, ...rest } = historyHelpers(initialLocation);
        const { prepare, emitNavigation } = navigateWith({
          responseHandler: pending => {
            pending.finish();
          },
          locationUtils: utils,
          keygen,
          ...rest
        });

        const nav = prepare("/next", "anchor");

        it("returns a push navigation object", () => {
          expect(nav.location).toMatchObject({
            pathname: "/next",
            key: "1.0"
          });
          expect(nav.action).toBe("push");

          expect(rest.push.finish.mock.calls.length).toBe(1);
          expect(rest.replace.finish.mock.calls.length).toBe(0);
        });

        it("finishing navigation calls function returned by push.finish", () => {
          const finished = finishMock("push");
          expect(finished.mock.calls.length).toBe(0);
          emitNavigation(nav);
          expect(finished.mock.calls.length).toBe(1);
        });
      });

      describe("same location", () => {
        const utils = locationUtils();
        const keygen = keyGenerator();
        const { finishMock, ...rest } = historyHelpers(initialLocation);
        const { prepare, emitNavigation } = navigateWith({
          responseHandler: pending => {
            pending.finish();
          },
          locationUtils: utils,
          keygen,
          ...rest
        });

        const nav = prepare("/", "anchor");

        it("returns a replace navigation object", () => {
          expect(nav.location).toMatchObject({
            pathname: "/",
            key: "0.1"
          });
          expect(nav.action).toBe("replace");
          expect(rest.push.finish.mock.calls.length).toBe(0);
          expect(rest.replace.finish.mock.calls.length).toBe(1);
        });

        it("finishing navigation calls the function returned by replace.finish", () => {
          const finished = finishMock("replace");
          expect(finished.mock.calls.length).toBe(0);
          emitNavigation(nav);
          expect(finished.mock.calls.length).toBe(1);
        });
      });
    });

    describe("push", () => {
      describe("new location", () => {
        const utils = locationUtils();
        const keygen = keyGenerator();
        const { finishMock, ...rest } = historyHelpers(initialLocation);
        const { prepare, emitNavigation } = navigateWith({
          responseHandler: pending => {
            pending.finish();
          },
          locationUtils: utils,
          keygen,
          ...rest
        });
        const nav = prepare("/next", "push");

        it("returns a push navigation object", () => {
          expect(nav.location).toMatchObject({
            pathname: "/next",
            key: "1.0"
          });
          expect(nav.action).toBe("push");

          expect(rest.push.finish.mock.calls.length).toBe(1);
          expect(rest.replace.finish.mock.calls.length).toBe(0);
        });

        it("finishing navigation calls the function returned by push.finish", () => {
          const finished = finishMock("push");
          expect(finished.mock.calls.length).toBe(0);
          emitNavigation(nav);
          expect(finished.mock.calls.length).toBe(1);
        });
      });
    });

    describe("replace", () => {
      describe("new location", () => {
        const utils = locationUtils();
        const keygen = keyGenerator();
        const { finishMock, ...rest } = historyHelpers(initialLocation);
        const { prepare, emitNavigation } = navigateWith({
          responseHandler: pending => {
            pending.finish();
          },
          locationUtils: utils,
          keygen,
          ...rest
        });

        const nav = prepare("/next", "replace");

        it("returns a replace navigation object", () => {
          expect(nav.location).toMatchObject({
            pathname: "/next",
            key: "0.1"
          });
          expect(nav.action).toBe("replace");
          expect(rest.push.finish.mock.calls.length).toBe(0);
          expect(rest.replace.finish.mock.calls.length).toBe(1);
        });

        it("finishing navigation calls the function returned by replace.finish", () => {
          const finished = finishMock("replace");
          expect(finished.mock.calls.length).toBe(0);
          emitNavigation(nav);
          expect(finished.mock.calls.length).toBe(1);
        });
      });
    });

    describe("[invalid]", () => {
      it("throws", () => {
        const utils = locationUtils();
        const keygen = keyGenerator();
        const { finishMock, ...rest } = historyHelpers(initialLocation);
        const handler = jest.fn();
        const { prepare } = navigateWith({
          responseHandler: handler,
          locationUtils: utils,
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

  describe("createNavigation", () => {
    it("returns a navigation object", () => {
      const utils = locationUtils();
      const keygen = keyGenerator();
      const { finishMock, ...rest } = historyHelpers(initialLocation);
      const handler = jest.fn();
      const { createNavigation } = navigateWith({
        responseHandler: handler,
        locationUtils: utils,
        keygen,
        ...rest
      });
      const nav = createNavigation(locationOne, "push", () => {}, () => {});
      expect(nav.location).toBe(locationOne);
      expect(nav.action).toBe("push");
      expect(nav.cancelled).toBe(false);
      expect(typeof nav.finish).toBe("function");
      expect(typeof nav.cancel).toBe("function");
    });
  });

  describe("emitNavigation", () => {
    it("calls response handler", () => {
      const utils = locationUtils();
      const keygen = keyGenerator();
      const { finishMock, ...rest } = historyHelpers(initialLocation);
      const handler = jest.fn();
      const { emitNavigation, prepare } = navigateWith({
        responseHandler: handler,
        locationUtils: utils,
        keygen,
        ...rest
      });
      emitNavigation({} as PendingNavigation);
      expect(handler.mock.calls.length).toBe(1);
    });
  });

  describe("cancelPending", () => {
    it("calls the pending navigation's cancel method with action", () => {
      const finish = jest.fn();
      const cancel = jest.fn();

      const utils = locationUtils();
      const keygen = keyGenerator();
      const { finishMock, ...rest } = historyHelpers(initialLocation);
      const { emitNavigation, cancelPending, createNavigation } = navigateWith({
        responseHandler: pending => {
          cancelPending("pop");
          expect(cancel.mock.calls.length).toBe(1);
        },
        locationUtils: utils,
        keygen,
        ...rest
      });

      const navigation = createNavigation(locationOne, "push", finish, cancel);
      emitNavigation(navigation);
    });
  });

  describe("calling navigation.finish", () => {
    it("does nothing if not the current pending", () => {
      const finishOne = jest.fn();
      const finishTwo = jest.fn();
      const cancelOne = jest.fn();
      const cancelTwo = jest.fn();
      let calls = 0;

      let originalPending;

      const utils = locationUtils();
      const keygen = keyGenerator();
      const { finishMock, ...rest } = historyHelpers(initialLocation);
      const { emitNavigation, createNavigation } = navigateWith({
        responseHandler: pending => {
          switch (calls++) {
            case 0:
              originalPending = pending;
              break;
            case 1:
              pending.finish();
              expect(finishTwo.mock.calls.length).toBe(1);
              originalPending.finish();
              expect(finishOne.mock.calls.length).toBe(0);
          }
        },
        locationUtils: utils,
        keygen,
        ...rest
      });

      const navigationOne = createNavigation(
        locationOne,
        "push",
        finishOne,
        cancelOne
      );
      const navigationTwo = createNavigation(
        locationTwo,
        "push",
        finishTwo,
        cancelTwo
      );

      emitNavigation(navigationOne);
      emitNavigation(navigationTwo);
    });

    it("does nothing if already called", () => {
      const finishOne = jest.fn();
      const cancelOne = jest.fn();

      const utils = locationUtils();
      const keygen = keyGenerator();
      const { finishMock, ...rest } = historyHelpers(initialLocation);
      const { emitNavigation, createNavigation } = navigateWith({
        responseHandler: pending => {
          pending.finish();
          expect(finishOne.mock.calls.length).toBe(1);
          pending.finish();
          expect(finishOne.mock.calls.length).toBe(1);
        },
        locationUtils: utils,
        keygen,
        ...rest
      });

      const navigation = createNavigation(
        locationOne,
        "push",
        finishOne,
        cancelOne
      );
      emitNavigation(navigation);
    });

    it("does nothing if already cancelled", () => {
      const finishOne = jest.fn();
      const cancelOne = jest.fn();

      const utils = locationUtils();
      const keygen = keyGenerator();
      const { finishMock, ...rest } = historyHelpers(initialLocation);
      const { emitNavigation, createNavigation } = navigateWith({
        responseHandler: pending => {
          pending.cancel();
          expect(finishOne.mock.calls.length).toBe(0);
          pending.finish();
          expect(finishOne.mock.calls.length).toBe(0);
        },
        locationUtils: utils,
        keygen,
        ...rest
      });

      const navigation = createNavigation(
        locationOne,
        "push",
        finishOne,
        cancelOne
      );
      emitNavigation(navigation);
    });
  });

  describe("calling navigation.cancel", () => {
    it("does nothing if not the current pending", () => {
      const finishOne = jest.fn();
      const finishTwo = jest.fn();
      const cancelOne = jest.fn();
      const cancelTwo = jest.fn();
      let calls = 0;

      let originalPending;

      const utils = locationUtils();
      const keygen = keyGenerator();
      const { finishMock, ...rest } = historyHelpers(initialLocation);
      const { emitNavigation, createNavigation } = navigateWith({
        responseHandler: pending => {
          switch (calls++) {
            case 0:
              originalPending = pending;
              break;
            case 1:
              pending.finish();
              expect(finishTwo.mock.calls.length).toBe(1);
              originalPending.cancel();
              expect(cancelOne.mock.calls.length).toBe(0);
          }
        },
        locationUtils: utils,
        keygen,
        ...rest
      });

      const navigationOne = createNavigation(
        locationOne,
        "push",
        finishOne,
        cancelOne
      );
      const navigationTwo = createNavigation(
        locationTwo,
        "push",
        finishTwo,
        cancelTwo
      );

      emitNavigation(navigationOne);
      emitNavigation(navigationTwo);
    });

    it("does nothing if already called", () => {
      const finishOne = jest.fn();
      const cancelOne = jest.fn();

      const utils = locationUtils();
      const keygen = keyGenerator();
      const { finishMock, ...rest } = historyHelpers(initialLocation);
      const { emitNavigation, createNavigation } = navigateWith({
        responseHandler: pending => {
          pending.cancel();
          expect(cancelOne.mock.calls.length).toBe(1);
          pending.cancel();
          expect(cancelOne.mock.calls.length).toBe(1);
        },
        locationUtils: utils,
        keygen,
        ...rest
      });

      const navigation = createNavigation(
        locationOne,
        "push",
        finishOne,
        cancelOne
      );
      emitNavigation(navigation);
    });

    it("does nothing if already cancelled", () => {
      const finishOne = jest.fn();
      const cancelOne = jest.fn();

      const utils = locationUtils();
      const keygen = keyGenerator();
      const { finishMock, ...rest } = historyHelpers(initialLocation);
      const { emitNavigation, createNavigation } = navigateWith({
        responseHandler: pending => {
          pending.cancel();
          expect(cancelOne.mock.calls.length).toBe(1);
          pending.cancel();
          expect(cancelOne.mock.calls.length).toBe(1);
        },
        locationUtils: utils,
        keygen,
        ...rest
      });

      const navigation = createNavigation(
        locationOne,
        "push",
        finishOne,
        cancelOne
      );
      emitNavigation(navigation);
    });
  });
});
