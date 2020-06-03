import UI from "./ui"
import Config from "../view/config"

class Keymap {
    constructor(readonly ui: UI, private config: Config) {
        document.addEventListener('keydown', (evt) => {
            const targetTag = (evt.target as any).tagName
            if (targetTag == 'INPUT') { // don't override events on inputs
                return
            }
            if (evt.metaKey || evt.ctrlKey) {
                if (this.onCommandKey(evt.key, evt.shiftKey)) {
                    evt.preventDefault()
                }
            }
            if (evt.key == 'Backspace') {
                if (this.ui.selection.numEntites()) {
                    this.ui.selection.deleteEntities()
                    evt.stopPropagation()
                }
                else if (this.ui.selection.numAssociations()) {
                    this.ui.selection.deleteAssociations()
                    evt.stopPropagation()
                }
            }
        })
        document.addEventListener('keypress', (evt) => {
            
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