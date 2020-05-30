import UI from "./ui"
import Config from "../view/config"

class Keymap {
    constructor(readonly ui: UI, private config: Config) {
        document.addEventListener('keydown', (evt) => {
            console.log(`keydown event`, evt)
            if (evt.metaKey || evt.ctrlKey) {
                if (this.onCommandKey(evt.key, evt.shiftKey)) {
                    evt.preventDefault()
                }
            }
        })
        document.addEventListener('keypress', (evt) => {
            console.log(`keypress event`, evt)
        })
    }

    onCommandKey(key: string, shift: boolean) : boolean {
        switch (key) {
            case 'a': 
                this.ui.selection.selectAll()
                return true
            case 'z':
                if (shift) {
                    this.ui.history.redo()
                }
                else {
                    this.ui.history.undo()
                }
                return true
        }
        return false
    }

}

export default Keymap