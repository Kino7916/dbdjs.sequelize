"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
var Types;
(function (Types) {
    Types.NIL = 0;
    Types.NAN = 1;
    Types.INF = 2;
    Types.BOOL = 3;
    Types.NUM = 4;
    Types.TXT = 5;
    Types.SYM = 6;
    Types.OBJ = 7;
    function getType(d) {
        if (d == null)
            return Types.NIL;
        if (typeof d === "boolean")
            return Types.BOOL;
        if (typeof d === "number") {
            if (isNaN(d))
                return Types.NAN;
            if (!isFinite(d))
                return Types.INF;
            return Types.NUM;
        }
        if (typeof d === "string")
            return Types.TXT;
        if (typeof d === "symbol")
            return Types.SYM;
        if (typeof d === "object")
            return Types.OBJ;
        return -1;
    }
    Types.getType = getType;
})(Types || (Types = {}));
var Schema;
(function (Schema) {
    const key = sequelize_1.DataTypes.TEXT;
    const types = sequelize_1.DataTypes.TINYINT;
    const bool = sequelize_1.DataTypes.BOOLEAN;
    const num = sequelize_1.DataTypes.DOUBLE;
    const txt = sequelize_1.DataTypes.TEXT;
    const blob = sequelize_1.DataTypes.BLOB;
    function create(name, sequelize) {
        return sequelize.define(name, {
            key,
            types,
            bool,
            num,
            txt,
            blob,
        });
    }
    Schema.create = create;
})(Schema || (Schema = {}));
exports.default = { Types, Schema };
