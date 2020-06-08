import * as React from 'react'
import Schema from "../model/schema"
import Writer from "./writer"
import Reader from "./reader"
import Config from "../view/config"
import * as packageData from '../../package.json'
import Demo from '../resources/png/demo.png'
import Icons from '../view/icons'

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

    abstract renderButton(): JSX.Element
}

export class NewDownload extends Base {
    
    protected saveRaw(svg: string) {
        const a = document.createElement('a')
        const file = new Blob([svg], {type: 'image/svg+xml'})
        a.href = URL.createObjectURL(file)
        a.download = this.nameWithExtension
        a.click()
        a.remove()
    }

    protected async loadRaw(): Promise<string> {
        return new Promise((resolve, reject) => {
            resolve('<svg></svg>')
        })
    }

    renderButton(): JSX.Element {
        return <div>
            <Icons.BlankDocument/>
            <h2>Blank</h2>
            <p>Create a new blank document</p>
        </div>
    }
}

export class UploadDownload extends NewDownload {

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

    renderButton(): JSX.Element {
        return <div>
            <Icons.Upload/>
            <h2>Upload</h2>
            <p>Upload an SVG file that was previously generated with DBoard</p>
        </div>
    }
}

export class DemoDownload extends NewDownload {

    protected async loadRaw(): Promise<string> {
        return new Promise((resolve, reject) => {
            resolve(Demo)
        })
    }

    async load(config: Config): Promise<Schema> {
        const schema = new Schema()
        schema.demo(config)
        return new Promise<Schema>(resolve => {
            resolve(schema)
        })
    }

    renderButton(): JSX.Element {
        return <div>
            <img src={Demo}/>
            <h2>Demo</h2>
            <p>A demo document with existing entities and associations</p>
        </div>
    }
}

interface PickerProps {
    onPicked: (source: Base) => void
    onCanceled: () => void
}

export class Picker extends React.Component<PickerProps> {

    private sources: Base[]

    constructor(props: PickerProps) {
        super(props)

        this.sources = [
            new NewDownload('untitled'),
            new UploadDownload(''),
            new DemoDownload('demo')
        ]
    }

    render() {
        const onPicked = this.props.onPicked
        const sourceButtons = this.sources.map((s,i) => {
            return <a className='source' key={`source-${i}`} onClick={() => onPicked(s)}>
                {s.renderButton()}
            </a>
        })
        return <div className='source-picker-bg'>
            <div className='source-picker'>
                <h1>DBoard {packageData.version}</h1>
                <a className='close' onClick={() => this.props.onCanceled()}>
                    <Icons.Close />
                </a>
                <div className='sources'>
                    {sourceButtons}
                </div>
            </div>
        </div>
    }

}