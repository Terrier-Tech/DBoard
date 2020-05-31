import ModelBase from "./model_base"
import * as Entity from '../model/entity'
import * as geom from '../util/geom'
import * as Actions from "../ui/actions"


class Attribute extends ModelBase<AttributeState> {

    constructor(public entity: Entity.Model, state: AttributeState) {
        super("attribute", state)
        entity.registerAttribute(this)
    }

    static fromRaw(entity: Entity.Model, raw: string) : Attribute {
        const state = AttributeState.fromRaw(raw)
        return new Attribute(entity, state)
    }

    get raw(): string {
        return AttributeState.toRaw(this.state)
    }

    position: geom.Point = new geom.Point(0,0) // computed when rendered, not part of the state
}

class AttributeState {
    constructor(readonly name: string, readonly type: string = 'text', readonly isRequired: boolean = false) {

    }

    static fromRaw(raw: string) : AttributeState {
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

    static toRaw(state: AttributeState): string {
        const required = state.isRequired ? '*' : ''
        return `${state.name}${required}: ${state.type}`
    }
}

export class UpdateAction extends Actions.Base {

    constructor(readonly attribute: Attribute, readonly fromState: AttributeState, readonly toState: AttributeState) {
        super()
    }

    apply(): void {
        this.attribute.state = this.toState
    }

    unapply(): void {
        this.attribute.state = this.fromState
    }

    hasChanges(): boolean {
        return AttributeState.toRaw(this.fromState) != AttributeState.toRaw(this.toState)
    }
}

export class NewAction extends Actions.Base {

    private attribute: Attribute | undefined

    constructor(readonly entity: Entity.Model, readonly raw: string) {
        super()
    }

    apply(): void {
        this.attribute = this.entity.newAttribute(this.raw)
    }

    unapply(): void {
        if (this.attribute) {
            this.entity.removeAttribute(this.attribute.id)
        }
    }

    hasChanges(): boolean {
        return this.raw.length > 0
    }
}

export {Attribute as Model}
export {AttributeState as State}