import { Sequelize, ModelCtor, Model } from "sequelize";
declare namespace Types {
    const NIL = 0;
    const NAN = 1;
    const INF = 2;
    const BOOL = 3;
    const NUM = 4;
    const TXT = 5;
    const SYM = 6;
    const OBJ = 7;
    function getType(d: symbol | string | number | boolean | void | object): 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | -1;
}
declare namespace Schema {
    interface Attribute {
        key: string;
        types: number;
        bool: boolean | null;
        num: number | null;
        txt: string | null;
        blob: object | null;
    }
    function create(name: string, sequelize: Sequelize): ModelCtor<Model<Attribute, Attribute>>;
}
declare const _default: {
    Types: typeof Types;
    Schema: typeof Schema;
};
export default _default;
