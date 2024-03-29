import * as Entity from './entity'
import ModelBase from './model_base'
import Schema from './schema'
import * as Layout from '../view/layout'
import * as Actions from "../ui/actions"
import Config from '../view/config'
import UI from '../ui/ui'


export class Model extends ModelBase<State> {

    // this is computed during the layout phase
    linePath: Layout.LinePath | null = null

    constructor(readonly schema: Schema, state: State, id: string|null=null) {
        super('association', state, id)
        schema.registerAssociation(this)
    }

    get entities(): Array<Entity.Model> {
        return Object.entries(this.state.sides).map(kv => {
            return this.schema.getEntity(kv[0])
        })
    }

    get sides(): Array<Side> {
        return Object.values(this.state.sides)
    }

}

export type Arity = 'one' | 'many'

export function oppositeArity(arity: Arity): Arity {
    return arity == 'one' ? 'many' : 'one'
}

// side information without the entity
export interface ISide {
    arity: Arity
}

export class Side implements ISide {
    constructor(public entityId: string, public arity: Arity = 'one') {
        
    }
}

export class State {

    sides: Record<string, Side> = {}

    constructor(fromSide: Side, toSide: Side, readonly isRequired: boolean = true) {
        this.sides[fromSide.entityId] = fromSide
        this.sides[toSide.entityId] = toSide
    }

}

export class Builder {

    private sides: Array<Side> = []

    isRequired: boolean = true

    constructor(private schema: Schema) {

    }

    add(entity: Entity.Model, arity: Arity='one'): Builder {
        this.sides.push(new Side(entity.id, arity))
        return this
    }

    build(): Model {
        if (this.sides.length != 2) {
            throw "Must call add() twice!"
        }
        return new Model(this.schema, new State(this.sides[0], this.sides[1], this.isRequired))
    }

}



export class NewAction extends Actions.Base {

    private association: Model | undefined

    constructor(readonly schema: Schema, readonly state: State) {
        super()
    }

    apply(config: Config, ui: UI): void {
        if (this.association) {
            this.schema.addAssociation(this.association)
        }
        else {
            this.association = this.schema.newAssociation(this.state)
        }
        ui.selection.addAssociation(this.association, false)
    }

    unapply(config: Config, ui: UI): void {
        if (this.association) {
            this.schema.removeAssociation(this.association.id)
        }
    }

    hasChanges(): boolean {
        return true
    }
}


export class UpdateAction extends Actions.Base {

    constructor(readonly association: Model, readonly fromState: State, readonly toState: State) {
        super()
    }

    apply(config: Config, ui: UI): void {
        this.association.state = this.toState
    }

    unapply(config: Config, ui: UI): void {
        this.association.state = this.fromState
    }

    hasChanges(): boolean {
        const {fromFirstSide, fromLastSide} = this.fromState.sides
        const {toFirstSide, toLastSide} = this.toState.sides
        return fromFirstSide.arity != toFirstSide.arity || 
            fromLastSide.arity != toLastSide.arity || 
            this.fromState.isRequired != this.toState.isRequired
    }
}


export class DeleteAction extends Actions.Base {

    private schema: Schema

    constructor(private association: Model) {
        super()
        this.schema = association.schema
    }

    apply(config: Config, ui: UI): void {
        this.schema.removeAssociation(this.association.id)
    }

    unapply(config: Config, ui: UI): void {
        this.schema.addAssociation(this.association)
    }

    hasChanges(): boolean {
        return true
    }
}
