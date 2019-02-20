import "jest";
import { InMemory } from "../src";

describe("Memory constructor", () => {
  it("returns object with expected API", () => {
    const testHistory = InMemory();
    const expectedProperties = [
      "location",
      "locations",
      "index",
      "action",
      "toHref",
      "respondWith",
      "confirmWith",
      "removeConfirmation",
      "destroy"
    ];
    expectedProperties.forEach(property => {
      expect(testHistory.hasOwnProperty(property)).toBe(true);
    });
  });

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
    expect(testHistory.index).toBeUndefined();
  });
});
