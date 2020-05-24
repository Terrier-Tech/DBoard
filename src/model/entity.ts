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

    newAttribute(raw: string) : Attribute.Model {
        return new Attribute.Model(this, raw)
    }
}

class EntityState {
    readonly name: string = ""
    readonly x: number = 0
    readonly y: number = 0
    readonly width: number = 100
    readonly height: number = 100
    readonly color: themes.ColorName = themes.ColorName.blue
}

export {Entity as Model}
export {EntityState as State}