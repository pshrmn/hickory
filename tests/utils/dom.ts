import { JSDOM, DOMWindow } from "jsdom";

// This module is used to create our own JSDOM instances
// so that there aren't any issues across tests

export interface MetaArgs {
  url: string;
  set_global?: boolean;
}

export interface DOMArgs {
  dom: JSDOM;
  window: DOMWindow;
}

export interface AsyncDOMArgs extends DOMArgs {
  resolve: (value?: any | PromiseLike<any>) => void;
}

export function with_dom(meta: MetaArgs, callback: (args: DOMArgs) => void) {
  const { url, set_global = true } = meta;
  const dom = new JSDOM("", { url });
  const window = dom.window;

  if (set_global) {
    global.window = window;
    global.document = window.document;
  }

  callback({ dom, window });

  if (set_global) {
    global.window = undefined;
    global.document = undefined;
  }
}

export function async_with_dom(
  meta: MetaArgs,
  callback: (args: AsyncDOMArgs) => void
) {
  const { url, set_global = true } = meta;
  const dom = new JSDOM("", { url });
  const window = dom.window;

  if (set_global) {
    global.window = window;
    global.document = window.document;
  }

  function reset_globals() {
    if (set_global) {
      global.window = undefined;
      global.document = undefined;
    }
  }

  return new Promise(resolve => callback({ dom, window, resolve })).then(
    reset_globals,
    reset_globals
  );
}
