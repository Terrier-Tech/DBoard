
import { DOMElement } from 'react'

export type ColorName = "blue" | "green" | "purple" | "cyan" | "gray" | "orange" | "red" | "yellow"

export class Config {
    fontSize = 14
    lineHeight = 32
    padding = 12
    iconSize = 48
    minEntitySize = 8 * this.gridSize
    planeSize = 3000 // maximum size of the document, currently
    readonly borderSize = 2
    readonly entityRadius = 6
    readonly attributeRadius = this.entityRadius - this.borderSize
    readonly dashSize = this.lineHeight / 5 * 1.414 // so that there are exactly 3 dashes on a chicken foot

    get gridSize(): number {
        return this.lineHeight / 2
    }

    readonly fontFamily = 'Verdana, Geneva, sans-serif'

    readonly utilCanvas: HTMLCanvasElement
    readonly utilContext: CanvasRenderingContext2D

    constructor() {
        this.utilCanvas = document.createElement("canvas")
        this.utilContext = this.utilCanvas.getContext('2d')!
    }

    measureText(text: string, weight: 'normal'|'bold' = 'normal') : TextMetrics {
        this.utilContext.font = `${weight} ${this.fontSize}px sans-serif`
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

    readonly colors: Record<ColorName,string> = {
        blue: '#2980b9',
        green: '#27ae60',
        purple: '#8e44ad',
        cyan: '#079992',
        gray: '#bdc3c7',
        orange: '#f39c12',
        red: '#c0392b',
        yellow: '#f1c40f'
    }

    color(name: ColorName) : string {
        return this.colors[name]
    }

    readonly primaryColor = '#7e7367'
    readonly fgColor = '#362b21'
    readonly oddBgColor = 'transparent'
    readonly evenBgColor = '#f6f2f0'
    readonly hintFgColor = '#d9d0c7'
    readonly hintBgColor = '#f2e9df'

}



export default Config