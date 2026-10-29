import { GridTile, LayerInstance, LevelData } from "@shared/commonLevelModels"
import { Container, Rectangle, Sprite, Texture } from "pixi.js"
import {AnyEntityData, ServerButtonData, ServerButtonDoorData, ServerLaserEntityData} from "@shared/commonEntityData";
import { Ent } from "./Entities/Ent";
import { LaserEnt } from "./Entities/Laser";
import { JohnEnt } from "./Entities/JohnEnt";
import {BoorEnt} from "./Entities/Boor";
import {ButtonEnt} from "./Entities/Button";
import {PortalEnt} from "./Entities/Portal";

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
		this.clearLevel()

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

	reload() {
		this.clearLevel()
		this.renderLevel()
	}

	clearLevel() {
		let tile: Sprite | undefined
		while (tile = this.renderedTiles.pop()) {
			this.world.removeChild(tile)
		}
		for (const [id, ent] of Object.entries(this.ents)) {
			ent.beGone(this.world)
		}
		this.ents = {}
	}

	updateEnts(ents: Record<number, AnyEntityData>, deltaT: number) {
		for (const [entId, entData] of Object.entries(ents)) {
			if (entId in this.ents) {
				this.ents[Number(entId)].update(entData, deltaT)
			} else {
				let newEnt: Ent
				const sprite: Sprite = this.checkEntTexture(entData.type)

				switch (entData.type) {
					case "Laser":
						newEnt = new LaserEnt(entData as ServerLaserEntityData)
						break
					case "ButtonDoor":
						newEnt = new BoorEnt(entData as ServerButtonDoorData, sprite)
						break
					case "Button":
						newEnt = new ButtonEnt(entData as ServerButtonData, sprite)
						break
					case "Portal":
						newEnt = new PortalEnt(entData)
						break
					default:
						newEnt = new JohnEnt(entData, sprite)
						break
				}
				newEnt.update(entData, deltaT)
				newEnt.spawnIn(this.world)

				this.ents[Number(entId)] = newEnt
			}
		}

		if (Object.keys(ents) != Object.keys(this.ents)) {
			for (const entsKey in this.ents) {
				if (!Object.keys(ents).includes(entsKey)) this.ents[entsKey].beGone(this.world)
			}
		}
	}
}

export const leveler = new levelManager()