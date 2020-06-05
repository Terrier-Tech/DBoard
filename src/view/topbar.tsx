import * as React from 'react';
import Logo from '../resources/svg/logo-white.svg'
import Icons from './icons'
import Config from './config'
import UI from '../ui/ui'
import Schema from '../model/schema'

interface Props {
	config: Config
  ui: UI
  schema: Schema
}

class Topbar extends React.Component<Props> {
  render() {
    const history = this.props.ui.history
    return <div id='topbar'>
        <a className='logo'><Logo/></a>
        <div className='file'></div>
        <a className={`action ${history.canUndo() ? '' : 'inactive'}`} onClick={() => history.undo()}><Icons.Undo/></a>
        <a className={`action ${history.canRedo() ? '' : 'inactive'}`} onClick={() => history.redo()}><Icons.Redo/></a>
        <a className='action' onMouseDown={this.startNewEntity.bind(this)}><Icons.PlusEntity/></a>
    </div>;
  }

  startNewEntity() {
    this.props.ui.interactor.beginNewEntity()
  }
}

export default Topbar;