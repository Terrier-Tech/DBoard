import * as Geom from '../util/geom'
import Config from './config'

interface IId {
    id: string
}

export type Dir = 'n' | 's' | 'e' | 'w'

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
            case 'es':
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
               
            this.squareOut(line, fromRect, toRect)

            // only keep lines that go beyond a grid square
            const bounds = line.bounds
            if (bounds.width > this.config.gridSize || bounds.height > this.config.gridSize) {
                keepLines.push(line)
            }
        }

        return keepLines
    }
}