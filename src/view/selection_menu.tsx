import * as React from 'react'
import * as Arrays from '../util/arrays'
import Config from './config'
import UI from '../ui/ui'
import Schema from '../model/schema'
import Selection from '../ui/selection'
import Icons from './icons'

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
        const colors = Arrays.unique(this.selection.mapEntities(e => e.state.color))
        
        return <div className='content'>
            <a className='action alert' title='Delete Entity(s)' onClick={this.delete.bind(this)}>
                <Icons.Delete/>
            </a>
        </div>
    }

    delete() {
        this.selection.deleteEntities()
    }

}

class AssociationSelectionMenu extends SelectionMenu {

    render() {
        return <div className='content'>
            <a className='action alert' title='Delete Association' onClick={this.delete.bind(this)}>
                <Icons.Delete/>
            </a>
        </div>
    }

    delete() {
        this.selection.deleteAssociations()
    }

}