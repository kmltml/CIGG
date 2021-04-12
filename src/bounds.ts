export class Bounds {

  constructor(
    public min: {x: number, y: number},
    public max: {x: number, y: number}
  ) {}

  containsPoint(x: number, y: number): boolean {
    return x >= this.min.x && x <= this.max.x && y >= this.min.y && y <= this.max.y
  }

}
