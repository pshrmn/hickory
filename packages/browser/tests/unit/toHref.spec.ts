import "jest";
import { Browser } from "../../src";
import { jsdom } from "jsdom";

// We create our own jsdom instead of using the one that Jest will create
// so that we can reset the DOM between tests
describe("toHref", () => {
  let dom;
  let window;

  beforeEach(() => {
    dom = jsdom("", {
      url: "http://example.com/one"
    });
    window = global.window = dom.defaultView;
    global.document = dom;
  });

  afterEach(() => {
    dom.close();
    global.document = undefined;
  });

  it("returns the location formatted as a string", () => {
    const testHistory = Browser();
    const path = testHistory.toHref({ pathname: "/one", query: "test=query" });
    expect(path).toBe("/one?test=query");
  });
});
