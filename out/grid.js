import { EmptyCell } from "./grid_cell";
export var Direction;
(function (Direction) {
    Direction["North"] = "North";
    Direction["East"] = "East";
    Direction["South"] = "South";
    Direction["West"] = "West";
})(Direction || (Direction = {}));
export class Grid {
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
