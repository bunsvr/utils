export namespace guard {
    const defaultPropName = 'o',
        emailFnName = '_e',
        regexVarPrefix = '_r',
        snumFnName = '_f',
        arrayFnName = '_a',
        validator = {
            str: (currentPropName: string) => `typeof ${currentPropName}==='string'`,
            num: (currentPropName: string) => `typeof ${currentPropName}==='number'`,
            snum: (currentPropName: string) => `${snumFnName}(${currentPropName})`,
            bool: (currentPropName: string) => `typeof ${currentPropName}==='boolean'`,
            undef: (currentPropName: string) => `${currentPropName}===undefined`,
            nil: (currentPropName: string) => `${currentPropName}===null`,
            obj: (currentPropName: string) => `typeof ${currentPropName}==='object'&&${currentPropName}!==null`,
            sobj: (currentPropName: string) => `${validator.obj(currentPropName)}&&!${arrayFnName}(currentPropName)`,
            email: (currentPropName: string) => `${validator.str(currentPropName)}&&${emailFnName}(${currentPropName})`
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

    export type Validator = Dict<Validator> | BasicType | OptionalBasicType | RegExp;

    // Actual code 
    const basicArgs = [snumFnName, arrayFnName], basicValidator = [Number.isFinite, Array.isArray];

    function checkEmail(email: string) {
        let i = email.indexOf('@');
        if (i === -1 || email.charCodeAt(i + 1) === 46)
            return false;

        i = email.indexOf('.', i + 2);
        return i !== -1 && i !== email.length - 1;
    }

    function getCheckStr(name: string, prop: string) {
        return validator[name](prop);
    }

    function createCheck(
        type: Validator, propName: string, deps: Dict<any>
    ): string {
        if (typeof type === 'string' && type in validator) {
            if (type === 'email') deps._hasEmail = true;

            return getCheckStr(type, propName);
        }

        if (type instanceof RegExp) {
            if (!('_regexIndex' in deps)) deps._regexIndex = 0;
            const name = regexVarPrefix + deps._regexIndex;

            deps[name] = type;
            ++deps._regexIndex;

            return `${name}.test(${propName})`;
        }

        if (typeof type === 'object') {
            let vld = validator.obj(propName);

            for (const prop in type)
                vld += '&&' + createCheck(type[prop], `${propName}.${prop}`, deps);

            return vld;
        }

        if (type[0] === '?') {
            const parentObjEndIndex = propName.lastIndexOf('.'), subProp = propName.substring(parentObjEndIndex + 1);

            // This case only returns a literal
            return `(${parentObjEndIndex === -1
                ? validator.undef(propName)
                : `!('${subProp}' in ${propName.substring(0, parentObjEndIndex)})`
                }||${getCheckStr(type.substring(1), propName)})`;
        }

        // TODO: Compose array 
        return null;
    }

    /**
     * Create a request validator
     */
    export function create<T extends Validator>(type: T, yieldValue: boolean = true): (o?: any) => Infer<T> | null {
        let deps = {}, body = `return function(${defaultPropName
            }){return ${createCheck(type, defaultPropName, deps)}${yieldValue ? '?o:null' : ''}}`;

        if ('_hasEmail' in deps) {
            let emailCheckFn = checkEmail.toString();
            emailCheckFn = `function ${emailFnName}${emailCheckFn.substring(emailCheckFn.indexOf('('))
                };`;
            body = emailCheckFn + body;

            delete deps._hasEmail;
        }

        if ('_regexIndex' in deps) delete deps._regexIndex;

        return Function(...Object.keys(deps), ...basicArgs, body)(...Object.values(deps), ...basicValidator);
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
