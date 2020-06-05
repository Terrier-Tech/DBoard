import * as React from 'react'
import Config from './config'
import * as Entity from '../model/entity'
import UI from '../ui/ui'
import Icons from './icons'

interface Props {
    config: Config
    ui: UI
    entity: Entity.Model
    y: number
}

class NewAttributeView extends React.Component<Props> {

	constructor(props: Props) {
		super(props)
	}

	render() {
        const config = this.props.config
        const entity = this.props.entity
        const width = entity.width/2
        const x = entity.left
        const y = this.props.y
        
        const iconSize = this.props.config.iconSize
        const buttonStyle = {
            transform: `translate(${x+width/2-iconSize/2}px,${y}px)`
        }

		return <g className={`new-button`} id={`${entity.id}-new-attribute`} onMouseDown={this.onClicked.bind(this)}>
            <rect x={x} y={y} width={width} height={config.lineHeight} stroke='transparent'/>
            <g style={buttonStyle}><Icons.PlusAttribute/></g>
        </g>
	}
    
    onClicked(evt: React.MouseEvent<SVGElement, MouseEvent>) {
        evt.stopPropagation()
        this.props.ui.interactor.onNewAttributeClicked(this.props.entity)
    }
}
	
export default NewAttributeView