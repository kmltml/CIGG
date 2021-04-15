import { Switch } from "./switch"
import { Net } from "./net"
import { Bounds } from "./bounds"

export class Segment {

  switches: Switch[] = []
  points: Switch[] = []
  net?: Net = undefined
  bounds: Bounds = new Bounds({x: 0, y: 0}, {x: -1, y: -1})

  constructor() {}

  isActive(): boolean {
    return this.switches.some(sw => sw.state && sw.shape !== "diamond")
  }
  
  draw(ctxt: CanvasRenderingContext2D) {
    const points = this.points.filter(sw => sw.state || sw.shape !== "diamond")
    
    const activePoints = points.filter(p => {
      if (p.state === undefined) {
        return true
      }
      if (p.state) {
        if (p.shape !== "diamond") {
          return true
        } else {
          return (p as Switch).activeFor(this)
        }
      }
      
    })

    const drawPoints = (points: {x: number, y: number}[], color: string) => {
      if (points.length <= 1) {
        return
      }
      ctxt.strokeStyle = color
      ctxt.beginPath()
      ctxt.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        ctxt.lineTo(points[i].x, points[i].y)
      }
      ctxt.stroke()
    }

    
    if (this.net?.highlighted) {
      ctxt.lineWidth = 3
    } else {
      ctxt.lineWidth = 1
    }
    
    if (activePoints.length != 0) {
      drawPoints(activePoints, "rgba(0, 0, 0, 1.0)")
      const inactiveBefore =
        points.slice(0, points.indexOf(activePoints[0]) + 1)
          .filter(sw => sw.state || sw.shape !== "diamond")
      drawPoints(inactiveBefore, "rgba(0, 0, 0, 0.3)")
      const inactiveAfter =
        points.slice(points.indexOf(activePoints[activePoints.length - 1]))
          .filter(sw => sw.state || sw.shape !== "diamond")
      drawPoints(inactiveAfter, "rgba(0, 0, 0, 0.3)")      
    } else {
      drawPoints(points.filter(sw => sw.state || sw.shape !== "diamond"), "rgba(0, 0, 0, 0.3)")
    }

    ctxt.strokeStyle = "black"
    ctxt.lineWidth = 1
  }

  addSwitch(sw: Switch) {
    if (this.switches.includes(sw)) {
      return
    }
    
    this.switches.push(sw)
    this.points.push(sw)
    this.resortPoints()
    this.bounds = Bounds.fromPoints(this.points).addMargin(2)
    console.log(this.bounds)
  }

  resortPoints() {
    if (this.points.length <= 1) {
      return
    }

    this.points.sort((a, b) => (a.x == b.x) ? a.y - b.y : a.x - b.x)
  }
  
}
