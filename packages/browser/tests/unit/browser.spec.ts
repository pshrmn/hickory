import "jest";
import { Browser, PUSH, POP } from "../../src";
import { jsdom } from "jsdom";

// We create our own jsdom instead of using the one that Jest will create
// so that we can reset the DOM between tests
describe("Browser constructor", () => {
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

  it("sets initial action to PUSH when page has not been previously visited", () => {
    window.history.pushState(null, "", "/has-no-key");
    const testHistory = Browser();
    expect(testHistory.action).toBe(PUSH);
  });

  it("sets initial action to POP when page has been previously visited", () => {
    window.history.pushState({ key: "17.0" }, "", "/has-key");
    const testHistory = Browser();
    expect(testHistory.action).toBe(POP);
  });
});
