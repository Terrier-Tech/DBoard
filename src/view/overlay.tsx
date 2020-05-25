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
        
        this.state = this.props.ui
        this.props.ui.selection.onChange(() => {
            console.log(`re-rendering overlay since the selection changed`)
            this.forceUpdate()
        })
    }

    renderSelection() : JSX.Element[] {
        const selection = this.props.ui.selection
        console.log(`rendering overlay for ${selection.numEntites()} enties`)
        const entities = selection.mapEntities(entity => {
            const size = entity.size
            const style = {
                width: size[0],
                height: size[1],
                top: entity.state.y,
                left: entity.state.x
            }
            return <div className='entity-overlay' key={entity.id} style={style}></div>
        })
        return entities
    }
    
    render() {
        const ui = this.props.ui
        return <div className='overlay-plane'>
            {this.renderSelection()}
        </div>
    }

}

export default Overlay