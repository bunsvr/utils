import { isNumber } from "util";

export namespace guard {
    export type BasicType = 'str' | 'num' | 'bool' | 'undef' | 'nil';
    export type OptionalBasicType = 'str?' | 'num?' | 'bool?' | 'nil?';
    export type ValidatorObject = BasicType | OptionalBasicType | Dict<ValidatorObject>;

    type InferBasic<P> = P extends 'str' ? string : (
        P extends 'num' ? number : (
            P extends 'bool' ? boolean : (
                P extends 'undef' ? undefined : (
                   P extends 'nil' ? null : never
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
   
    const numberCheckFnName = 'n',
        strTypeName = 's',
        boolTypeName = 'b',
        isArrayAlias = 'i',
        outerVars = `const ${strTypeName}='string',${boolTypeName}='boolean'`,
        // Insert Array.isArray and util.isNumber as arguments
        basicArgs = [isArrayAlias,numberCheckFnName];

    const validator: { [key in BasicType | 'obj']: (p: string) => string } = {
        str: (currentPropName) => `typeof ${currentPropName}===${strTypeName}`,
        num: (currentPropName) => `${numberCheckFnName}(${currentPropName})`,
        bool: (currentPropName) => `typeof ${currentPropName}===${boolTypeName}`,
        undef: (currentPropName) => `${currentPropName}===undefined`,
        nil: (currentPropName) => `${currentPropName}===null`,
        obj: (currentPropName) => `${currentPropName}===Object(${currentPropName})`,
    };

    function isObj(v: any): v is object {
        return v === Object(v);
    }

    function createCheck(type: ValidatorObject, propName: string) {
        let vld: string = '';
        if (isObj(type)) {
            vld += validator.obj(propName);
            for (const prop in type) {
                vld += '&&' + createCheck(type[prop], `${propName}.${prop}`);
            }
            return vld;
        }

        if (type[type.length - 1] === '?') {
            const parentObjEndIndex = propName.lastIndexOf('.');

            return `(${parentObjEndIndex === -1 
                ? validator.undef(propName) 
                : `!('${propName.substring(parentObjEndIndex + 1)}'in ${propName.substring(0, parentObjEndIndex)})`
            }||${createCheck(type.slice(0, -1) as BasicType, propName)})`;
        }

        if ((type as BasicType) in validator)
            return validator[type as BasicType](propName);

        return null;
    }

    const defaultPropName = 'o';
    /**
     * Create a request validator
     */
    export function create<T extends ValidatorObject>(type: T): (o: any) => Infer<T> | null {
        const body = `${outerVars};return function(${
            defaultPropName
        }){return ${createCheck(type, defaultPropName)}?o:null}`;

        return Function(...basicArgs, body)(Array.isArray, isNumber);
    }
}

