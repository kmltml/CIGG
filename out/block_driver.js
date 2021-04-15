import { Direction } from "./grid";
import { NetState } from "./net";
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
    driveOutputs(nets) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const inputs = [];
        const addInput = (net) => {
            if (net === undefined) {
                return;
            }
            if (net.state === NetState.High) {
                inputs.push(true);
            }
            else if (net.state === NetState.Low) {
                inputs.push(false);
            }
        };
        addInput((_a = nets.get(Direction.North)) === null || _a === void 0 ? void 0 : _a[0]);
        addInput((_b = nets.get(Direction.East)) === null || _b === void 0 ? void 0 : _b[0]);
        addInput((_c = nets.get(Direction.South)) === null || _c === void 0 ? void 0 : _c[1]);
        addInput((_d = nets.get(Direction.West)) === null || _d === void 0 ? void 0 : _d[1]);
        const res = !inputs.every(x => x);
        (_f = (_e = nets.get(Direction.North)) === null || _e === void 0 ? void 0 : _e[1]) === null || _f === void 0 ? void 0 : _f.drive(res);
        (_h = (_g = nets.get(Direction.East)) === null || _g === void 0 ? void 0 : _g[1]) === null || _h === void 0 ? void 0 : _h.drive(res);
        (_k = (_j = nets.get(Direction.South)) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.drive(res);
        (_m = (_l = nets.get(Direction.West)) === null || _l === void 0 ? void 0 : _l[0]) === null || _m === void 0 ? void 0 : _m.drive(res);
    }
}
export class InterfaceDriver {
    constructor() {
        this.state = false;
    }
    ioWireCount(direction) {
        return 1;
    }
    ioWireLabels(direction) {
        return [""];
    }
    driveOutputs(nets) {
        for (let dir of nets.values()) {
            dir.forEach(net => net.drive(this.state));
        }
    }
}
