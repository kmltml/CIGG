import { Segment } from './segment'
import { GridCell } from './grid_cell'
import { Switch } from './switch'
import { Grid, Direction } from './grid'
import { Wires } from './wires'
import { BlockDriver } from "./block_driver"
import { Net } from './net'
import { Bounds } from './bounds'

export class LogicBlock implements GridCell {

  cellType: "logic-block" = "logic-block"

  static Size = 90
  static WireMargin = 10
  static Padding = 40
  static LabelPadding = 10

  segments: Segment[] = []
  switches: Switch[] = []
  connectingSegments: Map<Direction, Segment[]> = new Map()

  center: { x: number, y: number } = { x: 0, y: 0 }
  bounds: Bounds = new Bounds({x: 0, y: 0}, {x: 0, y: 0})

  constructor(
    public x: number,
    public y: number,
    public driver: BlockDriver
  ) {

  }

  initSegments(grid: Grid) {
    this.center = grid.displayCoords(this.x, this.y)
    this.bounds = Bounds.fromPoints([this.center]).addMargin(LogicBlock.Size / 2)
    for (let dir of Object.keys(Direction)) {
      const cell = grid.neighbour(this.x, this.y, dir as Direction)
      if (cell.cellType == "wires") {
        const segments = Array.from({length: this.driver.ioWireCount(dir as Direction)}, () => new Segment())
        ;(cell as Wires).incomingSegments.push(...segments)
        this.segments.push(...segments)
        this.connectingSegments.set(dir as Direction, segments)
      }
    }
  }

  initSwitches(grid: Grid) {
    for (let dir of Object.keys(Direction)) {
      const cell = grid.neighbour(this.x, this.y, dir as Direction)
      if (cell.cellType == "wires") {
        const wires = cell as Wires
        const coords = wires.arrangeIncoming()
        for (let seg of this.connectingSegments.get(dir as Direction)!) {
          const coord = coords[wires.incomingSegments.indexOf(seg)]
          let pin = { x: 0, y: 0 }
          switch (dir) {
            case Direction.North:
              pin = { x: coord, y: -LogicBlock.Size / 2}
              break
            case Direction.South:
              pin = { x: coord, y: LogicBlock.Size / 2}
              break
            case Direction.West:
              pin = { x: -LogicBlock.Size / 2, y: coord }
              break
            case Direction.East:
              pin = { x: LogicBlock.Size / 2, y: coord }
              break
          }
          pin.x += this.center.x
          pin.y += this.center.y
          this.switches.push(new Switch(pin.x, pin.y, [seg], "invisible"))

          const wireCoords = wires.wireCoords()
          wires.segments.forEach((wire, i) => {
            let x = coord
            let y = wireCoords[i]
            if (dir == Direction.West || dir == Direction.East) {
              ;[x, y] = [y, x]
            }
            const wiresCenter = grid.displayCoords(wires.x, wires.y)
            this.switches.push(new Switch(
              x + wiresCenter.x, y + wiresCenter.y,
              [seg, wire]
            ))
          })
        }
      }
    }
  }

  draw(ctxt: CanvasRenderingContext2D) {
    ctxt.strokeStyle = "black"
    ctxt.strokeRect(
      this.center.x - LogicBlock.Size / 2,
      this.center.y - LogicBlock.Size / 2,
      LogicBlock.Size,
      LogicBlock.Size
    )
    for (let dir of Object.keys(Direction).map(x => x as Direction)) {
      const wires = this.connectingSegments.get(dir)
      ctxt.textAlign = "center"
      ctxt.textBaseline = "middle"
      if (wires !== undefined) {
        const point = {
          [Direction.North]: (s: Switch) => ({ x: s.x, y: this.center.y - LogicBlock.Size / 2 + LogicBlock.LabelPadding }),
          [Direction.South]: (s: Switch) => ({ x: s.x, y: this.center.y + LogicBlock.Size / 2 - LogicBlock.LabelPadding }),
          [Direction.West]: (s: Switch) => ({ x: this.center.x - LogicBlock.Size / 2 + LogicBlock.LabelPadding, y: s.y }),
          [Direction.East]: (s: Switch) => ({ x: this.center.x + LogicBlock.Size / 2 - LogicBlock.LabelPadding, y: s.y })
        }[dir]
        const labels = this.driver.ioWireLabels(dir)
        labels.forEach((label, i) => {
          const p = point(wires[i].switches.find(s => s.shape === "invisible")!)
          ctxt.fillText(label, p.x, p.y)
        })
      }
    }
  }

  update() {
    const nets: Map<Direction, Net[]> = new Map()
    for (let dir of this.connectingSegments.keys()) {
      nets.set(dir, this.connectingSegments.get(dir)!.map(seg => seg.net!))
    }
    this.driver.driveOutputs(nets)
  }

}
