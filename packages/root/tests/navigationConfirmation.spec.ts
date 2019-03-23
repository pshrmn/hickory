import "jest";
import { navigation_confirmation } from "../src";
import { SessionLocation } from "../src/types/location";

describe("navigation_confirmation", () => {
  describe("confirm_with", () => {
    it("registers the function passed to it", () => {
      const { confirm_with, confirm_navigation } = navigation_confirmation();
      const allow_navigation = jest.fn();
      const confirm = () => {};
      const prevent = () => {};

      confirm_with(allow_navigation);
      expect(allow_navigation.mock.calls.length).toBe(0);

      confirm_navigation(null, confirm, prevent);
      expect(allow_navigation.mock.calls.length).toBe(1);
    });
  });

  describe("remove_confirmation", () => {
    it("does not call confirmation function after it has been removed", () => {
      const {
        confirm_with,
        confirm_navigation,
        remove_confirmation
      } = navigation_confirmation();
      const allow_navigation = jest.fn();
      const confirm = () => {};
      const prevent = () => {};

      confirm_with(allow_navigation);
      expect(allow_navigation.mock.calls.length).toBe(0);

      confirm_navigation(null, confirm, prevent);
      expect(allow_navigation.mock.calls.length).toBe(1);

      remove_confirmation();
      confirm_navigation(null, confirm, prevent);
      expect(allow_navigation.mock.calls.length).toBe(1);
    });
  });

  describe("confirm_navigation", () => {
    it("calls confirm function if there is no confirmation function", () => {
      const { confirm_navigation } = navigation_confirmation();

      const confirm = jest.fn();
      const prevent = jest.fn();

      confirm_navigation(
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
      const { confirm_with, confirm_navigation } = navigation_confirmation();

      const allow_navigation = jest.fn();
      const confirm = () => {};
      const prevent = () => {};
      const to_loc = { pathname: "/this-is-only-a-test" };
      const from_loc = { pathname: "/this-was-not-a-test" };
      const action = "push";

      confirm_with(allow_navigation);
      confirm_navigation(
        {
          to: to_loc as SessionLocation,
          from: from_loc as SessionLocation,
          action
        },
        confirm,
        prevent
      );
      const args = allow_navigation.mock.calls[0];
      expect(args[0]).toEqual({
        to: to_loc,
        from: from_loc,
        action
      });
      expect(args[1]).toBe(confirm);
      expect(args[2]).toBe(prevent);
    });

    it("will call a no-op function when cancelling if prevent function not provided", () => {
      const { confirm_with, confirm_navigation } = navigation_confirmation();

      function auto_prevent(info: any, confirm: any, prevent: () => void) {
        prevent();
      }

      const confirm = () => {};
      const to_loc = { pathname: "/this-is-only-a-test" };
      const from_loc = { pathname: "/this-was-not-a-test" };
      const action = "push";

      confirm_with(auto_prevent);
      expect(() => {
        confirm_navigation(
          {
            to: to_loc as SessionLocation,
            from: from_loc as SessionLocation,
            action
          },
          confirm
        );
      }).not.toThrow();
    });

    it("does not set confirm function if confirm_with is passed a non-function", () => {
      const { confirm_with } = navigation_confirmation();

      const non_funcs = [
        null,
        undefined,
        "test",
        1,
        [1, 2, 3],
        { key: "value" }
      ];
      non_funcs.forEach(nf => {
        expect(() => {
          confirm_with();
        }).toThrow("confirm_with can only be passed a function");
      });
    });
  });
});
