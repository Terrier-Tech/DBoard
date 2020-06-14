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
	ui: UI
	schema: Schema
	source: Sources.Base
	pickSource: boolean
}

class App extends React.Component<Props, State> {

	config: Config

	constructor(props: Props) {
		super(props)

		this.config = new Config()
		const schema = new Schema()
		const ui = new UI(this.config, schema)
		ui.listenForRender(UI.RenderType.App, this)

		const path = location.pathname
		let source: Sources.Base = new Sources.LocalStorage('untitled')
		console.log(`path: ${path}`)
		if (path.length > 1) {
			const id = path.substring(1)
			source = Sources.Base.existingById(id)
			this.reload(source)
		}
		
		this.state = {
			ui: ui,
			schema: schema,
			source: source,
			pickSource: true
		}
	}

	async reload(source: Sources.Base) {
		const schema = await source.load(this.config)
		const ui = new UI(this.config, schema)
		ui.listenForRender(UI.RenderType.App, this)
		history.pushState(null, '', `/${schema.id}`)
		this.setState({
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
		const {schema, ui, source, pickSource} = this.state
		return <div id={`app-${schema.id}`}>
			<Viewport key={`viewport-${schema.id}`} config={this.config} ui={ui} schema={schema}/>
			<Topbar key={`topbar-${schema.id}`} config={this.config} ui={ui} schema={schema} source={source} onOpen={this.open.bind(this)}/>
			<SelectionMenu key={`menu-${schema.id}`} config={this.config} ui={ui} schema={schema}/>
			{pickSource && <Sources.Picker onPicked={(newSource) => this.reload(newSource)} onCanceled={() => this.setState({pickSource: false})}/>}
		</div>;
	}
}

export default App;
