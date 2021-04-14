import { Segment } from "./segment"

export class Net {

  highlighted: boolean = false

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
      console.log(segs)
      segs.forEach(s => remainingSegments.delete(s))
      const net = new Net(Array.from(segs))
      nets.push(net)
    }

    return nets
  }

}
