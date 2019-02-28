import "jest";
import { InMemory } from "../src";

import { navigateSuite } from "../../../tests/cases/navigate";

describe("Memory constructor", () => {
  it("initializes with root location (/) if none provided", () => {
    const testHistory = InMemory();
    expect(testHistory.locations.length).toBe(1);
    expect(testHistory.index).toBe(0);
    expect(testHistory.location).toMatchObject({
      pathname: "/",
      hash: "",
      query: ""
    });
  });

  it("converts passed location values to location objects", () => {
    const testHistory = InMemory({
      locations: [
        "/one",
        { pathname: "/two" },
        { pathname: "/three", state: { tres: 3 } }
      ]
    });

    expect(testHistory.locations.length).toBe(3);
    expect(testHistory.index).toBe(0);

    const [one, two, three] = testHistory.locations;
    expect(one).toMatchObject({
      pathname: "/one"
    });
    expect(two).toMatchObject({
      pathname: "/two"
    });
    expect(three).toMatchObject({
      pathname: "/three",
      state: { tres: 3 }
    });
  });

  it("sets the index if provided", () => {
    const testHistory = InMemory({
      locations: ["/one", "/two", "/three"],
      index: 2
    });
    expect(testHistory.index).toBe(2);
  });

  it("defaults to index 0 if provided value is out of bounds", () => {
    [-1, 3].forEach(value => {
      const testHistory = InMemory({
        locations: ["/one", "/two", "/three"],
        index: value
      });
      expect(testHistory.index).toBe(0);
    });
  });

  it('sets initial action to "push"', () => {
    const testHistory = InMemory({
      locations: ["/one", "/two", "/three"],
      index: 0
    });
    expect(testHistory.action).toBe("push");
  });

  it("removes saved locations when destroying", () => {
    const testHistory = InMemory({
      locations: ["/one", "/two", "/three"]
    });
    expect(testHistory.locations.length).toBe(3);
    expect(testHistory.index).toBe(0);
    testHistory.destroy();
    expect(testHistory.locations.length).toBe(0);
    expect(testHistory.index).toBe(-1);
  });
});

describe("navigate()", () => {
  navigateSuite.forEach(test => {
    it(test.msg, () => {
      const testHistory = InMemory({ locations: ["/one"] });
      test.fn({
        history: testHistory
      });
    });
  });
});

describe("toHref", () => {
  it("returns the location formatted as a string", () => {
    const testHistory = InMemory({
      locations: [{ pathname: "/one", query: "test=query" }]
    });

    const currentPath = testHistory.toHref(testHistory.location);
    expect(currentPath).toBe("/one?test=query");
  });
});

describe("reset()", () => {
  describe("locations", () => {
    describe("of strings", () => {
      it("resets history with provided locations", () => {
        const testHistory = InMemory({
          locations: ["/one", "/two", "/three"]
        });
        expect(testHistory.location).toMatchObject({
          pathname: "/one"
        });

        testHistory.reset({
          locations: ["/uno", "/dos"]
        });
        expect(testHistory.location).toMatchObject({
          pathname: "/uno"
        });
        expect(testHistory.locations.length).toBe(2);
      });
    });

    describe("of partial locations", () => {
      it("resets history with provided locations", () => {
        const testHistory = InMemory({
          locations: ["/one", "/two", "/three"]
        });
        expect(testHistory.location).toMatchObject({
          pathname: "/one"
        });

        testHistory.reset({
          locations: [{ pathname: "/uno" }, { pathname: "/dos" }]
        });
        expect(testHistory.location).toMatchObject({
          pathname: "/uno"
        });
        expect(testHistory.locations.length).toBe(2);
      });
    });

    describe("no value provided", () => {
      it('defaults to "/"', () => {
        const testHistory = InMemory({
          locations: ["/one", "/two", "/three"]
        });
        expect(testHistory.location).toMatchObject({
          pathname: "/one"
        });

        testHistory.reset();
        expect(testHistory.location).toMatchObject({
          pathname: "/"
        });
      });
    });

    it("reset removes existing locations", () => {
      const testHistory = InMemory({
        locations: ["/one", "/two", "/three"]
      });
      expect(testHistory.locations.length).toBe(3);

      testHistory.reset({ locations: ["/uno"] });
      expect(testHistory.locations.length).toBe(1);
    });
  });

  describe("index", () => {
    it("sets the index to the provided value", () => {
      const testHistory = InMemory({
        locations: ["/one", "/two", "/three"],
        index: 1
      });
      expect(testHistory.index).toBe(1);

      testHistory.reset({
        locations: ["/uno", "/dos", "/tres"],
        index: 2
      });
      expect(testHistory.index).toBe(2);
    });

    it("defaults to 0", () => {
      const testHistory = InMemory({
        locations: ["/one", "/two", "/three"],
        index: 1
      });
      expect(testHistory.index).toBe(1);

      testHistory.reset({
        locations: ["/uno", "/dos", "/tres"]
      });
      expect(testHistory.index).toBe(0);
    });

    it("uses 0 when provided value is negative", () => {
      const testHistory = InMemory({
        locations: ["/one", "/two", "/three"],
        index: 1
      });
      expect(testHistory.index).toBe(1);

      testHistory.reset({
        locations: ["/uno", "/dos", "/tres"],
        index: -1
      });
      expect(testHistory.index).toBe(0);
    });

    it("uses 0 when provided value is too high", () => {
      const testHistory = InMemory({
        locations: ["/one", "/two", "/three"],
        index: 1
      });
      expect(testHistory.index).toBe(1);

      testHistory.reset({
        locations: ["/uno", "/dos", "/tres"],
        index: 7
      });
      expect(testHistory.index).toBe(0);
    });
  });

  describe("emitting new location", () => {
    it("emits the new location to the register respondWith fn", () => {
      const testHistory = InMemory({
        locations: ["/one", "/two", "/three"]
      });
      const router = jest.fn();
      testHistory.respondWith(router); // calls router

      testHistory.reset({
        locations: ["/uno", "/dos"]
      });
      expect(router.mock.calls.length).toBe(2);
      expect(router.mock.calls[1][0]).toMatchObject({
        location: {
          pathname: "/uno"
        }
      });
    });

    it('emits the action as "push"', () => {
      const testHistory = InMemory({
        locations: ["/one", "/two", "/three"]
      });
      const router = jest.fn();
      testHistory.respondWith(router); // calls router

      testHistory.reset({
        locations: ["/uno", "/dos"]
      });
      expect(router.mock.calls[1][0]).toMatchObject({
        action: "push"
      });
    });
  });
});
