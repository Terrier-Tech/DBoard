import * as React from 'react'
import Schema from "../model/schema"
import Writer from "./writer"
import Reader from "./reader"
import Config from "../view/config"
import * as packageData from '../../package.json'
import Demo from '../resources/png/demo.png'
import Icons from '../view/icons'
import {ReactComponent as Logo} from '../resources/svg/logo-white.svg'


////////////////////////////////////////////////////////////////////////////////
// Meta Storage
////////////////////////////////////////////////////////////////////////////////

interface DocumentMeta {
    id: string
    name: string
    raw: string|undefined
    updatedAt: number|undefined
    origin: 'localStorage'
}

const MANIFEST_KEY = 'manifest'

class LocalManifest {

    items: Record<string, DocumentMeta> = {}

    constructor() {
        const raw = localStorage.getItem(MANIFEST_KEY)
        if (raw && raw.length) {
            try {
                this.items = JSON.parse(raw) as Record<string,DocumentMeta>
            }
            catch(ex) {
                console.log(`Error parsing raw manifest "${raw}"`, ex)
            }
        }
    }

    addItem(item: DocumentMeta) {
        // copy the item and remove the raw since it's not needed in the manifest
        const minItem = {...item, raw: undefined}
        if (this.items[item.id]) {
            console.log(`Replacing local manifest item`, minItem)
        }
        else {
            console.log(`Adding local manifest item`, minItem)
        }
        this.items[item.id] = minItem
    }

    removeItem(item: DocumentMeta) {
        delete this.items[item.id]
    }

    getItem(id: string): DocumentMeta|undefined {
        return this.items[id]
    }

    write() {
        localStorage.setItem(MANIFEST_KEY, JSON.stringify(this.items))
    }

    get itemsInOrder(): DocumentMeta[] {
        return Object.entries(this.items).map(kv => {return kv[1]}).sort((a,b) => {
            return (b.updatedAt||0) - (a.updatedAt||0) // reverse chronological order
        })
    }

    loadItem(item: DocumentMeta): DocumentMeta|null {
        const raw = localStorage.getItem(item.id)
        if (raw) {
            try {
                return JSON.parse(raw) as DocumentMeta
            }
            catch(ex) {
                console.log(`error parsing raw localstorage item`, ex, raw)
            }
        }
        return null
    }

}


////////////////////////////////////////////////////////////////////////////////
// Sources
////////////////////////////////////////////////////////////////////////////////

export abstract class Base {

    constructor(public meta: DocumentMeta) {
        
    }

    static existingById(id: string): Base {
        const manifest = new LocalManifest()
        const item = manifest.getItem(id)
        if (item) {
            switch (item.origin) {
                case 'localStorage':
                    return new LocalStorage(item)
                default: 
                    throw `Unknown origin '${item.origin}'`
            }
        }
        else {
            return new LocalStorage('')
        }
    }

    save(schema: Schema) {
        const writer = new Writer(schema)
        const view = document.getElementById('document')
        const svg = writer.dump(view!)
        this.saveRaw(schema.id, svg)
    }

    export(schema: Schema) {
        const writer = new Writer(schema)
        const view = document.getElementById('document')
        const svg = writer.dump(view!)
        this.exportRaw(svg)
    }

    protected exportRaw(svg: string) {
        const a = document.createElement('a')
        const file = new Blob([svg], {type: 'image/svg+xml'})
        a.href = URL.createObjectURL(file)
        a.download = this.nameWithExtension
        a.click()
        a.remove()
    }
    
    protected abstract saveRaw(id: string, svg: string): void

    get fileName(): string {
        const comps = this.meta.name.split('/')
        return comps[comps.length-1]
    }

    set fileName(name: string) {
        this.meta.name = name
    }

    get nameWithExtension(): string {
        if (this.fileName.indexOf('.svg') > 0) {
            return this.fileName
        }
        return this.fileName + '.svg'
    }

    get nameWithoutExtension(): string {
        return this.fileName.replace(/\.svg/i, '')
    }

    async load(config: Config): Promise<Schema> {
        const raw = await this.loadRaw()
        console.log('raw: ', raw)
        const reader = new Reader(config)
        return reader.read(raw, this.meta.id)
    }

    protected abstract loadRaw(): Promise<string>

    abstract renderButton(): JSX.Element
}



// persists the documents to the browser LocalStorage
export class LocalStorage extends Base {

    constructor(meta: DocumentMeta|string) {
        if ((meta as DocumentMeta).id) {
            super(meta as DocumentMeta)
        }
        else {
            super({id: '', name: (meta as string), origin: 'localStorage', raw: undefined, updatedAt: 0})
        }
    }
    
    // write the raw svg directly to localStorage
    protected saveRaw(id: string, svg: string) {
        const item: DocumentMeta = {
            id: id,
            name: this.nameWithoutExtension,
            raw: svg,
            updatedAt: new Date().valueOf(),
            origin: 'localStorage'
        }
        localStorage.setItem(id, JSON.stringify(item))
        const manifest = new LocalManifest()
        manifest.addItem(item)
        manifest.write()
    }

    protected async loadRaw(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.meta.id.length) {
                const fullItem = new LocalManifest().loadItem(this.meta)
                if (fullItem && fullItem.raw) {
                    resolve(fullItem.raw)
                    return
                }
            }
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

export class UploadLocalStorage extends LocalStorage {

    constructor() {
        super({id: '', raw: undefined, name: '', origin: 'localStorage', updatedAt: 0})
    }

    protected async loadRaw(): Promise<string> {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', '.svg')
        return new Promise((resolve, reject) => {
            input.addEventListener("change", () => {
                const files = input.files
                console.log(`selected ${files?.length} files`)
                if (!files) {
                    alert("You must select an SVG file to upload!")
                }
                else if (files.length == 1) {
                    const file = files[0]
                    this.meta.name = file.name
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

export class DemoLocalStorage extends LocalStorage {
    constructor() {
        super({id: 'demo', raw: undefined, name: 'demo', origin: 'localStorage', updatedAt: 0})
    }

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


////////////////////////////////////////////////////////////////////////////////
// View Components
////////////////////////////////////////////////////////////////////////////////

interface ManifestProps {
    manifest: LocalManifest
    onSourceSelected: (source: Base) => void
}

interface ManifestState {
    items: DocumentMeta[]
}

class ManifestView extends React.Component<ManifestProps, ManifestState> {

    constructor(props: ManifestProps) {
        super(props)
        this.state = {
            items: this.props.manifest.itemsInOrder
        }
    }

    dataUri(svg: string): string {
        const noSpaces = svg.replace(/\%09/g, '').replace(/\%0A/g, '')
        return `data:image/svg+xml;base64,${btoa(noSpaces)}`
    }

    render() {
        const items = this.state.items.map(item => {
            const updatedAt = new Date(item.updatedAt || 0)
            const fullItem = this.props.manifest.loadItem(item)
            const previewSrc = (fullItem && fullItem.raw) ? this.dataUri(fullItem.raw) : ''
            return <a key={item.id} className='item' onClick={() => this.onItemClicked(item)}>
                <div className='name'>{item.name}</div>
                {fullItem && fullItem.raw && <img className='preview' src={previewSrc}/>}
                <div className='updated-at'>{updatedAt.toDateString()}</div>
                <div className='close' onClick={(evt) => {this.onRemoveItem(item); evt.stopPropagation()}}>
                    <Icons.Close/>
                </div>
            </a>
        })
        return <div className='manifest'>
            {items}
        </div>
    }

    onItemClicked(item: DocumentMeta) {
        this.props.onSourceSelected(new LocalStorage(item))
    }

    onRemoveItem(item: DocumentMeta) {
        const manifest = this.props.manifest
        if (confirm("Remove this document from the recent list?")) {
            manifest.removeItem(item)
            manifest.write()
            this.setState({
                items: manifest.itemsInOrder
            })
        }
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
            new LocalStorage('untitled'),
            new UploadLocalStorage(),
            new DemoLocalStorage()
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
                <div className='banner'>
                    <Logo />
                    <div className='tagline'>Open Source Data Modeler</div>
                    <div className='version'>Version {packageData.version}</div>
                </div>
                <a className='close' onClick={() => this.props.onCanceled()}>
                    <Icons.Close />
                </a>
                <div className='sources'>
                    {sourceButtons}
                </div>
                <ManifestView manifest={new LocalManifest()} onSourceSelected={(s) => onPicked(s)}/>
                <div className='footer'>
                    <div className='column'>
                        <a href='https://github.com/Terrier-Tech/DBoard' target='_blank'>
                            <Icons.Github/>
                            <span>Source Code</span>
                        </a>
                    </div>
                    <div className='column'>
                        <a href='http://terrier.tech' target='_blank'>
                            <Icons.Terrier/>
                            <span>&copy; {new Date().getFullYear()} Terrier Technologies</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    }

}