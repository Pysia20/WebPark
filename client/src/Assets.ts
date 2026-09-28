import { Texture, Assets } from "pixi.js";
import { MapData } from "../../shared/commonMapModels"
import level0 from "shared/maps/Level_0/Level_0.json"

export interface PlayerTextures {
    idle: Texture
    walk: Texture
    jump: Texture
}

export interface MapAssets {
    Spritesheet: Texture
    Levels: MapData[]
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
        "spritesheets/placeholderSpritesheet.png"
    ])

    //player asstes
    const playerIdle: Texture = loadedAssets["sprites/farmerThatDoesHarvestingWoahLookTHatsTheThemeFRFR.png"]
    const playerWalk: Texture = loadedAssets["sprites/playerPlaceholderWalk.png"]
    const playerJump: Texture = loadedAssets["sprites/playerPlaceholderJump.png"]
    const playerTextures: PlayerTextures = {idle: playerIdle, walk: playerWalk, jump: playerJump}

    //map assets
    const mapSpritesheet: Texture = loadedAssets["spritesheets/placeholderSpritesheet.png"]
    const mapLevels: MapData[] = [level0 as MapData]
    const mapAssets: MapAssets = {Spritesheet: mapSpritesheet, Levels: mapLevels}

    const assets: GameAssets = {playerTextures: playerTextures, mapAssets: mapAssets}
    return assets
}