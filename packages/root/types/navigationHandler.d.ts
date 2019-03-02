import { ResponseHandler, PendingNavigation } from "./types/navigation";
export default function responder(): {
    emitNavigation: (nav: PendingNavigation) => void;
    clearPending: () => boolean;
    cancelPending: (action?: "push" | "replace" | "pop" | undefined) => void;
    setHandler: (fn: ResponseHandler) => void;
};
