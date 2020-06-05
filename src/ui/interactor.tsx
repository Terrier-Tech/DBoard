import * as React from 'react'
import * as Entity from "../model/entity"
import * as Attribute from "../model/attribute"
import * as Association from '../model/association'
import UI from './ui'
import Selection from './selection'
import * as Geom from "../util/geom"
import Config from '../view/config'
import Icons from '../view/icons'
import * as Themes from '../view/themes'
import Schema from '../model/schema'

export class Interactor {
    
    // this will handle mouse interaction for special things like rubber band selection and dragging entities
    protected proxy?: InteractorProxy

    constructor(readonly ui: UI, readonly config: Config) {
        
    }

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
        this.clearProxy()
        this.ui.selection.clear()
    }


    onEntityMouseDown(entity: Entity.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
        if (this.proxy) {
            return // don't override existing proxies
        }

        // if the entity is already selected, don't clear the selection
        this.ui.selection.addEntity(entity, evt.shiftKey || this.ui.selection.isEntitySelected(entity))
        this.proxy = new EntityDrag(this, evt)
    }

    onEntityClicked(entity: Entity.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
    }

    onEntityDoubleClicked(entity: Entity.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
        this.editEntityName(entity)
        evt.stopPropagation()
    }

    onAttributeClicked(attr: Attribute.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
    }

    onAttributeDoubleClicked(attr: Attribute.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
        this.editAttribute(attr)
        evt.stopPropagation()
    }

    editEntityName(entity: Entity.Model) {
        this.clearProxy()
        this.proxy = new EntityNameField(this, entity)
    }

    editAttribute(attr: Attribute.Model) {
        this.clearProxy()
        this.proxy = new EditAttributeField(this, attr)
    }

    editFirstAttribute(entity: Entity.Model) {
        let attr = entity.firstAttribute()
        if (attr) {
            this.proxy = new EditAttributeField(this, attr)
        }
        else {
            this.addNewAttribute(entity)
        }
        this.ui.requestRender(UI.RenderType.Viewport)
    }

    editLastAttribute(entity: Entity.Model) {
        let attr = entity.lastAttribute()
        if (attr) {
            this.proxy = new EditAttributeField(this, attr)
        }
        else {
            this.proxy = new EntityNameField(this, entity)
        }
        this.ui.requestRender(UI.RenderType.Viewport)
    }

    editPreviousAttribute(currentAttr: Attribute.Model) {
        let attr = currentAttr.entity.previousAttribute(currentAttr)
        if (attr) {
            this.proxy = new EditAttributeField(this, attr)
        }
        else {
            this.proxy = new EntityNameField(this, currentAttr.entity)
        }
        this.ui.requestRender(UI.RenderType.Viewport)
    }

    editNextAttribute(currentAttr: Attribute.Model) {
        let attr = currentAttr.entity.nextAttribute(currentAttr)
        if (attr) {
            this.proxy = new EditAttributeField(this, attr)
        }
        else {
            this.onNewAttributeClicked(currentAttr.entity)
        }
        this.ui.requestRender(UI.RenderType.Viewport)
    }

    addNewAttribute(entity: Entity.Model) {
        this.proxy = new NewAttributeField(this, entity)
        this.ui.requestRender(UI.RenderType.Viewport)
    }

    onNewAttributeClicked(entity: Entity.Model) {
        this.addNewAttribute(entity)
    }

    onNewAssociationPressed(entity: Entity.Model) {
        console.log(`new associated pressed for entity ${entity.id}`)
    }

    onAssociationClicked(ass: Association.Model) {
        this.ui.selection.clear().addAssociation(ass)
    }

    beginNewEntity() {
        this.proxy = new NewEntity(this, this.ui.schema)
        this.ui.requestRender(UI.RenderType.Viewport)
    }


    render() : JSX.Element {
        if (this.proxy) {
            return this.proxy.renderOverlay()
        }
        return <div className='select-interactor'></div>
    }

    afterRender() {
        if (this.proxy) {
            this.proxy.afterRender()
        }
    }

    eventRelativePosition(evt: React.MouseEvent) : Geom.Point {
        const target = evt.currentTarget as HTMLElement
        const rect = target.getBoundingClientRect()
        return new Geom.Point(evt.clientX - rect.left,
            evt.clientY - rect.top
        )
    }

    clearProxy() {
        if (this.proxy) {
            const clearedProxy = this.proxy
            this.proxy = undefined
            this.ui.requestRender(UI.RenderType.App)
            clearedProxy.afterDone(this)
        }
    }

}

export default Interactor


// interface for interactor proxies that handle the interaction temporarily for the main interactor
export abstract class InteractorProxy {

    // return true if the proxy is done handling interactions
    onMouseMove(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) : boolean {
        return false
    }

    // return true if the proxy is done handling interactions
    onMouseUp(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) : boolean {
        return false
    }

    abstract renderOverlay() : JSX.Element

    // this will be called after each render
    afterRender() {

    }

    // this will be called once the proxy has been cleared by the interactor
    afterDone(interactor: Interactor) {

    }
}


// a selection rectangle is created as the user drags, 
// when they release, anything inside the rectangle is selected
class RubberBand extends InteractorProxy {

    private initialPos: Geom.Point
    private range: Geom.Rect
    private selection: Selection
    private hasMoved: boolean = false

    constructor(readonly interactor: Interactor, evt: React.MouseEvent) {
        super()
        this.selection = interactor.ui.selection

        if (!evt.shiftKey) {
            this.selection.clear()
        }

        this.initialPos = this.interactor.eventRelativePosition(evt)
        this.range = Geom.rectFromPoints(this.initialPos, this.initialPos)
    }

    private updateRange(evt: React.MouseEvent) {
        const pos = this.interactor.eventRelativePosition(evt)
        this.range = Geom.rectFromPoints(pos, this.initialPos)
    }

    onMouseMove(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): boolean {
        this.updateRange(evt)
        this.hasMoved = true
        return false
    }
    
    onMouseUp(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): boolean {
        this.updateRange(evt)

        this.interactor.ui.schema.mapEntities(entity => {
            if (entity.isWithin(this.range)) {
                this.selection.addEntity(entity, true)
            }
        })
        return true
    }
    
    renderOverlay(): JSX.Element {
        if (!this.hasMoved) {
            return <div></div>
        }
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

    diffPos: Geom.Point

    guides: Array<GuideProps> = []

    constructor(readonly interactor: Interactor, evt: React.MouseEvent) {
        super()
        this.selection = interactor.ui.selection

        this.selection.mapEntities(entity => {
            this.initialStates[entity.id] = {...entity.state}
        })

        this.diffPos = new Geom.Point(0, 0)
    }

    onMouseMove(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): boolean {
        this.diffPos =  Geom.addPoints(this.diffPos, {x: evt.movementX, y: evt.movementY})
        this.selection.mapEntities(entity => {
            let initial = this.initialStates[entity.id]
            entity.moveTo(initial.x + this.diffPos.x, initial.y + this.diffPos.y)
        })
        this.computeGuides()
        this.interactor.ui.requestRender(UI.RenderType.Viewport)
        return false
    }

    onMouseUp(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): boolean {
        const UpdateActions = this.selection.mapEntities(entity => {
            entity.snapPosition(this.interactor.config)
            return new Entity.UpdateAction(entity, this.initialStates[entity.id], entity.state)
        })
        this.guides = []

        if (UpdateActions.map((a) => {return a.hasChanges()}).includes(true)) {
            this.interactor.ui.history.pushActions(UpdateActions)
        }
        else {
            this.interactor.ui.requestRender(UI.RenderType.Viewport)
        }
        return true
    }

    renderOverlay(): JSX.Element {
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


// allows the user to drag a new entity onto the canvas
class NewEntity extends InteractorProxy {

    private position: Geom.Point | null = null
    private entity: Entity.Model | null = null

    constructor(private interactor: Interactor, private schema: Schema) {
        super()
    }

    onMouseMove(evt: React.MouseEvent<HTMLElement, MouseEvent>) {
        this.position = this.interactor.eventRelativePosition(evt)
        return false
    }

    onMouseUp(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): boolean {
        if (!this.position) {
            return true
        }
        const config = this.interactor.config
        const state = {
            name: '',
            x: config.snapNearest(this.position.x - config.minEntitySize/2),
            y: config.snapNearest(this.position.y - config.minEntitySize/2),
            color: Themes.ColorName.blue
        }
        this.entity = this.schema.newEntity(state)

        return true
    }
    
    renderOverlay(): JSX.Element {
        if (!this.position) {
            return <div id='new-entity-proxy'></div>
        }
        const iconSize = this.interactor.config.iconSize
        const style = {
            top: this.position.y-iconSize/2,
            left: this.position.x-iconSize/2
        }
        return <div id='new-entity-proxy' style={style}><Icons.PlusEntity /></div>
    }

    afterDone(interactor: Interactor) {
        if (this.entity) {
            this.interactor.ui.selection.addEntity(this.entity, false)
            this.interactor.editEntityName(this.entity)
        }
    }
    
}


// base class for proxies that present a text input
abstract class TextField extends InteractorProxy {

    protected input = React.createRef<HTMLInputElement>()

    constructor(readonly interactor: Interactor, readonly entity: Entity.Model) {
        super()
    }

    onKeyPress(evt: React.KeyboardEvent<HTMLInputElement>) {
        switch (evt.key) {
            case 'Enter':
                this.commit(evt.currentTarget.value)
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
            case 'ArrowUp':
                evt.preventDefault()
                this.onUp()
                return
            case 'ArrowDown':
                evt.preventDefault()
                this.onDown()
                return
        }
    }

    afterRender() {
        this.input.current?.focus()
    }

    renderOverlay(): JSX.Element {
        const config = this.interactor.config
        const pos = this.position
        const style = {
            left: pos.x,
            top: pos.y,
            width: this.entity.width,
            height: config.lineHeight
        }
        const inputStyle = {
            width: '100%'
        }
        return <div className={this.className} key={this.key} style={style}>
            <input type='text' ref={this.input} defaultValue={this.defaultValue} placeholder={this.placeholder} style={inputStyle} onKeyPress={this.onKeyPress.bind(this)} onKeyDown={this.onKeyDown.bind(this)}/>
        </div>
    }

    abstract commit(newName: string): void

    abstract onUp(): void
    abstract onDown(): void

    abstract get position(): Geom.Point
    abstract get className(): string
    abstract get key(): string
    abstract get defaultValue(): string

    get placeholder(): string {
        return ''
    }
}


// allows the user to change the entity name
class EntityNameField extends TextField {

    constructor(interactor: Interactor, readonly entity: Entity.Model) {
		super(interactor, entity)
    }

    get position(): Geom.Point {
        return new Geom.Point(this.entity.left, this.entity.top)
    }

    get className(): string {
        return 'entity-name-field text-field'
    }

    get key(): string {
        return `edit-${this.entity.id}`
    }

    get defaultValue(): string {
        return this.entity.state.name
    }

    get placeholder(): string {
        return 'Entity Name'
    }

    onUp() {
        this.interactor.addNewAttribute(this.entity)
    }

    onDown() {
        this.interactor.editFirstAttribute(this.entity)
    }

    commit(newName: string) {
        const newState = {...this.entity.state}
        newState.name = newName.trim()
        if (newState.name.length > 0 && newState.name != this.entity.state.name) {
            const action = new Entity.UpdateAction(this.entity, this.entity.state, newState)
            this.interactor.ui.history.pushAction(action)
        }
        this.interactor.clearProxy()
        this.interactor.editFirstAttribute(this.entity)
    }

}

// allows the user to edit an attribute
class EditAttributeField extends TextField {

	constructor(interactor: Interactor, readonly attribute: Attribute.Model) {
		super(interactor, attribute.entity)
    }

    get position(): Geom.Point {
        return this.attribute.position
    }

    get className(): string {
        return 'attribute-field text-field'
    }

    get key(): string {
        return `edit-${this.attribute.id}`
    }

    get defaultValue(): string {
        return this.attribute.raw
    }

    get placeholder(): string {
        return 'name: type'
    }

    onUp() {
        this.interactor.editPreviousAttribute(this.attribute)
    }

    onDown() {
        this.interactor.editNextAttribute(this.attribute)
    }

    commit(newRaw: string) {
        const newState = Attribute.State.fromRaw(newRaw)
        if (newRaw.trim().length) {
            const action = new Attribute.UpdateAction(this.attribute, this.attribute.state, newState)
            if (action.hasChanges()) {
                this.interactor.ui.history.pushAction(action)
            }
        }
        else {
            const action = new Attribute.DeleteAction(this.attribute)
            this.interactor.ui.history.pushAction(action)
        }
        this.interactor.clearProxy()
        this.interactor.editNextAttribute(this.attribute)
    }

}

// allows the user to enter a new attribute
class NewAttributeField extends TextField {

	constructor(interactor: Interactor, readonly entity: Entity.Model) {
		super(interactor, entity)
    }

    get position(): Geom.Point {
        return {
            x: this.entity.left,
            y: this.entity.top + (this.entity.numAttributes()+1)*this.interactor.config.lineHeight
        }
    }

    get className(): string {
        return 'attribute-field text-field'
    }

    get key(): string {
        // need to generate a new one each time, otherwise it will populate with the last raw entered
        return `new-attribute-${this.entity.id}-${(new Date()).getUTCMilliseconds()}`
    }

    get defaultValue(): string {
        return ''
    }

    get placeholder(): string {
        return 'name: type'
    }

    onUp() {
        this.interactor.editLastAttribute(this.entity)
    }

    onDown() {
        this.interactor.addNewAttribute(this.entity)
    }

    commit(newRaw: string) {
        const action = new Attribute.NewAction(this.entity, newRaw)
        if (action.hasChanges()) {
            this.interactor.ui.history.pushAction(action)
            this.interactor.addNewAttribute(this.entity)
        }
        else {
            this.interactor.clearProxy()
        }
    }

}