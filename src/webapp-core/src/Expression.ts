import { BindExpression, PARENT, USE } from "./abstraction";

type ExpressionType = CallExpression<any> | SetExpression<any> | UseExpression<any> | GetExpression<any>;

export abstract class Expression<TValue extends Record<string, any> | Function> {

    constructor(value: TValue, parent?: ExpressionType) {
        this.parent = parent;
        this.value = value;
    }

    use(model: TValue) {

        return this;
    }

    set<TSetValue>(propName: string, value: TSetValue) {

        let innerExp = this.actions.find(a => a.type == "set" && a.propName == propName);

        if (!innerExp) {

            innerExp = new SetExpression(value, propName, this as ExpressionType);

            this.actions.push(innerExp);
        }

        return innerExp;
    }

    get(propName: string) {

        const value = (this.value as Record<string, any>)[propName];

        let innerExp = this.actions.find(a => a.type == "get" && a.propName == propName);

        if (!innerExp) {

            innerExp = new GetExpression(value, propName, this as ExpressionType);

            this.actions.push(innerExp);
        }
        
        return innerExp;
    }

    call(...args: []) {

        const result = (this.value as Function).call(this.parent.value, ...args);

        let innerExp = this.actions.find(a => a.type == "call" && a.value == result);

        if (!innerExp) {

            innerExp = new CallExpression(result, args, this as ExpressionType);

            this.actions.push(innerExp);
        }

        return innerExp;
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

        visit(this as ExpressionType, "$root");

        return result;
    }

    protected createProxy() {

        if (typeof this.value != "object" && typeof this.value != "function")
            return this.value;

        return new Proxy(this.value, {

            get: (target: any, prop, rec) : any => {

                const value = target[prop];

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

    static build<TModel extends object, TValue>(model: TModel, bind: BindExpression<TModel, TValue>) {
        const exp = new UseExpression(model);
        bind(exp.createProxy());
        return exp;
    }

    readonly type: "get" | "set" | "call" | "use";

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
    constructor(value: TObj, parent?: ExpressionType) {
        super(value, parent);
    }

    readonly type = "use";
}

