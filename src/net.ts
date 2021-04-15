import { Segment } from "./segment"

export enum NetState {
  Floating, Low, High, Error
}

export class Net {

  highlighted: boolean = false
  state: NetState = NetState.Floating
  nextState: NetState = NetState.Floating

  constructor(
    public segments: Segment[]
  ) {
    segments.forEach(seg => seg.net = this)
  }

  static buildNets(segments: Segment[]): Net[] {
    const nets: Net[] = []
    const remainingSegments = new Set(segments)

    const visit = (seg: Segment, visited: Set<Segment>) => {
      if (visited.has(seg)) {
        return visited
      }
      visited.add(seg)
      seg.switches
        .filter(sw => sw.state)
        .flatMap(sw => sw.segments)
        .forEach(seg => visit(seg, visited))
      return visited
    }

    while (remainingSegments.size != 0) {
      const seed = remainingSegments.values().next().value
      const segs = visit(seed, new Set())
      segs.forEach(s => remainingSegments.delete(s))
      const net = new Net(Array.from(segs))
      nets.push(net)
    }

    return nets
  }

  drive(high: boolean) {
    const state = high ? NetState.High : NetState.Low
    if (this.nextState === NetState.Floating) {
      this.nextState = state
    } else if (
      (this.nextState === NetState.High ||
        this.nextState === NetState.Low) &&
        this.nextState !== state
    ) {
      this.nextState = NetState.Error
    }
  }

  simulationStart() {
    this.state = this.nextState = NetState.Floating
  }

  update() {
    this.state = this.nextState
    this.nextState = NetState.Floating
  }

}
