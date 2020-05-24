import ModelBase from "./model_base";
import * as Entity from '../model/entity';


class Attribute extends ModelBase<AttributeState> {

    constructor(public entity: Entity.Model, state: AttributeState) {
        super("attribute", state)
        entity.registerAttribute(this)
    }

    static fromRaw(entity: Entity.Model, raw: string) : Attribute {
        const state = AttributeState.fromRaw(raw)
        return new Attribute(entity, state)
    }
}

class AttributeState {
    constructor(readonly name: string, readonly type: string = 'text', readonly isRequired: boolean = false) {

    }

    static fromRaw(raw: String) : AttributeState {
        const comps = raw.split(':')
        let name = comps[0].trim()
        let type = 'text'
        if (comps.length > 1) {
            type = comps[1].trim()
        }
        let isRequired = false 
        if (name.indexOf('*')>-1) {
            isRequired = true
            name = name.replace(/\*/g, '')
        }
        return new AttributeState(name, type, isRequired)
    }
}

export {Attribute as Model}
export {AttributeState as State}