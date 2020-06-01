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
}

type SideDef = Geom.IRect & IId


export class Lines {

    constructor(readonly config: Config) {
        
    }

    private rects: Record<string, Geom.IRect> = {}

    private lines: Array<LinePath> = []

    addLine(id: string, from: SideDef, to: SideDef) {
        this.rects[from.id] = from
        this.rects[to.id] = to
        this.lines.push(new LinePath(id, from.id, to.id))
    }

    private findEdge(line: Geom.LineSegment, path: LinePath, rect: Geom.IRect, index: number): Dir | null {
        const corners = Geom.rectCorners(rect)
        let intersect: Geom.Point | null = null
        const d = this.config.gridSize
        if (intersect = Geom.intersectLineSegments(line, [corners.nw, corners.ne])) {
            intersect = {x: Math.min(Math.max(intersect.x, rect.left+d), rect.right-d), y: intersect.y}
            path.points[index] = intersect
            return 'n'
        }
        else if (intersect = Geom.intersectLineSegments(line, [corners.ne, corners.se])) {
            intersect = {x: intersect.x, y: Math.min(Math.max(intersect.y, rect.top+d), rect.bottom-d)}
            path.points[index] = intersect
            return 'e'
        }
        else if (intersect = Geom.intersectLineSegments(line, [corners.se, corners.sw])) {
            intersect = {x: Math.min(Math.max(intersect.x, rect.left+d), rect.right-d), y: intersect.y}
            path.points[index] = intersect
            return 's'
        }
        else if (intersect = Geom.intersectLineSegments(line, [corners.sw, corners.nw])) {
            intersect = {x: intersect.x, y: Math.min(Math.max(intersect.y, rect.top+d), rect.bottom-d)}
            path.points[index] = intersect
            return 'w'
        }
        return null
    }

    squareOut(path: LinePath, fromRect: Geom.IRect, toRect: Geom.IRect) {
        const d = this.config.gridSize

        // try to find a straight line directly between the ends
        const dirs = [path.fromDir, path.toDir].sort().join('')
        const xAvg = (path.points[0].x + path.points[1].x)/2
        const yAvg = (path.points[0].y + path.points[1].y)/2
        if (dirs == 'ew') {
            if (yAvg >= fromRect.top + d && yAvg >= toRect.top + d && 
                yAvg <= fromRect.bottom - d && yAvg <= toRect.bottom - d ) {
                path.points[0] = {x: path.points[0].x, y: yAvg}
                path.points[1] = {x: path.points[1].x, y: yAvg}
            }
            else { // need a jog
                path.points = [
                    path.points[0],
                    {x: xAvg, y: path.points[0].y},
                    {x: xAvg, y: path.points[1].y},
                    path.points[1]
                ]
            }
            return
        }
        if (dirs == 'ns') {
            if (xAvg >= fromRect.left + d && xAvg >= toRect.left + d && 
                xAvg <= fromRect.right - d && xAvg <= toRect.right - d ) {
                path.points[0] = {x: xAvg, y: path.points[0].y}
                path.points[1] = {x: xAvg, y: path.points[1].y}
            }
            else { // need a jog
                path.points = [
                    path.points[0],
                    {x: path.points[0].x, y: yAvg},
                    {x: path.points[1].x, y: yAvg},
                    path.points[1]
                ]
            }
            return
        }

        // TODO: support en and es combinations
    }

    layout(): Array<LinePath> {
        
        for (let path of this.lines) {
            const fromRect = this.rects[path.fromId]
            const toRect = this.rects[path.toId]
            path.points = [
                Geom.rectCenter(fromRect),
                Geom.rectCenter(toRect)
            ]
            const initialLine: Geom.LineSegment = [path.points[0], path.points[1]]
           
            // attach the path to the edges of the rectangles and compute the edge directions
            let dir: Dir | null = null
            if (dir = this.findEdge(initialLine, path, fromRect, 0)) {
                path.fromDir = dir
            }
            if (dir = this.findEdge(initialLine, path, toRect, 1)) {
                path.toDir = dir
            }
               
            this.squareOut(path, fromRect, toRect)
        }

        return this.lines
    }
}