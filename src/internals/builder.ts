class PropsBuilder<DefaultType = boolean, T extends Record<string, any> = {}> {
    props: Map<string, string> = new Map;
    skips: Map<string, null> = new Map;
    infer: T = null;

    // Type
    suffix: string = '';
    prefix: string = '';

    // Separators
    separator = {
        kv: ' ',
        end: ';'
    }

    /**
     * Register keys with default type
     */
    reg<KeysArray extends string[]>(...keys: KeysArray): PropsBuilder<
        DefaultType, T & Partial<Record<KeysArray[number], DefaultType>>
    > {
        for (var key of keys) this.put(key, key);
        return this as any;
    }

    /**
     * Put an alias
     */
    put<Key extends string, Type = DefaultType>(propName: Key, headerName: string = propName): PropsBuilder<
        DefaultType, T & Partial<Record<Key, Type>>
    > {
        this.props.set(propName, headerName);
        return this as any;
    }

    /**
     * Skip a property
     */
    skip(propName: string) {
        this.skips.set(propName, null);
        return this;
    }

    /**
     * Build into parts which can be joined
     */
    build(obj: T, parts?: string[]): string[] {
        // Separate the last result
        if (parts) parts.push(this.separator.end);
        else parts = [];

        for (var key in obj) {
            if (this.skips.has(key)) continue;

            var value = obj[key];
            if (value === false) continue;

            var alias = this.props.get(key);
            if (alias) key = alias as Extract<keyof T, string>;

            parts.push(this.prefix, key, this.suffix);
            if (value !== true)
                parts.push(this.separator.kv, value.toString());
            parts.push(this.separator.end);
        }

        // Pop the end separator
        parts.pop();
        return parts;
    }
}

export default PropsBuilder;
