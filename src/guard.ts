export namespace guard {   
    const numberTypeName = 'n',
        strTypeName = 's',
        objectTypeName = 'x',
        boolTypeName = 'b',
        defaultPropName = 'o',
        bufferValidate = 'p',
        validator = {
            str: (currentPropName: string) => `typeof ${currentPropName}===${strTypeName}`,
            num: (currentPropName: string) => `typeof ${currentPropName}===${numberTypeName}`,
            bool: (currentPropName: string) => `typeof ${currentPropName}===${boolTypeName}`,
            undef: (currentPropName: string) => `${currentPropName}===undefined`,
            nil: (currentPropName: string) => `${currentPropName}===null`,
            obj: (currentPropName: string) => `typeof ${currentPropName}===${objectTypeName}&&${currentPropName}!==null`,
            buf: (currentPropName: string) => `${bufferValidate}(${currentPropName})`
        };

    // For infer types
    export type BasicType = keyof typeof validator;

    type SuffixQuestionMark<T extends string> = `?${T}`;

    export type OptionalBasicType = keyof {
        [K in BasicType as SuffixQuestionMark<K>]: null
    };
    
    type InferBasic<P> = P extends 'str' ? string : (
        P extends 'num' ? number : (
            P extends 'bool' ? boolean : (
                P extends 'undef' ? undefined : (
                   P extends 'nil' ? null : any
                )
            )
        )
    );

    type InferOptionalBasic<T> = T extends `${infer U}?` ? InferBasic<U> | undefined : never;
    export type Infer<T> = T extends BasicType ? InferBasic<T> : (
        T extends OptionalBasicType ? InferOptionalBasic<T> : {
            [K in keyof T]: Infer<T[K]>       
        }
    );

    export type Validator = Dict<Validator> | BasicType | OptionalBasicType; 

    // Actual code 
    const outerVars = `const ${strTypeName}='string',${boolTypeName}='boolean',${objectTypeName}='object',`
        + `${numberTypeName}='number'`,
        // Insert Array.isArray and util.isNumber as arguments
        basicArgs = [bufferValidate],
        basicValidator = [Buffer.isBuffer];

    function isObj(v: any): v is object {
        return v === Object(v);
    }

    function getCheckStr(name: string, prop: string) {
        return validator[name](prop);
    }

    function createCheck(
        type: Validator, propName: string, 
        h: { index: number, deps: Dict<any>, aliasIndex: number } = { index: 0, aliasIndex: 0, deps: {} }
    ): string {
        if (typeof type === 'string' && type in validator)
            return getCheckStr(type, propName);

        if (isObj(type)) {
            let vld = '';

            if (propName.includes('.')) {
                vld += `_c${h.index}(${propName})`;
                h.deps['_c' + h.index] = create(type, true);
                ++h.index;
            } else {
                vld += validator.obj(propName);
                
                for (const prop in type) 
                    vld += '&&' + createCheck(type[prop], `${propName}.${prop}`, h);
            }
            
            return vld;
        }

        if (type[0] === '?') {
            const parentObjEndIndex = propName.lastIndexOf('.'), subProp = '_a' + h.aliasIndex;
            h.deps[subProp] = propName.substring(parentObjEndIndex + 1);

            // This case only returns a literal
            return `(${parentObjEndIndex === -1 
                ? validator.undef(propName) 
                : `!(${subProp} in ${propName.substring(0, parentObjEndIndex)})`
            }||${getCheckStr(type.substring(1), propName)})`;
        }

        // TODO: Compose array 
        return null;
    }

    /**
     * Create a request validator
     */
    export function create<T extends Validator>(type: T, inValidator = false): (o?: any) => Infer<T> | null {
        const h = { index: 0, aliasIndex: 0, deps: {} };

        const body = `${outerVars};return function(${
            defaultPropName
        }){return ${createCheck(type, defaultPropName, h)}${inValidator ? '' : '?o:null'}}`;

        return Function(
            ...basicArgs, ...Object.keys(h.deps), body
        )(...basicValidator, ...Object.values(h.deps));
    }

    let registeredTypes = 0;
    /**
     * Register a custom type
     */
    export function register(
        type: string, 
        checkFn: (value: any) => boolean
    ) {
        const fnName = 'v' + registeredTypes;
        basicArgs.push(fnName);
        validator[type] = (p: string) => `${fnName}(${p})`;
        // @ts-ignore
        basicValidator.push(checkFn);
        ++registeredTypes;
    };
}
