import "jest";
import * as qs from "qs";

import { createReusable } from "../src";

describe("createReusable", () => {
  it("creates initial location from location.url", () => {
    let history = createReusable();
    let testHistory = history(
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
    let history = createReusable();
    let testHistory = history(
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
    let history = createReusable();
    let testHistory = history(
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
    let history = createReusable({
      query: {
        parse: qs.parse,
        stringify: qs.stringify
      }
    });
    let testHistory = history(
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
      let history = createReusable();
      let testHistory = history(
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
      let history = createReusable();
      let testHistory = history(
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
      let history = createReusable();
      let testHistory = history(
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

describe("url", () => {
  it("returns the location formatted as a string", () => {
    let history = createReusable();
    let testHistory = history(
      pending => {
        pending.finish();
      },
      {
        location: { url: "/one?test=query" }
      }
    );
    let currentPath = testHistory.url(testHistory.location);
    expect(currentPath).toBe("/one?test=query");
  });

  it("uses the provided query stringifying function to stringify the query value", () => {
    let history = createReusable({
      query: {
        parse: qs.parse,
        stringify: qs.stringify
      }
    });
    let testHistory = history(
      pending => {
        pending.finish();
      },
      {
        location: { url: "/" }
      }
    );
    let url = testHistory.url({ pathname: "/yo", query: { one: 1 } });
    expect(url).toEqual("/yo?one=1");
  });
});
