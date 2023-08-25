export default class Table<T extends Dict<string>> {
    private createTableQuery: string;

    constructor(name: string, schema: T) {
        let str = '';
        for (const key in schema)
            str += `${key} ${schema[key]}`;

        this.createTableQuery = `CREATE TABLE IF NOT EXISTS ${name}(${str})`;
    }
}
