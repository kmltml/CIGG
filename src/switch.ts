import { Segment } from './segment'
import { Bounds } from "./bounds"

export class Switch {

  state: boolean = false
  bounds: Bounds
  activeEdges: Map<Segment, boolean> = new Map()

  static Radius: number = 5

  constructor(
    public x: number,
    public y: number,
    public segments: Segment[],
    public shape: 'circle' | 'diamond' | 'invisible' = 'circle'
  ) {
    segments.forEach(s => s.addSwitch(this))
    if (shape === "diamond" || shape === "invisible") {
      this.state = true
    }
    if (shape === "invisible") {
      this.bounds = new Bounds( // Impossible bounds
        { x: 0, y: 0 },
        { x: -1, y: -1 }
      )
    } else {
      this.bounds = new Bounds(
        { x: x - Switch.Radius, y: y - Switch.Radius },
        { x: x + Switch.Radius, y: y + Switch.Radius }
      )
    }

  }

  draw(ctxt: CanvasRenderingContext2D) {
    if (this.shape === "invisible") {
      return
    }
    switch (this.shape) {
      case "circle":
        ctxt.beginPath()
        ctxt.arc(this.x, this.y, Switch.Radius, 0, 360)
        break
      case "diamond":
        ctxt.beginPath()
        ctxt.moveTo(this.x - Switch.Radius, this.y)
        ctxt.lineTo(this.x, this.y - Switch.Radius)
        ctxt.lineTo(this.x + Switch.Radius, this.y)
        ctxt.lineTo(this.x, this.y + Switch.Radius)
        ctxt.closePath()
        break
    }
    ctxt.stroke()
    if (this.state) {
      ctxt.fill()
    }
  }

  clearActive() {
    this.activeEdges.clear()
  }

  findActivePath(leadingSegment: Segment, visited: Set<Switch>): boolean {
    if (!this.state) {
      return false
    }
    if (visited.has(this)) {
      return false
    }
    if (this.segments.some(s => s !== leadingSegment && s.isActive())) {
      return true
    }

    visited.add(this)
    for (let seg of this.segments) {
      if (seg === leadingSegment) {
        continue
      }
      if (this.activeEdges.get(seg)) {
        return true
      }
      for (let sw of seg.switches) {
        if (sw.shape === "diamond" && sw.state) {
          if (sw.findActivePath(seg, visited)) {
            return true
          }
        }
      }
    }
    return false
  }

  updateActive() {
    if (this.shape !== "diamond" || !this.state) {
      return
    }
    outer: for (let segment of this.segments) {
      if (!this.activeEdges.has(segment)) {
        if (segment.isActive()) {
          this.activeEdges.set(segment, true)
          continue
        }
        for (let sw of segment.switches) {
          if (sw.shape === "diamond" && sw !== this) {
            if (sw.findActivePath(segment, new Set([this]))) {
              this.activeEdges.set(segment, true)
              continue outer
            }
          }
        }
        this.activeEdges.set(segment, false)
      }
    }
  }

  activeFor(segment: Segment): boolean {
    if (!this.activeEdges.get(segment)) {
      return false
    }
    return [...this.activeEdges.values()].filter(x => x).length >= 2
  }

}
