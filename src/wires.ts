import { GridCell } from "./grid_cell"
import { Grid } from "./grid"
import { Segment } from "./segment"
import { linspace } from "./utils"
import { LogicBlock } from "./logic_block"
import { Interconnect } from "./interconnect"

export class Wires implements GridCell {

  cellType: "wires" = "wires"

  segments: Segment[] = []
  switches = []

  center: { x: number, y: number } = { x: 0, y: 0 }

  incomingSegments: Segment[] = []
  incomingSegmentCoords: number[] = []

  constructor(
    public x: number, public y: number,
    public wireCount: number
  ) {}

  initSegments(grid: Grid) {
    this.segments = Array.from({ length: this.wireCount }, () => new Segment())
    this.center = grid.displayCoords(this.x, this.y)
  }

  initSwitches(grid: Grid) {
  }

  draw(ctxt: CanvasRenderingContext2D) {}

  arrangeIncoming(): number[] {
    if (this.incomingSegmentCoords.length == this.incomingSegments.length) {
      return this.incomingSegmentCoords
    } else {
      this.incomingSegmentCoords =
        linspace(-LogicBlock.Size / 2, LogicBlock.Size / 2, this.incomingSegments.length + 2)
          .slice(1, this.incomingSegments.length + 1)
      return this.incomingSegmentCoords
    }
  }

  wireCoords(): number[] {
    return linspace(-Interconnect.Size / 2, Interconnect.Size / 2, this.wireCount + 2)
      .slice(1, this.wireCount + 1)
  }

}
