import { Segment } from "./segment"
import { Switch } from "./switch"
import { Grid } from "./grid"

export type CellType = "logic-block" | "wires" | "interconnect" | "interface" | "empty"

export interface GridCell {

  cellType: CellType

  x: number
  y: number

  segments: Segment[]
  switches: Switch[]

  initSegments(grid: Grid): void
  initSwitches(grid: Grid): void

  draw(context: CanvasRenderingContext2D): void

}

export class EmptyCell implements GridCell {

  constructor(public x: number, public y: number) {}

  cellType: "empty" = "empty"
  segments = []
  switches = []

  initSegments() {}
  initSwitches() {}

  draw() {}

}
