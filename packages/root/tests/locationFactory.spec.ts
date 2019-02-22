import "jest";
import { Common } from "../src";
import * as qs from "qs";

import { HickoryLocation } from "../src/types";

describe("locationFactory", () => {
  describe("constructor", () => {
    it("throws when attempting to use an invalid baseSegment", () => {
      const badValues = ["does-not-start-with-a-slash", "/ends-with-slash/"];
      badValues.forEach(value => {
        expect(() => {
          const creators = Common({
            baseSegment: value
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
          const common = Common();
          const parsed = common.genericLocation("/test?one=two");
          expect(parsed.query).toBe("one=two");
          const stringified = common.stringifyLocation({
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
          const common = Common({
            query: { parse, stringify }
          });
          const location = common.genericLocation("/test?two=dos");
          expect(parse.mock.calls.length).toBe(1);
        });

        it("calls stringify when creating a path", () => {
          const parse = jest.fn();
          const stringify = jest.fn();
          const common = Common({
            query: { parse, stringify }
          });
          const path = common.stringifyLocation({ pathname: "/test" });
          expect(stringify.mock.calls.length).toBe(1);
        });
      });
    });
  });

  describe("genericLocation", () => {
    const { genericLocation } = Common();

    describe("pathname", () => {
      describe("string argument", () => {
        it("is parsed from a string location", () => {
          const loc = genericLocation("/pathname?query=this#hash");
          expect(loc.pathname).toBe("/pathname");
        });

        describe("baseSegment", () => {
          const { genericLocation } = Common({
            baseSegment: "/prefix"
          });

          it("strips the baseSegment off of the string", () => {
            const location = genericLocation("/prefix/this/is/the/rest");
            expect(location.pathname).toBe("/this/is/the/rest");
          });
        });
      });

      describe("object argument", () => {
        it("uses provided pathname", () => {
          const input = {
            pathname: "/test",
            query: "one=two",
            hash: "hello"
          };
          const output = genericLocation(input);
          expect(output.pathname).toBe("/test");
        });

        it("is / if no pathname is provided", () => {
          const input = {
            query: "one=two",
            hash: "hello"
          };
          const output = genericLocation(input);
          expect(output.pathname).toBe("/");
        });
      });

      describe("decode option", () => {
        it("decodes the pathname by default", () => {
          const input = {
            pathname: "/t%C3%B6rt%C3%A9nelem"
          };
          const output = genericLocation(input);
          expect(output.pathname).toBe("/történelem");
        });

        it("does not decode when decode=false", () => {
          const { genericLocation } = Common({ decode: false });
          const input = {
            pathname: "/t%C3%B6rt%C3%A9nelem"
          };
          const output = genericLocation(input);
          expect(output.pathname).toBe("/t%C3%B6rt%C3%A9nelem");
        });

        describe("bad encoding", () => {
          it("throws URIError with clearer message when decoding fails", () => {
            const input = {
              pathname: "/bad%"
            };
            expect(() => {
              const output = genericLocation(input);
            }).toThrow(
              'Pathname "/bad%" could not be decoded. ' +
                "This is most likely due to a bad percent-encoding. For more information, " +
                "see the third paragraph here https://tools.ietf.org/html/rfc3986#section-2.4"
            );
          });

          it("does not throw URIError when decode=false", () => {
            const { genericLocation } = Common({ decode: false });
            const input = {
              pathname: "/bad%"
            };
            expect(() => {
              const output = genericLocation(input);
            }).not.toThrow();
          });
        });
      });
    });

    describe("rawPathname", () => {
      it("is result of user provided `raw` option", () => {
        const { genericLocation } = Common({
          raw: path =>
            path
              .split("")
              .reverse()
              .join("")
        });
        const output = genericLocation("/test");
        expect(output.rawPathname).toBe("tset/");
      });

      it("uses default fn if `raw` option is not provided", () => {
        const output = genericLocation("/test%20ing");
        expect(output.pathname).toBe("/test ing");
        expect(output.rawPathname).toBe("/test%20ing");
      });
    });

    describe("url", () => {
      describe("string argument", () => {
        it("is the provided string", () => {
          const loc = genericLocation("/pathname?query=this#hash");
          expect(loc.url).toBe("/pathname?query=this#hash");
        });
      });

      describe("object argument", () => {
        it("is the expected value", () => {
          const input = {
            pathname: "/test",
            query: "one=two",
            hash: "hello"
          };
          const output = genericLocation(input);
          expect(output.url).toBe("/test?one=two#hello");
        });
      });
    });

    describe("query", () => {
      describe("string argument", () => {
        it("is parsed from a string location", () => {
          const loc = genericLocation("/pathname?query=this#hash");
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
          const output = genericLocation(input);
          expect(output.query).toBe("one=two");
        });

        it("sets default value if none is provided", () => {
          const input = {
            pathname: "/test",
            hash: "hello"
          };
          const output = genericLocation(input);
          expect(output.query).toBe("");
        });
      });

      describe("query.parse option", () => {
        it("uses the provided query parsing function to make the query value", () => {
          const { genericLocation } = Common({
            query: {
              parse: qs.parse,
              stringify: qs.stringify
            }
          });
          const loc = genericLocation("/pathname?query=this#hash");
          expect(loc.query).toEqual({ query: "this" });
        });
      });
    });

    describe("hash", () => {
      describe("string argument", () => {
        it("is parsed from a string location", () => {
          const loc = genericLocation("/pathname?query=this#hash");
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
          const output = genericLocation(input);
          expect(output.hash).toBe("hello");
        });

        it("sets hash to empty string if none is provided", () => {
          const input = {
            pathname: "/test",
            search: "one=two"
          };
          const output = genericLocation(input);
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
          const output = genericLocation(input, state);
          expect(output.state).toBeDefined();
          expect(output.state).toEqual(state);
        });
      });

      describe("object argument", () => {
        it("adds state if provided", () => {
          const state = { fromLocation: false };
          const output = genericLocation({ pathname: "/" }, state);
          expect(output.state).toEqual(state);
        });

        it("prefers location.state over state argument", () => {
          const locState = { fromLocation: true };
          const justState = { fromLocation: false };
          const output = genericLocation(
            { pathname: "/", state: locState },
            justState
          );
          expect(output.state).toEqual(locState);
        });
      });

      it("is undefined if not provided", () => {
        const output = genericLocation("/");
        expect(output.state).toBeUndefined();
      });
    });
  });

  describe("keyed", () => {
    const { keyed, genericLocation } = Common();

    it("attaches a key to a keyless location", () => {
      const key = "3.1.4";
      const keylessLocation = genericLocation("/test");
      const location = keyed(keylessLocation, key);
      expect(location.key).toBe(key);
    });
  });

  describe("stringifyLocation", () => {
    const { stringifyLocation } = Common();

    describe("pathname", () => {
      it("begins the returned URI with the pathname", () => {
        const input = {
          pathname: "/test"
        };
        const output = stringifyLocation(input);
        expect(output).toBe("/test");
      });

      it("prefers rawPathname", () => {
        const input = {
          rawPathname: "/rawPathname",
          pathname: "/pathname"
        } as HickoryLocation<any>;
        const output = stringifyLocation(input);
        expect(output).toBe("/rawPathname");
      });

      it("uses empty string for pathname if neither pathname or rawPathname provided", () => {
        const input = { hash: "test" };
        const output = stringifyLocation(input);
        expect(output).toBe("#test");
      });

      it("prepends forward slash if pathname does not have one", () => {
        const input = {
          pathname: "test"
        };
        const output = stringifyLocation(input);
        expect(output).toBe("/test");
      });

      describe("baseSegment", () => {
        it("adds the baseSegment to the generated string", () => {
          const { stringifyLocation } = Common({ baseSegment: "/prefix" });
          const location = {
            pathname: "/one/two/three",
            search: "",
            hash: "four"
          };
          const path = stringifyLocation(location);
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
        const output = stringifyLocation(input);
        expect(output).toBe("/?one=two");
      });

      it("does not add question mark if it already exists", () => {
        const input = {
          pathname: "/",
          query: "?one=two"
        };
        const output = stringifyLocation(input);
        expect(output).toBe("/?one=two");
      });

      it("does not include the query if stringified version is empty string", () => {
        const input = {
          pathname: "/"
        };
        const output = stringifyLocation(input);
        expect(output.indexOf("?")).toBe(-1);
      });

      describe("query.stringify option", () => {
        it("uses the provided stringify function to turn query into a string", () => {
          const { stringifyLocation } = Common({
            query: {
              parse: qs.parse,
              stringify: qs.stringify
            }
          });
          const input = {
            pathname: "/",
            query: { one: "two" }
          };
          const output = stringifyLocation(input);
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
        const output = stringifyLocation(input);
        expect(output).toBe("/#yes");
      });

      it("does not add pound sign if it already exists", () => {
        const input = {
          pathname: "/",
          hash: "#no"
        };
        const output = stringifyLocation(input);
        expect(output).toBe("/#no");
      });

      it("does not include the hash if it is falsy", () => {
        const falsyValues = ["", null, undefined];
        falsyValues.forEach(v => {
          const output = stringifyLocation({ pathname: "/", hash: v });
          expect(output.indexOf("#")).toBe(-1);
        });
      });

      it("places the hash after the query string", () => {
        const input = {
          pathname: "/",
          query: "before=true",
          hash: "after"
        };
        const output = stringifyLocation(input);
        expect(output.indexOf("?")).toBeLessThan(output.indexOf("#"));
      });
    });
  });
});
