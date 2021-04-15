(function () {
    'use strict';

    class EmptyCell {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.cellType = "empty";
            this.segments = [];
            this.switches = [];
        }
        initSegments() { }
        initSwitches() { }
        draw() { }
    }

    var Direction;
    (function (Direction) {
        Direction["North"] = "North";
        Direction["East"] = "East";
        Direction["South"] = "South";
        Direction["West"] = "West";
    })(Direction || (Direction = {}));
    class Grid {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.cells = new Array(width);
            for (let i = 0; i < width; i++) {
                this.cells[i] = new Array(height);
                for (let j = 0; j < height; j++) {
                    this.cells[i][j] = new EmptyCell(i, j);
                }
            }
        }
        getCell(x, y) {
            if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
                return new EmptyCell(x, y);
            }
            else {
                return this.cells[x][y];
            }
        }
        neighbour(x, y, dir) {
            switch (dir) {
                case Direction.North:
                    y--;
                    break;
                case Direction.South:
                    y++;
                    break;
                case Direction.West:
                    x--;
                    break;
                case Direction.East:
                    x++;
                    break;
            }
            return this.getCell(x, y);
        }
        north(x, y) {
            return this.neighbour(x, y, Direction.North);
        }
        west(x, y) {
            return this.neighbour(x, y, Direction.West);
        }
        south(x, y) {
            return this.neighbour(x, y, Direction.South);
        }
        east(x, y) {
            return this.neighbour(x, y, Direction.East);
        }
        displayCoords(x, y) {
            return { x: x * 100, y: y * 100 };
        }
        foreach(f) {
            for (let x = this.width - 1; x >= 0; x--) {
                for (let y = 0; y < this.height; y++) {
                    f(this.cells[x][y], x, y);
                }
            }
        }
    }

    var NetState;
    (function (NetState) {
        NetState[NetState["Floating"] = 0] = "Floating";
        NetState[NetState["Low"] = 1] = "Low";
        NetState[NetState["High"] = 2] = "High";
        NetState[NetState["Error"] = 3] = "Error";
    })(NetState || (NetState = {}));
    class Net {
        constructor(segments) {
            this.segments = segments;
            this.highlighted = false;
            this.state = NetState.Floating;
            this.nextState = NetState.Floating;
            segments.forEach(seg => seg.net = this);
        }
        static buildNets(segments) {
            const nets = [];
            const remainingSegments = new Set(segments);
            const visit = (seg, visited) => {
                if (visited.has(seg)) {
                    return visited;
                }
                visited.add(seg);
                seg.switches
                    .filter(sw => sw.state)
                    .flatMap(sw => sw.segments)
                    .forEach(seg => visit(seg, visited));
                return visited;
            };
            while (remainingSegments.size != 0) {
                const seed = remainingSegments.values().next().value;
                const segs = visit(seed, new Set());
                segs.forEach(s => remainingSegments.delete(s));
                const net = new Net(Array.from(segs));
                nets.push(net);
            }
            return nets;
        }
        drive(high) {
            const state = high ? NetState.High : NetState.Low;
            if (this.nextState === NetState.Floating) {
                this.nextState = state;
            }
            else if ((this.nextState === NetState.High ||
                this.nextState === NetState.Low) &&
                this.nextState !== state) {
                this.nextState = NetState.Error;
            }
        }
        simulationStart() {
            this.state = this.nextState = NetState.Floating;
        }
        update() {
            this.state = this.nextState;
            this.nextState = NetState.Floating;
        }
    }

    class Bounds {
        constructor(min, max) {
            this.min = min;
            this.max = max;
        }
        static fromPoints(points) {
            const min = { ...points[0] };
            const max = { ...points[0] };
            for (let i = 1; i < points.length; i++) {
                const { x, y } = points[i];
                if (x < min.x)
                    min.x = x;
                if (x > max.x)
                    max.x = x;
                if (y < min.y)
                    min.y = y;
                if (y > max.y)
                    max.y = y;
            }
            return new Bounds(min, max);
        }
        containsPoint(x, y) {
            return x >= this.min.x && x <= this.max.x && y >= this.min.y && y <= this.max.y;
        }
        addMargin(x, y = x) {
            return new Bounds({ x: this.min.x - x, y: this.min.y - y }, { x: this.max.x + x, y: this.max.y + y });
        }
    }

    class Segment {
        constructor() {
            this.switches = [];
            this.points = [];
            this.net = undefined;
            this.bounds = new Bounds({ x: 0, y: 0 }, { x: -1, y: -1 });
        }
        isActive() {
            return this.switches.some(sw => sw.state && sw.shape !== "diamond");
        }
        draw(ctxt, state) {
            var _a;
            if ((_a = this.net) === null || _a === void 0 ? void 0 : _a.highlighted) {
                ctxt.lineWidth = 3;
            }
            else {
                ctxt.lineWidth = 1;
            }
            if (state.running) {
                this.drawRunning(ctxt);
            }
            else {
                this.drawDesign(ctxt);
            }
            ctxt.strokeStyle = "black";
            ctxt.lineWidth = 1;
        }
        drawRunning(ctxt) {
            const activePoints = this.points.filter(p => {
                if (p.state === undefined) {
                    return true;
                }
                if (p.state) {
                    if (p.shape !== "diamond") {
                        return true;
                    }
                    else {
                        return p.activeFor(this);
                    }
                }
            });
            let color = "";
            switch (this.net.state) {
                case NetState.Floating:
                    color = "#3870a8";
                    break;
                case NetState.Low:
                    color = "#808080";
                    break;
                case NetState.High:
                    color = "#000000";
                    break;
                case NetState.Error:
                    color = "#bd2600";
                    break;
            }
            this.drawPoints(ctxt, activePoints, color);
        }
        drawDesign(ctxt) {
            const points = this.points.filter(sw => sw.state || sw.shape !== "diamond");
            const activePoints = points.filter(p => {
                if (p.state === undefined) {
                    return true;
                }
                if (p.state) {
                    if (p.shape !== "diamond") {
                        return true;
                    }
                    else {
                        return p.activeFor(this);
                    }
                }
            });
            if (activePoints.length != 0) {
                this.drawPoints(ctxt, activePoints, "rgba(0, 0, 0, 1.0)");
                const inactiveBefore = points.slice(0, points.indexOf(activePoints[0]) + 1)
                    .filter(sw => sw.state || sw.shape !== "diamond");
                this.drawPoints(ctxt, inactiveBefore, "rgba(0, 0, 0, 0.3)");
                const inactiveAfter = points.slice(points.indexOf(activePoints[activePoints.length - 1]))
                    .filter(sw => sw.state || sw.shape !== "diamond");
                this.drawPoints(ctxt, inactiveAfter, "rgba(0, 0, 0, 0.3)");
            }
            else {
                this.drawPoints(ctxt, points.filter(sw => sw.state || sw.shape !== "diamond"), "rgba(0, 0, 0, 0.3)");
            }
        }
        drawPoints(ctxt, points, color) {
            if (points.length <= 1) {
                return;
            }
            ctxt.strokeStyle = color;
            ctxt.beginPath();
            ctxt.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctxt.lineTo(points[i].x, points[i].y);
            }
            ctxt.stroke();
        }
        addSwitch(sw) {
            if (this.switches.includes(sw)) {
                return;
            }
            this.switches.push(sw);
            this.points.push(sw);
            this.resortPoints();
            this.bounds = Bounds.fromPoints(this.points).addMargin(2);
            console.log(this.bounds);
        }
        resortPoints() {
            if (this.points.length <= 1) {
                return;
            }
            this.points.sort((a, b) => (a.x == b.x) ? a.y - b.y : a.x - b.x);
        }
    }

    function linspace(a, b, n) {
        const incr = (b - a) / (n - 1);
        return Array.from({ length: n }, (_, i) => a + i * incr);
    }

    class Switch {
        constructor(x, y, segments, shape = 'circle') {
            this.x = x;
            this.y = y;
            this.segments = segments;
            this.shape = shape;
            this.state = false;
            this.activeEdges = new Map();
            segments.forEach(s => s.addSwitch(this));
            if (shape === "diamond" || shape === "invisible") {
                this.state = true;
            }
            if (shape === "invisible") {
                this.bounds = new Bounds(// Impossible bounds
                { x: 0, y: 0 }, { x: -1, y: -1 });
            }
            else {
                this.bounds = new Bounds({ x: x - Switch.Radius, y: y - Switch.Radius }, { x: x + Switch.Radius, y: y + Switch.Radius });
            }
        }
        draw(ctxt) {
            if (this.shape === "invisible") {
                return;
            }
            switch (this.shape) {
                case "circle":
                    ctxt.beginPath();
                    ctxt.arc(this.x, this.y, Switch.Radius, 0, 360);
                    break;
                case "diamond":
                    ctxt.beginPath();
                    ctxt.moveTo(this.x - Switch.Radius, this.y);
                    ctxt.lineTo(this.x, this.y - Switch.Radius);
                    ctxt.lineTo(this.x + Switch.Radius, this.y);
                    ctxt.lineTo(this.x, this.y + Switch.Radius);
                    ctxt.closePath();
                    break;
            }
            ctxt.stroke();
            if (this.state) {
                ctxt.fill();
            }
        }
        clearActive() {
            this.activeEdges.clear();
        }
        findActivePath(leadingSegment, visited) {
            if (!this.state) {
                return false;
            }
            if (visited.has(this)) {
                return false;
            }
            if (this.segments.some(s => s !== leadingSegment && s.isActive())) {
                return true;
            }
            visited.add(this);
            for (let seg of this.segments) {
                if (seg === leadingSegment) {
                    continue;
                }
                if (this.activeEdges.get(seg)) {
                    return true;
                }
                for (let sw of seg.switches) {
                    if (sw.shape === "diamond" && sw.state) {
                        if (sw.findActivePath(seg, visited)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        updateActive() {
            if (this.shape !== "diamond" || !this.state) {
                return;
            }
            outer: for (let segment of this.segments) {
                if (!this.activeEdges.has(segment)) {
                    if (segment.isActive()) {
                        this.activeEdges.set(segment, true);
                        continue;
                    }
                    for (let sw of segment.switches) {
                        if (sw.shape === "diamond" && sw !== this) {
                            if (sw.findActivePath(segment, new Set([this]))) {
                                this.activeEdges.set(segment, true);
                                continue outer;
                            }
                        }
                    }
                    this.activeEdges.set(segment, false);
                }
            }
        }
        activeFor(segment) {
            if (!this.activeEdges.get(segment)) {
                return false;
            }
            return [...this.activeEdges.values()].filter(x => x).length >= 2;
        }
    }
    Switch.Radius = 5;

    class Interconnect {
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

    class LogicBlock {
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

    class Wires {
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

    class LutDriver {
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
    class InterfaceDriver {
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

    class SimulationState {
        constructor() {
            this.running = false;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const canvas = document.getElementById('main-canvas');
        const ctxt = canvas.getContext('2d');
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
        window.grid = grid;
        window.ctxt = ctxt;
        grid.foreach(cell => cell.initSegments(grid));
        grid.foreach(cell => cell.initSwitches(grid));
        const switches = [];
        const segments = [];
        let highlightedNet = undefined;
        window.switches = switches;
        grid.foreach(cell => {
            switches.push(...cell.switches);
            segments.push(...cell.segments);
        });
        let nets = Net.buildNets(segments);
        let simstate = new SimulationState();
        function redraw() {
            ctxt.resetTransform();
            ctxt.clearRect(0, 0, canvas.width, canvas.height);
            ctxt.translate(100, 100);
            switches.forEach(s => {
                if ((s.state && s.shape !== "diamond") || !simstate.running) {
                    s.draw(ctxt);
                }
            });
            switches.forEach(s => s.clearActive());
            switches.forEach(s => s.updateActive());
            segments.forEach(s => s.draw(ctxt, simstate));
            grid.foreach(cell => cell.draw(ctxt));
        }
        redraw();
        canvas.addEventListener("mousemove", e => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left - 100;
            const y = e.clientY - rect.top - 100;
            for (let seg of segments) {
                if (seg.bounds.containsPoint(x, y)) {
                    if (seg.net !== highlightedNet) {
                        if (highlightedNet !== undefined) {
                            highlightedNet.highlighted = false;
                        }
                        highlightedNet = seg.net;
                        if (highlightedNet !== undefined) {
                            highlightedNet.highlighted = true;
                        }
                        redraw();
                    }
                    return;
                }
            }
            if (highlightedNet !== undefined) {
                highlightedNet.highlighted = false;
                highlightedNet = undefined;
                redraw();
            }
        });
        canvas.addEventListener("mousedown", e => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left - 100;
            const y = e.clientY - rect.top - 100;
            grid.foreach(cell => {
                if (cell instanceof LogicBlock && cell.bounds.containsPoint(x, y)) {
                    if (cell.driver instanceof InterfaceDriver) {
                        cell.driver.state = !cell.driver.state;
                    }
                }
            });
            for (let sw of switches) {
                if (sw.bounds.containsPoint(x, y)) {
                    sw.state = !sw.state;
                    window.lastSwitch = sw;
                    nets = Net.buildNets(segments);
                    redraw();
                }
            }
        });
        document.addEventListener("keydown", e => {
            if (e.key === " ") {
                simstate.running = !simstate.running;
                nets.forEach(net => net.simulationStart());
                redraw();
            }
            else if (simstate.running && e.key === "s") {
                grid.foreach(cell => {
                    if (cell instanceof LogicBlock) {
                        cell.update();
                    }
                });
                nets.forEach(net => net.update());
                redraw();
            }
        });
    });

}());
