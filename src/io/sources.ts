import Schema from "../model/schema"
import Writer from "./writer"
import Reader from "./reader"
import Config from "../view/config"

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

    async load(config: Config): Promise<Schema> {
        const raw = await this.loadRaw()
        console.log('raw: ', raw)
        const reader = new Reader(config)
        return reader.read(raw)
    }

    protected abstract async loadRaw(): Promise<string>
}

export class Download extends Base {
    
    protected saveRaw(svg: string) {
        const a = document.createElement('a')
        const file = new Blob([svg], {type: 'image/svg+xml'})
        a.href = URL.createObjectURL(file)
        a.download = this.nameWithExtension
        a.click()
        a.remove()
    }

    protected async loadRaw(): Promise<string> {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        return new Promise((resolve, reject) => {
            input.addEventListener("change", () => {
                const files = input.files
                console.log(`selected ${files?.length} files`)
                if (!files) {
                    alert("You must select an SVG file to upload!")
                }
                else if (files.length == 1) {
                    const file = files[0]
                    this.fileName = file.name.replace(/\.svg/i, '')
                    console.log(`fileName is ${this.fileName}`)
                    file.text().then(raw => {
                        resolve(raw)
                    })
                }
                else {
                    alert("You must select only one SVG file to upload!")
                }
                input.remove()
            }, false);
            input.click()
        })
    }

}