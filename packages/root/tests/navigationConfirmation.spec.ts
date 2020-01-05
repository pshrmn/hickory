import "jest";
import { navigationConfirmation } from "../src";
import { SessionLocation } from "../src/types/location";
import { Action } from "../src/types/navigate";

describe("navigationConfirmation", () => {
  describe("confirm", () => {
    it("registers the function passed to it", () => {
      let { confirm, confirmNavigation } = navigationConfirmation();
      let confirmation = jest.fn();
      let allow = () => {};
      let prevent = () => {};

      confirm(confirmation);
      expect(confirmation.mock.calls.length).toBe(0);

      confirmNavigation(null, allow, prevent);
      expect(confirmation.mock.calls.length).toBe(1);
    });

    it("removes confirmation function when called with no argument", () => {
      let { confirm, confirmNavigation } = navigationConfirmation();
      let confirmation = jest.fn();
      let allow = () => {};
      let prevent = () => {};

      confirm(confirmation);
      expect(confirmation.mock.calls.length).toBe(0);

      confirmNavigation(null, allow, prevent);
      expect(confirmation.mock.calls.length).toBe(1);

      confirm();

      confirmNavigation(null, allow, prevent);
      expect(confirmation.mock.calls.length).toBe(1);
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
      let { confirm, confirmNavigation } = navigationConfirmation();

      let confirmation = jest.fn();
      let allow = () => {};
      let prevent = () => {};
      let toLocation = { pathname: "/this-is-only-a-test" };
      let fromLocation = { pathname: "/this-was-not-a-test" };
      let action: Action = "push";

      confirm(confirmation);
      confirmNavigation(
        {
          to: toLocation as SessionLocation,
          from: fromLocation as SessionLocation,
          action
        },
        allow,
        prevent
      );
      let args = confirmation.mock.calls[0];
      expect(args[0]).toEqual({
        to: toLocation,
        from: fromLocation,
        action
      });
      expect(args[1]).toBe(allow);
      expect(args[2]).toBe(prevent);
    });

    it("will call a no-op function when cancelling if prevent function not provided", () => {
      let { confirm, confirmNavigation } = navigationConfirmation();

      function autoPrevent(_info: any, _allow: any, prevent: () => void) {
        prevent();
      }

      let allow = () => {};
      let toLocation = { pathname: "/this-is-only-a-test" };
      let fromLocation = { pathname: "/this-was-not-a-test" };
      let action: Action = "push";

      confirm(autoPrevent);
      expect(() => {
        confirmNavigation(
          {
            to: toLocation as SessionLocation,
            from: fromLocation as SessionLocation,
            action
          },
          allow
        );
      }).not.toThrow();
    });
  });
});
