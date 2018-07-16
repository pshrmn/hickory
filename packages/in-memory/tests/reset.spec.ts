import "jest";
import InMemory from "../src";

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
});
