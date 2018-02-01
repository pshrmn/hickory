import {
  History,
  Key,
  Pathname,
  Query,
  Hash,
  State,
  LocationDetails,
  PartialLocation,
  HickoryLocation,
  AnyLocation,
  Options as RootOptions
} from "@hickory/root";
export {
  History,
  HickoryLocation,
  PartialLocation,
  AnyLocation,
  LocationDetails,
  Key,
  Pathname,
  Query,
  Hash,
  State
};
export interface Options extends RootOptions {
  raw?: (pathname: Pathname) => Pathname;
}
export default function Browser(options?: Options): History;
