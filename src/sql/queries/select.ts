import type Database from 'bun:sqlite';

export default class Select<K = string> {
    private isDistinct: boolean = false;
    private whereStatement: string = '';

    constructor(
        private db: Database,
        private prevQuery: string
    ) { }

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
        return 'SELECT ' + (this.isDistinct
            ? 'DISTINCT ' : ''
        ) + this.prevQuery + ' '
            + this.whereStatement;
    }

    /**
     * Compile the statement to use later
     */
    compile() {
        return this.db.query(this.value);
    }
}
