import * as React from 'react'
import Config from './config'
import * as Entity from '../model/entity'
import AttributeView from './attribute_view'
import UI from '../ui/ui'
import NewAttributeView from './new_attribute_view'
import NewAssociationView from './new_association_view'

interface Props {
	config: Config
    entity: Entity.Model
    ui: UI
}

class EntityView extends React.Component<Props> {

	constructor(props: Props) {
        super(props)
    }

	render() {
        const config = this.props.config
        const entity = this.props.entity
        const [width, height] = entity.size
        const state = entity.state
        const lineHeight = config.lineHeight
        const color = config.theme.color(state.color)
        let index = 0
        let yAttr = state.y
        const yName = state.y + config.lineHeight/2 + 1 // need to bring it down just slightly
        const attributes = entity.mapAttributes(attr => {
            yAttr += lineHeight
            index += 1
            return <AttributeView key={attr.id} config={config} ui={this.props.ui} width={width} x={state.x} y={yAttr} index={index} attribute={attr}/>
        })
        yAttr += lineHeight
		return <g className='entity' id={entity.id} onClick={this.onClicked.bind(this)} onDoubleClick={this.onDoubleClicked.bind(this)} onMouseDown={this.onMouseDown.bind(this)}>
			<rect x={state.x} y={state.y} width={width} height={height} stroke='transparent' fill='#ffffff'/>
            <rect className='entity-name-bar' x={state.x} y={state.y} width={width} height={lineHeight} stroke='transparent' fill={color}/>
            <text className='entity-name' x={state.x + width/2} y={yName}>{state.name}</text>
            {attributes}
            <NewAttributeView config={config} ui={this.props.ui} y={yAttr} entity={entity}/>
            <NewAssociationView config={config} ui={this.props.ui} y={yAttr} entity={entity}/>
            <line className='top-highlight' x1={entity.left} y1={entity.top+0.5} x2={entity.right} y2={entity.top+0.5}/>
            <line className='bottom-highlight' x1={entity.left} y1={entity.bottom-0.5} x2={entity.right} y2={entity.bottom-0.5}/>
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