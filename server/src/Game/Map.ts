import el from "zod/v4/locales/el.cjs";
import he from "zod/v4/locales/he.cjs";

export interface MapData {
	identifier: string;
	uniqueIdentifer: string;
	x: number;
	y: number;
	width: number;
	height: number;
	bgColor: string;
	neighbourLevels: unknown[];
	layers: string[];
	entities: Record<string, MapEntity[]>;
}

export interface MapEntity {
	id: string;
	iid: string;
	layer: string;
	x: number;
	y: number;
	width: number;
	height: number;
	color: number;
}

export interface MapCollider {
	x: number;
	y: number;
	width: number;
	height: number;
}

export class Map {
	public readonly id: string; // its name
	public readonly width: number;
	public readonly height: number;
	private readonly intGrid: number[][];
	public readonly colliders: MapCollider[];

	constructor(data: MapData, intGrid: number[][]) {
		this.id = data.identifier;
		this.width = data.width;
		this.height = data.height;
		this.intGrid = intGrid;
		this.colliders = this.generateColliders();
	}
	/**
	 * Greedy meshing
	 */
	public generateColliders() {
		const colliders: MapCollider[] = [];

		const visited: boolean[][] = Array.from({ length: this.width }, () =>
			new Array(this.height).fill(false),
		);

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				if (visited[x][y] || this.intGrid[x][y] === 0) {
					continue;
				}

				colliders.push(this.generateCollider(x, y, visited));
			}
		}

		return colliders;
	}

	private generateCollider(
		startingX: number,
		startingY: number,
		visited: boolean[][],
	): MapCollider {
		let width = 0;

		while (
			startingX + width < this.width &&
			this.intGrid[startingX + width][startingY] !== 0 &&
			!visited[startingX + width][startingY]
		) {
			width++;
		}

		let height = 0;
		for (let y = startingY; y < this.height; y++) {
			let rowWidth = 0;
			for (let x = startingX; x < width + startingX; x++) {
				if (this.intGrid[x][y] !== 0 && !visited[x][y]) {
					rowWidth++;
				}
			}

			if (rowWidth == width) {
				height++;
			} else {
				break;
			}
		}

		for (let y = startingY; y < startingY + height; y++) {
			for (let x = startingX; x < startingX + width; x++) {
				visited[x][y] = true;
			}
		}

		return {
			x: startingX,
			y: startingY,
			width: width,
			height: height,
		};
	}
}
