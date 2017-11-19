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
export declare type Action = 'PUSH' | 'REPLACE' | 'POP';
export interface PendingNavigation {
    location: HickoryLocation;
    action: Action;
    finish(): void;
    cancel(nextAction?: Action): void;
}
export declare type NavFn = (to: ToArgument) => void;
export declare type ResponseHandler = (resp: PendingNavigation) => void;
export interface History {
    location: HickoryLocation;
    action: Action;
    toHref(to: AnyLocation): string;
    respondWith(fn: ResponseHandler): void;
    confirmWith(fn?: ConfirmationFunction): void;
    removeConfirmation(): void;
    destroy(): void;
    navigate: NavFn;
    push: NavFn;
    replace: NavFn;
    go(num?: number): void;
}
