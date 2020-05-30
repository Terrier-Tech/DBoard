import * as React from 'react'
import {Interactor, InteractorProxy} from "./interactor"
import * as Entity from "../model/entity"
import * as Attribute from "../model/attribute"
import UI from './ui'
import Selection from './selection'
import * as geom from "../util/geom"


class SelectInteractor extends Interactor {

    onCanvasMouseDown(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (this.proxy) {
            return // don't override existing proxies
        }
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
        if (this.proxy) {
            if (this.proxy.onMouseUp(evt)) {
                this.clearProxy()
            }
        }
    }

    onCanvasDoubleClicked(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        console.log(`canvas double clicked`)
        if (this.proxy) {
            this.clearProxy()
        }
        this.ui.selection.clear()
    }


    onEntityMouseDown(entity: Entity.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
        if (this.proxy) {
            return // don't override existing proxies
        }

        // if the entity is already selected, don't clear the selection
        this.ui.selection.add(entity, evt.shiftKey || this.ui.selection.isEntitySelected(entity))
        this.proxy = new EntityDrag(this, evt)
    }

    onEntityDoubleClicked(entity: Entity.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
        console.log(`entity double clicked ${entity.id}`)
        if (this.proxy) {
            this.clearProxy()
        }
        this.proxy = new EntityNameField(this, entity)
        evt.stopPropagation()
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
class RubberBand extends InteractorProxy {

    private initialPos: geom.Point
    private range: geom.Rect
    private selection: Selection

    constructor(readonly interactor: SelectInteractor, evt: React.MouseEvent) {
        super()
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

    onMouseMove(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): boolean {
        this.updateRange(evt)
        return false
    }
    
    onMouseUp(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): boolean {
        this.updateRange(evt)

        this.interactor.ui.schema.mapEntities(entity => {
            if (entity.isWithin(this.range)) {
                this.selection.add(entity, true)
            }
        })
        return true
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
class EntityDrag extends InteractorProxy {

    selection: Selection

    initialStates: Record<string, Entity.State> = {}

    diffPos: geom.Point

    guides: Array<GuideProps> = []

    constructor(readonly interactor: SelectInteractor, evt: React.MouseEvent) {
        super()
        this.selection = interactor.ui.selection

        this.selection.mapEntities(entity => {
            this.initialStates[entity.id] = {...entity.state}
        })

        this.diffPos = new geom.Point(0, 0)
    }

    onMouseMove(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): boolean {
        this.diffPos = this.diffPos.add(evt.movementX, evt.movementY)
        this.selection.mapEntities(entity => {
            let initial = this.initialStates[entity.id]
            entity.moveTo(initial.x + this.diffPos.x, initial.y + this.diffPos.y)
        })
        this.computeGuides()
        this.interactor.ui.requestRender(UI.RenderType.Viewport)
        return false
    }

    onMouseUp(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): boolean {
        const changeActions = this.selection.mapEntities(entity => {
            entity.snapPosition(this.interactor.config)
            return new Entity.ChangeAction(entity, this.initialStates[entity.id], entity.state)
        })
        this.guides = []

        if (changeActions.map((a) => {return a.hasChanges()}).includes(true)) {
            this.interactor.ui.history.pushActions(changeActions)
        }
        else {
            this.interactor.ui.requestRender(UI.RenderType.Viewport)
        }
        return true
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

        for (let t of Entity.PositionTypes) {
            let selectedVals = this.selection.mapEntities(entity => {
                return this.interactor.config.snapNearest(entity.getPosition(t))
            })
            selectedVals = [...new Set(selectedVals)]
            notSelected.forEach((e) => {
                const val = e.getPosition(t)
                if (selectedVals.indexOf(val)>-1) {
                    this.guides.push({positionType: t, xy: val})
                }
            })
        }
        
    }
}

interface GuideProps {
    positionType: Entity.PositionType
    xy: number
}

class Guide extends React.Component<GuideProps> {
    
    render(): JSX.Element {
        const t = this.props.positionType
        const xyKey = Entity.PositionTypes.indexOf(t)<3 ? 'left' : 'top'
        const style: any = {}
        style[xyKey] = this.props.xy
        return <div className={`guide ${t}`} style={style}></div>
    }
}


// allows the user to change the entity name
class EntityNameField extends InteractorProxy {

    private input = React.createRef<HTMLInputElement>()

	constructor(readonly interactor: SelectInteractor, readonly entity: Entity.Model) {
		super()
    }
    
    onMouseMove(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): boolean {
        return false
    }
    
    onMouseUp(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): boolean {
        return false
    }

    onKeyPress(evt: React.KeyboardEvent<HTMLInputElement>) {
        switch (evt.key) {
            case 'Enter':
                const name = evt.currentTarget.value
                this.commit(name)
                return
            case 'Escape':
                this.interactor.clearProxy()
                return
        }
    }

    onKeyDown(evt: React.KeyboardEvent<HTMLInputElement>) {
        switch (evt.key) {
            case 'Escape':
                evt.preventDefault()
                this.interactor.clearProxy()
                return
        }
    }

    render(): JSX.Element {
        const config = this.interactor.config
        const style = {
            left: this.entity.left,
            top: this.entity.top,
            width: this.entity.width,
            height: config.lineHeight
        }
        const inputStyle = {
            width: this.entity.width
        }
        return <div className='entity-name-field text-field' style={style}>
            <input type='text' ref={this.input} defaultValue={this.entity.state.name} style={inputStyle} onKeyPress={this.onKeyPress.bind(this)} onKeyDown={this.onKeyDown.bind(this)}/>
        </div>
    }

    afterRender() {
        this.input.current?.focus()
    }

    commit(newName: string) {
        const newState = {...this.entity.state}
        newState.name = newName.trim()
        if (newState.name.length > 0 && newState.name != this.entity.state.name) {
            const action = new Entity.ChangeAction(this.entity, this.entity.state, newState)
            this.interactor.ui.history.pushAction(action)
        }
        this.interactor.clearProxy()
    }

}