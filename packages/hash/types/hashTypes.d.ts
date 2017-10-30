export interface EncodingFns {
    encode: (path: string) => string;
    decode: (path: string) => string;
}
export default function hashEncoderAndDecoder(type?: string): EncodingFns;
