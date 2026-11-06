import { Vector2 } from "@shared/commonModels";
import { Level } from "./Level";
import { WORLD_CONFIG, PATHFINDING_SCALE, PATHFINDING_RESOLUTION } from "@shared/commonVariables";
import { PathfindingDebug } from "./PathfindingDebug";

// Code heavly inspired by Sebastians Lague A* Pathfinding tutorial
// https://www.youtube.com/watch?v=mZfyt03LDH4&list=PLFt_AvWsXl0cq5Umv3pMC9SPnKjfp9eGW&index=4

export class Node {
	public g: number = 0; // Distance from start
	public h: number = 0; // Distance from end
	public drawType: "Start" | "End" | "Wall" | undefined; // Purely visual when printing the grid, doesn't impact anything
	public type: "Player" | "Wall" | "Entity" | "Angel" | "Air" = "Air";
	public parent: Node | undefined; // If is a part of path, the preceding element
	public isInPath: boolean = false;

	public readonly f = () => this.g + this.h; // Suom of distances

	constructor(
		public readonly x: number,
		public readonly y: number,
		public isWall: boolean,
	) {
		if (isWall) this.drawType = "Wall";
	}

	public draw() {
		if (this.drawType == undefined) return "[ ]";
		if (this.drawType == "Wall") return "[=]";
		if (this.drawType == "Start") return "[O]";
		if (this.drawType == "End") return "[X]";
	}
}

export class Grid {
	public grid: Node[][] = [];
	public paths: Node[][] = [];
	public width = 0;
	public height = 0;
	private level: Level | undefined;

	public generateGridOfLevel(level: Level) {
		this.grid = [];

		this.width = level.width * PATHFINDING_SCALE;
		this.height = level.height * PATHFINDING_SCALE;
		this.level = level;

		for (let i = 0; i < this.height; i++) {
			this.grid.push([]);
			for (let j = 0; j < this.width; j++) {
				let node = new Node(j, i, false);
				this.grid[i][j] = node;
			}
		}

		// It would be possible to make it higher resolution, but im not sure if it would be efficient enough
		// I mean it could be optimized

		level.entities.forEach((e) => {
			const entityWidth = Math.round(e.size.x / PATHFINDING_RESOLUTION);
			let entityHeight = Math.round((e.size.y + 1) / PATHFINDING_RESOLUTION);

			if (e.type == "Player") entityHeight = 1 * PATHFINDING_SCALE;

			for (let i = 0; i < entityHeight; i++) {
				for (let j = 0; j < entityWidth; j++) {
					const entityX = Math.round(e.pos.x / PATHFINDING_RESOLUTION);
					const entityY = Math.round((e.pos.y - 1) / PATHFINDING_RESOLUTION);

					if (entityX < 0 || entityY < 0) continue;
					if (entityX + j >= this.width || entityY + i >= this.height) continue;

					const entityNode = this.grid[entityY + i][entityX + j];

					entityNode.isWall = !e.isPassable;
					if (e.type == "Player" || e.type == "WeepingAngel") entityNode.isWall = false;

					entityNode.type = "Entity";

					if (e.type == "WeepingAngel") entityNode.type = "Angel";
					if (e.type == "Player") entityNode.type = "Player";
					if (e.type == "MapCollider") entityNode.type = "Wall";
				}
			}
		});

		if (PathfindingDebug) {
			PathfindingDebug.notifyChange(this.level?.room.getID()!);
		}

		this.paths = [];
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

				if (node.isInPath && node.drawType == undefined) {
					line += "[*]";
				} else {
					line += this.grid[i][j].draw();
				}
			}
			console.log(line);
		}
	}

	public getNeighbours(node: Node, size: Vector2) {
		const tempNeighbours: Node[] = [];
		for (let i = -1; i <= size.y; i++) {
			for (let j = -1; j <= size.x; j++) {
				if (i == 0 && j == 0) continue;

				if (j != -1 && j != size.x && i != -1 && j != size.x) continue;

				const yIndex = i + node.y;
				const xIndex = j + node.x;

				if (yIndex < 0 || yIndex >= this.grid.length) continue;
				if (xIndex < 0 || xIndex >= this.grid[0].length) continue;

				if (this.grid[node.y][xIndex].isWall || this.grid[yIndex][node.x].isWall) continue;

				if (i != 0 && j != 0) {
					// Corner cutting fix
					if (this.grid[yIndex][node.x].isWall || this.grid[node.y][xIndex].isWall) continue;
				}

				tempNeighbours.push(this.grid[yIndex][xIndex]);
			}
		}

		// This also caused memory leak

		const neighbours: Node[] = [];

		// // Continous collision check
		// tempNeighbours.forEach((n) => {
		// 	let isOK = true;
		// 	for (let j = 0; j < size.y; j++) {
		// 		for (let i = 0; i < size.x; i++) {
		// 			const isXInBound = n.x + i < this.width;
		// 			const isYInBound = n.y - j < this.height;

		// 			if (!isXInBound || !isYInBound) continue;

		// 			if (this.grid[n.y - j][n.x + i].isWall) {
		// 				isOK = false;
		// 				break;
		// 			}
		// 		}
		// 		if (!isOK) break;
		// 	}

		// 	if (isOK) neighbours.push(n);
		// });

		return tempNeighbours;
	}

	public pathFind(start: Vector2, end: Vector2, startSize: Vector2) {
		// start.x *= PATHFINDING_SCALE;
		// start.y *= PATHFINDING_SCALE;
		// end.x *= PATHFINDING_SCALE;
		// end.y *= PATHFINDING_SCALE;
		// startSize.x *= PATHFINDING_SCALE;
		// startSize.y *= PATHFINDING_SCALE;

		if (start.x < 0 || start.x >= this.width) return;
		if (start.y < 0 || start.y >= this.height) return;
		if (end.x < 0 || end.x >= this.width) return;
		if (end.y < 0 || end.y >= this.height) return;

		const startNode = this.grid[start.y][start.x];
		const endNode = this.grid[end.y][end.x];

		startNode.drawType = "Start";
		startNode.isWall = false;
		endNode.drawType = "End";
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
				const path = this.retrace(startNode, endNode);

				this.paths.push(path);
				this.clearNodes();
				return path;
			}

			this.getNeighbours(currentNode, startSize).forEach((n) => {
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

	public clearNodes() {
		this.grid.forEach((row) => {
			row.forEach((n) => {
				n.isInPath = false;
				n.parent = undefined;
			});
		});
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
