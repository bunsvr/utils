export namespace guard {    
    export type Validator = string | Dict<Validator>; 

    const numberCheckFnName = 'n',
        strTypeName = 's',
        boolTypeName = 'b',
        defaultPropName = 'o',
        bufferValidate = 'p',
        outerVars = `const ${strTypeName}='string',${boolTypeName}='boolean'`,
        // Insert Array.isArray and util.isNumber as arguments
        basicArgs = [numberCheckFnName, bufferValidate],
        basicValidator = [require('node:util').isNumber, Buffer.isBuffer];

    const validator: { [key: string]: (p: string) => string } = {
        str: (currentPropName) => `typeof ${currentPropName}===${strTypeName}`,
        num: (currentPropName) => `${numberCheckFnName}(${currentPropName})`,
        bool: (currentPropName) => `typeof ${currentPropName}===${boolTypeName}`,
        undef: (currentPropName) => `${currentPropName}===undefined`,
        nil: (currentPropName) => `${currentPropName}===null`,
        obj: (currentPropName) => `${currentPropName}===Object(${currentPropName})`,
        buf: (currentPropName) => `${bufferValidate}(${currentPropName})`
    };

    function isObj(v: any): v is object {
        return v === Object(v);
    }

    function getCheckStr(name: string, prop: string) {
        return validator[name](prop);
    }

    function createCheck(
        type: Validator, propName: string, 
        h: { index: number, deps: Dict<any> } = { index: 0, deps: {} }
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
            const parentObjEndIndex = propName.lastIndexOf('.');

            // This case only returns a literal
            return `(${parentObjEndIndex === -1 
                ? validator.undef(propName) 
                : `!('${propName.substring(parentObjEndIndex + 1)}'in ${propName.substring(0, parentObjEndIndex)})`
            }||${getCheckStr(type.substring(1), propName)})`;
        }

        // TODO: Compose array 
        return null;
    }

    /**
     * Create a request validator
     */
    export function create<T extends Validator>(type: T, inValidator = false): <E>(o?: E) => E | null {
        const h = { index: 0, deps: {} };

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
