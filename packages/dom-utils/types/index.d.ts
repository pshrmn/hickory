export declare function ensureEncodedPathname(pathname: string): string;
export declare function domExists(): boolean;
export declare function ignorablePopstateEvent(event: PopStateEvent): boolean;
export declare function getStateFromHistory(): any;
export declare type EventHandler = (event: Event) => void;
export interface EventsObject {
    [key: string]: EventHandler;
}
export declare function createEventCoordinator(events: EventsObject): () => void;
