import { GridCell, EmptyCell } from "./grid_cell"

export enum Direction {
  North = "North",
  East = "East",
  South = "South",
  West = "West"
}

export class Grid {

  cells: GridCell[][]

  constructor(public width: number, public height: number) {
    this.cells = new Array(width)
    for (let i = 0; i < width; i++) {
      this.cells[i] = new Array(height)
      for (let j = 0; j < height; j++) {
        this.cells[i][j] = new EmptyCell(i, j)
      }
    }
  }

  getCell(x: number, y: number) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return new EmptyCell(x, y)
    } else {
      return this.cells[x][y]
    }
  }

  neighbour(x: number, y: number, dir: Direction): GridCell {
    switch(dir) {
      case Direction.North:
        y--
        break
      case Direction.South:
        y++
        break
      case Direction.West:
        x--
        break
      case Direction.East:
        x++
        break
    }
    return this.getCell(x, y)
  }

  north(x: number, y: number): GridCell {
    return this.neighbour(x, y, Direction.North)
  }

  west(x: number, y: number): GridCell {
    return this.neighbour(x, y, Direction.West)
  }

  south(x: number, y: number): GridCell {
    return this.neighbour(x, y, Direction.South)
  }

  east(x: number, y: number): GridCell {
    return this.neighbour(x, y, Direction.East)
  }

  displayCoords(x: number, y: number): { x: number, y: number } {
    return {x: x * 100, y: y * 100}
  }

  foreach(f: (cell: GridCell, x: number, y: number) => void): void {
    for (let x = this.width - 1; x >= 0; x--) {
      for (let y = 0; y < this.height; y++) {
        f(this.cells[x][y], x, y)
      }
    }
  }


}
