import * as Entity from "../model/entity"
import UI from "./ui"
import * as Attribute from "../model/attribute"
import * as React from "react"
import * as geom from "../util/geom"
import Config from "../view/config"

// base class for all classes that handle user interaction for the various interaction modes
export abstract class Interactor {

    // this will handle mouse interaction for special things like rubber band selection and dragging entities
    protected proxy?: InteractorProxy

    constructor(readonly ui: UI, readonly config: Config) {
        
    }

    onCanvasMouseDown(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    }

    onCanvasMouseMove(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    }

    onCanvasMouseUp(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    }

    onCanvasDoubleClicked(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    }

    onEntityClicked(entity: Entity.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
    }

    onEntityMouseDown(entity: Entity.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
    }

    onEntityDoubleClicked(entity: Entity.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
    }

    onAttributeClicked(attr: Attribute.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
    }

    onAttributeDoubleClicked(attr: Attribute.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
    }

    onNewAttributeClicked(entity: Entity.Model) {
    }

    render() : JSX.Element {
        return <div></div>
    }

    afterRender() {
        if (this.proxy) {
            this.proxy.afterRender()
        }
    }

    eventRelativePosition(evt: React.MouseEvent) : geom.Point {
        const target = evt.currentTarget as HTMLElement
        const rect = target.getBoundingClientRect()
        return new geom.Point(evt.clientX - rect.left,
            evt.clientY - rect.top
        )
    }

    clearProxy() {
        if (this.proxy) {
            this.proxy = undefined
            this.ui.requestRender(UI.RenderType.Overlay)
        }
    }
}


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

    abstract render() : JSX.Element

    afterRender() {

    }
}