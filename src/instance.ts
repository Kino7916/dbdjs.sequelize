/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Sequelize, Model, ModelCtor, FindOptions } from 'sequelize';
import { Schema, Types } from './util';
import { EventEmitter } from 'events';
import { Packr } from 'msgpackr';

export const CREATE = Symbol('CREATE');
export const DROP = Symbol('DROP');
export const TRUNCATE = Symbol('TRUNCATE');
export const SET = Symbol('SET');
export const DELETE = Symbol('DELETE');

type CHANGE =
  | typeof CREATE
  | typeof DROP
  | typeof TRUNCATE
  | typeof SET
  | typeof DELETE;

export interface Instance extends EventEmitter {
  on(
    ...args:
      | [event: 'change', listener: (op: CHANGE, d: Data | string) => void]
      | [event: 'debug', listener: (debug: string) => void]
  ): this;

  off(
    ...args:
      | [event: 'change', listener: (op: CHANGE, d: Data | string) => void]
      | [event: 'debug', listener: (debug: string) => void]
  ): this;

  emit(
    ...args:
      | [event: 'change', op: CHANGE, d: Data | string]
      | [event: 'debug', debug: string]
  ): boolean;

  removeAllListeners(...args: [event: 'change'] | [event: 'debug']): this;
}

export interface Data {
  key: string;
  value: any;
}

export interface AllData {
  key: string;
  data: Data;
}

export interface AllOptions {
  filter: (d: AllData) => boolean;
  offset?: number;
  limit?: number;
}

export class Instance extends EventEmitter {
  constructor(sequelize: Sequelize) {
    super();

    if (!(sequelize instanceof Sequelize))
      throw new TypeError('sequelize instance must be instance of Sequelize');

    this.sequelize = sequelize;
  }

  private readonly sequelize: Sequelize;
  private readonly packr = new Packr();
  private readonly tables = new Map<
    string,
    ModelCtor<Model<Schema.Attribute, Schema.Attribute>>
  >();

  public async create(name: string): Promise<void> {
    if (this.tables.has(name))
      throw new TypeError(`Table with name ${name} already exist`);

    const model = Schema.create(name, this.sequelize);

    this.tables.set(name, model);

    await model
      .sync({
        force: true,
        benchmark: true,
        logging: (sql: string, time: number) => {
          this._debug(`CREATE TABLE\nFinished in ${time}ms\n${sql}`);
        }
      })
      .then(() => {
        this._change(CREATE, name);
      });
  }

  public async drop(name: string): Promise<void> {
    if (!this.tables.has(name))
      throw new ReferenceError(`Table with name ${name} doesn't exist`);

    const model = this.tables.get(name);

    this.tables.delete(name);

    await model
      .drop({
        benchmark: true,
        logging: (sql: string, time: number) => {
          this._debug(`DROP TABLE\nFinished in ${time}ms\n${sql}`);
        }
      })
      .then(() => {
        this._change(DROP, name);
      });
  }

  public async truncate(name: string): Promise<void> {
    if (!this.tables.has(name))
      throw new ReferenceError(`Table with name ${name} doesn't exist`);

    const model = this.tables.get(name);

    await model
      .truncate({
        benchmark: true,
        logging: (sql: string, time: number) => {
          this._debug(`TRUNCATE TABLE\nFinished in ${time}ms\n${sql}`);
        }
      })
      .then(() => {
        this._change(TRUNCATE, name);
      });
  }

  public async set(
    table: string,
    key: string,
    value: any
  ): Promise<boolean | null> {
    if (!this.tables.has(table))
      throw new ReferenceError(`Table with name ${table} doesn't exist`);

    const model = this.tables.get(table);

    return model
      .upsert(this._parseValue(key, value), {
        benchmark: true,
        logging: (sql: string, time: number) => {
          this._debug(`UPSERT DATA\nFinished in ${time}ms\n${sql}`);
        }
      })
      .then(
        (
          value: [Model<Schema.Attribute, Schema.Attribute>, boolean | null]
        ) => {
          this._change(SET, { key, value });

          return value[1];
        }
      );
  }

  public async get(table: string, key: string): Promise<Data> {
    if (!this.tables.has(table))
      throw new ReferenceError(`Table with name ${table} doesn't exist`);

    const model = this.tables.get(table);

    return model
      .findByPk(key, {
        benchmark: true,
        logging: (sql: string, time: number) => {
          this._debug(`FIND ONE\nFinished in ${time}ms\n${sql}`);
        }
      })
      .then((value: Model<Schema.Attribute, Schema.Attribute> | null) => {
        return this._parseData(key, value);
      });
  }

  public async all(table: string, options: AllOptions): Promise<AllData[]> {
    if (!this.tables.has(table))
      throw new ReferenceError(`Table with name ${table} doesn't exist`);

    const model = this.tables.get(table);
    const findOptions: FindOptions<Schema.Attribute> = {
      benchmark: true,
      logging: (sql: string, time: number) => {
        this._debug(`FIND ALL\nFinished in ${time}ms\n${sql}`);
      }
    };

    if (typeof options.limit === 'number') {
      findOptions.limit = options.limit;
    }

    if (typeof options.offset === 'number') {
      findOptions.offset = options.offset;
    }

    return model
      .findAll(findOptions)
      .then((value: Model<Schema.Attribute, Schema.Attribute>[]) => {
        const values: AllData[] = [];

        for (const d of value) {
          const data = this._parseData(d.getDataValue('key'), d);
          const allData: AllData = {
            key: data.key,
            data: data
          };

          if (
            typeof options.filter === 'function' &&
            !options.filter(allData)
          ) {
            continue;
          }

          values.push(allData);
        }

        return values;
      });
  }

  public async delete(table: string, key: string): Promise<boolean> {
    if (!this.tables.has(table))
      throw new ReferenceError(`Table with name ${table} doesn't exist`);

    const model = this.tables.get(table);

    return model
      .destroy({
        limit: 1,
        benchmark: true,
        where: {
          key: key
        },
        logging: (sql: string, time: number) => {
          this._debug(`DELETE DATA\nFinished in ${time}ms\n${sql}`);
        }
      })
      .then((value: number) => {
        this._change(DELETE, key);

        return value > 0;
      });
  }

  private _debug(debug: string): void {
    this.emit('debug', debug);
  }

  private _change(op: CHANGE, d: Data | string): void {
    this.emit('change', op, d);
  }

  private _parseData(
    key: string,
    model: Model<Schema.Attribute, Schema.Attribute> | null
  ): Data {
    const data: Data = {
      key: key,
      value: undefined
    };

    if (data === null) {
      return data;
    }

    switch (Number(model.getDataValue('types'))) {
      case Types.NIL:
        data.value = null;

        break;
      case Types.UND:
        data.value = undefined;

        break;
      case Types.NAN:
        data.value = NaN;

        break;
      case Types.INF:
        data.value = model.getDataValue('bool') ? Infinity : -Infinity;

        break;
      case Types.BOOL:
        data.value = model.getDataValue('bool');

        break;
      case Types.NUM:
        data.value = model.getDataValue('num');

        break;
      case Types.TXT:
        data.value = model.getDataValue('txt');

        break;
      case Types.SYM:
        {
          const sym = model.getDataValue('txt');

          try {
            data.value = eval(sym);
          } catch {
            data.value = Symbol(sym);
          }
        }

        break;
      case Types.OBJ:
        data.value = this.packr.unpack(model.getDataValue('blob'));

        break;
    }

    return data;
  }

  private _parseValue(key: string, value: any): Schema.Attribute {
    const type = Types.getType(value);
    const data: Schema.Attribute = {
      key: key,
      types: type.toString()
    };

    switch (type) {
      case Types.NIL:
      case Types.UND:
      case Types.NAN:
        break;
      case Types.INF:
      case Types.BOOL:
        data.bool = value > 0;

        break;
      case Types.NUM:
        data.num = value;

        break;
      case Types.TXT:
        data.txt = value;

        break;
      case Types.SYM:
        {
          const sym = value.toString();

          data.txt = sym.substring(7, sym.length - 1);
        }

        break;
      case Types.OBJ:
        data.blob = this.packr.pack(value);

        break;
      default:
        throw new TypeError(
          `Invalid type given on value, get '${typeof value}' instead`
        );
    }

    return data;
  }
}

export function create(sequelize: Sequelize): Instance {
  return new Instance(sequelize);
}
