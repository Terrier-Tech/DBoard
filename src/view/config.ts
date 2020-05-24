import * as themes from '../view/themes'

class Config {
    gridSize: number = 20
    fontSize: number = 14
    padding: number = 4

    theme: themes.Base = themes.Light

    computeLineHeight() : number {
        return 2*this.padding + this.fontSize*1.2
    }
}


export default Config