import { Direction } from "./grid";
export class LutDriver {
    ioWireCount(direction) {
        return 2;
    }
    ioWireLabels(direction) {
        switch (direction) {
            case Direction.North:
                return ["A", "Y"];
            case Direction.East:
                return ["B", "Y"];
            case Direction.South:
                return ["Y", "C"];
            case Direction.West:
                return ["Y", "D"];
        }
    }
}
export class InterfaceDriver {
    ioWireCount(direction) {
        return 1;
    }
    ioWireLabels(direction) {
        return [""];
    }
}
