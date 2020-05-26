import Selection from './selection'
import App from '../App'
import Config from '../view/config'
import Interactor from './interactor'
import SelectInteractor from './select_interactor'
import Schema from '../model/schema'

class RenderListener {
    constructor(readonly type: UI.RenderType, readonly component: React.Component) {}
}

class UI {

    readonly selection: Selection
    readonly interactor: Interactor
    readonly schema: Schema

    private config: Config


    constructor(readonly app: App) {
        this.selection = new Selection(this)
        this.config = this.app.config
        this.schema = this.app.schema

        this.interactor = new SelectInteractor(this)
    }

    private nextRenderType: UI.RenderType = UI.RenderType.None

    private renderListeners: RenderListener[] = []
    
    requestRender(type: UI.RenderType) {
        if (this.nextRenderType == UI.RenderType.None) {
            requestAnimationFrame(this.onAnimationFrame.bind(this))
        }
        if (type > this.nextRenderType) {
            this.nextRenderType = type
        }
    }

    listenForRender(type: UI.RenderType, component: React.Component) {
        this.renderListeners.push(new RenderListener(type, component))
    }

    onAnimationFrame() {
        for (let listener of this.renderListeners) {
            if (listener.type <= this.nextRenderType) {
                listener.component.forceUpdate()
            }
        }
        this.nextRenderType = UI.RenderType.None
    }
    
}

module UI {
    export enum RenderType {
        None = 0,
        Overlay,
        Document,
        Canvas,
        App
    }
} 

export default UI