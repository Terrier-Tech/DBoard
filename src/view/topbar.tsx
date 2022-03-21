import * as React from 'react';
import {ReactComponent as Logo} from '../resources/svg/logo-white.svg'
import Icons from './icons'
import Config from './config'
import UI from '../ui/ui'
import Schema from '../model/schema'
import * as Sources from '../io/sources'

interface Props {
	config: Config
    ui: UI
	schema: Schema
	source: Sources.Base
	onOpen: () => void
}

interface State {
	fileName: string
}

class Topbar extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props)

		this.state = {
			fileName: this.props.source.fileName
		}
	}

	componentDidMount() {
		this.setState({
			fileName: this.props.source.fileName
		})
	}

    render() {
        const history = this.props.ui.history
        return <div id='topbar'>
			<a className='logo' onClick={() => this.props.onOpen()}><Logo/></a>
			<div className='spacer'></div>
			<a className='action' title='Open' onClick={() => this.props.onOpen()}><Icons.Open/></a>
			<div className='text-field'>
				<input type='text' className='file-name' onChange={this.onFileNameChanged.bind(this)} value={this.state.fileName}/>
			</div>
			<a className='action' title='Save' onClick={this.save.bind(this)}><Icons.Save/></a>
			<a className='action' title='Download' onClick={this.download.bind(this)}><Icons.Download/></a>
			<div className='spacer'></div>
			<a className={`action ${history.canUndo() ? '' : 'inactive'}`} onClick={() => history.undo()}><Icons.Undo/></a>
			<a className={`action ${history.canRedo() ? '' : 'inactive'}`} onClick={() => history.redo()}><Icons.Redo/></a>
			<a className='action' onMouseDown={this.startNewEntity.bind(this)} onClick={() => alert('Drag this icon onto the canvas to add a new entity')}><Icons.PlusEntity/></a>
        </div>;
    }

    startNewEntity(evt: React.MouseEvent) {
        this.props.ui.interactor.beginNewEntity()
	}

    save() {
        this.props.source.save(this.props.schema)
	}

    download() {
        this.props.source.export(this.props.schema)
	}
	
	onFileNameChanged(evt: React.FormEvent<HTMLInputElement>) {
		this.props.source.fileName = evt.currentTarget.value
		this.setState({fileName: this.props.source.fileName})
	}
}

export default Topbar;