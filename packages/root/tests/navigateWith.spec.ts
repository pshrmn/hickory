import "jest";
import { navigateWith, locationUtils, keyGenerator } from "../src";

import { PendingNavigation, SessionLocation } from "@hickory/root";

let initialLocation: SessionLocation = {
  pathname: "/",
  hash: "",
  query: "",
  key: [0, 0]
};

let locationOne: SessionLocation = {
  pathname: "/one",
  hash: "",
  query: "",
  key: [1, 0]
};

let locationTwo: SessionLocation = {
  pathname: "/two",
  hash: "",
  query: "",
  key: [2, 0]
};

function helpers(initial: SessionLocation) {
  let current = jest.fn(() => {
    return initial;
  });

  let finishPushMock;
  let finishPush = jest.fn((l: SessionLocation) => {
    finishPushMock = jest.fn();
    return finishPushMock;
  });

  let finishReplaceMock;
  let finishReplace = jest.fn((l: SessionLocation) => {
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
        let utils = locationUtils();
        let keygen = keyGenerator();

        let { finishMock, ...rest } = helpers(initialLocation);
        let { prepare, emitNavigation } = navigateWith({
          responseHandler: pending => {
            pending.finish();
          },
          utils,
          keygen,
          ...rest
        });

        let nav = prepare({ url: "/next" }, "anchor");

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
          let finished = finishMock("push");
          expect(finished.mock.calls.length).toBe(0);
          emitNavigation(nav);
          expect(finished.mock.calls.length).toBe(1);
        });
      });

      describe("same location", () => {
        let utils = locationUtils();
        let keygen = keyGenerator();
        let { finishMock, ...rest } = helpers(initialLocation);
        let { prepare, emitNavigation } = navigateWith({
          responseHandler: pending => {
            pending.finish();
          },
          utils,
          keygen,
          ...rest
        });

        let nav = prepare({ url: "/" }, "anchor");

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
          let finished = finishMock("replace");
          expect(finished.mock.calls.length).toBe(0);
          emitNavigation(nav);
          expect(finished.mock.calls.length).toBe(1);
        });
      });
    });

    describe("push", () => {
      describe("new location", () => {
        let utils = locationUtils();
        let keygen = keyGenerator();
        let { finishMock, ...rest } = helpers(initialLocation);
        let { prepare, emitNavigation } = navigateWith({
          responseHandler: pending => {
            pending.finish();
          },
          utils,
          keygen,
          ...rest
        });
        let nav = prepare({ url: "/next" }, "push");

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
          let finished = finishMock("push");
          expect(finished.mock.calls.length).toBe(0);
          emitNavigation(nav);
          expect(finished.mock.calls.length).toBe(1);
        });
      });
    });

    describe("replace", () => {
      describe("new location", () => {
        let utils = locationUtils();
        let keygen = keyGenerator();
        let { finishMock, ...rest } = helpers(initialLocation);
        let { prepare, emitNavigation } = navigateWith({
          responseHandler: pending => {
            pending.finish();
          },
          utils,
          keygen,
          ...rest
        });

        let nav = prepare({ url: "/next" }, "replace");

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
          let finished = finishMock("replace");
          expect(finished.mock.calls.length).toBe(0);
          emitNavigation(nav);
          expect(finished.mock.calls.length).toBe(1);
        });
      });
    });

    describe("[invalid]", () => {
      it("throws", () => {
        let utils = locationUtils();
        let keygen = keyGenerator();
        let { finishMock, ...rest } = helpers(initialLocation);
        let handler = jest.fn();
        let { prepare } = navigateWith({
          responseHandler: handler,
          utils,
          keygen,
          ...rest
        });

        expect(() => {
          // @ts-ignore
          let nav = prepare({ url: "/next" }, "test");
        }).toThrow();
      });
    });
  });

  describe("createNavigation", () => {
    it("returns a navigation object", () => {
      let utils = locationUtils();
      let keygen = keyGenerator();
      let { finishMock, ...rest } = helpers(initialLocation);
      let handler = jest.fn();
      let { createNavigation } = navigateWith({
        responseHandler: handler,
        utils,
        keygen,
        ...rest
      });
      let nav = createNavigation(locationOne, "push", () => {}, () => {});
      expect(nav.location).toBe(locationOne);
      expect(nav.action).toBe("push");
      expect(nav.cancelled).toBe(false);
      expect(typeof nav.finish).toBe("function");
      expect(typeof nav.cancel).toBe("function");
    });
  });

  describe("emitNavigation", () => {
    it("calls response handler", () => {
      let utils = locationUtils();
      let keygen = keyGenerator();
      let { finishMock, ...rest } = helpers(initialLocation);
      let handler = jest.fn();
      let { emitNavigation, prepare } = navigateWith({
        responseHandler: handler,
        utils,
        keygen,
        ...rest
      });
      emitNavigation({} as PendingNavigation);
      expect(handler.mock.calls.length).toBe(1);
    });
  });

  describe("cancelPending", () => {
    it("calls the pending navigation's cancel method with action", () => {
      let finish = jest.fn();
      let cancel = jest.fn();

      let utils = locationUtils();
      let keygen = keyGenerator();
      let { finishMock, ...rest } = helpers(initialLocation);
      let { emitNavigation, cancelPending, createNavigation } = navigateWith({
        responseHandler: pending => {
          cancelPending("pop");
          expect(cancel.mock.calls.length).toBe(1);
        },
        utils,
        keygen,
        ...rest
      });

      let navigation = createNavigation(locationOne, "push", finish, cancel);
      emitNavigation(navigation);
    });
  });

  describe("calling navigation.finish", () => {
    it("does nothing if not the current pending", () => {
      let finishOne = jest.fn();
      let finishTwo = jest.fn();
      let cancelOne = jest.fn();
      let cancelTwo = jest.fn();
      let calls = 0;

      let originalPending;

      let utils = locationUtils();
      let keygen = keyGenerator();
      let { finishMock, ...rest } = helpers(initialLocation);
      let { emitNavigation, createNavigation } = navigateWith({
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
        utils,
        keygen,
        ...rest
      });

      let navigationOne = createNavigation(
        locationOne,
        "push",
        finishOne,
        cancelOne
      );
      let navigationTwo = createNavigation(
        locationTwo,
        "push",
        finishTwo,
        cancelTwo
      );

      emitNavigation(navigationOne);
      emitNavigation(navigationTwo);
    });

    it("does nothing if already called", () => {
      let finishOne = jest.fn();
      let cancelOne = jest.fn();

      let utils = locationUtils();
      let keygen = keyGenerator();
      let { finishMock, ...rest } = helpers(initialLocation);
      let { emitNavigation, createNavigation } = navigateWith({
        responseHandler: pending => {
          pending.finish();
          expect(finishOne.mock.calls.length).toBe(1);
          pending.finish();
          expect(finishOne.mock.calls.length).toBe(1);
        },
        utils,
        keygen,
        ...rest
      });

      let navigation = createNavigation(
        locationOne,
        "push",
        finishOne,
        cancelOne
      );
      emitNavigation(navigation);
    });

    it("does nothing if already cancelled", () => {
      let finishOne = jest.fn();
      let cancelOne = jest.fn();

      let utils = locationUtils();
      let keygen = keyGenerator();
      let { finishMock, ...rest } = helpers(initialLocation);
      let { emitNavigation, createNavigation } = navigateWith({
        responseHandler: pending => {
          pending.cancel();
          expect(finishOne.mock.calls.length).toBe(0);
          pending.finish();
          expect(finishOne.mock.calls.length).toBe(0);
        },
        utils,
        keygen,
        ...rest
      });

      let navigation = createNavigation(
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
      let finishOne = jest.fn();
      let finishTwo = jest.fn();
      let cancelOne = jest.fn();
      let cancelTwo = jest.fn();
      let calls = 0;

      let originalPending;

      let utils = locationUtils();
      let keygen = keyGenerator();
      let { finishMock, ...rest } = helpers(initialLocation);
      let { emitNavigation, createNavigation } = navigateWith({
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
        utils,
        keygen,
        ...rest
      });

      let navigationOne = createNavigation(
        locationOne,
        "push",
        finishOne,
        cancelOne
      );
      let navigationTwo = createNavigation(
        locationTwo,
        "push",
        finishTwo,
        cancelTwo
      );

      emitNavigation(navigationOne);
      emitNavigation(navigationTwo);
    });

    it("does nothing if already called", () => {
      let finishOne = jest.fn();
      let cancelOne = jest.fn();

      let utils = locationUtils();
      let keygen = keyGenerator();
      let { finishMock, ...rest } = helpers(initialLocation);
      let { emitNavigation, createNavigation } = navigateWith({
        responseHandler: pending => {
          pending.cancel();
          expect(cancelOne.mock.calls.length).toBe(1);
          pending.cancel();
          expect(cancelOne.mock.calls.length).toBe(1);
        },
        utils,
        keygen,
        ...rest
      });

      let navigation = createNavigation(
        locationOne,
        "push",
        finishOne,
        cancelOne
      );
      emitNavigation(navigation);
    });

    it("does nothing if already cancelled", () => {
      let finishOne = jest.fn();
      let cancelOne = jest.fn();

      let utils = locationUtils();
      let keygen = keyGenerator();
      let { finishMock, ...rest } = helpers(initialLocation);
      let { emitNavigation, createNavigation } = navigateWith({
        responseHandler: pending => {
          pending.cancel();
          expect(cancelOne.mock.calls.length).toBe(1);
          pending.cancel();
          expect(cancelOne.mock.calls.length).toBe(1);
        },
        utils,
        keygen,
        ...rest
      });

      let navigation = createNavigation(
        locationOne,
        "push",
        finishOne,
        cancelOne
      );
      emitNavigation(navigation);
    });
  });
});
