/// <reference types='bun-types' />
import Database from 'bun:sqlite';
import { test, expect } from 'bun:test';
import { sql } from '..';

const db = new Database(':memory:');

test('Select', () => {
    const table = sql.table('users', {
        id: 'int',
        name: 'varchar(255)',
        age: 'int'
    })
        .primary('id')
        .bind(db);

    const query = table.select('id', 'age')
        .distinct()
        .where(
            'id', '<', 1, '&',
            'age', '>', 14
        ).value;

    expect(query).toBe('SELECT DISTINCT id,age FROM users WHERE id < 1 AND age > 14');
});
