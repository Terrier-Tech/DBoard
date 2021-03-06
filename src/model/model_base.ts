
abstract class ModelBase<StateType> {
    private static idCounts: {[type: string]: number;} = {}

    static newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }

    static getId(type: string) {
        if (type == 'schema') { // generate guids for schemas
            return this.newGuid()
        }
        if (this.idCounts[type]) {
            this.idCounts[type] += 1
        }
        else {
            this.idCounts[type] = 1
        }
        return `${type}-${this.idCounts[type]}`
    }

    // ensures that the type count is greater than that represented by the given id
    static bumpCount(type: string, id: string) {
        const comps = id.split('-')
        if (comps.length > 1) {
            const val = parseInt(comps[1])
            if (this.idCounts[type]) {
                this.idCounts[type] = Math.max(this.idCounts[type], val)
            }
            else {
                this.idCounts[type] = val+1
            }
        }
    }

    readonly id : string

    constructor(type: string, public state: StateType, id: string|null) {
        if (id) {
            this.id = id
            ModelBase.bumpCount(type, id)
        }
        else {
            this.id = ModelBase.getId(type)
        }
    }

}


export default ModelBase