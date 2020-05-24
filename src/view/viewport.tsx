import * as React from 'react';
import Config from './config';
import SchemaView from './schema_view';
import Schema from '../model/schema';

interface Props {
	config: Config
	schema: Schema
}

interface State {
}

class Viewport extends React.Component<Props, State> {
	render() {
		const config = this.props.config
		const schema = this.props.schema
		return <div id='viewport'>
			<div className={`canvas grid-${config.gridSize}`}>
				<div className='document-plane'>
					<SchemaView config={config} schema={schema} />
				</div>
			</div>
		</div>
	}
}

export default Viewport;