import * as React from 'react'

import Config from './view/config'
import Topbar from './view/topbar'
import Viewport from './view/viewport'
import Schema from './model/schema'
import UI from './ui/ui'
import SelectionMenu from './view/selection_menu'
import * as Sources from './io/sources'

interface Props {

}

interface State {
	config: Config
	ui: UI
	schema: Schema
	source: Sources.Base
}

class App extends React.Component<Props, State> {

	constructor(props: Props) {
		super(props)

		const config = new Config()
		const schema = new Schema()
		const ui = new UI(config, schema)
		ui.listenForRender(UI.RenderType.App, this)

		const source = new Sources.Download('untitled')

		schema.demo(config)

		this.state = {
			config: config,
			ui: ui,
			schema: schema,
			source: source
		}
	}

	async reload(source: Sources.Base) {
		const config = this.state.config
		const schema = await source.load(config)
		const ui = new UI(config, schema)
		this.setState({
			config: config,
			ui: ui,
			schema: schema,
			source: source
		})
	}

	open() {
		const source = new Sources.Download('')
		this.reload(source)
	}

	render() {
		const {config, schema, ui, source} = this.state
		return <div>
			<Viewport key={`viewport-${schema.id}`} config={config} ui={ui} schema={schema}/>
			<Topbar key={`topbar-${schema.id}`} config={config} ui={ui} schema={schema} source={source} onOpen={this.open.bind(this)}/>
			<SelectionMenu key={`menu-${schema.id}`} config={config} ui={ui} schema={schema}/>
		</div>;
	}
}

export default App;
