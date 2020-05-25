import * as React from 'react'
import Config from './config'
import * as Entity from '../model/entity'
import AttributeView from './attribute_view'

interface Props {
	config: Config
	entity: Entity.Model
}

class EntityView extends React.Component<Props> {

	constructor(props: Props) {
		super(props)
    }
    
    // computes the minimum width and height to render all attributes
    computeSize(): [number, number] {
        const config = this.props.config
        const state = this.props.entity.state
        let width = config.measureText(state.name).width + 2*config.padding
        this.props.entity.mapAttributes(attr => {
            // one padding on each end and two between the name and type = 4*padding
            let w = config.measureText(attr.state.name).width + config.measureText(attr.state.type).width + 4*config.padding
            width = Math.max(width, w)
        })
        const height = (this.props.entity.numAttributes() + 1) *  config.lineHeight
        return [width, height]
    }

	render() {
        const [width, height] = this.computeSize()

        const config = this.props.config
        const entity = this.props.entity
        const state = entity.state
        let x = state.x
        const lineHeight = config.lineHeight
        const color = config.theme.color(state.color)
        let y = state.y
        let index = 0
        const attributes = entity.mapAttributes(attr => {
            y += lineHeight
            index += 1
            return <AttributeView key={attr.id} config={config} width={width} y={y} index={index} attribute={attr}/>
        })
        y = state.y
		return <g id={entity.id}>
			<rect x={x} y={y} width={width} height={height} stroke='transparent' fill='#ffffff'/>
            <rect x={x} y={y} width={width} height={lineHeight} stroke='transparent' fill={color}/>
            <text className='entity-name' x={state.x + width/2} y={y + lineHeight/2}>{state.name}</text>
            {attributes}
        </g>
	}
}
	
export default EntityView