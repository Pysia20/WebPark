import { Texture, Assets } from "pixi.js"
import { LevelData } from "@shared/commonLevelModels"
import Level_0 from "@shared/maps/Level_0.json"
import Level_1 from "@shared/maps/Level_1.json"
import Level_2 from "@shared/maps/Level_2.json"

export interface PlayerTextures {
	torso: Texture
}

export interface MapAssets {
	spritesheet: Texture
	levels: Map<string, LevelData>
	entTextures: Map<string, Texture>
}

export interface GameAssets {
	playerTextures: PlayerTextures
	mapAssets: MapAssets
}

export async function loadAssets() {
	const loadedAssets = await Assets.load([
		"spritesheets/placeholderSpritesheet.png",
		"sprites/JohnEntity.png",
		"sprites/Door.png",
		"sprites/Button.png",
		"sprites/ButtonDoor.png",
		"sprites/Laser.png",
		"sprites/MovingPlatform.png",
		"sprites/PlayerSpawner.png",
		"sprites/Pushable.png",
		"sprites/Spike.png",
		"sprites/torso.png"
	]);

	//player asstes
	const playerTorso: Texture = loadedAssets["sprites/torso.png"]
	const playerTextures: PlayerTextures = { torso: playerTorso }

	//map assets
	const mapSpritesheet: Texture = loadedAssets["spritesheets/placeholderSpritesheet.png"]
	const mapLevels: Map<string, LevelData> = new Map()
	mapLevels.set("Level_0", Level_0 as LevelData)
	mapLevels.set("Level_1", Level_1 as LevelData)
	mapLevels.set("Level_2", Level_2 as LevelData)
	const entTextures: Map<string, Texture> = new Map()
	entTextures.set("Key", loadedAssets["sprites/keyPlaceholder.png"])
	entTextures.set("Door", loadedAssets["sprites/Door.png"])
	entTextures.set("Button", loadedAssets["sprites/Button.png"])
	entTextures.set("JohnEntity", loadedAssets["sprites/JohnEntity.png"])
	entTextures.set("ButtonDoor", loadedAssets["sprites/ButtonDoor.png"])
	entTextures.set("Laser", loadedAssets["sprites/Laser.png"])
	entTextures.set("MovingPlatform", loadedAssets["sprites/MovingPlatform.png"])
	entTextures.set("Pushable", loadedAssets["sprites/Pushable.png"])
	entTextures.set("Spike", loadedAssets["sprites/Spike.png"])
	entTextures.set("PlayerSpawner", loadedAssets["sprites/PlayerSpawner.png"])
	const mapAssets: MapAssets = { spritesheet: mapSpritesheet, levels: mapLevels, entTextures: entTextures }

	const assets: GameAssets = { playerTextures: playerTextures, mapAssets: mapAssets }
	return assets;
}
