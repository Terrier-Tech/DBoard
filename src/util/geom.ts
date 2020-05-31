
export class Point {
    constructor(readonly x: number, readonly y: number) {}
}

export function addPoints(p1: Point, p2: Point) {
    return {x: p1.x + p2.x, y: p1.y + p2.y}
}

export function subtractPoints(p1: Point, p2: Point) {
    return {x: p1.x - p2.x, y: p1.y - p2.y}
}

export function sum(p: Point): number {
    return p.x + p.y
}

export function crossProduct(v1: Point, v2: Point): Point {
    return {
        x: v1.x*v2.y, 
        y: -v1.y*v2.x
    }
}

export function crossProductSum(v1: Point, v2: Point): number {
    return v1.x*v2.y - v1.y*v2.x
}

export type LineSegment = [Point, Point]

export function intersectLineSegments(l1: LineSegment, l2: LineSegment): Point | null {
    const p = l1[0]
    const q = l2[0]
    const r = subtractPoints(l1[1], l1[0])
    const s = subtractPoints(l2[1], l2[0])
    const denominator = crossProductSum(r, s)
    if (denominator == 0) { // colinear or parallel
        return null
    }
    const t = crossProductSum(subtractPoints(q, p), s) / denominator
    const u = crossProductSum(subtractPoints(q, p), r) / denominator
    console.log(`t: ${t}, u: ${u}`)
    if (u >=0 && u <= 1 && t >= 0 && t <= 1) {
        return {
            x: q.x + u*s.x,
            y: q.y + u*s.y
        }
    }
    else {
        return null
    }
}

export interface IRect {
    left: number
    top: number
    right: number
    bottom: number
    width: number
    height: number
}

export class Rect implements IRect {

    constructor(readonly x: number, readonly y: number, readonly width: number, readonly height: number) {
        
    }

    get left(): number {
        return this.x
    }

    get top(): number {
        return this.y
    }

    get right(): number {
        return this.x + this.width
    }

    get bottom(): number {
        return this.y + this.height
    }

    static fromPoints(p1: Point, p2: Point) : Rect {
        const x = Math.min(p1.x, p2.x)
        const y = Math.min(p1.y, p2.y)
        const width = Math.abs(p1.x - p2.x)
        const height = Math.abs(p1.y - p2.y)
        return new Rect(x, y, width, height)
    }

    isWithin(other: Rect) {
        return this.x >= other.x && this.y >= other.y &&
        this.right <= other.right &&
        this.bottom <= other.bottom
    }
}

export function rectCenter(rect: IRect): Point {
    return {
        x: (rect.left + rect.right)/2,
        y: (rect.top + rect.bottom)/2
    }
}


interface Corners {
    ne: Point
    nw: Point
    se: Point
    sw: Point
}

export function rectCorners(rect: IRect): Corners {
    return {
        ne: {x: rect.right, y: rect.top},
        nw: {x: rect.left, y: rect.top},
        se: {x: rect.right, y: rect.bottom},
        sw: {x: rect.left, y: rect.bottom}
    }
}