import * as React from 'react'
import Config from './config'
import * as Attribute from '../model/attribute'
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
        const requiredClass = state.isRequired ? 'required' : ''
        const bgColor = this.props.index % 2 == 0 ? theme.evenBgColor : theme.oddBgColor
        
		return <g className={`attribute ${requiredClass}`} id={attr.id} onClick={this.onClicked.bind(this)} onDoubleClick={this.onDoubleClicked.bind(this)}>
            <rect x={x} y={y} width={width} height={config.lineHeight} stroke='transparent' fill={bgColor}/>
            <text className='attribute-name' x={x + config.padding} y={y + config.lineHeight/2}>{state.name}</text>
            <text className='attribute-type' x={x + width - config.padding} y={y + config.lineHeight/2}>{state.type}</text>
        </g>
	}
    
    onClicked(evt: React.MouseEvent<SVGElement, MouseEvent>) {
        console.log(`attribute clicked`)
        evt.stopPropagation()
        this.props.ui.interactor.onAttributeClicked(this.props.attribute, evt)
    }
    
    onDoubleClicked(evt: React.MouseEvent<SVGElement, MouseEvent>) {
        console.log(`attribute double clicked`)
        evt.stopPropagation()
        this.props.ui.interactor.onAttributeDoubleClicked(this.props.attribute, evt)
    }
}
	
export default AttributeView