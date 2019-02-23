import { History, LocationComponents, PartialLocation, SessionLocation, AnyLocation, Location, Options as RootOptions } from "@hickory/root";
export { History, SessionLocation, PartialLocation, AnyLocation, Location, LocationComponents };
export interface Options<Q> extends RootOptions<Q> {
    raw?: (pathname: string) => string;
}
declare function Browser<Q = string>(options?: Options<Q>): History<Q>;
export { Browser };
