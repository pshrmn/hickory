import "jest";
import { locationUtils, keyGenerator, prepareNavigate } from "../src";

import { SessionLocation } from "@hickory/root";

function historyHelpers(initial: SessionLocation) {
  const current = jest.fn(() => {
    return initial;
  });

  let finishPush;
  const push = jest.fn((l: SessionLocation) => {
    finishPush = jest.fn();
    return finishPush;
  });

  let finishReplace;
  const replace = jest.fn((l: SessionLocation) => {
    finishReplace = jest.fn();
    return finishReplace;
  });

  return {
    current,
    push,
    replace,
    finish: (type: "push" | "replace") => {
      return type === "push" ? finishPush : finishReplace;
    }
  };
}

describe("prepareNavigate", () => {
  it("returns a function", () => {
    const utils = locationUtils();
    const keygen = keyGenerator();

    const { current, push, replace } = historyHelpers({
      pathname: "/",
      hash: "",
      query: "",
      key: "1.0",
      rawPathname: "/"
    });

    const prepare = prepareNavigate({
      locationUtils: utils,
      keygen,
      current,
      push,
      replace
    });

    expect(typeof prepare).toBe("function");
  });

  describe("anchor", () => {
    describe("new location", () => {
      const utils = locationUtils();
      const keygen = keyGenerator();

      const initial = {
        pathname: "/",
        hash: "",
        query: "",
        key: "1.0",
        rawPathname: "/"
      };
      const { current, push, replace, finish } = historyHelpers(initial);

      const prepare = prepareNavigate({
        locationUtils: utils,
        keygen,
        current,
        push,
        replace
      });

      const nav = prepare("/next", "anchor");

      it("returns a push navigation object", () => {
        expect(nav.location).toMatchObject({
          pathname: "/next",
          key: "2.0"
        });
        expect(nav.action).toBe("push");

        expect(push.mock.calls.length).toBe(1);
        expect(replace.mock.calls.length).toBe(0);
      });

      it("calls the function returned by push when finished", () => {
        const finished = finish("push");
        expect(finished.mock.calls.length).toBe(0);
        nav.finish();
        expect(finished.mock.calls.length).toBe(1);
      });
    });

    describe("same location", () => {
      const utils = locationUtils();
      const keygen = keyGenerator();

      const initial = {
        pathname: "/here",
        hash: "test",
        query: "",
        key: "1.0",
        rawPathname: "/here"
      };
      const { current, push, replace, finish } = historyHelpers(initial);

      const prepare = prepareNavigate({
        locationUtils: utils,
        keygen,
        current,
        push,
        replace
      });

      const nav = prepare("/here#test", "anchor");

      it("returns a replace navigation object", () => {
        expect(nav.location).toMatchObject({
          pathname: "/here",
          hash: "test",
          key: "1.1"
        });
        expect(nav.action).toBe("replace");
        expect(push.mock.calls.length).toBe(0);
        expect(replace.mock.calls.length).toBe(1);
      });

      it("calls the function returned by replace when finished", () => {
        const finished = finish("replace");
        expect(finished.mock.calls.length).toBe(0);
        nav.finish();
        expect(finished.mock.calls.length).toBe(1);
      });
    });
  });

  describe("push", () => {
    describe("new location", () => {
      const utils = locationUtils();
      const keygen = keyGenerator();

      const initial = {
        pathname: "/",
        hash: "",
        query: "",
        key: "1.0",
        rawPathname: "/"
      };
      const { current, push, replace, finish } = historyHelpers(initial);

      const prepare = prepareNavigate({
        locationUtils: utils,
        keygen,
        current,
        push,
        replace
      });

      const nav = prepare("/next", "push");

      it("returns a push navigation object", () => {
        expect(nav.location).toMatchObject({
          pathname: "/next",
          key: "2.0"
        });
        expect(nav.action).toBe("push");

        expect(push.mock.calls.length).toBe(1);
        expect(replace.mock.calls.length).toBe(0);
      });

      it("calls the function returned by push when finished", () => {
        const finished = finish("push");
        expect(finished.mock.calls.length).toBe(0);
        nav.finish();
        expect(finished.mock.calls.length).toBe(1);
      });
    });
  });

  describe("replace", () => {
    describe("new location", () => {
      const utils = locationUtils();
      const keygen = keyGenerator();

      const initial = {
        pathname: "/",
        hash: "",
        query: "",
        key: "1.0",
        rawPathname: "/"
      };
      const { current, push, replace, finish } = historyHelpers(initial);

      const prepare = prepareNavigate({
        locationUtils: utils,
        keygen,
        current,
        push,
        replace
      });

      const nav = prepare("/next", "replace");

      it("returns a replace navigation object", () => {
        expect(nav.location).toMatchObject({
          pathname: "/next",
          key: "1.1"
        });
        expect(nav.action).toBe("replace");
        expect(push.mock.calls.length).toBe(0);
        expect(replace.mock.calls.length).toBe(1);
      });

      it("calls the function returned by replace when finished", () => {
        const finished = finish("replace");
        expect(finished.mock.calls.length).toBe(0);
        nav.finish();
        expect(finished.mock.calls.length).toBe(1);
      });
    });
  });

  describe("[invalid]", () => {
    it("throws", () => {
      const utils = locationUtils();
      const keygen = keyGenerator();

      const { current, push, replace } = historyHelpers({
        pathname: "/",
        hash: "",
        query: "",
        key: "1.0",
        rawPathname: "/"
      });

      const prepare = prepareNavigate({
        locationUtils: utils,
        keygen,
        current,
        push,
        replace
      });

      expect(() => {
        // @ts-ignore
        const nav = prepare("/next", "test");
      }).toThrow();
    });
  });
});
