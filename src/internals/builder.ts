class PropsBuilder<T extends object = {}> {
    props: Map<string, string> = new Map;
    infer: T = null;

    /**
     * Put an alias
     */
    put<Key extends string, Type = boolean>(propName: Key, headerName: string): PropsBuilder<T & Partial<Record<Key, Type>>> {
        this.props.set(propName, headerName);
        return this as any;
    }

    /**
     * Build into parts which can be joined
     */
    build(obj: any, sepKV: string, sepEnd: string): string[] {
        const parts = [];

        for (var key in obj) {
            var value = obj[key], alias = this.props.get(key);
            if (alias) key = alias;

            switch (value) {
                case true:
                    parts.push(key, sepEnd);
                    continue;

                case false:
                    continue;

                default:
                    parts.push(key, sepKV, value.toString(), sepEnd);
            }
        }

        // Pop the end separator
        parts.pop();
        return parts;
    }
}

export default PropsBuilder;
