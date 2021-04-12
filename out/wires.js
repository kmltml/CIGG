import { Segment } from "./segment";
import { linspace } from "./utils";
import { LogicBlock } from "./logic_block";
import { Interconnect } from "./interconnect";
export class Wires {
    constructor(x, y, wireCount) {
        this.x = x;
        this.y = y;
        this.wireCount = wireCount;
        this.cellType = "wires";
        this.segments = [];
        this.switches = [];
        this.center = { x: 0, y: 0 };
        this.incomingSegments = [];
        this.incomingSegmentCoords = [];
    }
    initSegments(grid) {
        this.segments = Array.from({ length: this.wireCount }, () => new Segment());
        this.center = grid.displayCoords(this.x, this.y);
    }
    initSwitches(grid) {
    }
    draw(ctxt) { }
    arrangeIncoming() {
        if (this.incomingSegmentCoords.length == this.incomingSegments.length) {
            return this.incomingSegmentCoords;
        }
        else {
            this.incomingSegmentCoords =
                linspace(-LogicBlock.Size / 2, LogicBlock.Size / 2, this.incomingSegments.length + 2)
                    .slice(1, this.incomingSegments.length + 1);
            return this.incomingSegmentCoords;
        }
    }
    wireCoords() {
        return linspace(-Interconnect.Size / 2, Interconnect.Size / 2, this.wireCount + 2)
            .slice(1, this.wireCount + 1);
    }
}
