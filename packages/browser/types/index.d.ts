import { BrowserHistory, Options } from "./types";
export * from "./types";
export declare function Browser<Q = string>(options?: Options<Q>): BrowserHistory<Q>;
