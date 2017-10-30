import { History, HickoryLocation, PartialLocation, AnyLocation, Options as RootOptions } from '@hickory/root';
export { History, HickoryLocation, PartialLocation, AnyLocation };
export interface Options extends RootOptions {
    raw?: (pathname: string) => string;
    hashType?: string;
}
export default function Hash(options?: Options): History;