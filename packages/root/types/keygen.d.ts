export interface KeyMethods {
    keygen: KeyFns;
}
export interface KeyFns {
    major(previous?: string): string;
    minor(current: string): string;
    diff(first: string, second: string): number;
}
export default function createKeyGenerator(initial?: number): KeyMethods;