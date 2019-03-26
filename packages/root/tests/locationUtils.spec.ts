import "jest";
import { location_utils } from "../src";
import * as qs from "qs";

import { SessionLocation, Key } from "../src/types";

describe("locationFactory", () => {
  describe("constructor", () => {
    it("throws when attempting to use an invalid base_segment", () => {
      const badValues = ["does-not-start-with-a-slash", "/ends-with-slash/"];
      badValues.forEach(value => {
        expect(() => {
          const creators = location_utils({
            base_segment: value
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
          const parsed = common.generic_location("/test?one=two");
          expect(parsed.query).toBe("one=two");
          const stringified = common.stringify_location({
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
          const location = common.generic_location("/test?two=dos");
          expect(parse.mock.calls.length).toBe(1);
        });

        it("calls stringify when creating a path", () => {
          const parse = jest.fn();
          const stringify = jest.fn();
          const common = location_utils({
            query: { parse, stringify }
          });
          const path = common.stringify_location({ pathname: "/test" });
          expect(stringify.mock.calls.length).toBe(1);
        });
      });
    });
  });

  describe("generic_location", () => {
    const { generic_location } = location_utils();

    describe("pathname", () => {
      describe("string argument", () => {
        it("is parsed from a string location", () => {
          const loc = generic_location("/pathname?query=this#hash");
          expect(loc.pathname).toBe("/pathname");
        });

        describe("base_segment", () => {
          const { generic_location } = location_utils({
            base_segment: "/prefix"
          });

          it("strips the base_segment off of the string", () => {
            const location = generic_location("/prefix/this/is/the/rest");
            expect(location.pathname).toBe("/this/is/the/rest");
          });
        });

        it("attaches provided state", () => {
          const state = "hi!";
          const loc = generic_location("/pathname", state);
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
          const output = generic_location(input);
          expect(output.pathname).toBe("/test");
        });

        it("is / if no pathname is provided", () => {
          const input = {
            query: "one=two",
            hash: "hello"
          };
          const output = generic_location(input);
          expect(output.pathname).toBe("/");
        });
      });
    });

    describe("pathname", () => {
      it("calls user provided `pathname` option", () => {
        const verify_pathname = jest.fn();
        const { generic_location } = location_utils({
          pathname: verify_pathname
        });
        expect(verify_pathname.mock.calls.length).toBe(0);
        const output = generic_location("/Beyoncé");
        expect(verify_pathname.mock.calls.length).toBe(1);
      });

      it("is the provided string if `pathname` option is not provided", () => {
        const output = generic_location("/Beyoncé");
        expect(output.pathname).toBe("/Beyoncé");
      });
    });

    describe("query", () => {
      describe("string argument", () => {
        it("is parsed from a string location", () => {
          const loc = generic_location("/pathname?query=this#hash");
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
          const output = generic_location(input);
          expect(output.query).toBe("one=two");
        });

        it("sets default value if none is provided", () => {
          const input = {
            pathname: "/test",
            hash: "hello"
          };
          const output = generic_location(input);
          expect(output.query).toBe("");
        });
      });

      describe("query.parse option", () => {
        it("uses the provided query parsing function to make the query value", () => {
          const { generic_location } = location_utils({
            query: {
              parse: qs.parse,
              stringify: qs.stringify
            }
          });
          const loc = generic_location("/pathname?query=this#hash");
          expect(loc.query).toEqual({ query: "this" });
        });
      });
    });

    describe("hash", () => {
      describe("string argument", () => {
        it("is parsed from a string location", () => {
          const loc = generic_location("/pathname?query=this#hash");
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
          const output = generic_location(input);
          expect(output.hash).toBe("hello");
        });

        it("sets hash to empty string if none is provided", () => {
          const input = {
            pathname: "/test",
            search: "one=two"
          };
          const output = generic_location(input);
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
          const output = generic_location(input, state);
          expect(output.state).toBeDefined();
          expect(output.state).toEqual(state);
        });
      });

      describe("object argument", () => {
        it("adds state if provided", () => {
          const state = { from_location: false };
          const output = generic_location({ pathname: "/" }, state);
          expect(output.state).toEqual(state);
        });

        it("prefers location.state over state argument", () => {
          const loc_state = { from_location: true };
          const just_state = { from_location: false };
          const output = generic_location(
            { pathname: "/", state: loc_state },
            just_state
          );
          expect(output.state).toEqual(loc_state);
        });
      });

      it("is undefined if not provided", () => {
        const output = generic_location("/");
        expect(output.state).toBeUndefined();
      });
    });
  });

  describe("keyed", () => {
    const { keyed, generic_location } = location_utils();

    it("attaches a key to a keyless location", () => {
      const key: Key = [3, 14];
      const keyless_location = generic_location("/test");
      const location = keyed(keyless_location, key);
      expect(location.key).toBe(key);
    });
  });

  describe("stringify_location", () => {
    const { stringify_location } = location_utils();

    describe("pathname", () => {
      it("begins the returned URI with the pathname", () => {
        const input = {
          pathname: "/test"
        };
        const output = stringify_location(input);
        expect(output).toBe("/test");
      });

      it("uses empty string for pathname if pathname is not provided", () => {
        const input = { hash: "test" };
        const output = stringify_location(input);
        expect(output).toBe("#test");
      });

      it("prepends forward slash if pathname does not have one", () => {
        const input = {
          pathname: "test"
        };
        const output = stringify_location(input);
        expect(output).toBe("/test");
      });

      describe("base_segment", () => {
        it("adds the base_segment to the generated string", () => {
          const { stringify_location } = location_utils({
            base_segment: "/prefix"
          });
          const location = {
            pathname: "/one/two/three",
            search: "",
            hash: "four"
          };
          const path = stringify_location(location);
          expect(path).toBe("/prefix/one/two/three#four");
        });
      });
    });

    describe("query", () => {
      it("adds a question mark to the beginning of the query string (if not empty)", () => {
        const input = {
          pathname: "/",
          query: "one=two"
        };
        const output = stringify_location(input);
        expect(output).toBe("/?one=two");
      });

      it("does not add question mark if it already exists", () => {
        const input = {
          pathname: "/",
          query: "?one=two"
        };
        const output = stringify_location(input);
        expect(output).toBe("/?one=two");
      });

      it("does not include the query if stringified version is empty string", () => {
        const input = {
          pathname: "/"
        };
        const output = stringify_location(input);
        expect(output.indexOf("?")).toBe(-1);
      });

      describe("query.stringify option", () => {
        it("uses the provided stringify function to turn query into a string", () => {
          const { stringify_location } = location_utils({
            query: {
              parse: qs.parse,
              stringify: qs.stringify
            }
          });
          const input = {
            pathname: "/",
            query: { one: "two" }
          };
          const output = stringify_location(input);
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
        const output = stringify_location(input);
        expect(output).toBe("/#yes");
      });

      it("does not add pound sign if it already exists", () => {
        const input = {
          pathname: "/",
          hash: "#no"
        };
        const output = stringify_location(input);
        expect(output).toBe("/#no");
      });

      it("does not include the hash if it is falsy", () => {
        const falsy_values = ["", null, undefined];
        falsy_values.forEach(v => {
          const output = stringify_location({ pathname: "/", hash: v });
          expect(output.indexOf("#")).toBe(-1);
        });
      });

      it("places the hash after the query string", () => {
        const input = {
          pathname: "/",
          query: "before=true",
          hash: "after"
        };
        const output = stringify_location(input);
        expect(output.indexOf("?")).toBeLessThan(output.indexOf("#"));
      });
    });
  });
});
