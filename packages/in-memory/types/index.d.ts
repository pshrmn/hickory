import { History, LocationDetails, HickoryLocation, PartialLocation, AnyLocation, Options as RootOptions } from "@hickory/root";
export { History, HickoryLocation, PartialLocation, AnyLocation, LocationDetails };
export interface Options extends RootOptions {
    locations?: Array<string | PartialLocation>;
    index?: number;
}
export interface InMemoryHistory extends History {
    locations: Array<HickoryLocation>;
    index: number;
}
export default function InMemory(options?: Options): InMemoryHistory;
