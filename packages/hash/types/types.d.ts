import { HistoryConstructor, HistoryOptions, History, LocationComponents, SessionLocation, PartialLocation, AnyLocation } from "@hickory/root";
export { HistoryConstructor, HistoryOptions, History, SessionLocation, PartialLocation, AnyLocation, LocationComponents };
export interface HashTypeOptions {
    hash_type?: string;
}
export declare type HashOptions = HistoryOptions & HashTypeOptions;
export declare type HashHistory = History;
