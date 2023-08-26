import type Database from 'bun:sqlite';

type Arg<K> = K |
    '>' | '<' | '='
    | 'LIKE' | 'like' | 'IN' | 'in'
    | '|' | '&' | '!'
    | 'BETWEEN' | 'between'
    | 'AND' | 'and' | 'OR' | 'or' | 'NOT' | 'not'
    | (string & {}) | number;

export default class Select<K = string> {
    private isDistinct: boolean = false;
    private whereStatement: string;

    constructor(
        private db: Database,
        private prevQuery: string
    ) {
        this.whereStatement = '';
    }

    /**
     * Select distinct
     */
    distinct() {
        this.isDistinct = true;
        return this;
    }

    /**
     * Return the statement in string
     */
    get value() {
        return 'SELECT ' + (this.isDistinct ? 'DISTINCT ' : '')
            + this.prevQuery + this.whereStatement;
    }

    /**
     * Include conditions
     */
    where(...args: Arg<K>[]) {
        for (let item of args) {
            if (typeof item === 'number')
                item = String(item);

            switch (item) {
                case '|':
                case 'or':
                    item = 'OR';
                    break;
                case '&':
                case 'and':
                    item = 'AND';
                    break;
                case '!':
                case 'not':
                    item = 'NOT';
                    break;
            }

            this.whereStatement += ' ' + item;
        }
        return this;
    }

    /**
     * Compile the statement to use later
     */
    compile() {
        return this.db.query(this.value);
    }
}
