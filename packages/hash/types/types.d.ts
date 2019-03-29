import { HistoryConstructor, HistoryOptions, History, LocationComponents, SessionLocation, PartialLocation, Hrefable } from "@hickory/root";
export { HistoryConstructor, HistoryOptions, History, SessionLocation, PartialLocation, Hrefable, LocationComponents };
export interface HashTypeOptions {
    hash_type?: string;
}
export declare type HashOptions = HistoryOptions & HashTypeOptions;
export declare type HashHistory = History;
