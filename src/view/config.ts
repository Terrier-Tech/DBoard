import * as themes from '../view/themes'
import { DOMElement } from 'react'

class Config {
    fontSize: number = 15
    lineHeight: number = 32
    padding: number = 12
    iconSize: number = 48

    get gridSize(): number {
        return this.lineHeight / 2
    }

    theme: themes.Base = themes.Light

    readonly fontFamily = 'Verdana, Geneva, sans-serif'

    readonly utilCanvas: HTMLCanvasElement
    readonly utilContext: CanvasRenderingContext2D

    constructor() {
        this.utilCanvas = document.createElement("canvas")
        this.utilContext = this.utilCanvas.getContext('2d')!
        this.utilContext.font = `${this.fontSize}px sans-serif`
    }

    measureText(text: string) : TextMetrics {
        return this.utilContext.measureText(text)
    }

    // snaps the number to nearest grid interval
    snapNearest(n : number) : number {
        return Math.round(n/this.gridSize) * this.gridSize
    }

    // snaps the number to next higher grid interval
    snapUp(n : number) : number {
        return Math.ceil(n/this.gridSize) * this.gridSize
    }

    // snaps the number to next higher even grid interval
    snapUpEven(n : number) : number {
        return Math.ceil(n/(2*this.gridSize)) * this.gridSize * 2
    }

}


export default Config