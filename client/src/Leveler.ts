import { EntityInstance, GridTile, LayerInstance, LevelData } from "@shared/commonLevelModels"
import { Container, Rectangle, Sprite, Texture } from "pixi.js"

export class levelManager {
	levels: LevelData[]
	mapData: LevelData
	world: Container
	spriteSheet: Texture
	tileTextures: Map<number, Texture> = new Map()
	entTextures: Map<string, Texture>

	constructor(world: Container, spriteSheet: Texture, levels: LevelData[], entTextures: Map<string, Texture>) {
		this.levels = levels
		this.mapData = levels[0]
		this.world = world
		this.spriteSheet = spriteSheet
		this.entTextures = entTextures
	}

	checkTileTexture(tile: GridTile, layer: LayerInstance) {
		if (!this.tileTextures.has(tile.t)) {
			const tileFrame = new Rectangle(
				tile.src[0],
				tile.src[1],
				layer.__gridSize,
				layer.__gridSize,
			);
			const tileTexture = new Texture({ source: this.spriteSheet.source, frame: tileFrame })
			this.tileTextures.set(tile.t, tileTexture)
		}
		return this.tileTextures.get(tile.t)
	}

	checkEntTexture(ent: EntityInstance) {
		if (!this.entTextures.has(ent.__identifier)) {
			const placeHolder = new Sprite(Texture.WHITE)
			placeHolder.tint = "#676767"
			return placeHolder
		}
		return new Sprite(this.entTextures.get(ent.__identifier))
	}

	loadLevel(level: number) {
		this.mapData = this.levels[level]
	}

	renderLevel() {
		for (const layer of this.mapData.layerInstances.slice().reverse()) {
			if (!layer.visible) continue

			if (layer.entityInstances.length > 0) {
				const ents = layer.entityInstances

				for (const ent of ents) {
					const sprite = this.checkEntTexture(ent)
					sprite.position.set(ent.px[0], ent.px[1])
					sprite.setSize(ent.width, ent.height)
					sprite.anchor.set(ent.__pivot[0],ent.__pivot[1])
					this.world.addChild(sprite)
				}
			} else {
				const tiles = layer.gridTiles.length > 0 ? layer.gridTiles : layer.autoLayerTiles

				for (const tile of tiles) {
					const sprite = new Sprite(this.checkTileTexture(tile, layer))
					sprite.position.set(tile.px[0], tile.px[1])
					this.world.addChild(sprite)
				}
			}

		}
	}
}
