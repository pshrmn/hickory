import { History, LocationComponents, SessionLocation, PartialLocation, Location, AnyLocation, Options as RootOptions } from "@hickory/root";
export { History, SessionLocation, PartialLocation, AnyLocation, Location, LocationComponents };
export interface Options<Q> extends RootOptions<Q> {
    raw?: (pathname: string) => string;
    hashType?: string;
}
declare function Hash<Q>(options?: Options<Q>): History<Q>;
export { Hash };
