import * as React from "react"
import UI from "./ui"
import * as Entity from "../model/entity"
import * as Association from '../model/association'
import * as Geom from '../util/geom'

enum Mode {
    Replace,
    Append
}

class Selection {

    constructor(readonly ui: UI) {
        
    }

    readonly mode: Mode = Mode.Replace

    clear(): Selection {
        this.entities = {}
        this.associations = {}
        this.ui.requestRender(UI.RenderType.Viewport)
        return this
    }

    entities: Record<string,Entity.Model> = {}

    numEntites() : number {
        return Object.entries(this.entities).length
    }

    isEntitySelected(entity: Entity.Model) : boolean {
        return this.entities[entity.id] != undefined
    }

    addEntity(entity: Entity.Model, append=false) {
        if (!append && this.mode == Mode.Replace) {
            this.clear()
        }
        this.entities[entity.id] = entity
        this.ui.requestRender(UI.RenderType.Overlay)
    }

    selectAll() {
        this.ui.schema.mapEntities((e) => {
            this.entities[e.id] = e
        })
        this.ui.requestRender(UI.RenderType.Overlay)
    }

    mapEntities<T>(fun: (e: Entity.Model) => T) : Array<T> {
        return Object.entries(this.entities).map(kv => {
            return fun(kv[1])
        })
    }

    associations: Record<string,Association.Model> = {}

    numAssociations() : number {
        return Object.entries(this.associations).length
    }

    isAssociationSelected(ass: Association.Model) : boolean {
        return this.associations[ass.id] != undefined
    }

    addAssociation(ass: Association.Model, append=false) {
        if (!append && this.mode == Mode.Replace) {
            this.entities = {}
        }
        this.associations[ass.id] = ass
        this.ui.requestRender(UI.RenderType.Viewport)
    }

    mapAssociations<T>(fun: (e: Association.Model) => T) : Array<T> {
        return Object.entries(this.associations).map(kv => {
            return fun(kv[1])
        })
    }



    renderOverlay() : JSX.Element {
        const entities = this.mapEntities(entity => {
            const size = entity.size
            const style = {
                width: size[0]+2,
                height: size[1]+2,
                top: entity.top-1,
                left: entity.left-1
            }
            return <div className='entity-overlay' key={entity.id} style={style}></div>
        })
        const associations = this.mapAssociations(ass => {
            if (!ass.linePath) {
                console.log('no association line path')
                return <div></div>
            }
            const path = ass.linePath
            const sides = ass.sides
            const sideOverlays = [
                {side: sides[0], point: path.firstPoint, dir: path.fromDir},
                {side: sides[1], point: path.lastPoint, dir: path.toDir}
            ].map(data => {
                const style = {
                    left: data.point.x,
                    top: data.point.y
                }
                return <div className='side-overlay' key={data.side.entityId} style={style} onMouseDown={(evt) => {evt.stopPropagation() ; this.onAssociationSideClicked(ass, data.side)}}></div>
            })
            return <div className='association-overlay' key={ass.id}>{sideOverlays}</div>
        })
        return <div className='selection'>{entities}{associations}</div>
    }


    onAssociationSideClicked(association: Association.Model, side: Association.Side) {
        console.log(`clicked ${association.id} side ${side.entityId}`)
    }

}

export default Selection