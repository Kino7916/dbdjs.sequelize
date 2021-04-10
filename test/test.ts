import * as assert from 'assert';
import { Sequelize } from 'sequelize';
import { create } from '../src/index';

const first = {
  key: 'a',
  data: {
    key: 'a',
    value: 1
  }
};

const second = {
  key: 'b',
  data: {
    key: 'b',
    value: 2
  }
};

const third = {
  key: 'c',
  data: {
    key: 'c',
    value: 3
  }
};

function test(sequelize: Sequelize) {
  const db = create(sequelize);

  describe('#create', () => {
    it('Should create a new table', async () => {
      assert.strictEqual(await db.create('main'), undefined);
    });
  });

  describe('#set', () => {
    it(`Should set data into table with key as '${first.key}'`, async () => {
      assert.notStrictEqual(
        await db.set('main', first.key, first.data.value),
        false
      );
    });

    it(`Should set data into table with key as '${second.key}'`, async () => {
      assert.notStrictEqual(
        await db.set('main', second.key, second.data.value),
        false
      );
    });

    it(`Should set data into table with key as '${third.key}'`, async () => {
      assert.notStrictEqual(
        await db.set('main', third.key, third.data.value),
        false
      );
    });
  });

  describe('#get', () => {
    it(`Should get data from table with key as '${second.key}'`, async () => {
      assert.deepStrictEqual(await db.get('main', second.key), {
        key: second.key,
        value: second.data.value
      });
    });
  });

  describe('#all', () => {
    it(`Should get data from table with key as '${first.key}' and '${third.key}'`, async () => {
      assert.deepStrictEqual(
        await db.all('main', {
          filter: (d) => [first.key, third.key].includes(d.key)
        }),
        [first, third]
      );
    });
  });

  describe('#delete', () => {
    it(`Should delete data from table with key as '${second.key}'`, async () => {
      assert.strictEqual(await db.delete('main', second.key), true);
    });
  });

  describe('#truncate', () => {
    it('Should truncate all table data', async () => {
      assert.strictEqual(await db.truncate('main'), undefined);
    });
  });

  describe('#drop', () => {
    it('Should drop the table', async () => {
      assert.strictEqual(await db.drop('main'), undefined);
    });
  });
}

describe('sqliteInstance', () => {
  const sequelize = new Sequelize('sqlite:database.sqlite');

  test(sequelize);
});

describe('mariaInstance', () => {
  const sequelize = new Sequelize(
    'mariadb://root:mariaria@localhost:3306/test'
  );

  test(sequelize);
});

describe('postgresInstance', () => {
  const sequelize = new Sequelize(
    'postgres://postgres:zegre@localhost:5432/test'
  );

  test(sequelize);
});
