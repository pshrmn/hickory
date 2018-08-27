import "jest";
import createCommonHistory from "../src";
import { HickoryLocation } from "../src/types/location";

describe("createNavigationConfirmation", () => {
  describe("confirmWith", () => {
    it("registers the function passed to it", () => {
      const { confirmWith, confirmNavigation } = createCommonHistory();
      const allowNavigation = jest.fn();
      const confirm = () => {};
      const prevent = () => {};

      confirmWith(allowNavigation);
      expect(allowNavigation.mock.calls.length).toBe(0);

      confirmNavigation(null, confirm, prevent);
      expect(allowNavigation.mock.calls.length).toBe(1);
    });
  });

  describe("removeConfirmation", () => {
    it("does not call confirmation function after it has been removed", () => {
      const {
        confirmWith,
        confirmNavigation,
        removeConfirmation
      } = createCommonHistory();
      const allowNavigation = jest.fn();
      const confirm = () => {};
      const prevent = () => {};

      confirmWith(allowNavigation);
      expect(allowNavigation.mock.calls.length).toBe(0);

      confirmNavigation(null, confirm, prevent);
      expect(allowNavigation.mock.calls.length).toBe(1);

      removeConfirmation();
      confirmNavigation(null, confirm, prevent);
      expect(allowNavigation.mock.calls.length).toBe(1);
    });
  });

  describe("confirmNavigation", () => {
    it("calls confirm function if there is no confirmation function", () => {
      const { confirmNavigation } = createCommonHistory();

      const confirm = jest.fn();
      const prevent = jest.fn();

      confirmNavigation(
        {
          to: { pathname: "/this-is-only-a-test" } as HickoryLocation,
          from: { pathname: "/this-was-not-a-test" } as HickoryLocation,
          action: "PUSH"
        },
        confirm,
        prevent
      );
      expect(confirm.mock.calls.length).toBe(1);
      expect(prevent.mock.calls.length).toBe(0);
    });

    it("calls the confirm function with the info confirm/prevent fns", () => {
      const { confirmWith, confirmNavigation } = createCommonHistory();

      const allowNavigation = jest.fn();
      const confirm = () => {};
      const prevent = () => {};
      const toLoc = { pathname: "/this-is-only-a-test" };
      const fromLoc = { pathname: "/this-was-not-a-test" };
      const action = "PUSH";

      confirmWith(allowNavigation);
      confirmNavigation(
        {
          to: toLoc as HickoryLocation,
          from: fromLoc as HickoryLocation,
          action
        },
        confirm,
        prevent
      );
      const args = allowNavigation.mock.calls[0];
      expect(args[0]).toEqual({
        to: toLoc,
        from: fromLoc,
        action
      });
      expect(args[1]).toBe(confirm);
      expect(args[2]).toBe(prevent);
    });

    it("will call a no-op function when cancelling if prevent function not provided", () => {
      const { confirmWith, confirmNavigation } = createCommonHistory();

      function autoPrevent(info, confirm, prevent) {
        prevent();
      }

      const confirm = () => {};
      const toLoc = { pathname: "/this-is-only-a-test" };
      const fromLoc = { pathname: "/this-was-not-a-test" };
      const action = "PUSH";

      confirmWith(autoPrevent);
      expect(() => {
        confirmNavigation(
          {
            to: toLoc as HickoryLocation,
            from: fromLoc as HickoryLocation,
            action
          },
          confirm
        );
      }).not.toThrow();
    });

    it("does not set confirm function if confirmWith is passed a non-function", () => {
      const { confirmWith } = createCommonHistory();

      const nonFuncs = [
        null,
        undefined,
        "test",
        1,
        [1, 2, 3],
        { key: "value" }
      ];
      nonFuncs.forEach(nf => {
        expect(() => {
          confirmWith();
        }).toThrow("confirmWith can only be passed a function");
      });
    });
  });
});
