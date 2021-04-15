import { Segment } from './segment';
import { Switch } from './switch';
import { Direction } from './grid';
import { Bounds } from './bounds';
export class LogicBlock {
    constructor(x, y, driver) {
        this.x = x;
        this.y = y;
        this.driver = driver;
        this.cellType = "logic-block";
        this.segments = [];
        this.switches = [];
        this.connectingSegments = new Map();
        this.center = { x: 0, y: 0 };
        this.bounds = new Bounds({ x: 0, y: 0 }, { x: 0, y: 0 });
    }
    initSegments(grid) {
        this.center = grid.displayCoords(this.x, this.y);
        this.bounds = Bounds.fromPoints([this.center]).addMargin(LogicBlock.Size / 2);
        for (let dir of Object.keys(Direction)) {
            const cell = grid.neighbour(this.x, this.y, dir);
            if (cell.cellType == "wires") {
                const segments = Array.from({ length: this.driver.ioWireCount(dir) }, () => new Segment());
                cell.incomingSegments.push(...segments);
                this.segments.push(...segments);
                this.connectingSegments.set(dir, segments);
            }
        }
    }
    initSwitches(grid) {
        for (let dir of Object.keys(Direction)) {
            const cell = grid.neighbour(this.x, this.y, dir);
            if (cell.cellType == "wires") {
                const wires = cell;
                const coords = wires.arrangeIncoming();
                for (let seg of this.connectingSegments.get(dir)) {
                    const coord = coords[wires.incomingSegments.indexOf(seg)];
                    let pin = { x: 0, y: 0 };
                    switch (dir) {
                        case Direction.North:
                            pin = { x: coord, y: -LogicBlock.Size / 2 };
                            break;
                        case Direction.South:
                            pin = { x: coord, y: LogicBlock.Size / 2 };
                            break;
                        case Direction.West:
                            pin = { x: -LogicBlock.Size / 2, y: coord };
                            break;
                        case Direction.East:
                            pin = { x: LogicBlock.Size / 2, y: coord };
                            break;
                    }
                    pin.x += this.center.x;
                    pin.y += this.center.y;
                    this.switches.push(new Switch(pin.x, pin.y, [seg], "invisible"));
                    const wireCoords = wires.wireCoords();
                    wires.segments.forEach((wire, i) => {
                        let x = coord;
                        let y = wireCoords[i];
                        if (dir == Direction.West || dir == Direction.East) {
                            ;
                            [x, y] = [y, x];
                        }
                        const wiresCenter = grid.displayCoords(wires.x, wires.y);
                        this.switches.push(new Switch(x + wiresCenter.x, y + wiresCenter.y, [seg, wire]));
                    });
                }
            }
        }
    }
    draw(ctxt) {
        ctxt.strokeStyle = "black";
        ctxt.strokeRect(this.center.x - LogicBlock.Size / 2, this.center.y - LogicBlock.Size / 2, LogicBlock.Size, LogicBlock.Size);
        for (let dir of Object.keys(Direction).map(x => x)) {
            const wires = this.connectingSegments.get(dir);
            ctxt.textAlign = "center";
            ctxt.textBaseline = "middle";
            if (wires !== undefined) {
                const point = {
                    [Direction.North]: (s) => ({ x: s.x, y: this.center.y - LogicBlock.Size / 2 + LogicBlock.LabelPadding }),
                    [Direction.South]: (s) => ({ x: s.x, y: this.center.y + LogicBlock.Size / 2 - LogicBlock.LabelPadding }),
                    [Direction.West]: (s) => ({ x: this.center.x - LogicBlock.Size / 2 + LogicBlock.LabelPadding, y: s.y }),
                    [Direction.East]: (s) => ({ x: this.center.x + LogicBlock.Size / 2 - LogicBlock.LabelPadding, y: s.y })
                }[dir];
                const labels = this.driver.ioWireLabels(dir);
                labels.forEach((label, i) => {
                    const p = point(wires[i].switches.find(s => s.shape === "invisible"));
                    ctxt.fillText(label, p.x, p.y);
                });
            }
        }
    }
    update() {
        const nets = new Map();
        for (let dir of this.connectingSegments.keys()) {
            nets.set(dir, this.connectingSegments.get(dir).map(seg => seg.net));
        }
        this.driver.driveOutputs(nets);
    }
}
LogicBlock.Size = 90;
LogicBlock.WireMargin = 10;
LogicBlock.Padding = 40;
LogicBlock.LabelPadding = 10;
