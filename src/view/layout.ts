import * as Geom from '../util/geom'
import Config from './config'

export type Dir = 'n' | 's' | 'e' | 'w'

const Dirs: Dir[] = ['n', 's', 'e', 'w']

// returns the component of the point that is perpindicular to the direction
function lateralValue(p: Geom.Point, dir: Dir): number {
    if (dir == 's' || dir == 'n')
        return p.x
    else
        return p.y
}

function setLateralValue(p: Geom.Point, dir: Dir, v: number): Geom.Point {
    if (dir == 's' || dir == 'n')
        return {x: v, y: p.y}
    else
        return {x: p.x, y: v}
}

// returns the min and max lateral value of the rectangle for the given side
function lateraleRange(rect: Geom.IRect, dir: Dir): [number, number] {
    if (dir == 's' || dir == 'n')
        return [rect.left, rect.right]
    else
        return [rect.top, rect.bottom]
}

export class LinePath {
    public points: Array<Geom.Point> = []
    public fromDir: Dir = 'e'
    public toDir: Dir = 'e'

    constructor(readonly id: string, readonly fromId: string, readonly toId: string) {

    }

    get svgPoints(): string {
        return this.points.map((p) => {
            return `${p.x},${p.y}`
        }).join(' ')
    }

    get firstPoint(): Geom.Point {
        return this.points[0]
    }

    get lastPoint(): Geom.Point {
        return this.points[this.points.length-1]
    }

    get bounds(): Geom.Rect {
        return Geom.rectFromPoints(this.points)
    }
}

export class Lines {

    constructor(readonly config: Config) {
        
    }

    private rects: Record<string, Geom.IRect> = {}

    private lines: Array<LinePath> = []

    addLine(id: string, fromId: string, fromRect: Geom.IRect, toId: string, toRect: Geom.IRect) {
        this.rects[fromId] = fromRect
        this.rects[toId] = toRect
        this.lines.push(new LinePath(id, fromId, toId))
    }

    private findEdge(line: Geom.LineSegment, path: LinePath, rect: Geom.IRect, index: number): Dir | null {
        const corners = Geom.rectCorners(rect)
        let intersect: Geom.Point | null = null
        const d = this.config.gridSize
        if (intersect = Geom.intersectLineSegments(line, [corners.nw, corners.ne])) {
            intersect = {x: Math.min(Math.max(intersect.x, rect.left+d), rect.right-d), y: intersect.y}
            path.points[index] = Geom.roundPoint(intersect)
            return 'n'
        }
        else if (intersect = Geom.intersectLineSegments(line, [corners.ne, corners.se])) {
            intersect = {x: intersect.x, y: Math.min(Math.max(intersect.y, rect.top+d), rect.bottom-d)}
            path.points[index] = Geom.roundPoint(intersect)
            return 'e'
        }
        else if (intersect = Geom.intersectLineSegments(line, [corners.se, corners.sw])) {
            intersect = {x: Math.min(Math.max(intersect.x, rect.left+d), rect.right-d), y: intersect.y}
            path.points[index] = Geom.roundPoint(intersect)
            return 's'
        }
        else if (intersect = Geom.intersectLineSegments(line, [corners.sw, corners.nw])) {
            intersect = {x: intersect.x, y: Math.min(Math.max(intersect.y, rect.top+d), rect.bottom-d)}
            path.points[index] = Geom.roundPoint(intersect)
            return 'w'
        }
        return null
    }

    squareOut(line: LinePath, fromRect: Geom.IRect, toRect: Geom.IRect) {
        const d = this.config.gridSize
        const points = line.points

        const dirs = [line.fromDir, line.toDir].sort().join('')
        const xAvg = (points[0].x + points[1].x)/2
        const yAvg = (points[0].y + points[1].y)/2
        switch (dirs) {
            case'ew':
                // try to find a straight line directly between the ends
                if (yAvg >= fromRect.top + d && yAvg >= toRect.top + d && 
                    yAvg <= fromRect.bottom - d && yAvg <= toRect.bottom - d ) {
                    line.points[0] = {x: points[0].x, y: yAvg}
                    line.points[1] = {x: points[1].x, y: yAvg}
                }
                else { // need a jog
                    line.points = [
                        points[0],
                        {x: xAvg, y: points[0].y},
                        {x: xAvg, y: points[1].y},
                        points[1]
                    ]
                }
                return
            case 'ns':
                // try to find a straight line directly between the ends
                if (xAvg >= fromRect.left + d && xAvg >= toRect.left + d && 
                    xAvg <= fromRect.right - d && xAvg <= toRect.right - d ) {
                    line.points[0] = {x: xAvg, y: points[0].y}
                    line.points[1] = {x: xAvg, y: points[1].y}
                }
                else { // need a jog
                    line.points = [
                        points[0],
                        {x: points[0].x, y: yAvg},
                        {x: points[1].x, y: yAvg},
                        points[1]
                    ]
                }
                return
            case 'en':
                // add one point in upper right
                line.points = [
                    points[0],
                    {x: Math.max(points[0].x, points[1].x), y: Math.min(points[0].y, points[1].y)},
                    points[1]
                ]
                return
            case 'nw':
                // add one point in upper left
                line.points = [
                    points[0],
                    {x: Math.min(points[0].x, points[1].x), y: Math.min(points[0].y, points[1].y)},
                    points[1]
                ]
                return
            case 'es':
                // add one point in lower right
                line.points = [
                    points[0],
                    {x: Math.max(points[0].x, points[1].x), y: Math.max(points[0].y, points[1].y)},
                    points[1]
                ]
                return
            case 'sw':
                // add one point in lower left
                line.points = [
                    points[0],
                    {x: Math.min(points[0].x, points[1].x), y: Math.max(points[0].y, points[1].y)},
                    points[1]
                ]
                return
            default: 
                throw(`Don't know how to square out directions '${dirs}'`)
        }
    }

    spreadSides(lines: LinePath[], id: string, rect: Geom.IRect, dir: Dir) {
        const vRange = lateraleRange(rect, dir)
        const d = this.config.gridSize

        // find all line sides on this edge of the rect
        const sides: {index: number, v: number, line: LinePath}[] = []
        for (let line of lines) {
            if (line.fromId == id && line.fromDir == dir) {
                sides.push({
                    index: 0,
                    v: lateralValue(line.firstPoint, dir),
                    line: line
                })
            }
            if (line.toId == id && line.toDir == dir) {
                sides.push({
                    index: line.points.length-1,
                    v: lateralValue(line.lastPoint, dir),
                    line: line
                })
            }
        }
        
        // spread the sides out across the edge of the rect
        if (sides.length>1) {
            sides.sort((s1,s2) => {return s1.v - s2.v})
            let vMin = vRange[1] - vRange[0]
            for (let i=0; i<sides.length-1; i++) {
                vMin = Math.min(vMin, sides[i+1].v - sides[i].v)
            }
            if (vMin < d) {
                const vStep = (vRange[1]-vRange[0])/sides.length
                for (let i in sides) {
                    const s = sides[i]
                    s.line.points[s.index] = setLateralValue(s.line.points[s.index], dir, vRange[0] + (parseInt(i)+0.5)*vStep)
                }
            }
        }
    }

    layout(): LinePath[] {
        let keepLines: LinePath[] = []
        
        for (let line of this.lines) {
            const fromRect = this.rects[line.fromId]
            const toRect = this.rects[line.toId]
            line.points = [
                Geom.rectCenter(fromRect),
                Geom.rectCenter(toRect)
            ]
            const initialLine: Geom.LineSegment = [line.points[0], line.points[1]]
           
            // attach the path to the edges of the rectangles and compute the edge directions
            let dir: Dir | null = null
            let keepLine = true
            if (dir = this.findEdge(initialLine, line, fromRect, 0)) {
                line.fromDir = dir
            }
            else {
                keepLine = false
            }
            if (dir = this.findEdge(initialLine, line, toRect, 1)) {
                line.toDir = dir
            }
            else {
                keepLine = false
            }
            if (!keepLine) {
                continue
            }

            // only keep lines that go beyond a grid square
            const bounds = line.bounds
            if (bounds.width > this.config.gridSize || bounds.height > this.config.gridSize) {
                keepLines.push(line)
            }
        }

        Object.entries(this.rects).forEach(record => {
            for (let dir of Dirs) {
                this.spreadSides(keepLines, record[0], record[1], dir)
            }
        })

        for (let line of keepLines) {
            const fromRect = this.rects[line.fromId]
            const toRect = this.rects[line.toId]
            this.squareOut(line, fromRect, toRect)
        }

        return keepLines
    }
}