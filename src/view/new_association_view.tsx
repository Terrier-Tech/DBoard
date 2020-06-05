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

class NewAssociationView extends React.Component<Props> {

	constructor(props: Props) {
		super(props)
	}

	render() {
        const config = this.props.config
        const entity = this.props.entity
        const width = entity.width/2
        const x = entity.left + width
        const y = this.props.y
        const yText = y + config.lineHeight/2 + 1 // need to bring it down just slightly

        const iconSize = this.props.config.iconSize
        const buttonStyle = {
            transform: `translate(${x+width/2-iconSize/2}px,${y}px)`
        }
        
		return <g className={`new-button`} id={`${entity.id}-new-attribute`} onMouseDown={this.onMouseDown.bind(this)} onClick={this.onClicked.bind(this)}>
            <rect x={x} y={y} width={width} height={config.lineHeight} stroke='transparent'/>
            <g style={buttonStyle}><Icons.PlusAssociation/></g>
        </g>
    }
    
    onMouseDown(evt: React.MouseEvent<SVGElement, MouseEvent>) {
        evt.stopPropagation()
        evt.preventDefault()
        this.props.ui.interactor.onNewAssociationPressed(this.props.entity)
    }
    
    onClicked(evt: React.MouseEvent<SVGElement, MouseEvent>) {
        evt.stopPropagation()
        // TODO: create new association
    }
}
	
export default NewAssociationView