import "jest";
import { navigationConfirmation } from "../src";
import { SessionLocation } from "../src/types/location";
import { Action } from "../src/types/navigate";

describe("navigationConfirmation", () => {
  describe("confirmWith", () => {
    it("registers the function passed to it", () => {
      let { confirmWith, confirmNavigation } = navigationConfirmation();
      let allow = jest.fn();
      let confirm = () => {};
      let prevent = () => {};

      confirmWith(allow);
      expect(allow.mock.calls.length).toBe(0);

      confirmNavigation(null, confirm, prevent);
      expect(allow.mock.calls.length).toBe(1);
    });
  });

  describe("removeConfirmation", () => {
    it("does not call confirmation function after it has been removed", () => {
      let {
        confirmWith,
        confirmNavigation,
        removeConfirmation
      } = navigationConfirmation();
      let allow = jest.fn();
      let confirm = () => {};
      let prevent = () => {};

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
      let { confirmNavigation } = navigationConfirmation();

      let confirm = jest.fn();
      let prevent = jest.fn();

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
      let { confirmWith, confirmNavigation } = navigationConfirmation();

      let allow = jest.fn();
      let confirm = () => {};
      let prevent = () => {};
      let toLocation = { pathname: "/this-is-only-a-test" };
      let fromLocation = { pathname: "/this-was-not-a-test" };
      let action: Action = "push";

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
      let args = allow.mock.calls[0];
      expect(args[0]).toEqual({
        to: toLocation,
        from: fromLocation,
        action
      });
      expect(args[1]).toBe(confirm);
      expect(args[2]).toBe(prevent);
    });

    it("will call a no-op function when cancelling if prevent function not provided", () => {
      let { confirmWith, confirmNavigation } = navigationConfirmation();

      function autoPrevent(info: any, confirm: any, prevent: () => void) {
        prevent();
      }

      let confirm = () => {};
      let toLocation = { pathname: "/this-is-only-a-test" };
      let fromLocation = { pathname: "/this-was-not-a-test" };
      let action: Action = "push";

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
  });
});
