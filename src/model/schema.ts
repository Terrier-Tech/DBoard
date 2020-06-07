import ModelBase from "./model_base"
import * as Entity from './entity';
import * as Association from './association'
import * as Geom from '../util/geom'


class Schema extends ModelBase<SchemaState> {

    constructor() {
        super("schema", new SchemaState(), null)
    }

    private entities : Record<string,Entity.Model> = {}

    registerEntity(entity: Entity.Model) {
        this.entities[entity.id] = entity
    }

    getEntity(id: string): Entity.Model {
        return this.entities[id]
    }

    hasEntity(id: string): boolean {
        return !!this.entities[id]
    }

    addEntity(entity: Entity.Model) {
        this.entities[entity.id] = entity
    }

    removeEntity(id: string) {
        delete this.entities[id]
    }

    newEntity(state: Entity.State, id: string|null=null) : Entity.Model {
        return new Entity.Model(this, state, id)
    }

    get allEntities() : Array<Entity.Model> {
        return Object.entries(this.entities).map(kv => {return kv[1]})
    }

    filterEntities(fun: (e: Entity.Model) => boolean) : Array<Entity.Model> {
        return Object.entries(this.entities).filter(kv => {
            return fun(kv[1])
        }).map(kv => {return kv[1]})
    }

    mapEntities<T>(fun: (e: Entity.Model) => T) : Array<T> {
        return Object.entries(this.entities).map(kv => {
            return fun(kv[1])
        })
    }

    entityAt(p: Geom.Point): Entity.Model | undefined {
        for (let entity of this.allEntities {
            if (Geom.rectContainsPoint(entity, p)) {
                return entity
            }
        }
        return undefined
    }

    private associations : Record<string,Association.Model> = {}

    registerAssociation(entity: Association.Model) {
        this.associations[entity.id] = entity
    }

    getAssociation(id: string): Association.Model {
        return this.associations[id]
    }

    addAssociation(ass: Association.Model) {
        this.associations[ass.id] = ass
    }

    removeAssociation(id: string) {
        delete this.associations[id]
    }

    newAssociation(state: Association.State, id: string|null=null) : Association.Model {
        return new Association.Model(this, state, null)
    }

    buildAssociation(): Association.Builder {
        return new Association.Builder(this)
    }

    get allAssociations() : Array<Association.Model> {
        return Object.entries(this.associations).map(kv => {return kv[1]})
    }

    filterAssociations(fun: (e: Association.Model) => boolean) : Array<Association.Model> {
        return Object.entries(this.associations).filter(kv => {
            return fun(kv[1])
        }).map(kv => {return kv[1]})
    }

    mapAssociations<T>(fun: (e: Association.Model) => T) : Array<T> {
        return Object.entries(this.associations).map(kv => {
            return fun(kv[1])
        })
    }

}

class SchemaState {

}


export default Schema