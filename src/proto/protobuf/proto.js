const protobuf = require("./protobuf");
global.lanlu = (function($protobuf) {
"use strict";
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.lanlu = (function() {

    var lanlu = {};

    lanlu.Pt100_1_tos = (function() {

        function Pt100_1_tos(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt100_1_tos.create = function create(properties) {
            return new Pt100_1_tos(properties);
        };

        Pt100_1_tos.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        Pt100_1_tos.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt100_1_tos.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt100_1_tos();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        Pt100_1_tos.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt100_1_tos.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        Pt100_1_tos.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt100_1_tos)
                return object;
            return new $root.lanlu.Pt100_1_tos();
        };

        Pt100_1_tos.toObject = function toObject() {
            return {};
        };

        Pt100_1_tos.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt100_1_tos;
    })();

    lanlu.Pt100_1_toc = (function() {

        function Pt100_1_toc(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt100_1_toc.prototype.serverId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        Pt100_1_toc.create = function create(properties) {
            return new Pt100_1_toc(properties);
        };

        Pt100_1_toc.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(8).uint64(message.serverId);
            return writer;
        };

        Pt100_1_toc.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt100_1_toc.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt100_1_toc();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.serverId = reader.uint64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("serverId"))
                throw $util.ProtocolError("missing required 'serverId'", { instance: message });
            return message;
        };

        Pt100_1_toc.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt100_1_toc.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.serverId) && !(message.serverId && $util.isInteger(message.serverId.low) && $util.isInteger(message.serverId.high)))
                return "serverId: integer|Long expected";
            return null;
        };

        Pt100_1_toc.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt100_1_toc)
                return object;
            var message = new $root.lanlu.Pt100_1_toc();
            if (object.serverId != null)
                if ($util.Long)
                    (message.serverId = $util.Long.fromValue(object.serverId)).unsigned = true;
                else if (typeof object.serverId === "string")
                    message.serverId = parseInt(object.serverId, 10);
                else if (typeof object.serverId === "number")
                    message.serverId = object.serverId;
                else if (typeof object.serverId === "object")
                    message.serverId = new $util.LongBits(object.serverId.low >>> 0, object.serverId.high >>> 0).toNumber(true);
            return message;
        };

        Pt100_1_toc.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.serverId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.serverId = options.longs === String ? "0" : 0;
            if (message.serverId != null && message.hasOwnProperty("serverId"))
                if (typeof message.serverId === "number")
                    object.serverId = options.longs === String ? String(message.serverId) : message.serverId;
                else
                    object.serverId = options.longs === String ? $util.Long.prototype.toString.call(message.serverId) : options.longs === Number ? new $util.LongBits(message.serverId.low >>> 0, message.serverId.high >>> 0).toNumber(true) : message.serverId;
            return object;
        };

        Pt100_1_toc.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt100_1_toc;
    })();

    lanlu.Pt900_1_tos = (function() {

        function Pt900_1_tos(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt900_1_tos.prototype.serverId = 0;
        Pt900_1_tos.prototype.time = 0;
        Pt900_1_tos.prototype.accname = "";
        Pt900_1_tos.prototype.ticket = "";
        Pt900_1_tos.prototype.where = "";

        Pt900_1_tos.create = function create(properties) {
            return new Pt900_1_tos(properties);
        };

        Pt900_1_tos.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(8).uint32(message.serverId);
            writer.uint32(16).uint32(message.time);
            writer.uint32(26).string(message.accname);
            writer.uint32(34).string(message.ticket);
            if (message.where != null && Object.hasOwnProperty.call(message, "where"))
                writer.uint32(42).string(message.where);
            return writer;
        };

        Pt900_1_tos.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt900_1_tos.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt900_1_tos();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.serverId = reader.uint32();
                    break;
                case 2:
                    message.time = reader.uint32();
                    break;
                case 3:
                    message.accname = reader.string();
                    break;
                case 4:
                    message.ticket = reader.string();
                    break;
                case 5:
                    message.where = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("serverId"))
                throw $util.ProtocolError("missing required 'serverId'", { instance: message });
            if (!message.hasOwnProperty("time"))
                throw $util.ProtocolError("missing required 'time'", { instance: message });
            if (!message.hasOwnProperty("accname"))
                throw $util.ProtocolError("missing required 'accname'", { instance: message });
            if (!message.hasOwnProperty("ticket"))
                throw $util.ProtocolError("missing required 'ticket'", { instance: message });
            return message;
        };

        Pt900_1_tos.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt900_1_tos.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.serverId))
                return "serverId: integer expected";
            if (!$util.isInteger(message.time))
                return "time: integer expected";
            if (!$util.isString(message.accname))
                return "accname: string expected";
            if (!$util.isString(message.ticket))
                return "ticket: string expected";
            if (message.where != null && message.hasOwnProperty("where"))
                if (!$util.isString(message.where))
                    return "where: string expected";
            return null;
        };

        Pt900_1_tos.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt900_1_tos)
                return object;
            var message = new $root.lanlu.Pt900_1_tos();
            if (object.serverId != null)
                message.serverId = object.serverId >>> 0;
            if (object.time != null)
                message.time = object.time >>> 0;
            if (object.accname != null)
                message.accname = String(object.accname);
            if (object.ticket != null)
                message.ticket = String(object.ticket);
            if (object.where != null)
                message.where = String(object.where);
            return message;
        };

        Pt900_1_tos.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.serverId = 0;
                object.time = 0;
                object.accname = "";
                object.ticket = "";
                object.where = "";
            }
            if (message.serverId != null && message.hasOwnProperty("serverId"))
                object.serverId = message.serverId;
            if (message.time != null && message.hasOwnProperty("time"))
                object.time = message.time;
            if (message.accname != null && message.hasOwnProperty("accname"))
                object.accname = message.accname;
            if (message.ticket != null && message.hasOwnProperty("ticket"))
                object.ticket = message.ticket;
            if (message.where != null && message.hasOwnProperty("where"))
                object.where = message.where;
            return object;
        };

        Pt900_1_tos.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt900_1_tos;
    })();

    lanlu.Pt900_1_toc = (function() {

        function Pt900_1_toc(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt900_1_toc.prototype.roleId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;
        Pt900_1_toc.prototype.serverTime = $util.Long ? $util.Long.fromBits(0,0,true) : 0;
        Pt900_1_toc.prototype.openTime = 0;
        Pt900_1_toc.prototype.mergeTime = 0;
        Pt900_1_toc.prototype.queueNum = 0;
        Pt900_1_toc.prototype.randNickname = "";

        Pt900_1_toc.create = function create(properties) {
            return new Pt900_1_toc(properties);
        };

        Pt900_1_toc.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(8).uint64(message.roleId);
            writer.uint32(16).uint64(message.serverTime);
            writer.uint32(24).uint32(message.openTime);
            writer.uint32(32).uint32(message.mergeTime);
            writer.uint32(40).uint32(message.queueNum);
            writer.uint32(50).string(message.randNickname);
            return writer;
        };

        Pt900_1_toc.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt900_1_toc.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt900_1_toc();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.roleId = reader.uint64();
                    break;
                case 2:
                    message.serverTime = reader.uint64();
                    break;
                case 3:
                    message.openTime = reader.uint32();
                    break;
                case 4:
                    message.mergeTime = reader.uint32();
                    break;
                case 5:
                    message.queueNum = reader.uint32();
                    break;
                case 6:
                    message.randNickname = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("roleId"))
                throw $util.ProtocolError("missing required 'roleId'", { instance: message });
            if (!message.hasOwnProperty("serverTime"))
                throw $util.ProtocolError("missing required 'serverTime'", { instance: message });
            if (!message.hasOwnProperty("openTime"))
                throw $util.ProtocolError("missing required 'openTime'", { instance: message });
            if (!message.hasOwnProperty("mergeTime"))
                throw $util.ProtocolError("missing required 'mergeTime'", { instance: message });
            if (!message.hasOwnProperty("queueNum"))
                throw $util.ProtocolError("missing required 'queueNum'", { instance: message });
            if (!message.hasOwnProperty("randNickname"))
                throw $util.ProtocolError("missing required 'randNickname'", { instance: message });
            return message;
        };

        Pt900_1_toc.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt900_1_toc.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.roleId) && !(message.roleId && $util.isInteger(message.roleId.low) && $util.isInteger(message.roleId.high)))
                return "roleId: integer|Long expected";
            if (!$util.isInteger(message.serverTime) && !(message.serverTime && $util.isInteger(message.serverTime.low) && $util.isInteger(message.serverTime.high)))
                return "serverTime: integer|Long expected";
            if (!$util.isInteger(message.openTime))
                return "openTime: integer expected";
            if (!$util.isInteger(message.mergeTime))
                return "mergeTime: integer expected";
            if (!$util.isInteger(message.queueNum))
                return "queueNum: integer expected";
            if (!$util.isString(message.randNickname))
                return "randNickname: string expected";
            return null;
        };

        Pt900_1_toc.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt900_1_toc)
                return object;
            var message = new $root.lanlu.Pt900_1_toc();
            if (object.roleId != null)
                if ($util.Long)
                    (message.roleId = $util.Long.fromValue(object.roleId)).unsigned = true;
                else if (typeof object.roleId === "string")
                    message.roleId = parseInt(object.roleId, 10);
                else if (typeof object.roleId === "number")
                    message.roleId = object.roleId;
                else if (typeof object.roleId === "object")
                    message.roleId = new $util.LongBits(object.roleId.low >>> 0, object.roleId.high >>> 0).toNumber(true);
            if (object.serverTime != null)
                if ($util.Long)
                    (message.serverTime = $util.Long.fromValue(object.serverTime)).unsigned = true;
                else if (typeof object.serverTime === "string")
                    message.serverTime = parseInt(object.serverTime, 10);
                else if (typeof object.serverTime === "number")
                    message.serverTime = object.serverTime;
                else if (typeof object.serverTime === "object")
                    message.serverTime = new $util.LongBits(object.serverTime.low >>> 0, object.serverTime.high >>> 0).toNumber(true);
            if (object.openTime != null)
                message.openTime = object.openTime >>> 0;
            if (object.mergeTime != null)
                message.mergeTime = object.mergeTime >>> 0;
            if (object.queueNum != null)
                message.queueNum = object.queueNum >>> 0;
            if (object.randNickname != null)
                message.randNickname = String(object.randNickname);
            return message;
        };

        Pt900_1_toc.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.roleId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.roleId = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.serverTime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.serverTime = options.longs === String ? "0" : 0;
                object.openTime = 0;
                object.mergeTime = 0;
                object.queueNum = 0;
                object.randNickname = "";
            }
            if (message.roleId != null && message.hasOwnProperty("roleId"))
                if (typeof message.roleId === "number")
                    object.roleId = options.longs === String ? String(message.roleId) : message.roleId;
                else
                    object.roleId = options.longs === String ? $util.Long.prototype.toString.call(message.roleId) : options.longs === Number ? new $util.LongBits(message.roleId.low >>> 0, message.roleId.high >>> 0).toNumber(true) : message.roleId;
            if (message.serverTime != null && message.hasOwnProperty("serverTime"))
                if (typeof message.serverTime === "number")
                    object.serverTime = options.longs === String ? String(message.serverTime) : message.serverTime;
                else
                    object.serverTime = options.longs === String ? $util.Long.prototype.toString.call(message.serverTime) : options.longs === Number ? new $util.LongBits(message.serverTime.low >>> 0, message.serverTime.high >>> 0).toNumber(true) : message.serverTime;
            if (message.openTime != null && message.hasOwnProperty("openTime"))
                object.openTime = message.openTime;
            if (message.mergeTime != null && message.hasOwnProperty("mergeTime"))
                object.mergeTime = message.mergeTime;
            if (message.queueNum != null && message.hasOwnProperty("queueNum"))
                object.queueNum = message.queueNum;
            if (message.randNickname != null && message.hasOwnProperty("randNickname"))
                object.randNickname = message.randNickname;
            return object;
        };

        Pt900_1_toc.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt900_1_toc;
    })();

    lanlu.Pt900_2_tos = (function() {

        function Pt900_2_tos(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt900_2_tos.create = function create(properties) {
            return new Pt900_2_tos(properties);
        };

        Pt900_2_tos.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        Pt900_2_tos.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt900_2_tos.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt900_2_tos();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        Pt900_2_tos.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt900_2_tos.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        Pt900_2_tos.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt900_2_tos)
                return object;
            return new $root.lanlu.Pt900_2_tos();
        };

        Pt900_2_tos.toObject = function toObject() {
            return {};
        };

        Pt900_2_tos.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt900_2_tos;
    })();

    lanlu.Pt900_2_toc = (function() {

        function Pt900_2_toc(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt900_2_toc.create = function create(properties) {
            return new Pt900_2_toc(properties);
        };

        Pt900_2_toc.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        Pt900_2_toc.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt900_2_toc.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt900_2_toc();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        Pt900_2_toc.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt900_2_toc.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        Pt900_2_toc.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt900_2_toc)
                return object;
            return new $root.lanlu.Pt900_2_toc();
        };

        Pt900_2_toc.toObject = function toObject() {
            return {};
        };

        Pt900_2_toc.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt900_2_toc;
    })();

    lanlu.Pt900_3_tos = (function() {

        function Pt900_3_tos(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt900_3_tos.prototype.roleId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;
        Pt900_3_tos.prototype.time = 0;
        Pt900_3_tos.prototype.ticket = "";
        Pt900_3_tos.prototype.os = "";
        Pt900_3_tos.prototype.browserType = "";
        Pt900_3_tos.prototype.browserVersion = "";
        Pt900_3_tos.prototype.chromeVersion = "";
        Pt900_3_tos.prototype.isMobile = 0;
        Pt900_3_tos.prototype.renderMode = 0;
        Pt900_3_tos.prototype.mobile = "";
        Pt900_3_tos.prototype.mobiletype = "";
        Pt900_3_tos.prototype.fcm = 0;

        Pt900_3_tos.create = function create(properties) {
            return new Pt900_3_tos(properties);
        };

        Pt900_3_tos.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(8).uint64(message.roleId);
            writer.uint32(16).uint32(message.time);
            writer.uint32(26).string(message.ticket);
            writer.uint32(34).string(message.os);
            writer.uint32(42).string(message.browserType);
            writer.uint32(50).string(message.browserVersion);
            writer.uint32(58).string(message.chromeVersion);
            writer.uint32(64).uint32(message.isMobile);
            writer.uint32(72).uint32(message.renderMode);
            writer.uint32(82).string(message.mobile);
            writer.uint32(90).string(message.mobiletype);
            writer.uint32(96).uint32(message.fcm);
            return writer;
        };

        Pt900_3_tos.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt900_3_tos.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt900_3_tos();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.roleId = reader.uint64();
                    break;
                case 2:
                    message.time = reader.uint32();
                    break;
                case 3:
                    message.ticket = reader.string();
                    break;
                case 4:
                    message.os = reader.string();
                    break;
                case 5:
                    message.browserType = reader.string();
                    break;
                case 6:
                    message.browserVersion = reader.string();
                    break;
                case 7:
                    message.chromeVersion = reader.string();
                    break;
                case 8:
                    message.isMobile = reader.uint32();
                    break;
                case 9:
                    message.renderMode = reader.uint32();
                    break;
                case 10:
                    message.mobile = reader.string();
                    break;
                case 11:
                    message.mobiletype = reader.string();
                    break;
                case 12:
                    message.fcm = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("roleId"))
                throw $util.ProtocolError("missing required 'roleId'", { instance: message });
            if (!message.hasOwnProperty("time"))
                throw $util.ProtocolError("missing required 'time'", { instance: message });
            if (!message.hasOwnProperty("ticket"))
                throw $util.ProtocolError("missing required 'ticket'", { instance: message });
            if (!message.hasOwnProperty("os"))
                throw $util.ProtocolError("missing required 'os'", { instance: message });
            if (!message.hasOwnProperty("browserType"))
                throw $util.ProtocolError("missing required 'browserType'", { instance: message });
            if (!message.hasOwnProperty("browserVersion"))
                throw $util.ProtocolError("missing required 'browserVersion'", { instance: message });
            if (!message.hasOwnProperty("chromeVersion"))
                throw $util.ProtocolError("missing required 'chromeVersion'", { instance: message });
            if (!message.hasOwnProperty("isMobile"))
                throw $util.ProtocolError("missing required 'isMobile'", { instance: message });
            if (!message.hasOwnProperty("renderMode"))
                throw $util.ProtocolError("missing required 'renderMode'", { instance: message });
            if (!message.hasOwnProperty("mobile"))
                throw $util.ProtocolError("missing required 'mobile'", { instance: message });
            if (!message.hasOwnProperty("mobiletype"))
                throw $util.ProtocolError("missing required 'mobiletype'", { instance: message });
            if (!message.hasOwnProperty("fcm"))
                throw $util.ProtocolError("missing required 'fcm'", { instance: message });
            return message;
        };

        Pt900_3_tos.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt900_3_tos.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.roleId) && !(message.roleId && $util.isInteger(message.roleId.low) && $util.isInteger(message.roleId.high)))
                return "roleId: integer|Long expected";
            if (!$util.isInteger(message.time))
                return "time: integer expected";
            if (!$util.isString(message.ticket))
                return "ticket: string expected";
            if (!$util.isString(message.os))
                return "os: string expected";
            if (!$util.isString(message.browserType))
                return "browserType: string expected";
            if (!$util.isString(message.browserVersion))
                return "browserVersion: string expected";
            if (!$util.isString(message.chromeVersion))
                return "chromeVersion: string expected";
            if (!$util.isInteger(message.isMobile))
                return "isMobile: integer expected";
            if (!$util.isInteger(message.renderMode))
                return "renderMode: integer expected";
            if (!$util.isString(message.mobile))
                return "mobile: string expected";
            if (!$util.isString(message.mobiletype))
                return "mobiletype: string expected";
            if (!$util.isInteger(message.fcm))
                return "fcm: integer expected";
            return null;
        };

        Pt900_3_tos.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt900_3_tos)
                return object;
            var message = new $root.lanlu.Pt900_3_tos();
            if (object.roleId != null)
                if ($util.Long)
                    (message.roleId = $util.Long.fromValue(object.roleId)).unsigned = true;
                else if (typeof object.roleId === "string")
                    message.roleId = parseInt(object.roleId, 10);
                else if (typeof object.roleId === "number")
                    message.roleId = object.roleId;
                else if (typeof object.roleId === "object")
                    message.roleId = new $util.LongBits(object.roleId.low >>> 0, object.roleId.high >>> 0).toNumber(true);
            if (object.time != null)
                message.time = object.time >>> 0;
            if (object.ticket != null)
                message.ticket = String(object.ticket);
            if (object.os != null)
                message.os = String(object.os);
            if (object.browserType != null)
                message.browserType = String(object.browserType);
            if (object.browserVersion != null)
                message.browserVersion = String(object.browserVersion);
            if (object.chromeVersion != null)
                message.chromeVersion = String(object.chromeVersion);
            if (object.isMobile != null)
                message.isMobile = object.isMobile >>> 0;
            if (object.renderMode != null)
                message.renderMode = object.renderMode >>> 0;
            if (object.mobile != null)
                message.mobile = String(object.mobile);
            if (object.mobiletype != null)
                message.mobiletype = String(object.mobiletype);
            if (object.fcm != null)
                message.fcm = object.fcm >>> 0;
            return message;
        };

        Pt900_3_tos.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.roleId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.roleId = options.longs === String ? "0" : 0;
                object.time = 0;
                object.ticket = "";
                object.os = "";
                object.browserType = "";
                object.browserVersion = "";
                object.chromeVersion = "";
                object.isMobile = 0;
                object.renderMode = 0;
                object.mobile = "";
                object.mobiletype = "";
                object.fcm = 0;
            }
            if (message.roleId != null && message.hasOwnProperty("roleId"))
                if (typeof message.roleId === "number")
                    object.roleId = options.longs === String ? String(message.roleId) : message.roleId;
                else
                    object.roleId = options.longs === String ? $util.Long.prototype.toString.call(message.roleId) : options.longs === Number ? new $util.LongBits(message.roleId.low >>> 0, message.roleId.high >>> 0).toNumber(true) : message.roleId;
            if (message.time != null && message.hasOwnProperty("time"))
                object.time = message.time;
            if (message.ticket != null && message.hasOwnProperty("ticket"))
                object.ticket = message.ticket;
            if (message.os != null && message.hasOwnProperty("os"))
                object.os = message.os;
            if (message.browserType != null && message.hasOwnProperty("browserType"))
                object.browserType = message.browserType;
            if (message.browserVersion != null && message.hasOwnProperty("browserVersion"))
                object.browserVersion = message.browserVersion;
            if (message.chromeVersion != null && message.hasOwnProperty("chromeVersion"))
                object.chromeVersion = message.chromeVersion;
            if (message.isMobile != null && message.hasOwnProperty("isMobile"))
                object.isMobile = message.isMobile;
            if (message.renderMode != null && message.hasOwnProperty("renderMode"))
                object.renderMode = message.renderMode;
            if (message.mobile != null && message.hasOwnProperty("mobile"))
                object.mobile = message.mobile;
            if (message.mobiletype != null && message.hasOwnProperty("mobiletype"))
                object.mobiletype = message.mobiletype;
            if (message.fcm != null && message.hasOwnProperty("fcm"))
                object.fcm = message.fcm;
            return object;
        };

        Pt900_3_tos.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt900_3_tos;
    })();

    lanlu.Pt900_3_toc = (function() {

        function Pt900_3_toc(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt900_3_toc.prototype.code = 0;

        Pt900_3_toc.create = function create(properties) {
            return new Pt900_3_toc(properties);
        };

        Pt900_3_toc.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(8).uint32(message.code);
            return writer;
        };

        Pt900_3_toc.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt900_3_toc.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt900_3_toc();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.code = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("code"))
                throw $util.ProtocolError("missing required 'code'", { instance: message });
            return message;
        };

        Pt900_3_toc.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt900_3_toc.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.code))
                return "code: integer expected";
            return null;
        };

        Pt900_3_toc.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt900_3_toc)
                return object;
            var message = new $root.lanlu.Pt900_3_toc();
            if (object.code != null)
                message.code = object.code >>> 0;
            return message;
        };

        Pt900_3_toc.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.code = 0;
            if (message.code != null && message.hasOwnProperty("code"))
                object.code = message.code;
            return object;
        };

        Pt900_3_toc.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt900_3_toc;
    })();

    lanlu.Pt900_4_tos = (function() {

        function Pt900_4_tos(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt900_4_tos.create = function create(properties) {
            return new Pt900_4_tos(properties);
        };

        Pt900_4_tos.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        Pt900_4_tos.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt900_4_tos.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt900_4_tos();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        Pt900_4_tos.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt900_4_tos.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        Pt900_4_tos.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt900_4_tos)
                return object;
            return new $root.lanlu.Pt900_4_tos();
        };

        Pt900_4_tos.toObject = function toObject() {
            return {};
        };

        Pt900_4_tos.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt900_4_tos;
    })();

    lanlu.Pt900_4_toc = (function() {

        function Pt900_4_toc(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt900_4_toc.create = function create(properties) {
            return new Pt900_4_toc(properties);
        };

        Pt900_4_toc.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        Pt900_4_toc.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt900_4_toc.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt900_4_toc();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        Pt900_4_toc.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt900_4_toc.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        Pt900_4_toc.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt900_4_toc)
                return object;
            return new $root.lanlu.Pt900_4_toc();
        };

        Pt900_4_toc.toObject = function toObject() {
            return {};
        };

        Pt900_4_toc.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt900_4_toc;
    })();

    lanlu.Pt900_5_tos = (function() {

        function Pt900_5_tos(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt900_5_tos.prototype.nickname = "";

        Pt900_5_tos.create = function create(properties) {
            return new Pt900_5_tos(properties);
        };

        Pt900_5_tos.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(10).string(message.nickname);
            return writer;
        };

        Pt900_5_tos.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt900_5_tos.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt900_5_tos();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.nickname = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("nickname"))
                throw $util.ProtocolError("missing required 'nickname'", { instance: message });
            return message;
        };

        Pt900_5_tos.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt900_5_tos.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isString(message.nickname))
                return "nickname: string expected";
            return null;
        };

        Pt900_5_tos.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt900_5_tos)
                return object;
            var message = new $root.lanlu.Pt900_5_tos();
            if (object.nickname != null)
                message.nickname = String(object.nickname);
            return message;
        };

        Pt900_5_tos.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.nickname = "";
            if (message.nickname != null && message.hasOwnProperty("nickname"))
                object.nickname = message.nickname;
            return object;
        };

        Pt900_5_tos.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt900_5_tos;
    })();

    lanlu.Pt900_5_toc = (function() {

        function Pt900_5_toc(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt900_5_toc.prototype.code = 0;

        Pt900_5_toc.create = function create(properties) {
            return new Pt900_5_toc(properties);
        };

        Pt900_5_toc.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(8).uint32(message.code);
            return writer;
        };

        Pt900_5_toc.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt900_5_toc.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt900_5_toc();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.code = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("code"))
                throw $util.ProtocolError("missing required 'code'", { instance: message });
            return message;
        };

        Pt900_5_toc.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt900_5_toc.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.code))
                return "code: integer expected";
            return null;
        };

        Pt900_5_toc.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt900_5_toc)
                return object;
            var message = new $root.lanlu.Pt900_5_toc();
            if (object.code != null)
                message.code = object.code >>> 0;
            return message;
        };

        Pt900_5_toc.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.code = 0;
            if (message.code != null && message.hasOwnProperty("code"))
                object.code = message.code;
            return object;
        };

        Pt900_5_toc.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt900_5_toc;
    })();

    lanlu.Pt900_6_tos = (function() {

        function Pt900_6_tos(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt900_6_tos.create = function create(properties) {
            return new Pt900_6_tos(properties);
        };

        Pt900_6_tos.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        Pt900_6_tos.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt900_6_tos.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt900_6_tos();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        Pt900_6_tos.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt900_6_tos.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        Pt900_6_tos.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt900_6_tos)
                return object;
            return new $root.lanlu.Pt900_6_tos();
        };

        Pt900_6_tos.toObject = function toObject() {
            return {};
        };

        Pt900_6_tos.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt900_6_tos;
    })();

    lanlu.Pt900_6_toc = (function() {

        function Pt900_6_toc(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt900_6_toc.prototype.queueNum = 0;

        Pt900_6_toc.create = function create(properties) {
            return new Pt900_6_toc(properties);
        };

        Pt900_6_toc.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(8).uint32(message.queueNum);
            return writer;
        };

        Pt900_6_toc.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt900_6_toc.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt900_6_toc();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.queueNum = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("queueNum"))
                throw $util.ProtocolError("missing required 'queueNum'", { instance: message });
            return message;
        };

        Pt900_6_toc.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt900_6_toc.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.queueNum))
                return "queueNum: integer expected";
            return null;
        };

        Pt900_6_toc.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt900_6_toc)
                return object;
            var message = new $root.lanlu.Pt900_6_toc();
            if (object.queueNum != null)
                message.queueNum = object.queueNum >>> 0;
            return message;
        };

        Pt900_6_toc.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.queueNum = 0;
            if (message.queueNum != null && message.hasOwnProperty("queueNum"))
                object.queueNum = message.queueNum;
            return object;
        };

        Pt900_6_toc.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt900_6_toc;
    })();

    lanlu.Pt900_7_tos = (function() {

        function Pt900_7_tos(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt900_7_tos.create = function create(properties) {
            return new Pt900_7_tos(properties);
        };

        Pt900_7_tos.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        Pt900_7_tos.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt900_7_tos.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt900_7_tos();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        Pt900_7_tos.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt900_7_tos.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        Pt900_7_tos.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt900_7_tos)
                return object;
            return new $root.lanlu.Pt900_7_tos();
        };

        Pt900_7_tos.toObject = function toObject() {
            return {};
        };

        Pt900_7_tos.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt900_7_tos;
    })();

    lanlu.Pt900_7_toc = (function() {

        function Pt900_7_toc(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt900_7_toc.create = function create(properties) {
            return new Pt900_7_toc(properties);
        };

        Pt900_7_toc.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        Pt900_7_toc.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt900_7_toc.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt900_7_toc();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        Pt900_7_toc.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt900_7_toc.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        Pt900_7_toc.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt900_7_toc)
                return object;
            return new $root.lanlu.Pt900_7_toc();
        };

        Pt900_7_toc.toObject = function toObject() {
            return {};
        };

        Pt900_7_toc.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt900_7_toc;
    })();

    lanlu.Pt900_8_tos = (function() {

        function Pt900_8_tos(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt900_8_tos.create = function create(properties) {
            return new Pt900_8_tos(properties);
        };

        Pt900_8_tos.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        Pt900_8_tos.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt900_8_tos.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt900_8_tos();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        Pt900_8_tos.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt900_8_tos.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        Pt900_8_tos.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt900_8_tos)
                return object;
            return new $root.lanlu.Pt900_8_tos();
        };

        Pt900_8_tos.toObject = function toObject() {
            return {};
        };

        Pt900_8_tos.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt900_8_tos;
    })();

    lanlu.Pt900_8_toc = (function() {

        function Pt900_8_toc(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt900_8_toc.prototype.msg = "";

        Pt900_8_toc.create = function create(properties) {
            return new Pt900_8_toc(properties);
        };

        Pt900_8_toc.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(10).string(message.msg);
            return writer;
        };

        Pt900_8_toc.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt900_8_toc.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt900_8_toc();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.msg = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("msg"))
                throw $util.ProtocolError("missing required 'msg'", { instance: message });
            return message;
        };

        Pt900_8_toc.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt900_8_toc.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isString(message.msg))
                return "msg: string expected";
            return null;
        };

        Pt900_8_toc.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt900_8_toc)
                return object;
            var message = new $root.lanlu.Pt900_8_toc();
            if (object.msg != null)
                message.msg = String(object.msg);
            return message;
        };

        Pt900_8_toc.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.msg = "";
            if (message.msg != null && message.hasOwnProperty("msg"))
                object.msg = message.msg;
            return object;
        };

        Pt900_8_toc.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt900_8_toc;
    })();

    lanlu.Pt900_9_tos = (function() {

        function Pt900_9_tos(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt900_9_tos.create = function create(properties) {
            return new Pt900_9_tos(properties);
        };

        Pt900_9_tos.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        Pt900_9_tos.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt900_9_tos.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt900_9_tos();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        Pt900_9_tos.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt900_9_tos.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        Pt900_9_tos.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt900_9_tos)
                return object;
            return new $root.lanlu.Pt900_9_tos();
        };

        Pt900_9_tos.toObject = function toObject() {
            return {};
        };

        Pt900_9_tos.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt900_9_tos;
    })();

    lanlu.Pt900_9_toc = (function() {

        function Pt900_9_toc(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt900_9_toc.prototype.msg = "";

        Pt900_9_toc.create = function create(properties) {
            return new Pt900_9_toc(properties);
        };

        Pt900_9_toc.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(10).string(message.msg);
            return writer;
        };

        Pt900_9_toc.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt900_9_toc.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt900_9_toc();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.msg = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("msg"))
                throw $util.ProtocolError("missing required 'msg'", { instance: message });
            return message;
        };

        Pt900_9_toc.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt900_9_toc.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isString(message.msg))
                return "msg: string expected";
            return null;
        };

        Pt900_9_toc.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt900_9_toc)
                return object;
            var message = new $root.lanlu.Pt900_9_toc();
            if (object.msg != null)
                message.msg = String(object.msg);
            return message;
        };

        Pt900_9_toc.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.msg = "";
            if (message.msg != null && message.hasOwnProperty("msg"))
                object.msg = message.msg;
            return object;
        };

        Pt900_9_toc.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt900_9_toc;
    })();

    lanlu.Pt900_999_tos = (function() {

        function Pt900_999_tos(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt900_999_tos.create = function create(properties) {
            return new Pt900_999_tos(properties);
        };

        Pt900_999_tos.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        Pt900_999_tos.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt900_999_tos.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt900_999_tos();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        Pt900_999_tos.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt900_999_tos.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        Pt900_999_tos.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt900_999_tos)
                return object;
            return new $root.lanlu.Pt900_999_tos();
        };

        Pt900_999_tos.toObject = function toObject() {
            return {};
        };

        Pt900_999_tos.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt900_999_tos;
    })();

    lanlu.Pt900_999_toc = (function() {

        function Pt900_999_toc(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt900_999_toc.prototype.code = 0;

        Pt900_999_toc.create = function create(properties) {
            return new Pt900_999_toc(properties);
        };

        Pt900_999_toc.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(8).uint32(message.code);
            return writer;
        };

        Pt900_999_toc.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt900_999_toc.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt900_999_toc();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.code = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("code"))
                throw $util.ProtocolError("missing required 'code'", { instance: message });
            return message;
        };

        Pt900_999_toc.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt900_999_toc.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.code))
                return "code: integer expected";
            return null;
        };

        Pt900_999_toc.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt900_999_toc)
                return object;
            var message = new $root.lanlu.Pt900_999_toc();
            if (object.code != null)
                message.code = object.code >>> 0;
            return message;
        };

        Pt900_999_toc.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.code = 0;
            if (message.code != null && message.hasOwnProperty("code"))
                object.code = message.code;
            return object;
        };

        Pt900_999_toc.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt900_999_toc;
    })();

    return lanlu;
})();return $root;
})(protobuf).lanlu;