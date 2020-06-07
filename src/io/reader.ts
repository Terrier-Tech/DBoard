import Schema from '../model/schema'
import * as Entity from '../model/entity'
import * as Attribute from '../model/attribute'
import * as Association from '../model/association'
import Config, { ColorName } from '../view/config'


class Reader {

    constructor(private config: Config) {

    }

    warn(message: string) {
        console.log(`WARN [Reader]: ${message}`)
    }

    read(svg: string): Schema {
        const schema = new Schema()
        
        const root = document.createElement('html')
        root.innerHTML = svg

        // entities
        root.querySelectorAll<SVGGElement>('g.entity').forEach(elem => {
            this.parseEntity(schema, elem)
        })

        // associations
        root.querySelectorAll<SVGGElement>('g.association').forEach(elem => {
            this.parseAssociation(schema, elem)
        })

        root.remove()

        return schema
    }

    parseEntity(schema: Schema, elem: SVGGElement) {
        const id = elem.id
        
        // position
        const nameBar = elem.querySelector<SVGRectElement>('rect.entity-name-bar')
        let pos = {x: 0, y: 0}
        if (nameBar) {
            pos.x = parseInt(nameBar.getAttribute('x') || '0')
            pos.y = parseInt(nameBar.getAttribute('y') || '0')
        }

        // name
        let name = ''
        const nameText = elem.querySelector<SVGTextElement>('text.entity-name')
        if (nameText?.textContent) {
            name = nameText.textContent
        }

        // color
        let color: ColorName = 'blue'
        if (elem.dataset?.color?.length) {
            try {
                color = elem.dataset.color as ColorName
            }
            catch {
                this.warn(`invalid color name ${elem.dataset.color}`)
            }
        }

        const entity = schema.newEntity({
            name: name,
            x: pos.x,
            y: pos.y,
            color: color
        }, id)

        // attributes
        elem.querySelectorAll<SVGGElement>('g.attribute').forEach(attrElem => {
            this.parseAttribute(entity, attrElem)
        })
    }

    parseAttribute(entity: Entity.Model, elem: SVGGElement) {
        const id = elem.id

        // name
        let name = ''
        const nameText = elem.querySelector<SVGTextElement>('text.attribute-name')
        if (nameText?.textContent) {
            name = nameText.textContent
        }

        // type
        let type = ''
        const typeText = elem.querySelector<SVGTextElement>('text.attribute-type')
        if (typeText?.textContent) {
            type = typeText.textContent
        }

        // required
        let isRequired = elem?.classList.contains('required') || false

        entity.newAttribute({
            name: name,
            type: type,
            isRequired: isRequired
        }, id)
    }

    parseAssociation(schema: Schema, elem: SVGGElement) {
        const id = elem.id

        const fromSide = {
            entityId: elem.dataset?.fromId || '',
            arity: (elem.dataset?.fromArity || 'one') as Association.Arity
        }
        if (!schema.hasEntity(fromSide.entityId)) {
            this.warn(`No entity ${fromSide.entityId}`)
            return
        }
        const toSide = {
            entityId: elem.dataset?.toId || '',
            arity: (elem.dataset?.toArity || 'one') as Association.Arity
        }
        if (!schema.hasEntity(toSide.entityId)) {
            this.warn(`No entity ${toSide.entityId}`)
            return
        }
        const state = new Association.State(fromSide, toSide)
        schema.newAssociation(state, id)
    }

}

export default Reader