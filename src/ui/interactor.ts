import * as Entity from "../model/entity"
import UI from "./ui"
import * as Attribute from "../model/attribute"

// base class for all classes that handle user interaction for the various interaction modes
abstract class Interactor {

    constructor(readonly ui: UI) {
        
    }

    onCanvasMouseDown(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        console.log(`canvas mouse down ${evt.clientX},${evt.clientY}`)
        this.ui.selection.clear()
    }

    onCanvasMouseMove(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (evt.buttons) { // ignore move events unless a mouse button is down
            console.log(`canvas mouse move ${evt.clientX},${evt.clientY} button ${evt.buttons}`, evt)
        }
    }

    onCanvasMouseUp(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        console.log(`canvas mouse up ${evt.clientX},${evt.clientY}`)
    }

    onEntityClicked(entity: Entity.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
        console.log(`entity clicked ${entity.id}`)
    }

    onEntityMouseDown(entity: Entity.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
        console.log(`entity mouse down ${entity.id} (shift=${evt.shiftKey})`)
        this.ui.selection.add(entity, evt.shiftKey)
    }

    onEntityMouseMove(entity: Entity.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
        console.log(`entity mouse move ${entity.id}`)
    }

    onEntityDoubleClicked(entity: Entity.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
        console.log(`entity double clicked ${entity.id}`)
        
    }

    onAttributeClicked(attr: Attribute.Model, evt: React.MouseEvent<SVGElement, MouseEvent>) {
        console.log(`attribute clicked ${attr.id}`)
    }

}

export default Interactor