import { Direction } from "./grid"

export interface BlockDriver {

  ioWireCount(direction: Direction): number

  ioWireLabels(direction: Direction): string[]

}

export class LutDriver implements BlockDriver {

  ioWireCount(direction: Direction): number {
    return 2
  }

  ioWireLabels(direction: Direction): string[] {
    switch (direction) {
      case Direction.North:
        return ["A", "Y"]
      case Direction.East:
        return ["B", "Y"]
      case Direction.South:
        return ["Y", "C"]
      case Direction.West:
        return ["Y", "D"]
    }
  }

}

export class InterfaceDriver implements BlockDriver {

  ioWireCount(direction: Direction): number {
    return 1
  }

  ioWireLabels(direction: Direction): string[] {
    return [""]
  }

}
