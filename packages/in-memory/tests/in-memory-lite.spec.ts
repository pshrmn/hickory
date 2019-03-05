import "jest";
import { InMemoryLite } from "../src";

describe("InMemoryLite constructor", () => {
  it("works with string locations", () => {
    const testHistory = InMemoryLite(
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
    const testHistory = InMemoryLite(
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
    const testHistory = InMemoryLite(
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
    const testHistory = InMemoryLite(
      pending => {
        expect(pending.location.key).toEqual([0, 0]);
        pending.finish();
      },
      {
        location: "/one"
      }
    );
  });
});

describe("no-op functions", () => {
  describe("go", () => {
    it("doesn't throw", () => {
      const testHistory = InMemoryLite(
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
      const testHistory = InMemoryLite(
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
      const testHistory = InMemoryLite(
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
    const testHistory = InMemoryLite(
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
});
