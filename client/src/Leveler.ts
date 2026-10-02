import { GridTile, LayerInstance, LevelData } from "@shared/commonLevelModels";
import { Container, Rectangle, Sprite, Texture } from "pixi.js";

export class levelManager {
	levels: LevelData[];
	mapData: LevelData;
	world: Container;
	spriteSheet: Texture;
	textures: Map<number, Texture> = new Map();

	constructor(world: Container, sprites: Texture, levels: LevelData[]) {
		this.levels = levels;
		this.mapData = levels[0];
		this.world = world;
		this.spriteSheet = sprites;
	}

	checkTexture(tile: GridTile, layer: LayerInstance) {
		if (!this.textures.has(tile.t)) {
			const tileFrame = new Rectangle(
				tile.src[0],
				tile.src[1],
				layer.__gridSize,
				layer.__gridSize,
			);
			const tileTexture = new Texture({ source: this.spriteSheet.source, frame: tileFrame });
			this.textures.set(tile.t, tileTexture);
		}
		return this.textures.get(tile.t);
	}

	loadLevel(level: number) {
		this.mapData = this.levels[level];
	}

	renderLevel() {
		for (const layer of this.mapData.layerInstances.reverse()) {
			if (!layer.visible) continue;

			const tiles = layer.gridTiles.length > 0 ? layer.gridTiles : layer.autoLayerTiles;

			for (const tile of tiles) {
				const sprite = new Sprite(this.checkTexture(tile, layer));
				sprite.position.set(tile.px[0], tile.px[1]);
				this.world.addChild(sprite);
			}
		}
	}
}
