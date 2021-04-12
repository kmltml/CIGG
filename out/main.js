import { Grid } from "./grid";
import { Interconnect } from "./interconnect";
import { LogicBlock } from "./logic_block";
import { Wires } from "./wires";
import { InterfaceDriver, LutDriver } from "./block_driver";
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('main-canvas');
    const ctxt = canvas.getContext('2d');
    const Dimensions = {
        LogicBlockSize: 90,
        LogicBlockWireMargin: 10,
        LogicBlockPadding: 40,
        WireDistance: 20,
        SwitchSize: 10
    };
    const WireCount = 2;
    function drawLogicBlock(x, y) {
        ctxt.strokeRect(x - Dimensions.LogicBlockSize / 2, y - Dimensions.LogicBlockSize / 2, Dimensions.LogicBlockSize, Dimensions.LogicBlockSize);
        for (let i = 0; i < 2; i++) {
            const margin = Dimensions.LogicBlockWireMargin + i * Dimensions.WireDistance;
            const offset = Dimensions.LogicBlockSize / 2 - margin;
            const wireLength = Dimensions.LogicBlockPadding + (WireCount - 1) * Dimensions.WireDistance;
            ctxt.moveTo(x - offset, y - Dimensions.LogicBlockSize / 2);
            ctxt.lineTo(x - offset, y - Dimensions.LogicBlockSize / 2 - wireLength);
            ctxt.stroke();
            for (let j = 0; j < WireCount; j++) {
                ctxt.beginPath();
                ctxt.arc(x - offset, y - Dimensions.LogicBlockSize / 2 - Dimensions.LogicBlockPadding - j * Dimensions.WireDistance, Dimensions.SwitchSize / 2, 0, 2 * Math.PI);
                ctxt.stroke();
            }
        }
    }
    const grid = new Grid(7, 7);
    for (let x = 0; x < grid.width; x++) {
        for (let y = 0; y < grid.width; y++) {
            if (x === 0 || y === 0 || x === grid.width - 1 || y === grid.height - 1) {
                if (((x === 0 || x === grid.width - 1) && y % 2 === 0) !== ((y === 0 || y === grid.height - 1) && x % 2 === 0)) {
                    grid.cells[x][y] = new LogicBlock(x, y, new InterfaceDriver());
                }
            }
            else if (x % 2 == 1 && y % 2 == 1) {
                grid.cells[x][y] = new Interconnect(x, y);
            }
            else if (x % 2 == 0 && y % 2 == 0) {
                grid.cells[x][y] = new LogicBlock(x, y, new LutDriver());
            }
            else {
                grid.cells[x][y] = new Wires(x, y, 3);
            }
        }
    }
    ;
    window.grid = grid;
    window.ctxt = ctxt;
    grid.foreach(cell => cell.initSegments(grid));
    grid.foreach(cell => cell.initSwitches(grid));
    const switches = [];
    const segments = [];
    window.switches = switches;
    grid.foreach(cell => {
        switches.push(...cell.switches);
        segments.push(...cell.segments);
    });
    function redraw() {
        ctxt.resetTransform();
        ctxt.clearRect(0, 0, canvas.width, canvas.height);
        ctxt.translate(100, 100);
        switches.forEach(s => s.draw(ctxt));
        switches.forEach(s => s.clearActive());
        switches.forEach(s => s.updateActive());
        segments.forEach(s => s.draw(ctxt));
        grid.foreach(cell => cell.draw(ctxt));
    }
    redraw();
    canvas.addEventListener("mousedown", e => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - 100;
        const y = e.clientY - rect.top - 100;
        for (let sw of switches) {
            if (sw.bounds.containsPoint(x, y)) {
                sw.state = !sw.state;
                window.lastSwitch = sw;
                redraw();
            }
        }
    });
});
