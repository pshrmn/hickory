import { History, LocationDetails, PartialLocation, HickoryLocation, AnyLocation, Options as RootOptions } from "@hickory/root";
export { History, HickoryLocation, PartialLocation, AnyLocation, LocationDetails };
export interface Options extends RootOptions {
    raw?: (pathname: string) => string;
}
export default function Browser(options?: Options): History;
