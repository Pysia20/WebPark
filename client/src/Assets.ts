import * as PIXI from 'pixi.js'

export interface PlayerTextures {
    idle: PIXI.Texture
    walk: PIXI.Texture
    jump: PIXI.Texture
}

export interface Assets {
    playerTextures: PlayerTextures
}

export async function loadAssets() {
    //TEMP IMGS
    const loadedTextures = await PIXI.Assets.load(["sprites/farmerThatDoesHarvestingWoahLookTHatsTheThemeFRFR.png", "sprites/playerPlaceholderWalk.png", "sprites/playerPlaceholderJump.png"])

    const playerIdle: PIXI.Texture = loadedTextures["sprites/farmerThatDoesHarvestingWoahLookTHatsTheThemeFRFR.png"]
    const playerWalk: PIXI.Texture = loadedTextures["sprites/playerPlaceholderWalk.png"]
    const playerJump: PIXI.Texture = loadedTextures["sprites/playerPlaceholderJump.png"]
    const playerTextures: PlayerTextures = {idle: playerIdle, walk: playerWalk, jump: playerJump}

    const assets: Assets = {playerTextures: playerTextures}
    return assets
}