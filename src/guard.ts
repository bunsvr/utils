import { TypeInfer, TypeKeys } from './types/typemap';

interface Dependencies {
    index: number;
    record: Dict<any>;
}

const
    snumFnName = '_f',
    arrayFnName = '_a',
    varPrefix = '_n',

    validator: Record<TypeKeys, any> = {
        str: (currentPropName: string) => `typeof ${currentPropName}==='string'`,
        num: (currentPropName: string) => `typeof ${currentPropName}==='number'`,
        snum: (currentPropName: string) => `${snumFnName}(${currentPropName})`,
        bool: (currentPropName: string) => `typeof ${currentPropName}==='boolean'`,
        undef: (currentPropName: string) => `${currentPropName}===undefined`,
        nil: (currentPropName: string) => `${currentPropName}===null`,
        obj: (currentPropName: string) => `typeof ${currentPropName}==='object'&&${currentPropName}!==null`,
        sobj: (currentPropName: string) => `${validator.obj(currentPropName)}&&!${arrayFnName}(currentPropName)`
    },

    basicArgs = [snumFnName, arrayFnName],
    basicValidator = [Number.isFinite, Array.isArray];

export namespace guard {
    type SuffixQuestionMark<T extends string> = `${T}?`;

    export type OptionalBasicType = keyof {
        [K in TypeKeys as SuffixQuestionMark<K>]: null
    };

    type InferOptionalBasic<T> = T extends `${infer U}?` ? TypeInfer<U> | undefined : never;
    export type Infer<T> = T extends TypeKeys ? TypeInfer<T> : (
        T extends OptionalBasicType ? InferOptionalBasic<T> : (
            T extends (o: any) => infer Return ? Return : {
                [K in keyof T]: Infer<T[K]>
            }
        )
    );

    export type Validator = Dict<Validator> | TypeKeys | OptionalBasicType | RegExp | ((o: any) => any);

    /**
     * Create a validator
     */
    export declare function create<T extends Validator>(type: T): (o?: any) => Infer<T> | null;

    /**
     * Create a validator for true false check
     */
    export declare function create<T extends Validator>(type: T, bool: true): (o?: any) => boolean;
}

const create = guard.create = <T extends guard.Validator>(type: T, bool?: boolean) => {
    const
        deps: Dependencies = { index: 0, record: {} },
        body = `return o=>${createCheck(type, 'o', deps, false)}${bool ? '' : '?o:null'}`;

    return Function(
        ...Object.keys(deps.record), ...basicArgs, body
    )(...Object.values(deps.record), ...basicValidator);
};

function createCheck(
    type: guard.Validator, propName: string,
    deps: Dependencies, nested: boolean
) {
    if (type instanceof RegExp) {
        var name = varPrefix + deps.index;

        deps.record[name] = type;
        ++deps.index;

        return `${name}.test(${propName})`;
    }

    // Normal object
    if (typeof type === 'object') {
        // Create a separate function
        if (nested) {
            var name = varPrefix + deps.index;

            deps.record[name] = create(type, true);
            ++deps.index;

            return `${name}(${propName})`;
        }

        // Or just handle
        let parts = [validator.obj(propName)];

        for (var prop in type)
            parts.push(createCheck(type[prop], `${propName}.${prop}`, deps, true));

        return parts.join('&&');
    }

    // Custom type validator
    else if (typeof type === 'function') {
        var name = varPrefix + deps.index;

        deps.record[name] = type;
        ++deps.index;

        return `${name}(${propName})!==null`;
    }

    // Optional
    else if (type.at(-1) === '?') {
        const t = type.slice(0, -1);

        if (t in validator)
            return `(!${propName}||${validator[t](propName)})`;
    }

    // Built-in types
    else if (type in validator)
        return validator[type](propName);

    return '';
}
