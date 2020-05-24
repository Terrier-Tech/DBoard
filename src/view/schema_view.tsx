import * as React from 'react'
import Schema from '../model/schema'
import Config from './config'
import EntityView from './entity_view'

interface Props {
	config: Config
	schema: Schema
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
			return <EntityView key={entity.id} config={this.props.config} entity={entity}/>
		})
		const style = `
		.entity-name {
			font: bold ${config.fontSize}px sans-serif;
			fill: #ffffff;
			text-anchor: middle;
			dominant-baseline: middle;
		}
		.attribute-name {
			font: ${config.fontSize}px sans-serif;
			fill: ${theme.fgColor};
			text-anchor: start;
			dominant-baseline: middle;
		}
		.attribute-type {
			font: ${config.fontSize}px sans-serif;
			fill: ${theme.hintColor};
			text-anchor: end;
			dominant-baseline: middle;
		}
		.attribute.required .attribute-name {
			font: bold ${config.fontSize}px sans-serif;
		}
		`
		return <svg xmlns="http://www.w3.org/2000/svg" width='3000' height='3000'>
			<style>{style}</style>
			<g id='entities'>
				{entities}
			</g>
		</svg>
	}
}
	
export default SchemaView