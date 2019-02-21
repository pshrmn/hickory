import { History, LocationDetails, HickoryLocation, PartialLocation, AnyLocation, Options as RootOptions } from "@hickory/root";
export { History, HickoryLocation, PartialLocation, AnyLocation, LocationDetails };
export interface Options<Q> extends RootOptions<Q> {
    raw?: (pathname: string) => string;
    hashType?: string;
}
declare function Hash<Q>(options?: Options<Q>): History<Q>;
export { Hash };
