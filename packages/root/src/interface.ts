import { SubscriberFn } from './subscriptionCoordinator';
import { ConfirmationFunction } from './navigationConfirmation';

export interface PartialLocation {
  pathname?: string;
  rawPathname?: string;
  query?: any;
  hash?: string
  state?: any;
}

// use HickoryLocation instead of Location to prevent
// errors from colling with window.Location interface
export interface HickoryLocation {
  pathname: string;
  query: any;
  hash: string;
  state?: any;
  key: string;
  rawPathname: string;
}

export type AnyLocation = HickoryLocation | PartialLocation;
export type ToArgument = string | PartialLocation;
export type NavFn = (to: ToArgument) => void;

export interface History {
  location: HickoryLocation;
  action: string;
  toHref: (to: AnyLocation) => string;
  subscribe: (fn: SubscriberFn) => () => void;
  confirmWith: (fn?: ConfirmationFunction) => void;
  removeConfirmation: () => void;
  destroy: () => void;
  navigate: NavFn;
  push: NavFn;
  replace: NavFn;
  go: (num?: number) => void;
}
