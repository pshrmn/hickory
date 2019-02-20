import "jest";
import { Hash } from "../../src";
import { JSDOM } from "jsdom";

// We create our own jsdom instead of using the one that Jest will create
// so that we can reset the DOM between tests
describe("toHref", () => {
  let dom: JSDOM;

  beforeEach(() => {
    dom = new JSDOM("", {
      url: "http://example.com/#/one"
    });
    window = global.window = dom.window;
    global.document = dom.window.document;
  });

  afterEach(() => {
    global.document = undefined;
  });

  it("returns the location formatted as a string", () => {
    const testHistory = Hash();
    const currentPath = testHistory.toHref({
      pathname: "/one",
      query: "test=query"
    });
    expect(currentPath).toBe("#/one?test=query");
  });

  it("has different output for different hash types", () => {
    const noTypeHistory = Hash();
    const defaultHistory = Hash({ hashType: "default" });
    const bangHistory = Hash({ hashType: "bang" });
    const cleanHistory = Hash({ hashType: "clean" });

    const location = { pathname: "/simple-path" };

    expect(noTypeHistory.toHref(location)).toBe("#/simple-path");
    expect(defaultHistory.toHref(location)).toBe("#/simple-path");
    expect(bangHistory.toHref(location)).toBe("#!/simple-path");
    expect(cleanHistory.toHref(location)).toBe("#simple-path");
  });
});
