import { Texture, Assets, Rectangle } from "pixi.js"
import { LevelData } from "@shared/commonLevelModels"
import Level_0 from "@shared/maps/Level_0.json"
import Level_1 from "@shared/maps/Level_1.json"
import FourPlayers_1 from "@shared/maps/FourPlayers_1.json"
import { Vector2 } from "@shared/commonModels";

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

function loadEnt(pos: Vector2, size: Vector2, gridSize: number, spriteSheet: Texture) {
	pos.x = (pos.x * gridSize) + (pos.x * 10)
	pos.y = (pos.y * gridSize) + (pos.y * 10)

	const tileFrame = new Rectangle(
		pos.x,
		pos.y,
		(gridSize * size.x),
		(gridSize * size.y)
	)
	const tileTexture = new Texture({ source: spriteSheet.source, frame: tileFrame })

	return tileTexture
}

export async function loadAssets() {

	const loadedAssets = await Assets.load([
		"spritesheets/Tiles.png",
		"spritesheets/Ents.png",
		"sprites/torso.png"
	]);

	//player assets
	const playerTorso: Texture = loadedAssets["sprites/torso.png"]
	const playerTextures: PlayerTextures = { torso: playerTorso }

	//map assets
	const mapSpritesheet: Texture = loadedAssets["spritesheets/Tiles.png"]
	const mapLevels: Map<string, LevelData> = new Map()
	mapLevels.set("Level_0", Level_0 as LevelData)
	mapLevels.set("Level_1", Level_1 as LevelData)
	mapLevels.set("FourPlayers_1", FourPlayers_1 as LevelData)

	const gridSize = Level_0.layerInstances[0].__gridSize
	const entSpriteSheet = loadedAssets["spritesheets/Ents.png"]
	const entTextures: Map<string, Texture> = new Map()
	entTextures.set("Door", loadEnt({x: 6, y: 0}, {x: 1, y: 2}, gridSize, entSpriteSheet))
	entTextures.set("JohnEntity", loadEnt({x: 0, y: 2}, {x: 1, y: 1}, gridSize, entSpriteSheet))
	entTextures.set("ButtonDoor", loadEnt({x: 7, y: 0}, {x: 1, y: 2}, gridSize, entSpriteSheet))
	entTextures.set("MovingPlatform", loadEnt({x: 6, y: 2}, {x: 1, y: 1}, gridSize, entSpriteSheet))
	entTextures.set("Pushable", loadEnt({x: 9, y: 1}, {x: 1, y: 1}, gridSize, entSpriteSheet))
	entTextures.set("Spike", loadEnt({x: 2, y: 0}, {x: 1, y: 1}, gridSize, entSpriteSheet))
	entTextures.set("SwitchButton", loadEnt({x: 8, y: 1}, {x: 1, y: 1}, gridSize, entSpriteSheet))
	entTextures.set("Button", loadEnt({x: 2, y: 1}, {x: 1, y: 1}, gridSize, entSpriteSheet))
	entTextures.set("ButBase", loadEnt({x: 2, y: 2}, {x: 1, y: 1}, gridSize, entSpriteSheet))
	entTextures.set("Portal", Texture.EMPTY)
	entTextures.set("Laser", Texture.EMPTY)
	entTextures.set("PlayerSpawner", Texture.EMPTY)

	const mapAssets: MapAssets = { spritesheet: mapSpritesheet, levels: mapLevels, entTextures: entTextures }


	const assets: GameAssets = { playerTextures: playerTextures, mapAssets: mapAssets }
	return assets;
}