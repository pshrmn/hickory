import "jest";
import * as qs from "qs";

import { create_server_history } from "../src";

describe("create_server_history", () => {
  it("works with string locations", () => {
    const history = create_server_history();
    const test_history = history(
      pending => {
        pending.finish();
      },
      {
        location: "/one#step"
      }
    );
    expect(test_history.location).toMatchObject({
      pathname: "/one",
      hash: "step"
    });
  });

  it("works with object locations", () => {
    const history = create_server_history();
    const test_history = history(
      pending => {
        pending.finish();
      },
      {
        location: { pathname: "/two", hash: "daloo" }
      }
    );
    expect(test_history.location).toMatchObject({
      pathname: "/two",
      hash: "daloo"
    });
  });

  it('sets initial action to "push"', () => {
    const history = create_server_history();
    const test_history = history(
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
    const history = create_server_history();
    const test_history = history(
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
    const history = create_server_history({
      query: {
        parse: qs.parse,
        stringify: qs.stringify
      }
    });
    const test_history = history(
      pending => {
        pending.finish();
      },
      {
        location: "/pathname?query=this#hash"
      }
    );
    expect(test_history.location.query).toEqual({ query: "this" });
  });
});

describe("no-op functions", () => {
  describe("go", () => {
    it("doesn't throw", () => {
      const history = create_server_history();
      const test_history = history(
        pending => {
          pending.finish();
        },
        {
          location: "/one#step"
        }
      );
      expect(() => {
        test_history.go(-1);
      }).not.toThrow();
    });
  });

  describe("navigate", () => {
    it("doesn't throw", () => {
      const history = create_server_history();
      const test_history = history(
        pending => {
          pending.finish();
        },
        {
          location: "/one#step"
        }
      );
      expect(() => {
        test_history.navigate("/elsewhere");
      }).not.toThrow();
    });
  });

  describe("cancel", () => {
    it("doesn't throw", () => {
      const history = create_server_history();
      const test_history = history(
        pending => {
          pending.finish();
        },
        {
          location: "/one#step"
        }
      );
      expect(() => {
        test_history.cancel();
      }).not.toThrow();
    });
  });
});

describe("to_href", () => {
  it("returns the location formatted as a string", () => {
    const history = create_server_history();
    const test_history = history(
      pending => {
        pending.finish();
      },
      {
        location: { pathname: "/one", query: "test=query" }
      }
    );
    const currentPath = test_history.to_href(test_history.location);
    expect(currentPath).toBe("/one?test=query");
  });

  it("uses the provided query stringifying function to stringify the query value", () => {
    const history = create_server_history({
      query: {
        parse: qs.parse,
        stringify: qs.stringify
      }
    });
    const test_history = history(
      pending => {
        pending.finish();
      },
      {
        location: "/"
      }
    );
    const href = test_history.to_href({ pathname: "/yo", query: { one: 1 } });
    expect(href).toEqual("/yo?one=1");
  });
});
