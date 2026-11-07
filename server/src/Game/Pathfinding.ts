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
		const neighbours: Node[] = [];
		for (let i = -1; i <= 1; i++) {
			for (let j = -1; j <= 1; j++) {
				if (i == 0 && j == 0) continue;

				const yIndex = i + node.y;
				const xIndex = j + node.x;

				if (this.canAgentFit(xIndex, yIndex, size)) neighbours.push(this.grid[yIndex][xIndex]);
			}
		}

		return neighbours;
	}

	public isTargetReached(
		agentPos: Vector2,
		agentSize: Vector2,
		targetPos: Vector2,
		targetSize: Vector2,
	): boolean {
		const overlapX =
			agentPos.x < targetPos.x + targetSize.x && agentPos.x + agentSize.x > targetPos.x;

		const overlapY =
			agentPos.y < targetPos.y + targetSize.y && agentPos.y + agentSize.y > targetPos.y;

		return overlapX && overlapY;
	}

	public canAgentFit(x: number, y: number, size: Vector2) {
		if (x < 0 || y < 0 || x + size.x > this.width || y + size.y > this.height) return false;

		for (let j = 0; j < size.y; j++) {
			for (let i = 0; i < size.x; i++) {
				if (this.grid[y + j][x + i].isWall) {
					return false;
				}
			}
		}

		return true;
	}

	public pathFind(start: Vector2, end: Vector2, startSize: Vector2, endSize: Vector2) {
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

			if (
				this.isTargetReached({ x: currentNode.x, y: currentNode.y }, startSize, end, endSize)
			) {
				const path = this.retrace(startNode, currentNode);

				this.paths.push(path);
				this.clearNodes();
				return path;
			}

			this.getNeighbours(currentNode, startSize).forEach((n) => {
				if (n.isWall || closedSet.includes(n)) {
					return;
				}

				const isDiagonal = n.x !== currentNode.x && n.y !== currentNode.y;
				const stepCost = isDiagonal ? 1.414 : 1;

				const newCost = currentNode.g + stepCost;

				if (newCost < n.g || !openSet.includes(n)) {
					n.g = newCost;
					n.h = this.getDistance({ x: n.x, y: n.y }, startSize, end, endSize);
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
				n.g = 0;
				n.h = 0;
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

	public getDistance(
		agentPos: Vector2,
		agentSize: Vector2,
		targetPos: Vector2,
		targetSize: Vector2,
	) {
		let dx = 0;

		if (agentPos.x + agentSize.x <= targetPos.x) {
			dx = targetPos.x - (agentPos.x + agentSize.x) + 1;
		} else if (agentPos.x >= targetPos.x + targetSize.x) {
			dx = agentPos.x - (targetPos.x + targetSize.x) + 1;
		}

		let dy = 0;

		if (agentPos.y + agentSize.y <= targetPos.y) {
			dy = targetPos.y - (agentPos.y + agentSize.y) + 1;
		} else if (agentPos.y >= targetPos.y + targetSize.y) {
			dy = agentPos.y - (targetPos.y + targetSize.y) + 1;
		}

		return dx + dy;
	}
}
