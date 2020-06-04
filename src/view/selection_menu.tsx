import * as React from 'react'
import Config from './config'
import UI from '../ui/ui'
import Schema from '../model/schema'
import Selection from '../ui/selection'

interface Props {
	config: Config
    ui: UI
    schema: Schema
}


class SelectionMenu extends React.Component<Props> {

    readonly selection: Selection

	constructor(props: Props) {
        super(props)
        this.selection = props.ui.selection
    }

	render() {
        console.log(`num entities: ${this.selection.numEntites()}`)
        let content: JSX.Element | null = null
        if (this.selection.numEntites()) {
            content = <EntitySelectionMenu {...this.props}/>
        }
        else if (this.selection.numAssociations()) {
            content = <AssociationSelectionMenu {...this.props}/>
        }
        return <div id='selection-menu' className={content ? 'show' : ''}>
            {content}
        </div>
    }

}

export default SelectionMenu


class EntitySelectionMenu extends SelectionMenu {

    render() {
        return <div className='content'>
            <a className='alert' onClick={this.delete.bind(this)}>Delete</a>
        </div>
    }

    delete() {
        this.selection.deleteEntities()
    }

}

class AssociationSelectionMenu extends SelectionMenu {

    render() {
        return <div className='content'>
            <a className='alert' onClick={this.delete.bind(this)}>Delete</a>
        </div>
    }

    delete() {
        this.selection.deleteAssociations()
    }

}