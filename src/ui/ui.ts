import Selection from './selection'
import App from '../App'
import Config from '../view/config'
import Interactor from './interactor'
import SelectInteractor from './select_interactor'

class RenderListener {
    constructor(readonly type: UI.RenderType, readonly component: React.Component) {}
}

class UI {

    readonly selection: Selection
    readonly interactor: Interactor

    private config: Config

    constructor(readonly app: App) {
        this.selection = new Selection(this)
        this.config = app.config

        this.interactor = new SelectInteractor(this)

        requestAnimationFrame(this.onAnimationFrame.bind(this))
    }

    private nextRenderType: UI.RenderType = UI.RenderType.None

    private renderListeners: RenderListener[] = []
    
    requestRender(type: UI.RenderType) {
        if (type > this.nextRenderType) {
            this.nextRenderType = type
        }
    }

    listenForRender(type: UI.RenderType, component: React.Component) {
        this.renderListeners.push(new RenderListener(type, component))
    }

    onAnimationFrame() {
        if (this.nextRenderType == UI.RenderType.None) {
            requestAnimationFrame(this.onAnimationFrame.bind(this))
            return
        }
        console.log(`Rendering type ${this.nextRenderType}`)
        for (let listener of this.renderListeners) {
            if (listener.type <= this.nextRenderType) {
                listener.component.forceUpdate()
            }
        }
        this.nextRenderType = UI.RenderType.None
        requestAnimationFrame(this.onAnimationFrame.bind(this))
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