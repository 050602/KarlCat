import * as $protobuf from "protobufjs";

export namespace lanlu {

    interface IPt100_1_tos {
    }

    class Pt100_1_tos implements IPt100_1_tos {
        constructor(properties?: lanlu.IPt100_1_tos);
        public static create(properties?: lanlu.IPt100_1_tos): lanlu.Pt100_1_tos;
        public static encode(message: lanlu.IPt100_1_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt100_1_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt100_1_tos;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt100_1_tos;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt100_1_tos;
        public static toObject(message: lanlu.Pt100_1_tos, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt100_1_toc {
        serverId: number;
    }

    class Pt100_1_toc implements IPt100_1_toc {
        constructor(properties?: lanlu.IPt100_1_toc);
        public serverId: number;
        public static create(properties?: lanlu.IPt100_1_toc): lanlu.Pt100_1_toc;
        public static encode(message: lanlu.IPt100_1_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt100_1_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt100_1_toc;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt100_1_toc;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt100_1_toc;
        public static toObject(message: lanlu.Pt100_1_toc, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt900_1_tos {
        serverId: number;
        time: number;
        accname: string;
        ticket: string;
        where?: (string|null);
    }

    class Pt900_1_tos implements IPt900_1_tos {
        constructor(properties?: lanlu.IPt900_1_tos);
        public serverId: number;
        public time: number;
        public accname: string;
        public ticket: string;
        public where: string;
        public static create(properties?: lanlu.IPt900_1_tos): lanlu.Pt900_1_tos;
        public static encode(message: lanlu.IPt900_1_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt900_1_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt900_1_tos;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt900_1_tos;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt900_1_tos;
        public static toObject(message: lanlu.Pt900_1_tos, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt900_1_toc {
        roleId: number;
        serverTime: number;
        openTime: number;
        mergeTime: number;
        queueNum: number;
        randNickname: string;
    }

    class Pt900_1_toc implements IPt900_1_toc {
        constructor(properties?: lanlu.IPt900_1_toc);
        public roleId: number;
        public serverTime: number;
        public openTime: number;
        public mergeTime: number;
        public queueNum: number;
        public randNickname: string;
        public static create(properties?: lanlu.IPt900_1_toc): lanlu.Pt900_1_toc;
        public static encode(message: lanlu.IPt900_1_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt900_1_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt900_1_toc;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt900_1_toc;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt900_1_toc;
        public static toObject(message: lanlu.Pt900_1_toc, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt900_2_tos {
    }

    class Pt900_2_tos implements IPt900_2_tos {
        constructor(properties?: lanlu.IPt900_2_tos);
        public static create(properties?: lanlu.IPt900_2_tos): lanlu.Pt900_2_tos;
        public static encode(message: lanlu.IPt900_2_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt900_2_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt900_2_tos;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt900_2_tos;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt900_2_tos;
        public static toObject(message: lanlu.Pt900_2_tos, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt900_2_toc {
    }

    class Pt900_2_toc implements IPt900_2_toc {
        constructor(properties?: lanlu.IPt900_2_toc);
        public static create(properties?: lanlu.IPt900_2_toc): lanlu.Pt900_2_toc;
        public static encode(message: lanlu.IPt900_2_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt900_2_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt900_2_toc;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt900_2_toc;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt900_2_toc;
        public static toObject(message: lanlu.Pt900_2_toc, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt900_3_tos {
        roleId: number;
        time: number;
        ticket: string;
        os: string;
        browserType: string;
        browserVersion: string;
        chromeVersion: string;
        isMobile: number;
        renderMode: number;
        mobile: string;
        mobiletype: string;
        fcm: number;
    }

    class Pt900_3_tos implements IPt900_3_tos {
        constructor(properties?: lanlu.IPt900_3_tos);
        public roleId: number;
        public time: number;
        public ticket: string;
        public os: string;
        public browserType: string;
        public browserVersion: string;
        public chromeVersion: string;
        public isMobile: number;
        public renderMode: number;
        public mobile: string;
        public mobiletype: string;
        public fcm: number;
        public static create(properties?: lanlu.IPt900_3_tos): lanlu.Pt900_3_tos;
        public static encode(message: lanlu.IPt900_3_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt900_3_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt900_3_tos;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt900_3_tos;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt900_3_tos;
        public static toObject(message: lanlu.Pt900_3_tos, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt900_3_toc {
        code: number;
    }

    class Pt900_3_toc implements IPt900_3_toc {
        constructor(properties?: lanlu.IPt900_3_toc);
        public code: number;
        public static create(properties?: lanlu.IPt900_3_toc): lanlu.Pt900_3_toc;
        public static encode(message: lanlu.IPt900_3_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt900_3_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt900_3_toc;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt900_3_toc;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt900_3_toc;
        public static toObject(message: lanlu.Pt900_3_toc, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt900_4_tos {
    }

    class Pt900_4_tos implements IPt900_4_tos {
        constructor(properties?: lanlu.IPt900_4_tos);
        public static create(properties?: lanlu.IPt900_4_tos): lanlu.Pt900_4_tos;
        public static encode(message: lanlu.IPt900_4_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt900_4_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt900_4_tos;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt900_4_tos;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt900_4_tos;
        public static toObject(message: lanlu.Pt900_4_tos, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt900_4_toc {
    }

    class Pt900_4_toc implements IPt900_4_toc {
        constructor(properties?: lanlu.IPt900_4_toc);
        public static create(properties?: lanlu.IPt900_4_toc): lanlu.Pt900_4_toc;
        public static encode(message: lanlu.IPt900_4_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt900_4_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt900_4_toc;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt900_4_toc;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt900_4_toc;
        public static toObject(message: lanlu.Pt900_4_toc, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt900_5_tos {
        nickname: string;
    }

    class Pt900_5_tos implements IPt900_5_tos {
        constructor(properties?: lanlu.IPt900_5_tos);
        public nickname: string;
        public static create(properties?: lanlu.IPt900_5_tos): lanlu.Pt900_5_tos;
        public static encode(message: lanlu.IPt900_5_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt900_5_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt900_5_tos;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt900_5_tos;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt900_5_tos;
        public static toObject(message: lanlu.Pt900_5_tos, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt900_5_toc {
        code: number;
    }

    class Pt900_5_toc implements IPt900_5_toc {
        constructor(properties?: lanlu.IPt900_5_toc);
        public code: number;
        public static create(properties?: lanlu.IPt900_5_toc): lanlu.Pt900_5_toc;
        public static encode(message: lanlu.IPt900_5_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt900_5_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt900_5_toc;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt900_5_toc;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt900_5_toc;
        public static toObject(message: lanlu.Pt900_5_toc, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt900_6_tos {
    }

    class Pt900_6_tos implements IPt900_6_tos {
        constructor(properties?: lanlu.IPt900_6_tos);
        public static create(properties?: lanlu.IPt900_6_tos): lanlu.Pt900_6_tos;
        public static encode(message: lanlu.IPt900_6_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt900_6_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt900_6_tos;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt900_6_tos;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt900_6_tos;
        public static toObject(message: lanlu.Pt900_6_tos, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt900_6_toc {
        queueNum: number;
    }

    class Pt900_6_toc implements IPt900_6_toc {
        constructor(properties?: lanlu.IPt900_6_toc);
        public queueNum: number;
        public static create(properties?: lanlu.IPt900_6_toc): lanlu.Pt900_6_toc;
        public static encode(message: lanlu.IPt900_6_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt900_6_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt900_6_toc;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt900_6_toc;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt900_6_toc;
        public static toObject(message: lanlu.Pt900_6_toc, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt900_7_tos {
    }

    class Pt900_7_tos implements IPt900_7_tos {
        constructor(properties?: lanlu.IPt900_7_tos);
        public static create(properties?: lanlu.IPt900_7_tos): lanlu.Pt900_7_tos;
        public static encode(message: lanlu.IPt900_7_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt900_7_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt900_7_tos;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt900_7_tos;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt900_7_tos;
        public static toObject(message: lanlu.Pt900_7_tos, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt900_7_toc {
    }

    class Pt900_7_toc implements IPt900_7_toc {
        constructor(properties?: lanlu.IPt900_7_toc);
        public static create(properties?: lanlu.IPt900_7_toc): lanlu.Pt900_7_toc;
        public static encode(message: lanlu.IPt900_7_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt900_7_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt900_7_toc;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt900_7_toc;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt900_7_toc;
        public static toObject(message: lanlu.Pt900_7_toc, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt900_8_tos {
    }

    class Pt900_8_tos implements IPt900_8_tos {
        constructor(properties?: lanlu.IPt900_8_tos);
        public static create(properties?: lanlu.IPt900_8_tos): lanlu.Pt900_8_tos;
        public static encode(message: lanlu.IPt900_8_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt900_8_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt900_8_tos;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt900_8_tos;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt900_8_tos;
        public static toObject(message: lanlu.Pt900_8_tos, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt900_8_toc {
        msg: string;
    }

    class Pt900_8_toc implements IPt900_8_toc {
        constructor(properties?: lanlu.IPt900_8_toc);
        public msg: string;
        public static create(properties?: lanlu.IPt900_8_toc): lanlu.Pt900_8_toc;
        public static encode(message: lanlu.IPt900_8_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt900_8_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt900_8_toc;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt900_8_toc;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt900_8_toc;
        public static toObject(message: lanlu.Pt900_8_toc, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt900_9_tos {
    }

    class Pt900_9_tos implements IPt900_9_tos {
        constructor(properties?: lanlu.IPt900_9_tos);
        public static create(properties?: lanlu.IPt900_9_tos): lanlu.Pt900_9_tos;
        public static encode(message: lanlu.IPt900_9_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt900_9_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt900_9_tos;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt900_9_tos;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt900_9_tos;
        public static toObject(message: lanlu.Pt900_9_tos, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt900_9_toc {
        msg: string;
    }

    class Pt900_9_toc implements IPt900_9_toc {
        constructor(properties?: lanlu.IPt900_9_toc);
        public msg: string;
        public static create(properties?: lanlu.IPt900_9_toc): lanlu.Pt900_9_toc;
        public static encode(message: lanlu.IPt900_9_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt900_9_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt900_9_toc;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt900_9_toc;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt900_9_toc;
        public static toObject(message: lanlu.Pt900_9_toc, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt900_999_tos {
    }

    class Pt900_999_tos implements IPt900_999_tos {
        constructor(properties?: lanlu.IPt900_999_tos);
        public static create(properties?: lanlu.IPt900_999_tos): lanlu.Pt900_999_tos;
        public static encode(message: lanlu.IPt900_999_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt900_999_tos, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt900_999_tos;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt900_999_tos;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt900_999_tos;
        public static toObject(message: lanlu.Pt900_999_tos, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }

    interface IPt900_999_toc {
        code: number;
    }

    class Pt900_999_toc implements IPt900_999_toc {
        constructor(properties?: lanlu.IPt900_999_toc);
        public code: number;
        public static create(properties?: lanlu.IPt900_999_toc): lanlu.Pt900_999_toc;
        public static encode(message: lanlu.IPt900_999_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static encodeDelimited(message: lanlu.IPt900_999_toc, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): lanlu.Pt900_999_toc;
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): lanlu.Pt900_999_toc;
        public static verify(message: { [k: string]: any }): (string|null);
        public static fromObject(object: { [k: string]: any }): lanlu.Pt900_999_toc;
        public static toObject(message: lanlu.Pt900_999_toc, options?: $protobuf.IConversionOptions): { [k: string]: any };
        public toJSON(): { [k: string]: any };
    }
}
 
 export {}