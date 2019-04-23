import "jest";
import { createBase } from "../src";

describe("createBase", () => {
  it("throws if given a base string that doesn't begin with a forward slash", () => {
    expect(() => {
      const base = createBase("does-not-start-with-a-slash");
    }).toThrow();
  });

  it("throws if given a base string that ends with a forward slash", () => {
    expect(() => {
      const base = createBase("/ends-with-slash/");
    }).toThrow();
  });

  describe("add", () => {
    it("is a function that prefixes the provided path with the prefix", () => {
      const base = createBase("/prefix");
      const output = base.add("/test");
      expect(output).toEqual("/prefix/test");
    });

    it("returns path if it begins with a query", () => {
      const base = createBase("/prefix");
      const output = base.add("?test=true");
      expect(output).toEqual("?test=true");
    });

    it("returns path if it begins with a hash", () => {
      const base = createBase("/prefix");
      const output = base.add("#test");
      expect(output).toEqual("#test");
    });

    describe("emptyRoot", () => {
      describe("root location", () => {
        it("(true) returns string without trailing slash", () => {
          const base = createBase("/prefix", { emptyRoot: true });
          const output = base.add("/");
          expect(output).toEqual("/prefix");
        });

        it("(false) returns string with trailing slash", () => {
          const base = createBase("/prefix", { emptyRoot: false });
          const output = base.add("/");
          expect(output).toEqual("/prefix/");
        });

        it("(default) returns string with trailing slash", () => {
          const base = createBase("/prefix");
          const output = base.add("/");
          expect(output).toEqual("/prefix/");
        });
      });

      it("emptyRoot = true & root location with query", () => {
        const base = createBase("/prefix", { emptyRoot: true });
        const output = base.add("/?test=value");
        expect(output).toEqual("/prefix?test=value");
      });

      it("emptyRoot = true & root location with hash", () => {
        const base = createBase("/prefix", { emptyRoot: true });
        const output = base.add("/#test");
        expect(output).toEqual("/prefix#test");
      });
    });
  });

  describe("remove", () => {
    it("removes the prefix from the provided path", () => {
      const base = createBase("/prefix");
      const output = base.remove("/prefix/test");
      expect(output).toEqual("/test");
    });

    describe("prefix exactly matches provided path", () => {
      it('returns "/"', () => {
        const base = createBase("/prefix");
        const output = base.remove("/prefix");
        expect(output).toEqual("/");
      });

      describe("strict = true", () => {
        it("throws if emptyRoot is false", () => {
          const base = createBase("/prefix", {
            strict: true,
            emptyRoot: false
          });
          expect(() => {
            const output = base.remove("/prefix");
          }).toThrow();
        });

        it('returns "/" if emptyRoot is true', () => {
          const base = createBase("/prefix", { strict: true, emptyRoot: true });
          const output = base.remove("/prefix");
          expect(output).toEqual("/");
        });
      });
    });

    it("returns empty string if input is an empty string", () => {
      const base = createBase("/prefix");
      const output = base.remove("");
      expect(output).toEqual("");
    });

    describe("strict", () => {
      it("(true) throws if strict doesn't begin with prefix", () => {
        const base = createBase("/prefix", { strict: true });
        expect(() => {
          const output = base.remove("/test");
        }).toThrow(
          'Expected a string that begins with "/prefix", but received "/test".'
        );
      });

      it("(false) returns the provided string", () => {
        const base = createBase("/prefix", { strict: false });
        const output = base.remove("/test");
        expect(output).toEqual("/test");
      });

      it("(default) returns the provided string", () => {
        const base = createBase("/prefix");
        const output = base.remove("/test");
        expect(output).toEqual("/test");
      });
    });
  });
});
