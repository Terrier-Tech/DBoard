import * as React from 'react'
import Config from './config'
import * as Attribute from '../model/attribute'
import * as geom from '../util/geom'
import UI from '../ui/ui'

interface Props {
    config: Config
    ui: UI
    attribute: Attribute.Model
    x: number
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
        const x = this.props.x
        const y = this.props.y
        this.props.attribute.position = new geom.Point(x, y)
        const yText = y + config.lineHeight/2 + 1 // need to bring it down just slightly
        const requiredClass = state.isRequired ? 'required' : ''
        const bgColor = this.props.index % 2 == 0 ? theme.evenBgColor : theme.oddBgColor
        
		return <g className={`attribute ${requiredClass}`} id={attr.id} onClick={this.onClicked.bind(this)} onDoubleClick={this.onDoubleClicked.bind(this)}>
            <rect x={x} y={y} width={width} height={config.lineHeight} stroke='transparent' fill={bgColor}/>
            <text className='attribute-name' x={x + config.padding} y={yText}>{state.name}</text>
            <text className='attribute-type' x={x + width - config.padding} y={yText}>{state.type}</text>
        </g>
	}
    
    onClicked(evt: React.MouseEvent<SVGElement, MouseEvent>) {
        evt.stopPropagation()
        this.props.ui.interactor.onAttributeClicked(this.props.attribute, evt)
    }
    
    onDoubleClicked(evt: React.MouseEvent<SVGElement, MouseEvent>) {
        evt.stopPropagation()
        this.props.ui.interactor.onAttributeDoubleClicked(this.props.attribute, evt)
    }
}
	
export default AttributeView