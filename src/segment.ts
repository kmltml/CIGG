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
    let activePoints = this.points.filter(p => {
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

    if (activePoints.length <= 1) {
      ctxt.strokeStyle = `rgba(0, 0, 0, 0.15)`
      activePoints = this.points
    } else {
      ctxt.strokeStyle = `rgba(0, 0, 0, 1.0)`
    }

    if (this.net?.highlighted) {
      ctxt.lineWidth = 3
    } else {
      ctxt.lineWidth = 1
    }
    
    ctxt.beginPath()
    ctxt.moveTo(activePoints[0].x, activePoints[0].y)
    for (let i = 1; i < activePoints.length; i++) {
      ctxt.lineTo(activePoints[i].x, activePoints[i].y)
    }
    ctxt.stroke()

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
