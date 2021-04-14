export class Bounds {
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
