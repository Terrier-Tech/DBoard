import * as themes from '../view/themes'
import { DOMElement } from 'react'

class Config {
    gridSize: number = 15
    fontSize: number = 15
    lineHeight: number = 30
    padding: number = 10

    theme: themes.Base = themes.Light

    readonly utilCanvas: OffscreenCanvas
    readonly utilContext: OffscreenCanvasRenderingContext2D

    constructor() {
        this.utilCanvas = new OffscreenCanvas(100, 100)
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