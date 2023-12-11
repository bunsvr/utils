import { TypeInfer, TypeKeys } from './types/typemap';

// Arrow functions execute faster
const
    defaultPropName = 'o',
    regexVarPrefix = '_r',
    snumFnName = '_f',
    arrayFnName = '_a',
    fnVarPrefix = '_n',
    validator: Record<TypeKeys, any> = {
        str: (currentPropName: string) => `typeof ${currentPropName}==='string'`,
        num: (currentPropName: string) => `typeof ${currentPropName}==='number'`,
        snum: (currentPropName: string) => `${snumFnName}(${currentPropName})`,
        bool: (currentPropName: string) => `typeof ${currentPropName}==='boolean'`,
        undef: (currentPropName: string) => `${currentPropName}===undefined`,
        nil: (currentPropName: string) => `${currentPropName}===null`,
        obj: (currentPropName: string) => `typeof ${currentPropName}==='object'&&${currentPropName}!==null`,
        sobj: (currentPropName: string) => `${validator.obj(currentPropName)}&&!${arrayFnName}(currentPropName)`
    };

export namespace guard {
    type SuffixQuestionMark<T extends string> = `${T}?`;

    export type OptionalBasicType = keyof {
        [K in TypeKeys as SuffixQuestionMark<K>]: null
    };

    type InferOptionalBasic<T> = T extends `${infer U}?` ? TypeInfer<U> | undefined : never;
    export type Infer<T> = T extends TypeKeys ? TypeInfer<T> : (
        T extends OptionalBasicType ? InferOptionalBasic<T> : {
            [K in keyof T]: Infer<T[K]>
        }
    );

    export type Validator = Dict<Validator> | TypeKeys | OptionalBasicType | RegExp | ((...args: any[]) => any);

    // Actual code 
    const basicArgs = [snumFnName, arrayFnName],
        basicValidator = [Number.isFinite, Array.isArray],
        getCheckStr = (name: string, prop: string) => 'if(' +
            validator[name](prop).replaceAll('&&', ')if(') + ')';

    function createCheck(
        type: Validator, propName: string, deps: Dict<any>
    ): string {
        // RegExp
        if (type instanceof RegExp) {
            const name = regexVarPrefix + deps._regexIndex;

            deps[name] = type;
            ++deps._regexIndex;

            return `if(${name}.test(${propName}))`;
        }

        // Normal object
        else if (typeof type === 'object') {
            let vld = getCheckStr('obj', propName);

            for (const prop in type)
                vld += createCheck(type[prop], `${propName}.${prop}`, deps);

            return vld;
        }

        // Custom type validator
        else if (typeof type === 'function') {
            const name = fnVarPrefix + deps._index;

            deps[name] = type;
            ++deps._index;

            return `if(${name}(${propName}))`;
        }

        // Optional
        else if (type.at(-1) === '?') {
            const t = type.slice(0, -1);

            if (t in validator)
                return `if(!${propName}||${validator[t](propName)})`;
        }

        // Built-in types
        else if (type in validator)
            return getCheckStr(type, propName);

        return '';
    }

    /**
     * Create a request validator
     */
    export function create<T extends Validator>(type: T): (o?: any) => Infer<T> | null {
        let deps = { _index: 0, _regexIndex: 0 }, body = `return ${defaultPropName
            }=>{${createCheck(type, defaultPropName, deps)}return o;return null}`;

        delete deps._index;
        delete deps._regexIndex;

        return Function(...Object.keys(deps), ...basicArgs, body)(...Object.values(deps), ...basicValidator);
    }
}
