import "jest";
import { createBase } from "../src";

describe("createBase", () => {
  it("throws if given a base string that doesn't begin with a forward slash", () => {
    expect(() => {
      let base = createBase("does-not-start-with-a-slash");
    }).toThrow();
  });

  it("throws if given a base string that ends with a forward slash", () => {
    expect(() => {
      let base = createBase("/ends-with-slash/");
    }).toThrow();
  });

  describe("add", () => {
    it("is a function that prefixes the provided path with the prefix", () => {
      let base = createBase("/prefix");
      let output = base.add("/test");
      expect(output).toEqual("/prefix/test");
    });

    it("returns path if it begins with a query", () => {
      let base = createBase("/prefix");
      let output = base.add("?test=true");
      expect(output).toEqual("?test=true");
    });

    it("returns path if it begins with a hash", () => {
      let base = createBase("/prefix");
      let output = base.add("#test");
      expect(output).toEqual("#test");
    });

    describe("emptyRoot", () => {
      describe("root location", () => {
        it("(true) returns string without trailing slash", () => {
          let base = createBase("/prefix", { emptyRoot: true });
          let output = base.add("/");
          expect(output).toEqual("/prefix");
        });

        it("(false) returns string with trailing slash", () => {
          let base = createBase("/prefix", { emptyRoot: false });
          let output = base.add("/");
          expect(output).toEqual("/prefix/");
        });

        it("(default) returns string with trailing slash", () => {
          let base = createBase("/prefix");
          let output = base.add("/");
          expect(output).toEqual("/prefix/");
        });
      });

      it("emptyRoot = true & root location with query", () => {
        let base = createBase("/prefix", { emptyRoot: true });
        let output = base.add("/?test=value");
        expect(output).toEqual("/prefix?test=value");
      });

      it("emptyRoot = true & root location with hash", () => {
        let base = createBase("/prefix", { emptyRoot: true });
        let output = base.add("/#test");
        expect(output).toEqual("/prefix#test");
      });
    });
  });

  describe("remove", () => {
    it("removes the prefix from the provided path", () => {
      let base = createBase("/prefix");
      let output = base.remove("/prefix/test");
      expect(output).toEqual("/test");
    });

    describe("prefix exactly matches provided path", () => {
      it('returns "/"', () => {
        let base = createBase("/prefix");
        let output = base.remove("/prefix");
        expect(output).toEqual("/");
      });

      describe("strict = true", () => {
        it("throws if emptyRoot is false", () => {
          let base = createBase("/prefix", {
            strict: true,
            emptyRoot: false
          });
          expect(() => {
            let output = base.remove("/prefix");
          }).toThrow();
        });

        it('returns "/" if emptyRoot is true', () => {
          let base = createBase("/prefix", { strict: true, emptyRoot: true });
          let output = base.remove("/prefix");
          expect(output).toEqual("/");
        });
      });
    });

    it("returns empty string if input is an empty string", () => {
      let base = createBase("/prefix");
      let output = base.remove("");
      expect(output).toEqual("");
    });

    describe("strict", () => {
      it("(true) throws if strict doesn't begin with prefix", () => {
        let base = createBase("/prefix", { strict: true });
        expect(() => {
          let output = base.remove("/test");
        }).toThrow(
          'Expected a string that begins with "/prefix", but received "/test".'
        );
      });

      it("(false) returns the provided string", () => {
        let base = createBase("/prefix", { strict: false });
        let output = base.remove("/test");
        expect(output).toEqual("/test");
      });

      it("(default) returns the provided string", () => {
        let base = createBase("/prefix");
        let output = base.remove("/test");
        expect(output).toEqual("/test");
      });
    });
  });
});
