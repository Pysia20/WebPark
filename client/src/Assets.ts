import { Texture, Assets } from "pixi.js"
import { LevelData } from "@shared/commonLevelModels"
import level0 from "@shared/maps/Level_0.json"

export interface PlayerTextures {
	idle: Texture
	walk: Texture
	jump: Texture
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
		"sprites/farmerThatDoesHarvestingWoahLookTHatsTheThemeFRFR.png",
		"sprites/playerPlaceholderWalk.png",
		"sprites/playerPlaceholderJump.png",
		"spritesheets/placeholderSpritesheet.png",
		"sprites/keyPlaceholder.png"
	]);

	//player asstes
	const playerIdle: Texture = loadedAssets["sprites/farmerThatDoesHarvestingWoahLookTHatsTheThemeFRFR.png"]
	const playerWalk: Texture = loadedAssets["sprites/playerPlaceholderWalk.png"]
	const playerJump: Texture = loadedAssets["sprites/playerPlaceholderJump.png"]
	const playerTextures: PlayerTextures = { idle: playerIdle, walk: playerWalk, jump: playerJump }

	//map assets
	const mapSpritesheet: Texture = loadedAssets["spritesheets/placeholderSpritesheet.png"]
	const mapLevels: LevelData[] = [level0 as LevelData]
	const entTextures: Map<string, Texture> = new Map()
	entTextures.set("key", loadedAssets["sprites/keyPlaceholder.png"])
	const mapAssets: MapAssets = { spritesheet: mapSpritesheet, levels: mapLevels, entTextures: entTextures }

	const assets: GameAssets = { playerTextures: playerTextures, mapAssets: mapAssets }
	return assets;
}
