import * as React from 'react'
import Interactor from "./interactor"
import * as Entity from "../model/entity"
import * as Attribute from "../model/attribute"
import UI from './ui'
import Selection from './selection'


class SelectInteractor extends Interactor {

    // this will handle mouse interaction for special things like rubber band selection and dragging entities
    private proxy?: InteractorProxy

    onCanvasMouseDown(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        console.log(`canvas mouse down ${evt.clientX},${evt.clientY}`)
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
        console.log(`entity mouse down ${entity.id} (shift=${evt.shiftKey})`)
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


interface InteractorProxy {

    onMouseMove(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) : void

    onMouseUp(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) : void

    render() : JSX.Element
}

class RubberBand implements InteractorProxy {

    private initialPos: [number, number]
    private xRange: [number, number]
    private yRange: [number, number]
    private selection: Selection

    constructor(readonly interactor: SelectInteractor, evt: React.MouseEvent) {
        console.log(`new RubberBand (shift=${evt.shiftKey})`)
        this.selection = interactor.ui.selection

        if (!evt.shiftKey) {
            this.selection.clear()
        }

        this.initialPos = this.interactor.eventRelativePosition(evt)
        this.xRange = [this.initialPos[0], this.initialPos[0]]
        this.yRange = [this.initialPos[1], this.initialPos[1]]
    }

    private updateRanges(evt: React.MouseEvent) {
        const pos = this.interactor.eventRelativePosition(evt)
        this.xRange = [
            Math.min(this.initialPos[0], pos[0]),
            Math.max(this.initialPos[0], pos[0]),
        ]
        this.yRange = [
            Math.min(this.initialPos[1], pos[1]),
            Math.max(this.initialPos[1], pos[1]),
        ]
    }

    onMouseMove(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
        this.updateRanges(evt)
    }
    
    onMouseUp(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
        console.log(`rubber band mouse up`, evt)
        this.updateRanges(evt)

        this.interactor.ui.schema.mapEntities(entity => {
            if (entity.isWithin(this.xRange, this.yRange)) {
                this.selection.add(entity, true)
            }
        })
    }
    
    render(): JSX.Element {
        const style = {
            left: this.xRange[0],
            top: this.yRange[0],
            width: (this.xRange[1] - this.xRange[0]),
            height: (this.yRange[1] - this.yRange[0])
        }
        return <div className='select-interactor rubber-band' style={style}></div>
    }
}

class EntityDrag implements InteractorProxy {

    constructor(readonly interactor: SelectInteractor, evt: React.MouseEvent) {
        console.log('new EntityDrag')
    }

    onMouseMove(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
        console.log(`entity drag mouse move`, evt)
    }

    onMouseUp(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
        console.log(`entity drag mouse up`, evt)
    }

    render(): JSX.Element {
        return <div className='select-interactor'></div>
    }

}