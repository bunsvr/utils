import type Database from "bun:sqlite";
import Select from "./queries/select";
import { Selector } from "./types";

export default class Table<T extends Dict<string>> {
    private db: Database;
    private selectors: string[];

    constructor(public name: string, public readonly schema: T) {
        this.selectors = [];
        for (const key in schema)
            this.selectors.push(`${key} ${schema[key]}`);
    }

    /**
     * Create the table if it does not exists
     */
    bind(db: Database) {
        if (this.db) throw new Error('This table has already been bound to a DB!');

        db.run(`CREATE TABLE IF NOT EXISTS ${this.name}(${this.selectors.join(',')})`);
        this.db = db;

        return this;
    }

    /**
     * Create a select query
     */
    select(...selectors: Selector<T>[]) {
        if (!this.db) throw new Error('Bind to a database before querying!');

        return new Select<keyof T>(this.db, `${selectors.join(',')} FROM ${this.name} WHERE`);
    }

    /**
     * Add a primary key
     */
    primary(key: keyof T): this;

    /**
     * Add a primary key with a constraint
     */
    primary(key: keyof T, constraint: string): this;

    /**
     * Add primary keys
     */
    primary(key: (keyof T)[]): this;

    /**
     * Add primary keys with a constraint
     */
    primary(key: (keyof T)[], constraint: string): this;

    primary(keys: (keyof T)[] | keyof T, constraint?: string) {
        if (!Array.isArray(keys)) keys = [keys];

        this.selectors.push(`${constraint ? `CONSTRAINT ${constraint} ` : ''} PRIMARY KEY (${keys.join(',')})`);

        return this;
    }

    /**
     * Add a foreign key
     */
    foreign(key: keyof T, reference: string): this;

    /**
     * Add a foreign key with a constraint
     */
    foreign(key: keyof T, reference: string, constraint: string): this;

    foreign(key: keyof T, reference: string, constraint?: string) {
        this.selectors.push(`${constraint ? `CONSTRAINT ${constraint} ` : ''
            } FOREIGN KEY (${key as string}) REFERENCES ${reference}`);

        return this;
    }


    /**
     * Drop the table
     */
    drop() {
        if (!this.db) throw new Error('This table has not been bound yet!');

        this.db.run(`DROP TABLE ${this.name}`);
        return this;
    }

    /**
     * Get a key
     */
    key(key: keyof T) {
        return `${this.name}(${key as string})`;
    }
}
