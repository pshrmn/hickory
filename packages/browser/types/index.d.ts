import { PUSH, REPLACE, ANCHOR, POP } from "@hickory/root";
import { History, LocationDetails, PartialLocation, HickoryLocation, AnyLocation, Options as RootOptions } from "@hickory/root";
export { History, HickoryLocation, PartialLocation, AnyLocation, LocationDetails };
export interface Options extends RootOptions {
    raw?: (pathname: string) => string;
}
declare function Browser(options?: Options): History;
export { Browser, PUSH, REPLACE, ANCHOR, POP };
