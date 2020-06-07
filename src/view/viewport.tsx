import * as React from 'react';
import Config from './config';
import SchemaView from './schema_view';
import Schema from '../model/schema';
import UI from '../ui/ui'
import Overlay from './overlay'

interface Props {
	config: Config
	schema: Schema
	ui: UI
}

class Viewport extends React.Component<Props> {

	constructor(props: Props) {
		super(props)

	}

	componentDidMount() {
		this.props.ui.listenForRender(UI.RenderType.Viewport, this)
	}

	render() {
		const {config, schema, ui} = this.props
		return <div id='viewport'>
			<div className={`canvas grid-${config.gridSize}`} onMouseDown={this.onMouseDown.bind(this)} onMouseMove={this.onMouseMove.bind(this)} onMouseUp={this.onMouseUp.bind(this)} onDoubleClick={this.onDoubleClicked.bind(this)}>
				<div className='document-plane' key={`document-${schema.id}`}>
					<SchemaView config={config} ui={ui} schema={schema} />
				</div>
				<Overlay key={`overlay-${schema.id}`} config={config} ui={ui}/>
			</div>
		</div>
	}

	onMouseDown(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		console.log('on mouse down')
		this.props.ui.interactor.onCanvasMouseDown(evt)
	}

	onMouseMove(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		this.props.ui.interactor.onCanvasMouseMove(evt)
	}

	onMouseUp(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		console.log('on mouse up')
		this.props.ui.interactor.onCanvasMouseUp(evt)
	}

    onDoubleClicked(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		this.props.ui.interactor.onCanvasDoubleClicked(evt)
    }

}

export default Viewport;