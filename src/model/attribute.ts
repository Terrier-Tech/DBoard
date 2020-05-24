import ModelBase from "./model_base";
import * as Entity from '../model/entity';


class Attribute extends ModelBase<AttributeState> {

    constructor(entity: Entity.Model, raw: string) {
        const state = AttributeState.fromRaw(raw)
        super("attribute", state)
    }
}

class AttributeState {
    constructor(readonly name: string, readonly type: string = 'text') {

    }

    static fromRaw(raw: String) : AttributeState {
        const comps = raw.split(':')
        const name = comps[0].trim()
        let type = 'text'
        if (comps.length > 1) {
            type = comps[1].trim()
        }
        return new AttributeState(name, type)
    }
}

export {Attribute as Model}
export {AttributeState as State}