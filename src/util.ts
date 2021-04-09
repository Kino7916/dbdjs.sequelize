import { Sequelize, DataTypes, ModelCtor, Model } from "sequelize";

namespace Types {
  export const NIL = 0;
  export const NAN = 1;
  export const INF = 2;
  export const BOOL = 3;
  export const NUM = 4;
  export const TXT = 5;
  export const SYM = 6;
  export const OBJ = 7;

  export function getType(
    d: symbol | string | number | boolean | void | object
  ) {
    if (d == null) return NIL;
    if (typeof d === "boolean") return BOOL;

    if (typeof d === "number") {
      if (isNaN(d)) return NAN;
      if (!isFinite(d)) return INF;

      return NUM;
    }

    if (typeof d === "string") return TXT;
    if (typeof d === "symbol") return SYM;
    if (typeof d === "object") return OBJ;

    return -1;
  }
}

namespace Schema {
  const key = DataTypes.TEXT;
  const types = DataTypes.TINYINT;
  const bool = DataTypes.BOOLEAN;
  const num = DataTypes.DOUBLE;
  const txt = DataTypes.TEXT;
  const blob = DataTypes.BLOB;

  export interface Attribute {
    key: string;
    types: number;
    bool: boolean | null;
    num: number | null;
    txt: string | null;
    blob: object | null;
  }

  export function create(
    name: string,
    sequelize: Sequelize
  ): ModelCtor<Model<Attribute, Attribute>> {
    return sequelize.define(name, {
      key,
      types,
      bool,
      num,
      txt,
      blob,
    });
  }
}

export default {Types, Schema}