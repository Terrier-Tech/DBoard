import * as React from 'react'
import Config from './config'
import * as Attribute from '../model/attribute'

interface Props {
	config: Config
    attribute: Attribute.Model
    y: number
    width: number
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
        const width = this.props.width
        const state = attr.state
        const x = attr.entity.state.x
        const y = this.props.y
        const requiredClass = state.isRequired ? 'required' : ''
        const bgColor = this.props.index % 2 == 0 ? theme.evenBgColor : theme.oddBgColor
        
		return <g className={`attribute ${requiredClass}`} id={attr.id}>
            <rect x={x} y={y} width={width} height={config.lineHeight} stroke='transparent' fill={bgColor}/>
            <text className='attribute-name' x={x + config.padding} y={y + config.lineHeight/2}>{state.name}</text>
            <text className='attribute-type' x={x + width - config.padding} y={y + config.lineHeight/2}>{state.type}</text>
        </g>
	}
}
	
export default AttributeView