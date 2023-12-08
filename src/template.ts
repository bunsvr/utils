const isValidVar = (ch: number) => {
    switch (ch) {
        case 32:
        case 58:
        case 95:
            return true;

        default:
            return (ch > 64 && ch < 91) || (ch > 96 && ch < 123);
    }
}

/**
 * A simple HTML templating language
 */
export namespace template {
    const parentObjName = 'o', startChars = '$(', endChar = ')';

    export type TrimStart<T extends string> = T extends ` ${infer R}` ? TrimStart<R> : T;

    export type TrimEnd<T extends string> = T extends `${infer R} ` ? TrimEnd<R> : T;

    export type Trim<T extends string> = TrimStart<TrimEnd<T>>;

    export type InferType<T extends string> = T extends 'obj' ? object : (
        T extends 'num' ? number : (
            T extends 'str' ? string : (
                T extends 'bool' ? boolean : any
            )
        )
    );

    export type Infer<T extends string> = T extends `${infer Start}${typeof startChars}${infer N}${typeof endChar}${infer Rest}`
        ? (
            Trim<N> extends `${infer K}:${infer T}`
            ? { [key in Trim<K>]: InferType<Trim<T>> }
            : { [key in Trim<N>]: any }
        ) & Infer<Rest> & Infer<Start> : {};

    export function create<T extends string>(html: T): (o: Infer<T>) => string {
        let st = html.indexOf(startChars), ed: number, prv = 0, body = '',
            paramName: string, paramType: string, params: string[];

        while (st !== -1) {
            // Push the previous template string
            body += '"' + html.substring(prv, st) + '"+';

            st += startChars.length;
            ed = st;

            while (ed < html.length && html[ed] !== endChar) {
                if (!isValidVar(html.charCodeAt(ed)))
                    break;

                ++ed;
            }

            // Get name and type
            params = html.substring(st, ed).trim().split(':');
            paramName = parentObjName + '.' + params[0].trim();

            if (!params[1])
                throw new Error('A type must be specified for key ' + paramName);

            paramType = params[1].trim();

            // Check for type to parse
            switch (paramType) {
                case 'obj': paramName = `JSON.stringify(${paramName})`; break;
                case 'str': break;
                default: paramName = `${paramName}.toString()`; break;
            }

            // Push the name of the var
            body += paramName + '+';

            // Next name
            prv = ed + endChar.length;
            st = html.indexOf(startChars, prv);
        }

        // Cut the ending plus
        if (prv === html.length)
            body = body.substring(0, body.length - 1);
        else
            body += '"' + html.substring(prv) + '"';

        return Function(`return ${parentObjName}=>${body}`)();
    }
}
