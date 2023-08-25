import Table from './table';

export namespace sql {
    export function table<S extends Dict<string>>(name: string, schema: S) {
        return new Table<S>(name, schema);
    }
}
