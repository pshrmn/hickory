import { History, HickoryLocation, PartialLocation, Options as RootOptions } from '@hickory/root';
export interface Options extends RootOptions {
    locations?: Array<string | PartialLocation>;
    index?: number;
}
export interface InMemoryHistory extends History {
    locations: Array<HickoryLocation>;
    index: number;
}
export default function InMemory(options?: Options): History;
