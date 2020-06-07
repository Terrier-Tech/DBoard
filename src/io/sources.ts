import Schema from "../model/schema"
import Writer from "./writer"


export abstract class Base {

    constructor(public fileName: string) {
        
    }

    save(schema: Schema) {
        const writer = new Writer(schema)
        const view = document.getElementById('document')
        const svg = writer.dump(view!)
        this.saveRaw(svg)
    }
    
    protected abstract saveRaw(svg: string): void

    get nameWithExtension(): string {
        if (this.fileName.indexOf('.svg') > 0) {
            return this.fileName
        }
        return this.fileName + '.svg'
    }
}

export class Download extends Base {
    
    saveRaw(svg: string) {
        const a = document.createElement('a')
        const file = new Blob([svg], {type: 'image/svg+xml'})
        a.href = URL.createObjectURL(file)
        a.download = this.nameWithExtension
        a.click()
        a.remove()
    }

}