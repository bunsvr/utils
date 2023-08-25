/// <reference types='bun-types' />
import { test, expect } from 'bun:test';
import { sql } from '..';

test('Select', () => {
    const statement = sql
        .select('*')
        .from('users')
        .where('age = 20')
        .or('age = 15')
        .get();

    expect(statement).toBe(
        "SELECT * FROM users WHERE "
        + "age = 20 OR age = 15"
    );
});
