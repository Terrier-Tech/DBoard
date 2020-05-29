import ModelBase from "./model_base"
import * as Entity from './entity';


class Schema extends ModelBase<SchemaState> {

    constructor() {
        super("schema", new SchemaState())
    }

    private entities : Record<string,Entity.Model> = {}

    registerEntity(entity: Entity.Model) {
        this.entities[entity.id] = entity
    }

    removeEntity(id: string) {
        delete this.entities[id]
    }

    newEntity(state: Entity.State) : Entity.Model {
        return new Entity.Model(this, state)
    }

    allEntities() : Array<Entity.Model> {
        return Object.entries(this.entities).map((kv) => {return kv[1]})
    }

    filterEntities(fun: (e: Entity.Model) => boolean) : Array<Entity.Model> {
        return Object.entries(this.entities).filter((kv) => {
            return fun(kv[1])
        }).map((kv) => {return kv[1]})
    }

    mapEntities<T>(fun: (e: Entity.Model) => T) : Array<T> {
        return Object.entries(this.entities).map((kv) => {
            return fun(kv[1])
        })
    }

}

class SchemaState {

}


export default Schema