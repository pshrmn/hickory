import { JSDOM, DOMWindow } from "jsdom";

// This module is used to create our own JSDOM instances
// so that there aren't any issues across tests

export interface MetaArgs {
  url: string;
  setGlobal?: boolean;
}

export interface DOMArgs {
  dom: JSDOM;
  window: DOMWindow;
}

export interface AsyncDOMArgs extends DOMArgs {
  resolve: (value?: any | PromiseLike<any>) => void;
}

export function withDOM(meta: MetaArgs, callback: (args: DOMArgs) => void) {
  let { url, setGlobal = true } = meta;
  let dom = new JSDOM("", { url });
  let window = dom.window;

  if (setGlobal) {
    global.window = window;
    global.document = window.document;
  }

  callback({ dom, window });

  if (setGlobal) {
    global.window = undefined;
    global.document = undefined;
  }
}

export function asyncWithDOM(
  meta: MetaArgs,
  callback: (args: AsyncDOMArgs) => void
) {
  let { url, setGlobal = true } = meta;
  let dom = new JSDOM("", { url });
  let window = dom.window;

  if (setGlobal) {
    global.window = window;
    global.document = window.document;
  }

  function resetGlobals() {
    if (setGlobal) {
      global.window = undefined;
      global.document = undefined;
    }
  }

  return new Promise(resolve => callback({ dom, window, resolve })).then(
    resetGlobals,
    resetGlobals
  );
}
