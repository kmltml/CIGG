import { Segment } from "./segment";
import { Direction } from "./grid";
import { linspace } from "./utils";
import { Switch } from "./switch";
export class Interconnect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.cellType = "interconnect";
        this.segments = [];
        this.switches = [];
        this.width = 0;
        this.height = 0;
        this.wires = new Map();
        this.center = { x: 0, y: 0 };
        this.horzSegments = [];
        this.vertSegments = [];
    }
    initSegments(grid) {
        for (let dir of [Direction.East, Direction.West]) {
            const cell = grid.neighbour(this.x, this.y, dir);
            if (cell.cellType === "wires") {
                const wires = cell.wireCount;
                if (this.height !== 0 && this.height !== wires) {
                    throw `Incompatible wire sizes on two sides of an interconnect: ${this.height} and ${wires}`;
                }
                this.height = wires;
                this.wires.set(dir, cell);
            }
        }
        for (let dir of [Direction.North, Direction.South]) {
            const cell = grid.neighbour(this.x, this.y, dir);
            if (cell.cellType === "wires") {
                const wires = cell.wireCount;
                if (this.width !== 0 && this.width !== cell.wireCount) {
                    throw `Incompatible wire sizes on two sides of an interconnect: ${this.width} and ${wires}`;
                }
                this.width = wires;
                this.wires.set(dir, cell);
            }
        }
        this.center = grid.displayCoords(this.x, this.y);
        for (let x = 0; x < this.width; x++) {
            const segment = new Segment();
            this.segments.push(segment);
            this.vertSegments.push(segment);
        }
        for (let y = 0; y < this.width; y++) {
            const segment = new Segment();
            this.segments.push(segment);
            this.horzSegments.push(segment);
        }
    }
    initSwitches(grid) {
        const halfsize = Interconnect.Size / 2;
        const switchXs = linspace(this.center.x - halfsize, this.center.x + halfsize, this.width + 2);
        const switchYs = linspace(this.center.y - halfsize, this.center.y + halfsize, this.height + 2);
        for (let x = 0; x < this.width; x++) {
            if (this.wires.has(Direction.North)) {
                this.switches.push(new Switch(switchXs[x + 1], switchYs[0], [this.vertSegments[x], this.wires.get(Direction.North).segments[x]], "diamond"));
            }
            if (this.wires.has(Direction.South)) {
                this.switches.push(new Switch(switchXs[x + 1], switchYs[switchYs.length - 1], [this.vertSegments[x], this.wires.get(Direction.South).segments[x]], "diamond"));
            }
        }
        for (let y = 0; y < this.height; y++) {
            if (this.wires.has(Direction.West)) {
                this.switches.push(new Switch(switchXs[0], switchYs[y + 1], [this.horzSegments[y], this.wires.get(Direction.West).segments[y]], "diamond"));
            }
            if (this.wires.has(Direction.East)) {
                this.switches.push(new Switch(switchXs[switchXs.length - 1], switchYs[y + 1], [this.horzSegments[y], this.wires.get(Direction.East).segments[y]], "diamond"));
            }
        }
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.switches.push(new Switch(switchXs[x + 1], switchYs[y + 1], [this.horzSegments[y], this.vertSegments[x]]));
            }
        }
    }
    draw(ctxt) {
        ctxt.strokeStyle = "rgba(0, 0, 0, 0.4)";
        ctxt.strokeRect(this.center.x - Interconnect.Size / 2, this.center.y - Interconnect.Size / 2, Interconnect.Size, Interconnect.Size);
    }
}
Interconnect.Size = 80;
