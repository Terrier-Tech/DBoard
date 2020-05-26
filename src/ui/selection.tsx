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

    entities: Record<string,Entity.Model> = {}

    clear() {
        this.entities = {}
        this.ui.requestRender(UI.RenderType.Overlay)
    }

    numEntites() : number {
        return Object.entries(this.entities).length
    }

    isEntitySelected(entity: Entity.Model) : boolean {
        return this.entities[entity.id] != undefined
    }

    add(entity: Entity.Model, append=false) {
        if (!append && this.mode == Mode.Replace) {
            this.entities = {}
        }
        this.entities[entity.id] = entity
        this.ui.requestRender(UI.RenderType.Overlay)
    }

    mapEntities<T>(fun: (e: Entity.Model) => T) : Array<T> {
        return Object.entries(this.entities).map((kv) => {
            return fun(kv[1])
        })
    }

    render() : JSX.Element {
        const entities = this.mapEntities(entity => {
            const size = entity.size
            const style = {
                width: size[0],
                height: size[1],
                top: entity.state.y,
                left: entity.state.x
            }
            return <div className='entity-overlay' key={entity.id} style={style}></div>
        })
        return <div className='selection'>{entities}</div>
    }

}

export default Selection