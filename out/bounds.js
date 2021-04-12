export class Bounds {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
    containsPoint(x, y) {
        return x >= this.min.x && x <= this.max.x && y >= this.min.y && y <= this.max.y;
    }
}
