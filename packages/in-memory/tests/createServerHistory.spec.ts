import "jest";
import * as qs from "qs";

import { createServerHistory } from "../src";

describe("createServerHistory", () => {
  it("works with string locations", () => {
    const history = createServerHistory();
    const testHistory = history(
      pending => {
        pending.finish();
      },
      {
        location: "/one#step"
      }
    );
    expect(testHistory.location).toMatchObject({
      pathname: "/one",
      hash: "step"
    });
  });

  it("works with object locations", () => {
    const history = createServerHistory();
    const testHistory = history(
      pending => {
        pending.finish();
      },
      {
        location: { pathname: "/two", hash: "daloo" }
      }
    );
    expect(testHistory.location).toMatchObject({
      pathname: "/two",
      hash: "daloo"
    });
  });

  it('sets initial action to "push"', () => {
    const history = createServerHistory();
    const testHistory = history(
      pending => {
        expect(pending.action).toBe("push");
        pending.finish();
      },
      {
        location: "/one"
      }
    );
  });

  it("sets key to [0,0]", () => {
    const history = createServerHistory();
    const testHistory = history(
      pending => {
        expect(pending.location.key).toEqual([0, 0]);
        pending.finish();
      },
      {
        location: "/one"
      }
    );
  });

  it("uses the provided query parsing function to make the query value", () => {
    const history = createServerHistory({
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
        location: "/pathname?query=this#hash"
      }
    );
    expect(testHistory.location.query).toEqual({ query: "this" });
  });
});

describe("no-op functions", () => {
  describe("go", () => {
    it("doesn't throw", () => {
      const history = createServerHistory();
      const testHistory = history(
        pending => {
          pending.finish();
        },
        {
          location: "/one#step"
        }
      );
      expect(() => {
        testHistory.go(-1);
      }).not.toThrow();
    });
  });

  describe("navigate", () => {
    it("doesn't throw", () => {
      const history = createServerHistory();
      const testHistory = history(
        pending => {
          pending.finish();
        },
        {
          location: "/one#step"
        }
      );
      expect(() => {
        testHistory.navigate("/elsewhere");
      }).not.toThrow();
    });
  });

  describe("cancel", () => {
    it("doesn't throw", () => {
      const history = createServerHistory();
      const testHistory = history(
        pending => {
          pending.finish();
        },
        {
          location: "/one#step"
        }
      );
      expect(() => {
        testHistory.cancel();
      }).not.toThrow();
    });
  });
});

describe("toHref", () => {
  it("returns the location formatted as a string", () => {
    const history = createServerHistory();
    const testHistory = history(
      pending => {
        pending.finish();
      },
      {
        location: { pathname: "/one", query: "test=query" }
      }
    );
    const currentPath = testHistory.toHref(testHistory.location);
    expect(currentPath).toBe("/one?test=query");
  });

  it("uses the provided query stringifying function to stringify the query value", () => {
    const history = createServerHistory({
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
        location: "/"
      }
    );
    const href = testHistory.toHref({ pathname: "/yo", query: { one: 1 } });
    expect(href).toEqual("/yo?one=1");
  });
});
