import { PartialLocation, SessionLocation } from "./location";

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
