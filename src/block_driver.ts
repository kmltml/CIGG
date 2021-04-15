import { Direction } from "./grid"
import { Net, NetState } from "./net"

export interface BlockDriver {

  ioWireCount(direction: Direction): number

  ioWireLabels(direction: Direction): string[]

  driveOutputs(nets: Map<Direction, Net[]>): void

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

  driveOutputs(nets: Map<Direction, Net[]>): void {
    const inputs: boolean[] = []
    const addInput = (net: Net | undefined) => {
      if (net === undefined) {
        return
      }
      if (net.state === NetState.High) {
        inputs.push(true)
      } else if (net.state === NetState.Low) {
        inputs.push(false)
      }
    }
    addInput(nets.get(Direction.North)?.[0])
    addInput(nets.get(Direction.East)?.[0])
    addInput(nets.get(Direction.South)?.[1])
    addInput(nets.get(Direction.West)?.[1])

    const res = !inputs.every(x => x)
    nets.get(Direction.North)?.[1]?.drive(res)
    nets.get(Direction.East)?.[1]?.drive(res)
    nets.get(Direction.South)?.[0]?.drive(res)
    nets.get(Direction.West)?.[0]?.drive(res)
  }

}

export class InterfaceDriver implements BlockDriver {

  state: boolean = false

  ioWireCount(direction: Direction): number {
    return 1
  }

  ioWireLabels(direction: Direction): string[] {
    return [""]
  }

  driveOutputs(nets: Map<Direction, Net[]>): void {
    for (let dir of nets.values()) {
      dir.forEach(net => net.drive(this.state))
    }
  }

}
