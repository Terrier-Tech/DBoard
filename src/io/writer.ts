import * as Geom from '../util/geom'
import Schema from '../model/schema'


class Writer {

    constructor(private schema: Schema) {

    }

    dump(originalView: HTMLElement): string {
        const view = originalView.cloneNode(true) as HTMLElement
        console.log('view node', view)

        // adjust the viewport to only show the content
        const min = Geom.minPoint(this.schema.allEntities.map(e => {return {x: e.left, y: e.top}}))
        let max = Geom.maxPoint(this.schema.allEntities.map(e => {return {x: e.right, y: e.bottom}}))
        console.log(`document goes from ${min.x},${min.y} to ${max.x},${max.y}`)
        max = Geom.addPoints(max, min)
        view.setAttribute('width', `${max.x}px`)
        view.setAttribute('height', `${max.y}px`)
        view.setAttribute('viewport', `0 0 ${max.x} ${max.y}`)

        // remove the button icons
        view.querySelectorAll('g.icon-container').forEach(elem => {
            elem.remove()
        })

        // set the background rectangle to white
        for (let bg of Array.from(view.getElementsByClassName('plane-background'))) {
            bg.setAttribute("fill", "#ffffff")
        }

        return view.outerHTML
    }

    download(view: HTMLElement) {
    }

}

export default Writer