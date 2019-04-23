export interface BaseFunctions {
    add(pathname: string): string;
    remove(pathname: string): string;
}
export interface BaseOptions {
    emptyRoot?: boolean;
    strict?: boolean;
}
