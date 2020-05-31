import * as Geom from '../util/geom'

interface IId {
    id: string
}

type Dir = 'n' | 's' | 'e' | 'w'

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
}

type SideDef = Geom.IRect & IId


export class Lines {

    private rects: Record<string, Geom.IRect> = {}

    private lines: Array<LinePath> = []

    addLine(id: string, from: SideDef, to: SideDef) {
        this.rects[from.id] = from
        this.rects[to.id] = to
        this.lines.push(new LinePath(id, from.id, to.id))
    }

    private findEdge(line: Geom.LineSegment, path: LinePath, rect: Geom.IRect, index: number) {
        const corners = Geom.rectCorners(rect)
        let intersect: Geom.Point | null = null
        if (intersect = Geom.intersectLineSegments(line, [corners.nw, corners.ne])) {
            path.points[index] = intersect
            path.fromDir =  'n'
            return
        }
        else if (intersect = Geom.intersectLineSegments(line, [corners.ne, corners.se])) {
            path.points[index] = intersect
            path.fromDir =  'e'
            return
        }
        else if (intersect = Geom.intersectLineSegments(line, [corners.se, corners.sw])) {
            path.points[index] = intersect
            path.fromDir =  's'
            return
        }
        else if (intersect = Geom.intersectLineSegments(line, [corners.sw, corners.nw])) {
            path.points[index] = intersect
            path.fromDir =  'w'
            return
        }
    }

    layout(): Array<LinePath> {
        
        for (let path of this.lines) {
            const fromRect = this.rects[path.fromId]
            const toRect = this.rects[path.toId]
            path.points = [
                Geom.rectCenter(fromRect),
                Geom.rectCenter(toRect)
            ]
            console.log(`${path.id} from/to`, path.points[0], path.points[1])
            const initialLine: Geom.LineSegment = [path.points[0], path.points[1]]
            this.findEdge(initialLine, path, fromRect, 0)
            this.findEdge(initialLine, path, toRect, 1)
        }

        return this.lines
    }
}