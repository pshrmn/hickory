import { History, LocationDetails, PartialLocation, HickoryLocation, AnyLocation, Options as RootOptions } from "@hickory/root";
export { History, HickoryLocation, PartialLocation, AnyLocation, LocationDetails };
export interface Options<Q> extends RootOptions<Q> {
    raw?: (pathname: string) => string;
}
declare function Browser<Q = string>(options?: Options<Q>): History<Q>;
export { Browser };
