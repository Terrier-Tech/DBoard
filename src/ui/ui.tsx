import Selection from './selection'
import App from '../App'
import Config from '../view/config'
import Interactor from './interactor'
import Schema from '../model/schema'
import * as Actions from './actions'
import Keymap from './keymap'

class RenderListener {
    constructor(readonly type: UI.RenderType, readonly component: React.Component) {}
}

class UI {

    readonly selection: Selection
    readonly interactor: Interactor
    readonly history: Actions.History
    readonly keymap: Keymap

    constructor(readonly app: App, private config: Config, public schema: Schema) {
        this.selection = new Selection(this)

        this.interactor = new Interactor(this, config)

        this.history = new Actions.History(this, config)
        this.keymap = new Keymap(this, config)
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

    private onAnimationFrame() {
        for (let listener of this.renderListeners) {
            if (listener.type <= this.nextRenderType) {
                listener.component.forceUpdate()
            }
        }
        this.nextRenderType = UI.RenderType.None
        this.interactor.afterRender()
    }
    
}

module UI {
    export enum RenderType {
        None = 0,
        Overlay,
        Viewport,
        App
    }
} 

export default UI