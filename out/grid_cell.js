export class EmptyCell {
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
