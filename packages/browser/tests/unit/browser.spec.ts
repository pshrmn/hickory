import "jest";
import { Browser } from "../../src";
import { JSDOM } from "jsdom";

// We create our own jsdom instead of using the one that Jest will create
// so that we can reset the DOM between tests
describe("Browser constructor", () => {
  let dom: JSDOM;
  let window;

  beforeEach(() => {
    dom = new JSDOM("", {
      url: "http://example.com/one"
    });
    window = global.window = dom.window;
    global.document = dom.window.document;
  });

  afterEach(() => {
    global.document = undefined;
  });

  it("returns object with expected API", () => {
    const testHistory = Browser();
    const expectedProperties = [
      "location",
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

  it("initializes using window.location", () => {
    const testHistory = Browser();
    expect(testHistory.location).toMatchObject({
      pathname: "/one",
      hash: "",
      query: ""
    });
  });

  it('sets initial action to "push" when page has not been previously visited', () => {
    window.history.pushState(null, "", "/has-no-key");
    const testHistory = Browser();
    expect(testHistory.action).toBe("push");
  });

  it('sets initial action to "pop" when page has been previously visited', () => {
    window.history.pushState({ key: "17.0" }, "", "/has-key");
    const testHistory = Browser();
    expect(testHistory.action).toBe("pop");
  });
});
