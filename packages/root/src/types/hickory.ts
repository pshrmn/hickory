import { SessionLocation, AnyLocation, PartialLocation } from "./location";
import { LocationFactoryOptions, LocationMethods } from "./locationFactory";
import { KeyMethods } from "./keygen";
import {
  ConfirmationFunction,
  ConfirmationMethods
} from "./navigationConfirmation";

export type ToArgument<Q> = string | PartialLocation<Q>;

export type Action = "push" | "replace" | "pop";
export type NavType = "anchor" | "push" | "replace";

export interface PendingNavigation<Q> {
  location: SessionLocation<Q>;
  action: Action;
  finish(): void;
  cancel(nextAction?: Action): void;
  cancelled?: boolean;
}

export type ResponseHandler<Q> = (resp: PendingNavigation<Q>) => void;

export interface History<Q> {
  location: SessionLocation<Q>;
  action: Action;
  toHref(to: AnyLocation<Q>): string;
  respondWith(fn: ResponseHandler<Q>): void;
  confirmWith(fn?: ConfirmationFunction<Q>): void;
  removeConfirmation(): void;
  destroy(): void;
  navigate(to: ToArgument<Q>, navType?: NavType): void;
  go(num?: number): void;
}

export type Options<Q> = LocationFactoryOptions<Q>;

export type CommonHistory<Q> = LocationMethods<Q> &
  ConfirmationMethods<Q> &
  KeyMethods;
