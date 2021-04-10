/* eslint-disable @typescript-eslint/ban-types */
import { Sequelize, DataTypes, ModelCtor, Model } from 'sequelize';

namespace Types {
  export const NIL = 0;
  export const UND = 1;
  export const NAN = 2;
  export const INF = 3;
  export const BOOL = 4;
  export const NUM = 5;
  export const TXT = 6;
  export const SYM = 7;
  export const OBJ = 8;

  export function getType(d: Type): -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 {
    if (d === null) return NIL;
    if (typeof d === 'undefined') return UND;
    if (typeof d === 'boolean') return BOOL;

    if (typeof d === 'number') {
      if (isNaN(d)) return NAN;
      if (!isFinite(d)) return INF;

      return NUM;
    }

    if (typeof d === 'string') return TXT;
    if (typeof d === 'symbol') return SYM;
    if (typeof d === 'object') return OBJ;

    return -1;
  }
}

namespace Schema {
  const key = {
    type: DataTypes.STRING({ length: 1024 }),
    allowNull: false,
    primaryKey: true
  };

  const types = DataTypes.CHAR({ length: 1 });
  const bool = DataTypes.BOOLEAN;
  const num = DataTypes.DOUBLE();
  const txt = DataTypes.TEXT();
  const blob = DataTypes.BLOB();

  export interface Attribute {
    key: string;
    types: string;
    bool?: boolean;
    num?: number;
    txt?: string;
    blob?: Buffer;
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
      blob
    });
  }
}

type Type = symbol | string | number | boolean | void | object;

export { Types, Schema, Type };
