import { ResponseHandler, PendingNavigation } from "./types/navigation";
export default function navigationHandler(): {
    emitNavigation: (nav: PendingNavigation) => void;
    cancelPending: (action?: "push" | "replace" | "pop" | undefined) => void;
    setHandler: (fn: ResponseHandler) => void;
};
