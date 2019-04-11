import "jest";
import { navigationConfirmation } from "../src";
import { SessionLocation } from "../src/types/location";

describe("navigationConfirmation", () => {
  describe("confirmWith", () => {
    it("registers the function passed to it", () => {
      const { confirmWith, confirmNavigation } = navigationConfirmation();
      const allow = jest.fn();
      const confirm = () => {};
      const prevent = () => {};

      confirmWith(allow);
      expect(allow.mock.calls.length).toBe(0);

      confirmNavigation(null, confirm, prevent);
      expect(allow.mock.calls.length).toBe(1);
    });
  });

  describe("removeConfirmation", () => {
    it("does not call confirmation function after it has been removed", () => {
      const {
        confirmWith,
        confirmNavigation,
        removeConfirmation
      } = navigationConfirmation();
      const allow = jest.fn();
      const confirm = () => {};
      const prevent = () => {};

      confirmWith(allow);
      expect(allow.mock.calls.length).toBe(0);

      confirmNavigation(null, confirm, prevent);
      expect(allow.mock.calls.length).toBe(1);

      removeConfirmation();
      confirmNavigation(null, confirm, prevent);
      expect(allow.mock.calls.length).toBe(1);
    });
  });

  describe("confirmNavigation", () => {
    it("calls confirm function if there is no confirmation function", () => {
      const { confirmNavigation } = navigationConfirmation();

      const confirm = jest.fn();
      const prevent = jest.fn();

      confirmNavigation(
        {
          to: { pathname: "/this-is-only-a-test" } as SessionLocation,
          from: { pathname: "/this-was-not-a-test" } as SessionLocation,
          action: "push"
        },
        confirm,
        prevent
      );
      expect(confirm.mock.calls.length).toBe(1);
      expect(prevent.mock.calls.length).toBe(0);
    });

    it("calls the confirm function with the info confirm/prevent fns", () => {
      const { confirmWith, confirmNavigation } = navigationConfirmation();

      const allow = jest.fn();
      const confirm = () => {};
      const prevent = () => {};
      const toLocation = { pathname: "/this-is-only-a-test" };
      const fromLocation = { pathname: "/this-was-not-a-test" };
      const action = "push";

      confirmWith(allow);
      confirmNavigation(
        {
          to: toLocation as SessionLocation,
          from: fromLocation as SessionLocation,
          action
        },
        confirm,
        prevent
      );
      const args = allow.mock.calls[0];
      expect(args[0]).toEqual({
        to: toLocation,
        from: fromLocation,
        action
      });
      expect(args[1]).toBe(confirm);
      expect(args[2]).toBe(prevent);
    });

    it("will call a no-op function when cancelling if prevent function not provided", () => {
      const { confirmWith, confirmNavigation } = navigationConfirmation();

      function autoPrevent(info: any, confirm: any, prevent: () => void) {
        prevent();
      }

      const confirm = () => {};
      const toLocation = { pathname: "/this-is-only-a-test" };
      const fromLocation = { pathname: "/this-was-not-a-test" };
      const action = "push";

      confirmWith(autoPrevent);
      expect(() => {
        confirmNavigation(
          {
            to: toLocation as SessionLocation,
            from: fromLocation as SessionLocation,
            action
          },
          confirm
        );
      }).not.toThrow();
    });

    it("does not set confirm function if confirmWith is passed a non-function", () => {
      const { confirmWith } = navigationConfirmation();

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
