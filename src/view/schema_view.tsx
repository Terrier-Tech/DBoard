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
		const schema = this.props.schema
		const entities = schema.mapEntities(entity =>  {
			entity.computeSize(config)
			return <EntityView key={entity.id} config={this.props.config} ui={this.props.ui} entity={entity}/>
		})

		// layout all associations first, then render them
		const layout = new Layout.Lines(config)
		schema.mapAssociations(ass =>  {
			const entities = ass.entities
			layout.addLine(ass.id, entities[0].id, entities[0], entities[1].id, entities[1])
		})
		const assPaths = layout.layout()
		const associations = assPaths.map((path) => {
			const ass = schema.getAssociation(path.id)
			const sides = ass.sides
			ass.linePath = path
			return <AssociationView key={ass.id} config={this.props.config} ui={this.props.ui} path={path} fromSide={sides[0]} toSide={sides[1]} association={ass}/>
		})
		const style = `
		.entity {
		}
		.entity-name {
			font: bold ${config.fontSize}px ${config.fontFamily};
			fill: #ffffff;
			text-anchor: middle;
			dominant-baseline: middle;
		}
		.entity-background {
			rx: ${config.entityRadius};
		}
		.attributes-background {
			fill: ${config.evenBgColor};
			rx: 2;
		}
		.attribute-name {
			font: ${config.fontSize}px ${config.fontFamily};
			fill: ${config.fgColor};
			text-anchor: start;
			dominant-baseline: middle;
		}
		.attribute-type {
			font: ${config.fontSize}px ${config.fontFamily};
			fill: ${config.hintFgColor};
			text-anchor: end;
			dominant-baseline: middle;
		}
		.attribute.required .attribute-name {
			font: bold ${config.fontSize}px ${config.fontFamily};
		}
		.new-button > rect {
			fill: transparent;
			rx: ${config.entityRadius};
		}
		.new-button svg g rect, .new-button svg g path {
			fill: ${config.hintFgColor};
		}
		.association polyline.line {
			stroke: ${config.fgColor};
			fill: none;
			stroke-width: 2px;
		}
		.association polyline.invisible {
			stroke-width: ${config.lineHeight};
			fill: none;
			stroke: transparent;
		}
		`
		return <svg xmlns="http://www.w3.org/2000/svg" width='3000' height='3000' id='document'>
			<style>{style}</style>
			<g id='associations'>
				{associations}
			</g>
			<g id='entities'>
				{entities}
			</g>
		</svg>
	}
}
	
export default SchemaView