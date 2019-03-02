import "jest";
import { navigationHandler } from "../src";

import { PendingNavigation, SessionLocation } from "@hickory/root";

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

describe("navigationHandler", () => {
  describe("emitNavigation", () => {
    // TODO: test what happens if there is no response handler?
    // aka how to test that nothing happens...

    it("calls response handler set using setHandler", () => {
      const handler = jest.fn();
      const { emitNavigation, setHandler } = navigationHandler();
      setHandler(handler);
      emitNavigation({} as PendingNavigation);
      expect(handler.mock.calls.length).toBe(1);
    });
  });

  describe("cancelPending", () => {
    it("calls the pending navigation's cancel method with action", () => {
      const finish = jest.fn();
      const cancel = jest.fn();
      const { emitNavigation, setHandler, cancelPending } = navigationHandler();
      setHandler(pending => {
        cancelPending("pop");
        expect(cancel.mock.calls.length).toBe(1);
      });
      emitNavigation({
        location: locationOne,
        action: "push",
        finish,
        cancel
      });
    });
  });

  describe("finish", () => {
    it("does nothing if not the current pending", () => {
      const finishOne = jest.fn();
      const finishTwo = jest.fn();
      const cancelOne = jest.fn();
      const cancelTwo = jest.fn();
      const { emitNavigation, setHandler } = navigationHandler();
      let calls = 0;

      let originalPending;
      setHandler(pending => {
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
      });

      emitNavigation({
        location: locationOne,
        action: "push",
        finish: finishOne,
        cancel: cancelOne
      });

      emitNavigation({
        location: locationTwo,
        action: "push",
        finish: finishTwo,
        cancel: cancelTwo
      });
    });

    it("does nothing if already called", () => {
      const finishOne = jest.fn();
      const cancelOne = jest.fn();
      const { emitNavigation, setHandler } = navigationHandler();

      setHandler(pending => {
        pending.finish();
        expect(finishOne.mock.calls.length).toBe(1);
        pending.finish();
        expect(finishOne.mock.calls.length).toBe(1);
      });

      emitNavigation({
        location: locationOne,
        action: "push",
        finish: finishOne,
        cancel: cancelOne
      });
    });

    it("does nothing if already cancelled", () => {
      const finishOne = jest.fn();
      const cancelOne = jest.fn();
      const { emitNavigation, setHandler } = navigationHandler();

      setHandler(pending => {
        pending.cancel();
        expect(finishOne.mock.calls.length).toBe(0);
        pending.finish();
        expect(finishOne.mock.calls.length).toBe(0);
      });

      emitNavigation({
        location: locationOne,
        action: "push",
        finish: finishOne,
        cancel: cancelOne
      });
    });
  });

  describe("cancel", () => {
    it("does nothing if not the current pending", () => {
      const finishOne = jest.fn();
      const finishTwo = jest.fn();
      const cancelOne = jest.fn();
      const cancelTwo = jest.fn();
      const { emitNavigation, setHandler } = navigationHandler();
      let calls = 0;

      let originalPending;
      setHandler(pending => {
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
      });

      emitNavigation({
        location: locationOne,
        action: "push",
        finish: finishOne,
        cancel: cancelOne
      });

      emitNavigation({
        location: locationTwo,
        action: "push",
        finish: finishTwo,
        cancel: cancelTwo
      });
    });

    it("does nothing if already called", () => {
      const finishOne = jest.fn();
      const cancelOne = jest.fn();
      const { emitNavigation, setHandler } = navigationHandler();

      setHandler(pending => {
        pending.cancel();
        expect(cancelOne.mock.calls.length).toBe(1);
        pending.cancel();
        expect(cancelOne.mock.calls.length).toBe(1);
      });

      emitNavigation({
        location: locationOne,
        action: "push",
        finish: finishOne,
        cancel: cancelOne
      });
    });

    it("does nothing if already cancelled", () => {
      const finishOne = jest.fn();
      const cancelOne = jest.fn();
      const { emitNavigation, setHandler } = navigationHandler();

      setHandler(pending => {
        pending.cancel();
        expect(cancelOne.mock.calls.length).toBe(1);
        pending.cancel();
        expect(cancelOne.mock.calls.length).toBe(1);
      });

      emitNavigation({
        location: locationOne,
        action: "push",
        finish: finishOne,
        cancel: cancelOne
      });
    });
  });
});
