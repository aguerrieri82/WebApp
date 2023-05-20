import { BindExpression, PARENT, USE } from "./abstraction";

type ExpressionType = Expression<any> | CallExpression<any> | SetExpression<any> | UseExpression<any> | GetExpression<any>;


export interface IExpressionOptions {
    evaluate?: boolean;
    customProps?: Record<string | symbol, () => any>;
}

export interface IExpressionProp {

    object: Record<string, any>;

    propName?: string;

    value?: any;
}


export abstract class Expression<TValue extends Record<string, any> | Function> {

    protected _options: IExpressionOptions;

    constructor(value: TValue, parent?: ExpressionType, options?: IExpressionOptions) {
        this.parent = parent;
        this.value = value;
        this._options = options || {};
        this.hitCount = 1;
    }

    use(model: TValue) {

        return this;
    }

    set<TSetValue>(propName: string, value: TSetValue)   {

        if (this._options.evaluate)
            (this.value as Record<string, any>)[propName] = value;

        let innerExp = this.actions.find(a => a.type == "set" && a.propName == propName);

        if (!innerExp) {

            innerExp = new SetExpression(value, propName, this);

            this.actions.push(innerExp);
        }
        else
            innerExp.hitCount++;

        return innerExp;
    }

    get(propName: string) {

        const value = this._options.evaluate ? (this.value as Record<string, any>)[propName] : undefined;

        let innerExp = this.actions.find(a => a.type == "get" && a.propName == propName);

        if (!innerExp) {

            innerExp = new GetExpression(value, propName, this);

            this.actions.push(innerExp);
        }
        else
            innerExp.hitCount++;
        
        return innerExp;
    }

    call(...args: []): ExpressionType{

        const result = this._options.evaluate ? (this.value as Function).call(this.parent.value, ...args) : null;

        let innerExp = this.actions.find(a => a.type == "call" && a.value == result);

        if (!innerExp) {

            innerExp = new CallExpression(result, args, this);

            this.actions.push(innerExp);
        }
        else
            innerExp.hitCount++;

        return innerExp;
    }

    *getReferences(): Iterable<IExpressionProp> {

        const map = new Map<object, string[]>();

        function getOrCreateProps(obj: object) {

            let curProps = map.get(obj);

            if (!curProps) {
                curProps = [];
                map.set(obj, curProps);
            }

            return curProps;
        }

        for (const exp of this.visit()) {

            if (exp.type == "get") {

                const curProps = getOrCreateProps(exp.parent.value);

                if (!curProps.some(a => a == exp.propName))
                    curProps.push(exp.propName);
            }

            if (exp.value !== undefined && exp.value !== null)
                getOrCreateProps(exp.value);
        }

        for (const item of map) {
            if (!item[1])
                yield {
                    object: item[0]
                }
            else {
                for (const prop of item[1])
                    yield {
                        object: item[0],
                        propName: prop
                    }
            }

        }

        return map;
    }

    getProperty() {

        let result: IExpressionProp;

        function visit(exp: ExpressionType) {

            if (exp.actions.length == 0 && exp.type == "get") {
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

                    if (action.type == "get")
                        newPath += "." + action.propName;
                    else if (action.type == "set")
                        newPath += "." + action.propName + ".set";
                    else if (action.type == "use")
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

        if (typeof this.value != "object" && typeof this.value != "function")
            return this.value;

        return new Proxy(this.value, {

            get: (target: any, prop, rec) : any => {

                let value: any;

                if (this._options.customProps && prop in this._options.customProps)
                    value = this._options.customProps[prop]();
                else
                    value = target[prop];

                if (prop == USE) {
                    const exp = this.use(value);
                    return exp.createProxy();
                }

                //TODO pass context & get parent

                if (typeof prop == "symbol")
                    return value;

                const exp = this.get(prop);

                return exp.createProxy();
            },

            set: (target: any, prop, newValue, rec): any => {

                if (typeof prop != "symbol")
                    this.set(prop, newValue);
       
                return true;
            },

            apply: (target, thisArg, argArray: []): any => {

                const exp = this.call(...argArray);

                return exp.createProxy();
            }
        });
    }

    static build<TModel extends object, TValue>(model: TModel, bind: BindExpression<TModel, TValue>, options?: IExpressionOptions) {
        const exp = new UseExpression(model, null, options);
        bind(exp.createProxy());
        return exp;
    }

    hitCount: number;

    readonly type: string;

    readonly value: TValue;

    readonly parent: ExpressionType;

    readonly actions: ExpressionType[] = [];
}

class CallExpression<TFunc extends Function> extends Expression<TFunc> {
    constructor(value: TFunc, args: [], parent: ExpressionType) {
        super(value, parent);

        this.args = args;
    }

    readonly args: [];

    readonly propName: string;

    readonly type = "call";
}

class SetExpression<TObj extends Record<string, any>> extends Expression<TObj> {
    constructor(value: TObj, propName: string, parent: ExpressionType) {
        super(value, parent);

        this.propName = propName;
    }

    readonly propName: string;

    readonly type = "set";
}

class GetExpression<TObj extends Record<string, any>> extends Expression<TObj> {
    constructor(value: TObj, propName: string, parent?: ExpressionType) {
        super(value, parent);

        this.propName = propName;
    }

    readonly propName: string;

    readonly type = "get";
}

class UseExpression<TObj extends Record<string, any>> extends Expression<TObj> {
    constructor(value: TObj, parent?: ExpressionType, options?: IExpressionOptions ) {
        super(value, parent, options);
    }

    readonly type = "use";
}

