const protobuf = require("./protobuf");
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lanluproto = (function($protobuf) {
"use strict";
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.lanlu = (function() {

    var lanlu = {};

    lanlu.Pt10001 = (function() {

        function Pt10001(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt10001.prototype.username = "";

        Pt10001.create = function create(properties) {
            return new Pt10001(properties);
        };

        Pt10001.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.username != null && Object.hasOwnProperty.call(message, "username"))
                writer.uint32(10).string(message.username);
            return writer;
        };

        Pt10001.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt10001.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt10001();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.username = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        Pt10001.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt10001.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.username != null && message.hasOwnProperty("username"))
                if (!$util.isString(message.username))
                    return "username: string expected";
            return null;
        };

        Pt10001.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt10001)
                return object;
            var message = new $root.lanlu.Pt10001();
            if (object.username != null)
                message.username = String(object.username);
            return message;
        };

        Pt10001.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.username = "";
            if (message.username != null && message.hasOwnProperty("username"))
                object.username = message.username;
            return object;
        };

        Pt10001.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt10001;
    })();

    lanlu.Pt10002 = (function() {

        function Pt10002(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Pt10002.prototype.code = 0;

        Pt10002.create = function create(properties) {
            return new Pt10002(properties);
        };

        Pt10002.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.code != null && Object.hasOwnProperty.call(message, "code"))
                writer.uint32(8).uint32(message.code);
            return writer;
        };

        Pt10002.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        Pt10002.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.lanlu.Pt10002();
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
            return message;
        };

        Pt10002.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        Pt10002.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.code != null && message.hasOwnProperty("code"))
                if (!$util.isInteger(message.code))
                    return "code: integer expected";
            return null;
        };

        Pt10002.fromObject = function fromObject(object) {
            if (object instanceof $root.lanlu.Pt10002)
                return object;
            var message = new $root.lanlu.Pt10002();
            if (object.code != null)
                message.code = object.code >>> 0;
            return message;
        };

        Pt10002.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.code = 0;
            if (message.code != null && message.hasOwnProperty("code"))
                object.code = message.code;
            return object;
        };

        Pt10002.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Pt10002;
    })();

    return lanlu;
})();return $root;
})(protobuf).lanlu;
module.exports.lanluproto = lanluproto;