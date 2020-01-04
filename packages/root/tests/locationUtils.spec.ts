import "jest";
import { locationUtils, createBase } from "../src";
import * as qs from "qs";

import { LocationComponents, Key } from "../src/types";

describe("location utils", () => {
  describe("constructor", () => {
    describe("query option", () => {
      let consoleWarn = console.warn;

      beforeEach(() => {
        console.warn = jest.fn();
      });

      afterEach(() => {
        console.warn = consoleWarn;
      });

      describe("undefined", () => {
        it("returns object with default parse/stringify fns", () => {
          let common = locationUtils();
          let parsed = common.location({ url: "/test?one=two" });
          expect(parsed.query).toBe("one=two");
          let stringified = common.stringify({
            pathname: "/test",
            query: "?three=four"
          });
          expect(stringified).toBe("/test?three=four");
        });
      });

      describe("valid query option", () => {
        it("calls parse when creating a location", () => {
          let parse = jest.fn();
          let stringify = jest.fn();
          let common = locationUtils({
            query: { parse, stringify }
          });
          let loc = common.location({ url: "/test?two=dos" });
          expect(parse.mock.calls.length).toBe(1);
        });

        it("calls stringify when creating a path", () => {
          let parse = jest.fn();
          let stringify = jest.fn();
          let common = locationUtils({
            query: { parse, stringify }
          });
          let path = common.stringify({ pathname: "/test" });
          expect(stringify.mock.calls.length).toBe(1);
        });
      });
    });
  });

  describe("location", () => {
    let { location } = locationUtils();

    describe("pathname", () => {
      describe("base", () => {
        let { location } = locationUtils({
          base: createBase("/prefix")
        });

        it("strips the base off of the string", () => {
          let loc = location({ url: "/prefix/this/is/the/rest" });
          expect(loc.pathname).toBe("/this/is/the/rest");
        });

        it('sets pathname to "/" if pathname exactly equals base', () => {
          let loc = location({ url: "/prefix" });
          expect(loc.pathname).toBe("/");
        });

        it("throws if URL begins with a pathname but no base and base is strict", () => {
          let { location } = locationUtils({
            base: createBase("/prefix", { strict: true })
          });
          expect(() => {
            let loc = location({ url: "/this/is/the/rest" });
          }).toThrow(
            'Expected a string that begins with "/prefix", but received "/this/is/the/rest".'
          );
        });

        it("does not throw if URL begins with a query", () => {
          expect(() => {
            let loc = location({ url: "?test=ing" });
          }).not.toThrow();
        });

        it("does not throw if URL begins with a hash", () => {
          expect(() => {
            let loc = location({ url: "#test" });
          }).not.toThrow();
        });
      });

      it("is parsed from the url string", () => {
        let loc = location({ url: "/pathname?query=this#hash" });
        expect(loc.pathname).toBe("/pathname");
      });

      describe("other parts", () => {
        it("does not include a hash", () => {
          let output = location({ url: "/Kendrick#Lamar" });
          expect(output.pathname).toBe("/Kendrick");
        });

        it("does not include a query", () => {
          let output = location({ url: "/Chance?the=Rapper" });
          expect(output.pathname).toBe("/Chance");
        });
      });
    });

    describe("query", () => {
      it("is parsed from the url string", () => {
        let loc = location({ url: "/pathname?query=this" });
        expect(loc.query).toBe("query=this");
      });

      it("does not include a hash", () => {
        let loc = location({ url: "/pathname?query=this#hash" });
        expect(loc.query).toBe("query=this");
      });

      describe("query.parse option", () => {
        it("uses the provided query parsing function to make the query value", () => {
          let { location } = locationUtils({
            query: {
              parse: qs.parse,
              stringify: qs.stringify
            }
          });
          let loc = location({ url: "/pathname?query=this#hash" });
          expect(loc.query).toEqual({ query: "this" });
        });
      });
    });

    describe("hash", () => {
      it("is parsed from the url string", () => {
        let loc = location({ url: "/pathname?query=this#hash" });
        expect(loc.hash).toBe("hash");
      });
    });

    describe("state", () => {
      it("is the state property from the object", () => {
        let state = {
          omg: "bff"
        };
        let input = {
          url: "/",
          state
        };
        let output = location(input);
        expect(output.state).toBeDefined();
        expect(output.state).toMatchObject(state);
      });

      it("is undefined if not provided", () => {
        let output = location({ url: "/" });
        expect(output.state).toBeUndefined();
      });
    });

    describe("special cases", () => {
      describe("hash fragment URLs", () => {
        describe("with current", () => {
          let current: LocationComponents = {
            pathname: "/test",
            query: "one=two",
            hash: "hooray"
          };

          it("re-uses current pathname", () => {
            let loc = location({ url: "#hash" }, current);
            expect(loc.pathname).toBe("/test");
          });

          it("re-uses current query", () => {
            let loc = location({ url: "#hash" }, current);
            expect(loc.query).toBe("one=two");
          });

          it("uses provided hash", () => {
            let loc = location({ url: "#hash" }, current);
            expect(loc.hash).toBe("hash");
          });
        });

        describe("without current", () => {
          it('pathname is "/"', () => {
            let loc = location({ url: "#hash" });
            expect(loc.pathname).toBe("/");
          });

          it("query is an empty value", () => {
            let loc = location({ url: "#hash" });
            expect(loc.query).toBe("");
          });

          it("uses provided hash", () => {
            let loc = location({ url: "#hash" });
            expect(loc.hash).toBe("hash");
          });
        });
      });

      describe("empty string", () => {
        describe("with current", () => {
          let current: LocationComponents = {
            pathname: "/test",
            query: "one=two",
            hash: "hey"
          };
          it("re-uses current pathname", () => {
            let loc = location({ url: "" }, current);
            expect(loc.pathname).toBe("/test");
          });

          it("re-uses current query", () => {
            let loc = location({ url: "" }, current);
            expect(loc.query).toBe("one=two");
          });

          it("re-uses current hash", () => {
            let loc = location({ url: "" }, current);
            expect(loc.hash).toBe("hey");
          });
        });

        describe("without current", () => {
          it('pathname is "/"', () => {
            let loc = location({ url: "" });
            expect(loc.pathname).toBe("/");
          });

          it("query is empty value", () => {
            let loc = location({ url: "" });
            expect(loc.query).toBe("");
          });

          it("hash is empty string", () => {
            let loc = location({ url: "" });
            expect(loc.hash).toBe("");
          });
        });
      });
    });
  });

  describe("keyed", () => {
    let { keyed, location } = locationUtils();

    it("attaches a key to a keyless location", () => {
      let key: Key = [3, 14];
      let keyless = location({ url: "/test" });
      let loc = keyed(keyless, key);
      expect(loc.key).toBe(key);
    });
  });

  describe("stringify", () => {
    let { stringify } = locationUtils();

    describe("object", () => {
      describe("pathname", () => {
        it("begins the returned URI with the pathname", () => {
          let input = {
            pathname: "/test"
          };
          let output = stringify(input);
          expect(output).toBe("/test");
        });

        it("uses empty string for pathname if pathname is not provided", () => {
          let input = { hash: "test" };
          let output = stringify(input);
          expect(output).toBe("#test");
        });

        describe("base", () => {
          it("adds the base to the generated string", () => {
            let { stringify } = locationUtils({
              base: createBase("/prefix")
            });
            let loc = {
              pathname: "/one/two/three",
              query: "",
              hash: "four"
            };
            let path = stringify(loc);
            expect(path).toBe("/prefix/one/two/three#four");
          });

          it("does not include the base if there is no pathname", () => {
            let { stringify } = locationUtils({
              base: createBase("/prefix")
            });
            let loc = {
              query: "?test=ing",
              hash: "four"
            };
            let path = stringify(loc);
            expect(path).toBe("?test=ing#four");
          });
        });
      });

      describe("query", () => {
        it("adds a question mark to the beginning of the query string (if not empty)", () => {
          let input = {
            pathname: "/",
            query: "one=two"
          };
          let output = stringify(input);
          expect(output).toBe("/?one=two");
        });

        it("does not add question mark if it already exists", () => {
          let input = {
            pathname: "/",
            query: "?one=two"
          };
          let output = stringify(input);
          expect(output).toBe("/?one=two");
        });

        it("does not include the query if stringified version is empty string", () => {
          let input = {
            pathname: "/"
          };
          let output = stringify(input);
          expect(output.indexOf("?")).toBe(-1);
        });

        describe("query.stringify option", () => {
          it("uses the provided stringify function to turn query into a string", () => {
            let { stringify } = locationUtils({
              query: {
                parse: qs.parse,
                stringify: qs.stringify
              }
            });
            let input = {
              pathname: "/",
              query: { one: "two" }
            };
            let output = stringify(input);
            expect(output).toBe("/?one=two");
          });
        });
      });

      describe("hash", () => {
        it("adds a pound sign to the beginning of the hash (if not empty)", () => {
          let input = {
            pathname: "/",
            hash: "yes"
          };
          let output = stringify(input);
          expect(output).toBe("/#yes");
        });

        it("does not add pound sign if it already exists", () => {
          let input = {
            pathname: "/",
            hash: "#no"
          };
          let output = stringify(input);
          expect(output).toBe("/#no");
        });

        it("does not include the hash if it is falsy", () => {
          let falsyValues = ["", null, undefined];
          falsyValues.forEach(v => {
            let output = stringify({ pathname: "/", hash: v });
            expect(output.indexOf("#")).toBe(-1);
          });
        });

        it("places the hash after the query string", () => {
          let input = {
            pathname: "/",
            query: "before=true",
            hash: "after"
          };
          let output = stringify(input);
          expect(output.indexOf("?")).toBeLessThan(output.indexOf("#"));
        });
      });
    });

    describe("string", () => {
      it("returns the provided string", () => {
        expect(stringify("/test")).toBe("/test");
      });

      describe("beginning with a pathname", () => {
        it("prefixes with base", () => {
          let { stringify } = locationUtils({
            base: createBase("/prefix")
          });
          let path = stringify("/one/two/three#four");
          expect(path).toBe("/prefix/one/two/three#four");
        });

        describe("base with emptyRoot = true", () => {
          it("for root location with query, strips initial slash", () => {
            let { stringify } = locationUtils({
              base: createBase("/prefix", { emptyRoot: true })
            });
            let path = stringify("/?test=one");
            expect(path).toBe("/prefix?test=one");
          });

          it("for root location with hash, strips initial slash", () => {
            let { stringify } = locationUtils({
              base: createBase("/prefix", { emptyRoot: true })
            });
            let path = stringify("/#test");
            expect(path).toBe("/prefix#test");
          });
        });
      });

      describe("beginning with a query", () => {
        it("returns the provided string", () => {
          let { stringify } = locationUtils();
          expect(stringify("?test=true")).toBe("?test=true");
        });

        it("if there is a base, it is not prepended", () => {
          let { stringify } = locationUtils({
            base: createBase("/prefix")
          });
          let path = stringify("?test=true");
          expect(path).toBe("?test=true");
        });
      });

      describe("beginning with a hash", () => {
        it("returns the provided string", () => {
          let { stringify } = locationUtils();
          expect(stringify("#test")).toBe("#test");
        });

        it("if there is a base, it is not prepended", () => {
          let { stringify } = locationUtils({
            base: createBase("/prefix")
          });
          let path = stringify("#test");
          expect(path).toBe("#test");
        });
      });
    });
  });
});
