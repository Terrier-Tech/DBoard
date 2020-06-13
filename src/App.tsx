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
	pickSource: boolean
}

class App extends React.Component<Props, State> {

	constructor(props: Props) {
		super(props)

		const config = new Config()
		const schema = new Schema()
		const ui = new UI(config, schema)
		ui.listenForRender(UI.RenderType.App, this)

		const source = new Sources.LocalStorage('untitled')

		this.state = {
			config: config,
			ui: ui,
			schema: schema,
			source: source,
			pickSource: true
		}
	}

	async reload(source: Sources.Base) {
		const config = this.state.config
		const schema = await source.load(config)
		const ui = new UI(config, schema)
		ui.listenForRender(UI.RenderType.App, this)
		this.setState({
			config: config,
			ui: ui,
			schema: schema,
			source: source,
			pickSource: false
		})
	}

	open() {
		this.setState({pickSource: true})
	}

	render() {
		const {config, schema, ui, source, pickSource} = this.state
		return <div id={`app-${schema.id}`}>
			<Viewport key={`viewport-${schema.id}`} config={config} ui={ui} schema={schema}/>
			<Topbar key={`topbar-${schema.id}`} config={config} ui={ui} schema={schema} source={source} onOpen={this.open.bind(this)}/>
			<SelectionMenu key={`menu-${schema.id}`} config={config} ui={ui} schema={schema}/>
			{pickSource && <Sources.Picker onPicked={(newSource) => this.reload(newSource)} onCanceled={() => this.setState({pickSource: false})}/>}
		</div>;
	}
}

export default App;
