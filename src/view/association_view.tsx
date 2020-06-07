import * as React from 'react'
import * as Association from '../model/association'
import UI from '../ui/ui'
import Config from './config'
import * as Layout from './layout'
import * as Geom from '../util/geom'

interface Props {
	config: Config
    ui: UI
    fromSide: Association.ISide
    toSide: Association.ISide
    path: Layout.LinePath
    association?: Association.Model
}

class AssociationView extends React.Component<Props> {

    render() {
        const path = this.props.path
        const fromSide = this.props.fromSide
        const toSide = this.props.toSide
        let isSelected = false
        let data = {
            fromId: '',
            fromArity: '',
            toId: '',
            toArity: ''
        }
        if (this.props.association) {
            isSelected = this.props.ui.selection.isAssociationSelected(this.props.association)
            const sides = this.props.association.sides
            data = {
                fromId: sides[0].entityId,
                fromArity: sides[0].arity,
                toId: sides[1].entityId,
                toArity: sides[1].arity
            }
        }
        return <g className={`association ${isSelected ? 'selected' : ''}`} id={this.props.association?.id} data-from-id={data.fromId} data-from-arity={data.fromArity} data-to-id={data.toId} data-to-arity={data.toArity} onMouseDown={this.onClicked.bind(this)}>
            <polyline className='main invisible' points={path.svgPoints}/>
            <polyline className='main line' points={path.svgPoints}/>
            {fromSide.arity == 'many' && this.renderChickenFoot(path.firstPoint, path.fromDir)}
            {toSide.arity == 'many' && this.renderChickenFoot(path.lastPoint, path.toDir)}
        </g>
    }

    renderChickenFoot(pos: Geom.Point, dir: Layout.Dir): JSX.Element {
        const d = this.props.config.gridSize
        let points: Array<Geom.Point> = []
        switch (dir) {
            case 'n': 
                points = [
                    {x: pos.x-d+1, y: pos.y+1},
                    {x: pos.x, y: pos.y-d},
                    {x: pos.x+d-1, y: pos.y+1}
                ]
                break
            case 's': 
                points = [
                    {x: pos.x-d+1, y: pos.y-1},
                    {x: pos.x, y: pos.y+d},
                    {x: pos.x+d-1, y: pos.y-1}
                ]
                break
            case 'e': 
                points = [
                    {x: pos.x-1, y: pos.y-d+1},
                    {x: pos.x+d, y: pos.y},
                    {x: pos.x-1, y: pos.y+d-1}
                ]
                break
            case 'w': 
                points = [
                    {x: pos.x+1, y: pos.y-d+1},
                    {x: pos.x-d, y: pos.y},
                    {x: pos.x+1, y: pos.y+d-1}
                ]
                break
        }
        const pointString = points.map((p) => {return `${p.x},${p.y}`}).join(' ')
        return <polyline className='foot line' key={dir} points={pointString}/>
    }

    onClicked(evt: React.MouseEvent<SVGElement, MouseEvent>) {
        if (this.props.association) {
            evt.stopPropagation()
            this.props.ui.interactor.onAssociationClicked(this.props.association)
        }
    }

}


export default AssociationView