import * as React from 'react'
import Config from './config'
import * as Entity from '../model/entity'
import AttributeView from './attribute_view'
import UI from '../ui/ui'

interface Props {
	config: Config
    entity: Entity.Model
    ui: UI
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
        // snap the size up to the next even grid spacing so that they can be center-aligned at whole grid spaces
        return this.props.entity.size = [config.snapUpEven(width), config.snapUpEven(height)]
    }

	render() {
        const [width, height] = this.computeSize()

        const config = this.props.config
        const entity = this.props.entity
        const state = entity.state
        entity.moveTo(config.snapNearest(state.x), config.snapNearest(state.y))
        const lineHeight = config.lineHeight
        const color = config.theme.color(state.color)
        let index = 0
        let yAttr = state.y
        const attributes = entity.mapAttributes(attr => {
            yAttr += lineHeight
            index += 1
            return <AttributeView key={attr.id} config={config} ui={this.props.ui} width={width} x={state.x} y={yAttr} index={index} attribute={attr}/>
        })
		return <g id={entity.id} onClick={this.onClicked.bind(this)} onDoubleClick={this.onDoubleClicked.bind(this)} onMouseDown={this.onMouseDown.bind(this)}>
			<rect x={state.x} y={state.y} width={width} height={height} stroke='transparent' fill='#ffffff'/>
            <rect x={state.x} y={state.y} width={width} height={lineHeight} stroke='transparent' fill={color}/>
            <text className='entity-name' x={state.x + width/2} y={state.y + lineHeight/2}>{state.name}</text>
            {attributes}
        </g>
    }
    
    onClicked(evt: React.MouseEvent<SVGElement, MouseEvent>) {
        this.props.ui.interactor.onEntityClicked(this.props.entity, evt)
    }

    onMouseDown(evt: React.MouseEvent<SVGElement, MouseEvent>) {
        evt.stopPropagation()
        this.props.ui.interactor.onEntityMouseDown(this.props.entity, evt)
    }
    
    onDoubleClicked(evt: React.MouseEvent<SVGElement, MouseEvent>) {
        this.props.ui.interactor.onEntityDoubleClicked(this.props.entity, evt)
    }
}
	
export default EntityView