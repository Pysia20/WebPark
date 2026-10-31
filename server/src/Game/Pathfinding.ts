import { Vector2 } from "@shared/commonModels";

const mesh: boolean[][] = [
	[false, false, false, false],
	[false, false, false, false],
	[false, false, false, false],
	[false, false, false, false],
];

const start: Vector2 = { x: 0, y: 0 };
const end: Vector2 = { x: 3, y: 3 };

// interface Node {
//     f: number,
//     g: number,
//     h: number,
//     previous: Node,
//     isWall: boolean
// }

export class Node {
	public g: number = 0;
	public h: number = 0;
	public previous: Node | undefined;
	public type: "Start" | "End" | undefined;

	public readonly f = () => this.g + this.h;

	constructor(
		public readonly x: number,
		public readonly y: number,
		public isWall: boolean,
	) {}

	public draw() {
		if (this.type == undefined) return "[ ]";
		if (this.type == "Start") return "[O]";
		if (this.type == "End") return "[X]";
	}
}

export function aStar(a: Vector2, b: Vector2, mesh: boolean[]) {}

export class Grid {
	private grid: Node[][] = [];
	private start: Vector2 | undefined;
	private end: Vector2 | undefined;

	public genrateRandomGrid(x: number, y: number, start: Vector2, end: Vector2) {
		this.grid = [];

		this.start = { ...start };
		this.end = { ...end };

		for (let i = 0; i < y; i++) {
			this.grid.push([]);
			for (let j = 0; j < x; j++) {
				let isWall = Boolean(Math.round(Math.random()));
				let node = new Node(j, i, isWall);

				if (j == start.x && i == start.y) {
					node.isWall = false;
					node.type = "Start";
				}

				if (j == end.x && i == end.y) {
					node.isWall = false;
					node.type = "End";
				}

				this.grid[i][j] = node;
			}
		}
	}

	public print() {
		for (let i = 0; i < this.grid.length; i++) {
			let line = "";
			for (let j = 0; j < this.grid[i].length; j++) {
				line += this.grid[i][j].draw();
			}
			console.log(line);
		}
	}
}
