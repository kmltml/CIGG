export class Bounds {

  constructor(
    public min: {x: number, y: number},
    public max: {x: number, y: number}
  ) {}

  static fromPoints(points: {x: number, y: number}[]): Bounds {
    const min = {...points[0]}
    const max = {...points[0]}
    for (let i = 1; i < points.length; i++) {
      const { x, y } = points[i]
      if (x < min.x) min.x = x
      if (x > max.x) max.x = x
      if (y < min.y) min.y = y
      if (y > max.y) max.y = y
    }
    return new Bounds(min, max)
  }

  containsPoint(x: number, y: number): boolean {
    return x >= this.min.x && x <= this.max.x && y >= this.min.y && y <= this.max.y
  }

  addMargin(x: number, y: number = x): Bounds {
    return new Bounds(
      { x: this.min.x - x, y: this.min.y - y},
      { x: this.max.x + x, y: this.max.y + y}
    )
  }

}
