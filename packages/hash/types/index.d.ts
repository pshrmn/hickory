import {
  History,
  Key,
  Pathname,
  Query,
  Hash,
  State,
  LocationDetails,
  HickoryLocation,
  PartialLocation,
  AnyLocation,
  Options as RootOptions
} from "@hickory/root";
export {
  History,
  HickoryLocation,
  PartialLocation,
  AnyLocation,
  Key,
  Pathname,
  Query,
  Hash,
  State,
  LocationDetails
};
export interface Options extends RootOptions {
  raw?: (pathname: string) => string;
  hashType?: string;
}
export default function HashHistory(options?: Options): History;
