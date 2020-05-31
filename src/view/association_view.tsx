import * as React from 'react'
import * as Association from '../model/association'
import UI from '../ui/ui'
import Config from './config'
import * as Layout from './layout'

interface Props {
	config: Config
    ui: UI
    fromSide: Association.Side
    toSide: Association.Side
    path: Layout.LinePath
}

class AssociationView extends React.Component<Props> {

    render() {
        const path = this.props.path
        return <g className='association'>
            <polyline className='main' points={path.svgPoints} fill='none'/>
        </g>
    }

}


export default AssociationView