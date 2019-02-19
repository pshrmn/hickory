import { PUSH, REPLACE, ANCHOR, POP } from "@hickory/root";
import { History, LocationDetails, HickoryLocation, PartialLocation, AnyLocation, Options as RootOptions } from "@hickory/root";
export { History, HickoryLocation, PartialLocation, AnyLocation, LocationDetails };
export interface Options extends RootOptions {
    raw?: (pathname: string) => string;
    hashType?: string;
}
declare function Hash(options?: Options): History;
export { Hash, PUSH, REPLACE, ANCHOR, POP };
