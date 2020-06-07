
import { DOMElement } from 'react'

export type ColorName = "blue" | "green" | "purple" | "cyan" | "gray" | "orange" | "red" | "yellow"

export class Config {
    fontSize: number = 15
    lineHeight: number = 32
    padding: number = 12
    iconSize: number = 48
    minEntitySize: number = 8 * this.gridSize

    get gridSize(): number {
        return this.lineHeight / 2
    }

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

    readonly fgColor = '#333333'
    readonly oddBgColor = '#f8f8f8'
    readonly evenBgColor = '#ffffff'
    readonly hintFgColor = '#aaa'
    readonly hintBgColor = '#eee'

}



export default Config