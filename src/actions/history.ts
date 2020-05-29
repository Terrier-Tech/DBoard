import UI from "../ui/ui";
import Config from "../view/config";
import ActionBase from "./action_base";



class ActionHistory {

    private actions: Array<ActionBase> = []
    private index: number = -1

    constructor(readonly ui: UI, readonly config: Config) {
        
    }

    numActions() : number {
        return this.actions.length
    }

    push(action: ActionBase) {
        if (this.index >= this.numActions()) {
            this.actions = this.actions.slice(0, this.index)
        }
        this.actions.push(action)
        this.index = this.actions.length-1
        action.apply(this)
    }

    undo() : boolean {
        if (this.index < -1) {
            return false
        }
        const action = this.actions[this.index]
        action.unapply(this)
        this.index -= 1
        return true
    }

    redo() : boolean {
        if (this.index >= this.numActions()-1) {
            return false
        }
        this.index += 1
        const action = this.actions[this.index]
        action.apply(this)
        return true
    }

}

export default ActionHistory