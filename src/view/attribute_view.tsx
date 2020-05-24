import * as React from 'react'
import Config from './config'
import * as Attribute from '../model/attribute'

interface Props {
	config: Config
    attribute: Attribute.Model
    y: number
    index: number
}

class AttributeView extends React.Component<Props> {

	constructor(props: Props) {
		super(props)
	}

	render() {
        const config = this.props.config
        const theme = config.theme
        const attr = this.props.attribute
        const state = attr.state
        const entity = attr.entity.state
        const y = this.props.y
        const requiredClass = state.isRequired ? 'required' : ''
        const bgColor = this.props.index % 2 == 0 ? theme.evenBgColor : theme.oddBgColor
        
		return <g className={`attribute ${requiredClass}`} id={attr.id}>
            <rect x={entity.x} y={y} width={entity.width} height={config.lineHeight} stroke='transparent' fill={bgColor}/>
            <text className='attribute-name' x={entity.x + config.padding} y={y + config.lineHeight/2}>{state.name}</text>
            <text className='attribute-type' x={entity.x + entity.width - config.padding} y={y + config.lineHeight/2}>{state.type}</text>
        </g>
	}
}
	
export default AttributeView