import UI from "./ui";
import Config from "../view/config";


class ActionHistory {

    private actionSets: Array<ActionSet> = []
    private index: number = -1

    constructor(readonly ui: UI, readonly config: Config) {
        
    }

    numActions() : number {
        return this.actionSets.length
    }

    pushAction(action: ActionBase) {
        this.pushSet(new Set([action]))
    }

    pushActions(actions: Iterable<ActionBase>) {
        this.pushSet(new Set(actions))
    }

    pushSet(set: ActionSet) {
        if (this.index >= this.numActions()) {
            this.actionSets = this.actionSets.slice(0, this.index)
        }
        this.actionSets.push(set)
        this.index = this.actionSets.length-1
        this.applySet(set)
        console.log(`action history at ${this.index}`)
    }

    private applySet(set: ActionSet) {
        set.forEach((a) => {
            a.apply()
        })
        this.ui.requestRender(UI.RenderType.App)
    }

    private unapplySet(set: ActionSet) {
        set.forEach((a) => {
            a.unapply()
        })
        this.ui.requestRender(UI.RenderType.App)
    }

    canUndo() {
        return this.index > -1
    }

    undo() : boolean {
        console.log('undo')
        if (this.index < 0) {
            return false
        }
        const set = this.actionSets[this.index]
        this.unapplySet(set)
        this.ui.requestRender(UI.RenderType.App)
        this.index -= 1
        console.log(`action history at ${this.index}`)
        return true
    }

    canRedo() {
        return this.index < this.numActions()-1
    }

    redo() : boolean {
        console.log('redo')
        if (this.index >= this.numActions()-1) {
            return false
        }
        this.index += 1
        const set = this.actionSets[this.index]
        this.applySet(set)
        console.log(`action history at ${this.index}`)
        return true
    }

}

type ActionSet = Set<ActionBase>


abstract class ActionBase {

    abstract apply(): void

    abstract unapply(): void

}

export {ActionBase as Base}

export {ActionHistory as History}