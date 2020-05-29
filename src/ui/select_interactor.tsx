import * as React from 'react'
import {Interactor, InteractorProxy} from "./interactor"
import * as Entity from "../model/entity"
import * as Attribute from "../model/attribute"
import UI from './ui'
import Selection from './selection'
import * as geom from "../util/geom"


class SelectInteractor extends Interactor {

    // this will handle mouse interaction for special things like rubber band selection and dragging entities
    private proxy?: InteractorProxy

    onCanvasMouseDown(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        this.proxy = new RubberBand(this, evt)
    }

    onCanvasMouseMove(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (evt.buttons) { // ignore move events unless a mouse button is down
            if (this.proxy) {
                this.proxy.onMouseMove(evt)
                this.ui.requestRender(UI.RenderType.Overlay)
            }
        }
    }

    onCanvasMouseUp(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (this.proxy != undefined) {
            this.proxy.onMouseUp(evt)
            this.proxy = undefined
            this.ui.requestRender(UI.RenderType.Overlay)
        }
    }


    onEntityMouseDown(entity: Entity.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
        // if the entity is already selected, don't clear the selection
        this.ui.selection.add(entity, evt.shiftKey || this.ui.selection.isEntitySelected(entity))
        this.proxy = new EntityDrag(this, evt)
    }

    onEntityDoubleClicked(entity: Entity.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
        console.log(`entity double clicked ${entity.id}`)
        
    }

    render() : JSX.Element {
        if (this.proxy) {
            return this.proxy.render()
        }
        return <div className='select-interactor'></div>
    }

}

export default SelectInteractor


// a selection rectangle is created as the user drags, 
// when they release, anything inside the rectangle is selected
class RubberBand implements InteractorProxy {

    private initialPos: geom.Point
    private range: geom.Rect
    private selection: Selection

    constructor(readonly interactor: SelectInteractor, evt: React.MouseEvent) {
        this.selection = interactor.ui.selection

        if (!evt.shiftKey) {
            this.selection.clear()
        }

        this.initialPos = this.interactor.eventRelativePosition(evt)
        this.range = geom.Rect.fromPoints(this.initialPos, this.initialPos)
    }

    private updateRange(evt: React.MouseEvent) {
        const pos = this.interactor.eventRelativePosition(evt)
        this.range = geom.Rect.fromPoints(pos, this.initialPos)
    }

    onMouseMove(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
        this.updateRange(evt)
    }
    
    onMouseUp(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
        this.updateRange(evt)

        this.interactor.ui.schema.mapEntities(entity => {
            if (entity.isWithin(this.range)) {
                this.selection.add(entity, true)
            }
        })
    }
    
    render(): JSX.Element {
        const style = {
            left: this.range.x,
            top: this.range.y,
            width: this.range.width,
            height: this.range.height
        }
        return <div className='select-interactor rubber-band' style={style}></div>
    }
}


// drags the selected entities along with the mouse movement
class EntityDrag implements InteractorProxy {

    selection: Selection

    initialStates: Record<string, Entity.State> = {}

    diffPos: geom.Point

    guides: Array<GuideProps> = []

    constructor(readonly interactor: SelectInteractor, evt: React.MouseEvent) {
        this.selection = interactor.ui.selection

        this.selection.mapEntities(entity => {
            this.initialStates[entity.id] = {...entity.state}
        })

        this.diffPos = new geom.Point(0, 0)
    }

    onMouseMove(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
        this.diffPos = this.diffPos.add(evt.movementX, evt.movementY)
        this.selection.mapEntities(entity => {
            let initial = this.initialStates[entity.id]
            entity.moveTo(initial.x + this.diffPos.x, initial.y + this.diffPos.y)
        })
        this.computeGuides()
        this.interactor.ui.requestRender(UI.RenderType.Viewport)
    }

    onMouseUp(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
        console.log(`entity drag mouse up`, evt)
        this.selection.mapEntities(entity => {
            entity.snapPosition(this.interactor.config)
        })
        this.guides = []
        this.interactor.ui.requestRender(UI.RenderType.Viewport)
    }

    render(): JSX.Element {
        return <div className='select-interactor'>
            {this.guides.map((guide, index) => {
                return <Guide {...guide} key={`guide-${index}`}/>
            })}
        </div>
    }

    computeGuides() {
        this.guides = []

        const notSelected = this.interactor.ui.schema.filterEntities((e) => {
            return !this.selection.isEntitySelected(e)
        })

        const types = {
            vertical: Entity.HorizontalPositionTypes,
            horizontal: Entity.VerticalPositionTypes
        }
        Object.entries(types).forEach((dirAndTypes) => {
            const dir = dirAndTypes[0]
            const dirTypes = dirAndTypes[1]
            for (let t of dirTypes) {
                let selectedVals = this.selection.mapEntities(entity => {
                    return this.interactor.config.snapNearest(entity.getPosition(t))
                })
                selectedVals = [...new Set(selectedVals)]
                notSelected.forEach((e) => {
                    const val = e.getPosition(t)
                    if (selectedVals.indexOf(val)>-1) {
                        this.guides.push({direction: dir, xy: val})
                    }
                })
            }
        })
        
    }
}

interface GuideProps {
    direction: string
    xy: number
}

class Guide extends React.Component<GuideProps> {
    
    render(): JSX.Element {
        const dir = this.props.direction
        const xyKey = dir=='vertical' ? 'left' : 'top'
        const style: any = {}
        style[xyKey] = this.props.xy
        return <div className={`guide ${dir}`} style={style}></div>
    }
}