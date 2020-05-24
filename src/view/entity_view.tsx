import * as React from 'react';
import Schema from '../model/schema';
import Config from './config';
import * as Entity from '../model/entity';

interface Props {
	config: Config
	entity: Entity.Model
}

class EntityView extends React.Component<Props> {

	constructor(props: Props) {
		super(props)
	}

	render() {
        const config = this.props.config
        const entity = this.props.entity
        const state = entity.state
        let x = state.x
        let y = state.y
        const lineHeight = config.computeLineHeight()
        const color = config.theme.color(state.color)
        console.log(`color ${state.color} is ${color}`)
		return <g id={entity.id}>
			<rect x={x} y={y} width={state.width} height={state.height} stroke='transparent' fill='#ffffff'/>
            <rect x={x} y={y} width={state.width} height={lineHeight} stroke='transparent' fill={color}/>
            <text className='entity-name' x={state.x + state.width/2} y={y + lineHeight/2}>{state.name}</text>
        </g>
	}
}
	
export default EntityView