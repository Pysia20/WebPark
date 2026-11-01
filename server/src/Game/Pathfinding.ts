import { Vector2 } from "@shared/commonModels";
import { Level } from "./Level";

// Code heavly inspired by Sebastians Lague A* Pathfinding tutorial
// https://www.youtube.com/watch?v=mZfyt03LDH4&list=PLFt_AvWsXl0cq5Umv3pMC9SPnKjfp9eGW&index=4

export class Node {
	public g: number = 0; // Distance from start
	public h: number = 0; // Distance from end
	public type: "Start" | "End" | "Wall" | undefined; // Purely visual when printing the grid, doesn't impact anything
	public parent: Node | undefined; // If is a part of path, the preceding element
	public isInPath: boolean = false;

	public readonly f = () => this.g + this.h; // Suom of distances

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
	public path: Node[] = [];

	public generateGridOfLevel(level: Level) {
		this.grid = [];

		const width = level.width;
		const height = level.height;

		for (let i = 0; i < height; i++) {
			this.grid.push([]);
			for (let j = 0; j < width; j++) {
				let node = new Node(j, i, false);
				this.grid[i][j] = node;
			}
		}

		// It would be possible to make it higher resolution, but im not sure if it would be efficient enough
		// I mean it could be optimized

		level.entities.forEach((e) => {
			const entityWidth = Math.round(e.size.x / 64);
			let entityHeight = Math.round(e.size.y / 64);

			if (e.type == "Player") entityHeight = 1;

			for (let i = 0; i < entityHeight; i++) {
				for (let j = 0; j < entityWidth; j++) {
					const entityX = Math.round(e.pos.x / 64);
					const entityY = Math.round(e.pos.y / 64);

					const entityNode = this.grid[entityY + i][entityX + j];

					entityNode.isWall = !e.isPassable;
					if (e.type == "Player" || e.type == "WeepingAngel") entityNode.isWall = false;
					if (entityNode.isWall) {
						entityNode.type = "Wall";
					}

					// if (e.type == "WeepingAngel") {
					// 	entityNode.type = "Start";
					// }
					// if (e.type == "Player") {
					// 	entityNode.type = "End";
					// }
				}
			}
		});
	}

	public genrateRandomGrid(x: number, y: number) {
		this.grid = [];

		for (let i = 0; i < y; i++) {
			this.grid.push([]);
			for (let j = 0; j < x; j++) {
				let isWall = Boolean(Math.round(Math.random() - 0.15));
				let node = new Node(j, i, isWall);

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

				if (i != 0 && j != 0) {
					// Corner cutting fix
					if (this.grid[yIndex][node.x].isWall || this.grid[node.y][xIndex].isWall) continue;
				}

				neighbours.push(this.grid[yIndex][xIndex]);
			}
		}

		return neighbours;
	}

	public pathFind(start: Vector2, end: Vector2) {
		const startNode = this.grid[start.y][start.x];
		const endNode = this.grid[end.y][end.x];

		startNode.type = "Start";
		startNode.isWall = false;
		endNode.type = "End";
		endNode.isWall = false;

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
				this.print();
				return this.path;
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
