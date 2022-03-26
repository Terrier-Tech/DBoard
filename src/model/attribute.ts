import ModelBase from "./model_base"
import * as Entity from '../model/entity'
import * as Geom from '../util/geom'
import * as Actions from "../ui/actions"


export class Model extends ModelBase<State> {

    constructor(public entity: Entity.Model, state: State, id: string|null=null) {
        super("attribute", state, id)
        entity.registerAttribute(this)
    }

    static fromRaw(entity: Entity.Model, raw: string) : Model {
        const state = State.fromRaw(raw)
        return new Model(entity, state)
    }

    get raw(): string {
        return State.toRaw(this.state)
    }

    position: Geom.Point = Geom.makePoint(0,0) // computed when rendered, not part of the state
}

export class State {

    constructor(readonly name: string, readonly type: string = 'text', readonly isRequired: boolean = false) {

    }

    static fromRaw(raw: string) : State {
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
        return new State(name, type, isRequired)
    }

    static toRaw(state: State): string {
        const required = state.isRequired ? '*' : ''
        return `${state.name}${required}: ${state.type}`
    }
}

export class UpdateAction extends Actions.Base {

    constructor(readonly attribute: Model, readonly fromState: State, readonly toState: State) {
        super()
    }

    apply(): void {
        this.attribute.state = this.toState
    }

    unapply(): void {
        this.attribute.state = this.fromState
    }

    hasChanges(): boolean {
        return State.toRaw(this.fromState) != State.toRaw(this.toState)
    }
}

export class NewAction extends Actions.Base {

    private attribute: Model | undefined

    constructor(readonly entity: Entity.Model, readonly raw: string) {
        super()
    }

    apply(): void {
        this.attribute = this.entity.newAttributeFromRaw(this.raw)
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

export class DeleteAction extends Actions.Base {

    private entity: Entity.Model

    constructor(private attribute: Model) {
        super()
        this.entity = attribute.entity
    }

    apply(): void {
        this.entity.removeAttribute(this.attribute.id)
    }

    unapply(): void {
        this.attribute = this.entity.newAttributeFromRaw(this.attribute.raw)
    }

    hasChanges(): boolean {
        return true
    }
}
