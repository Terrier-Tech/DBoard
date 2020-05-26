
export class Point {
    constructor(readonly x: number, readonly y: number) {}

    add(dx: number | Point, dy: number = 0) : Point {
        if (typeof dx == 'number')
            return new Point(this.x + dx, this.y + dy)
        else if (typeof dx == 'object')
            return new Point(this.x + dx.x, this.y + dx.y)
        else
            throw `Can't add Point with ${typeof dx}`
    }
}

export class Rect {

    constructor(readonly x: number, readonly y: number, readonly width: number, readonly height: number) {
        
    }

    right() : number {
        return this.x + this.width
    }

    bottom() : number {
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
        this.right() <= other.right() &&
        this.bottom() <= other.bottom()
    }
}