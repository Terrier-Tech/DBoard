import Selection from './selection'
import App from '../App'
import Config from '../view/config'
import Interactor from './interactor'
import SelectInteractor from './select_interactor'

class UI {

    readonly selection: Selection
    readonly interactor: Interactor

    private config: Config

    constructor(readonly app: App) {
        this.selection = new Selection(this)
        this.config = app.config

        this.interactor = new SelectInteractor(this)
    }

}

export default UI