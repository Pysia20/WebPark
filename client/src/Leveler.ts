import { GridTile, LayerInstance, LevelData } from "@shared/commonLevelModels"
import { Container, Rectangle, Sprite, Texture } from "pixi.js"
import { AnyEntityData, ServerButtonData, ServerButtonDoorData } from "@shared/commonEntityData";
import { Ent } from "./Entities/Ent";
import {Laser} from "./Entities/Laser";

class levelManager {
	levels!: Map<string, LevelData>
	mapData!: LevelData
	world!: Container
	spriteSheet!: Texture
	tileTextures: Map<number, Texture> = new Map()
	entTextures: Map<string, Texture> = new Map()
	ents: Record<number, Ent> = {}
	renderedTiles: Sprite[] = []

	init(world: Container, spriteSheet: Texture, levels: Map<string, LevelData>, entTextures: Map<string, Texture>) {
		this.levels = levels
		if (this.levels.has("Level_0")) {
			this.mapData = levels.get("Level_0") as LevelData
		} else {
			console.log("WEWOWEWO NO LEVEL 0 FOUND!!!?!")
		}
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

	loadLevel(level: string | undefined) {
		let tile: Sprite | undefined
		while (tile = this.renderedTiles.pop()) {
			this.world.removeChild(tile)
		}
		for (const [id, ent] of Object.entries(this.ents)) {
			this.world.removeChild(ent.sprite)
		}
		this.ents = {}

		if (level == undefined) {
			console.log("NO MORE LEVELS!")
			return
		}

		if (this.levels.has(level)) {
			this.mapData = this.levels.get(level)!
			this.renderLevel()
		} else {
			console.log("LEVEL: " + level + " NOT FOUND ON CLIENT")
		}
	}

	renderLevel() {
		for (const layer of this.mapData.layerInstances.slice().reverse()) {
			if (!layer.visible) continue

			const tiles = layer.gridTiles.length > 0 ? layer.gridTiles : layer.autoLayerTiles

			for (const tile of tiles) {
				const sprite = new Sprite(this.checkTileTexture(tile, layer))
				sprite.position.set(tile.px[0], tile.px[1])
				this.world.addChild(sprite)
				this.renderedTiles.push(sprite)
			}
		}
	}

	updateEnts(ents: Record<number, AnyEntityData>) {
		for (const [entId, entData] of Object.entries(ents)) {
			if (entId in this.ents) {
				this.ents[Number(entId)].data = entData
				this.renderEnt(Number(entId))
			} else {
				let newEnt: Ent

				switch (entData.type) {
					case "Laser":
						newEnt = new Laser()
					default:
						break
				}

				this.ents[Number(entId)] = new Ent()
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

		switch (ent.data.type) {
			case "ButtonDoor":
				const doorData = ent.data as ServerButtonDoorData
				ent.sprite.alpha = doorData.isOpen ? 0.1 : 1
				break
			case "Button":
				const buttonData = ent.data as ServerButtonData
				ent.sprite.alpha = buttonData.isPressed ? 0.5 : 1
				break
			case "Laser":

			default:
				break
		}
	}
}

export const leveler = new levelManager()