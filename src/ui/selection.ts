import * as React from "react"
import UI from "./ui"
import * as Entity from "../model/entity"


enum Mode {
    Replace,
    Append
}

class Selection {

    constructor(readonly ui: UI) {
        
    }

    readonly mode: Mode = Mode.Replace

    private callback?: () => void

    entities: Record<string,Entity.Model> = {}

    clear() {
        this.entities = {}
        this.changed()
    }

    numEntites() : number {
        return Object.entries(this.entities).length
    }

    add(entity: Entity.Model, append=false) {
        if (!append && this.mode == Mode.Replace) {
            this.entities = {}
        }
        this.entities[entity.id] = entity
        this.changed()
    }

    mapEntities<T>(fun: (e: Entity.Model) => T) : Array<T> {
        return Object.entries(this.entities).map((kv) => {
            return fun(kv[1])
        })
    }

    onChange(fun: () => void) {
        this.callback = fun
    }

    changed() {
        if (this.callback) {
            this.callback()
        }
    }

}

export default Selection