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

}


export default Config