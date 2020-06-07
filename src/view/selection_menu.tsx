import * as React from 'react'
import * as Arrays from '../util/arrays'
import Config, { ColorName } from './config'
import UI from '../ui/ui'
import Schema from '../model/schema'
import * as Entity from '../model/entity'
import * as Association from '../model/association'
import Selection from '../ui/selection'
import Icons from './icons'

interface Props {
	config: Config
    ui: UI
    schema: Schema
}


class SelectionMenu<T> extends React.Component<Props, T> {

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

interface EntityState {
    showColorMenu: boolean
}

class EntitySelectionMenu extends SelectionMenu<EntityState> {

    constructor(props: Props) {
        super(props)

        this.state = {showColorMenu: false}
    }

    // creates a CSS background gradient that shows the given colors
    // as diagonal stripes
    colorsToStripes(colors: ColorName[]): string {
        const colorSize = this.props.config.gridSize * 2 - 4 // 2px border
        const stripeSize = colorSize/colors.length
        const gradientComps: string[] = []
        let x = 0
        for (let name of colors) {
            const c = this.props.config.color(name)
            gradientComps.push(`${c} ${x}px`)
            x += stripeSize
            gradientComps.push(`${c} ${x}px`)
        }
        return `repeating-linear-gradient(45deg, ${gradientComps.join(', ')})`
    }

    render() {
        const config = this.props.config
        const colors = Arrays.unique(this.selection.mapEntities(e => e.state.color)).sort()
        let colorStyle = {
            background: `${config.color(colors[0])}`
        }
        if (colors.length > 1) {
            colorStyle.background = this.colorsToStripes(colors)
        }
        
        
        return <div className='content'>
            <a className='action color'>
                <div className='color-circle' style={colorStyle} onClick={this.toggleColorMenu.bind(this)}></div>
            </a>
            <a className='action alert' title='Delete Entity(s)' onClick={this.delete.bind(this)}>
                <Icons.Delete/>
            </a>
            {this.state?.showColorMenu && <ColorMenu config={this.props.config} onSelect={(name) => this.changeColor(name)}/> }
        </div>
    }

    toggleColorMenu() {
        this.setState({showColorMenu: !this.state?.showColorMenu})
    }

    changeColor(name: ColorName) {
        this.setState({showColorMenu: false})
        const entities = this.selection.allEntities

        // if the color isn't different, don't bother changing it
        let isDifferent = false
        for (let entity of entities) {
            if (entity.state.color != name) {
                isDifferent = true
                break
            }
        }
        if (!isDifferent) {
            return
        }

        // create an action to change each color
        const actions = entities.map(entity => {
            const newState = {...entity.state, color: name}
            return new Entity.UpdateAction(entity, entity.state, newState)
        })
        this.selection.ui.history.pushActions(actions)
    }

    delete() {
        this.selection.deleteEntities()
    }

}


interface ColorMenuProps {
    config: Config
    onSelect: (name: ColorName) => void
}

class ColorMenu extends React.Component<ColorMenuProps> {

    render() {
        const config = this.props.config
        const actions = Object.entries(config.colors).map(kv => {
            const style = {
                background: kv[1]
            }
            return <a className='action color' key={kv[0]} onClick={() => this.props.onSelect(kv[0] as ColorName)}><div className='color-circle' style={style}></div></a>
        })
        return <div className='color-menu'>{actions}</div>
    }
}


interface AssociationState {

}

class AssociationSelectionMenu extends SelectionMenu<AssociationState> {

    render() {
        const ass = this.selection.allAssociations[0]
        const sides = ass.sides
        const entities = ass.entities
        const oneName = sides[0].arity=='many' ? entities[1].state.name : entities[0].state.name
        const manyName = sides[0].arity=='many' ? entities[0].state.name : entities[1].state.name
        return <div className='content'>
            <div className='one-name'>{oneName}</div>
            <div className='arity'>Has Many</div>
            <div className='many-name'>{manyName}</div>
            <a className='action swap' title='Swap Sides' onClick={() => this.swapSides(ass)}>
                <Icons.SwapVertical/>
            </a>
            <a className='action alert' title='Delete Association' onClick={this.delete.bind(this)}>
                <Icons.Delete/>
            </a>
        </div>
    }

    swapSides(ass: Association.Model) {
        const sides = ass.sides
        const fromSide = {...sides[0], arity: Association.oppositeArity(sides[0].arity)}
        const toSide = {...sides[1], arity: Association.oppositeArity(sides[1].arity)}
        const newState = new Association.State(fromSide, toSide)
        const action = new Association.UpdateAction(ass, ass.state, newState)
        this.selection.ui.history.pushAction(action)
    }

    delete() {
        this.selection.deleteAssociations()
    }

}