import { History, LocationDetails, HickoryLocation, PartialLocation, AnyLocation, Options as RootOptions } from "@hickory/root";
export { History, HickoryLocation, PartialLocation, AnyLocation, LocationDetails };
export declare type InputLocations = Array<string | PartialLocation>;
export interface Options extends RootOptions {
    locations?: InputLocations;
    index?: number;
}
export interface ResetOptions {
    locations?: InputLocations;
    index?: number;
}
export interface InMemoryHistory extends History {
    locations: Array<HickoryLocation>;
    index: number;
    reset(options?: ResetOptions): void;
}
export default function InMemory(options?: Options): InMemoryHistory;
