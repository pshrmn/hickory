import {
  History,
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
  LocationDetails
};
export interface Options extends RootOptions {
  raw?: (pathname: string) => string;
  hashType?: string;
}
export default function HashHistory(options?: Options): History;
