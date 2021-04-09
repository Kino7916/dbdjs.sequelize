import { Sequelize, Model, ModelCtor } from 'sequelize';
import { Schema } from './util';

export class Instance {
  constructor(sequelize: Sequelize) {
    if (!(sequelize instanceof Sequelize))
      throw new TypeError('sequelize instance must be instance of Sequelize');

    this.sequelize = sequelize;
  }

  private sequelize: Sequelize;
  private tables = new Map<
    string,
    ModelCtor<Model<Schema.Attribute, Schema.Attribute>>
  >();
}

export function create(sequelize: Sequelize): Instance {
  return new Instance(sequelize);
}
