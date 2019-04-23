import "jest";
import * as qs from "qs";

import { createReusable } from "../src";

describe("createReusable", () => {
  it("creates initial location from location.url", () => {
    const history = createReusable();
    const testHistory = history(
      pending => {
        pending.finish();
      },
      {
        location: { url: "/one#step" }
      }
    );
    expect(testHistory.location).toMatchObject({
      pathname: "/one",
      hash: "step"
    });
  });

  it('sets initial action to "push"', () => {
    const history = createReusable();
    const testHistory = history(
      pending => {
        expect(pending.action).toBe("push");
        pending.finish();
      },
      {
        location: { url: "/one" }
      }
    );
  });

  it("sets key to [0,0]", () => {
    const history = createReusable();
    const testHistory = history(
      pending => {
        expect(pending.location.key).toEqual([0, 0]);
        pending.finish();
      },
      {
        location: { url: "/one" }
      }
    );
  });

  it("uses the provided query parsing function to make the query value", () => {
    const history = createReusable({
      query: {
        parse: qs.parse,
        stringify: qs.stringify
      }
    });
    const testHistory = history(
      pending => {
        pending.finish();
      },
      {
        location: { url: "/pathname?query=this#hash" }
      }
    );
    expect(testHistory.location.query).toEqual({ query: "this" });
  });
});

describe("no-op functions", () => {
  describe("go", () => {
    it("doesn't throw", () => {
      const history = createReusable();
      const testHistory = history(
        pending => {
          pending.finish();
        },
        {
          location: { url: "/one#step" }
        }
      );
      expect(() => {
        testHistory.go(-1);
      }).not.toThrow();
    });
  });

  describe("navigate", () => {
    it("doesn't throw", () => {
      const history = createReusable();
      const testHistory = history(
        pending => {
          pending.finish();
        },
        {
          location: { url: "/one#step" }
        }
      );
      expect(() => {
        testHistory.navigate({ url: "/elsewhere" });
      }).not.toThrow();
    });
  });

  describe("cancel", () => {
    it("doesn't throw", () => {
      const history = createReusable();
      const testHistory = history(
        pending => {
          pending.finish();
        },
        {
          location: { url: "/one#step" }
        }
      );
      expect(() => {
        testHistory.cancel();
      }).not.toThrow();
    });
  });
});

describe("href", () => {
  it("returns the location formatted as a string", () => {
    const history = createReusable();
    const testHistory = history(
      pending => {
        pending.finish();
      },
      {
        location: { url: "/one?test=query" }
      }
    );
    const currentPath = testHistory.href(testHistory.location);
    expect(currentPath).toBe("/one?test=query");
  });

  it("uses the provided query stringifying function to stringify the query value", () => {
    const history = createReusable({
      query: {
        parse: qs.parse,
        stringify: qs.stringify
      }
    });
    const testHistory = history(
      pending => {
        pending.finish();
      },
      {
        location: { url: "/" }
      }
    );
    const href = testHistory.href({ pathname: "/yo", query: { one: 1 } });
    expect(href).toEqual("/yo?one=1");
  });
});
