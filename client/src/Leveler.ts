import { GridTile, LayerInstance, LevelData } from "@shared/commonLevelModels"
import { Container, Rectangle, Sprite, Texture } from "pixi.js"
import {ServerEntityData} from "@shared/commonModels";

interface entity {
	data: ServerEntityData
	sprite: Sprite
}

export class levelManager {
	levels: LevelData[]
	mapData: LevelData
	world: Container
	spriteSheet: Texture
	tileTextures: Map<number, Texture> = new Map()
	entTextures: Map<string, Texture>
	ents: Record<number, entity> = {}

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

	checkEntTexture(entName: string) {
		if (!this.entTextures.has(entName)) {
			const placeHolder = new Sprite(Texture.WHITE)
			placeHolder.tint = "#676767"
			console.log("MISSINGNO ENT: " + entName + "! using placeHolder")
			return placeHolder
		}
		return new Sprite(this.entTextures.get(entName))
	}

	loadLevel(level: number) {
		this.mapData = this.levels[level]
	}

	renderLevel() {
		for (const layer of this.mapData.layerInstances.slice().reverse()) {
			if (!layer.visible) continue

			const tiles = layer.gridTiles.length > 0 ? layer.gridTiles : layer.autoLayerTiles

			for (const tile of tiles) {
				const sprite = new Sprite(this.checkTileTexture(tile, layer))
				sprite.position.set(tile.px[0], tile.px[1])
				this.world.addChild(sprite)
			}
		}
	}

	updateEnts(ents: Record<number, ServerEntityData>) {
		for (const [entId, entData] of Object.entries(ents)) {
			if (entId in this.ents) {
				this.ents[Number(entId)].data = entData
				this.renderEnt(Number(entId))
			} else {
				this.ents[Number(entId)] = {data: entData} as entity
				this.renderEnt(Number(entId))
			}
		}
	}

	renderEnt(entId: number) {
		const ent = this.ents[entId]
		if (!ent.sprite) {
			ent.sprite = this.checkEntTexture(ent.data.type)
			this.world.addChild(ent.sprite)
		}

		ent.sprite.position.set(ent.data.pos.x, ent.data.pos.y)
		ent.sprite.setSize(ent.data.visualSize.x, ent.data.visualSize.y)
		//sprite.anchor.set(ent.__pivot[0],ent.__pivot[1]) not getting this from server rn and not sure if will need to
	}
}



/* SAVE
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
 */