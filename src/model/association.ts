import * as Entity from './entity'
import ModelBase from './model_base'
import Schema from './schema'
import * as Layout from '../view/layout'

export class Model extends ModelBase<State> {

    // this is computed during the layout phase
    linePath: Layout.LinePath | null = null

    constructor(private schema: Schema, state: State) {
        super('association', state)
        schema.registerAssociation(this)
    }

    get entities(): Array<Entity.Model> {
        return Object.entries(this.state.sides).map(kv => {
            return this.schema.getEntity(kv[0])
        })
    }

    get sides(): Array<Side> {
        return Object.entries(this.state.sides).map(kv => {
            return kv[1]
        })
    }

}

export type Arity = 'one' | 'many'

export class Side {
    constructor(public entityId: string, public arity: Arity = 'one') {
        
    }
}

export class State {

    sides: Record<string, Side> = {}

    constructor(fromSide: Side, toSide: Side) {
        this.sides[fromSide.entityId] = fromSide
        this.sides[toSide.entityId] = toSide
    }

}

export class Builder {

    private sides: Array<Side> = []

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
        return new Model(this.schema, new State(this.sides[0], this.sides[1]))
    }

}
