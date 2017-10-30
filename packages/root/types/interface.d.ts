import { SubscriberFn } from './subscriptionCoordinator';
import { ConfirmationFunction } from './navigationConfirmation';
export interface PartialLocation {
    pathname?: string;
    rawPathname?: string;
    query?: any;
    hash?: string;
    state?: any;
}
export interface HickoryLocation {
    pathname: string;
    query: any;
    hash: string;
    state?: any;
    key: string;
    rawPathname: string;
}
export declare type AnyLocation = HickoryLocation | PartialLocation;
export declare type ToArgument = string | PartialLocation;
export declare type NavFn = (to: ToArgument) => void;
export interface History {
    location: HickoryLocation;
    action: string;
    toHref: (to: AnyLocation) => string;
    subscribe: (fn: SubscriberFn) => () => void;
    confirmWith: (fn?: ConfirmationFunction) => void;
    removeConfirmation: () => void;
    destroy: () => void;
    update: NavFn;
    push: NavFn;
    replace: NavFn;
    go: (num?: number) => void;
}
