import { WORLD_CONFIG } from "@shared/commonVariables";
import {
	MapData,
	MapCollider,
	LayerInstance,
	EntityInstance,
	EntityType,
} from "@shared/commonMapModels";
import { Entity } from "./Entities/Entity";
import { Button } from "./Entities/Button";
import { LOG } from "../Logger";

export class Map {
	public readonly id: string; // its name
	private width: number = -1;
	private height: number = -1;
	private readonly intGrid: number[][];
	public readonly colliders: MapCollider[];
	public readonly entities: Entity[] = [];

	constructor(data: MapData) {
		this.id = data.identifier;
		this.intGrid = this.parseIntGrid(data);
		this.colliders = this.generateColliders();
		this.entities = this.parseEntities(data);
	}

	private parseEntities(data: MapData): Entity[] {
		const entities: Entity[] = [];

		data.layerInstances.forEach((layer: LayerInstance) => {
			if (layer.__type != "Entities") {
				return;
			}

			layer.entityInstances.forEach((entityData: EntityInstance) => {
				const entity: Entity = this.generateEntityType(entityData.__identifier);

				entity.pos = { x: entityData.__worldX, y: entityData.__worldY };
				entity.size = { x: entityData.width, y: entityData.height };

				entities.push(entity);
			});
		});

		return entities;
	}

	private generateEntityType(id: string) {
		//* Possibility of dividing cases into seperate methods if more setup needed.
		switch (id as EntityType) {
			case "JohnEntity":
				return new Entity();
			case "Button":
				return new Button();
			default:
				LOG.error(`Entity type not recognized / implemented (${id})`);
				throw Error(`Entity type not recognized / implemented (${id})`);
		}
	}

	private parseIntGrid(data: MapData): number[][] {
		let layer: LayerInstance | undefined;

		for (let i = 0; i < data.layerInstances.length; i++) {
			if (data.layerInstances[i].__type == "IntGrid") {
				layer = data.layerInstances[i];
			}
		}

		if (layer === undefined) {
			throw Error(`IntGrid layer not found in level: ${data.identifier}`);
		}

		this.width = layer.__cWid;
		this.height = layer.__cHei;

		const intGrid: number[][] = Array.from({ length: this.width }, () =>
			new Array(this.height).fill(0),
		);

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				intGrid[x][y] = layer.intGridCsv[y * this.width + x];
			}
		}

		return intGrid;
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

		console.log(colliders);

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

		// Scaling the intgrid to the real size
		return new MapCollider(
			startingX * WORLD_CONFIG.CELL_SIZE,
			startingY * WORLD_CONFIG.CELL_SIZE,
			width * WORLD_CONFIG.CELL_SIZE,
			height * WORLD_CONFIG.CELL_SIZE,
		);
	}
}
