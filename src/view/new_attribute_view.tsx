import * as React from 'react'
import Config from './config'
import * as Entity from '../model/entity'
import * as geom from '../util/geom'
import UI from '../ui/ui'

interface Props {
    config: Config
    ui: UI
    entity: Entity.Model
    x: number
    y: number
    width: number
}

class NewAttributeView extends React.Component<Props> {

	constructor(props: Props) {
		super(props)
	}

	render() {
        const config = this.props.config
        const entity = this.props.entity
        const width = this.props.width
        const x = this.props.x
        const y = this.props.y
        const yText = y + config.lineHeight/2 + 1 // need to bring it down just slightly
        
		return <g className={`new-attribute`} id={`${entity.id}-new-attribute`} onClick={this.onClicked.bind(this)} onDoubleClick={this.onDoubleClicked.bind(this)}>
            <rect x={x} y={y} width={width} height={config.lineHeight} stroke='transparent'/>
            <text className='plus' x={x + width/2} y={yText}>+</text>
        </g>
	}
    
    onClicked(evt: React.MouseEvent<SVGElement, MouseEvent>) {
        evt.stopPropagation()
        this.props.ui.interactor.onEntityClicked(this.props.entity, evt)
    }
    
    onDoubleClicked(evt: React.MouseEvent<SVGElement, MouseEvent>) {
        evt.stopPropagation()
        this.props.ui.interactor.onNewAttributeClicked(this.props.entity)
    }
}
	
export default NewAttributeView