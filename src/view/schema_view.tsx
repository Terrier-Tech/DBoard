import * as React from 'react'
import Schema from '../model/schema'
import Config from './config'
import EntityView from './entity_view'
import UI from '../ui/ui'
import AssociationView from './association_view'
import * as Layout from './layout'

interface Props {
	config: Config
	schema: Schema
	ui: UI
}

class SchemaView extends React.Component<Props> {

	constructor(props: Props) {
		super(props)
	}

	render() {
		const config = this.props.config
		const theme = config.theme
		const schema = this.props.schema
		const entities = schema.mapEntities(entity =>  {
			entity.computeSize(config)
			return <EntityView key={entity.id} config={this.props.config} ui={this.props.ui} entity={entity}/>
		})

		// layout all associations first, then render them
		const layout = new Layout.Lines()
		schema.mapAssociations(ass =>  {
			const entities = ass.entities
			layout.addLine(ass.id, entities[0], entities[1])
		})
		const assPaths = layout.layout()
		const associations = assPaths.map((path) => {
			const ass = schema.getAssociation(path.id)
			const sides = ass.sides
			return <AssociationView key={ass.id} config={this.props.config} ui={this.props.ui} path={path} fromSide={sides[0]} toSide={sides[1]}/>
		})
		const style = `
		.entity-name {
			font: bold ${config.fontSize}px ${config.fontFamily};
			fill: #ffffff;
			text-anchor: middle;
			dominant-baseline: middle;
		}
		.attribute-name {
			font: ${config.fontSize}px ${config.fontFamily};
			fill: ${theme.fgColor};
			text-anchor: start;
			dominant-baseline: middle;
		}
		.attribute-type {
			font: ${config.fontSize}px ${config.fontFamily};
			fill: ${theme.hintFgColor};
			text-anchor: end;
			dominant-baseline: middle;
		}
		.attribute.required .attribute-name {
			font: bold ${config.fontSize}px ${config.fontFamily};
		}
		.new-button rect {
			fill: ${theme.hintBgColor};
		}
		.new-button text {
			font: ${config.fontSize}px ${config.fontFamily};
			fill: ${theme.hintFgColor};
			text-anchor: middle;
			dominant-baseline: middle;
		}
		.association polyline.main {
			fill: none;
			stroke: ${theme.fgColor};
			stroke-width: 2px;
		}
		`
		return <svg xmlns="http://www.w3.org/2000/svg" width='3000' height='3000'>
			<style>{style}</style>
			<g id='entities'>
				{entities}
			</g>
			<g id='associations'>
				{associations}
			</g>
		</svg>
	}
}
	
export default SchemaView