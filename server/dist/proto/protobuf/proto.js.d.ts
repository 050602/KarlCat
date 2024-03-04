import * as $protobuf from "./protobuf.js";

export namespace lanlu {

    interface IPt10001 {
        username?: (string|null);
    }

    class Pt10001 implements IPt10001 {
        constructor(properties?: lanlu.IPt10001);
        public username: string;
        public static create(properties?: lanlu.IPt10001): lanlu.Pt10001;
        public static encode(message: lanlu.IPt10001, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt10001, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt10001;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt10001;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt10001;
        public static toObject(message: lanlu.Pt10001, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt10002 {
        code?: (number|null);
    }

    class Pt10002 implements IPt10002 {
        constructor(properties?: lanlu.IPt10002);
        public code: number;
        public static create(properties?: lanlu.IPt10002): lanlu.Pt10002;
        public static encode(message: lanlu.IPt10002, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt10002, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt10002;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt10002;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt10002;
        public static toObject(message: lanlu.Pt10002, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }
}
 
 export {}