import { Texture, Assets } from "pixi.js"
import { LevelData } from "@shared/commonLevelModels"
import level0 from "@shared/maps/Level_0.json"

export interface PlayerTextures {
	torso: Texture
}

export interface MapAssets {
	spritesheet: Texture
	levels: LevelData[]
	entTextures: Map<string, Texture>
}

export interface GameAssets {
	playerTextures: PlayerTextures
	mapAssets: MapAssets
}

export async function loadAssets() {
	const loadedAssets = await Assets.load([
		"spritesheets/placeholderSpritesheet.png",
		"sprites/keyPlaceholder.png",
		"sprites/JohnEntity.png",
		"sprites/Door.png",
		"sprites/Button.png",
		"sprites/torso.png"
	]);

	//player asstes
	const playerTorso: Texture = loadedAssets["sprites/torso.png"]
	const playerTextures: PlayerTextures = { torso: playerTorso }

	//map assets
	const mapSpritesheet: Texture = loadedAssets["spritesheets/placeholderSpritesheet.png"]
	const mapLevels: LevelData[] = [level0 as LevelData]
	const entTextures: Map<string, Texture> = new Map()
	entTextures.set("Key", loadedAssets["sprites/keyPlaceholder.png"])
	entTextures.set("Door", loadedAssets["sprites/Door.png"])
	entTextures.set("Button", loadedAssets["sprites/Button.png"])
	entTextures.set("JohnEntity", loadedAssets["sprites/JohnEntity.png"])
	const mapAssets: MapAssets = { spritesheet: mapSpritesheet, levels: mapLevels, entTextures: entTextures }

	const assets: GameAssets = { playerTextures: playerTextures, mapAssets: mapAssets }
	return assets;
}
