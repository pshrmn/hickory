import { HickoryLocation, AnyLocation, PartialLocation } from "./location";
import { LocationFactoryOptions, LocationMethods } from "./locationFactory";
import { KeyMethods } from "./keygen";
import {
  ConfirmationFunction,
  ConfirmationMethods
} from "./navigationConfirmation";

export type ToArgument = string | PartialLocation;
export type Action = "PUSH" | "REPLACE" | "POP";
export type NavType = "ANCHOR" | "PUSH" | "REPLACE";

export interface PendingNavigation {
  location: HickoryLocation;
  action: Action;
  finish(): void;
  cancel(nextAction?: Action): void;
  cancelled?: boolean;
}

export type ResponseHandler = (resp: PendingNavigation) => void;

export interface History {
  location: HickoryLocation;
  action: Action;
  toHref(to: AnyLocation): string;
  respondWith(fn: ResponseHandler): void;
  confirmWith(fn?: ConfirmationFunction): void;
  removeConfirmation(): void;
  destroy(): void;
  update(to: ToArgument, navType?: NavType): void;
  go(num?: number): void;
}

export type Options = LocationFactoryOptions;

export type CommonHistory = LocationMethods & ConfirmationMethods & KeyMethods;
