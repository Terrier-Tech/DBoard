import Schema from "./schema"
import ModelBase from "./model_base"
import * as Attribute from "./attribute"
import * as themes from '../view/themes'
import * as geom from "../util/geom"
import Config from "../view/config"
import * as Actions from "../ui/actions"

export type PositionType = 'left' | 'right' | 'horizontalCenter' | 'top' | 'bottom' | 'verticalCenter'

export const PositionTypes: Array<PositionType> = ['left', 'right', 'horizontalCenter', 'top', 'bottom', 'verticalCenter']

class Entity extends ModelBase<EntityState> {
    constructor(schema: Schema, state: EntityState = new EntityState()) {
        super("entity", state)
        schema.registerEntity(this)
    }

    readonly attributes : {[id: string]: Attribute.Model} = {}

    // this is computed, not a part of the entity's state
    size: [number, number] = [0, 0]

    get width(): number {
        return this.size[0]
    }

    get height(): number {
        return this.size[1]
    }

    moveTo(x: number, y: number) {
        this.state.x = x
        this.state.y = y
    }

    get left(): number {
        return this.state.x
    }

    get right(): number {
        return this.state.x + this.size[0]
    }

    get horizontalCenter(): number {
        return this.state.x + this.size[0]/2
    }

    get top(): number {
        return this.state.y
    }

    get bottom(): number {
        return this.state.y + this.size[1]
    }

    get verticalCenter(): number {
        return this.state.y + this.size[1]/2
    }

    getPosition(type: PositionType) : number {
        switch (type) {
            case 'left':
                return this.left
            case 'right':
                return this.right
            case 'horizontalCenter':
                return this.horizontalCenter
            case 'top':
                return this.top
            case 'bottom':
                return this.bottom
            case 'verticalCenter':
                return this.verticalCenter
        }
    }

    snapPosition(config: Config) {
        this.moveTo(config.snapNearest(this.state.x), config.snapNearest(this.state.y))
    }

    registerAttribute(attr: Attribute.Model) {
        this.attributes[attr.id] = attr
    }

    removeAttribute(id: string) {
        delete this.attributes[id]
    }

    numAttributes() : number {
        return Object.entries(this.attributes).length
    }

    newAttribute(raw: string) : Attribute.Model {
        return Attribute.Model.fromRaw(this, raw)
    }

    getAttribute(id: string): Attribute.Model {
        return this.attributes[id]
    }

    attributesInOrder(): Array<Attribute.Model> {
        const attrs = Object.entries(this.attributes)
        return attrs.sort((a1, a2) => {
            return a1[1].state.name > a2[1].state.name ? 1 : -1
        }).map((kv) => {return kv[1]})
    }

    mapAttributes<T>(fun: (e: Attribute.Model) => T) : Array<T> {
        return this.attributesInOrder().map(fun)
    }

    firstAttribute(): Attribute.Model | undefined {
        return this.attributesInOrder()[0]
    }

    lastAttribute(): Attribute.Model | undefined {
        const attrs = this.attributesInOrder()
        return attrs[attrs.length-1]
    }

    previousAttribute(attr: Attribute.Model): Attribute.Model | undefined {
        let prevAttr: Attribute.Model | undefined = undefined
        this.attributesInOrder().reverse().forEach(a => {
            if (!prevAttr && a.state.name < attr.state.name) {
                prevAttr = a
            }
        });
        return prevAttr
    }

    nextAttribute(attr: Attribute.Model): Attribute.Model | undefined {
        let nextAttr: Attribute.Model | undefined = undefined
        this.attributesInOrder().forEach(a => {
            if (!nextAttr && a.state.name > attr.state.name) {
                nextAttr = a
            }
        });
        return nextAttr
    }

    isWithin(outer: geom.Rect) : boolean {
        const rect = new geom.Rect(this.state.x, this.state.y, this.size[0], this.size[1])
        return rect.isWithin(outer)
    }
}

class EntityState {
    readonly name: string = ""
    x: number = 0
    y: number = 0
    readonly color: themes.ColorName = themes.ColorName.blue
}


export class UpdateAction extends Actions.Base {

    constructor(readonly entity: Entity, readonly fromState: EntityState, readonly toState: EntityState) {
        super()
    }

    apply(): void {
        this.entity.state = this.toState
    }

    unapply(): void {
        this.entity.state = this.fromState
    }

    hasChanges(): boolean {
        return this.fromState.x != this.toState.x || 
            this.fromState.y != this.toState.y || 
            this.fromState.name != this.toState.name
    }
}

export {Entity as Model}
export {EntityState as State}