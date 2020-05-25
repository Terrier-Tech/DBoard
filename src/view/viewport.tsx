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

interface State {
}

class Viewport extends React.Component<Props, State> {
	render() {
		const config = this.props.config
		const schema = this.props.schema
		return <div id='viewport'>
			<div className={`canvas grid-${config.gridSize}`} onMouseDown={this.onMouseDown.bind(this)} onMouseMove={this.onMouseMove.bind(this)} onMouseUp={this.onMouseUp.bind(this)}>
				<div className='document-plane'>
					<SchemaView config={config} ui={this.props.ui} schema={schema} />
				</div>
				<Overlay config={config} ui={this.props.ui}/>
			</div>
		</div>
	}

	onMouseDown(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		this.props.ui.interactor.onCanvasMouseDown(evt)
	}

	onMouseMove(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		this.props.ui.interactor.onCanvasMouseMove(evt)
	}

	onMouseUp(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		this.props.ui.interactor.onCanvasMouseUp(evt)
	}
}

export default Viewport;