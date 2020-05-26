import * as Entity from "../model/entity"
import UI from "./ui"
import * as Attribute from "../model/attribute"
import * as React from "react"
import * as geom from "../util/geom"

// base class for all classes that handle user interaction for the various interaction modes
abstract class Interactor {

    constructor(readonly ui: UI) {
        
    }

    onCanvasMouseDown(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    }

    onCanvasMouseMove(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    }

    onCanvasMouseUp(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    }

    onEntityClicked(entity: Entity.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
    }

    onEntityMouseDown(entity: Entity.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
    }

    onEntityDoubleClicked(entity: Entity.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
    }

    onAttributeClicked(attr: Attribute.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
    }

    render() : JSX.Element {
        return <div></div>
    }

    eventRelativePosition(evt: React.MouseEvent) : geom.Point {
        const target = evt.currentTarget as HTMLElement
        const rect = target.getBoundingClientRect()
        return new geom.Point(evt.clientX - rect.left,
            evt.clientY - rect.top
        )
    }
}

export default Interactor