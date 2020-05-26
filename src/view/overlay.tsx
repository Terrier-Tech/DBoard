import * as React from 'react'
import Config from './config'
import UI from '../ui/ui'

interface Props {
	config: Config
	ui: UI
}

class Overlay extends React.Component<Props> {

	constructor(props: Props) {
        super(props)
        
        this.props.ui.listenForRender(UI.RenderType.Overlay, this)
    }

    
    render() {
        const ui = this.props.ui
        return <div className='overlay-plane'>
            {ui.selection.render()}
            {ui.interactor.render()}
        </div>
    }

}

export default Overlay