import { type BindExpression, TARGET, USE } from "./abstraction";
import { getPropertyDescriptor } from "./utils/Object";

type ExpressionType = Expression<any>;

const EMPTY_FUNCTION = () => 0;

export interface IExpressionOptions {
    evaluate?: boolean;
    customProps?: Record<string | symbol, () => any>;
}

export interface IExpressionProp {

    object: Record<string, any>;

    propName?: string;

    value?: any;

    readonly?: boolean;
}

export interface IExpressionBuild<TModel, TValue> {

    expression: UseExpression<TModel>;

    value: TValue;
}

export function proxyEquals(a: any, b: any) {

    return cleanProxy(a) == cleanProxy(b);
}

export function isProxy(item: unknown) {

    if (item && (typeof (item) === "object" || typeof (item) === "function")) {
        const target = (item as any)[TARGET];
        if (target)
            return true;
    }

    return false;
}

export function cleanProxy<T>(item: T) : T {

    if (item && (typeof(item) === "object" || typeof(item) === "function")) {

        const target = (item as any)[TARGET];

        if (target)
            return target;
    }

    return item;
}


export abstract class Expression<TValue extends Record<string, any> | Function> {

    protected _options: IExpressionOptions;

    constructor(value: TValue, parent?: ExpressionType, options?: IExpressionOptions) {
        this.parent = parent;
        this.value = cleanProxy(value);
        this._options = options || parent?._options || {};
        this.hitCount = 1;
    }

    use(model: TValue) : ExpressionType {

        model = cleanProxy(model);

        let innerExp = this.actions.find(a => a instanceof UseExpression && a.value == model);

        if (!innerExp) {
            innerExp = new UseExpression(model, this);
            this.actions.push(innerExp);
        }
        else
            innerExp.hitCount++;

        return innerExp;
    }

    set<TSetValue>(propName: string, value: TSetValue): ExpressionType  {

        if (this._options.evaluate)
            (this.value as Record<string, any>)[propName] = value;

        let innerExp = this.actions.find(a => a instanceof SetExpression && a.propName == propName);

        if (!innerExp) {

            innerExp = new SetExpression(value, propName, this);

            this.actions.push(innerExp);
        }
        else
            innerExp.hitCount++;

        return innerExp;
    }

    get(propName: string, readonly = false): ExpressionType {

        const value = this._options.evaluate ? (this.value as Record<string, any>)[propName] : undefined;

        let innerExp = this.actions.find(a => a instanceof GetExpression && a.propName == propName);

        if (!innerExp) {

            innerExp = new GetExpression(value, propName, this, readonly);

            this.actions.push(innerExp);
        }
        else 
            innerExp.hitCount++;
  
        return innerExp;
    }

    call(...args: []): ExpressionType {

        const result = this._options.evaluate ? (this.value as Function).call(this.parent.value, ...args?.map(a=> cleanProxy(a))) : null;

        let innerExp = this.actions.find(a => a instanceof CallExpression && a.value == result);

        if (!innerExp) {

            innerExp = new CallExpression(result, args, this);

            this.actions.push(innerExp);
        }
        else
            innerExp.hitCount++;

        return innerExp;
    }

    *references(): Iterable<IExpressionProp> {

        const map = new Map<object, IExpressionProp[]>();

        function getOrCreateProps(obj: object) {

            let curProps = map.get(obj);

            if (!curProps) {
                curProps = [];
                map.set(obj, curProps);
            }

            return curProps;
        }

        for (const exp of this.visit()) {

            if (exp instanceof GetExpression) {

                const curProps = getOrCreateProps(exp.parent.value);

                if (!curProps.some(a => a.propName == exp.propName))
                    curProps.push({
                        object: cleanProxy(exp.parent.value),
                        propName: exp.propName,
                        value: exp.value,
                        readonly: exp.readonly
                    });
            }

            if (exp.value !== undefined && exp.value !== null)
                getOrCreateProps(exp.value);
        }

        for (const item of map) {
            if (item[1].length === 0)
                yield {
                    object: item[0]
                }
            else {
                for (const prop of item[1])
                    yield prop;
            }
        }

        return map;
    }

    property() {

        let result: IExpressionProp;

        function visit(exp: ExpressionType) {

            if (exp.actions.length == 0 && exp instanceof GetExpression) {
                result = {
                    object: exp.parent.value,
                    propName: (exp as GetExpression<any>).propName,
                    value: exp.value
                }
            }
            else if (exp.actions.length == 1 && exp.hitCount == 1)
                visit(exp.actions[0]);
        }

        visit(this);

        return result;
    }

    isSingle() {

        let result = true;

        function visit(exp: ExpressionType) {

            if (exp.actions.length > 1 || exp.hitCount > 1)
                result = false;
            else
                visit(exp.actions[0]);
        }

        visit(this);

        return result;
    }

    *visit(filter: (exp: Expression<any>) => boolean = () => true): Iterable<Expression<any>> {

        if (filter(this))
            yield this;

        for (const action of this.actions) {
            for (const item of action.visit(filter))
                yield item;
        }
    }

    paths() {
        const result: string[] = [];
        function visit(exp: ExpressionType, curPath: string) {

            if (exp.actions.length == 0)
                result.push(curPath);
            else {

                for (const action of exp.actions) {

                    let newPath = curPath;

                    if (action instanceof GetExpression)
                        newPath += "." + action.propName;
                    else if (action instanceof SetExpression)
                        newPath += "." + action.propName + ".set";
                    else if (action instanceof UseExpression)
                        newPath = "use";
                    else
                        newPath += "()";
                    visit(action, newPath)
                }
            }
        }

        visit(this, "$root");

        return result;
    }

    protected createProxy() {

        let proxyValue: object = cleanProxy(this.value);

        if (!this._options.evaluate && (this.value === undefined || this.value === null))
            proxyValue = EMPTY_FUNCTION;

        if ((typeof proxyValue != "object" && typeof proxyValue != "function") ||
            (this._options.evaluate && (proxyValue === null || proxyValue === undefined)))
            return proxyValue;

        const proxy = new Proxy(proxyValue, {

            get: (target: any, prop, rec) : any => {
  
                if (prop == TARGET)
                    return target;

                if (prop == Symbol.toPrimitive && !this._options.evaluate)
                    return EMPTY_FUNCTION;

                if (prop == USE)
                    return (model: any) => this.use(model).createProxy();

                let value: any;

                let readonly = false;

                if (this._options.evaluate) { 

                    if (this._options.customProps && prop in this._options.customProps)
                        value = this._options.customProps[prop]();
                    else {
                        const desc = getPropertyDescriptor(target, prop);
                        if (desc && desc.get && !desc.set) {
                            value = desc.get.call(proxy);
                            readonly = true;
                        }
                        else
                            value = target[prop];
                    }
                      
                }


                if (typeof prop == "symbol")
                    return value;

                const exp = this.get(prop, readonly);

                return exp.createProxy();
            },

            set: (target: any, prop, newValue, rec): any => {

                if (typeof prop != "symbol")
                    this.set(prop, newValue);
                else if (this._options.evaluate)
                    target[prop] = newValue;
       
                return true;
            },

            apply: (target, thisArg, argArray: []): any => {

                const exp = this.call(...argArray);

                return exp.createProxy();
            }
        });

        return proxy;
    }

    static build<TModel, TValue>(model: TModel, bind: BindExpression<TModel, TValue>, options?: IExpressionOptions) {
        const exp = new UseExpression(model, null, options);
        const value = bind(exp.createProxy()) as TValue;
        return {
            expression: exp,
            value: options?.evaluate ? cleanProxy(value) : undefined
        } as IExpressionBuild<TModel, TValue>
;
    }

    hitCount: number;

    abstract readonly type: any;

    readonly value: TValue;

    readonly parent: ExpressionType;

    readonly actions: ExpressionType[] = [];
}

export class CallExpression<TFunc extends Function> extends Expression<TFunc> {
    constructor(value: TFunc, args: [], parent: ExpressionType) {
        super(value, parent);

        this.args = args;
    }

    readonly args: [];

    readonly propName: string;

    readonly type = "call";
}

export class SetExpression<TObj extends Record<string, any>> extends Expression<TObj> {
    constructor(value: TObj, propName: string, parent: ExpressionType) {
        super(value, parent);

        this.propName = propName;
    }

    readonly propName: string;

    readonly type = "set";
}

export class GetExpression<TObj extends Record<string, any>> extends Expression<TObj> {
    constructor(value: TObj, propName: string, parent?: ExpressionType, readonly?: boolean) {
        super(value, parent);

        this.propName = propName;
        this.readonly = readonly;
    }

    readonly propName: string;

    readonly type = "get";

    readonly readonly: boolean;
}

export class UseExpression<TObj extends Record<string, any>> extends Expression<TObj> {
    constructor(value: TObj, parent?: ExpressionType, options?: IExpressionOptions ) {
        super(value, parent, options);
    }

    readonly type = "use";
}

