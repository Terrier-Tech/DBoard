import Schema from "./schema"
import ModelBase from "./model_base"
import * as Attribute from "./attribute"
import * as themes from '../view/themes'

class Entity extends ModelBase<EntityState> {
    constructor(schema: Schema, state: EntityState = new EntityState()) {
        super("entity", state)
        schema.registerEntity(this)
    }

    readonly attributes : {[id: string]: Attribute.Model} = {}

    registerAttribute(attr: Attribute.Model) {
        this.attributes[attr.id] = attr
    }

    removeAttribute(id: string) {
        delete this.attributes[id]
    }

    numAttributes() : number {
        return Object.entries(this.attributes).length
    }

    newAttribute(raw: string) : Attribute.Model {
        return Attribute.Model.fromRaw(this, raw)
    }

    mapAttributes<T>(fun: (e: Attribute.Model) => T) : Array<T> {
        const attrs = Object.entries(this.attributes)
        attrs.sort((a1, a2) => {
            return a1[1].state.name > a2[1].state.name ? 1 : -1
        })
        return attrs.map((kv) => {
            return fun(kv[1])
        })
    }
}

class EntityState {
    readonly name: string = ""
    readonly x: number = 0
    readonly y: number = 0
    readonly color: themes.ColorName = themes.ColorName.blue
}

export {Entity as Model}
export {EntityState as State}