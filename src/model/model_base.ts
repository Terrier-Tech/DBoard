
abstract class ModelBase<StateType> {
    private static idCounts: {[type: string]: number;} = {}

    static getId(type: string) {
        if (this.idCounts[type] == undefined) {
            this.idCounts[type] = 1
        }
        else {
            this.idCounts[type] += 1
        }
        return `${type}-${this.idCounts[type]}`
    }

    readonly id : string

    constructor(type: string, public state: StateType) {
        this.id = ModelBase.getId(type)
    }

}


export default ModelBase