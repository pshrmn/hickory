import { HistoryConstructor, HistoryOptions, History, LocationComponents, SessionLocation, PartialLocation, Hrefable } from "@hickory/root";
export { HistoryConstructor, HistoryOptions, History, SessionLocation, PartialLocation, Hrefable, LocationComponents };
export interface HashTypeOptions {
    hashType?: string;
}
export declare type HashOptions = HistoryOptions & HashTypeOptions;
export declare type HashHistory = History;
