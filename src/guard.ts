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

    function createCheck(type: Validator, propName: string) {
        let vld: string = '';
        if (isObj(type)) {
            vld += validator.obj(propName);
            for (const prop in type) {
                vld += '&&' + createCheck(type[prop], `${propName}.${prop}`);
            }
            return vld;
        }

        if (type[0] === '?') {
            const parentObjEndIndex = propName.lastIndexOf('.');

            return `(${parentObjEndIndex === -1 
                ? validator.undef(propName) 
                : `!('${propName.substring(parentObjEndIndex + 1)}'in ${propName.substring(0, parentObjEndIndex)})`
            }||${createCheck(type.substring(1), propName)})`;
        }

        // TODO: Compose array

        if (type in validator)
            return validator[type](propName);

        return null;
    }

    /**
     * Create a request validator
     */
    export function create<T extends Validator>(type: T): <E>(o?: E) => E | null {
        const body = `${outerVars};return function(${
            defaultPropName
        }){return ${createCheck(type, defaultPropName)}?o:null}`;

        return Function(...basicArgs, body)(...basicValidator);
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
