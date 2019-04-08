import "jest";
import { location_utils } from "../src";
import * as qs from "qs";

import { SessionLocation, Key } from "../src/types";

describe("locationFactory", () => {
  describe("constructor", () => {
    it("throws when attempting to use an invalid base", () => {
      const badValues = ["does-not-start-with-a-slash", "/ends-with-slash/"];
      badValues.forEach(value => {
        expect(() => {
          const creators = location_utils({
            base: value
          });
        }).toThrow();
      });
    });

    describe("query option", () => {
      const consoleWarn = console.warn;

      beforeEach(() => {
        console.warn = jest.fn();
      });

      afterEach(() => {
        console.warn = consoleWarn;
      });

      describe("undefined", () => {
        it("returns object with default parse/stringify fns", () => {
          const common = location_utils();
          const parsed = common.location("/test?one=two");
          expect(parsed.query).toBe("one=two");
          const stringified = common.stringify({
            pathname: "/test",
            query: "?three=four"
          });
          expect(stringified).toBe("/test?three=four");
        });
      });

      describe("valid query option", () => {
        it("calls parse when creating a location", () => {
          const parse = jest.fn();
          const stringify = jest.fn();
          const common = location_utils({
            query: { parse, stringify }
          });
          const loc = common.location("/test?two=dos");
          expect(parse.mock.calls.length).toBe(1);
        });

        it("calls stringify when creating a path", () => {
          const parse = jest.fn();
          const stringify = jest.fn();
          const common = location_utils({
            query: { parse, stringify }
          });
          const path = common.stringify({ pathname: "/test" });
          expect(stringify.mock.calls.length).toBe(1);
        });
      });
    });
  });

  describe("location", () => {
    const { location } = location_utils();

    describe("pathname", () => {
      describe("string argument", () => {
        it("is parsed from a string location", () => {
          const loc = location("/pathname?query=this#hash");
          expect(loc.pathname).toBe("/pathname");
        });

        describe("base", () => {
          const { location } = location_utils({
            base: "/prefix"
          });

          it("strips the base off of the string", () => {
            const loc = location("/prefix/this/is/the/rest");
            expect(loc.pathname).toBe("/this/is/the/rest");
          });
        });

        it("attaches provided state", () => {
          const state = "hi!";
          const loc = location("/pathname", state);
          expect(loc.state).toBe(state);
        });
      });

      describe("object argument", () => {
        it("uses provided pathname", () => {
          const input = {
            pathname: "/test",
            query: "one=two",
            hash: "hello"
          };
          const output = location(input);
          expect(output.pathname).toBe("/test");
        });

        it("is / if no pathname is provided", () => {
          const input = {
            query: "one=two",
            hash: "hello"
          };
          const output = location(input);
          expect(output.pathname).toBe("/");
        });
      });
    });

    describe("pathname", () => {
      it("is the provided string", () => {
        const output = location("/Beyoncé");
        expect(output.pathname).toBe("/Beyoncé");
      });

      it("is the provided pathname property", () => {
        const output = location({ pathname: "/Jay-Z" });
        expect(output.pathname).toBe("/Jay-Z");
      });

      it("does not include a hash", () => {
        const output = location("/Kendrick#Lamar");
        expect(output.pathname).toBe("/Kendrick");
      });

      it("does not include a query", () => {
        const output = location("/Chance?the=Rapper");
        expect(output.pathname).toBe("/Chance");
      });
    });

    describe("query", () => {
      describe("string argument", () => {
        it("is parsed from a string location", () => {
          const loc = location("/pathname?query=this#hash");
          expect(loc.query).toBe("query=this");
        });
      });

      describe("object argument", () => {
        it("uses provided query", () => {
          const input = {
            pathname: "/test",
            query: "one=two",
            hash: "hello"
          };
          const output = location(input);
          expect(output.query).toBe("one=two");
        });

        it("sets default value if none is provided", () => {
          const input = {
            pathname: "/test",
            hash: "hello"
          };
          const output = location(input);
          expect(output.query).toBe("");
        });
      });

      describe("query.parse option", () => {
        it("uses the provided query parsing function to make the query value", () => {
          const { location } = location_utils({
            query: {
              parse: qs.parse,
              stringify: qs.stringify
            }
          });
          const loc = location("/pathname?query=this#hash");
          expect(loc.query).toEqual({ query: "this" });
        });
      });
    });

    describe("hash", () => {
      describe("string argument", () => {
        it("is parsed from a string location", () => {
          const loc = location("/pathname?query=this#hash");
          expect(loc.hash).toBe("hash");
        });
      });

      describe("object argument", () => {
        it("uses provided hash", () => {
          const input = {
            pathname: "/test",
            query: "one=two",
            hash: "hello"
          };
          const output = location(input);
          expect(output.hash).toBe("hello");
        });

        it("sets hash to empty string if none is provided", () => {
          const input = {
            pathname: "/test",
            query: "one=two"
          };
          const output = location(input);
          expect(output.hash).toBe("");
        });
      });
    });

    describe("state", () => {
      describe("string argument", () => {
        it("adds state if provided", () => {
          const input = {
            pathname: "/"
          };
          const state = {
            omg: "bff"
          };
          const output = location(input, state);
          expect(output.state).toBeDefined();
          expect(output.state).toEqual(state);
        });
      });

      describe("object argument", () => {
        it("adds state if provided", () => {
          const state = { from_location: false };
          const output = location({ pathname: "/" }, state);
          expect(output.state).toEqual(state);
        });

        it("prefers location.state over state argument", () => {
          const loc_state = { from_location: true };
          const just_state = { from_location: false };
          const output = location(
            { pathname: "/", state: loc_state },
            just_state
          );
          expect(output.state).toEqual(loc_state);
        });
      });

      it("is undefined if not provided", () => {
        const output = location("/");
        expect(output.state).toBeUndefined();
      });
    });
  });

  describe("keyed", () => {
    const { keyed, location } = location_utils();

    it("attaches a key to a keyless location", () => {
      const key: Key = [3, 14];
      const keyless_location = location("/test");
      const loc = keyed(keyless_location, key);
      expect(loc.key).toBe(key);
    });
  });

  describe("stringify", () => {
    const { stringify } = location_utils();

    describe("pathname", () => {
      it("begins the returned URI with the pathname", () => {
        const input = {
          pathname: "/test"
        };
        const output = stringify(input);
        expect(output).toBe("/test");
      });

      it("uses empty string for pathname if pathname is not provided", () => {
        const input = { hash: "test" };
        const output = stringify(input);
        expect(output).toBe("#test");
      });

      it("prepends forward slash if pathname does not have one", () => {
        const input = {
          pathname: "test"
        };
        const output = stringify(input);
        expect(output).toBe("/test");
      });

      describe("base", () => {
        it("adds the base to the generated string", () => {
          const { stringify } = location_utils({
            base: "/prefix"
          });
          const loc = {
            pathname: "/one/two/three",
            query: "",
            hash: "four"
          };
          const path = stringify(loc);
          expect(path).toBe("/prefix/one/two/three#four");
        });

        it("does not include the base if there is no pathname", () => {
          const { stringify } = location_utils({
            base: "/prefix"
          });
          const loc = {
            query: "?test=ing",
            hash: "four"
          };
          const path = stringify(loc);
          expect(path).toBe("?test=ing#four");
        });
      });
    });

    describe("query", () => {
      it("adds a question mark to the beginning of the query string (if not empty)", () => {
        const input = {
          pathname: "/",
          query: "one=two"
        };
        const output = stringify(input);
        expect(output).toBe("/?one=two");
      });

      it("does not add question mark if it already exists", () => {
        const input = {
          pathname: "/",
          query: "?one=two"
        };
        const output = stringify(input);
        expect(output).toBe("/?one=two");
      });

      it("does not include the query if stringified version is empty string", () => {
        const input = {
          pathname: "/"
        };
        const output = stringify(input);
        expect(output.indexOf("?")).toBe(-1);
      });

      describe("query.stringify option", () => {
        it("uses the provided stringify function to turn query into a string", () => {
          const { stringify } = location_utils({
            query: {
              parse: qs.parse,
              stringify: qs.stringify
            }
          });
          const input = {
            pathname: "/",
            query: { one: "two" }
          };
          const output = stringify(input);
          expect(output).toBe("/?one=two");
        });
      });
    });

    describe("hash", () => {
      it("adds a pound sign to the beginning of the hash (if not empty)", () => {
        const input = {
          pathname: "/",
          hash: "yes"
        };
        const output = stringify(input);
        expect(output).toBe("/#yes");
      });

      it("does not add pound sign if it already exists", () => {
        const input = {
          pathname: "/",
          hash: "#no"
        };
        const output = stringify(input);
        expect(output).toBe("/#no");
      });

      it("does not include the hash if it is falsy", () => {
        const falsy_values = ["", null, undefined];
        falsy_values.forEach(v => {
          const output = stringify({ pathname: "/", hash: v });
          expect(output.indexOf("#")).toBe(-1);
        });
      });

      it("places the hash after the query string", () => {
        const input = {
          pathname: "/",
          query: "before=true",
          hash: "after"
        };
        const output = stringify(input);
        expect(output.indexOf("?")).toBeLessThan(output.indexOf("#"));
      });
    });

    describe("string", () => {
      it("returns the provided string", () => {
        expect(stringify("/test")).toBe("/test");
      });

      describe("beginning with a pathname", () => {
        it("prefixes pathname that is missing a forward slash", () => {
          expect(stringify("test")).toBe("/test");
        });

        it("prefixes with base", () => {
          const { stringify } = location_utils({
            base: "/prefix"
          });
          const path = stringify("/one/two/three#four");
          expect(path).toBe("/prefix/one/two/three#four");
        });

        it("prefixes pathname when joining with base", () => {
          const { stringify } = location_utils({
            base: "/prefix"
          });
          const path = stringify("one");
          expect(path).toBe("/prefix/one");
        });
      });

      describe("beginning with a query", () => {
        it("returns the provided string", () => {
          const { stringify } = location_utils();
          expect(stringify("?test=true")).toBe("?test=true");
        });

        it("if there is a base, it is not prepended", () => {
          const { stringify } = location_utils({
            base: "/prefix"
          });
          const path = stringify("?test=true");
          expect(path).toBe("?test=true");
        });
      });

      describe("beginning with a hash", () => {
        it("returns the provided string", () => {
          const { stringify } = location_utils();
          expect(stringify("#test")).toBe("#test");
        });

        it("if there is a base, it is not prepended", () => {
          const { stringify } = location_utils({
            base: "/prefix"
          });
          const path = stringify("#test");
          expect(path).toBe("#test");
        });
      });
    });
  });
});
