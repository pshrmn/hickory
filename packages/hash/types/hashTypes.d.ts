export interface EncodingFns {
    encode: (path: string) => string;
    decode: (path: string) => string;
}
export default function hash_encoder_and_decoder(type?: string): EncodingFns;
