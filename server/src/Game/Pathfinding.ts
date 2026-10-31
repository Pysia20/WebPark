import { Vector2 } from "@shared/commonModels";

// Code heavly inspired by Sebastians League A* Pathfinding tutorial
// https://www.youtube.com/watch?v=mZfyt03LDH4&list=PLFt_AvWsXl0cq5Umv3pMC9SPnKjfp9eGW&index=4

export class Node {
	public g: number = 0; // Distance from start
	public h: number = 0; // Distance from end
	public type: "Start" | "End" | "Wall" | undefined;
	public parent: Node | undefined;
	public isInPath: boolean = false;

	public readonly f = () => this.g + this.h;

	constructor(
		public readonly x: number,
		public readonly y: number,
		public isWall: boolean,
	) {
		if (isWall) this.type = "Wall";
	}

	public draw() {
		if (this.type == undefined) return "[ ]";
		if (this.type == "Wall") return "[=]";
		if (this.type == "Start") return "[O]";
		if (this.type == "End") return "[X]";
	}
}

export class Grid {
	public grid: Node[][] = [];
	private start: Vector2 | undefined;
	private end: Vector2 | undefined;
	public path: Node[] = [];

	public genrateRandomGrid(x: number, y: number, start: Vector2, end: Vector2) {
		this.grid = [];

		this.start = { ...start };
		this.end = { ...end };

		for (let i = 0; i < y; i++) {
			this.grid.push([]);
			for (let j = 0; j < x; j++) {
				let isWall = Boolean(Math.round(Math.random() - 0.15));
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
				const node = this.grid[i][j];

				if (node.isInPath && node.type == undefined) {
					line += "[*]";
				} else {
					line += this.grid[i][j].draw();
				}
			}
			console.log(line);
		}
	}

	public getNeighbours(node: Node) {
		const neighbours: Node[] = [];
		for (let i = -1; i <= 1; i++) {
			for (let j = -1; j <= 1; j++) {
				if (i == 0 && j == 0) continue;

				const yIndex = i + node.y;
				const xIndex = j + node.x;

				if (yIndex < 0 || yIndex >= this.grid.length) continue;
				if (xIndex < 0 || xIndex >= this.grid[0].length) continue;
				if (this.grid[node.y][xIndex].isWall || this.grid[yIndex][node.x].isWall) continue;

				neighbours.push(this.grid[yIndex][xIndex]);
			}
		}

		return neighbours;
	}

	public pathFind() {
		const startNode = this.grid[this.start!.y][this.start!.x];
		const endNode = this.grid[this.end!.y][this.end!.x];

		const openSet: Node[] = []; // To be processed
		const closedSet: Node[] = []; // Already processed
		openSet.push(startNode);

		while (openSet.length > 0) {
			let currentNode = openSet[0];

			for (let i = 1; i < openSet.length; i++) {
				if (
					openSet[i].f() < currentNode.f() ||
					(openSet[i].f() == currentNode.f() && openSet[i].h < currentNode.h)
				) {
					currentNode = openSet[i];
				}
			}

			openSet.splice(openSet.indexOf(currentNode), 1);
			closedSet.push(currentNode);

			if (currentNode == endNode) {
				this.path = this.retrace(startNode, endNode);
				return;
			}

			this.getNeighbours(currentNode).forEach((n) => {
				if (n.isWall || closedSet.includes(n)) {
					return;
				}

				const newCost = currentNode.g + this.getDistance(currentNode, n);
				if (newCost < n.g || !openSet.includes(n)) {
					n.g = newCost;
					n.h = this.getDistance(n, endNode);
					n.parent = currentNode;

					if (!openSet.includes(n)) openSet.push(n);
				}
			});
		}
	}

	public retrace(start: Node, end: Node) {
		const path: Node[] = [];
		let currentNode: Node = end;

		while (currentNode != start) {
			path.push(currentNode);
			currentNode.isInPath = true;
			currentNode = currentNode.parent!;
		}

		return path.reverse();
	}

	public getDistance(a: Node, b: Node) {
		const x = Math.abs(a.x - b.x);
		const y = Math.abs(a.y - b.y);

		if (x > y) return 14 * y + 10 * (x - y);
		else return 14 * x + 10 * (y - x);
	}
}
